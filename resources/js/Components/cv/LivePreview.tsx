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
    Loader2, Settings, Palette, RotateCcw
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
            // Éviter les requêtes trop fréquentes
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
            }, 1000); // Délai de 1s après changement

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
                    variant="outline"
                    size="sm"
                    className="bg-white/90 backdrop-blur-sm shadow-lg border-amber-200 hover:bg-amber-50"
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
                "fixed right-0 top-0 h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-2xl z-50",
                isFullscreen ? "w-full" : "w-96 lg:w-[500px]",
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-amber-600" />
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                        Aperçu Live
                    </h3>
                    {isGenerating && (
                        <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                    )}
                </div>

                <div className="flex items-center gap-2">


                    {/* Boutons d'action */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                    >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggleVisibility}
                    >
                        <EyeOff className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Contrôles */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
                {/* Sélection de modèle */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Modèle:</span>
                    {selectedCvModel ? (
                        <div className="flex items-center gap-2 flex-1">
                            <Badge variant="outline" className="flex-1 justify-center">
                                {selectedCvModel.name}
                            </Badge>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsModelSelectorOpen(true)}
                            >
                                <Settings className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsModelSelectorOpen(true)}
                            className="flex-1"
                        >
                            <Star className="w-4 h-4 mr-2" />
                            Choisir un modèle
                        </Button>
                    )}
                </div>

                {/* Contrôles de rafraîchissement */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={autoRefresh}
                                onChange={(e) => setAutoRefresh(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            Auto-refresh
                        </label>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => generatePreview(true)}
                        disabled={isGenerating}
                    >
                        <RefreshCw className={cn("w-4 h-4", isGenerating && "animate-spin")} />
                    </Button>
                </div>
            </div>

            {/* Zone d'aperçu */}
            <div className="flex-1 overflow-hidden">
                {!selectedCvModel ? (
                    <div className="flex items-center justify-center h-full p-8">
                        <div className="text-center">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Sélectionnez un modèle pour voir l'aperçu
                            </p>
                            <Button onClick={() => setIsModelSelectorOpen(true)}>
                                Choisir un modèle
                            </Button>
                        </div>
                    </div>
                ) : previewHtml ? (
                    <div className="h-full relative">
                        <div
                            className={cn(
                                "h-full overflow-auto bg-gray-100 dark:bg-gray-800",
                                viewMode === 'mobile' ? "flex justify-center" : ""
                            )}
                        >
                            <div
                                className={cn(
                                    "bg-white shadow-lg transition-all duration-300",
                                    viewMode === 'mobile'
                                        ? "w-80 mx-auto my-4 rounded-lg overflow-hidden"
                                        : "w-full"
                                )}
                                style={{
                                    zoom: viewMode === 'mobile' ? '0.7' : '0.6',
                                    transformOrigin: 'top center'
                                }}
                                dangerouslySetInnerHTML={{ __html: previewHtml }}
                            />
                        </div>

                        {/* Overlay de chargement */}
                        <AnimatePresence>
                            {isGenerating && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center"
                                >
                                    <div className="text-center">
                                        <Loader2 className="w-8 h-8 text-amber-600 mx-auto mb-2 animate-spin" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Génération de l'aperçu...
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full p-8">
                        <div className="text-center">
                            <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Cliquez pour générer l'aperçu
                            </p>
                            <Button onClick={() => generatePreview(true)}>
                                Générer l'aperçu
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Dialog sélection de modèle */}
            <Dialog open={isModelSelectorOpen} onOpenChange={setIsModelSelectorOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-amber-600" />
                            Choisir un modèle de CV
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {availableModels.map((model) => (
                            <motion.div
                                key={model.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                    "border rounded-lg p-4 cursor-pointer transition-all",
                                    selectedCvModel?.id === model.id
                                        ? "border-amber-500 bg-amber-50 dark:bg-amber-950/50"
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                )}
                                onClick={() => {
                                    onModelSelect(model.id);
                                    setIsModelSelectorOpen(false);
                                }}
                            >
                                <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded mb-3 flex items-center justify-center overflow-hidden">
                                    {model.previewImagePath ? (
                                        <img
                                            src={model.previewImagePath}
                                            alt={model.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <FileText className="w-8 h-8 text-gray-400" />
                                    )}
                                </div>

                                <h3 className="font-medium text-sm mb-1 text-gray-800 dark:text-gray-200">
                                    {model.name}
                                </h3>

                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                    {model.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    {model.price === 0 ? (
                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400">
                                            Gratuit
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">
                                            {model.price}€
                                        </Badge>
                                    )}

                                    {selectedCvModel?.id === model.id && (
                                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400">
                                            Sélectionné
                                        </Badge>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                                    Aperçu en temps réel
                                </h4>
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                    L'aperçu se met à jour automatiquement lorsque vous modifiez vos informations.
                                    Vous pouvez désactiver cette fonction avec le bouton "Auto-refresh".
                                </p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}