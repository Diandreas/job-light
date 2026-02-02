import React from 'react';
import { Lightbulb } from 'lucide-react';
import ScoreCard from './ScoreCard';

interface InterviewScoreCardProps {
    overallScore: number;
    breakdown: Record<string, { score: number; weight?: number; label?: string }>;
    tips: string[];
}

export default function InterviewScoreCard({ overallScore, breakdown, tips }: InterviewScoreCardProps) {
    return (
        <div className="space-y-3">
            <ScoreCard
                label="Score entretien"
                score={overallScore}
                breakdown={breakdown}
            />

            {tips.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Conseils</span>
                    </div>
                    <ul className="space-y-1.5">
                        {tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                                <span className="text-amber-500 mt-0.5">•</span>
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
