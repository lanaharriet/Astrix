'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

interface CounterProps {
  value: number;
  suffix?: string;
  decimals?: number;
  duration?: number;
}

function Counter({ value, suffix = '', decimals = 0, duration = 1.8 }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setCount(value);
      return;
    }
    if (!inView) return;

    let start = 0;
    const end = value;
    const totalMiliseconds = duration * 1000;
    const interval = 20; // 50 fps
    const steps = totalMiliseconds / interval;
    const stepValue = end / steps;

    const timer = setInterval(() => {
      start += stepValue;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [inView, value, duration, shouldReduceMotion]);

  const formatted = decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString();

  return <span ref={ref}>{formatted}{suffix}</span>;
}

export default function AnimatedStats() {
  return (
    <section className="py-20 bg-accent/30 border-t border-border w-full">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div className="p-6 transition-all duration-300 hover:scale-105">
            <span className="block text-4xl font-extrabold text-primary select-none">
              <Counter value={15000} suffix="+" />
            </span>
            <span className="block text-sm text-muted font-semibold mt-1">Active Students</span>
          </div>
          <div className="p-6 transition-all duration-300 hover:scale-105">
            <span className="block text-4xl font-extrabold text-primary select-none">
              <Counter value={98.2} suffix="%" decimals={1} />
            </span>
            <span className="block text-sm text-muted font-semibold mt-1">Placement Success</span>
          </div>
          <div className="p-6 transition-all duration-300 hover:scale-105">
            <span className="block text-4xl font-extrabold text-primary select-none">
              <Counter value={450} suffix="+" />
            </span>
            <span className="block text-sm text-muted font-semibold mt-1">Enterprise Faculty</span>
          </div>
          <div className="p-6 transition-all duration-300 hover:scale-105">
            <span className="block text-4xl font-extrabold text-primary select-none">
              <Counter value={12} suffix="ms" />
            </span>
            <span className="block text-sm text-muted font-semibold mt-1">API Response Latency</span>
          </div>
        </div>
      </div>
    </section>
  );
}
