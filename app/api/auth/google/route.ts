import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import crypto from 'crypto'
import { setOAuthStateCookie } from '@/lib/cookies'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const rateCheck = checkRateLimit(`oauth-google-init:${ip}`, { windowMs: 15 * 60 * 1000, max: 20 })
  if (!rateCheck.success) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 })

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`
  const state = crypto.randomBytes(32).toString('hex')
  
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid email profile https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read&access_type=offline&prompt=consent&state=${state}`
  
  const response = NextResponse.redirect(googleAuthUrl)
  // Store state in hardened, httpOnly, sameSite=lax cookie to verify in callback
  setOAuthStateCookie(response, state)
  
  return response
}
