import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import {
    MessageSquare, TrendingUp, Star, AlertTriangle, CheckCircle,
    Clock, Award, Target, Users, Brain, Mic, Eye,
    BarChart3, Download, RefreshCw, Lightbulb, Zap
} from 'lucide-react';

interface InterviewReportArtifactProps {
    data: {
        scores: { [key: string]: { value: number, max: number } };
        actionItems: string[];
    };
    messageContent: string;
    onAction?: (action: string, data: any) => void;
}

interface InterviewMetric {
    category: string;
    score: number;
    maxScore: number;
    feedback: string;
    improvements: string[];
    icon: any;
    color: string;
}

interface QuestionAnalysis {
    question: string;
    response: string;
    score: number;
    feedback: string;
    improvements: string[];
    category: 'technical' | 'behavioral' | 'situational' | 'company';
}

export default function InterviewReportArtifact({ data, messageContent, onAction }: InterviewReportArtifactProps) {
    const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'questions'>('overview');
    const [animatedScores, setAnimatedScores] = useState<{ [key: string]: number }>({});

    // Générer les métriques d'entretien
    const generateInterviewMetrics = (): InterviewMetric[] => {
        return [
            {
                category: 'Communication',
                score: 85,
                maxScore: 100,
                feedback: 'Excellente articulation des idées, bon débit de parole',
                improvements: ['Utiliser plus d\'exemples concrets', 'Réduire les "euh" et hésitations'],
                icon: MessageSquare,
                color: 'blue'
            },
            {
                category: 'Compétences Techniques',
                score: 75,
                maxScore: 100,
                feedback: 'Bonnes connaissances techniques démontrées',
                improvements: ['Approfondir les détails d\'implémentation', 'Donner plus d\'exemples de projets'],
                icon: Star,
                color: 'amber'
            },
            {
                category: 'Leadership',
                score: 60,
                maxScore: 100,
                feedback: 'Potentiel de leadership identifié mais à développer',
                improvements: ['Partager des exemples de gestion d\'équipe', 'Démontrer la prise d\'initiative'],
                icon: Users,
                color: 'purple'
            },
            {
                category: 'Résolution de Problèmes',
                score: 90,
                maxScore: 100,
                feedback: 'Approche méthodique et créative excellente',
                improvements: ['Continuer à structurer les réponses', 'Parfait !'],
                icon: Brain,
                color: 'green'
            },
            {
                category: 'Motivation & Fit',
                score: 70,
                maxScore: 100,
                feedback: 'Bonne motivation mais manque de spécificité entreprise',
                improvements: ['Rechercher plus l\'entreprise', 'Personnaliser les motivations'],
                icon: Target,
                color: 'orange'
            }
        ];
    };

    // Générer l'analyse des questions
    const generateQuestionAnalysis = (): QuestionAnalysis[] => {
        return [
            {
                question: "Parlez-moi de vous",
                response: "Développeur avec 3 ans d'expérience...",
                score: 80,
                feedback: "Bonne structure, présentation claire",
                improvements: ["Ajouter plus de spécificité sur les réalisations"],
                category: 'behavioral'
            },
            {
                question: "Pourquoi ce poste vous intéresse-t-il ?",
                response: "J'aime les défis techniques...",
                score: 65,
                feedback: "Motivation générale mais manque de personnalisation",
                improvements: ["Mentionner des projets spécifiques de l'entreprise", "Lier à votre parcours personnel"],
                category: 'company'
            },
            {
                question: "Comment gérez-vous le stress ?",
                response: "J'organise mes priorités et je communique...",
                score: 85,
                feedback: "Réponse structurée avec exemples concrets",
                improvements: ["Parfait ! Continuez ainsi"],
                category: 'behavioral'
            }
        ];
    };

    const metrics = generateInterviewMetrics();
    const questions = generateQuestionAnalysis();
    const globalScore = Math.round(metrics.reduce((acc, metric) => acc + metric.score, 0) / metrics.length);

    // Animation des scores
    useEffect(() => {
        const newAnimatedScores = {};
        metrics.forEach((metric, index) => {
            setTimeout(() => {
                let start = 0;
                const end = metric.score;
                const duration = 1500;
                const startTime = Date.now();

                const animate = () => {
                    const now = Date.now();
                    const progress = Math.min((now - startTime) / duration, 1);
                    const current = Math.round(start + (end - start) * progress);
                    
                    setAnimatedScores(prev => ({
                        ...prev,
                        [metric.category]: current
                    }));

                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    }
                };

                requestAnimationFrame(animate);
            }, index * 200);
        });
    }, []);

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-amber-600';
        return 'text-red-600';
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'behavioral': return 'amber';
            case 'technical': return 'blue';
            case 'company': return 'purple';
            case 'situational': return 'green';
            default: return 'gray';
        }
    };

    return (
        <div className="space-y-4">
            {/* Header de l'artefact */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-amber-800">Rapport d'Entretien IA</h3>
                        <p className="text-xs text-amber-600">Analyse de performance détaillée</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <Badge className={`${globalScore >= 80 ? 'bg-green-100 text-green-700' : globalScore >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        <Award className="w-3 h-3 mr-1" />
                        Score: {globalScore}/100
                    </Badge>
                    
                    <div className="flex bg-amber-100 rounded-lg p-1">
                        {['overview', 'detailed', 'questions'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode as any)}
                                className={`px-2 py-1 rounded text-xs transition-all ${
                                    viewMode === mode 
                                        ? 'bg-amber-500 text-white' 
                                        : 'text-amber-700 hover:bg-amber-200'
                                }`}
                            >
                                {mode === 'overview' ? 'Aperçu' : mode === 'detailed' ? 'Détaillé' : 'Questions'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Vue Aperçu */}
            {viewMode === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Score global avec graphique radar */}
                    <Card className="bg-white dark:bg-gray-800 border-amber-200">
                        <CardContent className="p-4 text-center">
                            <div className="relative w-32 h-32 mx-auto mb-4">
                                {/* Simulation graphique radar simple */}
                                <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
                                <div 
                                    className={`absolute inset-2 border-4 rounded-full transition-all duration-2000 ${
                                        globalScore >= 80 ? 'border-green-500' :
                                        globalScore >= 60 ? 'border-amber-500' : 'border-red-500'
                                    }`}
                                    style={{ 
                                        transform: `scale(${globalScore / 100})`,
                                        opacity: 0.7
                                    }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className={`text-2xl font-bold ${getScoreColor(globalScore)}`}>
                                            {globalScore}
                                        </div>
                                        <div className="text-xs text-gray-500">Score global</div>
                                    </div>
                                </div>
                            </div>
                            
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                Performance Globale
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {globalScore >= 80 ? 'Excellent entretien ! Très bonnes chances' :
                                 globalScore >= 60 ? 'Bon entretien avec points à améliorer' :
                                 'Entretien à retravailler significativement'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Top 3 points forts/faibles */}
                    <Card className="bg-white dark:bg-gray-800 border-purple-200">
                        <CardContent className="p-4">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-purple-600" />
                                Points Clés
                            </h4>
                            
                            <div className="space-y-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="w-3 h-3 text-green-600" />
                                        <span className="text-xs font-medium text-green-700">Points forts</span>
                                    </div>
                                    <div className="space-y-1">
                                        {metrics
                                            .filter(m => m.score >= 80)
                                            .slice(0, 2)
                                            .map(metric => (
                                                <div key={metric.category} className="text-xs text-gray-600 flex items-center gap-2">
                                                    <metric.icon className="w-3 h-3 text-green-600" />
                                                    {metric.category}: {metric.score}%
                                                </div>
                                            ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="w-3 h-3 text-red-600" />
                                        <span className="text-xs font-medium text-red-700">À améliorer</span>
                                    </div>
                                    <div className="space-y-1">
                                        {metrics
                                            .filter(m => m.score < 70)
                                            .slice(0, 2)
                                            .map(metric => (
                                                <div key={metric.category} className="text-xs text-gray-600 flex items-center gap-2">
                                                    <metric.icon className="w-3 h-3 text-red-600" />
                                                    {metric.category}: {metric.score}%
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Vue détaillée */}
            {viewMode === 'detailed' && (
                <div className="space-y-3">
                    {metrics.map((metric, index) => {
                        const Icon = metric.icon;
                        const score = animatedScores[metric.category] || 0;
                        
                        return (
                            <motion.div
                                key={metric.category}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="bg-white dark:bg-gray-800 border-amber-200 hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-purple-500 rounded-lg flex items-center justify-center">
                                                    <Icon className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                                                        {metric.category}
                                                    </h4>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        {metric.feedback}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="text-right">
                                                <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                                                    {score}%
                                                </div>
                                                <Progress value={score} className="w-20 h-2 mt-1" />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                                <Lightbulb className="w-3 h-3 text-amber-600" />
                                                Améliorations suggérées :
                                            </h5>
                                            {metric.improvements.map((improvement, i) => (
                                                <div key={i} className="flex items-start gap-2 text-sm">
                                                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                                                    <span className="text-gray-600 dark:text-gray-400 flex-1">{improvement}</span>
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost"
                                                        className="h-5 px-1 text-amber-600 hover:bg-amber-50"
                                                        onClick={() => onAction?.('practice-skill', { category: metric.category, improvement })}
                                                    >
                                                        <Zap className="w-2.5 h-2.5" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Vue Questions */}
            {viewMode === 'questions' && (
                <div className="space-y-3">
                    {questions.map((qa, index) => {
                        const color = getCategoryColor(qa.category);
                        
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className={`bg-white dark:bg-gray-800 border-${color}-200`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <MessageSquare className={`w-4 h-4 text-${color}-600`} />
                                                    <Badge className={`bg-${color}-100 text-${color}-700 text-xs`}>
                                                        {qa.category}
                                                    </Badge>
                                                </div>
                                                <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                                                    Q: {qa.question}
                                                </h5>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-2">
                                                    R: {qa.response}
                                                </p>
                                            </div>
                                            
                                            <div className="text-right ml-4">
                                                <div className={`text-lg font-bold ${getScoreColor(qa.score)}`}>
                                                    {qa.score}%
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-amber-50 dark:bg-amber-950/50 rounded-lg p-3">
                                            <p className="text-sm text-amber-800 dark:text-amber-300 mb-2">
                                                <strong>Feedback:</strong> {qa.feedback}
                                            </p>
                                            <div className="space-y-1">
                                                {qa.improvements.map((improvement, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-xs">
                                                        <Target className="w-3 h-3 text-amber-600" />
                                                        <span className="text-amber-700">{improvement}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Actions et résumé */}
            <Card className="bg-gradient-to-r from-amber-50 to-purple-50 border-amber-200">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-600" />
                            <span className="font-semibold text-amber-800">Plan d'amélioration</span>
                        </div>
                        <Badge className={`${globalScore >= 80 ? 'bg-green-100 text-green-700' : globalScore >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            {globalScore >= 80 ? 'Prêt pour entretiens' : 
                             globalScore >= 60 ? 'Quelques améliorations' : 
                             'Entraînement nécessaire'}
                        </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mb-4">
                        <div className="text-center">
                            <div className="text-lg font-bold text-green-600">
                                {metrics.filter(m => m.score >= 80).length}
                            </div>
                            <div className="text-gray-600">Compétences fortes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-amber-600">
                                {metrics.filter(m => m.score >= 60 && m.score < 80).length}
                            </div>
                            <div className="text-gray-600">À améliorer</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-red-600">
                                {metrics.filter(m => m.score < 60).length}
                            </div>
                            <div className="text-gray-600">Points faibles</div>
                        </div>
                    </div>
                    
                    <div className="flex justify-center gap-3">
                        <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-amber-500 to-purple-500 text-white"
                            onClick={() => onAction?.('schedule-practice', { weakAreas: metrics.filter(m => m.score < 70) })}
                        >
                            <Clock className="w-3 h-3 mr-2" />
                            Programmer entraînement
                        </Button>
                        
                        <Button 
                            size="sm" 
                            variant="outline"
                            className="border-amber-200 text-amber-700 hover:bg-amber-50"
                            onClick={() => onAction?.('export-report', { metrics, questions, globalScore })}
                        >
                            <Download className="w-3 h-3 mr-2" />
                            Exporter rapport
                        </Button>
                        
                        <Button 
                            size="sm" 
                            variant="outline"
                            className="border-purple-200 text-purple-700 hover:bg-purple-50"
                            onClick={() => onAction?.('new-simulation', {})}
                        >
                            <RefreshCw className="w-3 h-3 mr-2" />
                            Nouvelle simulation
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}