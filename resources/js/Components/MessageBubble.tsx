import React from 'react';
import { motion } from 'framer-motion';
import { Avatar } from '@/Components/ui/avatar';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { MessageSquare, Bot } from 'lucide-react';

interface MessageProps {
    content: string;
    timestamp: Date;
    role: 'user' | 'assistant';
    language?: 'fr' | 'en';
}

export const MessageBubble = ({ content, timestamp, role, language = 'fr' }: MessageProps) => {
    const isUser = role === 'user';
    const dateLocale = language === 'fr' ? fr : enUS;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}
        >
            <Avatar className={isUser ? 'bg-primary' : 'bg-secondary'}>
                {isUser ? <MessageSquare className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </Avatar>

            <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-lg ${
                    isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                    <p className="whitespace-pre-wrap break-words">{content}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                    {format(new Date(timestamp), 'HH:mm', { locale: dateLocale })}
                </span>
            </div>
        </motion.div>
    );
};

export default MessageBubble;
