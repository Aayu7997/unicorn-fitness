'use client'

import { useRef, useEffect } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

interface TextMarqueeProps {
  texts?: string[]
  speed?: number
  className?: string
}

export function TextMarquee({ 
  texts = ['TRAINING', 'STRENGTH', 'POWER', 'ENDURANCE', 'UNICORN FITNESS'],
  speed = 1,
  className = '',
}: TextMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)

  useEffect(() => {
    if (!innerRef.current || !containerRef.current) return

    const inner = innerRef.current
    const totalWidth = inner.scrollWidth / 2 // Half because content is duplicated

    // Base continuous scroll — GPU-only transform
    const tween = gsap.to(inner, {
      x: -totalWidth,
      ease: 'none',
      duration: totalWidth / (60 * speed),
      repeat: -1,
      force3D: true,
    })
    tweenRef.current = tween

    let targetTimeScale = 1
    let currentTimeScale = 1

    const tickerUpdate = () => {
      // Smoothly lerp towards target
      currentTimeScale += (targetTimeScale - currentTimeScale) * 0.08
      tween.timeScale(currentTimeScale)
      // Decay target back to 1
      targetTimeScale += (1 - targetTimeScale) * 0.04
    }

    gsap.ticker.add(tickerUpdate)

    // Scroll velocity modifier via ScrollTrigger (unified with Lenis)
    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const velocity = Math.abs(self.getVelocity())
        if (velocity > 30) {
          const velocityMultiplier = 1 + velocity * 0.0004
          targetTimeScale = Math.min(velocityMultiplier, 4.5)
        }
      },
    })

    return () => {
      tween.kill()
      gsap.ticker.remove(tickerUpdate)
      trigger.kill()
      tweenRef.current = null
    }
  }, [speed])

  const separator = (
    <span className="mx-8 text-accent/40 text-2xl">✦</span>
  )

  const content = texts.map((text, i) => (
    <span key={i} className="flex items-center shrink-0">
      <span className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight whitespace-nowrap text-foreground/6 dark:text-foreground/4 uppercase">
        {text}
      </span>
      {separator}
    </span>
  ))

  return (
    <div 
      ref={containerRef}
      className={`overflow-hidden py-12 select-none ${className}`}
    >
      <div 
        ref={innerRef}
        className="flex items-center gpu-accelerated"
      >
        {/* Content duplicated for seamless loop */}
        {content}
        {content}
      </div>
    </div>
  )
}
