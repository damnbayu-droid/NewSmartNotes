'use client'

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Download, 
    FileStack, 
    Scissors, 
    Minimize, 
    FileUp, 
    RefreshCw, 
    X,
    Sparkles,
    Zap,
    Shield
} from 'lucide-react';
import { toast } from 'sonner';

type ToolType = 'merge' | 'split' | 'compress';

export function PDFTools() {
    const [activeTab, setActiveTab] = useState<ToolType>('merge');
    const [files, setFiles] = useState<File[]>([]);
    const [splitRange, setSplitRange] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [downloadName, setDownloadName] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
            setDownloadUrl(null);
            toast.info('Artifacts Buffered', { description: `${e.target.files.length} node(s) selected for processing.` });
        }
    };

    const handleMerge = async () => {
        if (files.length < 2) {
            toast.error('Insufficient Nodes', { description: "Please select at least 2 PDF manuscripts to merge." });
            return;
        }
        setIsProcessing(true);
        try {
            const { PDFDocument } = await import('pdf-lib');
            const mergedPdf = await PDFDocument.create();
            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }
            const pdfBytes = await mergedPdf.save();
            createDownload(pdfBytes, 'merged-intelligence.pdf');
        } catch (error) {
            console.error(error);
            toast.error('Merge Sequence Failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSplit = async () => {
        if (files.length !== 1) {
            toast.error('Node Overload', { description: "Please select exactly 1 PDF node to split." });
            return;
        }
        if (!splitRange) {
            toast.error('Page Range Required');
            return;
        }

        setIsProcessing(true);
        try {
            const { PDFDocument } = await import('pdf-lib');
            const file = files[0];
            const arrayBuffer = await file.arrayBuffer();
            const srcPdf = await PDFDocument.load(arrayBuffer);
            const newPdf = await PDFDocument.create();
            const totalPages = srcPdf.getPageCount();

            const pageIndices: number[] = [];
            const parts = splitRange.split(',').map(p => p.trim());

            for (const part of parts) {
                if (part.includes('-')) {
                    const [start, end] = part.split('-').map(Number);
                    if (!isNaN(start) && !isNaN(end)) {
                        for (let i = start; i <= end; i++) {
                            if (i > 0 && i <= totalPages) pageIndices.push(i - 1);
                        }
                    }
                } else {
                    const pageNum = Number(part);
                    if (!isNaN(pageNum) && pageNum > 0 && pageNum <= totalPages) {
                        pageIndices.push(pageNum - 1);
                    }
                }
            }

            const uniqueIndices = [...new Set(pageIndices)].sort((a, b) => a - b);
            if (uniqueIndices.length === 0) throw new Error("Invalid page range");

            const copiedPages = await newPdf.copyPages(srcPdf, uniqueIndices);
            copiedPages.forEach(page => newPdf.addPage(page));

            const pdfBytes = await newPdf.save();
            createDownload(pdfBytes, `split-${files[0].name}`);
        } catch (error) {
            console.error(error);
            toast.error('Split Sequence Failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCompress = async () => {
        if (files.length !== 1) {
            toast.error('Selection Required');
            return;
        }
        setIsProcessing(true);
        try {
            const { PDFDocument } = await import('pdf-lib');
            const file = files[0];
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const pdfBytes = await pdf.save({ useObjectStreams: false });
            createDownload(pdfBytes, `compressed-${files[0].name}`);
        } catch (error) {
            console.error(error);
            toast.error('Optimization Failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const createDownload = (data: Uint8Array, filename: string) => {
        const blob = new Blob([data as any], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setDownloadName(filename);
        toast.success('Sequence Complete', { description: 'New intelligence artifact is ready for ingestion.' });
    };

    const TabButton = ({ value, label, icon: Icon }: { value: ToolType, label: string, icon: any }) => (
        <button
            onClick={() => { setActiveTab(value); setFiles([]); setDownloadUrl(null); }}
            className={`flex-1 flex items-center justify-center gap-3 h-12 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === value ? 'bg-white dark:bg-slate-900 text-violet-600 shadow-xl shadow-slate-200/50 dark:shadow-none' : 'text-slate-400 hover:text-slate-600'}`}
        >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
        </button>
    );

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-2xl shadow-slate-200/20 dark:shadow-none space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FileStack className="w-5 h-5 text-violet-600" />
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Temporal <span className="text-violet-600">Forge</span></h3>
                </div>
                <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Forge Online</span>
                </div>
            </div>

            {/* Premium Tabs */}
            <div className="flex p-1.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                <TabButton value="merge" label="Merge" icon={FileStack} />
                <TabButton value="split" label="Split" icon={Scissors} />
                <TabButton value="compress" label="Compress" icon={Minimize} />
            </div>

            {/* Tool Content Area */}
            <div className="space-y-6">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Payload Batch Selection</label>
                    <div className="flex gap-3">
                        <Input
                            type="file"
                            accept=".pdf"
                            multiple={activeTab === 'merge'}
                            onChange={handleFileChange}
                            disabled={isProcessing}
                            className="bg-slate-50 dark:bg-slate-800/50 border-0 h-14 rounded-2xl p-4 text-xs font-bold"
                        />
                        {files.length > 0 && (
                            <Button variant="ghost" size="icon" onClick={() => { setFiles([]); setDownloadUrl(null); }} className="h-14 w-14 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-500">
                                <X className="w-5 h-5" />
                            </Button>
                        )}
                    </div>
                </div>

                {activeTab === 'split' && (
                    <div className="space-y-3 animate-in slide-in-from-top-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Extraction Range</label>
                        <Input
                            placeholder="e.g. 1, 3-5, 8"
                            value={splitRange}
                            onChange={(e) => setSplitRange(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800/50 border-0 h-14 rounded-2xl p-4 text-xs font-bold placeholder:text-slate-300"
                        />
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-4">Enter page indices for extraction sequence.</p>
                    </div>
                )}

                <Button
                    onClick={() => {
                        if (activeTab === 'merge') handleMerge();
                        if (activeTab === 'split') handleSplit();
                        if (activeTab === 'compress') handleCompress();
                    }}
                    disabled={isProcessing || files.length === 0}
                    className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all group"
                >
                    {isProcessing ? (
                        <RefreshCw className="w-5 h-5 animate-spin mr-3" />
                    ) : (
                        <FileUp className="w-5 h-5 mr-3 transition-transform group-hover:translate-y-[-2px]" />
                    )}
                    {isProcessing ? 'Processing Batch...' : 'Execute Sequence'}
                </Button>

                {downloadUrl && (
                    <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4">
                        <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest text-center block">Forge Output Ready</label>
                        <a href={downloadUrl} download={downloadName} className="block">
                            <Button className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all">
                                <Download className="w-5 h-5 mr-3" />
                                Retrieve Artifact
                            </Button>
                        </a>
                    </div>
                )}
            </div>
            
            <div className="flex items-center justify-center gap-4 pt-4 opacity-40">
                <Shield className="w-4 h-4 text-slate-400" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Temporal Integrity Protocol v2.4</span>
                <Zap className="w-4 h-4 text-amber-500" />
            </div>
        </div>
    );
}
