/**
 * Composant MessageBubble amélioré avec génération d'artefacts IA
 * Exemple concret d'utilisation du nouveau système d'analyse IA
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
    Bot, User, Sparkles, TrendingUp, Eye, 
    CheckCircle, BarChart3, Clock, Zap,
    Brain, Lightbulb, Target
} from 'lucide-react';

// Import du nouveau système IA
import { ArtifactDetector, ArtifactData } from './artifacts/ArtifactDetector';
import { AIContentAnalyzer } from './services/AIContentAnalyzer';
import ArtifactSidebar from './artifacts/ArtifactSidebar';

interface MessageBubbleWithAIProps {
    message: {
        id: string;
        content: string;
        role: 'user' | 'assistant';
        timestamp: Date;
        serviceId?: string;
    };
    userContext?: any;
    showArtifacts?: boolean;
    enableAIAnalysis?: boolean;
}

export default function MessageBubbleWithAI({ 
    message, 
    userContext,
    showArtifacts = true,
    enableAIAnalysis = true 
}: MessageBubbleWithAIProps) {
    const [artifacts, setArtifacts] = useState<ArtifactData[]>([]);
    const [aiAnalysis, setAiAnalysis] = useState<any>(null);
    const [showArtifactSidebar, setShowArtifactSidebar] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);

    const isBot = message.role === 'assistant';

    /**
     * Analyse IA automatique du contenu du message
     */
    useEffect(() => {
        if (isBot && enableAIAnalysis && message.content.length > 50) {
            analyzeMessageContent();
        }
    }, [message.content, isBot, enableAIAnalysis]);

    /**
     * Fonction principale d'analyse IA
     */
    const analyzeMessageContent = async () => {
        setIsAnalyzing(true);
        console.log('🤖 Démarrage analyse IA pour message:', message.id);

        try {
            // 1. Analyse du contenu avec l'IA
            const analysis = AIContentAnalyzer.analyzeAIContent(
                message.content, 
                message.serviceId, 
                userContext
            );
            
            console.log('🧠 Analyse IA complétée:', analysis);
            setAiAnalysis(analysis);

            // 2. Génération des artefacts avec le nouveau système
            const detectedArtifacts = await ArtifactDetector.detectArtifacts(
                message.content,
                message.serviceId,
                userContext,
                true // Utiliser l'IA
            );

            console.log('🎨 Artefacts générés:', detectedArtifacts);
            setArtifacts(detectedArtifacts);

            // 3. Ouverture automatique de la sidebar si artefacts détectés
            if (detectedArtifacts.length > 0 && showArtifacts) {
                setTimeout(() => {
                    setShowArtifactSidebar(true);
                }, 1000);
            }

            setAnalysisComplete(true);

        } catch (error) {
            console.error('❌ Erreur lors de l\'analyse IA:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    /**
     * Rendu de l'indicateur d'analyse IA
     */
    const renderAIAnalysisIndicator = () => {
        if (!enableAIAnalysis || !isBot) return null;

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-xs text-gray-500 mb-2"
            >
                {isAnalyzing ? (
                    <>
                        <Brain className="w-4 h-4 animate-pulse text-blue-500" />
                        <span>Analyse IA en cours...</span>
                    </>
                ) : analysisComplete ? (
                    <>
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Analyse IA complétée</span>
                        {aiAnalysis && (
                            <Badge variant="outline" className="text-xs">
                                {aiAnalysis.confidence}% confiance
                            </Badge>
                        )}
                    </>
                ) : null}
            </motion.div>
        );
    };

    /**
     * Rendu des insights IA
     */
    const renderAIInsights = () => {
        if (!aiAnalysis || !analysisComplete) return null;

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 space-y-2"
            >
                {/* Intent détecté */}
                <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">
                        Intention: <span className="font-medium capitalize">{aiAnalysis.intent}</span>
                    </span>
                    <Badge variant="secondary" className="text-xs">
                        {aiAnalysis.context}
                    </Badge>
                </div>

                {/* Points de données extraits */}
                {aiAnalysis.extractedData && aiAnalysis.extractedData.summary && (
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">
                            {aiAnalysis.extractedData.summary.totalDataPoints} éléments analysés
                        </span>
                        {aiAnalysis.extractedData.summary.highConfidenceItems > 0 && (
                            <Badge variant="outline" className="text-xs">
                                {aiAnalysis.extractedData.summary.highConfidenceItems} haute confiance
                            </Badge>
                        )}
                    </div>
                )}

                {/* Suggestions IA */}
                {aiAnalysis.suggestions && aiAnalysis.suggestions.length > 0 && (
                    <div className="mt-2">
                        <div className="flex items-center gap-2 mb-1">
                            <Lightbulb className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium text-gray-700">Suggestions IA:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {aiAnalysis.suggestions.slice(0, 3).map((suggestion, index) => (
                                <Badge 
                                    key={index}
                                    variant="secondary" 
                                    className="text-xs cursor-pointer hover:bg-amber-100"
                                    onClick={() => {
                                        // Action sur clic de suggestion
                                        console.log('Suggestion cliquée:', suggestion);
                                    }}
                                >
                                    {suggestion}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        );
    };

    /**
     * Rendu des indicateurs d'artefacts
     */
    const renderArtifactIndicators = () => {
        if (artifacts.length === 0 || !showArtifacts) return null;

        const artifactIcons = {
            'table': BarChart3,
            'score': TrendingUp,
            'checklist': CheckCircle,
            'chart': BarChart3,
            'roadmap': TrendingUp,
            'heatmap': Eye,
            'dashboard': BarChart3,
            'timer': Clock,
            'cv-analysis': Eye,
            'interview-simulator': Clock,
            'salary-negotiator': TrendingUp
        };

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center justify-between"
            >
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-gray-700">
                        {artifacts.length} artefact{artifacts.length > 1 ? 's' : ''} détecté{artifacts.length > 1 ? 's' : ''}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Aperçu des types d'artefacts */}
                    <div className="flex gap-1">
                        {artifacts.slice(0, 4).map((artifact, index) => {
                            const Icon = artifactIcons[artifact.type] || BarChart3;
                            return (
                                <div 
                                    key={index}
                                    className="w-6 h-6 rounded bg-gradient-to-r from-amber-100 to-purple-100 flex items-center justify-center"
                                    title={artifact.title}
                                >
                                    <Icon className="w-3 h-3 text-amber-600" />
                                </div>
                            );
                        })}
                        {artifacts.length > 4 && (
                            <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                +{artifacts.length - 4}
                            </div>
                        )}
                    </div>

                    {/* Bouton d'ouverture */}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowArtifactSidebar(true)}
                        className="h-7 text-xs"
                    >
                        <Zap className="w-3 h-3 mr-1" />
                        Ouvrir
                    </Button>
                </div>
            </motion.div>
        );
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}
            >
                <div className={`max-w-[80%] ${isBot ? 'order-2 ml-2' : 'order-1 mr-2'}`}>
                    <Card className={`${isBot 
                        ? 'bg-white border-gray-200' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none'
                    }`}>
                        <CardContent className="p-4">
                            {/* Indicateur d'analyse IA */}
                            {renderAIAnalysisIndicator()}

                            {/* Contenu du message */}
                            <div className="prose prose-sm max-w-none">
                                {message.content.split('\n').map((line, index) => (
                                    <p key={index} className={`mb-2 ${isBot ? 'text-gray-800' : 'text-white'}`}>
                                        {line}
                                    </p>
                                ))}
                            </div>

                            {/* Insights IA */}
                            {isBot && renderAIInsights()}

                            {/* Indicateurs d'artefacts */}
                            {isBot && renderArtifactIndicators()}
                        </CardContent>
                    </Card>

                    {/* Horodatage */}
                    <div className={`text-xs text-gray-500 mt-1 ${isBot ? 'text-left' : 'text-right'}`}>
                        {message.timestamp.toLocaleTimeString()}
                        {isBot && analysisComplete && (
                            <span className="ml-2">• IA analysé</span>
                        )}
                    </div>
                </div>

                {/* Avatar */}
                <div className={`${isBot ? 'order-1' : 'order-2'} flex-shrink-0`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isBot 
                            ? 'bg-gradient-to-r from-amber-500 to-purple-500 text-white' 
                            : 'bg-gray-200 text-gray-600'
                    }`}>
                        {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                </div>
            </motion.div>

            {/* Sidebar des artefacts */}
            {showArtifacts && (
                <ArtifactSidebar
                    artifacts={artifacts}
                    isOpen={showArtifactSidebar}
                    onClose={() => setShowArtifactSidebar(false)}
                    serviceId={message.serviceId}
                    messageContent={message.content}
                />
            )}
        </>
    );
}