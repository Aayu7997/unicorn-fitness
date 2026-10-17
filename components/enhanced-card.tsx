'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface EnhancedCardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  animated?: boolean;
  delay?: number;
}

const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
  hover: {
    y: -8,
    transition: { duration: 0.3 },
  },
};

export function EnhancedCard({
  children,
  className = '',
  hoverable = true,
  animated = true,
  delay = 0,
}: EnhancedCardProps) {
  const variants = animated ? cardVariants : undefined;

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      whileHover={hoverable ? 'hover' : undefined}
      transition={{ delay }}
      className={`relative overflow-hidden rounded-2xl backdrop-blur-sm ${className}`}
    >
      {/* Shine effect on hover */}
      <motion.div
        className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 opacity-0 pointer-events-none"
        initial={{ opacity: 0, x: '-100%' }}
        whileHover={{ opacity: 1, x: '100%' }}
        transition={{ duration: 0.5 }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
