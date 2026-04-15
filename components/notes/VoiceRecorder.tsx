'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, Square, RefreshCcw, Pause, Play, Trash2, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob, transcript?: string) => void
  onTranscriptionChunk?: (text: string) => void
  onInterimTranscription?: (text: string) => void
  className?: string
  compact?: boolean
}

export function VoiceRecorder({
  onRecordingComplete,
  onTranscriptionChunk,
  onInterimTranscription,
  className,
  compact = false
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [waveform, setWaveform] = useState<number[]>(Array(20).fill(3))

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = useRef<any>(null)
  const isRecordingRef = useRef(false)
  const animFrameRef = useRef<number | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  // Waveform animation
  const animateWaveform = useCallback(() => {
    if (!analyserRef.current || !isRecordingRef.current) return
    const data = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(data)
    const bars = Array.from({ length: 20 }, (_, i) => {
      const idx = Math.floor((i / 20) * data.length)
      return Math.max(3, (data[idx] / 255) * 40)
    })
    setWaveform(bars)
    animFrameRef.current = requestAnimationFrame(animateWaveform)
  }, [])

  // Speech Recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SR()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'id-ID' // Default Indonesian

      recognitionRef.current.onresult = (event: any) => {
        let final = '', interim = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript
          else interim += event.results[i][0].transcript
        }
        if (interim) onInterimTranscription?.(interim)
        else onInterimTranscription?.('')
        if (final) onTranscriptionChunk?.(final + ' ')
      }

      recognitionRef.current.onend = () => {
        if (isRecordingRef.current) {
          try { recognitionRef.current.start() } catch (e) {}
        }
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (recognitionRef.current) recognitionRef.current.stop()
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [onTranscriptionChunk, onInterimTranscription])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Setup waveform analyser
      const ctx = new AudioContext()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      source.connect(analyser)
      analyserRef.current = analyser

      // Setup MediaRecorder
      const mr = new MediaRecorder(stream)
      mediaRecorderRef.current = mr
      chunksRef.current = []
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        onRecordingComplete?.(blob)
        stream.getTracks().forEach(t => t.stop())
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
        setWaveform(Array(20).fill(3))
      }
      mr.start(100)

      // Transcription
      if (recognitionRef.current && (onTranscriptionChunk || onInterimTranscription)) {
        try { recognitionRef.current.start(); setIsTranscribing(true) } catch (e) {}
      }

      // Timer
      setRecordingTime(0)
      timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000)

      setIsRecording(true)
      setIsPaused(false)
      setAudioUrl(null)
      isRecordingRef.current = true

      animateWaveform()

      window.dispatchEvent(new CustomEvent('dcpi-notification', {
        detail: { title: 'Recording Started', message: 'Microphone active', type: 'info' }
      }))
    } catch (error) {
      window.dispatchEvent(new CustomEvent('dcpi-notification', {
        detail: { title: 'Mic Error', message: 'Could not access microphone', type: 'error' }
      }))
    }
  }

  const pauseRecording = () => {
    if (!mediaRecorderRef.current) return
    if (isPaused) {
      mediaRecorderRef.current.resume()
      timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000)
      animateWaveform()
    } else {
      mediaRecorderRef.current.pause()
      if (timerRef.current) clearInterval(timerRef.current)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      setWaveform(Array(20).fill(3))
    }
    setIsPaused(p => !p)
  }

  const stopRecording = () => {
    if (!isRecordingRef.current) return
    setIsRecording(false)
    setIsPaused(false)
    isRecordingRef.current = false
    if (timerRef.current) clearInterval(timerRef.current)
    if (recognitionRef.current) { recognitionRef.current.stop(); setIsTranscribing(false) }
    if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop()
  }

  const discardRecording = () => {
    stopRecording()
    setAudioUrl(null)
    setRecordingTime(0)
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {isRecording ? (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full border border-red-100 dark:border-red-800">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-mono font-black text-red-600">{formatTime(recordingTime)}</span>
            <button onClick={pauseRecording} className="text-red-400 hover:text-red-600 transition-colors">
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button onClick={stopRecording} className="text-red-400 hover:text-red-600 transition-colors">
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={startRecording} className="gap-2 text-slate-600 hover:text-violet-600 hover:border-violet-200 rounded-xl">
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">Record</span>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <AnimatePresence mode="wait">
        {isRecording ? (
          <motion.div
            key="recording"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-4 p-6 bg-red-50 dark:bg-red-900/10 rounded-[2rem] border border-red-100 dark:border-red-900/30"
          >
            {/* Waveform Visualizer */}
            <div className="flex items-end gap-0.5 h-12">
              {waveform.map((h, i) => (
                <motion.div
                  key={i}
                  className={`w-1.5 rounded-full ${isPaused ? 'bg-red-200' : 'bg-red-500'}`}
                  animate={{ height: isPaused ? 6 : h }}
                  transition={{ duration: 0.05 }}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${isPaused ? 'bg-orange-400' : 'bg-red-500 animate-pulse'}`} />
              <span className="text-2xl font-black font-mono text-red-600">{formatTime(recordingTime)}</span>
              {isTranscribing && (
                <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  <RefreshCcw className="w-3 h-3 animate-spin" /> Transcribing
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={pauseRecording} className="gap-2 rounded-xl h-10 border-red-200">
                {isPaused ? <Play className="w-4 h-4 text-orange-500" /> : <Pause className="w-4 h-4 text-red-500" />}
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button onClick={stopRecording} size="sm" className="gap-2 rounded-xl h-10 bg-red-600 hover:bg-red-700 text-white">
                <Square className="w-4 h-4 fill-current" /> Stop
              </Button>
              <Button variant="ghost" size="sm" onClick={discardRecording} className="text-slate-400 hover:text-rose-500 h-10 w-10 p-0 rounded-xl">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {audioUrl ? (
              <div className="space-y-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30">
                <div className="flex items-center gap-2 text-emerald-600">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Recording Saved — {formatTime(recordingTime)}</span>
                </div>
                <audio src={audioUrl} controls className="w-full h-10 rounded-xl" />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={startRecording} className="flex-1 gap-2 rounded-xl h-10">
                    <Mic className="w-4 h-4" /> Record Again
                  </Button>
                  <a href={audioUrl} download="voice-note.webm">
                    <Button variant="outline" size="sm" className="gap-2 rounded-xl h-10 text-emerald-600 border-emerald-200">
                      <Download className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </div>
            ) : (
              <Button
                onClick={startRecording}
                className="w-full h-14 rounded-[1.5rem] bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 hover:border-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all gap-3 font-black uppercase text-[11px] tracking-widest shadow-none"
              >
                <Mic className="w-5 h-5" /> Start Voice Recording
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
