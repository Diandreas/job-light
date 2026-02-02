import React from 'react';
import { cn } from '@/lib/utils';

interface ScoreCardProps {
    label: string;
    score: number;
    breakdown?: Record<string, { score: number; label?: string; weight?: number; comment?: string }>;
}

function getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
}

function getBarColor(score: number): string {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-amber-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
}

export default function ScoreCard({ label, score, breakdown }: ScoreCardProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            {/* Main score */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                <div className="flex items-baseline gap-1">
                    <span className={cn("text-2xl font-bold", getScoreColor(score))}>
                        {score}
                    </span>
                    <span className="text-xs text-gray-400">/100</span>
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                <div
                    className={cn("h-2 rounded-full transition-all duration-500", getBarColor(score))}
                    style={{ width: `${score}%` }}
                />
            </div>

            {/* Breakdown */}
            {breakdown && Object.keys(breakdown).length > 0 && (
                <div className="space-y-2">
                    {Object.entries(breakdown).map(([key, item]) => (
                        <div key={key} className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400 w-28 truncate">
                                {item.label || key}
                            </span>
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                <div
                                    className={cn("h-1.5 rounded-full transition-all duration-500", getBarColor(item.score))}
                                    style={{ width: `${item.score}%` }}
                                />
                            </div>
                            <span className={cn("text-xs font-medium w-8 text-right", getScoreColor(item.score))}>
                                {item.score}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
