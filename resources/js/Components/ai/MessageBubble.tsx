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
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
        >
            <div className={`max-w-[80%] p-4 rounded-xl shadow-sm ${
                isUser
                    ? 'bg-gradient-to-r from-amber-500 to-purple-500 text-white'
                    : 'bg-white border border-amber-100'
            }`}>
                <div className="space-y-2">
                    <ReactMarkdown
                        components={{
                            h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-3" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-2" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-2" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc ml-4 space-y-1" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal ml-4 space-y-1" {...props} />,
                            li: ({node, ...props}) => <li className="text-base mb-1" {...props} />,
                            p: ({node, ...props}) => (
                                <p className="text-base leading-relaxed whitespace-pre-wrap" {...props} />
                            ),
                            strong: ({node, ...props}) => (
                                <strong className={`font-bold ${isUser ? 'text-white' : 'text-amber-900'}`} {...props} />
                            ),
                            em: ({node, ...props}) => <em className="italic" {...props} />,
                            blockquote: ({node, ...props}) => (
                                <blockquote className={`border-l-4 ${
                                    isUser ? 'border-white/30' : 'border-amber-200'
                                } pl-4 italic my-2`} {...props} />
                            ),
                            code: ({node, inline, ...props}) => (
                                inline
                                    ? <code className={`px-1 rounded ${
                                        isUser
                                            ? 'bg-white/10'
                                            : 'bg-amber-100 text-amber-800'
                                    }`} {...props} />
                                    : <code className={`block p-2 rounded my-2 font-mono text-sm ${
                                        isUser
                                            ? 'bg-white/10'
                                            : 'bg-amber-50'
                                    }`} {...props} />
                            )
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                </div>
                <div className={`text-xs mt-2 ${isUser ? 'text-white/70' : 'text-gray-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                </div>
            </div>
        </motion.div>
    );
};
