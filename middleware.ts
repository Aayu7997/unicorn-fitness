import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require admin role
const ADMIN_ROUTES = ['/admin']
// Routes that require user authentication
const AUTH_ROUTES = ['/dashboard']

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('X-XSS-Protection', '0')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  return res
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionToken = request.cookies.get('auth_session')?.value

  const isAdminRoute = ADMIN_ROUTES.some(r => pathname.startsWith(r))
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r))

  // Protected routes — require session
  if (isAdminRoute || isAuthRoute) {
    if (!sessionToken) {
      const loginUrl = new URL('/signin', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return applySecurityHeaders(NextResponse.redirect(loginUrl))
    }

    // Verify session server-side
    try {
      const verifyUrl = new URL('/api/auth/me', request.url)
      const verifyResponse = await fetch(verifyUrl, {
        headers: { Cookie: `auth_session=${sessionToken}` },
      })

      if (!verifyResponse.ok) {
        const response = applySecurityHeaders(NextResponse.redirect(new URL('/signin', request.url)))
        response.cookies.delete('auth_session')
        return response
      }

      // Admin routes require admin role
      if (isAdminRoute) {
        const data = await verifyResponse.json()
        if (data.user?.role !== 'admin') {
          return applySecurityHeaders(NextResponse.redirect(new URL('/dashboard', request.url)))
        }
      }
    } catch {
      // On network error, redirect to login
      const response = applySecurityHeaders(NextResponse.redirect(new URL('/signin', request.url)))
      response.cookies.delete('auth_session')
      return response
    }
  }

  const response = NextResponse.next()
  return applySecurityHeaders(response)
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
  ],
}
