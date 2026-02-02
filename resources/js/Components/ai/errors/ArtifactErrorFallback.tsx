import React from 'react';
import { FileWarning } from 'lucide-react';

interface ArtifactErrorFallbackProps {
    error?: Error | null;
}

export default function ArtifactErrorFallback({ error }: ArtifactErrorFallbackProps) {
    return (
        <div className="flex flex-col items-center justify-center p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
            <FileWarning className="h-6 w-6 text-amber-500 mb-2" />
            <p className="text-xs text-amber-700 dark:text-amber-300 text-center">
                Impossible d'afficher cet artefact
            </p>
            {error?.message && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 text-center max-w-xs">
                    {error.message}
                </p>
            )}
        </div>
    );
}
