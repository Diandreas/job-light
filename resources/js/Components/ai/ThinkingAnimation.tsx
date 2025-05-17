import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';

interface ThinkingAnimationProps {
    isVisible: boolean;
    variant?: 'default' | 'compact' | 'minimal';
    theme?: 'amber-purple' | 'blue-indigo';
}

/**
 * Composant d'animation de réflexion IA amélioré
 * Supporte différentes variantes et thèmes de couleurs
 */
export const ThinkingAnimation: React.FC<ThinkingAnimationProps> = ({
                                                                        isVisible,
                                                                        variant = 'default',
                                                                        theme = 'amber-purple'
                                                                    }) => {
    const [step, setStep] = useState(0);
    const [pulseActive, setPulseActive] = useState(false);

    // Séquences de réflexion - version courte et optimisée
    const thinkingPhases = [
        "Analyse...",
        "Réflexion...",
        "Génération...",
        "Finalisation..."
    ];

    // Couleurs selon le thème
    const colors = {
        'amber-purple': {
            from: 'from-amber-500',
            to: 'to-purple-500',
            text: 'text-amber-600 dark:text-amber-400',
            bgLight: 'bg-amber-50/80',
            bgDark: 'dark:bg-amber-900/20',
            border: 'border-amber-200 dark:border-amber-800/40'
        },
        'blue-indigo': {
            from: 'from-blue-500',
            to: 'to-indigo-600',
            text: 'text-blue-600 dark:text-blue-400',
            bgLight: 'bg-blue-50/80',
            bgDark: 'dark:bg-blue-900/20',
            border: 'border-blue-200 dark:border-blue-800/40'
        }
    };

    const currentColors = colors[theme];

    // Effet pour l'animation de pulsation
    useEffect(() => {
        if (!isVisible) return;

        const intervalId = setInterval(() => {
            setStep((prev) => (prev + 1) % thinkingPhases.length);
        }, 2000);

        // Pulsation plus rapide
        const pulseInterval = setInterval(() => {
            setPulseActive(prev => !prev);
        }, 800);

        return () => {
            clearInterval(intervalId);
            clearInterval(pulseInterval);
        };
    }, [isVisible]);

    // Ne rien afficher si non visible
    if (!isVisible) return null;

    // Différentes variantes du composant
    if (variant === 'minimal') {
        return (
            <div className="flex items-center gap-2 py-1.5">
                <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: [0.8, 1.2, 0.8],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 1.4,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeInOut"
                            }}
                            className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${currentColors.from} ${currentColors.to}`}
                        />
                    ))}
                </div>
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`text-xs font-medium ${currentColors.text}`}
                >
                    {thinkingPhases[step]}
                </motion.span>
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${currentColors.bgLight} ${currentColors.bgDark} ${currentColors.border} border`}
            >
                <div className="relative">
                    <Sparkles className={`h-3.5 w-3.5 ${currentColors.text}`} />
                    <motion.div
                        className="absolute inset-0 rounded-full"
                        animate={{
                            boxShadow: pulseActive
                                ? `0 0 0 3px rgba(245, 158, 11, 0.1)`
                                : `0 0 0 0px rgba(245, 158, 11, 0)`
                        }}
                        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                    />
                </div>
                <AnimatePresence mode="wait">
                    <motion.span
                        key={step}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.3 }}
                        className={`text-xs font-medium ${currentColors.text}`}
                    >
                        {thinkingPhases[step]}
                    </motion.span>
                </AnimatePresence>
            </motion.div>
        );
    }

    // Variante par défaut - plus riche visuellement mais toujours compacte
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-center gap-3 py-2 px-3 rounded-lg ${currentColors.bgLight} ${currentColors.bgDark} ${currentColors.border} border max-w-xs mx-auto`}
        >
            <div className="relative">
                <motion.div
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${currentColors.from} ${currentColors.to} flex items-center justify-center`}
                    animate={{
                        scale: pulseActive ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                >
                    <Brain className="h-4 w-4 text-white" />
                </motion.div>

                {/* Cercles d'ondes */}
                {[1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        className="absolute inset-0 rounded-full"
                        initial={{ opacity: 0.8, scale: 1 }}
                        animate={{
                            opacity: 0,
                            scale: 1.5 + (i * 0.2)
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.4,
                            ease: "easeOut"
                        }}
                        style={{
                            background: `radial-gradient(circle, ${theme === 'amber-purple' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)'} 0%, transparent 70%)`
                        }}
                    />
                ))}
            </div>
            <div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col"
                    >
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">IA est en train de réfléchir</span>
                        <span className={`text-xs ${currentColors.text} flex items-center`}>
                            <span>{thinkingPhases[step]}</span>
                            <motion.div
                                animate={{
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="ml-1"
                            >
                                {[0, 1, 2].map((i) => (
                                    <span key={i} className="inline-block mx-px">•</span>
                                ))}
                            </motion.div>
                        </span>
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

/**
 * Composant optimisé pour remplacer l'effet de typing
 * Peut être intégré directement dans le MessageBubble
 */
export const TypingIndicator: React.FC<{
    isTyping: boolean;
    theme?: 'amber-purple' | 'blue-indigo' | 'neutral';
}> = ({ isTyping, theme = 'amber-purple' }) => {
    const colors = {
        'amber-purple': 'bg-amber-400 dark:bg-amber-500',
        'blue-indigo': 'bg-blue-400 dark:bg-blue-500',
        'neutral': 'bg-gray-400 dark:bg-gray-500'
    };

    if (!isTyping) return null;

    return (
        <div className="flex space-x-1.5 mt-2 ml-1">
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    custom={i}
                    animate={{
                        scale: [0.7, 1.1, 0.7],
                        opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                        duration: 1.4,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut"
                    }}
                    className={`inline-block w-2 h-2 rounded-full ${colors[theme]}`}
                />
            ))}
        </div>
    );
};

export default ThinkingAnimation;
