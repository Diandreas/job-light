import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { LuxuryButton } from '@/Components/ui/luxury/Button';
import { luxuryTheme } from '@/design-system/luxury-theme';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Square, Play, RotateCcw, User, Brain, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';

import { cn } from "@/lib/utils";

// Mock Web Speech API for now if not compatible
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function Session({ auth }) {
    const { t } = useTranslation();
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isAiTyping, setIsAiTyping] = useState(true);
    const [messages, setMessages] = useState<Array<{role: string; content: string}>>([]);
    const [setupData, setSetupData] = useState<any>({});
    const [isMuted, setIsMuted] = useState(false);
    
    const isMutedRef = useRef(false);
    const recognitionRef = useRef<any>(null);
    const scrollRef = useRef<any>(null);

    const toggleMute = () => {
        isMutedRef.current = !isMutedRef.current;
        setIsMuted(isMutedRef.current);
        if (isMutedRef.current && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    };

    const speakText = (text: string) => {
        if (isMutedRef.current || !('speechSynthesis' in window)) return;
        
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        
        const voices = window.speechSynthesis.getVoices();
        const frVoice = voices.find(v => v.lang.startsWith('fr') && (v.name.includes('Google') || v.name.includes('Microsoft'))) || voices.find(v => v.lang.startsWith('fr'));
        if (frVoice) utterance.voice = frVoice;
        
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        // Initialize Voices (sometimes takes a tick to load)
        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
        }

        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            recognitionRef.current?.stop();
        };
    }, []);

    useEffect(() => {
        // Parse setup query params
        const params = new URLSearchParams(window.location.search);
        const data: any = {};
        for(let [key, value] of params.entries()) {
            data[key] = value;
        }
        setSetupData(data);

        // Start Session
        startInterviewSession(data);

        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'fr-FR'; // Assuming French for this part since Mistral returns FR

            recognition.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                if (finalTranscript) {
                    setTranscript(prev => (prev + ' ' + finalTranscript).trim());
                }
            };
            recognitionRef.current = recognition;
        }
    }, []);

    const startInterviewSession = async (data: any) => {
        try {
            setIsAiTyping(true);
            const res = await axios.post(route('career-advisor.interview.start'), data);
            const question = res.data.data.next_question;
            setMessages([{ role: 'assistant', content: question }]);
            speakText(question);
        } catch (error) {
            toast.error("Impossible de lancer l'entretien");
        } finally {
            setIsAiTyping(false);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, transcript, isAiTyping]);

    const toggleRecording = () => {
        if (isAiTyping) {
            toast("L'IA est en train de réfléchir...");
            return;
        }

        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
            if (transcript.trim()) {
                handleAnswerSubmit(transcript.trim());
            } else {
                toast.error("Aucune voix détectée");
            }
        } else {
            setTranscript('');
            recognitionRef.current?.start();
            setIsRecording(true);
        }
    };

    const handleAnswerSubmit = async (userAnswer: string) => {
        setTranscript('');
        if (!userAnswer) return;

        // Cancel speech if user interrupts by sending an answer
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        const newMessages = [...messages, { role: 'user', content: userAnswer }];
        setMessages(newMessages);
        setIsAiTyping(true);

        try {
            const res = await axios.post(route('career-advisor.interview.respond'), {
                history: newMessages,
                jobTitle: setupData.jobTitle,
                duration: setupData.duration
            });

            const data = res.data;
            const updatedMessages = [...newMessages];
            let textToSpeak = "";

            if (data.feedback && data.feedback.trim() !== '') {
                updatedMessages.push({ role: 'assistant', content: "💭 " + data.feedback });
                textToSpeak += data.feedback + ". ";
            }
            if (data.next_question && data.next_question.trim() !== '') {
                updatedMessages.push({ role: 'assistant', content: data.next_question });
                textToSpeak += data.next_question;
            }

            setMessages(updatedMessages);
            if (textToSpeak) {
                speakText(textToSpeak);
            }

            if (data.is_finished) {
                toast.success("Entretien terminé ! Génération du rapport...");
                generateFinalReport(updatedMessages);
            }
        } catch (error) {
            toast.error("Erreur de connexion avec l'IA");
        } finally {
            setIsAiTyping(false);
        }
    };

    const generateFinalReport = async (finalMessages: any[]) => {
        setIsAiTyping(true);
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        try {
            const res = await axios.post(route('career-advisor.interview.generate-report'), {
                history: finalMessages,
                jobTitle: setupData.jobTitle
            });

            sessionStorage.setItem('interviewReport', JSON.stringify(res.data));
            window.location.href = route('career-advisor.interview.report');
        } catch (error) {
            toast.error("Erreur durant la création du rapport");
            setIsAiTyping(false);
        }
    };

    const endSessionEarly = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        if (messages.length > 2) {
            generateFinalReport(messages);
        } else {
            window.location.href = route('career-advisor.interview.setup');
        }
    };

    // Helper text simulation for those without mic (easier testing)
    const simulateTextSubmit = () => {
        const text = prompt("Simuler votre réponse vocale (Texte) :");
        if (text) handleAnswerSubmit(text);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={t('career_advisor.services.interview_prep.enhanced_title')} />

            <div className="h-[calc(100vh-65px)] flex flex-col bg-neutral-50 dark:bg-neutral-950 p-6 sm:p-10 relative overflow-hidden">
                {/* Status Bar */}
                <div className="flex justify-between items-center mb-8 px-4">
                    <div className="flex items-center gap-4">
                        <div className={cn("w-2 h-2 rounded-full animate-pulse", isAiTyping ? "bg-blue-500" : "bg-amber-500")} />
                        <span className={cn("text-[10px] font-bold uppercase tracking-[0.3em]", isAiTyping ? "text-blue-500" : "text-amber-600 dark:text-amber-500")}>
                            {isAiTyping ? "Processing..." : t('career_advisor.interview.session.active')}
                        </span>
                    </div>
                </div>

                <div className="flex-1 flex flex-col lg:flex-row gap-10 max-w-7xl mx-auto w-full overflow-hidden">

                    {/* Left: AI Interface */}
                    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                        <div className="flex-1 bg-neutral-900 rounded-[3rem] relative shadow-2xl overflow-hidden flex flex-col border border-neutral-800">
                            <div className="absolute top-8 left-8 flex items-center gap-3 z-20">
                                <div className="p-2 bg-amber-500/20 backdrop-blur-md rounded-xl">
                                    <Brain className="w-5 h-5 text-amber-500" />
                                </div>
                                <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">{t('career_advisor.interview.session.cognitive_engine')}</span>
                            </div>

                            <div className="flex-1 flex items-center justify-center relative">
                                {/* Visualizer Placeholder */}
                                <div className="relative">
                                    <div className={cn("w-40 h-40 rounded-full border border-amber-500/20 flex items-center justify-center transition-all duration-1000", isAiTyping && "scale-110 border-blue-500/40")}>
                                        <div className={cn("w-32 h-32 rounded-full border border-amber-500/30 flex items-center justify-center", !isAiTyping && "animate-spin-slow", isAiTyping && "animate-pulse border-blue-500/50")}>
                                            <div className={cn("w-24 h-24 rounded-full flex items-center justify-center", isAiTyping ? "bg-blue-500/10" : "bg-amber-500/5")}>
                                                {isAiTyping ? <Loader2 className="w-8 h-8 text-blue-500 animate-spin" /> : <Volume2 className="w-8 h-8 text-amber-500 opacity-20" />}
                                            </div>
                                        </div>
                                    </div>
                                    {isRecording && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-48 h-48 rounded-full border border-amber-500/20 animate-ping" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-10 bg-gradient-to-t from-black/80 to-transparent">
                                <div className="flex items-center gap-4 text-amber-500/60">
                                    <div className={cn("w-1 h-1 rounded-full", isAiTyping ? "bg-blue-500" : "bg-amber-500")} />
                                    <p className="text-sm font-light italic opacity-60">
                                        {isAiTyping ? "Guidy analyse vos réponses..." : t('career_advisor.interview.session.architecting')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-4">
                            <LuxuryButton onClick={simulateTextSubmit} disabled={isAiTyping} variant="ghost" className="flex-1 h-14 text-xs tracking-widest uppercase font-bold border-neutral-200 dark:border-neutral-800">
                                Simuler Texte (sans micro)
                            </LuxuryButton>
                        </div>
                    </div>

                    {/* Right: Transcript & Controls */}
                    <div className="w-full lg:w-[450px] flex flex-col gap-6 overflow-hidden">
                        <div className="flex-1 bg-white dark:bg-neutral-900 rounded-[3rem] border border-neutral-100 dark:border-neutral-800 shadow-2xl flex flex-col overflow-hidden">
                            <div className="p-8 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
                                <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">{t('career_advisor.interview.session.transcription')}</h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">{t('career_advisor.interview.session.active_status')}</span>
                                </div>
                            </div>

                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                                {messages.map((msg, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest">
                                                {msg.role === 'user' ? t('career_advisor.interview.session.you') : t('career_advisor.interview.session.advisor')}
                                            </span>
                                        </div>
                                        <div className={cn(
                                            "max-w-[90%] p-6 text-sm leading-relaxed",
                                            msg.role === 'user'
                                                ? "bg-amber-500 text-white rounded-[2rem] rounded-tr-none shadow-xl shadow-amber-500/20"
                                                : msg.content.startsWith("💭") 
                                                    ? "bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 rounded-[2rem] rounded-tl-none border border-blue-100/50 italic text-xs" 
                                                    : "bg-amber-50 dark:bg-amber-950/30 text-neutral-600 dark:text-neutral-300 rounded-[2rem] rounded-tl-none border border-amber-100/50 dark:border-amber-900/20"
                                        )}>
                                            {msg.content}
                                        </div>
                                    </motion.div>
                                ))}
                                {(isRecording || transcript) && (
                                    <div className="flex flex-col items-end">
                                        <div className="bg-neutral-100 dark:bg-neutral-800/50 p-6 rounded-[2rem] rounded-tr-none border border-dashed border-neutral-300 dark:border-neutral-700 max-w-[90%]">
                                            <p className="text-sm text-neutral-600 dark:text-neutral-300">
                                                {transcript || <span className="text-neutral-400 italic">Écoute en cours...</span>}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {isAiTyping && (
                                     <motion.div
                                     initial={{ opacity: 0, scale: 0.9 }}
                                     animate={{ opacity: 1, scale: 1 }}
                                     className="flex flex-col items-start"
                                 >
                                     <div className="bg-amber-50 dark:bg-amber-950/30 text-neutral-600 dark:text-neutral-400 rounded-[2rem] rounded-tl-none border border-amber-100/50 dark:border-amber-900/20 p-5 flex gap-2">
                                         <span className="animate-bounce">.</span>
                                         <span className="animate-bounce" style={{animationDelay: "0.2s"}}>.</span>
                                         <span className="animate-bounce" style={{animationDelay: "0.4s"}}>.</span>
                                     </div>
                                 </motion.div>
                                )}
                            </div>

                            {/* Global Controls */}
                            <div className="p-8 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-6">
                                <LuxuryButton
                                    variant="ghost"
                                    className="w-14 h-14 rounded-full p-0 flex items-center justify-center border-neutral-100 dark:border-neutral-800 hover:border-red-500 hover:bg-red-500/10 group"
                                    onClick={endSessionEarly}
                                >
                                    <Square className="w-4 h-4 text-red-500 fill-current group-hover:scale-95 transition-transform" />
                                </LuxuryButton>

                                <LuxuryButton
                                    variant="primary"
                                    className={cn(
                                        "w-20 h-20 rounded-full p-0 flex items-center justify-center shadow-2xl transition-all duration-700",
                                        isRecording ? "bg-amber-600 shadow-amber-600/50 scale-110" : "shadow-amber-500/40",
                                        isAiTyping && "opacity-50 cursor-not-allowed grayscale"
                                    )}
                                    onClick={toggleRecording}
                                    disabled={isAiTyping}
                                >
                                    {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                                </LuxuryButton>

                                <LuxuryButton
                                    variant="ghost"
                                    onClick={toggleMute}
                                    className={cn(
                                        "w-14 h-14 rounded-full p-0 flex items-center justify-center border-neutral-100 dark:border-neutral-800",
                                        isMuted && "text-red-500 bg-red-500/10"
                                    )}
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
