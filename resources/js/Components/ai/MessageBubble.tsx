import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Share2, Download, X, Copy, Check, Presentation, User } from 'lucide-react';
import html2canvas from 'html2canvas';
import { PowerPointService } from '@/Components/ai/PresentationService';
import { Button } from "@/Components/ui/button";
import { useToast } from '@/Components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";

interface MessageBubbleProps {
    message: {
        role: 'user' | 'assistant';
        content: string;
        timestamp: Date;
        isLatest?: boolean;
    };
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isUser = message.role === 'user';
    const [displayedContent, setDisplayedContent] = useState(isUser ? message.content : '');
    const [isTypingComplete, setIsTypingComplete] = useState(isUser);
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const messageRef = useRef<HTMLDivElement>(null);
    const [isGeneratingPPTX, setIsGeneratingPPTX] = useState(false);
    const [isPPTXSuccess, setIsPPTXSuccess] = useState(false);
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

    // Animation d'écriture seulement pour le dernier message
    useEffect(() => {
        if (isUser || !message.isLatest) {
            setDisplayedContent(message.content);
            setIsTypingComplete(true);
            return;
        }

        const cleanContent = cleanContentForDisplay(message.content);
        setDisplayedContent('');
        setIsTypingComplete(false);

        const charsPerIteration = 6;
        let currentIndex = 0;

        const typingInterval = setInterval(() => {
            const nextIndex = Math.min(currentIndex + charsPerIteration, cleanContent.length);
            setDisplayedContent(cleanContent.substring(0, nextIndex));
            currentIndex = nextIndex;

            if (currentIndex >= cleanContent.length) {
                clearInterval(typingInterval);
                setIsTypingComplete(true);
            }
        }, 8);

        return () => clearInterval(typingInterval);
    }, [isUser, message.content, message.isLatest]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(cleanContentForDisplay(message.content));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Échec de la copie:', err);
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
                    title: "Format JSON invalide",
                    description: "Le contenu JSON n'est pas dans le format attendu pour une présentation",
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
                title: "Succès",
                description: "Votre présentation PowerPoint a été générée avec succès"
            });
        } catch (error) {
            console.error('Error generating presentation:', error);
            toast({
                title: "Erreur",
                description: `Erreur lors de la génération: ${error.message || "Erreur inconnue"}`,
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

            decoratedCanvas.width = canvas.width + 80;
            decoratedCanvas.height = canvas.height + 120;

            const gradient = ctx.createLinearGradient(0, 0, decoratedCanvas.width, decoratedCanvas.height);
            gradient.addColorStop(0, '#f59e0b10');
            gradient.addColorStop(1, '#8b5cf610');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, decoratedCanvas.width, decoratedCanvas.height);

            ctx.strokeStyle = '#f59e0b30';
            ctx.lineWidth = 8;
            ctx.roundRect(15, 15, decoratedCanvas.width - 30, decoratedCanvas.height - 30, 20);
            ctx.stroke();

            ctx.drawImage(canvas, 40, 40);

            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 22px Arial';
            ctx.fillText('Conseiller de Carrière IA • Partagé via Guidy', 40, decoratedCanvas.height - 40);

            const imgData = decoratedCanvas.toDataURL('image/png');
            setGeneratedImage(imgData);

            messageRef.current.classList.remove('share-image-style');

        } catch (error) {
            console.error('Erreur lors de la génération de l\'image:', error);
            setShowShareOptions(false);
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

        setTimeout(() => setShowShareOptions(false), 500);
    };

    const displayContent = cleanContentForDisplay(isUser ? message.content : displayedContent);
    const hasPresentationJson = extractPresentationJson(message.content) !== null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''} mb-3`}
        >
            {/* Avatar */}
            <Avatar className="w-8 h-8 flex-shrink-0">
                {isUser ? (
                    <>
                        <AvatarImage src="/user-avatar.png" alt="User" />
                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </>
                ) : (
                    <>
                        <AvatarImage src="/ai-avatar.png" alt="AI" />
                        <AvatarFallback className="bg-gradient-to-br from-amber-500 to-purple-500 text-white">AI</AvatarFallback>
                    </>
                )}
            </Avatar>

            <div
                ref={messageRef}
                className={`flex-1 max-w-[calc(100%-3rem)] ${isUser ? 'mr-2' : 'ml-2'}`}
            >
                <div
                    className={`p-3 rounded-lg text-sm ${
                        isUser
                            ? 'bg-amber-500 text-white'
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                >
                    <ReactMarkdown
                        components={{
                            h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-2" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-base font-bold mb-2" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-sm font-bold mb-1" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc ml-3 space-y-0.5 text-sm" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal ml-3 space-y-0.5 text-sm" {...props} />,
                            li: ({ node, ...props }) => <li className="text-sm" {...props} />,
                            p: ({ node, ...props }) => (
                                <p className="text-sm leading-relaxed whitespace-pre-wrap" {...props} />
                            ),
                            strong: ({ node, ...props }) => (
                                <strong
                                    className={`font-bold ${isUser
                                        ? 'text-white'
                                        : 'text-amber-800 dark:text-amber-300'
                                    }`}
                                    {...props}
                                />
                            ),
                            em: ({ node, ...props }) => <em className="italic" {...props} />,
                            blockquote: ({ node, ...props }) => (
                                <blockquote
                                    className={`border-l-3 ${isUser
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
                                            ? 'bg-white/10'
                                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                                        }`}
                                        {...props}
                                    />
                                    : <code
                                        className={`block p-2 rounded-lg my-2 font-mono text-xs ${isUser
                                            ? 'bg-white/10'
                                            : 'bg-gray-50 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200'
                                        }`}
                                        {...props}
                                    />
                            )
                        }}
                    >
                        {displayContent}
                    </ReactMarkdown>

                    {!isUser && !isTypingComplete && (
                        <div className="flex space-x-1.5 mt-2">
                            <motion.div
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 1.2, repeat: Infinity }}
                                className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400"
                            />
                            <motion.div
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 1.2, delay: 0.3, repeat: Infinity }}
                                className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400"
                            />
                            <motion.div
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 1.2, delay: 0.6, repeat: Infinity }}
                                className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400"
                            />
                        </div>
                    )}

                    {/* Bouton pour générer une présentation PowerPoint */}
                    {!isUser && isTypingComplete && hasPresentationJson && (
                        <div className="mt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleGeneratePPTX}
                                disabled={isGeneratingPPTX}
                                className="text-xs h-8"
                            >
                                {isGeneratingPPTX ? (
                                    <div className="animate-spin h-3 w-3">
                                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                ) : isPPTXSuccess ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                    <Presentation className="h-3 w-3" />
                                )}
                                <span className="ml-1.5">PowerPoint</span>
                            </Button>
                        </div>
                    )}
                </div>

                <div className={`flex items-center gap-2 mt-2 ${isUser ? 'justify-end' : 'justify-between'}`}>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {/* Boutons d'actions */}
                    {!isUser && isTypingComplete && (
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopy}
                                className="h-8 w-8 p-0"
                            >
                                {copied ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                    <Copy className="h-3 w-3" />
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleShare}
                                className="h-8 w-8 p-0"
                            >
                                <Share2 className="h-3 w-3" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Notification de copie */}
            <AnimatePresence>
                {copied && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed bottom-4 right-4 bg-gradient-to-r from-amber-500 to-purple-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm z-50"
                    >
                        Texte copié !
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de partage */}
            <AnimatePresence>
                {showShareOptions && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        onClick={() => setShowShareOptions(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white dark:bg-gray-900 p-6 rounded-xl max-w-md w-full mx-4 shadow-xl border"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    Partager ce conseil
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowShareOptions(false)}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {generatedImage && (
                                <div className="mb-4 border border-amber-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                    <img
                                        src={generatedImage}
                                        alt="Aperçu du message à partager"
                                        className="w-full object-contain"
                                    />
                                </div>
                            )}

                            <Button
                                onClick={handleDownload}
                                className="w-full bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Télécharger l'image
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .share-image-style {
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                    border-width: 2px;
                }
                .share-image-style strong {
                    color: #f59e0b !important;
                }
            `}</style>
        </motion.div>
    );
};

export default MessageBubble;
