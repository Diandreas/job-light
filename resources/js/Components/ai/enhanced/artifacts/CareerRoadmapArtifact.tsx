import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import {
    Target, Calendar, Star, TrendingUp, CheckCircle,
    Clock, Award, ArrowRight, MapPin, Briefcase, Users,
    Zap, Download, Eye, RefreshCw, ChevronDown, ChevronRight,
    DollarSign, BarChart3, CheckCircle2, Circle
} from 'lucide-react';

interface RoadmapStep {
    id: string;
    title: string;
    description?: string;
    timeframe?: string;
    timeline?: string; // Compatibilité
    priority: 'high' | 'medium' | 'low';
    category: 'skill' | 'experience' | 'network' | 'certification';
    completed: boolean;
    progress: number;
    milestones?: string[];
}

interface CareerRoadmapArtifactProps {
    data: {
        currentPosition?: string;
        targetPosition?: string;
        timeframe?: string;
        steps: RoadmapStep[];
        successProbability?: number;
        salaryProgression?: {
            current: number;
            projected_1year: number;
            projected_3years: number;
            potential_max: number;
        };
        // Compatibilité ancienne interface
        scores?: { [key: string]: { value: number, max: number } };
        actionItems?: string[];
    };
    messageContent: string;
    onAction?: (action: string, data: any) => void;
}

export default function CareerRoadmapArtifact({ data, messageContent, onAction }: CareerRoadmapArtifactProps) {
    const [selectedStep, setSelectedStep] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'timeline' | 'compact'>('timeline');
    const [showSalaryDetails, setShowSalaryDetails] = useState(false);

    // Utiliser les données ou fallback
    const roadmapSteps = data.steps || [];
    const overallProgress = roadmapSteps.length > 0 
        ? roadmapSteps.reduce((acc, step) => acc + step.progress, 0) / roadmapSteps.length
        : 0;

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'skill': return Star;
            case 'experience': return Briefcase;
            case 'network': return Users;
            case 'certification': return Award;
            default: return Target;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'skill': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'experience': return 'bg-green-100 text-green-700 border-green-200';
            case 'network': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'certification': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const handleStepComplete = (stepId: string) => {
        onAction?.('step_completed', { stepId });
    };

    const handleStepProgress = (stepId: string, newProgress: number) => {
        onAction?.('step_progress', { stepId, progress: newProgress });
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold text-gray-900">
                                Plan de Carrière
                            </CardTitle>
                            <div className="text-xs text-gray-600">
                                {data.currentPosition && data.targetPosition ? (
                                    <span className="flex items-center gap-1">
                                        <span className="truncate max-w-24">{data.currentPosition}</span>
                                        <ArrowRight className="w-3 h-3 flex-shrink-0" />
                                        <span className="font-medium truncate max-w-24">{data.targetPosition}</span>
                                    </span>
                                ) : (
                                    'Généré par IA'
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewMode(viewMode === 'timeline' ? 'compact' : 'timeline')}
                        className="text-xs px-2 py-1"
                    >
                        <Eye className="w-3 h-3 mr-1" />
                        {viewMode === 'timeline' ? 'Compact' : 'Timeline'}
                    </Button>
                </div>
                
                {/* Stats Compactes */}
                <div className="grid grid-cols-4 gap-2 mt-3">
                    <div className="bg-white rounded p-2 border text-center">
                        <div className="text-lg font-bold text-green-600">{Math.round(overallProgress)}%</div>
                        <div className="text-xs text-gray-500">Progress</div>
                    </div>
                    <div className="bg-white rounded p-2 border text-center">
                        <div className="text-lg font-bold text-blue-600">
                            {roadmapSteps.filter(s => s.completed).length}/{roadmapSteps.length}
                        </div>
                        <div className="text-xs text-gray-500">Étapes</div>
                    </div>
                    {data.successProbability && (
                        <div className="bg-white rounded p-2 border text-center">
                            <div className="text-lg font-bold text-purple-600">{data.successProbability}%</div>
                            <div className="text-xs text-gray-500">Réussite</div>
                        </div>
                    )}
                    {data.salaryProgression && (
                        <div className="bg-white rounded p-2 border text-center cursor-pointer" 
                             onClick={() => setShowSalaryDetails(!showSalaryDetails)}>
                            <div className="text-lg font-bold text-amber-600">
                                +{Math.round((data.salaryProgression.projected_3years - data.salaryProgression.current) / 1000)}k€
                            </div>
                            <div className="text-xs text-gray-500">Salaire</div>
                        </div>
                    )}
                </div>

                {/* Détails Salaire Compacts */}
                <AnimatePresence>
                    {showSalaryDetails && data.salaryProgression && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 bg-white rounded border p-3"
                        >
                            <div className="text-xs space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Actuel</span>
                                    <span className="font-medium">{(data.salaryProgression.current / 1000).toFixed(0)}k€</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">1 an</span>
                                    <span className="text-green-600">+{((data.salaryProgression.projected_1year - data.salaryProgression.current) / 1000).toFixed(0)}k€</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">3 ans</span>
                                    <span className="text-blue-600">+{((data.salaryProgression.projected_3years - data.salaryProgression.current) / 1000).toFixed(0)}k€</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardHeader>

            <CardContent className="p-4">
                {/* Timeline View */}
                {viewMode === 'timeline' && (
                    <div className="space-y-4">
                        {roadmapSteps.map((step, index) => {
                            const IconComponent = getCategoryIcon(step.category);
                            const isSelected = selectedStep === step.id;
                            
                            return (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative"
                                >
                                    {/* Timeline Connector */}
                                    {index < roadmapSteps.length - 1 && (
                                        <div className="absolute left-4 top-12 w-0.5 h-12 bg-gradient-to-b from-gray-300 to-transparent" />
                                    )}
                                    
                                    <Card 
                                        className={`transition-all duration-200 hover:shadow-md border-l-4 ${
                                            step.priority === 'high' ? 'border-l-red-500' :
                                            step.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'
                                        } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                                    >
                                        <CardContent className="p-3">
                                            <div className="flex items-start gap-3">
                                                {/* Icon & Progress Indicator */}
                                                <div className="relative flex-shrink-0">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getCategoryColor(step.category)} border`}>
                                                        <IconComponent className="w-4 h-4" />
                                                    </div>
                                                    {step.completed && (
                                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                                            <CheckCircle2 className="w-3 h-3 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 text-base leading-tight">
                                                                {step.title}
                                                            </h3>
                                                            {step.description && (
                                                                <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                                                                    {step.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                                            <Badge variant="outline" className={`${getPriorityColor(step.priority)} text-xs px-1 py-0`}>
                                                                {step.priority === 'high' ? 'H' :
                                                                 step.priority === 'medium' ? 'M' : 'L'}
                                                            </Badge>
                                                            {step.timeframe && (
                                                                <Badge variant="outline" className="text-xs px-1 py-0">
                                                                    {step.timeframe}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Progress Bar */}
                                                    <div className="mb-2">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs text-gray-500">{step.progress}%</span>
                                                        </div>
                                                        <Progress value={step.progress} className="h-1.5" />
                                                    </div>
                                                    
                                                    {/* Actions Compactes */}
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant={step.completed ? "ghost" : "default"}
                                                            onClick={() => handleStepComplete(step.id)}
                                                            className="flex items-center gap-1 text-xs px-2 py-1 h-6"
                                                        >
                                                            {step.completed ? (
                                                                <>
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                    OK
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Circle className="w-3 h-3" />
                                                                    Faire
                                                                </>
                                                            )}
                                                        </Button>
                                                        
                                                        {!step.completed && step.milestones && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setSelectedStep(isSelected ? null : step.id)}
                                                                className="flex items-center gap-1 text-xs px-2 py-1 h-6"
                                                            >
                                                                <ChevronRight className={`w-3 h-3 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                                                                +
                                                            </Button>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Expanded Details */}
                                                    <AnimatePresence>
                                                        {isSelected && step.milestones && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className="mt-2 pt-2 border-t bg-gray-50 rounded p-2"
                                                            >
                                                                <h4 className="font-medium text-xs text-gray-900 mb-1">Jalons :</h4>
                                                                <ul className="space-y-0.5">
                                                                    {step.milestones.map((milestone, idx) => (
                                                                        <li key={idx} className="flex items-center gap-1 text-xs text-gray-600">
                                                                            <div className="w-1 h-1 rounded-full bg-gray-400" />
                                                                            {milestone}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Compact View */}
                {viewMode === 'compact' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {roadmapSteps.map((step, index) => {
                            const IconComponent = getCategoryIcon(step.category);
                            
                            return (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="hover:shadow-sm transition-shadow border">
                                        <CardContent className="p-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded flex items-center justify-center ${getCategoryColor(step.category)} relative`}>
                                                    <IconComponent className="w-4 h-4" />
                                                    {step.completed && (
                                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                                            <CheckCircle2 className="w-2 h-2 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="font-medium text-gray-900 text-sm leading-tight truncate">
                                                            {step.title}
                                                        </h4>
                                                        <Badge variant="outline" className={`${getPriorityColor(step.priority)} text-xs px-1 py-0`}>
                                                            {step.priority === 'high' ? 'H' :
                                                             step.priority === 'medium' ? 'M' : 'L'}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs text-gray-500">
                                                            {step.timeframe || step.timeline || '3m'}
                                                        </span>
                                                        <div className="flex-1 mx-1">
                                                            <Progress value={step.progress} className="h-1" />
                                                        </div>
                                                        <span className="text-xs text-gray-500 w-8 text-right">
                                                            {step.progress}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Empty State */}
                {roadmapSteps.length === 0 && (
                    <div className="text-center py-8">
                        <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-base font-medium text-gray-900 mb-1">
                            Aucune étape définie
                        </h3>
                        <p className="text-sm text-gray-500">
                            Plan généré automatiquement par l'IA
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}