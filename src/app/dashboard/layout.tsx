'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Client-side role guard
    const segments = pathname.split('/');
    const dashboardRole = segments[2]; // /dashboard/[role]/... -> segments[2] is [role]
    
    if (dashboardRole && dashboardRole !== 'auth') {
      const userRole = user.role;
      // Admin has access to all dashboard routes. Other roles must match exactly.
      if (userRole !== 'admin' && userRole !== dashboardRole) {
        router.push(`/dashboard/${userRole}`);
      }
    }
  }, [user, loading, pathname, router, mounted]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-background text-text flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-xs font-semibold text-muted">Securing ASTRIX Session...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, wait for redirection to fire
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
