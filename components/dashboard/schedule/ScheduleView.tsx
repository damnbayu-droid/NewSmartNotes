'use client'

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { 
    ChevronLeft, 
    ChevronRight, 
    Clock, 
    Plus, 
    Sparkles, 
    Loader2, 
    Pencil, 
    Save,
    Calendar as CalendarIcon,
    Zap,
    MapPin,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useNotes } from '@/hooks/useNotes';
import { useAuth } from '@/hooks/useAuth';
import { askAI } from '@/lib/ai';
import { toast } from 'sonner';

export function ScheduleView() {
    const { user } = useAuth();
    const { notes, updateNote, createNote } = useNotes(user);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isScheduling, setIsScheduling] = useState(false);

    // Edit Dialog State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<any>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editTime, setEditTime] = useState('');

    // Get notes with reminders
    const scheduledNotes = useMemo(() => {
        return notes.filter(note => note.reminder_date && !note.is_archived && note.folder !== 'Trash');
    }, [notes]);

    // Get notes for selected date
    const notesForSelectedDate = useMemo(() => {
        return scheduledNotes.filter(note =>
            note.reminder_date && isSameDay(new Date(note.reminder_date), selectedDate)
        ).sort((a, b) => new Date(a.reminder_date!).getTime() - new Date(b.reminder_date!).getTime());
    }, [scheduledNotes, selectedDate]);

    // Calendar generation
    const calendarDays = useMemo(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const handleAutoSchedule = async () => {
        setIsScheduling(true);
        try {
            const backlog = notes.filter(n => !n.reminder_date && !n.is_archived && n.folder !== 'Trash');
            if (backlog.length === 0) {
                toast.info('Neural Scan Complete', { description: "No unscheduled tasks found in the core." });
                return;
            }

            const existingSchedule = scheduledNotes.map(n => ({ title: n.title, time: n.reminder_date }));
            const tasksToSchedule = backlog.slice(0, 5).map(n => ({ id: n.id, title: n.title, content: n.content }));

            const prompt = `
                I have a list of unscheduled tasks and my current schedule.
                Please assign a realistic deadline/reminder for the unscheduled tasks starting from tomorrow.
                Spread them out reasonably (e.g., 1-2 tasks per day).
                
                Current Time: ${new Date().toISOString()}
                Existing Schedule: ${JSON.stringify(existingSchedule)}
                Tasks to Schedule: ${JSON.stringify(tasksToSchedule)}
                
                Return a JSON object where keys are Note IDs and values are ISO 8601 date strings.
                Example: { "note-id-1": "2023-10-27T10:00:00.000Z" }
            `;

            const response = await askAI([
                { role: 'system', content: 'You are a neural scheduling assistant. Return ONLY valid JSON.' },
                { role: 'user', content: prompt }
            ]);

            const content = response.content;
            const jsonMatch = content?.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("Could not parse schedule from AI");

            const scheduleMap = JSON.parse(jsonMatch[0]);

            let count = 0;
            for (const [noteId, dateStr] of Object.entries(scheduleMap)) {
                if (dateStr && typeof dateStr === 'string') {
                    await updateNote(noteId, { reminder_date: dateStr });
                    count++;
                }
            }

            toast.success('Sync Successful', { description: `Automatically scheduled ${count} tasks into the temporal grid.` });
        } catch (error) {
            console.error(error);
            toast.error('Neural Sync Failed', { description: "Retry the auto-schedule sequence." });
        } finally {
            setIsScheduling(false);
        }
    };

    const handleAddEvent = async () => {
        const date = new Date(selectedDate);
        date.setHours(9, 0, 0, 0);
        const isoDate = date.toISOString();

        const newNote = await createNote({
            title: 'New Temporal Node',
            content: '',
            reminder_date: isoDate,
            folder: 'Schedule'
        });

        if (newNote) {
            openEditDialog({ ...newNote, title: 'New Temporal Node', content: '', reminder_date: isoDate });
            toast.success('Node Initialized');
        }
    };

    const openEditDialog = (note: any) => {
        setEditingNote(note);
        setEditTitle(note.title);
        setEditContent(note.content || '');
        if (note.reminder_date) {
            const d = new Date(note.reminder_date);
            const pad = (n: number) => n.toString().padStart(2, '0');
            const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
            setEditTime(localIso);
        } else {
            setEditTime('');
        }
        setIsEditOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingNote) return;
        try {
            const date = new Date(editTime);
            const isoDate = date.toISOString();
            await updateNote(editingNote.id, {
                title: editTitle,
                content: editContent,
                reminder_date: isoDate
            });
            toast.success('Node Updated');
            setIsEditOpen(false);
        } catch (e) {
            console.error(e);
            toast.error('Update Failed');
        }
    };

    return (
        <div className="flex-1 flex flex-col md:flex-row gap-8 h-full bg-slate-50/20 dark:bg-slate-950/20 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            {/* Calendar Core Section */}
            <div className="flex-1 space-y-8 flex flex-col">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-full text-xs font-black uppercase tracking-widest border border-violet-200 dark:border-violet-900/50 shadow-sm">
                            <CalendarIcon className="w-4 h-4" />
                            Temporal Protocol 2.4
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                            Neural <span className="text-violet-600">Timeline</span>
                        </h1>
                    </div>

                    <div className="flex items-center bg-white dark:bg-slate-900 rounded-[1.5rem] p-1.5 border border-slate-200 dark:border-slate-800 shadow-sm h-14">
                        <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-11 w-11 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
                             <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <div className="px-6 flex flex-col items-center">
                            <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest">{format(currentDate, 'yyyy')}</span>
                            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{format(currentDate, 'MMMM')}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-11 w-11 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
                             <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/20 dark:shadow-none p-10">
                    <div className="grid grid-cols-7 gap-6 text-center mb-8">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-4">
                        {calendarDays.map((day) => {
                            const isSelected = isSameDay(day, selectedDate);
                            const isTodayDate = isToday(day);
                            const hasEvents = scheduledNotes.some(n => n.reminder_date && isSameDay(new Date(n.reminder_date), day));

                            return (
                                <button
                                    key={day.toISOString()}
                                    onClick={() => setSelectedDate(day)}
                                    className={`
                                        h-16 md:h-24 rounded-[1.5rem] flex flex-col items-center justify-center relative transition-all duration-300 group
                                        ${isSelected
                                            ? 'bg-violet-600 text-white shadow-xl shadow-violet-500/30 scale-105 z-10'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                        }
                                        ${isTodayDate && !isSelected ? 'border-2 border-violet-500/20 bg-violet-50/50 dark:bg-violet-950/20' : ''}
                                    `}
                                >
                                    <span className={`text-lg transition-all ${isSelected ? 'font-black scale-110' : 'font-bold'}`}>
                                        {format(day, 'd')}
                                    </span>
                                    {hasEvents && (
                                        <div className={`mt-2 flex gap-1`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-violet-500 animate-pulse'}`} />
                                        </div>
                                    )}
                                    {isTodayDate && !isSelected && (
                                        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-violet-600" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Sidebar / Event Stream Section */}
            <div className="w-full md:w-[400px] flex flex-col gap-6">
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/20 dark:shadow-none flex flex-col overflow-hidden">
                    <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                        <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-violet-600" />
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                                    {isToday(selectedDate) ? 'Sync Today' : format(selectedDate, 'MMM d')}
                                </h3>
                             </div>
                             <Button 
                                onClick={handleAddEvent}
                                className="h-10 w-10 p-0 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl active:scale-95 transition-all"
                             >
                                <Plus className="w-5 h-5" />
                             </Button>
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{format(selectedDate, 'EEEE')}</p>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-8 space-y-4">
                            {notesForSelectedDate.length === 0 ? (
                                <div className="text-center py-12 flex flex-col items-center gap-4 opacity-50">
                                    <div className="w-16 h-16 rounded-[2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <Clock className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal Hub Silent</p>
                                        <p className="text-[9px] font-bold text-slate-300 uppercase">No scheduled activity found</p>
                                    </div>
                                </div>
                            ) : (
                                notesForSelectedDate.map(note => (
                                    <div
                                        key={note.id}
                                        onClick={() => openEditDialog(note)}
                                        className="group relative p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl hover:shadow-violet-500/10 transition-all border border-transparent hover:border-violet-100 dark:hover:border-violet-900/50 cursor-pointer overflow-hidden"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-violet-600 uppercase tracking-widest mb-1">
                                                    {note.reminder_date && format(new Date(note.reminder_date), 'h:mm a')}
                                                </span>
                                                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm line-clamp-1">{note.title || 'Untitled Node'}</h4>
                                            </div>
                                            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-white dark:bg-slate-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Pencil className="w-3 h-3 text-violet-600" />
                                            </div>
                                        </div>
                                        {note.content && (
                                            <p className="text-[10px] font-medium text-slate-500 line-clamp-2 leading-relaxed">{note.content}</p>
                                        )}
                                        {/* Accents */}
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>

                <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-violet-500/30 relative overflow-hidden group">
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black uppercase tracking-tighter italic">Neural Auto-Schedule</h3>
                            <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">AI analysis of core backlog</p>
                        </div>
                        <Button
                            onClick={handleAutoSchedule}
                            disabled={isScheduling}
                            className="w-14 h-14 rounded-2xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-0 shadow-lg active:scale-95 transition-all"
                        >
                            {isScheduling ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                        </Button>
                    </div>
                    {/* Background Texture */}
                    <div className="absolute -right-4 -bottom-4 opacity-10 blur-xl group-hover:scale-110 transition-transform duration-1000">
                        <Zap className="w-32 h-32" />
                    </div>
                </div>
            </div>

            {/* Edit Protocol Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] bg-white dark:bg-slate-900 border-0 p-8 shadow-2xl">
                    <DialogHeader className="items-center text-center space-y-4">
                        <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-violet-600" />
                        </div>
                        <DialogTitle className="text-xl font-black uppercase tracking-tighter">Edit Temporal Node</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Classification Title</Label>
                            <Input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Temporal Coordinate</Label>
                            <Input
                                type="datetime-local"
                                value={editTime}
                                onChange={(e) => setEditTime(e.target.value)}
                                className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Payload Description</Label>
                            <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="min-h-[120px] rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4"
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex items-center gap-3 sm:justify-center">
                        <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Cancel</Button>
                        <Button onClick={handleSaveEdit} className="h-12 px-8 rounded-2xl bg-violet-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">
                            <Save className="w-4 h-4 mr-2" />
                            Finalize Update
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
