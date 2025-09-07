import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import {
    Target, TrendingUp, Eye, Star, AlertCircle, CheckCircle,
    FileText, Building, MapPin, Clock, Users, Zap, Download,
    RefreshCw, BarChart3, Hash, Award, Lightbulb
} from 'lucide-react';

interface JobAnalyzerArtifactProps {
    data: {
        scores: { [key: string]: { value: number, max: number } };
        actionItems: string[];
    };
    messageContent: string;
    onAction?: (action: string, data: any) => void;
}

interface KeywordMatch {
    keyword: string;
    frequency: number;
    inProfile: boolean;
    importance: 'high' | 'medium' | 'low';
    category: 'technical' | 'soft' | 'industry' | 'role';
}

interface MatchingAnalysis {
    overallScore: number;
    profileStrength: number;
    missingSkills: string[];
    strongPoints: string[];
    recommendations: string[];
}

export default function JobAnalyzerArtifact({ data, messageContent, onAction }: JobAnalyzerArtifactProps) {
    const [viewMode, setViewMode] = useState<'overview' | 'keywords' | 'recommendations'>('overview');
    const [animatedScore, setAnimatedScore] = useState(0);

    // Analyser les mots-clés de l'offre (simulation intelligente)
    const analyzeKeywords = (): KeywordMatch[] => {
        return [
            { keyword: 'React', frequency: 3, inProfile: true, importance: 'high', category: 'technical' },
            { keyword: 'TypeScript', frequency: 2, inProfile: true, importance: 'high', category: 'technical' },
            { keyword: 'Node.js', frequency: 2, inProfile: false, importance: 'high', category: 'technical' },
            { keyword: 'Leadership', frequency: 1, inProfile: false, importance: 'medium', category: 'soft' },
            { keyword: 'Agile', frequency: 2, inProfile: true, importance: 'medium', category: 'industry' },
            { keyword: 'Docker', frequency: 1, inProfile: false, importance: 'medium', category: 'technical' },
            { keyword: 'Communication', frequency: 1, inProfile: true, importance: 'medium', category: 'soft' },
            { keyword: 'Senior', frequency: 2, inProfile: true, importance: 'high', category: 'role' }
        ];
    };

    // Générer l'analyse de matching
    const generateMatchingAnalysis = (): MatchingAnalysis => {
        const keywords = analyzeKeywords();
        const matchedKeywords = keywords.filter(k => k.inProfile);
        const overallScore = Math.round((matchedKeywords.length / keywords.length) * 100);
        
        return {
            overallScore,
            profileStrength: 75,
            missingSkills: keywords.filter(k => !k.inProfile && k.importance === 'high').map(k => k.keyword),
            strongPoints: keywords.filter(k => k.inProfile && k.importance === 'high').map(k => k.keyword),
            recommendations: [
                'Ajouter Node.js dans vos compétences techniques',
                'Mentionner votre expérience en leadership',
                'Utiliser le mot-clé "Docker" dans votre CV',
                'Mettre en avant vos projets React/TypeScript'
            ]
        };
    };

    const keywords = analyzeKeywords();
    const analysis = generateMatchingAnalysis();

    // Animation du score
    useEffect(() => {
        let start = 0;
        const end = analysis.overallScore;
        const duration = 2000;
        const startTime = Date.now();

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const current = Math.round(start + (end - start) * progress);
            setAnimatedScore(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [analysis.overallScore]);

    const getImportanceColor = (importance: string) => {
        switch (importance) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200';
            case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'low': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'technical': return Star;
            case 'soft': return Users;
            case 'industry': return Building;
            case 'role': return Target;
            default: return Hash;
        }
    };

    return (
        <div className="space-y-4">
            {/* Header de l'artefact */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Target className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-amber-800">Analyse Offre d'Emploi</h3>
                        <p className="text-xs text-amber-600">Compatibilité avec votre profil</p>
                    </div>
                </div>
                
                <div className="flex bg-amber-100 rounded-lg p-1">
                    {['overview', 'keywords', 'recommendations'].map(mode => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode as any)}
                            className={`px-3 py-1 rounded text-xs transition-all capitalize ${
                                viewMode === mode 
                                    ? 'bg-amber-500 text-white' 
                                    : 'text-amber-700 hover:bg-amber-200'
                            }`}
                        >
                            {mode === 'overview' ? 'Aperçu' : mode === 'keywords' ? 'Mots-clés' : 'Actions'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Vue Aperçu */}
            {viewMode === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Score de matching */}
                    <Card className="bg-white dark:bg-gray-800 border-amber-200">
                        <CardContent className="p-4 text-center">
                            <div className="relative w-24 h-24 mx-auto mb-4">
                                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        className="text-gray-200"
                                    />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={`${(animatedScore / 100) * 251.2} 251.2`}
                                        className={`${animatedScore >= 70 ? 'text-green-500' : animatedScore >= 50 ? 'text-amber-500' : 'text-red-500'} transition-all duration-1000`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className={`text-xl font-bold ${animatedScore >= 70 ? 'text-green-600' : animatedScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                            {animatedScore}%
                                        </div>
                                        <div className="text-xs text-gray-500">Match</div>
                                    </div>
                                </div>
                            </div>
                            
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                Score de Compatibilité
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {animatedScore >= 70 ? 'Excellent profil pour ce poste' :
                                 animatedScore >= 50 ? 'Bon potentiel avec améliorations' :
                                 'Profil à renforcer significativement'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Points forts et faibles */}
                    <Card className="bg-white dark:bg-gray-800 border-purple-200">
                        <CardContent className="p-4">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-purple-600" />
                                Analyse Rapide
                            </h4>
                            
                            <div className="space-y-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <CheckCircle className="w-3 h-3 text-green-600" />
                                        <span className="text-xs font-medium text-green-700">Points forts</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {analysis.strongPoints.map(point => (
                                            <Badge key={point} className="bg-green-100 text-green-700 text-xs">
                                                {point}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <AlertCircle className="w-3 h-3 text-red-600" />
                                        <span className="text-xs font-medium text-red-700">Compétences manquantes</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {analysis.missingSkills.map(skill => (
                                            <Badge key={skill} className="bg-red-100 text-red-700 text-xs">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Vue Mots-clés */}
            {viewMode === 'keywords' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {keywords.map((keyword, index) => {
                            const Icon = getCategoryIcon(keyword.category);
                            
                            return (
                                <motion.div
                                    key={keyword.keyword}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`p-3 rounded-lg border-2 text-center transition-all hover:shadow-md ${
                                        keyword.inProfile 
                                            ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                                            : 'bg-red-50 border-red-200 hover:bg-red-100'
                                    }`}
                                >
                                    <div className="flex items-center justify-center mb-2">
                                        <Icon className={`w-4 h-4 ${keyword.inProfile ? 'text-green-600' : 'text-red-600'}`} />
                                    </div>
                                    
                                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                                        {keyword.keyword}
                                    </div>
                                    
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Badge className={`${getImportanceColor(keyword.importance)} text-xs px-2 py-1`}>
                                            {keyword.importance}
                                        </Badge>
                                        <span className="text-xs text-gray-500">×{keyword.frequency}</span>
                                    </div>
                                    
                                    {keyword.inProfile ? (
                                        <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                                    ) : (
                                        <Button 
                                            size="sm" 
                                            className="w-full h-6 text-xs bg-red-500 hover:bg-red-600 text-white"
                                            onClick={() => onAction?.('add-skill', keyword)}
                                        >
                                            Ajouter
                                        </Button>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Légende */}
                    <Card className="bg-amber-50 border-amber-200">
                        <CardContent className="p-3">
                            <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                                    <span>Dans votre profil</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                                    <span>Manquant</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Hash className="w-3 h-3 text-amber-600" />
                                    <span>Fréquence dans l'offre</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Vue Recommandations */}
            {viewMode === 'recommendations' && (
                <div className="space-y-3">
                    {analysis.recommendations.map((recommendation, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="bg-white dark:bg-gray-800 border-amber-200 hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-purple-500 rounded-full flex items-center justify-center mt-0.5">
                                            <span className="text-white text-xs font-bold">{index + 1}</span>
                                        </div>
                                        
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                                {recommendation}
                                            </p>
                                            
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-amber-100 text-amber-700 text-xs">
                                                    <Lightbulb className="w-2.5 h-2.5 mr-1" />
                                                    Action suggérée
                                                </Badge>
                                                
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost"
                                                    className="h-6 px-2 text-amber-600 hover:bg-amber-50"
                                                    onClick={() => onAction?.('apply-recommendation', { recommendation, index })}
                                                >
                                                    <Zap className="w-3 h-3 mr-1" />
                                                    Appliquer
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Actions globales */}
            <Card className="bg-gradient-to-r from-amber-50 to-purple-50 border-amber-200">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-600" />
                            <span className="font-semibold text-amber-800">Actions recommandées</span>
                        </div>
                        <Badge className={`${analysis.overallScore >= 70 ? 'bg-green-100 text-green-700' : analysis.overallScore >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            {analysis.overallScore >= 70 ? 'Profil compatible' : 
                             analysis.overallScore >= 50 ? 'Améliorations nécessaires' : 
                             'Profil à renforcer'}
                        </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mb-4">
                        <div className="text-center">
                            <div className="text-lg font-bold text-green-600">
                                {keywords.filter(k => k.inProfile).length}
                            </div>
                            <div className="text-gray-600">Compétences matchées</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-red-600">
                                {keywords.filter(k => !k.inProfile && k.importance === 'high').length}
                            </div>
                            <div className="text-gray-600">Compétences critiques manquantes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">
                                {analysis.profileStrength}%
                            </div>
                            <div className="text-gray-600">Force du profil</div>
                        </div>
                    </div>
                    
                    <div className="flex justify-center gap-3">
                        <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-amber-500 to-purple-500 text-white"
                            onClick={() => onAction?.('optimize-for-job', { keywords, analysis })}
                        >
                            <Zap className="w-3 h-3 mr-2" />
                            Optimiser CV pour ce poste
                        </Button>
                        
                        <Button 
                            size="sm" 
                            variant="outline"
                            className="border-amber-200 text-amber-700 hover:bg-amber-50"
                            onClick={() => onAction?.('generate-cover-letter', { keywords, analysis })}
                        >
                            <FileText className="w-3 h-3 mr-2" />
                            Générer lettre
                        </Button>
                        
                        <Button 
                            size="sm" 
                            variant="outline"
                            className="border-purple-200 text-purple-700 hover:bg-purple-50"
                            onClick={() => onAction?.('export-analysis', { keywords, analysis })}
                        >
                            <Download className="w-3 h-3 mr-2" />
                            Exporter
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}