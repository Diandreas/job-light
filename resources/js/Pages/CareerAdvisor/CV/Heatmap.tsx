import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuxuryButton } from '@/Components/ui/luxury/Button';
import { luxuryTheme } from '@/design-system/luxury-theme';
import { BarChart3, Sparkles, CheckCircle2, RotateCw, AlertCircle, FileText, Send, Loader2, History as HistoryIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import axios from 'axios';
import { toast, Toaster } from 'sonner';
import HistoryDrawer from '@/Components/ai/HistoryDrawer';

// Minimal Fade Animation
const fadeVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

interface SectionData {
    id: string;
    title: string;
    score: number;
    feedback: string;
    improvements: string[];
    isAiAnalyzed: boolean;
    aiContent?: string | null;
}

const HeatmapSection = ({ section, isSelected, onClick }: { section: SectionData, isSelected: boolean, onClick: () => void }) => {
    const { title, score, isAiAnalyzed } = section;

    const getStatusStyles = (s: number) => {
        if (s >= 80) return 'text-neutral-900 dark:text-neutral-50 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700';
        if (s >= 50) return 'text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30';
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
                <div className="flex items-center gap-2">
                    <h3 className={cn(
                        "font-semibold text-lg tracking-tight",
                        isSelected ? "text-neutral-900 dark:text-neutral-50" : "text-neutral-600 dark:text-neutral-400"
                    )}>
                        {title}
                    </h3>
                    {isAiAnalyzed && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                </div>
                <div className={cn("px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-widest transition-colors duration-500", getStatusStyles(score))}>
                    {score}%
                </div>
            </div>

            <div className="relative h-1 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1.5, ease: luxuryTheme.animations.easings.elegant }}
                    className={cn(
                        "absolute top-0 left-0 h-full rounded-full transition-all duration-1000",
                        isSelected ? "bg-neutral-900 dark:bg-neutral-50" : "bg-neutral-300 dark:bg-neutral-700",
                        isAiAnalyzed && "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                    )}
                />
            </div>
        </motion.div>
    );
};

export default function CVHeatmap({ auth, cvData, personalInfo }: any) {
    const [targetRole, setTargetRole] = useState("Général");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isImproving, setIsImproving] = useState(false);
    const [improvedContent, setImprovedContent] = useState<string>("");
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // Initial algorithmic analysis
    const getInitialSections = (): SectionData[] => {
        let summaryScore = 0;
        let summaryFeedback = "Aucun résumé trouvé. Un résumé professionnel est crucial pour capter l'attention.";
        if (cvData.summaries && cvData.summaries.length > 0) {
            const desc = cvData.summaries[0].description || "";
            const words = desc.split(' ').length;
            if (words > 20 && words < 100) { summaryScore = 100; summaryFeedback = "Excellente longueur de résumé (entre 20 et 100 mots)."; }
            else if (words >= 100) { summaryScore = 60; summaryFeedback = "Résumé un peu trop long. Soyez plus concis."; }
            else { summaryScore = 40; summaryFeedback = "Résumé trop court. Développez votre proposition de valeur."; }
        }

        let expScore = 0;
        let expFeedback = "Aucune expérience professionnelle listée.";
        if (cvData.experiences && cvData.experiences.length > 0) {
            const hasDesc = cvData.experiences.some((e: any) => e.description && e.description.length > 10);
            if (cvData.experiences.length >= 2 && hasDesc) {
                expScore = 90; expFeedback = "Bon historique d'expériences avec descriptions fournies. Assurez-vous d'utiliser des verbes d'action et des métriques.";
            } else if (hasDesc) {
                expScore = 60; expFeedback = "Vous avez détaillé vos missions, mais le nombre total d'expériences est faible.";
            } else {
                expScore = 30; expFeedback = "Ajoutez des descriptions détaillées à vos expériences pour montrer votre impact réel.";
            }
        }

        let skillsScore = 0;
        let skillsFeedback = "Vos compétences ne sont pas renseignées.";
        if (cvData.competences && cvData.competences.length > 0) {
            if (cvData.competences.length >= 5) { skillsScore = 100; skillsFeedback = "Très bonne diversité de compétences renseignées."; }
            else { skillsScore = 50; skillsFeedback = "Ajoutez plus de compétences techniques et transversales pertinentes pour votre cible."; }
        }

        let contactScore = 40; // Base: Name + email exist from auth
        let contactFeedback = "Informations de contact basiques présentes.";
        if (personalInfo?.phone) contactScore += 20;
        if (personalInfo?.linkedin) contactScore += 20;
        if (personalInfo?.github) contactScore += 20;
        if (contactScore === 100) contactFeedback = "Profil complet. Tous les liens professionnels et contacts sont présents.";
        if (contactScore === 40) contactFeedback = "Il manque un numéro de téléphone et vos liens professionnels (LinkedIn/GitHub).";

        return [
            { id: 'summary', title: 'Résumé & Objectif', score: summaryScore, feedback: summaryFeedback, improvements: summaryScore < 100 ? ['Écrire un résumé complet', 'Ajuster la longueur'] : [], isAiAnalyzed: false },
            { id: 'experience', title: 'Expériences Pro', score: expScore, feedback: expFeedback, improvements: expScore < 100 ? ['Ajouter des descriptions', 'Quantifier vos réalisations'] : [], isAiAnalyzed: false },
            { id: 'skills', title: 'Compétences', score: skillsScore, feedback: skillsFeedback, improvements: skillsScore < 100 ? ['Ajouter 5+ compétences clés', 'Préciser les niveaux'] : [], isAiAnalyzed: false },
            { id: 'contact', title: 'Profil & Contact', score: contactScore, feedback: contactFeedback, improvements: contactScore < 100 ? ['Ajouter un numéro de téléphone', 'Ajouter un lien LinkedIn', 'Ajouter un lien GitHub/Portfolio'] : [], isAiAnalyzed: false },
        ];
    };

    const [sections, setSections] = useState<SectionData[]>([]);
    const [selectedSection, setSelectedSection] = useState<SectionData | null>(null);

    // Initialize exactly once
    useEffect(() => {
        const historyData = sessionStorage.getItem('load_history_cv');
        if (historyData) {
            try {
                const parsedSections: SectionData[] = JSON.parse(historyData);
                setSections(parsedSections);
                setSelectedSection(parsedSections[0] || null);
            } catch (e) {
                console.error("Failed to parse history data", e);
                const initial = getInitialSections();
                setSections(initial);
                setSelectedSection(initial[0]);
            }
            sessionStorage.removeItem('load_history_cv');
        } else {
            const initial = getInitialSections();
            setSections(initial);
            setSelectedSection(initial[0]);
        }
    }, [cvData, personalInfo]);

    const averageScore = sections.length > 0 ? Math.round(sections.reduce((acc, curr) => acc + (curr.score || 0), 0) / sections.length) : 0;

    const handleDeepAnalysis = async () => {
        setIsAnalyzing(true);
        toast.loading("Mistral analyse votre CV en profondeur...", { id: 'analyze' });

        try {
            const response = await axios.post(route('career-advisor.cv-heatmap.analyze'), {
                cvData,
                personalInfo,
                targetRole
            });

            const aiData = response.data;

            setSections(prev => prev.map(sec => {
                const aiResult = aiData[sec.id];
                if (aiResult && sec.id !== 'contact') { // Contact doesn't need AI analysis usually
                    return {
                        ...sec,
                        score: aiResult.score_ia || sec.score,
                        feedback: aiResult.feedback || sec.feedback,
                        improvements: aiResult.improvements || sec.improvements,
                        isAiAnalyzed: true
                    };
                }
                return sec;
            }));

            // Force update selected section
            setSelectedSection(prev => {
                if (!prev) return null;
                const aiResult = aiData[prev.id];
                if (aiResult && prev.id !== 'contact') {
                    return { ...prev, score: aiResult.score_ia, feedback: aiResult.feedback, improvements: aiResult.improvements, isAiAnalyzed: true };
                }
                return prev;
            });

            toast.success("Analyse terminée ! Découvrez les retours de l'IA.", { id: 'analyze' });
        } catch (error: any) {
            console.error("Analysis Error:", error);
            toast.error(error.response?.data?.error || "Erreur lors de l'analyse.", { id: 'analyze' });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleImproveSection = async (sectionId: string) => {
        setIsImproving(true);
        setImprovedContent("");
        toast.loading("L'IA rédige une meilleure version...", { id: 'improve' });

        let sourceText = "";
        if (sectionId === 'summary') sourceText = cvData.summaries?.[0]?.description || "";
        if (sectionId === 'experience') sourceText = cvData.experiences?.map((e: any) => `${e.title} chez ${e.company}: ${e.description}`).join('\n\n') || "";
        if (sectionId === 'skills') sourceText = cvData.competences?.map((c: any) => c.name).join(', ') || "";

        if (!sourceText) {
            toast.error("Aucun contenu à améliorer dans cette section.", { id: 'improve' });
            setIsImproving(false);
            return;
        }

        try {
            const response = await fetch(route('career-advisor.cv-heatmap.improve'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ text: sourceText, type: sectionId })
            });

            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            toast.dismiss('improve');
            toast.success("Optimisation générée !");

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.substring(6);
                        if (dataStr === '[DONE]') break;
                        try {
                            const data = JSON.parse(dataStr);
                            if (data.error) throw new Error(data.error);
                            if (data.content) {
                                setImprovedContent(prev => prev + data.content);
                            }
                        } catch (e) {
                            console.error("JSON Parse Error on chunk:", dataStr);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Streaming error:", error);
            toast.error("Une erreur s'est produite pendant l'optimisation.", { id: 'improve' });
        } finally {
            setIsImproving(false);
            setSections(prev => prev.map(s => s.id === sectionId ? { ...s, aiContent: improvedContent } : s));
            setSelectedSection(prev => prev?.id === sectionId ? { ...prev, aiContent: improvedContent } : prev);
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Vision globale du CV | Career Advisor" />
            <Toaster position="top-center" richColors />

            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-20 px-6 sm:px-10 lg:px-16 relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <HistoryDrawer 
                        isOpen={isHistoryOpen} 
                        onClose={() => setIsHistoryOpen(false)}
                        context="cv_analysis"
                        title="Historique des Analyses"
                        onSelect={(item) => {
                            if (item.structured_data) {
                                const aiData = item.structured_data;
                                setSections(prev => prev.map(sec => {
                                    const aiResult = aiData[sec.id];
                                    if (aiResult && sec.id !== 'contact') {
                                        return {
                                            ...sec,
                                            score: aiResult.score_ia || sec.score,
                                            feedback: aiResult.feedback || sec.feedback,
                                            improvements: aiResult.improvements || sec.improvements,
                                            isAiAnalyzed: true
                                        };
                                    }
                                    return sec;
                                }));
                                // Reset selected
                                setSelectedSection(prev => {
                                    if (!prev) return null;
                                    const aiResult = aiData[prev.id];
                                    if (aiResult && prev.id !== 'contact') {
                                        return { ...prev, score: aiResult.score_ia, feedback: aiResult.feedback, improvements: aiResult.improvements, isAiAnalyzed: true };
                                    }
                                    return prev;
                                });
                                toast.success("Ancienne analyse chargée.");
                            }
                        }}
                    />

                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8 relative">
                        <div className="absolute right-0 top-0 lg:-top-12">
                            <button 
                                onClick={() => setIsHistoryOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full hover:shadow-md transition-all text-xs font-bold text-neutral-600 dark:text-neutral-300"
                            >
                                <HistoryIcon className="w-4 h-4" />
                                Historique
                            </button>
                        </div>
                        <div>
                            <p className="text-[10px] text-neutral-400 uppercase tracking-[0.3em] font-bold mb-3">Moteur d'Analyse CV</p>
                            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-50 leading-tight tracking-tighter">
                                Vision globale de <span className="font-serif italic font-normal text-amber-600 dark:text-amber-500">votre CV</span>
                            </h1>
                            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <span className="text-sm font-medium text-neutral-500 uppercase tracking-widest">Optimiser pour :</span>
                                <input
                                    type="text"
                                    placeholder="Ex: Développeur Full Stack"
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    className="px-4 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none text-neutral-900 dark:text-neutral-50 w-full sm:w-64"
                                />
                                <LuxuryButton
                                    onClick={handleDeepAnalysis}
                                    disabled={isAnalyzing}
                                    className="whitespace-nowrap bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900"
                                >
                                    {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2 text-amber-500" />}
                                    Analyse Approfondie (IA)
                                </LuxuryButton>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 bg-white dark:bg-neutral-900 p-6 rounded-3xl shadow-xl border border-neutral-100 dark:border-neutral-800">
                            <div className="text-right">
                                <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1">Score Global</p>
                                <p className="text-4xl font-bold text-neutral-900 dark:text-neutral-50 leading-none">{averageScore}</p>
                            </div>
                            <div className="h-14 w-14 rounded-full border border-neutral-100 dark:border-neutral-800 flex items-center justify-center relative">
                                <Sparkles className="w-5 h-5 text-amber-500" />
                                <svg className="absolute top-0 left-0 w-full h-full -rotate-90 transition-all duration-1000" viewBox="0 0 36 36">
                                    <path
                                        className="text-amber-500 dark:text-amber-400"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeDasharray={`${averageScore}, 100`}
                                        style={{ transition: 'stroke-dasharray 1.5s ease' }}
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
                                            <div className="p-8 sm:p-10">
                                                <div className="flex items-center gap-4 mb-8">
                                                    <div className={cn(
                                                        "p-3 rounded-2xl",
                                                        selectedSection.isAiAnalyzed ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
                                                    )}>
                                                        {selectedSection.isAiAnalyzed ? <Sparkles className="w-6 h-6" /> : <BarChart3 className="w-6 h-6" />}
                                                    </div>
                                                    <div>
                                                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
                                                            {selectedSection.title}
                                                        </h2>
                                                        <p className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] mt-1">
                                                            {selectedSection.isAiAnalyzed ? 'Rapport IA Mistral' : 'Rapport Algorithmique'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-8">
                                                    <div className="space-y-3">
                                                        <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                                            <div className="w-1 h-1 rounded-full bg-neutral-400" /> Bilan
                                                        </h4>
                                                        <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-sm">
                                                            {selectedSection.feedback}
                                                        </p>
                                                    </div>

                                                    {selectedSection.improvements && selectedSection.improvements.length > 0 && (
                                                        <div className="space-y-4">
                                                            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                                                <div className="w-1 h-1 rounded-full bg-neutral-400" /> Pistes d'Optimisation
                                                            </h4>
                                                            <ul className="space-y-4">
                                                                {selectedSection.improvements.map((item, idx) => (
                                                                    <li key={idx} className="flex items-start gap-4 text-sm text-neutral-600 dark:text-neutral-400 group">
                                                                        <div className="w-5 h-5 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-amber-500 group-hover:border-amber-500 group-hover:text-white transition-all duration-300">
                                                                            <span className="text-[10px]">{idx + 1}</span>
                                                                        </div>
                                                                        <span className="group-hover:text-neutral-900 dark:group-hover:text-neutral-50 transition-colors duration-300 pt-0.5">{item}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {(selectedSection.isAiAnalyzed || selectedSection.id === 'summary' || selectedSection.id === 'experience') && selectedSection.id !== 'contact' && (
                                                        <div className="pt-8 border-t border-neutral-100 dark:border-neutral-800">

                                                            {(isImproving || improvedContent || selectedSection.aiContent) ? (
                                                                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 mb-4">
                                                                    <div className="flex items-center gap-2 mb-3">
                                                                        <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                                                                        <h5 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest">Proposition IA :</h5>
                                                                    </div>
                                                                    <div className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                                                        {improvedContent || selectedSection.aiContent}
                                                                        {isImproving && <span className="inline-block w-2.5 h-4 ml-1 bg-amber-500 animate-pulse align-middle" />}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <LuxuryButton
                                                                    variant="primary"
                                                                    onClick={() => handleImproveSection(selectedSection.id)}
                                                                    disabled={isImproving}
                                                                    className="w-full h-14 text-sm uppercase tracking-[0.2em] font-bold bg-amber-500 hover:bg-amber-600 text-white border-none"
                                                                >
                                                                    <Sparkles className="w-4 h-4 mr-3" />
                                                                    Optimiser cette section
                                                                </LuxuryButton>
                                                            )}
                                                        </div>
                                                    )}
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
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgb(217 119 6 / 0.2);
                    border-radius: 20px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgb(245 158 11 / 0.2);
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
