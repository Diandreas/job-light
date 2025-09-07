import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import {
    Brain, FileText, MessageSquare, PenTool, Presentation,
    ArrowRight, Sparkles, Star, Zap, Target
} from 'lucide-react';

// Import des interfaces spécialisées
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
}

// Configuration des services - sera initialisée dans le composant

export default function ServiceSelector({ userInfo, onServiceSubmit, isLoading, walletBalance }: ServiceSelectorProps) {
    const { t } = useTranslation();
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [showServiceInterface, setShowServiceInterface] = useState(false);

    // Configuration des services avec traductions
    const ENHANCED_SERVICES = [
        {
            id: 'career-advice',
            icon: Brain,
            title: t('services.career_advice.enhanced_title') || 'Conseil de Carrière Personnalisé',
            description: t('services.career_advice.enhanced_description') || 'Assistant intelligent qui analyse votre profil et vos objectifs pour créer un plan de carrière sur mesure',
            cost: 3,
            color: 'amber',
            features: [
                t('services.career_advice.features.profile_analysis') || 'Analyse de profil',
                t('services.career_advice.features.career_plan') || 'Plan de carrière',
                t('services.career_advice.features.recommendations') || 'Recommandations',
                t('services.career_advice.features.goal_tracking') || 'Suivi objectifs'
            ],
            component: CareerAdviceWizard
        },
        {
            id: 'cover-letter',
            icon: FileText,
            title: t('services.cover_letter.enhanced_title') || 'Générateur de Lettre de Motivation',
            description: t('services.cover_letter.enhanced_description') || 'Créez des lettres personnalisées et optimisées ATS en analysant automatiquement les offres d\'emploi',
            cost: 5,
            color: 'purple',
            features: [
                t('services.cover_letter.features.job_analysis') || 'Analyse d\'offre',
                t('services.cover_letter.features.ats_optimization') || 'Optimisation ATS',
                t('services.cover_letter.features.personalization') || 'Personnalisation',
                t('services.cover_letter.features.multiple_versions') || 'Multiple versions'
            ],
            component: CoverLetterGenerator
        },
        {
            id: 'resume-review',
            icon: PenTool,
            title: t('services.resume_review.enhanced_title') || 'Analyseur de CV Avancé',
            description: t('services.resume_review.enhanced_description') || 'Audit complet avec scoring détaillé, recommandations visuelles et comparaison sectorielle',
            cost: 4,
            color: 'amber',
            features: [
                t('services.resume_review.features.detailed_score') || 'Score détaillé',
                t('services.resume_review.features.heatmap') || 'Heatmap',
                t('services.resume_review.features.benchmarking') || 'Benchmarking',
                t('services.resume_review.features.recommendations') || 'Recommandations'
            ],
            component: ResumeAnalyzer
        },
        {
            id: 'interview-prep',
            icon: MessageSquare,
            title: t('services.interview_prep.enhanced_title') || 'Simulateur d\'Entretien Immersif',
            description: t('services.interview_prep.enhanced_description') || 'Simulations réalistes avec questions adaptées au secteur et feedback détaillé de performance',
            cost: 5,
            color: 'purple',
            features: [
                t('services.interview_prep.features.realistic_simulation') || 'Simulation réaliste',
                t('services.interview_prep.features.sector_questions') || 'Questions sectorielles',
                t('services.interview_prep.features.timer') || 'Timer',
                t('services.interview_prep.features.detailed_feedback') || 'Feedback détaillé'
            ],
            component: InterviewSimulator
        },
        {
            id: 'presentation-ppt',
            icon: Presentation,
            title: t('services.presentation_ppt.enhanced_title') || 'Créateur de Portfolio Présentation',
            description: t('services.presentation_ppt.enhanced_description') || 'Transformez vos projets en présentations professionnelles pour impressionner les recruteurs',
            cost: 8,
            color: 'amber',
            features: [
                t('services.presentation_ppt.features.pro_templates') || 'Templates pro',
                t('services.presentation_ppt.features.projects_showcase') || 'Projets showcase',
                t('services.presentation_ppt.features.powerpoint_export') || 'Export PowerPoint',
                t('services.presentation_ppt.features.adaptive_design') || 'Design adaptatif'
            ],
            component: null // À implémenter si nécessaire
        }
    ];



    const handleServiceSelect = (serviceId: string) => {
        const service = ENHANCED_SERVICES.find(s => s.id === serviceId);
        
        if (!service) return;
        
        if (walletBalance < service.cost) {
            // Gérer le manque de tokens
            return;
        }

        setSelectedService(serviceId);
        setShowServiceInterface(true);
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

        if (SpecializedComponent) {
            return (
                <div className="space-y-6">
                    {/* Header avec retour */}
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            className="flex items-center gap-2"
                        >
                            <ArrowRight className="w-4 h-4 rotate-180" />
                            {t('common.back_to_services') || 'Retour aux services'}
                        </Button>
                        
                        <Badge variant="outline" className="bg-amber-50 text-amber-700">
                            <Star className="w-3 h-3 mr-1" />
                            {service.cost} tokens
                        </Badge>
                    </div>

                    {/* Interface spécialisée */}
                    <SpecializedComponent
                        userInfo={userInfo}
                        onSubmit={handleServiceSubmit}
                        isLoading={isLoading}
                    />
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

                <div className="flex items-center justify-center gap-4 mb-8">
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {t('wallet.balance')}: {walletBalance} {t('common.tokens')}
                    </Badge>
                </div>
            </div>

            {/* Grille des services */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ENHANCED_SERVICES.map((service, index) => {
                    const Icon = service.icon;
                    const colors = getColorClasses(service.color);
                    const canAfford = walletBalance >= service.cost;
                    
                    return (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -4, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Card className={`h-full cursor-pointer transition-all duration-300 hover:shadow-xl ${
                                canAfford ? 'hover:shadow-lg' : 'opacity-75'
                            }`}>
                                <CardHeader>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`p-3 rounded-xl bg-gradient-to-r from-${service.color}-500 to-${service.color}-600`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-right">
                                            <Badge 
                                                variant={canAfford ? "default" : "secondary"}
                                                className={canAfford ? colors.bg : 'bg-gray-100'}
                                            >
                                                {service.cost} {t('common.tokens')}
                                            </Badge>
                                        </div>
                                    </div>
                                    
                                    <CardTitle className="text-lg leading-tight">
                                        {service.title}
                                    </CardTitle>
                                </CardHeader>
                                
                                <CardContent>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                                        {service.description}
                                    </p>
                                    
                                    {/* Features */}
                                    <div className="space-y-2 mb-4">
                                        {service.features.map(feature => (
                                            <div key={feature} className="flex items-center gap-2 text-xs">
                                                <div className={`w-1.5 h-1.5 rounded-full bg-${service.color}-500`} />
                                                <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Button
                                            onClick={() => handleServiceSelect(service.id)}
                                            disabled={!canAfford || !service.component}
                                            className={`w-full ${service.component && canAfford ? 'bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600' : 'bg-gray-400'}`}
                                        >
                                            {!service.component ? (
                                                <>
                                                    <Zap className="w-4 h-4 mr-2" />
                                                    {t('common.comingSoon')}
                                                </>
                                            ) : !canAfford ? (
                                                <>
                                                    {t('wallet.insufficient')}
                                                </>
                                            ) : (
                                                <>
                                                    <Target className="w-4 h-4 mr-2" />
                                                    {t('common.start') || 'Commencer'}
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </>
                                            )}
                                        </Button>
                                        
                                        {/* Bouton de test des artefacts */}
                                        {service.component && canAfford && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const testResponse = generateTestArtifacts(service.id);
                                                    onServiceSubmit(service.id, { 
                                                        prompt: "Test des artefacts interactifs",
                                                        mockResponse: testResponse,
                                                        isTest: true 
                                                    });
                                                }}
                                                className="w-full text-xs border-amber-200 text-amber-700 hover:bg-amber-50"
                                            >
                                                <Sparkles className="w-3 h-3 mr-1" />
                                                {t('services.test_artifacts') || 'Tester les artefacts'}
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Section avantages */}
            <div className="text-center mt-12">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                    {t('services.why_unique') || 'Pourquoi nos services IA sont uniques ?'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <Brain className="w-6 h-6 text-blue-600" />
                        </div>
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">{t('services.benefits.contextual_ai') || 'IA Contextuelle'}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            {t('services.benefits.contextual_ai_desc') || 'Analyse votre profil complet pour des conseils ultra-personnalisés'}
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <Target className="w-6 h-6 text-purple-600" />
                        </div>
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">{t('services.benefits.dedicated_interfaces') || 'Interfaces Dédiées'}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            {t('services.benefits.dedicated_interfaces_desc') || 'Chaque service a son interface optimisée pour une expérience unique'}
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-950/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <Star className="w-6 h-6 text-green-600" />
                        </div>
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">{t('services.benefits.measurable_results') || 'Résultats Mesurables'}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            {t('services.benefits.measurable_results_desc') || 'Scores, métriques et recommandations concrètes pour progresser'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}