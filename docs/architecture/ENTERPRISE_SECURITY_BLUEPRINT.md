# Enterprise Security Blueprint & OWASP Top 20 Hardening Matrix
**Unicorn Fitness Club Platform (Next.js 16 Web App + Expo Mobile App)**

---

## 1. Executive Summary

This blueprint defines the multi-tiered defense-in-depth architecture implemented across the Unicorn Fitness Club platform, covering both the **Next.js 16 App Router web/API services** and the **Expo SDK 52 React Native mobile application**.

The system satisfies industry benchmarks across:
1. **OWASP Top 10 (Web Application Security Risks)**
2. **OWASP API Security Top 10 (2023 Edition)**
3. **OWASP Mobile Top 10 (2024 Edition)**
4. **Penetration Testing & Scanner Defense (Crawler Controls, RFC 9116 Vulnerability Disclosure, Probe Filtering)**
5. **Automated CI/CD Multi-Scanner Verification (CodeQL, Semgrep, Gitleaks, npm audit)**

---

## 2. OWASP Web Top 10 (2021) Implementation Matrix

| OWASP Web Risk | Risk / Attack Vector | Implemented Mitigation | Verification File |
| :--- | :--- | :--- | :--- |
| **A01: Broken Access Control** | Unauthorized URL access, horizontal/vertical privilege escalation | • Strict route protection in `middleware.ts` for `/admin/*` and `/dashboard/*`<br>• Server-side token validation via `/api/auth/me`<br>• Strict role segregation (Admins redirected from user portal; members blocked from admin API) | [`middleware.ts`](../../middleware.ts)<br>[`lib/session.ts`](../../lib/session.ts) |
| **A02: Cryptographic Failures** | Credential theft, weak hashing, cleartext transmission | • Password hashing via `bcryptjs` with 12 salt rounds<br>• Enforced HTTPS with HSTS (`max-age=31536000; includeSubDomains`)<br>• `auth_session` cookie marked `httpOnly: true`, `secure: isSecureContext()`, `sameSite: 'lax'`<br>• Timing-safe state comparison via `crypto.timingSafeEqual` | [`lib/auth.ts`](../../lib/auth.ts)<br>[`lib/cookies.ts`](../../lib/cookies.ts)<br>[`app/api/auth/google/callback/route.ts`](../../app/api/auth/google/callback/route.ts) |
| **A03: Injection (SQL / XSS / Command)** | SQL injection, cross-site scripting (XSS), script execution | • Prisma ORM parameterized queries (zero raw SQL string concatenation)<br>• React automatic JSX output encoding<br>• Enterprise CSP policy restricting script, style, and frame sources<br>• `X-Content-Type-Options: nosniff` | [`lib/prisma.ts`](../../lib/prisma.ts)<br>[`next.config.mjs`](../../next.config.mjs)<br>[`middleware.ts`](../../middleware.ts) |
| **A04: Insecure Design & Resource Consumption** | Brute force attacks, bot spam, DoS via unbounded payloads | • Centralized sliding-window rate limiting in `lib/rate-limit.ts`<br>• Applied to `/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password`, `/api/contact`, `/api/auth/google/*`<br>• Strict string length caps and format validation via `zod` | [`lib/rate-limit.ts`](../../lib/rate-limit.ts)<br>[`app/api/auth/login/route.ts`](../../app/api/auth/login/route.ts) |
| **A05: Security Misconfiguration** | Information disclosure, verbose error stacks in production, exposed backup files | • Disabled `X-Powered-By` header<br>• Production builds strip `console.log` statements<br>• Middleware intercepts directory traversal, backup files (`.env`, `.prisma`, `.sql`, `.bak`), and CMS probes (`wp-admin`, `wp-login`)<br>• Error messages sanitized without leaking internal stack traces | [`next.config.mjs`](../../next.config.mjs)<br>[`middleware.ts`](../../middleware.ts)<br>[`app/api/auth/login/route.ts`](../../app/api/auth/login/route.ts) |
| **A06: Vulnerable & Outdated Components** | Known CVEs in third-party npm packages | • Automated GitHub Actions dependency auditing on PRs and weekly cron<br>• Package pinning and reproducible builds via `package-lock.json` | [`.github/workflows/security.yml`](../../.github/workflows/security.yml) |
| **A07: Identification & Authentication Failures** | Credential stuffing, account enumeration, weak passwords, session hijacking | • Dual rate limiting: IP-based + account-based rate limits on `/api/auth/login`<br>• Generic auth failure messages ("Invalid email or password")<br>• 200 response on password reset even if email not found<br>• Two-Factor Authentication (2FA) with TOTP / Authenticator app support | [`lib/two-factor.ts`](../../lib/two-factor.ts)<br>[`app/api/auth/login/route.ts`](../../app/api/auth/login/route.ts)<br>[`app/api/auth/forgot-password/route.ts`](../../app/api/auth/forgot-password/route.ts) |
| **A08: Software & Data Integrity Failures** | Code tampering, untrusted deserialization, CSRF on OAuth flows | • 256-bit cryptographically secure random state tokens (`crypto.randomBytes(32)`)<br>• Constant-time comparison `crypto.timingSafeEqual` preventing timing attacks<br>• Semgrep SAST ruleset analyzing code paths on every commit | [`app/api/auth/google/route.ts`](../../app/api/auth/google/route.ts)<br>[`app/api/auth/google/callback/route.ts`](../../app/api/auth/google/callback/route.ts) |
| **A09: Security Logging & Monitoring Failures** | Undetected breaches, lack of audit trails, tamperable logs | • Tamper-resistant audit trails using validated `getClientIp(request.headers)`<br>• Audit trails stored in Prisma database models for all admin mutations<br>• In-app notification system logging security events | [`lib/rate-limit.ts`](../../lib/rate-limit.ts)<br>[`app/api/admin/master/roles/route.ts`](../../app/api/admin/master/roles/route.ts) |
| **A10: Server-Side Request Forgery (SSRF)** | Malicious internal network queries | • No arbitrary URL fetching from client input<br>• All webhook/email/OAuth integrations call explicit, whitelisted provider endpoints (Google, Resend, Cloudinary) | [`lib/cloudinary.ts`](../../lib/cloudinary.ts)<br>[`lib/resend.ts`](../../lib/resend.ts) |

---

## 3. OWASP API Security Top 10 (2023) Implementation Matrix

| OWASP API Risk | API Threat Vector | Implemented Mitigation | Verification File |
| :--- | :--- | :--- | :--- |
| **API1: Broken Object Level Authorization (BOLA)** | Accessing unauthorized member records by manipulating IDs | User ID extracted strictly from verified server-side session token; resource ownership validated before querying or mutating | [`app/api/user/profile/route.ts`](../../app/api/user/profile/route.ts)<br>[`lib/session.ts`](../../lib/session.ts) |
| **API2: Broken Authentication & Token Substitution** | Replaying tokens issued for different apps, brute-forcing tokens | • Audience verification on Google OAuth access tokens via `tokeninfo` endpoint<br>• Centralized sliding-window rate limiting on all auth API routes | [`app/api/auth/google/verify-token/route.ts`](../../app/api/auth/google/verify-token/route.ts)<br>[`lib/rate-limit.ts`](../../lib/rate-limit.ts) |
| **API3: Broken Object Property Level Authorization** | Mass assignment / exposing sensitive model attributes | Prisma queries use explicit `select` or `omit` clauses; requests validated with strict `zod` schemas | [`app/api/auth/login/route.ts`](../../app/api/auth/login/route.ts)<br>[`app/api/admin/members/route.ts`](../../app/api/admin/members/route.ts) |
| **API4: Unrestricted Resource Consumption** | API exhaustion, unbounded payload bodies, DoS | • Memory-efficient sliding-window rate limiting with automated 10-minute cache eviction<br>• Validated `trustedHops` preventing reverse-proxy header spoofing | [`lib/rate-limit.ts`](../../lib/rate-limit.ts) |
| **API5: Broken Function Level Authorization (BFLA)** | Regular users calling administrative API endpoints | `requireAdmin()` check executed at the entrypoint of all 58 `/api/admin/*` routes; non-admins rejected with HTTP 403 | [`lib/session.ts`](../../lib/session.ts)<br>[`.github/tests/rbac-security.test.mjs`](../../.github/tests/rbac-security.test.mjs) |
| **API6: Unrestricted Access to Sensitive Business Flows** | Automated registration bots, automated spam inquiries | Dedicated rate limiting on `/api/contact`, `/api/auth/register`, `/api/auth/google` | [`app/api/contact/route.ts`](../../app/api/contact/route.ts)<br>[`app/api/auth/register/route.ts`](../../app/api/auth/register/route.ts) |
| **API7: Server Side Request Forgery (SSRF)** | Exploiting backend outbound fetch calls | Outbound requests strictly limited to hardcoded third-party API hosts (OAuth2 Google, Resend, Cloudinary) | [`app/api/auth/google/callback/route.ts`](../../app/api/auth/google/callback/route.ts) |
| **API8: Security Misconfiguration** | Unintended CORS exposure, verbose debug responses | Standard same-origin policy enforced; unified HTTP security headers injected on all API responses | [`middleware.ts`](../../middleware.ts)<br>[`next.config.mjs`](../../next.config.mjs) |
| **API9: Improper Inventory Management** | Zombie endpoints, unmaintained legacy APIs | All active routes centralized under App Router `/api/*`; route protection strictly mapped in `middleware.ts` | [`middleware.ts`](../../middleware.ts) |
| **API10: Unsafe Consumption of APIs** | Blindly trusting responses from external services | Third-party responses validated with schemas before processing; access tokens verified against Google's tokeninfo | [`app/api/auth/google/verify-token/route.ts`](../../app/api/auth/google/verify-token/route.ts) |

---

## 4. OWASP Mobile Top 10 Implementation Matrix (Expo SDK 52)

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

## 5. Penetration Testing, VulnHub & Crawler Security Controls

### 5.1 Crawler Directives (`app/robots.ts` & `app/sitemap.ts`)
- **Sensitive Path Disallow**: Disallows search engine crawlers from indexing private portals and endpoints (`/admin/`, `/dashboard/`, `/api/`, `/signin`, `/signup`, `/login`, `/forgot-password`, `/reset-password`, `/_next/`, `/private/`).
- **AI Scraper Controls**: Explicit restriction rules targeting automated AI crawlers (`GPTBot`, `ChatGPT-User`, `CCBot`, `ClaudeBot`, `anthropic-ai`, `Bytespider`).
- **Sitemap Cleanliness**: Auth and administrative routes omitted from `app/sitemap.ts` to prevent search engine indexing conflicts.

### 5.2 Vulnerability Disclosure Policy (RFC 9116 `security.txt`)
- Accessible at `/.well-known/security.txt` and statically placed at `public/.well-known/security.txt`.
- Provides designated security contact email (`security@unicornfitness.com`), RFC 9116 expiration date, English language preference, and links to the canonical policy.

### 5.3 Automated Malicious Probe & Exploit Filtering (`middleware.ts`)
- Automated directory traversal (`..`), hidden dotfiles (`/.env`, `/.git`), and sensitive backup file probes (`*.sql`, `*.bak`, `*.backup`, `*.prisma`) are intercepted at the edge and returned as HTTP 404 with security headers, avoiding unnecessary backend processing.
- Common automated CMS exploit probes (`wp-admin`, `wp-login`, `phpmyadmin`) are safely blocked.
- Legitimate `/.well-known/*` paths (RFC 9116 security.txt, mobile universal links) are explicitly permitted.

---

## 6. HTTP Security Headers Overview

Every HTTP response served by Next.js includes enterprise-grade headers:

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-XSS-Protection: 0
Cross-Origin-Opener-Policy: same-origin-allow-popups
Cross-Origin-Resource-Policy: same-site
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://res.cloudinary.com https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com https://images.unsplash.com; connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com https://res.cloudinary.com; frame-src 'self' https://accounts.google.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self' https://accounts.google.com;
```

---

## 7. Automated CI/CD Multi-Scanner Suite

The security workflows scan pushes to main, pull requests targeting main, and scheduled weekly runs using 4 independent security analyzers:

1. **GitHub CodeQL SAST** ([`.github/workflows/codeql.yml`](../../.github/workflows/codeql.yml)):
   - Deep semantic data-flow analysis for injection, taint tracking, and code vulnerabilities.
2. **Semgrep SAST** ([`.github/workflows/security.yml`](../../.github/workflows/security.yml)):
   - High-speed AST scanning against `p/owasp-top-ten`, `p/nextjs`, and `p/typescript`.
3. **Gitleaks Secret Detection** ([`.github/workflows/security.yml`](../../.github/workflows/security.yml)):
   - Scans commits for exposed API keys, private certificates, or auth secrets.
4. **npm Audit** ([`.github/workflows/security.yml`](../../.github/workflows/security.yml)):
   - Detects known CVEs in upstream libraries across both root web app and mobile app.
