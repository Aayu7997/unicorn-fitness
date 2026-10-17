import { NextRequest, NextResponse } from 'next/server'
import { authenticateGoogleUser } from '@/lib/auth'
import { z } from 'zod'

const verifyTokenSchema = z.object({
  access_token: z.string().min(1, 'Access token required'),
})

export async function POST(request: NextRequest) {
  try {
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

    // Fetch user info from Google
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
    response.cookies.set('auth_session', authResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Verify token error:', error?.message || error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
