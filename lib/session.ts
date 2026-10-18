import { cookies, headers } from 'next/headers'
import { prisma } from './prisma'
import { AUTH_COOKIE_NAME } from './cookies'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  mustChangePassword: boolean
}

/**
 * Get the current authenticated user from the session cookie.
 * Returns null if unauthenticated or session is expired.
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    let token = cookieStore.get(AUTH_COOKIE_NAME)?.value
    
    if (!token) {
      const headersList = await headers()
      const authHeader = headersList.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) return null

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

    // Check expiry
    if (session.expiresAt < new Date()) {
      // Clean up expired session
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {})
      return null
    }

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

/**
 * Require admin — returns user or throws a 401/403 response.
 * Use in - route handlers.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSession()
  if (!user) {
    throw new Error('UNAUTHORIZED')
  }
  if (user.role !== 'admin') {
    throw new Error('FORBIDDEN')
  }
  return user
}

/**
 * Require any authenticated user.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSession()
  if (!user) {
    throw new Error('UNAUTHORIZED')
  }
  return user
}

/**
 * Require a gym member (role === 'user').
 * Throws UNAUTHORIZED if not logged in, or FORBIDDEN if user is an admin.
 * Enforces separation of duties so admins cannot perform member-only actions.
 */
export async function requireMember(): Promise<SessionUser> {
  const user = await getSession()
  if (!user) {
    throw new Error('UNAUTHORIZED')
  }
  if (user.role !== 'user') {
    throw new Error('FORBIDDEN')
  }
  return user
}

/**
 * Create a new session for a user. Returns the session token.
 */
export async function createSession(userId: string, remember: boolean = false): Promise<string> {
  const token = crypto.randomUUID() + crypto.randomUUID()
  const durationDays = remember ? 30 : 1
  const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)

  await prisma.session.create({
    data: { token, userId, expiresAt },
  })

  return token
}

/**
 * Delete a session by token (logout).
 */
export async function deleteSession(token: string): Promise<void> {
  await prisma.session.delete({ where: { token } }).catch(() => {})
}

/**
 * Clean up all expired sessions (run periodically).
 */
export async function cleanExpiredSessions(): Promise<void> {
  await prisma.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  })
}
