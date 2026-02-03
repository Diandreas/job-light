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

const STEPS = [
    { id: 'goal', title: 'Objectif', description: 'Ce que vous voulez atteindre', icon: Target },
    { id: 'state', title: 'Situation', description: 'Où vous en êtes aujourd\'hui', icon: MapPin },
    { id: 'time', title: 'Délai', description: 'Votre horizon temporel', icon: Clock },
    { id: 'focus', title: 'Focus', description: 'Priorités de développement', icon: Brain }
];

export default function RoadmapGenerator({ auth }) {
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
                    title: 'Fondations & Mise à niveau',
                    duration: 'Mois 1-2',
                    description: 'Maîtriser les bases techniques et se familiariser avec l\'écosystème.',
                    tasks: ['Révision des patterns avancés', 'Audit des compétences actuelles', 'Mise en place de l\'environnement']
                },
                {
                    title: 'Spécialisation & Projets',
                    duration: 'Mois 3-4',
                    description: 'Application pratique sur des cas d\'usage réels et complexes.',
                    tasks: ['Développement d\'un MVP complet', 'Contribution Open Source', 'Optimisation de performance']
                },
                {
                    title: 'Accélération & Opportunités',
                    duration: 'Mois 5-6',
                    description: 'Finalisation du profil et mise en avant de l\'expertise.',
                    tasks: ['Préparation aux entretiens système', 'Networking stratégique', 'Lancement de carrière']
                },
            ]);
        }, 1500);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Générateur de Roadmap" />

            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-20 px-6 relative overflow-hidden">
                <div className="max-w-4xl mx-auto relative z-10">

                    {/* Progress Header */}
                    {!isGenerated && (
                        <div className="mb-20 text-center">
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-3 px-6 py-2 bg-neutral-900 dark:bg-neutral-50 rounded-full text-white dark:text-neutral-900 text-[10px] font-bold uppercase tracking-[0.3em] mb-10 shadow-2xl"
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>Strategic Engine</span>
                            </motion.div>
                            <h1 className="text-5xl md:text-6xl font-serif text-neutral-900 dark:text-neutral-50 mb-6 tracking-tight leading-tight">
                                Career <span className="italic font-normal">Architecture</span>
                            </h1>

                            <div className="flex justify-center items-center gap-4 mt-16 mb-12">
                                {STEPS.map((step, idx) => (
                                    <React.Fragment key={step.id}>
                                        <div className="flex flex-col items-center gap-3">
                                            <div className={cn(
                                                "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-700",
                                                idx === currentStep ? "bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 scale-125 shadow-xl" :
                                                    idx < currentStep ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50" : "bg-neutral-100 dark:bg-neutral-900 text-neutral-300 dark:text-neutral-700"
                                            )}>
                                                <step.icon className="w-5 h-5" />
                                            </div>
                                            <span className={cn(
                                                "text-[9px] uppercase font-bold tracking-[0.2em]",
                                                idx === currentStep ? "text-neutral-900 dark:text-neutral-50" : "text-neutral-400"
                                            )}>
                                                {step.title}
                                            </span>
                                        </div>
                                        {idx < STEPS.length - 1 && (
                                            <div className={cn(
                                                "w-8 md:w-16 h-px -mt-7 transition-colors duration-700",
                                                idx < currentStep ? "bg-neutral-900 dark:bg-neutral-50" : "bg-neutral-200 dark:bg-neutral-800"
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
                                                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">Ultimate Career Vision</label>
                                                        <input
                                                            placeholder="e.g. Chief Technology Officer"
                                                            className="w-full h-20 text-3xl font-serif bg-transparent border-none p-0 focus:outline-none placeholder:text-neutral-100 dark:placeholder:text-neutral-800 text-neutral-900 dark:text-neutral-50 transition-all duration-700"
                                                            value={formData.goal}
                                                            onChange={e => setFormData({ ...formData, goal: e.target.value })}
                                                            autoFocus
                                                        />
                                                    </div>
                                                    <p className="text-neutral-500 text-lg font-light leading-relaxed">
                                                        Define your destination. Precision in your goal leads to excellence in your path.
                                                    </p>
                                                </div>
                                            )}

                                            {currentStep === 1 && (
                                                <div className="space-y-10">
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">Current Positioning</label>
                                                        <input
                                                            placeholder="e.g. Senior Backend Engineer"
                                                            className="w-full h-20 text-3xl font-serif bg-transparent border-none p-0 focus:outline-none placeholder:text-neutral-100 dark:placeholder:text-neutral-800 text-neutral-900 dark:text-neutral-50 transition-all duration-700"
                                                            value={formData.currentRole}
                                                            onChange={e => setFormData({ ...formData, currentRole: e.target.value })}
                                                            autoFocus
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-6">
                                                        {['Junior', 'Senior', 'Expert', 'Strategic'].map(level => (
                                                            <button
                                                                key={level}
                                                                onClick={() => setFormData({ ...formData, experienceLevel: level })}
                                                                className={cn(
                                                                    "h-16 rounded-2xl border transition-all duration-500 font-bold uppercase tracking-widest text-[10px]",
                                                                    formData.experienceLevel === level ?
                                                                        "bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-50 shadow-xl" :
                                                                        "border-neutral-100 dark:border-neutral-800 text-neutral-400 hover:border-neutral-900 dark:hover:border-neutral-50 hover:text-neutral-900 dark:hover:text-neutral-50"
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
                                                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">Temporal Horizon</label>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {['3 Months', '6 Months', '1 Year', '2 Years'].map(time => (
                                                            <button
                                                                key={time}
                                                                onClick={() => setFormData({ ...formData, timeframe: time })}
                                                                className={cn(
                                                                    "flex items-center gap-6 p-8 rounded-3xl border transition-all duration-500 group relative overflow-hidden",
                                                                    formData.timeframe === time ?
                                                                        "bg-neutral-900 dark:bg-neutral-50 border-neutral-900 dark:border-neutral-50 shadow-2xl" :
                                                                        "border-neutral-100 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-500",
                                                                    formData.timeframe === time ? "bg-white/10 text-white dark:text-neutral-900" : "bg-neutral-50 dark:bg-neutral-800 text-neutral-400"
                                                                )}>
                                                                    <Clock className="w-6 h-6" />
                                                                </div>
                                                                <span className={cn(
                                                                    "text-lg font-bold transition-colors duration-500",
                                                                    formData.timeframe === time ? "text-white dark:text-neutral-900" : "text-neutral-900 dark:text-neutral-50"
                                                                )}>{time}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {currentStep === 3 && (
                                                <div className="space-y-12 py-6">
                                                    <div className="flex items-center gap-6 text-center justify-center">
                                                        <div className="w-24 h-24 rounded-full bg-neutral-900 dark:bg-neutral-50 flex items-center justify-center shadow-2xl">
                                                            <Rocket className="w-10 h-10 text-white dark:text-neutral-900" />
                                                        </div>
                                                    </div>
                                                    <div className="text-center space-y-4">
                                                        <h3 className="text-3xl font-serif text-neutral-900 dark:text-neutral-50">Strategy Finalization</h3>
                                                        <p className="text-neutral-500 font-light max-w-sm mx-auto leading-relaxed">System ready to architect your personalized career roadmap based on your unique profile.</p>
                                                    </div>
                                                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-10 rounded-[2.5rem] space-y-4 border border-neutral-100 dark:border-neutral-800 shadow-inner">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Target</span>
                                                            <span className="text-sm font-bold text-neutral-900 dark:text-neutral-50 uppercase tracking-widest">{formData.goal}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Horizon</span>
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
                                            Return
                                        </LuxuryButton>
                                        <LuxuryButton
                                            variant="primary"
                                            onClick={handleNext}
                                            disabled={!isStepValid()}
                                            className="px-12 shadow-2xl"
                                        >
                                            {currentStep === STEPS.length - 1 ? (
                                                <>Architect Roadmap <Rocket className="w-4 h-4 ml-3" /></>
                                            ) : (
                                                <>Continue <ChevronRight className="w-4 h-4 ml-3" /></>
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
                                    <p className="text-[10px] tracking-[0.5em] font-bold text-neutral-400 uppercase mb-4">Master Strategy</p>
                                    <h2 className="text-5xl font-serif text-neutral-900 dark:text-neutral-50 tracking-tight">Expedition <span className="italic font-normal">Blueprint</span></h2>
                                </div>

                                <div className="relative">
                                    <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-px bg-neutral-100 dark:bg-neutral-800 transform md:-translate-x-1/2 hidden md:block" />

                                    <div className="space-y-12">
                                        {roadmap.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                                <Loader2 className="w-12 h-12 text-neutral-900 dark:text-neutral-50 animate-spin" />
                                                <p className="text-neutral-400 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Architecting Strategy...</p>
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
                                                            <div className="w-16 h-16 rounded-[2rem] bg-neutral-900 dark:bg-neutral-50 flex items-center justify-center text-white dark:text-neutral-900 shadow-xl">
                                                                <Star className="w-6 h-6" />
                                                            </div>
                                                        </div>
                                                        <p className="text-neutral-500 font-light text-lg mb-10 leading-relaxed text-left">{phase.description}</p>
                                                        <ul className="space-y-6">
                                                            {phase.tasks.map((task, t) => (
                                                                <li key={t} className="flex items-center gap-6 text-neutral-600 dark:text-neutral-300 font-medium text-left group/task">
                                                                    <div className="w-6 h-6 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shrink-0 group-hover/task:bg-neutral-900 dark:group-hover/task:bg-neutral-50 group-hover/task:border-none transition-all duration-300">
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
                                                        <div className="w-2 h-2 bg-neutral-900 dark:bg-neutral-50 rounded-full" />
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
                                            "Strategic planning is not thinking about future decisions, but about the future of current decisions."
                                        </p>
                                        <LuxuryButton
                                            variant="ghost"
                                            onClick={() => { setIsGenerated(false); setCurrentStep(0); }}
                                            className="px-16"
                                        >
                                            Generate Alternative Strategy
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
