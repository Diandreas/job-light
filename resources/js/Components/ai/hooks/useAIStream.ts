import { useState, useCallback, useRef } from 'react';

export interface UseAIStreamOptions {
  onStart?: () => void;
  onChunk?: (chunk: string, fullContent: string) => void;
  onComplete?: (fullContent: string) => void;
  onError?: (error: Error) => void;
}

export interface UseAIStreamReturn {
  content: string;
  isStreaming: boolean;
  error: Error | null;
  startStream: (data: any) => Promise<void>;
  stopStream: () => void;
  reset: () => void;
}

export function useAIStream(
  endpoint: string,
  options: UseAIStreamOptions = {}
): UseAIStreamReturn {
  const [content, setContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startStream = useCallback(
    async (data: any) => {
      try {
        setIsStreaming(true);
        setError(null);
        setContent('');
        options.onStart?.();

        // Create abort controller for cancellation
        abortControllerRef.current = new AbortController();

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
          body: JSON.stringify(data),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let accumulatedContent = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.trim() === '') continue;

            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6);

              if (dataStr === '[DONE]') {
                setIsStreaming(false);
                options.onComplete?.(accumulatedContent);
                return;
              }

              try {
                const parsed = JSON.parse(dataStr);

                if (parsed.content) {
                  accumulatedContent += parsed.content;
                  setContent(accumulatedContent);
                  options.onChunk?.(parsed.content, accumulatedContent);
                }

                if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch (parseError) {
                // If JSON parsing fails, treat as plain text
                if (dataStr !== '[DONE]') {
                  accumulatedContent += dataStr;
                  setContent(accumulatedContent);
                  options.onChunk?.(dataStr, accumulatedContent);
                }
              }
            }
          }
        }

        setIsStreaming(false);
        options.onComplete?.(accumulatedContent);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Stream aborted');
        } else {
          console.error('Stream error:', err);
          setError(err);
          options.onError?.(err);
        }
        setIsStreaming(false);
      }
    },
    [endpoint, options]
  );

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  const reset = useCallback(() => {
    stopStream();
    setContent('');
    setError(null);
  }, [stopStream]);

  return {
    content,
    isStreaming,
    error,
    startStream,
    stopStream,
    reset,
  };
}

// Specialized hook for cover letter generation
export function useCoverLetterAI() {
  return useAIStream('/career-advisor/cover-letter/generate');
}

// Specialized hook for CV improvement
export function useCVAI() {
  return useAIStream('/career-advisor/cv/improve-section');
}

// Specialized hook for interview questions
export function useInterviewAI() {
  return useAIStream('/career-advisor/interview/next-question');
}

// Specialized hook for roadmap generation
export function useRoadmapAI() {
  return useAIStream('/career-advisor/roadmap/generate');
}
