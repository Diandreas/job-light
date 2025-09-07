import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import {
    DollarSign, TrendingUp, Target, AlertTriangle, CheckCircle,
    Lightbulb, Zap, BarChart3, Users, Calendar, Trophy
} from 'lucide-react';

interface NegotiationStrategy {
    id: string;
    title: string;
    description: string;
    risk: 'low' | 'medium' | 'high';
    success_rate: number;
    timeframe: string;
}

interface SalaryNegotiatorProps {
    title: string;
    currentSalary: string;
    targetSalary: string;
    marketRange: string;
    negotiationStrategies: NegotiationStrategy[];
    argumentationPoints: string[];
    alternativeOffers: string[];
    successProbability: number;
}

export default function SalaryNegotiator({
    title,
    currentSalary,
    targetSalary,
    marketRange,
    negotiationStrategies,
    argumentationPoints,
    alternativeOffers,
    successProbability
}: SalaryNegotiatorProps) {
    const [selectedStrategy, setSelectedStrategy] = useState<NegotiationStrategy | null>(null);
    const [customTarget, setCustomTarget] = useState(targetSalary);
    const [negotiationNotes, setNegotiationNotes] = useState('');
    const [showSimulation, setShowSimulation] = useState(false);

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'low': return 'bg-green-100 text-green-700 border-green-200';
            case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'high': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getSuccessColor = (rate: number) => {
        if (rate >= 80) return 'text-green-600';
        if (rate >= 60) return 'text-amber-600';
        return 'text-red-600';
    };

    const calculateIncrease = () => {
        const current = parseInt(currentSalary.replace(/[^\d]/g, ''));
        const target = parseInt(customTarget.replace(/[^\d]/g, ''));
        if (current && target) {
            const increase = ((target - current) / current) * 100;
            return Math.round(increase);
        }
        return 0;
    };

    const runNegotiationSimulation = () => {
        setShowSimulation(true);
        // Logique de simulation
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
                            <DollarSign className="w-5 h-5 text-amber-600" />
                            {title}
                        </CardTitle>
                        
                        <div className="flex items-center gap-2">
                            <Badge className="bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border-green-200">
                                {successProbability}% succès
                            </Badge>
                        </div>
                    </div>

                    {/* Vue d'ensemble financière */}
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                            <div className="text-sm text-gray-600">Actuel</div>
                            <div className="text-lg font-bold text-gray-800">{currentSalary}</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
                            <div className="text-sm text-gray-600">Objectif</div>
                            <div className="text-lg font-bold text-amber-600">{targetSalary}</div>
                            <div className="text-xs text-green-600">+{calculateIncrease()}%</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                            <div className="text-sm text-gray-600">Marché</div>
                            <div className="text-lg font-bold text-gray-800">{marketRange}</div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Stratégies de négociation */}
                    <div>
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4 text-amber-600" />
                            Stratégies Recommandées
                        </h4>
                        
                        <div className="space-y-2">
                            {negotiationStrategies.map((strategy, index) => (
                                <motion.div
                                    key={strategy.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                        selectedStrategy?.id === strategy.id
                                            ? 'border-amber-500 bg-amber-50'
                                            : 'border-gray-200 bg-white hover:border-amber-300'
                                    }`}
                                    onClick={() => setSelectedStrategy(
                                        selectedStrategy?.id === strategy.id ? null : strategy
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h5 className="font-medium text-gray-800 dark:text-gray-200">
                                                {strategy.title}
                                            </h5>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {strategy.description}
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 ml-3">
                                            <Badge className={getRiskColor(strategy.risk)}>
                                                {strategy.risk}
                                            </Badge>
                                            <div className="text-right">
                                                <div className={`text-sm font-bold ${getSuccessColor(strategy.success_rate)}`}>
                                                    {strategy.success_rate}%
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {strategy.timeframe}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Progress value={strategy.success_rate} className="h-1 mt-2" />
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Arguments clés */}
                    <div>
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-600" />
                            Arguments Clés
                        </h4>
                        
                        <div className="space-y-2">
                            {argumentationPoints.map((point, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-start gap-2 p-2 rounded-lg bg-white border border-gray-200"
                                >
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-white text-xs font-bold">{index + 1}</span>
                                    </div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{point}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Alternatives non-monétaires */}
                    <div>
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-600" />
                            Alternatives Non-monétaires
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-2">
                            {alternativeOffers.map((offer, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="p-2 text-center rounded-lg bg-gradient-to-r from-amber-50 to-purple-50 border border-amber-200"
                                >
                                    <span className="text-sm font-medium text-gray-700">{offer}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Simulateur personnalisé */}
                    <div className="pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-amber-600" />
                            Simulateur de Négociation
                        </h4>
                        
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-600 block mb-1">Salaire cible (€)</label>
                                    <Input
                                        type="text"
                                        value={customTarget}
                                        onChange={(e) => setCustomTarget(e.target.value)}
                                        className="text-sm h-8"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <div className="text-center">
                                        <div className="text-xs text-gray-600">Augmentation</div>
                                        <div className="text-lg font-bold text-green-600">
                                            +{calculateIncrease()}%
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-600 block mb-1">Notes de négociation</label>
                                <Textarea
                                    value={negotiationNotes}
                                    onChange={(e) => setNegotiationNotes(e.target.value)}
                                    className="text-sm resize-none h-16"
                                    placeholder="Vos arguments personnels, timing, contexte..."
                                />
                            </div>

                            <Button
                                onClick={runNegotiationSimulation}
                                className="w-full bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600"
                                size="sm"
                            >
                                <Zap className="w-4 h-4 mr-2" />
                                Lancer la simulation
                            </Button>
                        </div>
                    </div>

                    {/* Résultats de simulation */}
                    {showSimulation && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-200"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="font-bold text-green-800">Simulation Complétée</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="text-gray-600">Probabilité de succès</div>
                                    <div className="text-lg font-bold text-green-600">
                                        {Math.min(95, successProbability + calculateIncrease())}%
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray-600">Meilleur moment</div>
                                    <div className="font-medium text-gray-800">
                                        Évaluation annuelle
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-3 p-2 bg-white rounded border border-green-200">
                                <p className="text-xs text-green-700">
                                    <strong>Recommandation :</strong> Avec une augmentation de {calculateIncrease()}%, 
                                    votre demande semble raisonnable. Mettez l'accent sur vos réalisations récentes 
                                    et la valeur ajoutée que vous apportez à l'équipe.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Actions rapides */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50"
                        >
                            <Users className="w-4 h-4 mr-2" />
                            Préparer script
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50"
                        >
                            <Calendar className="w-4 h-4 mr-2" />
                            Planifier entretien
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}