# UFC GYM — Production-Ready Project Organization & Architecture Blueprint

> **Status:** Production Architecture Blueprint  
> **Target Environments:** GitHub, Vercel, Cloudflare, Custom Domains, Expo Mobile (Android/iOS)  
> **Audience:** Senior Full-Stack Developers, DevOps & Project Maintainers  

---

## 1. Executive Summary & Audit of Current State

A complete scan of `c:\Users\ayush\Downloads\Projects\UFC GYM` identified **19 subdirectories and 57 root files** (over 76 items in the root directory alone). While the underlying code (Next.js 16 App Router + Expo React Native + Prisma + Tailwind CSS) is feature-rich and advanced, the repository currently exhibits severe structural clutter common to rapid prototyping.

### Critical Clutter & Vulnerabilities Discovered:
1. **33 Loose Root Scripts:** The root contains one-off patch and test scripts (`audit.js`, `cleanup.js`, `clean_dashboard.js`, `fix*.js`, `find*.js`, `view*.js`, `update*.js`, `test-prisma*.js`).
2. **Accidental & Stray Files:**
   - `prisma.$disconnect())` — A 0-byte file created accidentally via shell syntax error.
   - `capitalio.json` — An empty 0-byte file.
   - `suspicious_hyphens.txt` — An 18.9 KB temporary audit log.
   - `server.log` — A local Turbopack runtime log.
   - `index.css` — A redundant 29-byte file re-exporting `app/globals.css`.
3. **Cross-Project File Contamination:**
   - `walkthroughmimt.md` and `implementation_plan5.md` describe a Bluetooth BLE proxy project (`bluemind`), unrelated to UFC Gym.
4. **Severe Mobile Repository Bloat:**
   - `mobile/jdk17.zip` is **89.5 MB**! Committing this to Git bloats repository clone sizes and risks hitting GitHub's 100MB hard push limit.
   - `mobile/jdk17_fast/` is an unignored extracted folder.
   - Loose scripts in mobile root: `check.js`, `make_splash.py`, `resize-icon.js`.
5. **Assets in Code Folders:**
   - `features/` does not contain feature modules; instead, it contains 9 raw WhatsApp photos with spaces (`WhatsApp Image 2026-09-09...`).
6. **Scattered Documentation:**
   - 27 markdown files reside in a folder with spaces (`reference md files/`).
   - 5 markdown prompts reside in a folder misnamed as a file (`.claude.md/`).
   - Multiple loose markdown files and PDFs sit at the project root.
7. **Empty Directories:** `styles/` and `scratch/` are currently empty.
8. **Deployment Upload Penalty (Vercel & Cloudflare):**
   - Without an optimized `.vercelignore` and clean directory boundaries, deploying to Vercel packages the entire 89.5MB `mobile/` directory, loose scripts, and documentation, causing sluggish deployments and exceeding serverless build quotas.

---

## 2. Before vs. After File & Folder Structure

### Current Structure (Chaotic & Noisy — 76+ items in root)
```
UFC GYM/
├── .agents/
├── .claude.md/                       ❌ Directory named like a file containing 5 prompts
├── .env.local
├── .env.local.example
├── .git/
├── .gitignore                        ⚠️ Incomplete (missing logs, zips, mobile binaries)
├── .next/
├── .vercel/
├── .vercelignore                     ⚠️ Inefficient ignore patterns
├── .vscode/
├── app/                              ✅ Next.js 16 App Router
├── audit.js                          ❌ Loose script
├── capitalio.json                    ❌ 0-byte junk file
├── check-prisma.js                   ❌ Loose script
├── clean_dashboard.js                ❌ Loose script
├── clean_motion.js                   ❌ Loose script
├── cleanup.js                        ❌ Loose script
├── components/                       ✅ Web components
├── components.json
├── create-oauth-routes.js            ❌ Loose script
├── data/
├── download_exercises.js             ❌ Loose script
├── features/                         ❌ Misnamed; contains 9 raw WhatsApp images
├── find-auth.js                      ❌ Loose script
├── find-login.js                     ❌ Loose script
├── find-usages.js                    ❌ Loose script
├── fix-auth-typo.py                  ❌ Loose script
├── fix-auth.js                       ❌ Loose script
├── fix-types.js                      ❌ Loose script
├── fix.js, fix.py, fix2.js, ...      ❌ 12+ loose fix scripts
├── hooks/
├── implementation_plan5.md           ❌ Belongs to 'bluemind' BLE project
├── index.css                         ❌ Redundant 29-byte file
├── lib/
├── middleware.ts
├── mobile/                           ⚠️ Contains 89.5MB jdk17.zip & loose scripts
├── next-env.d.ts
├── next.config.mjs
├── node_modules/
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── prisma/
├── prisma.$disconnect())             ❌ Accidental syntax error file
├── prisma.config.ts
├── production_deployment_guide.md    ⚠️ Loose in root
├── production_deployment_guide.pdf   ⚠️ Loose in root
├── public/
├── reference md files/               ❌ Folder with spaces containing 27 markdown files
├── scratch/                          ❌ Empty directory
├── seed-video-highlights.js          ❌ Loose script
├── server.log                        ❌ Runtime log
├── skills-lock.json
├── styles/                           ❌ Empty directory
├── suspicious_hyphens.txt            ❌ Audit dump file
├── test-prisma.js, test-prisma2.js   ❌ Loose scripts
├── tsconfig.json
├── tsconfig.tsbuildinfo              ⚠️ Local build cache
├── update-*.js                       ❌ 4 loose update scripts
├── view-*.js                         ❌ 3 loose view scripts
└── walkthroughmimt.md                ❌ Belongs to 'bluemind' BLE project
```

---

### Production Standard Structure (Industry Grade — Clean & Modular)
```
UFC GYM/
├── .agents/                          # Agent skills, workflows & IDE configs
├── .github/                          # CI/CD Workflows (GitHub Actions)
│   └── workflows/
│       ├── web-ci.yml                # Lint, typecheck & build validation
│       └── mobile-ci.yml             # Expo / EAS check
├── .vscode/                          # Team VS Code settings & recommended extensions
│
├── app/                              # Next.js 16 Web Application (App Router)
│   ├── (marketing)/                  # Optional grouping: Public marketing pages
│   ├── about/
│   ├── admin/                        # Admin Portal (CRM, Staff, Finance, Analytics)
│   │   ├── components/
│   │   └── tabs/
│   ├── api/                          # Serverless API routes
│   │   ├── admin/
│   │   ├── ai/
│   │   ├── auth/
│   │   ├── cron/
│   │   └── user/
│   ├── blog/
│   ├── contact/
│   ├── dashboard/                    # Member Portal (Workouts, Diet, Bookings)
│   ├── layout.tsx                    # Root HTML layout with providers
│   ├── globals.css                   # Master Tailwind theme & design tokens
│   ├── page.tsx                      # Landing page
│   ├── robots.ts                     # SEO crawlers config
│   └── sitemap.ts                    # Dynamic XML sitemap
│
├── components/                       # Shared Web UI Components
│   ├── icons/                        # Custom SVG vector icons
│   ├── providers/                    # React Context providers (Auth, Theme, Lenis)
│   ├── ui/                           # Primitive design components (Radix / shadcn)
│   └── [sections]/                   # Hero, Pricing, Team, FAQ, Testimonials
│
├── data/                             # Static datasets & content definitions
│   └── site-content.json
│
├── docs/                             # 📚 Centralized Project Documentation
│   ├── architecture/                 # Architecture, GSAP, Animation specifications
│   ├── deployment/                   # Vercel, Cloudflare, Domain, SSL & Neon guides
│   ├── features/                     # Feature matrices, checklists, manifests
│   └── prompts/                      # Claude & GPT UI/UX prompts and guidelines
│
├── hooks/                            # Custom React Hooks (scroll, mobile, performance)
├── lib/                              # Server & Client Shared Libraries (Prisma, Jose, AI, Auth)
│
├── mobile/                           # 📱 Expo / React Native Mobile Application
│   ├── assets/                       # Icons, Splash screens & adaptive assets
│   ├── scripts/                      # Mobile build & asset generation scripts
│   ├── src/                          # Mobile App source code
│   │   ├── app/                      # Expo Router (tabs, admin, user, auth)
│   │   ├── components/               # React Native UI components
│   │   ├── constants/                # Theme colors, layout constants
│   │   ├── hooks/                    # Mobile custom hooks
│   │   ├── lib/                      # Mobile API client & storage
│   │   └── store/                    # State management (Zustand)
│   ├── app.json                      # Expo application manifest
│   ├── eas.json                      # EAS Build & Submit configuration
│   └── package.json                  # Mobile package dependencies
│
├── prisma/                           # 🗄️ Database Management
│   ├── schema.prisma                 # Postgres Database Schema
│   └── seed.ts                       # Master database seeder
│
├── public/                           # 🌐 Public Static Assets (Web)
│   ├── icons/                        # Web app icons & favicons
│   ├── images/                       # Categorized visual media
│   │   ├── gym/                      # Gym equipment & facility photos
│   │   ├── trainers/                 # Trainer profile photos
│   │   └── transformations/          # Before / after member photos
│   └── site.webmanifest              # Web App PWA Manifest
│
├── scripts/                          # 🛠️ Organized Developer & DevOps Tooling
│   ├── database/                     # DB verification & test scripts
│   │   ├── check-prisma.js
│   │   ├── seed-classes.ts
│   │   ├── seed-gallery.ts
│   │   └── seed-video-highlights.js
│   ├── maintenance/                  # Active utility & ingestion scripts
│   │   ├── download_exercises.js
│   │   ├── cleanup.js
│   │   └── audit.js
│   └── archive/                      # Historical one-off fix & patch scripts
│       ├── fix-*.js
│       ├── clean_*.js
│       └── update-*.js
│
├── .env.example                      # Production-safe environment variables template
├── .env.local                        # Local development secrets (GIT-IGNORED)
├── .gitignore                        # Universal multi-platform ignore rulebook
├── .vercelignore                     # Vercel deployment payload filter
├── components.json                   # UI configuration
├── middleware.ts                     # Auth & Route protection middleware
├── next.config.mjs                   # Next.js production configuration
├── package.json                      # Master scripts & web dependencies
├── postcss.config.mjs                # PostCSS config
└── tsconfig.json                     # TypeScript configuration
```

---

## 3. Detailed File-by-File Disposition Plan

### Group A: Files to Permanently Delete (Junk, Erroneous & Unrelated)

| Current File Path | Reason for Deletion |
| :--- | :--- |
| `prisma.$disconnect())` | Corrupted filename caused by broken shell command. Contains 0 bytes. |
| `capitalio.json` | Empty 0-byte file. Unused. |
| `suspicious_hyphens.txt` | Temporary audit output file. No longer needed. |
| `server.log` | Ephemeral runtime log. Should be git-ignored. |
| `index.css` | 29-byte file re-exporting `globals.css`. Redundant. |
| `walkthroughmimt.md` | Unrelated project documentation (`bluemind` Bluetooth project). |
| `implementation_plan5.md` | Unrelated project plan (`bluemind` Bluetooth project). |
| `styles/` | Empty directory. |
| `scratch/` | Empty directory. |

---

### Group B: One-Off Scripts to Move into `scripts/`

To keep the repository root clean, all 30+ loose scripts are segregated into targeted folders:

#### 1. Move to `scripts/database/`:
- `check-prisma.js`
- `test-prisma.js`
- `test-prisma2.js`
- `seed-video-highlights.js`

#### 2. Move to `scripts/maintenance/`:
- `audit.js`
- `cleanup.js`
- `download_exercises.js`
- `update-schema.js`

#### 3. Move to `scripts/archive/` (One-off fix scripts that have already executed):
- `clean_dashboard.js`, `clean_motion.js`
- `create-oauth-routes.js`
- `find-auth.js`, `find-login.js`, `find-usages.js`
- `fix-auth-typo.py`, `fix-auth.js`, `fix-types.js`, `fix.js`, `fix.py`, `fix2.js`, `fix3.js`, `fix4.js`
- `fix_colors.js`, `fix_dashboard.js`, `fix_dup.js`, `fix_hsl.js`, `fix_motion.js`
- `update-auth.js`, `update-signup.js`, `update-ui.js`
- `view-bottom.js`, `view-signup.js`, `view-social.js`

---

### Group C: Documentation to Consolidate into `docs/`

Replace the messy `reference md files/` directory and root markdown files with a standardized documentation portal:

| Source Path | Destination Path | Description |
| :--- | :--- | :--- |
| `production_deployment_guide.md` | `docs/deployment/PRODUCTION_DEPLOYMENT_GUIDE.md` | Production deployment manual |
| `production_deployment_guide.pdf` | `docs/deployment/production_deployment_guide.pdf` | PDF version of the manual |
| `reference md files/DEPLOYMENT_CHECKLIST.md` | `docs/deployment/DEPLOYMENT_CHECKLIST.md` | Launch checklist |
| `reference md files/ARCHITECTURE_REFERENCE.md` | `docs/architecture/ARCHITECTURE_REFERENCE.md` | System architecture overview |
| `reference md files/GSAP_PREMIUM_GUIDE.md` | `docs/architecture/GSAP_PREMIUM_GUIDE.md` | Animation architecture |
| `reference md files/GSAP_REFERENCE.md` | `docs/architecture/GSAP_REFERENCE.md` | Animation reference |
| `reference md files/SCROLL_ANIMATION_FLOW.md` | `docs/architecture/SCROLL_ANIMATION_FLOW.md` | Scroll interactions |
| `reference md files/SCROLL_ANIMATIONS_GUIDE.md` | `docs/architecture/SCROLL_ANIMATIONS_GUIDE.md` | Scroll animations guide |
| `reference md files/FEATURE_CHECKLIST.md` | `docs/features/FEATURE_CHECKLIST.md` | Complete feature checklist |
| `reference md files/PREMIUM_FEATURES.md` | `docs/features/PREMIUM_FEATURES.md` | Premium tier feature specs |
| `reference md files/PREMIUM_FEATURES_MANIFEST.md` | `docs/features/PREMIUM_FEATURES_MANIFEST.md` | Feature breakdown manifest |
| `reference md files/ANIMATION_SHOWCASE.md` | `docs/features/ANIMATION_SHOWCASE.md` | Animation catalog |
| `reference md files/ANIMATION_EXAMPLES.md` | `docs/features/ANIMATION_EXAMPLES.md` | Code examples for animations |
| `.claude.md/Gym_Admin_Panel_...md` | `docs/prompts/ADMIN_PANEL_PROMPT.md` | Admin UI/UX design prompt |
| `.claude.md/MOBILE APP CONSTITUTION.md` | `docs/prompts/MOBILE_APP_CONSTITUTION.md` | Mobile design constitution |
| `.claude.md/UI_UX.MD` | `docs/prompts/UI_UX_SPEC.md` | UI/UX specifications |
| `.claude.md/UI_UX_RESOURCES.md` | `docs/prompts/UI_UX_RESOURCES.md` | Design token resources |
| `.claude.md/claude.md` | `docs/prompts/SYSTEM_PROMPT.md` | System prompt reference |
| `reference md files/` (all other files) | `docs/references/` | Archive of historical reference docs |

---

### Group D: Media & Image Relocation (`features/` -> `public/images/gym/`)

The `features/` directory currently holds raw WhatsApp camera photos. Move and rename them to clean kebab-case names under `public/images/gym/`:

| Current Raw File in `features/` | New Path in `public/images/gym/` |
| :--- | :--- |
| `WhatsApp Image 2026-09-09 at 11.10.13 PM.jpeg` | `public/images/gym/gym-facility-1.jpeg` |
| `WhatsApp Image 2026-09-09 at 11.10.14 PM (1).jpeg` | `public/images/gym/gym-facility-2.jpeg` |
| `WhatsApp Image 2026-09-09 at 11.10.14 PM (2).jpeg` | `public/images/gym/gym-facility-3.jpeg` |
| `WhatsApp Image 2026-09-09 at 11.10.14 PM.jpeg` | `public/images/gym/gym-facility-4.jpeg` |
| `WhatsApp Image 2026-09-09 at 11.10.15 PM (1).jpeg` | `public/images/gym/gym-facility-5.jpeg` |
| `WhatsApp Image 2026-09-09 at 11.10.15 PM (2).jpeg` | `public/images/gym/gym-facility-6.jpeg` |
| `WhatsApp Image 2026-09-09 at 11.10.15 PM (3).jpeg` | `public/images/gym/gym-facility-7.jpeg` |
| `WhatsApp Image 2026-09-09 at 11.10.15 PM.jpeg` | `public/images/gym/gym-facility-8.jpeg` |
| `WhatsApp Image 2026-09-09 at 11.10.16 PM.jpeg` | `public/images/gym/gym-facility-9.jpeg` |

---

### Group E: Mobile Project Organization (`mobile/`)

1. **Remove Huge Zip Archive from Git Tracking:**
   - Move `mobile/jdk17.zip` (89.5 MB) outside the project folder (or add `jdk17.zip` and `jdk17_fast/` to `mobile/.gitignore`).
2. **Move Loose Utility Scripts:**
   - Move `mobile/check.js` -> `mobile/scripts/check.js`
   - Move `mobile/make_splash.py` -> `mobile/scripts/make_splash.py`
   - Move `mobile/resize-icon.js` -> `mobile/scripts/resize-icon.js`

---

## 4. Production Deployment & Platform Optimization

### 4.1. GitHub Configuration & Hygiene
1. **Never commit secrets:** Ensure `.env.local`, `.env`, and private keys are strictly git-ignored.
2. **Maintain a 50MB per file rule:** Prevent files larger than 50MB (like `jdk17.zip`) from entering `.git` tree history.
3. **Optimized `.gitignore`:** (See Section 6 for full contents).

---

### 4.2. Vercel Configuration (Fast, Lean Builds)
When deploying a Next.js web application from a repository that contains a `mobile/` app, Vercel must ignore unnecessary non-web folders to prevent bloated deployment payloads and slow build times.

1. **Root Directory:** Keep as `./` (Root).
2. **Framework Preset:** `Next.js`.
3. **Build Command:** `prisma generate && next build`.
4. **Install Command:** `npm install`.
5. **Output Directory:** `.next`.
6. **Optimized `.vercelignore`:** Excludes `mobile`, `docs`, `scripts`, `.agents`, and loose non-production assets.

---

### 4.3. Cloudflare & Custom Domain Architecture

```
User Browser
     │
     ▼
[Cloudflare Edge DNS & WAF]  (DDoS Protection, Free SSL/TLS, Caching)
     │
     ▼
[Vercel Serverless Platform] (Next.js 16 SSR & Server Actions)
     │
     ▼
[Neon Serverless PostgreSQL] (Database with Connection Pooling)
```

#### DNS Records Configuration:
| Type | Name | Content / Target | Proxy Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` (root) | `76.76.21.21` | **DNS Only (Grey Cloud)** initially for verification | Vercel Anycast IP |
| **CNAME** | `www` | `cname.vercel-dns.com` | **DNS Only (Grey Cloud)** initially for verification | Vercel CNAME Target |

> **Crucial Cloudflare Rule:**  
> Once SSL certificate verification completes on Vercel, set Cloudflare SSL/TLS Encryption Mode to **Full (Strict)**.  
> *Never use "Flexible" mode*, as it triggers an infinite redirect loop (`ERR_TOO_MANY_REDIRECTS`) with Vercel's automatic HTTPS redirect.

#### Cloudflare Page Rules / Cache Rules for Performance:
- **Rule 1 (Static Cache):** URL pattern `*yourdomain.com/_next/static/*` -> Cache Level: **Cache Everything**, Edge Cache TTL: **1 month**.
- **Rule 2 (Bypass API):** URL pattern `*yourdomain.com/api/*` -> Cache Level: **Bypass**, Security: **High**.

---

## 5. Master Environment Variables Setup (`.env.example`)

Create a clean, self-documenting `.env.example` in the project root:

```env
# ==========================================
# UFC GYM — PRODUCTION ENVIRONMENT VARIABLES
# ==========================================

# Database (Neon Serverless PostgreSQL)
# Direct connection (used for migrations)
DIRECT_URL="postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/ufcgym?sslmode=require"
# Pooled connection (used for application runtime)
DATABASE_URL="postgresql://user:password@ep-xyz-pooler.us-east-2.aws.neon.tech/ufcgym?sslmode=require"

# NextAuth / Jose JWT Authentication
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate-a-secure-32-byte-hex-string"
JWT_SECRET="generate-a-secure-32-byte-hex-string"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# AI Engine (Groq / Google GenAI)
GROQ_API_KEY="gsk_..."
GEMINI_API_KEY=""

# Email Communications (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="UFC Gym <noreply@yourdomain.com>"
ADMIN_EMAIL="admin@yourdomain.com"

# Media Storage (Cloudinary)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Site Configuration
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXT_PUBLIC_SITE_NAME="Unicorn Fitness Club"
```

---

## 6. Production Configuration Files

### 6.1. Root `.gitignore` (Production Ready)
```gitignore
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing & Coverage
/coverage

# Next.js Build Outputs
/.next/
/out/
/build

# Debug Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Environment Secret Files
.env
.env*.local
.env.development.local
.env.test.local
.env.production.local

# Vercel Deployment Metadata
.vercel

# TypeScript Caches
*.tsbuildinfo
next-env.d.ts

# Operating System Files
.DS_Store
Thumbs.db

# Mobile-specific archives & heavy builds
mobile/jdk17.zip
mobile/jdk17_fast/
mobile/.expo/
mobile/dist/
mobile/web-build/
mobile/android/.gradle/
mobile/android/build/
mobile/android/app/build/
mobile/node_modules/

# Temporary Audit Files
suspicious_hyphens.txt
capitalio.json
```

---

### 6.2. Production `.vercelignore`
```vercelignore
# Ignore mobile app entirely from web deployment
mobile/

# Ignore documentation & agent configs
docs/
.agents/
.vscode/

# Ignore tooling & scripts
scripts/

# Ignore local media dumps & tests
tests/
*.log
*.zip
*.pdf
```

---

## 7. Developer Runbook & Package Scripts

Update the root `package.json` to empower developers with unified, one-command scripts:

```json
{
  "name": "ufc-gym-platform",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3333",
    "build": "prisma generate && next build",
    "start": "next start -p 3333",
    "lint": "next lint",
    
    "dev:mobile": "npm --prefix mobile run start",
    "android": "npm --prefix mobile run android",
    "ios": "npm --prefix mobile run ios",
    
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    
    "clean": "rimraf .next node_modules/.cache"
  }
}
```

---

## 8. Safe Execution Script (Automated 1-Click Migration)

You can run this PowerShell script in the project root to perform the entire reorganization automatically without losing any work:

```powershell
# ========================================================
# UFC GYM — AUTOMATED REORGANIZATION SCRIPT (POWERSHELL)
# ========================================================

Write-Host "Creating organized directory structure..." -ForegroundColor Cyan

# 1. Create target directories
New-Item -ItemType Directory -Force -Path "scripts\database"
New-Item -ItemType Directory -Force -Path "scripts\maintenance"
New-Item -ItemType Directory -Force -Path "scripts\archive"
New-Item -ItemType Directory -Force -Path "docs\architecture"
New-Item -ItemType Directory -Force -Path "docs\deployment"
New-Item -ItemType Directory -Force -Path "docs\features"
New-Item -ItemType Directory -Force -Path "docs\prompts"
New-Item -ItemType Directory -Force -Path "docs\references"
New-Item -ItemType Directory -Force -Path "public\images\gym"
New-Item -ItemType Directory -Force -Path "mobile\scripts"

Write-Host "Cleaning up corrupt and temporary files..." -ForegroundColor Yellow

# 2. Delete corrupt and junk files
Remove-Item -Force -ErrorAction SilentlyContinue "prisma.`$disconnect())"
Remove-Item -Force -ErrorAction SilentlyContinue "capitalio.json"
Remove-Item -Force -ErrorAction SilentlyContinue "suspicious_hyphens.txt"
Remove-Item -Force -ErrorAction SilentlyContinue "server.log"
Remove-Item -Force -ErrorAction SilentlyContinue "index.css"
Remove-Item -Force -ErrorAction SilentlyContinue "walkthroughmimt.md"
Remove-Item -Force -ErrorAction SilentlyContinue "implementation_plan5.md"
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "styles"
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "scratch"

Write-Host "Organizing scripts into scripts/ directory..." -ForegroundColor Cyan

# 3. Move database scripts
Move-Item -Force -ErrorAction SilentlyContinue "check-prisma.js" "scripts\database\"
Move-Item -Force -ErrorAction SilentlyContinue "test-prisma.js" "scripts\database\"
Move-Item -Force -ErrorAction SilentlyContinue "test-prisma2.js" "scripts\database\"
Move-Item -Force -ErrorAction SilentlyContinue "seed-video-highlights.js" "scripts\database\"

# 4. Move maintenance scripts
Move-Item -Force -ErrorAction SilentlyContinue "audit.js" "scripts\maintenance\"
Move-Item -Force -ErrorAction SilentlyContinue "cleanup.js" "scripts\maintenance\"
Move-Item -Force -ErrorAction SilentlyContinue "download_exercises.js" "scripts\maintenance\"
Move-Item -Force -ErrorAction SilentlyContinue "update-schema.js" "scripts\maintenance\"

# 5. Move archive/patch scripts
Move-Item -Force -ErrorAction SilentlyContinue "clean_dashboard.js" "scripts\archive\"
Move-Item -Force -ErrorAction SilentlyContinue "clean_motion.js" "scripts\archive\"
Move-Item -Force -ErrorAction SilentlyContinue "create-oauth-routes.js" "scripts\archive\"
Move-Item -Force -ErrorAction SilentlyContinue "find-auth.js" "scripts\archive\"
Move-Item -Force -ErrorAction SilentlyContinue "find-login.js" "scripts\archive\"
Move-Item -Force -ErrorAction SilentlyContinue "find-usages.js" "scripts\archive\"
Move-Item -Force -ErrorAction SilentlyContinue "fix-auth-typo.py" "scripts\archive\"
Move-Item -Force -ErrorAction SilentlyContinue "fix-auth.js" "scripts\archive\"
Move-Item -Force -ErrorAction SilentlyContinue "fix-types.js" "scripts\archive\"
Move-Item -Force -ErrorAction SilentlyContinue "fix*.js" "scripts\archive\"
Move-Item -Force -ErrorAction SilentlyContinue "fix*.py" "scripts\archive\"
Move-Item -Force -ErrorAction SilentlyContinue "update-auth.js" "scripts\archive\"
Move-Item -Force -ErrorAction SilentlyContinue "update-signup.js" "scripts\archive\"
Move-Item -Force -ErrorAction SilentlyContinue "update-ui.js" "scripts\archive\"
Move-Item -Force -ErrorAction SilentlyContinue "view-*.js" "scripts\archive\"

Write-Host "Consolidating documentation into docs/ directory..." -ForegroundColor Cyan

# 6. Move documentation files
Move-Item -Force -ErrorAction SilentlyContinue "production_deployment_guide.md" "docs\deployment\"
Move-Item -Force -ErrorAction SilentlyContinue "production_deployment_guide.pdf" "docs\deployment\"

if (Test-Path "reference md files") {
    Move-Item -Force -ErrorAction SilentlyContinue "reference md files\DEPLOYMENT_CHECKLIST.md" "docs\deployment\"
    Move-Item -Force -ErrorAction SilentlyContinue "reference md files\ARCHITECTURE_REFERENCE.md" "docs\architecture\"
    Move-Item -Force -ErrorAction SilentlyContinue "reference md files\GSAP_*.md" "docs\architecture\"
    Move-Item -Force -ErrorAction SilentlyContinue "reference md files\SCROLL_*.md" "docs\architecture\"
    Move-Item -Force -ErrorAction SilentlyContinue "reference md files\FEATURE_CHECKLIST.md" "docs\features\"
    Move-Item -Force -ErrorAction SilentlyContinue "reference md files\PREMIUM_FEATURES*.md" "docs\features\"
    Move-Item -Force -ErrorAction SilentlyContinue "reference md files\ANIMATION_*.md" "docs\features\"
    Move-Item -Force -ErrorAction SilentlyContinue "reference md files\*.md" "docs\references\"
    Remove-Item -Recurse -Force "reference md files"
}

if (Test-Path ".claude.md") {
    Move-Item -Force -ErrorAction SilentlyContinue ".claude.md\*.md" "docs\prompts\"
    Remove-Item -Recurse -Force ".claude.md"
}

Write-Host "Relocating media from features/ to public/images/gym/..." -ForegroundColor Cyan

# 7. Move images from features/ to public/images/gym/
if (Test-Path "features") {
    Get-ChildItem -Path "features" -Filter "*.jpeg" | ForEach-Object -Begin { $i = 1 } -Process {
        $newName = "gym-facility-$i.jpeg"
        Move-Item -Force -Path $_.FullName -Destination "public\images\gym\$newName"
        $i++
    }
    Remove-Item -Recurse -Force "features"
}

Write-Host "Organizing mobile scripts..." -ForegroundColor Cyan

# 8. Mobile scripts cleanup
Move-Item -Force -ErrorAction SilentlyContinue "mobile\check.js" "mobile\scripts\"
Move-Item -Force -ErrorAction SilentlyContinue "mobile\make_splash.py" "mobile\scripts\"
Move-Item -Force -ErrorAction SilentlyContinue "mobile\resize-icon.js" "mobile\scripts\"

Write-Host "Reorganization complete! Repository is now industry-standard and production ready." -ForegroundColor Green
```

---

## 9. Verification & Health Check

After applying the reorganization, verify the environment with these steps:

1. **Verify Web Build:**
   ```bash
   npm run build
   ```
   *Expected result:* Prisma Client generates successfully and Next.js compiles all routes without missing import errors.

2. **Verify Web Development Server:**
   ```bash
   npm run dev
   ```
   *Expected result:* Ready on `http://localhost:3333`.

3. **Verify Mobile Server:**
   ```bash
   npm run dev:mobile
   ```
   *Expected result:* Expo Metro bundler initializes with clear QR code.

4. **Verify Git Status:**
   ```bash
   git status
   ```
   *Expected result:* Clean root directory without stray temporary logs, zip files, or one-off scripts.
