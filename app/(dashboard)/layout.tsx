'use client'

export const dynamic = 'force-dynamic'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { NavIsland } from '@/components/dashboard/NavIsland'
import { InfoPanel } from '@/components/dashboard/InfoPanel'
import { ContactModal } from '@/components/dashboard/ContactModal'
import { useAuth } from '@/hooks/useAuth'
import { useNotes } from '@/hooks/useNotes'

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
    forceSync,
    diagnostics
  } = useNotes(user)

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Render immediately — no hasMounted guard here for instant page load
  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      <ContactModal />
      {/* Sidebar always rendered — CSS handles mobile hide */}
      <Sidebar 
        currentView="notes" 
        onViewChange={() => {}} 
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

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/20 dark:bg-slate-950/20 relative min-w-0">
        <div className="flex-1 overflow-y-auto px-4 lg:px-12 py-8 custom-scrollbar relative">
          <NavIsland />
          <InfoPanel />
          {children}
        </div>
        
        {/* Mobile Sidebar Toggle — Floating FAB */}
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
