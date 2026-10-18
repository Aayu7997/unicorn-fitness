import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { authenticateGoogleUser } from '@/lib/auth'
import {
  OAUTH_STATE_COOKIE_NAME,
  setAuthCookie,
  deleteOAuthStateCookie,
} from '@/lib/cookies'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  
  const storedState = request.cookies.get(OAUTH_STATE_COOKIE_NAME)?.value
  const isValidState = Boolean(
    state &&
    storedState &&
    state.length === storedState.length &&
    crypto.timingSafeEqual(Buffer.from(state), Buffer.from(storedState))
  )

  if (!isValidState) {
    console.warn('OAuth State validation failed: state mismatch or expired')
    const errRes = NextResponse.redirect(new URL('/signin?error=InvalidState', request.url))
    deleteOAuthStateCookie(errRes)
    return errRes
  }

  if (!code) {
    const errRes = NextResponse.redirect(new URL('/signin?error=NoCode', request.url))
    deleteOAuthStateCookie(errRes)
    return errRes
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      })
    })
    const tokenData = await tokenRes.json()
    
    if (!tokenRes.ok) throw new Error(tokenData.error_description || 'Token error')

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    })
    const userData = await userRes.json()

    if (!userData.email) throw new Error('No email returned from Google')

    const authResult = await authenticateGoogleUser(
      userData.email,
      userData.name || 'Google User',
      userData.id,
      tokenData.access_token,
      tokenData.refresh_token
    )

    const redirectPath = authResult.user?.role === 'admin' ? '/admin' : '/dashboard'
    const response = NextResponse.redirect(new URL(redirectPath, request.url))
    
    // Set hardened auth session cookie and evict consumed OAuth state cookie
    setAuthCookie(response, authResult.token, true)
    deleteOAuthStateCookie(response)
    
    return response
  } catch (error) {
    console.error('Google OAuth Error:', (error as any)?.message || 'OAuth callback failed')
    const errRes = NextResponse.redirect(new URL('/signin?error=OAuthFailed', request.url))
    deleteOAuthStateCookie(errRes)
    return errRes
  }
}
