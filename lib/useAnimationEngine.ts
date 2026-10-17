'use client'

import { useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface AnimationConfig {
  global: {
    enabled: boolean
    smoothScroll: boolean
    preset: 'cinematic' | 'minimal' | 'dynamic'
    performanceMode: 'auto' | 'high' | 'low'
  }
  hero: {
    type: string
    duration: number
    ease: string
    videoScroll: boolean
    depth3D: boolean
  }
  sections: {
    reveal: string
    stagger: number
    parallax: boolean
  }
}

export function useAnimationEngine() {
  const [config, setConfig] = useState<AnimationConfig>({
    global: {
      enabled: true,
      smoothScroll: true,
      preset: 'cinematic',
      performanceMode: 'auto'
    },
    hero: {
      type: 'cinematic',
      duration: 1.2,
      ease: 'power4.out',
      videoScroll: true,
      depth3D: true
    },
    sections: {
      reveal: 'fade-up',
      stagger: 0.15,
      parallax: true
    }
  })

  useEffect(() => {
    // Fetch animation config from - (placeholder for now)
    fetch('/api/animations')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(() => {
        // Use default config on error
      })
  }, [])

  const animate = (selector: string, customConfig?: any) => {
    if (!config.global.enabled) return

    const element = document.querySelector(selector)
    if (!element) return

    gsap.from(selector, {
      y: 120,
      opacity: 0,
      duration: config.hero.duration,
      ease: config.hero.ease,
      stagger: config.sections.stagger,
      scrollTrigger: {
        trigger: selector,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      },
      ...customConfig
    })
  }

  const animateStagger = (selector: string) => {
    gsap.from(selector, {
      y: 60,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: config.sections.stagger,
      scrollTrigger: {
        trigger: selector,
        start: 'top 85%'
      }
    })
  }

  const parallax = (selector: string, speed: number = 0.5) => {
    if (!config.sections.parallax) return

    gsap.to(selector, {
      y: () => window.innerHeight * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: selector,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    })
  }

  return { config, animate, animateStagger, parallax }
}
