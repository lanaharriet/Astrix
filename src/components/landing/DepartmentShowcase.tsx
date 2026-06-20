'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Building2, Users, Award } from 'lucide-react';

const DEPARTMENTS = [
  { name: "Computer Science", code: "CSE", students: 1200, labs: 8, placement: "98.5%" },
  { name: "AI & Machine Learning", code: "AIML", students: 480, labs: 4, placement: "99.2%" },
  { name: "CS & Business Systems", code: "CSBS", students: 320, labs: 3, placement: "96.4%" },
  { name: "AI & Data Science", code: "AIDS", students: 400, labs: 4, placement: "97.8%" },
  { name: "Electronics & Comm", code: "ECE", students: 900, labs: 6, placement: "94.2%" },
  { name: "Electrical & Electronics", code: "EEE", students: 600, labs: 5, placement: "91.8%" },
  { name: "Mechanical Eng", code: "MECH", students: 800, labs: 7, placement: "88.6%" },
  { name: "Civil Engineering", code: "CIVIL", students: 500, labs: 5, placement: "85.4%" },
  { name: "Biomedical Eng", code: "BME", students: 300, labs: 3, placement: "93.0%" },
  { name: "Business Admin", code: "MBA", students: 420, labs: 2, placement: "95.6%" }
];

export default function DepartmentShowcase() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="departments" className="py-20 bg-accent/30 border-t border-border w-full">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight">Multi-Department Configuration</h2>
          <p className="text-muted mt-2">Hover to inspect academic statistics, department enrollments, and placement rates.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {DEPARTMENTS.map((dept, idx) => (
            <motion.div
              key={idx}
              className="relative p-5 rounded-2xl border border-border bg-surface text-center overflow-hidden h-[135px] flex flex-col justify-center items-center cursor-pointer select-none transition-colors duration-300"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              whileHover={shouldReduceMotion ? {} : { y: -5, borderColor: "var(--primary)" }}
              layout
            >
              {/* Normal view (icon + code + name) */}
              <motion.div 
                className="space-y-1.5"
                animate={{ opacity: hoveredIdx === idx ? 0 : 1, y: hoveredIdx === idx ? -10 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Building2 size={24} className="mx-auto text-primary" />
                <span className="block font-bold text-sm tracking-wide">{dept.code}</span>
                <span className="block text-[10px] text-muted truncate max-w-[130px]">{dept.name}</span>
              </motion.div>

              {/* Stats overlay on Hover */}
              <motion.div
                className="absolute inset-0 bg-primary/5 dark:bg-primary/10 p-3 flex flex-col justify-center items-center gap-1.5 opacity-0 text-[10px] font-bold"
                initial={{ opacity: 0, y: 15 }}
                animate={{ 
                  opacity: hoveredIdx === idx ? 1 : 0, 
                  y: hoveredIdx === idx ? 0 : 15 
                }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <span className="text-primary uppercase text-[9px] tracking-wider font-extrabold mb-0.5">{dept.code} Stats</span>
                <div className="flex items-center gap-1.5 text-text">
                  <Users size={12} className="text-secondary" />
                  <span>{dept.students} Students</span>
                </div>
                <div className="flex items-center gap-1.5 text-text">
                  <Award size={12} className="text-success" />
                  <span>{dept.placement} Placed</span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
