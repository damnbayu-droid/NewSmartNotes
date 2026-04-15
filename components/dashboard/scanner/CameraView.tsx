'use client'

import { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { RefreshCw, Camera, Scan } from 'lucide-react';

interface CameraViewProps {
    onCapture: (imageSrc: string) => void;
}

export function CameraView({ onCapture }: CameraViewProps) {
    const webcamRef = useRef<Webcam>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            onCapture(imageSrc);
        }
    }, [webcamRef, onCapture]);

    const toggleCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    return (
        <div className="relative w-full h-[500px] bg-slate-900 rounded-[2.5rem] overflow-hidden group">
            {/* Neural Scanning Guidance Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none border-[40px] border-slate-900/40 backdrop-blur-[2px]">
                <div className="w-full h-full border-2 border-violet-500/50 rounded-2xl flex items-center justify-center relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-violet-500 rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-violet-500 rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-violet-500 rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-violet-500 rounded-br-xl" />
                    
                    <div className="flex flex-col items-center gap-2 opacity-40">
                         <Scan className="w-8 h-8 text-white" />
                         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Align Intelligence</span>
                    </div>
                </div>
            </div>

            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                    facingMode: facingMode === 'environment' ? "environment" : "user",
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    aspectRatio: 16 / 9,
                }}
                className="absolute inset-0 w-full h-full object-cover"
                onUserMediaError={(err) => {
                    console.error("Camera Hub Error:", err);
                    if (facingMode === 'environment') setFacingMode('user');
                }}
            />

            <div className="absolute bottom-0 inset-x-0 z-20 p-8 flex justify-between items-center bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent">
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-12 w-12 rounded-xl bg-white/10 border-white/20 text-white backdrop-blur-md hover:bg-white/20 transition-all active:scale-95" 
                    onClick={toggleCamera}
                >
                    <RefreshCw className="w-5 h-5" />
                </Button>

                <div className="relative">
                    <div className="absolute inset-0 bg-violet-600 rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
                    <Button
                        onClick={capture}
                        className="w-20 h-20 rounded-full bg-white hover:bg-slate-100 border-8 border-slate-900/50 p-0 relative shadow-2xl active:scale-90 transition-all duration-300"
                    >
                        <div className="w-14 h-14 rounded-full border-2 border-slate-900 flex items-center justify-center">
                            <Camera className="w-6 h-6 text-slate-900" />
                        </div>
                    </Button>
                </div>

                <div className="w-12 h-12" /> {/* Layout Spacer */}
            </div>
            
            {/* Neural HUD Data */}
            <div className="absolute top-8 left-8 z-20 space-y-1 opacity-60">
                <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[9px] font-black text-white uppercase tracking-widest uppercase tracking-widest">Optical Grid: Active</span>
                </div>
                <span className="text-[8px] font-mono text-white/50 uppercase tracking-widest block">HUB_COORD: 4096 x 2160</span>
            </div>
        </div>
    );
}
