import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Organization from '@/models/Organization'
import { getSessionOrReject, verifyRole, rejectForbidden, rejectUnauthorized, handleApiError } from '@/lib/apiUtils'

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

    // Role check: Only Super Admin can list all organizations
    if (!verifyRole(session, ['super-admin'])) {
      return rejectForbidden()
    }

    const orgs = await Organization.find({}).sort({ name: 1 })
    return NextResponse.json(orgs, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'GET /api/organizations')
  }
}
