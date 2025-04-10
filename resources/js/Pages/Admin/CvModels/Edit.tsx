
import React, { useState, useCallback } from 'react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { router } from '@inertiajs/react';

interface CvModel {
    id: number;
    name: string;
    description: string;
    price: number | string;
    previewImagePath: string | null;
}

interface Props {
    cvModel: CvModel;
}

const CvModelEdit = ({ cvModel }: Props) => {
    const [processing, setProcessing] = useState(false);
    const [preview, setPreview] = useState<string | null>(
        cvModel.previewImagePath
            ? `/storage/${cvModel.previewImagePath}`
            : null
    );

    const { data, setData, errors, reset } = useForm({
        name: cvModel.name,
        description: cvModel.description,
        price: cvModel.price.toString(),
        previewImage: null as File | null,
    });

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        // Créer un FormData
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('price', data.price);

        if (data.previewImage) {
            formData.append('previewImage', data.previewImage);
        }

        try {
            router.post(route('cv-models.update', cvModel.id), formData, {
                onSuccess: () => {
                    setProcessing(false);
                    // Redirection gérée par le contrôleur
                },
                onError: () => {
                    setProcessing(false);
                }
            });
        } catch (error) {
            setProcessing(false);
            console.error('Error updating CV model:', error);
        }
    }, [data, cvModel.id]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('previewImage', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const formatPrice = (value: string | number): string => {
        if (!value) return '';
        const stringValue = value.toString().replace(/\D/g, '');
        return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };

    const handleCancel = () => {
        reset();
        window.history.back();
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Modifier le modèle de CV</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nom du modèle</Label>
                        <Input
                            type="text"
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={errors.name ? 'border-red-500' : ''}
                            disabled={processing}
                            required
                        />
                        {errors.name && (
                            <Alert variant="destructive">
                                <AlertDescription>{errors.name}</AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className={`min-h-[100px] ${errors.description ? 'border-red-500' : ''}`}
                            disabled={processing}
                            required
                        />
                        {errors.description && (
                            <Alert variant="destructive">
                                <AlertDescription>{errors.description}</AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price">Prix (FCFA)</Label>
                        <div className="relative">
                            <Input
                                type="text"
                                id="price"
                                value={formatPrice(data.price)}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\s/g, '').replace(/[^\d]/g, '');
                                    setData('price', value);
                                }}
                                className={errors.price ? 'border-red-500' : ''}
                                disabled={processing}
                                required
                            />
                            <div className="absolute right-3 top-2.5 text-gray-400 text-sm font-medium">
                                FCFA
                            </div>
                        </div>
                        {errors.price && (
                            <Alert variant="destructive">
                                <AlertDescription>{errors.price}</AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="previewImage">Image de preview</Label>
                        <Input
                            type="file"
                            id="previewImage"
                            onChange={handleFileChange}
                            className={errors.previewImage ? 'border-red-500' : ''}
                            accept="image/*"
                            disabled={processing}
                        />
                        {errors.previewImage && (
                            <Alert variant="destructive">
                                <AlertDescription>{errors.previewImage}</AlertDescription>
                            </Alert>
                        )}
                        {preview && (
                            <div className="mt-4 rounded-lg overflow-hidden border">
                                <img
                                    src={preview}
                                    alt="Aperçu"
                                    className="max-w-full h-auto object-cover"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={processing}
                        >
                            {processing ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={handleCancel}
                            disabled={processing}
                        >
                            Annuler
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default CvModelEdit;
