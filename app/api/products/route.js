import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import { connectDB } from '@/lib/mongodb'
import Product from '@/models/Product'
import StockMovement from '@/models/StockMovement'
import Supplier from '@/models/Supplier'
import { getSessionOrReject, getOrgFilter, getOrgForWrite, verifyRole, rejectForbidden, rejectUnauthorized, handleApiError } from '@/lib/apiUtils'
import { logAudit } from '@/lib/audit'

export async function GET(req) {
  try {
    await connectDB()
    let session
    try {
      session = await getSessionOrReject()
    } catch {
      return rejectUnauthorized()
    }

    const orgFilter = getOrgFilter(req, session)
    // Only return products that are NOT archived
    const products = await Product.find({ ...orgFilter, isArchived: { $ne: true } })
      .populate('supplier', 'name company')
      .sort({ createdAt: -1 })
    
    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'GET /api/products')
  }
}

export async function POST(req) {
  try {
    await connectDB()
    let session
    try {
      session = await getSessionOrReject()
    } catch {
      return rejectUnauthorized()
    }

    // Role check: Sales Staff/Cashier and Viewer cannot create products
    if (!verifyRole(session, ['super-admin', 'admin', 'inventory-staff'])) {
      return rejectForbidden()
    }

    const body = await req.json()
    const { name, sku, category, price, costPrice, stock, threshold, description, supplier, imageUrl } = body

    if (!name || !sku || !category || price === undefined || costPrice === undefined) {
      return NextResponse.json(
        { error: 'Required fields are missing: name, sku, category, price, costPrice' },
        { status: 400 }
      )
    }

    const orgFilter = getOrgFilter(req, session)
    const orgId = getOrgForWrite(req, session)

    // Check SKU uniqueness within the organization (excluding archived products)
    const existingProduct = await Product.findOne({ ...orgFilter, sku: sku.trim(), isArchived: { $ne: true } })
    if (existingProduct) {
      return NextResponse.json(
        { error: 'SKU already exists in your store. Please choose a unique SKU.' },
        { status: 400 }
      )
    }

    // Create product
    const product = await Product.create({
      name,
      sku: sku.trim(),
      category,
      price: Number(price),
      costPrice: Number(costPrice),
      stock: Number(stock || 0),
      threshold: Number(threshold !== undefined ? threshold : 5),
      description: description || '',
      supplier: supplier || null,
      imageUrl: imageUrl || '',
      organizationId: orgId,
      isArchived: false,
    })

    // Log initial stock movement
    await StockMovement.create({
      product: product._id,
      productName: product.name,
      type: 'in',
      quantity: product.stock,
      reason: 'Initial stock',
      organizationId: orgId,
    })

    // Write audit log
    await logAudit(session, 'CREATE_PRODUCT', 'Product', product._id, `Product created: ${product.name} (SKU: ${product.sku}) with initial stock ${product.stock}`)

    // Populate supplier details before returning
    const populatedProduct = await Product.findById(product._id).populate('supplier', 'name company')

    return NextResponse.json(populatedProduct, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'POST /api/products')
  }
}
