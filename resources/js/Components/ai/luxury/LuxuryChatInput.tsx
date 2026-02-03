import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import { luxuryTheme } from '@/design-system/luxury-theme';
import { LuxuryButton } from '@/Components/ui/luxury/Button';

interface LuxuryChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
    maxLength?: number;
    cost?: number;
    autoFocus?: boolean;
    className?: string;
    initialValue?: string;
}

/**
 * Luxury Chat Input - Zone de saisie minimaliste et épurée
 * Design focus sur la concentration et la clarté
 */
export const LuxuryChatInput: React.FC<LuxuryChatInputProps> = ({
    onSend,
    disabled = false,
    placeholder = 'Posez votre question...',
    maxLength = 2000,
    cost,
    autoFocus = false,
    className = '',
    initialValue = '',
}) => {
    const [message, setMessage] = useState(initialValue);

    useEffect(() => {
        if (initialValue !== message && initialValue !== undefined) {
            setMessage(initialValue);
        }
    }, [initialValue]);
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
            textareaRef.current.style.height = `${newHeight}px`;
        }
    }, [message]);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (message.trim() && !disabled) {
            onSend(message.trim());
            setMessage('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const characterCount = message.length;
    const characterPercentage = (characterCount / maxLength) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: luxuryTheme.animations.easings.elegant }}
            className={`w-full ${className}`}
        >
            <form onSubmit={handleSubmit} className="w-full">
                <div className={`
                    relative rounded-2xl border transition-all duration-400
                    bg-white dark:bg-neutral-900
                    ${isFocused
                        ? 'border-neutral-400 dark:border-neutral-600 shadow-lg'
                        : 'border-neutral-200 dark:border-neutral-800 shadow-sm'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}>
                    {/* Textarea */}
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={placeholder}
                        disabled={disabled}
                        maxLength={maxLength}
                        autoFocus={autoFocus}
                        rows={1}
                        className={`
                            w-full px-6 py-4 rounded-2xl
                            bg-transparent resize-none
                            text-base leading-relaxed
                            text-neutral-900 dark:text-neutral-50
                            placeholder:text-neutral-400 dark:placeholder:text-neutral-600
                            focus:outline-none
                            transition-all duration-400
                        `}
                        style={{
                            minHeight: '56px',
                            maxHeight: '200px',
                        }}
                    />

                    {/* Barre de progression subtile */}
                    {characterCount > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-b-2xl overflow-hidden"
                        >
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(characterPercentage, 100)}%` }}
                                transition={{ duration: 0.2 }}
                                className={`h-full transition-colors duration-300 ${characterPercentage > 90
                                        ? 'bg-red-500'
                                        : characterPercentage > 75
                                            ? 'bg-yellow-500'
                                            : 'bg-neutral-400 dark:bg-neutral-600'
                                    }`}
                            />
                        </motion.div>
                    )}

                    {/* Bouton d'envoi flottant */}
                    <div className="absolute right-3 bottom-3 flex items-center gap-2">
                        {/* Compteur de caractères */}
                        <AnimatePresence>
                            {characterCount > maxLength * 0.7 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className={`
                                        px-2 py-1 rounded-lg text-xs font-medium
                                        ${characterPercentage > 90
                                            ? 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400'
                                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                                        }
                                    `}
                                >
                                    {characterCount} / {maxLength}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Badge de coût */}
                        {cost !== undefined && message.trim() && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800"
                            >
                                <Sparkles className="w-3 h-3 text-neutral-600 dark:text-neutral-400" />
                                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                    {cost}
                                </span>
                            </motion.div>
                        )}

                        {/* Bouton d'envoi */}
                        <motion.button
                            type="submit"
                            disabled={disabled || !message.trim()}
                            whileHover={{ scale: message.trim() ? 1.05 : 1 }}
                            whileTap={{ scale: message.trim() ? 0.95 : 1 }}
                            transition={{ duration: 0.2, ease: luxuryTheme.animations.easings.luxury }}
                            className={`
                                p-2.5 rounded-xl transition-all duration-400
                                ${message.trim() && !disabled
                                    ? 'bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 shadow-md hover:shadow-lg'
                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
                                }
                            `}
                        >
                            <Send className="w-4 h-4" />
                        </motion.button>
                    </div>
                </div>

                {/* Hint subtil */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isFocused ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2 px-2 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-500"
                >
                    <span>Appuyez sur Entrée pour envoyer</span>
                    <span>Shift + Entrée pour une nouvelle ligne</span>
                </motion.div>
            </form>
        </motion.div>
    );
};

export default LuxuryChatInput;
