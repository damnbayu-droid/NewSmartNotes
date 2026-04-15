'use client'

import type { Note } from '@/types';
import { NoteCard } from '@/components/dashboard/NoteCard';
import { CreateNoteButton } from './CreateNoteButton';
import { EmptyState } from './EmptyState';
import React from 'react';

interface NotesGridProps {
  notes: Note[];
  pinnedNotes: Note[];
  viewMode: 'grid' | 'list';
  searchQuery: string;
  activeFolder: string;
  onNoteClick: (note: Note) => void;
  onCreate: () => void;
  onTogglePin: (id: string) => void | Promise<any>;
  onDelete: (id: string) => void | Promise<any>;
}

export function NotesGrid({
  notes,
  pinnedNotes,
  viewMode,
  searchQuery,
  activeFolder,
  onNoteClick,
  onCreate,
  onTogglePin,
  onDelete,
}: NotesGridProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hydration Guard: Return an empty shell or generic placeholder during the first render
  if (!isMounted) {
    return <div className="space-y-12 pb-24 opacity-0" />;
  }

  if (notes.length === 0 && pinnedNotes.length === 0 && !searchQuery) {
    return <EmptyState type="notes" onAction={onCreate} />;
  }

  if (notes.length === 0 && pinnedNotes.length === 0 && searchQuery) {
    return <EmptyState type="search" />;
  }

  return (
    <div className="space-y-12 pb-24" suppressHydrationWarning>
      {/* Pinned Section */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black text-violet-600 dark:text-violet-400 uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
              Pinned Intelligence ({pinnedNotes.length})
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-violet-100 to-transparent dark:from-violet-900/30 ml-6" />
          </div>
          
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                viewMode={viewMode}
                onClick={onNoteClick}
                onTogglePin={onTogglePin}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Grid Section */}
      <div className="space-y-6">
        {pinnedNotes.length > 0 && (
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800" />
              Recent Clusters ({notes.length})
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent dark:from-slate-900/30 ml-6" />
          </div>
        )}

        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {/* Create New Node Tile */}
          {activeFolder === 'Main' && !searchQuery && (
             <CreateNoteButton onClick={onCreate} />
          )}

          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              viewMode={viewMode}
              onClick={onNoteClick}
              onTogglePin={onTogglePin}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
