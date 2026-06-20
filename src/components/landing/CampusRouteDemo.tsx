'use client';

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Compass, RefreshCw } from 'lucide-react';

export default function CampusRouteDemo() {
  const [routeActive, setRouteActive] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => setRouteActive(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const pathDefinition = "M 40 140 Q 110 50 170 70 T 260 110";

  return (
    <div className="w-full max-w-md mx-auto bg-surface border border-border rounded-3xl p-6 shadow-xl flex flex-col gap-6 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Compass className="text-primary animate-spin-slow" size={20} />
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider">Campus Route Simulator</h4>
            <span className="block text-[9px] text-muted-foreground font-semibold">Lightweight Node SVG Navigator</span>
          </div>
        </div>
        <button 
          onClick={() => { setRouteActive(false); setTimeout(() => setRouteActive(true), 150); }}
          className="p-1.5 rounded-lg border border-border bg-background hover:bg-accent text-text transition-all"
          aria-label="Restart route simulation"
        >
          <RefreshCw size={12} className={routeActive ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Map Content */}
      <div className="relative border border-border/40 rounded-2xl bg-background/50 h-[180px] overflow-hidden shadow-inner">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

        <svg className="w-full h-full" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Default Path Outline */}
          <path
            d={pathDefinition}
            stroke="var(--border)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="4 6"
          />

          {/* Active Highlighted Route path */}
          {routeActive && (
            <motion.path
              d={pathDefinition}
              stroke="var(--primary)"
              strokeWidth="3.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: shouldReduceMotion ? 0.2 : 2.2,
                ease: "easeInOut",
              }}
            />
          )}

          {/* Nodes */}
          {/* Main Gate */}
          <circle cx="40" cy="140" r="5" fill="#10B981" />
          {/* Admin Block */}
          <circle cx="170" cy="70" r="5" fill="var(--primary)" />
          {/* AIML Block */}
          <circle cx="260" cy="110" r="6" fill="#6D28D9" />
        </svg>

        {/* Floating Node Labels */}
        <div className="absolute left-[20px] top-[142px] bg-surface border border-border px-1.5 py-0.5 rounded text-[8px] font-bold shadow-sm select-none">
          📍 Main Gate
        </div>
        <div className="absolute left-[135px] top-[38px] bg-surface border border-border px-1.5 py-0.5 rounded text-[8px] font-bold shadow-sm select-none">
          🏢 Admin Block
        </div>
        <div className="absolute left-[210px] top-[120px] bg-surface border border-border px-1.5 py-0.5 rounded text-[8px] font-bold shadow-sm select-none">
          ⚡ AIML Block
        </div>
      </div>

      {/* Info panel */}
      <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-4 text-xs font-semibold">
        <div className="p-3 bg-accent/20 border border-border/40 rounded-xl flex flex-col gap-0.5">
          <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Distance</span>
          <span className="text-sm font-black text-primary">320 meters</span>
        </div>
        <div className="p-3 bg-accent/20 border border-border/40 rounded-xl flex flex-col gap-0.5">
          <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Estimated Walk</span>
          <span className="text-sm font-black text-primary">4 minutes</span>
        </div>
      </div>
    </div>
  );
}
