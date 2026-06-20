'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '@/components/theme-provider';
import { Cpu, ArrowRight } from 'lucide-react';

export default function HeroSection() {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number]
      }
    }
  };

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden py-16 md:py-24 border-b border-border w-full select-none">
      {/* Background Image with Theme-aware clarity/brightness/contrast controls */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-100 transform transition-all duration-1000 ease-out brightness-[1.04] contrast-[1.12] saturate-[1.05] dark:brightness-[0.62] dark:contrast-100 dark:saturate-[0.7]"
        style={{ 
          backgroundImage: "url('/campus-hero.png')",
        }}
      />
      {/* Theme-aware Academic overlay (Warm Ivory in light mode / Premium dark in dark mode) */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-[#FAF7F0]/30 to-background/95 dark:from-black/85 dark:via-black/70 dark:to-background/95 pointer-events-none transition-colors duration-500" />
      
      {/* Glowing radial accents */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_60%)] opacity-20 dark:opacity-15 pointer-events-none animate-pulse-glow" />
      
      {/* Transparent content container */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-6 px-6 py-10 md:px-12 md:py-16 rounded-3xl bg-transparent"
      >
        <motion.div 
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary font-bold text-xs tracking-wider uppercase"
        >
          <Cpu size={14} className="animate-pulse" /> AI-Powered Smart Campus Ecosystem
        </motion.div>
        
        <motion.h1 
          variants={itemVariants}
          style={{ textShadow: theme === 'dark' ? '0 4px 18px rgba(0,0,0,0.85)' : '0 1px 4px rgba(255,255,255,0.7)' }}
          className="font-extrabold text-5xl md:text-7xl tracking-tight leading-none text-slate-900 dark:text-white drop-shadow-sm select-text"
        >
          ASTRIX
        </motion.h1>
        
        <motion.p 
          variants={itemVariants}
          style={{ textShadow: theme === 'dark' ? '0 2px 10px rgba(0,0,0,0.65)' : '0 1px 3px rgba(255,255,255,0.6)' }}
          className="font-bold text-xl md:text-3xl text-primary tracking-wide uppercase"
        >
          One Campus. Infinite Possibilities.
        </motion.p>
        
        <motion.p 
          variants={itemVariants}
          style={{ textShadow: theme === 'dark' ? '0 2px 8px rgba(0,0,0,0.7)' : '0 1px 2px rgba(255,255,255,0.5)' }}
          className="text-text/90 dark:text-white/85 text-sm md:text-base max-w-2xl leading-relaxed font-medium select-text"
        >
          The next-generation enterprise ERP platform for top-tier universities. Empower students, faculty, parents, and administrators with real-time AI assistance, database integrations, and predictive insights.
        </motion.p>

        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto"
        >
          <Link 
            href="/auth/login" 
            className="inline-flex items-center justify-center px-8 h-12 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg hover:opacity-95 hover:scale-[1.03] active:scale-[0.97] transition-all gap-2"
          >
            Explore Platform <ArrowRight size={18} />
          </Link>
          <a 
            href="#features" 
            className="inline-flex items-center justify-center px-8 h-12 rounded-xl border border-slate-900/10 dark:border-white/30 bg-surface/20 dark:bg-white/15 text-text dark:text-white font-bold hover:bg-surface/30 dark:hover:bg-white/25 hover:scale-[1.03] active:scale-[0.97] transition-all backdrop-blur-sm"
          >
            View Features
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
