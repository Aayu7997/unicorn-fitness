'use client';

import { useEffect, useRef, useState } from 'react'

interface UseScrollAnimation {
  threshold?: number
  triggerOnce?: boolean
}

export function useScrollAnimation(options: UseScrollAnimation = {}) {
  const { threshold = 0.1, triggerOnce = true } = options
  const ref = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (triggerOnce && ref.current) {
            observer.unobserve(ref.current)
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [threshold, triggerOnce])

  return { ref, isVisible }
}

export function useParallax(speed: number = 0.5) {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return {
    y: scrollY * speed,
    style: {
      transform: `translateY(${scrollY * speed}px)`,
    },
  }
}
