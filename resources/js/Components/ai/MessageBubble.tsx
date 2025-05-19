import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Share2, Download, X, Copy, Check, Presentation, User, MoreHorizontal, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';
import { PowerPointService } from '@/Components/ai/PresentationService';
import { Button } from "@/Components/ui/button";
import { useToast } from '@/Components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
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
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isUser = message.role === 'user';
    const isThinking = message.isThinking || false;
    const [displayedContent, setDisplayedContent] = useState(isUser ? message.content : '');
    const [isTypingComplete, setIsTypingComplete] = useState(isUser || isThinking);
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isGeneratingPPTX, setIsGeneratingPPTX] = useState(false);
    const [isPPTXSuccess, setIsPPTXSuccess] = useState(false);
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
                setTimeout(() => setIsTypingComplete(true), 100);
            }
        }, 10);

        return () => clearInterval(typingInterval);
    }, [isUser, message.content, message.isLatest, isThinking]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(cleanContentForDisplay(message.content));
            setCopied(true);
            toast({
                title: "Contenu copié",
                description: "Le texte a été copié dans le presse-papiers",
                duration: 2000,
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Échec de la copie:', err);
            toast({
                title: "Échec de la copie",
                description: "Impossible de copier le texte",
                variant: "destructive",
                duration: 2000,
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
                    title: "Format invalide",
                    description: "Le contenu n'est pas dans le format attendu pour une présentation",
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
                title: "Présentation prête",
                description: "Votre fichier PowerPoint a été généré avec succès",
                duration: 3000,
            });
        } catch (error) {
            console.error('Error generating presentation:', error);
            toast({
                title: "Erreur",
                description: `Problème lors de la génération: ${error.message || "Erreur inconnue"}`,
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
            ctx.fillText('Conseiller de Carrière IA • Guidy', 40, decoratedCanvas.height - 40);

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
                title: "Échec du partage",
                description: "Impossible de générer l'image à partager",
                variant: "destructive",
                duration: 3000,
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
            title: "Image enregistrée",
            description: "L'image a été téléchargée sur votre appareil",
            duration: 2000,
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
                            {displayContent}
                        </ReactMarkdown>
                    )}

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
                                <span>Exporter en PowerPoint</span>

                            </Button>

                        </div>
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
                                        <span className="text-sm">Copier</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
                                        <Share2 className="h-3.5 w-3.5 mr-2" />
                                        <span className="text-sm">Partager comme image</span>
                                    </DropdownMenuItem>
                                    {hasPresentationJson && (
                                        <DropdownMenuItem onClick={handleGeneratePPTX} className="cursor-pointer">
                                            <Presentation className="h-3.5 w-3.5 mr-2" />
                                            <span className="text-sm">Exporter en PowerPoint</span>

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
                                    Partager ce conseil
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
                                    Télécharger
                                </Button>

                                <Button
                                    onClick={() => setShowShareOptions(false)}
                                    variant="outline"
                                    className="flex-1 border border-gray-200 dark:border-gray-700"
                                >
                                    Annuler
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
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
