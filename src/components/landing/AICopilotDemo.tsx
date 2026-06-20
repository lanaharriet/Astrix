'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Cpu } from 'lucide-react';

const DEMO_CONVERSATIONS = [
  {
    question: "What is my attendance percentage?",
    answer: "Your current attendance is 87%. You are safely above the 75% minimum requirement. You can miss up to 3 more lectures of DBMS without falling below the threshold."
  },
  {
    question: "Show my next lecture class.",
    answer: "Your next class is Database Management Systems (DBMS) with Dr. Sarah Jenkins at 10:00 AM. It will be held in Block C, Room 302."
  },
  {
    question: "Do I have any pending assignments?",
    answer: "Yes, you have one pending assignment: 'DBMS Normalization Lab' is due on June 22 (in 2 days). The average class completion rate is currently 42%."
  }
];

export default function AICopilotDemo() {
  const [index, setIndex] = useState(0);
  const [typedQuestion, setTypedQuestion] = useState('');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [phase, setPhase] = useState<'idle' | 'typing-question' | 'waiting' | 'typing-answer' | 'reading'>('typing-question');

  useEffect(() => {
    let active = true;

    const runDemo = async () => {
      const current = DEMO_CONVERSATIONS[index];
      
      // Step 1: Type Question
      setPhase('typing-question');
      setTypedAnswer('');
      for (let i = 0; i <= current.question.length; i++) {
        if (!active) return;
        setTypedQuestion(current.question.slice(0, i));
        await new Promise((resolve) => setTimeout(resolve, 40));
      }
      
      // Step 2: Wait (AI processing)
      if (!active) return;
      setPhase('waiting');
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Step 3: Type Answer
      if (!active) return;
      setPhase('typing-answer');
      for (let i = 0; i <= current.answer.length; i++) {
        if (!active) return;
        setTypedAnswer(current.answer.slice(0, i));
        await new Promise((resolve) => setTimeout(resolve, 15));
      }
      
      // Step 4: Reading time
      if (!active) return;
      setPhase('reading');
      await new Promise((resolve) => setTimeout(resolve, 3500));

      // Step 5: Cycle to next conversation
      setIndex((prev) => (prev + 1) % DEMO_CONVERSATIONS.length);
    };

    runDemo();

    return () => {
      active = false;
    };
  }, [index]);

  return (
    <div className="w-full max-w-lg mx-auto bg-surface border border-border rounded-3xl shadow-xl overflow-hidden flex flex-col h-[320px] transition-colors duration-300">
      {/* Header */}
      <div className="bg-accent/40 border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Cpu size={16} className="animate-pulse" />
          </div>
          <div>
            <span className="block text-xs font-extrabold uppercase tracking-wider">Campus Copilot AI</span>
            <span className="block text-[9px] text-muted-foreground font-semibold">Real-Time Interaction Demo</span>
          </div>
        </div>
        <div className="flex gap-1.5 font-sans">
          <span className="w-2 h-2 rounded-full bg-red-500/80" />
          <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
          <span className="w-2 h-2 rounded-full bg-green-500/80" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs flex flex-col justify-end">
        {/* Question Bubble */}
        {typedQuestion && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary text-primary-foreground px-3.5 py-2.5 rounded-2xl rounded-tr-none max-w-[85%] ml-auto font-medium shadow-sm leading-relaxed"
          >
            {typedQuestion}
            {phase === 'typing-question' && <span className="animate-pulse">|</span>}
          </motion.div>
        )}

        {/* AI Typing Indicator */}
        {phase === 'waiting' && (
          <div className="flex items-center gap-1.5 bg-accent/40 border border-border px-3.5 py-2.5 rounded-2xl rounded-tl-none w-20 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
          </div>
        )}

        {/* Answer Bubble */}
        {typedAnswer && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background border border-border px-3.5 py-2.5 rounded-2xl rounded-tl-none max-w-[85%] mr-auto text-text font-medium shadow-sm leading-relaxed"
          >
            <span className="flex items-center gap-1 text-[10px] text-primary font-bold uppercase tracking-wider mb-1">
              <Sparkles size={10} /> Copilot
            </span>
            {typedAnswer}
            {phase === 'typing-answer' && <span className="animate-pulse">|</span>}
          </motion.div>
        )}
      </div>

      {/* Mock Input Bar */}
      <div className="border-t border-border p-3 bg-accent/20 flex gap-2 items-center">
        <div className="flex-1 bg-background border border-border rounded-xl px-3 py-1.5 text-[10px] text-muted flex items-center justify-between select-none">
          <span>Type your query here...</span>
          <Send size={12} className="text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
