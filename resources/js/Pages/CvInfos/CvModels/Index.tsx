import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { useToast } from '@/Components/ui/use-toast';
import {
    Search, CheckCircle, ArrowLeft, FileText,
    Plus, X, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Skeleton } from '@/Components/ui/skeleton';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/Components/ui/sheet";
import axios from "axios";

const ModelCard = ({ model, isActive, onSelect, onPreview, loading }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`group relative p-6 rounded-lg border transition-all ${
            isActive ? 'border-primary bg-primary/5' : 'border-gray-200'
        } hover:shadow-lg hover:border-primary/30`}
    >
        <div className="relative aspect-[4/3] mb-4 overflow-hidden rounded-md bg-gray-100">
            <img
                src={`/storage/${model.previewImagePath}`}
                alt={model.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onClick={() => onPreview(model)}
            />
            <motion.div
                initial={false}
                animate={{ opacity: isActive ? 1 : 0 }}
                className="absolute top-2 right-2"
            >
                <div className="bg-primary text-white px-3 py-1 rounded-full text-sm">
                    Actif
                </div>
            </motion.div>
        </div>

        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-lg leading-tight">{model.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{model.category}</p>
                {model.price > 0 && (
                    <p className="text-sm font-medium text-primary mt-2">
                        {model.price.toLocaleString()} FCFA
                    </p>
                )}
            </div>

            <Button
                variant={isActive ? "secondary" : "default"}
                className="w-full"
                disabled={isActive || loading}
                onClick={() => onSelect(model.id)}
            >
                {isActive ? 'Modèle actif' : 'Utiliser ce modèle'}
            </Button>
        </div>
    </motion.div>
);

const ModelPreview = ({ model, onClose }) => (
    <Sheet open={Boolean(model)} onOpenChange={() => onClose(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl">
            <SheetHeader>
                <SheetTitle>{model?.name}</SheetTitle>
                <SheetDescription>{model?.category}</SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-10rem)] mt-6 rounded-md">
                <img
                    src={`/storage/${model?.previewImagePath}`}
                    alt={model?.name}
                    className="w-full h-auto rounded-lg shadow-lg"
                />
            </ScrollArea>
        </SheetContent>
    </Sheet>
);

export default function CvModelsIndex({ auth, userCvModels, availableCvModels, maxAllowedModels }) {
    const { toast } = useToast();
    const [selectedModelId, setSelectedModelId] = useState(auth.user.selected_cv_model_id);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [previewModel, setPreviewModel] = useState(null);

    const handleSelectModel = useCallback(async (modelId) => {
        setLoading(true);
        try {
            await axios.post('/user-cv-models/select-active', {
                user_id: auth.user.id,
                cv_model_id: modelId,
            });
            setSelectedModelId(modelId);
            toast({
                title: 'Modèle sélectionné',
                description: 'Votre modèle de CV a été mis à jour avec succès.'
            });
        } catch (error) {
            toast({
                title: 'Erreur',
                description: error.response?.data?.message || 'Une erreur est survenue.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    }, [auth.user.id, toast]);

    const filteredModels = useCallback((models) => {
        return models.filter(model =>
            model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            model.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Mes modèles de CV" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <nav className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href={route('cv-infos.index')}>
                            <Button variant="ghost" className="flex items-center gap-2">
                                <ChevronLeft className="w-4 h-4" />
                                Retour
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold">Mes modèles de CV</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Rechercher un modèle..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-64"
                            />
                        </div>
                        <Link href="/cv-infos/show">
                            <Button className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Exporter CV
                            </Button>
                        </Link>
                    </div>
                </nav>

                {/* Active Models Section */}
                <section className="space-y-6 mb-12">
                    <header className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="text-primary w-5 h-5" />
                            <h2 className="text-xl font-semibold">Modèles actifs</h2>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {userCvModels.length}/{maxAllowedModels} modèles
                        </div>
                    </header>

                    {userCvModels.length === 0 ? (
                        <Alert>
                            <AlertCircle className="w-4 h-4" />
                            <AlertDescription>
                                Vous n'avez pas encore de modèles actifs.
                                Sélectionnez-en un parmi les modèles disponibles ci-dessous.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {filteredModels(userCvModels).map((model) => (
                                    <ModelCard
                                        key={model.id}
                                        model={model}
                                        isActive={selectedModelId === model.id}
                                        onSelect={handleSelectModel}
                                        onPreview={setPreviewModel}
                                        loading={loading}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </section>

                {/* Available Models Section */}
                {availableCvModels.length > 0 && (
                    <section className="space-y-6">
                        <h2 className="text-xl font-semibold">Modèles disponibles</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {filteredModels(availableCvModels).map((model) => (
                                    <ModelCard
                                        key={model.id}
                                        model={model}
                                        isActive={false}
                                        onSelect={handleSelectModel}
                                        onPreview={setPreviewModel}
                                        loading={loading}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    </section>
                )}

                {/* Preview Sheet */}
                <ModelPreview model={previewModel} onClose={setPreviewModel} />
            </div>
        </AuthenticatedLayout>
    );
}
