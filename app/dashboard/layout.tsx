'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { NavIsland } from '@/components/dashboard/NavIsland'
import { InfoPanel } from '@/components/dashboard/InfoPanel'
import { useAuth } from '@/hooks/useAuth'
import { useNotes } from '@/hooks/useNotes'
import { Loader2 } from 'lucide-react'

export default function DashboardLayout({
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
    reconcileNotes,
    diagnostics,
    forceSync
  } = useNotes(user)

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      <Sidebar 
        currentView="notes" 
        onViewChange={() => {}} // This will be handled by routing later
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        folders={folders}
        activeFolder={activeFolder}
        onSelectFolder={setActiveFolder}
        onAddFolder={() => {
            const name = prompt("New Folder Name:");
            if (name) createFolder(name);
        }}
        renameFolder={async (oldName, newName) => {
            return renameFolder(oldName, newName);
        }}
        deleteFolder={async (name) => {
            return deleteFolder(name);
        }}
        pinnedFolders={pinnedFolders}
        togglePinFolder={togglePinFolder}
        subscriptionTier={user?.subscription_tier}
        onUpgrade={() => window.dispatchEvent(new CustomEvent('open-payment-modal'))}
        userEmail={user?.email}
        diagnostics={diagnostics}
        onForceSync={forceSync}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50/20">
        <NavIsland />
        <InfoPanel />
        {children}
        
        {/* Mobile Sidebar Toggle Button (Floating) */}
        {!isSidebarOpen && (
           <button 
              onClick={() => setIsSidebarOpen(true)}
              className="fixed bottom-8 left-8 z-50 p-4 bg-violet-600 text-white rounded-2xl shadow-2xl lg:hidden active:scale-95 transition-all"
           >
              <div className="w-6 h-0.5 bg-white mb-1.5 rounded-full" />
              <div className="w-4 h-0.5 bg-white mb-1.5 rounded-full" />
              <div className="w-6 h-0.5 bg-white rounded-full" />
           </button>
        )}
      </main>
    </div>
  )
}
