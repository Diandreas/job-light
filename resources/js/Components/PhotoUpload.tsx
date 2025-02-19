import React, { useState, useCallback } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from "@/Components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/Components/ui/dialog";
import { useToast } from "@/Components/ui/use-toast";
import ReactCrop from 'react-image-crop';

const PhotoUpload = ({ currentPhoto, onPhotoChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [crop, setCrop] = useState({ unit: '%', width: 100, aspect: 1 });
    const [completedCrop, setCompletedCrop] = useState(null);
    const [imageRef, setImageRef] = useState(null);
    const { toast } = useToast();

    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast({
                    title: "Fichier trop volumineux",
                    description: "La taille maximum autorisée est de 5MB",
                    variant: "destructive"
                });
                return;
            }
            const reader = new FileReader();
            reader.addEventListener('load', () => setUploadedImage(reader.result));
            reader.readAsDataURL(file);
            setIsOpen(true);
        }
    };

    const getCroppedImg = useCallback(() => {
        if (!imageRef || !completedCrop) return;

        const canvas = document.createElement('canvas');
        const scaleX = imageRef.naturalWidth / imageRef.width;
        const scaleY = imageRef.naturalHeight / imageRef.height;
        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            imageRef,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width,
            completedCrop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 0.95);
        });
    }, [imageRef, completedCrop]);

    const handleSave = async () => {
        try {
            const croppedImage = await getCroppedImg();
            const formData = new FormData();
            // @ts-ignore
            formData.append('photo', croppedImage, 'profile.jpg');

            const response = await fetch('/update-photo', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                onPhotoChange(data.photo_url);
                setIsOpen(false);
                toast({
                    title: "Succès",
                    description: "Photo de profil mise à jour",
                });
            }
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Échec de la mise à jour de la photo",
                variant: "destructive",
            });
        }
    };

    return (
        <>
            <div className="relative h-20 w-20 rounded-full bg-gradient-to-r from-amber-500/10 to-purple-500/10">
                {currentPhoto ? (
                    <img
                        src={currentPhoto}
                        alt="Profile"
                        className="h-full w-full rounded-full object-cover"
                    />
                ) : (
                    <Camera className="h-10 w-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-500" />
                )}
                <label className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-lg cursor-pointer">
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={onSelectFile}
                    />
                    <Upload className="h-4 w-4 text-amber-500" />
                </label>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-xl">
                    <DialogTitle>Ajuster la photo</DialogTitle>
                    <div className="mt-4">
                        {uploadedImage && (
                            <ReactCrop
                                // @ts-ignore
                                crop={crop}
                                // @ts-ignore
                                onChange={c => setCrop(c)}
                                onComplete={c => setCompletedCrop(c)}
                                aspect={1}
                            >
                                <img
                                    ref={setImageRef}
                                    src={uploadedImage}
                                    alt="Upload"
                                    className="max-h-[400px] w-auto"
                                />
                            </ReactCrop>
                        )}
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleSave} disabled={!completedCrop}>
                            Enregistrer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default PhotoUpload;
