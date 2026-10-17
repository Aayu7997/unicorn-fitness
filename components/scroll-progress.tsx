'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!barRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        barRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          force3D: true,
          ease: 'none',
          scrollTrigger: {
            trigger: document.documentElement,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.15,    // very light smoothing for responsive feel
          },
        }
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 right-0 h-[2px] z-[100] origin-left gpu-accelerated"
      style={{
        background: 'linear-gradient(90deg, oklch(0.65 0.2 40), oklch(0.55 0.15 60), oklch(0.65 0.2 80))',
        transform: 'scaleX(0)',
      }}
    />
  )
}
