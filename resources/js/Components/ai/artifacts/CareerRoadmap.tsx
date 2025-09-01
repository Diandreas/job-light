import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import {
    MapPin, Calendar, Target, TrendingUp, CheckCircle,
    Clock, DollarSign, Star, Lightbulb, ArrowRight,
    Flag, Award, Briefcase, GraduationCap
} from 'lucide-react';

interface RoadmapStep {
    id: string;
    timeframe: string;
    title: string;
    description: string;
    salary?: string;
    actions: string[];
    completed: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
    impact: 'low' | 'medium' | 'high';
    category: 'skill' | 'position' | 'certification' | 'network';
}

interface CareerRoadmapProps {
    title: string;
    steps: RoadmapStep[];
    currentPosition: string;
    targetPosition: string;
    timeframe: string;
    successProbability: number;
}

export default function CareerRoadmap({ 
    title, 
    steps, 
    currentPosition, 
    targetPosition, 
    timeframe,
    successProbability 
}: CareerRoadmapProps) {
    const [selectedStep, setSelectedStep] = useState<RoadmapStep | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

    const completedSteps = steps.filter(step => step.completed).length;
    const progressPercentage = (completedSteps / steps.length) * 100;

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-700 border-green-200';
            case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'hard': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getImpactIcon = (impact: string) => {
        switch (impact) {
            case 'high': return <Star className="w-4 h-4 text-amber-500" />;
            case 'medium': return <Target className="w-4 h-4 text-blue-500" />;
            case 'low': return <Flag className="w-4 h-4 text-gray-500" />;
            default: return <Flag className="w-4 h-4 text-gray-500" />;
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'skill': return <GraduationCap className="w-4 h-4" />;
            case 'position': return <Briefcase className="w-4 h-4" />;
            case 'certification': return <Award className="w-4 h-4" />;
            case 'network': return <Target className="w-4 h-4" />;
            default: return <MapPin className="w-4 h-4" />;
        }
    };

    const filteredSteps = steps.filter(step => {
        if (filter === 'completed') return step.completed;
        if (filter === 'pending') return !step.completed;
        return true;
    });

    const toggleStepCompletion = (stepId: string) => {
        // Cette fonction serait connectée au backend pour persister l'état
        console.log('Toggle step completion:', stepId);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-4"
        >
            <Card className="border-amber-200 bg-gradient-to-r from-amber-50/30 to-purple-50/30">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-amber-600" />
                            {title}
                        </CardTitle>
                        
                        <div className="flex items-center gap-2">
                            <Badge className="bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border-green-200">
                                {successProbability}% succès
                            </Badge>
                        </div>
                    </div>

                    {/* Progression globale */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                                {currentPosition} → {targetPosition}
                            </span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                                {completedSteps}/{steps.length} étapes
                            </span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                        <div className="text-xs text-gray-500 text-center">
                            Objectif: {timeframe}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Filtres */}
                    <div className="flex gap-2">
                        {['all', 'pending', 'completed'].map(filterType => (
                            <Button
                                key={filterType}
                                variant={filter === filterType ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter(filterType as any)}
                                className={`text-xs h-7 ${
                                    filter === filterType 
                                        ? 'bg-gradient-to-r from-amber-500 to-purple-500' 
                                        : 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                }`}
                            >
                                {filterType === 'all' ? 'Toutes' : 
                                 filterType === 'pending' ? 'À faire' : 'Terminées'}
                            </Button>
                        ))}
                    </div>

                    {/* Timeline des étapes */}
                    <div className="relative">
                        {/* Ligne de progression */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500 to-purple-500 opacity-30" />
                        
                        <div className="space-y-4">
                            {filteredSteps.map((step, index) => (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`relative pl-12 ${step.completed ? 'opacity-70' : ''}`}
                                >
                                    {/* Point sur la timeline */}
                                    <div className={`absolute left-4 top-4 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        step.completed 
                                            ? 'bg-green-500 border-green-500' 
                                            : 'bg-white border-amber-500'
                                    }`}>
                                        {step.completed ? (
                                            <CheckCircle className="w-3 h-3 text-white" />
                                        ) : (
                                            <div className="w-2 h-2 bg-amber-500 rounded-full" />
                                        )}
                                    </div>

                                    {/* Contenu de l'étape */}
                                    <div 
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                            selectedStep?.id === step.id 
                                                ? 'border-amber-500 bg-amber-50' 
                                                : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
                                        }`}
                                        onClick={() => setSelectedStep(selectedStep?.id === step.id ? null : step)}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {getCategoryIcon(step.category)}
                                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                                    {step.title}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {step.timeframe}
                                                </Badge>
                                                {step.salary && (
                                                    <Badge className="bg-green-100 text-green-700 text-xs">
                                                        {step.salary}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                            {step.description}
                                        </p>

                                        <div className="flex items-center gap-2">
                                            <Badge className={getDifficultyColor(step.difficulty)}>
                                                {step.difficulty}
                                            </Badge>
                                            <div className="flex items-center gap-1">
                                                {getImpactIcon(step.impact)}
                                                <span className="text-xs text-gray-600">
                                                    Impact {step.impact}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions détaillées */}
                                        <AnimatePresence>
                                            {selectedStep?.id === step.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-4 pt-4 border-t border-amber-200"
                                                >
                                                    <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                                                        <Lightbulb className="w-4 h-4 text-amber-600" />
                                                        Actions requises
                                                    </h5>
                                                    <div className="space-y-2">
                                                        {step.actions.map((action, actionIndex) => (
                                                            <div key={actionIndex} className="flex items-start gap-2 text-sm">
                                                                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                    <span className="text-white text-xs font-bold">{actionIndex + 1}</span>
                                                                </div>
                                                                <span className="text-gray-700 dark:text-gray-300">{action}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    
                                                    <div className="mt-3 flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => toggleStepCompletion(step.id)}
                                                            className={step.completed 
                                                                ? "bg-green-100 text-green-800 hover:bg-green-200" 
                                                                : "bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600"
                                                            }
                                                        >
                                                            {step.completed ? (
                                                                <>
                                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                                    Terminé
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Target className="w-3 h-3 mr-1" />
                                                                    Marquer terminé
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Résumé et motivation */}
                    <div className="pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <div className="text-lg font-bold text-amber-600">
                                    {Math.round(progressPercentage)}%
                                </div>
                                <div className="text-xs text-gray-600">Progression</div>
                            </div>
                            <div>
                                <div className="text-lg font-bold text-purple-600">
                                    {steps.length - completedSteps}
                                </div>
                                <div className="text-xs text-gray-600">Étapes restantes</div>
                            </div>
                        </div>

                        {progressPercentage === 100 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg text-center"
                            >
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Award className="w-5 h-5 text-green-600" />
                                    <span className="font-bold text-green-800">Objectif Atteint !</span>
                                </div>
                                <p className="text-sm text-green-700">
                                    Félicitations ! Vous avez complété votre roadmap carrière.
                                </p>
                            </motion.div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}