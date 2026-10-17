'use client'

import { motion } from 'framer-motion'

interface SplitTextProps {
  text: string
  className?: string
  delay?: number
  staggerDelay?: number
  duration?: number
}

export function SplitText({
  text,
  className = '',
  delay = 0,
  staggerDelay = 0.02,
  duration = 0.5,
}: SplitTextProps) {
  const words = text.split(' ')

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  }

  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: duration,
        ease: [0.34, 1.56, 0.64, 1] as const, // cubic-bezier easeOutBack
      },
    },
  }

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, wordIndex) => (
        <motion.span
          key={`${wordIndex}-${word}`}
          variants={wordVariants}
          className="inline-block"
        >
          {word}
          {wordIndex < words.length - 1 && <span>&nbsp;</span>}
        </motion.span>
      ))}
    </motion.div>
  )
}
