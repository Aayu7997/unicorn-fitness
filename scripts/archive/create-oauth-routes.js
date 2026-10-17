const fs = require('fs');
const path = require('path');

const dir1 = 'C:\\Users\\ayush\\Downloads\\Projects\\UFC GYM\\app\\api\\auth\\google';
const dir2 = 'C:\\Users\\ayush\\Downloads\\Projects\\UFC GYM\\app\\api\\auth\\google\\callback';

fs.mkdirSync(dir1, { recursive: true });
fs.mkdirSync(dir2, { recursive: true });

const route1 = `import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 })

  const redirectUri = \`\${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback\`
  const state = crypto.randomBytes(16).toString('hex')
  
  const googleAuthUrl = \`https://accounts.google.com/o/oauth2/v2/auth?client_id=\${clientId}&redirect_uri=\${redirectUri}&response_type=code&scope=openid email profile&state=\${state}\`
  
  const response = NextResponse.redirect(googleAuthUrl)
  // Store state in cookie to verify in callback
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10, // 10 mins
    path: '/'
  })
  
  return response
}
`;

const route2 = `import { NextRequest, NextResponse } from 'next/server'
import { authenticateGoogleUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  
  const storedState = request.cookies.get('oauth_state')?.value
  if (!state || state !== storedState) {
    return NextResponse.redirect(new URL('/signin?error=InvalidState', request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/signin?error=NoCode', request.url))
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = \`\${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback\`

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
      headers: { Authorization: \`Bearer \${tokenData.access_token}\` }
    })
    const userData = await userRes.json()

    if (!userData.email) throw new Error('No email returned from Google')

    const authResult = await authenticateGoogleUser(
      userData.email,
      userData.name || 'Google User',
      userData.id
    )

    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    response.cookies.set('auth_session', authResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })
    
    return response
  } catch (error) {
    console.error('Google OAuth Error:', error)
    return NextResponse.redirect(new URL('/signin?error=OAuthFailed', request.url))
  }
}
`;

fs.writeFileSync(path.join(dir1, 'route.ts'), route1, 'utf8');
fs.writeFileSync(path.join(dir2, 'route.ts'), route2, 'utf8');
console.log('Created OAuth routes');
