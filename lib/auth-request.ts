import type { NextRequest } from 'next/server'
import { prisma } from './prisma'
import type { SessionUser } from './session'
import { AUTH_COOKIE_NAME } from './cookies'

export function getTokenFromRequest(request: NextRequest): string {
  const bearerToken = request.headers.get('authorization')?.replace('Bearer ', '').trim()
  if (bearerToken) return bearerToken
  return request.cookies.get(AUTH_COOKIE_NAME)?.value || ''
}

/**
 * Get session user from a request's token (Bearer header or cookie).
 * Unlike getSession() which reads from Next.js cookies(), this works in - routes
 * by extracting the token from the raw request.
 */
export async function getSessionFromRequest(request: NextRequest): Promise<SessionUser | null> {
  const token = getTokenFromRequest(request)
  if (!token) return null

  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            mustChangePassword: true,
          },
        },
      },
    })

    if (!session) return null
    if (session.expiresAt < new Date()) return null

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role as 'admin' | 'user',
      mustChangePassword: session.user.mustChangePassword,
    }
  } catch {
    return null
  }
}
