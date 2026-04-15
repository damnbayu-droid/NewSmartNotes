'use client'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

import { useState, useMemo, useEffect, Suspense } from 'react'
import dynamicImport from 'next/dynamic'
import { useAuth } from '@/hooks/useAuth'
import { useNotes } from '@/hooks/useNotes'
import { SearchBar } from '@/components/notes/SearchBar'
import { NotesGrid } from '@/components/notes/NotesGrid'
import { GuestSyncModal } from '@/components/auth/GuestSyncModal'
import { toast } from 'sonner'
import type { Note, ViewMode, SortOption } from '@/types'
import { useSearchParams, useRouter } from 'next/navigation'
import { Book as BookIcon, Calendar, FileEdit } from 'lucide-react'

// Heavy Components - Dynamic Load to keep Worker under 3MB
const NoteEditor = dynamicImport(() => import('@/components/notes/NoteEditor').then(m => m.NoteEditor), { ssr: false })
const ScannerView = dynamicImport(() => import('@/components/dashboard/scanner/ScannerView').then(m => m.ScannerView), { ssr: false })
const BookLayout = dynamicImport(() => import('@/components/dashboard/books/BookLayout').then(m => m.BookLayout), { ssr: false })
const ScheduleView = dynamicImport(() => import('@/components/dashboard/schedule/ScheduleView').then(m => m.ScheduleView), { ssr: false })

function DashboardContent() {
  const { user, isLoading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // URL-based view management
  const currentView = (searchParams.get('view') || 'notes') as any

  const { 
    notes, 
    pinnedNotes,
    isLoading: notesLoading, 
    activeFolder, 
    setActiveFolder, 
    createNote, 
    updateNote, 
    deleteNote,
    syncGuestNotes,
    shareNote,
    unshareNote,
    allTags,
    togglePin,
  } = useNotes(user)

  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('updated')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  
  // Editor State
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  // Sync active folder with URL view
  useEffect(() => {
    if (currentView === 'archive') setActiveFolder('Archive')
    else if (currentView === 'trash') setActiveFolder('Trash')
    else if (currentView === 'notes' && activeFolder !== 'Main') setActiveFolder('Main')
  }, [currentView, setActiveFolder])

  const handleCreateNew = async () => {
    const result = await createNote({
      title: 'New Intelligence Node',
      content: '<p>Awaiting data sync...</p>',
      folder: activeFolder === 'Trash' || activeFolder === 'Archive' ? 'Main' : activeFolder
    })
    if (result.success && result.note) {
      setEditingNote(result.note)
      setIsEditorOpen(true)
      toast.success('New node initialized')
    }
  }

  const onTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  // Filtered and Sorted Data computation
  const filteredData = useMemo(() => {
    let result = [...notes]
    
    // 1. Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(n => 
        n.title.toLowerCase().includes(query) || 
        n.content.toLowerCase().includes(query)
      )
    }

    // 2. Tag Filter
    if (selectedTags.length > 0) {
      result = result.filter(n => 
        selectedTags.every(tag => n.tags?.includes(tag))
      )
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'created') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })

    return result
  }, [notes, searchQuery, selectedTags, sortBy])

  const filteredPinned = useMemo(() => {
    return filteredData.filter(n => n.is_pinned && !n.is_archived && n.folder !== 'Trash')
  }, [filteredData])

  const filteredActive = useMemo(() => {
    // If we are in Archive or Trash, show ALL notes for that state
    if (currentView === 'archive') return filteredData.filter(n => n.is_archived)
    if (currentView === 'trash') return filteredData.filter(n => n.folder === 'Trash')
    
    // Otherwise, show active non-pinned notes
    return filteredData.filter(n => !n.is_pinned && !n.is_archived && n.folder !== 'Trash')
  }, [filteredData, currentView])

  return (
    <div className="flex-1 flex flex-col h-full relative">
       {/* UI Layer: Search & Filtering */}
       <div className="px-8 z-20">
          <SearchBar 
            activeFolder={activeFolder}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedTags={selectedTags}
            availableTags={allTags}
            onTagToggle={onTagToggle}
            onClearFilters={() => {
               setSearchQuery('')
               setSelectedTags([])
            }}
            sortBy={sortBy}
            setSortBy={setSortBy}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onOpenInfo={() => window.dispatchEvent(new CustomEvent('open-info-panel'))}
          />
       </div>

       {/* Content Layer: Grid & Specific Protocols */}
       <div className="flex-1 overflow-y-auto px-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto py-8">
             {notesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                   {[1,2,3,4,5,6,7,8].map(i => (
                      <div key={i} className="h-72 bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800" />
                   ))}
                </div>
             ) : currentView === 'books' ? (
                <BookLayout />
             ) : currentView === 'schedule' ? (
                <ScheduleView />
             ) : currentView === 'scanner' ? (
                <ScannerView />
             ) : (
                <NotesGrid 
                  notes={filteredActive}
                  pinnedNotes={filteredPinned}
                  viewMode={viewMode}
                  searchQuery={searchQuery}
                  activeFolder={activeFolder}
                  onCreate={handleCreateNew}
                  onNoteClick={(n) => {
                     setEditingNote(n)
                     setIsEditorOpen(true)
                  }}
                  onTogglePin={togglePin}
                  onDelete={deleteNote}
                />
             )}
          </div>
       </div>

       {/* Overlays */}
       <NoteEditor 
         user={user}
         note={editingNote}
         isOpen={isEditorOpen}
         onClose={() => {
            setIsEditorOpen(false)
            setEditingNote(null)
         }}
         onUpdate={(updates) => {
            if (editingNote) updateNote(editingNote.id, updates)
         }}
         onDelete={async (id) => {
            await deleteNote(id)
            setIsEditorOpen(false)
            setEditingNote(null)
         }}
         onShareNote={async (id, type, permission, isDiscoverable) => {
            return shareNote(id, type, undefined, permission, isDiscoverable)
         }}
         onUnshareNote={(id) => unshareNote(id)}
         onTogglePin={(id) => togglePin(id)}
       />

       {user && (
         <GuestSyncModal onSync={() => syncGuestNotes(user.id)} />
       )}
       
       <div className="absolute inset-0 pointer-events-none border-[12px] border-white/5 dark:border-slate-950/5 rounded-[3rem] z-50 mix-blend-overlay" />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-950 p-12">
        <div className="w-full max-w-7xl mx-auto space-y-12">
           <div className="h-16 w-full max-w-2xl bg-slate-100 dark:bg-slate-900 rounded-2xl animate-pulse" />
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="h-72 bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 animate-pulse" />
              ))}
           </div>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
