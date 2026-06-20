'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  UserPlus, 
  BookOpen, 
  CheckSquare, 
  Code, 
  Briefcase, 
  GraduationCap, 
  Award
} from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const JOURNEY_STEPS = [
  {
    title: "1. Smart Admission",
    desc: "Seamless profile registration and relational database instantiation across departments.",
    icon: UserPlus,
    color: "text-primary bg-primary/10"
  },
  {
    title: "2. Learning & Timetable",
    desc: "Instant access to digital classes, syllabus progress tracking, and lecture timetables.",
    icon: BookOpen,
    color: "text-secondary bg-secondary/10"
  },
  {
    title: "3. Attendance & Academics",
    desc: "Daily secure QR check-ins, attendance shortage predictions, and internal mark tallies.",
    icon: CheckSquare,
    color: "text-success bg-success/10"
  },
  {
    title: "4. Projects & Skill Map",
    desc: "Publishing student portfolio achievements and cataloging verified technical skillsets.",
    icon: Code,
    color: "text-blue-500 bg-blue-500/10"
  },
  {
    title: "5. Real-World Internships",
    desc: "Securing student internship permissions with direct HOD request approvals.",
    icon: Briefcase,
    color: "text-yellow-500 bg-yellow-500/10"
  },
  {
    title: "6. Predictive Placements",
    desc: "AI-driven resume review, interview registration, and placement mock analytics.",
    icon: Award,
    color: "text-red-500 bg-red-500/10"
  },
  {
    title: "7. Graduation Day",
    desc: "Digital certificate request generation, audit verification, and final campus sign-off.",
    icon: GraduationCap,
    color: "text-indigo-500 bg-indigo-500/10"
  }
];

export default function StudentJourney() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-24 border-t border-border max-w-7xl mx-auto px-6 w-full">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-extrabold tracking-tight">The ASTRIX Student Journey</h2>
        <p className="text-muted mt-2">Visualizing the academic lifecycle progression powered by smart automation.</p>
      </div>

      <div className="relative max-w-3xl mx-auto flex flex-col gap-12">
        {/* Vertical Line Connector */}
        {!shouldReduceMotion && (
          <motion.div 
            className="absolute left-6 md:left-1/2 top-4 bottom-4 w-[2px] bg-gradient-to-b from-primary via-secondary to-success origin-top"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        )}

        {JOURNEY_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isEven = idx % 2 === 0;

          return (
            <div 
              key={idx} 
              className={`flex flex-col md:flex-row items-start md:items-center relative w-full ${
                isEven ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Icon Circle */}
              <div className="absolute left-0 md:left-1/2 -translate-x-0 md:-translate-x-1/2 z-10 flex items-center justify-center w-12 h-12 rounded-full bg-surface border border-border shadow-md select-none">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${step.color}`}>
                  <Icon size={18} />
                </div>
              </div>

              {/* Card Container */}
              <div className={`w-full md:w-[45%] pl-16 md:pl-0 ${isEven ? 'md:pr-12' : 'md:pl-12'}`}>
                <ScrollReveal direction={shouldReduceMotion ? 'none' : (isEven ? 'left' : 'right')} delay={0.1}>
                  <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm hover:shadow-md transition-all duration-300">
                    <h3 className="font-bold text-base text-primary mb-1.5">{step.title}</h3>
                    <p className="text-xs text-muted leading-relaxed">{step.desc}</p>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
