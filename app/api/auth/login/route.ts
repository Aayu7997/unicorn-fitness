import { authenticateUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { verifyTOTP } from '@/lib/two-factor'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
  remember: z.boolean().optional(),
  twoFactorCode: z.string().optional(),
})

// Simple in-memory rate limiter (IP-based, resets on server restart)
const attempts = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = attempts.get(ip)
  
  if (!entry || entry.resetTime < now) {
    attempts.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 })
    return true
  }
  
  // Allow up to 100 attempts in development instead of 5 to prevent lockouts during testing
  if (entry.count >= (process.env.NODE_ENV === 'development' ? 100 : 5)) return false
  
  entry.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const parsed = loginSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, password, remember = false, twoFactorCode } = parsed.data
    const normalizedEmail = email.toLowerCase().trim()

    // Check if user has 2FA enabled
    const userRecord = await (prisma.user as any).findUnique({
      where: { email: normalizedEmail },
      select: { id: true, passwordHash: true, twoFactorEnabled: true, twoFactorSecret: true }
    })

    if (userRecord?.twoFactorEnabled && userRecord?.twoFactorSecret) {
      // First verify password
      if (!userRecord.passwordHash) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }
      const isMatch = await bcrypt.compare(password, userRecord.passwordHash)
      if (!isMatch) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }

      // If no 2FA code provided yet, instruct client to prompt for 2FA
      if (!twoFactorCode) {
        return NextResponse.json({
          requires2FA: true,
          message: 'Two-Factor Authentication is required. Enter the 6-digit code from your authenticator app.'
        })
      }

      // Verify the 2FA code
      const is2FAValid = verifyTOTP(twoFactorCode, userRecord.twoFactorSecret)
      if (!is2FAValid) {
        return NextResponse.json(
          { error: 'Invalid 2FA code. Please check your authenticator and try again.' },
          { status: 400 }
        )
      }
    }

    const result = await authenticateUser(email, password, remember)

    if (!result) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      user: result.user,
      token: result.token,
      message: 'Login successful',
    })

    // 30 days if remember me is true, 1 day (24 hours) for standard sessions
    const sessionMaxAge = remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60

    response.cookies.set('auth_session', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: sessionMaxAge,
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error?.message || error)
    console.error('Stack:', error?.stack)
    return NextResponse.json(
      { error: 'Internal server error', detail: process.env.NODE_ENV === 'development' ? error?.message : undefined },
      { status: 500 }
    )
  }
}
