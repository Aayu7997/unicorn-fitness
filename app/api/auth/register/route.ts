import { registerUser } from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/resend'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const registerSchema = z.object({
  email: z.string().email('Invalid email').max(254),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
})

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers)
    const rateCheck = checkRateLimit(`register:${ip}`, { windowMs: 60 * 60 * 1000, max: 10 })

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many registration attempts from this network. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, password, name } = parsed.data
    const result = await registerUser(email, password, name)

    if (!result) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Send welcome email (non-blocking)
    sendWelcomeEmail(name, email).catch(console.error);

    // Trigger Admin Notification
    prisma.notification.create({
      data: {
        role: 'admin',
        title: 'New User Joined',
        message: `${name} (${email}) has just registered.`,
        type: 'system'
      }
    }).catch(console.error);

    const response = NextResponse.json({
      user: result.user,
      message: 'Account created successfully',
    }, { status: 201 })

    response.cookies.set('auth_session', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
