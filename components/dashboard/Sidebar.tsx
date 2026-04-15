'use client'

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from 'next-themes';
import {
  LayoutGrid,
  Archive,
  X,
  Calendar,
  Book,
  Mic,
  Pin,
  Trash2,
  FileEdit,
  Compass,
  Crown,
  Zap,
  MoreHorizontal,
  Moon,
  Sun,
  Plus,
  Pencil,
  MessageSquare,
  Cloud,
  Settings,
  Shield,
  LogOut,
  User as UserIcon,
  Search
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

type ViewType = 'notes' | 'archive' | 'trash' | 'scanner' | 'settings' | 'schedule' | 'books' | 'admin' | 'discovery';

interface SidebarProps {
  currentView?: ViewType;
  onViewChange?: (view: ViewType) => void;
  isOpen: boolean;
  onClose: () => void;
  folders: string[];
  activeFolder: string;
  onSelectFolder: (folder: string) => void;
  onAddFolder: () => void;
  renameFolder: (oldName: string, newName: string) => Promise<{ success: boolean; error?: string }>;
  deleteFolder: (folderName: string) => Promise<{ success: boolean; error?: string }>;
  pinnedFolders: string[];
  togglePinFolder: (folderName: string) => void;
  subscriptionTier?: string;
  onUpgrade?: () => void;
  userEmail?: string;
  diagnostics?: { projectId: string; authId: string; notesCount: number };
  onForceSync?: () => Promise<void>;
}

function SidebarNotifications() {
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        const handleStatus = (e: any) => {
            const { title, message, text, type } = e.detail;
            const id = Math.random().toString(36).substr(2, 9);
            const displayMessage = message || text || title;
            setNotifications(prev => [...prev, { id, text: displayMessage, type }]);
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }, 5000);
        };

        window.addEventListener('dcpi-status', handleStatus as any);
        window.addEventListener('dcpi-notification', handleStatus as any);
        return () => {
            window.removeEventListener('dcpi-status', handleStatus as any);
            window.removeEventListener('dcpi-notification', handleStatus as any);
        };
    }, []);

    if (notifications.length === 0) return null;

    return (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
            {notifications.slice(0, 3).map(n => (
                <div key={n.id} className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                    <span className={n.type === 'error' ? 'text-rose-500' : n.type === 'success' ? 'text-emerald-500' : 'text-violet-600'}>
                        {n.text}
                    </span>
                </div>
            ))}
        </div>
    );
}

export function Sidebar({
  isOpen,
  onClose,
  folders,
  activeFolder,
  onSelectFolder,
  onAddFolder,
  renameFolder,
  deleteFolder,
  pinnedFolders,
  togglePinFolder,
  subscriptionTier = 'free',
  onUpgrade,
  userEmail,
  diagnostics,
  onForceSync
}: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  const handleContactUs = () => {
    window.dispatchEvent(new CustomEvent('open-contact-modal'));
  };

  const navItems = [
    { id: 'notes', label: 'Dashboard', icon: LayoutGrid, path: '/' },
    { id: 'discovery', label: 'Discovery', icon: Compass, path: '/discovery' },
    { id: 'books', label: 'Book Mode', icon: Book, path: '/?view=books' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, path: '/?view=schedule' },
    { id: 'archive', label: 'Archive', icon: Archive, path: '/?view=archive' },
    { id: 'trash', label: 'Trash', icon: Trash2, path: '/?view=trash' },
    { id: 'scanner', label: 'PDF Editor', icon: FileEdit, path: '/?view=scanner' },
  ];

  const sortedFolders = useMemo(() => {
    return [...folders].sort((a, b) => {
      const aPinned = pinnedFolders.includes(a);
      const bPinned = pinnedFolders.includes(b);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return a.localeCompare(b);
    });
  }, [folders, pinnedFolders]);

  const activeView = useMemo(() => {
    if (pathname.includes('/admin')) return 'admin';
    if (pathname.includes('/discovery')) return 'discovery';
    // Check URL params for other views
    return 'notes'; 
  }, [pathname]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-[100dvh] w-72 bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800
        transition-transform duration-300 ease-in-out flex flex-col shrink-0
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        lg:translate-x-0 lg:relative lg:shrink-0 lg:shadow-none
      `}>
         <div className="flex-none p-6 pb-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-1 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800">
                        <img src="/favicon.webp" alt="Smart Notes Logo" className="w-8 h-8 rounded-xl object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display='none' }} />
                    </div>
                    <div>
                        <h1 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white leading-none">Smart Notes</h1>
                        <p className="text-[10px] font-black text-violet-500 uppercase tracking-widest leading-none mt-1.5">Intelligence Hub</p>
                    </div>
                </div>
                {/* Mobile Close */}
                <button 
                   onClick={onClose}
                   className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                   <X className="w-5 h-5 text-slate-400" />
                </button>
            </div>

            {/* Notification Center */}
            <div className="mt-4">
              <SidebarNotifications />
            </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-4 space-y-8">
            {/* Theme Toggle Button */}
            <button
               onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
               className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all group"
            >
               <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                     <Moon className="w-5 h-5 text-violet-500 group-hover:scale-110 transition-transform" />
                  ) : (
                     <Sun className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                  )}
                  <span className="font-black uppercase tracking-widest text-[10px] text-slate-900 dark:text-white">
                     {theme === 'dark' ? 'Deep Night' : 'Daylight Matrix'}
                  </span>
               </div>
               <div className="w-8 h-4 rounded-full bg-slate-200 dark:bg-slate-700 relative">
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${theme === 'dark' ? 'right-0.5' : 'left-0.5'}`} />
               </div>
            </button>

            {/* Subscription Module */}
            <div className="px-1">
              {subscriptionTier === 'full_access' ? (
                <div className="flex items-center gap-3 px-5 py-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-[2rem] shadow-sm">
                  <Crown className="w-5 h-5 text-emerald-600" />
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Enterprise Protocol</span>
                     <span className="text-[8px] font-bold text-emerald-600/60 uppercase tracking-widest leading-none mt-1">Status: Unrestricted</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={onUpgrade}
                  className="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:brightness-110 rounded-[2rem] shadow-xl shadow-violet-500/20 transition-all active:scale-95 group"
                >
                  <div className="flex items-center gap-3">
                    <Crown className="w-5 h-5 text-white animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Go Premium</span>
                  </div>
                  <Zap className="w-4 h-4 text-violet-200 group-hover:text-white transition-colors" />
                </button>
              )}
            </div>
            
            {/* Core Navigation */}
            <div className="flex flex-col gap-1.5">
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">
                Core Protocols
              </p>
              {navItems.map((item) => {
                const isActive = pathname === item.path || (item.id === 'notes' && pathname === '/dashboard');
                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${isActive
                      ? 'bg-violet-600 text-white shadow-xl shadow-violet-500/20'
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      {item.label}
                    </div>
                  </Link>
                )
              })}
              
              {/* Admin Access: Exclusive */}
              {(userEmail === 'damnbayu@gmail.com') && (
                 <Link
                    href="/admin"
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${pathname.includes('/admin')
                       ? 'bg-slate-900 text-white shadow-xl'
                       : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white'
                       }`}
                 >
                    <Shield className={`w-4 h-4 ${pathname.includes('/admin') ? 'text-violet-500' : 'text-slate-400'}`} />
                    System Intelligence
                 </Link>
              )}
            </div>

            {/* Knowledge Clusters */}
            <div className="space-y-3 pb-8">
               <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">
                Knowledge clusters
              </p>
              <div className="space-y-1">
                {sortedFolders.map(folder => folder !== 'Google Drive' && (
                  <div key={folder} className="group flex items-center justify-between pr-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <button
                      onClick={() => {
                        onSelectFolder(folder);
                        router.push('/');
                        onClose();
                      }}
                      className={`flex-1 flex items-center gap-4 px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-colors ${activeFolder === folder
                        ? 'text-violet-600 dark:text-violet-400'
                        : 'text-slate-500'
                        }`}
                    >
                      <div className="flex items-center gap-4 truncate">
                        {pinnedFolders.includes(folder) && <Pin className="w-3.5 h-3.5 text-violet-600 fill-violet-600 rotate-45 shrink-0" />}
                        <span className="truncate">{folder === 'Main' ? 'Intelligence Core' : folder}</span>
                      </div>
                    </button>

                    {/* Folder Management */}
                    {folder !== 'Main' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-4 h-4 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 p-2 rounded-[1.5rem] border-slate-100 shadow-2xl">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            const newName = prompt("Rename cluster to:", folder);
                            if (newName && newName !== folder) renameFolder(folder, newName);
                          }} className="rounded-xl h-11 text-[11px] font-black uppercase tracking-widest">
                            <Pencil className="w-4 h-4 mr-3 text-slate-400" />
                            Rename Node
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            togglePinFolder(folder);
                          }} className="rounded-xl h-11 text-[11px] font-black uppercase tracking-widest">
                            <Pin className="w-4 h-4 mr-3 text-slate-400" />
                            {pinnedFolders.includes(folder) ? 'Unpin Cluster' : 'Pin Cluster'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 rounded-xl h-11 text-[11px] font-black uppercase tracking-widest" onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete cluster "${folder}"? Notes will be moved to Purge Queue.`)) {
                                deleteFolder(folder);
                            }
                          }}>
                            <Trash2 className="w-4 h-4 mr-3" />
                            Purge Cluster
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}
                <button
                  onClick={onAddFolder}
                  className="w-full flex items-center gap-4 px-4 py-3.5 mt-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-all border border-dashed border-violet-200 dark:border-violet-800"
                >
                  <Plus className="w-4 h-4" />
                  Initialize Cluster
                </button>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* System Intelligence Footer */}
        <div className="flex-none p-6 border-t border-slate-100 dark:border-slate-800 space-y-4 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md">
          {userEmail === 'damnbayu@gmail.com' && diagnostics && (
            <div className="p-4 bg-slate-900 rounded-[1.5rem] border border-white/5 space-y-3">
               <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-violet-400 uppercase tracking-[0.2em]">Neural Diagnostics</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
               </div>
               <div className="space-y-1.5">
                  <p className="text-[8px] font-mono text-slate-500 flex justify-between uppercase"><span>Node_ID:</span> <span className="text-white font-bold">{diagnostics.authId.substring(0, 12)}</span></p>
                  <p className="text-[8px] font-mono text-slate-500 flex justify-between uppercase"><span>Payloads:</span> <span className="text-white font-bold">{diagnostics.notesCount} Assets</span></p>
               </div>
               <Button 
                onClick={onForceSync}
                className="w-full h-9 bg-white hover:bg-violet-50 text-[9px] text-violet-600 font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-xl"
               >
                 Force Sync Sequence
               </Button>
            </div>
          )}

          <div className="space-y-2">
              <button
                onClick={handleContactUs}
                className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95 group"
              >
                <MessageSquare className="w-4 h-4 text-violet-500 group-hover:scale-110 transition-transform" />
                Support Matrix
              </button>

              <button
                onClick={signOut}
                className="w-full flex items-center gap-4 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors opacity-60 hover:opacity-100"
              >
                <LogOut className="w-4 h-4" />
                Terminate Identity
              </button>
          </div>

          <div className="pt-2 text-center">
            <a
              href="https://bali.enterprises"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] text-slate-400 font-black uppercase tracking-[0.4em] opacity-30 hover:opacity-100 hover:text-violet-600 transition-all"
            >
              Bali.Enterprises
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
