'use client'

import React from "react"

import { motion } from 'framer-motion'
import { useRef, useEffect } from 'react'
import { setupParallaxScale, setupBlurReveal } from '@/lib/animations'

interface ScrollAnimationSection {
  title: string
  description: string
  children: React.ReactNode
  type?: 'scale' | 'blur' | 'parallax'
}

export function ScrollAnimationSection({
  title,
  description,
  children,
  type = 'scale',
}: ScrollAnimationSection) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      if (type === 'blur') {
        setupBlurReveal(contentRef.current)
      } else if (type === 'parallax') {
        setupParallaxScale(contentRef.current, 0.4)
      }
    }
  }, [type])

  return (
    <section ref={containerRef} className="relative py-24 px-6 sm:px-8 lg:px-12 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-foreground">
            {title}
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            {description}
          </p>
          <motion.div
            className="h-1 w-20 bg-linear-to-r from-accent to-transparent mx-auto mt-6"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          />
        </motion.div>

        {/* Content with animation ref */}
        <div ref={contentRef}>{children}</div>
      </div>
    </section>
  )
}
