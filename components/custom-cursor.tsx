'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [isTouchDevice, setIsTouchDevice] = useState(true)
  const isHovering = useRef(false)
  const cursorText = useRef('')
  const isVisible = useRef(false)

  useEffect(() => {
    // Check if touch device
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    setIsTouchDevice(isTouch)
    if (isTouch) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    // GSAP quickTo for smooth cursor — no React re-renders
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.15, ease: 'power2.out' })
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.15, ease: 'power2.out' })
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power2.out' })
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power2.out' })

    const handleMouseMove = (e: MouseEvent) => {
      dotX(e.clientX)
      dotY(e.clientY)
      ringX(e.clientX)
      ringY(e.clientY)

      if (!isVisible.current) {
        isVisible.current = true
        gsap.to([dot, ring], { opacity: 1, duration: 0.2 })
      }
    }

    const handleMouseLeave = () => {
      isVisible.current = false
      gsap.to([dot, ring], { opacity: 0, duration: 0.2 })
    }

    const handleMouseEnter = () => {
      isVisible.current = true
      gsap.to([dot, ring], { opacity: 1, duration: 0.2 })
    }

    // Event delegation — no MutationObserver needed
    const handleElementEnter = (e: Event) => {
      const target = e.target as HTMLElement
      if (!target) return

      const isInteractive = target.closest('a, button, [role="button"], input, textarea, select, [data-cursor="pointer"]')
      const isMedia = target.closest('img, video, [data-cursor="view"]')

      if (isInteractive || isMedia) {
        isHovering.current = true
        gsap.to(dot, { scale: 0, duration: 0.2 })
        gsap.to(ring, { 
          width: 80, height: 80, 
          marginLeft: -40, marginTop: -40,
          duration: 0.3, ease: 'power2.out'
        })

        if (isMedia) {
          const textEl = ring.querySelector('.cursor-text')
          if (textEl) {
            textEl.textContent = 'View'
            gsap.to(textEl, { opacity: 1, scale: 1, duration: 0.2 })
          }
        }
      }
    }

    const handleElementLeave = (e: Event) => {
      const target = e.target as HTMLElement
      if (!target) return

      const isInteractive = target.closest('a, button, [role="button"], input, textarea, select, [data-cursor="pointer"]')
      const isMedia = target.closest('img, video, [data-cursor="view"]')

      if (isInteractive || isMedia) {
        isHovering.current = false
        gsap.to(dot, { scale: 1, duration: 0.2 })
        gsap.to(ring, { 
          width: 40, height: 40, 
          marginLeft: -20, marginTop: -20,
          duration: 0.3, ease: 'power2.out'
        })

        const textEl = ring.querySelector('.cursor-text')
        if (textEl) {
          gsap.to(textEl, { opacity: 0, scale: 0.5, duration: 0.15 })
        }
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)
    
    // Event delegation on body — replaces MutationObserver + per-element listeners
    document.body.addEventListener('mouseenter', handleElementEnter, true)
    document.body.addEventListener('mouseleave', handleElementLeave, true)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.body.removeEventListener('mouseenter', handleElementEnter, true)
      document.body.removeEventListener('mouseleave', handleElementLeave, true)
    }
  }, [])

  if (isTouchDevice) return null

  return (
    <>
      {/* Hide default cursor */}
      <style dangerouslySetInnerHTML={{ __html: '* { cursor: none !important; }' }} />

      {/* Dot cursor */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference opacity-0"
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <div className="w-3 h-3 -translate-x-1.5 -translate-y-1.5 rounded-full bg-card" />
      </div>

      {/* Ring cursor */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-[9998] pointer-events-none flex items-center justify-center opacity-0"
        style={{
          width: 40,
          height: 40,
          marginLeft: -20,
          marginTop: -20,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="w-full h-full rounded-full border border-white/30 mix-blend-difference flex items-center justify-center">
          <span className="cursor-text text-[10px] font-medium tracking-wider text-foreground uppercase opacity-0 scale-50" />
        </div>
      </div>
    </>
  )
}
