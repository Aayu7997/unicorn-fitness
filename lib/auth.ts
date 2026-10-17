import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { createSession } from './session'

const SALT_ROUNDS = 12

const DEFAULT_ADMIN_EMAIL = 'unicornfitness3111@gmail.com'
const DEFAULT_ADMIN_PASSWORD = '-@123'
const DEFAULT_ADMIN_NAME = 'Lokesh Meena'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export interface AuthSession {
  token: string
  user: {
    id: string
    email: string
    name: string
    role: string
    mustChangePassword: boolean
  }
}

async function ensureDefaultAdmin(): Promise<void> {
  try {
    const existing = await prisma.user.findUnique({
      where: { email: DEFAULT_ADMIN_EMAIL },
    })

    if (!existing) {
      const passwordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD)
      await prisma.user.create({
        data: {
          email: DEFAULT_ADMIN_EMAIL,
          name: DEFAULT_ADMIN_NAME,
          passwordHash,
          role: 'admin',
          mustChangePassword: false,
        },
      })
      console.log('Default admin user created:', DEFAULT_ADMIN_EMAIL)
    }
  } catch (error) {
    console.error('Could not ensure default admin:', error)
  }
}

export async function authenticateUser(
  email: string,
  password: string,
  remember: boolean = false
): Promise<any | null> {
  const normalizedEmail = email.toLowerCase().trim()

  if (normalizedEmail === DEFAULT_ADMIN_EMAIL) {
    await ensureDefaultAdmin()
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })

  if (!user || !user.passwordHash) return null

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) return null

  const token = await createSession(user.id, remember)

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
  }
}

export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<any | null> {
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  })
  if (existing) return null

  const passwordHash = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase().trim(),
      name,
      passwordHash,
      role: 'user',
    },
  })

  const token = await createSession(user.id)

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      mustChangePassword: false,
    },
  }
}

export async function authenticateGoogleUser(
  email: string,
  name: string,
  googleId: string,
  googleAccessToken: string,
  googleRefreshToken?: string
): Promise<any> {
  let user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
        authProvider: 'google',
        googleId,
        googleAccessToken,
        googleRefreshToken
      },
    })
    
    // Admin Notification for Google Join
    prisma.notification.create({
      data: {
        role: 'admin',
        title: 'New User Joined (Google)',
        message: `${user.name} (${user.email}) has just registered via Google.`,
        type: 'system'
      }
    }).catch(console.error)
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { 
        googleId: user.googleId || googleId, 
        authProvider: 'google',
        googleAccessToken: googleAccessToken || user.googleAccessToken,
        googleRefreshToken: googleRefreshToken || user.googleRefreshToken
      },
    })
  }

  const sessionToken = await createSession(user.id)
  return {
    token: sessionToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
  }
}