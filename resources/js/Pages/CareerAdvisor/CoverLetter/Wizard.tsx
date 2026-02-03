import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Label } from "@/Components/ui/label";
import { LuxuryButton } from '@/Components/ui/luxury/Button';
import { luxuryTheme } from '@/design-system/luxury-theme';
import { ArrowRight, CheckCircle2, Briefcase, Target, Zap, Clock, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

const StepIndicator = ({ current, total }) => (
    <div className="flex justify-center items-center gap-6 mb-20">
        {[...Array(total)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-3">
                    <div
                        className={cn(
                            "h-1.5 rounded-full transition-all duration-700",
                            i === current ? "bg-neutral-900 dark:bg-neutral-50 w-12" :
                                i < current ? "bg-neutral-400 dark:bg-neutral-600 w-6" : "bg-neutral-200 dark:bg-neutral-800 w-6"
                        )}
                    />
                </div>
            </div>
        ))}
    </div>
);

export default function Wizard({ auth }) {
    const [step, setStep] = useState(0);
    const [data, setData] = useState({
        company: '',
        jobTitle: '',
        jobDescription: '',
        recipient: '',
        skills: '',
        tone: 'professional',
        key_points: ''
    });

    const STEPS = [
        { title: 'Foundations', subtitle: 'Target Details' },
        { title: 'Intelligence', subtitle: 'Company Context' },
        { title: 'Vibe', subtitle: 'Strategic Tone' },
        { title: 'Refinement', subtitle: 'Final Nuances' }
    ];

    const nextStep = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };

    const prevStep = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    const handleSubmit = () => {
        const url = route('career-advisor.cover-letter.studio', {
            _query: data
        });
        router.visit(url);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Concierge" />

            <div className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-6 sm:p-10 relative overflow-hidden">

                {/* Background Decorations */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-neutral-200/20 dark:bg-neutral-800/20 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-neutral-200/20 dark:bg-neutral-800/20 blur-[120px] rounded-full" />
                </div>

                <div className="w-full max-w-2xl mx-auto relative z-10">
                    {/* Header */}
                    <div className="text-center mb-16 space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 bg-neutral-900 dark:bg-neutral-50 rounded-full text-[10px] font-bold text-white dark:text-neutral-900 uppercase tracking-[0.3em] mb-4 shadow-xl"
                        >
                            <Zap className="w-3 h-3" />
                            <span>Premium Concierge</span>
                        </motion.div>
                        <h1 className="text-5xl md:text-6xl font-serif text-neutral-900 dark:text-neutral-50 tracking-tight leading-tight">
                            {STEPS[step].title} <span className="italic font-normal">Analysis</span>
                        </h1>
                        <p className="text-neutral-500 font-light text-lg tracking-tight">
                            {STEPS[step].subtitle} • Stage {step + 1} of 4
                        </p>
                    </div>

                    <StepIndicator current={step} total={4} />

                    {/* Content Area */}
                    <div className="min-h-[450px] bg-white dark:bg-neutral-900 rounded-[3rem] p-10 md:p-16 border border-neutral-100 dark:border-neutral-800 shadow-2xl relative overflow-hidden mb-12">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.5, ease: luxuryTheme.animations.easings.elegant }}
                                className="h-full"
                            >
                                {step === 0 && (
                                    <div className="space-y-12">
                                        <div className="space-y-10">
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">Target Company</Label>
                                                <Input
                                                    className="w-full h-20 text-3xl font-serif bg-transparent border-none p-0 focus-visible:ring-0 placeholder:text-neutral-100 dark:placeholder:text-neutral-800 text-neutral-900 dark:text-neutral-50 transition-all"
                                                    placeholder="e.g. Goldman Sachs"
                                                    value={data.company}
                                                    onChange={e => setData({ ...data, company: e.target.value })}
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">Vertical / Job Title</Label>
                                                <Input
                                                    className="w-full h-20 text-3xl font-serif bg-transparent border-none p-0 focus-visible:ring-0 placeholder:text-neutral-100 dark:placeholder:text-neutral-800 text-neutral-900 dark:text-neutral-50 transition-all"
                                                    placeholder="Investment Analyst"
                                                    value={data.jobTitle}
                                                    onChange={e => setData({ ...data, jobTitle: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">Attention Of (Optional)</Label>
                                                <Input
                                                    className="w-full h-20 text-3xl font-serif bg-transparent border-none p-0 focus-visible:ring-0 placeholder:text-neutral-100 dark:placeholder:text-neutral-800 text-neutral-900 dark:text-neutral-50 transition-all"
                                                    placeholder="Hiring Committee"
                                                    value={data.recipient}
                                                    onChange={e => setData({ ...data, recipient: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 1 && (
                                    <div className="space-y-8">
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-end">
                                                <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">Strategic Context</Label>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1 h-1 bg-neutral-900 dark:bg-neutral-50 rounded-full animate-pulse" />
                                                    <span className="text-[9px] font-bold text-neutral-900 dark:text-neutral-50 uppercase tracking-widest">ATS Ready</span>
                                                </div>
                                            </div>
                                            <Textarea
                                                className="w-full min-h-[350px] text-lg font-light leading-relaxed bg-neutral-50 dark:bg-neutral-950/50 border-none rounded-[2rem] p-10 focus-visible:ring-1 focus-visible:ring-neutral-200 dark:focus-visible:ring-neutral-800 placeholder:text-neutral-300 dark:placeholder:text-neutral-700 resize-none transition-all"
                                                placeholder="Paste the job description for deep vector analysis..."
                                                value={data.jobDescription}
                                                onChange={e => setData({ ...data, jobDescription: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-12">
                                        <div className="space-y-8">
                                            <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">Strategic Tone</Label>
                                            <div className="grid grid-cols-2 gap-6">
                                                {['Professional', 'Creative', 'Confident', 'Humble'].map((tone) => (
                                                    <button
                                                        key={tone}
                                                        onClick={() => setData({ ...data, tone: tone.toLowerCase() })}
                                                        className={cn(
                                                            "h-24 flex items-center justify-center text-sm font-bold uppercase tracking-[0.2em] transition-all rounded-[1.5rem] border-2",
                                                            data.tone === tone.toLowerCase()
                                                                ? "border-neutral-900 dark:border-neutral-50 bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 shadow-xl scale-[1.02]"
                                                                : "border-neutral-100 dark:border-neutral-800 text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700"
                                                        )}
                                                    >
                                                        {tone}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">Priority Expertise</Label>
                                            <Textarea
                                                className="w-full h-32 text-lg font-serif bg-transparent border-b-2 border-neutral-100 dark:border-neutral-800 rounded-none p-0 focus-visible:ring-0 placeholder:text-neutral-200 resize-none transition-all"
                                                placeholder="React, Architecture, Governance..."
                                                value={data.skills}
                                                onChange={e => setData({ ...data, skills: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-10">
                                        <div className="space-y-6">
                                            <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">Exclusive Nuances</Label>
                                            <p className="text-neutral-500 font-light leading-relaxed text-lg">
                                                Identify specific achievements or narratives you wish to emphasize in your professional story.
                                            </p>
                                            <Textarea
                                                className="w-full min-h-[300px] text-lg font-serif bg-neutral-50 dark:bg-neutral-950/50 border-none rounded-[2rem] p-10 focus-visible:ring-1 focus-visible:ring-neutral-200 dark:focus-visible:ring-neutral-800 placeholder:text-neutral-300 dark:placeholder:text-neutral-700 resize-none transition-all"
                                                placeholder="e.g. Orchestrated a $50M transition..."
                                                value={data.key_points}
                                                onChange={e => setData({ ...data, key_points: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center px-4">
                        <LuxuryButton
                            variant="ghost"
                            onClick={prevStep}
                            disabled={step === 0}
                            className="h-14 px-8 text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity disabled:opacity-0"
                        >
                            Retrospective
                        </LuxuryButton>
                        <LuxuryButton
                            variant="primary"
                            className="h-16 px-12 text-[10px] font-bold uppercase tracking-[0.3em] shadow-2xl group"
                            onClick={nextStep}
                        >
                            {step === 3 ? 'Generate Strategy' : 'Evolution'}
                            {step === 3 ? <CheckCircle2 className="ml-4 w-4 h-4" /> : <ArrowRight className="ml-4 w-4 h-4 group-hover:translate-x-2 transition-transform" />}
                        </LuxuryButton>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
