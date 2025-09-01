import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
    Eye, Download, Zap, Target, AlertTriangle,
    CheckCircle, TrendingUp, FileText, Lightbulb
} from 'lucide-react';

interface CvSection {
    name: string;
    score: number;
    recommendations: string[];
    position: { x: number; y: number; width: number; height: number };
    priority: 'high' | 'medium' | 'low';
}

interface CvHeatmapProps {
    title: string;
    sections: CvSection[];
    globalScore: number;
    cvPreviewUrl?: string;
}

export default function CvHeatmap({ title, sections, globalScore, cvPreviewUrl }: CvHeatmapProps) {
    const [selectedSection, setSelectedSection] = useState<CvSection | null>(null);
    const [showRecommendations, setShowRecommendations] = useState(true);

    const getScoreColor = (score: number) => {
        if (score >= 80) return { bg: 'bg-green-500', text: 'text-green-700', border: 'border-green-500' };
        if (score >= 60) return { bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-500' };
        return { bg: 'bg-red-500', text: 'text-red-700', border: 'border-red-500' };
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'border-red-500 bg-red-50';
            case 'medium': return 'border-amber-500 bg-amber-50';
            case 'low': return 'border-green-500 bg-green-50';
            default: return 'border-gray-300 bg-gray-50';
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'high': return <AlertTriangle className="w-4 h-4 text-red-600" />;
            case 'medium': return <Target className="w-4 h-4 text-amber-600" />;
            case 'low': return <CheckCircle className="w-4 h-4 text-green-600" />;
            default: return <Eye className="w-4 h-4 text-gray-600" />;
        }
    };

    const exportHeatmapReport = () => {
        const report = `
ANALYSE HEATMAP CV - ${title}
${'='.repeat(50)}

SCORE GLOBAL: ${globalScore}/100

ANALYSE PAR SECTION:
${sections.map(section => `
${section.name.toUpperCase()}
Score: ${section.score}/100
Priorité: ${section.priority.toUpperCase()}
Recommandations:
${section.recommendations.map(rec => `• ${rec}`).join('\n')}
`).join('\n')}

RÉSUMÉ DES AMÉLIORATIONS:
${sections
    .filter(s => s.score < 80)
    .sort((a, b) => a.score - b.score)
    .map(section => `${section.name}: ${section.score}/100 - ${section.recommendations[0]}`)
    .join('\n')}

Généré par Guidy - ${new Date().toLocaleDateString('fr-FR')}
        `.trim();

        const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `cv_heatmap_analysis_${Date.now()}.txt`;
        link.click();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-4"
        >
            <Card className="border-amber-200 bg-gradient-to-r from-amber-50/30 to-purple-50/30">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-amber-600" />
                            {title}
                        </CardTitle>
                        
                        <div className="flex items-center gap-2">
                            <Badge className="bg-gradient-to-r from-amber-100 to-purple-100 text-amber-800 border-amber-200">
                                Score: {globalScore}/100
                            </Badge>
                            
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={exportHeatmapReport}
                                className="h-7 px-2 text-xs"
                            >
                                <Download className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* CV Preview avec Heatmap */}
                    <div className="relative">
                        <div className="aspect-[3/4] bg-white border-2 border-gray-200 rounded-lg overflow-hidden relative">
                            {/* Simulation d'un CV avec zones colorées */}
                            <div className="p-4 space-y-3 relative">
                                {/* Header CV */}
                                <div 
                                    className={`h-16 rounded border-2 transition-all cursor-pointer ${
                                        selectedSection?.name === 'En-tête' ? 'ring-2 ring-amber-500' : ''
                                    } ${getScoreColor(sections.find(s => s.name === 'En-tête')?.score || 0).border}`}
                                    onClick={() => setSelectedSection(sections.find(s => s.name === 'En-tête') || null)}
                                >
                                    <div className="p-2">
                                        <div className="font-bold text-xs">PRÉNOM NOM</div>
                                        <div className="text-xs text-gray-600">Profession • Email • Téléphone</div>
                                    </div>
                                    <div className={`absolute top-1 right-1 w-3 h-3 rounded-full ${
                                        getScoreColor(sections.find(s => s.name === 'En-tête')?.score || 0).bg
                                    }`} />
                                </div>

                                {/* Résumé professionnel */}
                                <div 
                                    className={`h-12 rounded border-2 transition-all cursor-pointer ${
                                        selectedSection?.name === 'Résumé' ? 'ring-2 ring-amber-500' : ''
                                    } ${getScoreColor(sections.find(s => s.name === 'Résumé')?.score || 0).border}`}
                                    onClick={() => setSelectedSection(sections.find(s => s.name === 'Résumé') || null)}
                                >
                                    <div className="p-2">
                                        <div className="text-xs font-medium">RÉSUMÉ PROFESSIONNEL</div>
                                        <div className="text-xs text-gray-500">Profil et objectifs...</div>
                                    </div>
                                    <div className={`absolute top-1 right-1 w-3 h-3 rounded-full ${
                                        getScoreColor(sections.find(s => s.name === 'Résumé')?.score || 0).bg
                                    }`} />
                                </div>

                                {/* Expériences */}
                                <div 
                                    className={`h-20 rounded border-2 transition-all cursor-pointer ${
                                        selectedSection?.name === 'Expériences' ? 'ring-2 ring-amber-500' : ''
                                    } ${getScoreColor(sections.find(s => s.name === 'Expériences')?.score || 0).border}`}
                                    onClick={() => setSelectedSection(sections.find(s => s.name === 'Expériences') || null)}
                                >
                                    <div className="p-2">
                                        <div className="text-xs font-medium">EXPÉRIENCES PROFESSIONNELLES</div>
                                        <div className="text-xs text-gray-500">• Poste 1 - Entreprise A</div>
                                        <div className="text-xs text-gray-500">• Poste 2 - Entreprise B</div>
                                    </div>
                                    <div className={`absolute top-1 right-1 w-3 h-3 rounded-full ${
                                        getScoreColor(sections.find(s => s.name === 'Expériences')?.score || 0).bg
                                    }`} />
                                </div>

                                {/* Compétences */}
                                <div 
                                    className={`h-12 rounded border-2 transition-all cursor-pointer ${
                                        selectedSection?.name === 'Compétences' ? 'ring-2 ring-amber-500' : ''
                                    } ${getScoreColor(sections.find(s => s.name === 'Compétences')?.score || 0).border}`}
                                    onClick={() => setSelectedSection(sections.find(s => s.name === 'Compétences') || null)}
                                >
                                    <div className="p-2">
                                        <div className="text-xs font-medium">COMPÉTENCES</div>
                                        <div className="text-xs text-gray-500">React • Node.js • Python...</div>
                                    </div>
                                    <div className={`absolute top-1 right-1 w-3 h-3 rounded-full ${
                                        getScoreColor(sections.find(s => s.name === 'Compétences')?.score || 0).bg
                                    }`} />
                                </div>

                                {/* Formation */}
                                <div 
                                    className={`h-10 rounded border-2 transition-all cursor-pointer ${
                                        selectedSection?.name === 'Formation' ? 'ring-2 ring-amber-500' : ''
                                    } ${getScoreColor(sections.find(s => s.name === 'Formation')?.score || 0).border}`}
                                    onClick={() => setSelectedSection(sections.find(s => s.name === 'Formation') || null)}
                                >
                                    <div className="p-2">
                                        <div className="text-xs font-medium">FORMATION</div>
                                        <div className="text-xs text-gray-500">Master • École • Année</div>
                                    </div>
                                    <div className={`absolute top-1 right-1 w-3 h-3 rounded-full ${
                                        getScoreColor(sections.find(s => s.name === 'Formation')?.score || 0).bg
                                    }`} />
                                </div>
                            </div>

                            {/* Légende */}
                            <div className="absolute bottom-2 left-2 flex gap-2">
                                <div className="flex items-center gap-1 text-xs">
                                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                                    <span>Excellent</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                                    <span>Bon</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs">
                                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                                    <span>À améliorer</span>
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="mt-2 text-center">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Cliquez sur une section pour voir les recommandations détaillées
                            </p>
                        </div>
                    </div>

                    {/* Détails de la section sélectionnée */}
                    {selectedSection && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-lg border-2 ${getPriorityColor(selectedSection.priority)}`}
                        >
                            <div className="flex items-center gap-2 mb-3">
                                {getPriorityIcon(selectedSection.priority)}
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                                    {selectedSection.name}
                                </h4>
                                <Badge className={`${getScoreColor(selectedSection.score).text} bg-white border`}>
                                    {selectedSection.score}/100
                                </Badge>
                            </div>

                            <div className="space-y-2">
                                {selectedSection.recommendations.map((rec, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-start gap-2 text-sm"
                                    >
                                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-white text-xs font-bold">{index + 1}</span>
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600"
                                    onClick={() => {
                                        // Action pour appliquer les recommandations
                                        console.log('Applying recommendations for', selectedSection.name);
                                    }}
                                >
                                    <Zap className="w-3 h-3 mr-2" />
                                    Appliquer les suggestions
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Résumé des améliorations prioritaires */}
                    {showRecommendations && !selectedSection && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4 text-amber-600" />
                                    Top 3 Améliorations
                                </h4>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowRecommendations(false)}
                                    className="text-xs"
                                >
                                    Masquer
                                </Button>
                            </div>

                            {sections
                                .filter(section => section.score < 80)
                                .sort((a, b) => a.score - b.score)
                                .slice(0, 3)
                                .map((section, index) => {
                                    const colors = getScoreColor(section.score);
                                    const impact = 100 - section.score;
                                    
                                    return (
                                        <motion.div
                                            key={section.name}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                                            onClick={() => setSelectedSection(section)}
                                        >
                                            <div className="flex-shrink-0">
                                                <div className={`w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center`}>
                                                    <span className="text-white text-xs font-bold">{index + 1}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                                                        {section.name}
                                                    </span>
                                                    <Badge variant="outline" className={colors.text}>
                                                        {section.score}/100
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                                                    {section.recommendations[0]}
                                                </p>
                                            </div>
                                            
                                            <div className="flex-shrink-0 text-right">
                                                <div className="text-xs font-bold text-green-600">
                                                    +{impact} pts
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Impact
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                        </div>
                    )}

                    {/* Statistiques globales */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                        <div className="text-center">
                            <div className="text-lg font-bold text-green-600">
                                {sections.filter(s => s.score >= 80).length}
                            </div>
                            <div className="text-xs text-gray-600">Sections excellentes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-amber-600">
                                {sections.filter(s => s.score >= 60 && s.score < 80).length}
                            </div>
                            <div className="text-xs text-gray-600">Sections bonnes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-red-600">
                                {sections.filter(s => s.score < 60).length}
                            </div>
                            <div className="text-xs text-gray-600">À améliorer</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}