import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generateBase32Secret, generateOtpAuthUrl, verifyTOTP } from '@/lib/two-factor'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await (prisma.user as any).findUnique({
      where: { id: session.id as string },
      select: { id: true, email: true, twoFactorEnabled: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json({
        enabled: true,
        message: 'Two-Factor Authentication is currently active on your account.'
      })
    }

    // Generate new secret for initial setup
    const secret = generateBase32Secret(16)
    const otpauthUrl = generateOtpAuthUrl(user.email, secret)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(otpauthUrl)}`

    return NextResponse.json({
      enabled: false,
      secret,
      otpauthUrl,
      qrCodeUrl
    })
  } catch (error) {
    console.error('2FA GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { action } = body

    const user = await prisma.user.findUnique({
      where: { id: session.id as string }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (action === 'enable') {
      const { code, secret } = body
      if (!code || !secret) {
        return NextResponse.json({ error: 'Verification code and secret are required.' }, { status: 400 })
      }

      const isValid = verifyTOTP(code, secret)
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid verification code. Please check your authenticator app and try again.' }, { status: 400 })
      }

      await (prisma.user as any).update({
        where: { id: user.id },
        data: {
          twoFactorEnabled: true,
          twoFactorSecret: secret
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Two-Factor Authentication has been successfully enabled for your account!'
      })
    }

    if (action === 'disable') {
      const { password } = body

      // If user has local password, require confirmation
      if (user.passwordHash) {
        if (!password) {
          return NextResponse.json({ error: 'Current password is required to disable 2FA.' }, { status: 400 })
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash)
        if (!isMatch) {
          return NextResponse.json({ error: 'Incorrect password. 2FA was not disabled.' }, { status: 400 })
        }
      }

      await (prisma.user as any).update({
        where: { id: user.id },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Two-Factor Authentication has been disabled.'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('2FA POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
