import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 })

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`
  const state = crypto.randomBytes(16).toString('hex')
  
  const googleAuthUrl  = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid email profile https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read&access_type=offline&prompt=consent&state=${state}`
  
  const response = NextResponse.redirect(googleAuthUrl)
  // Store state in cookie to verify in callback
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10, // 10 mins
    path: '/',
    sameSite: 'lax'
  })
  
  return response
}


