import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all routes EXCEPT:
     * - _next static files
     * - _next image optimization
     * - favicon, public assets
     * - login and forbidden paths (public pages)
     * - API routes (protected internally with custom 401/403 responses)
     */
    '/((?!_next/static|_next/image|favicon|public|login|forbidden|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
