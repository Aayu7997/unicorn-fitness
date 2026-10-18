import { authenticateUser } from '@/lib/auth'
import { setAuthCookie } from '@/lib/cookies'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { verifyTOTP } from '@/lib/two-factor'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
  remember: z.boolean().optional(),
  twoFactorCode: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers)
    const ipRateCheck = checkRateLimit(`login-ip:${ip}`, { windowMs: 15 * 60 * 1000, max: 10 })
    
    if (!ipRateCheck.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      )
    }

    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = loginSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, password, remember = false, twoFactorCode } = parsed.data
    const normalizedEmail = email.toLowerCase().trim()

    // Dual rate-limiting: protect target account from distributed credential stuffing (OWASP API6 / A07)
    const accountRateCheck = checkRateLimit(`login-acc:${normalizedEmail}`, { windowMs: 15 * 60 * 1000, max: 10 })
    if (!accountRateCheck.success) {
      return NextResponse.json(
        { error: 'Too many login attempts for this account. Please try again in 15 minutes.' },
        { status: 429 }
      )
    }

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

    setAuthCookie(response, result.token, remember)

    return response
  } catch (error: any) {
    console.error('Login error:', error?.message || 'Authentication error')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
