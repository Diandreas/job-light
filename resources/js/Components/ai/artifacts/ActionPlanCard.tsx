import React from 'react';
import { Target, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { cn } from '@/lib/utils';
import type { ActionPlanItem } from '@/schemas/career-advisor';

interface ActionPlanCardProps {
    items: ActionPlanItem[];
}

const priorityConfig = {
    high: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Haute' },
    medium: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: 'Moyenne' },
    low: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Basse' },
};

export default function ActionPlanCard({ items }: ActionPlanCardProps) {
    if (!items || items.length === 0) return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Plan d'action</span>
            </div>

            <div className="space-y-3">
                {items.map((item, index) => {
                    const priority = priorityConfig[item.priority] || priorityConfig.medium;
                    return (
                        <div
                            key={index}
                            className="flex items-start gap-3 p-2 rounded-md bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700"
                        >
                            <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{item.step}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800 dark:text-gray-200">{item.action}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    {item.timeline && (
                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                            <Clock className="h-3 w-3" />
                                            <span>{item.timeline}</span>
                                        </div>
                                    )}
                                    <Badge className={cn("text-xs px-1.5 py-0 h-4", priority.color)} variant="secondary">
                                        {priority.label}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
