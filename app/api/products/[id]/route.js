import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import { connectDB } from '@/lib/mongodb'
import Product from '@/models/Product'
import StockMovement from '@/models/StockMovement'
import Sale from '@/models/Sale'
import Supplier from '@/models/Supplier'
import { getSessionOrReject, getOrgFilter, verifyRole, rejectForbidden, rejectUnauthorized, handleApiError } from '@/lib/apiUtils'
import { logAudit } from '@/lib/audit'

export async function GET(req, { params }) {
  try {
    await connectDB()
    let session
    try {
      session = await getSessionOrReject()
    } catch {
      return rejectUnauthorized()
    }

    const { id } = params
    const orgFilter = getOrgFilter(req, session)

    // Exclude archived products
    const product = await Product.findOne({ _id: id, ...orgFilter, isArchived: { $ne: true } })
      .populate('supplier', 'name company')
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'GET /api/products/[id]')
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB()
    let session
    try {
      session = await getSessionOrReject()
    } catch {
      return rejectUnauthorized()
    }

    // Role check: Sales Staff and Viewer cannot update products
    if (!verifyRole(session, ['super-admin', 'admin', 'inventory-staff'])) {
      return rejectForbidden()
    }

    const { id } = params
    const orgFilter = getOrgFilter(req, session)
    const body = await req.json()

    // Exclude archived products from modifications
    const product = await Product.findOne({ _id: id, ...orgFilter, isArchived: { $ne: true } })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const oldStock = product.stock
    const newStock = body.stock !== undefined ? Number(body.stock) : oldStock

    // Log stock movement if stock level changed
    if (newStock !== oldStock) {
      const diff = newStock - oldStock
      const reasonText = body.movementReason || `Adjustment (from ${oldStock} to ${newStock})`
      
      await StockMovement.create({
        product: product._id,
        productName: product.name,
        type: diff > 0 ? 'in' : 'out',
        quantity: Math.abs(diff),
        reason: reasonText,
        organizationId: product.organizationId,
      })

      // Log stock change audit
      await logAudit(
        session,
        'UPDATE_STOCK',
        'Product',
        product._id,
        `Stock levels adjusted from ${oldStock} to ${newStock} (${diff > 0 ? '+' : ''}${diff} units). Reason: ${reasonText}`
      )
    }

    // Update product fields
    const updateData = {
      name: body.name || product.name,
      sku: body.sku ? body.sku.trim() : product.sku,
      category: body.category || product.category,
      price: body.price !== undefined ? Number(body.price) : product.price,
      costPrice: body.costPrice !== undefined ? Number(body.costPrice) : product.costPrice,
      stock: newStock,
      threshold: body.threshold !== undefined ? Number(body.threshold) : product.threshold,
      description: body.description !== undefined ? body.description : product.description,
      supplier: body.supplier !== undefined ? (body.supplier || null) : product.supplier,
      imageUrl: body.imageUrl !== undefined ? body.imageUrl : product.imageUrl,
      updatedAt: new Date(),
    }

    const updatedProduct = await Product.findOneAndUpdate({ _id: id, ...orgFilter, isArchived: { $ne: true } }, updateData, { new: true })
      .populate('supplier', 'name company')

    // Log product edit audit
    await logAudit(
      session,
      'EDIT_PRODUCT',
      'Product',
      product._id,
      `Product details updated: ${product.name} (SKU: ${product.sku})`
    )

    return NextResponse.json(updatedProduct, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'PUT /api/products/[id]')
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB()
    let session
    try {
      session = await getSessionOrReject()
    } catch {
      return rejectUnauthorized()
    }

    // Role check: Only Super Admin and Org Admin can archive/delete products
    if (!verifyRole(session, ['super-admin', 'admin'])) {
      return rejectForbidden()
    }

    const { id } = params
    const orgFilter = getOrgFilter(req, session)

    const product = await Product.findOne({ _id: id, ...orgFilter, isArchived: { $ne: true } })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if product appears in any Sale
    const saleWithProduct = await Sale.findOne({ 'items.product': id, ...orgFilter })
    if (saleWithProduct) {
      return NextResponse.json(
        { error: 'Cannot delete product with sales history' },
        { status: 400 }
      )
    }

    // Perform SOFT DELETE (archival) instead of hard delete to preserve audits
    product.isArchived = true
    await product.save()

    // Write audit log
    await logAudit(
      session,
      'ARCHIVE_PRODUCT',
      'Product',
      product._id,
      `Product archived/soft-deleted: ${product.name} (SKU: ${product.sku})`
    )

    return NextResponse.json({ message: 'Product archived successfully' }, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'DELETE /api/products/[id]')
  }
}
