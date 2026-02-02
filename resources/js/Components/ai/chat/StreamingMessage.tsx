import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Loader } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';

interface StreamingMessageProps {
    content: string;
    isStreaming: boolean;
}

export default function StreamingMessage({ content, isStreaming }: StreamingMessageProps) {
    if (!content && !isStreaming) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 items-start"
        >
            <Avatar className="w-7 h-7 flex-shrink-0 mt-1">
                <AvatarImage src="/mascot/mascot.png" />
                <AvatarFallback className="bg-gradient-to-r from-amber-500 to-purple-500 text-white text-xs">
                    AI
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700">
                    {content ? (
                        <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                            {content}
                            {isStreaming && (
                                <motion.span
                                    animate={{ opacity: [1, 0] }}
                                    transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
                                    className="inline-block w-1.5 h-4 bg-amber-500 ml-0.5 align-text-bottom rounded-sm"
                                />
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Loader className="h-3.5 w-3.5 animate-spin" />
                            <span>...</span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
