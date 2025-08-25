import React, { useState, useRef } from 'react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Card, CardContent } from "@/Components/ui/card";
import { 
    Upload, 
    Camera, 
    Trash2, 
    Edit, 
    User,
    ImageIcon,
    Crop,
    RotateCw,
    Loader2
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useToast } from "@/Components/ui/use-toast";

interface ProfilePhotoManagerProps {
    currentPhoto?: string;
    onPhotoChange: (file: File | null) => void;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    shape?: 'circle' | 'square' | 'rounded';
    allowEdit?: boolean;
}

const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
};

const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-lg'
};

export default function ProfilePhotoManager({
    currentPhoto,
    onPhotoChange,
    className,
    size = 'lg',
    shape = 'circle',
    allowEdit = true
}: ProfilePhotoManagerProps) {
    const [preview, setPreview] = useState<string | null>(currentPhoto || null);
    const [isLoading, setIsLoading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (file: File | null) => {
        if (!file) {
            setPreview(null);
            onPhotoChange(null);
            return;
        }

        // Validation du fichier
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            toast({
                title: "Format non supporté",
                description: "Veuillez choisir une image au format JPEG, PNG, GIF ou WebP.",
                variant: "destructive"
            });
            return;
        }

        if (file.size > maxSize) {
            toast({
                title: "Fichier trop volumineux",
                description: "L'image ne doit pas dépasser 5MB.",
                variant: "destructive"
            });
            return;
        }

        // Créer preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        onPhotoChange(file);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemovePhoto = () => {
        setPreview(null);
        onPhotoChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileChange(files[0]);
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            {/* Photo actuelle ou placeholder */}
            <div className="flex items-center space-x-4">
                <div className={cn(
                    sizeClasses[size],
                    shapeClasses[shape],
                    "relative overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600"
                )}>
                    {preview ? (
                        <img
                            src={preview}
                            alt="Photo de profil"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <User className={cn(
                            "text-gray-400 dark:text-gray-500",
                            size === 'sm' && "h-6 w-6",
                            size === 'md' && "h-8 w-8",
                            size === 'lg' && "h-12 w-12",
                            size === 'xl' && "h-16 w-16"
                        )} />
                    )}
                </div>

                {allowEdit && (
                    <div className="flex-1 space-y-2">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Photo de profil
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleUploadClick}
                                className="flex items-center space-x-1"
                            >
                                <Upload className="h-4 w-4" />
                                <span>Choisir</span>
                            </Button>
                            
                            {preview && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRemovePhoto}
                                    className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Supprimer</span>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Zone de glisser-déposer avancée */}
            {allowEdit && (
                <Card 
                    className={cn(
                        "border-2 border-dashed transition-colors cursor-pointer hover:border-primary/50",
                        dragOver && "border-primary bg-primary/5",
                        "relative"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleUploadClick}
                >
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                        <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Glissez votre photo ici ou cliquez pour parcourir
                        </p>
                        <p className="text-xs text-gray-500">
                            JPEG, PNG, GIF, WebP jusqu'à 5MB
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Input file caché */}
            <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleFileChange(file);
                }}
                className="hidden"
            />

            {/* Recommandations */}
            {allowEdit && (
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <p>• Utilisez une photo claire et professionnelle</p>
                    <p>• Format carré recommandé pour un meilleur rendu</p>
                    <p>• Résolution minimale : 200x200 pixels</p>
                </div>
            )}
        </div>
    );
}