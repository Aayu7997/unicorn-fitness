import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { NextResponse } from 'next/server';

let rawMod;
try {
  const { tsImport } = await import('tsx/esm/api');
  rawMod = await tsImport('../../lib/cookies.ts', import.meta.url);
} catch {
  rawMod = await import('../../lib/cookies.ts');
}

const cookiesModule = rawMod?.AUTH_COOKIE_NAME ? rawMod : (rawMod?.default || rawMod);

const {
  AUTH_COOKIE_NAME,
  OAUTH_STATE_COOKIE_NAME,
  SESSION_DURATIONS,
  isSecureContext,
  getAuthCookieOptions,
  getOAuthStateCookieOptions,
  getDeleteCookieOptions,
  setAuthCookie,
  deleteAuthCookie,
  setOAuthStateCookie,
  deleteOAuthStateCookie,
} = cookiesModule;

describe('Cookie Security & Hardening Tests', () => {
  it('defines canonical constant names and appropriate lifetimes', () => {
    assert.equal(AUTH_COOKIE_NAME, 'auth_session');
    assert.equal(OAUTH_STATE_COOKIE_NAME, 'oauth_state');
    assert.equal(SESSION_DURATIONS.DEFAULT, 24 * 60 * 60, 'Default session should be 24h');
    assert.equal(SESSION_DURATIONS.REMEMBER, 30 * 24 * 60 * 60, 'Persistent session should be 30 days');
    assert.equal(SESSION_DURATIONS.OAUTH_STATE, 10 * 60, 'OAuth state should be 10 minutes');
  });

  it('generates secure auth cookie options for standard sessions', () => {
    const opts = getAuthCookieOptions(false, true);
    assert.equal(opts.httpOnly, true, 'Auth cookie must be httpOnly');
    assert.equal(opts.secure, true, 'Auth cookie must have secure flag enabled');
    assert.equal(opts.sameSite, 'lax', 'Auth cookie must be SameSite=Lax for CSRF prevention');
    assert.equal(opts.path, '/', 'Auth cookie must be scoped to root /');
    assert.equal(opts.maxAge, 86400, 'Standard session should be 24h in seconds');
    assert.equal(opts.priority, 'high');
  });

  it('generates extended 30-day lifetime when remember is true', () => {
    const opts = getAuthCookieOptions(true, true);
    assert.equal(opts.httpOnly, true);
    assert.equal(opts.secure, true);
    assert.equal(opts.sameSite, 'lax');
    assert.equal(opts.path, '/');
    assert.equal(opts.maxAge, 30 * 24 * 60 * 60);
  });

  it('generates strict options for transient OAuth state cookie', () => {
    const opts = getOAuthStateCookieOptions(true);
    assert.equal(opts.httpOnly, true);
    assert.equal(opts.secure, true);
    assert.equal(opts.sameSite, 'lax');
    assert.equal(opts.path, '/');
    assert.equal(opts.maxAge, 600);
  });

  it('generates eviction options with maxAge 0 and matching security scope for deletion', () => {
    const opts = getDeleteCookieOptions(true);
    assert.equal(opts.httpOnly, true);
    assert.equal(opts.secure, true);
    assert.equal(opts.sameSite, 'lax');
    assert.equal(opts.path, '/');
    assert.equal(opts.maxAge, 0);
  });

  it('detects secure context when HTTPS or production flag is present', () => {
    assert.equal(isSecureContext('https:'), true);
    assert.equal(isSecureContext('https'), true);
  });

  it('setAuthCookie and deleteAuthCookie correctly manipulate NextResponse cookies', () => {
    const res = NextResponse.json({ ok: true });
    setAuthCookie(res, 'test-token-xyz', false);

    const setCookie = res.cookies.get(AUTH_COOKIE_NAME);
    assert.ok(setCookie, 'Cookie must be present in response');
    assert.equal(setCookie.value, 'test-token-xyz');

    // Test eviction
    deleteAuthCookie(res);
    const deletedCookie = res.cookies.get(AUTH_COOKIE_NAME);
    assert.equal(deletedCookie?.value, '');
  });

  it('setOAuthStateCookie and deleteOAuthStateCookie manage state token lifecycle', () => {
    const res = NextResponse.json({ ok: true });
    setOAuthStateCookie(res, 'oauth-random-state-123');

    const stateCookie = res.cookies.get(OAUTH_STATE_COOKIE_NAME);
    assert.ok(stateCookie, 'OAuth state cookie must be set');
    assert.equal(stateCookie.value, 'oauth-random-state-123');

    deleteOAuthStateCookie(res);
    const cleared = res.cookies.get(OAUTH_STATE_COOKIE_NAME);
    assert.equal(cleared?.value, '');
  });
});
