import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Alert, AlertDescription } from "@/Components/ui/alert";

const CvModelCreate = () => {
    const { data, setData, post, errors } = useForm({
        name: '',
        description: '',
        price: '',
        previewImage: null,
    });

    const [preview, setPreview] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('price', data.price);
        formData.append('previewImage', data.previewImage);
        // @ts-ignore
        post(route('cv-models.store'), formData);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('previewImage', file);
            // @ts-ignore
            setPreview(URL.createObjectURL(file));
        }
    };

    // @ts-ignore
    const formatPrice = (value) => {
        if (!value) return '';
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Créer un nouveau modèle de CV</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nom du modèle</Label>
                        <Input
                            type="text"
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={errors.name ? 'border-red-500' : ''}
                            required
                        />
                        {errors.name && (
                            <Alert variant="destructive" className="mt-1">
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
                            required
                        />
                        {errors.description && (
                            <Alert variant="destructive" className="mt-1">
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
                                className={`${errors.price ? 'border-red-500' : ''}`}
                                required
                            />
                            <div className="absolute right-3 top-2.5 text-gray-400 text-sm font-medium">
                                FCFA
                            </div>
                        </div>
                        {errors.price && (
                            <Alert variant="destructive" className="mt-1">
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
                            required
                        />
                        {errors.previewImage && (
                            <Alert variant="destructive" className="mt-1">
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

                    <Button type="submit" className="w-full">
                        Créer le modèle
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default CvModelCreate;
