'use client'

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Grid3X3,
  List,
  ArrowUpDown,
  Check,
  Tag,
  Info,
  Fingerprint,
} from 'lucide-react';
import type { SortOption } from '@/types';

interface SearchBarProps {
  activeFolder?: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTags: string[];
  availableTags: string[];
  onTagToggle: (tag: string) => void;
  onClearFilters: () => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  onOpenInfo?: () => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'updated', label: 'Last' },
  { value: 'created', label: 'Created' },
  { value: 'title', label: 'Title' },
];

export function SearchBar({
  activeFolder,
  searchQuery,
  setSearchQuery,
  selectedTags,
  availableTags,
  onTagToggle,
  onClearFilters,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  onOpenInfo,
}: SearchBarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isFocused, setIsFocused] = useState(false);

  const hasFilters = searchQuery || selectedTags.length > 0;

  return (
    <div className="pt-8 pb-4 space-y-6">
      {/* Top Row: Filter Controls + Login/Info Buttons */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 group">
          <div className={`absolute inset-0 bg-violet-500/5 blur-2xl transition-all duration-500 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${isFocused ? 'text-violet-600' : 'text-slate-400'}`} />
          <Input
            placeholder={activeFolder ? `Scan ${activeFolder} cluster...` : "Scan neural clusters..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`pl-12 pr-12 h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none transition-all duration-300 rounded-[1.5rem] text-sm font-medium ${isFocused ? 'border-violet-500/50 ring-4 ring-violet-500/5' : ''}`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter & View Controls */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-14 px-6 gap-3 rounded-[1.5rem] border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm hover:translate-y-[-1px] transition-all">
                <ArrowUpDown className="w-4 h-4 text-violet-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  {sortOptions.find((o) => o.value === sortBy)?.label}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-[1.5rem] border-slate-100 shadow-2xl">
              <DropdownMenuLabel className="px-4 py-3 text-[10px] font-black uppercase tracking-widest opacity-40">Classification Order</DropdownMenuLabel>
              <DropdownMenuSeparator className="mx-2 bg-slate-50" />
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className="flex justify-between items-center h-12 px-4 rounded-xl"
                >
                  <span className="text-xs font-bold uppercase tracking-wide">{option.label}</span>
                  <Check className={`w-4 h-4 text-violet-600 ${sortBy === option.value ? 'opacity-100' : 'opacity-0'}`} />
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-14 px-6 gap-3 rounded-[1.5rem] border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm hover:translate-y-[-1px] transition-all">
                <Tag className="w-4 h-4 text-violet-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Metadata</span>
                {selectedTags.length > 0 && (
                  <div className="w-5 h-5 rounded-full bg-violet-600 text-[10px] text-white flex items-center justify-center font-black animate-in zoom-in">
                    {selectedTags.length}
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2 rounded-[2rem] border-slate-100 shadow-2xl">
              <DropdownMenuLabel className="px-4 py-3 text-[10px] font-black uppercase tracking-widest opacity-40">Neural Tags</DropdownMenuLabel>
              <DropdownMenuSeparator className="mx-2 bg-slate-50" />
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                {availableTags.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Registry Empty</div>
                ) : (
                  availableTags.map((tag) => (
                    <DropdownMenuItem
                      key={tag}
                      onClick={() => onTagToggle(tag)}
                      className="flex justify-between items-center h-10 px-4 rounded-xl mb-1 last:mb-0"
                    >
                      <span className="text-xs font-bold">{tag}</span>
                      <Check className={`w-4 h-4 text-violet-600 ${selectedTags.includes(tag) ? 'opacity-100' : 'opacity-0'}`} />
                    </DropdownMenuItem>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-[1.5rem] p-1.5 border border-slate-200 dark:border-slate-800 shadow-inner h-14">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              className={`h-11 px-4 rounded-xl transition-all duration-300 ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 shadow-md text-violet-600' : 'text-slate-400'}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-5 h-5" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              className={`h-11 px-4 rounded-xl transition-all duration-300 ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 shadow-md text-violet-600' : 'text-slate-400'}`}
              onClick={() => setViewMode('list')}
            >
              <List className="w-5 h-5" />
            </Button>
          </div>

          {/* Info Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={onOpenInfo}
            className="h-14 w-14 text-violet-600 hover:bg-violet-600 hover:text-white rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm transition-all active:scale-95"
          >
            <Info className="w-5 h-5" />
          </Button>

          {/* Login Icon Button — only when not logged in */}
          {!user && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push('/login')}
              title="Secure Intelligence Access (Login)"
              className="h-14 w-14 text-violet-600 hover:bg-violet-600 hover:text-white rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm transition-all active:scale-95 bg-white/50 dark:bg-slate-900/50"
            >
              <Fingerprint className="w-5 h-5 transition-transform duration-500 hover:rotate-12" />
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Bar */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-3 pt-2 animate-in slide-in-from-top-4 duration-500">
          <button
            onClick={onClearFilters}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-all active:scale-95 shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="h-10 pl-4 pr-2 py-0 gap-3 bg-violet-50 dark:bg-violet-900/20 border-violet-100 dark:border-violet-800 text-violet-700 dark:text-violet-300 rounded-xl animate-in zoom-in-95 duration-300 shadow-sm"
            >
              <span className="text-[10px] font-black uppercase tracking-widest">{tag}</span>
              <button
                onClick={() => onTagToggle(tag)}
                className="hover:bg-violet-200 dark:hover:bg-violet-800 p-1 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
