/**
 * Démo Interactif du Système d'Artefacts IA Évolutifs
 * Interface moderne de test et présentation des artefacts
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Progress } from '@/Components/ui/progress';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import {
    Bot, Sparkles, Play, RotateCcw, Eye, Settings,
    FileText, BarChart3, CheckCircle, TrendingUp,
    Clock, Target, Zap, Brain, MessageSquare,
    RefreshCw, ArrowRight, Activity, Star,
    MapPin, Award, Users, Briefcase, Lightbulb
} from 'lucide-react';

import MessageBubbleWithAI from './MessageBubbleWithAI';
import { CareerRoadmapArtifact, CVHeatmapArtifact, InterviewReportArtifact } from './enhanced/artifacts';
import { ArtifactEvolutionManager } from './services/ArtifactEvolutionManager';

// Configuration des artefacts de test avec données réalistes
const ARTIFACT_TEMPLATES = {
    'career-roadmap': {
        type: 'roadmap',
        title: 'Plan de Carrière Évolutif',
        data: {
            currentPosition: 'Développeur Full-Stack',
            targetPosition: 'Tech Lead',
            timeframe: '18 mois',
            steps: [
                {
                    id: 'skill-development',
                    title: 'Développer compétences techniques avancées',
                    timeframe: '3-6 mois',
                    priority: 'high',
                    category: 'skill',
                    progress: 25,
                    completed: false,
                    description: 'Maîtriser l\'architecture distribuée et les microservices'
                },
                {
                    id: 'leadership-training',
                    title: 'Formation en leadership technique',
                    timeframe: '6-9 mois',
                    priority: 'high',
                    category: 'skill',
                    progress: 10,
                    completed: false,
                    description: 'Acquérir les compétences de management d\'équipe'
                },
                {
                    id: 'mentoring',
                    title: 'Mentorer développeurs juniors',
                    timeframe: '9-12 mois',
                    priority: 'medium',
                    category: 'experience',
                    progress: 0,
                    completed: false,
                    description: 'Prendre en charge la formation de 2-3 juniors'
                },
                {
                    id: 'project-lead',
                    title: 'Leader projet critique',
                    timeframe: '12-18 mois',
                    priority: 'high',
                    category: 'experience',
                    progress: 0,
                    completed: false,
                    description: 'Diriger un projet d\'envergure de A à Z'
                }
            ],
            successProbability: 82,
            salaryProgression: {
                current: 52000,
                projected_1year: 58000,
                projected_3years: 72000,
                potential_max: 85000
            }
        },
        confidence: 89
    },

    'cv-analysis': {
        type: 'heatmap',
        title: 'Analyse CV Interactive',
        data: {
            sections: [
                { name: 'En-tête', score: 85, icon: 'User', status: 'good' },
                { name: 'Expérience', score: 78, icon: 'Briefcase', status: 'good' },
                { name: 'Compétences', score: 92, icon: 'Award', status: 'excellent' },
                { name: 'Formation', score: 88, icon: 'GraduationCap', status: 'good' },
                { name: 'Présentation', score: 65, icon: 'FileText', status: 'needs-improvement' }
            ],
            globalScore: 81,
            strengths: [
                'Expérience technique solide en développement',
                'Progression de carrière cohérente',
                'Compétences modernes et recherchées'
            ],
            weaknesses: [
                'Manque de quantification des résultats',
                'Présentation visuelle à améliorer',
                'Mots-clés ATS insuffisants'
            ],
            recommendations: [
                'Quantifier vos réalisations avec des chiffres',
                'Optimiser la mise en page pour la lisibilité',
                'Intégrer plus de mots-clés sectoriels',
                'Personnaliser selon les offres ciblées'
            ]
        },
        confidence: 94
    },

    'interview-report': {
        type: 'timer',
        title: 'Rapport d\'Entretien Simulé',
        data: {
            duration: 45,
            questions: [
                {
                    id: 1,
                    text: "Présentez-vous et votre parcours",
                    category: 'introduction',
                    difficulty: 'easy',
                    expectedTime: 180
                },
                {
                    id: 2,
                    text: "Décrivez un projet technique complexe",
                    category: 'technical',
                    difficulty: 'medium',
                    expectedTime: 300
                }
            ],
            globalScore: 76,
            strengths: ['Communication claire', 'Exemples concrets'],
            weaknesses: ['Nervosité apparente', 'Réponses trop courtes'],
            recommendations: [
                'Pratiquer la présentation personnelle',
                'Préparer plus d\'exemples STAR',
                'Travailler la confiance en soi'
            ]
        },
        confidence: 87
    }
};

// Messages d'évolution pour tester le système
const EVOLUTION_MESSAGES = [
    "Je veux me spécialiser en intelligence artificielle",
    "J'ai 5 ans d'expérience maintenant",
    "Mon objectif est de devenir CTO dans 5 ans",
    "Je préfère les startups aux grandes entreprises",
    "Je veux développer mes compétences en management"
];

export default function AIArtifactDemo() {
    // États principaux
    const [selectedArtifact, setSelectedArtifact] = useState<keyof typeof ARTIFACT_TEMPLATES>('career-roadmap');
    const [currentArtifact, setCurrentArtifact] = useState<any>(null);
    const [evolutionStep, setEvolutionStep] = useState(0);
    const [isEvolution, setIsEvolution] = useState(false);
    const [customMessage, setCustomMessage] = useState('');
    
    // États de l'interface
    const [showArtifact, setShowArtifact] = useState(false);
    const [animationState, setAnimationState] = useState('idle'); // idle, generating, evolving
    const [evolutionHistory, setEvolutionHistory] = useState<any[]>([]);
    
    // Stats temps réel
    const [stats, setStats] = useState({
        generationTime: 0,
        evolutionCount: 0,
        confidenceLevel: 0,
        totalChanges: 0
    });

    // Génération initiale d'un artefact
    const handleGenerateArtifact = async () => {
        setAnimationState('generating');
        setShowArtifact(false);
        
        // Simuler temps de génération
        const startTime = Date.now();
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const template = ARTIFACT_TEMPLATES[selectedArtifact];
        const artifact = {
            ...template,
            id: `${selectedArtifact}-${Date.now()}`,
            metadata: {
                aiGenerated: true,
                timestamp: Date.now(),
                version: 1,
                interactive: true
            }
        };
        
        setCurrentArtifact(artifact);
        setStats(prev => ({
            ...prev,
            generationTime: Date.now() - startTime,
            confidenceLevel: template.confidence,
            evolutionCount: 0,
            totalChanges: 0
        }));
        
        setEvolutionHistory([{
            timestamp: Date.now(),
            artifact: JSON.parse(JSON.stringify(artifact)),
            trigger: 'initial_generation',
            changes: ['Artefact créé']
        }]);
        
        setAnimationState('idle');
        setShowArtifact(true);
        
        // Enregistrer pour évolution
        if (selectedArtifact === 'career-roadmap') {
            ArtifactEvolutionManager.registerForEvolution(artifact, []);
        }
    };

    // Évolution avec un message
    const handleEvolveArtifact = async (message?: string) => {
        if (!currentArtifact) return;
        
        setAnimationState('evolving');
        setIsEvolution(true);
        
        const evolutionMessage = message || EVOLUTION_MESSAGES[evolutionStep % EVOLUTION_MESSAGES.length];
        
        // Simuler évolution IA
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const updatedArtifact = await simulateArtifactEvolution(currentArtifact, evolutionMessage);
        
        setCurrentArtifact(updatedArtifact);
        setEvolutionStep(prev => prev + 1);
        
        // Ajouter à l'historique
        const newHistoryEntry = {
            timestamp: Date.now(),
            artifact: JSON.parse(JSON.stringify(updatedArtifact)),
            trigger: evolutionMessage,
            changes: calculateChanges(currentArtifact, updatedArtifact)
        };
        
        setEvolutionHistory(prev => [...prev, newHistoryEntry]);
        setStats(prev => ({
            ...prev,
            evolutionCount: prev.evolutionCount + 1,
            totalChanges: prev.totalChanges + newHistoryEntry.changes.length
        }));
        
        setAnimationState('idle');
        setIsEvolution(false);
    };

    // Simuler l'évolution d'un artefact
    const simulateArtifactEvolution = async (artifact: any, message: string) => {
        const messageLower = message.toLowerCase();
        
        if (artifact.type === 'roadmap') {
            const updatedData = { ...artifact.data };
            
            // Modifier selon le message
            if (messageLower.includes('ia') || messageLower.includes('intelligence')) {
                updatedData.steps = [
                    ...updatedData.steps,
                    {
                        id: 'ai-specialization',
                        title: 'Spécialisation en Intelligence Artificielle',
                        timeframe: '6-12 mois',
                        priority: 'high',
                        category: 'skill',
                        progress: 0,
                        completed: false,
                        description: 'Maîtriser ML/DL et intégration IA'
                    }
                ];
                updatedData.targetPosition = 'AI Tech Lead';
            }
            
            if (messageLower.includes('management')) {
                updatedData.steps.push({
                    id: 'management-training',
                    title: 'Formation management avancé',
                    timeframe: '3-6 mois',
                    priority: 'high',
                    category: 'skill',
                    progress: 0,
                    completed: false,
                    description: 'Leadership et gestion d\'équipe'
                });
            }
            
            return { ...artifact, data: updatedData };
        }
        
        return artifact;
    };

    // Calculer les changements entre deux versions
    const calculateChanges = (oldArtifact: any, newArtifact: any): string[] => {
        const changes = [];
        
        if (oldArtifact.data.steps && newArtifact.data.steps) {
            const oldStepCount = oldArtifact.data.steps.length;
            const newStepCount = newArtifact.data.steps.length;
            
            if (newStepCount > oldStepCount) {
                changes.push(`+${newStepCount - oldStepCount} nouvelle(s) étape(s)`);
            }
        }
        
        if (oldArtifact.data.targetPosition !== newArtifact.data.targetPosition) {
            changes.push(`Objectif mis à jour: ${newArtifact.data.targetPosition}`);
        }
        
        if (changes.length === 0) {
            changes.push('Données contextuelles enrichies');
        }
        
        return changes;
    };

    // Reset de la démo
    const handleResetDemo = () => {
        setCurrentArtifact(null);
        setShowArtifact(false);
        setEvolutionStep(0);
        setEvolutionHistory([]);
        setAnimationState('idle');
        setIsEvolution(false);
        setStats({
            generationTime: 0,
            evolutionCount: 0,
            confidenceLevel: 0,
            totalChanges: 0
        });
    };

    // Rendre l'artefact selon son type
    const renderArtifact = () => {
        if (!currentArtifact) return null;
        
        const props = {
            data: currentArtifact.data,
            messageContent: '',
            onAction: (action: string, data: any) => {
                console.log('Action artefact:', action, data);
            }
        };
        
        switch (currentArtifact.type) {
            case 'roadmap':
                return <CareerRoadmapArtifact {...props} />;
            case 'heatmap':
                return <CVHeatmapArtifact {...props} />;
            case 'timer':
                return <InterviewReportArtifact {...props} />;
            default:
                return <div>Type d'artefact non supporté</div>;
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header Amélioré */}
            <div className="text-center space-y-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-4"
                >
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-purple-500 flex items-center justify-center shadow-lg">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        {animationState !== 'idle' && (
                            <div className="absolute inset-0 rounded-full border-4 border-amber-200 animate-pulse" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-purple-600 bg-clip-text text-transparent">
                            Artefacts IA Évolutifs
                        </h1>
                        <p className="text-lg text-gray-600">
                            Laboratoire de test et démonstration interactive
                        </p>
                    </div>
                </motion.div>

                {/* Stats Temps Réel Améliorées */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center gap-4 flex-wrap"
                >
                    <Badge variant="secondary" className="flex items-center gap-2 px-3 py-2">
                        <Brain className="w-4 h-4" />
                        <span className="font-medium">
                            {animationState === 'generating' ? 'Génération...' : 
                             animationState === 'evolving' ? 'Évolution...' : 'Prêt'}
                        </span>
                    </Badge>
                    
                    {stats.generationTime > 0 && (
                        <Badge variant="secondary" className="flex items-center gap-2 px-3 py-2">
                            <Zap className="w-4 h-4" />
                            {(stats.generationTime / 1000).toFixed(1)}s génération
                        </Badge>
                    )}
                    
                    {stats.evolutionCount > 0 && (
                        <Badge variant="secondary" className="flex items-center gap-2 px-3 py-2">
                            <RefreshCw className="w-4 h-4" />
                            {stats.evolutionCount} évolution{stats.evolutionCount > 1 ? 's' : ''}
                        </Badge>
                    )}
                    
                    {stats.confidenceLevel > 0 && (
                        <Badge variant="secondary" className="flex items-center gap-2 px-3 py-2">
                            <Target className="w-4 h-4" />
                            {stats.confidenceLevel}% confiance
                        </Badge>
                    )}
                </motion.div>
            </div>

            {/* Interface à Onglets Moderne */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Panel de Contrôle */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            Centre de Contrôle
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Sélection d'Artefact */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700">
                                Type d'artefact
                            </label>
                            <Tabs value={selectedArtifact} onValueChange={(value) => setSelectedArtifact(value as any)}>
                                <TabsList className="grid w-full grid-cols-1 h-auto">
                                    <TabsTrigger value="career-roadmap" className="flex items-center gap-2 h-12">
                                        <MapPin className="w-4 h-4" />
                                        <div className="text-left">
                                            <div className="font-medium">Roadmap Carrière</div>
                                            <div className="text-xs text-gray-500">Plan évolutif</div>
                                        </div>
                                    </TabsTrigger>
                                    <TabsTrigger value="cv-analysis" className="flex items-center gap-2 h-12">
                                        <FileText className="w-4 h-4" />
                                        <div className="text-left">
                                            <div className="font-medium">Analyse CV</div>
                                            <div className="text-xs text-gray-500">Heatmap interactive</div>
                                        </div>
                                    </TabsTrigger>
                                    <TabsTrigger value="interview-report" className="flex items-center gap-2 h-12">
                                        <Clock className="w-4 h-4" />
                                        <div className="text-left">
                                            <div className="font-medium">Rapport Entretien</div>
                                            <div className="text-xs text-gray-500">Feedback IA</div>
                                        </div>
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        {/* Actions Principales */}
                        <div className="space-y-3">
                            <Button 
                                onClick={handleGenerateArtifact} 
                                className="w-full bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600"
                                disabled={animationState !== 'idle'}
                            >
                                <Play className="w-4 h-4 mr-2" />
                                {animationState === 'generating' ? 'Génération...' : 'Générer Artefact'}
                            </Button>

                            {showArtifact && (
                                <>
                                    <Button 
                                        onClick={() => handleEvolveArtifact()}
                                        variant="outline" 
                                        className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                                        disabled={animationState !== 'idle'}
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        {animationState === 'evolving' ? 'Évolution...' : 'Faire Évoluer'}
                                    </Button>

                                    <Button 
                                        onClick={handleResetDemo}
                                        variant="ghost" 
                                        className="w-full"
                                    >
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Réinitialiser
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Message Personnalisé */}
                        {showArtifact && (
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700">
                                    Message d'évolution personnalisé
                                </label>
                                <div className="space-y-2">
                                    <Textarea
                                        value={customMessage}
                                        onChange={(e) => setCustomMessage(e.target.value)}
                                        placeholder="Ex: Je veux me spécialiser en IA..."
                                        className="resize-none h-20"
                                    />
                                    <Button 
                                        size="sm" 
                                        onClick={() => {
                                            if (customMessage.trim()) {
                                                handleEvolveArtifact(customMessage);
                                                setCustomMessage('');
                                            }
                                        }}
                                        disabled={!customMessage.trim() || animationState !== 'idle'}
                                        className="w-full"
                                    >
                                        <MessageSquare className="w-3 h-3 mr-2" />
                                        Appliquer Évolution
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Évolutions Rapides */}
                        {showArtifact && (
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700">
                                    Évolutions rapides
                                </label>
                                <div className="grid grid-cols-1 gap-2">
                                    {EVOLUTION_MESSAGES.slice(0, 3).map((message, index) => (
                                        <Button
                                            key={index}
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEvolveArtifact(message)}
                                            disabled={animationState !== 'idle'}
                                            className="text-left justify-start text-xs p-2 h-auto"
                                        >
                                            <ArrowRight className="w-3 h-3 mr-1 flex-shrink-0" />
                                            <span className="truncate">{message}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Zone d'Affichage Principal */}
                <div className="lg:col-span-2 space-y-4">
                    {!showArtifact ? (
                        <Card className="h-96 flex items-center justify-center border-2 border-dashed border-gray-300">
                            <div className="text-center space-y-4">
                                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                                    <Eye className="w-12 h-12 text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Aucun artefact généré</h3>
                                    <p className="text-gray-500 mt-1">
                                        Sélectionnez un type d'artefact et cliquez sur "Générer" pour commencer
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentArtifact?.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="relative overflow-hidden">
                                    {/* Badge d'évolution */}
                                    {isEvolution && (
                                        <div className="absolute top-4 right-4 z-10">
                                            <Badge className="bg-purple-100 text-purple-700 border-purple-200 flex items-center gap-1">
                                                <Activity className="w-3 h-3" />
                                                Évolution en cours
                                            </Badge>
                                        </div>
                                    )}
                                    
                                    {/* Artefact */}
                                    {renderArtifact()}
                                </Card>
                            </motion.div>
                        </AnimatePresence>
                    )}

                    {/* Historique des Évolutions */}
                    {evolutionHistory.length > 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Activity className="w-4 h-4" />
                                    Historique des Évolutions ({evolutionHistory.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 max-h-48 overflow-y-auto">
                                    {evolutionHistory.slice().reverse().map((entry, index) => (
                                        <motion.div
                                            key={entry.timestamp}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-bold text-purple-600">
                                                    {evolutionHistory.length - index}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 mb-1">
                                                    {entry.trigger === 'initial_generation' ? 'Création initiale' : entry.trigger}
                                                </div>
                                                <div className="text-xs text-gray-500 mb-2">
                                                    {new Date(entry.timestamp).toLocaleTimeString()}
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {entry.changes.map((change, i) => (
                                                        <Badge key={i} variant="outline" className="text-xs">
                                                            {change}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Footer avec Statistiques */}
            {showArtifact && (
                <Card className="bg-gradient-to-r from-amber-50 to-purple-50 border-amber-200">
                    <CardContent className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-amber-600">
                                    {stats.generationTime > 0 ? (stats.generationTime / 1000).toFixed(1) : '0'}s
                                </div>
                                <div className="text-sm text-gray-600">Temps génération</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-purple-600">
                                    {stats.evolutionCount}
                                </div>
                                <div className="text-sm text-gray-600">Évolutions</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {stats.totalChanges}
                                </div>
                                <div className="text-sm text-gray-600">Changements</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {stats.confidenceLevel}%
                                </div>
                                <div className="text-sm text-gray-600">Confiance IA</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}