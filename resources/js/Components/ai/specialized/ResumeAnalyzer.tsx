import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Progress } from '@/Components/ui/progress';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
    PenTool, TrendingUp, Target, Eye, CheckCircle,
    AlertTriangle, XCircle, Star, BarChart3, Zap,
    FileText, Upload, Download, RefreshCw, Award,
    Users, Clock, Briefcase, GraduationCap
} from 'lucide-react';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/Components/ui/tabs';

interface ResumeAnalyzerProps {
    onSubmit: (data: ResumeAnalysisData) => void;
    userInfo: any;
    isLoading: boolean;
}

interface ResumeAnalysisData {
    analysisType: 'general' | 'targeted' | 'ats' | 'competitive';
    targetPosition: string;
    targetIndustry: string;
    focusAreas: string[];
    improvementGoals: string[];
    competitorLevel: string;
    analysisDepth: 'quick' | 'detailed' | 'comprehensive';
}

const ANALYSIS_TYPES = [
    {
        id: 'general',
        title: 'Analyse Générale',
        description: 'Évaluation complète de votre CV',
        icon: Eye,
        color: 'blue'
    },
    {
        id: 'targeted',
        title: 'Analyse Ciblée',
        description: 'Optimisation pour un poste spécifique',
        icon: Target,
        color: 'green'
    },
    {
        id: 'ats',
        title: 'Optimisation ATS',
        description: 'Compatibilité avec les systèmes de recrutement',
        icon: BarChart3,
        color: 'purple'
    },
    {
        id: 'competitive',
        title: 'Analyse Concurrentielle',
        description: 'Comparaison avec le marché',
        icon: TrendingUp,
        color: 'orange'
    }
];

const FOCUS_AREAS = [
    'Structure et mise en page', 'Contenu et descriptions', 'Mots-clés sectoriels',
    'Expériences professionnelles', 'Compétences techniques', 'Soft skills',
    'Formation et certifications', 'Projets et réalisations', 'Langues',
    'Centres d\'intérêt', 'Références professionnelles'
];

const IMPROVEMENT_GOALS = [
    'Augmenter le taux de réponse', 'Passer les filtres ATS', 'Se démarquer de la concurrence',
    'Valoriser l\'expérience', 'Combler les lacunes', 'Moderniser le format',
    'Optimiser pour mobile', 'Améliorer la lisibilité', 'Renforcer la cohérence'
];

const CV_CRITERIA = [
    { name: 'Structure', weight: 15 },
    { name: 'Contenu', weight: 25 },
    { name: 'Mots-clés', weight: 20 },
    { name: 'Expériences', weight: 20 },
    { name: 'Compétences', weight: 10 },
    { name: 'Présentation', weight: 10 }
];

export default function ResumeAnalyzer({ onSubmit, userInfo, isLoading }: ResumeAnalyzerProps) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<ResumeAnalysisData>({
        analysisType: 'general',
        targetPosition: '',
        targetIndustry: userInfo?.profession || '',
        focusAreas: [],
        improvementGoals: [],
        competitorLevel: 'same-level',
        analysisDepth: 'detailed'
    });

    const [currentScore, setCurrentScore] = useState<number>(0);
    const [criteriaScores, setCriteriaScores] = useState<{[key: string]: number}>({});

    // Simulation de score basé sur les données utilisateur
    useEffect(() => {
        const calculateScore = () => {
            let score = 50; // Score de base
            
            // Bonus basé sur les données utilisateur
            if (userInfo?.experiences?.length > 0) score += 15;
            if (userInfo?.competences?.length > 3) score += 10;
            if (userInfo?.languages?.length > 1) score += 10;
            if (userInfo?.personalInformation?.photo) score += 5;
            if (userInfo?.summaries?.length > 0) score += 10;
            
            setCurrentScore(Math.min(100, score));
            
            // Scores par critère (simulation)
            setCriteriaScores({
                'Structure': Math.min(100, score + Math.random() * 20 - 10),
                'Contenu': Math.min(100, score + Math.random() * 20 - 10),
                'Mots-clés': Math.min(100, score + Math.random() * 20 - 10),
                'Expériences': Math.min(100, score + Math.random() * 20 - 10),
                'Compétences': Math.min(100, score + Math.random() * 20 - 10),
                'Présentation': Math.min(100, score + Math.random() * 20 - 10)
            });
        };
        
        calculateScore();
    }, [userInfo]);

    const handleSubmit = () => {
        const prompt = generateResumeAnalysisPrompt(formData, userInfo);
        onSubmit({ ...formData, prompt, currentScore, criteriaScores });
    };

    const generateResumeAnalysisPrompt = (data: ResumeAnalysisData, userInfo: any) => {
        return `Analysez mon CV selon les critères suivants :

**Type d'analyse :** ${data.analysisType}
${data.targetPosition ? `**Poste visé :** ${data.targetPosition}` : ''}
${data.targetIndustry ? `**Secteur cible :** ${data.targetIndustry}` : ''}

**Zones d'amélioration prioritaires :** ${data.focusAreas.join(', ')}
**Objectifs d'amélioration :** ${data.improvementGoals.join(', ')}
**Niveau de profondeur :** ${data.analysisDepth}

**Mon profil actuel :**
- Profession : ${userInfo?.profession}
- Expériences : ${userInfo?.experiences?.length || 0} postes
- Compétences : ${userInfo?.competences?.map(c => c.name).join(', ')}
- Langues : ${userInfo?.languages?.map(l => l.name).join(', ')}

Donnez-moi une analyse détaillée avec :
1. Score global et par critère
2. Points forts à maintenir
3. Axes d'amélioration prioritaires
4. Recommandations concrètes
5. Exemples de reformulation`;
    };

    const toggleArrayItem = (array: string[], item: string, setter: (items: string[]) => void) => {
        if (array.includes(item)) {
            setter(array.filter(i => i !== item));
        } else {
            setter([...array, item]);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-orange-600';
        return 'text-red-600';
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return 'bg-green-100 border-green-200';
        if (score >= 60) return 'bg-orange-100 border-orange-200';
        return 'bg-red-100 border-red-200';
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header avec score actuel */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-purple-500">
                        <PenTool className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                            Analyseur de CV IA
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Optimisez votre CV avec des recommandations personnalisées
                        </p>
                    </div>
                </div>

                {/* Score actuel */}
                <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl border ${getScoreBg(currentScore)}`}>
                    <div className="text-center">
                        <div className={`text-3xl font-bold ${getScoreColor(currentScore)}`}>
                            {Math.round(currentScore)}
                        </div>
                        <div className="text-xs text-gray-600">Score actuel</div>
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-medium text-gray-800">
                            {currentScore >= 80 ? 'Excellent CV' :
                             currentScore >= 60 ? 'Bon CV' : 'CV à améliorer'}
                        </div>
                        <div className="text-xs text-gray-600">
                            Basé sur votre profil actuel
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration de l'analyse */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Type d'Analyse</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {ANALYSIS_TYPES.map(type => {
                                    const Icon = type.icon;
                                    const isSelected = formData.analysisType === type.id;
                                    
                                    return (
                                        <motion.div
                                            key={type.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setFormData(prev => ({ ...prev, analysisType: type.id as any }))}
                                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                                isSelected
                                                    ? `bg-${type.color}-50 border-${type.color}-300 dark:bg-${type.color}-950/50`
                                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <Icon className={`w-5 h-5 text-${type.color}-600`} />
                                                <span className="font-medium">{type.title}</span>
                                                {isSelected && <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />}
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {type.description}
                                            </p>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Configuration spécifique selon le type */}
                    {formData.analysisType === 'targeted' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Poste Cible</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="targetPosition">Intitulé du poste visé</Label>
                                        <Input
                                            id="targetPosition"
                                            value={formData.targetPosition}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                targetPosition: e.target.value
                                            }))}
                                            placeholder="Ex: Senior Product Manager"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="targetIndustry">Secteur cible</Label>
                                        <Input
                                            id="targetIndustry"
                                            value={formData.targetIndustry}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                targetIndustry: e.target.value
                                            }))}
                                            placeholder="Ex: FinTech, E-commerce..."
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Zones de focus */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Zones d'Analyse Prioritaires</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {FOCUS_AREAS.map(area => (
                                    <button
                                        key={area}
                                        type="button"
                                        onClick={() => toggleArrayItem(
                                            formData.focusAreas, 
                                            area, 
                                            (items) => setFormData(prev => ({ ...prev, focusAreas: items }))
                                        )}
                                        className={`p-2 text-xs rounded-lg border transition-all text-left ${
                                            formData.focusAreas.includes(area)
                                                ? 'bg-purple-100 border-purple-300 text-purple-700'
                                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-purple-50'
                                        }`}
                                    >
                                        {area}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Panneau de droite - Aperçu et scores */}
                <div className="space-y-6">
                    {/* Score détaillé par critère */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <BarChart3 className="w-4 h-4" />
                                Scores par Critère
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {CV_CRITERIA.map(criterion => {
                                const score = criteriaScores[criterion.name] || 0;
                                return (
                                    <div key={criterion.name} className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {criterion.name}
                                            </span>
                                            <span className={`text-xs font-bold ${getScoreColor(score)}`}>
                                                {Math.round(score)}%
                                            </span>
                                        </div>
                                        <Progress 
                                            value={score} 
                                            className="h-1.5"
                                        />
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Statistiques du profil */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4" />
                                Votre Profil
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                    <Briefcase className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                                    <div className="font-bold">{userInfo?.experiences?.length || 0}</div>
                                    <div className="text-gray-600">Expériences</div>
                                </div>
                                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                    <Star className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                                    <div className="font-bold">{userInfo?.competences?.length || 0}</div>
                                    <div className="text-gray-600">Compétences</div>
                                </div>
                                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                    <GraduationCap className="w-4 h-4 mx-auto mb-1 text-green-600" />
                                    <div className="font-bold">{userInfo?.languages?.length || 0}</div>
                                    <div className="text-gray-600">Langues</div>
                                </div>
                                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                    <FileText className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                                    <div className="font-bold">{userInfo?.summaries?.length || 0}</div>
                                    <div className="text-gray-600">Résumés</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recommandations rapides */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Zap className="w-4 h-4 text-amber-600" />
                                Améliorations Rapides
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-xs">
                                {currentScore < 80 && (
                                    <Alert className="border-amber-200 bg-amber-50 p-2">
                                        <AlertTriangle className="w-3 h-3" />
                                        <AlertDescription className="text-xs">
                                            Ajoutez un résumé professionnel pour +10 points
                                        </AlertDescription>
                                    </Alert>
                                )}
                                
                                {userInfo?.competences?.length < 5 && (
                                    <Alert className="border-blue-200 bg-blue-50 p-2">
                                        <Star className="w-3 h-3" />
                                        <AlertDescription className="text-xs">
                                            Ajoutez plus de compétences pour +5 points
                                        </AlertDescription>
                                    </Alert>
                                )}
                                
                                {!userInfo?.personalInformation?.photo && (
                                    <Alert className="border-purple-200 bg-purple-50 p-2">
                                        <Upload className="w-3 h-3" />
                                        <AlertDescription className="text-xs">
                                            Ajoutez une photo professionnelle pour +5 points
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Bouton d'analyse */}
            <div className="text-center">
                                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        size="lg"
                        className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 px-8"
                    >
                    {isLoading ? (
                        <>
                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                            Analyse en cours...
                        </>
                    ) : (
                        <>
                            <PenTool className="w-5 h-5 mr-2" />
                            Analyser mon CV
                        </>
                    )}
                </Button>
                
                <p className="text-xs text-gray-500 mt-2">
                    Analyse complète en ~30 secondes
                </p>
            </div>
        </div>
    );
}