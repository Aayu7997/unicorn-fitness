"use client"

import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'

let lenisInstance: Lenis | null = null

export function initSmoothScroll() {
  if (lenisInstance) return lenisInstance

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  if (isTouchDevice) return null

  const lenis = new Lenis({
    lerp: 0.12,               // Smooth but responsive — not sluggish
    duration: 1.2,            // Natural deceleration curve
    smoothWheel: true,
    wheelMultiplier: 1.2,     // Slightly boosted for snappier feel
    touchMultiplier: 2,
    infinite: false,
  })

  // Connect Lenis to ScrollTrigger — critical for sync
  lenis.on('scroll', ScrollTrigger.update)

  // Use GS- ticker for frame-perfect sync
  gsap.ticker.add((time: number) => {
    lenis.raf(time * 1000)
  })

  // Disable GS-'s lag smoothing so animations stay in sync with scroll position
  gsap.ticker.lagSmoothing(0)

  // ScrollTrigger global defaults — consistent across all components
  ScrollTrigger.defaults({
    toggleActions: 'play none none none',
    fastScrollEnd: true,
    preventOverlaps: true,
  })

  // Configure ScrollTrigger to use Lenis's scroll position
  ScrollTrigger.scrollerProxy(document.documentElement, {
    scrollTop(value?: number) {
      if (arguments.length) {
        lenis.scrollTo(value as number, { immediate: true })
      }
      return lenis.scroll
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      }
    },
    pinType: document.documentElement.style.transform ? 'transform' : 'fixed',
  })

  // Refresh ScrollTrigger after setup
  ScrollTrigger.refresh()

  lenisInstance = lenis
  return lenis
}

export function getLenis() {
  return lenisInstance
}

export function destroySmoothScroll() {
  if (lenisInstance) {
    lenisInstance.destroy()
    lenisInstance = null
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-scrolling', 'lenis-stopped')
      document.documentElement.style.removeProperty('overflow')
      document.body.style.removeProperty('overflow')
    }
  }
}
