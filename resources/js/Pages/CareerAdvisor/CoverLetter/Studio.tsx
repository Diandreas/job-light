import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { LuxuryButton } from '@/Components/ui/luxury/Button';
import { LuxuryCard } from '@/Components/ui/luxury/Card';
import { ScrollArea } from "@/Components/ui/scroll-area";
import RichEditor from '@/Components/ai/immersive/cover-letter/RichEditor';
import { useAIStream } from '@/hooks/useAIStream';
import { Sparkles, Download, ArrowLeft, RefreshCw, Wand2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Studio({ auth }) {
    // Get query params from Inertia (passed from Wizard)
    const { url } = usePage();
    const queryParams = new URLSearchParams(url.split('?')[1]);

    const [context, setContext] = useState({
        company: queryParams.get('company') || '',
        jobTitle: queryParams.get('jobTitle') || '',
        jobDescription: queryParams.get('jobDescription') || '',
        recipient: queryParams.get('recipient') || '',
        skills: queryParams.get('skills') ? queryParams.get('skills').split(',') : [],
        tone: queryParams.get('tone') || 'professional',
        key_points: queryParams.get('key_points') || ''
    });

    const [content, setContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const { stream } = useAIStream();

    // Auto-generate on first load if context exists
    useEffect(() => {
        if (context.company && !content) {
            handleFullGeneration();
        }
    }, []);

    const handleFullGeneration = async () => {
        setIsGenerating(true);
        let accumulated = '';
        const toastId = toast.loading('Consulting AI Career Coach...');

        try {
            // We'll generate the active letter structure in one go for the editor
            // In a real app, you might want to stream specific HTML structure
            await stream(route('career-advisor.cover-letter.generate'), {
                section: 'full_letter', // Special flag for full generation
                context: context
            }, {
                onChunk: (chunk) => {
                    accumulated += chunk;
                    // Simple conversion of newlines to HTML breaks for basic streaming
                    // Tiptap prefers HTML. We'll wrap in paragraphs if raw text comes in.
                    setContent(accumulated.replace(/\n/g, '<br/>'));
                },
                onComplete: () => {
                    toast.success('Draft generated!', { id: toastId });
                    setIsGenerating(false);
                },
                onError: () => {
                    toast.error('Failed to generate draft', { id: toastId });
                    setIsGenerating(false);
                }
            });
        } catch (e) {
            setIsGenerating(false);
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Cover Letter Studio" />

            <div className="h-[calc(100vh-65px)] flex bg-neutral-50 dark:bg-neutral-950 overflow-hidden">

                {/* Left Sidebar - AI Controls */}
                <div className="w-80 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col z-20 shadow-sm">
                    <div className="p-8 border-b border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center gap-3 text-neutral-900 dark:text-neutral-50 font-semibold mb-2">
                            <Sparkles className="w-5 h-5" /> AI Assistant
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-500">Refine your letter with AI</p>
                    </div>

                    <div className="flex-1 p-8 space-y-8 overflow-y-auto">
                        {/* Context Summary */}
                        <div className="space-y-6 mb-8">
                            <div className="space-y-1">
                                <span className="text-[10px] text-neutral-400 uppercase tracking-widest block font-bold">Target Role</span>
                                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 line-clamp-2">
                                    {context.jobTitle || 'Job Role'} @ {context.company || 'Organization'}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] text-neutral-400 uppercase tracking-widest block font-bold">Styling Opts</span>
                                <span className="inline-block px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold text-neutral-600 dark:text-neutral-300 uppercase letter-spacing-widest">
                                    {context.tone}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em]">Coach Assistance</h3>

                            <LuxuryButton variant="ghost" className="w-full justify-start text-xs h-11 border-neutral-100 dark:border-neutral-800" onClick={handleFullGeneration} disabled={isGenerating}>
                                <RefreshCw className={`w-3.5 h-3.5 mr-3 ${isGenerating ? 'animate-spin' : ''}`} />
                                Regenerate Entire Draft
                            </LuxuryButton>

                            <LuxuryButton variant="ghost" className="w-full justify-start text-xs h-11 border-neutral-100 dark:border-neutral-800">
                                <Wand2 className="w-3.5 h-3.5 mr-3" />
                                Elevate Professionalism
                            </LuxuryButton>

                            <LuxuryButton variant="ghost" className="w-full justify-start text-xs h-11 border-neutral-100 dark:border-neutral-800">
                                <Wand2 className="w-3.5 h-3.5 mr-3" />
                                Conciseness Refinement
                            </LuxuryButton>
                        </div>
                    </div>
                </div>

                {/* Main Editor Area */}
                <div className="flex-1 flex flex-col relative">
                    {/* Top Bar */}
                    <header className="h-20 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-10">
                        <div className="flex items-center gap-6">
                            <LuxuryButton variant="ghost" size="sm" onClick={() => window.history.back()} className="rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </LuxuryButton>
                            <div>
                                <h1 className="font-semibold text-neutral-900 dark:text-neutral-50 text-lg tracking-tight">Untitled Application</h1>
                                <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-0.5">Cover Letter Studio</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <span className="text-xs text-neutral-400 italic">Autosaved just now</span>
                            <LuxuryButton variant="primary" className="px-6">
                                <Download className="w-4 h-4 mr-2" /> Export PDF
                            </LuxuryButton>
                        </div>
                    </header>

                    {/* Editor Canvas */}
                    <div className="flex-1 overflow-y-auto bg-neutral-100/50 dark:bg-neutral-950 p-12 flex justify-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="w-full max-w-[210mm] min-h-[297mm] bg-white dark:bg-neutral-900 shadow-xl border border-neutral-200/50 dark:border-neutral-800/50 p-16"
                        >
                            <RichEditor
                                content={content}
                                onChange={setContent}
                            />
                        </motion.div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
