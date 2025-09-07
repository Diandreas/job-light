import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Share2, Download, X, Copy, Check, Presentation, User, MoreHorizontal, Sparkles, ChevronRight } from 'lucide-react';
import { ArtifactDetector, ArtifactData } from './artifacts/ArtifactDetector';
import InteractiveTable from './artifacts/InteractiveTable';
import ScoreDashboard from './artifacts/ScoreDashboard';
import InteractiveChecklist from './artifacts/InteractiveChecklist';
import SimpleChart from './artifacts/SimpleChart';
import html2canvas from 'html2canvas';
import { PowerPointService } from '@/Components/ai/PresentationService';
import { Button } from "@/Components/ui/button";
import { useToast } from '@/Components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { useTranslation } from 'react-i18next';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip";

interface MessageBubbleProps {
    message: {
        role: 'user' | 'assistant';
        content: string;
        timestamp: Date;
        isLatest?: boolean;
        isThinking?: boolean;
    };
    serviceId?: string;
    onArtifactsDetected?: (artifacts: ArtifactData[], content: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, serviceId, onArtifactsDetected }) => {
    const { t } = useTranslation();
    const isUser = message.role === 'user';
    const isThinking = message.isThinking || false;
    const [displayedContent, setDisplayedContent] = useState(isUser ? message.content : '');
    const [isTypingComplete, setIsTypingComplete] = useState(isUser || isThinking);
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isGeneratingPPTX, setIsGeneratingPPTX] = useState(false);
    const [isPPTXSuccess, setIsPPTXSuccess] = useState(false);
    const [artifacts, setArtifacts] = useState<ArtifactData[]>([]);
    const [cleanContent, setCleanContent] = useState('');
    const messageRef = useRef<HTMLDivElement>(null);
    const bubbleRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    // Fonction pour détecter et extraire du JSON valide pour une présentation PowerPoint
    const extractPresentationJson = (content: string) => {
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) return null;

            const jsonStr = jsonMatch[0];
            const data = JSON.parse(jsonStr);

            if (data && data.slides && data.title) {
                if (Array.isArray(data.slides)) {
                    data.slides = data.slides.map(slide => {
                        if (slide.content && !Array.isArray(slide.content)) {
                            slide.content = [slide.content];
                        }
                        return slide;
                    });
                }
                return JSON.stringify(data);
            }
            return null;
        } catch (e) {
            console.error('Error parsing presentation JSON:', e);
            return null;
        }
    };

    // Fonction pour masquer le JSON des présentations dans l'affichage
    const cleanContentForDisplay = (content: string) => {
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) return content;

            const jsonStr = jsonMatch[0];
            const data = JSON.parse(jsonStr);

            if (data && data.slides && data.title) {
                return content.replace(jsonMatch[0], '').trim();
            }
            return content;
        } catch (e) {
            return content;
        }
    };

    // Animation d'écriture optimisée avec effet de vitesse variable
    useEffect(() => {
        if (isUser || isThinking || !message.isLatest) {
            setDisplayedContent(message.content);
            setIsTypingComplete(true);
            return;
        }

        const cleanContent = cleanContentForDisplay(message.content);
        setDisplayedContent('');
        setIsTypingComplete(false);

        // Vitesse d'écriture variable selon la longueur du message
        const baseSpeed = 8;
        const contentLength = cleanContent.length;
        let dynamicSpeed = Math.max(1, Math.min(8, baseSpeed - Math.floor(contentLength / 400)));

        // Effet de pause naturelle à certains caractères (., !, ?, :)
        let currentIndex = 0;
        let pauseTime = 0;

        const typingInterval = setInterval(() => {
            if (pauseTime > 0) {
                pauseTime--;
                return;
            }

            // Accélération progressive pour les messages très longs
            if (currentIndex > 800) dynamicSpeed = Math.min(12, dynamicSpeed + 1);

            const charsPerIteration = Math.floor(Math.random() * dynamicSpeed) + 2;
            const nextIndex = Math.min(currentIndex + charsPerIteration, cleanContent.length);

            setDisplayedContent(cleanContent.substring(0, nextIndex));

            // Vérifier s'il faut une pause naturelle
            const lastChar = cleanContent[nextIndex - 1];
            if (['.', '!', '?'].includes(lastChar) && cleanContent[nextIndex] === ' ') {
                pauseTime = 2; // Pause après fin de phrase
            } else if ([',', ';', ':'].includes(lastChar)) {
                pauseTime = 1; // Petite pause après virgule, etc.
            }

            currentIndex = nextIndex;

            if (currentIndex >= cleanContent.length) {
                clearInterval(typingInterval);
                setTimeout(async () => {
                    setIsTypingComplete(true);
                    // Détecter les artefacts une fois l'animation terminée
                    if (!isUser && !isThinking) {
                        console.log('🔥 MessageBubble: Detecting artifacts for content:', message.content.substring(0, 200) + '...');
                        console.log('🔥 MessageBubble: ServiceId:', serviceId);
                        const detectedArtifacts = await ArtifactDetector.detectArtifacts(message.content, serviceId, undefined, false);
                        console.log('🔥 MessageBubble: Detected artifacts:', detectedArtifacts);
                        setArtifacts(detectedArtifacts);
                        const cleaned = ArtifactDetector.cleanContentForDisplay(message.content, detectedArtifacts);
                        setCleanContent(cleaned);
                        
                        // Notifier le parent des artefacts détectés
                        if (detectedArtifacts.length > 0 && onArtifactsDetected) {
                            onArtifactsDetected(detectedArtifacts, message.content);
                        }
                    }
                }, 100);
            }
        }, 10);

        return () => clearInterval(typingInterval);
    }, [isUser, message.content, message.isLatest, isThinking]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(cleanContentForDisplay(message.content));
            setCopied(true);
            toast({
                title: t('components.messageBubble.copy.title'),
                description: t('components.messageBubble.copy.description')
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Échec de la copie:', err);
            toast({
                title: t('components.messageBubble.copyError.title'),
                description: t('components.messageBubble.copyError.description'),
                variant: "destructive"
            });
        }
    };

    const handleGeneratePPTX = async () => {
        const jsonData = extractPresentationJson(message.content);
        if (!jsonData) return;

        try {
            setIsGeneratingPPTX(true);

            let parsedData;
            try {
                parsedData = JSON.parse(jsonData);
                if (!parsedData.slides || !parsedData.title) {
                    throw new Error('Structure JSON invalide pour la présentation');
                }
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                toast({
                    title: t('components.messageBubble.presentation.invalidFormat.title'),
                    description: t('components.messageBubble.presentation.invalidFormat.description'),
                    variant: "destructive"
                });
                setIsGeneratingPPTX(false);
                return;
            }

            const pptxBlob = await PowerPointService.generateFromJSON(jsonData);

            const contextId = typeof message.timestamp === 'string'
                ? message.timestamp
                : new Date(message.timestamp).getTime().toString();

            const url = window.URL.createObjectURL(pptxBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `presentation-${contextId}.pptx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setIsPPTXSuccess(true);
            setTimeout(() => setIsPPTXSuccess(false), 3000);

            toast({
                title: t('components.messageBubble.presentation.title'),
                description: t('components.messageBubble.presentation.description')
            });
        } catch (error) {
            console.error('Error generating presentation:', error);
            toast({
                title: t('components.messageBubble.presentation.error.title'),
                description: `${t('components.messageBubble.presentation.error.description')}: ${error.message || t('components.messageBubble.presentation.error.unknownError')}`,
                variant: "destructive"
            });
        } finally {
            setIsGeneratingPPTX(false);
        }
    };

    const handleShare = async () => {
        if (!messageRef.current) return;

        setShowShareOptions(true);

        try {
            messageRef.current.classList.add('share-image-style');

            const canvas = await html2canvas(messageRef.current, {
                backgroundColor: null,
                scale: 2,
                logging: false,
                allowTaint: true,
                useCORS: true
            });

            const decoratedCanvas = document.createElement('canvas');
            const ctx = decoratedCanvas.getContext('2d');

            if (!ctx) return;

            // Dimensions pour le partage
            decoratedCanvas.width = canvas.width + 80;
            decoratedCanvas.height = canvas.height + 120;

            // Fond avec dégradé subtil
            const gradient = ctx.createLinearGradient(0, 0, 0, decoratedCanvas.height);
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(1, '#f9fafb');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, decoratedCanvas.width, decoratedCanvas.height);

            // Bordure élégante avec ombre
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 2;
            ctx.fillStyle = '#ffffff';
            ctx.roundRect(15, 15, decoratedCanvas.width - 30, decoratedCanvas.height - 30, 16);
            ctx.fill();
            ctx.restore();

            // Bordure fine
            ctx.strokeStyle = '#e9ecef';
            ctx.lineWidth = 1;
            ctx.roundRect(15, 15, decoratedCanvas.width - 30, decoratedCanvas.height - 30, 16);
            ctx.stroke();

            // Position du contenu
            ctx.drawImage(canvas, 40, 40);

            // Logo et signature
            ctx.fillStyle = '#374151';
            ctx.font = 'bold 16px Inter, system-ui, sans-serif';
            ctx.fillText(t('career_advisor.title') + ' • Guidy', 40, decoratedCanvas.height - 40);

            // Ajouter un petit logo
            const logo = new Image();
            logo.src = '/guidy-logo.png'; // Assurez-vous d'avoir ce logo
            logo.onload = () => {
                ctx.drawImage(logo, decoratedCanvas.width - 110, decoratedCanvas.height - 60, 36, 36);

                const imgData = decoratedCanvas.toDataURL('image/png');
                setGeneratedImage(imgData);
            };

            // Au cas où l'image ne se charge pas
            setTimeout(() => {
                if (!generatedImage) {
                    const imgData = decoratedCanvas.toDataURL('image/png');
                    setGeneratedImage(imgData);
                }
            }, 500);

            messageRef.current.classList.remove('share-image-style');

        } catch (error) {
            console.error('Erreur lors de la génération de l\'image:', error);
            setShowShareOptions(false);
            toast({
                title: t('components.messageBubble.share.error.title'),
                description: t('components.messageBubble.share.error.description'),
                variant: "destructive"
            });
        }
    };

    const handleDownload = () => {
        if (!generatedImage) return;

        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `conseil-guidy-${new Date().getTime()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
            title: t('components.messageBubble.download.title'),
            description: t('components.messageBubble.download.description')
        });

        setTimeout(() => setShowShareOptions(false), 500);
    };

    const displayContent = cleanContentForDisplay(isUser ? message.content : displayedContent);
    const hasPresentationJson = extractPresentationJson(message.content) !== null;

    // Classes de bulle de message améliorées - plus soft et compactes
    const bubbleClass = isUser
        ? 'bg-gradient-to-r from-amber-500 to-purple-500 text-white shadow-sm'
        : 'bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200';

    // Indicateurs de réflexion améliorés
    const thinkingVariants = {
        animate: (i: number) => ({
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1, 0.8],
            transition: {
                duration: 2,
                repeat: Infinity,
                delay: i * 0.25,
                ease: "easeInOut"
            }
        })
    };

    return (
        <div
            className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''} mb-3 max-w-full`}
        >
            {/* Avatar */}
            <Avatar className="w-8 h-8 flex-shrink-0 mt-0.5">
                {isUser ? (
                    <>
                        <AvatarImage src="/user-avatar.png" alt="User" />
                        <AvatarFallback className="bg-gradient-to-r from-amber-500 to-purple-500 text-white">
                            <User className="h-4 w-4" />
                        </AvatarFallback>
                    </>
                ) : (
                    <>
                        <AvatarImage src="/ai-avatar.png" alt="AI" />
                        <AvatarFallback className="bg-gradient-to-r from-amber-500 to-purple-500 text-white">
                            <Sparkles className="h-4 w-4" />
                        </AvatarFallback>
                    </>
                )}
            </Avatar>

            <div
                ref={messageRef}
                className={`flex-1 max-w-[calc(100%-2.5rem)] ${isUser ? 'mr-1' : 'ml-1'}`}
            >
                <motion.div
                    ref={bubbleRef}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`p-3 rounded-xl ${bubbleClass}`}
                >
                    {isThinking ? (
                        // Animation de réflexion améliorée
                        <div className="min-h-[24px] flex flex-col">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="flex space-x-1.5">
                                    {[0, 1, 2].map((i) => (
                                        <motion.span
                                            key={i}
                                            custom={i}
                                            variants={thinkingVariants}
                                            animate="animate"
                                            className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    {displayContent}
                                </span>
                            </div>

                            <motion.div
                                initial={{ width: "15%" }}
                                animate={{
                                    width: ["15%", "70%", "45%", "95%", "60%"],
                                    opacity: [0.4, 0.6, 0.4, 0.7, 0.4]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="h-1 bg-gradient-to-r from-amber-300 to-purple-300 dark:from-amber-600 dark:to-purple-600 rounded-full opacity-40"
                            />
                        </div>
                    ) : (
                        <ReactMarkdown
                            components={{
                                h1: ({ node, ...props }) => <h1 className="text-lg font-semibold mb-2 mt-1" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-base font-semibold mb-2 mt-2" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-sm font-medium mb-1.5 mt-2" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc ml-4 space-y-1 my-1.5" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal ml-4 space-y-1 my-1.5" {...props} />,
                                li: ({ node, ...props }) => <li className="text-sm" {...props} />,
                                p: ({ node, ...props }) => (
                                    <p className="text-sm mb-2 whitespace-pre-wrap" {...props} />
                                ),
                                strong: ({ node, ...props }) => (
                                    <strong
                                        className={`font-semibold ${isUser
                                            ? 'text-white'
                                            : 'text-amber-600 dark:text-amber-300'
                                        }`}
                                        {...props}
                                    />
                                ),
                                em: ({ node, ...props }) => <em className="italic" {...props} />,
                                blockquote: ({ node, ...props }) => (
                                    <blockquote
                                        className={`border-l-2 ${isUser
                                            ? 'border-white/30'
                                            : 'border-amber-200 dark:border-amber-700'
                                        } pl-3 italic my-2 text-sm`}
                                        {...props}
                                    />
                                ),
                                // @ts-ignore
                                code: ({ node, inline, ...props }) => (
                                    inline
                                        ? <code
                                            className={`px-1 py-0.5 rounded text-xs font-mono ${isUser
                                                ? 'bg-white/15'
                                                : 'bg-gray-100 dark:bg-gray-700 text-amber-700 dark:text-amber-300'
                                            }`}
                                            {...props}
                                        />
                                        : <code
                                            className={`block p-2 rounded-lg my-2 font-mono text-xs ${isUser
                                                ? 'bg-white/15'
                                                : 'bg-gray-50 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200'
                                            }`}
                                            {...props}
                                        />
                                )
                            }}
                        >
                            {artifacts.length > 0 && cleanContent ? cleanContent : displayContent}
                        </ReactMarkdown>
                    )}

                    {/* Affichage inline des artefacts détectés */}
                    {!isUser && isTypingComplete && artifacts.length > 0 && artifacts.map((artifact, index) => (
                        <div key={index} className="mt-3">
                            {artifact.type === 'table' && (
                                <div className="border border-amber-200 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                                    <div className="px-3 py-2 bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-950/50 dark:to-purple-950/50 border-b border-amber-200">
                                        <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                            {artifact.title}
                                        </h4>
                                    </div>
                                    <div className="p-2">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="border-b border-gray-200">
                                                        {artifact.data.headers?.map((header: string, idx: number) => (
                                                            <th key={idx} className="text-left py-1 px-2 font-medium text-gray-700 dark:text-gray-300">
                                                                {header}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {artifact.data.rows?.slice(0, 5).map((row: string[], rowIdx: number) => (
                                                        <tr key={rowIdx} className="border-b border-gray-100 hover:bg-gray-50/50">
                                                            {row.map((cell: string, cellIdx: number) => (
                                                                <td key={cellIdx} className="py-1 px-2 text-gray-600 dark:text-gray-400">
                                                                    {cell}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {artifact.data.rows && artifact.data.rows.length > 5 && (
                                                <div className="text-center py-2 text-xs text-gray-500">
                                                    ... et {artifact.data.rows.length - 5} lignes supplémentaires
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {artifact.type === 'cv-evaluation' && (
                                <div className="border border-amber-200 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                                    <div className="px-3 py-2 bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-950/50 dark:to-purple-950/50 border-b border-amber-200">
                                        <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-amber-600" />
                                            {artifact.title}
                                            <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">IA</span>
                                        </h4>
                                    </div>
                                    <div className="p-3">
                                        <div className="grid grid-cols-3 gap-2 mb-3">
                                            <div className="text-center p-2 bg-gray-50 rounded">
                                                <div className="text-sm font-bold text-gray-800">{artifact.data.rows?.length || 0}</div>
                                                <div className="text-xs text-gray-600">Critères</div>
                                            </div>
                                            <div className="text-center p-2 bg-amber-50 rounded">
                                                <div className="text-sm font-bold text-amber-600">
                                                    {Math.round((artifact.data.rows?.reduce((acc: number, row: string[]) => {
                                                        const match = row[1]?.match(/(\d+)\/(\d+)/);
                                                        if (match) {
                                                            return acc + (parseInt(match[1]) / parseInt(match[2])) * 100;
                                                        }
                                                        return acc;
                                                    }, 0) || 0) / (artifact.data.rows?.length || 1))}
                                                </div>
                                                <div className="text-xs text-gray-600">Score global</div>
                                            </div>
                                            <div className="text-center p-2 bg-red-50 rounded">
                                                <div className="text-sm font-bold text-red-600">
                                                    {artifact.data.rows?.filter((row: string[]) => {
                                                        const match = row[1]?.match(/(\d+)\/(\d+)/);
                                                        return match && (parseInt(match[1]) / parseInt(match[2])) * 100 <= 30;
                                                    }).length || 0}
                                                </div>
                                                <div className="text-xs text-gray-600">Critiques</div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-amber-600 text-center">
                                            📊 Ouvrez la sidebar pour voir les recommandations IA détaillées
                                        </p>
                                    </div>
                                </div>
                            )}

                            {(artifact.type === 'heatmap' || artifact.type === 'timer' || artifact.type === 'roadmap' || artifact.type === 'dashboard' || artifact.type === 'salary-negotiator') && (
                                <div className="p-3 border border-amber-200 rounded-lg bg-gradient-to-r from-amber-50/50 to-purple-50/50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                {artifact.title}
                                            </h4>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                Ouvrez la sidebar pour interagir avec ce widget
                                            </p>
                                        </div>
                                        <div className="text-amber-600">
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Bouton PPT compact */}
                    {!isUser && isTypingComplete && hasPresentationJson && (
                        <div className="mt-2 flex">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleGeneratePPTX}
                                disabled={isGeneratingPPTX}
                                className="text-xs h-8 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-800/50 font-medium"
                            >
                                {isGeneratingPPTX ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="h-3.5 w-3.5 mr-1.5"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </motion.div>
                                ) : isPPTXSuccess ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    >
                                        <Check className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                                    </motion.div>
                                ) : (
                                    <Presentation className="h-3.5 w-3.5 mr-1.5" />
                                )}
                                <span>{t('components.messageBubble.presentation.button')}</span>
                            </Button>
                        </div>
                    )}

                    {/* Indicateur d'artefacts */}
                    {!isUser && isTypingComplete && artifacts.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-3 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-purple-50 border border-amber-200"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-purple-500">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-amber-800 text-sm">
                                        {artifacts.length} Career Widget{artifacts.length > 1 ? 's' : ''} détecté{artifacts.length > 1 ? 's' : ''}
                                    </div>
                                    <div className="text-xs text-amber-600">
                                        {artifacts.map(a => a.title).join(', ')}
                                    </div>
                                </div>
                                <div className="text-amber-600">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                <div className={`flex items-center gap-2 mt-1 ${isUser ? 'justify-end' : 'justify-between'}`}>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {/* Menu compact */}
                    {!isUser && isTypingComplete && !isThinking && (
                        <div className="flex items-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                                    >
                                        <MoreHorizontal className="h-3.5 w-3.5 text-gray-500" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                    <DropdownMenuItem onClick={handleCopy} className="cursor-pointer">
                                        <Copy className="h-3.5 w-3.5 mr-2" />
                                        <span className="text-sm">{t('components.messageBubble.actions.copy')}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
                                        <Share2 className="h-3.5 w-3.5 mr-2" />
                                        <span className="text-sm">{t('components.messageBubble.share.asImage')}</span>
                                    </DropdownMenuItem>
                                    {hasPresentationJson && (
                                        <DropdownMenuItem onClick={handleGeneratePPTX} className="cursor-pointer">
                                            <Presentation className="h-3.5 w-3.5 mr-2" />
                                            <span className="text-sm">{t('components.messageBubble.presentation.button')}</span>
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de partage optimisé */}
            <AnimatePresence>
                {showShareOptions && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setShowShareOptions(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="bg-white dark:bg-gray-900 p-4 rounded-lg max-w-sm w-full mx-4 shadow-xl border dark:border-gray-700"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                    <Share2 className="h-4 w-4 mr-2 text-amber-500" />
                                    {t('components.messageBubble.share.title')}
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowShareOptions(false)}
                                    className="h-7 w-7 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>

                            {generatedImage && (
                                <div className="mb-4 rounded-lg overflow-hidden shadow-md">
                                    <img
                                        src={generatedImage}
                                        alt="Aperçu du message à partager"
                                        className="w-full object-contain"
                                    />
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    onClick={handleDownload}
                                    className="flex-1 bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white font-medium shadow-sm"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    {t('components.messageBubble.download.button')}
                                </Button>

                                <Button
                                    onClick={() => setShowShareOptions(false)}
                                    variant="outline"
                                    className="flex-1 border border-gray-200 dark:border-gray-700"
                                >
                                    {t('components.messageBubble.actions.cancel')}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .share-image-style {
                    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.05);
                    border-width: 1px;
                }
                .share-image-style strong {
                    color: #d97706 !important;
                }

                /* Animation de surlignage du code */
                @keyframes highlight-code {
                    0% { background-position: -100% 0; }
                    100% { background-position: 200% 0; }
                }

                .highlight-code {
                    background: linear-gradient(90deg, transparent 0%, rgba(217, 119, 6, 0.1) 50%, transparent 100%);
                    background-size: 200% 100%;
                    animation: highlight-code 2s ease-in-out;
                }

                /* Animation de pulse pour l'indicateur de réflexion */
                @keyframes pulse-thinking {
                    0% { opacity: 0.4; width: 20%; }
                    50% { opacity: 0.7; width: 70%; }
                    100% { opacity: 0.4; width: 40%; }
                }

                .thinking-indicator {
                    animation: pulse-thinking 2s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default MessageBubble;
