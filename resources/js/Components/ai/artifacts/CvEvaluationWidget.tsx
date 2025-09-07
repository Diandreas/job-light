import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import {
    FileText, TrendingUp, AlertTriangle, CheckCircle, 
    Lightbulb, Zap, Award, Target, ArrowRight
} from 'lucide-react';

interface CvEvaluationWidgetProps {
    title: string;
    headers: string[];
    rows: string[][];
    exportable?: boolean;
    sortable?: boolean;
    filterable?: boolean;
}

export default function CvEvaluationWidget({ 
    title, 
    headers, 
    rows, 
    exportable = true, 
    sortable = true, 
    filterable = true 
}: CvEvaluationWidgetProps) {
    const [selectedCriterion, setSelectedCriterion] = useState<number | null>(null);

    // Analyser automatiquement les données pour générer des recommandations IA
    const analysis = useMemo(() => {
        const recommendations: Array<{
            priority: 'critical' | 'high' | 'medium' | 'low';
            action: string;
            impact: string;
            criterion: string;
        }> = [];
        
        let totalScore = 0;
        let scoreCount = 0;

        rows.forEach((row, index) => {
            const criterion = row[0];
            const scoreText = row[1];
            const notes = row[2] || '';
            
            // Extraire le score numérique
            const scoreMatch = scoreText.match(/(\d+)\/(\d+)/);
            if (scoreMatch) {
                const score = parseInt(scoreMatch[1]);
                const maxScore = parseInt(scoreMatch[2]);
                const percentage = (score / maxScore) * 100;
                
                totalScore += percentage;
                scoreCount++;

                // Générer des recommandations basées sur le score et les notes
                if (percentage <= 30) {
                    // Score critique (≤30%)
                    recommendations.push({
                        priority: 'critical',
                        action: generateCriticalAction(criterion, notes),
                        impact: 'Amélioration majeure du CV',
                        criterion
                    });
                } else if (percentage <= 50) {
                    // Score faible (31-50%)
                    recommendations.push({
                        priority: 'high',
                        action: generateHighPriorityAction(criterion, notes),
                        impact: 'Amélioration notable',
                        criterion
                    });
                } else if (percentage <= 70) {
                    // Score moyen (51-70%)
                    recommendations.push({
                        priority: 'medium',
                        action: generateMediumPriorityAction(criterion, notes),
                        impact: 'Optimisation ciblée',
                        criterion
                    });
                }
            }
        });

        const globalScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
        
        return {
            globalScore,
            recommendations: recommendations.slice(0, 5), // Top 5 recommandations
            criticalIssues: recommendations.filter(r => r.priority === 'critical').length,
            improvementAreas: recommendations.filter(r => r.priority === 'high').length
        };
    }, [rows]);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'critical': return <AlertTriangle className="w-4 h-4" />;
            case 'high': return <TrendingUp className="w-4 h-4" />;
            case 'medium': return <Target className="w-4 h-4" />;
            case 'low': return <CheckCircle className="w-4 h-4" />;
            default: return <Lightbulb className="w-4 h-4" />;
        }
    };

    const getScoreColor = (scoreText: string) => {
        const scoreMatch = scoreText.match(/(\d+)\/(\d+)/);
        if (scoreMatch) {
            const percentage = (parseInt(scoreMatch[1]) / parseInt(scoreMatch[2])) * 100;
            if (percentage <= 30) return 'text-red-600 bg-red-50';
            if (percentage <= 50) return 'text-amber-600 bg-amber-50';
            if (percentage <= 70) return 'text-blue-600 bg-blue-50';
            return 'text-green-600 bg-green-50';
        }
        return 'text-gray-600 bg-gray-50';
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
                            <FileText className="w-5 h-5 text-amber-600" />
                            {title}
                        </CardTitle>
                        
                        <div className="flex items-center gap-2">
                            <Badge className={`${analysis.globalScore >= 70 ? 'bg-green-100 text-green-800' : 
                                             analysis.globalScore >= 50 ? 'bg-amber-100 text-amber-800' : 
                                             'bg-red-100 text-red-800'} border-opacity-50`}>
                                {analysis.globalScore}/100
                            </Badge>
                        </div>
                    </div>

                    {/* Vue d'ensemble */}
                    <div className="grid grid-cols-3 gap-3 mt-3">
                        <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
                            <div className="text-lg font-bold text-green-600">{rows.length}</div>
                            <div className="text-xs text-gray-600">Critères</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded-lg border border-red-200">
                            <div className="text-lg font-bold text-red-600">{analysis.criticalIssues}</div>
                            <div className="text-xs text-gray-600">Critiques</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded-lg border border-amber-200">
                            <div className="text-lg font-bold text-amber-600">{analysis.improvementAreas}</div>
                            <div className="text-xs text-gray-600">À améliorer</div>
                        </div>
                    </div>

                    <Progress value={analysis.globalScore} className="h-2 mt-2" />
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Tableau interactif */}
                    <div>
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                            <Award className="w-4 h-4 text-amber-600" />
                            Évaluation Détaillée
                        </h4>
                        
                        <div className="space-y-2">
                            {rows.map((row, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                        selectedCriterion === index
                                            ? 'border-amber-500 bg-amber-50'
                                            : 'border-gray-200 bg-white hover:border-amber-300'
                                    }`}
                                    onClick={() => setSelectedCriterion(
                                        selectedCriterion === index ? null : index
                                    )}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h5 className="font-medium text-gray-800 dark:text-gray-200">
                                                {row[0]}
                                            </h5>
                                            {row[2] && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {row[2]}
                                                </p>
                                            )}
                                        </div>
                                        
                                        <div className={`px-2 py-1 rounded-lg text-sm font-bold ${getScoreColor(row[1])}`}>
                                            {row[1]}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Recommandations IA */}
                    <div>
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-600" />
                            Actions Recommandées par l'IA
                        </h4>
                        
                        <div className="space-y-2">
                            {analysis.recommendations.map((rec, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-white border border-gray-200"
                                >
                                    <div className={`p-1 rounded-lg ${getPriorityColor(rec.priority)}`}>
                                        {getPriorityIcon(rec.priority)}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-gray-800">
                                                {rec.action}
                                            </span>
                                            <Badge variant="outline" className="text-xs">
                                                {rec.criterion}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-gray-600">
                                            Impact: {rec.impact}
                                        </p>
                                    </div>
                                    
                                    <div className="text-amber-600">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Actions rapides */}
                    <div className="flex gap-2 pt-2 border-t border-gray-200">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Télécharger rapport
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50"
                        >
                            <Target className="w-4 h-4 mr-2" />
                            Plan d'amélioration
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

// Fonctions de génération d'actions IA
function generateCriticalAction(criterion: string, notes: string): string {
    const criterionLower = criterion.toLowerCase();
    
    if (criterionLower.includes('clarity') || criterionLower.includes('structure')) {
        return 'Restructurer complètement le CV avec des sections claires';
    } else if (criterionLower.includes('professional') || criterionLower.includes('branding')) {
        return 'Ajouter un titre professionnel et un résumé exécutif';
    } else if (criterionLower.includes('skills') || criterionLower.includes('visibility')) {
        return 'Créer une section dédiée aux compétences techniques';
    } else if (criterionLower.includes('achievement') || criterionLower.includes('orientation')) {
        return 'Quantifier tous les accomplissements avec des chiffres';
    }
    
    return 'Révision majeure nécessaire pour ce critère';
}

function generateHighPriorityAction(criterion: string, notes: string): string {
    const criterionLower = criterion.toLowerCase();
    
    if (criterionLower.includes('relevance')) {
        return 'Adapter le contenu aux exigences du poste tech visé';
    } else if (criterionLower.includes('international')) {
        return 'Mettre en avant l\'expérience internationale et multilingue';
    } else if (criterionLower.includes('language')) {
        return 'Détailler précisément les niveaux de langue';
    }
    
    return 'Amélioration significative recommandée';
}

function generateMediumPriorityAction(criterion: string, notes: string): string {
    const criterionLower = criterion.toLowerCase();
    
    if (criterionLower.includes('skills')) {
        return 'Réorganiser les compétences par ordre d\'importance';
    } else if (criterionLower.includes('structure')) {
        return 'Affiner la mise en forme et l\'espacement';
    }
    
    return 'Optimisation recommandée pour ce critère';
}