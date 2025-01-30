// resources/js/types/careerAdvisor.ts
import { LucideIcon } from 'lucide-react';

export interface User {
    id: number;
    wallet_balance: number;
}

export interface Auth {
    user: User;
}

export interface Service {
    id: string;
    icon: LucideIcon;
    title: string;
    description: string;
    cost: number;
    category: 'advice' | 'document' | 'interactive';
    formats: string[];
}

export interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface ConversationHistory {
    messages: Message[];
    contextId: string;
}
