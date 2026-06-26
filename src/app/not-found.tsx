'use client';

import { useRouter } from 'next/navigation';
import { HelpCircle, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-background text-text flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background floating gradient elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />

      <div className="max-w-md w-full bg-surface/80 backdrop-blur-md border border-border shadow-2xl rounded-3xl p-8 text-center space-y-8 relative z-10 transform transition-all duration-300">
        
        {/* Animated 404 Header */}
        <div className="relative select-none">
          <h1 className="text-8xl font-black tracking-widest text-primary/20 absolute inset-0 flex items-center justify-center scale-105 animate-ping opacity-25">
            404
          </h1>
          <h1 className="text-8xl font-black tracking-widest text-primary bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary animate-pulse">
            404
          </h1>
        </div>

        {/* Floating Icon Wrapper */}
        <div className="w-20 h-20 bg-accent border border-border/85 rounded-full flex items-center justify-center mx-auto shadow-inner relative animate-bounce" style={{ animationDuration: '4s' }}>
          <HelpCircle size={40} className="text-primary animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold">Lost in Antigravity?</h2>
          <p className="text-xs text-muted leading-relaxed font-medium">
            The page you are looking for does not exist.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center text-xs font-bold">
          <button
            onClick={() => router.back()}
            className="flex-1 px-4 py-2.5 bg-accent hover:bg-accent/80 border border-border transition-all rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft size={14} /> Go Back
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground hover:opacity-90 transition-all rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <Home size={14} /> Return Home
          </button>
        </div>
      </div>
    </div>
  );
}
