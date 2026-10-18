import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_COOKIE_NAME, deleteAuthCookie } from '@/lib/cookies'

// Routes that require admin role
const ADMIN_ROUTES = ['/admin']
// Routes that require user authentication (members only)
const AUTH_ROUTES = ['/dashboard']
// API routes that require admin authentication
const ADMIN_API_ROUTES = ['/api/admin', '/api/admin/']
// Authentication pages
const SIGNIN_ROUTES = ['/signin', '/login']

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('X-XSS-Protection', '0')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
  res.headers.set('Cross-Origin-Resource-Policy', 'same-site')

  const isDev = process.env.NODE_ENV === 'development'
  const scriptSrc = isDev
    ? "'self' 'unsafe-eval' 'unsafe-inline' https://res.cloudinary.com https://accounts.google.com"
    : "'self' 'unsafe-inline' https://res.cloudinary.com https://accounts.google.com"

  res.headers.set(
    'Content-Security-Policy',
    `default-src 'self'; script-src ${scriptSrc}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com https://images.unsplash.com; connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com https://res.cloudinary.com; frame-src 'self' https://accounts.google.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self' https://accounts.google.com;`
  )
  return res
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 0. Malicious probe, path traversal & sensitive file inspection defense (OWASP A01 / A05)
  const lowerPath = pathname.toLowerCase()
  const isMaliciousProbe =
    (pathname.startsWith('/.') && !pathname.startsWith('/.well-known/')) ||
    lowerPath.includes('..') ||
    lowerPath.endsWith('.env') ||
    lowerPath.endsWith('.sql') ||
    lowerPath.endsWith('.bak') ||
    lowerPath.endsWith('.backup') ||
    lowerPath.endsWith('.prisma') ||
    lowerPath.includes('wp-admin') ||
    lowerPath.includes('wp-login') ||
    lowerPath.includes('phpmyadmin')

  if (isMaliciousProbe) {
    return applySecurityHeaders(
      new NextResponse('Not Found', { status: 404 })
    )
  }

  const sessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value || request.headers.get('authorization')?.replace('Bearer ', '').trim()

  const isAdminRoute = ADMIN_ROUTES.some(r => pathname.startsWith(r))
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r))
  const isAdminApiRoute = ADMIN_API_ROUTES.some(r => pathname.startsWith(r))
  const isSigninRoute = SIGNIN_ROUTES.some(r => pathname === r)

  // 1. Admin API Protection (defense-in-depth)
  if (isAdminApiRoute) {
    if (!sessionToken) {
      return applySecurityHeaders(
        NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 })
      )
    }

    try {
      const verifyUrl = new URL('/api/auth/me', request.url)
      const verifyResponse = await fetch(verifyUrl, {
        headers: { Cookie: `${AUTH_COOKIE_NAME}=${sessionToken}` },
      })

      if (!verifyResponse.ok) {
        return applySecurityHeaders(
          NextResponse.json({ error: 'Unauthorized: Session invalid or expired' }, { status: 401 })
        )
      }

      const data = await verifyResponse.json()
      if (data.user?.role !== 'admin') {
        return applySecurityHeaders(
          NextResponse.json({ error: 'Forbidden: Administrator privileges required' }, { status: 403 })
        )
      }
    } catch {
      return applySecurityHeaders(
        NextResponse.json({ error: 'Unauthorized: Session verification failed' }, { status: 401 })
      )
    }
  }

  // 2. Protected Web Routes (/admin/* and /dashboard/*)
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
        headers: { Cookie: `${AUTH_COOKIE_NAME}=${sessionToken}` },
      })

      if (!verifyResponse.ok) {
        const response = applySecurityHeaders(NextResponse.redirect(new URL('/signin', request.url)))
        if (verifyResponse.status === 401 || verifyResponse.status === 403) {
          deleteAuthCookie(response)
        }
        return response
      }

      const data = await verifyResponse.json()
      const userRole = data.user?.role

      // Admin routes require admin role. Non-admins redirected to user dashboard.
      if (isAdminRoute && userRole !== 'admin') {
        return applySecurityHeaders(NextResponse.redirect(new URL('/dashboard', request.url)))
      }

      // STRICT ROLE SEPARATION: Admins are staff, NOT gym members.
      // If an admin attempts to access /dashboard, redirect them to /admin.
      if (isAuthRoute && userRole === 'admin') {
        return applySecurityHeaders(NextResponse.redirect(new URL('/admin', request.url)))
      }
    } catch {
      // On network error, redirect to login without deleting valid session cookie
      return applySecurityHeaders(NextResponse.redirect(new URL('/signin', request.url)))
    }
  }

  // 3. Signin Page: Redirect already logged-in users to their respective dashboards
  if (isSigninRoute && sessionToken) {
    try {
      const verifyUrl = new URL('/api/auth/me', request.url)
      const verifyResponse = await fetch(verifyUrl, {
        headers: { Cookie: `${AUTH_COOKIE_NAME}=${sessionToken}` },
      })

      if (verifyResponse.ok) {
        const data = await verifyResponse.json()
        const userRole = data.user?.role
        if (userRole === 'admin') {
          return applySecurityHeaders(NextResponse.redirect(new URL('/admin', request.url)))
        } else if (userRole === 'user') {
          return applySecurityHeaders(NextResponse.redirect(new URL('/dashboard', request.url)))
        }
      }
    } catch {
      // Fall through to show signin page
    }
  }

  const response = NextResponse.next()
  return applySecurityHeaders(response)
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/api/admin/:path*',
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets with file extensions (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
