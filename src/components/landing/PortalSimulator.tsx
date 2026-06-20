'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle, 
  User, 
  Users, 
  Clock, 
  BookOpen, 
  CreditCard, 
  MessageSquare, 
  ShieldCheck, 
  QrCode, 
  Activity,
  AlertOctagon,
  Sparkles,
  TrendingUp,
  Award
} from 'lucide-react';

type Role = 'student' | 'faculty' | 'parent' | 'admin';

const ROLE_PREVIEWS = {
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

export default function PortalSimulator() {
  const [activeTab, setActiveTab] = useState<Role>('student');

  return (
    <section id="success" className="py-20 border-t border-border max-w-7xl mx-auto px-6 w-full">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold tracking-tight">Role-Based Experiences</h2>
        <p className="text-muted mt-2">Interact with the tabs below to preview the actual portal configurations.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {(['student', 'faculty', 'parent', 'admin'] as const).map((role) => (
          <button
            key={role}
            onClick={() => setActiveTab(role)}
            className="relative px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all select-none"
          >
            {activeTab === role && (
              <motion.span
                layoutId="activePortalTab"
                className="absolute inset-0 bg-primary rounded-xl shadow-md"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className={`relative z-10 ${activeTab === role ? 'text-primary-foreground' : 'text-text hover:text-primary transition-colors'}`}>
              {role} Portal
            </span>
          </button>
        ))}
      </div>

      {/* Showcase Grid */}
      <div className="p-6 md:p-8 rounded-3xl border border-border bg-surface grid md:grid-cols-2 gap-8 items-center shadow-lg transition-all duration-300">
        
        {/* Text descriptions */}
        <div className="space-y-6">
          <h3 className="text-2xl font-extrabold tracking-tight">{ROLE_PREVIEWS[activeTab].title}</h3>
          <p className="text-muted text-sm leading-relaxed">{ROLE_PREVIEWS[activeTab].description}</p>
          
          <div className="space-y-3">
            {ROLE_PREVIEWS[activeTab].features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm font-semibold select-none">
                <CheckCircle size={16} className="text-success flex-shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Link 
              href="/auth/login" 
              className="inline-flex items-center justify-center px-6 h-11 rounded-xl bg-secondary hover:bg-secondary/95 text-white font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all gap-2 text-xs"
            >
              Access {activeTab} dashboard <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Live Simulator Viewport */}
        <div className="relative rounded-2xl border border-border bg-background p-5 h-[340px] flex flex-col justify-between shadow-inner overflow-hidden select-none">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-3 text-[10px] font-bold text-muted uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-success" /> Security SSL Active</span>
            <span className="text-primary">Preview: {activeTab}</span>
          </div>

          {/* Dynamic Content */}
          <div className="flex-1 py-4 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="h-full flex flex-col justify-between gap-3 text-xs"
              >
                {activeTab === 'student' && (
                  <div className="space-y-3 h-full flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-surface border border-border rounded-xl flex items-center justify-between">
                        <div>
                          <span className="block text-[9px] uppercase tracking-wider text-muted font-bold">Attendance</span>
                          <span className="text-sm font-black">87.5%</span>
                        </div>
                        <div className="w-1.5 h-8 bg-border rounded-full overflow-hidden">
                          <div className="h-4/5 bg-success rounded-full" />
                        </div>
                      </div>
                      <div className="p-3 bg-surface border border-border rounded-xl flex items-center justify-between">
                        <div>
                          <span className="block text-[9px] uppercase tracking-wider text-muted font-bold">CGPA Metric</span>
                          <span className="text-sm font-black">8.74</span>
                        </div>
                        <TrendingUp size={16} className="text-primary animate-pulse" />
                      </div>
                    </div>

                    <div className="p-3 bg-surface border border-border rounded-xl flex flex-col gap-1.5">
                      <span className="block text-[9px] uppercase tracking-wider text-muted font-bold">Today's Lectures</span>
                      <div className="flex items-center justify-between text-[10px] font-bold border-b border-border/40 pb-1">
                        <span>Database Systems</span>
                        <span className="text-primary">10:00 AM</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span>Operating Systems</span>
                        <span className="text-muted">11:30 AM</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-primary/5 border border-primary/10 rounded-xl flex items-center gap-2">
                      <Sparkles size={14} className="text-primary animate-pulse flex-shrink-0" />
                      <span className="text-[10px] text-primary/90 font-bold truncate">AI Advisor: You have 1 assignment pending for DBMS.</span>
                    </div>
                  </div>
                )}

                {activeTab === 'faculty' && (
                  <div className="space-y-3 h-full flex flex-col justify-between">
                    <div className="p-3 bg-surface border border-border rounded-xl flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="block text-[9px] uppercase tracking-wider text-muted font-bold">QR Attendance Generator</span>
                        <span className="block text-[10px] font-semibold text-text">Active: CSE-DBMS Lecture</span>
                      </div>
                      <div className="p-2 bg-accent rounded-lg border border-border flex items-center justify-center animate-pulse">
                        <QrCode size={18} className="text-primary" />
                      </div>
                    </div>

                    <div className="p-3 bg-surface border border-border rounded-xl flex flex-col gap-1.5">
                      <span className="block text-[9px] uppercase tracking-wider text-muted font-bold">Watchlist Warnings</span>
                      <div className="flex items-center justify-between text-[10px] font-bold border-b border-border/40 pb-1 text-red-500">
                        <span className="flex items-center gap-1"><AlertOctagon size={10} /> Jane Doe</span>
                        <span>68.2% Shortage</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-muted">
                        <span>Alex Rivera</span>
                        <span>74.5% Warning</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-secondary/5 border border-secondary/10 rounded-xl flex items-center gap-2">
                      <Clock size={14} className="text-secondary flex-shrink-0" />
                      <span className="text-[10px] text-secondary/90 font-bold">Pending: 3 Leave requests require your approval.</span>
                    </div>
                  </div>
                )}

                {activeTab === 'parent' && (
                  <div className="space-y-3 h-full flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-surface border border-border rounded-xl flex flex-col justify-between">
                        <span className="text-[9px] uppercase tracking-wider text-muted font-bold">Child Attendance</span>
                        <div className="flex items-center gap-1.5 mt-1 font-bold">
                          <CheckCircle size={14} className="text-success" />
                          <span>Present today</span>
                        </div>
                      </div>
                      <div className="p-3 bg-surface border border-border rounded-xl flex flex-col justify-between">
                        <span className="text-[9px] uppercase tracking-wider text-muted font-bold">Outstanding Fees</span>
                        <div className="flex items-center gap-1.5 mt-1 font-black text-primary">
                          <CreditCard size={14} />
                          <span>₹0.00 Due</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-surface border border-border rounded-xl flex flex-col gap-1">
                      <span className="block text-[9px] uppercase tracking-wider text-muted font-bold">Recent Academic Result</span>
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span>DBMS Midterm-1 Score</span>
                        <span className="text-primary font-black">92 / 100</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-success/5 border border-success/10 rounded-xl flex items-center gap-2">
                      <MessageSquare size={14} className="text-success flex-shrink-0" />
                      <span className="text-[10px] text-success/90 font-bold">Advisory: Contact Advisor is online for messaging.</span>
                    </div>
                  </div>
                )}

                {activeTab === 'admin' && (
                  <div className="space-y-3 h-full flex flex-col justify-between">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 bg-surface border border-border rounded-xl text-center">
                        <span className="block text-[8px] uppercase tracking-wider text-muted font-bold">Students</span>
                        <span className="text-xs font-black">15,240</span>
                      </div>
                      <div className="p-2 bg-surface border border-border rounded-xl text-center">
                        <span className="block text-[8px] uppercase tracking-wider text-muted font-bold">Faculty</span>
                        <span className="text-xs font-black">450</span>
                      </div>
                      <div className="p-2 bg-surface border border-border rounded-xl text-center">
                        <span className="block text-[8px] uppercase tracking-wider text-muted font-bold">Placement</span>
                        <span className="text-xs font-black text-success">98.2%</span>
                      </div>
                    </div>

                    <div className="p-3 bg-surface border border-border rounded-xl flex flex-col gap-1 text-[9px] font-mono h-[90px] overflow-hidden">
                      <span className="block text-[8px] uppercase tracking-wider text-muted font-bold font-sans mb-1">System Audit Logs</span>
                      <div className="text-success flex justify-between border-b border-border/40 pb-0.5">
                        <span>[DB] INSERT INTO profiles</span>
                        <span>SUCCESS</span>
                      </div>
                      <div className="text-primary flex justify-between border-b border-border/40 pb-0.5">
                        <span>[SYS] CSV Student Bulk Import</span>
                        <span>SUCCESS</span>
                      </div>
                      <div className="text-muted flex justify-between">
                        <span>[API] Fetch active notice data</span>
                        <span>12ms</span>
                      </div>
                    </div>

                    <div className="p-2 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center gap-2">
                      <Activity size={12} className="text-red-500 animate-pulse flex-shrink-0" />
                      <span className="text-[9px] text-red-500 font-bold truncate">Root Node: Global System Status Operational</span>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-[9px] text-muted-foreground border-t border-border pt-3">
            <span>Terminal: Online</span>
            <span className="font-semibold text-primary uppercase">{activeTab} VIEW</span>
          </div>
        </div>

      </div>
    </section>
  );
}
