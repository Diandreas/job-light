import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { useToast } from '@/Components/ui/use-toast';
import {
    Eye, EyeOff, RefreshCw, Monitor, Smartphone,
    Maximize2, Minimize2, Star, FileText, AlertCircle,
    Loader2, Settings, Palette, RotateCcw, X
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { cn } from '@/lib/utils';

interface CvModel {
    id: number;
    name: string;
    description: string;
    price: number;
    previewImagePath: string;
}

interface LivePreviewProps {
    cvInformation: any;
    selectedCvModel: CvModel | null;
    availableModels: CvModel[];
    onModelSelect: (modelId: number) => void;
    isVisible: boolean;
    onToggleVisibility: () => void;
    className?: string;
}

export default function LivePreview({
    cvInformation,
    selectedCvModel,
    availableModels,
    onModelSelect,
    isVisible,
    onToggleVisibility,
    className
}: LivePreviewProps) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewHtml, setPreviewHtml] = useState<string>('');
    const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Debounced preview generation
    const generatePreview = useCallback(async (force = false) => {
        if (!selectedCvModel) {
            setIsModelSelectorOpen(true);
            return;
        }

        const now = Date.now();
        if (!force && now - lastUpdateTime < 2000) {
            return;
        }

        setIsGenerating(true);
        setLastUpdateTime(now);

        try {
            const response = await fetch(route('cv.preview.live'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    modelId: selectedCvModel.id,
                    cvData: cvInformation
                })
            });

            const result = await response.json();

            if (result.success) {
                setPreviewHtml(result.html);
            } else {
                throw new Error(result.message || 'Erreur lors de la génération');
            }

        } catch (error) {
            console.error('Preview generation error:', error);
            toast({
                title: "Erreur d'aperçu",
                description: "Impossible de générer l'aperçu en temps réel",
                variant: "destructive"
            });
        } finally {
            setIsGenerating(false);
        }
    }, [selectedCvModel, cvInformation, lastUpdateTime, toast]);

    // Auto-refresh when CV data changes
    useEffect(() => {
        if (autoRefresh && isVisible && selectedCvModel) {
            const timer = setTimeout(() => {
                generatePreview();
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [cvInformation, autoRefresh, isVisible, selectedCvModel, generatePreview]);

    // Force refresh on model change
    useEffect(() => {
        if (selectedCvModel && isVisible) {
            generatePreview(true);
        }
    }, [selectedCvModel, isVisible]);

    if (!isVisible) {
        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn("fixed right-4 top-1/2 transform -translate-y-1/2 z-40", className)}
            >
                <Button
                    onClick={onToggleVisibility}
                    variant="ghost"
                    size="sm"
                    className="bg-white/90 backdrop-blur-sm shadow-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20 border-0 rounded-xl"
                >
                    <Eye className="w-4 h-4 mr-2" />
                    Aperçu Live
                </Button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
                "fixed right-0 top-0 h-full bg-white dark:bg-gray-900 z-50 flex flex-col",
                isFullscreen ? "w-full" : "w-96 lg:w-[500px]",
                className
            )}
            style={{
                boxShadow: '-8px 0 25px rgba(0, 0, 0, 0.1)',
                borderRadius: '0'
            }}
        >
            {/* Header épuré */}
            <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Eye className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                            Aperçu Live
                        </h3>
                        {selectedCvModel && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {selectedCvModel.name}
                            </p>
                        )}
                    </div>
                    {isGenerating && (
                        <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                    )}
                </div>

                <div className="flex items-center gap-1">
                    {/* Toggle view mode */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode(viewMode === 'desktop' ? 'mobile' : 'desktop')}
                        className={cn(
                            "h-8 px-2 text-xs border-0",
                            "text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                        )}
                    >
                        {viewMode === 'desktop' ? <Monitor className="w-3.5 h-3.5 mr-1" /> : <Smartphone className="w-3.5 h-3.5 mr-1" />}
                        <span className="hidden lg:inline">
                            {viewMode === 'desktop' ? 'Desktop' : 'Mobile'}
                        </span>
                    </Button>

                    {/* Auto-refresh toggle */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={cn(
                            "h-8 w-8 p-0 border-0",
                            autoRefresh
                                ? "text-amber-600 bg-amber-50 dark:bg-amber-900/20"
                                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                        )}
                        title={autoRefresh ? "Auto-refresh activé" : "Auto-refresh désactivé"}
                    >
                        <RefreshCw className={cn("w-4 h-4", autoRefresh && isGenerating && "animate-spin")} />
                    </Button>

                    {/* Manual refresh */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => generatePreview(true)}
                        disabled={isGenerating}
                        className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 border-0"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>

                    {/* Settings */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsModelSelectorOpen(true)}
                        className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 border-0"
                    >
                        <Settings className="w-4 h-4" />
                    </Button>

                    {/* Fullscreen */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 border-0"
                    >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>

                    {/* Close */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggleVisibility}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 border-0"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Zone d'aperçu principale */}
            <div className="flex-1 bg-gray-50/30 dark:bg-gray-800/30 relative overflow-hidden">
                {!selectedCvModel ? (
                    <div className="flex items-center justify-center h-full p-8">
                        <div className="text-center max-w-sm">
                            <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-purple-100 dark:from-amber-900/20 dark:to-purple-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <FileText className="w-10 h-10 text-amber-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                Aucun modèle sélectionné
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                                Choisissez un modèle de CV pour voir l'aperçu en temps réel de vos modifications
                            </p>
                            <Button
                                onClick={() => setIsModelSelectorOpen(true)}
                                className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white border-0 rounded-xl"
                            >
                                <Star className="w-4 h-4 mr-2" />
                                Choisir un modèle
                            </Button>
                        </div>
                    </div>
                ) : previewHtml ? (
                    <div className="h-full relative">
                        <div
                            className={cn(
                                "h-full overflow-auto p-4",
                                viewMode === 'mobile' ? "flex justify-center bg-gray-100 dark:bg-gray-800" : ""
                            )}
                        >
                            <div
                                className={cn(
                                    "bg-white shadow-lg transition-all duration-300 rounded-xl overflow-hidden",
                                    viewMode === 'mobile'
                                        ? "w-80 my-4"
                                        : "w-full"
                                )}
                                style={{
                                    zoom: viewMode === 'mobile' ? '0.8' : isFullscreen ? '0.9' : '0.75',
                                    transformOrigin: 'top center'
                                }}
                                dangerouslySetInnerHTML={{ __html: previewHtml }}
                            />
                        </div>

                        {/* Overlay de chargement élégant */}
                        <AnimatePresence>
                            {isGenerating && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center"
                                >
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border-0 text-center">
                                        <Loader2 className="w-8 h-8 text-amber-500 mx-auto mb-3 animate-spin" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                            Génération de l'aperçu en cours...
                                        </p>
                                        <div className="mt-3 flex justify-center">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full p-8">
                        <div className="text-center max-w-sm">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <RefreshCw className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                Prêt à générer
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                                Cliquez sur le bouton pour générer l'aperçu de votre CV avec le modèle {selectedCvModel.name}
                            </p>
                            <Button
                                onClick={() => generatePreview(true)}
                                variant="outline"
                                className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 border-2 rounded-xl"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Générer l'aperçu
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Status bar épuré */}
            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "w-2 h-2 rounded-full transition-colors",
                                autoRefresh ? "bg-green-400" : "bg-gray-300"
                            )} />
                            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                {autoRefresh ? "Auto-refresh" : "Manuel"}
                            </span>
                        </div>

                        {selectedCvModel && (
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-4 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-32">
                                    {selectedCvModel.name}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {viewMode === 'desktop' ? '🖥️' : '📱'} {viewMode}
                    </div>
                </div>
            </div>

            {/* Dialog de sélection de modèle - Design pur */}
            <Dialog open={isModelSelectorOpen} onOpenChange={setIsModelSelectorOpen}>
                <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto border-0 rounded-3xl p-0">
                    <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 p-6 border-b border-gray-100 dark:border-gray-800">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3 text-xl">
                                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-purple-500 rounded-2xl flex items-center justify-center">
                                    <Star className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <span>Choisir un modèle de CV</span>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-normal mt-1">
                                        Sélectionnez un design pour votre aperçu en temps réel
                                    </p>
                                </div>
                            </DialogTitle>
                        </DialogHeader>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {availableModels.map((model) => (
                                <motion.div
                                    key={model.id}
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={cn(
                                        "rounded-2xl p-5 cursor-pointer transition-all duration-200 border-0",
                                        selectedCvModel?.id === model.id
                                            ? "bg-gradient-to-br from-amber-50 to-purple-50 dark:from-amber-900/20 dark:to-purple-900/20 shadow-lg ring-2 ring-amber-200 dark:ring-amber-700"
                                            : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm hover:shadow-md"
                                    )}
                                    onClick={() => {
                                        onModelSelect(model.id);
                                        setIsModelSelectorOpen(false);
                                    }}
                                >
                                    <div className="aspect-[3/4] bg-white dark:bg-gray-700 rounded-xl mb-4 flex items-center justify-center overflow-hidden shadow-sm">
                                        {model.previewImagePath ? (
                                            <img
                                                src={model.previewImagePath}
                                                alt={model.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <FileText className="w-12 h-12 text-gray-400" />
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <h3 className="font-semibold text-base text-gray-800 dark:text-gray-200">
                                                {model.name}
                                            </h3>
                                            {selectedCvModel?.id === model.id && (
                                                <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-purple-500 rounded-full flex items-center justify-center">
                                                    <Star className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                            {model.description}
                                        </p>

                                        <div className="flex items-center justify-between pt-2">
                                            {model.price === 0 || !model.price ? (
                                                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full text-sm font-medium">
                                                    Gratuit
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 rounded-full text-sm font-medium">
                                                    {new Intl.NumberFormat('fr-FR').format(model.price)} FCFA
                                                </span>
                                            )}

                                            {selectedCvModel?.id === model.id && (
                                                <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-amber-500 to-purple-500 text-white rounded-full text-sm font-medium">
                                                    Sélectionné
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border-0">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                                        Aperçu en temps réel
                                    </h4>
                                    <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
                                        L'aperçu se met à jour automatiquement lorsque vous modifiez vos informations.
                                        Vous pouvez basculer entre les vues desktop et mobile, et contrôler l'actualisation
                                        automatique via les boutons dans l'en-tête.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}