'use strict';

'use client';

import React, { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [dotPosition, setDotPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [rotation, setRotation] = useState(0);
  
  // Track trailing sparkles
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; scale: number; angle: number }[]>([]);
  const sparkleIdRef = useRef(0);

  useEffect(() => {
    const checkDevice = () => {
      const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const notMobileWidth = window.innerWidth >= 1024;
      setIsMobile(!hasHover || !notMobileWidth);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    if (isMobile) {
      document.body.classList.remove('custom-cursor-active');
      return () => window.removeEventListener('resize', checkDevice);
    }

    let mouseX = -100;
    let mouseY = -100;
    let followX = -100;
    let followY = -100;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Instant center mapping for snappiness (zero delay in CSS)
      setDotPosition({ x: e.clientX, y: e.clientY });
      
      const velocity = Math.abs(e.movementX) + Math.abs(e.movementY);
      setRotation(prev => (prev + velocity * 1.5) % 360);

      // Randomly spawn a tiny sparkle particle when moving or hovering
      if (velocity > 6 && Math.random() > 0.45) {
        spawnSparkle(e.clientX, e.clientY);
      }
    };

    const spawnSparkle = (x: number, y: number) => {
      const id = sparkleIdRef.current++;
      const angle = Math.random() * Math.PI * 2;
      const offset = Math.random() * 6 + 4;
      const px = x + Math.cos(angle) * offset;
      const py = y + Math.sin(angle) * offset;
      
      setSparkles(prev => [
        ...prev.slice(-10), // Keep array small for performance
        { id, x: px, y: py, scale: Math.random() * 0.6 + 0.4, angle: Math.random() * 360 }
      ]);

      // Remove particle after lifespan
      setTimeout(() => {
        setSparkles(prev => prev.filter(s => s.id !== id));
      }, 500);
    };

    const updatePhysics = () => {
      // Lerping for the soft glowing sparkle ball trailer
      const dx = mouseX - followX;
      const dy = mouseY - followY;
      followX += dx * 0.12;
      followY += dy * 0.12;

      setPosition({ x: followX, y: followY });
      rafId = requestAnimationFrame(updatePhysics);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('button') ||
        target.closest('a') ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.classList.contains('cursor-pointer') ||
        target.getAttribute('role') === 'button'
      ) {
        setIsHovered(true);
        // Burst of particles on hover enter
        for (let i = 0; i < 3; i++) {
          setTimeout(() => spawnSparkle(mouseX, mouseY), i * 60);
        }
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    rafId = requestAnimationFrame(updatePhysics);

    document.body.classList.add('custom-cursor-active');

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(rafId);
      document.body.classList.remove('custom-cursor-active');
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <>
      {/* Outer soft radial glow (Sparkle Ball) */}
      <div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isHovered ? '46px' : '30px',
          height: isHovered ? '46px' : '30px',
          background: isHovered 
            ? 'radial-gradient(circle, rgba(212, 160, 23, 0.35) 0%, rgba(212, 160, 23, 0.05) 55%, transparent 80%)'
            : 'radial-gradient(circle, rgba(212, 160, 23, 0.18) 0%, rgba(212, 160, 23, 0.02) 60%, transparent 80%)',
          filter: 'blur(3px)',
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.2s ease-out, height 0.2s ease-out, background 0.2s ease-out',
        }}
      />

      {/* Outer rotating dashed indicator */}
      <div
        className="fixed top-0 left-0 rounded-full border border-dashed pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isHovered ? '26px' : '14px',
          height: isHovered ? '26px' : '14px',
          borderColor: isHovered ? 'rgba(212, 160, 23, 0.85)' : 'rgba(212, 160, 23, 0.25)',
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        }}
      />

      {/* Trailing sparkles */}
      {sparkles.map(spark => (
        <div
          key={spark.id}
          className="fixed top-0 left-0 pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500"
          style={{
            left: `${spark.x}px`,
            top: `${spark.y}px`,
            transform: `translate(-50%, -50%) rotate(${spark.angle}deg) scale(${spark.scale})`,
          }}
        >
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z" fill="#FFF2CC" opacity="0.75" />
          </svg>
        </div>
      ))}

      {/* Inner precise star pointer (Instant response for UX precision) */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${dotPosition.x}px`,
          top: `${dotPosition.y}px`,
          transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${isHovered ? 1.25 : 1})`,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Custom 8-point compass star */}
          <path d="M12 2L14.2 9.2L22 12L14.2 14.8L12 22L9.8 14.8L2 12L9.8 9.2Z" fill="#d4a017" stroke="#FFF2CC" strokeWidth="0.75" />
          <path d="M12 6L13.2 10.8L18 12L13.2 13.2L12 18L10.8 13.2L6 12L10.8 10.8Z" fill="#FFF2CC" />
          <circle cx="12" cy="12" r="1" fill="#FFFFFF" />
        </svg>
      </div>
    </>
  );
}
