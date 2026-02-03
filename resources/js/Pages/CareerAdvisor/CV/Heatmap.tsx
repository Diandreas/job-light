import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuxuryButton } from '@/Components/ui/luxury/Button';
import { LuxuryCard } from '@/Components/ui/luxury/Card';
import { luxuryTheme } from '@/design-system/luxury-theme';
import { Info, ArrowRight, BarChart3, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';

// Minimal Fade Animation
const fadeVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

const HeatmapSection = ({ section, isSelected, onClick }) => {
    const { title, score, id } = section;

    // Calculate color based on score but keep it within the Gold/Amber/Neutral palette or slight variations
    // Simplified status colors for monochrome theme
    const getStatusStyles = (s) => {
        if (s >= 80) return 'text-neutral-900 dark:text-neutral-50 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700';
        if (s >= 60) return 'text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800';
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30';
    };

    return (
        <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
            onClick={onClick}
            className={cn(
                "group relative p-6 rounded-2xl border transition-all duration-500 cursor-pointer overflow-hidden",
                isSelected
                    ? "border-neutral-900 dark:border-neutral-50 bg-white dark:bg-neutral-900 shadow-xl"
                    : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:border-neutral-400 dark:hover:border-neutral-600"
            )}
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className={cn(
                    "font-semibold text-lg tracking-tight",
                    isSelected ? "text-neutral-900 dark:text-neutral-50" : "text-neutral-600 dark:text-neutral-400"
                )}>
                    {title}
                </h3>
                <div className={cn("px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-widest", getStatusStyles(score))}>
                    {score}%
                </div>
            </div>

            <div className="relative h-1 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1.5, ease: luxuryTheme.animations.easings.elegant }}
                    className={cn(
                        "absolute top-0 left-0 h-full rounded-full",
                        isSelected ? "bg-neutral-900 dark:bg-neutral-50" : "bg-neutral-300 dark:bg-neutral-700"
                    )}
                />
            </div>
        </motion.div>
    );
};

export default function CVHeatmap({ auth }) {
    const { t } = useTranslation();

    // Mock Data using translation keys for titles
    const [sections] = useState([
        { id: 'summary', title: t('career_advisor.common.sections.summary'), score: 85, feedback: 'Strong and concise. Captures attention immediately.', improvements: [] },
        { id: 'experience', title: t('career_advisor.common.sections.experience'), score: 65, feedback: 'Missing quantification of achievements. Action verbs could be stronger.', improvements: ['Add metrics to 3 positions', 'Use stronger action verbs', 'Focus on results over duties'] },
        { id: 'skills', title: t('career_advisor.common.sections.skills'), score: 92, feedback: 'Excellent coverage of relevant technologies for your target role.', improvements: [] },
        { id: 'education', title: t('career_advisor.common.sections.education'), score: 100, feedback: 'Perfectly formatted and relevant.', improvements: [] },
        { id: 'layout', title: t('career_advisor.common.sections.layout'), score: 70, feedback: 'Visual hierarchy is good but white space usage could be improved.', improvements: ['Increase margins', 'Consistent font sizes'] },
    ]);

    const [selectedSection, setSelectedSection] = useState(sections[0]);

    const averageScore = Math.round(sections.reduce((acc, curr) => acc + curr.score, 0) / sections.length);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={t('career_advisor.cv_heatmap.title')} />

            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-20 px-6 sm:px-10 lg:px-16 relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                        <div>
                            <p className="text-[10px] text-neutral-400 uppercase tracking-[0.3em] font-bold mb-3">{t('career_advisor.cv_heatmap.engine_subtitle')}</p>
                            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-50 leading-tight tracking-tighter">
                                {t('career_advisor.cv_heatmap.main_title').split(' ').slice(0, -1).join(' ')} <span className="font-serif italic font-normal">{t('career_advisor.cv_heatmap.main_title').split(' ').slice(-1)}</span>
                            </h1>
                        </div>

                        <div className="flex items-center gap-6 bg-white dark:bg-neutral-900 p-6 rounded-3xl shadow-xl border border-neutral-100 dark:border-neutral-800">
                            <div className="text-right">
                                <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1">{t('career_advisor.cv_heatmap.impact_score')}</p>
                                <p className="text-4xl font-bold text-neutral-900 dark:text-neutral-50 leading-none">{averageScore}</p>
                            </div>
                            <div className="h-14 w-14 rounded-full border border-neutral-100 dark:border-neutral-800 flex items-center justify-center relative">
                                <Sparkles className="w-5 h-5 text-neutral-900 dark:text-neutral-50" />
                                <svg className="absolute top-0 left-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        className="text-neutral-900 dark:text-neutral-50"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1"
                                        strokeDasharray={`${averageScore}, 100`}
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left: Sections List */}
                        <div className="lg:col-span-7 space-y-4">
                            {sections.map(section => (
                                <HeatmapSection
                                    key={section.id}
                                    section={section}
                                    isSelected={selectedSection?.id === section.id}
                                    onClick={() => setSelectedSection(section)}
                                />
                            ))}
                        </div>

                        {/* Right: Detail View */}
                        <div className="lg:col-span-5">
                            <div className="sticky top-8">
                                <AnimatePresence mode="wait">
                                    {selectedSection && (
                                        <motion.div
                                            key={selectedSection.id}
                                            variants={fadeVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden"
                                        >
                                            <div className="p-10">
                                                <div className="flex items-center gap-4 mb-10">
                                                    <div className="p-3 bg-neutral-900 dark:bg-neutral-50 rounded-2xl text-white dark:text-neutral-900">
                                                        <BarChart3 className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
                                                            {selectedSection.title}
                                                        </h2>
                                                        <p className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] mt-1">{t('career_advisor.cv_heatmap.report_title')}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-10">
                                                    <div className="space-y-3">
                                                        <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                                            <div className="w-1 h-1 rounded-full bg-neutral-400" /> {t('career_advisor.cv_heatmap.assessment')}
                                                        </h4>
                                                        <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-sm">
                                                            {selectedSection.feedback}
                                                        </p>
                                                    </div>

                                                    {selectedSection.improvements && selectedSection.improvements.length > 0 && (
                                                        <div className="space-y-4">
                                                            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                                                <div className="w-1 h-1 rounded-full bg-neutral-400" /> {t('career_advisor.cv_heatmap.optimization_path')}
                                                            </h4>
                                                            <ul className="space-y-4">
                                                                {selectedSection.improvements.map((item, idx) => (
                                                                    <li key={idx} className="flex items-start gap-4 text-sm text-neutral-600 dark:text-neutral-400 group">
                                                                        <div className="w-5 h-5 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-neutral-900 dark:group-hover:bg-neutral-50 group-hover:text-white dark:group-hover:text-neutral-900 transition-all duration-300">
                                                                            <span className="text-[10px]">{idx + 1}</span>
                                                                        </div>
                                                                        <span className="group-hover:text-neutral-900 dark:group-hover:text-neutral-50 transition-colors duration-300 pt-0.5">{item}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    <div className="pt-10 border-t border-neutral-100 dark:border-neutral-800">
                                                        <LuxuryButton variant="primary" className="w-full h-14 text-sm uppercase tracking-[0.2em] font-bold">
                                                            <Sparkles className="w-4 h-4 mr-3" />
                                                            {t('career_advisor.cv_heatmap.apply_fixes')}
                                                        </LuxuryButton>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
