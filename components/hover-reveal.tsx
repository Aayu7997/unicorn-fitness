'use client'

import React from "react"

import { useState } from 'react'
import { motion } from 'framer-motion'

interface HoverRevealProps {
  children: React.ReactNode
  className?: string
  revealText?: string
}

export function HoverReveal({
  children,
  className = '',
  revealText = 'Click to explore',
}: HoverRevealProps) {
  const [isHovered, setIsHovered] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  }

  return (
    <motion.div
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div
        animate={{
          opacity: isHovered ? 0 : 1,
          y: isHovered ? -20 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>

      {isHovered && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute inset-0 flex items-center justify-center bg-accent/90 rounded-lg"
        >
          <span className="text-primary font-semibold text-center">{revealText}</span>
        </motion.div>
      )}
    </motion.div>
  )
}
