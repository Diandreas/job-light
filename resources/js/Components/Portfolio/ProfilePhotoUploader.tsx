import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, User } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfilePhotoUploaderProps {
    currentPhoto?: string;
    onPhotoChange: (file: File | null) => void;
    className?: string;
}

export const ProfilePhotoUploader: React.FC<ProfilePhotoUploaderProps> = ({
    currentPhoto,
    onPhotoChange,
    className
}) => {
    const [preview, setPreview] = useState<string | null>(currentPhoto || null);
    const [dragOver, setDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            setIsUploading(true);
            
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
                onPhotoChange(file);
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

    const removePhoto = () => {
        setPreview(null);
        onPhotoChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <Card className={cn("relative overflow-hidden", className)}>
            <CardContent className="p-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Camera className="h-5 w-5 text-amber-600" />
                        Photo de Profil
                    </h3>

                    <div
                        className={cn(
                            "relative border-2 border-dashed rounded-xl transition-all duration-300",
                            dragOver 
                                ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20" 
                                : "border-gray-300 hover:border-amber-400",
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
                        <div className="aspect-square max-w-xs mx-auto p-6">
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
                                            alt="Preview"
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
                                                        removePhoto();
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
                                        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/20 transition-colors">
                                            {isUploading ? (
                                                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <User className="w-10 h-10 text-gray-400 group-hover:text-amber-600 transition-colors" />
                                            )}
                                        </div>
                                        
                                        <p className="text-sm font-medium mb-1">
                                            {dragOver ? "Déposez votre photo ici" : "Cliquez ou glissez votre photo"}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            PNG, JPG jusqu'à 5MB
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
                        <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                            <Check className="h-4 w-4" />
                            Photo sélectionnée avec succès
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};