# 🦄 Unicorn Fitness Club (UFC GYM) — Full-Stack Platform

<div align="center">

![Next.js 16](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js&logoColor=white)
![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-SDK_52-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.8-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Neon PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=black)
![CodeRabbit](https://img.shields.io/badge/CodeRabbit-AI_Review-FF5C00?style=for-the-badge&logo=coderabbit&logoColor=white)

**An ultra-premium, full-stack fitness management ecosystem featuring an interactive Next.js 16 Web Application, a native Expo Mobile App (iOS & Android), AI-powered health insights, and an enterprise Admin CRM.**

[Features](#-key-features) • [Tech Stack](#-technology-stack) • [Quick Start](#-quick-start) • [Architecture](#-project-architecture) • [Testing & CI/CD](#-testing--cicd-pipeline) • [CodeRabbit AI](#-coderabbit-ai-integration) • [Deployment](#-deployment)

</div>

---

## 🌟 Key Features

### 🌐 Web Application (Next.js 16 App Router)
- **Cinematic Marketing Landing**: Smooth Lenis scroll, GSAP timeline animations, 3D card tilt, dynamic video backgrounds, and interactive class schedules.
- **Member Dashboard**: Real-time workout progress tracking, BMI calculator, attendance logs, personal diet charts, and digital invoice downloads (PDF).
- **Admin Enterprise Portal**: Complete gym CRM with member lifecycle tracking, trainer allocations, class booking management, expense tracking, invoice generation, and revenue analytics.
- **AI Health Assistant**: Integrated with Groq & Google GenAI for personalized fitness plans, automated member outreach promos, and diet recommendations.
- **Authentication & Security**: Multi-tier NextAuth & Jose JWT session management, RBAC (Admin vs. Member), 2FA security, and rate limiting.

### 📱 Mobile Application (Expo SDK 52 / React Native)
- **Universal Mobile Experience**: Native iOS & Android support built with Expo Router.
- **NativeWind Styling**: Tailwind CSS utilities for fluid 60fps animations and dark/light themes.
- **Member & Admin Portals**: Seamless mobile access to QR attendance, booking slots, workout timers, push notifications, and biometric verification.

---

## 🛠️ Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Web Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Radix UI |
| **Motion & Audio** | GSAP 3, Lenis Scroll, Framer Motion, WebGL Liquid effects |
| **Mobile App** | Expo SDK 52, React Native 0.76, Expo Router, NativeWind |
| **Database & ORM** | PostgreSQL (Neon Serverless), Prisma ORM 7.8, `@prisma/adapter-neon` |
| **Authentication** | NextAuth.js, Jose JWT, BcryptJS, Cookie-based Sessions |
| **AI & Automation** | Groq SDK (Llama 3.3), Google GenAI, Resend Email API, Cloudinary CDN |
| **Quality & CI/CD** | GitHub Actions, CodeRabbit AI, TypeScript strict typecheck |
| **Hosting** | Vercel (Web / Serverless), Cloudflare (Edge DNS, WAF, SSL), EAS (Mobile) |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: `v20.x` or later
- **npm**: `v10.x` or later
- **Neon Postgres**: Active PostgreSQL database URL

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/your-username/ufc-gym.git
cd ufc-gym

# Install root & web dependencies
npm install

# Install mobile dependencies
cd mobile && npm install && cd ..
```

### 2. Environment Setup
Copy the environment variables template and fill in your credentials:
```bash
cp .env.local.example .env.local
```
*(Refer to [`.env.local.example`](file:///c:/Users/ayush/Downloads/Projects/UFC%20GYM/.env.local.example) for setup guides for Neon, Cloudinary, Resend, and NextAuth).*

### 3. Database Initialization
```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed demo data (classes, trainers, admin account)
npm run db:seed
```

### 4. Running the Development Servers

```bash
# Start Web Application (http://localhost:3333)
npm run dev

# Start Mobile Application (Expo Metro Bundler)
npm run dev:mobile

# Launch Mobile on Android Emulator
npm run mobile:android

# Launch Mobile on iOS Simulator (macOS only)
npm run mobile:ios

# Open Database GUI (Prisma Studio)
npm run db:studio
```

---

## 📐 Project Architecture

```
UFC GYM/
├── .github/                          # CI/CD Workflows & Pull Request Templates
├── app/                              # Next.js 16 Web Application (App Router)
│   ├── admin/                        # Admin Portal (CRM, Invoices, Staff, Analytics)
│   ├── api/                          # Serverless REST & Action APIs
│   ├── dashboard/                    # Member Portal (Workouts, Diet, Progress)
│   ├── globals.css                   # Master Tailwind styles & design tokens
│   └── layout.tsx                    # Root HTML layout with context providers
├── components/                       # Shared UI Components (UI, Icons, Providers)
├── docs/                             # 📚 Master Documentation Portal
│   ├── architecture/                 # System architecture, GSAP & scroll guides
│   ├── deployment/                   # Vercel, Cloudflare, Domain & SSL guides
│   ├── features/                     # Feature matrices & checklists
│   └── prompts/                      # Design system specifications & prompts
├── hooks/                            # Custom React hooks
├── lib/                              # Shared server libraries (Prisma, Auth, AI)
├── mobile/                           # 📱 Expo / React Native Mobile Application
│   ├── assets/                       # Mobile icons and splash media
│   ├── scripts/                      # Mobile build and icon scripts
│   └── src/                          # Mobile App source (Expo Router, tabs)
├── prisma/                           # Database ORM schema & seed scripts
├── public/                           # Static assets served at root /
│   ├── icons/                        # Web favicons & PWA icons
│   └── images/gym/                   # Gym facility and equipment images
├── scripts/                          # 🛠️ Organized Developer Tooling
│   ├── database/                     # DB checks and test scripts
│   ├── maintenance/                  # Cleanups and data ingestion
│   └── archive/                      # Historical patch & fix scripts
├── .coderabbit.yaml                  # CodeRabbit AI code review configuration
├── .gitignore                        # Universal multi-platform ignore rules
├── .vercelignore                     # Vercel deployment payload filter
└── package.json                      # Master workspace scripts & dependencies
```

---

## 🧪 Testing & CI/CD Pipeline

This project includes automated testing via **GitHub Actions** located at [`.github/workflows/ci.yml`](file:///c:/Users/ayush/Downloads/Projects/UFC%20GYM/.github/workflows/ci.yml).

Every Pull Request and commit triggers:
1. **Prisma Schema Validation**: Generates type-safe database clients without drift.
2. **TypeScript Strict Typecheck**: Validates both Web (`npm run typecheck`) and Mobile (`mobile/src`).
3. **Production Build Compilation**: Ensures Next.js compiles all static and dynamic pages with 0 errors.

To run tests locally:
```bash
# Typecheck Web codebase
npm run typecheck

# Typecheck Mobile codebase
cd mobile && npx tsc --noEmit && cd ..

# Compile full production build
npm run build
```

---

## 🤖 CodeRabbit AI Integration

This repository is configured with **CodeRabbit AI** ([`.coderabbit.yaml`](file:///c:/Users/ayush/Downloads/Projects/UFC%20GYM/.coderabbit.yaml)) for automated pull request reviews:

- **Security Audits**: Verifies API route authentication, RBAC checks, and rate limiting.
- **Architectural Checks**: Enforces proper Next.js 16 Server Component boundaries and Prisma connection pooling.
- **Performance Profiling**: Catches memory leaks, unnecessary re-renders, and mobile animation jank.
- **Automated PR Summaries**: Generates high-level summaries, sequence diagrams, and interactive walkthroughs on every PR.

### Enabling CodeRabbit:
1. Install the [CodeRabbit GitHub App](https://github.com/marketplace/coderabbitai).
2. Grant access to your repository.
3. Every new Pull Request will be automatically reviewed based on `.coderabbit.yaml`.

---

## 🌐 Deployment

### Vercel (Web Platform)
1. Push this repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Set the **Root Directory** to `./`.
4. Add your production environment variables from `.env.local.example`.
5. Deploy! Vercel automatically utilizes `.vercelignore` to bypass `mobile/` and `docs/`, keeping build times under 45 seconds.

### Cloudflare (DNS & Edge Security)
1. In Cloudflare DNS, point an **A Record** (`@`) to `76.76.21.21` (Vercel IP) and a **CNAME** (`www`) to `cname.vercel-dns.com`.
2. Set SSL/TLS Encryption Mode to **Full (Strict)** to prevent redirect loops.
3. For full Cloudflare edge caching rules and domain setup, see [docs/deployment/PRODUCTION_DEPLOYMENT_GUIDE.md](file:///c:/Users/ayush/Downloads/Projects/UFC%20GYM/docs/deployment/PRODUCTION_DEPLOYMENT_GUIDE.md).

---

## 📄 License & Maintainers
- **Organization**: Unicorn Fitness Club (UFC GYM)
- **Lead Developer**: Senior Full-Stack Engineering Team
- **License**: Private & Proprietary
