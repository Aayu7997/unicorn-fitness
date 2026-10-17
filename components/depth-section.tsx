'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

interface DepthSectionProps {
  items: string[]
  className?: string
}

export function DepthSection({ items, className = '' }: DepthSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const depthItems = gsap.utils.toArray('.depth-item') as HTMLElement[]

      // Staggered entrance — all items animate together with offset
      gsap.fromTo(
        depthItems,
        { 
          y: 60, 
          opacity: 0,
          scale: 0.92,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          force3D: true,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 90%',
            once: true,
          },
        }
      )
    }, section)

    return () => ctx.revert()
  }, [])

  const colors = [
    'from-orange-400 to-amber-300',
    'from-amber-300 to-yellow-200', 
    'from-yellow-200 to-orange-400',
  ]

  return (
    <section
      ref={sectionRef}
      className={`py-32 flex flex-col justify-center items-center relative overflow-hidden section-contained ${className}`}
    >
      {/* - background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-accent/5"
            style={{
              width: `${100 + i * 60}px`,
              height: `${100 + i * 60}px`,
              top: `${25 + i * 30}%`,
              left: `${20 + i * 35}%`,
              animation: `float ${5 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 1.5}s`,
            }}
          />
        ))}
      </div>

      {items.map((item, i) => (
        <div
          key={i}
          className="depth-item relative text-center mb-8 gpu-accelerated"
        >
          <div 
            className={`absolute inset-0 bg-linear-to-r ${colors[i % colors.length]} rounded-full blur-3xl opacity-10 -z-10 scale-150`}
          />
          <h2
            className={`text-6xl md:text-8xl lg:text-9xl font-bold bg-linear-to-r ${colors[i % colors.length]} bg-clip-text text-transparent tracking-tight`}
          >
            {item}
          </h2>
        </div>
      ))}
    </section>
  )
}
