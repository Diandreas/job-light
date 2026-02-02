import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import EnhancedMessageBubble from '@/Components/ai/enhanced/EnhancedMessageBubble';

interface ChatMessageProps {
    message: {
        role: 'user' | 'assistant';
        content: string;
        timestamp?: Date | string;
        serviceId?: string;
        isLatest?: boolean;
        isThinking?: boolean;
    };
    onArtifactAction?: (action: string, data: any) => void;
}

/**
 * Wrapper component that delegates to EnhancedMessageBubble for rendering.
 * This keeps the existing artifact detection and rich rendering logic.
 */
export default function ChatMessage({ message, onArtifactAction }: ChatMessageProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
        >
            <EnhancedMessageBubble
                message={{ ...message, timestamp: message.timestamp || new Date() }}
                onArtifactAction={onArtifactAction}
            />
        </motion.div>
    );
}
