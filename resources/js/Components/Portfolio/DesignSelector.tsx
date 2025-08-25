import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { DESIGN_METADATA, DesignType } from './Designs';
import { Eye, Check, Palette, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DesignSelectorProps {
    currentDesign: string;
    onDesignChange: (design: DesignType) => void;
    previewData?: {
        user: any;
        cvData: any;
        settings: any;
    };
    className?: string;
}

export default function DesignSelector({ 
    currentDesign, 
    onDesignChange, 
    previewData,
    className 
}: DesignSelectorProps) {
    const [previewDesign, setPreviewDesign] = useState<DesignType | null>(null);
    
    const designs = Object.entries(DESIGN_METADATA) as [DesignType, typeof DESIGN_METADATA[DesignType]][];

    const handleDesignSelect = (designType: DesignType) => {
        onDesignChange(designType);
        setPreviewDesign(null);
    };

    const handlePreview = (designType: DesignType) => {
        setPreviewDesign(designType);
    };

    return (
        <div className={cn("space-y-6", className)}>
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                    <Palette className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Choisir un Design</h3>
                    <p className="text-sm text-gray-600">Sélectionnez le style qui vous correspond</p>
                </div>
            </div>

            {/* Design Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {designs.map(([designType, metadata]) => {
                    const isSelected = currentDesign === designType;
                    const isPreview = previewDesign === designType;

                    return (
                        <motion.div
                            key={designType}
                            layout
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Card 
                                className={cn(
                                    "cursor-pointer transition-all duration-300 overflow-hidden group",
                                    isSelected 
                                        ? "ring-2 ring-blue-500 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50" 
                                        : "hover:shadow-md border-gray-200 hover:border-gray-300"
                                )}
                                onClick={() => handleDesignSelect(designType)}
                            >
                                {/* Preview Image Placeholder */}
                                <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                                    {/* Design Preview Background */}
                                    <div 
                                        className="absolute inset-0 opacity-20"
                                        style={{
                                            background: `linear-gradient(135deg, ${metadata.colors[0]}, ${metadata.colors[1]})`
                                        }}
                                    />
                                    
                                    {/* Preview Pattern */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-6xl opacity-30">
                                            {metadata.icon}
                                        </div>
                                    </div>
                                    
                                    {/* Selected Indicator */}
                                    {isSelected && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute top-3 right-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
                                        >
                                            <Check className="w-4 h-4 text-white" />
                                        </motion.div>
                                    )}

                                    {/* Preview Button */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        whileHover={{ opacity: 1 }}
                                        className="absolute inset-0 bg-black/20 flex items-center justify-center"
                                    >
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="bg-white/90 hover:bg-white shadow-lg"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePreview(designType);
                                            }}
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            Aperçu
                                        </Button>
                                    </motion.div>
                                </div>

                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                                <span>{metadata.icon}</span>
                                                {metadata.name}
                                            </h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {metadata.description}
                                            </p>
                                        </div>
                                        
                                        {isSelected && (
                                            <Badge 
                                                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                            >
                                                <Zap className="w-3 h-3 mr-1" />
                                                Actif
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Features */}
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                                            Fonctionnalités
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                            {metadata.features.slice(0, 3).map((feature, index) => (
                                                <Badge 
                                                    key={index}
                                                    variant="outline" 
                                                    className="text-xs px-2 py-1"
                                                >
                                                    {feature}
                                                </Badge>
                                            ))}
                                            {metadata.features.length > 3 && (
                                                <Badge variant="outline" className="text-xs px-2 py-1">
                                                    +{metadata.features.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Color Palette */}
                                    <div className="flex items-center gap-2 mt-3">
                                        <p className="text-xs font-medium text-gray-600">Couleurs:</p>
                                        <div className="flex gap-1">
                                            {metadata.colors.slice(0, 3).map((color, index) => (
                                                <div
                                                    key={index}
                                                    className="w-4 h-4 rounded-full border border-gray-200 shadow-sm"
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Preview Modal */}
            <AnimatePresence>
                {previewDesign && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setPreviewDesign(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{DESIGN_METADATA[previewDesign].icon}</span>
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            Aperçu - {DESIGN_METADATA[previewDesign].name}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {DESIGN_METADATA[previewDesign].description}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => {
                                            handleDesignSelect(previewDesign);
                                        }}
                                        className="bg-gradient-to-r from-blue-500 to-purple-500"
                                    >
                                        <Check className="w-4 h-4 mr-2" />
                                        Choisir ce design
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setPreviewDesign(null)}
                                    >
                                        Fermer
                                    </Button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 overflow-y-auto max-h-96">
                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900">Fonctionnalités complètes:</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {DESIGN_METADATA[previewDesign].features.map((feature, index) => (
                                            <div key={index} className="flex items-center gap-2 text-sm">
                                                <Check className="w-4 h-4 text-green-500" />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">
                                            💡 <strong>Aperçu complet disponible :</strong> Utilisez le bouton "Aperçu" 
                                            dans l'interface principale pour voir votre portfolio avec ce design en temps réel.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}