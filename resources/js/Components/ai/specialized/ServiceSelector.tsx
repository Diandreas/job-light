import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LuxuryButton } from '@/Components/ui/luxury/Button';
import { luxuryTheme } from '@/design-system/luxury-theme';
import {
    Brain, FileText, MessageSquare, PenTool,
    ArrowRight, Sparkles, Target, Zap, Layout
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { cn } from "@/lib/utils";

interface ServiceSelectorProps {
    userInfo?: any;
    onServiceSubmit?: (serviceId: string, data: any) => void;
    isLoading: boolean;
    walletBalance: number;
    onServiceSelect?: () => void;
    onBackToServices?: () => void;
}

export default function ServiceSelector({ walletBalance }: ServiceSelectorProps) {
    const { t } = useTranslation();

    const ENHANCED_SERVICES = [
        {
            id: 'cover-letter',
            icon: FileText,
            title: t('services.cover_letter.enhanced_title') || 'Cover Letter Genesis',
            description: t('services.cover_letter.enhanced_description') || 'Create a bespoke professional narrative with AI precision.',
            cost: 5,
            route: 'career-advisor.cover-letter.index'
        },
        {
            id: 'resume-review',
            icon: PenTool,
            title: t('services.resume_review.enhanced_title') || 'CV Heatmap Insight',
            description: t('services.resume_review.enhanced_description') || 'Visualize your resume strengths with orbital vector analysis.',
            cost: 4,
            route: 'career-advisor.cv-heatmap.index'
        },
        {
            id: 'interview-prep',
            icon: MessageSquare,
            title: t('services.interview_prep.enhanced_title') || 'Voice Interview Simulation',
            description: t('services.interview_prep.enhanced_description') || 'Master your delivery with real-time vocal AI diagnostics.',
            cost: 5,
            route: 'career-advisor.interview.setup'
        },
        {
            id: 'career-roadmap',
            icon: Layout,
            title: t('services.roadmap.enhanced_title') || 'Strategic Career Roadmap',
            description: t('services.roadmap.enhanced_description') || 'A comprehensive trajectory synthesis toward your goals.',
            cost: 4,
            route: 'career-advisor.roadmap.index'
        }
    ];

    const handleServiceClick = (serviceId: string, routeName: string, cost: number) => {
        if (walletBalance < cost) return;
        router.visit(route(routeName));
    };

    return (
        <div className="w-full max-w-7xl mx-auto py-12 px-6">
            {/* Elegant Header */}
            <div className="text-center mb-24 space-y-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 text-[10px] font-bold uppercase tracking-[0.4em] shadow-2xl"
                >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Intelligence Suite</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.8 }}
                    className="text-5xl md:text-7xl font-serif text-neutral-900 dark:text-neutral-50 tracking-tight leading-tight"
                >
                    Orchestrate Your <span className="italic font-normal">Destiny</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-xl text-neutral-500 font-light max-w-2xl mx-auto leading-relaxed"
                >
                    Unlock architectural precision in your professional journey with our suite of vector-driven career accelerators.
                </motion.p>
            </div>

            {/* Service Grid - Pure Luxury */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {ENHANCED_SERVICES.map((service, index) => (
                    <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + index * 0.1, duration: 0.6, ease: luxuryTheme.animations.easings.elegant }}
                        whileHover={{ y: -10 }}
                        className="group"
                    >
                        <div
                            onClick={() => handleServiceClick(service.id, service.route, service.cost)}
                            className="
                                h-full flex flex-col p-10 rounded-[3rem] 
                                bg-white dark:bg-neutral-900 
                                border border-neutral-100 dark:border-neutral-800 
                                shadow-sm hover:shadow-2xl transition-all duration-700 cursor-pointer
                                relative overflow-hidden group
                            "
                        >
                            {/* Subtle Inner Glow */}
                            <div className="absolute inset-0 bg-neutral-900 dark:bg-neutral-50 opacity-0 group-hover:opacity-[0.02] transition-opacity duration-700" />

                            <div className="flex justify-between items-start mb-12">
                                <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 group-hover:bg-neutral-900 dark:group-hover:bg-neutral-50 group-hover:text-white dark:group-hover:text-neutral-900 transition-all duration-700">
                                    <service.icon className="w-8 h-8" />
                                </div>
                                <div className="px-4 py-1.5 rounded-full border border-neutral-100 dark:border-neutral-800 text-[9px] font-bold uppercase tracking-widest text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-50 transition-colors">
                                    {service.cost} Tokens
                                </div>
                            </div>

                            <h3 className="text-2xl font-serif text-neutral-900 dark:text-neutral-50 mb-4 tracking-tight group-hover:translate-x-1 transition-transform duration-700">
                                {service.title}
                            </h3>

                            <p className="text-neutral-500 dark:text-neutral-500 font-light text-sm leading-relaxed mb-12 flex-1">
                                {service.description}
                            </p>

                            <div className="flex items-center gap-3 text-neutral-900 dark:text-neutral-50 text-[10px] font-bold uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-700">
                                Initiate Protocol <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}