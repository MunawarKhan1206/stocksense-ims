import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getSessionOrReject } from '@/lib/apiUtils'
import User from '@/models/User'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDB()
    let session
    try {
      session = await getSessionOrReject()
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await User.findById(session.user.id).select('name email role image')
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image || null,
    }, { status: 200 })
  } catch (error) {
    console.error('GET /api/users/me error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
