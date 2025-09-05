import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import {
    Eye, TrendingUp, AlertTriangle, CheckCircle, Star,
    FileText, User, Briefcase, GraduationCap, Award,
    Target, Zap, Download, RefreshCw, BarChart3
} from 'lucide-react';

interface CVHeatmapArtifactProps {
    data: {
        scores: { [key: string]: { value: number, max: number } };
        actionItems: string[];
    };
    messageContent: string;
    onAction?: (action: string, data: any) => void;
}

interface CVSection {
    id: string;
    name: string;
    icon: any;
    score: number;
    maxScore: number;
    status: 'excellent' | 'good' | 'needs-improvement' | 'critical';
    recommendations: string[];
    priority: number;
}

export default function CVHeatmapArtifact({ data, messageContent, onAction }: CVHeatmapArtifactProps) {
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'heatmap' | 'detailed'>('heatmap');

    // Générer les sections CV avec scores
    const generateCVSections = (): CVSection[] => {
        return [
            {
                id: 'personal-info',
                name: 'Informations Personnelles',
                icon: User,
                score: 85,
                maxScore: 100,
                status: 'good',
                recommendations: [
                    'Ajouter une photo professionnelle',
                    'Optimiser le titre professionnel',
                    'Compléter les liens sociaux'
                ],
                priority: 3
            },
            {
                id: 'summary',
                name: 'Résumé Professionnel',
                icon: FileText,
                score: 65,
                maxScore: 100,
                status: 'needs-improvement',
                recommendations: [
                    'Rendre le résumé plus impactant',
                    'Ajouter des mots-clés sectoriels',
                    'Quantifier les réalisations'
                ],
                priority: 1
            },
            {
                id: 'experience',
                name: 'Expériences',
                icon: Briefcase,
                score: 90,
                maxScore: 100,
                status: 'excellent',
                recommendations: [
                    'Parfait ! Expériences bien détaillées',
                    'Bon équilibre responsabilités/résultats'
                ],
                priority: 5
            },
            {
                id: 'skills',
                name: 'Compétences',
                icon: Star,
                score: 70,
                maxScore: 100,
                status: 'good',
                recommendations: [
                    'Ajouter 2-3 compétences techniques',
                    'Organiser par catégories',
                    'Préciser le niveau de maîtrise'
                ],
                priority: 2
            },
            {
                id: 'education',
                name: 'Formation',
                icon: GraduationCap,
                score: 80,
                maxScore: 100,
                status: 'good',
                recommendations: [
                    'Ajouter formations continues',
                    'Mentionner projets académiques'
                ],
                priority: 4
            }
        ];
    };

    const cvSections = generateCVSections();
    const globalScore = Math.round(cvSections.reduce((acc, section) => acc + section.score, 0) / cvSections.length);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'excellent': return { bg: 'bg-green-500', text: 'text-green-700', border: 'border-green-200' };
            case 'good': return { bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200' };
            case 'needs-improvement': return { bg: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-200' };
            case 'critical': return { bg: 'bg-red-500', text: 'text-red-700', border: 'border-red-200' };
            default: return { bg: 'bg-gray-500', text: 'text-gray-700', border: 'border-gray-200' };
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'excellent': return 'Excellent';
            case 'good': return 'Bon';
            case 'needs-improvement': return 'À améliorer';
            case 'critical': return 'Critique';
            default: return 'Non évalué';
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
                        <h3 className="font-bold text-amber-800">Analyse CV - Heatmap</h3>
                        <p className="text-xs text-amber-600">Zones d'amélioration identifiées</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <Badge className={`${globalScore >= 80 ? 'bg-green-100 text-green-700' : globalScore >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Score global: {globalScore}/100
                    </Badge>
                    
                    <div className="flex bg-amber-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('heatmap')}
                            className={`px-2 py-1 rounded text-xs transition-all ${
                                viewMode === 'heatmap' 
                                    ? 'bg-amber-500 text-white' 
                                    : 'text-amber-700 hover:bg-amber-200'
                            }`}
                        >
                            Heatmap
                        </button>
                        <button
                            onClick={() => setViewMode('detailed')}
                            className={`px-2 py-1 rounded text-xs transition-all ${
                                viewMode === 'detailed' 
                                    ? 'bg-amber-500 text-white' 
                                    : 'text-amber-700 hover:bg-amber-200'
                            }`}
                        >
                            Détaillé
                        </button>
                    </div>
                </div>
            </div>

            {/* Vue Heatmap */}
            {viewMode === 'heatmap' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-amber-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {cvSections.map((section, index) => {
                            const Icon = section.icon;
                            const colors = getStatusColor(section.status);
                            const intensity = section.score / section.maxScore;
                            
                            return (
                                <motion.div
                                    key={section.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${colors.border}`}
                                    style={{
                                        background: `linear-gradient(135deg, 
                                            ${intensity > 0.8 ? '#10b981' : 
                                              intensity > 0.6 ? '#f59e0b' : 
                                              intensity > 0.4 ? '#f97316' : '#ef4444'}15,
                                            ${intensity > 0.8 ? '#10b981' : 
                                              intensity > 0.6 ? '#f59e0b' : 
                                              intensity > 0.4 ? '#f97316' : '#ef4444'}05)`
                                    }}
                                    onClick={() => setSelectedSection(selectedSection === section.id ? null : section.id)}
                                >
                                    <div className="text-center">
                                        <Icon className={`w-6 h-6 mx-auto mb-2 ${colors.text}`} />
                                        <div className="text-xs font-medium text-gray-800 dark:text-gray-200 mb-1">
                                            {section.name}
                                        </div>
                                        <div className={`text-lg font-bold ${colors.text}`}>
                                            {section.score}%
                                        </div>
                                        <Badge className={`${colors.bg} ${colors.text} text-xs mt-1`}>
                                            {getStatusLabel(section.status)}
                                        </Badge>
                                    </div>

                                    {/* Indicateur de priorité */}
                                    <div className="absolute top-1 right-1">
                                        {Array.from({ length: 3 - section.priority + 1 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-1.5 h-1.5 rounded-full mb-0.5 ${
                                                    section.priority <= 2 ? 'bg-red-500' :
                                                    section.priority <= 3 ? 'bg-amber-500' : 'bg-green-500'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Détails de la section sélectionnée */}
                    <AnimatePresence>
                        {selectedSection && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pt-4 border-t border-amber-200"
                            >
                                {(() => {
                                    const section = cvSections.find(s => s.id === selectedSection);
                                    if (!section) return null;
                                    
                                    return (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <section.icon className="w-5 h-5 text-amber-600" />
                                                <h4 className="font-semibold text-amber-800">
                                                    {section.name} - Recommandations
                                                </h4>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                {section.recommendations.map((rec, index) => (
                                                    <div key={index} className="flex items-start gap-3 p-2 bg-amber-50 rounded-lg">
                                                        <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center mt-0.5">
                                                            <span className="text-white text-xs font-bold">{index + 1}</span>
                                                        </div>
                                                        <span className="text-sm text-amber-800 flex-1">{rec}</span>
                                                        <Button 
                                                            size="sm" 
                                                            variant="ghost"
                                                            className="h-6 px-2 text-amber-600 hover:bg-amber-100"
                                                            onClick={() => onAction?.('apply-recommendation', { section: section.id, recommendation: rec })}
                                                        >
                                                            <Zap className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Vue détaillée */}
            {viewMode === 'detailed' && (
                <div className="space-y-3">
                    {cvSections
                        .sort((a, b) => a.priority - b.priority)
                        .map((section, index) => {
                            const Icon = section.icon;
                            const colors = getStatusColor(section.status);
                            
                            return (
                                <motion.div
                                    key={section.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className={`${colors.border} hover:shadow-md transition-shadow`}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 bg-gradient-to-r from-amber-500 to-purple-500 rounded-lg flex items-center justify-center`}>
                                                        <Icon className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                                                            {section.name}
                                                        </h4>
                                                        <div className="flex items-center gap-2">
                                                            <Badge className={`${colors.bg} ${colors.text} text-xs`}>
                                                                {getStatusLabel(section.status)}
                                                            </Badge>
                                                            <span className="text-xs text-gray-500">
                                                                Priorité {section.priority}/5
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="text-right">
                                                    <div className={`text-2xl font-bold ${colors.text}`}>
                                                        {section.score}%
                                                    </div>
                                                    <Progress value={section.score} className="w-20 h-2 mt-1" />
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                                    <Target className="w-3 h-3" />
                                                    Améliorations suggérées :
                                                </h5>
                                                {section.recommendations.map((rec, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-sm">
                                                        <div className={`w-2 h-2 rounded-full ${colors.bg}`} />
                                                        <span className="text-gray-600 dark:text-gray-400 flex-1">{rec}</span>
                                                        <Button 
                                                            size="sm" 
                                                            variant="ghost"
                                                            className="h-5 px-1 text-amber-600 hover:bg-amber-50"
                                                            onClick={() => onAction?.('fix-section', { section: section.id, issue: rec })}
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

            {/* Résumé et actions */}
            <Card className="bg-gradient-to-r from-amber-50 to-purple-50 border-amber-200">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-600" />
                            <span className="font-semibold text-amber-800">Résumé de l'analyse</span>
                        </div>
                        <Badge className={`${globalScore >= 80 ? 'bg-green-100 text-green-700' : globalScore >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            {globalScore >= 80 ? 'CV Excellent' : globalScore >= 60 ? 'CV Bon' : 'CV à Améliorer'}
                        </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="text-center">
                            <div className="text-lg font-bold text-green-600">
                                {cvSections.filter(s => s.status === 'excellent').length}
                            </div>
                            <div className="text-gray-600">Sections excellentes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-amber-600">
                                {cvSections.filter(s => s.status === 'needs-improvement').length}
                            </div>
                            <div className="text-gray-600">À améliorer</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">
                                {cvSections.reduce((acc, s) => acc + s.recommendations.length, 0)}
                            </div>
                            <div className="text-gray-600">Recommandations</div>
                        </div>
                    </div>
                    
                    <div className="flex justify-center gap-3 mt-4">
                        <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-amber-500 to-purple-500 text-white"
                            onClick={() => onAction?.('optimize-cv', cvSections)}
                        >
                            <Zap className="w-3 h-3 mr-2" />
                            Optimiser maintenant
                        </Button>
                        
                        <Button 
                            size="sm" 
                            variant="outline"
                            className="border-amber-200 text-amber-700 hover:bg-amber-50"
                            onClick={() => onAction?.('export-analysis', { sections: cvSections, globalScore })}
                        >
                            <Download className="w-3 h-3 mr-2" />
                            Exporter analyse
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}