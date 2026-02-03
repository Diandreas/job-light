import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Share2, Download, X, Copy, Check, Presentation, User, MoreHorizontal, Sparkles, ChevronRight } from 'lucide-react';
import { ArtifactDetector, ArtifactData } from '../artifacts/ArtifactDetector';
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
import { luxuryTheme } from '@/design-system/luxury-theme';

interface LuxuryMessageBubbleProps {
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

/**
 * Luxury Monochrome Message Bubble
 * Design minimaliste et épuré pour une meilleure concentration
 */
export const LuxuryMessageBubble: React.FC<LuxuryMessageBubbleProps> = ({ message, serviceId, onArtifactsDetected }) => {
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
            return null;
        }
    };

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

    // Animation d'écriture ralentie et plus élégante (600ms au lieu de 400ms)
    useEffect(() => {
        if (isUser || isThinking || !message.isLatest) {
            setDisplayedContent(message.content);
            setIsTypingComplete(true);
            return;
        }

        const cleanContent = cleanContentForDisplay(message.content);
        setDisplayedContent('');
        setIsTypingComplete(false);

        // Vitesse d'écriture plus lente pour un effet plus luxueux
        const baseSpeed = 6;
        const contentLength = cleanContent.length;
        let dynamicSpeed = Math.max(1, Math.min(6, baseSpeed - Math.floor(contentLength / 500)));

        let currentIndex = 0;
        let pauseTime = 0;

        const typingInterval = setInterval(() => {
            if (pauseTime > 0) {
                pauseTime--;
                return;
            }

            if (currentIndex > 1000) dynamicSpeed = Math.min(10, dynamicSpeed + 1);

            const charsPerIteration = Math.floor(Math.random() * dynamicSpeed) + 1;
            const nextIndex = Math.min(currentIndex + charsPerIteration, cleanContent.length);

            setDisplayedContent(cleanContent.substring(0, nextIndex));

            const lastChar = cleanContent[nextIndex - 1];
            if (['.', '!', '?'].includes(lastChar) && cleanContent[nextIndex] === ' ') {
                pauseTime = 3; // Pause plus longue pour effet élégant
            } else if ([',', ';', ':'].includes(lastChar)) {
                pauseTime = 1;
            }

            currentIndex = nextIndex;

            if (currentIndex >= cleanContent.length) {
                clearInterval(typingInterval);
                setTimeout(async () => {
                    setIsTypingComplete(true);
                    if (!isUser && !isThinking) {
                        const detectedArtifacts = await ArtifactDetector.detectArtifacts(message.content, serviceId, undefined, false);
                        setArtifacts(detectedArtifacts);
                        const cleaned = ArtifactDetector.cleanContentForDisplay(message.content, detectedArtifacts);
                        setCleanContent(cleaned);
                        if (detectedArtifacts.length > 0 && onArtifactsDetected) {
                            onArtifactsDetected(detectedArtifacts, message.content);
                        }
                    }
                }, 150);
            }
        }, 15); // Légèrement plus lent

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
        } catch (error: any) {
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
            messageRef.current.classList.add('luxury-share-style');
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

            decoratedCanvas.width = canvas.width + 120;
            decoratedCanvas.height = canvas.height + 160;

            // Fond blanc pur
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, decoratedCanvas.width, decoratedCanvas.height);

            // Ombre ultra-subtile
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.04)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 4;
            ctx.fillStyle = '#ffffff';
            ctx.roundRect(20, 20, decoratedCanvas.width - 40, decoratedCanvas.height - 40, 24);
            ctx.fill();
            ctx.restore();

            // Bordure ultra-fine
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 0.5;
            ctx.roundRect(20, 20, decoratedCanvas.width - 40, decoratedCanvas.height - 40, 24);
            ctx.stroke();

            ctx.drawImage(canvas, 60, 60);

            // Signature minimaliste
            ctx.fillStyle = '#1c1917';
            ctx.font = '500 14px Inter, system-ui, sans-serif';
            ctx.letterSpacing = '0.5px';
            ctx.fillText('Guidy · Career Advisor', 60, decoratedCanvas.height - 50);

            const imgData = decoratedCanvas.toDataURL('image/png');
            setGeneratedImage(imgData);

            messageRef.current.classList.remove('luxury-share-style');
        } catch (error) {
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
        link.download = `guidy-advice-${new Date().getTime()}.png`;
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

    // Design monochrome élégant
    const bubbleClass = isUser
        ? 'bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 shadow-md'
        : 'bg-white dark:bg-neutral-900 shadow-sm border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-50';

    // Animation de réflexion minimaliste
    const thinkingVariants = {
        animate: (i: number) => ({
            opacity: [0.2, 0.6, 0.2],
            scale: [0.85, 1, 0.85],
            transition: {
                duration: 2.4,
                repeat: Infinity,
                delay: i * 0.3,
                ease: luxuryTheme.animations.easings.elegant
            }
        })
    };

    return (
        <div className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''} mb-8 max-w-full`}>
            {/* Avatar minimaliste */}
            <Avatar className="w-10 h-10 flex-shrink-0 mt-1 border border-neutral-200 dark:border-neutral-800">
                {isUser ? (
                    <>
                        <AvatarImage src="/user-avatar.png" alt="User" />
                        <AvatarFallback className="bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900">
                            <User className="h-4 w-4" />
                        </AvatarFallback>
                    </>
                ) : (
                    <>
                        <AvatarImage src="/ai-avatar.png" alt="AI" />
                        <AvatarFallback className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50">
                            <Sparkles className="h-4 w-4" />
                        </AvatarFallback>
                    </>
                )}
            </Avatar>

            <div
                ref={messageRef}
                className={`flex-1 max-w-[calc(100%-3.5rem)] ${isUser ? 'mr-2' : 'ml-2'}`}
            >
                <motion.div
                    ref={bubbleRef}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: luxuryTheme.animations.easings.elegant }}
                    className={`px-6 py-4 rounded-2xl border ${bubbleClass}`}
                >
                    {isThinking ? (
                        <div className="min-h-[32px] flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex space-x-2">
                                    {[0, 1, 2].map((i) => (
                                        <motion.span
                                            key={i}
                                            custom={i}
                                            variants={thinkingVariants}
                                            animate="animate"
                                            className="inline-block w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-600"
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 tracking-wide">
                                    {displayContent}
                                </span>
                            </div>

                            <motion.div
                                initial={{ width: "20%" }}
                                animate={{
                                    width: ["20%", "75%", "50%", "90%", "65%"],
                                    opacity: [0.3, 0.5, 0.3, 0.6, 0.3]
                                }}
                                transition={{
                                    duration: 5,
                                    repeat: Infinity,
                                    ease: luxuryTheme.animations.easings.elegant
                                }}
                                className="h-0.5 bg-neutral-200 dark:bg-neutral-700 rounded-full"
                            />
                        </div>
                    ) : (
                        <ReactMarkdown
                            components={{
                                h1: ({ node, ...props }) => <h1 className="text-xl font-semibold mb-4 mt-2 tracking-tight text-neutral-900 dark:text-neutral-50" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-lg font-semibold mb-3 mt-3 tracking-tight text-neutral-800 dark:text-neutral-100" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-base font-medium mb-2 mt-3 tracking-tight text-neutral-700 dark:text-neutral-200" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc ml-5 space-y-2 my-3" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal ml-5 space-y-2 my-3" {...props} />,
                                li: ({ node, ...props }) => <li className="text-base leading-relaxed" {...props} />,
                                p: ({ node, ...props }) => (
                                    <p className="text-base mb-3 leading-relaxed whitespace-pre-wrap" {...props} />
                                ),
                                strong: ({ node, ...props }) => (
                                    <strong className="font-semibold text-neutral-900 dark:text-neutral-50" {...props} />
                                ),
                                em: ({ node, ...props }) => <em className="italic text-neutral-700 dark:text-neutral-300" {...props} />,
                                blockquote: ({ node, ...props }) => (
                                    <blockquote
                                        className="border-l border-neutral-300 dark:border-neutral-700 pl-4 italic my-4 text-base text-neutral-600 dark:text-neutral-400"
                                        {...props}
                                    />
                                ),
                                // @ts-ignore
                                code: ({ node, inline, ...props }) => (
                                    inline
                                        ? <code
                                            className={`px-2 py-0.5 rounded-md text-sm font-mono ${isUser
                                                ? 'bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800'
                                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                                                }`}
                                            {...props}
                                        />
                                        : <code
                                            className={`block p-4 rounded-xl my-3 font-mono text-sm leading-relaxed ${isUser
                                                ? 'bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800'
                                                : 'bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800'
                                                }`}
                                            {...props}
                                        />
                                )
                            }}
                        >
                            {artifacts.length > 0 && cleanContent ? cleanContent : displayContent}
                        </ReactMarkdown>
                    )}

                    {/* Affichage inline des artefacts - Design minimal */}
                    {!isUser && isTypingComplete && artifacts.length > 0 && artifacts.map((artifact, index) => (
                        <div key={index} className="mt-6">
                            {artifact.type === 'table' && (
                                <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-950">
                                    <div className="px-5 py-3 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                                        <h4 className="text-sm font-medium tracking-wide text-neutral-900 dark:text-neutral-50">
                                            {artifact.title}
                                        </h4>
                                    </div>
                                    <div className="p-4">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-neutral-200 dark:border-neutral-800">
                                                        {artifact.data.headers?.map((header: string, idx: number) => (
                                                            <th key={idx} className="text-left py-2 px-3 font-medium text-neutral-700 dark:text-neutral-300">
                                                                {header}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {artifact.data.rows?.slice(0, 5).map((row: string[], rowIdx: number) => (
                                                        <tr key={rowIdx} className="border-b border-neutral-100 dark:border-neutral-900 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50 transition-colors">
                                                            {row.map((cell: string, cellIdx: number) => (
                                                                <td key={cellIdx} className="py-2 px-3 text-neutral-600 dark:text-neutral-400">
                                                                    {cell}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {artifact.data.rows && artifact.data.rows.length > 5 && (
                                                <div className="text-center py-3 text-xs text-neutral-500 dark:text-neutral-500">
                                                    + {artifact.data.rows.length - 5} lignes supplémentaires
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(artifact.type === 'heatmap' || artifact.type === 'timer' || artifact.type === 'roadmap' || artifact.type === 'dashboard' || artifact.type === 'salary-negotiator' || artifact.type === 'cv-evaluation') && (
                                <div className="px-5 py-4 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-950">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-50 mb-1">
                                                {artifact.title}
                                            </h4>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-500">
                                                Ouvrez la sidebar pour interagir avec ce widget
                                            </p>
                                        </div>
                                        <div className="text-neutral-400 dark:text-neutral-600">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Bouton PPT minimal */}
                    {!isUser && isTypingComplete && hasPresentationJson && (
                        <div className="mt-4 flex">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleGeneratePPTX}
                                disabled={isGeneratingPPTX}
                                className="text-xs h-9 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-medium border border-neutral-200 dark:border-neutral-700"
                            >
                                {isGeneratingPPTX ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="h-3.5 w-3.5 mr-2"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </motion.div>
                                ) : isPPTXSuccess ? (
                                    <Check className="h-3.5 w-3.5 mr-2 text-green-600" />
                                ) : (
                                    <Presentation className="h-3.5 w-3.5 mr-2" />
                                )}
                                <span>{t('components.messageBubble.presentation.button')}</span>
                            </Button>
                        </div>
                    )}

                    {/* Indicateur d'artefacts minimal */}
                    {!isUser && isTypingComplete && artifacts.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, ease: luxuryTheme.animations.easings.elegant }}
                            className="mt-5 px-5 py-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 rounded-xl bg-neutral-900 dark:bg-neutral-50">
                                    <Sparkles className="w-4 h-4 text-white dark:text-neutral-900" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-neutral-900 dark:text-neutral-50 text-sm mb-0.5">
                                        {artifacts.length} Widget{artifacts.length > 1 ? 's' : ''} disponible{artifacts.length > 1 ? 's' : ''}
                                    </div>
                                    <div className="text-xs text-neutral-500 dark:text-neutral-500">
                                        {artifacts.map(a => a.title).join(' · ')}
                                    </div>
                                </div>
                                <div className="text-neutral-400 dark:text-neutral-600">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                <div className={`flex items-center gap-3 mt-2 ${isUser ? 'justify-end' : 'justify-between'}`}>
                    <div className="text-xs text-neutral-500 dark:text-neutral-500 tracking-wide">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {/* Menu minimaliste */}
                    {!isUser && isTypingComplete && !isThinking && (
                        <div className="flex items-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                                    >
                                        <MoreHorizontal className="h-4 w-4 text-neutral-500" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={handleCopy} className="cursor-pointer">
                                        <Copy className="h-4 w-4 mr-2" />
                                        <span className="text-sm">{t('components.messageBubble.actions.copy')}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
                                        <Share2 className="h-4 w-4 mr-2" />
                                        <span className="text-sm">{t('components.messageBubble.share.asImage')}</span>
                                    </DropdownMenuItem>
                                    {hasPresentationJson && (
                                        <DropdownMenuItem onClick={handleGeneratePPTX} className="cursor-pointer">
                                            <Presentation className="h-4 w-4 mr-2" />
                                            <span className="text-sm">{t('components.messageBubble.presentation.button')}</span>
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de partage minimal */}
            <AnimatePresence>
                {showShareOptions && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setShowShareOptions(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.96, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.96, opacity: 0 }}
                            transition={{ duration: 0.3, ease: luxuryTheme.animations.easings.elegant }}
                            className="bg-white dark:bg-neutral-900 p-6 rounded-2xl max-w-md w-full mx-4 shadow-2xl border border-neutral-200 dark:border-neutral-800"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight flex items-center">
                                    <Share2 className="h-5 w-5 mr-2" />
                                    {t('components.messageBubble.share.title')}
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowShareOptions(false)}
                                    className="h-8 w-8 p-0 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {generatedImage && (
                                <div className="mb-5 rounded-xl overflow-hidden shadow-lg border border-neutral-200 dark:border-neutral-800">
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
                                    className="flex-1 bg-neutral-900 dark:bg-neutral-50 hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-medium shadow-sm"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    {t('components.messageBubble.download.button')}
                                </Button>

                                <Button
                                    onClick={() => setShowShareOptions(false)}
                                    variant="outline"
                                    className="flex-1 border border-neutral-200 dark:border-neutral-800"
                                >
                                    {t('components.messageBubble.actions.cancel')}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .luxury-share-style {
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
                    border-width: 0.5px;
                }
            `}</style>
        </div>
    );
};

export default LuxuryMessageBubble;
