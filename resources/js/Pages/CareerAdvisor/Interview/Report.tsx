import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { LuxuryButton } from '@/Components/ui/luxury/Button';
import { LuxuryCard } from '@/Components/ui/luxury/Card';
import { luxuryTheme } from '@/design-system/luxury-theme';
import { CheckCircle, XCircle, ArrowRight, Share2, Download, Award, Target, Zap, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

export default function Report({ auth }) {
    // Mock Data
    const report = {
        score: 78,
        date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
        strengths: ['Clear delivery', 'Good STAR structure', 'Relevant examples'],
        weaknesses: ['Too many filler words', 'Rushed conclusion', 'Did not ask questions'],
        metrics: [
            { label: 'Elocution', value: 85 },
            { label: 'Structuring', value: 72 },
            { label: 'Confidence', value: 90 },
            { label: 'Technicality', value: 65 }
        ],
        transcript: [
            { q: 'Tell me about yourself', a: 'I am a developer...', feedback: 'Good intro but a bit long.' },
            { q: 'Technical challenge?', a: 'I fixed a bug...', feedback: 'Excellent technical depth.' }
        ]
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Performance Intelligence" />

            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-20 px-6 sm:px-10 relative overflow-hidden">
                <div className="max-w-5xl mx-auto relative z-10">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8 text-left">
                        <div>
                            <p className="text-[10px] text-neutral-400 uppercase tracking-[0.4em] font-bold mb-4">Post-Simulation Analysis</p>
                            <h1 className="text-5xl md:text-6xl font-serif text-neutral-900 dark:text-neutral-50 tracking-tight leading-tight">
                                Performance <span className="italic font-normal">Intelligence</span>
                            </h1>
                            <p className="text-neutral-500 font-light mt-4 tracking-widest text-xs uppercase">{report.date} • Session #842</p>
                        </div>
                        <div className="flex gap-4">
                            <LuxuryButton variant="ghost" className="rounded-full px-6 border-neutral-200 dark:border-neutral-800">
                                <Share2 className="w-4 h-4 mr-3" /> Share
                            </LuxuryButton>
                            <LuxuryButton variant="primary" className="rounded-full px-8">
                                <Download className="w-4 h-4 mr-3" /> Export PDF
                            </LuxuryButton>
                        </div>
                    </div>

                    {/* Score Architecture */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">
                        <div className="lg:col-span-4">
                            <div className="bg-neutral-900 dark:bg-neutral-50 rounded-[3rem] p-12 text-white dark:text-neutral-900 shadow-2xl h-full flex flex-col justify-between">
                                <div>
                                    <Award className="w-10 h-10 mb-8 opacity-50" />
                                    <h2 className="text-xl font-bold uppercase tracking-widest mb-2">Mastery Score</h2>
                                    <p className="text-sm opacity-60 font-light leading-relaxed">Your professional resonance is establishing a strong presence in the market.</p>
                                </div>
                                <div className="mt-12">
                                    <div className="text-8xl font-serif leading-none mb-2">{report.score}</div>
                                    <div className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40">Percentile Ranking: Top 30%</div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-8">
                            <div className="bg-white dark:bg-neutral-900 rounded-[3rem] p-12 border border-neutral-100 dark:border-neutral-800 shadow-xl h-full">
                                <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em] mb-10">Metric Breakdown</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                    {report.metrics.map((m, i) => (
                                        <div key={i} className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm font-bold text-neutral-900 dark:text-neutral-50 uppercase tracking-widest">{m.label}</span>
                                                <span className="text-xs font-medium text-neutral-400">{m.value}%</span>
                                            </div>
                                            <div className="h-1 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${m.value}%` }}
                                                    transition={{ duration: 1.5, ease: luxuryTheme.animations.easings.elegant }}
                                                    className="h-full bg-neutral-900 dark:bg-neutral-50"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10 mb-20">
                        {/* Strengths */}
                        <div className="bg-white dark:bg-neutral-900 p-12 rounded-[3rem] border border-neutral-100 dark:border-neutral-800 shadow-lg">
                            <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                                <CheckCircle className="w-4 h-4 text-emerald-500" /> Strategic Assets
                            </h3>
                            <ul className="space-y-6">
                                {report.strengths.map((s, i) => (
                                    <li key={i} className="flex gap-4 text-neutral-600 dark:text-neutral-400 group items-center">
                                        <div className="w-1.5 h-1.5 bg-neutral-900 dark:bg-neutral-50 rounded-full group-hover:scale-150 transition-transform" />
                                        <span className="text-lg font-light tracking-tight group-hover:text-neutral-900 dark:group-hover:text-neutral-50 transition-colors">{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Improvements */}
                        <div className="bg-white dark:bg-neutral-900 p-12 rounded-[3rem] border border-neutral-100 dark:border-neutral-800 shadow-lg">
                            <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                                <Target className="w-4 h-4 text-neutral-400" /> Refinement Areas
                            </h3>
                            <ul className="space-y-6">
                                {report.weaknesses.map((w, i) => (
                                    <li key={i} className="flex gap-4 text-neutral-600 dark:text-neutral-400 group items-center">
                                        <div className="w-1.5 h-1.5 border border-neutral-300 dark:border-neutral-700 rounded-full group-hover:bg-neutral-900 dark:group-hover:bg-neutral-50 transition-all" />
                                        <span className="text-lg font-light tracking-tight group-hover:text-neutral-900 dark:group-hover:text-neutral-50 transition-colors">{w}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="space-y-10">
                        <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em] pl-4">Substance Intelligence</h3>
                        <div className="grid gap-6">
                            {report.transcript.map((item, i) => (
                                <div key={i} className="bg-white dark:bg-neutral-900 p-12 rounded-[3.5rem] border border-neutral-100 dark:border-neutral-800 shadow-xl group hover:border-neutral-900 dark:hover:border-neutral-50 transition-all duration-700">
                                    <div className="flex flex-col md:flex-row gap-10">
                                        <div className="md:w-1/3">
                                            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-4">Interrogatory {i + 1}</span>
                                            <h4 className="text-xl font-serif text-neutral-900 dark:text-neutral-50">{item.q}</h4>
                                        </div>
                                        <div className="md:w-2/3 space-y-8">
                                            <div className="text-neutral-500 font-light text-lg italic leading-relaxed pl-8 border-l border-neutral-100 dark:border-neutral-800">
                                                "{item.a}"
                                            </div>
                                            <div className="bg-neutral-50 dark:bg-neutral-950 p-8 rounded-[2rem] border border-neutral-100 dark:border-neutral-800 flex gap-4">
                                                <Zap className="w-5 h-5 text-neutral-900 dark:text-neutral-50 shrink-0 mt-1" />
                                                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 italic">
                                                    Coach Resonance: {item.feedback}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-32 text-center">
                        <Link href={route('career-advisor.interview.setup')}>
                            <LuxuryButton variant="primary" className="px-16 py-8 rounded-full text-lg group">
                                Initiate New Expedition <ArrowRight className="ml-4 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </LuxuryButton>
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
