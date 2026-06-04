import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import EmailLog from '@/models/EmailLog'
import { getSessionOrReject, getOrgFilter, verifyRole, rejectForbidden, rejectUnauthorized, handleApiError } from '@/lib/apiUtils'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    await connectDB()
    let session
    try {
      session = await getSessionOrReject()
    } catch {
      return rejectUnauthorized()
    }

    // Role check: Only Super Admin and Org Admin can view email logs
    if (!verifyRole(session, ['super-admin', 'admin'])) {
      return rejectForbidden()
    }

    const { searchParams } = new URL(req.url)
    const supplierId = searchParams.get('supplierId')
    const status = searchParams.get('status')

    const orgFilter = getOrgFilter(req, session)
    const filter = { ...orgFilter }

    if (supplierId) {
      filter.supplierId = supplierId
    }
    if (status) {
      filter.status = status
    }

    const logs = await EmailLog.find(filter)
      .populate('productId', 'name sku')
      .populate('supplierId', 'name company')
      .sort({ sentAt: -1 })
      .limit(100)

    return NextResponse.json(logs, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'GET /api/email-logs')
  }
}
