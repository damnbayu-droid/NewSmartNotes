'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Command, Sparkles, Chrome, ArrowLeft, Mail, Lock, User as UserIcon, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signInWithGoogle } = useAuth()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // For now, we'll focus on Google Login as it's the primary method, 
    // but the UI supports email/password for the next phase.
    toast.info('Email authentication is initializing. Use Google Sign-In for immediate access.')
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px] animate-pulse" />
         <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all group"
      >
        <div className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:border-slate-900 dark:group-hover:border-white transition-all">
           <ArrowLeft className="w-4 h-4" />
        </div>
        Intelligence Surface
      </Link>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="flex flex-col items-center text-center space-y-4">
           <div className="w-16 h-16 bg-violet-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-violet-500/20">
              <Command className="w-8 h-8 text-white" />
           </div>
           <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                 {isLogin ? 'Identity Verification' : 'Protocol Initialization'}
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">
                 Neural Network Access Layer
              </p>
           </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-slate-100 dark:border-slate-800 p-8 rounded-[3rem] shadow-2xl shadow-slate-200 dark:shadow-none space-y-6">
           <div className="space-y-4">
              <Button 
                 onClick={signInWithGoogle}
                 variant="outline" 
                 className="w-full h-14 rounded-2xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 gap-3 font-black uppercase text-[10px] tracking-widest"
              >
                 <Chrome className="w-5 h-5 text-blue-600" />
                 Synchronize via Google Cluster
              </Button>

              <div className="relative py-4">
                 <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
                 <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.4em]"><span className="bg-white dark:bg-slate-900 px-4 text-slate-300">Alternate Route</span></div>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                 {!isLogin && (
                    <div className="relative group">
                       <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-violet-500 transition-all" />
                       <Input 
                          placeholder="Node Operator Name" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-12 bg-slate-50/50 dark:bg-slate-950/50"
                       />
                    </div>
                 )}
                 <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-violet-500 transition-all" />
                    <Input 
                       type="email" 
                       placeholder="Admin Email Address" 
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       className="pl-12 bg-slate-50/50 dark:bg-slate-950/50"
                    />
                 </div>
                 <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-violet-500 transition-all" />
                    <Input 
                       type="password" 
                       placeholder="Access Keyphrase" 
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       className="pl-12 bg-slate-50/50 dark:bg-slate-950/50"
                    />
                 </div>
                 <Button 
                    type="submit" 
                    loading={isLoading}
                    className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-950 text-white font-black uppercase text-[10px] tracking-widest shadow-xl"
                 >
                    {isLogin ? 'Establish Connection' : 'Register Node'}
                 </Button>
              </form>
           </div>

           <div className="text-center">
              <button 
                 onClick={() => setIsLogin(!isLogin)}
                 className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-violet-600 transition-all"
              >
                 {isLogin ? "Don't have a cluster yet? Initialize" : "Identified previously? Estabilish Session"}
              </button>
           </div>
        </div>

        <div className="flex items-center justify-center gap-6 pt-4">
           <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              AES-256 Protocol
           </div>
           <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
           <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              GDPR Compliant Cluster
           </div>
        </div>
      </div>
    </div>
  )
}
