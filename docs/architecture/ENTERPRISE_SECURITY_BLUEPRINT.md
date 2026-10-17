# Enterprise Security Blueprint & OWASP Top 20 Hardening Matrix
**Unicorn Fitness Club Platform (Next.js 16 Web App + Expo Mobile App)**

---

## 1. Executive Summary

This blueprint defines the multi-tiered defense-in-depth architecture implemented across the Unicorn Fitness Club platform, covering both the **Next.js 16 App Router web/API services** and the **Expo SDK 52 React Native mobile application**.

The system satisfies industry benchmarks across:
1. **OWASP Top 10 (Web Applications)**
2. **OWASP API Security Top 10**
3. **OWASP Mobile Top 10**
4. **Automated CI/CD Multi-Scanner Verification (CodeQL, Semgrep, Gitleaks, npm audit)**

---

## 2. OWASP Web & API Top 10 Implementation Matrix

| OWASP Vulnerability | Risk / Attack Vector | Implemented Mitigation | Verification File |
| :--- | :--- | :--- | :--- |
| **A01: Broken Access Control** | Unauthorized URL access, horizontal/vertical privilege escalation | • Route protection in `middleware.ts` for `/admin/*` and `/dashboard/*`<br>• Server-side token validation via `/api/auth/me`<br>• Role-based verification (`user.role === 'admin'`) | [`middleware.ts`](../../middleware.ts)<br>[`lib/session.ts`](../../lib/session.ts) |
| **A02: Cryptographic Failures** | Credential theft, weak hashing, cleartext transmission | • Password hashing via `bcryptjs` with 12 salt rounds<br>• Enforced HTTPS with HSTS (`max-age=63072000; includeSubDomains; preload`)<br>• `auth_session` cookie marked `httpOnly`, `secure: true`, `sameSite: 'lax'`<br>• Secrets protected in `.env.local` (git-ignored) | [`lib/auth.ts`](../../lib/auth.ts)<br>[`next.config.mjs`](../../next.config.mjs) |
| **A03: Injection (SQL / XSS / Command)** | SQL injection, cross-site scripting (XSS), script execution | • Prisma ORM parameterized queries (zero raw SQL string concatenation)<br>• React automatic JSX output encoding<br>• `X-XSS-Protection: 1; mode=block`<br>• `X-Content-Type-Options: nosniff` | [`lib/prisma.ts`](../../lib/prisma.ts)<br>[`next.config.mjs`](../../next.config.mjs) |
| **A04: Insecure Design & Resource Consumption** | Brute force attacks, bot spam, DoS via unbounded payloads | • Centralized sliding-window rate limiting in `lib/rate-limit.ts`<br>• Applied to `/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password`, `/api/contact`<br>• Strict string length caps and format validation via `zod` | [`lib/rate-limit.ts`](../../lib/rate-limit.ts)<br>[`app/api/auth/register/route.ts`](../../app/api/auth/register/route.ts) |
| **A05: Security Misconfiguration** | Information disclosure, verbose error stacks in production | • Disabled `X-Powered-By` header<br>• Production builds strip `console.log` statements<br>• Error messages sanitized; internal database error details omitted in production | [`next.config.mjs`](../../next.config.mjs)<br>[`app/api/auth/login/route.ts`](../../app/api/auth/login/route.ts) |
| **A06: Vulnerable & Outdated Components** | Known CVEs in third-party npm packages | • Automated GitHub Actions dependency auditing on PRs and weekly cron<br>• Package pinning and reproducible builds via `package-lock.json` | [`.github/workflows/security.yml`](../../.github/workflows/security.yml) |
| **A07: Identification & Authentication Failures** | Credential stuffing, account enumeration, weak passwords | • Generic auth failure messages ("Invalid email or password")<br>• 200 response on password reset even if email not found<br>• Two-Factor Authentication (2FA) with TOTP / Authenticator app support<br>• Exponential backoff on rate-limited IP addresses | [`lib/two-factor.ts`](../../lib/two-factor.ts)<br>[`app/api/auth/forgot-password/route.ts`](../../app/api/auth/forgot-password/route.ts) |
| **A08: Software & Data Integrity Failures** | Code tampering, untrusted deserialization | • Cryptographically secure random UUID tokens for sessions (`crypto.randomUUID`)<br>• Semgrep SAST ruleset analyzing code paths on every commit | [`.github/workflows/security.yml`](../../.github/workflows/security.yml) |
| **A09: Security Logging & Monitoring Failures** | Undetected breaches, lack of audit trails | • In-app admin notification system logging security events (`New User Joined`, `New Inquiry`)<br>• Audit trails stored in Prisma database models | [`app/api/contact/route.ts`](../../app/api/contact/route.ts) |
| **A10: Server-Side Request Forgery (SSRF)** | Malicious internal network queries | • No arbitrary URL fetching from client input<br>• All webhook/email/AI integrations call explicit, whitelisted provider endpoints (Resend, Cloudinary, OpenRouter) | [`lib/cloudinary.ts`](../../lib/cloudinary.ts)<br>[`lib/resend.ts`](../../lib/resend.ts) |

---

## 3. OWASP Mobile Top 10 Implementation Matrix (Expo / React Native)

| OWASP Mobile Risk | Mobile Threat Vector | Implemented Mitigation | Verification File |
| :--- | :--- | :--- | :--- |
| **M1: Improper Credential Usage** | Storing session tokens in unencrypted AsyncStorage | Auth tokens stored exclusively via `expo-secure-store` (iOS Keychain / Android Encrypted Keystore) | [`mobile/src/hooks/useAuth.ts`](../../mobile/src/hooks/useAuth.ts) |
| **M2: Inadequate Supply Chain Security** | Malicious packages, insecure binary dependencies | Strict npm dependency locking, automated TypeScript verification (`npx tsc --noEmit`) in CI | [`mobile/package-lock.json`](../../mobile/package-lock.json) |
| **M3: Insecure Authentication / Authorization** | Replay attacks, zombie sessions | Immediate token deletion and session invalidation on receiving HTTP 401 in Axios response interceptor | [`mobile/src/lib/api.ts`](../../mobile/src/lib/api.ts) |
| **M4: Insufficient Input / Output Validation** | Malicious deep links, injection into native bridges | URL scheme restricted to `mobile` in `app.json`; typed routes enforced via Expo Router | [`mobile/app.json`](../../mobile/app.json) |
| **M5: Insecure Communication** | Man-In-The-Middle (MITM), cleartext HTTP transmission | Runtime enforcement in `api.ts` upgrading any cleartext `http://` API URL to `https://` in production | [`mobile/src/lib/api.ts`](../../mobile/src/lib/api.ts) |
| **M6: Inadequate Privacy Controls** | Logging sensitive tokens/URLs to system console | Production logs sanitized; development-only warning banners guarded behind `__DEV__` check | [`mobile/src/lib/api.ts`](../../mobile/src/lib/api.ts) |
| **M7: Insufficient Binary Protections** | Reverse engineering, app repackaging | Android legacy packaging configured in `app.json` for R8 / Proguard minification compatibility | [`mobile/app.json`](../../mobile/app.json) |
| **M8: Security Misconfiguration** | Unintended exposed permissions | Minimal permissions requested in `app.json` (camera/location restricted) | [`mobile/app.json`](../../mobile/app.json) |
| **M9: Insecure Data Storage** | Caching sensitive data in plaintext SQLite/cache | Offline TanStack Query cache persister wrapped with SecureStore adapters | [`mobile/src/app/_layout.tsx`](../../mobile/src/app/_layout.tsx) |
| **M10: Insufficient Cryptography** | Weak native encryption | Uses hardware-backed AES-256-GCM via Android KeyStore and Apple Secure Enclave | [`mobile/src/hooks/useAuth.ts`](../../mobile/src/hooks/useAuth.ts) |

---

## 4. HTTP Security Headers Overview

Every HTTP response served by Next.js includes enterprise-grade headers:

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-XSS-Protection: 1; mode=block
Cross-Origin-Opener-Policy: same-origin-allow-popups
Cross-Origin-Resource-Policy: same-site
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## 5. Automated CI/CD Multi-Scanner Suite

All code pushed to GitHub is automatically verified by 4 independent security analyzers:

1. **GitHub CodeQL SAST** ([`.github/workflows/codeql.yml`](../../.github/workflows/codeql.yml)):
   - Deep semantic data-flow analysis for injection, taint tracking, and code vulnerabilities.
2. **Semgrep SAST** ([`.github/workflows/security.yml`](../../.github/workflows/security.yml)):
   - High-speed AST scanning against `p/owasp-top-ten`, `p/nextjs`, and `p/typescript`.
3. **Gitleaks Secret Detection** ([`.github/workflows/security.yml`](../../.github/workflows/security.yml)):
   - Scans commits for exposed API keys, private certificates, or auth secrets.
4. **npm Audit** ([`.github/workflows/security.yml`](../../.github/workflows/security.yml)):
   - Detects known CVEs in upstream libraries.
