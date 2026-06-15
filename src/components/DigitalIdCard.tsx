'use strict';

'use client';

import React, { useState } from 'react';
import { useTheme } from '@/components/theme-provider';
import { Shield, Sparkles, User, QrCode } from 'lucide-react';

interface IdCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'faculty' | 'parent' | 'admin';
    avatar_url?: string;
    phone?: string;
    register_number?: string;
    faculty_id?: string;
    department_name?: string;
    year?: number;
    semester?: number;
    student_name?: string; // For parents
  };
}

export default function DigitalIdCard({ user }: IdCardProps) {
  const { theme } = useTheme();
  const [isFlipped, setIsFlipped] = useState(false);

  const roleColors = {
    student: 'from-violet-500/20 to-primary/20 border-primary/30',
    faculty: 'from-amber-500/20 to-violet-500/20 border-violet-500/30',
    parent: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
    admin: 'from-red-500/20 to-rose-600/20 border-red-500/30',
  };

  const roleText = {
    student: 'STUDENT ID',
    faculty: 'FACULTY CARD',
    parent: 'PARENT ACCESS',
    admin: 'ADMINISTRATOR',
  };

  const handleCardClick = () => {
    // Parent ID does not need a QR flip since there's no QR Code for Parent
    if (user.role !== 'parent') {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* 3D Container */}
      <div 
        className="w-[320px] h-[480px] cursor-pointer group"
        onClick={handleCardClick}
        style={{ perspective: '1200px' }}
      >
        {/* Card Body with 3D Flip */}
        <div 
          className="w-full h-full relative transition-transform duration-700 ease-out"
          style={{ 
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          
          {/* FRONT SIDE */}
          <div 
            className={`absolute inset-0 w-full h-full rounded-2xl glass border p-6 flex flex-col justify-between shadow-2xl bg-gradient-to-br ${roleColors[user.role] || roleColors.student}`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Front Top */}
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded bg-gradient-to-tr from-secondary to-primary flex items-center justify-center font-bold text-white text-xs">
                  A
                </div>
                <span className="font-extrabold text-sm tracking-widest text-text">ASTRIX</span>
              </div>
              <span className={`text-[10px] font-extrabold tracking-widest px-2.5 py-0.5 rounded-full ${
                user.role === 'admin' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                user.role === 'faculty' ? 'bg-secondary/20 text-secondary border border-secondary/30' :
                user.role === 'parent' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' :
                'bg-primary/20 text-primary border border-primary/30'
              }`}>
                {roleText[user.role]}
              </span>
            </div>

            {/* Front Middle (Photo & Main Details) */}
            <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
              <div className="relative w-24 h-24 rounded-full p-1 border-2 border-primary/50 bg-background/50 overflow-hidden shadow-lg mb-4 flex items-center justify-center">
                {user.avatar_url ? (
                  <>
                    <img 
                      src={user.avatar_url} 
                      alt={user.name} 
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const fallback = (e.target as HTMLImageElement).nextElementSibling;
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-tr from-secondary/30 to-primary/30 text-text font-black text-2xl rounded-full">
                      {user.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-accent text-muted rounded-full">
                    <User size={40} />
                  </div>
                )}
              </div>
              <h3 className="font-bold text-xl tracking-tight mb-1">{user.name}</h3>
              <p className="text-xs text-muted font-semibold mb-3">{user.email}</p>

              {/* Dynamic Details based on Role */}
              <div className="w-full bg-background/35 border border-border/30 rounded-xl p-3 text-xs space-y-2">
                {user.role === 'student' && (
                  <>
                    <div className="flex justify-between"><span className="text-muted">Dept:</span><span className="font-bold">{user.department_name || 'CSE'}</span></div>
                    <div className="flex justify-between"><span className="text-muted">Reg No:</span><span className="font-bold">{user.register_number || '2023CSE1024'}</span></div>
                    <div className="flex justify-between"><span className="text-muted">Year / Sem:</span><span className="font-bold">Year {user.year || 3} / Sem {user.semester || 5}</span></div>
                  </>
                )}
                {user.role === 'faculty' && (
                  <>
                    <div className="flex justify-between"><span className="text-muted">Designation:</span><span className="font-bold">{user.faculty_id ? 'Professor' : 'Professor & HOD'}</span></div>
                    <div className="flex justify-between"><span className="text-muted">Faculty ID:</span><span className="font-bold">{user.faculty_id || 'FAC-CSE-001'}</span></div>
                    <div className="flex justify-between"><span className="text-muted">Dept:</span><span className="font-bold">{user.department_name || 'Computer Science'}</span></div>
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <div className="flex justify-between"><span className="text-muted">Role:</span><span className="font-bold">System Administrator</span></div>
                    <div className="flex justify-between"><span className="text-muted">Office:</span><span className="font-bold">Admin Block, Room 104</span></div>
                    <div className="flex justify-between"><span className="text-muted">Clearance:</span><span className="font-bold text-red-500">Level 5 (Full)</span></div>
                  </>
                )}
                {user.role === 'parent' && (
                  <>
                    <div className="flex justify-between"><span className="text-muted">Relation:</span><span className="font-bold">Parent / Guardian</span></div>
                    <div className="flex justify-between"><span className="text-muted">Student:</span><span className="font-bold">{user.student_name || 'John Doe'}</span></div>
                    <div className="flex justify-between"><span className="text-muted">Contact:</span><span className="font-bold">{user.phone || '+1 (555) 010-0102'}</span></div>
                  </>
                )}
              </div>
            </div>

            {/* Front Bottom */}
            <div className="border-t border-border/40 pt-4 flex items-center justify-between text-[10px] text-muted font-bold">
              <div className="flex items-center gap-1">
                <Shield size={12} className="text-success" /> Verified System
              </div>
              {user.role !== 'parent' && <span className="text-primary hover:underline flex items-center gap-0.5">Flip for QR <Sparkles size={10} /></span>}
            </div>
          </div>

          {/* BACK SIDE */}
          {user.role !== 'parent' && (
            <div 
              className={`absolute inset-0 w-full h-full rounded-2xl glass border p-6 flex flex-col justify-between shadow-2xl bg-gradient-to-br ${roleColors[user.role] || roleColors.student}`}
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              {/* Back Top */}
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <span className="font-extrabold text-xs tracking-wider text-muted">SECURITY SIGNATURE</span>
                <span className="text-[10px] text-primary font-extrabold tracking-widest">{user.role.toUpperCase()}</span>
              </div>

              {/* Back Middle (QR Code) */}
              <div className="flex-1 flex flex-col items-center justify-center py-4">
                <div className="w-40 h-40 bg-white p-3 rounded-xl shadow-lg border border-border/20 flex items-center justify-center mb-4">
                  {/* Clean Mock QR Code SVG */}
                  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0" y="0" width="100" height="100" fill="white"/>
                    {/* Corners */}
                    <rect x="5" y="5" width="25" height="25" fill="black" />
                    <rect x="10" y="10" width="15" height="15" fill="white" />
                    <rect x="13" y="13" width="9" height="9" fill="black" />

                    <rect x="70" y="5" width="25" height="25" fill="black" />
                    <rect x="75" y="10" width="15" height="15" fill="white" />
                    <rect x="78" y="13" width="9" height="9" fill="black" />

                    <rect x="5" y="70" width="25" height="25" fill="black" />
                    <rect x="10" y="75" width="15" height="15" fill="white" />
                    <rect x="13" y="78" width="9" height="9" fill="black" />

                    {/* Small inner locator */}
                    <rect x="75" y="75" width="10" height="10" fill="black" />

                    {/* Random QR Grid Lines for premium look */}
                    <rect x="35" y="5" width="5" height="10" fill="black" />
                    <rect x="45" y="10" width="10" height="5" fill="black" />
                    <rect x="35" y="20" width="25" height="5" fill="black" />
                    <rect x="40" y="25" width="5" height="10" fill="black" />
                    <rect x="55" y="5" width="5" height="15" fill="black" />

                    <rect x="5" y="35" width="10" height="5" fill="black" />
                    <rect x="20" y="40" width="10" height="10" fill="black" />
                    <rect x="5" y="55" width="15" height="5" fill="black" />

                    <rect x="35" y="35" width="15" height="15" fill="black" />
                    <rect x="38" y="38" width="9" height="9" fill="white" />
                    <rect x="41" y="41" width="3" height="3" fill="black" />

                    <rect x="55" y="35" width="10" height="5" fill="black" />
                    <rect x="55" y="45" width="5" height="15" fill="black" />
                    <rect x="40" y="55" width="10" height="10" fill="black" />

                    <rect x="70" y="35" width="15" height="5" fill="black" />
                    <rect x="85" y="40" width="10" height="15" fill="black" />
                    <rect x="70" y="55" width="5" height="10" fill="black" />

                    <rect x="35" y="70" width="5" height="15" fill="black" />
                    <rect x="45" y="75" width="15" height="5" fill="black" />
                    <rect x="55" y="85" width="20" height="5" fill="black" />
                    <rect x="35" y="90" width="25" height="5" fill="black" />
                  </svg>
                </div>
                <span className="text-xs font-mono font-bold">{user.id}</span>
                <span className="text-[9px] text-muted font-semibold mt-1">Scan to verify credentials</span>
              </div>

              {/* Back Bottom */}
              <div className="border-t border-border/40 pt-4 text-[9px] text-muted font-bold text-center leading-relaxed">
                ASTRIX Smart Campus Verification Portal. If found, please return to Admin Block. Credentials encrypted under SHA-256.
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Instructions */}
      {user.role !== 'parent' && (
        <span className="mt-3 text-xs text-muted flex items-center gap-1 animate-pulse">
          <QrCode size={12} /> Tap ID card to flip
        </span>
      )}
    </div>
  );
}
