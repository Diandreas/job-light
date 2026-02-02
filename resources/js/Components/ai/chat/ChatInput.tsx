import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader, Coins } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    placeholder?: string;
    disabled?: boolean;
    isLoading?: boolean;
    cost?: number;
    maxLength?: number;
}

export default function ChatInput({
    value,
    onChange,
    onSubmit,
    placeholder = '',
    disabled = false,
    isLoading = false,
    cost = 0,
    maxLength = 2000,
}: ChatInputProps) {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    const adjustHeight = useCallback((element: HTMLTextAreaElement) => {
        element.style.height = 'auto';
        const newHeight = Math.min(Math.max(element.scrollHeight, 36), 72);
        element.style.height = `${newHeight}px`;
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
        adjustHeight(e.target);
    }, [onChange, adjustHeight]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !isLoading && !disabled) {
                onSubmit(e as any);
            }
        }
    }, [value, isLoading, disabled, onSubmit]);

    return (
        <div className="relative">
            <form onSubmit={onSubmit}>
                <div className="relative flex items-end gap-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm transition-all hover:shadow-md focus-within:shadow-md focus-within:border-amber-400 dark:focus-within:border-amber-500">
                    <Textarea
                        ref={inputRef}
                        value={value}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={placeholder}
                        className="flex-1 min-h-[36px] max-h-[72px] border-0 p-0 resize-none bg-transparent text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                        disabled={disabled}
                        maxLength={maxLength}
                    />

                    <div className="flex items-center gap-2 flex-shrink-0">
                        {cost > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-md">
                                <Coins className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                                    {cost}
                                </span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            size="sm"
                            disabled={disabled || !value.trim()}
                            className={cn(
                                "h-8 w-8 p-0 rounded-lg transition-all duration-200",
                                disabled || !value.trim()
                                    ? "opacity-40 cursor-not-allowed bg-gray-400"
                                    : "bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                            )}
                        >
                            {isLoading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                    <Loader className="h-4 w-4 text-white" />
                                </motion.div>
                            ) : (
                                <Send className="h-4 w-4 text-white" />
                            )}
                        </Button>
                    </div>
                </div>

                {value.length > 0 && (
                    <div className="mt-1 px-1">
                        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>{value.length}/{maxLength}</span>
                            <div className="flex items-center gap-2">
                                <kbd className="px-1 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 rounded border">
                                    Enter
                                </kbd>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-0.5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(value.length / maxLength) * 100}%` }}
                                className={cn(
                                    "h-0.5 rounded-full transition-colors",
                                    value.length > maxLength * 0.9 ? "bg-red-500" :
                                        value.length > maxLength * 0.75 ? "bg-yellow-500" : "bg-amber-500"
                                )}
                            />
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}
