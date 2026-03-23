import React, { useState, useEffect, useRef } from 'react';
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

// Filler words detected in real-time on the transcript
const FILLER_WORDS: Record<string, string[]> = {
    fr: ['euh', 'bah', 'ben', 'donc', 'voilà', 'genre', 'hein', 'quoi', 'comme', 'en fait'],
    en: ['um', 'uh', 'like', 'you know', 'basically', 'literally', 'actually', 'right', 'so'],
};

type Phase = 'preparing' | 'resume' | 'active' | 'evaluating' | 'finished';
type MessageRole = 'user' | 'assistant' | 'feedback' | 'follow_up';
type Message = { role: MessageRole; content: string };

const LOADING_MESSAGES: Record<string, string[]> = {
    fr: [
        "Guidy analyse votre profil...",
        "Calibration du niveau d'exigence...",
        "Sélection des questions les plus pertinentes...",
        "Guidy va vous challenger — soyez prêt.",
        "Chaque réponse sera évaluée sur 4 critères précis.",
        "Les bonnes réponses mènent à des questions plus dures.",
        "Votre entretien sera unique et personnalisé.",
        "Préparation de l'audio en arrière-plan...",
        "Guidy est plus exigeant qu'un vrai recruteur — c'est voulu.",
        "Dernière vérification avant le grand moment...",
    ],
    en: [
        "Guidy is analyzing your profile...",
        "Calibrating the difficulty level...",
        "Selecting the most relevant questions...",
        "Guidy will challenge you — be ready.",
        "Every answer will be scored on 4 precise criteria.",
        "Good answers lead to harder questions.",
        "Your interview will be unique and personalized.",
        "Pre-loading audio in the background...",
        "Guidy is tougher than a real recruiter — by design.",
        "Final checks before the big moment...",
    ],
};

export default function Session({ auth }) {

    const setupRef  = useRef<Record<string, any>>({});
    const lang      = () => setupRef.current.language || 'fr';

    // ── Interview state ───────────────────────────────────────────────────
    const [phase, setPhase]               = useState<Phase>('preparing');
    const [questions, setQuestions]       = useState<string[]>([]);
    const [currentQIdx, setCurrentQIdx]   = useState(0);
    const [messages, setMessages]         = useState<Message[]>([]);
    const [score, setScore]               = useState(100);
    const [showScore, setShowScore]       = useState(true);
    const [showFeedback, setShowFeedback] = useState(true);
    const showFeedbackRef = useRef(true); // ref so async closures always read current value
    const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
    const [fillerCount, setFillerCount]   = useState(0);

    // Per-question retry tracking for adaptive follow-ups (max 1 per question)
    const retryCountRef  = useRef<Record<number, number>>({});
    // Stores the follow-up question text per question index (to use as context on next eval)
    const followUpRef    = useRef<Record<number, string>>({});
    // Accumulated dimension scores for the final report
    const dimensionsRef  = useRef<{ relevance: number[]; structure: number[]; depth: number[]; delivery: number[] }>({
        relevance: [], structure: [], depth: [], delivery: [],
    });

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
    // TTS cache: questionIndex → ArrayBuffer (pre-fetched audio)
    const audioCacheRef    = useRef<Map<number | string, ArrayBuffer>>(new Map());
    const questionsRef     = useRef<string[]>([]);
    const currentQIdxRef   = useRef(0);
    const messagesRef      = useRef<Message[]>([]);

    useEffect(() => { questionsRef.current = questions; }, [questions]);
    useEffect(() => { currentQIdxRef.current = currentQIdx; }, [currentQIdx]);
    useEffect(() => { showFeedbackRef.current = showFeedback; }, [showFeedback]);
    useEffect(() => { messagesRef.current = messages; }, [messages]);

    // ── Scroll to bottom ──────────────────────────────────────────────────
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, transcript, phase]);

    // ── Loading messages rotation ─────────────────────────────────────────
    useEffect(() => {
        if (phase !== 'preparing') return;
        const msgs = LOADING_MESSAGES[lang()] ?? LOADING_MESSAGES.fr;
        const id = setInterval(() => setLoadingMsgIdx(i => (i + 1) % msgs.length), 3000);
        return () => clearInterval(id);
    }, [phase]);

    // ── Deepgram token ────────────────────────────────────────────────────
    useEffect(() => {
        axios.get(route('career-advisor.interview.deepgram-token'))
            .then(res => { dgTokenRef.current = res.data.token; })
            .catch(() => toast.warning('Service vocal non disponible, utilisez la saisie texte.'));
    }, []);

    // ── Mount ─────────────────────────────────────────────────────────────
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const data: Record<string, any> = {};
        const arrays: Record<string, string[]> = {};
        for (const [k, v] of params.entries()) {
            const m = k.match(/^(\w+)\[\d+\]$/);
            if (m) { if (!arrays[m[1]]) arrays[m[1]] = []; arrays[m[1]].push(v); }
            else data[k] = v;
        }
        Object.assign(data, arrays);
        setupRef.current = data;

        const initShowScore    = data.showScore    !== 'false';
        const initShowFeedback = data.showFeedback !== 'false';
        setShowScore(initShowScore);
        setShowFeedback(initShowFeedback);
        showFeedbackRef.current = initShowFeedback;

        const saved = sessionStorage.getItem(SESSION_KEY);
        if (saved) {
            try {
                const { questions: savedQs, currentQIdx: savedIdx, messages: savedMsgs, score: savedScore, setupData } = JSON.parse(saved);
                if (savedQs?.length > 0 && setupData?.jobTitle === data.jobTitle) {
                    setQuestions(savedQs); setCurrentQIdx(savedIdx ?? 0);
                    setMessages(savedMsgs ?? []); setScore(savedScore ?? 100);
                    setPhase('resume');
                    return;
                }
            } catch { }
        }
        startPrepare(data);
        return () => { stopSpeech(); stopMicrophone(); };
    }, []);

    // ── Persist ───────────────────────────────────────────────────────────
    useEffect(() => {
        if (questions.length > 0 && phase === 'active') {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify({
                questions, currentQIdx, messages, score, setupData: setupRef.current,
            }));
        }
    }, [messages, currentQIdx, score]);

    // ── Filler word detection on streaming transcript ─────────────────────
    useEffect(() => {
        if (!transcript) return;
        const l = lang();
        const fillers = FILLER_WORDS[l] ?? FILLER_WORDS.en;
        const words = transcript.toLowerCase().split(/\s+/);
        const count = words.filter(w => fillers.includes(w)).length;
        setFillerCount(count);
    }, [transcript]);

    // ═════════════════════════════════════════════════════════════════════
    // AUDIO ENGINE — separated fetch from play for parallel execution
    // ═════════════════════════════════════════════════════════════════════

    const decodeBuffer = async (rawBuffer: ArrayBuffer, contentType: string): Promise<AudioBuffer> => {
        const sampleRate = 24000;
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx({ sampleRate });
        audioCtxRef.current = ctx;
        if (ctx.state === 'suspended') await ctx.resume();

        if (contentType.includes('l16') || contentType.includes('pcm')) {
            const dv = new DataView(rawBuffer);
            const samples = dv.byteLength / 2;
            const f32 = new Float32Array(samples);
            for (let i = 0; i < samples; i++) f32[i] = dv.getInt16(i * 2, false) / 32768.0;
            const buf = ctx.createBuffer(1, f32.length, sampleRate);
            buf.copyToChannel(f32, 0);
            return buf;
        }
        return ctx.decodeAudioData(rawBuffer.slice(0));
    };

    // Fetch TTS audio bytes — does NOT play, just returns ArrayBuffer
    const fetchTTSBuffer = async (text: string): Promise<ArrayBuffer | null> => {
        if (!text.trim()) return null;
        try {
            const l = lang();
            const model = DEEPGRAM_VOICE[l] ?? 'aura-2-thalia-en';
            const res = await axios.post(
                route('career-advisor.interview.tts'),
                { text: text.slice(0, 1500), model },
                { responseType: 'arraybuffer' }
            );
            return res.data as ArrayBuffer;
        } catch { return null; }
    };

    // Play an already-fetched ArrayBuffer (assumed audio/mpeg from Deepgram)
    const playBuffer = (buffer: ArrayBuffer): Promise<void> => {
        return new Promise(async (resolve) => {
            if (isMutedRef.current) { resolve(); return; }
            stopSpeech();
            try {
                const audioBuffer = await decodeBuffer(buffer, 'audio/mpeg');
                const source = audioCtxRef.current!.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioCtxRef.current!.destination);
                audioSourceRef.current = source;
                setIsSpeaking(true);
                source.onended = () => { setIsSpeaking(false); resolve(); };
                source.start();
            } catch { setIsSpeaking(false); resolve(); }
        });
    };

    // Fetch AND play in one call (for the comment — dynamic text)
    const speakText = async (text: string) => {
        if (isMutedRef.current || !text.trim()) return;
        const buffer = await fetchTTSBuffer(text);
        if (buffer) await playBuffer(buffer);
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

    // Pre-fetch audio for a question by index, store in cache
    const prefetchAudio = async (idx: number, qs: string[]) => {
        if (idx >= qs.length || audioCacheRef.current.has(idx)) return;
        const buf = await fetchTTSBuffer(qs[idx]);
        if (buf) audioCacheRef.current.set(idx, buf);
    };

    // Play question audio — from cache if available, otherwise fetch live
    const playQuestion = async (idx: number, qs: string[]) => {
        const cached = audioCacheRef.current.get(idx);
        if (cached) {
            await playBuffer(cached);
        } else {
            await speakText(qs[idx] ?? '');
        }
        // Pre-fetch the question after next (background)
        prefetchAudio(idx + 2, qs);
    };

    // ═════════════════════════════════════════════════════════════════════
    // INTERVIEW FLOW
    // ═════════════════════════════════════════════════════════════════════

    const startPrepare = async (data: Record<string, any>) => {
        setPhase('preparing');
        try {
            const res = await axios.post(route('career-advisor.interview.prepare'), data, { timeout: 90000 });
            const qs: string[] = (res.data.questions ?? []).map((q: any) =>
                typeof q === 'string' ? q : (q.question ?? q.text ?? q.content ?? '')
            ).filter(Boolean);

            if (qs.length === 0) throw new Error('No questions returned');

            setQuestions(qs);
            questionsRef.current = qs;
            setPhase('active');

            // Pre-fetch Q0 first (must be ready before we speak it),
            // then kick off Q1+Q2 in background while Q0 plays
            await prefetchAudio(0, qs);
            Promise.all([1, 2].map(i => prefetchAudio(i, qs))); // background, no await

            await displayQuestion(0, qs);
        } catch (e: any) {
            const msg = e?.response?.data?.error ?? e?.message ?? 'Erreur réseau';
            toast.error(`Préparation échouée (${msg}). Nouvelle tentative dans 5s...`);
            setTimeout(() => startPrepare(data), 5000);
        }
    };

    const displayQuestion = async (idx: number, qs: string[]) => {
        const q = qs[idx];
        if (!q) return;
        setCurrentQIdx(idx);
        currentQIdxRef.current = idx;
        setMessages(prev => [...prev, { role: 'assistant', content: q }]);
        await playQuestion(idx, qs);
    };

    // ═════════════════════════════════════════════════════════════════════
    // ANSWER SUBMISSION + ADAPTIVE EVALUATION
    // ═════════════════════════════════════════════════════════════════════

    const handleAnswerSubmit = async (answer: string) => {
        setTranscript('');
        setFillerCount(0);
        if (!answer.trim()) return;
        stopSpeech();

        const qIdx    = currentQIdxRef.current;
        const qs      = questionsRef.current;
        const retries = retryCountRef.current[qIdx] ?? 0;
        // If we already asked a follow-up for this question, use it as the evaluated question
        const lastFollowUp = followUpRef.current[qIdx] ?? null;
        const question = (retries > 0 && lastFollowUp) ? lastFollowUp : (qs[qIdx] ?? '');

        setMessages(prev => [...prev, { role: 'user', content: answer }]);
        setPhase('evaluating');

        try {
            // ── 1. Evaluate answer ────────────────────────────────────────
            const evalRes = await axios.post(route('career-advisor.interview.evaluate'), {
                question,
                answer,
                jobTitle:        setupRef.current.jobTitle,
                aggressionLevel: setupRef.current.aggressionLevel ?? '2',
                language:        lang(),
                currentScore:    score,
                questionIndex:   qIdx,
            });

            const { score_delta, comment, feedback, pass, adaptive_follow_up, dimensions } = evalRes.data;

            // ── 2. Update score + accumulate dimensions ───────────────────
            const newScore = Math.max(0, Math.min(100, score + (score_delta ?? 0)));
            setScore(newScore);

            if (dimensions) {
                for (const key of ['relevance', 'structure', 'depth', 'delivery'] as const) {
                    if (typeof dimensions[key] === 'number') {
                        dimensionsRef.current[key].push(dimensions[key]);
                    }
                }
            }

            // ── 3. Build messages + determine next action ─────────────────
            // After 1 follow-up, always advance — no more retries on the same question
            const doFollowUp = !pass && adaptive_follow_up?.trim() && retries < 1;

            const newMsgs: Message[] = [];
            if (comment?.trim())  newMsgs.push({ role: 'assistant', content: comment });
            if (feedback?.trim() && showFeedbackRef.current) newMsgs.push({ role: 'feedback', content: feedback });
            if (doFollowUp)       newMsgs.push({ role: 'follow_up', content: adaptive_follow_up });

            setMessages(prev => [...prev, ...newMsgs]);

            // ── 4. Determine what comes next (for parallel TTS pre-fetch) ──
            const nextIdx = qIdx + 1;
            const isLastQ = nextIdx >= qs.length;
            const nextText = doFollowUp ? adaptive_follow_up : qs[nextIdx] ?? '';

            // ── 5. Pre-fetch next audio WHILE comment plays ────────────────
            // Both fetches run concurrently — comment plays, next is downloading
            const nextBufferPromise = nextText ? fetchTTSBuffer(nextText) : Promise.resolve(null);

            setPhase('active');

            // ── 6. Speak comment ──────────────────────────────────────────
            if (comment?.trim()) await speakText(comment);

            // ── 7. Adaptive follow-up OR advance ──────────────────────────
            if (doFollowUp) {
                retryCountRef.current[qIdx] = retries + 1;
                followUpRef.current[qIdx] = adaptive_follow_up;
                // Play follow-up from pre-fetched buffer (ready by now)
                const buf = await nextBufferPromise;
                if (buf) await playBuffer(buf);
                // Cache it in case we need it again
                audioCacheRef.current.set(`followup_${qIdx}`, buf!);

            } else if (isLastQ || newScore < 30) {
                setPhase('finished');
                toast.success('Entretien terminé ! Génération du rapport...');
                // messages state is stale here — build final history from scratch using refs
                await generateFinalReport(newScore);
            } else {
                // Advance — store pre-fetched buffer in cache for nextIdx
                const buf = await nextBufferPromise;
                if (buf) audioCacheRef.current.set(nextIdx, buf);

                await new Promise(r => setTimeout(r, 400));
                await displayQuestion(nextIdx, qs);
                prefetchAudio(nextIdx + 1, qs); // keep pipeline filled
            }

        } catch {
            toast.error('Erreur de connexion avec l\'IA');
            setPhase('active');
        }
    };

    // ═════════════════════════════════════════════════════════════════════
    // MICROPHONE (Deepgram WebSocket STT)
    // ═════════════════════════════════════════════════════════════════════

    const startMicrophone = async () => {
        if (!dgTokenRef.current) { toast.error('Micro IA indisponible, utilisez la saisie texte.'); return; }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const l = lang();
            const wsUrl = `wss://api.deepgram.com/v1/listen?model=nova-3&language=${l}&punctuate=true&interim_results=true`;
            const ws = new WebSocket(wsUrl, ['token', dgTokenRef.current]);
            wsRef.current = ws;

            ws.onopen = () => {
                const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
                const recorder = new MediaRecorder(stream, { mimeType: mime });
                mediaRecorderRef.current = recorder;
                recorder.ondataavailable = (e) => { if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) ws.send(e.data); };
                recorder.start(250);
            };
            ws.onmessage = (e) => {
                try {
                    const d = JSON.parse(e.data);
                    if (d.type === 'Results' && d.is_final) {
                        const t = d.channel?.alternatives?.[0]?.transcript ?? '';
                        if (t) setTranscript(prev => (prev + ' ' + t).trim());
                    }
                } catch { }
            };
            ws.onerror = () => toast.error('Erreur connexion service vocal.');
        } catch (err: any) {
            toast.error(err.name === 'NotAllowedError' ? 'Accès micro refusé.' : 'Impossible d\'accéder au micro.');
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
            setFillerCount(0);
            stopSpeech();
            startMicrophone();
            setIsRecording(true);
        }
    };

    // ═════════════════════════════════════════════════════════════════════
    // FINAL REPORT
    // ═════════════════════════════════════════════════════════════════════

    const generateFinalReport = async (finalScore: number) => {
        stopSpeech();
        const avgDimensions = {
            relevance: avg(dimensionsRef.current.relevance),
            structure: avg(dimensionsRef.current.structure),
            depth:     avg(dimensionsRef.current.depth),
            delivery:  avg(dimensionsRef.current.delivery),
        };
        try {
            const res = await axios.post(route('career-advisor.interview.generate-report'), {
                history:     messagesRef.current,
                jobTitle:    setupRef.current.jobTitle,
                score:       finalScore,
                dimensions:  avgDimensions,
            });
            sessionStorage.removeItem(SESSION_KEY);
            sessionStorage.setItem('interviewReport', JSON.stringify({
                ...res.data,
                client_dimensions: avgDimensions,
            }));
            window.location.href = route('career-advisor.interview.report');
        } catch {
            toast.error('Erreur durant la création du rapport');
            setPhase('active');
        }
    };

    const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 50;

    const endSessionEarly = () => {
        stopSpeech();
        if (messagesRef.current.length > 1) {
            setPhase('finished');
            generateFinalReport(score);
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
        const qs = questionsRef.current;
        const idx = currentQIdxRef.current;
        // Re-fetch audio for current question on resume
        if (qs[idx]) speakText(qs[idx]);
        prefetchAudio(idx + 1, qs);
    };

    const discardAndRestart = () => {
        sessionStorage.removeItem(SESSION_KEY);
        audioCacheRef.current.clear();
        retryCountRef.current = {};
        followUpRef.current = {};
        setMessages([]); setScore(100); setCurrentQIdx(0);
        startPrepare(setupRef.current);
    };

    // ═════════════════════════════════════════════════════════════════════
    // RENDER HELPERS
    // ═════════════════════════════════════════════════════════════════════

    const scoreColor = score >= 75 ? 'text-green-500' : score >= 50 ? 'text-amber-500' : 'text-red-500';
    const scoreBg    = score >= 75 ? 'bg-green-500'   : score >= 50 ? 'bg-amber-500'   : 'bg-red-500';
    const isEvaluating    = phase === 'evaluating';
    const aggressionLevel = parseInt(setupRef.current.aggressionLevel ?? '2');

    // ── Preparing screen ──────────────────────────────────────────────────
    if (phase === 'preparing') {
        const msgs = LOADING_MESSAGES[lang()] ?? LOADING_MESSAGES.fr;
        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title="Préparation de l'entretien" />
                <div className="h-[calc(100vh-65px)] flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
                    <div className="text-center max-w-md px-6 space-y-10">
                        <div className="relative mx-auto w-28 h-28">
                            <div className="absolute inset-0 rounded-full bg-amber-500/10 animate-ping" style={{ animationDuration: '2s' }} />
                            <div className="absolute inset-2 rounded-full bg-amber-500/10 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.3s' }} />
                            <div className="relative w-full h-full rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                            </div>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-600 dark:text-amber-500">
                            {lang() === 'en' ? 'Guidy is preparing your interview' : 'Guidy prépare votre entretien'}
                        </p>
                        <div className="h-8 flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={loadingMsgIdx}
                                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.4 }}
                                    className="text-sm text-neutral-500 dark:text-neutral-400 italic"
                                >
                                    {msgs[loadingMsgIdx % msgs.length]}
                                </motion.p>
                            </AnimatePresence>
                        </div>
                        <div className="flex justify-center gap-2">
                            {msgs.map((_, i) => (
                                <div key={i} className={cn("h-1 rounded-full transition-all duration-500",
                                    i === loadingMsgIdx % msgs.length ? "w-6 bg-amber-500" : "w-1.5 bg-neutral-200 dark:bg-neutral-800"
                                )} />
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
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-neutral-900 rounded-[3rem] border border-neutral-100 dark:border-neutral-800 shadow-2xl p-14 max-w-lg w-full text-center">
                        <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
                            <RotateCcw className="w-8 h-8 text-amber-500" />
                        </div>
                        <h2 className="text-2xl font-serif text-neutral-900 dark:text-neutral-50 mb-3">Session sauvegardée</h2>
                        <p className="text-neutral-500 text-sm leading-relaxed mb-10">
                            Entretien en cours pour <strong>{setupRef.current.jobTitle}</strong>.<br />
                            Score : <strong className={scoreColor}>{score}/100</strong>
                        </p>
                        <div className="flex flex-col gap-4">
                            <LuxuryButton variant="primary" className="w-full py-5 rounded-2xl" onClick={resumeSession}>
                                Reprendre
                            </LuxuryButton>
                            <LuxuryButton variant="ghost" className="w-full py-5 rounded-2xl text-neutral-500" onClick={discardAndRestart}>
                                Recommencer
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
                    <div className="flex items-center gap-3">
                        <div className={cn("w-2 h-2 rounded-full animate-pulse", isEvaluating ? "bg-blue-500" : "bg-amber-500")} />
                        <span className={cn("text-[10px] font-bold uppercase tracking-[0.3em]", isEvaluating ? "text-blue-500" : "text-amber-600 dark:text-amber-500")}>
                            {isEvaluating ? "Évaluation..." : phase === 'finished' ? "Rapport..." : `Q${currentQIdx + 1} / ${questions.length}`}
                        </span>
                        {aggressionLevel === 3 && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase text-red-500 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full">
                                <Flame className="w-3 h-3" /> Brutal
                            </span>
                        )}
                        {aggressionLevel === 1 && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase text-green-600 bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded-full">
                                <Heart className="w-3 h-3" /> Bienveillant
                            </span>
                        )}
                        {fillerCount > 2 && (
                            <span className="text-[9px] font-bold uppercase text-orange-500 bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded-full">
                                {fillerCount} mots parasites
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {isSpeaking && !isMuted && (
                            <div className="flex items-center gap-1.5 text-amber-500 mr-1">
                                <Volume2 className="w-4 h-4 animate-pulse" />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Guidy parle</span>
                            </div>
                        )}
                        <button onClick={() => { setShowFeedback(v => { showFeedbackRef.current = !v; return !v; }); }}
                            className={cn("inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all",
                                showFeedback ? "border-blue-300 dark:border-blue-800 text-blue-500 bg-blue-50 dark:bg-blue-950/20" : "border-neutral-200 dark:border-neutral-800 text-neutral-400")}>
                            <BookOpen className="w-3 h-3" />
                            {showFeedback ? 'Conseils ON' : 'Conseils OFF'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto w-full overflow-hidden">

                    {/* Left: Guidy avatar + score + input */}
                    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                        <div className="flex-1 bg-neutral-100 dark:bg-neutral-900 rounded-[3rem] relative shadow-2xl overflow-hidden flex flex-col border border-neutral-200 dark:border-neutral-800">
                            <div className="absolute top-8 left-8 flex items-center gap-3 z-20">
                                <div className="p-2 bg-amber-500/20 backdrop-blur-md rounded-xl">
                                    <span className="text-amber-500 text-xs font-bold">AI</span>
                                </div>
                                <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-widest">Guidy Recruiter</span>
                            </div>

                            {/* Score */}
                            {showScore && (
                                <div className="absolute top-8 right-8 z-20 flex flex-col items-end gap-1">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Score</span>
                                    <span className={cn("text-3xl font-bold tabular-nums transition-all duration-700", scoreColor)}>{score}</span>
                                    <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                        <div className={cn("h-full rounded-full transition-all duration-700", scoreBg)} style={{ width: `${score}%` }} />
                                    </div>
                                </div>
                            )}

                            {/* Avatar orb */}
                            <div className="flex-1 flex items-center justify-center">
                                <div className="relative">
                                    <div className={cn("w-40 h-40 rounded-full border flex items-center justify-center transition-all duration-700",
                                        isEvaluating ? "border-blue-500/50 scale-110" : isSpeaking && !isMuted ? "border-green-500/50 scale-105" : "border-amber-500/20")}>
                                        <div className={cn("w-32 h-32 rounded-full border flex items-center justify-center",
                                            isEvaluating ? "animate-pulse border-blue-500/40" : isSpeaking && !isMuted ? "animate-pulse border-green-500/40" : "border-amber-500/20")}>
                                            <div className={cn("w-24 h-24 rounded-full flex items-center justify-center",
                                                isEvaluating ? "bg-blue-500/10" : isSpeaking && !isMuted ? "bg-green-500/10" : "bg-amber-500/5")}>
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

                            <div className="p-8 bg-gradient-to-t from-neutral-200/80 dark:from-black/80 to-transparent">
                                <p className="text-sm font-light italic text-neutral-500 dark:text-amber-500/50">
                                    {isEvaluating ? "Guidy analyse votre réponse..." : isSpeaking && !isMuted ? "Guidy parle..." : "En attente de votre réponse..."}
                                </p>
                            </div>
                        </div>

                        {/* Text input */}
                        <form onSubmit={handleTextSubmit} className="flex gap-3 items-center bg-white dark:bg-neutral-900 rounded-[2rem] p-2 border border-neutral-200 dark:border-neutral-800 shadow-xl">
                            <input type="text" value={textInput} onChange={e => setTextInput(e.target.value)}
                                disabled={isEvaluating || isRecording || phase === 'finished'}
                                placeholder={isRecording ? "Désactivez le micro pour écrire..." : "Tapez votre réponse ici..."}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 text-neutral-700 dark:text-neutral-300 placeholder:text-neutral-400"
                            />
                            <LuxuryButton type="submit" disabled={isEvaluating || isRecording || !textInput.trim() || phase === 'finished'}
                                className="w-12 h-12 rounded-full p-0 flex items-center justify-center bg-amber-500 text-white hover:bg-amber-600 shrink-0">
                                <Send className="w-5 h-5 ml-1" />
                            </LuxuryButton>
                        </form>
                    </div>

                    {/* Right: Transcript + controls */}
                    <div className="w-full lg:w-[450px] flex flex-col gap-4 overflow-hidden">
                        <div className="flex-1 bg-white dark:bg-neutral-900 rounded-[3rem] border border-neutral-100 dark:border-neutral-800 shadow-2xl flex flex-col overflow-hidden">

                            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center shrink-0">
                                <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">Transcription</h3>
                                <button onClick={() => setShowScore(v => !v)} className="text-[9px] font-bold text-neutral-400 hover:text-amber-500 transition-colors flex items-center gap-1">
                                    {showScore ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                    Score
                                </button>
                            </div>

                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-hide">
                                <AnimatePresence initial={false}>
                                    {messages.map((msg, idx) => (
                                        <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                            <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 inline-flex items-center gap-1">
                                                {msg.role === 'user'      ? 'Vous'
                                                : msg.role === 'feedback' ? <><BookOpen className="w-2.5 h-2.5" /> Conseil</>
                                                : msg.role === 'follow_up'? 'Précision demandée'
                                                : 'Recruteur'}
                                            </span>
                                            <div className={cn(
                                                "max-w-[92%] p-5 text-sm leading-relaxed",
                                                msg.role === 'user'
                                                    ? "bg-amber-500 text-white rounded-[2rem] rounded-tr-none shadow-xl shadow-amber-500/20"
                                                : msg.role === 'feedback'
                                                    ? "bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 rounded-[2rem] rounded-tl-none border border-blue-100/50 text-xs italic"
                                                : msg.role === 'follow_up'
                                                    ? "bg-orange-50 dark:bg-orange-950/20 text-orange-800 dark:text-orange-300 rounded-[2rem] rounded-tl-none border border-orange-200/50 dark:border-orange-800/30"
                                                    : "bg-amber-50 dark:bg-amber-950/30 text-neutral-700 dark:text-neutral-300 rounded-[2rem] rounded-tl-none border border-amber-100/50 dark:border-amber-900/20"
                                            )}>
                                                {msg.content}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {(isRecording || transcript) && (
                                    <div className="flex flex-col items-end">
                                        <div className="bg-neutral-100 dark:bg-neutral-800/50 p-5 rounded-[2rem] rounded-tr-none border border-dashed border-neutral-300 dark:border-neutral-700 max-w-[92%]">
                                            <p className="text-sm text-neutral-600 dark:text-neutral-300">
                                                {transcript || <span className="text-neutral-400 italic">Écoute en cours...</span>}
                                            </p>
                                        </div>
                                    </div>
                                )}

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
                                <LuxuryButton variant="ghost"
                                    className="w-12 h-12 rounded-full p-0 flex items-center justify-center hover:border-red-400 hover:bg-red-50"
                                    onClick={endSessionEarly} disabled={phase === 'finished'}>
                                    <Square className="w-4 h-4 text-red-500 fill-current" />
                                </LuxuryButton>

                                <LuxuryButton variant="primary"
                                    className={cn("w-20 h-20 rounded-full p-0 flex items-center justify-center shadow-2xl transition-all duration-500",
                                        isRecording ? "bg-amber-600 shadow-amber-600/50 scale-110" : "shadow-amber-500/40",
                                        (isEvaluating || phase === 'finished') && "opacity-50 cursor-not-allowed grayscale")}
                                    onClick={toggleRecording} disabled={isEvaluating || phase === 'finished'}>
                                    {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                                </LuxuryButton>

                                <LuxuryButton variant="ghost" onClick={toggleMute}
                                    className={cn("w-12 h-12 rounded-full p-0 flex items-center justify-center", isMuted && "text-red-500 bg-red-500/10")}>
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
