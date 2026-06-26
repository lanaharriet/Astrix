'use client';

import { useEffect } from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log root layout failures
    console.error('Fatal Root Error captured by Global Root Boundary:', error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080810] text-slate-100 antialiased flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#121220]/90 border border-slate-800/80 shadow-2xl rounded-3xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto border border-red-500/20 animate-pulse">
            <AlertOctagon size={32} />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Oops! Something went wrong.</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              A fatal application crash occurred. Our telemetry systems have been notified, and we can attempt to restart.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3 justify-center text-xs font-bold">
            <button
              onClick={() => reset()}
              className="w-full px-4 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 transition-all rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <RefreshCw size={14} /> Recover Application
            </button>
            
            <a
              href="/"
              className="w-full py-2 bg-transparent text-slate-400 hover:text-white hover:underline transition-all text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Home size={12} /> Return Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
