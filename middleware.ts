import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require admin role
const ADMIN_ROUTES = ['/admin']
// Routes that require user authentication
const AUTH_ROUTES = ['/dashboard']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionToken = request.cookies.get('auth_session')?.value

  const isAdminRoute = ADMIN_ROUTES.some(r => pathname.startsWith(r))

  // Protected routes — require session
  if (isAdminRoute || AUTH_ROUTES) {
    if (!sessionToken) {
      const loginUrl = new URL('/signin', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Verify session server-side
    try {
      const verifyUrl = new URL('/api/auth/me', request.url)
      const verifyResponse = await fetch(verifyUrl, {
        headers: { Cookie: `auth_session=${sessionToken}` },
      })

      if (!verifyResponse.ok) {
        const response = NextResponse.redirect(new URL('/signin', request.url))
        response.cookies.delete('auth_session')
        return response
      }

      // - routes require admin role
      if (isAdminRoute) {
        const data = await verifyResponse.json()
        if (data.user?.role !== 'admin') {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
    } catch {
      // On network error, redirect to login
      const response = NextResponse.redirect(new URL('/signin', request.url))
      response.cookies.delete('auth_session')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
  ],
}
