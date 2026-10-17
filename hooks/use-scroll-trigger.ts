'use client'

import { useEffect, useRef } from 'react'
import {
  setupScrollReveal,
  setupScaleReveal,
  setupBlurReveal,
  setupParallax,
  setupParallaxScale,
} from '@/lib/animations'

type TriggerType =
  | 'reveal'
  | 'scale'
  | 'blur'
  | 'parallax'
  | 'parallax-scale'

export function useScrollTrigger(type: TriggerType = 'reveal') {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return

    switch (type) {
      case 'reveal':
        setupScrollReveal(ref.current)
        break
      case 'scale':
        setupScaleReveal(ref.current)
        break
      case 'blur':
        setupBlurReveal(ref.current)
        break
      case 'parallax':
        setupParallax(ref.current, -0.5)
        break
      case 'parallax-scale':
        setupParallaxScale(ref.current, 0.3)
        break
    }

    return () => {
      // Cleanup handled by GS-
    }
  }, [type])

  return ref
}
