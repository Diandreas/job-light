import React, { useState, useEffect, useRef, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { LuxuryButton } from '@/Components/ui/luxury/Button';
import { Mic, MicOff, Square, Volume2, VolumeX, Loader2, Send, RotateCcw, Eye, EyeOff, Flame, Heart, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const SESSION_KEY = 'interviewSession';

const DEEPGRAM_VOICE: Record<string, string> = {
    fr: 'aura-2-agathe-fr',
    en: 'aura-2-thalia-en',
    es: 'aura-2-thalia-en',
    de: 'aura-2-thalia-en',
};

type Phase = 'preparing' | 'resume' | 'active' | 'evaluating' | 'finished';

const LOADING_MESSAGES_FR = [
    "Guidy analyse votre profil...",
    "Calibration du niveau d'exigence...",
    "Sélection des questions les plus pertinentes...",
    "Préparation du dossier de candidature...",
    "Les bons recruteurs préparent toujours leurs questions...",
    "Guidy va vous challenger — soyez prêt.",
    "Votre entretien sera unique et personnalisé.",
    "Chaque réponse compte. Restez concentré.",
    "Guidy est plus exigeant qu'un vrai recruteur — c'est voulu.",
    "Dernière vérification avant le grand moment...",
];
const LOADING_MESSAGES_EN = [
    "Guidy is analyzing your profile...",
    "Calibrating the difficulty level...",
    "Selecting the most relevant questions...",
    "Preparing your interview brief...",
    "Great recruiters always prepare their questions...",
    "Guidy will challenge you — be ready.",
    "Your interview will be unique and personalized.",
    "Every answer matters. Stay focused.",
    "Guidy is tougher than a real recruiter — by design.",
    "Final checks before the big moment...",
];
type Message = { role: 'user' | 'assistant' | 'feedback'; content: string };

export default function Session({ auth }) {

    // ── Setup params ──────────────────────────────────────────────────────
    const setupRef = useRef<Record<string, string>>({});

    // ── Loading message cycling ───────────────────────────────────────────
    const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

    // ── Interview state ───────────────────────────────────────────────────
    const [phase, setPhase]               = useState<Phase>('preparing');
    const [questions, setQuestions]       = useState<string[]>([]);
    const [currentQIdx, setCurrentQIdx]   = useState(0);
    const [messages, setMessages]         = useState<Message[]>([]);
    const [score, setScore]               = useState(100);
    const [showScore, setShowScore]       = useState(true);
    const [showFeedback, setShowFeedback] = useState(true);

    // ── Voice / recording ─────────────────────────────────────────────────
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript]   = useState('');
    const [isMuted, setIsMuted]         = useState(false);
    const [isSpeaking, setIsSpeaking]   = useState(false);
    const [textInput, setTextInput]     = useState('');

    // ── Refs ──────────────────────────────────────────────────────────────
    const isMutedRef       = useRef(false);
    const scrollRef        = useRef<HTMLDivElement>(null);
    const wsRef            = useRef<WebSocket | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef        = useRef<MediaStream | null>(null);
    const dgTokenRef       = useRef('');
    const audioCtxRef      = useRef<AudioContext | null>(null);
    const audioSourceRef   = useRef<AudioBufferSourceNode | null>(null);
    // Pre-fetched TTS cache: questionIndex → ArrayBuffer
    const audioCacheRef    = useRef<Map<number, ArrayBuffer>>(new Map());
    const questionsRef     = useRef<string[]>([]);
    const currentQIdxRef   = useRef(0);

    // Keep refs in sync
    useEffect(() => { questionsRef.current = questions; }, [questions]);
    useEffect(() => { currentQIdxRef.current = currentQIdx; }, [currentQIdx]);

    // ── Scroll to bottom ──────────────────────────────────────────────────
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, transcript, phase]);

    // ── Cycle loading messages while preparing ────────────────────────────
    useEffect(() => {
        if (phase !== 'preparing') return;
        const msgs = setupRef.current.language === 'en' ? LOADING_MESSAGES_EN : LOADING_MESSAGES_FR;
        const id = setInterval(() => {
            setLoadingMsgIdx(i => (i + 1) % msgs.length);
        }, 3000);
        return () => clearInterval(id);
    }, [phase]);

    // ── Deepgram token ────────────────────────────────────────────────────
    useEffect(() => {
        axios.get(route('career-advisor.interview.deepgram-token'))
            .then(res => { dgTokenRef.current = res.data.token; })
            .catch(() => toast.warning('Service vocal non disponible, utilisez la saisie texte.'));
    }, []);

    // ── Mount: read params, check saved session, start ────────────────────
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        // Reconstruct arrays from bracket notation (focusAreas[0]=..., focusAreas[1]=...)
        const data: Record<string, any> = {};
        const arrays: Record<string, string[]> = {};
        for (const [k, v] of params.entries()) {
            const arrMatch = k.match(/^(\w+)\[\d+\]$/);
            if (arrMatch) {
                const base = arrMatch[1];
                if (!arrays[base]) arrays[base] = [];
                arrays[base].push(v);
            } else {
                data[k] = v;
            }
        }
        Object.assign(data, arrays);
        setupRef.current = data;

        setShowScore(data.showScore !== 'false');
        setShowFeedback(data.showFeedback !== 'false');

        // Check saved session
        const saved = sessionStorage.getItem(SESSION_KEY);
        if (saved) {
            try {
                const { questions: savedQs, currentQIdx: savedIdx, messages: savedMsgs, score: savedScore, setupData } = JSON.parse(saved);
                if (savedQs?.length > 0 && setupData?.jobTitle === data.jobTitle) {
                    // Offer resume
                    setQuestions(savedQs);
                    setCurrentQIdx(savedIdx ?? 0);
                    setMessages(savedMsgs ?? []);
                    setScore(savedScore ?? 100);
                    setPhase('resume');
                    return;
                }
            } catch { /* ignore */ }
        }

        startPrepare(data);

        return () => { stopSpeech(); stopMicrophone(); };
    }, []);

    // ── Persist session on every meaningful state change ──────────────────
    useEffect(() => {
        if (questions.length > 0 && phase === 'active') {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify({
                questions,
                currentQIdx,
                messages,
                score,
                setupData: setupRef.current,
            }));
        }
    }, [messages, currentQIdx, score]);

    // ── Prepare: generate question bank ───────────────────────────────────
    const startPrepare = async (data: Record<string, any>) => {
        setPhase('preparing');
        try {
            const res = await axios.post(route('career-advisor.interview.prepare'), data, { timeout: 90000 });
            // Normalize: ensure every question is a plain string
            const qs: string[] = (res.data.questions ?? []).map((q: any) =>
                typeof q === 'string' ? q : (q.question ?? q.text ?? q.content ?? JSON.stringify(q))
            );
            setQuestions(qs);
            questionsRef.current = qs;
            setPhase('active');

            // Display + speak first question, pre-fetch next
            displayQuestion(0, qs);
            prefetchAudio(1, qs);
        } catch (e: any) {
            const msg = e?.response?.data?.error ?? e?.message ?? 'Erreur réseau';
            toast.error(`Impossible de préparer l'entretien (${msg}). Nouvelle tentative dans 5s...`);
            // Auto-retry once after 5s
            setTimeout(() => startPrepare(data), 5000);
        }
    };

    // Display a question in the chat and speak it (from cache if available)
    const displayQuestion = async (idx: number, qs: string[]) => {
        const q = qs[idx];
        if (!q) return;
        setCurrentQIdx(idx);
        currentQIdxRef.current = idx;
        setMessages(prev => [...prev, { role: 'assistant', content: q }]);
        await playQuestion(idx, qs);
    };

    // ── TTS: play question from cache or fetch live ───────────────────────
    const playQuestion = async (idx: number, qs: string[]) => {
        const cached = audioCacheRef.current.get(idx);
        if (cached) {
            await playAudioBuffer(cached);
        } else {
            await speakText(qs[idx]);
        }
        // After speaking, pre-fetch the next next question
        prefetchAudio(idx + 2, qs);
    };

    // Pre-fetch TTS audio for a question index, store in cache
    const prefetchAudio = async (idx: number, qs: string[]) => {
        if (idx >= qs.length || audioCacheRef.current.has(idx)) return;
        const text = qs[idx];
        if (!text) return;
        try {
            const lang  = setupRef.current.language || 'fr';
            const model = DEEPGRAM_VOICE[lang] ?? 'aura-2-thalia-en';
            const res = await axios.post(
                route('career-advisor.interview.tts'),
                { text: text.slice(0, 1500), model },
                { responseType: 'arraybuffer' }
            );
            audioCacheRef.current.set(idx, res.data as ArrayBuffer);
        } catch { /* silent — will fall back to live TTS */ }
    };

    // ── Audio playback ────────────────────────────────────────────────────
    const decodeAndPlay = async (rawBuffer: ArrayBuffer, contentType: string): Promise<void> => {
        const sampleRate = 24000;
        const AudioCtx   = window.AudioContext || (window as any).webkitAudioContext;
        const ctx        = new AudioCtx({ sampleRate });
        audioCtxRef.current = ctx;

        if (ctx.state === 'suspended') await ctx.resume();

        let audioBuffer: AudioBuffer;
        if (contentType.includes('l16') || contentType.includes('pcm')) {
            const dv      = new DataView(rawBuffer);
            const samples = dv.byteLength / 2;
            const f32     = new Float32Array(samples);
            for (let i = 0; i < samples; i++) f32[i] = dv.getInt16(i * 2, false) / 32768.0;
            audioBuffer = ctx.createBuffer(1, f32.length, sampleRate);
            audioBuffer.copyToChannel(f32, 0);
        } else {
            audioBuffer = await ctx.decodeAudioData(rawBuffer.slice(0));
        }

        return new Promise(resolve => {
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            audioSourceRef.current = source;
            source.onended = () => {
                setIsSpeaking(false);
                ctx.close().catch(() => {});
                resolve();
            };
            setIsSpeaking(true);
            source.start();
        });
    };

    const playAudioBuffer = async (rawBuffer: ArrayBuffer) => {
        if (isMutedRef.current) return;
        stopSpeech();
        // Cached buffers were fetched without content-type, Deepgram returns mpeg by default
        await decodeAndPlay(rawBuffer, 'audio/mpeg').catch(() => setIsSpeaking(false));
    };

    const speakText = async (text: string) => {
        if (isMutedRef.current || !text.trim()) return;
        stopSpeech();
        try {
            const lang  = setupRef.current.language || 'fr';
            const model = DEEPGRAM_VOICE[lang] ?? 'aura-2-thalia-en';
            const res = await axios.post(
                route('career-advisor.interview.tts'),
                { text: text.slice(0, 1500), model },
                { responseType: 'arraybuffer' }
            );
            if (isMutedRef.current) return;
            const ct = res.headers['content-type'] ?? '';
            await decodeAndPlay(res.data as ArrayBuffer, ct).catch(() => setIsSpeaking(false));
        } catch {
            setIsSpeaking(false);
        }
    };

    const stopSpeech = () => {
        try { audioSourceRef.current?.stop(); } catch { }
        audioSourceRef.current = null;
        audioCtxRef.current?.close().catch(() => {});
        audioCtxRef.current = null;
        setIsSpeaking(false);
    };

    const toggleMute = () => {
        isMutedRef.current = !isMutedRef.current;
        setIsMuted(isMutedRef.current);
        if (isMutedRef.current) stopSpeech();
    };

    // ── Microphone (Deepgram WebSocket STT) ───────────────────────────────
    const startMicrophone = async () => {
        if (!dgTokenRef.current) { toast.error('Micro IA indisponible, utilisez la saisie texte.'); return; }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const lang  = setupRef.current.language || 'fr';
            const wsUrl = `wss://api.deepgram.com/v1/listen?model=nova-3&language=${lang}&punctuate=true&interim_results=true`;
            const ws    = new WebSocket(wsUrl, ['token', dgTokenRef.current]);
            wsRef.current = ws;

            ws.onopen = () => {
                const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
                const recorder = new MediaRecorder(stream, { mimeType });
                mediaRecorderRef.current = recorder;
                recorder.ondataavailable = (e) => { if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) ws.send(e.data); };
                recorder.start(250);
            };
            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'Results' && data.is_final) {
                        const text = data.channel?.alternatives?.[0]?.transcript ?? '';
                        if (text) setTranscript(prev => (prev + ' ' + text).trim());
                    }
                } catch { }
            };
            ws.onerror = () => toast.error('Erreur de connexion au service vocal.');
        } catch (err: any) {
            toast.error(err.name === 'NotAllowedError' ? 'Accès au microphone refusé.' : 'Impossible d\'accéder au microphone.');
        }
    };

    const stopMicrophone = () => {
        mediaRecorderRef.current?.stop();
        mediaRecorderRef.current = null;
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    };

    const toggleRecording = () => {
        if (phase === 'evaluating') { toast('L\'IA évalue votre réponse...'); return; }
        if (isRecording) {
            stopMicrophone();
            setIsRecording(false);
            if (transcript.trim()) handleAnswerSubmit(transcript.trim());
            else toast.error('Aucune voix détectée');
        } else {
            setTranscript('');
            stopSpeech();
            startMicrophone();
            setIsRecording(true);
        }
    };

    // ── Submit answer → evaluate ──────────────────────────────────────────
    const handleAnswerSubmit = async (answer: string) => {
        setTranscript('');
        if (!answer.trim()) return;
        stopSpeech();
        setPhase('evaluating');

        const qIdx    = currentQIdxRef.current;
        const qs      = questionsRef.current;
        const question = qs[qIdx] ?? '';

        const newMessages: Message[] = [...messages, { role: 'user', content: answer }];
        setMessages(newMessages);

        try {
            const res = await axios.post(route('career-advisor.interview.evaluate'), {
                question,
                answer,
                jobTitle:        setupRef.current.jobTitle,
                aggressionLevel: setupRef.current.aggressionLevel ?? '2',
                language:        setupRef.current.language ?? 'fr',
                currentScore:    score,
                questionIndex:   qIdx,
            });

            const { score_delta, comment, feedback, pass } = res.data;

            // Update running score (clamp 0–100)
            const newScore = Math.max(0, Math.min(100, score + (score_delta ?? 0)));
            setScore(newScore);

            // Build updated messages
            const updatedMessages: Message[] = [...newMessages];
            if (comment?.trim()) updatedMessages.push({ role: 'assistant', content: comment });
            if (feedback?.trim() && showFeedback) updatedMessages.push({ role: 'feedback', content: feedback });
            setMessages(updatedMessages);

            // Speak only the short interviewer comment (fast TTS)
            if (comment?.trim()) await speakText(comment);

            const nextIdx = qIdx + 1;
            const isLastQ = nextIdx >= qs.length;

            if (!pass && !isLastQ) {
                // Stay on same question — ask again or just wait
                setPhase('active');
            } else if (isLastQ || newScore < 30) {
                // Interview over
                setPhase('finished');
                toast.success('Entretien terminé ! Génération du rapport...');
                await generateFinalReport(updatedMessages, newScore);
            } else {
                // Move to next question (audio pre-fetched)
                setPhase('active');
                // Small pause then display next question
                await new Promise(r => setTimeout(r, 600));
                await displayQuestion(nextIdx, qs);
                prefetchAudio(nextIdx + 1, qs);
            }
        } catch {
            toast.error('Erreur de connexion avec l\'IA');
            setPhase('active');
        }
    };

    // ── Final report ──────────────────────────────────────────────────────
    const generateFinalReport = async (finalMessages: Message[], finalScore: number) => {
        setPhase('finished');
        stopSpeech();
        try {
            const res = await axios.post(route('career-advisor.interview.generate-report'), {
                history:  finalMessages,
                jobTitle: setupRef.current.jobTitle,
                score:    finalScore,
            });
            sessionStorage.removeItem(SESSION_KEY);
            sessionStorage.setItem('interviewReport', JSON.stringify(res.data));
            window.location.href = route('career-advisor.interview.report');
        } catch {
            toast.error('Erreur durant la création du rapport');
            setPhase('active');
        }
    };

    const endSessionEarly = () => {
        stopSpeech();
        if (messages.length > 1) {
            generateFinalReport(messages, score);
        } else {
            sessionStorage.removeItem(SESSION_KEY);
            window.location.href = route('career-advisor.interview.setup');
        }
    };

    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (textInput.trim()) { handleAnswerSubmit(textInput.trim()); setTextInput(''); }
    };

    const resumeSession = () => {
        setPhase('active');
        // Re-speak current question
        const qs = questionsRef.current;
        const idx = currentQIdxRef.current;
        if (qs[idx]) playQuestion(idx, qs);
    };

    const discardAndRestart = () => {
        sessionStorage.removeItem(SESSION_KEY);
        audioCacheRef.current.clear();
        setMessages([]);
        setScore(100);
        setCurrentQIdx(0);
        startPrepare(setupRef.current);
    };

    // ── Score color ───────────────────────────────────────────────────────
    const scoreColor = score >= 75 ? 'text-green-500' : score >= 50 ? 'text-amber-500' : 'text-red-500';
    const scoreBg    = score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';
    const isEvaluating = phase === 'evaluating';
    const aggressionLevel = parseInt(setupRef.current.aggressionLevel ?? '2');

    // ── Preparing screen ──────────────────────────────────────────────────
    if (phase === 'preparing') {
        const lang = setupRef.current.language === 'en' ? 'en' : 'fr';
        const msgs = lang === 'en' ? LOADING_MESSAGES_EN : LOADING_MESSAGES_FR;
        const currentMsg = msgs[loadingMsgIdx % msgs.length];

        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title="Préparation de l'entretien" />
                <div className="h-[calc(100vh-65px)] flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
                    <div className="text-center max-w-md px-6 space-y-10">

                        {/* Pulsing orb */}
                        <div className="relative mx-auto w-28 h-28">
                            <div className="absolute inset-0 rounded-full bg-amber-500/10 animate-ping" style={{ animationDuration: '2s' }} />
                            <div className="absolute inset-2 rounded-full bg-amber-500/10 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.3s' }} />
                            <div className="relative w-full h-full rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                            </div>
                        </div>

                        {/* Label */}
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-600 dark:text-amber-500">
                                {lang === 'en' ? 'Guidy is preparing your interview' : 'Guidy prépare votre entretien'}
                            </p>
                        </div>

                        {/* Rotating message */}
                        <div className="h-8 flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={loadingMsgIdx}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.4 }}
                                    className="text-sm text-neutral-500 dark:text-neutral-400 italic"
                                >
                                    {currentMsg}
                                </motion.p>
                            </AnimatePresence>
                        </div>

                        {/* Dots progress */}
                        <div className="flex justify-center gap-2">
                            {msgs.map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-1 rounded-full transition-all duration-500",
                                        i === loadingMsgIdx % msgs.length
                                            ? "w-6 bg-amber-500"
                                            : "w-1.5 bg-neutral-200 dark:bg-neutral-800"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    // ── Resume screen ─────────────────────────────────────────────────────
    if (phase === 'resume') {
        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title="Session sauvegardée" />
                <div className="h-[calc(100vh-65px)] flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-neutral-900 rounded-[3rem] border border-neutral-100 dark:border-neutral-800 shadow-2xl p-14 max-w-lg w-full text-center"
                    >
                        <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
                            <RotateCcw className="w-8 h-8 text-amber-500" />
                        </div>
                        <h2 className="text-2xl font-serif text-neutral-900 dark:text-neutral-50 mb-3">Session sauvegardée</h2>
                        <p className="text-neutral-500 text-sm leading-relaxed mb-10">
                            Vous avez un entretien en cours pour <strong>{setupRef.current.jobTitle}</strong>.<br />
                            Score actuel : <strong className={scoreColor}>{score}/100</strong>
                        </p>
                        <div className="flex flex-col gap-4">
                            <LuxuryButton variant="primary" className="w-full py-5 rounded-2xl" onClick={resumeSession}>
                                Reprendre l'entretien
                            </LuxuryButton>
                            <LuxuryButton variant="ghost" className="w-full py-5 rounded-2xl text-neutral-500" onClick={discardAndRestart}>
                                Recommencer depuis le début
                            </LuxuryButton>
                        </div>
                    </motion.div>
                </div>
            </AuthenticatedLayout>
        );
    }

    // ── Main session UI ───────────────────────────────────────────────────
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Entretien en cours" />

            <div className="h-[calc(100vh-65px)] flex flex-col bg-neutral-50 dark:bg-neutral-950 p-6 sm:p-10 overflow-hidden">

                {/* Status bar */}
                <div className="flex justify-between items-center mb-6 px-2">
                    <div className="flex items-center gap-4">
                        <div className={cn("w-2 h-2 rounded-full animate-pulse", isEvaluating ? "bg-blue-500" : "bg-amber-500")} />
                        <span className={cn("text-[10px] font-bold uppercase tracking-[0.3em]", isEvaluating ? "text-blue-500" : "text-amber-600 dark:text-amber-500")}>
                            {isEvaluating ? "Évaluation..." : phase === 'finished' ? "Rapport en cours..." : `Q${currentQIdx + 1}/${questions.length}`}
                        </span>
                        {aggressionLevel === 3 && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-red-500 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full">
                                <Flame className="w-3 h-3" /> Brutal
                            </span>
                        )}
                        {aggressionLevel === 1 && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-green-600 bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded-full">
                                <Heart className="w-3 h-3" /> Bienveillant
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {isSpeaking && !isMuted && (
                            <div className="flex items-center gap-2 text-amber-500">
                                <Volume2 className="w-4 h-4 animate-pulse" />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Guidy parle</span>
                            </div>
                        )}
                        {/* Toggles */}
                        <button
                            onClick={() => setShowFeedback(v => !v)}
                            className={cn("inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all",
                                showFeedback
                                    ? "border-blue-300 dark:border-blue-800 text-blue-500 bg-blue-50 dark:bg-blue-950/20"
                                    : "border-neutral-200 dark:border-neutral-800 text-neutral-400"
                            )}
                            title={showFeedback ? "Masquer les conseils" : "Afficher les conseils"}
                        >
                            <BookOpen className="w-3 h-3" />
                            {showFeedback ? 'Conseils ON' : 'Conseils OFF'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto w-full overflow-hidden">

                    {/* Left: Guidy avatar + score + text input */}
                    <div className="flex-1 flex flex-col gap-4 overflow-hidden">

                        {/* Avatar panel */}
                        <div className="flex-1 bg-neutral-900 rounded-[3rem] relative shadow-2xl overflow-hidden flex flex-col border border-neutral-800">
                            <div className="absolute top-8 left-8 flex items-center gap-3 z-20">
                                <div className="p-2 bg-amber-500/20 backdrop-blur-md rounded-xl">
                                    <span className="text-amber-500 text-xs font-bold">AI</span>
                                </div>
                                <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">Guidy Recruiter</span>
                            </div>

                            {/* Score display */}
                            {showScore && (
                                <div className="absolute top-8 right-8 z-20 flex flex-col items-end gap-1">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Score</span>
                                    <span className={cn("text-3xl font-bold tabular-nums", scoreColor)}>{score}</span>
                                    <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                        <div className={cn("h-full rounded-full transition-all duration-700", scoreBg)} style={{ width: `${score}%` }} />
                                    </div>
                                </div>
                            )}

                            <div className="flex-1 flex items-center justify-center">
                                <div className="relative">
                                    <div className={cn(
                                        "w-40 h-40 rounded-full border flex items-center justify-center transition-all duration-700",
                                        isEvaluating ? "border-blue-500/50 scale-110" : isSpeaking && !isMuted ? "border-green-500/50 scale-105" : "border-amber-500/20"
                                    )}>
                                        <div className={cn(
                                            "w-32 h-32 rounded-full border flex items-center justify-center",
                                            isEvaluating ? "animate-pulse border-blue-500/40" : isSpeaking && !isMuted ? "animate-pulse border-green-500/40" : "border-amber-500/20"
                                        )}>
                                            <div className={cn(
                                                "w-24 h-24 rounded-full flex items-center justify-center",
                                                isEvaluating ? "bg-blue-500/10" : isSpeaking && !isMuted ? "bg-green-500/10" : "bg-amber-500/5"
                                            )}>
                                                {isEvaluating
                                                    ? <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                                    : <Volume2 className={cn("w-8 h-8", isSpeaking && !isMuted ? "text-green-400 animate-pulse" : "text-amber-500 opacity-20")} />
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    {isRecording && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-48 h-48 rounded-full border border-amber-500/20 animate-ping" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-8 bg-gradient-to-t from-black/80 to-transparent">
                                <p className="text-sm font-light italic text-amber-500/50">
                                    {isEvaluating ? "Guidy analyse votre réponse..." : isSpeaking && !isMuted ? "Guidy parle..." : "En attente de votre réponse..."}
                                </p>
                            </div>
                        </div>

                        {/* Text input */}
                        <form onSubmit={handleTextSubmit} className="flex gap-3 items-center bg-white dark:bg-neutral-900 rounded-[2rem] p-2 border border-neutral-200 dark:border-neutral-800 shadow-xl">
                            <input
                                type="text"
                                value={textInput}
                                onChange={e => setTextInput(e.target.value)}
                                disabled={isEvaluating || isRecording || phase === 'finished'}
                                placeholder={isRecording ? "Désactivez le micro pour écrire..." : "Tapez votre réponse ici..."}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 text-neutral-700 dark:text-neutral-300 placeholder:text-neutral-400"
                            />
                            <LuxuryButton
                                type="submit"
                                disabled={isEvaluating || isRecording || !textInput.trim() || phase === 'finished'}
                                className="w-12 h-12 rounded-full p-0 flex items-center justify-center bg-amber-500 text-white hover:bg-amber-600 shrink-0"
                            >
                                <Send className="w-5 h-5 ml-1" />
                            </LuxuryButton>
                        </form>
                    </div>

                    {/* Right: Transcript + controls */}
                    <div className="w-full lg:w-[450px] flex flex-col gap-4 overflow-hidden">
                        <div className="flex-1 bg-white dark:bg-neutral-900 rounded-[3rem] border border-neutral-100 dark:border-neutral-800 shadow-2xl flex flex-col overflow-hidden">

                            {/* Header */}
                            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center shrink-0">
                                <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">Transcription</h3>
                                <button onClick={() => setShowScore(v => !v)} className="text-[9px] font-bold text-neutral-400 hover:text-amber-500 transition-colors flex items-center gap-1">
                                    {showScore ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                    Score
                                </button>
                            </div>

                            {/* Messages */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                                <AnimatePresence initial={false}>
                                    {messages.map((msg, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                                        >
                                            <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 inline-flex items-center gap-1">
                                                {msg.role === 'user' ? 'Vous' : msg.role === 'feedback'
                                                    ? <><BookOpen className="w-2.5 h-2.5" /> Conseil</>
                                                    : 'Recruteur'}
                                            </span>
                                            <div className={cn(
                                                "max-w-[92%] p-5 text-sm leading-relaxed",
                                                msg.role === 'user'
                                                    ? "bg-amber-500 text-white rounded-[2rem] rounded-tr-none shadow-xl shadow-amber-500/20"
                                                    : msg.role === 'feedback'
                                                        ? "bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 rounded-[2rem] rounded-tl-none border border-blue-100/50 text-xs italic"
                                                        : "bg-amber-50 dark:bg-amber-950/30 text-neutral-700 dark:text-neutral-300 rounded-[2rem] rounded-tl-none border border-amber-100/50 dark:border-amber-900/20"
                                            )}>
                                                {msg.content}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* Live transcript */}
                                {(isRecording || transcript) && (
                                    <div className="flex flex-col items-end">
                                        <div className="bg-neutral-100 dark:bg-neutral-800/50 p-5 rounded-[2rem] rounded-tr-none border border-dashed border-neutral-300 dark:border-neutral-700 max-w-[92%]">
                                            <p className="text-sm text-neutral-600 dark:text-neutral-300">
                                                {transcript || <span className="text-neutral-400 italic">Écoute en cours...</span>}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Evaluating indicator */}
                                {isEvaluating && (
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-start">
                                        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-[2rem] rounded-tl-none border border-amber-100/50 p-4 flex gap-2">
                                            <span className="animate-bounce text-amber-500">.</span>
                                            <span className="animate-bounce text-amber-500" style={{ animationDelay: '0.2s' }}>.</span>
                                            <span className="animate-bounce text-amber-500" style={{ animationDelay: '0.4s' }}>.</span>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-4 shrink-0">
                                {/* End */}
                                <LuxuryButton
                                    variant="ghost"
                                    className="w-12 h-12 rounded-full p-0 flex items-center justify-center hover:border-red-400 hover:bg-red-50 group"
                                    onClick={endSessionEarly}
                                    disabled={phase === 'finished'}
                                >
                                    <Square className="w-4 h-4 text-red-500 fill-current" />
                                </LuxuryButton>

                                {/* Mic */}
                                <LuxuryButton
                                    variant="primary"
                                    className={cn(
                                        "w-20 h-20 rounded-full p-0 flex items-center justify-center shadow-2xl transition-all duration-500",
                                        isRecording ? "bg-amber-600 shadow-amber-600/50 scale-110" : "shadow-amber-500/40",
                                        (isEvaluating || phase === 'finished') && "opacity-50 cursor-not-allowed grayscale"
                                    )}
                                    onClick={toggleRecording}
                                    disabled={isEvaluating || phase === 'finished'}
                                >
                                    {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                                </LuxuryButton>

                                {/* Mute */}
                                <LuxuryButton
                                    variant="ghost"
                                    onClick={toggleMute}
                                    className={cn("w-12 h-12 rounded-full p-0 flex items-center justify-center", isMuted && "text-red-500 bg-red-500/10")}
                                >
                                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-neutral-400" />}
                                </LuxuryButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
