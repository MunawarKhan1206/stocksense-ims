import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

/**
 * Gets a valid session or returns an error response
 */
export async function getSessionOrReject() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // Fetch organizationId from database so it doesn't live in JWT cookie
  try {
    const { connectDB } = await import('./mongodb')
    await connectDB()
    const User = (await import('@/models/User')).default
    const userDoc = await User.findById(session.user.id).select('organizationId')
    if (userDoc) {
      session.user.organizationId = userDoc.organizationId ? userDoc.organizationId.toString() : null
    }
  } catch (err) {
    console.error('Error fetching user organization in apiUtils:', err)
  }

  return session
}

/**
 * Build organization filter query for read/write.
 * Super admins can query across all orgs (default) or query a specific org via header.
 * Regular users are strictly locked to their session organizationId.
 */
export function getOrgFilter(req, session) {
  const { role, organizationId } = session.user

  if (role === 'super-admin') {
    const headerOrgId = req.headers.get('x-organization-id')
    if (headerOrgId && headerOrgId !== 'all') {
      return {
        organizationId: mongoose.Types.ObjectId.isValid(headerOrgId)
          ? new mongoose.Types.ObjectId(headerOrgId)
          : headerOrgId
      }
    }
    // No filter means Super Admin sees all orgs' data
    return {}
  }

  // Fallback to default if somehow missing
  const orgId = organizationId || 'default-org'
  return {
    organizationId: mongoose.Types.ObjectId.isValid(orgId)
      ? new mongoose.Types.ObjectId(orgId)
      : orgId
  }
}

/**
 * Gets the organizationId to write onto new records.
 * Super admins can specify an organization via header or use their default.
 */
export function getOrgForWrite(req, session) {
  const { role, organizationId } = session.user

  if (role === 'super-admin') {
    const headerOrgId = req.headers.get('x-organization-id')
    if (headerOrgId && headerOrgId !== 'all') {
      return mongoose.Types.ObjectId.isValid(headerOrgId)
        ? new mongoose.Types.ObjectId(headerOrgId)
        : headerOrgId
    }
  }

  const orgId = organizationId || 'default-org'
  return mongoose.Types.ObjectId.isValid(orgId)
    ? new mongoose.Types.ObjectId(orgId)
    : orgId
}

/**
 * Check if the user's role is in the allowed roles
 */
export function verifyRole(session, allowedRoles) {
  const userRole = session.user.role || 'staff'
  return allowedRoles.includes(userRole)
}

/**
 * Create a standard 403 response
 */
export function rejectForbidden() {
  return NextResponse.json({ error: 'Access forbidden: Insufficient permissions.' }, { status: 403 })
}

/**
 * Create a standard 401 response
 */
export function rejectUnauthorized() {
  return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
}

/**
 * Handle database errors safely
 */
export function handleApiError(err, context = 'API Error') {
  console.error(`${context}:`, err)
  return NextResponse.json(
    { error: err.message || 'An unexpected error occurred. Please contact support.' },
    { status: 500 }
  )
}
