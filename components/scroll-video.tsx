'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

interface ScrollVideoProps {
  videoSrc: string
  className?: string
}

export function ScrollVideo({ videoSrc, className = '' }: ScrollVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const video = videoRef.current
    const container = containerRef.current

    if (!video || !container) return

    const ctx = gsap.context(() => {
      gsap.to(video, {
        currentTime: video.duration || 5,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom+=200% top',
          scrub: true,
          pin: true,
        },
      })
    }, container)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className={`h-screen ${className}`}>
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full object-cover"
        muted
        playsInline
        preload="auto"
      />
    </section>
  )
}
