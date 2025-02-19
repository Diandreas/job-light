import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Message } from '@/types/career-advisor';
import {MessageBubble} from "@/Components/ai/MessageBubble";


interface ChatHistoryProps {
    messages: Message[];
    language?: 'fr' | 'en';
}

const ChatHistory = ({ messages, language = 'fr' }: ChatHistoryProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    return (
        <div ref={scrollRef} className="flex-1 h-[500px]">
            <ScrollArea className="h-full pr-4">
                {messages.map((message, index) => (
                    <MessageBubble
                        key={`${message.timestamp}-${index}`}
                        // @ts-ignore
                        content={message.content}
                        timestamp={message.timestamp}
                        role={message.role}
                        language={language}
                    />
                ))}
            </ScrollArea>
        </div>
    );
};

export default ChatHistory;
