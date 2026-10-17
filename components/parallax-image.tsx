'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

interface ParallaxImageProps {
  src: string
  alt: string
  speed?: number
  className?: string
}

export function ParallaxImage({ src, alt, speed = -20, className = '' }: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = imgRef.current
    const container = containerRef.current
    if (!img || !container) return

    const ctx = gsap.context(() => {
      gsap.to(img, {
        y: speed,
        force3D: true,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,          // 1:1 with scroll
        },
      })
    }, container)

    return () => ctx.revert()
  }, [speed])

  return (
    <div ref={containerRef} className="overflow-hidden rounded-2xl">
      <img
        ref={imgRef}
        src={src || "/placeholder.svg"}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`w-full h-full object-cover gpu-accelerated scale-110 ${className}`}
      />
    </div>
  )
}
