import { NextRequest, NextResponse } from 'next/server'
import { authenticateGoogleUser } from '@/lib/auth'
import { setAuthCookie } from '@/lib/cookies'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { z } from 'zod'

const verifyTokenSchema = z.object({
  access_token: z.string().min(1, 'Access token required'),
})

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers)
    const rateCheck = checkRateLimit(`verify-token:${ip}`, { windowMs: 15 * 60 * 1000, max: 20 })
    if (!rateCheck.success) {
      return NextResponse.json({ error: 'Too many verification attempts. Please try again later.' }, { status: 429 })
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const parsed = verifyTokenSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { access_token } = parsed.data

    // 1. Verify token authenticity and audience with Google to prevent token substitution attacks (OWASP API2)
    const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(access_token)}`)
    if (!tokenInfoRes.ok) {
      return NextResponse.json(
        { error: 'Invalid or expired Google access token' },
        { status: 401 }
      )
    }
    const tokenInfo = await tokenInfoRes.json()
    const expectedClientId = process.env.GOOGLE_CLIENT_ID
    if (!expectedClientId) {
      console.error('GOOGLE_CLIENT_ID is not configured on the server')
      return NextResponse.json(
        { error: 'OAuth authentication service is not properly configured' },
        { status: 500 }
      )
    }

    const matchesClient = tokenInfo.issued_to === expectedClientId || tokenInfo.audience === expectedClientId
    if (!matchesClient) {
      console.warn('Token audience mismatch in Google OAuth verification')
      return NextResponse.json(
        { error: 'Token audience does not match configured application client ID' },
        { status: 401 }
      )
    }

    // 2. Fetch user info from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    })
    const userData = await userRes.json()

    if (!userData.email) {
      return NextResponse.json(
        { error: 'No email returned from Google or invalid token' },
        { status: 401 }
      )
    }

    const authResult = await authenticateGoogleUser(
      userData.email,
      userData.name || 'Google User',
      userData.id,
      access_token
    )

    if (!authResult) {
      return NextResponse.json(
        { error: 'Failed to authenticate user' },
        { status: 500 }
      )
    }

    const response = NextResponse.json({
      user: authResult.user,
      token: authResult.token,
      message: 'Google login successful',
    })

    // Also set the cookie for web, just in case
    setAuthCookie(response, authResult.token, true)

    return response
  } catch (error: any) {
    console.error('Verify token error:', error?.message || error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
