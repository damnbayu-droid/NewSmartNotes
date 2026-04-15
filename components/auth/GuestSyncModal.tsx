'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Database, Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface GuestSyncModalProps {
  onSync: () => Promise<{ success: boolean; count?: number; error?: string }>
}

export function GuestSyncModal({ onSync }: GuestSyncModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [guestCount, setGuestCount] = useState(0)

  useEffect(() => {
    const guestData = localStorage.getItem('notes_guest')
    if (guestData) {
      try {
        const parsed = JSON.parse(guestData)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setGuestCount(parsed.length)
          setIsOpen(true)
        }
      } catch (e) {}
    }
  }, [])

  const handleSync = async () => {
    setIsSyncing(true)
    const result = await onSync()
    setIsSyncing(false)
    
    if (result.success) {
      toast.success(`Successfully migrated ${result.count} nodes to your cloud cluster.`)
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md rounded-[2.5rem] border-0 bg-white dark:bg-slate-900 shadow-2xl p-8">
        <DialogHeader className="space-y-4">
          <div className="w-16 h-16 bg-violet-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-violet-200">
             <Database className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-black text-center uppercase tracking-tighter">
             Intelligence detected in local cache
          </DialogTitle>
          <DialogDescription className="text-center text-slate-500 font-medium leading-relaxed">
             We found <span className="text-violet-600 font-black">{guestCount} intelligence payloads</span> stored in your temporary guest node. Would you like to secure them in your authenticated cloud cluster?
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex items-center justify-center">
           <div className="flex items-center gap-4 text-slate-400">
              <div className="flex flex-col items-center">
                 <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                    <span className="text-[10px] font-black">LOCAL</span>
                 </div>
              </div>
              <ArrowRight className="w-5 h-5 animate-pulse" />
              <div className="flex flex-col items-center">
                 <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-200">
                    <Sparkles className="w-5 h-5 text-white" />
                 </div>
              </div>
           </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button 
             variant="ghost" 
             onClick={() => setIsOpen(false)}
             className="flex-1 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400"
          >
             Discard Local Cache
          </Button>
          <Button 
             onClick={handleSync}
             loading={isSyncing}
             className="flex-1 h-12 rounded-2xl bg-violet-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-violet-200"
          >
             Initialize Migration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
