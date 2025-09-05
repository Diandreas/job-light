import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import {
    Target, Calendar, Star, TrendingUp, CheckCircle,
    Clock, Award, ArrowRight, MapPin, Briefcase, Users,
    Zap, Download, Eye, RefreshCw
} from 'lucide-react';

interface CareerRoadmapArtifactProps {
    data: {
        scores: { [key: string]: { value: number, max: number } };
        actionItems: string[];
    };
    messageContent: string;
    onAction?: (action: string, data: any) => void;
}

interface RoadmapStep {
    id: string;
    title: string;
    description: string;
    timeline: string;
    priority: 'high' | 'medium' | 'low';
    category: 'skill' | 'experience' | 'network' | 'certification';
    completed: boolean;
    progress: number;
}

export default function CareerRoadmapArtifact({ data, messageContent, onAction }: CareerRoadmapArtifactProps) {
    const [selectedStep, setSelectedStep] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');

    // Extraire les objectifs du contenu du message
    const extractRoadmapSteps = (): RoadmapStep[] => {
        // Simulation d'extraction intelligente basée sur le contenu
        const steps: RoadmapStep[] = [
            {
                id: 'skill-development',
                title: 'Développer compétences clés',
                description: 'Renforcer les compétences techniques et soft skills identifiées',
                timeline: '3 mois',
                priority: 'high',
                category: 'skill',
                completed: false,
                progress: 25
            },
            {
                id: 'network-building',
                title: 'Étendre réseau professionnel',
                description: 'Participer à des événements sectoriels et développer son LinkedIn',
                timeline: '6 mois',
                priority: 'medium',
                category: 'network',
                completed: false,
                progress: 10
            },
            {
                id: 'experience-gain',
                title: 'Acquérir expérience ciblée',
                description: 'Rechercher des missions ou projets dans le domaine visé',
                timeline: '12 mois',
                priority: 'high',
                category: 'experience',
                completed: false,
                progress: 5
            },
            {
                id: 'certification',
                title: 'Obtenir certifications',
                description: 'Valider expertise avec certifications reconnues du secteur',
                timeline: '6 mois',
                priority: 'medium',
                category: 'certification',
                completed: false,
                progress: 0
            }
        ];

        return steps;
    };

    const roadmapSteps = extractRoadmapSteps();
    const overallProgress = roadmapSteps.reduce((acc, step) => acc + step.progress, 0) / roadmapSteps.length;

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
            case 'skill': return 'amber';
            case 'experience': return 'purple';
            case 'network': return 'amber';
            case 'certification': return 'purple';
            default: return 'gray';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200';
            case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'low': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="space-y-4">
            {/* Header de l'artefact */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-amber-800">Roadmap Carrière Personnalisée</h3>
                        <p className="text-xs text-amber-600">Plan d'action basé sur votre profil</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <Badge className="bg-amber-100 text-amber-700">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {Math.round(overallProgress)}% complété
                    </Badge>
                    
                    <div className="flex bg-amber-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('timeline')}
                            className={`px-2 py-1 rounded text-xs transition-all ${
                                viewMode === 'timeline' 
                                    ? 'bg-amber-500 text-white' 
                                    : 'text-amber-700 hover:bg-amber-200'
                            }`}
                        >
                            Timeline
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-2 py-1 rounded text-xs transition-all ${
                                viewMode === 'grid' 
                                    ? 'bg-amber-500 text-white' 
                                    : 'text-amber-700 hover:bg-amber-200'
                            }`}
                        >
                            Grille
                        </button>
                    </div>
                </div>
            </div>

            {/* Progress global */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-amber-800">Progression globale</span>
                    <span className="text-sm font-bold text-amber-900">{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="h-3" />
                <div className="text-xs text-amber-600 mt-1">
                    {roadmapSteps.filter(s => s.completed).length}/{roadmapSteps.length} objectifs atteints
                </div>
            </div>

            {/* Vue Timeline */}
            {viewMode === 'timeline' && (
                <div className="space-y-4">
                    {roadmapSteps.map((step, index) => {
                        const Icon = getCategoryIcon(step.category);
                        const color = getCategoryColor(step.category);
                        
                        return (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative"
                            >
                                {/* Ligne de connexion */}
                                {index < roadmapSteps.length - 1 && (
                                    <div className="absolute left-6 top-12 w-0.5 h-8 bg-amber-200" />
                                )}
                                
                                <div className="flex gap-4">
                                    {/* Icône étape */}
                                    <div className={`w-12 h-12 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-full flex items-center justify-center shadow-lg`}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    
                                    {/* Contenu étape */}
                                    <div className="flex-1">
                                        <Card className={`border-${color}-200 hover:shadow-md transition-shadow cursor-pointer`}
                                              onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}>
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                                            {step.title}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {step.description}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="flex flex-col items-end gap-2">
                                                        <Badge className={getPriorityColor(step.priority)}>
                                                            {step.priority === 'high' ? 'Priorité haute' : 
                                                             step.priority === 'medium' ? 'Priorité moyenne' : 'Priorité basse'}
                                                        </Badge>
                                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                                            <Clock className="w-3 h-3" />
                                                            {step.timeline}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <Progress value={step.progress} className="h-2" />
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {step.progress}% complété
                                                        </div>
                                                    </div>
                                                    
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost"
                                                        className={`ml-4 text-${color}-600 hover:bg-${color}-50`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onAction?.('start-objective', step);
                                                        }}
                                                    >
                                                        <ArrowRight className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                                
                                                {/* Détails expandables */}
                                                <AnimatePresence>
                                                    {selectedStep === step.id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="mt-3 pt-3 border-t border-amber-200"
                                                        >
                                                            <div className="space-y-2">
                                                                <div className="text-xs">
                                                                    <strong>Actions concrètes :</strong>
                                                                    <ul className="mt-1 space-y-1 text-amber-700">
                                                                        <li>• Identifier 3 compétences clés à développer</li>
                                                                        <li>• Suivre 2 formations en ligne</li>
                                                                        <li>• Pratiquer sur 1 projet personnel</li>
                                                                    </ul>
                                                                </div>
                                                                
                                                                <div className="flex gap-2">
                                                                    <Button size="sm" className="bg-gradient-to-r from-amber-500 to-purple-500 text-white">
                                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                                        Marquer terminé
                                                                    </Button>
                                                                    <Button size="sm" variant="outline" className="border-amber-200 text-amber-700">
                                                                        <Calendar className="w-3 h-3 mr-1" />
                                                                        Programmer
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Vue Grille */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roadmapSteps.map((step, index) => {
                        const Icon = getCategoryIcon(step.category);
                        const color = getCategoryColor(step.category);
                        
                        return (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className={`border-${color}-200 hover:shadow-md transition-shadow h-full`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className={`w-8 h-8 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-lg flex items-center justify-center`}>
                                                <Icon className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                                    {step.title}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge className={getPriorityColor(step.priority)} size="sm">
                                                        {step.priority}
                                                    </Badge>
                                                    <span className="text-xs text-gray-500">{step.timeline}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                                            {step.description}
                                        </p>
                                        
                                        <div className="space-y-2">
                                            <Progress value={step.progress} className="h-1.5" />
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500">
                                                    {step.progress}% complété
                                                </span>
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost"
                                                    className={`h-6 px-2 text-${color}-600 hover:bg-${color}-50`}
                                                    onClick={() => onAction?.('view-details', step)}
                                                >
                                                    <Eye className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Actions globales */}
            <div className="flex justify-center gap-3 pt-4 border-t border-amber-200">
                <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-amber-500 to-purple-500 text-white"
                    onClick={() => onAction?.('export-roadmap', roadmapSteps)}
                >
                    <Download className="w-3 h-3 mr-2" />
                    Exporter PDF
                </Button>
                
                <Button 
                    size="sm" 
                    variant="outline"
                    className="border-amber-200 text-amber-700 hover:bg-amber-50"
                    onClick={() => onAction?.('schedule-review', { date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) })}
                >
                    <Calendar className="w-3 h-3 mr-2" />
                    Planifier suivi
                </Button>
                
                <Button 
                    size="sm" 
                    variant="outline"
                    className="border-purple-200 text-purple-700 hover:bg-purple-50"
                    onClick={() => onAction?.('update-roadmap', {})}
                >
                    <RefreshCw className="w-3 h-3 mr-2" />
                    Mettre à jour
                </Button>
            </div>
        </div>
    );
}