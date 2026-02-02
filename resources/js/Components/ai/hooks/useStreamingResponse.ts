import { useState, useCallback, useRef } from 'react';

interface UseStreamingResponseOptions {
    onChunk?: (content: string) => void;
    onDone?: (fullContent: string) => void;
    onError?: (error: string) => void;
}

interface StreamingState {
    isStreaming: boolean;
    content: string;
    error: string | null;
}

export function useStreamingResponse(options: UseStreamingResponseOptions = {}) {
    const [state, setState] = useState<StreamingState>({
        isStreaming: false,
        content: '',
        error: null,
    });
    const abortControllerRef = useRef<AbortController | null>(null);

    const startStream = useCallback(async (payload: {
        message: string;
        contextId: string;
        language: string;
        serviceId: string;
        history: Array<{ role: string; content: string }>;
    }) => {
        // Abort any existing stream
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setState({ isStreaming: true, content: '', error: null });
        let fullContent = '';

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const response = await fetch('/career-advisor/chat/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Erreur serveur' }));
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('ReadableStream not supported');

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const data = line.slice(6).trim();

                    if (data === '[DONE]') {
                        setState(prev => ({ ...prev, isStreaming: false }));
                        options.onDone?.(fullContent);
                        return fullContent;
                    }

                    try {
                        const parsed = JSON.parse(data);

                        if (parsed.error) {
                            throw new Error(parsed.error);
                        }

                        if (parsed.content) {
                            fullContent += parsed.content;
                            setState(prev => ({
                                ...prev,
                                content: fullContent,
                            }));
                            options.onChunk?.(parsed.content);
                        }
                    } catch (parseError) {
                        if (parseError instanceof SyntaxError) continue;
                        throw parseError;
                    }
                }
            }

            // If we reach here without [DONE], stream ended naturally
            setState(prev => ({ ...prev, isStreaming: false }));
            options.onDone?.(fullContent);
            return fullContent;
        } catch (err: any) {
            if (err.name === 'AbortError') return '';

            const errorMessage = err.message || 'Erreur de streaming';
            setState({ isStreaming: false, content: fullContent, error: errorMessage });
            options.onError?.(errorMessage);
            throw err;
        }
    }, [options.onChunk, options.onDone, options.onError]);

    const abort = useCallback(() => {
        abortControllerRef.current?.abort();
        setState(prev => ({ ...prev, isStreaming: false }));
    }, []);

    return {
        ...state,
        startStream,
        abort,
    };
}
