import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip";
import {
    Brain, FileText, MessageSquare, PenTool, Presentation,
    ArrowRight, Sparkles, Star, Zap, Target, Info, Map
} from 'lucide-react';
import { router } from '@inertiajs/react';

// Import des interfaces spécialisées (legacy - for backward compatibility)
import CareerAdviceWizard from './CareerAdviceWizard';
import CoverLetterGenerator from './CoverLetterGenerator';
import ResumeAnalyzer from './ResumeAnalyzer';
import InterviewSimulator from './InterviewSimulator';
import { generateTestArtifacts } from '../artifacts/ExampleResponses';

interface ServiceSelectorProps {
    userInfo: any;
    onServiceSubmit: (serviceId: string, data: any) => void;
    isLoading: boolean;
    walletBalance: number;
    onServiceSelect?: () => void;
    onBackToServices?: () => void;
}

// Configuration des services - sera initialisée dans le composant

export default function ServiceSelector({ userInfo, onServiceSubmit, isLoading, walletBalance, onServiceSelect, onBackToServices }: ServiceSelectorProps) {
    const { t } = useTranslation();
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [showServiceInterface, setShowServiceInterface] = useState(false);
    const [mascotPosition, setMascotPosition] = useState({ x: 0, y: 0, show: true });

    // Configuration des services avec traductions
    const ENHANCED_SERVICES = [
        {
            id: 'cover-letter',
            icon: FileText,
            title: t('services.cover_letter.enhanced_title') || 'Lettre de Motivation',
            description: t('services.cover_letter.enhanced_description') || 'Éditeur immersif avec preview live, score ATS temps réel et suggestions IA',
            cost: 5,
            color: 'purple',
            features: [
                'Split-screen editor',
                'ATS scoring live',
                'AI suggestions',
                'Export PDF/DOCX'
            ],
            route: '/career-advisor/cover-letter',
            immersive: true,
        },
        {
            id: 'resume-review',
            icon: PenTool,
            title: t('services.resume_review.enhanced_title') || 'Analyse CV',
            description: t('services.resume_review.enhanced_description') || 'Heatmap interactive avec drill-down par section et amélioration IA',
            cost: 4,
            color: 'blue',
            features: [
                'Heatmap interactive',
                'Section editor',
                'AI improvement',
                'Benchmarking'
            ],
            route: '/career-advisor/cv-heatmap',
            immersive: true,
        },
        {
            id: 'interview-prep',
            icon: MessageSquare,
            title: t('services.interview_prep.enhanced_title') || 'Simulation Entretien',
            description: t('services.interview_prep.enhanced_description') || 'Enregistrement vocal/vidéo avec scoring STAR en temps réel',
            cost: 5,
            color: 'green',
            features: [
                'Voice recording',
                'STAR detection',
                'Live feedback',
                'Detailed report'
            ],
            component: InterviewSimulator,
            legacy: true,
        },
        {
            id: 'career-roadmap',
            icon: Map,
            title: 'Roadmap Carrière',
            description: 'Timeline interactive avec milestones trackables et génération IA streamée',
            cost: 3,
            color: 'amber',
            features: [
                'AI generation',
                'Interactive timeline',
                'Progress tracking',
                'Analytics'
            ],
            route: '/career-advisor/roadmap',
            immersive: true,
        }
    ];



    const handleServiceSelect = (serviceId: string) => {
        const service = ENHANCED_SERVICES.find(s => s.id === serviceId);

        if (!service) return;

        if (walletBalance < service.cost) {
            // Gérer le manque de tokens
            return;
        }

        // If service has immersive route, navigate directly
        if (service.immersive && service.route) {
            router.visit(service.route);
            return;
        }

        // Legacy: use old component-based interface
        if (service.legacy && service.component) {
            // Faire disparaître la mascotte du haut
            onServiceSelect?.();

            // Animation de la mascotte vers l'icône du service
            setMascotPosition({ x: 0, y: 0, show: false });

            setTimeout(() => {
                setSelectedService(serviceId);
                setShowServiceInterface(true);
            }, 500);
        }
    };

    const handleServiceSubmit = (data: any) => {
        if (selectedService) {
            onServiceSubmit(selectedService, data);
            setShowServiceInterface(false);
            setSelectedService(null);
        }
    };

    const handleBack = () => {
        setShowServiceInterface(false);
        setSelectedService(null);
        setMascotPosition({ x: 0, y: 0, show: true });

        // Faire réapparaître la mascotte du haut
        onBackToServices?.();
    };

    const getColorClasses = (color: string) => ({
        bg: `bg-${color}-50 dark:bg-${color}-950/50`,
        border: `border-${color}-200 dark:border-${color}-800`,
        text: `text-${color}-700 dark:text-${color}-300`,
        icon: `text-${color}-600 dark:text-${color}-400`,
        button: `bg-${color}-600 hover:bg-${color}-700`
    });

    // Si une interface spécialisée est active, l'afficher
    if (showServiceInterface && selectedService) {
        const service = ENHANCED_SERVICES.find(s => s.id === selectedService);
        const SpecializedComponent = service?.component;
        const ServiceIcon = service?.icon;

        if (SpecializedComponent) {
            return (
                <div className="space-y-6">
                    {/* Header avec mascotte animée et retour */}
                    <div className="relative">
                        <div className="flex items-center justify-between mb-6">
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <ArrowRight className="w-4 h-4 rotate-180" />
                                {t('common.back_to_services') || 'Retour aux services'}
                            </Button>

                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                <Star className="w-3 h-3 mr-1" />
                                {service.cost} tokens
                            </Badge>
                        </div>

                        {/* Titre du service avec mascotte comme icône */}
                        <div className="text-center mb-8">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-3"
                            >
                                {/* Mascotte comme icône du titre */}
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 20,
                                        delay: 0.2
                                    }}
                                    className="relative"
                                >
                                    <div className="w-8 h-8 rounded-lg overflow-hidden shadow-md">
                                        <img
                                            src="/mascot/mas.png"
                                            alt="AI Assistant"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {/* Badge avec l'icône du service */}
                                    <motion.div
                                        initial={{ scale: 0, x: 5, y: -5 }}
                                        animate={{ scale: 1, x: 0, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-md bg-gradient-to-r from-${service.color}-500 to-${service.color}-600 flex items-center justify-center shadow-sm`}
                                    >
                                        <ServiceIcon className="w-2.5 h-2.5 text-white" />
                                    </motion.div>
                                </motion.div>
                                {service.title}
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-gray-600 dark:text-gray-400 mt-2"
                            >
                                {service.description}
                            </motion.p>
                        </div>
                    </div>

                    {/* Interface spécialisée avec animation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <SpecializedComponent
                            userInfo={userInfo}
                            onSubmit={handleServiceSubmit}
                            isLoading={isLoading}
                        />
                    </motion.div>
                </div>
            );
        }
    }

    // Sélecteur de services par défaut
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        {t('services.specialized_ai_services') || 'Services IA Spécialisés'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {t('services.unique_experience') || 'Chaque service offre une expérience unique et personnalisée'}
                    </p>
                </motion.div>

            </div>

            {/* Grille des services compacts */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {ENHANCED_SERVICES.map((service, index) => {
                    const Icon = service.icon;
                    const canAfford = walletBalance >= service.cost;

                    return (
                        <TooltipProvider key={service.id}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Card className={`cursor-pointer transition-all duration-300 border-2 ${canAfford ? 'hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-600' : 'opacity-60 border-gray-200'
                                    }`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={`p-2 rounded-lg bg-gradient-to-r from-${service.color}-500 to-${service.color}-600`}>
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>

                                            <Badge
                                                variant={canAfford ? "default" : "secondary"}
                                                className={`text-xs ${canAfford ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-500'}`}
                                            >
                                                {service.cost}
                                            </Badge>
                                        </div>

                                        <div className="mb-4">
                                            <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1 line-clamp-2">
                                                {service.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                                {service.description.split(' ').slice(0, 8).join(' ')}...
                                            </p>
                                        </div>

                                        <Button
                                            onClick={() => handleServiceSelect(service.id)}
                                            disabled={!canAfford || (!service.immersive && !service.component)}
                                            size="sm"
                                            className={`w-full text-xs ${(service.immersive || service.component) && canAfford
                                                ? 'bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600'
                                                : 'bg-gray-400'
                                                }`}
                                        >
                                            {!service.immersive && !service.component ? (
                                                <>
                                                    <Zap className="w-3 h-3 mr-1" />
                                                    {t('common.comingSoon') || 'Bientôt'}
                                                </>
                                            ) : !canAfford ? (
                                                <>
                                                    {t('wallet.insufficient') || 'Solde insuffisant'}
                                                </>
                                            ) : (
                                                <>
                                                    {service.immersive && <Sparkles className="w-3 h-3 mr-1" />}
                                                    {!service.immersive && <Target className="w-3 h-3 mr-1" />}
                                                    {t('common.start') || 'Commencer'}
                                                </>
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </TooltipProvider>
                    );
                })}
            </div>

        </div>
    );
}