'use client'

import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CreateNoteButtonProps {
  onClick: () => void;
}

export function CreateNoteButton({ onClick }: CreateNoteButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group relative h-64 w-full flex flex-col items-center justify-center gap-6 bg-white dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] hover:border-violet-400 dark:hover:border-violet-600 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-all duration-500 overflow-hidden"
    >
      {/* Decorative background orbits */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-violet-100 dark:border-violet-900/30 rounded-full group-hover:scale-150 transition-transform duration-1000 opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-violet-50 dark:border-violet-900/20 rounded-full group-hover:scale-125 transition-transform duration-700 opacity-10" />
      </div>

      <div className="relative">
        <div className="w-16 h-16 rounded-3xl bg-violet-600 flex items-center justify-center text-white shadow-xl shadow-violet-200 dark:shadow-none group-hover:scale-110 group-active:scale-95 transition-all duration-300">
          <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-500" />
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-xl bg-amber-400 flex items-center justify-center shadow-lg animate-bounce group-hover:animate-spin">
           <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      </div>

      <div className="text-center space-y-2 relative z-10">
        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Initialize Node</h3>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-8 leading-relaxed"> Capture fresh intelligence into your neural cluster </p>
      </div>

      {/* Action Indicator */}
      <div className="absolute bottom-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
         <span className="text-[9px] font-black text-violet-600 uppercase tracking-[0.3em] flex items-center gap-2">
            Ready for Input <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
         </span>
      </div>
    </button>
  );
}
