'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertOctagon, RefreshCw, Home, LayoutDashboard } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [dashboardPath, setDashboardPath] = useState('/auth/login');

  useEffect(() => {
    // Log the error safely to the server console
    console.error('Unhandled rendering error captured by Global Error Boundary:', error);

    // Resolve user dashboard path from localStorage if authenticated
    try {
      const userStr = localStorage.getItem('astrix-user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.role) {
          setDashboardPath(`/dashboard/${user.role}`);
        }
      }
    } catch (e) {
      console.warn('Failed to parse user session in error boundary', e);
    }
  }, [error]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-text p-6 animate-fadeIn">
      <div className="max-w-md w-full bg-surface border border-border shadow-2xl rounded-3xl p-8 text-center space-y-6 transform transition-all hover:scale-[1.01] duration-300">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto border border-red-500/20 animate-pulse">
          <AlertOctagon size={32} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight">Oops! Something went wrong.</h1>
          <p className="text-xs text-muted leading-relaxed">
            An unexpected error occurred during rendering. We have logged this diagnostic report and are ready to recover.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center text-xs font-bold">
          <button
            onClick={() => reset()}
            className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground hover:opacity-90 transition-all rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <RefreshCw size={14} /> Retry
          </button>
          
          <button
            onClick={() => router.push(dashboardPath)}
            className="flex-1 px-4 py-2.5 bg-accent hover:bg-accent/80 border border-border transition-all rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LayoutDashboard size={14} /> Dashboard
          </button>
        </div>

        <button
          onClick={() => router.push('/')}
          className="w-full py-2 bg-transparent text-muted hover:text-text hover:underline transition-all text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Home size={12} /> Return Home
        </button>
      </div>
    </div>
  );
}
