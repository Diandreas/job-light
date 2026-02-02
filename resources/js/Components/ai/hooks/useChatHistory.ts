import { useState, useCallback } from 'react';
import axios from 'axios';

export interface ChatHistoryItem {
    id: number;
    context_id: string;
    service_id: string;
    created_at: string;
    preview?: string;
    messages?: Array<{ role: 'user' | 'assistant'; content: string; timestamp?: string }>;
    messages_count?: number;
}

interface ChatDetail {
    context_id: string;
    service_id: string;
    preview: string;
    created_at: string;
    messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp?: string }>;
}

interface UseChatHistoryOptions {
    onError?: (error: string) => void;
}

export function useChatHistory(
    initialChats: ChatHistoryItem[] = [],
    options: UseChatHistoryOptions = {}
) {
    const [chats, setChats] = useState<ChatHistoryItem[]>(initialChats);

    const loadChats = useCallback(async () => {
        try {
            const response = await axios.get('/career-advisor/chats');
            setChats(response.data);
            return response.data;
        } catch (error: any) {
            options.onError?.('Erreur lors du chargement des conversations');
            return [];
        }
    }, [options.onError]);

    const loadChat = useCallback(async (contextId: string): Promise<ChatDetail | null> => {
        try {
            const response = await axios.get(`/career-advisor/chats/${contextId}`);
            return response.data;
        } catch (error: any) {
            options.onError?.('Erreur lors du chargement de la conversation');
            return null;
        }
    }, [options.onError]);

    const deleteChat = useCallback(async (contextId: string) => {
        try {
            await axios.delete(`/career-advisor/chats/${contextId}`);
            setChats(prev => prev.filter(c => c.context_id !== contextId));
            return true;
        } catch (error: any) {
            options.onError?.('Erreur lors de la suppression');
            return false;
        }
    }, [options.onError]);

    const addChatToList = useCallback((chat: ChatHistoryItem) => {
        setChats(prev => [chat, ...prev.filter(c => c.context_id !== chat.context_id)]);
    }, []);

    return {
        chats,
        setChats,
        loadChats,
        loadChat,
        deleteChat,
        addChatToList,
    };
}
