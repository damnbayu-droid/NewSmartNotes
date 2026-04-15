'use client'

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    ChevronLeft, 
    FileText, 
    Plus, 
    Trash2, 
    Bot, 
    Sparkles, 
    Send, 
    X, 
    Loader2, 
    Menu, 
    Zap,
    History,
    Book as BookIcon
} from 'lucide-react';
import { Book, Chapter } from '@/types/books';
import { askAI } from '@/lib/ai';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { toast } from 'sonner';

interface BookEditorProps {
    book: Book;
    onSave: (book: Book) => void;
    onBack: () => void;
}

interface Message {
    role: 'user' | 'ai';
    content: string;
}

export function BookEditor({ book: initialBook, onSave, onBack }: BookEditorProps) {
    const [book, setBook] = useState<Book>(initialBook);
    const [activeChapterId, setActiveChapterId] = useState<string>(initialBook.chapters[0]?.id || '');
    const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
    const [isAIOpen, setIsAIOpen] = useState(false);
    const [aiInput, setAiInput] = useState('');
    const [aiMessages, setAiMessages] = useState<Message[]>([
        { role: 'ai', content: 'Initialize Writing Protocol. I am your neural assistant. How shall we expand the manuscript today?' }
    ]);
    const [isAILoading, setIsAILoading] = useState(false);
    const aiScrollRef = useRef<HTMLDivElement>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const activeChapter = book.chapters.find(c => c.id === activeChapterId);

    // Auto-save logic to the Neural Shelf
    useEffect(() => {
        if (autoSaveTimer) clearTimeout(autoSaveTimer);
        const timer = setTimeout(() => {
            onSave(book);
        }, 2000);
        setAutoSaveTimer(timer);
        return () => clearTimeout(timer);
    }, [book, onSave]);

    // Scroll AI chat to bottom
    useEffect(() => {
        if (aiScrollRef.current) {
            aiScrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [aiMessages, isAIOpen]);

    const handleChapterContentChange = (content: string) => {
        if (!activeChapter) return;
        setBook(prev => ({
            ...prev,
            chapters: prev.chapters.map(c =>
                c.id === activeChapterId ? { ...c, content } : c
            )
        }));
    };

    const handleChapterTitleChange = (title: string, chapterId: string) => {
        setBook(prev => ({
            ...prev,
            chapters: prev.chapters.map(c =>
                c.id === chapterId ? { ...c, title } : c
            )
        }));
    };

    const handleAddChapter = () => {
        const newChapter: Chapter = {
            id: crypto.randomUUID(),
            title: `Chapter ${book.chapters.length + 1}`,
            content: '',
            order: book.chapters.length + 1
        };

        setBook(prev => ({
            ...prev,
            chapters: [...prev.chapters, newChapter]
        }));
        setActiveChapterId(newChapter.id);
        toast.success(`Chapter ${book.chapters.length + 1} Synthesized`);
    };

    const handleDeleteChapter = (chapterId: string) => {
        if (book.chapters.length <= 1) {
            toast.error('Deletion Blocked', {
                description: 'The manuscript requires at least one intelligence node.'
            });
            return;
        }

        setBook(prev => ({
            ...prev,
            chapters: prev.chapters.filter(c => c.id !== chapterId)
        }));

        if (activeChapterId === chapterId) {
            setActiveChapterId(book.chapters.find(c => c.id !== chapterId)?.id || '');
        }
    };

    const handleAskAI = async () => {
        if (!aiInput.trim()) return;

        const userMsg: Message = { role: 'user', content: aiInput };
        setAiMessages(prev => [...prev, userMsg]);
        setAiInput('');
        setIsAILoading(true);

        const systemPrompt = `
            You are a Neural Writing Assistant. 
            Manuscript: "${book.title}"
            Context: "${activeChapter?.content.slice(-2000) || ''}"
            Objective: Continuity and creative expansion.
        `;

        try {
            const response = await askAI([
                { role: 'system', content: systemPrompt },
                ...aiMessages.slice(-5).map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }) as any),
                { role: 'user', content: aiInput }
            ]);
            
            const content = response.content || "Connection lost. Neural link timing out.";
            setAiMessages(prev => [...prev, { role: 'ai', content }]);
        } catch (error) {
            console.error(error);
            setAiMessages(prev => [...prev, { role: 'ai', content: "Neural Sync Failed." }]);
        } finally {
            setIsAILoading(false);
        }
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <Button variant="ghost" size="sm" onClick={onBack} className="mb-6 -ml-2 text-slate-500 hover:text-violet-600 transition-colors">
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Back to Shelf
                </Button>
                <div className="space-y-4">
                    <Input
                        value={book.title}
                        onChange={(e) => setBook(prev => ({ ...prev, title: e.target.value }))}
                        className="font-black text-xl border-0 px-0 h-auto focus-visible:ring-0 bg-transparent uppercase tracking-tighter"
                    />
                    <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Manuscript Active</span>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2 block">
                        Chapter Grid
                    </label>
                    {book.chapters.map((chapter) => (
                        <div
                            key={chapter.id}
                            className={`group flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all ${activeChapterId === chapter.id
                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                                : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                                }`}
                            onClick={() => {
                                setActiveChapterId(chapter.id);
                                if (window.innerWidth < 768) setIsMobileMenuOpen(false);
                            }}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <FileText className={`w-4 h-4 shrink-0 ${activeChapterId === chapter.id ? 'text-white' : 'text-violet-500'}`} />
                                <span className="truncate text-xs font-black uppercase tracking-tight">{chapter.title}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-500"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteChapter(chapter.id);
                                }}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800">
                <Button 
                    onClick={handleAddChapter} 
                    className="w-full h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-0 font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Chapter
                </Button>
            </div>
        </div>
    );

    return (
        <div className="h-full flex bg-white dark:bg-slate-950 overflow-hidden relative">
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex w-72 shrink-0">
                <SidebarContent />
            </div>

            {/* Mobile Sidebar (Sheet) */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetContent side="left" className="p-0 w-80 border-0">
                    <SidebarContent />
                </SheetContent>
            </Sheet>

            {/* Main Content - Dynamic Editor */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Protocol Header */}
                <div className="p-6 md:px-12 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950/80 backdrop-blur-md z-10">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu className="w-5 h-5" />
                        </Button>
                        <div className="space-y-1">
                            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                {activeChapter?.title || 'Chapter Entry'}
                            </h2>
                            <div className="flex items-center gap-3">
                                <History className="w-3 h-3 text-slate-300" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    Last Sync: {new Date(book.updatedAt).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            className={`h-11 px-5 rounded-2xl border-0 transition-all ${isAIOpen ? 'bg-violet-600 text-white shadow-xl shadow-violet-500/20' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-violet-600'}`}
                            onClick={() => setIsAIOpen(!isAIOpen)}
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Assistant</span>
                        </Button>
                    </div>
                </div>

                {activeChapter ? (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-6 md:px-12 py-10 max-w-4xl mx-auto w-full">
                            <Input
                                value={activeChapter.title}
                                onChange={(e) => handleChapterTitleChange(e.target.value, activeChapter.id)}
                                className="text-5xl font-black border-0 px-0 h-auto focus-visible:ring-0 placeholder:text-slate-100 dark:placeholder:text-slate-800 text-slate-900 dark:text-white tracking-tighter uppercase italic"
                                placeholder="Chapter Title"
                            />
                            <div className="h-1 w-20 bg-violet-600 mt-4 rounded-full" />
                        </div>
                        <div className="flex-1 overflow-auto px-6 md:px-12 pb-24 custom-scrollbar">
                            <Textarea
                                value={activeChapter.content}
                                onChange={(e) => handleChapterContentChange(e.target.value)}
                                className="max-w-4xl mx-auto w-full h-full min-h-[600px] border-0 focus-visible:ring-0 resize-none text-xl leading-relaxed p-0 placeholder:text-slate-100 dark:placeholder:text-slate-900 font-serif text-slate-800 dark:text-slate-200 bg-transparent selection:bg-violet-100 dark:selection:bg-violet-900"
                                placeholder="Start your intelligence synthesis..."
                            />
                        </div>
                        
                        {/* Status Bar */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-8 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <Zap className="w-3 h-3 text-amber-500" />
                                Word Count: {activeChapter.content.split(/\s+/).filter(w => w.length > 0).length}
                            </div>
                            <div className="flex items-center gap-2">
                                <BookIcon className="w-3 h-3 text-violet-500" />
                                Manuscript Total: {book.chapters.reduce((acc, c) => acc + c.content.split(/\s+/).filter(w => w.length > 0).length, 0)}
                            </div>
                        </div>
                    </div >
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4">
                        <FileText className="w-16 h-16 opacity-20" />
                        <span className="text-xs font-black uppercase tracking-widest opacity-40">Load Chapter Node</span>
                    </div>
                )}
            </div>

            {/* AI Neural Sidebar */}
            {isAIOpen && (
                <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[400px] bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-500">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">Writing Assitant</h3>
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Neural Link Active</span>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => setIsAIOpen(false)}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    <ScrollArea className="flex-1 p-6">
                        <div className="space-y-6">
                            {aiMessages.map((msg, idx) => (
                                <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {msg.role === 'ai' && (
                                        <div className="shrink-0 pt-2">
                                            <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                                <Bot className="w-4 h-4 text-violet-600" />
                                            </div>
                                        </div>
                                    )}
                                    <div className={`p-4 text-xs font-medium leading-relaxed rounded-2xl max-w-[85%] ${msg.role === 'user'
                                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/10'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                                    }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isAILoading && (
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center animate-pulse">
                                        <Bot className="w-4 h-4 text-violet-600" />
                                    </div>
                                    <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 flex items-center gap-3">
                                        <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                                        <span className="text-[10px] font-black uppercase text-slate-400">Expanding Neural Path...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={aiScrollRef} />
                        </div>
                    </ScrollArea>

                    <div className="p-6 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex gap-3">
                            <Input
                                placeholder="Direct your assistant..."
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                                disabled={isAILoading}
                                className="flex-1 h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
                            />
                            <Button size="icon" onClick={handleAskAI} disabled={isAILoading || !aiInput.trim()} className="h-12 w-12 rounded-2xl bg-violet-600 shadow-xl shadow-violet-500/20">
                                <Send className="w-5 h-5 text-white" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
