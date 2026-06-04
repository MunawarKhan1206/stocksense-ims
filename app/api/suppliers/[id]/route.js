import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import { connectDB } from '@/lib/mongodb'
import Supplier from '@/models/Supplier'
import Product from '@/models/Product'
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

    // Role check: Only Super Admin, Org Admin, and Viewer can view suppliers
    if (!verifyRole(session, ['super-admin', 'admin', 'viewer'])) {
      return rejectForbidden()
    }

    const { id } = params
    const orgFilter = getOrgFilter(req, session)

    // Exclude archived suppliers
    const supplier = await Supplier.findOne({ _id: id, ...orgFilter, isArchived: { $ne: true } })
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    const productCount = await Product.countDocuments({ supplier: id, isArchived: { $ne: true }, ...orgFilter })
    
    return NextResponse.json(
      { ...supplier.toObject(), productCount },
      { status: 200 }
    )
  } catch (error) {
    return handleApiError(error, 'GET /api/suppliers/[id]')
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

    // Role check: Only Super Admin and Org Admin can manage suppliers
    if (!verifyRole(session, ['super-admin', 'admin'])) {
      return rejectForbidden()
    }

    const { id } = params
    const orgFilter = getOrgFilter(req, session)
    const body = await req.json()

    // Exclude archived suppliers from modifications
    const supplier = await Supplier.findOne({ _id: id, ...orgFilter, isArchived: { $ne: true } })
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    const updatedSupplier = await Supplier.findOneAndUpdate(
      { _id: id, ...orgFilter, isArchived: { $ne: true } },
      {
        name: body.name || supplier.name,
        company: body.company !== undefined ? body.company : supplier.company,
        email: body.email !== undefined ? body.email.toLowerCase() : supplier.email,
        phone: body.phone !== undefined ? body.phone : supplier.phone,
        address: body.address !== undefined ? body.address : supplier.address,
      },
      { new: true }
    )

    // Log supplier edit audit
    await logAudit(
      session,
      'EDIT_SUPPLIER',
      'Supplier',
      supplier._id,
      `Supplier details updated: ${supplier.name}`
    )

    return NextResponse.json(updatedSupplier, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'PUT /api/suppliers/[id]')
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

    // Role check: Only Super Admin and Org Admin can delete suppliers
    if (!verifyRole(session, ['super-admin', 'admin'])) {
      return rejectForbidden()
    }

    const { id } = params
    const orgFilter = getOrgFilter(req, session)

    const supplier = await Supplier.findOne({ _id: id, ...orgFilter, isArchived: { $ne: true } })
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    // Check if supplier is linked to any active products (excluding archived products)
    const productCount = await Product.countDocuments({ supplier: id, isArchived: { $ne: true }, ...orgFilter })
    if (productCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete supplier. Supplier is linked to active products.' },
        { status: 400 }
      )
    }

    // Perform SOFT DELETE (archival) instead of hard delete
    supplier.isArchived = true
    await supplier.save()

    // Write audit log
    await logAudit(
      session,
      'ARCHIVE_SUPPLIER',
      'Supplier',
      supplier._id,
      `Supplier archived/soft-deleted: ${supplier.name}`
    )

    return NextResponse.json({ message: 'Supplier archived successfully' }, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'DELETE /api/suppliers/[id]')
  }
}
