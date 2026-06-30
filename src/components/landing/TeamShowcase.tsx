'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Mail, ArrowUpRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { useTheme } from '@/components/theme-provider';

const TEAM_MEMBERS = [
  {
    name: 'Lana Harriet C',
    badge: 'Team Lead',
    email: 'lanaharriet1408@gmail.com',
    initials: 'LH',
    gradient: 'from-amber-500 via-primary to-secondary',
    glow: 'rgba(212, 160, 23, 0.3)',
  },
  {
    name: 'Rishika A',
    badge: 'Team Member',
    email: 'ms.rishika2007@gmail.com',
    initials: 'RA',
    gradient: 'from-secondary to-indigo-500',
    glow: 'rgba(109, 40, 217, 0.3)',
  },
  {
    name: 'Rohini Murugesh',
    badge: 'Team Member',
    email: 'rohinim22006@gmail.com',
    initials: 'RM',
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16, 185, 129, 0.3)',
  },
  {
    name: 'Bhargavi S',
    badge: 'Team Member',
    email: 'bhargavi6297@gmail.com',
    initials: 'BS',
    gradient: 'from-rose-500 to-orange-500',
    glow: 'rgba(244, 63, 94, 0.3)',
  },
];

export default function TeamShowcase() {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section id="team" className="py-20 border-t border-border w-full flex flex-col items-center justify-center">
      <div className="max-w-7xl mx-auto px-6 w-full">
        {/* Title Block */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-text via-primary to-text">
              Meet Team Aurex
            </h2>
            <p className="text-muted mt-3 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              The passionate minds behind ASTRIX — building the future of smart campus ecosystems.
            </p>
          </div>
        </ScrollReveal>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {TEAM_MEMBERS.map((member, idx) => (
            <ScrollReveal key={idx} delay={idx * 0.08} direction="up">
              <motion.div
                className="relative group p-6 rounded-2xl border border-border bg-surface overflow-hidden flex flex-col items-center text-center cursor-pointer h-full transition-all duration-300"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                whileHover={shouldReduceMotion ? {} : {
                  y: -6,
                  borderColor: 'var(--primary)',
                  boxShadow: `0 12px 40px -10px ${member.glow}`,
                }}
              >
                {/* Gradient glow background */}
                <div
                  className="absolute -inset-px bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(to right, var(--primary), var(--secondary))`,
                  }}
                />

                {/* Avatar Initial Circle */}
                <div className="relative mb-5">
                  <div
                    className={`w-20 h-20 rounded-full bg-gradient-to-tr ${member.gradient} p-[2px] transition-transform duration-500 group-hover:scale-105`}
                  >
                    <div className="w-full h-full rounded-full bg-surface flex items-center justify-center font-bold text-xl text-text select-none">
                      {member.initials}
                    </div>
                  </div>
                  {/* Subtle pulsing glow behind avatar on hover */}
                  <div
                    className="absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10"
                    style={{
                      backgroundColor: member.glow,
                    }}
                  />
                </div>

                {/* Details */}
                <h3 className="font-extrabold text-lg text-text tracking-tight group-hover:text-primary transition-colors duration-200">
                  {member.name}
                </h3>
                
                {/* Badge */}
                <span className={`mt-2 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-accent text-primary border border-border/60`}>
                  {member.badge}
                </span>

                <div className="mt-4 flex items-center gap-1.5 text-xs text-muted font-medium hover:text-text transition-colors duration-200">
                  <Mail size={12} className="text-secondary animate-pulse" />
                  <a href={`mailto:${member.email}`} className="truncate max-w-[190px]">
                    {member.email}
                  </a>
                </div>

                {/* Decorative bottom element */}
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowUpRight size={14} className="text-primary" />
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Developed by Signature Block */}
        <ScrollReveal delay={0.3}>
          <div className="flex flex-col items-center justify-center pt-8 border-t border-border/40 text-center">
            <span className="text-xs uppercase tracking-widest font-extrabold text-muted mb-2">Signature Release</span>
            <h4 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary animate-pulse-glow py-1">
              ✨ Developed with passion by Team Aurex ✨
            </h4>
            <p className="text-xs text-muted-foreground mt-1 font-semibold">
              ASTRIX — Enterprise AI-Powered Smart Campus Ecosystem
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
