import React, { useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/Components/ui/scroll-area';
import ChatMessage from './ChatMessage';
import StreamingMessage from './StreamingMessage';
import { ErrorBoundary } from '@/Components/ai/errors/ErrorBoundary';
import ArtifactErrorFallback from '@/Components/ai/errors/ArtifactErrorFallback';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date | string;
    isLatest?: boolean;
    isThinking?: boolean;
}

interface ChatViewProps {
    messages: Message[];
    tempMessage?: (Message & { isThinking: boolean }) | null;
    streamingContent?: string;
    isStreaming?: boolean;
    serviceId: string;
    onArtifactAction?: (action: string, data: any) => void;
}

export default function ChatView({
    messages,
    tempMessage,
    streamingContent = '',
    isStreaming = false,
    serviceId,
    onArtifactAction,
}: ChatViewProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            const el = scrollRef.current;
            setTimeout(() => {
                el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
            }, 100);
        }
    }, [messages, tempMessage, streamingContent]);

    return (
        <div className="flex-1 min-h-0">
            <ScrollArea className="h-full" ref={scrollRef}>
                <div className="max-w-4xl mx-auto space-y-4 p-4">
                    <AnimatePresence mode="popLayout">
                        {messages.map((message, index) => (
                            <ErrorBoundary key={`msg-${index}`} fallback={<ArtifactErrorFallback />}>
                                <ChatMessage
                                    message={{
                                        ...message,
                                        serviceId,
                                        isLatest: index === messages.length - 1 && !tempMessage && !isStreaming,
                                    }}
                                    onArtifactAction={onArtifactAction}
                                />
                            </ErrorBoundary>
                        ))}

                        {/* Thinking message (non-streaming mode) */}
                        {tempMessage && !isStreaming && (
                            <ErrorBoundary key="thinking" fallback={<ArtifactErrorFallback />}>
                                <ChatMessage
                                    message={{
                                        ...tempMessage,
                                        serviceId,
                                        isLatest: true,
                                    }}
                                    onArtifactAction={onArtifactAction}
                                />
                            </ErrorBoundary>
                        )}

                        {/* Streaming message */}
                        {isStreaming && (
                            <StreamingMessage
                                key="streaming"
                                content={streamingContent}
                                isStreaming={isStreaming}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </ScrollArea>
        </div>
    );
}
