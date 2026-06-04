import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import { connectDB } from '@/lib/mongodb'
import Product from '@/models/Product'
import Sale from '@/models/Sale'
import Supplier from '@/models/Supplier'
import StockMovement from '@/models/StockMovement'
import { getSessionOrReject, getOrgFilter, verifyRole, rejectForbidden, rejectUnauthorized, handleApiError } from '@/lib/apiUtils'

export async function GET(req) {
  try {
    await connectDB()
    let session
    try {
      session = await getSessionOrReject()
    } catch {
      return rejectUnauthorized()
    }

    // Role check: Only Super Admin, Org Admin, and Viewer can fetch analytics summary
    if (!verifyRole(session, ['super-admin', 'admin', 'viewer'])) {
      return rejectForbidden()
    }

    const orgFilter = getOrgFilter(req, session)

    // 1. Total products (excluding archived ones)
    const totalProducts = await Product.countDocuments({ ...orgFilter, isArchived: { $ne: true } })

    // 2. Total Stock Units (excluding archived ones)
    const totalStockResult = await Product.aggregate([
      { $match: { ...orgFilter, isArchived: { $ne: true } } },
      { $group: { _id: null, total: { $sum: '$stock' } } },
    ])
    const totalStock = totalStockResult[0]?.total || 0

    // 3. Low stock count (stock <= threshold) (excluding archived ones)
    const lowStockCount = await Product.countDocuments({
      ...orgFilter,
      isArchived: { $ne: true },
      $expr: { $lte: ['$stock', '$threshold'] },
    })

    // 4. Total revenue
    const totalRevenueResult = await Sale.aggregate([
      { $match: orgFilter },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ])
    const totalRevenue = totalRevenueResult[0]?.total || 0

    // 5. Total profit
    const totalProfitResult = await Sale.aggregate([
      { $match: orgFilter },
      { $group: { _id: null, total: { $sum: '$profit' } } },
    ])
    const totalProfit = totalProfitResult[0]?.total || 0

    // 6. Revenue and profit by month (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    const revenueByMonthResult = await Sale.aggregate([
      { $match: { ...orgFilter, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          profit: { $sum: '$profit' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ])

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const revenueByMonth = revenueByMonthResult.map((item) => {
      const margin = item.revenue > 0 ? Math.round((item.profit / item.revenue) * 100) : 0
      return {
        month: `${monthNames[item._id.month - 1]}`,
        revenue: item.revenue,
        profit: item.profit,
        margin,
      }
    })

    // 7. Top 5 Products (by quantity sold)
    const topProducts = await Sale.aggregate([
      { $match: orgFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.productName' },
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 5 },
    ])

    // 8. Category Breakdown (by stock units)
    const categoryBreakdown = await Product.aggregate([
      { $match: { ...orgFilter, isArchived: { $ne: true } } },
      {
        $group: {
          _id: '$category',
          value: { $sum: '$stock' },
        },
      },
      {
        $project: {
          name: '$_id',
          value: 1,
          _id: 0,
        },
      },
    ])

    // --- SMART INSIGHTS CALCULATION (Section 12 spec) ---
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    // Insight 1: Products running out soon (estimated by sales velocity in the last 30 days)
    const lowStockItems = await Product.find({ ...orgFilter, isArchived: { $ne: true }, stock: { $gt: 0, $lte: 10 } })
    const runningOutSoonPromises = lowStockItems.map(async (prod) => {
      const sales30 = await Sale.aggregate([
        { $match: { ...orgFilter, createdAt: { $gte: thirtyDaysAgo } } },
        { $unwind: '$items' },
        { $match: { 'items.product': prod._id } },
        { $group: { _id: null, totalQty: { $sum: '$items.quantity' } } },
      ])
      const totalQty = sales30[0]?.totalQty || 0
      const velocity = totalQty / 30 // units per day
      const daysRemaining = velocity > 0 ? Math.ceil(prod.stock / velocity) : 99
      return {
        name: prod.name,
        sku: prod.sku,
        stock: prod.stock,
        daysRemaining,
      }
    })
    const runningOutSoon = await Promise.all(runningOutSoonPromises)
    const productsRunningOutSoon = runningOutSoon
      .filter((p) => p.daysRemaining <= 15)
      .sort((a, b) => a.daysRemaining - b.daysRemaining)

    // Insight 2: Top category this month
    const categorySales = await Sale.aggregate([
      { $match: { ...orgFilter, createdAt: { $gte: thirtyDaysAgo } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          totalRevenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ])
    const topCategoryThisMonth = categorySales[0]?._id || null

    // Insight 3: Weekly revenue comparison (this week vs last week)
    const thisWeekSales = await Sale.aggregate([
      { $match: { ...orgFilter, createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ])
    const lastWeekSales = await Sale.aggregate([
      { $match: { ...orgFilter, createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ])
    const weeklyRevenueSummary = {
      thisWeek: thisWeekSales[0]?.total || 0,
      lastWeek: lastWeekSales[0]?.total || 0,
    }

    // Weekly Growth Trend Percentage
    const lastWeekRev = weeklyRevenueSummary.lastWeek
    const thisWeekRev = weeklyRevenueSummary.thisWeek
    const weeklyGrowthTrend = lastWeekRev > 0 ? Math.round(((thisWeekRev - lastWeekRev) / lastWeekRev) * 100) : thisWeekRev > 0 ? 100 : 0

    // Insight 4: Out of stock products list
    const outOfStockProducts = await Product.find({ ...orgFilter, isArchived: { $ne: true }, stock: 0 }).select('name sku').limit(5)

    // Fetch last 50 stock movements
    const stockMovements = await StockMovement.find(orgFilter)
      .sort({ createdAt: -1 })
      .limit(50)

    // --- ENTERPRISE SaaS METRICS ---

    // Metric: Stock Health Percentage
    const stockHealth = totalProducts > 0 ? Math.round(((totalProducts - lowStockCount) / totalProducts) * 100) : 100

    // Metric: Fast Moving Products (>20% of sales volume in the last 30 days)
    const totalVolumeResult = await Sale.aggregate([
      { $match: { ...orgFilter, createdAt: { $gte: thirtyDaysAgo } } },
      { $unwind: '$items' },
      { $group: { _id: null, totalQty: { $sum: '$items.quantity' } } }
    ])
    const totalVolume30 = totalVolumeResult[0]?.totalQty || 0

    const productSales30 = await Sale.aggregate([
      { $match: { ...orgFilter, createdAt: { $gte: thirtyDaysAgo } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.productName' },
          sku: { $first: '$items.product?.sku' }, // fallback
          quantity: { $sum: '$items.quantity' }
        }
      }
    ])

    const fastMovingProducts = totalVolume30 > 0 
      ? productSales30
          .filter(p => (p.quantity / totalVolume30) >= 0.20)
          .map(p => ({ _id: p._id, name: p.name, share: Math.round((p.quantity / totalVolume30) * 100) }))
      : []

    // Metric: Dead Stock (Products with stock > 0 but 0 sales in the last 30 days)
    const activeProducts = await Product.find({ ...orgFilter, isArchived: { $ne: true }, stock: { $gt: 0 } })
      .select('_id name sku price stock')
    const soldProductIds = new Set(productSales30.map(p => p._id.toString()))
    const deadStock = activeProducts
      .filter(p => !soldProductIds.has(p._id.toString()))
      .slice(0, 5)
      .map(p => ({ _id: p._id, name: p.name, sku: p.sku, stock: p.stock }))

    // Metric: Top Suppliers (by total stock value supplied)
    const topSuppliers = await Product.aggregate([
      { $match: { ...orgFilter, isArchived: { $ne: true }, supplier: { $ne: null } } },
      {
        $group: {
          _id: '$supplier',
          totalValue: { $sum: { $multiply: ['$stock', '$price'] } },
          productCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'suppliers',
          localField: '_id',
          foreignField: '_id',
          as: 'supplierInfo'
        }
      },
      { $unwind: '$supplierInfo' },
      {
        $project: {
          name: '$supplierInfo.name',
          company: '$supplierInfo.company',
          totalValue: 1,
          productCount: 1
        }
      },
      { $sort: { totalValue: -1 } },
      { $limit: 5 }
    ])

    // Metric: Low Margin Alerts ((price - costPrice) / price < 0.15) (excluding archived)
    const lowMarginProducts = await Product.find({
      ...orgFilter,
      isArchived: { $ne: true },
      price: { $gt: 0 }, // avoid division by zero
    }).select('_id name sku price costPrice stock')

    const lowMarginAlerts = lowMarginProducts
      .filter((p) => {
        const margin = (p.price - p.costPrice) / p.price
        return margin < 0.15
      })
      .map((p) => {
        const marginPct = Math.round(((p.price - p.costPrice) / p.price) * 100)
        return {
          _id: p._id,
          name: p.name,
          sku: p.sku,
          price: p.price,
          costPrice: p.costPrice,
          marginPct,
          stock: p.stock,
        }
      })
    const lowMarginCount = lowMarginAlerts.length

    // Combined Response
    return NextResponse.json({
      totalProducts,
      totalStock,
      lowStockCount,
      totalRevenue,
      totalProfit,
      revenueByMonth,
      topProducts,
      categoryBreakdown,
      stockMovements,
      stockHealth,
      weeklyGrowthTrend,
      fastMovingProducts,
      deadStock,
      topSuppliers,
      lowMarginAlerts,
      lowMarginCount,
      insights: {
        productsRunningOutSoon,
        topCategoryThisMonth,
        weeklyRevenueSummary,
        outOfStockProducts,
      },
    }, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'GET /api/analytics/summary')
  }
}
