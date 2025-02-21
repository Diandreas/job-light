// resources/js/Components/CareerAdvisor/MessageBubble.tsx
import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
    message: {
        role: 'user' | 'assistant';
        content: string;
        timestamp: Date;
    };
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isUser = message.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4`}
        >
            <div
                className={`max-w-[85%] sm:max-w-[80%] p-2.5 sm:p-4 rounded-xl shadow-sm ${
                    isUser
                        ? 'bg-gradient-to-r from-amber-500 to-purple-500 text-white dark:from-amber-400 dark:to-purple-400'
                        : 'bg-white dark:bg-gray-800 border border-amber-100 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                }`}
            >
                <div className="space-y-1.5 sm:space-y-2">
                    <ReactMarkdown
                        components={{
                            h1: ({node, ...props}) => <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-base sm:text-lg font-bold mb-1.5 sm:mb-2" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc ml-4 space-y-0.5 sm:space-y-1 text-sm sm:text-base" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal ml-4 space-y-0.5 sm:space-y-1 text-sm sm:text-base" {...props} />,
                            li: ({node, ...props}) => <li className="text-sm sm:text-base mb-0.5 sm:mb-1" {...props} />,
                            p: ({node, ...props}) => (
                                <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap" {...props} />
                            ),
                            strong: ({node, ...props}) => (
                                <strong
                                    className={`font-bold ${
                                        isUser
                                            ? 'text-white'
                                            : 'text-amber-900 dark:text-amber-300'
                                    }`}
                                    {...props}
                                />
                            ),
                            em: ({node, ...props}) => <em className="italic" {...props} />,
                            blockquote: ({node, ...props}) => (
                                <blockquote
                                    className={`border-l-4 ${
                                        isUser
                                            ? 'border-white/30'
                                            : 'border-amber-200 dark:border-amber-700'
                                    } pl-3 sm:pl-4 italic my-1.5 sm:my-2 text-sm sm:text-base`}
                                    {...props}
                                />
                            ),
                            // @ts-ignore
                            code: ({node, inline, ...props}) => (
                                inline
                                    ? <code
                                        className={`px-1 rounded text-xs sm:text-sm ${
                                            isUser
                                                ? 'bg-white/10'
                                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                                        }`}
                                        {...props}
                                    />
                                    : <code
                                        className={`block p-1.5 sm:p-2 rounded my-1.5 sm:my-2 font-mono text-xs sm:text-sm ${
                                            isUser
                                                ? 'bg-white/10'
                                                : 'bg-amber-50 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200'
                                        }`}
                                        {...props}
                                    />
                            )
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                </div>
                <div
                    className={`text-[10px] sm:text-xs mt-1.5 sm:mt-2 ${
                        isUser
                            ? 'text-white/70'
                            : 'text-gray-500 dark:text-gray-400'
                    }`}
                >
                    {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
            </div>
        </motion.div>
    );
};
