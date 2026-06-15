'use strict';

import React from 'react';

interface BrandingProps {
  className?: string;
  size?: number;
}

// 1. COMPACT ICON: Academic Shield + Technology Compass Star
export function AstrixIcon({ className = '', size = 32 }: BrandingProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
    >
      {/* Premium Outer Gold Shield */}
      <path
        d="M50 5 L88 20 C88 55 70 82 50 95 C30 82 12 55 12 20 L50 5 Z"
        fill="url(#gold-shield-grad)"
        stroke="var(--primary)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      
      {/* Inner Dark Shield background */}
      <path
        d="M50 10 L82 23 C82 52 67 76 50 88 C33 76 18 52 18 23 L50 10 Z"
        fill="#13161C"
        opacity="0.8"
      />

      {/* 8-Point Technology Compass Star */}
      {/* Vertical Points */}
      <path d="M50 22 L54 46 L50 50 L46 46 Z" fill="var(--primary)" />
      <path d="M50 78 L54 54 L50 50 L46 54 Z" fill="var(--primary)" />
      
      {/* Horizontal Points */}
      <path d="M78 50 L54 54 L50 50 L54 46 Z" fill="var(--primary)" />
      <path d="M22 50 L46 54 L50 50 L46 46 Z" fill="var(--primary)" />

      {/* Diagonal Points (Violet Secondary) */}
      <path d="M70 30 L53 47 L50 50 L47 47 Z" fill="var(--secondary)" />
      <path d="M30 70 L47 53 L50 50 L53 53 Z" fill="var(--secondary)" />
      <path d="M70 70 L53 53 L50 50 L47 53 Z" fill="var(--secondary)" />
      <path d="M30 30 L47 47 L50 50 L53 47 Z" fill="var(--secondary)" />

      {/* Central Connectivity Nodes */}
      <circle cx="50" cy="50" r="4" fill="#FFFFFF" stroke="var(--primary)" strokeWidth="1" />

      {/* SVG Gradients definitions */}
      <defs>
        <radialGradient id="gold-shield-grad" cx="50%" cy="30%" r="55%">
          <stop offset="0%" stopColor="#FFF2CC" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#1A1D24" stopOpacity="0.4" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// 2. FULL LOGO: Icon + Wordmark + Tagline
export function AstrixLogo({ className = '', size = 36 }: BrandingProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <AstrixIcon size={size} />
      <div className="flex flex-col select-none">
        <span className="font-sans font-extrabold tracking-wider text-xl leading-none text-text">
          ASTRIX
        </span>
        <span className="text-[9px] font-bold tracking-widest text-primary uppercase mt-1">
          One Campus. Infinite Possibilities.
        </span>
      </div>
    </div>
  );
}
