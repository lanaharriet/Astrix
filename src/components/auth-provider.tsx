'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export type UserProfile = {
  id: string;
  name: string;
  full_name: string;
  email: string;
  role: 'student' | 'faculty' | 'parent' | 'admin';
  department?: string;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
};

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string, role: 'student' | 'faculty' | 'parent' | 'admin') => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const profile = await res.json();
          setUser(profile);
          localStorage.setItem('astrix-user', JSON.stringify(profile));
        } else {
          // Fallback check to local storage if token request was not successful
          const localUser = localStorage.getItem('astrix-user');
          if (localUser) {
            setUser(JSON.parse(localUser));
          }
        }
      } catch (err) {
        console.error('Error checking authentication status:', err);
        const localUser = localStorage.getItem('astrix-user');
        if (localUser) {
          setUser(JSON.parse(localUser));
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Sync cookie for middleware protection (in addition to HttpOnly token cookie)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (user) {
        const cookieVal = encodeURIComponent(JSON.stringify({
          id: user.id,
          email: user.email,
          role: user.role,
        }));
        document.cookie = `astrix-user-session=${cookieVal}; path=/; max-age=86400; SameSite=Lax`;
      } else {
        document.cookie = 'astrix-user-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    }
  }, [user]);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }
      setUser(data);
      localStorage.setItem('astrix-user', JSON.stringify(data));
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, name: string, role: 'student' | 'faculty' | 'parent' | 'admin') => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      setUser(data);
      localStorage.setItem('astrix-user', JSON.stringify(data));
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Error signing out:', e);
    }
    setUser(null);
    localStorage.removeItem('astrix-user');
    router.push('/auth/login');
  };

  const resetPassword = async (email: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Reset password request failed');
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Update password request failed');
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
