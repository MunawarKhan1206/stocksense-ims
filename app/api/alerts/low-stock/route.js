import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import { connectDB } from '@/lib/mongodb'
import Product from '@/models/Product'
import Supplier from '@/models/Supplier'
import { sendLowStockAlert } from '@/lib/emailService'
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

    // Role check: Only allowed roles can view low stock alerts
    if (!verifyRole(session, ['super-admin', 'admin', 'inventory-staff', 'viewer', 'sales-staff'])) {
      return rejectForbidden()
    }

    const orgFilter = getOrgFilter(req, session)
    
    // Find all active products where stock is less than or equal to threshold within organization
    const lowStockProducts = await Product.find({
      ...orgFilter,
      isArchived: { $ne: true },
      $expr: { $lte: ['$stock', '$threshold'] },
    }).populate('supplier', 'name company email phone')

    return NextResponse.json(lowStockProducts, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'GET /api/alerts/low-stock')
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

    // Role check: Only Super Admin and Org Admin can trigger notifications manually
    if (!verifyRole(session, ['super-admin', 'admin'])) {
      return rejectForbidden()
    }

    const orgFilter = getOrgFilter(req, session)

    const lowStockProducts = await Product.find({
      ...orgFilter,
      isArchived: { $ne: true },
      $expr: { $lte: ['$stock', '$threshold'] },
    })

    if (lowStockProducts.length === 0) {
      return NextResponse.json({ message: 'No low stock products detected. Notification skipped.' }, { status: 200 })
    }

    const mailInfo = await sendLowStockAlert(lowStockProducts)
    
    return NextResponse.json(
      { message: 'Alert notification process finished.', details: mailInfo },
      { status: 200 }
    )
  } catch (error) {
    return handleApiError(error, 'POST /api/alerts/low-stock')
  }
}
