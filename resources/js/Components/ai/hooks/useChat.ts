import { useCallback } from 'react';
import axios from 'axios';
import { Message, Service } from '@/types/career-advisor';

interface UseChatOptions {
    onSuccess?: (response: { message: string; tokens: number; balance: number }) => void;
    onError?: (error: string) => void;
}

export function useChat(options: UseChatOptions = {}) {
    /**
     * Send a message to the non-streaming chat endpoint.
     * Wallet is debited server-side AFTER the AI succeeds.
     */
    const sendMessage = useCallback(async (params: {
        message: string;
        contextId: string;
        language: string;
        serviceId: string;
        history: Array<{ role: string; content: string }>;
    }) => {
        try {
            const response = await axios.post('/career-advisor/chat', params);

            const result = {
                message: response.data.message,
                tokens: response.data.tokens || 0,
                balance: response.data.balance,
            };

            options.onSuccess?.(result);
            return result;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error
                || error.message
                || 'Erreur lors du traitement de votre demande';

            options.onError?.(errorMessage);
            throw new Error(errorMessage);
        }
    }, [options.onSuccess, options.onError]);

    return { sendMessage };
}
