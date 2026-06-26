'use strict';

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/theme-provider';
import { useAuth } from '@/components/auth-provider';
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
  
  const { signIn, signUp, resetPassword, updatePassword } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot' | 'reset-callback'>('login');
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
    } else if (tab === 'reset-callback') {
      setActiveTab('reset-callback');
    }
  }, [searchParams]);

  // Handle standard login
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (activeTab === 'login') {
        const res = await signIn(email, password);
        if (res.error) {
          setMessage({ type: 'error', text: res.error.message || 'Authentication error.' });
        } else {
          setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
          const userStr = localStorage.getItem('astrix-user');
          const userRole = userStr ? JSON.parse(userStr).role : 'student';
          setTimeout(() => {
            router.push(`/dashboard/${userRole}`);
          }, 800);
        }
      } else if (activeTab === 'register') {
        if (!name || !email || !password) {
          setMessage({ type: 'error', text: 'All fields are required.' });
          setIsLoading(false);
          return;
        }

        const res = await signUp(email, password, name, role);
        if (res.error) {
          setMessage({ type: 'error', text: res.error.message || 'Registration failed.' });
        } else {
          setMessage({ type: 'success', text: 'Registration successful! Directing to dashboard...' });
          setTimeout(() => {
            router.push(`/dashboard/${role}`);
          }, 800);
        }
      } else if (activeTab === 'forgot') {
        const res = await resetPassword(email);
        if (res.error) {
          setMessage({ type: 'error', text: res.error.message || 'Password reset failed.' });
        } else {
          setMessage({ type: 'success', text: 'Password reset link sent to your email.' });
          setTimeout(() => setActiveTab('login'), 2000);
        }
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Authentication error.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset update password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await updatePassword(password);
      if (res.error) {
        setMessage({ type: 'error', text: res.error.message || 'Failed to update password.' });
      } else {
        setMessage({ type: 'success', text: 'Password updated successfully! Redirecting to login...' });
        setTimeout(() => {
          setActiveTab('login');
          router.push('/auth/login');
        }, 1500);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error updating password.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Developer Quick Login bypass
  const handleQuickLogin = async (selectedRole: 'student' | 'faculty' | 'parent' | 'admin') => {
    setIsLoading(true);
    setMessage(null);
    let mockEmail = '';
    if (selectedRole === 'admin') mockEmail = 'admin@astrix.edu';
    else if (selectedRole === 'faculty') mockEmail = 'turing@astrix.edu';
    else if (selectedRole === 'student') mockEmail = 'john.doe@astrix.edu';
    else if (selectedRole === 'parent') mockEmail = 'richard.doe@gmail.com';

    try {
      const res = await signIn(mockEmail, 'Password123!');
      if (res.error) {
        const setupRes = await fetch('/api/admin/setup-db').then(r => r.json()).catch(() => ({ mode: 'local' }));
        if (setupRes.mode === 'mongodb') {
          setMessage({ 
            type: 'error', 
            text: `Quick-login account (${mockEmail}) not found in MongoDB. Please register this account first or click reset db in admin dashboard.` 
          });
          setIsLoading(false);
          return;
        } else {
          const profiles = await db.profiles.select({ email: mockEmail });
          const profile = profiles[0];
          if (profile) {
            localStorage.setItem('astrix-user', JSON.stringify(profile));
            document.cookie = `astrix-user-session=${encodeURIComponent(JSON.stringify(profile))}; path=/; max-age=86400; SameSite=Lax`;
            router.push(`/dashboard/${selectedRole}`);
          } else {
            const defaultProfile = {
              id: `u-${selectedRole}-mock`,
              name: selectedRole === 'admin' ? 'Dr. Sarah Jenkins' : selectedRole === 'faculty' ? 'Dr. Alan Turing' : selectedRole === 'student' ? 'John Doe' : 'Richard Doe',
              email: mockEmail,
              role: selectedRole
            };
            localStorage.setItem('astrix-user', JSON.stringify(defaultProfile));
            document.cookie = `astrix-user-session=${encodeURIComponent(JSON.stringify(defaultProfile))}; path=/; max-age=86400; SameSite=Lax`;
            router.push(`/dashboard/${selectedRole}`);
          }
        }
      } else {
        const userStr = localStorage.getItem('astrix-user');
        const userRole = userStr ? JSON.parse(userStr).role : selectedRole;
        setMessage({ type: 'success', text: `Logged in as ${selectedRole}! Redirecting...` });
        setTimeout(() => {
          router.push(`/dashboard/${userRole}`);
        }, 800);
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Quick login failed.' });
    } finally {
      setIsLoading(false);
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
          {activeTab === 'reset-callback' && 'Update Your Password'}
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
          {activeTab === 'reset-callback' && (
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

          <form className="space-y-5" onSubmit={activeTab === 'reset-callback' ? handleUpdatePassword : handleAuth}>
            {activeTab === 'reset-callback' ? (
              <div>
                <label htmlFor="new-password" className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <Lock size={16} />
                  </div>
                  <input
                    id="new-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-border rounded-xl bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            ) : activeTab === 'forgot' ? (
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
                ) : activeTab === 'reset-callback' ? (
                  'Update Password'
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
