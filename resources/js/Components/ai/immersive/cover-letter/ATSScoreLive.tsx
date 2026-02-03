import React, { useEffect, useState } from 'react';
import { Progress } from "@/Components/ui/progress";
import { Badge } from "@/Components/ui/badge";
import { CheckCircle, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { useDebounce } from '@/hooks/useDebounce'; // Assuming this hook exists or we use generic delay

export default function ATSScoreLive({ content, jobDescription }) {
    const [score, setScore] = useState(0);
    const [keywords, setKeywords] = useState([]);
    const [loading, setLoading] = useState(false);

    // Simple debounce logic if hook doesn't exist
    const [debouncedContent, setDebouncedContent] = useState(content);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedContent(content);
        }, 1500);
        return () => clearTimeout(handler);
    }, [content]);

    useEffect(() => {
        if (!debouncedContent || debouncedContent.length < 50) return;

        const fetchScore = async () => {
            setLoading(true);
            try {
                // In a real app, this would call the backend score endpoint
                // simulating for now to avoid rapid API costs while typing
                // const res = await axios.post(route('career-advisor.cover-letter.score'), { content: debouncedContent });

                // Mock calculation based on length to demonstrate UI
                const mockScore = Math.min(100, Math.max(20, Math.floor(debouncedContent.length / 10)));
                setScore(mockScore);
                setKeywords(['Teamwork', 'React', 'Communication']); // Mock
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchScore();
    }, [debouncedContent]);

    const getColor = (s) => {
        if (s >= 80) return 'bg-emerald-500';
        if (s >= 60) return 'bg-amber-500';
        return 'bg-red-500';
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">ATS Score</h4>
                    <span className="text-xs text-gray-500">Real-time analysis</span>
                </div>
                <div className="text-2xl font-bold transition-all duration-500">
                    {score}/100
                </div>
            </div>
            <Progress value={score} className="h-2 mb-4" indicatorClassName={getColor(score)} />

            <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-500" /> Professional Tone
                </Badge>
                {score < 60 && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1 border-amber-200 bg-amber-50">
                        <AlertTriangle className="w-3 h-3 text-amber-500" /> Too Short
                    </Badge>
                )}
            </div>
        </div>
    );
}
