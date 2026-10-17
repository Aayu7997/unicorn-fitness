# Unicorn Fitness Club — Premium Website Overhaul

Complete audit and upgrade plan to transform the site from "good" to **award-winning premium**. Covers scroll animations, UI/UX polish, micro-interactions, environment configuration, and deployment best practices.

---

## Current State Assessment

### ✅ What's Already Good
- GSAP + ScrollTrigger infrastructure exists with pinned hero, horizontal scroll, parallax, depth-section
- Framer Motion used for stagger/reveal animations
- Dark/light theme support via `next-themes`
- Prisma + Neon serverless PostgreSQL backend
- Cloudinary media pipeline
- Tailwind CSS v4 + ShadCN component library

### ⚠️ Critical Issues Found

| Issue | File | Impact |
|-------|------|--------|
| `ignoreBuildErrors: true` in Next.js config | [next.config.mjs](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/next.config.mjs) | Hides TypeScript bugs, will bite in production |
| `images: { unoptimized: true }` | [next.config.mjs](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/next.config.mjs) | All images served uncompressed (massive LCP hit) |
| Broken Lenis → GSAP sync | [smooth-scroll.ts](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/lib/smooth-scroll.ts) | Uses `gsap.ScrollTrigger` (doesn't exist on gsap object) — smooth scroll likely broken |
| `FadeSection` ignores `className` prop | [fade-section.tsx](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/components/fade-section.tsx) | Passed `className` from `page.tsx` is silently dropped |
| Duplicate `globals.css` files | [app/globals.css](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/app/globals.css) + [styles/globals.css](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/styles/globals.css) | Conflicting CSS variables; only `app/globals.css` is imported |
| `@studio-freight/lenis` deprecated | [package.json](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/package.json#L51) | Should be `lenis` (standalone package) |
| Native `<img>` tags instead of `<Image>` | [page.tsx](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/app/page.tsx), [hero-pinned.tsx](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/components/hero-pinned.tsx) | No lazy loading, no responsive srcset, no WebP |
| No SEO meta tags on sub-pages | Various route `page.tsx` files | Poor Google indexing |
| No security headers | [next.config.mjs](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/next.config.mjs) | Missing CSP, HSTS, X-Frame-Options |
| GSAP registered multiple times | [lib/gsap.ts](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/lib/gsap.ts) + [lib/animations.ts](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/lib/animations.ts) + [advanced-scroll-animations.tsx](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/components/advanced-scroll-animations.tsx) | Race conditions, memory leaks |

---

## User Review Required

> [!IMPORTANT]
> **Image Optimization**: Enabling Next.js Image optimization (`unoptimized: false`) requires a deployment target that supports it (Vercel does natively). If you're deploying elsewhere (e.g., static export to Netlify), we need a different approach. **Where are you deploying?**

> [!WARNING]
> **TypeScript Errors**: Removing `ignoreBuildErrors: true` will likely surface existing type errors that need fixing before the build succeeds. This is a one-time investment that prevents runtime crashes. Are you okay with spending time fixing these?

> [!IMPORTANT]
> **GSAP License**: GSAP v3 is free for standard websites but requires a paid license for SaaS/client work. The current usage is fine for a gym website. Just confirming this is a direct business website and not a white-label product.

---

## Open Questions

> [!IMPORTANT]
> 1. **Do you have a hero video** (MP4/WebM, 10-20 seconds of gym footage)? A cinematic video background hero is the single biggest visual upgrade. If not, I'll design a stunning image-based hero with particle effects instead.
> 2. **Vercel deployment** — Are you using Vercel? This affects image optimization, edge middleware, and analytics config.
> 3. **Custom domain** — Do you have a domain like `unicornfitness.in`? Needed for proper Resend email verification and SEO canonical URLs.
> 4. **Budget for GSAP premium plugins** — ScrollSmoother, SplitText, and MorphSVG are paid GSAP Club plugins that create jaw-dropping effects. Free alternatives exist but are less polished. Want to stay 100% free?

---

## Proposed Changes

### Phase 1: Environment & Configuration Hardening

Critical fixes that must happen before any visual work.

---

#### [MODIFY] [next.config.mjs](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/next.config.mjs)

**What changes:**
- Remove `ignoreBuildErrors: true` (fix TS errors instead of hiding them)
- Remove `images: { unoptimized: true }` → enable proper Next.js Image optimization
- Add Cloudinary to `images.remotePatterns` for optimized CMS images
- Add security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy)
- Add `poweredByHeader: false` to remove `X-Powered-By: Next.js`

```js
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  poweredByHeader: false,
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=()' },
      ],
    }]
  },
}
```

#### [MODIFY] [.env.local.example](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/.env.local.example)

**What changes:**
- Add `NEXT_PUBLIC_SITE_URL` for canonical URLs and OG images
- Add `NEXT_PUBLIC_GA_ID` for Google Analytics (optional)
- Add `JWT_SECRET` for session security (currently missing — sessions may be insecure)
- Document each variable with setup links

#### [DELETE] [styles/globals.css](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/styles/globals.css)

**Why:** This duplicate file defines different accent colors (`oklch(0.97 0 0)` — nearly white, vs the correct gold accent in `app/globals.css`). It's never imported but creates confusion. Delete it.

---

### Phase 2: Scroll Animation Engine Overhaul

The core scroll experience — this is where the "premium feel" lives.

---

#### [MODIFY] [lib/smooth-scroll.ts](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/lib/smooth-scroll.ts)

**What changes — Fix the broken Lenis ↔ GSAP sync:**

The current code tries `gsap.ScrollTrigger` which doesn't exist. The proper pattern is:

```ts
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'

export function initSmoothScroll() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 2,
  })

  // ✅ Correct sync: Lenis drives the RAF loop, GSAP piggybacks on it
  lenis.on('scroll', ScrollTrigger.update)

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0) // prevent GSAP from throttling

  return lenis
}
```

#### [MODIFY] [lib/gsap.ts](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/lib/gsap.ts)

**What changes:**
- Remove `ScrollTrigger.normalizeScroll(true)` — conflicts with Lenis
- Make this the **single source** of GSAP initialization (remove duplicate registrations in `animations.ts` and `advanced-scroll-animations.tsx`)
- Export a `useGSAP` hook that properly initializes and cleans up

#### [NEW] components/scroll-progress.tsx

**What:** A thin gradient progress bar at the top of the page that fills as user scrolls. Uses GSAP scrub for buttery-smooth progress. Apple.com uses this exact pattern.

#### [MODIFY] [components/fade-section.tsx](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/components/fade-section.tsx)

**Bug fix:** The component accepts `className` as a prop (from `page.tsx`) but never applies it to the DOM element. Fix:

```tsx
export function FadeSection({ children, delay = 0, className = '' }: FadeSectionProps) {
  // ...
  return <section ref={ref} className={className}>{children}</section>
}
```

#### [MODIFY] [components/horizontal-scroll.tsx](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/components/horizontal-scroll.tsx)

**Upgrade:** Currently panels are plain text on black. Upgrade to:
- Full-bleed background images per panel (gym photos)
- Overlay text with clip-path reveal as panel scrolls in
- Scale-down effect on exit
- Progress dots indicator

#### [MODIFY] [components/depth-section.tsx](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/components/depth-section.tsx)

**Upgrade:** Add per-word color transitions as items animate in. Add a subtle glow/shadow behind each word that pulses.

---

### Phase 3: Premium Hero & Page Transitions

The hero section and page transitions define first impressions.

---

#### [MODIFY] [components/hero-pinned.tsx](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/components/hero-pinned.tsx)

**Complete rewrite for cinematic feel:**
- **Video or animated gradient background** (fallback if no video provided)
- **Character-by-character text reveal** using GSAP stagger for the headline
- **Floating particle/dust effect** using CSS keyframes for atmosphere
- **Scroll-driven zoom** — background zooms as user scrolls, creating depth
- **Animated down-arrow indicator** that bounces and fades on scroll
- Replace `<img>` with `<Image>` for the logo
- Add subtle scanline/grain overlay for cinematic texture

#### [NEW] components/page-transition-wrapper.tsx

**What:** A wrapper using Framer Motion `AnimatePresence` + `motion.div` that handles route transitions with a smooth slide+fade effect. Wraps the layout children.

#### [NEW] components/loading-screen.tsx

**What:** A premium loading screen with the Unicorn logo that plays on first visit — logo scale animation → text reveal → curtain wipe to content. Sets a sessionStorage flag so it only plays once per session.

---

### Phase 4: Micro-Interactions & Premium UI Polish

The small details that separate "nice" from "wow."

---

#### [NEW] components/custom-cursor.tsx

**What:** A custom cursor with:
- Default: small dot with a larger trailing circle (spring physics)
- On hover over links/buttons: circle expands and gets a subtle blend-mode
- On hover over images: "View" text appears inside the cursor
- Desktop-only (hidden on touch devices)

#### [MODIFY] [components/magnetic-button.tsx](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/components/magnetic-button.tsx)

**Fix:** Currently declares `Component = href ? 'a' : 'button'` but never uses it (always renders `motion.button`). Fix to properly render as an anchor when `href` is provided. Add a ripple effect on click.

#### [NEW] components/text-marquee.tsx

**What:** A scroll-velocity-driven text marquee (like many modern award-winning sites). As user scrolls faster, the text scrolls faster. Shows taglines like "TRANSFORM • STRENGTH • POWER • UNICORN FITNESS •" in a continuous loop.

#### [MODIFY] [components/header.tsx](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/components/header.tsx)

**Upgrades:**
- **Scroll-aware navbar**: transparent at top → glassmorphic blur on scroll
- **Active link indicator** with animated underline
- **Hide on scroll down, show on scroll up** (smart navbar)
- Add `aria-current="page"` for accessibility
- Mobile menu: full-screen overlay with staggered link animations instead of simple dropdown

#### [MODIFY] [components/stats-counter.tsx](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/components/stats-counter.tsx)

**Upgrades:**
- Add animated circular progress rings behind each stat
- Odometer-style digit flip animation instead of simple counter
- Add subtle gradient glow behind the numbers

#### [MODIFY] [components/pricing-section.tsx](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/components/pricing-section.tsx)

**Upgrades:**
- Add 3D tilt effect on card hover
- Glassmorphic card backgrounds with gradient borders
- Animated highlight beam that sweeps across the popular card
- "Most Popular" badge with shimmer animation

#### [MODIFY] [components/team-section.tsx](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/components/team-section.tsx)

**Upgrades:**
- Card flip animation on hover (front: photo, back: bio)
- Social icons slide in from bottom on hover
- Add gradient border animation

#### [MODIFY] [components/footer.tsx](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/components/footer.tsx)

**Upgrades:**
- Animated gradient mesh background
- Map embed or stylized location marker
- Newsletter signup with animated success state
- Update copyright year to dynamic `new Date().getFullYear()`

---

### Phase 5: Typography & Design System Upgrade

---

#### [MODIFY] [app/layout.tsx](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/app/layout.tsx)

**What changes:**
- Replace `Geist` with a more premium font pairing: **Inter** (body) + **Sora** (headings) from Google Fonts
- Add comprehensive SEO metadata (OpenGraph, Twitter card, structured data)
- Add the custom cursor wrapper and page transition wrapper here
- Add scroll progress bar here (global)

#### [MODIFY] [app/globals.css](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/app/globals.css)

**What changes:**
- Refine the color palette:
  - Dark mode: deeper blacks with subtle blue tint (`oklch(0.08 0.01 260)`) for premium feel
  - Accent: richer warm gold gradient (not flat orange)
  - Add `--accent-glow` variable for box-shadow/glow effects
- Add new utility classes:
  - `.text-gradient` — animated gradient text
  - `.glow-accent` — accent-colored glow shadow
  - `.noise-overlay` — CSS noise texture for sections
  - `.shimmer` — loading shimmer animation
- Add `@keyframes` for:
  - `float` — gentle floating motion
  - `shimmer` — premium shimmer sweep
  - `grain` — film grain texture
  - `pulse-glow` — accent glow pulse
- Improve `selection` styling with accent color

---

### Phase 6: SEO, Performance & Deployment

---

#### [MODIFY] All sub-page `page.tsx` files (about, programs, memberships, gallery, etc.)

**What changes:**
- Add proper `export const metadata: Metadata` with unique titles, descriptions, and OpenGraph
- Use Next.js `<Image>` component everywhere
- Add structured data (JSON-LD) for LocalBusiness schema

#### [NEW] app/sitemap.ts

**What:** Auto-generated sitemap for Google indexing.

#### [NEW] app/robots.ts

**What:** Proper robots.txt that allows indexing.

#### [MODIFY] [package.json](file:///c:/Users/ayush/Downloads/Projects/gym-main/gym-main/package.json)

**What changes:**
- Replace `@studio-freight/lenis` → `lenis` (modern package)
- Add `@next/bundle-analyzer` for build analysis
- Add `sharp` for image optimization in production

---

## Environment Setup Guide

Here's exactly what you need to configure for the **best** setup:

### 1. Create `.env.local` from the example

```bash
cp .env.local.example .env.local
```

### 2. Required Environment Variables

| Variable | Where to Get | Why |
|----------|-------------|-----|
| `DATABASE_URL` | [neon.tech](https://neon.tech) → Create Project → Connection String | PostgreSQL database |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | [cloudinary.com](https://cloudinary.com) → Dashboard | Image hosting & CDN |
| `CLOUDINARY_API_KEY` | Cloudinary Dashboard → API Keys | Server-side upload signing |
| `CLOUDINARY_API_SECRET` | Cloudinary Dashboard → API Keys | Server-side upload signing |
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys | Contact form email delivery |
| `NEXT_PUBLIC_SITE_URL` | Your domain (e.g., `https://unicornfitness.in`) | Canonical URLs, OG images |

### 3. Database Setup (One-time)

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Neon database
npx prisma migrate dev --name init

# Seed with initial data (trainers, plans, FAQs, admin user)
npx tsx prisma/seed.ts
```

### 4. Cloudinary Setup

1. Create free account at [cloudinary.com](https://cloudinary.com)
2. Enable **unsigned uploads** in Settings → Upload → Upload presets
3. Create an upload preset named `unicorn_fitness` with:
   - Folder: `unicorn-fitness`
   - Allowed formats: `jpg, png, webp, avif`
   - Max file size: 10MB
   - Auto quality: `auto:good`
   - Auto format: enabled

### 5. Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Project Settings → Environment Variables → Add all from .env.local
```

> [!TIP]
> **Vercel auto-configures** image optimization, edge caching, and serverless functions. Zero configuration needed for these on Vercel.

### 6. Optional: Google Analytics

Add `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX` to `.env.local` after setting up a GA4 property at [analytics.google.com](https://analytics.google.com).

### 7. Optional: Custom Domain

In Vercel dashboard: Settings → Domains → Add `unicornfitness.in`. Update your DNS with the provided CNAME/A records.

---

## Verification Plan

### Automated Tests
- `npm run build` — must succeed with zero TypeScript errors (after removing `ignoreBuildErrors`)
- Lighthouse audit via browser DevTools → target **90+ on all 4 categories** (Performance, Accessibility, Best Practices, SEO)
- `npx @next/bundle-analyzer` — verify no oversized bundles

### Manual Verification
- **Scroll test**: Smooth Lenis scrolling with GSAP animations triggering correctly
- **Mobile test**: All animations disabled or reduced for `prefers-reduced-motion`
- **Dark/Light mode**: Toggle works smoothly, all sections readable in both modes
- **Browser test**: Chrome, Firefox, Safari, Edge — scroll animations work consistently
- **Performance**: First Contentful Paint < 1.5s, Largest Contentful Paint < 2.5s
- **CMS test**: Admin panel at `/admin` can update all content and images

### Browser Recording
- Record a full-page scroll-through in both dark and light modes to demonstrate all animation improvements
