import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/Components/ui/use-toast';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import {
    Share2, Download, Copy, Check, User, Bot, BarChart3,
    TrendingUp, Target, Calendar, Star, FileText, Mail,
    ExternalLink, RefreshCw, Sparkles, Award, Zap
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";

// Import des artefacts spécialisés (temporairement désactivés pour éviter erreurs)
// import CareerRoadmapArtifact from './artifacts/CareerRoadmapArtifact';
// import CVHeatmapArtifact from './artifacts/CVHeatmapArtifact';
// import JobAnalyzerArtifact from './artifacts/JobAnalyzerArtifact';
// import InterviewReportArtifact from './artifacts/InterviewReportArtifact';

interface EnhancedMessageBubbleProps {
    message: {
        role: 'user' | 'assistant';
        content: string;
        timestamp: Date | string;
        serviceId?: string;
        isLatest?: boolean;
        isThinking?: boolean;
        artifacts?: any[];
        metadata?: {
            scores?: { [key: string]: number };
            recommendations?: string[];
            actionItems?: string[];
        };
    };
    onArtifactAction?: (action: string, data: any) => void;
}

export default function EnhancedMessageBubble({ message, onArtifactAction }: EnhancedMessageBubbleProps) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const isUser = message.role === 'user';
    const [displayedContent, setDisplayedContent] = useState(isUser ? message.content : '');
    const [isTypingComplete, setIsTypingComplete] = useState(isUser);
    const [copied, setCopied] = useState(false);
    const [showArtifacts, setShowArtifacts] = useState(true);
    const messageRef = useRef<HTMLDivElement>(null);

    // Animation d'écriture pour l'IA
    useEffect(() => {
        if (isUser || !message.isLatest) {
            setDisplayedContent(message.content);
            setIsTypingComplete(true);
            return;
        }

        let currentIndex = 0;
        const content = message.content;
        setDisplayedContent('');

        const typeWriter = setInterval(() => {
            if (currentIndex < content.length) {
                setDisplayedContent(content.substring(0, currentIndex + 1));
                currentIndex++;
            } else {
                setIsTypingComplete(true);
                clearInterval(typeWriter);
            }
        }, 20);

        return () => clearInterval(typeWriter);
    }, [message.content, message.isLatest, isUser]);

    // Détecter le type d'artefact selon le service et le contenu
    const detectArtifactType = () => {
        const content = message.content.toLowerCase();
        const serviceId = message.serviceId;

        if (serviceId === 'career-advice' && (content.includes('plan') || content.includes('objectif'))) {
            return 'career-roadmap';
        }
        if (serviceId === 'resume-review' && (content.includes('score') || content.includes('améliorer'))) {
            return 'cv-heatmap';
        }
        if (serviceId === 'cover-letter' && (content.includes('offre') || content.includes('poste'))) {
            return 'job-analyzer';
        }
        if (serviceId === 'interview-prep' && (content.includes('simulation') || content.includes('entretien'))) {
            return 'interview-report';
        }
        
        return null;
    };

    // Extraire les données structurées (tableaux, scores, etc.)
    const extractStructuredData = () => {
        const content = message.content;
        
        // Extraire les scores (format: "Score: 85/100")
        const scoreMatches = content.match(/(\w+):\s*(\d+)\/(\d+)/g);
        const scores = {};
        if (scoreMatches) {
            scoreMatches.forEach(match => {
                const [, label, value, max] = match.match(/(\w+):\s*(\d+)\/(\d+)/);
                scores[label] = { value: parseInt(value), max: parseInt(max) };
            });
        }

        // Extraire les listes d'actions (format: "• Action item")
        const actionMatches = content.match(/[•\-\*]\s*(.+?)(?=\n|$)/g);
        const actionItems = actionMatches ? actionMatches.map(item => 
            item.replace(/^[•\-\*]\s*/, '').trim()
        ) : [];

        // Extraire les tableaux Markdown
        const tableRegex = /\|(.+)\|\n\|[-\s\|]+\|\n((?:\|.+\|\n?)+)/g;
        const tables = [];
        let tableMatch;
        while ((tableMatch = tableRegex.exec(content)) !== null) {
            const headers = tableMatch[1].split('|').map(h => h.trim()).filter(h => h);
            const rows = tableMatch[2].split('\n')
                .filter(row => row.includes('|'))
                .map(row => row.split('|').map(cell => cell.trim()).filter(cell => cell));
            
            if (headers.length > 0 && rows.length > 0) {
                tables.push({ headers, rows });
            }
        }

        return { scores, actionItems, tables };
    };

    const structuredData = extractStructuredData();
    const artifactType = detectArtifactType();

    // Copier le message
    const copyMessage = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast({
                title: "Copié !",
                description: "Le message a été copié dans le presse-papier"
            });
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de copier le message",
                variant: "destructive"
            });
        }
    };

    // Rendu des tableaux
    const renderTable = (table: { headers: string[], rows: string[][] }, index: number) => (
        <div key={index} className="my-4 overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <thead className="bg-amber-50 dark:bg-amber-950/50">
                    <tr>
                        {table.headers.map((header, i) => (
                            <th key={i} className="px-4 py-2 text-left text-sm font-medium text-amber-800 dark:text-amber-300 border-b border-amber-200 dark:border-amber-800">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {table.rows.map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900/50' : 'bg-white dark:bg-gray-800'}>
                            {row.map((cell, j) => (
                                <td key={j} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // Rendu des scores
    const renderScores = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
            {Object.entries(structuredData.scores).map(([label, scoreData]: [string, any]) => (
                <Card key={label} className="bg-amber-50 dark:bg-amber-950/50 border-amber-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                                {label}
                            </span>
                            <span className="text-lg font-bold text-amber-900 dark:text-amber-200">
                                {scoreData.value}/{scoreData.max}
                            </span>
                        </div>
                        <Progress 
                            value={(scoreData.value / scoreData.max) * 100} 
                            className="h-2"
                        />
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    // Rendu des actions recommandées
    const renderActionItems = () => (
        <div className="my-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-600" />
                Actions recommandées
            </h4>
            <div className="space-y-2">
                {structuredData.actionItems.slice(0, 5).map((action, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/50 rounded-lg border border-amber-200 dark:border-amber-800"
                    >
                        <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                        <span className="text-sm text-amber-800 dark:text-amber-300 flex-1">
                            {action}
                        </span>
                        <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 px-2 text-amber-600 hover:bg-amber-100"
                            onClick={() => onArtifactAction?.('execute-action', { action, index })}
                        >
                            <Zap className="w-3 h-3" />
                        </Button>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    // Rendu de l'artefact principal (placeholder temporaire)
    const renderArtifact = () => {
        if (!artifactType || !showArtifacts) return null;

        // Placeholder simple pour éviter erreurs d'import
        return (
            <div className="text-center py-6 bg-amber-50 rounded-lg border border-amber-200">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-amber-800 mb-2">
                    Artefact {artifactType} Détecté
                </h4>
                <p className="text-sm text-amber-600 mb-3">
                    Interface interactive basée sur votre conversation
                </p>
                <Badge className="bg-amber-100 text-amber-700">
                    🚧 En développement final
                </Badge>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            {/* Avatar */}
            {!isUser && (
                <Avatar className="w-8 h-8 border-2 border-amber-200">
                    <AvatarImage src="/mascot/mascot.png" alt="Assistant IA" />
                    <AvatarFallback className="bg-gradient-to-r from-amber-500 to-purple-500 text-white text-xs">
                        <Bot className="w-4 h-4" />
                    </AvatarFallback>
                </Avatar>
            )}

            <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                {/* Message principal */}
                <div
                    ref={messageRef}
                    className={`relative px-4 py-3 rounded-2xl shadow-sm ${
                        isUser
                            ? 'bg-gradient-to-r from-amber-500 to-purple-500 text-white'
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                    }`}
                >
                    {/* Contenu du message */}
                    <div className={`prose prose-sm max-w-none ${
                        isUser ? 'prose-invert' : 'prose-gray dark:prose-invert'
                    }`}>
                        <ReactMarkdown
                            components={{
                                // Personnaliser le rendu des tableaux
                                table: ({ children }) => (
                                    <div className="overflow-x-auto my-4">
                                        <table className="min-w-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 rounded-lg">
                                            {children}
                                        </table>
                                    </div>
                                ),
                                th: ({ children }) => (
                                    <th className="px-3 py-2 text-left text-xs font-medium text-amber-800 dark:text-amber-300 border-b border-amber-200">
                                        {children}
                                    </th>
                                ),
                                td: ({ children }) => (
                                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                        {children}
                                    </td>
                                ),
                                // Personnaliser les listes pour les actions
                                li: ({ children }) => (
                                    <li className="flex items-start gap-2 my-1">
                                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                                        <span>{children}</span>
                                    </li>
                                ),
                                // Personnaliser les titres
                                h3: ({ children }) => (
                                    <h3 className="text-lg font-bold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        {children}
                                    </h3>
                                ),
                                // Personnaliser les liens
                                a: ({ href, children }) => (
                                    <a 
                                        href={href} 
                                        className="text-amber-600 hover:text-amber-700 underline inline-flex items-center gap-1"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {children}
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                )
                            }}
                        >
                            {displayedContent}
                        </ReactMarkdown>
                    </div>

                    {/* Indicateur de frappe */}
                    {!isUser && !isTypingComplete && (
                        <div className="flex items-center gap-1 mt-2">
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <span className="text-xs text-amber-600 ml-2">L'IA réfléchit...</span>
                        </div>
                    )}

                    {/* Actions du message */}
                    {!isUser && isTypingComplete && (
                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={copyMessage}
                                className="h-6 px-2 text-gray-500 hover:text-amber-600"
                            >
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </Button>
                            
                            {artifactType && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setShowArtifacts(!showArtifacts)}
                                    className="h-6 px-2 text-gray-500 hover:text-amber-600"
                                >
                                    <BarChart3 className="w-3 h-3 mr-1" />
                                    <span className="text-xs">
                                        {showArtifacts ? 'Masquer' : 'Voir'} artefacts
                                    </span>
                                </Button>
                            )}

                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-gray-500 hover:text-amber-600"
                            >
                                <Share2 className="w-3 h-3" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Scores intégrés */}
                {!isUser && Object.keys(structuredData.scores).length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-3 w-full"
                    >
                        {renderScores()}
                    </motion.div>
                )}

                {/* Tableaux extraits */}
                {!isUser && structuredData.tables.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-3 w-full"
                    >
                        {structuredData.tables.map(renderTable)}
                    </motion.div>
                )}

                {/* Actions recommandées */}
                {!isUser && structuredData.actionItems.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-3 w-full"
                    >
                        {renderActionItems()}
                    </motion.div>
                )}

                {/* Artefact principal */}
                <AnimatePresence>
                    {!isUser && artifactType && showArtifacts && isTypingComplete && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: 0.6 }}
                            className="mt-4 w-full"
                        >
                            <Card className="bg-gradient-to-r from-amber-50 to-purple-50 border-amber-200">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-purple-500 rounded-full flex items-center justify-center">
                                            <Sparkles className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-amber-800">
                                            Artefact IA Généré
                                        </span>
                                        <Badge className="bg-amber-100 text-amber-700 text-xs">
                                            Interactif
                                        </Badge>
                                    </div>
                                    {renderArtifact()}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Timestamp */}
                <div className={`text-xs text-gray-500 mt-2 ${isUser ? 'text-right' : 'text-left'}`}>
                    {(() => {
                        try {
                            const timestamp = typeof message.timestamp === 'string' 
                                ? new Date(message.timestamp) 
                                : message.timestamp;
                            return timestamp.toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            });
                        } catch (error) {
                            return 'Maintenant';
                        }
                    })()}
                </div>
            </div>

            {/* Avatar utilisateur */}
            {isUser && (
                <Avatar className="w-8 h-8 border-2 border-amber-200">
                    <AvatarFallback className="bg-gradient-to-r from-amber-500 to-purple-500 text-white text-xs">
                        <User className="w-4 h-4" />
                    </AvatarFallback>
                </Avatar>
            )}
        </motion.div>
    );
}