'use client'

import { Sparkles, Archive, Trash2, SearchX, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  type: 'notes' | 'archive' | 'trash' | 'search' | string
  onAction?: () => void
  onClearFilters?: () => void
}

export function EmptyState({ type, onAction, onClearFilters }: EmptyStateProps) {
  const configs = {
    notes: {
      icon: Sparkles,
      title: 'Neural Matrix Clear',
      description: 'Your intelligence cluster is awaiting its first data payload. Initialize a new node to begin capture.',
      actionLabel: 'Initialize First Node',
      actionIcon: Plus,
    },
    archive: {
      icon: Archive,
      title: 'Archive Repository Empty',
      description: 'No documentation has been moved to long-term storage yet. Keep your workspace clean by archiving completed nodes.',
      actionLabel: 'Return to Dashboard',
      actionIcon: undefined,
    },
    trash: {
      icon: Trash2,
      title: 'Security Queue Empty',
      description: 'No data scheduled for destruction. Your intelligence registry is currently pristine.',
      actionLabel: 'Return to Dashboard',
      actionIcon: undefined,
    },
    search: {
      icon: SearchX,
      title: 'No Data Clusters Found',
      description: "We couldn't locate any intelligence nodes matching your search parameters.",
      actionLabel: 'Clear All Filters',
      actionIcon: undefined,
    },
  }

  const config = configs[type as keyof typeof configs] || configs.notes
  const Icon = config.icon

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh] animate-in fade-in zoom-in-95 duration-700">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-violet-500/10 blur-[3rem] rounded-full scale-150 animate-pulse" />
        <div className="relative w-24 h-24 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-xl shadow-slate-200/50 dark:shadow-none">
          <Icon className="w-10 h-10 text-slate-300 dark:text-slate-700" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-violet-600 border-4 border-white dark:border-slate-950 shadow-lg" />
      </div>

      <div className="max-w-md space-y-3 mb-8">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
          {config.title}
        </h3>
        <p className="text-sm font-medium text-slate-500 leading-relaxed px-4">
          {config.description}
        </p>
      </div>

      {onAction || onClearFilters ? (
        <Button
          onClick={type === 'search' ? onClearFilters : onAction}
          variant="outline"
          className="h-12 px-8 rounded-2xl border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-white hover:bg-violet-600 hover:border-violet-600 transition-all shadow-xl active:scale-95"
        >
          {config.actionIcon && <config.actionIcon className="w-3.5 h-3.5 mr-2" />}
          {config.actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
