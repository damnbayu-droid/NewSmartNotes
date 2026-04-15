'use client'

import { useState, useEffect } from 'react'
import { X, Shield, Bot, Database, Book, Scan, Mic, Zap, Compass, Share2, Github, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: Shield,
    title: "Military Encryption",
    description: "Industry-standard AES-GCM 256-bit encryption. Your keys never leave your device. Privacy in its purest form.",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-900/20"
  },
  {
    icon: Bot,
    title: "Note AI Intelligence",
    description: "Intelligent note summaries, auto-tagging, and real-time voice-to-text transcription powered by AI.",
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-900/20"
  },
  {
    icon: Compass,
    title: "Discovery Library",
    description: "Explore a global library of shared intelligence. Like GitHub, but for your personal and community knowledge.",
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20"
  },
  {
    icon: Github,
    title: "Smart Filing Integration",
    description: "Native link to GitHub and external repositories. Sync your notes with codebase changes and external documents.",
    color: "text-indigo-600",
    bg: "bg-indigo-50 dark:bg-indigo-900/20"
  },
  {
    icon: Scan,
    title: "Ultra OCR Scanner",
    description: "High-performance camera scanner with OCR. Capture text from physical documents instantly into your library.",
    color: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-900/20"
  },
  {
    icon: Mic,
    title: "Smart Voice Notes",
    description: "Lossless voice recording with dynamic visual feedback. Integrated with AI-driven transcription.",
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-900/20"
  },
  {
    icon: Share2,
    title: "Collaborative Sync",
    description: "Real-time multi-user editing. Share notes with granular 'Read' and 'Write' permissions.",
    color: "text-pink-600",
    bg: "bg-pink-50 dark:bg-pink-900/20"
  },
  {
    icon: Database,
    title: "Local-First Privacy",
    description: "Full offline support and local storage fallback. 100% data ownership and absolute control.",
    color: "text-teal-600",
    bg: "bg-teal-50 dark:bg-teal-900/20"
  },
  {
    icon: Zap,
    title: "Dynamic Status Island",
    description: "Real-time system updates, recording status, and smart notifications via an interactive Dynamic Island.",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/20"
  },
  {
    icon: Book,
    title: "Book Mode",
    description: "A premium reading experience that transforms your scattered notes into structured, elegant digital books.",
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20"
  },
  {
    icon: Scan,
    title: "PDF Editor",
    description: "Advanced PDF editing tools. Upload, annotate, fill forms, and export your documents.",
    color: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-900/20"
  },
  {
    icon: Shield,
    title: "End-to-End Encrypted Sharing",
    description: "Share notes publicly or with specific users via encrypted links with configurable access levels.",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-900/20"
  },
]

export function InfoPanel() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('open-info-panel', handleOpen)
    return () => window.removeEventListener('open-info-panel', handleOpen)
  }, [])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-violet-100 dark:border-violet-900/30 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="relative p-8 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-xl ring-1 ring-white/30">
                    <Zap className="w-7 h-7 fill-white text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">System Information</h2>
                    <p className="text-violet-100/80 font-bold text-[10px] uppercase tracking-widest mt-1">Smart Notes v2.5.0 — Next.js 16 Intelligence Platform</p>
                  </div>
                </div>
                <p className="text-violet-100 text-sm max-w-xl opacity-90 leading-relaxed">
                  Mastering your Smart Notes — <span className="text-violet-200 font-bold">Secured & Encrypted</span> Workspace. From military-grade security to advanced AI-driven creativity, every feature is designed to put you in control.
                </p>
              </div>
            </div>

            {/* Features Grid — Scrollable */}
            <div className="p-8 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-transparent flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((f, i) => (
                  <div
                    key={i}
                    className={`p-5 rounded-3xl border border-transparent hover:border-violet-200 dark:hover:border-violet-800 transition-all group flex flex-col ${f.bg}`}
                  >
                    <div className={`p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-md w-fit mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3 ${f.color}`}>
                      <f.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-black text-slate-900 dark:text-white text-sm mb-2 uppercase tracking-tight">{f.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{f.description}</p>
                  </div>
                ))}

                {/* Status Card */}
                <div className="p-5 rounded-3xl bg-slate-900 dark:bg-slate-950 text-white lg:col-span-1 border border-white/10 flex flex-col justify-center items-center text-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">All Systems Operational</span>
                  </div>
                  <p className="text-[9px] opacity-50 font-medium uppercase tracking-widest">Supabase / Next.js 16 / Turbopack</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">
                  <Shield className="w-4 h-4" />
                  <span>Privacy First Policy</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide">ZERO data tracking. ZERO third-party access.</p>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto bg-slate-900 dark:bg-violet-600 hover:bg-slate-800 dark:hover:bg-violet-700 text-white rounded-2xl px-10 h-12 font-black uppercase tracking-widest shadow-xl transition-all active:scale-95"
              >
                Explore Now
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
