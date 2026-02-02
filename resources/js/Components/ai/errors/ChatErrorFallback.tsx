import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/Components/ui/button';

interface ChatErrorFallbackProps {
    error?: Error | null;
    onRetry?: () => void;
}

export default function ChatErrorFallback({ error, onRetry }: ChatErrorFallbackProps) {
    return (
        <div className="flex flex-col items-center justify-center p-8 h-full">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-7 w-7 text-red-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Erreur du chat
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center max-w-sm">
                {error?.message || 'Une erreur inattendue est survenue dans le module de chat. Veuillez réessayer.'}
            </p>
            {onRetry && (
                <Button onClick={onRetry} variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Recharger
                </Button>
            )}
        </div>
    );
}
