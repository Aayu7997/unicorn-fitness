import type { NextResponse } from 'next/server'

export const AUTH_COOKIE_NAME = 'auth_session'
export const OAUTH_STATE_COOKIE_NAME = 'oauth_state'

/**
 * Standard session durations (in seconds):
 * - REMEMBER: 30 days for persistent / remember-me / OAuth sessions
 * - DEFAULT: 24 hours (1 day) for standard sessions
 * - OAUTH_STATE: 10 minutes for transient OAuth CSRF state verification
 */
export const SESSION_DURATIONS = {
  REMEMBER: 30 * 24 * 60 * 60, // 30 days
  DEFAULT: 24 * 60 * 60,       // 24 hours
  OAUTH_STATE: 10 * 60,        // 10 minutes
} as const

export interface CookieSecurityOptions {
  httpOnly: boolean
  secure: boolean
  sameSite: 'lax' | 'strict' | 'none'
  path: string
  maxAge?: number
  priority?: 'low' | 'medium' | 'high'
}

/**
 * Detect whether cookies must be marked with the Secure attribute.
 * Evaluates production environment, HTTPS deployment URLs, or explicit HTTPS protocol.
 */
export function isSecureContext(protocolOrHeaders?: string | Headers): boolean {
  if (process.env.NODE_ENV === 'production') return true
  if (process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview') return true
  if (typeof protocolOrHeaders === 'string') {
    if (protocolOrHeaders === 'https:' || protocolOrHeaders === 'https') return true
  } else if (protocolOrHeaders && typeof protocolOrHeaders.get === 'function') {
    const proto = protocolOrHeaders.get('x-forwarded-proto')
    if (proto === 'https') return true
  }
  if (process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://')) return true
  return false
}

/**
 * Get hardened cookie options for authentication session cookie.
 * - httpOnly: true (prevents client-side scripts from reading the token via XSS)
 * - secure: true in production/HTTPS (prevents token transmission over unencrypted HTTP)
 * - sameSite: 'lax' (protects against CSRF while permitting top-level navigation)
 * - path: '/' (scopes the cookie across the entire domain)
 * - priority: 'high' (Chromium priority hint to prevent premature eviction)
 */
export function getAuthCookieOptions(
  remember: boolean = false,
  isSecure?: boolean
): CookieSecurityOptions {
  return {
    httpOnly: true,
    secure: isSecure !== undefined ? isSecure : isSecureContext(),
    sameSite: 'lax',
    path: '/',
    maxAge: remember ? SESSION_DURATIONS.REMEMBER : SESSION_DURATIONS.DEFAULT,
    priority: 'high',
  }
}

/**
 * Get hardened cookie options for OAuth CSRF state verification cookie.
 */
export function getOAuthStateCookieOptions(isSecure?: boolean): CookieSecurityOptions {
  return {
    httpOnly: true,
    secure: isSecure !== undefined ? isSecure : isSecureContext(),
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATIONS.OAUTH_STATE,
  }
}

/**
 * Get options for evicting/deleting an authentication cookie securely.
 * Matching path, httpOnly, and secure flags ensures the browser successfully deletes the cookie.
 */
export function getDeleteCookieOptions(isSecure?: boolean): CookieSecurityOptions {
  return {
    httpOnly: true,
    secure: isSecure !== undefined ? isSecure : isSecureContext(),
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  }
}

/**
 * Securely set the auth session cookie on a NextResponse object.
 */
export function setAuthCookie(
  response: NextResponse,
  token: string,
  remember: boolean = false
): void {
  response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions(remember))
}

/**
 * Securely delete the auth session cookie from a NextResponse object.
 */
export function deleteAuthCookie(response: NextResponse): void {
  response.cookies.set(AUTH_COOKIE_NAME, '', getDeleteCookieOptions())
}

/**
 * Securely set the OAuth CSRF state token cookie.
 */
export function setOAuthStateCookie(response: NextResponse, state: string): void {
  response.cookies.set(OAUTH_STATE_COOKIE_NAME, state, getOAuthStateCookieOptions())
}

/**
 * Securely delete the OAuth CSRF state token cookie once consumed.
 */
export function deleteOAuthStateCookie(response: NextResponse): void {
  response.cookies.set(OAUTH_STATE_COOKIE_NAME, '', getDeleteCookieOptions())
}
