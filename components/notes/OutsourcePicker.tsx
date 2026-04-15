'use client'

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Github, Loader2, Link as LinkIcon, Cloud, ChevronRight, Globe, Database } from 'lucide-react';
import { githubService } from '@/lib/github';

interface OutsourcePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (content: string, metadata: any) => void;
  mode?: 'drive' | 'resource';
}

export function OutsourcePicker({ isOpen, onClose, onImport, mode = 'drive' }: OutsourcePickerProps) {
  const [githubUrl, setGithubUrl] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGitHubImport = async () => {
    if (!githubUrl.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const parsed = githubService.parseUrl(githubUrl);
      if (!parsed) throw new Error('Invalid GitHub URL. Please provide a direct link to a file.');
      const content = await githubService.fetchFileContent(parsed.owner, parsed.repo, parsed.path, parsed.branch);
      onImport(content, {
        type: 'github_clone',
        url: githubUrl,
        repo: `${parsed.owner}/${parsed.repo}`,
        path: parsed.path,
        branch: parsed.branch
      });
      onClose();
      setGithubUrl('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch GitHub content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkImport = async (url: string, type: 'drive' | 'general') => {
    if (!url.trim()) return;
    setIsLoading(true);
    
    // Simulate smart fetching
    setTimeout(() => {
      onImport(`<p>Connected Resource Snapshot</p><p><a href="${url}" target="_blank">${url}</a></p>`, {
        type: type === 'drive' ? 'google_drive' : 'external_link',
        url: url,
        path: url.split('/').pop() || 'Drive Asset'
      });
      setIsLoading(false);
      onClose();
      setDriveUrl('');
      setLinkUrl('');
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] border-slate-100 dark:border-slate-800 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-slate-900 dark:text-white font-black uppercase tracking-tighter text-xl">
            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm">
              {mode === 'drive' ? <Cloud className="w-5 h-5 text-blue-500" /> : <Database className="w-5 h-5 text-emerald-500" />}
            </div>
            {mode === 'drive' ? 'Select From Drive' : 'Intelligence Resource Hub'}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {mode === 'drive' ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-blue-100 dark:border-blue-900/50 rounded-[2.5rem] bg-blue-50/20 dark:bg-blue-900/10 group hover:bg-blue-50/40 dark:hover:bg-blue-900/20 transition-all cursor-pointer">
                <Cloud className="w-14 h-14 text-blue-200 dark:text-blue-800 mb-4 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-black text-blue-900 dark:text-blue-100 uppercase tracking-widest">Connect Google Drive</p>
                <p className="text-[10px] text-blue-600/60 dark:text-blue-400/60 mt-2 px-12 text-center uppercase font-bold tracking-tighter">
                  Deep mapping for Google Docs, Sheets, and Slides
                </p>
                <Button 
                  onClick={() => window.dispatchEvent(new CustomEvent('dcpi-notification', { 
                    detail: { title: 'Auth Required', message: 'Uplink to Google Cloud requires Client configuration.', type: 'info' } 
                  }))}
                  className="mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-10 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-200 dark:shadow-none"
                >
                  Authorize Google Picker
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100 dark:border-slate-800" /></div>
                <div className="relative flex justify-center text-[9px] uppercase font-black text-slate-400"><span className="bg-white dark:bg-slate-900 px-4">OR PASTE ASSET LINK</span></div>
              </div>

              <div className="space-y-3">
                <Input 
                   placeholder="Docs/Sheets/Slides Public URL..." 
                   value={driveUrl}
                   onChange={(e) => setDriveUrl(e.target.value)}
                   className="h-14 rounded-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-blue-500 shadow-sm"
                />
                <Button 
                   disabled={isLoading || !driveUrl}
                   onClick={() => handleLinkImport(driveUrl, 'drive')}
                   className="w-full h-12 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-slate-200 dark:shadow-none"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                  Finalize Drive Resource
                </Button>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="github" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl h-14 border border-slate-200 dark:border-slate-800">
                <TabsTrigger value="github" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md font-black uppercase text-[10px] tracking-widest gap-2">
                  <Github className="w-4 h-4" /> Technical/GitHub
                </TabsTrigger>
                <TabsTrigger value="link" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md font-black uppercase text-[10px] tracking-widest gap-2">
                   <LinkIcon className="w-4 h-4" /> Technical Link
                </TabsTrigger>
              </TabsList>

              <TabsContent value="github" className="space-y-4 pt-6 animate-in slide-in-from-top-2">
                <div className="space-y-3">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Repository Integration Sequence</p>
                  <div className="flex flex-col gap-3">
                    <Input
                      placeholder="https://github.com/owner/repo/blob/branch/file.tsx"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="h-14 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-emerald-500 shadow-sm"
                    />
                    <Button 
                      onClick={handleGitHubImport} 
                      disabled={isLoading || !githubUrl}
                      className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-200 dark:shadow-none"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Initiate Technical Clone"}
                    </Button>
                  </div>
                  {error && <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest bg-rose-50 dark:bg-rose-950/20 p-3 rounded-lg border border-rose-100 dark:border-rose-900/50">{error}</p>}
                </div>
              </TabsContent>

              <TabsContent value="link" className="space-y-4 pt-6 animate-in slide-in-from-top-2">
                <div className="space-y-3">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">External Knowledge Link</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://documentation-site.com/resource"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className="h-12 bg-slate-50/50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800 rounded-xl focus:ring-blue-500"
                    />
                    <Button 
                      onClick={() => handleLinkImport(linkUrl, 'general')}
                      disabled={isLoading || !linkUrl}
                      className="h-12 bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-black text-white px-6 rounded-xl shrink-0 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-slate-200 dark:shadow-none"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Connect"}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800">
           <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-[1.5rem] shadow-xl shadow-slate-200 dark:shadow-none">
             <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
               <Database className="w-5 h-5 text-white" />
             </div>
             <div className="flex-1">
               <p className="text-[10px] font-black text-white uppercase tracking-widest">Intelligence Snapshot</p>
               <p className="text-[9px] text-slate-400 font-bold uppercase leading-tight mt-1">Files are cloned into your secure sandbox for persistent accessibility.</p>
             </div>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
