'use strict';

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '@/components/theme-provider';
import { AstrixLogo } from '@/components/branding';
import { 
  Sun, 
  Moon, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle,
  IdCard,
  Zap,
  MapPin,
  GraduationCap,
  Cpu,
  LineChart,
  Building2,
  Users,
  Briefcase,
  Layers,
  MessageSquare,
  Activity,
  Compass
} from 'lucide-react';

// Enhanced Modular Subcomponents
import ScrollReveal from '@/components/landing/ScrollReveal';
import HeroSection from '@/components/landing/HeroSection';
import PortalSimulator from '@/components/landing/PortalSimulator';
import DepartmentShowcase from '@/components/landing/DepartmentShowcase';
import AnimatedStats from '@/components/landing/AnimatedStats';
import StudentJourney from '@/components/landing/StudentJourney';
import AICopilotDemo from '@/components/landing/AICopilotDemo';
import CampusRouteDemo from '@/components/landing/CampusRouteDemo';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const navItems = [
    { name: 'Problems', id: 'problems' },
    { name: 'Solutions', id: 'solutions' },
    { name: 'Features', id: 'features' },
    { name: 'Timelines', id: 'timeline' },
    { name: 'Departments', id: 'departments' },
    { name: 'Simulator', id: 'success' }
  ];

  return (
    <div className="min-h-screen bg-background text-text transition-colors duration-300 overflow-x-hidden flex flex-col items-center">
      {/* HEADER */}
      <header className="sticky top-0 z-50 glass border-b border-border transition-colors duration-300 w-full">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <AstrixLogo size={32} />
          </Link>

          {/* Nav with gold sliding underline indicators */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold relative">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="relative py-1 hover:text-primary transition-colors text-xs uppercase tracking-wider font-extrabold"
                onMouseEnter={() => setHoveredNav(item.id)}
                onMouseLeave={() => setHoveredNav(null)}
              >
                {item.name}
                {hoveredNav === item.id && (
                  <motion.span
                    layoutId="navUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-lg border border-border bg-surface hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} className="text-primary" /> : <Moon size={18} className="text-secondary" />}
            </button>
            <Link 
              href="/auth/login" 
              className="hidden sm:inline-flex items-center justify-center px-4 h-9 rounded-lg border border-border text-sm font-semibold hover:bg-accent transition-all"
            >
              Log In
            </Link>
            <Link 
              href="/auth/login?tab=register" 
              className="inline-flex items-center justify-center px-4 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 shadow-sm transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <HeroSection />

      {/* PROBLEMS SECTION */}
      <section id="problems" className="py-20 border-t border-border max-w-7xl mx-auto px-6 w-full">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight">The Legacy Campus Deficit</h2>
            <p className="text-muted mt-2">Why modern universities struggle with legacy management software.</p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8">
          <ScrollReveal delay={0.05}>
            <motion.div 
              whileHover={shouldReduceMotion ? {} : { y: -6, boxShadow: theme === 'dark' ? '0 12px 30px -10px rgba(212, 160, 23, 0.25)' : '0 12px 30px -10px rgba(184, 134, 11, 0.15)' }}
              transition={{ duration: 0.25 }}
              className="p-6 rounded-2xl border border-border bg-surface h-full"
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 text-red-500 select-none">
                <ShieldAlert size={20} />
              </div>
              <h3 className="font-bold text-lg mb-2">Fragmented Legacy Systems</h3>
              <p className="text-sm text-muted leading-relaxed">Data resides in disconnected silos. Grading, attendance, and placement operations operate in isolation, leading to administrative overhead.</p>
            </motion.div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <motion.div 
              whileHover={shouldReduceMotion ? {} : { y: -6, boxShadow: theme === 'dark' ? '0 12px 30px -10px rgba(212, 160, 23, 0.25)' : '0 12px 30px -10px rgba(184, 134, 11, 0.15)' }}
              transition={{ duration: 0.25 }}
              className="p-6 rounded-2xl border border-border bg-surface h-full"
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 text-red-500 select-none">
                <ShieldAlert size={20} />
              </div>
              <h3 className="font-bold text-lg mb-2">Manual Workflows & Paperwork</h3>
              <p className="text-sm text-muted leading-relaxed">Certificate generation, leave approvals, and student advisors waste hours verifying records, causing delays and friction for students.</p>
            </motion.div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <motion.div 
              whileHover={shouldReduceMotion ? {} : { y: -6, boxShadow: theme === 'dark' ? '0 12px 30px -10px rgba(212, 160, 23, 0.25)' : '0 12px 30px -10px rgba(184, 134, 11, 0.15)' }}
              transition={{ duration: 0.25 }}
              className="p-6 rounded-2xl border border-border bg-surface h-full"
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 text-red-500 select-none">
                <ShieldAlert size={20} />
              </div>
              <h3 className="font-bold text-lg mb-2">Lack of AI-Driven Insights</h3>
              <p className="text-sm text-muted leading-relaxed">Institutions lack foresight. Shortage warnings, placement preparedness scores, and student performance risks are only flagged when it is too late.</p>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      {/* SOLUTIONS SECTION */}
      <section id="solutions" className="py-20 bg-accent/30 border-t border-border w-full flex justify-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold tracking-tight">The ASTRIX Blueprint</h2>
              <p className="text-muted mt-2">A unified ecosystem engineered for modern academy demands.</p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Single Source of Truth", desc: "A fully relational PostgreSQL backend integrating user roles, courses, academic achievements, and audit logs.", icon: Layers },
              { title: "Instant Automated Approvals", desc: "Secure portals for digital certificates and leave requests with instant faculty notifications and approvals.", icon: CheckCircle },
              { title: "Interactive Interfaces", desc: "High-fidelity 3D ID cards, low-latency SVG campus maps, and interactive tools optimized for low-end devices.", icon: MapPin },
              { title: "Groq Llama 3.1 8B Copilot", desc: "Real-time answers on timetables, marks, leaves, placements, and campus directions via the Campus Copilot AI.", icon: Cpu }
            ].map((sol, idx) => {
              const Icon = sol.icon;
              return (
                <ScrollReveal key={idx} delay={idx * 0.05}>
                  <motion.div 
                    whileHover={shouldReduceMotion ? {} : { y: -5, boxShadow: theme === 'dark' ? '0 10px 25px -5px rgba(212, 160, 23, 0.2)' : '0 10px 25px -5px rgba(184, 134, 11, 0.12)' }}
                    transition={{ duration: 0.25 }}
                    className="p-6 rounded-xl border border-border bg-surface h-full"
                  >
                    <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mb-4 text-success select-none">
                      <Icon size={20} />
                    </div>
                    <h4 className="font-bold text-base mb-1">{sol.title}</h4>
                    <p className="text-xs text-muted leading-relaxed">{sol.desc}</p>
                  </motion.div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section id="features" className="py-20 border-t border-border max-w-7xl mx-auto px-6 w-full">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight">Engineered for Academic Workflows</h2>
            <p className="text-muted mt-2">Every feature built with precision for day-to-day college efficiency.</p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: "Digital ID Cards", desc: "Premium glassmorphism student, faculty, and parent ID cards featuring a smooth 3D flip animation and verified QR code validation.", icon: IdCard },
            { title: "QR Attendance", desc: "Secure QR-based attendance scanning with location tracking, instant record verification, and attendance predictor calculations.", icon: Zap },
            { title: "Interactive Campus Map", desc: "Fictional university campus layouts built entirely in light-weight, interactive SVGs. Zoom, search, locate departments and cabins instantly.", icon: MapPin },
            { title: "Placement Hub", desc: "Track company recruitment drives, register interview rounds, review placement preparation scores, and run AI resume reviews.", icon: GraduationCap },
            { title: "Campus Copilot AI", desc: "Integrated Llama 3.1 8B chatbot helping users scan timetables, query grading rules, check outstanding fees, and write notices.", icon: Cpu },
            { title: "Watchlists & Risk Detection", desc: "Real-time alerts for faculty on students at risk of attendance shortages or low CGPAs, using automated statistical modeling.", icon: LineChart }
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <ScrollReveal key={idx} delay={idx * 0.05}>
                <motion.div 
                  whileHover={shouldReduceMotion ? {} : { y: -5, borderColor: "var(--primary)" }}
                  transition={{ duration: 0.25 }}
                  className="flex gap-4 p-6 rounded-2xl border border-border bg-surface h-full"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center select-none">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{feat.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{feat.desc}</p>
                  </div>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* DYNAMIC SHOWCASES: AI COPILOT & ROUTE MAP */}
      <section className="py-20 border-t border-border bg-accent/10 w-full flex justify-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold tracking-tight">Interactive Smart Capabilities</h2>
              <p className="text-muted mt-2">Test-drive the real-time AI advisory copilot and campus route highlighting previews.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollReveal direction="left" delay={0.05}>
              <div className="space-y-4">
                <h3 className="text-xl font-bold tracking-tight">Llama-Powered AI Dialogues</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Experience conversational advisory insights immediately. The Campus Copilot calculates attendance requirements, maps schedules, and reviews assignments with zero human latency.
                </p>
                <AICopilotDemo />
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.1}>
              <div className="space-y-4">
                <h3 className="text-xl font-bold tracking-tight">Responsive Vector Routing</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Generate path animations linking key campus departments and block terminals. Calculate exact walking distances and transit times to secure seamless schedules.
                </p>
                <CampusRouteDemo />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* PORTAL SIMULATOR */}
      <PortalSimulator />

      {/* STUDENT JOURNEY TIMELINE */}
      <div id="timeline" className="w-full flex justify-center">
        <StudentJourney />
      </div>

      {/* DEPARTMENTS SECTION */}
      <DepartmentShowcase />

      {/* ANIMATED STATS */}
      <AnimatedStats />

      {/* TESTIMONIALS */}
      <section className="py-20 border-t border-border max-w-7xl mx-auto px-6 w-full">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight">Institutional Acclaim</h2>
            <p className="text-muted mt-2">What university management says about ASTRIX ecosystem.</p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8">
          <ScrollReveal direction="left" delay={0.05}>
            <motion.div 
              whileHover={shouldReduceMotion ? {} : { y: -5 }}
              className="p-8 rounded-2xl border border-border bg-surface h-full"
            >
              <p className="text-sm italic leading-relaxed text-muted-foreground">
                "Transitioning to ASTRIX eliminated three different software licenses we were paying for. The students love the QR attendance system and the AI Copilot. Our HODs have direct clarity on placement drives and student gaps."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-white text-xs select-none">
                  VC
                </div>
                <div>
                  <span className="block font-bold text-sm">Dr. Charles Vance</span>
                  <span className="block text-xs text-muted">Vice Chancellor, Tech University</span>
                </div>
              </div>
            </motion.div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.1}>
            <motion.div 
              whileHover={shouldReduceMotion ? {} : { y: -5 }}
              className="p-8 rounded-2xl border border-border bg-surface h-full"
            >
              <p className="text-sm italic leading-relaxed text-muted-foreground">
                "The placement module has been a game-changer. Students submit their resumes, get them instantly analyzed by the AI, and apply directly. We saw a 30% increase in registration compliance within the first semester."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center font-bold text-white text-xs select-none">
                  PO
                </div>
                <div>
                  <span className="block font-bold text-sm">Prof. Olivia Martinez</span>
                  <span className="block text-xs text-muted">Head of Placements & Internships</span>
                </div>
              </div>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 border-t border-border bg-gradient-to-b from-transparent to-accent/20 w-full flex justify-center">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center px-6 flex flex-col items-center gap-6">
            <h2 className="text-4xl font-extrabold tracking-tight">Ready to modernise your campus?</h2>
            <p className="text-muted text-base max-w-lg leading-relaxed">
              Deploy the ASTRIX Enterprise Ecosystem. One database, infinite configurations. Production-ready, mobile-first, and fully secure.
            </p>
            <div className="flex gap-4 mt-4">
              <Link 
                href="/auth/login" 
                className="inline-flex items-center justify-center px-8 h-12 rounded-xl bg-primary text-primary-foreground font-bold shadow-md hover:opacity-95 hover:scale-[1.03] active:scale-[0.97] transition-all gap-2"
              >
                Get Started <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-12 text-center text-xs text-muted w-full border-t border-border">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <AstrixLogo size={24} />
          <p>&copy; {new Date().getFullYear()} ASTRIX Inc. All Rights Reserved. Engineered for excellence.</p>
        </div>
      </footer>
    </div>
  );
}
