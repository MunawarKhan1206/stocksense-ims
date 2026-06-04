import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import { connectDB } from '@/lib/mongodb'
import Supplier from '@/models/Supplier'
import Product from '@/models/Product'
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

    // Role check: Only Super Admin, Org Admin, and Viewer can view suppliers
    if (!verifyRole(session, ['super-admin', 'admin', 'viewer'])) {
      return rejectForbidden()
    }

    const orgFilter = getOrgFilter(req, session)
    // Exclude archived suppliers
    const suppliers = await Supplier.find({ ...orgFilter, isArchived: { $ne: true } }).sort({ createdAt: -1 })
    
    // Add product counts dynamically (scoped to organization and active products)
    const suppliersWithCounts = await Promise.all(
      suppliers.map(async (supplier) => {
        const productCount = await Product.countDocuments({ supplier: supplier._id, isArchived: { $ne: true }, ...orgFilter })
        return {
          ...supplier.toObject(),
          productCount,
        }
      })
    )

    return NextResponse.json(suppliersWithCounts, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'GET /api/suppliers')
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

    // Role check: Only Super Admin and Org Admin can manage/create suppliers
    if (!verifyRole(session, ['super-admin', 'admin'])) {
      return rejectForbidden()
    }

    const body = await req.json()
    const { name, company, email, phone, address } = body

    if (!name) {
      return NextResponse.json({ error: 'Supplier name is required' }, { status: 400 })
    }

    const orgId = getOrgForWrite(req, session)

    const supplier = await Supplier.create({
      name,
      company: company || '',
      email: email ? email.toLowerCase() : '',
      phone: phone || '',
      address: address || '',
      organizationId: orgId,
      isArchived: false,
    })

    // Log supplier creation audit
    await logAudit(
      session,
      'CREATE_SUPPLIER',
      'Supplier',
      supplier._id,
      `Supplier registered: ${supplier.name}`
    )

    return NextResponse.json(supplier, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'POST /api/suppliers')
  }
}
