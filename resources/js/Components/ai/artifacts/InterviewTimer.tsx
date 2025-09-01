import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import {
    Play, Pause, RotateCcw, Timer, AlertTriangle,
    CheckCircle, TrendingUp, Clock, Target, Zap
} from 'lucide-react';

interface Question {
    id: number;
    text: string;
    category: 'technical' | 'behavioral' | 'hr' | 'situational';
    expectedTime: number; // en secondes
    answered: boolean;
    timeSpent?: number;
    score?: number;
}

interface InterviewTimerProps {
    title: string;
    duration: number; // durée totale en minutes
    questions: Question[];
    currentQuestion: number;
    onQuestionChange: (questionIndex: number) => void;
    onTimeUp?: () => void;
}

export default function InterviewTimer({ 
    title, 
    duration, 
    questions, 
    currentQuestion, 
    onQuestionChange,
    onTimeUp 
}: InterviewTimerProps) {
    const [isRunning, setIsRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0); // en secondes
    const [questionStartTime, setQuestionStartTime] = useState(0);
    const [stressLevel, setStressLevel] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const totalSeconds = duration * 60;
    const remainingTime = totalSeconds - elapsedTime;
    const progress = (elapsedTime / totalSeconds) * 100;

    // Timer principal
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setElapsedTime(prev => {
                    const newTime = prev + 1;
                    
                    // Calculer le niveau de stress basé sur le temps restant
                    const timeProgress = newTime / totalSeconds;
                    if (timeProgress > 0.8) setStressLevel(3); // High stress
                    else if (timeProgress > 0.6) setStressLevel(2); // Medium stress
                    else if (timeProgress > 0.3) setStressLevel(1); // Low stress
                    else setStressLevel(0); // No stress
                    
                    // Alerte temps écoulé
                    if (newTime >= totalSeconds && onTimeUp) {
                        onTimeUp();
                        setIsRunning(false);
                    }
                    
                    return newTime;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, totalSeconds, onTimeUp]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getStressColor = (level: number) => {
        switch (level) {
            case 0: return 'text-green-600 bg-green-100';
            case 1: return 'text-blue-600 bg-blue-100';
            case 2: return 'text-amber-600 bg-amber-100';
            case 3: return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStressLabel = (level: number) => {
        switch (level) {
            case 0: return 'Détendu';
            case 1: return 'Concentré';
            case 2: return 'Tendu';
            case 3: return 'Stressé';
            default: return 'Normal';
        }
    };

    const getCurrentQuestion = () => questions[currentQuestion];
    const answeredQuestions = questions.filter(q => q.answered).length;
    const averageTimePerQuestion = answeredQuestions > 0 
        ? elapsedTime / answeredQuestions 
        : 0;

    const getQuestionCategoryColor = (category: string) => {
        switch (category) {
            case 'technical': return 'bg-blue-100 text-blue-700';
            case 'behavioral': return 'bg-purple-100 text-purple-700';
            case 'hr': return 'bg-green-100 text-green-700';
            case 'situational': return 'bg-amber-100 text-amber-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const handlePlayPause = () => {
        setIsRunning(!isRunning);
        if (!isRunning && !questionStartTime) {
            setQuestionStartTime(elapsedTime);
        }
    };

    const handleReset = () => {
        setIsRunning(false);
        setElapsedTime(0);
        setQuestionStartTime(0);
        setStressLevel(0);
    };

    const handleNextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            // Marquer la question actuelle comme répondue
            const timeSpent = elapsedTime - questionStartTime;
            onQuestionChange(currentQuestion + 1);
            setQuestionStartTime(elapsedTime);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-4"
        >
            <Card className="border-amber-200 bg-gradient-to-r from-amber-50/30 to-purple-50/30">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <Timer className="w-5 h-5 text-amber-600" />
                            {title}
                        </CardTitle>
                        
                        <div className="flex items-center gap-2">
                            <Badge className={`${getStressColor(stressLevel)} border-0`}>
                                {getStressLabel(stressLevel)}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Timer principal */}
                    <div className="text-center">
                        <div className="relative w-32 h-32 mx-auto mb-4">
                            {/* Cercle de progression */}
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-gray-200 dark:text-gray-700"
                                />
                                <motion.circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    strokeWidth="4"
                                    className={`${progress > 80 ? 'text-red-500' : progress > 60 ? 'text-amber-500' : 'text-green-500'}`}
                                    strokeLinecap="round"
                                    initial={{ strokeDasharray: "0 283" }}
                                    animate={{ 
                                        strokeDasharray: `${(progress / 100) * 283} 283`,
                                        stroke: progress > 80 ? '#ef4444' : progress > 60 ? '#f59e0b' : '#10b981'
                                    }}
                                    transition={{ duration: 0.5 }}
                                />
                            </svg>
                            
                            {/* Temps au centre */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className={`text-2xl font-bold ${
                                    remainingTime < 300 ? 'text-red-600' : 
                                    remainingTime < 600 ? 'text-amber-600' : 'text-gray-800'
                                }`}>
                                    {formatTime(remainingTime)}
                                </div>
                                <div className="text-xs text-gray-500">restant</div>
                            </div>
                        </div>

                        {/* Contrôles */}
                        <div className="flex justify-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePlayPause}
                                className={`${isRunning ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}
                            >
                                {isRunning ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                                {isRunning ? 'Pause' : 'Start'}
                            </Button>
                            
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleReset}
                                className="border-gray-200 text-gray-700 hover:bg-gray-50"
                            >
                                <RotateCcw className="w-4 h-4 mr-1" />
                                Reset
                            </Button>
                        </div>
                    </div>

                    {/* Question actuelle */}
                    {getCurrentQuestion() && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-800 dark:text-gray-200">
                                    Question {currentQuestion + 1}/{questions.length}
                                </h4>
                                <Badge className={getQuestionCategoryColor(getCurrentQuestion().category)}>
                                    {getCurrentQuestion().category}
                                </Badge>
                            </div>

                            <div className="p-3 bg-white rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {getCurrentQuestion().text}
                                </p>
                                
                                <div className="mt-3 flex items-center justify-between">
                                    <div className="text-xs text-gray-500">
                                        Temps suggéré: {formatTime(getCurrentQuestion().expectedTime)}
                                    </div>
                                    <div className="text-xs font-medium text-gray-700">
                                        Temps actuel: {formatTime(elapsedTime - questionStartTime)}
                                    </div>
                                </div>
                                
                                <Progress 
                                    value={Math.min(100, ((elapsedTime - questionStartTime) / getCurrentQuestion().expectedTime) * 100)}
                                    className="mt-2 h-1"
                                />
                            </div>

                            <Button
                                onClick={handleNextQuestion}
                                disabled={currentQuestion >= questions.length - 1}
                                size="sm"
                                className="w-full bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600"
                            >
                                <Target className="w-4 h-4 mr-2" />
                                {currentQuestion >= questions.length - 1 ? 'Terminer' : 'Question suivante'}
                            </Button>
                        </div>
                    )}

                    {/* Statistiques */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        <div className="text-center">
                            <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                {answeredQuestions}/{questions.length}
                            </div>
                            <div className="text-xs text-gray-600">Questions répondues</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                {formatTime(Math.round(averageTimePerQuestion))}
                            </div>
                            <div className="text-xs text-gray-600">Temps moyen</div>
                        </div>
                    </div>

                    {/* Alerte temps */}
                    {remainingTime < 300 && isRunning && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-3 bg-red-50 border border-red-200 rounded-lg"
                        >
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                <span className="text-sm font-medium text-red-800">
                                    Attention ! Moins de 5 minutes restantes
                                </span>
                            </div>
                        </motion.div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}