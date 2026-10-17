'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedHeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: string;
  className?: string;
  animated?: boolean;
  colorClass?: string;
}

const variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

const letterVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100 },
  },
};

export function AnimatedHeading({
  level = 2,
  children,
  className = '',
  animated = true,
  colorClass = 'text-orange-500',
}: AnimatedHeadingProps) {
  const HeadingTag = `h${level}` as keyof React.JSX.IntrinsicElements;

  if (!animated) {
    return (
      <HeadingTag className={className}>
        {children.split(' ').map((word, idx) => (
          <span key={idx} className={idx === children.split(' ').length - 1 ? colorClass : ''}>
            {word}{' '}
          </span>
        ))}
      </HeadingTag>
    );
  }

  const words = children.split(' ');

  return (
    <motion.div variants={variants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <HeadingTag className={className}>
        {words.map((word, wordIdx) => (
          <motion.span
            key={wordIdx}
            className={wordIdx === words.length - 1 ? colorClass : ''}
            variants={variants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {word.split('').map((letter, letterIdx) => (
              <motion.span key={letterIdx} variants={letterVariants}>
                {letter}
              </motion.span>
            ))}{' '}
          </motion.span>
        ))}
      </HeadingTag>
    </motion.div>
  );
}
