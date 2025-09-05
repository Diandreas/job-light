import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import {
    TrendingUp, TrendingDown, Target, Star, AlertTriangle,
    CheckCircle, Download, RefreshCw, Eye, BarChart3,
    Lightbulb, ArrowRight
} from 'lucide-react';

interface ScoreData {
    globalScore: number;
    maxScore: number;
    subScores: Array<{
        name: string;
        score: number;
        max: number;
    }>;
    recommendations: string[];
}

interface ScoreDashboardProps {
    title: string;
    data: ScoreData;
    serviceId?: string;
}

export default function ScoreDashboard({ title, data, serviceId }: ScoreDashboardProps) {
    const [animatedScore, setAnimatedScore] = useState(0);
    const [showDetails, setShowDetails] = useState(false);

    // Animation du score principal
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedScore(data.globalScore);
        }, 300);
        return () => clearTimeout(timer);
    }, [data.globalScore]);

    const getScoreColor = (score: number, max: number = 100) => {
        const percentage = (score / max) * 100;
        if (percentage >= 80) return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
        if (percentage >= 60) return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' };
        return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
    };

    const getScoreIcon = (score: number, max: number = 100) => {
        const percentage = (score / max) * 100;
        if (percentage >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
        if (percentage >= 60) return <TrendingUp className="w-5 h-5 text-amber-600" />;
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
    };

    const getScoreLabel = (score: number, max: number = 100) => {
        const percentage = (score / max) * 100;
        if (percentage >= 80) return 'Excellent';
        if (percentage >= 60) return 'Bon';
        if (percentage >= 40) return 'Moyen';
        return 'À améliorer';
    };

    const exportScoreReport = () => {
        const report = `
RAPPORT D'ÉVALUATION - ${title}
${'='.repeat(50)}

SCORE GLOBAL: ${data.globalScore}/${data.maxScore} (${Math.round((data.globalScore/data.maxScore)*100)}%)
Évaluation: ${getScoreLabel(data.globalScore, data.maxScore)}

DÉTAIL PAR CRITÈRE:
${data.subScores.map(sub => 
    `• ${sub.name}: ${sub.score}/${sub.max} (${Math.round((sub.score/sub.max)*100)}%)`
).join('\n')}

RECOMMANDATIONS:
${data.recommendations.map((rec, i) => `${i+1}. ${rec}`).join('\n')}

Généré par Guidy - ${new Date().toLocaleDateString('fr-FR')}
        `.trim();

        const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `rapport_evaluation_${Date.now()}.txt`;
        link.click();
    };

    const globalColors = getScoreColor(data.globalScore, data.maxScore);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="my-4"
        >
            <Card className={`border-2 ${globalColors.border} ${globalColors.bg}`}>
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-amber-600" />
                            {title}
                        </CardTitle>
                        
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDetails(!showDetails)}
                                className="h-7 px-2 text-xs"
                            >
                                <Eye className="w-3 h-3 mr-1" />
                                {showDetails ? 'Masquer' : 'Détails'}
                            </Button>
                            
                            {data.recommendations.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={exportScoreReport}
                                    className="h-7 px-2 text-xs"
                                >
                                    <Download className="w-3 h-3 mr-1" />
                                    Export
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Score principal */}
                    <div className="flex items-center justify-center mb-6">
                        <div className="relative">
                            <div className={`w-24 h-24 rounded-full ${globalColors.bg} border-4 ${globalColors.border} flex items-center justify-center`}>
                                <div className="text-center">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2, type: "spring" }}
                                        className={`text-2xl font-bold ${globalColors.text}`}
                                    >
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 1 }}
                                        >
                                            {animatedScore}
                                        </motion.span>
                                        <span className="text-sm">/{data.maxScore}</span>
                                    </motion.div>
                                    <div className={`text-xs ${globalColors.text} font-medium`}>
                                        {getScoreLabel(data.globalScore, data.maxScore)}
                                    </div>
                                </div>
                            </div>
                            
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="absolute -top-2 -right-2"
                            >
                                {getScoreIcon(data.globalScore, data.maxScore)}
                            </motion.div>
                        </div>
                    </div>

                    {/* Détails des sous-scores */}
                    {showDetails && data.subScores.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3 mb-6"
                        >
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                Détail par critère
                            </h4>
                            
                            {data.subScores.map((subScore, index) => {
                                const percentage = (subScore.score / subScore.max) * 100;
                                const colors = getScoreColor(subScore.score, subScore.max);
                                
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                    {subScore.name}
                                                </span>
                                                <span className={`text-xs font-bold ${colors.text}`}>
                                                    {subScore.score}/{subScore.max}
                                                </span>
                                            </div>
                                            <Progress 
                                                value={percentage} 
                                                className="h-2"
                                            />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}

                    {/* Recommandations */}
                    {data.recommendations.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-amber-600" />
                                Recommandations prioritaires
                            </h4>
                            
                            <div className="space-y-2">
                                {data.recommendations.slice(0, 3).map((recommendation, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + index * 0.1 }}
                                        className="flex items-start gap-2 p-2 rounded-lg bg-white/50 border border-amber-200"
                                    >
                                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-white text-xs font-bold">{index + 1}</span>
                                        </div>
                                        <span className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {recommendation}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>

                            {data.recommendations.length > 3 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowDetails(!showDetails)}
                                    className="text-xs text-amber-600 hover:text-amber-700"
                                >
                                    Voir {data.recommendations.length - 3} recommandations supplémentaires
                                    <ArrowRight className="w-3 h-3 ml-1" />
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}