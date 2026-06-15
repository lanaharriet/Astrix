'use strict';

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/theme-provider';
import { AstrixLogo, AstrixIcon } from '@/components/branding';
import { 
  Sun, 
  Moon, 
  ArrowRight, 
  Cpu, 
  ShieldAlert, 
  Zap, 
  MapPin, 
  IdCard, 
  Calendar, 
  GraduationCap, 
  Building2, 
  LineChart, 
  CheckCircle,
  FileCode,
  Users,
  Briefcase,
  Layers,
  MessageSquare
} from 'lucide-react';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'student' | 'faculty' | 'parent' | 'admin'>('student');

  const rolePreviews = {
    student: {
      title: "Elevate Your Learning Experience",
      description: "Access your Digital ID, predict attendance, simulate your CGPA, track assignments, and consult your Campus Copilot.",
      features: ["Digital Student ID", "Attendance Predictor", "CGPA Simulator", "AI Resume Analyzer", "Interactive Campus Map"]
    },
    faculty: {
      title: "Streamline Academic Operations",
      description: "Manage class attendance using secure QR codes, calculate internal marks, track student watchlists, and approve leaves instantly.",
      features: ["QR Attendance Generator", "Internal Marks Calculator", "Student Watchlist", "Leave & Cert Approvals", "Faculty Advisor Hub"]
    },
    parent: {
      title: "Stay Connected to Academic Growth",
      description: "Monitor child's daily attendance, academic scores, pending fees, and receive parent insights directly from the AI advisory system.",
      features: ["Daily Attendance Tracking", "Academic Progress Reports", "Secure Fee Payments", "Parent Insights & Alerts"]
    },
    admin: {
      title: "Enterprise Campus Governance",
      description: "Execute semester promotions, view audit logs, manage bulk student/faculty imports via CSV, and configure global settings.",
      features: ["User & Role Control", "Bulk CSV Import/Export", "Notice & Event Board", "Placement & Internship Portal", "Audit Logs"]
    }
  };

  const departments = [
    { name: "Computer Science", code: "CSE" },
    { name: "AI & Machine Learning", code: "AIML" },
    { name: "CS & Business Systems", code: "CSBS" },
    { name: "AI & Data Science", code: "AIDS" },
    { name: "Electronics & Comm", code: "ECE" },
    { name: "Electrical & Electronics", code: "EEE" },
    { name: "Mechanical Eng", code: "MECH" },
    { name: "Civil Engineering", code: "CIVIL" },
    { name: "Biomedical Eng", code: "BME" },
    { name: "Business Admin", code: "MBA" }
  ];

  return (
    <div className="min-h-screen bg-background text-text transition-colors duration-300">
      {/* HEADER */}
      <header className="sticky top-0 z-50 glass border-b border-border transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <AstrixLogo size={32} />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <a href="#problems" className="hover:text-primary transition-colors">Problems</a>
            <a href="#solutions" className="hover:text-primary transition-colors">Solutions</a>
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#departments" className="hover:text-primary transition-colors">Departments</a>
            <a href="#success" className="hover:text-primary transition-colors">Portals</a>
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
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden py-16 md:py-24 border-b border-border w-full">
        {/* Background Image with Twilight Glass Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-100 transform transition-transform duration-1000 ease-out"
          style={{ 
            backgroundImage: "url('/campus-hero.png')",
          }}
        />
        {/* Overlay - twilight tone depending on theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-background/95 dark:from-black/75 dark:via-black/60 dark:to-background/95 pointer-events-none" />
        
        {/* Glowing radial accents */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_60%)] opacity-20 pointer-events-none animate-pulse-glow" />
        
        {/* Transparent content container */}
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-6 px-6 py-10 md:px-12 md:py-16 rounded-3xl bg-transparent">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary font-bold text-xs tracking-wider uppercase animate-fade-in-up">
            <Cpu size={14} className="animate-pulse" /> AI-Powered Smart Campus Ecosystem
          </div>
          
          <h1 className="font-extrabold text-5xl md:text-7xl tracking-tight leading-none text-white drop-shadow-md animate-fade-in-up animation-delay-200 opacity-0">
            ASTRIX
          </h1>
          <p className="font-bold text-xl md:text-3xl text-primary tracking-wide drop-shadow-sm uppercase animate-fade-in-up animation-delay-400 opacity-0">
            One Campus. Infinite Possibilities.
          </p>
          <p className="text-white/85 text-sm md:text-base max-w-2xl leading-relaxed font-medium animate-fade-in-up animation-delay-600 opacity-0">
            The next-generation enterprise ERP platform for top-tier universities. Empower students, faculty, parents, and administrators with real-time AI assistance, database integrations, and predictive insights.
          </p>
 
          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto animate-fade-in-up animation-delay-600 opacity-0">
            <Link 
              href="/auth/login" 
              className="inline-flex items-center justify-center px-8 h-12 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2"
            >
              Explore Platform <ArrowRight size={18} />
            </Link>
            <a 
              href="#features" 
              className="inline-flex items-center justify-center px-8 h-12 rounded-xl border border-white/30 bg-white/15 text-white font-bold hover:bg-white/25 hover:scale-[1.02] active:scale-[0.98] transition-all backdrop-blur-sm"
            >
              View Features
            </a>
          </div>
        </div>
      </section>

      {/* PROBLEMS SECTION */}
      <section id="problems" className="py-20 border-t border-border max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight">The Legacy Campus Deficit</h2>
          <p className="text-muted mt-2">Why modern universities struggle with legacy management software.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl border border-border bg-surface">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 text-red-500">
              <ShieldAlert size={20} />
            </div>
            <h3 className="font-bold text-lg mb-2">Fragmented Legacy Systems</h3>
            <p className="text-sm text-muted">Data resides in disconnected silos. Grading, attendance, and placement operations operate in isolation, leading to administrative overhead.</p>
          </div>
          <div className="p-6 rounded-2xl border border-border bg-surface">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 text-red-500">
              <ShieldAlert size={20} />
            </div>
            <h3 className="font-bold text-lg mb-2">Manual Workflows & Paperwork</h3>
            <p className="text-sm text-muted">Certificate generation, leave approvals, and student advisors waste hours verifying records, causing delays and friction for students.</p>
          </div>
          <div className="p-6 rounded-2xl border border-border bg-surface">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 text-red-500">
              <ShieldAlert size={20} />
            </div>
            <h3 className="font-bold text-lg mb-2">Lack of AI-Driven Insights</h3>
            <p className="text-sm text-muted">Institutions lack foresight. Shortage warnings, placement preparedness scores, and student performance risks are only flagged when it is too late.</p>
          </div>
        </div>
      </section>

      {/* SOLUTIONS SECTION */}
      <section id="solutions" className="py-20 bg-accent/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight">The ASTRIX Blueprint</h2>
            <p className="text-muted mt-2">A unified ecosystem engineered for modern academy demands.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl border border-border bg-surface">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mb-4 text-success">
                <CheckCircle size={20} />
              </div>
              <h4 className="font-bold text-base mb-1">Single Source of Truth</h4>
              <p className="text-xs text-muted">A fully relational PostgreSQL backend integrating user roles, courses, academic achievements, and audit logs.</p>
            </div>
            <div className="p-6 rounded-xl border border-border bg-surface">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mb-4 text-success">
                <CheckCircle size={20} />
              </div>
              <h4 className="font-bold text-base mb-1">Instant Automated Approvals</h4>
              <p className="text-xs text-muted">Secure portals for digital certificates and leave requests with instant faculty notifications and approvals.</p>
            </div>
            <div className="p-6 rounded-xl border border-border bg-surface">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mb-4 text-success">
                <CheckCircle size={20} />
              </div>
              <h4 className="font-bold text-base mb-1">Interactive Interfaces</h4>
              <p className="text-xs text-muted">High-fidelity 3D ID cards, low-latency SVG campus maps, and interactive tools optimized for low-end devices.</p>
            </div>
            <div className="p-6 rounded-xl border border-border bg-surface">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mb-4 text-success">
                <CheckCircle size={20} />
              </div>
              <h4 className="font-bold text-base mb-1">Groq Llama 3.1 8B Copilot</h4>
              <p className="text-xs text-muted">Real-time answers on timetables, marks, leaves, placements, and campus directions via the Campus Copilot AI.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section id="features" className="py-20 border-t border-border max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight">Engineered for Academic Workflows</h2>
          <p className="text-muted mt-2">Every feature built with precision for day-to-day college efficiency.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="flex gap-4 p-6 rounded-2xl border border-border bg-surface hover:border-primary/50 transition-colors">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <IdCard size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Digital ID Cards</h3>
              <p className="text-sm text-muted">Premium glassmorphism student, faculty, and parent ID cards featuring a smooth 3D flip animation and verified QR code validation.</p>
            </div>
          </div>

          <div className="flex gap-4 p-6 rounded-2xl border border-border bg-surface hover:border-primary/50 transition-colors">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">QR Attendance</h3>
              <p className="text-sm text-muted">Secure QR-based attendance scanning with location tracking, instant record verification, and attendance predictor calculations.</p>
            </div>
          </div>

          <div className="flex gap-4 p-6 rounded-2xl border border-border bg-surface hover:border-primary/50 transition-colors">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Interactive Campus Map</h3>
              <p className="text-sm text-muted">Fictional university campus layouts built entirely in light-weight, interactive SVGs. Zoom, search, locate departments and cabins instantly.</p>
            </div>
          </div>

          <div className="flex gap-4 p-6 rounded-2xl border border-border bg-surface hover:border-primary/50 transition-colors">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <GraduationCap size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Placement Hub</h3>
              <p className="text-sm text-muted">Track company recruitment drives, register interview rounds, review placement preparation scores, and run AI resume reviews.</p>
            </div>
          </div>

          <div className="flex gap-4 p-6 rounded-2xl border border-border bg-surface hover:border-primary/50 transition-colors">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Cpu size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Campus Copilot AI</h3>
              <p className="text-sm text-muted">Integrated Llama 3.1 8B chatbot helping users scan timetables, query grading rules, check outstanding fees, and write notices.</p>
            </div>
          </div>

          <div className="flex gap-4 p-6 rounded-2xl border border-border bg-surface hover:border-primary/50 transition-colors">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <LineChart size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Watchlists & Risk Detection</h3>
              <p className="text-sm text-muted">Real-time alerts for faculty on students at risk of attendance shortages or low CGPAs, using automated statistical modeling.</p>
            </div>
          </div>
        </div>
      </section>

      {/* DEPARTMENTS SECTION */}
      <section id="departments" className="py-20 bg-accent/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight">Multi-Department Configuration</h2>
            <p className="text-muted mt-2">Out-of-the-box support for all key campus academic divisions.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {departments.map((dept, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-border bg-surface text-center hover:shadow-sm transition-all group">
                <Building2 size={24} className="mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                <span className="block font-bold text-sm">{dept.code}</span>
                <span className="block text-xs text-muted truncate">{dept.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STUDENT SUCCESS / PORTALS */}
      <section id="success" className="py-20 border-t border-border max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight">Role-Based Experiences</h2>
          <p className="text-muted mt-2">Select a portal preview below to inspect user-centric dashboards.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {(['student', 'faculty', 'parent', 'admin'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setActiveTab(role)}
              className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                activeTab === role 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'bg-surface border border-border hover:bg-accent'
              }`}
            >
              {role} Portal
            </button>
          ))}
        </div>

        <div className="p-8 rounded-3xl border border-border bg-surface grid md:grid-cols-2 gap-8 items-center shadow-lg transition-all duration-300">
          <div>
            <h3 className="text-2xl font-extrabold mb-4">{rolePreviews[activeTab].title}</h3>
            <p className="text-muted mb-6 leading-relaxed">{rolePreviews[activeTab].description}</p>
            
            <div className="space-y-3">
              {rolePreviews[activeTab].features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle size={16} className="text-success" />
                  {feat}
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link 
                href="/auth/login" 
                className="inline-flex items-center justify-center px-6 h-11 rounded-xl bg-secondary text-white font-bold shadow-md hover:opacity-90 transition-all gap-2"
              >
                Access {activeTab} dashboard <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="relative rounded-2xl border border-border bg-background p-6 h-64 flex flex-col justify-between shadow-inner overflow-hidden">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">ASTRIX Portal Simulator</span>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-4 py-4">
              <div className="h-6 bg-surface rounded-lg border border-border animate-pulse w-3/4" />
              <div className="h-6 bg-surface rounded-lg border border-border animate-pulse w-full" />
              <div className="h-6 bg-surface rounded-lg border border-border animate-pulse w-5/6" />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
              <span>Security Token: SSL Active</span>
              <span className="font-semibold text-primary">Role: {activeTab.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ANALYTICS SECTION */}
      <section className="py-20 bg-accent/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <span className="block text-4xl font-extrabold text-primary">15,000+</span>
              <span className="block text-sm text-muted font-semibold mt-1">Active Students</span>
            </div>
            <div className="p-6">
              <span className="block text-4xl font-extrabold text-primary">98.2%</span>
              <span className="block text-sm text-muted font-semibold mt-1">Placement Success</span>
            </div>
            <div className="p-6">
              <span className="block text-4xl font-extrabold text-primary">450+</span>
              <span className="block text-sm text-muted font-semibold mt-1">Enterprise Faculty</span>
            </div>
            <div className="p-6">
              <span className="block text-4xl font-extrabold text-primary">12ms</span>
              <span className="block text-sm text-muted font-semibold mt-1">API Response Latency</span>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 border-t border-border max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight">Institutional Acclaim</h2>
          <p className="text-muted mt-2">What university management says about ASTRIX ecosystem.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl border border-border bg-surface">
            <p className="text-sm italic leading-relaxed text-muted-foreground">
              "Transitioning to ASTRIX eliminated three different software licenses we were paying for. The students love the QR attendance system and the AI Copilot. Our HODs have direct clarity on placement drives and student gaps."
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-white text-xs">
                VC
              </div>
              <div>
                <span className="block font-bold text-sm">Dr. Charles Vance</span>
                <span className="block text-xs text-muted">Vice Chancellor, Tech University</span>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-2xl border border-border bg-surface">
            <p className="text-sm italic leading-relaxed text-muted-foreground">
              "The placement module has been a game-changer. Students submit their resumes, get them instantly analyzed by the AI, and apply directly. We saw a 30% increase in registration compliance within the first semester."
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center font-bold text-white text-xs">
                PO
              </div>
              <div>
                <span className="block font-bold text-sm">Prof. Olivia Martinez</span>
                <span className="block text-xs text-muted">Head of Placements & Internships</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 border-t border-border bg-gradient-to-b from-transparent to-accent/20">
        <div className="max-w-4xl mx-auto text-center px-6 flex flex-col items-center gap-6">
          <h2 className="text-4xl font-extrabold tracking-tight">Ready to modernise your campus?</h2>
          <p className="text-muted text-base max-w-lg leading-relaxed">
            Deploy the ASTRIX Enterprise Ecosystem. One database, infinite configurations. Production-ready, mobile-first, and fully secure.
          </p>
          <div className="flex gap-4 mt-4">
            <Link 
              href="/auth/login" 
              className="inline-flex items-center justify-center px-8 h-12 rounded-xl bg-primary text-primary-foreground font-bold shadow-md hover:opacity-95 transition-all gap-2"
            >
              Get Started <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-12 text-center text-xs text-muted max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <AstrixLogo size={24} />
          <p>&copy; {new Date().getFullYear()} ASTRIX Inc. All Rights Reserved. Engineered for excellence.</p>
        </div>
      </footer>
    </div>
  );
}
