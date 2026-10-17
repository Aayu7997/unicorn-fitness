# Premium Cinematic Scroll Animations Guide

## Overview
This guide documents the cinematic scroll-triggered animations implemented in the Elite Gym website, inspired by Apple, Google, Nike, and Samsung.

---

## Animation Types Implemented

### 1. **Scale Reveal** (Apple Style)
Elements scale up from 0.9 to 1 as they enter viewport with smooth easing.

```tsx
// Usage in component
initial={{ opacity: 0, scale: 0.95 }}
whileInView={{ opacity: 1, scale: 1 }}
viewport={{ once: true, margin: '-50px' }}
transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
```

**Characteristics:**
- Subtle scale effect
- Smooth cubic-bezier easing
- Triggers 50px before element enters viewport
- Premium luxury feel

---

### 2. **Blur Reveal** (Google Style)
Elements start blurred and reveal as they scroll into view.

```tsx
// Usage
initial={{ opacity: 0, filter: 'blur(20px)' }}
whileInView={{ opacity: 1, filter: 'blur(0px)' }}
transition={{ duration: 1, ease: 'power2.out' }}
```

**Characteristics:**
- Starts at 20px blur
- Smooth reveal over 1 second
- Creates depth perception
- Professional, elegant feel

---

### 3. **Stagger Reveal** (Nike Style)
Multiple items reveal in sequence with staggered timing.

```tsx
// Parent container with stagger
data-stagger-item
initial={{ opacity: 0, y: 40, scale: 0.95 }}
whileInView={{ opacity: 1, y: 0, scale: 1 }}
transition={{ delay: index * 0.15, duration: 0.8 }}
```

**Characteristics:**
- Cascading animation
- 0.15s delay between items
- Combines scale + translate
- Creates visual rhythm

---

### 4. **Parallax Scroll** (Samsung Style)
Background elements move at different speeds than foreground.

```typescript
// GSAP ScrollTrigger implementation
gsap.to(element, {
  scrollTrigger: {
    trigger: element.parentElement,
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1,
  },
  scale: 1.05,
  y: window.innerHeight * 0.5,
  ease: 'none',
})
```

**Characteristics:**
- Smooth continuous scroll
- Scrubbed animation (1 = 1 second lag)
- Creates depth illusion
- Premium cinematic feel

---

### 5. **Horizontal Scroll** (Apple Ecosystem)
Sections scroll horizontally as user scrolls vertically.

```typescript
// Implementation
gsap.to(container, {
  scrollTrigger: {
    trigger: container,
    start: 'top center',
    end: `+=${totalScroll}`,
    scrub: 1,
    pin: true,
  },
  x: -totalScroll + window.innerWidth,
})
```

**Characteristics:**
- Pin section during scroll
- Smooth horizontal movement
- Allows exploration without traditional scroll
- High-end interaction

---

## CSS Classes for Scroll Animations

```css
/* Reveal animations */
.scroll-reveal {
  @apply opacity-0 translate-y-12;
}

.scroll-reveal-active {
  @apply opacity-100 translate-y-0 transition-all duration-700 ease-out;
}

/* Scale animations */
.scale-reveal {
  @apply opacity-0 scale-95;
}

.scale-reveal-active {
  @apply opacity-100 scale-100 transition-all duration-800 ease-out;
}

/* Blur animations */
.blur-reveal {
  @apply opacity-0 blur-lg;
}

.blur-reveal-active {
  @apply opacity-100 blur-none transition-all duration-1000 ease-out;
}
```

---

## Framer Motion Easing Functions

### Premium Easing Curves

```javascript
// Back Out (Bouncy reveal)
ease: [0.34, 1.56, 0.64, 1]

// Smooth ease
ease: [0.25, 0.46, 0.45, 0.94]

// Power easing
ease: 'power2.out'
ease: 'power3.out'
ease: 'back.out(1.7)'
```

---

## Implementation Examples

### Example 1: Stats Section with Stagger
```tsx
{stats.map((stat, index) => (
  <motion.div
    key={index}
    data-stagger-item
    initial={{ opacity: 0, y: 40, scale: 0.95 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{
      delay: index * 0.15,
      duration: 0.8,
      ease: [0.34, 1.56, 0.64, 1],
    }}
  >
    {/* Content */}
  </motion.div>
))}
```

### Example 2: Parallax Background
```tsx
<motion.div
  initial={{ opacity: 0, x: 80, scale: 0.95 }}
  whileInView={{ opacity: 1, x: 0, scale: 1 }}
  transition={{
    duration: 0.9,
    ease: [0.34, 1.56, 0.64, 1],
  }}
>
  {/* Parallax element */}
</motion.div>
```

### Example 3: Blur Reveal CTA
```tsx
<motion.div
  initial={{ opacity: 0, y: 60, scale: 0.92, filter: 'blur(20px)' }}
  whileInView={{
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
  }}
  viewport={{ once: true, margin: '-50px' }}
  transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
>
  {/* CTA content */}
</motion.div>
```

---

## GSAP ScrollTrigger Functions

### setupScrollReveal()
Reveals element on scroll trigger.
```typescript
setupScrollReveal(element)
```

### setupScaleReveal()
Scales element in on scroll.
```typescript
setupScaleReveal(element)
```

### setupBlurReveal()
Blur effect reveal on scroll.
```typescript
setupBlurReveal(element)
```

### setupParallaxScale()
Parallax with scale effect.
```typescript
setupParallaxScale(element, intensity)
```

### setupPinSection()
Pins section during scroll (Samsung style).
```typescript
setupPinSection(section, duration)
```

### setupScrollCounter()
Counts up numbers on scroll.
```typescript
setupScrollCounter(element, targetValue, duration)
```

---

## Performance Tips

1. **Use `margin` in viewport triggers** to start animations before elements are visible
2. **Stagger delays** should not exceed 0.2s for smooth cascading
3. **Keep blur durations** under 1s for performance
4. **Use `once: true`** in viewport to animate only once
5. **Limit parallax intensity** to 0.3-0.5 for smooth performance

---

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile Safari 14+
- ✅ All modern mobile browsers

---

## Common Issues & Solutions

### Animation not triggering?
- Check if `margin` is set correctly in `viewport`
- Verify element is within viewport
- Check console for GSAP errors

### Janky animations?
- Reduce stagger delay
- Decrease blur intensity
- Use `once: true` instead of continuous

### Performance slow?
- Limit parallax to critical elements
- Use `will-change` CSS
- Reduce animation duration

---

## Next Steps

1. Adapt animations to your brand
2. Test on mobile devices
3. Adjust timings based on performance
4. Add custom easing curves
5. Create brand-specific animation system

---

## References

- GSAP Documentation: https://gsap.com
- Framer Motion: https://www.framer.com/motion
- Apple Design: https://www.apple.com
- Google Material: https://material.google.com
