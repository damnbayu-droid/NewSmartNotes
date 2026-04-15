'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import { useDebounce } from '@/hooks/useDebounce'
import type { Note, User, NoteCategory, NoteColor } from '@/types'
import { NOTE_COLORS } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { 
    X, 
    Save, 
    Share2, 
    Trash2, 
    Pin, 
    Sparkles, 
    Loader2, 
    Globe, 
    Copy, 
    Check, 
    FilePlus, 
    Database, 
    Cloud, 
    Github, 
    Palette, 
    Tag, 
    Calendar,
    PenTool,
    Maximize2,
    Minimize2,
    Link as LinkIcon,
    Mic
} from 'lucide-react'
import { VoiceRecorder } from './VoiceRecorder'
import { buildShareUrl } from '@/lib/shareUtils'
import { toast } from 'sonner'
import { OutsourcePicker } from './OutsourcePicker'
import { CanvasEditor } from './CanvasEditor'

interface NoteEditorProps {
  user: User | null
  note: Note | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (updates: Partial<Note>) => void
  onDelete?: (id: string) => void
  onTogglePin?: (id: string) => void
  onShareNote?: (id: string, type?: 'public', permission?: 'read' | 'write', isDiscoverable?: boolean, category?: NoteCategory) => Promise<{ success: boolean; slug?: string; error?: string }>
  onUnshareNote?: (id: string) => Promise<{ success: boolean; error?: string }>
}

export function NoteEditor({ user, note, isOpen, onClose, onUpdate, onDelete, onShareNote, onUnshareNote, onTogglePin }: NoteEditorProps) {
  const [editorHtml, setEditorHtml] = useState('')
  const [editorText, setEditorText] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  
  // Note Metadata States
  const [color, setColor] = useState<NoteColor>(note?.color || 'default')
  const [tags, setTags] = useState<string[]>(note?.tags || [])
  const [newTag, setNewTag] = useState('')
  const [reminderDate, setReminderDate] = useState(note?.reminder_date || '')
  const [showMetadata, setShowMetadata] = useState(false)
  
  // Integration States
  const [isOutsourceOpen, setIsOutsourceOpen] = useState(false)
  const [outsourceMode, setOutsourceMode] = useState<'drive' | 'resource'>('drive')
  const [isCanvasOpen, setIsCanvasOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sharing States
  const [isSharingModalOpen, setIsSharingModalOpen] = useState(false)
  const [isDiscoverable, setIsDiscoverable] = useState(note?.is_discoverable || false)
  const [category, setCategory] = useState<NoteCategory>(note?.category || 'General')
  const [isProcessingShare, setIsProcessingShare] = useState(false)
  const [hasCopied, setHasCopied] = useState(false)

  const lastSavedState = useRef({ 
    html: '', 
    color: 'default' as NoteColor, 
    tags: [] as string[], 
    reminderDate: '', 
    isDiscoverable: false, 
    category: 'General' as NoteCategory 
  })

  // Auto-hide Dynamic Island when note editor is open
  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new CustomEvent('note-editor-open'))
    } else {
      window.dispatchEvent(new CustomEvent('note-editor-close'))
    }
  }, [isOpen])

  useEffect(() => {
    if (note) {
      setIsDiscoverable(Boolean(note.is_discoverable))
      setCategory(note.category || 'General')
      setColor(note.color || 'default')
      setTags(note.tags || [])
      setReminderDate(note.reminder_date || '')
      
      const initialHtml = note.content || ''
      lastSavedState.current = {
        html: initialHtml,
        color: note.color || 'default',
        tags: [...(note.tags || [])],
        reminderDate: note.reminder_date || '',
        isDiscoverable: Boolean(note.is_discoverable),
        category: note.category || 'General'
      }
    }
  }, [note])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // starter-kit v3+ includes history, paragraph, etc.
      }),
      Link.configure({ 
        openOnClick: true, 
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: 'text-violet-600 dark:text-violet-400 underline decoration-2 underline-offset-4 font-bold'
        }
      }),
      Image.configure({ HTMLAttributes: { class: 'rounded-2xl max-w-full' } }),
      Placeholder.configure({
        placeholder: 'Synthesize your intelligence here...',
      }),
    ],
    content: note?.content || '',
    onUpdate: ({ editor }) => {
      setEditorHtml(editor.getHTML())
      setEditorText(editor.getText())
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base focus:outline-none w-full max-w-none text-slate-900 dark:text-slate-100 prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-p:leading-relaxed',
      },
    },
  })

  // Sync editor content when note changes
  useEffect(() => {
    if (note && editor) {
      if (editor.getHTML() !== note.content) {
        editor.commands.setContent(note.content || '')
      }
    } else if (!note && editor) {
      editor.commands.setContent('')
    }
  }, [note, editor])

  const debouncedHtml = useDebounce(editorHtml, 1500)
  const debouncedText = useDebounce(editorText, 1500)

  // Auto-save logic
  useEffect(() => {
    if (!isOpen || !note || !debouncedText.trim()) return

    const hasChanged = 
      debouncedHtml !== lastSavedState.current.html ||
      color !== lastSavedState.current.color ||
      isDiscoverable !== lastSavedState.current.isDiscoverable ||
      category !== lastSavedState.current.category ||
      reminderDate !== lastSavedState.current.reminderDate ||
      JSON.stringify(tags) !== JSON.stringify(lastSavedState.current.tags)

    if (hasChanged) {
      setIsSaving(true)
      const title = debouncedText.split('\n')[0]?.substring(0, 100) || 'Untitled Note'
      onUpdate({ 
        title, 
        content: debouncedHtml, 
        color, 
        tags, 
        is_discoverable: isDiscoverable, 
        category,
        reminder_date: reminderDate || undefined
      })
      lastSavedState.current = {
        html: debouncedHtml,
        color,
        tags: [...tags],
        reminderDate: reminderDate || '',
        isDiscoverable,
        category
      }
      setTimeout(() => setIsSaving(false), 800)
    }
  }, [debouncedHtml, debouncedText, color, tags, isDiscoverable, category, reminderDate, note, isOpen, onUpdate])

  const handleShare = async () => {
    if (!note || !onShareNote) return
    setIsProcessingShare(true)
    const res = await onShareNote(note.id, 'public', 'read', isDiscoverable, category)
    setIsProcessingShare(false)
    if (res.success) {
      toast.success('Intelligence broadcasting initialized.', {
        description: 'Your node is now accessible via the provided neural bridge.'
      })
    }
  }

  const handleUnshare = async () => {
    if (!note || !onUnshareNote) return
    setIsProcessingShare(true)
    await onUnshareNote(note.id)
    setIsProcessingShare(false)
    setIsSharingModalOpen(false)
    toast.info('Neural bridge collapsed. Node is once again private.')
  }

  const handleImportOutsource = (content: string, metadata: any) => {
    if (editor) {
      const separator = `<hr class="my-8 border-slate-100 dark:border-slate-800" />`
      const sourceHeader = `<div class="p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 mb-4">
        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Source: ${metadata.type || 'External'}</p>
        <p class="text-xs font-black text-slate-900 dark:text-white">${metadata.path || metadata.repo || 'Imported Asset'}</p>
      </div>`
      
      const formattedContent = metadata.type === 'github_clone' 
        ? `${separator}${sourceHeader}<pre class="text-[11px] font-mono leading-relaxed bg-slate-900 text-slate-100 p-6 rounded-3xl overflow-auto border border-slate-800 shadow-2xl"><code>${content}</code></pre>` 
        : `${separator}${sourceHeader}${content}`
        
      editor.chain().focus().insertContent(formattedContent).run()
      
      onUpdate({ 
        external_source_url: metadata.url, 
        external_source_type: metadata.type, 
        external_source_title: metadata.path || metadata.repo 
      })
      
      toast.success('Resource Connected', { description: `Imported ${metadata.path || 'content'} successfully.` })
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result && editor) {
          editor.chain().focus().setImage({ src: event.target.result as string }).run()
        }
      }
      reader.readAsDataURL(file)
    } else {
       toast.info('Feature Uplink Needed', { description: 'Currently strictly supporting high-fidelity Image ingestion.' })
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault()
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()])
      }
      setNewTag('')
    }
  }

  const shareUrl = note?.share_slug ? buildShareUrl(note.share_slug) : ''
  const copyToClipboard = () => {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl)
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 2000)
    toast.info('Neural bridge link copied to interface.')
  }

  const colorOption = NOTE_COLORS.find(c => c.value === color) || NOTE_COLORS[0]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`${isMaximized ? 'sm:max-w-none w-full h-screen rounded-none' : 'sm:max-w-[1000px] h-[90vh] rounded-[3.5rem]'} flex flex-col p-0 gap-0 overflow-hidden border-0 ${colorOption.bg} shadow-2xl transition-all duration-500`}>
        {/* Editor Header */}
        <DialogHeader className="p-8 border-b border-slate-100 dark:border-white/5 flex flex-row items-center justify-between space-y-0 backdrop-blur-xl bg-white/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl" onClick={() => setIsMaximized(!isMaximized)}>
               {isMaximized ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
             </Button>
             <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2 shrink-0" />
             <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 ${colorOption.bg} ${colorOption.border} border-2 shrink-0`}>
                   <Sparkles className="w-5 h-5 text-violet-600" />
                </div>
                <div className="min-w-0">
                   <DialogTitle className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase italic truncate">
                      Intelligence Node
                   </DialogTitle>
                   <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSaving ? 'bg-violet-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none truncate">
                         {isSaving ? 'Syncing Sequence' : 'Encrypted & Secured'}
                      </span>
                   </div>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-2">
             {/* Center Toolbelt */}
             <div className="hidden lg:flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-200/50 dark:border-white/5 mr-2">
                <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={() => fileInputRef.current?.click()}
                   className="h-10 px-3 rounded-xl gap-2 font-black uppercase text-[9px] tracking-widest text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-violet-600 transition-all"
                >
                   <FilePlus className="w-3.5 h-3.5" />
                   <span className="hidden xl:inline">Input Device</span>
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                
                <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={() => { setOutsourceMode('drive'); setIsOutsourceOpen(true); }}
                   className="h-10 px-3 rounded-xl gap-2 font-black uppercase text-[9px] tracking-widest text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-blue-600 transition-all"
                >
                   <Cloud className="w-3.5 h-3.5" />
                   <span className="hidden xl:inline">Neural Drive</span>
                </Button>

                <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={() => { setOutsourceMode('resource'); setIsOutsourceOpen(true); }}
                   className="h-10 px-3 rounded-xl gap-2 font-black uppercase text-[9px] tracking-widest text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-emerald-600 transition-all"
                >
                   <Database className="w-3.5 h-3.5" />
                   <span className="hidden xl:inline">Intelligence Hub</span>
                </Button>
             </div>

             <div className="flex items-center gap-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                      <Palette className="w-5 h-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4 rounded-[2rem] shadow-2xl border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                    <div className="flex flex-wrap gap-2 w-40">
                      {NOTE_COLORS.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => setColor(c.value)}
                          className={`w-9 h-9 rounded-xl border-2 transition-all ${color === c.value ? 'border-violet-600 scale-110 shadow-lg' : 'border-transparent hover:scale-105 active:scale-95'} ${c.bg} ${c.border}`}
                        />
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <Button variant="ghost" size="icon" className={`h-10 w-10 ${isCanvasOpen ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'} rounded-xl transition-all`} onClick={() => setIsCanvasOpen(!isCanvasOpen)}>
                   <PenTool className="w-5 h-5" />
                </Button>

                <VoiceRecorder 
                  compact 
                  onTranscriptionChunk={(text) => editor?.chain().focus().insertContent(text).run()} 
                />

                <Button
                   variant="ghost"
                   size="icon"
                   className={`h-10 w-10 rounded-xl transition-all ${showMetadata ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                   onClick={() => setShowMetadata(!showMetadata)}
                >
                   <Tag className="w-5 h-5" />
                </Button>

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2" />

                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-500 rounded-xl" onClick={() => { if(confirm("Terminate payload permanently?")) { onDelete?.(note!.id); onClose(); } }}>
                   <Trash2 className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl" onClick={onClose}>
                   <X className="w-5 h-5" />
                </Button>
             </div>
          </div>
        </DialogHeader>

        {/* Editor Body */}
        <div className="flex-1 overflow-y-auto p-12 sm:p-20 custom-scrollbar relative">
           {isCanvasOpen ? (
              <div className="absolute inset-4 z-50 animate-in zoom-in-95 fade-in duration-300">
                 <CanvasEditor onSave={(url) => { editor?.chain().focus().setImage({ src: url }).run(); setIsCanvasOpen(false); }} onCancel={() => setIsCanvasOpen(false)} />
              </div>
           ) : (
              <>
                 {note?.external_source_url && (
                    <div className="mb-12 flex items-center gap-6 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-2xl animate-in slide-in-from-top-4">
                       <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-inner">
                          {note.external_source_type?.includes('github') ? <Github className="w-8 h-8 text-black dark:text-white" /> : <Globe className="w-8 h-8 text-blue-600" />}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Knowledge Integration Protocol</p>
                          <p className="text-xl font-black text-slate-900 dark:text-white truncate tracking-tighter uppercase italic">{note.external_source_title || 'Remote Origin'}</p>
                       </div>
                       <Button size="lg" className="h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-[10px] tracking-widest px-10 shadow-xl hover:scale-105 active:scale-95 transition-all" onClick={() => window.open(note.external_source_url, '_blank')}>
                         Sync Origin
                       </Button>
                    </div>
                 )}
                 <EditorContent editor={editor} className="min-h-full pb-32" />
              </>
           )}
        </div>

        {/* Metadata Bar (Expandable) */}
        {showMetadata && (
            <div className="px-12 py-8 bg-white/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-white/5 backdrop-blur-2xl animate-in slide-in-from-bottom-4">
               <div className="flex flex-wrap gap-8">
                  <div className="flex-1 space-y-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                        <Tag className="w-3 h-3" /> Intelligence Tags
                     </p>
                     <div className="flex flex-wrap items-center gap-2">
                        {tags.map(t => (
                           <Badge key={t} variant="outline" className="h-9 px-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-900 dark:text-white font-black uppercase text-[9px] tracking-widest border-transparent hover:bg-rose-50 dark:hover:bg-rose-950 hover:text-rose-500 transition-all cursor-pointer group" onClick={() => handleRemoveTag(t)}>
                              {t} <X className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                           </Badge>
                        ))}
                        <Input 
                           placeholder="Synthesize Tag..." 
                           value={newTag} 
                           onChange={e => setNewTag(e.target.value)} 
                           onKeyDown={handleAddTag} 
                           className="w-32 h-9 text-[9px] font-black uppercase tracking-widest rounded-xl border-dashed border-slate-300 dark:border-slate-800 bg-transparent px-4 focus-visible:ring-violet-500" 
                        />
                     </div>
                  </div>

                  <div className="w-64 space-y-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> Scheduled Recall
                     </p>
                     <div className="relative">
                        <Input 
                           type="datetime-local" 
                           value={reminderDate ? new Date(reminderDate).toISOString().slice(0, 16) : ''} 
                           onChange={e => setReminderDate(new Date(e.target.value).toISOString())} 
                           className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-xl border-0 text-[10px] font-black uppercase tracking-widest px-4 focus-visible:ring-2 focus-visible:ring-violet-500" 
                        />
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                     </div>
                  </div>
               </div>
            </div>
        )}

        {/* Editor Footer */}
        <div className="p-10 bg-white/80 dark:bg-slate-950/80 border-t border-slate-100 dark:border-white/5 flex items-center justify-between backdrop-blur-3xl">
           <div className="flex items-center gap-6">
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Storage Integrity</span>
                 <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                   {user ? 'Cloud-Network Authenticated' : 'Local Sandbox Isolated'}
                 </p>
              </div>
              {note?.is_shared && (
                <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 shadow-sm shadow-emerald-500/10">
                   <Globe className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Active Broadcaster</span>
                </div>
              )}
           </div>
           
           <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setIsSharingModalOpen(true)}
                className="h-16 px-10 rounded-[2rem] border-slate-200 dark:border-white/5 text-slate-900 dark:text-white font-black uppercase text-[11px] tracking-widest bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none hover:scale-105 active:scale-95 transition-all"
              >
                 <Share2 className="w-5 h-5 mr-3 text-violet-600" /> {note?.is_shared ? 'Manage Stream' : 'Initialize Broadcast'}
              </Button>
              <Button onClick={onClose} className="h-16 px-12 rounded-[2rem] bg-violet-600 text-white font-black uppercase text-[11px] tracking-widest shadow-2xl shadow-violet-500/30 hover:bg-violet-700 hover:scale-105 active:scale-95 transition-all">
                 Commit Sequence
              </Button>
           </div>
        </div>

        {/* Sharing Protocol Dialog */}
        <Dialog open={isSharingModalOpen} onOpenChange={setIsSharingModalOpen}>
           <DialogContent className="sm:max-w-md rounded-[3.5rem] p-10 border-0 bg-white dark:bg-slate-900 shadow-2xl">
              <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-violet-600/5 blur-[100px] rounded-full pointer-events-none" />
              
              <DialogHeader className="space-y-6 relative z-10">
                 <div className="w-16 h-16 bg-violet-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-violet-500/40 mx-auto rotate-12">
                    <Globe className="w-8 h-8 text-white" />
                 </div>
                 <div className="text-center">
                    <DialogTitle className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                       Broadcasting
                    </DialogTitle>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Initialize neural stream to collective hub</p>
                 </div>
              </DialogHeader>

              <div className="space-y-8 py-8 relative z-10">
                 {/* Discovery Toggle */}
                 <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-white/5 group hover:border-violet-200 dark:hover:border-violet-500/20 transition-all cursor-pointer">
                    <div className="space-y-1">
                       <p className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Neural Discovery</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-none italic">Syndicate to community feed</p>
                    </div>
                    <Switch 
                       checked={isDiscoverable} 
                       onCheckedChange={(val) => {
                          setIsDiscoverable(val)
                          if (note?.is_shared) handleShare() 
                       }} 
                       className="data-[state=checked]:bg-violet-600"
                    />
                 </div>

                 {/* Category Selection */}
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-6 italic">Knowledge Stream Cluster</label>
                    <Select value={category} onValueChange={(val: NoteCategory) => {
                       setCategory(val)
                       if (note?.is_shared) handleShare()
                    }}>
                       <SelectTrigger className="h-16 rounded-[2rem] border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/50 dark:text-white px-8 font-black uppercase text-[11px] tracking-widest focus:ring-violet-500 shadow-sm">
                          <SelectValue placeholder="Select Cluster" />
                       </SelectTrigger>
                       <SelectContent className="rounded-[2rem] border-slate-100 dark:border-slate-800 shadow-2xl p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
                          {['General', 'Education', 'Work', 'Code', 'Personal', 'Other'].map(cat => (
                             <SelectItem key={cat} value={cat} className="h-12 rounded-xl text-[11px] font-black uppercase tracking-widest py-3 px-6 focus:bg-violet-600 focus:text-white transition-all">{cat}</SelectItem>
                          ))}
                       </SelectContent>
                    </Select>
                 </div>

                 {/* Link Display (if shared) */}
                 {note?.is_shared && note?.share_slug && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-6">
                       <div className="p-6 bg-violet-600 text-white rounded-[2.5rem] flex items-center justify-between shadow-2xl shadow-violet-500/20 relative overflow-hidden group">
                          <div className="relative z-10 flex-1 min-w-0 pr-4">
                             <p className="text-white/60 text-[9px] font-black uppercase tracking-widest mb-1 italic">Uplink URL</p>
                             <p className="text-xs font-mono font-bold truncate opacity-90">{shareUrl}</p>
                          </div>
                          <Button 
                             size="icon" 
                             variant="ghost" 
                             onClick={copyToClipboard}
                             className="relative z-10 h-14 w-14 text-white hover:bg-white/20 rounded-2xl shadow-lg border border-white/20"
                          >
                             {hasCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                          </Button>
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl group-hover:scale-150 transition-transform duration-700" />
                       </div>
                       
                       <Button 
                          onClick={handleUnshare}
                          variant="ghost" 
                          disabled={isProcessingShare}
                          className="w-full h-14 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl border border-transparent hover:border-rose-100 dark:hover:border-rose-900/50 transition-all"
                       >
                          {isProcessingShare ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Terminate Neural Link'}
                       </Button>
                    </div>
                 )}

                 {!note?.is_shared && (
                    <Button 
                       onClick={handleShare}
                       disabled={isProcessingShare}
                       className="w-full h-16 rounded-[2.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-slate-400 group relative overflow-hidden active:scale-95 transition-all"
                    >
                       {isProcessingShare ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                          <span className="relative z-10 flex items-center justify-center gap-3">
                             Initialize Stream <Sparkles className="w-5 h-5 animate-pulse" />
                          </span>
                       )}
                       <div className="absolute inset-0 bg-violet-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    </Button>
                 )}
              </div>
           </DialogContent>
        </Dialog>

        {/* Integration Pickers */}
        <OutsourcePicker 
           isOpen={isOutsourceOpen} 
           onClose={() => setIsOutsourceOpen(false)} 
           onImport={handleImportOutsource} 
           mode={outsourceMode} 
        />
      </DialogContent>
    </Dialog>
  )
}
