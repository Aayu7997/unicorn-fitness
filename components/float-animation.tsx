'use client'

import { motion } from 'framer-motion'
import React from 'react'

interface FloatAnimation {
  children: React.ReactNode
  duration?: number
  distance?: number
  className?: string
}

export function FloatAnimation({
  children,
  duration = 4,
  distance = 20,
  className = '',
}: FloatAnimation) {
  return (
    <motion.div
      animate={{ y: [0, -distance, 0] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
