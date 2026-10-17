'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import React from 'react'

interface ResponsiveImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: boolean
  animate?: boolean
  objectFit?: 'contain' | 'cover' | 'fill' | 'scale-down'
}

export function ResponsiveImage({
  src,
  alt,
  width = 1200,
  height = 600,
  className = '',
  loading = 'lazy',
  priority = false,
  animate = true,
  objectFit = 'cover',
}: ResponsiveImageProps) {
  const variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: 'easeOut' as const },
    },
  }

  return (
    <motion.div
      initial={animate ? 'hidden' : 'visible'}
      whileInView="visible"
      variants={animate ? variants : {}}
      viewport={{ once: true, margin: '-100px' }}
      className={`relative overflow-hidden ${className}`}
    >
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={`w-full h-full object-${objectFit}`}
      />
    </motion.div>
  )
}
