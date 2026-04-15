'use client'

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Save, X, RotateCcw, PenTool, Download, Share2, FileImage } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { jsPDF } from 'jspdf';

interface CanvasEditorProps {
    onSave: (dataUrl: string) => void;
    onCancel: () => void;
    signatureMode?: boolean;
}

export function CanvasEditor({ onSave, onCancel, signatureMode = false }: CanvasEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState(signatureMode ? 'black' : 'black');
    const [lineWidth] = useState(signatureMode ? 3 : 2);
    const [hasBackground, setHasBackground] = useState(true);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);

    // Initialize Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Make canvas fill the parent
        const parent = canvas.parentElement;
        if (parent) {
            canvas.width = parent.clientWidth * 2; // Retina support
            canvas.height = parent.clientHeight * 2;
            canvas.style.width = `${parent.clientWidth}px`;
            canvas.style.height = `${parent.clientHeight}px`;
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.scale(2, 2);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;

            // Fill background if enabled
            if (hasBackground) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            contextRef.current = ctx;
        }
    }, [hasBackground, color, lineWidth]); // Added dependencies to re-sync if needed

    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = color;
        }
    }, [color]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (!contextRef.current) return;

        const { offsetX, offsetY } = getCoordinates(e.nativeEvent);
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const finishDrawing = () => {
        if (!contextRef.current) return;
        contextRef.current.closePath();
        setIsDrawing(false);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !contextRef.current) return;

        const { offsetX, offsetY } = getCoordinates(e.nativeEvent);
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
    };

    const getCoordinates = (event: MouseEvent | TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { offsetX: 0, offsetY: 0 };
        
        const rect = canvas.getBoundingClientRect();
        
        if ('touches' in event) {
            const touch = event.touches[0];
            return {
                offsetX: touch.clientX - rect.left,
                offsetY: touch.clientY - rect.top
            };
        }
        
        return {
            offsetX: (event as MouseEvent).clientX - rect.left,
            offsetY: (event as MouseEvent).clientY - rect.top
        };
    };

    const clear = () => {
        const canvas = canvasRef.current;
        const ctx = contextRef.current;
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (hasBackground) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    const save = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            onSave(dataUrl);
        }
    };

    const exportAs = (format: 'png' | 'jpg' | 'pdf') => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        try {
            if (format === 'pdf') {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
                    unit: 'px',
                    format: [canvas.width / 2, canvas.height / 2]
                });
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
                pdf.save(`sketch-${Date.now()}.pdf`);
            } else {
                const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
                const dataUrl = canvas.toDataURL(mimeType, 0.95);
                const link = document.createElement('a');
                link.download = `sketch-${Date.now()}.${format}`;
                link.href = dataUrl;
                link.click();
            }
            window.dispatchEvent(new CustomEvent('dcpi-notification', {
                detail: { title: 'Success', message: `Sketch exported as ${format.toUpperCase()}`, type: 'success' }
            }));
        } catch (error) {
            window.dispatchEvent(new CustomEvent('dcpi-notification', {
                detail: { title: 'Error', message: 'Failed to export sketch', type: 'error' }
            }));
            console.error('Export error:', error);
        }
    };

    const shareSketch = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        try {
            const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                }, 'image/png');
            });

            const file = new File([blob], `sketch-${Date.now()}.png`, { type: 'image/png' });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: signatureMode ? 'My Signature' : 'My Sketch',
                    text: signatureMode ? 'Check out my signature' : 'Check out my sketch',
                });
            } else {
                const item = new ClipboardItem({ 'image/png': blob });
                await navigator.clipboard.write([item]);
                window.dispatchEvent(new CustomEvent('dcpi-notification', {
                    detail: { title: 'Success', message: 'Sketch copied to clipboard', type: 'success' }
                }));
            }
        } catch (error) {
            window.dispatchEvent(new CustomEvent('dcpi-notification', {
                detail: { title: 'Error', message: 'Failed to share sketch', type: 'error' }
            }));
            console.error('Share error:', error);
        }
    };

    return (
        <div className="flex flex-col gap-2 h-full bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="flex gap-2 items-center">
                    <PenTool className="w-4 h-4 text-violet-500 mr-2" />
                    {!signatureMode && ['black', '#ef4444', '#3b82f6', '#22c55e'].map(c => (
                        <button
                            key={c}
                            onClick={() => setColor(c)}
                            className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-violet-500 scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                    <div className="flex items-center gap-2 ml-4">
                        <Checkbox
                            id="background"
                            checked={hasBackground}
                            onCheckedChange={(checked) => setHasBackground(checked as boolean)}
                        />
                        <label htmlFor="background" className="text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer">
                            Solid Paper
                        </label>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={clear} className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" title="Clear">
                        <RotateCcw className="w-4 h-4" />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" title="Export">
                                <Download className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-2xl">
                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-40">Export Format</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => exportAs('png')} className="rounded-xl text-[11px] font-black uppercase tracking-widest py-3">
                                <FileImage className="w-4 h-4 mr-3 text-slate-400" />
                                Portable Network Graphics (.png)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => exportAs('jpg')} className="rounded-xl text-[11px] font-black uppercase tracking-widest py-3">
                                <FileImage className="w-4 h-4 mr-3 text-slate-400" />
                                Joint Photographic Experts Group (.jpg)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => exportAs('pdf')} className="rounded-xl text-[11px] font-black uppercase tracking-widest py-3">
                                <FileImage className="w-4 h-4 mr-3 text-violet-500" />
                                PDF Intelligence Asset (.pdf)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="ghost" size="icon" onClick={shareSketch} className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" title="Share">
                        <Share2 className="w-4 h-4 text-violet-500" />
                    </Button>

                    <Button variant="ghost" size="icon" onClick={onCancel} className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" title="Cancel">
                        <X className="w-4 h-4" />
                    </Button>
                    <Button size="sm" onClick={save} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest px-6 shadow-lg shadow-violet-500/20">
                        Finalize Drawing
                    </Button>
                </div>
            </div>

            <div className={`flex-1 relative touch-none cursor-crosshair ${hasBackground ? 'bg-white' : 'bg-slate-50 dark:bg-slate-950'}`}>
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseUp={finishDrawing}
                    onMouseMove={draw}
                    onMouseLeave={finishDrawing}
                    onTouchStart={startDrawing}
                    onTouchEnd={finishDrawing}
                    onTouchMove={draw}
                    className="w-full h-full block"
                />
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-center text-slate-300 dark:text-slate-700 py-3 bg-slate-50/20 dark:bg-slate-950/20">
                {signatureMode ? 'Identity Verification Sequence Active' : 'Neural Drawing Interface Active'}
            </p>
        </div>
    );
}
