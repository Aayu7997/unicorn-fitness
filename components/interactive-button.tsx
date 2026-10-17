'use client'

import { motion } from 'framer-motion'
import React from 'react'

interface InteractiveButtonProps {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function InteractiveButton({
  children,
  onClick,
  href,
  variant = 'primary',
  size = 'md',
  className = '',
}: InteractiveButtonProps) {
  const baseClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const variantClasses = {
    primary: 'bg-accent text-foreground hover:bg-accent/90',
    secondary: 'bg-foreground/10 text-foreground hover:bg-foreground/20',
    outline: 'border-2 border-accent text-accent hover:bg-accent/10',
  }

  const Component = href ? 'a' : 'button'

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-block"
    >
      <motion.div
        className="relative overflow-hidden rounded-lg"
        initial={false}
      >
        <Component
          href={href}
          onClick={onClick}
          className={`
            relative font-semibold rounded-lg transition-all duration-300
            ${baseClasses[size]}
            ${variantClasses[variant]}
            ${className}
          `}
        >
          <motion.span
            className="relative z-10 flex items-center justify-center"
            initial={{ y: 0 }}
            whileHover={{ y: -2 }}
          >
            {children}
          </motion.span>

          {/* Shimmer effect background */}
          <motion.div
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
        </Component>
      </motion.div>
    </motion.div>
  )
}
