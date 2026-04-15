'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { useAuth } from '@/hooks/useAuth'
import { useNotes } from '@/hooks/useNotes'
import { ShieldAlert, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading: authLoading } = useAuth()
  const { 
    activeFolder, 
    setActiveFolder,
    folders,
    createFolder,
    renameFolder,
    deleteFolder,
    pinnedFolders,
    togglePinFolder,
    diagnostics,
    forceSync
  } = useNotes(user)

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const router = useRouter()

  // Protection logic: Only damnbayu@gmail.com or users with admin role
  useEffect(() => {
    if (!authLoading && user) {
      const isAdmin = user.role === 'admin' || user.email === 'damnbayu@gmail.com'
      if (!isAdmin) {
        router.push('/dashboard')
      }
    } else if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-600 animate-pulse">Initializing Identity...</p>
        </div>
      </div>
    )
  }

  // Double check admin status before rendering
  const isAdmin = user?.role === 'admin' || user?.email === 'damnbayu@gmail.com'
  if (!isAdmin) return null

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 overflow-hidden relative">
      <Sidebar 
        currentView="admin" 
        onViewChange={() => {}} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        folders={folders}
        activeFolder={activeFolder}
        onSelectFolder={setActiveFolder}
        onAddFolder={() => {}} 
        renameFolder={async () => ({ success: false, error: "Access Denied" })}
        deleteFolder={async () => ({ success: false, error: "Access Denied" })}
        pinnedFolders={pinnedFolders}
        togglePinFolder={togglePinFolder}
        subscriptionTier={user?.subscription_tier}
        userEmail={user?.email}
        diagnostics={diagnostics}
        onForceSync={forceSync}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50/20 dark:bg-slate-900/10">
        {children}
        
        {/* Mobile Sidebar Toggle */}
        {!isSidebarOpen && (
           <button 
              onClick={() => setIsSidebarOpen(true)}
              className="fixed bottom-8 left-8 z-50 p-4 bg-violet-600 text-white rounded-2xl shadow-2xl lg:hidden active:scale-95 transition-all"
           >
              <ShieldAlert className="w-6 h-6" />
           </button>
        )}
      </main>
    </div>
  )
}
