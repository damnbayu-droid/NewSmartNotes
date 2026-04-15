'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Cpu, 
    Shield, 
    Zap, 
    ArrowLeft, 
    Mail, 
    Lock, 
    User, 
    Sparkles, 
    Chrome,
    Loader2
} from 'lucide-react'
import { toast } from 'sonner'

type AuthView = 'login' | 'signup' | 'forgot-password'

export default function LoginPage() {
    const router = useRouter()
    const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth()
    const [view, setView] = useState<AuthView>('login')
    const [isLoading, setIsLoading] = useState(false)
    
    // Form State
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            if (view === 'login') {
                const result = await signIn(email, password)
                if (result.success) {
                    toast.success('Neural Link Established', { description: 'Syncing intelligence core...' })
                    router.push('/')
                } else {
                    toast.error('Authentication Failure', { description: result.error })
                }
            } else if (view === 'signup') {
                const result = await signUp(email, password, name)
                if (result.success) {
                    toast.success('Identity Synthesized', { description: 'Please verify your neural link via email.' })
                    setView('login')
                } else {
                    toast.error('Synthesis Failure', { description: result.error })
                }
            } else if (view === 'forgot-password') {
                const result = await resetPassword(email)
                if (result.success) {
                    toast.success('Reset Signal Transmitted', { description: 'Check your email for the recovery key.' })
                    setView('login')
                } else {
                    toast.error('Link Failure', { description: result.error })
                }
            }
        } catch (error) {
            console.error(error)
            toast.error('Critical System Error')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleAuth = async () => {
        setIsLoading(true)
        try {
            const result = await signInWithGoogle()
            if (!result.success) toast.error('Google Sync Failed', { description: result.error })
        } catch (error) {
            toast.error('Google Neural Bridge Failed')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
            {/* Background Neural Warp */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse duration-700" />
            </div>

            {/* Back to Core */}
            <button 
                onClick={() => router.push('/')}
                className="absolute top-12 left-12 z-20 flex items-center gap-3 px-6 py-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-violet-600 transition-all active:scale-95"
            >
                <ArrowLeft className="w-4 h-4" />
                Return to Core
            </button>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10 space-y-8"
            >
                {/* Branding Hub */}
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-20 h-20 bg-violet-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-violet-500/20 rotate-3">
                        <Cpu className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                            Smart <span className="text-violet-600">Notes</span>
                        </h1>
                        <div className="flex items-center justify-center gap-3 mt-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol v4.0 Active</span>
                        </div>
                    </div>
                </div>

                {/* Auth Module */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-10 rounded-[3rem] border border-white dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none space-y-8">
                    <div className="flex p-1.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <button 
                            onClick={() => setView('login')}
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${view === 'login' ? 'bg-white dark:bg-slate-900 text-violet-600 shadow-xl' : 'text-slate-400'}`}
                        >
                            Direct Link
                        </button>
                        <button 
                            onClick={() => setView('signup')}
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${view === 'signup' ? 'bg-white dark:bg-slate-900 text-violet-600 shadow-xl' : 'text-slate-400'}`}
                        >
                            Synthesize
                        </button>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={view}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                {view === 'signup' && (
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 italic">Identity Tag</Label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <Input 
                                                placeholder="Dr. Neural"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="h-14 pl-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 font-bold"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 italic">Neural Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input 
                                            placeholder="core@intelligence.io"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="h-14 pl-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 font-bold"
                                        />
                                    </div>
                                </div>

                                {view !== 'forgot-password' && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center px-4">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Access Key</Label>
                                            {view === 'login' && (
                                                <button 
                                                    type="button"
                                                    onClick={() => setView('forgot-password')}
                                                    className="text-[9px] font-bold text-violet-600 hover:text-violet-700 uppercase tracking-widest"
                                                >
                                                    Lost Key?
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <Input 
                                                placeholder="••••••••"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="h-14 pl-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 font-bold"
                                            />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <Button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 rounded-2xl bg-violet-600 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-violet-500/20 active:scale-95 transition-all"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                view === 'login' ? 'Establish Link' : view === 'signup' ? 'Synthesize Identity' : 'Reset Signal'
                            )}
                        </Button>
                    </form>

                    <div className="relative py-4">
                         <div className="absolute inset-x-0 top-1/2 h-px bg-slate-100 dark:bg-slate-800" />
                         <div className="relative flex justify-center">
                             <span className="bg-white dark:bg-slate-900 px-4 text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Or Secure Bridge via</span>
                         </div>
                    </div>

                    <Button 
                        onClick={handleGoogleAuth}
                        variant="outline"
                        className="w-full h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black uppercase text-[10px] tracking-widest shadow-sm active:scale-95 transition-all"
                    >
                        <Chrome className="w-4 h-4 mr-3 text-violet-600" />
                        Synchronize with Google
                    </Button>
                </div>

                {/* Bottom Matrix */}
                <div className="flex items-center justify-center gap-8 text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                     <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-violet-500" />
                        AES-256 SECURED
                     </div>
                     <div className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        LATENCY: 12ms
                     </div>
                </div>
            </motion.div>
        </div>
    )
}
