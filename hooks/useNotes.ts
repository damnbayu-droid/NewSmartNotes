'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { Note, SortOption, User, NoteLog, NoteCollaborator, NoteComment } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { generateShareSlug } from '@/lib/shareUtils';
import { toast } from 'sonner';

interface UseNotesReturn {
  notes: Note[];
  pinnedNotes: Note[];
  activeNotes: Note[];
  archivedNotes: Note[];
  allTags: string[];
  searchQuery: string;
  selectedTags: string[];
  sortBy: SortOption;
  viewMode: 'grid' | 'list';
  isLoading: boolean;
  isOffline: boolean;
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  toggleTag: (tag: string) => void;
  setSortBy: (sort: SortOption) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  createNote: (note: Partial<Note>) => Promise<{ success: boolean; note?: Note; error?: string }>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<{ success: boolean; error?: string }>;
  deleteNote: (id: string) => Promise<{ success: boolean; error?: string }>;
  togglePin: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleArchive: (id: string) => Promise<{ success: boolean; error?: string }>;
  duplicateNote: (id: string) => Promise<{ success: boolean; note?: Note; error?: string }>;
  folders: string[];
  activeFolder: string;
  setActiveFolder: (folder: string) => void;
  renameFolder: (oldName: string, newName: string) => Promise<{ success: boolean; error?: string }>;
  deleteFolder: (folderName: string) => Promise<{ success: boolean; error?: string }>;
  pinnedFolders: string[];
  togglePinFolder: (folderName: string) => void;
  createFolder: (name: string) => Promise<{ success: boolean; note?: Note; error?: string }>;
  restoreNote: (id: string) => Promise<{ success: boolean; error?: string }>;
  deleteForever: (id: string) => Promise<{ success: boolean; error?: string }>;
  emptyTrash: () => Promise<{ success: boolean; error?: string }>;
  shareNote: (id: string, type?: 'public' | 'password' | 'encrypted', password?: string, permission?: 'read' | 'write', isDiscoverable?: boolean) => Promise<{ success: boolean; slug?: string; key?: string; error?: string }>;
  unshareNote: (id: string) => Promise<{ success: boolean; error?: string }>;
  logs: NoteLog[];
  collaborators: NoteCollaborator[];
  fetchLogs: (noteId: string) => Promise<void>;
  fetchCollaborators: (noteId: string) => Promise<void>;
  addCollaborator: (noteId: string, email: string, permission: 'read' | 'write') => Promise<{ success: boolean; error?: string }>;
  removeCollaborator: (noteId: string, email: string) => Promise<{ success: boolean; error?: string }>;
  addLog: (noteId: string, action: string, details?: any) => Promise<void>;
  rateNote: (noteId: string, rating: number) => Promise<{ success: boolean; error?: string }>;
  fetchRatings: (noteId: string) => Promise<{ average: number; count: number }>;
  addComment: (noteId: string, content: string, parentId?: string) => Promise<{ success: boolean; comment?: NoteComment; error?: string }>;
  fetchComments: (noteId: string) => Promise<NoteComment[]>;
  deleteComment: (commentId: string) => Promise<{ success: boolean; error?: string }>;
  reconcileNotes: () => Promise<{ success: boolean; count?: number; error?: string }>;
  diagnostics: { projectId: string; authId: string; notesCount: number };
  forceSync: () => Promise<void>;
  reconcileDiscovery: () => Promise<{ success: boolean; count?: number; error?: string }>;
  syncGuestNotes: (targetUserId: string) => Promise<{ success: boolean; count: number; error?: string }>;
}

type SyncAction =
  | { type: 'CREATE'; payload: Note }
  | { type: 'UPDATE'; payload: { id: string; updates: Partial<Note> } }
  | { type: 'DELETE'; payload: { id: string } };

export function useNotes(user: User | null): UseNotesReturn {
  const supabase = createClient();
  const [notes, setNotes] = useState<Note[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storageKey = user ? `notes_${user.id}` : 'notes_guest';
        const cached = localStorage.getItem(storageKey);
        return cached ? JSON.parse(cached) : [];
      } catch (e) { return []; }
    }
    return [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('notes_sort_by');
        return (saved as SortOption) || 'updated';
    }
    return 'updated';
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('notes_view_mode');
        return (saved as 'grid' | 'list') || 'grid';
    }
    return 'grid';
  });
  const [activeFolder, setActiveFolder] = useState<string>('Main');
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [syncQueue, setSyncQueue] = useState<SyncAction[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('syncQueue');
        return cached ? JSON.parse(cached) : [];
      } catch (e) { return []; }
    }
    return [];
  });

  const [pinnedFolders, setPinnedFolders] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('pinnedFolders');
        return cached ? JSON.parse(cached) : [];
      } catch (e) { return []; }
    }
    return [];
  });

  const [logs, setLogs] = useState<NoteLog[]>([]);
  const [collaborators, setCollaborators] = useState<NoteCollaborator[]>([]);

  // Local Storage persistence
  useEffect(() => { 
    const storageKey = user ? `notes_${user.id}` : 'notes_guest';
    localStorage.setItem(storageKey, JSON.stringify(notes)); 
  }, [notes, user]);
  useEffect(() => { localStorage.setItem('syncQueue', JSON.stringify(syncQueue)); }, [syncQueue]);
  useEffect(() => { localStorage.setItem('pinnedFolders', JSON.stringify(pinnedFolders)); }, [pinnedFolders]);
  useEffect(() => { localStorage.setItem('notes_sort_by', sortBy); }, [sortBy]);
  useEffect(() => { localStorage.setItem('notes_view_mode', viewMode); }, [viewMode]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadNotes = useCallback(async () => {
    if (!user || isOffline) return;
    setIsLoading(true);
    
    try {
      const { data: ownedNotes, error: loadError } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id);
      
      if (loadError) throw loadError;

      const { data: collabData } = await supabase.from('note_collaborators').select('note_id').eq('email', user.email);
      let allFetchedNotes = [...(ownedNotes || [])];
      
      if (collabData && collabData.length > 0) {
        const collabIds = collabData.map(c => c.note_id);
        const { data: sharedWithMe } = await supabase.from('notes').select('*').in('id', collabIds);
        if (sharedWithMe) allFetchedNotes = [...allFetchedNotes, ...sharedWithMe];
      }

      const hydratedNotes = allFetchedNotes.map(n => ({
        ...n,
        folder: n.folder || 'Main',
        tags: Array.isArray(n.tags) ? n.tags : [],
        is_pinned: Boolean(n.is_pinned),
        is_archived: Boolean(n.is_archived),
        color: n.color || 'default',
        category: n.category || 'General'
      }));

      setNotes(hydratedNotes as Note[]);
    } catch (err: any) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, isOffline, supabase]);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  const createNote = useCallback(async (noteData: Partial<Note>) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: noteData.title || '',
      content: noteData.content || '',
      user_id: user?.id || 'guest',
      color: noteData.color || 'default',
      is_pinned: noteData.is_pinned || false,
      is_archived: noteData.is_archived || false,
      tags: noteData.tags || [],
      folder: noteData.folder || activeFolder || 'Main',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setNotes(prev => [newNote, ...prev]);
    if (user && !isOffline) {
      await supabase.from('notes').insert(newNote);
    } else if (!user) {
        // Guest handling
    } else {
      setSyncQueue(prev => [...prev, { type: 'CREATE', payload: newNote }]);
    }
    return { success: true, note: newNote };
  }, [user, isOffline, activeFolder, supabase]);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    const timestamp = new Date().toISOString();
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updated_at: timestamp } : n));
    
    if (user && !isOffline) {
      const { error } = await supabase.from('notes').update({ ...updates, updated_at: timestamp }).eq('id', id);
      if (error) return { success: false, error: error.message };
    } else if (user && isOffline) {
      setSyncQueue(prev => [...prev, { type: 'UPDATE', payload: { id, updates: { ...updates, updated_at: timestamp } } }]);
    }
    return { success: true };
  }, [user, isOffline, supabase]);

  const deleteForever = useCallback(async (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (user && !isOffline) await supabase.from('notes').delete().eq('id', id);
    else if (user && isOffline) setSyncQueue(prev => [...prev, { type: 'DELETE', payload: { id } }]);
    return { success: true };
  }, [user, isOffline, supabase]);

  const deleteNote = useCallback(async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return { success: false };
    if (note.folder === 'Trash') return deleteForever(id);
    return updateNote(id, { folder: 'Trash', is_pinned: false });
  }, [notes, deleteForever, updateNote]);

  const filterNotes = useCallback((notesToFilter: Note[]) => {
    return notesToFilter.filter(note => {
      if (activeFolder === 'Trash' && note.folder !== 'Trash') return false;
      if (activeFolder !== 'Trash' && note.folder === 'Trash') return false;
      if (activeFolder !== 'Main' && activeFolder !== 'Trash' && note.folder !== activeFolder) return false;

      const matchesSearch = !searchQuery ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => note.tags?.includes(tag));
      return matchesSearch && matchesTags;
    });
  }, [searchQuery, selectedTags, activeFolder]);

  const sortNotes = (ns: Note[]) => [...ns].sort((a, b) => {
    if (sortBy === 'updated') return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    if (sortBy === 'created') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return a.title.localeCompare(b.title);
  });

  const pinnedNotes = useMemo(() => sortNotes(filterNotes(notes.filter(n => !n.is_archived && n.is_pinned))), [notes, filterNotes, sortBy]);
  const activeNotes = useMemo(() => sortNotes(filterNotes(notes.filter(n => !n.is_archived && !n.is_pinned))), [notes, filterNotes, sortBy]);
  const archivedNotes = useMemo(() => sortNotes(filterNotes(notes.filter(n => n.is_archived))), [notes, filterNotes, sortBy]);

  const folders = useMemo(() => {
    const set = new Set<string>(['Main']);
    notes.forEach(n => n.folder && n.folder !== 'Trash' && set.add(n.folder));
    return Array.from(set).sort();
  }, [notes]);

  return {
    notes: activeNotes, pinnedNotes, activeNotes, archivedNotes,
    allTags: useMemo(() => Array.from(new Set(notes.flatMap(n => n.tags || []))).sort(), [notes]),
    searchQuery, setSearchQuery, selectedTags, setSelectedTags,
    toggleTag: (tag: string) => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]),
    sortBy, setSortBy, viewMode, setViewMode, isLoading, isOffline,
    createNote, updateNote, deleteNote,
    togglePin: (id: string) => { const n = notes.find(x => x.id === id); return updateNote(id, { is_pinned: !n?.is_pinned }); },
    toggleArchive: (id: string) => { const n = notes.find(x => x.id === id); return updateNote(id, { is_archived: !n?.is_archived, is_pinned: false }); },
    duplicateNote: (id: string) => { const n = notes.find(x => x.id === id); if (!n) return Promise.resolve({ success: false }); return createNote({ ...n, title: `${n.title} (Copy)`, is_pinned: false }); },
    folders, activeFolder, setActiveFolder,
    renameFolder: async (oldName, newName) => {
      setNotes(prev => prev.map(n => n.folder === oldName ? { ...n, folder: newName } : n));
      if (user && !isOffline) await supabase.from('notes').update({ folder: newName }).eq('folder', oldName).eq('user_id', user.id);
      return { success: true };
    },
    deleteFolder: async (name) => {
      setNotes(prev => prev.map(n => n.folder === name ? { ...n, folder: 'Trash' } : n));
      if (user && !isOffline) await supabase.from('notes').update({ folder: 'Trash' }).eq('folder', name).eq('user_id', user.id);
      if (activeFolder === name) setActiveFolder('Main');
      return { success: true };
    },
    pinnedFolders, togglePinFolder: (f) => setPinnedFolders(p => p.includes(f) ? p.filter(x => x !== f) : [...p, f]),
    createFolder: (name) => createNote({ title: `Cluster: ${name}`, content: `<p>New intelligence segment initialized.</p>`, folder: name }),
    restoreNote: (id) => updateNote(id, { folder: 'Main', is_archived: false }),
    deleteForever,
    emptyTrash: async () => {
      setNotes(prev => prev.filter(n => n.folder !== 'Trash'));
      if (user && !isOffline) await supabase.from('notes').delete().eq('folder', 'Trash').eq('user_id', user.id);
      return { success: true };
    },
    shareNote: async (id, type = 'public', _password, permission = 'read', isDiscoverable = false) => {
      try {
        const n = notes.find(x => x.id === id);
        if (!n) throw new Error('Note not found');
        const slug = n.share_slug || generateShareSlug(n.title);
        const updates = { is_shared: true, share_slug: slug, share_type: type, share_permission: permission, is_discoverable: isDiscoverable };
        const { error } = await supabase.from('notes').update(updates).eq('id', id);
        if (error) throw error;
        setNotes(prev => prev.map(x => x.id === id ? { ...x, ...updates } : x));
        return { success: true, slug };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
    unshareNote: async (id) => {
      try {
        const updates = { is_shared: false, share_slug: undefined, is_discoverable: false };
        const { error } = await supabase.from('notes').update(updates).eq('id', id);
        if (error) throw error;
        setNotes(prev => prev.map(x => x.id === id ? { ...x, ...updates } : x));
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
    logs, collaborators,
    fetchLogs: async (id) => { 
        const { data } = await supabase.from('note_logs').select('*').eq('note_id', id).order('created_at', { ascending: false }); 
        if (data) setLogs(data); 
    },
    fetchCollaborators: async (id) => { 
        const { data } = await supabase.from('note_collaborators').select('*').eq('note_id', id); 
        if (data) setCollaborators(data); 
    },
    addCollaborator: async (id, email, perm) => { 
        await supabase.from('note_collaborators').upsert({ note_id: id, email, permission: perm }); 
        return { success: true }; 
    },
    removeCollaborator: async (id, email) => { 
        await supabase.from('note_collaborators').delete().eq('id', id).eq('email', email); 
        return { success: true }; 
    },
    addLog: async (id, action, details) => { 
        await supabase.from('note_logs').insert({ note_id: id, user_id: user?.id, user_email: user?.email, action, details }); 
    },
    rateNote: async (id, val) => { await supabase.from('note_ratings').upsert({ note_id: id, user_id: user?.id, rating: val }); return { success: true }; },
    fetchRatings: async (id) => { 
        const { data } = await supabase.from('note_ratings').select('rating').eq('note_id', id); 
        return { average: data?.length ? data.reduce((a, b) => a + b.rating, 0) / data.length : 0, count: data?.length || 0 }; 
    },
    addComment: async (id, text, pid) => { 
        const { data } = await supabase.from('note_comments').insert({ note_id: id, user_id: user?.id, user_email: user?.email, content: text, parent_id: pid }).select().single(); 
        return { success: true, comment: data }; 
    },
    fetchComments: async (id) => { 
        const { data } = await supabase.from('note_comments').select('*').eq('note_id', id).order('created_at', { ascending: true }); 
        return data || []; 
    },
    deleteComment: async (id) => { 
        await supabase.from('note_comments').delete().eq('id', id); 
        return { success: true }; 
    },
    reconcileNotes: async () => {
      if (!user) return { success: false, error: 'User not authenticated' };
      try {
        const { data, error } = await supabase.rpc('reconcile_by_master_id', { p_legacy_id: 'cfd6e46f-c2d7-45b1-978f-0a4401fe35da' });
        if (error) throw error;
        loadNotes();
        return { success: true, count: data };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
    diagnostics: {
      projectId: (supabase as any).supabaseUrl?.split('//')[1]?.split('.')[0] || 'Unknown',
      authId: user?.id || 'Anonymous',
      notesCount: notes.length
    },
    forceSync: async () => {
      localStorage.clear();
      setNotes([]);
      await loadNotes();
      toast.info('Local cache purged. Rescanning Cloud Hub.');
    },
    reconcileDiscovery: async () => {
        return { success: true, count: 0 }; // Placeholder
    },
    syncGuestNotes: async (targetUserId: string) => {
        const guestNotes = JSON.parse(localStorage.getItem('notes_guest') || '[]');
        if (guestNotes.length === 0) return { success: true, count: 0 };
        const notesToSync = guestNotes.map((n: Note) => ({ ...n, user_id: targetUserId }));
        const { error } = await supabase.from('notes').insert(notesToSync);
        if (error) return { success: false, error: error.message, count: 0 };
        localStorage.removeItem('notes_guest');
        loadNotes();
        return { success: true, count: notesToSync.length };
    }
  };
}
