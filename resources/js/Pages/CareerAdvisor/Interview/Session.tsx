import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { LuxuryButton } from '@/Components/ui/luxury/Button';
import { luxuryTheme } from '@/design-system/luxury-theme';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Square, Play, RotateCcw, User, Brain, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from "@/lib/utils";

// Mock Web Speech API for now if not compatible
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function Session({ auth }) {
    const { t } = useTranslation();
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [messages, setMessages] = useState([
        { role: 'assistant', content: t('career_advisor.interview.session.greeting', "Hello! Thank you for joining the interview today. Could you start by introducing yourself and telling me briefly about your background?") }
    ]);
    const recognitionRef = useRef(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onresult = (event) => {
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
                    setTranscript(prev => prev + ' ' + finalTranscript);
                }
            };

            recognitionRef.current = recognition;
        }
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
            handleAnswerSubmit();
        } else {
            setTranscript('');
            recognitionRef.current?.start();
            setIsRecording(true);
        }
    };

    const handleAnswerSubmit = () => {
        if (!transcript.trim()) return;

        const newMessages = [...messages, { role: 'user', content: transcript }];
        setMessages(newMessages);

        setTimeout(() => {
            setMessages([...newMessages, {
                role: 'assistant',
                content: "That's a great background. Can you tell me about a time you faced a significant technical challenge?"
            }]);
        }, 1500);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={t('career_advisor.services.interview_prep.enhanced_title')} />

            <div className="h-[calc(100vh-65px)] flex flex-col bg-neutral-50 dark:bg-neutral-950 p-6 sm:p-10 relative overflow-hidden">
                {/* Status Bar */}
                <div className="flex justify-between items-center mb-8 px-4">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-[0.3em]">{t('career_advisor.interview.session.active')}</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-amber-500/60 uppercase tracking-widest font-bold">{t('career_advisor.interview.setup.latency')}</span>
                            <span className="text-xs font-medium text-amber-600 dark:text-amber-500">24ms</span>
                        </div>
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
                                    <div className="w-40 h-40 rounded-full border border-amber-500/20 flex items-center justify-center">
                                        <div className="w-32 h-32 rounded-full border border-amber-500/30 flex items-center justify-center animate-spin-slow">
                                            <div className="w-24 h-24 rounded-full bg-amber-500/5 flex items-center justify-center">
                                                <Volume2 className="w-8 h-8 text-amber-500 opacity-20" />
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
                                    <div className="w-1 h-1 rounded-full bg-amber-500" />
                                    <p className="text-sm font-light italic opacity-60">{t('career_advisor.interview.session.architecting')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-4">
                            <LuxuryButton variant="ghost" className="flex-1 h-14 text-xs tracking-widest uppercase font-bold border-neutral-200 dark:border-neutral-800">
                                {t('career_advisor.interview.session.clarification')}
                            </LuxuryButton>
                            <LuxuryButton variant="ghost" className="flex-1 h-14 text-xs tracking-widest uppercase font-bold border-neutral-200 dark:border-neutral-800">
                                {t('career_advisor.interview.session.break')}
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
                                                : "bg-amber-50 dark:bg-amber-950/30 text-neutral-600 dark:text-neutral-300 rounded-[2rem] rounded-tl-none border border-amber-100/50 dark:border-amber-900/20"
                                        )}>
                                            {msg.content}
                                        </div>
                                    </motion.div>
                                ))}
                                {isRecording && (
                                    <div className="flex flex-col items-end">
                                        <div className="bg-neutral-100 dark:bg-neutral-800/50 p-6 rounded-[2rem] rounded-tr-none border border-dashed border-neutral-300 dark:border-neutral-700 animate-pulse max-w-[90%]">
                                            <p className="text-sm text-neutral-400 italic">
                                                {transcript || t('career_advisor.interview.session.listening')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Global Controls */}
                            <div className="p-8 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-6">
                                <LuxuryButton
                                    variant="ghost"
                                    className="w-14 h-14 rounded-full p-0 flex items-center justify-center border-neutral-100 dark:border-neutral-800"
                                    onClick={() => window.location.href = route('career-advisor.interview.report')}
                                >
                                    <Square className="w-4 h-4 text-red-500 fill-current" />
                                </LuxuryButton>

                                <LuxuryButton
                                    variant="primary"
                                    className={cn(
                                        "w-20 h-20 rounded-full p-0 flex items-center justify-center shadow-2xl shadow-amber-500/40 transition-all duration-700",
                                        isRecording && "bg-amber-600 scale-110"
                                    )}
                                    onClick={toggleRecording}
                                >
                                    {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                                </LuxuryButton>

                                <LuxuryButton
                                    variant="ghost"
                                    className="w-14 h-14 rounded-full p-0 flex items-center justify-center border-neutral-100 dark:border-neutral-800"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                </LuxuryButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
