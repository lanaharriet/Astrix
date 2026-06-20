'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'none';
  duration?: number;
}

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 0.6,
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion || direction === 'none') {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.4, delay }}
      >
        {children}
      </motion.div>
    );
  }

  const directions = {
    up: { y: 35 },
    down: { y: -35 },
    left: { x: 35 },
    right: { x: -35 },
    scale: { scale: 0.94 },
  };

  const initialVal = {
    opacity: 0,
    ...directions[direction],
  };

  const animateVal = {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
  };

  return (
    <motion.div
      className={className}
      initial={initialVal}
      whileInView={animateVal}
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number], // easeOutExpo
      }}
    >
      {children}
    </motion.div>
  );
}
