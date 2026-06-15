'use strict';

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/theme-provider';
import { db } from '@/lib/db-client';
import { AstrixLogo } from '@/components/branding';
import { 
  Sun, 
  Moon, 
  Mail, 
  Lock, 
  User, 
  Briefcase, 
  Users, 
  GraduationCap, 
  ShieldCheck,
  Loader2,
  ArrowRight
} from 'lucide-react';

function LoginPanel() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [role, setRole] = useState<'student' | 'faculty' | 'parent' | 'admin'>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Set active tab based on query param
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'register') {
      setActiveTab('register');
    }
  }, [searchParams]);

  // Handle standard login
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (activeTab === 'login') {
        // Query database to find a matching profile
        const profiles = await db.profiles.select({ email });
        const userProfile = profiles[0];

        if (userProfile) {
          // Success! Save session locally and redirect
          localStorage.setItem('astrix-user', JSON.stringify(userProfile));
          setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
          setTimeout(() => {
            router.push(`/dashboard/${userProfile.role}`);
          }, 800);
        } else {
          // Fallback if not in database, match default emails
          let fallbackRole: 'student' | 'faculty' | 'parent' | 'admin' | null = null;
          let fallbackName = '';
          
          if (email.includes('admin')) {
            fallbackRole = 'admin';
            fallbackName = 'Dr. Sarah Jenkins';
          } else if (email.includes('turing') || email.includes('faculty')) {
            fallbackRole = 'faculty';
            fallbackName = 'Dr. Alan Turing';
          } else if (email.includes('doe') || email.includes('student')) {
            fallbackRole = 'student';
            fallbackName = 'John Doe';
          } else if (email.includes('parent')) {
            fallbackRole = 'parent';
            fallbackName = 'Richard Doe';
          }

          if (fallbackRole) {
            const fallbackProfile = {
              id: `u-${fallbackRole}-mock`,
              name: fallbackName,
              email,
              role: fallbackRole
            };
            localStorage.setItem('astrix-user', JSON.stringify(fallbackProfile));
            setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
            setTimeout(() => {
              router.push(`/dashboard/${fallbackRole}`);
            }, 800);
          } else {
            setMessage({ type: 'error', text: 'Account not found. Try Quick Login options below.' });
          }
        }
      } else if (activeTab === 'register') {
        if (!name || !email || !password) {
          setMessage({ type: 'error', text: 'All fields are required.' });
          setIsLoading(false);
          return;
        }

        // 1. Create Profile
        const newProfile = await db.profiles.insert({
          name,
          email,
          role,
        });

        // 2. Set role-specific relational record
        if (role === 'student') {
          await db.students.insert({
            profile_id: newProfile.id,
            register_number: `REG${Math.floor(100000 + Math.random() * 900000)}`,
            department_id: 'd-cse',
            year: 1,
            semester: 1,
            cgpa: 0.00
          });
        } else if (role === 'faculty') {
          await db.faculty.insert({
            profile_id: newProfile.id,
            faculty_id: `FAC-${Math.floor(1000 + Math.random() * 9000)}`,
            department_id: 'd-cse',
            designation: 'Assistant Professor'
          });
        } else if (role === 'parent') {
          await db.parents.insert({
            profile_id: newProfile.id,
            student_id: 'u-student-1',
            relation: 'Parent'
          });
        }

        localStorage.setItem('astrix-user', JSON.stringify(newProfile));
        setMessage({ type: 'success', text: 'Registration successful! Directing to dashboard...' });
        setTimeout(() => {
          router.push(`/dashboard/${role}`);
        }, 800);
      } else {
        // Forgot Password
        setMessage({ type: 'success', text: 'Password reset link sent to your email.' });
        setTimeout(() => setActiveTab('login'), 2000);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Authentication error.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Developer Quick Login bypass
  const handleQuickLogin = async (selectedRole: 'student' | 'faculty' | 'parent' | 'admin') => {
    setIsLoading(true);
    let mockEmail = '';
    if (selectedRole === 'admin') mockEmail = 'admin@astrix.edu';
    else if (selectedRole === 'faculty') mockEmail = 'turing@astrix.edu';
    else if (selectedRole === 'student') mockEmail = 'john.doe@astrix.edu';
    else if (selectedRole === 'parent') mockEmail = 'richard.doe@gmail.com';

    try {
      const profiles = await db.profiles.select({ email: mockEmail });
      const profile = profiles[0];
      if (profile) {
        localStorage.setItem('astrix-user', JSON.stringify(profile));
        router.push(`/dashboard/${selectedRole}`);
      } else {
        // Hard fallback if profiles aren't seeded yet
        const defaultProfile = {
          id: `u-${selectedRole}-mock`,
          name: selectedRole === 'admin' ? 'Dr. Sarah Jenkins' : selectedRole === 'faculty' ? 'Dr. Alan Turing' : selectedRole === 'student' ? 'John Doe' : 'Richard Doe',
          email: mockEmail,
          role: selectedRole
        };
        localStorage.setItem('astrix-user', JSON.stringify(defaultProfile));
        router.push(`/dashboard/${selectedRole}`);
      }
    } catch (e) {
      router.push(`/dashboard/${selectedRole}`);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden text-text">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-100 transform transition-transform duration-1000 ease-out"
        style={{ 
          backgroundImage: "url('/campus-library.png')",
        }}
      />
      {/* Overlay - twilight tone depending on theme */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-background/95 dark:from-black/85 dark:via-black/70 dark:to-background/95 pointer-events-none" />

      <div className="absolute top-4 right-4 flex gap-2 z-20">
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-sm shadow-md"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} className="text-primary" /> : <Moon size={16} className="text-white" />}
        </button>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-90 transition-opacity">
          <AstrixLogo size={36} className="text-white" />
        </Link>
        <h2 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm">
          {activeTab === 'login' && 'Access Campus Portal'}
          {activeTab === 'register' && 'Create Your Campus Account'}
          {activeTab === 'forgot' && 'Reset Your Password'}
        </h2>
        <p className="mt-2 text-sm text-white/80 font-medium">
          {activeTab === 'login' && (
            <>
              Or{' '}
              <button onClick={() => setActiveTab('register')} className="text-primary hover:underline font-bold">
                create an account
              </button>
            </>
          )}
          {activeTab === 'register' && (
            <>
              Already have an account?{' '}
              <button onClick={() => setActiveTab('login')} className="text-primary hover:underline font-bold">
                Sign in instead
              </button>
            </>
          )}
          {activeTab === 'forgot' && (
            <button onClick={() => setActiveTab('login')} className="text-primary hover:underline font-bold">
              Return to Login
            </button>
          )}
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="glass py-8 px-6 border border-white/10 shadow-2xl rounded-2xl sm:px-10 backdrop-blur-md">
          {message && (
            <div className={`mb-4 p-3 rounded-xl text-xs font-semibold ${
              message.type === 'success' 
                ? 'bg-success/10 text-success border border-success/20' 
                : 'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}>
              {message.text}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleAuth}>
            {activeTab === 'forgot' ? (
              <div>
                <label htmlFor="reset-email" className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <Mail size={16} />
                  </div>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-border rounded-xl bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="you@astrix.edu"
                  />
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'register' && (
                  <div>
                    <label htmlFor="reg-name" className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                        <User size={16} />
                      </div>
                      <input
                        id="reg-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-border rounded-xl bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                      <Mail size={16} />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-border rounded-xl bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="you@astrix.edu"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-muted">Password</label>
                    {activeTab === 'login' && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('forgot')}
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                      <Lock size={16} />
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-border rounded-xl bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {activeTab === 'register' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Assign Account Role</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['student', 'faculty', 'parent', 'admin'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                            role === r 
                              ? 'bg-primary border-primary text-primary-foreground shadow-sm' 
                              : 'bg-background border-border hover:bg-accent'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all gap-2"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : activeTab === 'login' ? (
                  'Sign In'
                ) : activeTab === 'register' ? (
                  'Create Account'
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </div>
          </form>

          {/* DEVELOPER QUICK LOGIN BYPASS */}
          <div className="mt-8 border-t border-border pt-6">
            <span className="block text-center text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-4">
              Developer Quick-Login Portals
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('student')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 border border-border rounded-xl bg-background hover:bg-accent text-xs font-semibold transition-all group"
              >
                <GraduationCap size={14} className="text-secondary" /> Student <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('faculty')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 border border-border rounded-xl bg-background hover:bg-accent text-xs font-semibold transition-all group"
              >
                <Briefcase size={14} className="text-primary" /> Faculty <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('parent')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 border border-border rounded-xl bg-background hover:bg-accent text-xs font-semibold transition-all group"
              >
                <Users size={14} className="text-success" /> Parent <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 border border-border rounded-xl bg-background hover:bg-accent text-xs font-semibold transition-all group"
              >
                <ShieldCheck size={14} className="text-red-500" /> Admin <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background text-text flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    }>
      <LoginPanel />
    </Suspense>
  );
}
