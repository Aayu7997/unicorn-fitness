'use client'

import React from "react"
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  href?: string
  strength?: number
}

export function MagneticButton({
  children,
  className = '',
  onClick,
  href,
  strength = 0.4,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isRippling, setIsRippling] = useState(false)
  const [ripplePos, setRipplePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return

    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current.getBoundingClientRect()

    const x = clientX - (left + width / 2)
    const y = clientY - (top + height / 2)

    setPosition({
      x: x * strength,
      y: y * strength,
    })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  const handleClick = (e: React.MouseEvent) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    setRipplePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setIsRippling(true)
    setTimeout(() => setIsRippling(false), 600)
    
    onClick?.()
  }

  const content = (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      animate={{
        x: position.x,
        y: position.y,
      }}
      transition={{
        type: 'spring' as const,
        stiffness: 150,
        damping: 15,
        mass: 0.5,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
      
      {/* Ripple effect */}
      {isRippling && (
        <span
          className="absolute rounded-full bg-card/20 animate-ping pointer-events-none"
          style={{
            top: ripplePos.y - 10,
            left: ripplePos.x - 10,
            width: 20,
            height: 20,
          }}
        />
      )}
    </motion.div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
