import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { LuxuryButton } from '@/Components/ui/luxury/Button';
import { LuxuryCard } from '@/Components/ui/luxury/Card';
import { luxuryTheme } from '@/design-system/luxury-theme';
import { useAIStream } from '@/hooks/useAIStream';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Flag, CheckCircle2, Clock, MapPin, Sparkles,
    ArrowRight, Target, ChevronRight, ChevronLeft,
    Brain, Rocket, Award, Loader2, Star, Zap
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';

const getSteps = (t) => [
    { id: 'goal', title: t('career_advisor.roadmap.generator.steps.goal.title'), description: t('career_advisor.roadmap.generator.steps.goal.desc'), icon: Target },
    { id: 'state', title: t('career_advisor.roadmap.generator.steps.state.title'), description: t('career_advisor.roadmap.generator.steps.state.desc'), icon: MapPin },
    { id: 'time', title: t('career_advisor.roadmap.generator.steps.time.title'), description: t('career_advisor.roadmap.generator.steps.time.desc'), icon: Clock },
    { id: 'focus', title: t('career_advisor.roadmap.generator.steps.focus.title'), description: t('career_advisor.roadmap.generator.steps.focus.desc'), icon: Brain }
];

export default function RoadmapGenerator({ auth }) {
    const { t } = useTranslation();
    const STEPS = getSteps(t);
    const [currentStep, setCurrentStep] = useState(0);
    const [isGenerated, setIsGenerated] = useState(false);
    const [roadmap, setRoadmap] = useState([]);
    const { stream, isStreaming } = useAIStream();

    const [formData, setFormData] = useState({
        goal: '',
        currentRole: '',
        experienceLevel: 'intermédiaire',
        timeframe: '6 mois',
        focus: []
    });

    const isStepValid = () => {
        switch (currentStep) {
            case 0: return formData.goal.length > 3;
            case 1: return formData.currentRole.length > 2;
            case 2: return !!formData.timeframe;
            case 3: return true;
            default: return false;
        }
    };

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleGenerate();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleGenerate = async () => {
        setIsGenerated(true);
        setRoadmap([]);

        // Mock roadmap generation for now, should use stream in production
        setTimeout(() => {
            setRoadmap([
                {
                    title: t('career_advisor.roadmap.generator.phases.foundation.title'),
                    duration: t('career_advisor.roadmap.generator.horizons.3_months'),
                    description: t('career_advisor.roadmap.generator.phases.foundation.desc'),
                    tasks: [t('career_advisor.roadmap.generator.phases.foundation.tasks.patterns', 'Advanced patterns review'), t('career_advisor.roadmap.generator.phases.foundation.tasks.audit', 'Current skills audit'), t('career_advisor.roadmap.generator.phases.foundation.tasks.env', 'Environment setup')]
                },
                {
                    title: t('career_advisor.roadmap.generator.phases.specialization.title'),
                    duration: t('career_advisor.roadmap.generator.horizons.6_months'),
                    description: t('career_advisor.roadmap.generator.phases.specialization.desc'),
                    tasks: [t('career_advisor.roadmap.generator.phases.specialization.tasks.mvp', 'Full MVP development'), t('career_advisor.roadmap.generator.phases.specialization.tasks.oss', 'Open Source contribution'), t('career_advisor.roadmap.generator.phases.specialization.tasks.perf', 'Performance optimization')]
                },
                {
                    title: t('career_advisor.roadmap.generator.phases.acceleration.title'),
                    duration: t('career_advisor.roadmap.generator.horizons.1_year'),
                    description: t('career_advisor.roadmap.generator.phases.acceleration.desc'),
                    tasks: [t('career_advisor.roadmap.generator.phases.acceleration.tasks.interviews', 'System interview preparation'), t('career_advisor.roadmap.generator.phases.acceleration.tasks.networking', 'Strategic networking'), t('career_advisor.roadmap.generator.phases.acceleration.tasks.launch', 'Career launch')]
                },
            ]);
        }, 1500);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={t('career_advisor.roadmap.generator.title')} />

            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-20 px-6 relative overflow-hidden">
                <div className="max-w-4xl mx-auto relative z-10">

                    {/* Progress Header */}
                    {!isGenerated && (
                        <div className="mb-20 text-center">
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-3 px-6 py-2 bg-amber-500 rounded-full text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-10 shadow-2xl shadow-amber-500/20"
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>{t('career_advisor.roadmap.generator.engine')}</span>
                            </motion.div>
                            <h1 className="text-5xl md:text-6xl font-serif text-neutral-900 dark:text-neutral-50 mb-6 tracking-tight leading-tight">
                                {t('career_advisor.roadmap.generator.title').split(' ')[0]} <span className="italic font-normal">{t('career_advisor.roadmap.generator.title').split(' ')[1]}</span>
                            </h1>

                            <div className="flex justify-center items-center gap-4 mt-16 mb-12">
                                {STEPS.map((step, idx) => (
                                    <React.Fragment key={step.id}>
                                        <div className="flex flex-col items-center gap-3">
                                            <div className={cn(
                                                "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-700",
                                                idx === currentStep ? "bg-amber-500 text-white scale-125 shadow-xl shadow-amber-500/20" :
                                                    idx < currentStep ? "bg-amber-200 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100" : "bg-neutral-100 dark:bg-neutral-900 text-neutral-300 dark:text-neutral-700"
                                            )}>
                                                <step.icon className="w-5 h-5" />
                                            </div>
                                            <span className={cn(
                                                "text-[9px] uppercase font-bold tracking-[0.2em]",
                                                idx === currentStep ? "text-amber-600 dark:text-amber-500" : "text-neutral-400"
                                            )}>
                                                {step.title}
                                            </span>
                                        </div>
                                        {idx < STEPS.length - 1 && (
                                            <div className={cn(
                                                "w-8 md:w-16 h-px -mt-7 transition-colors duration-700",
                                                idx < currentStep ? "bg-amber-500" : "bg-neutral-200 dark:bg-neutral-800"
                                            )} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {!isGenerated ? (
                            <div className="max-w-2xl mx-auto">
                                <div className="space-y-12 bg-white dark:bg-neutral-900 rounded-[3rem] p-12 md:p-16 border border-neutral-100 dark:border-neutral-800 shadow-2xl relative overflow-hidden">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentStep}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.5, ease: luxuryTheme.animations.easings.elegant }}
                                        >
                                            {currentStep === 0 && (
                                                <div className="space-y-10">
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">{t('career_advisor.roadmap.generator.vision_label')}</label>
                                                        <input
                                                            placeholder={t('career_advisor.roadmap.generator.vision_placeholder')}
                                                            className="w-full h-20 text-3xl font-serif bg-transparent border-none p-0 focus:outline-none placeholder:text-neutral-100 dark:placeholder:text-neutral-800 text-neutral-900 dark:text-neutral-50 transition-all duration-700"
                                                            value={formData.goal}
                                                            onChange={e => setFormData({ ...formData, goal: e.target.value })}
                                                            autoFocus
                                                        />
                                                    </div>
                                                    <p className="text-neutral-500 text-lg font-light leading-relaxed">
                                                        {t('career_advisor.roadmap.generator.vision_desc')}
                                                    </p>
                                                </div>
                                            )}

                                            {currentStep === 1 && (
                                                <div className="space-y-10">
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">{t('career_advisor.roadmap.generator.position_label')}</label>
                                                        <input
                                                            placeholder={t('career_advisor.roadmap.generator.position_placeholder')}
                                                            className="w-full h-20 text-3xl font-serif bg-transparent border-none p-0 focus:outline-none placeholder:text-neutral-100 dark:placeholder:text-neutral-800 text-neutral-900 dark:text-neutral-50 transition-all duration-700"
                                                            value={formData.currentRole}
                                                            onChange={e => setFormData({ ...formData, currentRole: e.target.value })}
                                                            autoFocus
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-6">
                                                        {Object.entries({
                                                            junior: t('career_advisor.roadmap.generator.levels.junior'),
                                                            senior: t('career_advisor.roadmap.generator.levels.senior'),
                                                            expert: t('career_advisor.roadmap.generator.levels.expert'),
                                                            strategic: t('career_advisor.roadmap.generator.levels.strategic')
                                                        }).map(([key, level]) => (
                                                            <button
                                                                key={key}
                                                                onClick={() => setFormData({ ...formData, experienceLevel: level })}
                                                                className={cn(
                                                                    "h-16 rounded-2xl border transition-all duration-500 font-bold uppercase tracking-widest text-[10px]",
                                                                    formData.experienceLevel === level ?
                                                                        "bg-amber-500 text-white border-amber-600 shadow-xl shadow-amber-500/20" :
                                                                        "border-neutral-100 dark:border-neutral-800 text-neutral-400 hover:border-amber-500 hover:text-amber-600"
                                                                )}
                                                            >
                                                                {level}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {currentStep === 2 && (
                                                <div className="space-y-10">
                                                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">{t('career_advisor.roadmap.generator.horizon_label')}</label>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {Object.entries({
                                                            '3_months': t('career_advisor.roadmap.generator.horizons.3_months'),
                                                            '6_months': t('career_advisor.roadmap.generator.horizons.6_months'),
                                                            '1_year': t('career_advisor.roadmap.generator.horizons.1_year'),
                                                            '2_years': t('career_advisor.roadmap.generator.horizons.2_years')
                                                        }).map(([key, time]) => (
                                                            <button
                                                                key={key}
                                                                onClick={() => setFormData({ ...formData, timeframe: time })}
                                                                className={cn(
                                                                    "flex items-center gap-6 p-8 rounded-3xl border transition-all duration-500 group relative overflow-hidden",
                                                                    formData.timeframe === time ?
                                                                        "bg-amber-500 border-amber-600 shadow-2xl shadow-amber-500/20" :
                                                                        "border-neutral-100 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-500",
                                                                    formData.timeframe === time ? "bg-white/20 text-white" : "bg-neutral-50 dark:bg-neutral-800 text-neutral-400"
                                                                )}>
                                                                    <Clock className="w-6 h-6" />
                                                                </div>
                                                                <span className={cn(
                                                                    "text-lg font-bold transition-colors duration-500",
                                                                    formData.timeframe === time ? "text-white" : "text-neutral-900 dark:text-neutral-50"
                                                                )}>{time}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {currentStep === 3 && (
                                                <div className="space-y-12 py-6">
                                                    <div className="flex items-center gap-6 text-center justify-center">
                                                        <div className="w-24 h-24 rounded-full bg-amber-500 flex items-center justify-center shadow-2xl shadow-amber-500/20">
                                                            <Rocket className="w-10 h-10 text-white" />
                                                        </div>
                                                    </div>
                                                    <div className="text-center space-y-4">
                                                        <h3 className="text-3xl font-serif text-neutral-900 dark:text-neutral-50">{t('career_advisor.roadmap.generator.finalization')}</h3>
                                                        <p className="text-neutral-500 font-light max-w-sm mx-auto leading-relaxed">{t('career_advisor.roadmap.generator.finalization_desc')}</p>
                                                    </div>
                                                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-10 rounded-[2.5rem] space-y-4 border border-neutral-100 dark:border-neutral-800 shadow-inner">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{t('career_advisor.roadmap.generator.steps.goal.title')}</span>
                                                            <span className="text-sm font-bold text-neutral-900 dark:text-neutral-50 uppercase tracking-widest">{formData.goal}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{t('career_advisor.roadmap.generator.horizon_label')}</span>
                                                            <span className="text-sm font-bold text-neutral-900 dark:text-neutral-50 uppercase tracking-widest">{formData.timeframe}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    </AnimatePresence>

                                    <div className="flex justify-between items-center pt-16">
                                        <LuxuryButton
                                            variant="ghost"
                                            onClick={handleBack}
                                            disabled={currentStep === 0}
                                            className="px-10"
                                        >
                                            <ChevronLeft className="w-4 h-4 mr-3" />
                                            {t('career_advisor.roadmap.generator.return')}
                                        </LuxuryButton>
                                        <LuxuryButton
                                            variant="primary"
                                            onClick={handleNext}
                                            disabled={!isStepValid()}
                                            className="px-12 shadow-2xl"
                                        >
                                            {currentStep === STEPS.length - 1 ? (
                                                <> {t('career_advisor.roadmap.generator.architect')} <Rocket className="w-4 h-4 ml-3" /></>
                                            ) : (
                                                <> {t('career_advisor.roadmap.generator.continue')} <ChevronRight className="w-4 h-4 ml-3" /></>
                                            )}
                                        </LuxuryButton>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <motion.div
                                key="roadmap"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-12"
                            >
                                <div className="text-center mb-24">
                                    <p className="text-[10px] tracking-[0.5em] font-bold text-neutral-400 uppercase mb-4">{t('career_advisor.roadmap.generator.master_strategy')}</p>
                                    <h2 className="text-5xl font-serif text-neutral-900 dark:text-neutral-50 tracking-tight">{t('career_advisor.roadmap.generator.blueprint').split(' ')[0]} <span className="italic font-normal">{t('career_advisor.roadmap.generator.blueprint').split(' ')[1]}</span></h2>
                                </div>

                                <div className="relative">
                                    <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-px bg-neutral-100 dark:bg-neutral-800 transform md:-translate-x-1/2 hidden md:block" />

                                    <div className="space-y-12">
                                        {roadmap.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                                <Loader2 className="w-12 h-12 text-neutral-900 dark:text-neutral-50 animate-spin" />
                                                <p className="text-neutral-400 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">{t('career_advisor.roadmap.generator.architecting')}</p>
                                            </div>
                                        ) : roadmap.map((phase, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.2 }}
                                                className={cn(
                                                    "flex flex-col md:flex-row items-center gap-8 relative",
                                                    index % 2 === 0 ? "" : "md:flex-row-reverse"
                                                )}
                                            >
                                                {/* Phase Card */}
                                                <div className="flex-1 w-full relative">
                                                    <div className="bg-white dark:bg-neutral-900 rounded-[3rem] p-12 shadow-2xl border border-neutral-100 dark:border-neutral-800 transition-all duration-700 hover:-translate-y-2">
                                                        <div className="flex justify-between items-start mb-10">
                                                            <div className="space-y-3 text-left">
                                                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">{phase.duration}</span>
                                                                <h3 className="text-3xl font-serif text-neutral-900 dark:text-neutral-50 tracking-tight">{phase.title}</h3>
                                                            </div>
                                                            <div className="w-16 h-16 rounded-[2rem] bg-amber-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                                                                <Star className="w-6 h-6" />
                                                            </div>
                                                        </div>
                                                        <p className="text-neutral-500 font-light text-lg mb-10 leading-relaxed text-left">{phase.description}</p>
                                                        <ul className="space-y-6">
                                                            {phase.tasks.map((task, t) => (
                                                                <li key={t} className="flex items-center gap-6 text-neutral-600 dark:text-neutral-300 font-medium text-left group/task">
                                                                    <div className="w-6 h-6 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shrink-0 group-hover/task:bg-amber-500 group-hover/task:border-none transition-all duration-300">
                                                                        <Zap className="w-2.5 h-2.5 text-neutral-300 group-hover/task:text-white dark:group-hover/task:text-neutral-900" />
                                                                    </div>
                                                                    <span className="text-base group-hover/task:text-neutral-900 dark:group-hover/task:text-neutral-50 transition-colors">{task}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>

                                                {/* Center Dot */}
                                                <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center justify-center z-20">
                                                    <div className="w-14 h-14 rounded-full bg-white dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 shadow-2xl flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-amber-500 rounded-full" />
                                                    </div>
                                                </div>

                                                <div className="flex-1 hidden md:block" />
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {roadmap.length > 0 && (
                                    <div className="flex flex-col items-center gap-10 pt-24 pb-20">
                                        <p className="text-neutral-400 font-serif italic text-2xl text-center max-w-lg leading-relaxed">
                                            {t('career_advisor.roadmap.generator.quote')}
                                        </p>
                                        <LuxuryButton
                                            variant="ghost"
                                            onClick={() => { setIsGenerated(false); setCurrentStep(0); }}
                                            className="px-16"
                                        >
                                            {t('career_advisor.roadmap.generator.alternative')}
                                        </LuxuryButton>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
