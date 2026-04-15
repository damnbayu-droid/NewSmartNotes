'use client'

import { useState, useMemo, memo } from 'react';
import type { Note } from '@/types';
import { NOTE_COLORS } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pin,
  PinOff,
  Archive,
  MoreVertical,
  Copy,
  Trash2,
  Tag,
  Globe,
  Sparkles,
  Lock
} from 'lucide-react';

interface NoteCardProps {
  note: Note;
  viewMode?: 'grid' | 'list';
  onClick: (note: Note) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleArchive?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

export const NoteCard = memo(function NoteCard({
  note,
  viewMode = 'grid',
  onClick,
  onTogglePin,
  onDelete,
  onToggleArchive,
  onDuplicate,
}: NoteCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const colorOption = useMemo(() => 
    NOTE_COLORS.find(c => c.value === note.color) || NOTE_COLORS[0],
    [note.color]
  );

  const truncatedContent = useMemo(() => {
    const stripHtml = (html: string) => {
      if (!html) return "";
      return html
        .replace(/<[^>]*>?/gm, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const plainText = stripHtml(note.content);
    const maxLength = 120;
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength).trim() + '...';
  }, [note.content]);

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-500 cursor-pointer
        ${colorOption.bg} ${colorOption.border} border
        ${viewMode === 'grid' ? 'h-72 flex flex-col' : 'flex flex-row items-center gap-4 h-24'}
        ${isHovered ? 'shadow-2xl scale-[1.02] border-violet-400 dark:border-violet-600' : 'shadow-sm'}
        rounded-[2rem]
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(note)}
    >
      {/* Visual background accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/5 to-transparent blur-2xl pointer-events-none" />
      
      {/* Indicators Layer */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {note.is_pinned && (
           <div className="p-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-sm border border-violet-100 dark:border-violet-900">
             <Pin className="w-3.5 h-3.5 text-violet-600 fill-violet-600" />
           </div>
        )}
        {note.is_encrypted && (
           <div className="p-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-sm border border-amber-100 dark:border-amber-900">
             <Lock className="w-3.5 h-3.5 text-amber-600" />
           </div>
        )}
        {note.is_shared && (
           <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
             <Globe className="w-2.5 h-2.5" />
             <span>Shared</span>
           </div>
        )}
      </div>

      <div className={`p-6 flex flex-col h-full ${viewMode === 'list' ? 'flex-1' : ''}`}>
        {/* Timestamp */}
        <div className="flex items-center gap-2 mb-3">
           <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              {new Date(note.updated_at).toLocaleDateString()}
           </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 pr-12 line-clamp-2 leading-tight uppercase tracking-tighter italic">
          {note.title || 'Untitled Node'}
        </h3>

        {/* Content Preview */}
        <p className={`text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium ${viewMode === 'grid' ? 'line-clamp-4' : 'line-clamp-1'}`}>
          {truncatedContent || 'No intelligence captured yet...'}
        </p>

        {/* Tags Metadata */}
        <div className="mt-auto pt-6 flex flex-wrap gap-2">
           {note.tags.length > 0 ? (
              note.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                >
                  <Tag className="w-2.5 h-2.5 mr-1.5 opacity-40" />
                  {tag}
                </span>
              ))
           ) : (
              <span className="text-[9px] font-bold text-slate-400/50 uppercase tracking-widest italic">#Uncategorized</span>
           )}
           {note.tags.length > 3 && (
              <span className="text-[9px] font-black text-slate-400 uppercase">+{note.tags.length - 3}</span>
           )}
        </div>

        {/* Dynamic Action Surface */}
        <div 
          className={`absolute bottom-6 right-6 flex items-center gap-2 transition-all duration-500 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl border-slate-200 dark:border-slate-800 text-slate-400 hover:text-violet-600 hover:border-violet-200"
            onClick={() => onTogglePin(note.id)}
          >
            {note.is_pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl border-slate-200 dark:border-slate-800 text-slate-400 hover:text-violet-600 hover:border-violet-200"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-2 rounded-[1.5rem] border-slate-100 shadow-2xl">
              {onToggleArchive && (
                 <DropdownMenuItem onClick={() => onToggleArchive(note.id)} className="rounded-xl h-10 text-[10px] font-black uppercase tracking-widest">
                   <Archive className="w-4 h-4 mr-3 text-slate-400" />
                   Archive Node
                 </DropdownMenuItem>
              )}
              {onDuplicate && (
                 <DropdownMenuItem onClick={() => onDuplicate(note.id)} className="rounded-xl h-10 text-[10px] font-black uppercase tracking-widest">
                   <Copy className="w-4 h-4 mr-3 text-slate-400" />
                   Duplicate Node
                 </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="my-2 bg-slate-100" />
              <DropdownMenuItem
                onClick={() => onDelete(note.id)}
                className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 rounded-xl h-10 text-[10px] font-black uppercase tracking-widest"
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Purge Node
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Accent hover line */}
        <div className={`absolute bottom-0 left-6 right-6 h-1 bg-violet-600 rounded-full transition-all duration-700 ${isHovered ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}`} />
      </div>
    </Card>
  );
});
