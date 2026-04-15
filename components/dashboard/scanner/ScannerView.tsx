'use client'

import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { 
    X, 
    FileImage, 
    FileText, 
    Loader2, 
    Share2, 
    Settings2, 
    FileStack, 
    Scissors, 
    Minimize,
    Scan,
    Sparkles,
    Zap,
    History,
    Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import imageCompression from 'browser-image-compression';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CameraView } from './CameraView';
import { PDFStudio } from './PDFStudio';
import { PDFTools } from './PDFTools';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export function ScannerView() {
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [isCompressing, setIsCompressing] = useState(false);
    const [scanType, setScanType] = useState<'document' | 'photo'>('document');
    const [paperSize, setPaperSize] = useState<'a4' | 'f4' | 'letter'>('a4');
    const [activeSecondaryView, setActiveSecondaryView] = useState<'none' | 'studio' | 'tools'>('studio');

    const handleCapture = async (imageSrc: string) => {
        setIsCompressing(true);
        toast.info('Syncing Pulse', { description: 'Processing captured intelligence...' });
        
        try {
            const response = await fetch(imageSrc);
            const blob = await response.blob();

            const options = {
                maxSizeMB: scanType === 'document' ? 0.5 : 2,
                maxWidthOrHeight: 2160,
                useWebWorker: true,
                fileType: 'image/jpeg'
            };

            const compressedFile = await imageCompression(blob as File, options);
            const compressedUrl = URL.createObjectURL(compressedFile);

            setCapturedImages(prev => [...prev, compressedUrl]);
            toast.success('Capture Bound', { description: 'Intelligence node appended to the current batch.' });
        } catch (error) {
            console.error('Compression hub error:', error);
            setCapturedImages(prev => [...prev, imageSrc]);
        } finally {
            setIsCompressing(false);
        }
    };

    const removeImage = (index: number) => {
        setCapturedImages(prev => prev.filter((_, i) => i !== index));
        toast.info('Node Purged');
    };

    const generatePDF = async () => {
        const pdfDoc = await PDFDocument.create();
        for (const imageSrc of capturedImages) {
            const jpgImageBytes = await fetch(imageSrc).then((res) => res.arrayBuffer());
            const jpgImage = await pdfDoc.embedJpg(jpgImageBytes);

            const sizes = {
                a4: [595.28, 841.89],
                letter: [612, 792],
                f4: [612, 936]
            };

            let pageWidth = jpgImage.width;
            let pageHeight = jpgImage.height;

            if (scanType === 'document') {
                const targetSize = sizes[paperSize] || sizes.a4;
                const scale = Math.min(targetSize[0] / pageWidth, targetSize[1] / pageHeight);
                pageWidth = targetSize[0];
                pageHeight = targetSize[1];

                const page = pdfDoc.addPage([pageWidth, pageHeight]);
                page.drawImage(jpgImage, {
                    x: (pageWidth - jpgImage.width * scale) / 2,
                    y: (pageHeight - jpgImage.height * scale) / 2,
                    width: jpgImage.width * scale,
                    height: jpgImage.height * scale,
                });
            } else {
                const page = pdfDoc.addPage([pageWidth, pageHeight]);
                page.drawImage(jpgImage, {
                    x: 0, y: 0, width: pageWidth, height: pageHeight,
                });
            }
        }
        return await pdfDoc.save();
    };

    const downloadAsPDF = async () => {
        if (capturedImages.length === 0) return;
        try {
            const pdfBytes = await generatePDF();
            const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `neural-scan-${new Date().toISOString()}.pdf`;
            a.click();
            toast.success('Artifact Generated');
        } catch (error) {
            console.error(error);
            toast.error('Synthesis Failed');
        }
    };

    const sharePDF = async () => {
        if (capturedImages.length === 0) return;
        try {
            const pdfBytes = await generatePDF();
            const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
            const file = new File([blob], `neural-scan-${Date.now()}.pdf`, { type: 'application/pdf' });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Neural Intelligence Scan',
                    text: 'Synchronized data from Smart Notes Neural Hub.',
                });
            } else {
                toast.error('Share Protocol Unsupported', { description: 'Browser environment restricted.' });
            }
        } catch (error) {
            console.error(error);
            toast.error('Transmission Failure');
        }
    };

    if (activeSecondaryView === 'studio') return <PDFStudio />;
    if (activeSecondaryView === 'tools') return <PDFTools />;

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50/20 dark:bg-slate-950/20 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            {/* Header Hub */}
            <div className="p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-full text-xs font-black uppercase tracking-widest border border-violet-200 dark:border-violet-900/50 shadow-sm">
                        <Scan className="w-4 h-4" />
                        Capture Protocol 3.1
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                        Neural <span className="text-violet-600">Scanner</span>
                    </h1>
                </div>

                <div className="flex flex-wrap gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-900 shadow-sm active:scale-95 transition-all">
                                <Settings2 className="w-4 h-4 mr-2 text-violet-600" />
                                Mode: {scanType === 'document' ? 'Document' : 'Photo'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-2xl p-2">
                            <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Intelligence Type</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setScanType('document')} className="rounded-xl font-bold uppercase text-[10px] tracking-tight py-3 px-4">Document (A4 Optimized)</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setScanType('photo')} className="rounded-xl font-bold uppercase text-[10px] tracking-tight py-3 px-4">Photo (High Fidelity)</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Paper Guide</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setPaperSize('a4')} className="rounded-xl font-bold uppercase text-[10px] tracking-tight py-3 px-4">A4 Standard</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPaperSize('letter')} className="rounded-xl font-bold uppercase text-[10px] tracking-tight py-3 px-4">Letter</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button 
                        onClick={() => setActiveSecondaryView('studio')}
                        className="h-12 px-6 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all"
                    >
                        <FileText className="w-4 h-4 mr-2" /> Open Studio
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="px-8 pb-12 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
                    {/* Left: Interactive Optical Hub */}
                    <div className="flex-1 space-y-8">
                        <CameraView onCapture={handleCapture} />

                        {isCompressing && (
                             <div className="p-4 bg-violet-600 rounded-[1.5rem] text-white flex items-center justify-center gap-4 animate-pulse shadow-xl shadow-violet-500/20">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="text-xs font-black uppercase tracking-widest">Optimizing Intelligence Cluster...</span>
                             </div>
                        )}

                        {capturedImages.length > 0 && (
                            <div className="space-y-6 bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/20 dark:shadow-none animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex items-center justify-between mb-2">
                                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-4">Current Batch Nodes</label>
                                     <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest italic">{capturedImages.length} Artifacts Buffer</span>
                                </div>
                                
                                <ScrollArea className="pb-4">
                                    <div className="flex gap-4 pb-2">
                                        {capturedImages.map((src, idx) => (
                                            <div key={idx} className="relative shrink-0 group">
                                                <div className="w-32 h-44 rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-lg group-hover:scale-[1.02] transition-transform duration-300">
                                                    <img src={src} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center backdrop-blur-[2px]">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeImage(idx)}
                                                        className="h-10 w-10 bg-rose-500 text-white rounded-xl hover:bg-rose-600 shadow-xl active:scale-95"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                                <span className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-lg border border-white/20">
                                                    #{idx + 1}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Button
                                        onClick={downloadAsPDF}
                                        className="h-14 rounded-2xl bg-violet-600 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-violet-500/20 group overflow-hidden active:scale-95 transition-all"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                        <FileText className="w-5 h-5 mr-3" /> Save Intelligence Report
                                    </Button>
                                    <Button
                                        onClick={sharePDF}
                                        variant="outline"
                                        className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
                                    >
                                        <Share2 className="w-4 h-4 mr-3 text-violet-600" /> Transmit Signal
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Neural Persistence Tools */}
                    <div className="w-full md:w-80 space-y-8">
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/20 dark:shadow-none space-y-6">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-3">
                                <Zap className="w-5 h-5 text-violet-600" />
                                Quick Forge
                            </h3>
                            <div className="space-y-3">
                                <Button 
                                    onClick={() => setActiveSecondaryView('tools')}
                                    variant="ghost" 
                                    className="w-full h-auto py-5 px-6 rounded-2xl justify-start items-center gap-5 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-all group"
                                >
                                    <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform">
                                        <FileStack className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Merge Nodes</span>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Combine Multi-batch</span>
                                    </div>
                                </Button>
                                <Button 
                                    onClick={() => setActiveSecondaryView('tools')}
                                    variant="ghost" 
                                    className="w-full h-auto py-5 px-6 rounded-2xl justify-start items-center gap-5 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-all group"
                                >
                                    <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                                        <Scissors className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Split Chain</span>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Extract Node Segments</span>
                                    </div>
                                </Button>
                                <Button 
                                    onClick={() => setActiveSecondaryView('tools')}
                                    variant="ghost" 
                                    className="w-full h-auto py-5 px-6 rounded-2xl justify-start items-center gap-5 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-all group"
                                >
                                    <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                                        <Minimize className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Compress Node</span>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Temporal Optimization</span>
                                    </div>
                                </Button>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-500/30 space-y-6">
                            <div className="flex items-center gap-4">
                                <History className="w-6 h-6 text-indigo-200" />
                                <h4 className="text-lg font-black uppercase tracking-tighter italic">Last Batch Info</h4>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                     <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1">
                                        <span className="text-indigo-200">Session Status</span>
                                        <span className="text-emerald-400">Buffered</span>
                                     </div>
                                     <div className="h-1.5 w-full bg-indigo-900/50 rounded-full overflow-hidden mt-2">
                                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: capturedImages.length > 0 ? '60%' : '0%' }} />
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
