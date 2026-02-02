import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface KeywordAnalysisProps {
    found: string[];
    missing: string[];
}

export default function KeywordAnalysis({ found, missing }: KeywordAnalysisProps) {
    if (found.length === 0 && missing.length === 0) return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Analyse des mots-clés
            </h4>

            {found.length > 0 && (
                <div className="mb-3">
                    <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1.5 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Détectés ({found.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {found.map((kw, i) => (
                            <span key={i} className="px-2 py-0.5 text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full border border-green-200 dark:border-green-800">
                                {kw}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {missing.length > 0 && (
                <div>
                    <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1.5 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        Manquants ({missing.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {missing.map((kw, i) => (
                            <span key={i} className="px-2 py-0.5 text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full border border-red-200 dark:border-red-800">
                                {kw}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
