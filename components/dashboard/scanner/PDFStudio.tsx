'use client'

import { useState, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  FileEdit, 
  Signature as SignatureIcon, 
  Download, 
  Trash2, 
  Shield,
  Type,
  Save,
  PlusCircle,
  MousePointer2,
  X,
  Sparkles,
  Zap,
  Globe,
  Loader2
} from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { Dialog as ShadDialog, DialogContent as ShadDialogContent, DialogHeader as ShadDialogHeader, DialogTitle as ShadDialogTitle, DialogTrigger as ShadDialogTrigger, DialogFooter as ShadDialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface FormField {
  name: string;
  type: string;
  value: string;
}

interface TypewriterEntry {
  id: string;
  text: string;
  x: number;
  y: number;
  page: number;
}

export function PDFStudio() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isSignDialogOpen, setIsSignDialogOpen] = useState(false);
  
  // Advanced Form State
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [isTypewriterActive, setIsTypewriterActive] = useState(false);
  const [typewriterEntries, setTypewriterEntries] = useState<TypewriterEntry[]>([]);
  const [currentText, setCurrentText] = useState('');
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setPdfFile(file);
      const bytes = new Uint8Array(await file.arrayBuffer());
      setPdfBytes(bytes);
      detectFields(bytes);
      toast.success('Asset Loaded', { description: `Intelligence node ${file.name} is now available for modification.` });
    }
  };

  const detectFields = async (bytes: Uint8Array) => {
    try {
      const pdfDoc = await PDFDocument.load(bytes);
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      
      const detected = fields.map(f => ({
        name: f.getName(),
        type: f.constructor.name,
        value: ''
      }));
      setFormFields(detected);
    } catch (e) {
      console.error("Neural field detection failed:", e);
    }
  };

  const updateFormField = (name: string, value: string) => {
    setFormFields(prev => prev.map(f => f.name === name ? { ...f, value } : f));
  };

  const saveSignature = () => {
    if (sigCanvas.current) {
      setSignatureData(sigCanvas.current.toDataURL());
      setIsSignDialogOpen(false);
      toast.info('Neural Signature Buffered');
    }
  };

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setSignatureData(null);
  };

  const applyChanges = async () => {
    if (!pdfBytes) return;
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const form = pdfDoc.getForm();

      // 1. Apply Form Fields
      formFields.forEach(field => {
        try {
          const f = form.getField(field.name);
          if (field.value) (f as any).setText?.(field.value);
        } catch (e) {}
      });

      // 2. Apply Typewriter Entries (Manual Text)
      typewriterEntries.forEach(entry => {
        const page = pages[entry.page] || pages[0];
        page.drawText(entry.text, {
          x: entry.x,
          y: entry.y,
          size: 10,
          font: font,
          color: rgb(0, 0, 0),
        });
      });

      // 3. Apply Signature (on first page for now)
      if (signatureData) {
        const sigImage = await pdfDoc.embedPng(signatureData);
        const dims = sigImage.scale(0.25);
        const firstPage = pages[0];
        firstPage.drawImage(sigImage, {
          x: firstPage.getWidth() - dims.width - 50,
          y: 50,
          width: dims.width,
          height: dims.height,
        });
      }

      const resultBytes = await pdfDoc.save();
      setPdfBytes(resultBytes);
      
      toast.success('Sequence Finalized', { description: 'All intelligence layers have been committed to the node.' });
    } catch (error) {
      console.error(error);
      toast.error('Commit Failure');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPDF = () => {
    if (!pdfBytes) return;
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neural-mod-${pdfFile?.name || 'document.pdf'}`;
    a.click();
  };

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTypewriterActive || !currentText) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = rect.height - (e.clientY - rect.top);

    const newEntry: TypewriterEntry = {
      id: crypto.randomUUID(),
      text: currentText,
      x: (x / rect.width) * 595,
      y: (y / rect.height) * 842,
      page: 0
    };

    setTypewriterEntries(prev => [...prev, newEntry]);
    setCurrentText('');
  };

  return (
    <div className="flex-1 flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                <FileEdit className="w-6 h-6 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                  Neural <span className="text-violet-600">Studio</span> v2.4
                </h2>
                <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">A-Intel Processing Layer</span>
                </div>
             </div>
        </div>
        
        <div className="flex items-center gap-3">
           {pdfBytes && (
             <>
               <Button 
                 onClick={downloadPDF} 
                 className="h-12 px-8 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all"
               >
                 <Download className="w-4 h-4 mr-2" /> Download Node
               </Button>
               <Button 
                onClick={() => {setPdfFile(null); setPdfBytes(null); setTypewriterEntries([]); setFormFields([]);}}
                variant="ghost"
                className="h-12 w-12 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
               >
                 <Trash2 className="w-5 h-5" />
               </Button>
             </>
           )}
        </div>
      </div>

      {!pdfBytes ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12">
            <div className="max-w-md w-full p-12 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center text-center space-y-8 group transition-all hover:border-violet-500/30">
                <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] group-hover:scale-110 transition-transform duration-500">
                    <Zap className="w-16 h-16 text-slate-200 dark:text-slate-700 group-hover:text-violet-500" />
                </div>
                <div className="space-y-4">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Initialize Intelligence</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                        Upload your PDF manuscripts to activate form extraction and signature synthesis.
                    </p>
                </div>
                <Input 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleFileChange} 
                    className="hidden" 
                    id="pdf-upload" 
                />
                <Button 
                    onClick={() => document.getElementById('pdf-upload')?.click()}
                    className="h-14 px-10 rounded-2xl bg-violet-600 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-violet-500/20 active:scale-95 transition-all"
                >
                    <PlusCircle className="w-5 h-5 mr-3" /> Select Artifact
                </Button>
            </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-slate-50/20 dark:bg-slate-950/20">
          {/* Neural Control Sidebar */}
          <div className="w-full md:w-80 border-r border-slate-100 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-950/50">
             <ScrollArea className="flex-1">
                <div className="p-8 space-y-8">
                    {/* Mode Toggles */}
                    <div className="space-y-4">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Interaction Modes</label>
                        <div className="grid grid-cols-1 gap-3">
                             <Button 
                                variant={isTypewriterActive ? 'default' : 'outline'} 
                                onClick={() => setIsTypewriterActive(!isTypewriterActive)}
                                className={`h-14 justify-start gap-4 rounded-2xl px-6 border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest transition-all ${isTypewriterActive ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'}`}
                             >
                                <Type className="w-4 h-4" /> Typewriter Node
                             </Button>
                             
                             <ShadDialog open={isSignDialogOpen} onOpenChange={setIsSignDialogOpen}>
                                <ShadDialogTrigger asChild>
                                    <Button 
                                        variant="outline" 
                                        className="h-14 justify-start gap-4 rounded-2xl px-6 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest"
                                    >
                                        <SignatureIcon className="w-4 h-4" /> Neural Signature
                                    </Button>
                                </ShadDialogTrigger>
                                <ShadDialogContent className="sm:max-w-md rounded-[2.5rem] p-8 border-0 bg-white dark:bg-slate-900 shadow-2xl">
                                    <ShadDialogHeader className="items-center text-center space-y-4">
                                        <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center">
                                             <SignatureIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <ShadDialogTitle className="text-xl font-black uppercase tracking-tighter">Sign Intelligence</ShadDialogTitle>
                                    </ShadDialogHeader>
                                    <div className="border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden bg-white mt-6">
                                        <SignatureCanvas 
                                            ref={sigCanvas} penColor='black' 
                                            canvasProps={{width: 400, height: 200, className: 'sigCanvas'}} 
                                        />
                                    </div>
                                    <ShadDialogFooter className="flex items-center gap-3 sm:justify-center mt-8">
                                        <Button variant="ghost" onClick={clearSignature} className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Clear</Button>
                                        <Button onClick={saveSignature} className="h-12 px-8 rounded-2xl bg-violet-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">Save Signal</Button>
                                    </ShadDialogFooter>
                                </ShadDialogContent>
                             </ShadDialog>
                        </div>
                    </div>

                    {/* Form Fields extraction */}
                    {formFields.length > 0 && (
                        <div className="space-y-4">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Extracted Form Fields</label>
                            <div className="space-y-4">
                                {formFields.map(field => (
                                    <div key={field.name} className="space-y-2">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate block ml-2">{field.name}</span>
                                        <Input 
                                            value={field.value}
                                            onChange={(e) => updateFormField(field.name, e.target.value)}
                                            className="h-12 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-[11px] font-bold"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {isTypewriterActive && (
                        <div className="space-y-4 animate-in slide-in-from-left-4">
                             <label className="text-[9px] font-black text-amber-500 uppercase tracking-widest ml-4">Typewriter Pulse</label>
                             <div className="p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 rounded-[1.5rem] space-y-3">
                                <Input 
                                    placeholder="Enter intelligence payload..." 
                                    value={currentText}
                                    onChange={(e) => setCurrentText(e.target.value)}
                                    className="bg-white dark:bg-slate-900 border-0 h-10 text-xs rounded-lg"
                                />
                                <p className="text-[8px] font-black text-amber-600/60 uppercase text-center tracking-widest">Select target coordinate on viewer</p>
                             </div>
                        </div>
                    )}
                </div>
             </ScrollArea>
             
             <div className="p-8 border-t border-slate-100 dark:border-slate-800">
                <Button 
                    className="w-full h-14 rounded-2xl bg-violet-600 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-violet-500/20 transition-all hover:scale-[1.02] active:scale-95"
                    onClick={applyChanges}
                    disabled={isProcessing}
                >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 mr-3" />}
                    Commit Sequence
                </Button>
             </div>
          </div>

          {/* Neural Viewer Area */}
          <div className="flex-1 flex flex-col p-8 overflow-hidden">
             <div 
                className={`flex-1 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/20 dark:shadow-none relative overflow-hidden flex flex-col group ${isTypewriterActive ? 'cursor-crosshair' : ''}`}
                onClick={handlePreviewClick}
             >
                <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol: Neural-Scan Alpha</span>
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate max-w-md">{pdfFile?.name}</span>
                </div>

                <div className="flex-1 relative bg-slate-100 dark:bg-slate-950">
                    {pdfBytes && (
                        <iframe
                            src={URL.createObjectURL(new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })) + '#toolbar=0&navpanes=0&scrollbar=0'}
                            className="w-full h-full border-0 pointer-events-none"
                            title="Neural Preview"
                        />
                    )}

                    {/* Typewriter Overlay Cluster */}
                    <div className="absolute inset-0 pointer-events-none">
                        {typewriterEntries.map(entry => (
                            <div 
                                key={entry.id}
                                className="absolute flex items-center gap-2 bg-violet-600 text-white font-black px-3 py-1.5 rounded-xl shadow-2xl text-[10px] animate-in zoom-in group/entry pointer-events-auto"
                                style={{ 
                                    left: `${(entry.x / 595) * 100}%`,
                                    top: `${(1 - (entry.y / 842)) * 100}%`,
                                    transform: 'translate(-50%, -50%)' 
                                }}
                            >
                                {entry.text}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setTypewriterEntries(prev => prev.filter(et => et.id !== entry.id)); }}
                                    className="opacity-0 group-hover/entry:opacity-100 transition-opacity hover:text-rose-300"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {signatureData && (
                        <div className="absolute bottom-12 right-12 w-48 h-24 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 p-2 pointer-events-none animate-in fade-in slide-in-from-right-4">
                             <img src={signatureData} className="w-full h-full object-contain grayscale contrast-150" />
                             <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full"><Sparkles className="w-3 h-3" /></div>
                        </div>
                    )}
                </div>

                {isTypewriterActive && (
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-violet-600 text-white text-[10px] font-black uppercase px-6 h-12 rounded-full shadow-2xl animate-bounce z-20 tracking-widest">
                        <PlusCircle className="w-4 h-4" />
                        Targeting Interface: "{currentText || 'Pending Payload'}"
                    </div>
                )}
             </div>
             
             <div className="mt-8 flex items-center justify-between px-6">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Encrypted Persistence</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-slate-300" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Intelligence Bridge</span>
                    </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
