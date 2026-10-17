'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { initSmoothScroll, destroySmoothScroll } from '@/lib/smooth-scroll'
import { ScrollTrigger } from '@/lib/gsap'

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard')) {
      destroySmoothScroll()
      return
    }

    // Initialize Lenis
    initSmoothScroll()
    
    // Refresh ScrollTrigger after DOM paints/hydration
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 150)
    
    return () => {
      clearTimeout(refreshTimer)
    }
  }, [pathname])

  return <>{children}</>
}
