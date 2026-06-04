// import { NextResponse } from "next/server"
// import { connectDB } from "@/lib/mongodb"
// import Sale from "@/models/Sale"
// import Product from "@/models/Product"
// import StockMovement from "@/models/StockMovement"
// import { sendLowStockAlert } from "@/lib/mailer"
// import { sendRestockEmail } from "@/lib/emailService"
// import { getSessionOrReject, getOrgFilter, getOrgForWrite, verifyRole, rejectForbidden, rejectUnauthorized, handleApiError } from '@/lib/apiUtils'

// // =========================
// // GET SALES
// // =========================
// export async function GET(req) {
//   try {
//     await connectDB()
//     let session
//     try {
//       session = await getSessionOrReject()
//     } catch {
//       return rejectUnauthorized()
//     }

//     // Role check: Inventory staff cannot access sales ledger
//     if (!verifyRole(session, ['super-admin', 'admin', 'sales-staff', 'viewer'])) {
//       return rejectForbidden()
//     }

//     const { searchParams } = new URL(req.url)
//     const from = searchParams.get("from")
//     const to = searchParams.get("to")

//     const orgFilter = getOrgFilter(req, session)
//     const filter = { ...orgFilter }

//     if (from || to) {
//       filter.createdAt = {}
//       if (from) filter.createdAt.$gte = new Date(from)
//       if (to) {
//         const end = new Date(to)
//         end.setHours(23, 59, 59, 999)
//         filter.createdAt.$lte = end
//       }
//     }

//     const sales = await Sale.find(filter)
//       .populate("recordedBy", "name email")
//       .populate("items.product", "name sku price stock")
//       .sort({ createdAt: -1 })

//     return NextResponse.json({ success: true, data: sales })
//   } catch (err) {
//     return handleApiError(err, "GET /api/sales")
//   }
// }

// // =========================
// // CREATE SALE (CORE LOGIC)
// // =========================
// export async function POST(req) {
//   try {
//     await connectDB()
//     let session
//     try {
//       session = await getSessionOrReject()
//     } catch {
//       return rejectUnauthorized()
//     }

//     // Role check: Only Cashiers/Sales Staff, Admin and Super Admin can record sales
//     if (!verifyRole(session, ['super-admin', 'admin', 'sales-staff'])) {
//       return rejectForbidden()
//     }

//     const { items, paymentMethod } = await req.json()

//     if (!items?.length || !paymentMethod) {
//       return NextResponse.json(
//         { error: "Invalid request payload" },
//         { status: 400 }
//       )
//     }

//     const orgId = getOrgForWrite(req, session)

//     let totalAmount = 0
//     let totalCost = 0
//     const processedItems = []
//     const lowStockProducts = []

//     // ======================
//     // Validate + Calculate
//     // ======================
//     for (const item of items) {
//       // Must query within the user's organization
//       const product = await Product.findOne({ _id: item.product, organizationId: orgId })

//       if (!product) {
//         return NextResponse.json(
//           { error: `Product not found or not in your organization: ${item.product}` },
//           { status: 404 }
//         )
//       }

//       if (product.stock < item.quantity) {
//         return NextResponse.json(
//           { error: `Insufficient stock for ${product.name}` },
//           { status: 400 }
//         )
//       }

//       const subtotal = product.price * item.quantity

//       totalAmount += subtotal
//       totalCost += product.costPrice * item.quantity

//       processedItems.push({
//         product: product._id,
//         productName: product.name,
//         quantity: item.quantity,
//         unitPrice: product.price,
//         subtotal,
//       })
//     }

//     // ======================
//     // Invoice Number
//     // ======================
//     const count = await Sale.countDocuments({ organizationId: orgId })
//     const invoiceNo = `INV-${String(count + 1).padStart(4, "0")}`

//     // ======================
//     // Create Sale
//     // ======================
//     const sale = await Sale.create({
//       invoiceNo,
//       recordedBy: session.user.id,
//       items: processedItems,
//       totalAmount,
//       profit: totalAmount - totalCost,
//       paymentMethod,
//       organizationId: orgId,
//     })

//     // ======================
//     // Stock Deduction
//     // ======================
//     for (const item of processedItems) {
//       const updated = await Product.findOneAndUpdate(
//         { _id: item.product, organizationId: orgId },
//         { $inc: { stock: -item.quantity } },
//         { new: true }
//       ).populate("supplier", "name email")

//       await StockMovement.create({
//         product: item.product,
//         productName: item.productName,
//         type: "out",
//         quantity: item.quantity,
//         reason: `Sale ${invoiceNo}`,
//         organizationId: orgId,
//       })

//       if (updated.stock <= updated.threshold) {
//         lowStockProducts.push(updated)
//       }
//     }

//     // ======================
//     // EMAILS (NON-BLOCKING)
//     // ======================
//     if (lowStockProducts.length) {
//       sendLowStockAlert(lowStockProducts).catch(console.error)

//       // Fetch organization details
//       const Organization = (await import("@/models/Organization")).default
//       const org = await Organization.findById(orgId)
//       const orgName = org?.name || "StockSense Store"

//       // Group products by supplier
//       const productsBySupplier = {}
//       for (const p of lowStockProducts) {
//         if (!p.supplier?._id || !p.supplier?.email) continue
//         const supplierId = p.supplier._id.toString()
//         if (!productsBySupplier[supplierId]) {
//           productsBySupplier[supplierId] = {
//             supplier: p.supplier,
//             products: []
//           }
//         }
//         productsBySupplier[supplierId].products.push(p)
//       }

//       // Send single grouped email per supplier
//       const { sendSupplierGroupedRestockEmail } = await import("@/lib/emailService")
//       for (const supplierId in productsBySupplier) {
//         const { supplier, products } = productsBySupplier[supplierId]
//         sendSupplierGroupedRestockEmail({
//           supplier,
//           products,
//           orgName,
//           managerName: session.user.name,
//           organizationId: orgId,
//         }).catch(console.error)
//       }
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Sale recorded successfully",
//       data: sale,
//     })
//   } catch (err) {
//     return handleApiError(err, "POST /api/sales")
//   }
// }
import { NextResponse } from "next/server"
export const dynamic = 'force-dynamic'

import { connectDB } from "@/lib/mongodb"

import Sale from "@/models/Sale"
import Product from "@/models/Product"
import StockMovement from "@/models/StockMovement"

import { sendLowStockAlert } from "@/lib/emailService"
import {
  getSessionOrReject,
  getOrgFilter,
  getOrgForWrite,
  verifyRole,
  rejectForbidden,
  rejectUnauthorized,
  handleApiError
} from "@/lib/apiUtils"

// =========================
// GET SALES
// =========================
export async function GET(req) {
  try {
    await connectDB()

    let session
    try {
      session = await getSessionOrReject()
    } catch {
      return rejectUnauthorized()
    }

    if (
      !verifyRole(session, [
        "super-admin",
        "admin",
        "sales-staff",
        "viewer"
      ])
    ) {
      return rejectForbidden()
    }

    const { searchParams } = new URL(req.url)

    const from = searchParams.get("from")
    const to = searchParams.get("to")

    const orgFilter = getOrgFilter(req, session)

    const filter = { ...orgFilter }

    if (from || to) {
      filter.createdAt = {}

      if (from) filter.createdAt.$gte = new Date(from)

      if (to) {
        const end = new Date(to)
        end.setHours(23, 59, 59, 999)
        filter.createdAt.$lte = end
      }
    }

    const sales = await Sale.find(filter)
      .populate("recordedBy", "name email")
      .populate("items.product", "name sku price stock")
      .sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      data: sales
    })
  } catch (err) {
    return handleApiError(err, "GET /api/sales")
  }
}

// =========================
// CREATE SALE
// =========================
export async function POST(req) {
  try {
    await connectDB()

    let session
    try {
      session = await getSessionOrReject()
    } catch {
      return rejectUnauthorized()
    }

    if (
      !verifyRole(session, [
        "super-admin",
        "admin",
        "sales-staff"
      ])
    ) {
      return rejectForbidden()
    }

    const { items, paymentMethod } = await req.json()

    if (!items?.length || !paymentMethod) {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 }
      )
    }

    const orgId = getOrgForWrite(req, session)

    let totalAmount = 0
    let totalCost = 0

    const processedItems = []
    const lowStockProducts = []

    // ======================
    // VALIDATE PRODUCTS
    // ======================
    for (const item of items) {
      const product = await Product.findOne({
        _id: item.product,
        organizationId: orgId
      })

      if (!product) {
        return NextResponse.json(
          {
            error: `Product not found: ${item.product}`
          },
          { status: 404 }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product.name}`
          },
          { status: 400 }
        )
      }

      const subtotal = product.price * item.quantity

      totalAmount += subtotal
      totalCost += product.costPrice * item.quantity

      processedItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal
      })
    }

    // ======================
    // 🔥 SAFE INVOICE NUMBER (CONCURRENCY-SAFE OPTION A)
    // ======================
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const dateStr = `${year}${month}${day}`
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    const invoiceNo = `INV-${dateStr}-${randomSuffix}`

    // ======================
    // CREATE SALE
    // ======================
    const sale = await Sale.create({
      invoiceNo,
      recordedBy: session.user.id,
      items: processedItems,
      totalAmount,
      profit: totalAmount - totalCost,
      paymentMethod,
      organizationId: orgId
    })

    // ======================
    // STOCK UPDATE
    // ======================
    for (const item of processedItems) {
      const updated = await Product.findOneAndUpdate(
        {
          _id: item.product,
          organizationId: orgId
        },
        { $inc: { stock: -item.quantity } },
        { new: true }
      ).populate("supplier", "name email")

      await StockMovement.create({
        product: item.product,
        productName: item.productName,
        type: "out",
        quantity: item.quantity,
        reason: `Sale ${invoiceNo}`,
        organizationId: orgId
      })

      if (updated.stock <= updated.threshold) {
        lowStockProducts.push(updated)
      }
    }

    // ======================
    // EMAILS (NON-BLOCKING)
    // ======================
    if (lowStockProducts.length) {
      sendLowStockAlert(lowStockProducts).catch(console.error)

      // Group products by supplier and dispatch consolidated supplier emails
      ;(async () => {
        try {
          const Organization = (await import("@/models/Organization")).default
          const org = await Organization.findById(orgId)
          const orgName = org?.name || "StockSense IMS"

          const productsBySupplier = {}
          for (const p of lowStockProducts) {
            if (!p.supplier?._id || !p.supplier?.email) continue
            const supplierId = p.supplier._id.toString()
            if (!productsBySupplier[supplierId]) {
              productsBySupplier[supplierId] = {
                supplier: p.supplier,
                products: []
              }
            }
            productsBySupplier[supplierId].products.push(p)
          }

          const { sendSupplierGroupedRestockEmail } = await import("@/lib/emailService")
          for (const supplierId in productsBySupplier) {
            const { supplier, products } = productsBySupplier[supplierId]
            sendSupplierGroupedRestockEmail({
              supplier,
              products,
              orgName,
              managerName: session.user.name,
              organizationId: orgId,
            }).catch(console.error)
          }
        } catch (emailErr) {
          console.error("Failed to dispatch grouped restock emails:", emailErr)
        }
      })()
    }

    return NextResponse.json({
      success: true,
      message: "Sale recorded successfully",
      data: sale
    })

  } catch (err) {
    if (err.code === 11000) {
      return NextResponse.json(
        {
          error: "Duplicate invoice number. Please retry."
        },
        { status: 400 }
      )
    }

    return handleApiError(err, "POST /api/sales")
  }
}