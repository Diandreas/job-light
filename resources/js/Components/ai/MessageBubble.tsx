import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Share2, Download, X } from 'lucide-react';
import html2canvas from 'html2canvas';

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
    const messageRef = useRef<HTMLDivElement>(null);

    // Animation d'écriture rapide pour les messages de l'assistant
    useEffect(() => {
        if (isUser) return;

        setDisplayedContent('');
        setIsTypingComplete(false);

        const charsPerIteration = 12; // Encore plus rapide
        let currentIndex = 0;

        const typingInterval = setInterval(() => {
            const nextIndex = Math.min(currentIndex + charsPerIteration, message.content.length);
            setDisplayedContent(message.content.substring(0, nextIndex));
            currentIndex = nextIndex;

            if (currentIndex >= message.content.length) {
                clearInterval(typingInterval);
                setIsTypingComplete(true);
            }
        }, 5); // Intervalle encore plus court (5ms)

        return () => clearInterval(typingInterval);
    }, [isUser, message.content]);

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
                        <div className="flex space-x-1 mt-1">
                            <motion.div
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                                className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400"
                            />
                            <motion.div
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 0.8, delay: 0.2, repeat: Infinity }}
                                className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400"
                            />
                            <motion.div
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 0.8, delay: 0.4, repeat: Infinity }}
                                className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400"
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-2">
                    <div
                        className={`text-[10px] sm:text-xs ${isUser ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {/* Uniquement bouton de partage */}
                    {!isUser && isTypingComplete && (
                        <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleShare}
                            className="text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 p-1"
                        >
                            <Share2 className="h-4 w-4" />
                        </motion.button>
                    )}
                </div>
            </div>

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