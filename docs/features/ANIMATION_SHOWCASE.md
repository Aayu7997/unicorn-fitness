# Elite Gym - Animation Showcase & Reference Guide

A visual reference guide showing all cinematic animations implemented in the website.

---

## Animation Types by Section

### 🎯 HERO SECTION

```
┌─────────────────────────────────────┐
│  [Orb 1 - Animated Loop 12s]        │
│          ○                           │
│                                       │
│  ELEVATE YOUR POTENTIAL              │  ← Split text reveal
│  ─────────────────                   │     (30ms stagger)
│                                       │
│  Transform your body and mind...     │  ← Fade-in subtitle
│                                       │
│  [Start Your Journey] [Schedule Tour]│  ← Magnetic buttons
│                                       │
│       ↓ ↓ ↓                          │  ← Pulsing scroll indicator
└─────────────────────────────────────┘
```

**Animations:**
- Gradient orbs floating (12s infinite)
- Text character reveals (30ms each)
- Underline scale-in (600ms)
- Button magnetic tracking
- Scroll pulse (2s loop)

---

### 📊 STATS SECTION

```
┌──────────┬──────────┬──────────┬──────────┐
│   15K    │    50    │   99%    │  24/7    │  ← Counters animate
│ Members  │ Trainers │ Satisfied│ Support  │
│                                           │
│ (Stagger 100ms, Scale 0.95→1.0)         │
└──────────┴──────────┴──────────┴──────────┘

Animation Timeline:
Item 1: 0ms   ▓░░░░░░░░░  (enter)
Item 2: 100ms  ░▓░░░░░░░░  (cascade)
Item 3: 200ms  ░░▓░░░░░░░  (cascade)
Item 4: 300ms  ░░░▓░░░░░░  (cascade)
```

**Animations:**
- Stagger reveal (100ms cascade)
- Scale grow (0.95 → 1.0)
- Number counter (0 → value)
- Background fade-in

---

### 📖 ABOUT SECTION

```
┌─────────────────────────┬──────────────────────┐
│                         │    ┌──────────────┐  │
│ BUILT FOR CHAMPIONS     │    │              │  │
│ ─────────────────       │    │  [Glowing]   │  │
│                         │    │  [Floating]  │  │
│ Since 2015, we've...    │    │  Elements    │  │
│ Elite Gym combines...   │    │              │  │
│                         │    └──────────────┘  │
│ Learn Our Story →       │                      │
└─────────────────────────┴──────────────────────┘

Left (x: -80 → 0):           Right (x: 80 → 0):
Parallax 900ms               Parallax 900ms
ease: back.out(1.7)          scale: 0.95→1.0
```

**Animations:**
- Parallax entrance (900ms)
- Scale reveal
- Pulsing glow background (4s)
- Link hover translate
- Inner float animation (6s loop)

---

### 🏋️ PROGRAMS SECTION

```
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│  Program 1     │ │  Program 2     │ │  Program 3     │
│  [Image]       │ │  [Image]       │ │  [Image]       │
│  ────────────  │ │  ────────────  │ │  ────────────  │
│  Strength...   │ │  CrossFit...   │ │  HIIT...       │
│  Learn More →  │ │  Learn More →  │ │  Learn More →  │
└────────────────┘ └────────────────┘ └────────────────┘

Cascade Timing (150ms stagger):
Card 1: y: 60→0, scale: 0.9→1, blur: 10→0  |████
Card 2: y: 60→0, scale: 0.9→1, blur: 10→0      |████
Card 3: y: 60→0, scale: 0.9→1, blur: 10→0          |████
```

**Animations:**
- Stagger reveal (150ms)
- Scale 0.9 → 1.0
- Blur 10px → 0px
- Image zoom on hover (110%)
- Border color transition

---

### ✨ FEATURES SHOWCASE (NEW)

```
┌──────────────┬──────────────┬──────────────┐
│  ⚡ Zap      │  🛡️ Shield   │  👥 Users    │
│  Advanced    │  Safety      │  Community   │
│  Training    │  First       │  Vibes       │
│              │              │              │
│  Icon rotate │  Icon rotate │  Icon rotate │
│  6° on hover │  6° on hover │  6° on hover │
└──────────────┴──────────────┴──────────────┘

Stagger Pattern (120ms):
═══════════════════════════════════
Card 1 (120ms)    ▓░░░░░░░░░░░░
Card 2 (240ms)      ▓░░░░░░░░░░
Card 3 (360ms)        ▓░░░░░░░░
Card 4 (480ms)          ▓░░░░░░
Card 5 (600ms)            ▓░░░░
Card 6 (720ms)              ▓░░░
```

**Animations:**
- Stagger reveals (120ms)
- Icon scale + rotate on hover
- Gradient underline reveal
- Card border color change
- Background orb float

---

### 🔄 TRANSFORMATION SHOWCASE (NEW)

```
┌─────────────────────────────────────┐
│  [Before/After Image - Zoom Effect] │  1.5x scale parallax
│  ┌─────────────────────────────────┐│
│  │  500+ Success Stories            ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘

Below:
┌──────────────┬──────────────┬──────────────┐
│ Sarah Chen   │ Marcus J.    │ Alex R.      │
│ -45 lbs      │ -8% BF       │ Marathon     │
│ 6 months     │ 4 months     │ 12 weeks     │
│ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │
│ │ gradient │ │ │ gradient │ │ │ gradient │ │
│ │ underline│ │ │ underline│ │ │ underline│ │
│ └──────────┘ │ └──────────┘ │ └──────────┘ │
└──────────────┴──────────────┴──────────────┘

Hover Effect:
Before: Overlay opacity: 0
Hover:  Overlay opacity: 0.5 (fade reveal)
```

**Animations:**
- Image zoom parallax
- Overlay fade on hover
- Card stagger (150ms)
- Gradient underline reveal
- Button scale animation

---

### 🎥 VIDEO SHOWCASE (NEW)

```
┌──────────────────────────────┐
│  [Main Video Feature]        │
│  ┌─────────────────────────┐ │
│  │                         │ │
│  │     ●  ╱  ▶             │ │  Play button scales
│  │       ╱                 │ │  0.9 → 1.1 on hover
│  │                         │ │
│  │  Premium Workout Collect│ │
│  └─────────────────────────┘ │
└──────────────────────────────┘

Below (3 video cards):
┌──────────────┬──────────────┬──────────────┐
│   45 min     │   30 min     │   60 min     │
│   Full Body  │ HIIT Cardio  │ Yoga Flex    │
│ ▶ Advanced   │ ▶ Intermediate│ ▶ Beginner  │
└──────────────┴──────────────┴──────────────┘

Animations: Stagger 150ms, play icons rotate on hover
```

**Animations:**
- Main section scale reveal
- Play button scale animation
- Image zoom on hover
- Level badge fade-in
- Card stagger (150ms)

---

### ⭐⭐⭐ TESTIMONIALS SECTION

```
┌──────────────┬──────────────┬──────────────┐
│  [Avatar]    │  [Avatar]    │  [Avatar]    │
│  ★★★★★      │  ★★★★★      │  ★★★★★      │
│  "Amazing    │  "Life       │  "Best       │
│   experience"│   changing"  │   gym ever"  │
│  Sarah Chen  │  Marcus J.   │  Elena R.    │
└──────────────┴──────────────┴──────────────┘

Blur Animation Timeline:
blur(20px)  ░░░░░░░░░░░░░░░░░░░░
blur(16px)  ░░░░░░░░░░░░░░░░░░
blur(12px)  ░░░░░░░░░░░░░░
blur(8px)   ░░░░░░░░░░░
blur(4px)   ░░░░░░░░
blur(0px)   ░░░░░  ← Final (crisp)
```

**Animations:**
- Blur reveal (20px → 0px)
- Stagger cascade (180ms)
- Image zoom on hover
- Border color transition
- Star rating display

---

### 💰 PRICING SECTION (NEW)

```
┌──────────────┐ ┌──────────────────┐ ┌──────────────┐
│  STARTER     │ │ ⭐ PROFESSIONAL  │ │  ELITE       │
│  $49/month   │ │    $99/month     │ │  $199/month  │
│              │ │ (Popular Badge   │ │              │
│  ✓ Feature 1 │ │  Pulsing 3s)     │ │  ✓ Feature 1 │
│  ✓ Feature 2 │ │                  │ │  ✓ Feature 2 │
│  ✓ Feature 3 │ │  ✓ Feature 1     │ │  ✓ Feature 3 │
│              │ │  ✓ Feature 2     │ │  ✓ Feature 4 │
│ [Get Started]│ │  ✓ Feature 3     │ │ [Claim VIP]  │
│              │ │                  │ │              │
│              │ │  [Start Trial]    │ │              │
└──────────────┘ └──────────────────┘ └──────────────┘
                (Scale: 1.05)

Popular Badge Pulse (3s loop):
y: 0px  ▲
y: -5px ║ ← Pulse up
y: -3px ║ ← Pulse down
y: 0px  ▼ ← Return
```

**Animations:**
- Card stagger reveals (150ms)
- Popular badge pulse (3s)
- Feature list stagger
- Button hover scale (1.05)
- Border color transitions

---

### 👥 TEAM SECTION (NEW)

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  [Avatar]    │  [Avatar]    │  [Avatar]    │  [Avatar]    │
│  Marcus      │  Sarah       │  David       │  Elena       │
│  Strength &  │  CrossFit &  │  Nutrition & │  Performance │
│  Conditioning│  Mobility    │  Lifestyle   │  Training    │
│  ─────────   │  ─────────   │  ─────────   │  ─────────   │
│  Cert. Info  │  Cert. Info  │  Cert. Info  │  Cert. Info  │
└──────────────┴──────────────┴──────────────┴──────────────┘

Stagger Pattern (120ms):
Card 1: ▓░░░░░░░░░  (scale: 0.9→1.0)
Card 2:   ▓░░░░░░░░  (scale: 0.9→1.0)
Card 3:     ▓░░░░░░░  (scale: 0.9→1.0)
Card 4:       ▓░░░░░░  (scale: 0.9→1.0)
```

**Animations:**
- Card stagger reveals (120ms)
- Avatar image hover scale
- Gradient underline reveal
- Text fade animations
- Background pulsing orb (20s)

---

### ❓ FAQ SECTION (NEW)

```
┌─────────────────────────────────────────┐
│ Q: How do I get started?            ▼ │  ← Chevron rotates
│                                         │
│ A: Getting started is easy! Schedule   │  ← Answer slides in
│    a free tour...                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Q: Do you offer personal training?  > │  ← Collapsed (0°)
└─────────────────────────────────────────┘

Chevron Rotation (300ms):
Collapsed: rotate(0°)  >
Opening:   rotate(90°) ┐
Open:      rotate(180°) ▼
```

**Animations:**
- Question stagger reveals (80ms)
- Chevron rotate on toggle (180°)
- Answer slide expand/collapse (300ms)
- Background color fade on hover
- Opacity transitions

---

### 🚀 FINAL CTA SECTION

```
┌────────────────────────────────────────┐
│  [Animated Rotating Gradient]          │  8s loop
│                                        │
│  YOUR TRANSFORMATION                   │  Text reveals
│  Starts Today                          │  with accent color
│                                        │
│  Join 15,000+ members...               │  Fade-in
│                                        │
│  [Claim Your Free Trial]               │  Magnetic button
│                                        │
│  (Blur 20px → 0px, Scale 0.92→1.0)   │
└────────────────────────────────────────┘

Background Animation (8s loop):
radial-gradient(at 0% 0%)        ●
     ↓
radial-gradient(at 100% 100%)       ●
     ↓
radial-gradient(at 0% 0%)        ●
```

**Animations:**
- Container blur reveal (1s)
- Rotating gradient background (8s)
- Heading stagger reveals
- Subtext fade-in (0.8s)
- Button scale animation
- Magnetic cursor tracking

---

## Global Animation Patterns

### Pattern 1: Stagger Cascade

```
Used in: Stats, Programs, Features, Testimonials, etc.

Timeline:
─────────────────────────────────────
0ms    ▓░░░░░░░░░░░░░░░░░░░░░░░ Item 1
100ms    ░░▓░░░░░░░░░░░░░░░░░░░░░ Item 2
200ms    ░░░░▓░░░░░░░░░░░░░░░░░░░ Item 3
300ms    ░░░░░░▓░░░░░░░░░░░░░░░░░ Item 4

Creates: Musical rhythm, engagement flow
```

### Pattern 2: Parallax Depth

```
Used in: About section, backgrounds

Scroll Position:  0%        25%        50%        75%       100%
Element Y-pos:    0px  ↓    -50px ↓    -100px ↓   -150px ↓  -200px
Element Scale:    1.0  ↓    1.05  ↓    1.10   ↓   1.15   ↓  1.20

Creates: 3D depth perception, immersion
```

### Pattern 3: Blur Reveal

```
Used in: Testimonials, CTAs

Timeline:
blur(20px) ░░░░░░░░░░░░░░░░░░░
blur(15px) ░░░░░░░░░░░░░░░░
blur(10px) ░░░░░░░░░░░░
blur(5px)  ░░░░░░░░░
blur(0px)  ░░░░░  ← Clarity!

Creates: Smooth emergence, premium feel
```

### Pattern 4: Scale Transform

```
Used in: Cards, features, buttons

Entry:      0.9  ↑    Anticipation
            0.95 ↑    Building
            1.0  ─    Complete
Exit:       1.05 ↑    Overshoot
            1.0  ↓    Reset

Creates: Weight, importance, impact
```

---

## Easing Curve Guide

### Back Out (Apple/Nike Style)
```
[0.34, 1.56, 0.64, 1]

Curve:     ╱╲
          ╱  ╲
        ╱      ╲
       ╱        ╲
```

### Power3 Out (Strong Deceleration)
```
power3.out

Curve:    ╱
         ╱
        ╱
       ╱
```

### Smooth Professional (Google)
```
[0.25, 0.46, 0.45, 0.94]

Curve:   ─╱
        ╱  
       ╱   
      ╱    
```

---

## Performance Timeline

```
Page Load:
0ms    ┌─ Hero loads
500ms  ├─ Stats counter starts
1000ms ├─ Hero animations begin
1500ms └─ Page fully interactive

Scroll Trigger Examples:
Stats:           Triggers at 400px scroll
About:           Triggers at 1200px scroll
Programs:        Triggers at 1800px scroll
Features:        Triggers at 2400px scroll
Transformation:  Triggers at 3000px scroll
Video:           Triggers at 3600px scroll
Testimonials:    Triggers at 4200px scroll
Pricing:         Triggers at 4800px scroll
Team:            Triggers at 5400px scroll
FAQ:             Triggers at 6000px scroll
```

---

## Browser Rendering Performance

```
FPS Monitor (Target: 60fps):
Hero:       60fps ✓ (animated orbs)
Stats:      60fps ✓ (stagger animations)
About:      60fps ✓ (parallax effects)
Programs:   60fps ✓ (card cascades)
Features:   60fps ✓ (icon animations)
Transform:  60fps ✓ (image parallax)
Video:      60fps ✓ (button scale)
Testimonials:60fps ✓ (blur reveals)
Pricing:    60fps ✓ (card hover)
Team:       60fps ✓ (cascade reveals)
FAQ:        60fps ✓ (accordion)
CTA:        60fps ✓ (blur reveal)
```

---

## Mobile Animation Adjustments

```
Mobile: Reduced complexity for performance

Desktop Animations:              Mobile Animations:
✓ Full parallax (intensive)      → Simpler translate
✓ Blur effects (full)            → Opacity only
✓ 3D transforms                  → 2D transforms
✓ All easing curves              → power2/power3 only
✓ Multiple simultaneous          → Sequential

Result: Smooth 60fps on all devices
```

---

This guide provides a complete visual reference for all animations in the Elite Gym website. Each animation is carefully orchestrated to create a premium, cinematic user experience.
