# Animation Components & Usage Examples

## Complete Examples of All Animation Features

---

## 1. Text Split Animation

### Basic Usage
```tsx
import { SplitText } from '@/components/split-text'

export function Hero() {
  return (
    <SplitText
      text="Transform Your Body, Elevate Your Mind"
      className="text-6xl font-bold"
      delay={0.2}
      staggerDelay={0.03}
      duration={0.6}
    />
  )
}
```

### Output
```
Animation sequence:
1. "Transform" fades and slides in (delay: 0.2s)
2. "Your" follows (delay: 0.2s + 0.03s = 0.23s)
3. "Body," follows (delay: 0.26s)
4. etc...

Total animation time: 0.2 + (11 words × 0.03) + 0.6 = 1.33s
```

### Advanced: Character-by-Character
```tsx
// To animate by character instead of word:
const text = "Elite Gym"
const chars = text.split('')

<motion.div
  variants={{
    container: { staggerChildren: 0.05 },
    char: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }
  }}
>
  {chars.map((char, i) => (
    <motion.span key={i} variants={char}>
      {char}
    </motion.span>
  ))}
</motion.div>
```

---

## 2. Magnetic Button

### Basic Usage
```tsx
import { MagneticButton } from '@/components/magnetic-button'

export function CTAButton() {
  return (
    <MagneticButton
      className="px-8 py-4 bg-accent text-background rounded-xl font-bold"
      strength={0.3}
    >
      Start Your Journey
    </MagneticButton>
  )
}
```

### With Click Handler
```tsx
<MagneticButton
  className="px-8 py-4 bg-accent text-background rounded-xl"
  strength={0.4}
  onClick={() => console.log('Clicked!')}
>
  Click Me
</MagneticButton>
```

### Strength Parameter
```
strength = 0.1   → Very subtle (barely follows cursor)
strength = 0.3   → Moderate (recommended)
strength = 0.5   → Strong (very responsive)
strength = 0.8   → Very strong (extreme effect)
```

### Behavior
```
User moves cursor:
1. Button detects mouse position
2. Calculates offset from button center
3. Applies spring physics to movement
4. Smoothly animates position
5. Returns to origin on mouse leave
```

---

## 3. Scroll-Triggered Animations

### Using Framer Motion
```tsx
import { motion } from 'framer-motion'

export function Section() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8 }}
    >
      <h2>This animates when visible</h2>
    </motion.div>
  )
}
```

### Using GSAP
```tsx
import { useEffect, useRef } from 'react'
import { setupScrollReveal } from '@/lib/animations'

export function GSAPSection() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      setupScrollReveal(ref.current)
    }
  }, [])

  return (
    <div ref={ref} style={{ opacity: 0, y: 30 }}>
      <h2>GSAP scroll reveal</h2>
    </div>
  )
}
```

---

## 4. Staggered Children

### List Animation
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,      // 100ms delay between children
      delayChildren: 0.2,         // Start after 200ms
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
}

export function AnimatedList({ items }) {
  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map((item, i) => (
        <motion.li key={i} variants={itemVariants}>
          {item}
        </motion.li>
      ))}
    </motion.ul>
  )
}
```

### Output Timeline
```
Container starts animating at: 0ms
First child animates at:       200ms (delayChildren)
Second child animates at:      300ms (200 + 100 stagger)
Third child animates at:       400ms (200 + 200 stagger)
Fourth child animates at:      500ms (200 + 300 stagger)
```

---

## 5. Parallax Scrolling

### Framer Motion Parallax
```tsx
import { motion, useScroll, useTransform } from 'framer-motion'

export function ParallaxSection() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])

  return (
    <motion.div style={{ y }}>
      <img src="/hero-bg.jpg" alt="Hero" />
    </motion.div>
  )
}
```

### GSAP Parallax
```tsx
import { useEffect, useRef } from 'react'
import { setupParallax } from '@/lib/animations'

export function GSAPParallax() {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) {
      setupParallax(ref.current, -0.5) // Move at 50% of scroll speed
    }
  }, [])

  return <div ref={ref}>Content</div>
}
```

---

## 6. Magnetic Cursor Effect

### GSAP Magnetic Button
```tsx
import { useEffect, useRef } from 'react'
import { setupMagneticButton } from '@/lib/animations'

export function MagneticGSAPButton() {
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (ref.current) {
      setupMagneticButton(ref.current, 0.3)
    }
  }, [])

  return (
    <button ref={ref} className="px-8 py-4">
      Magnetic Button
    </button>
  )
}
```

---

## 7. Video Scroll Scrubbing

### Setup
```tsx
import { useEffect, useRef } from 'react'
import { setupVideoScrub } from '@/lib/animations'

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      setupVideoScrub(videoRef.current)
    }
  }, [])

  return (
    <video
      ref={videoRef}
      src="/hero-video.mp4"
      muted
      playsInline
      className="w-full h-screen object-cover"
    />
  )
}
```

### How It Works
```
1. User scrolls page
2. Video's currentTime updates based on scroll position
3. Creates effect of "scrubbing" through video
4. Shows different frames as user scrolls
```

---

## 8. Hover Reveal Effect

### Using HoverReveal Component
```tsx
import { HoverReveal } from '@/components/hover-reveal'

export function Card() {
  return (
    <HoverReveal
      className="relative p-8 bg-card rounded-lg cursor-pointer"
      revealText="Explore Program"
    >
      <h3>Strength Training</h3>
      <p>Build muscle and power...</p>
    </HoverReveal>
  )
}
```

### Behavior
```
Initial state:  Shows card content
User hovers:    Content fades out, slides up
                Reveal text fades in
User unhover:   Reveal text fades out
                Content fades back in
```

---

## 9. Advanced: Combined Animations

### Full Featured Card
```tsx
import { motion } from 'framer-motion'
import { MagneticButton } from '@/components/magnetic-button'

export function PremiumCard() {
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      whileHover={{ y: -8 }}
      className="p-8 bg-card border border-border rounded-2xl"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <img src="/program.jpg" alt="Program" className="rounded-lg" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold mt-4"
      >
        Elite Program
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-foreground/70 mt-2"
      >
        Transform with elite training...
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6"
      >
        <MagneticButton
          className="w-full px-6 py-3 bg-accent rounded-lg font-bold"
          strength={0.3}
        >
          Enroll Now
        </MagneticButton>
      </motion.div>
    </motion.div>
  )
}
```

---

## 10. Performance Tips

### Best Practices
```tsx
// ✅ GOOD: Use transform and opacity (GPU accelerated)
<motion.div animate={{ x: 100, opacity: 0.5 }} />

// ❌ BAD: Avoid animating layout properties
<motion.div animate={{ width: 100, height: 100 }} />

// ✅ GOOD: Stagger with delayChildren
transition={{ staggerChildren: 0.1 }}

// ❌ BAD: Individual delays (no stagger)
<motion.div delay={0.1} />
<motion.div delay={0.2} />

// ✅ GOOD: Use whileInView for scroll animations
whileInView={{ opacity: 1 }}

// ❌ BAD: Animate all elements on mount
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
```

---

## 11. Animation Timing Curves

### Easing Functions
```tsx
// Built-in Framer Motion easing
ease: "easeInOut"           // Smooth start and end
ease: "easeIn"              // Slow start
ease: "easeOut"             // Slow end

// Cubic-bezier (custom)
ease: [0.34, 1.56, 0.64, 1] // Back out (bouncy)
ease: [0.25, 0.46, 0.45, 0.94] // Quad in-out

// GSAP easing
ease: "power3.out"          // Smooth deceleration
ease: "back.out(2)"         // Bouncy
ease: "elastic.out(1, 0.3)" // Springy
```

---

## 12. Counter Animation

### Animated Numbers
```tsx
import { useEffect, useState } from 'react'

export function Counter({ value, duration = 2 }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) =>
        prev >= value ? value : prev + Math.ceil(value / (duration * 60))
      )
    }, 16) // 60fps

    return () => clearInterval(timer)
  }, [value, duration])

  return <span>{count.toLocaleString()}</span>
}

// Usage
<Counter value={15000} duration={2} /> // Counts to 15,000 in 2 seconds
```

---

## 13. Framer Motion vs GSAP

### When to Use Framer Motion
```tsx
// ✅ React component animations
// ✅ Gesture animations (hover, tap)
// ✅ Simple transitions
// ✅ Page animations

<motion.div whileHover={{ scale: 1.1 }} />
```

### When to Use GSAP
```tsx
// ✅ Complex timelines
// ✅ Scroll animations
// ✅ Video scrubbing
// ✅ Complex sequencing

gsap.timeline()
  .to(el1, { x: 100 }, 0)
  .to(el2, { opacity: 0 }, 0.5)
  .to(el3, { rotation: 360 }, 0)
```

---

## Complete Page Example

See `/app/page.tsx` for a complete example featuring:
- ✅ Text split animations
- ✅ Magnetic buttons
- ✅ Scroll reveals
- ✅ Staggered lists
- ✅ Parallax effects
- ✅ Hover animations
- ✅ API data fetching
- ✅ Professional images

**Ready to use and customize!** 🚀
