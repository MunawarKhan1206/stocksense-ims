import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default async function middleware(req, event) {
  const path = req.nextUrl.pathname

  // Paths requiring auth checks
  const isProtectedRoute = [
    '/dashboard',
    '/products',
    '/sales',
    '/suppliers',
    '/analytics',
  ].some((route) => path.startsWith(route))

  if (isProtectedRoute) {
    // Run next-auth middleware inline
    const authMiddleware = withAuth(
      function middleware(req) {
        const token = req.nextauth.token
        const role = token.role

        // 1. Super Admin: full access
        if (role === 'super-admin') {
          return NextResponse.next()
        }

        // 2. Email Logs: Super Admin and Org Admin
        if (path.startsWith('/analytics/email-logs')) {
          if (!['super-admin', 'admin'].includes(role)) {
            return NextResponse.redirect(new URL('/dashboard', req.url))
          }
        }

        // 3. Analytics & Suppliers: Admin and Viewer
        if (path.startsWith('/analytics') || path.startsWith('/suppliers')) {
          if (!['admin', 'viewer'].includes(role)) {
            return NextResponse.redirect(new URL('/dashboard', req.url))
          }
        }

        // 4. Sales Ledger: Admin, Sales Staff, and Viewer
        if (path.startsWith('/sales')) {
          if (!['admin', 'sales-staff', 'viewer'].includes(role)) {
            return NextResponse.redirect(new URL('/dashboard', req.url))
          }
        }

        return NextResponse.next()
      },
      {
        callbacks: {
          authorized: ({ token }) => !!token,
        },
      }
    )
    return authMiddleware(req, event)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/login',
    '/api/:path*',
    '/dashboard/:path*',
    '/products/:path*',
    '/sales/:path*',
    '/suppliers/:path*',
    '/analytics/:path*',
  ],
}

