import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { ScrollArea } from '@/Components/ui/scroll-area';
import {
    X, ChevronRight, ChevronLeft, Maximize2, Minimize2,
    FileSpreadsheet, BarChart3, CheckCircle, TrendingUp,
    Eye, EyeOff, Download, Share2, Sparkles, DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ArtifactData } from './ArtifactDetector';
import InteractiveTable from './InteractiveTable';
import ScoreDashboard from './ScoreDashboard';
import InteractiveChecklist from './InteractiveChecklist';
import SimpleChart from './SimpleChart';
import CvHeatmap from './CvHeatmap';
import InterviewTimer from './InterviewTimer';
import CareerRoadmap from './CareerRoadmap';
import AtsAnalyzer from './AtsAnalyzer';
import SalaryNegotiator from './SalaryNegotiator';
import CvEvaluationWidget from './CvEvaluationWidget';

interface ArtifactSidebarProps {
    artifacts: ArtifactData[];
    isOpen: boolean;
    onClose: () => void;
    serviceId?: string;
    messageContent?: string;
}

const ARTIFACT_ICONS = {
    table: FileSpreadsheet,
    score: BarChart3,
    checklist: CheckCircle,
    chart: TrendingUp,
    roadmap: TrendingUp,
    dashboard: BarChart3,
    heatmap: Eye,
    timer: CheckCircle,
    'cv-analysis': BarChart3,
    'salary-negotiator': DollarSign,
    'cv-evaluation': FileSpreadsheet
};

export default function ArtifactSidebar({ 
    artifacts, 
    isOpen, 
    onClose, 
    serviceId,
    messageContent 
}: ArtifactSidebarProps) {
    const [selectedArtifact, setSelectedArtifact] = useState<number>(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    if (!isOpen || artifacts.length === 0) return null;

    const currentArtifact = artifacts[selectedArtifact];
    const ArtifactIcon = ARTIFACT_ICONS[currentArtifact?.type] || FileSpreadsheet;

    const sidebarWidth = isExpanded ? 'w-[600px]' : isMinimized ? 'w-16' : 'w-96';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className={cn(
                    "fixed right-0 top-0 h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-2xl z-50 flex flex-col",
                    sidebarWidth
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-950/50 dark:to-purple-950/50">
                    {!isMinimized && (
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-purple-500">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                                    Career Widgets
                                </h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {artifacts.length} élément{artifacts.length > 1 ? 's' : ''} détecté{artifacts.length > 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                        {/* Bouton expand/collapse */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="h-8 w-8 p-0"
                            title={isExpanded ? "Mode normal" : "Mode étendu"}
                        >
                            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </Button>
                        
                        {/* Bouton minimize */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="h-8 w-8 p-0"
                            title={isMinimized ? "Restaurer" : "Réduire"}
                        >
                            {isMinimized ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </Button>
                        
                        {/* Bouton fermer */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-8 w-8 p-0"
                            title="Fermer"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Navigation des artefacts */}
                {!isMinimized && artifacts.length > 1 && (
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex gap-1 overflow-x-auto">
                            {artifacts.map((artifact, index) => {
                                const Icon = ARTIFACT_ICONS[artifact.type];
                                const isActive = selectedArtifact === index;
                                
                                return (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedArtifact(index)}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                                            isActive
                                                ? "bg-gradient-to-r from-amber-500 to-purple-500 text-white"
                                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-amber-100 dark:hover:bg-amber-900/20"
                                        )}
                                    >
                                        <Icon className="w-3 h-3" />
                                        <span className="truncate max-w-24">
                                            {artifact.title}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Contenu de l'artefact */}
                {!isMinimized && currentArtifact && (
                    <div className="flex-1 overflow-hidden">
                        <ScrollArea className="h-full">
                            <div className="p-4">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={selectedArtifact}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {currentArtifact.type === 'table' && (
                                            <InteractiveTable
                                                title={currentArtifact.title}
                                                headers={currentArtifact.data.headers}
                                                rows={currentArtifact.data.rows}
                                                exportable={currentArtifact.data.exportable}
                                                sortable={currentArtifact.data.sortable}
                                                filterable={currentArtifact.data.filterable}
                                            />
                                        )}
                                        
                                        {currentArtifact.type === 'score' && (
                                            <ScoreDashboard
                                                title={currentArtifact.title}
                                                data={currentArtifact.data}
                                                serviceId={serviceId}
                                            />
                                        )}
                                        
                                        {currentArtifact.type === 'checklist' && (
                                            <InteractiveChecklist
                                                title={currentArtifact.title}
                                                items={currentArtifact.data.items}
                                                completable={currentArtifact.data.completable}
                                                editable={currentArtifact.metadata?.interactive}
                                            />
                                        )}
                                        
                                        {currentArtifact.type === 'chart' && (
                                            <SimpleChart
                                                title={currentArtifact.title}
                                                data={currentArtifact.data}
                                                interactive={currentArtifact.metadata?.interactive}
                                            />
                                        )}
                                        
                                        {currentArtifact.type === 'heatmap' && (
                                            <CvHeatmap
                                                title={currentArtifact.title}
                                                sections={currentArtifact.data.sections}
                                                globalScore={currentArtifact.data.globalScore}
                                            />
                                        )}
                                        
                                        {currentArtifact.type === 'timer' && (
                                            <InterviewTimer
                                                title={currentArtifact.title}
                                                duration={currentArtifact.data.duration}
                                                questions={currentArtifact.data.questions}
                                                currentQuestion={currentArtifact.data.currentQuestion}
                                                onQuestionChange={(index) => {
                                                    // Callback pour changer de question
                                                    console.log('Question changed to:', index);
                                                }}
                                                onTimeUp={() => {
                                                    console.log('Interview time up!');
                                                }}
                                            />
                                        )}
                                        
                                        {currentArtifact.type === 'roadmap' && (
                                            <CareerRoadmap
                                                title={currentArtifact.title}
                                                steps={currentArtifact.data.steps}
                                                currentPosition={currentArtifact.data.currentPosition}
                                                targetPosition={currentArtifact.data.targetPosition}
                                                timeframe={currentArtifact.data.timeframe}
                                                successProbability={currentArtifact.data.successProbability}
                                            />
                                        )}
                                        
                                        {currentArtifact.type === 'dashboard' && (
                                            <AtsAnalyzer
                                                title={currentArtifact.title}
                                                globalScore={currentArtifact.data.globalScore}
                                                keywords={currentArtifact.data.keywords}
                                                suggestions={currentArtifact.data.suggestions}
                                                originalText={currentArtifact.data.originalText}
                                                onTextUpdate={(newText) => {
                                                    console.log('Text updated:', newText);
                                                }}
                                            />
                                        )}
                                        
                                        {currentArtifact.type === 'salary-negotiator' && (
                                            <SalaryNegotiator
                                                title={currentArtifact.title}
                                                currentSalary={currentArtifact.data.currentSalary}
                                                targetSalary={currentArtifact.data.targetSalary}
                                                marketRange={currentArtifact.data.marketRange}
                                                negotiationStrategies={currentArtifact.data.negotiationStrategies}
                                                argumentationPoints={currentArtifact.data.argumentationPoints}
                                                alternativeOffers={currentArtifact.data.alternativeOffers}
                                                successProbability={currentArtifact.data.successProbability}
                                            />
                                        )}
                                        
                                        {currentArtifact.type === 'cv-evaluation' && (
                                            <CvEvaluationWidget
                                                title={currentArtifact.title}
                                                headers={currentArtifact.data.headers}
                                                rows={currentArtifact.data.rows}
                                                exportable={currentArtifact.data.exportable}
                                                sortable={currentArtifact.data.sortable}
                                                filterable={currentArtifact.data.filterable}
                                            />
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </ScrollArea>
                    </div>
                )}

                {/* Mode minimisé - Icônes seulement */}
                {isMinimized && (
                    <div className="flex-1 p-2">
                        <div className="space-y-2">
                            {artifacts.map((artifact, index) => {
                                const Icon = ARTIFACT_ICONS[artifact.type];
                                const isActive = selectedArtifact === index;
                                
                                return (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setSelectedArtifact(index);
                                            setIsMinimized(false);
                                        }}
                                        className={cn(
                                            "w-12 h-12 rounded-lg flex items-center justify-center transition-all",
                                            isActive
                                                ? "bg-gradient-to-r from-amber-500 to-purple-500 text-white"
                                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-amber-100"
                                        )}
                                        title={artifact.title}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Footer avec actions globales */}
                {!isMinimized && (
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                    {artifacts.length} artefact{artifacts.length > 1 ? 's' : ''}
                                </Badge>
                                {serviceId && (
                                    <Badge variant="secondary" className="text-xs">
                                        {serviceId.replace('-', ' ')}
                                    </Badge>
                                )}
                            </div>
                            
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        // Export tous les artefacts
                                        artifacts.forEach((artifact, index) => {
                                            // Logique d'export global
                                            console.log(`Exporting artifact ${index}:`, artifact);
                                        });
                                    }}
                                    className="h-7 px-2 text-xs"
                                    title="Exporter tous les artefacts"
                                >
                                    <Download className="w-3 h-3" />
                                </Button>
                                
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        // Partager les artefacts
                                        console.log('Sharing artifacts:', artifacts);
                                    }}
                                    className="h-7 px-2 text-xs"
                                    title="Partager les artefacts"
                                >
                                    <Share2 className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}