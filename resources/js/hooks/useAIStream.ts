import { useState, useRef, useCallback } from 'react';

type AIStreamOptions = {
    onChunk?: (chunk: string) => void;
    onComplete?: (fullContent: string) => void;
    onError?: (error: any) => void;
};

export const useAIStream = () => {
    const [isStreaming, setIsStreaming] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const stream = useCallback(async (
        url: string,
        body: any,
        options: AIStreamOptions = {}
    ) => {
        setIsStreaming(true);
        let fullContent = '';

        // Cancel previous request if active
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
                },
                body: JSON.stringify(body),
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) throw new Error(response.statusText);

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) throw new Error('No reader available');

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') break;

                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.content) {
                                fullContent += parsed.content;
                                options.onChunk?.(parsed.content);
                            } else if (parsed.error) {
                                throw new Error(parsed.error);
                            }
                        } catch (e) {
                            console.warn('Failed to parse stream chunk', e);
                        }
                    }
                }
            }

            options.onComplete?.(fullContent);

        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Stream error:', error);
                options.onError?.(error);
            }
        } finally {
            setIsStreaming(false);
            abortControllerRef.current = null;
        }
    }, []);

    const abort = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsStreaming(false);
        }
    }, []);

    return { stream, abort, isStreaming };
};
