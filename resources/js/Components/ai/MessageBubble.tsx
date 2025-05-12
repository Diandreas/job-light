import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Share2, Download, X, Copy, Check, Presentation } from 'lucide-react';
import html2canvas from 'html2canvas';
import { PowerPointService } from '@/Components/ai/PresentationService';
import { Button } from "@/Components/ui/button";
import { useToast } from '@/Components/ui/use-toast';

interface MessageBubbleProps {
    message: {
        role: 'user' | 'assistant';
        content: string;
        timestamp: Date;
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
    const [presentationJson, setPresentationJson] = useState<string | null>(null);
    const [isGeneratingPPTX, setIsGeneratingPPTX] = useState(false);
    const [isPPTXSuccess, setIsPPTXSuccess] = useState(false);
    const { toast } = useToast();

    // Fonction pour détecter et extraire du JSON valide pour une présentation PowerPoint
    // Dans MessageBubble.tsx, modifiez la fonction extractPresentationJson
    const extractPresentationJson = (content: string) => {
        try {
            // Chercher du contenu entre accolades
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) return null;

            // Essayer de parser le JSON
            const jsonStr = jsonMatch[0];
            const data = JSON.parse(jsonStr);

            // Vérifier si c'est un JSON de présentation avec les éléments requis
            if (data && data.slides && data.title) {
                // Vérifier et normaliser chaque diapositive
                if (Array.isArray(data.slides)) {
                    data.slides = data.slides.map(slide => {
                        // S'assurer que content est un tableau s'il existe
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
    // Animation d'écriture plus lente pour les messages de l'assistant
    useEffect(() => {
        if (isUser) return;

        setDisplayedContent('');
        setIsTypingComplete(false);

        const charsPerIteration = 6; // Réduit pour ralentir l'animation
        let currentIndex = 0;

        const typingInterval = setInterval(() => {
            const nextIndex = Math.min(currentIndex + charsPerIteration, message.content.length);
            setDisplayedContent(message.content.substring(0, nextIndex));
            currentIndex = nextIndex;

            if (currentIndex >= message.content.length) {
                clearInterval(typingInterval);
                setIsTypingComplete(true);
            }
        }, 15); // Intervalle plus long pour ralentir l'animation

        return () => clearInterval(typingInterval);
    }, [isUser, message.content]);

    // Vérifier si le message contient un JSON de présentation
    useEffect(() => {
        if (message.role === 'assistant' && isTypingComplete) {
            const jsonData = extractPresentationJson(message.content);
            if (jsonData) {
                setPresentationJson(jsonData);
            }
        }
    }, [message.content, message.role, isTypingComplete]);

    // Fonction pour copier le texte
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Échec de la copie:', err);
        }
    };

    const handleGeneratePPTX = async () => {
        if (!presentationJson) return;

        try {
            setIsGeneratingPPTX(true);

            // Valider le JSON avant de tenter de générer la présentation
            let jsonData;
            try {
                jsonData = JSON.parse(presentationJson);
                // Vérification supplémentaire que la structure est correcte
                if (!jsonData.slides || !jsonData.title) {
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

            // Générer la présentation PowerPoint
            const pptxBlob = await PowerPointService.generateFromJSON(presentationJson);

            // Créer un lien de téléchargement
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

        // Ouvrir le modal
        setShowShareOptions(true);

        try {
            // Ajouter temporairement des classes pour le style de l'image
            messageRef.current.classList.add('share-image-style');

            // Générer une capture du message
            const canvas = await html2canvas(messageRef.current, {
                backgroundColor: null,
                scale: 2, // Meilleure qualité
                logging: false,
                allowTaint: true,
                useCORS: true
            });

            // Créer une image avec des éléments décoratifs
            const decoratedCanvas = document.createElement('canvas');
            const ctx = decoratedCanvas.getContext('2d');

            if (!ctx) return;

            // Dimensions de l'image finale
            decoratedCanvas.width = canvas.width + 80;
            decoratedCanvas.height = canvas.height + 120;

            // Fond dégradé
            const gradient = ctx.createLinearGradient(0, 0, decoratedCanvas.width, decoratedCanvas.height);
            gradient.addColorStop(0, '#f59e0b10');
            gradient.addColorStop(1, '#8b5cf610');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, decoratedCanvas.width, decoratedCanvas.height);

            // Bordure
            ctx.strokeStyle = '#f59e0b30';
            ctx.lineWidth = 8;
            ctx.roundRect(15, 15, decoratedCanvas.width - 30, decoratedCanvas.height - 30, 20);
            ctx.stroke();

            // Ajouter le message capturé
            ctx.drawImage(canvas, 40, 40);

            // Ajouter le logo/texte en bas avec une taille plus grande
            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 22px Arial'; // Police plus grande pour une meilleure lisibilité
            ctx.fillText('Conseiller de Carrière IA • Partagé via Guidy', 40, decoratedCanvas.height - 40);

            // Convertir en image
            const imgData = decoratedCanvas.toDataURL('image/png');
            setGeneratedImage(imgData);

            // Restaurer le style d'origine
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

        // Fermer le modal après le téléchargement
        setTimeout(() => setShowShareOptions(false), 500);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4`}
        >
            <div
                ref={messageRef}
                className={`max-w-[85%] sm:max-w-[80%] p-2.5 sm:p-4 rounded-xl shadow-sm ${isUser
                    ? 'bg-gradient-to-r from-amber-500 to-purple-500 text-white dark:from-amber-400 dark:to-purple-400'
                    : 'bg-white dark:bg-gray-800 border border-amber-100 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                }`}
            >
                <div className="space-y-1.5 sm:space-y-2">
                    <ReactMarkdown
                        components={{
                            h1: ({ node, ...props }) => <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-base sm:text-lg font-bold mb-1.5 sm:mb-2" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc ml-4 space-y-0.5 sm:space-y-1 text-sm sm:text-base" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal ml-4 space-y-0.5 sm:space-y-1 text-sm sm:text-base" {...props} />,
                            li: ({ node, ...props }) => <li className="text-sm sm:text-base mb-0.5 sm:mb-1" {...props} />,
                            p: ({ node, ...props }) => (
                                <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap" {...props} />
                            ),
                            strong: ({ node, ...props }) => (
                                <strong
                                    className={`font-bold ${isUser
                                        ? 'text-white'
                                        : 'text-amber-900 dark:text-amber-300'
                                    }`}
                                    {...props}
                                />
                            ),
                            em: ({ node, ...props }) => <em className="italic" {...props} />,
                            blockquote: ({ node, ...props }) => (
                                <blockquote
                                    className={`border-l-4 ${isUser
                                        ? 'border-white/30'
                                        : 'border-amber-200 dark:border-amber-700'
                                    } pl-3 sm:pl-4 italic my-1.5 sm:my-2 text-sm sm:text-base`}
                                    {...props}
                                />
                            ),
                            // @ts-ignore

                            code: ({ node, inline, ...props }) => (
                                inline
                                    ? <code
                                        className={`px-1 rounded text-xs sm:text-sm ${isUser
                                            ? 'bg-white/10'
                                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                                        }`}
                                        {...props}
                                    />
                                    : <code
                                        className={`block p-1.5 sm:p-2 rounded my-1.5 sm:my-2 font-mono text-xs sm:text-sm ${isUser
                                            ? 'bg-white/10'
                                            : 'bg-amber-50 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200'
                                        }`}
                                        {...props}
                                    />
                            )
                        }}
                    >
                        {isUser ? message.content : displayedContent}
                    </ReactMarkdown>

                    {!isUser && !isTypingComplete && (
                        <div className="flex space-x-1.5 mt-2">
                            <motion.div
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 1.2, repeat: Infinity }}
                                className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-500 dark:bg-amber-400"
                            />
                            <motion.div
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 1.2, delay: 0.3, repeat: Infinity }}
                                className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-500 dark:bg-amber-400"
                            />
                            <motion.div
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 1.2, delay: 0.6, repeat: Infinity }}
                                className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-500 dark:bg-amber-400"
                            />
                        </div>
                    )}

                    {/* Bouton pour générer une présentation PowerPoint si un JSON valide est détecté */}
                    {!isUser && isTypingComplete && presentationJson && (
                        <div className="mt-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleGeneratePPTX}
                                disabled={isGeneratingPPTX}
                                className="border-amber-200 dark:border-gray-700 text-gray-700 dark:text-gray-300
                                        hover:bg-amber-50 dark:hover:bg-gray-800 flex items-center gap-2"
                            >
                                {isGeneratingPPTX ? (
                                    <div className="animate-spin h-4 w-4">
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                ) : isPPTXSuccess ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                    <Presentation className="h-4 w-4" />
                                )}
                                <span>Générer la présentation PowerPoint</span>
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-2">
                    <div
                        className={`text-[10px] sm:text-xs ${isUser ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {/* Boutons d'actions: Copier et Partager */}
                    {!isUser && isTypingComplete && (
                        <div className="flex items-center space-x-1">
                            <motion.button
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleCopy}
                                className="text-gray-400 hover:text-amber-500 dark:text-gray-500 dark:hover:text-amber-400 p-1"
                                aria-label="Copier le message"
                                title="Copier le message"
                            >
                                {copied ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleShare}
                                className="text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 p-1"
                                aria-label="Partager le message"
                                title="Partager le message"
                            >
                                <Share2 className="h-4 w-4" />
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>

            {/* Notification de copie réussie */}
            <AnimatePresence>
                {copied && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed bottom-4 right-4 bg-gradient-to-r from-amber-500 to-purple-500 text-white px-4 py-2 rounded-md shadow-lg"
                    >
                        Texte copié !
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal d'options de partage simplifié */}
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
                            className="bg-white dark:bg-gray-900 p-4 rounded-xl max-w-md w-full mx-4 shadow-xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    Partager ce conseil
                                </h3>
                                <button
                                    onClick={() => setShowShareOptions(false)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    <X className="h-5 w-5" />
                                </button>
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

                            <div className="space-y-3">
                                <button
                                    onClick={handleDownload}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
                                >
                                    <Download className="h-5 w-5" />
                                    Télécharger l'image pour partager
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Style pour l'export */}
            {/* @ts-ignore */}

            <style data-jsx="true"  data-global="true">{`
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
