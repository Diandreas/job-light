import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import { Textarea } from '@/Components/ui/textarea';
import {
    Target, TrendingUp, AlertTriangle, CheckCircle, X,
    Edit3, RefreshCw, Download, Lightbulb, Zap,
    Search, Eye, BarChart3, FileText
} from 'lucide-react';

interface KeywordAnalysis {
    keyword: string;
    detected: number;
    expected: number;
    status: 'optimal' | 'good' | 'missing' | 'excessive';
    impact: number;
}

interface AtsAnalyzerProps {
    title: string;
    globalScore: number;
    keywords: KeywordAnalysis[];
    suggestions: string[];
    originalText: string;
    onTextUpdate?: (newText: string) => void;
}

export default function AtsAnalyzer({ 
    title, 
    globalScore, 
    keywords, 
    suggestions, 
    originalText,
    onTextUpdate 
}: AtsAnalyzerProps) {
    const [editableText, setEditableText] = useState(originalText);
    const [isEditing, setIsEditing] = useState(false);
    const [liveScore, setLiveScore] = useState(globalScore);
    const [appliedSuggestions, setAppliedSuggestions] = useState<Set<number>>(new Set());

    // Calculer le score en temps réel pendant l'édition
    useEffect(() => {
        if (isEditing) {
            const newScore = calculateLiveScore(editableText, keywords);
            setLiveScore(newScore);
        }
    }, [editableText, keywords, isEditing]);

    const calculateLiveScore = (text: string, keywordList: KeywordAnalysis[]): number => {
        let score = 50; // Score de base
        
        keywordList.forEach(kw => {
            const mentions = (text.toLowerCase().match(new RegExp(kw.keyword.toLowerCase(), 'g')) || []).length;
            
            if (mentions >= kw.expected) {
                score += kw.impact;
            } else if (mentions > 0) {
                score += kw.impact * 0.5;
            }
        });

        // Bonus pour la longueur optimale (300-400 mots)
        const wordCount = text.split(' ').length;
        if (wordCount >= 300 && wordCount <= 400) {
            score += 10;
        } else if (wordCount >= 250 && wordCount <= 500) {
            score += 5;
        }

        return Math.min(100, Math.max(0, Math.round(score)));
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-100 border-green-200';
        if (score >= 60) return 'text-amber-600 bg-amber-100 border-amber-200';
        return 'text-red-600 bg-red-100 border-red-200';
    };

    const getKeywordStatusIcon = (status: string) => {
        switch (status) {
            case 'optimal': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'good': return <CheckCircle className="w-4 h-4 text-blue-600" />;
            case 'missing': return <X className="w-4 h-4 text-red-600" />;
            case 'excessive': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
            default: return <Target className="w-4 h-4 text-gray-600" />;
        }
    };

    const getKeywordStatusColor = (status: string) => {
        switch (status) {
            case 'optimal': return 'bg-green-50 border-green-200 text-green-800';
            case 'good': return 'bg-blue-50 border-blue-200 text-blue-800';
            case 'missing': return 'bg-red-50 border-red-200 text-red-800';
            case 'excessive': return 'bg-orange-50 border-orange-200 text-orange-800';
            default: return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    const applySuggestion = (suggestionIndex: number, suggestion: string) => {
        // Logique simple pour appliquer une suggestion
        let newText = editableText;
        
        // Exemples d'application automatique
        if (suggestion.includes('Ajouter') && suggestion.includes('"')) {
            const keywordMatch = suggestion.match(/"([^"]+)"/);
            if (keywordMatch) {
                const keyword = keywordMatch[1];
                // Ajouter le mot-clé dans le premier paragraphe
                const paragraphs = newText.split('\n\n');
                if (paragraphs.length > 0) {
                    paragraphs[0] += ` ${keyword}`;
                    newText = paragraphs.join('\n\n');
                }
            }
        }
        
        setEditableText(newText);
        setAppliedSuggestions(prev => new Set([...prev, suggestionIndex]));
        
        if (onTextUpdate) {
            onTextUpdate(newText);
        }
    };

    const saveChanges = () => {
        setIsEditing(false);
        if (onTextUpdate) {
            onTextUpdate(editableText);
        }
    };

    const resetChanges = () => {
        setEditableText(originalText);
        setLiveScore(globalScore);
        setAppliedSuggestions(new Set());
        setIsEditing(false);
    };

    const exportAnalysis = () => {
        const report = `
ANALYSE ATS - ${title}
${'='.repeat(50)}

SCORE GLOBAL: ${liveScore}/100

ANALYSE DES MOTS-CLÉS:
${keywords.map(kw => 
    `${kw.keyword}: ${kw.detected}/${kw.expected} mentions - ${kw.status.toUpperCase()}`
).join('\n')}

SUGGESTIONS D'AMÉLIORATION:
${suggestions.map((sug, i) => `${i+1}. ${sug}`).join('\n')}

TEXTE OPTIMISÉ:
${editableText}

Généré par Guidy - ${new Date().toLocaleDateString('fr-FR')}
        `.trim();

        const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `ats_analysis_${Date.now()}.txt`;
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
                            <BarChart3 className="w-5 h-5 text-amber-600" />
                            {title}
                        </CardTitle>
                        
                        <div className="flex items-center gap-2">
                            <Badge className={`border ${getScoreColor(liveScore)}`}>
                                Score: {liveScore}/100
                            </Badge>
                            
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={exportAnalysis}
                                className="h-7 px-2 text-xs"
                            >
                                <Download className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>

                    {/* Progress bar avec animation */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Compatibilité ATS
                            </span>
                            <span className={`text-sm font-bold ${getScoreColor(liveScore).split(' ')[0]}`}>
                                {liveScore}%
                            </span>
                        </div>
                        <Progress value={liveScore} className="h-3" />
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Analyse des mots-clés */}
                    <div>
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                            <Search className="w-4 h-4 text-amber-600" />
                            Analyse des Mots-clés
                        </h4>
                        
                        <div className="space-y-2">
                            {keywords.map((keyword, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`flex items-center justify-between p-2 rounded-lg border ${getKeywordStatusColor(keyword.status)}`}
                                >
                                    <div className="flex items-center gap-2">
                                        {getKeywordStatusIcon(keyword.status)}
                                        <span className="font-medium text-sm">{keyword.keyword}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs">
                                            {keyword.detected}/{keyword.expected}
                                        </span>
                                        <Badge variant="outline" className="text-xs">
                                            +{keyword.impact} pts
                                        </Badge>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Suggestions d'amélioration */}
                    <div>
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-600" />
                            Suggestions d'Amélioration
                        </h4>
                        
                        <div className="space-y-2">
                            {suggestions.map((suggestion, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                                        appliedSuggestions.has(index)
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-white border-gray-200 hover:border-amber-300'
                                    }`}
                                >
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {suggestion}
                                        </p>
                                    </div>
                                    
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => applySuggestion(index, suggestion)}
                                        disabled={appliedSuggestions.has(index)}
                                        className="h-7 px-2 text-xs"
                                    >
                                        {appliedSuggestions.has(index) ? (
                                            <CheckCircle className="w-3 h-3 text-green-600" />
                                        ) : (
                                            <Zap className="w-3 h-3" />
                                        )}
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Éditeur de texte */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                <Edit3 className="w-4 h-4 text-amber-600" />
                                Éditeur Intelligent
                            </h4>
                            
                            <div className="flex gap-2">
                                {isEditing ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={resetChanges}
                                            className="h-7 px-2 text-xs"
                                        >
                                            <RefreshCw className="w-3 h-3 mr-1" />
                                            Reset
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={saveChanges}
                                            className="h-7 px-2 text-xs bg-gradient-to-r from-amber-500 to-purple-500"
                                        >
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Sauver
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsEditing(true)}
                                        className="h-7 px-2 text-xs border-amber-200 text-amber-700 hover:bg-amber-50"
                                    >
                                        <Edit3 className="w-3 h-3 mr-1" />
                                        Éditer
                                    </Button>
                                )}
                            </div>
                        </div>

                        {isEditing ? (
                            <div className="space-y-3">
                                <Textarea
                                    value={editableText}
                                    onChange={(e) => setEditableText(e.target.value)}
                                    rows={8}
                                    className="text-sm resize-none"
                                    placeholder="Votre lettre de motivation..."
                                />
                                
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{editableText.split(' ').length} mots</span>
                                    <span className={`font-medium ${getScoreColor(liveScore).split(' ')[0]}`}>
                                        Score live: {liveScore}/100
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap line-clamp-6">
                                    {editableText}
                                </div>
                                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                                    <span>{editableText.split(' ').length} mots</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsEditing(true)}
                                        className="h-6 px-2 text-xs"
                                    >
                                        <Eye className="w-3 h-3 mr-1" />
                                        Voir plus
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Prédiction de performance */}
                    <div className="pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-amber-600" />
                            Prédiction de Performance
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                                <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {Math.round(liveScore * 0.3)}%
                                </div>
                                <div className="text-xs text-gray-600">Taux de réponse estimé</div>
                            </div>
                            
                            <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                                <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {liveScore >= 80 ? 'Élevée' : liveScore >= 60 ? 'Moyenne' : 'Faible'}
                                </div>
                                <div className="text-xs text-gray-600">Probabilité entretien</div>
                            </div>
                        </div>

                        {/* Amélioration potentielle */}
                        {liveScore < 90 && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="w-4 h-4 text-blue-600" />
                                    <span className="font-medium text-blue-800 text-sm">
                                        Potentiel d'amélioration
                                    </span>
                                </div>
                                <div className="text-xs text-blue-700">
                                    En appliquant nos suggestions, votre score pourrait atteindre{' '}
                                    <span className="font-bold">{Math.min(100, liveScore + 15)}/100</span>
                                    {' '}(+{Math.min(15, 100 - liveScore)} points)
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions rapides */}
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={() => {
                                // Appliquer toutes les suggestions automatiquement
                                suggestions.forEach((sug, index) => {
                                    if (!appliedSuggestions.has(index)) {
                                        applySuggestion(index, sug);
                                    }
                                });
                            }}
                            className="flex-1 bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600"
                            disabled={appliedSuggestions.size === suggestions.length}
                        >
                            <Zap className="w-4 h-4 mr-2" />
                            Optimiser automatiquement
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}