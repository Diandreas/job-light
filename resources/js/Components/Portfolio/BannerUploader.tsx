import React, { useState, useRef } from 'react';
import { Image, Upload, X, Check, Mountain } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Label } from '@/Components/ui/label';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface BannerUploaderProps {
    currentBanner?: string;
    bannerPosition?: 'top' | 'behind_text' | 'overlay';
    onBannerChange: (file: File | null) => void;
    onPositionChange: (position: 'top' | 'behind_text' | 'overlay') => void;
    className?: string;
}

export const BannerUploader: React.FC<BannerUploaderProps> = ({
    currentBanner,
    bannerPosition = 'top',
    onBannerChange,
    onPositionChange,
    className
}) => {
    const [preview, setPreview] = useState<string | null>(currentBanner || null);
    const [dragOver, setDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            setIsUploading(true);
            
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
                onBannerChange(file);
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const removeBanner = () => {
        setPreview(null);
        onBannerChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const positionOptions = [
        { value: 'top', label: 'En haut de page', description: 'Bannière classique au-dessus du contenu' },
        { value: 'behind_text', label: 'Arrière-plan', description: 'Image en arrière-plan du texte' },
        { value: 'overlay', label: 'Superposition', description: 'Texte par-dessus l\'image avec overlay' }
    ];

    return (
        <Card className={cn("relative overflow-hidden", className)}>
            <CardContent className="p-6">
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Mountain className="h-5 w-5 text-purple-600" />
                        Bannière Portfolio
                    </h3>

                    <div
                        className={cn(
                            "relative border-2 border-dashed rounded-xl transition-all duration-300",
                            dragOver 
                                ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20" 
                                : "border-gray-300 hover:border-purple-400",
                            "group cursor-pointer"
                        )}
                        onDrop={handleDrop}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onClick={triggerFileSelect}
                    >
                        <div className="aspect-[3/1] w-full p-6">
                            <AnimatePresence mode="wait">
                                {preview ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="relative w-full h-full"
                                    >
                                        <img
                                            src={preview}
                                            alt="Banner Preview"
                                            className="w-full h-full object-cover rounded-lg shadow-lg"
                                        />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        triggerFileSelect();
                                                    }}
                                                    className="bg-white/90 hover:bg-white"
                                                >
                                                    <Upload className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeBanner();
                                                    }}
                                                    className="bg-red-500/90 hover:bg-red-600/90"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex flex-col items-center justify-center h-full text-gray-500"
                                    >
                                        <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/20 transition-colors">
                                            {isUploading ? (
                                                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Image className="w-8 h-8 text-gray-400 group-hover:text-purple-600 transition-colors" />
                                            )}
                                        </div>
                                        
                                        <p className="text-sm font-medium mb-1">
                                            {dragOver ? "Déposez votre bannière ici" : "Cliquez ou glissez votre bannière"}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            PNG, JPG jusqu'à 10MB • Format recommandé: 1920x640px
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>

                    {preview && (
                        <div className="flex items-center justify-center gap-2 text-sm text-green-600 mb-4">
                            <Check className="h-4 w-4" />
                            Bannière sélectionnée avec succès
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Position de la bannière</Label>
                        <Select value={bannerPosition} onValueChange={(value) => onPositionChange(value as any)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {positionOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        <div className="space-y-1">
                                            <div className="font-medium">{option.label}</div>
                                            <div className="text-xs text-gray-500">{option.description}</div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};