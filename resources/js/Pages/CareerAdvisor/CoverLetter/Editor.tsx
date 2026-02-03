import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { useAIStream } from '@/hooks/useAIStream';
import { LuxuryButton } from '@/Components/ui/luxury/Button';
import { LuxuryCard } from '@/Components/ui/luxury/Card';
import { luxuryTheme } from '@/design-system/luxury-theme';
import { Loader, Sparkles, Send, FileText, Target, Zap, ArrowRight, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LivePreview from '@/Components/ai/immersive/cover-letter/LivePreview';
import ATSScoreLive from '@/Components/ai/immersive/cover-letter/ATSScoreLive';
import { cn } from "@/lib/utils";

export default function CoverLetterEditor({ auth }) {
    const [sections, setSections] = useState({
        greeting: '',
        intro: '',
        body: '',
        conclusion: ''
    });

    const [context, setContext] = useState({
        name: auth.user.name,
        company: '',
        jobTitle: '',
        skills: []
    });

    const { stream, isStreaming } = useAIStream();

    const generateSection = async (sectionName) => {
        await stream(route('career-advisor.cover-letter.generate'), {
            section: sectionName,
            context: context
        }, {
            onChunk: (chunk) => {
                setSections(prev => ({
                    ...prev,
                    [sectionName]: prev[sectionName] + chunk
                }));
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Strategic Composer" />

            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-20 px-6 sm:px-10 relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                        <div>
                            <p className="text-[10px] text-neutral-400 uppercase tracking-[0.4em] font-bold mb-4">Strategic Content Studio</p>
                            <h1 className="text-5xl md:text-6xl font-serif text-neutral-900 dark:text-neutral-50 tracking-tight leading-tight">
                                Narrative <span className="italic font-normal">Synthesis</span>
                            </h1>
                        </div>
                        <div className="flex gap-4">
                            <LuxuryButton variant="ghost" className="rounded-full px-8 border-neutral-200 dark:border-neutral-800">
                                <Save className="w-4 h-4 mr-3" /> Save Draft
                            </LuxuryButton>
                            <LuxuryButton variant="primary" className="rounded-full px-10">
                                Export Document <ArrowRight className="w-4 h-4 ml-3" />
                            </LuxuryButton>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                        {/* Editor Column */}
                        <div className="space-y-12">
                            <div className="bg-white dark:bg-neutral-900 p-12 rounded-[3.5rem] border border-neutral-100 dark:border-neutral-800 shadow-xl">
                                <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                                    <Target className="w-4 h-4 text-neutral-900 dark:text-neutral-50" /> Intelligence Context
                                </h3>
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest pl-1">Target Institution</label>
                                        <Input
                                            placeholder="e.g. McKinsey & Company"
                                            className="h-14 text-xl font-serif bg-transparent border-b border-neutral-100 dark:border-neutral-800 rounded-none px-0 focus-visible:ring-0 focus-visible:border-neutral-900 dark:focus-visible:border-neutral-50 transition-all"
                                            value={context.company}
                                            onChange={e => setContext({ ...context, company: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest pl-1">Position Vertical</label>
                                        <Input
                                            placeholder="Senior Strategy Consultant"
                                            className="h-14 text-xl font-serif bg-transparent border-b border-neutral-100 dark:border-neutral-800 rounded-none px-0 focus-visible:ring-0 focus-visible:border-neutral-900 dark:focus-visible:border-neutral-50 transition-all"
                                            value={context.jobTitle}
                                            onChange={e => setContext({ ...context, jobTitle: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sections */}
                            <div className="space-y-8">
                                {Object.keys(sections).map((section, idx) => (
                                    <motion.div
                                        key={section}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-white dark:bg-neutral-900 p-12 rounded-[3.5rem] border border-neutral-100 dark:border-neutral-800 shadow-xl group hover:border-neutral-200 dark:hover:border-neutral-700 transition-all duration-500"
                                    >
                                        <div className="flex justify-between items-center mb-10">
                                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">
                                                {section} architecture
                                            </label>
                                            <LuxuryButton
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => generateSection(section)}
                                                disabled={isStreaming}
                                                className="h-10 rounded-full px-6 border-neutral-100 dark:border-neutral-800 text-[9px] font-bold uppercase tracking-widest"
                                            >
                                                {isStreaming ? <Loader className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 mr-2 text-neutral-900 dark:text-neutral-50" />}
                                                Orchestrate
                                            </LuxuryButton>
                                        </div>
                                        <Textarea
                                            value={sections[section]}
                                            onChange={e => setSections({ ...sections, [section]: e.target.value })}
                                            className="w-full min-h-[150px] text-lg font-serif bg-transparent border-none p-0 focus-visible:ring-0 placeholder:text-neutral-100 dark:placeholder:text-neutral-800 text-neutral-700 dark:text-neutral-300 leading-relaxed resize-none"
                                            placeholder={`Compose your ${section}...`}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Preview Column */}
                        <div className="lg:sticky lg:top-20 space-y-10">
                            <ATSScoreLive
                                content={Object.values(sections).join('\n\n')}
                                jobDescription={context.jobTitle}
                            />
                            <div className="bg-white dark:bg-neutral-900 rounded-[3.5rem] border border-neutral-100 dark:border-neutral-800 shadow-2xl overflow-hidden aspect-[1/1.4] relative">
                                <div className="absolute top-8 left-8 flex items-center gap-3 z-20">
                                    <div className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-neutral-50 animate-pulse" />
                                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.3em]">Real-time rendering</span>
                                </div>
                                <div className="h-full pt-20 pb-10 px-4">
                                    <LivePreview content={sections} context={context} />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
