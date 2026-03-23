import React, { useState, useRef } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const VOICES = [
    { label: 'Français – aura-2-agathe-fr', model: 'aura-2-agathe-fr' },
    { label: 'English – aura-2-thalia-en',  model: 'aura-2-thalia-en' },
];

export default function TtsTest() {
    const [text, setText]       = useState('Bonjour, je suis Guidy. Comment puis-je vous aider dans votre préparation à l\'entretien ?');
    const [model, setModel]     = useState('aura-2-agathe-fr');
    const [status, setStatus]   = useState<'idle' | 'loading' | 'playing' | 'error'>('idle');
    const [log, setLog]         = useState<string[]>([]);

    const audioCtxRef    = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    const addLog = (msg: string) => setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 20));

    const stopAudio = () => {
        try { audioSourceRef.current?.stop(); } catch {}
        audioSourceRef.current = null;
        audioCtxRef.current?.close().catch(() => {});
        audioCtxRef.current = null;
        setStatus('idle');
    };

    const play = async () => {
        if (!text.trim()) { toast.error('Entrez du texte.'); return; }
        stopAudio();
        setStatus('loading');
        addLog(`→ Requête TTS : model=${model}, ${text.length} chars`);

        try {
            const t0  = performance.now();
            const res = await axios.post(
                route('career-advisor.interview.tts'),
                { text: text.slice(0, 1500), model },
                { responseType: 'arraybuffer' }
            );
            const latency = Math.round(performance.now() - t0);
            const ct      = res.headers['content-type'] ?? 'inconnu';
            addLog(`✓ Réponse reçue en ${latency}ms — Content-Type: ${ct} — ${res.data.byteLength} bytes`);

            // Decode L16 PCM (audio/l16;rate=24000)
            const sampleRate = 24000;
            const AudioCtx   = window.AudioContext || (window as any).webkitAudioContext;
            const ctx        = new AudioCtx({ sampleRate });
            audioCtxRef.current = ctx;

            addLog(`AudioContext state: ${ctx.state}`);

            // Resume if suspended (autoplay policy)
            if (ctx.state === 'suspended') {
                await ctx.resume();
                addLog(`AudioContext resumed → ${ctx.state}`);
            }

            const rawBuffer = res.data as ArrayBuffer;
            let audioBuffer: AudioBuffer;

            if (ct.includes('l16') || ct.includes('pcm')) {
                // Raw L16 PCM — big-endian (RFC 2586)
                const dataView = new DataView(rawBuffer);
                const samples  = dataView.byteLength / 2;
                const float32  = new Float32Array(samples);
                for (let i = 0; i < samples; i++) {
                    float32[i] = dataView.getInt16(i * 2, false) / 32768.0;
                }
                addLog(`L16 PCM: ${samples} samples → ≈ ${(samples / sampleRate).toFixed(2)}s`);
                audioBuffer = ctx.createBuffer(1, float32.length, sampleRate);
                audioBuffer.copyToChannel(float32, 0);
            } else {
                // MP3 / AAC / OGG → let the browser decode
                addLog(`Décodage ${ct} via decodeAudioData…`);
                audioBuffer = await ctx.decodeAudioData(rawBuffer);
                addLog(`Décodé → ${audioBuffer.duration.toFixed(2)}s`);
            }

            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            audioSourceRef.current = source;

            source.onended = () => {
                addLog('✓ Lecture terminée');
                setStatus('idle');
                ctx.close().catch(() => {});
            };

            setStatus('playing');
            source.start();
            addLog('▶ Lecture démarrée');

        } catch (err: any) {
            const msg = err?.response?.data
                ? (() => { try { return JSON.parse(new TextDecoder().decode(err.response.data)).details ?? err.message; } catch { return err.message; } })()
                : err.message;
            addLog(`✗ Erreur: ${msg}`);
            setStatus('error');
        }
    };

    return (
        <>
            <Head title="Test TTS Deepgram" />
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-10">
                <div className="max-w-2xl mx-auto space-y-8">

                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-1">Test TTS Deepgram</h1>
                        <p className="text-sm text-neutral-500">Isolation du rendu audio avant intégration dans le simulateur.</p>
                    </div>

                    {/* Voice selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Voix</label>
                        <div className="flex flex-col gap-2">
                            {VOICES.map(v => (
                                <label key={v.model} className={cn(
                                    "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                                    model === v.model
                                        ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
                                        : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
                                )}>
                                    <input type="radio" name="model" value={v.model} checked={model === v.model} onChange={() => setModel(v.model)} className="accent-amber-500" />
                                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{v.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Text input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Texte à lire</label>
                        <textarea
                            value={text}
                            onChange={e => setText(e.target.value)}
                            rows={4}
                            className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 text-sm text-neutral-800 dark:text-neutral-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                        />
                        <p className="text-xs text-neutral-400 text-right">{text.length} / 1500 chars</p>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-4">
                        <button
                            onClick={play}
                            disabled={status === 'loading' || status === 'playing'}
                            className="flex-1 py-4 rounded-2xl bg-amber-500 text-white font-bold text-sm uppercase tracking-widest hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {status === 'loading' ? '⏳ Chargement...' : status === 'playing' ? '▶ Lecture en cours...' : '▶ Lire'}
                        </button>
                        {status === 'playing' && (
                            <button
                                onClick={stopAudio}
                                className="px-6 py-4 rounded-2xl bg-red-500 text-white font-bold text-sm uppercase tracking-widest hover:bg-red-600 transition-all"
                            >
                                ■ Stop
                            </button>
                        )}
                    </div>

                    {/* Status badge */}
                    <div className={cn(
                        "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest inline-block",
                        status === 'idle'    && "bg-neutral-100 dark:bg-neutral-800 text-neutral-500",
                        status === 'loading' && "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
                        status === 'playing' && "bg-green-100 dark:bg-green-900/30 text-green-600 animate-pulse",
                        status === 'error'   && "bg-red-100 dark:bg-red-900/30 text-red-600",
                    )}>
                        {status}
                    </div>

                    {/* Debug log */}
                    {log.length > 0 && (
                        <div className="bg-neutral-900 rounded-2xl p-6 font-mono text-xs space-y-1 max-h-64 overflow-y-auto">
                            {log.map((l, i) => (
                                <p key={i} className={cn(
                                    l.startsWith('✗') ? 'text-red-400' : l.startsWith('✓') ? 'text-green-400' : l.startsWith('▶') ? 'text-amber-400' : 'text-neutral-400'
                                )}>{l}</p>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
