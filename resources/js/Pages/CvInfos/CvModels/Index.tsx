import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { useToast } from '@/Components/ui/use-toast';
import {
    Search, CheckCircle, FileText, Star,
    ArrowUpRight, AlertCircle, ChevronLeft, Sparkles
} from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/Components/ui/sheet";
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Alert, AlertDescription } from "@/Components/ui/alert";
import axios from "axios";

const ModelCard = ({ model, isActive, onSelect, onAdd, onPreview, loading, inCatalog }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`group relative p-6 rounded-xl border transition-all ${
            isActive
                ? 'border-amber-500 bg-gradient-to-r from-amber-500/10 to-purple-500/10'
                : 'border-gray-200'
        } hover:shadow-lg hover:border-amber-300`}
    >
        <div className="relative aspect-[4/3] mb-4 overflow-hidden rounded-lg bg-gray-100">
            <img
                src={`/storage/${model.previewImagePath}`}
                alt={model.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onClick={() => onPreview(model)}
            />
            {isActive && (
                <motion.div
                    initial={false}
                    animate={{ opacity: 1 }}
                    className="absolute top-2 right-2"
                >
                    <div className="bg-gradient-to-r from-amber-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm shadow-md">
                        Actif
                    </div>
                </motion.div>
            )}
        </div>

        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-lg leading-tight">{model.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{model.category}</p>
                {model.price > 0 && (
                    <p className="text-sm font-medium bg-gradient-to-r from-amber-500 to-purple-500 text-transparent bg-clip-text mt-2">
                        {model.price.toLocaleString()} FCFA
                    </p>
                )}
            </div>

            <div className="flex gap-2">
                {inCatalog ? (
                    <Button
                        variant={isActive ? "outline" : "default"}
                        className={`w-full ${
                            isActive
                                ? 'border-amber-200 text-amber-700'
                                : 'bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white'
                        }`}
                        disabled={isActive || loading}
                        onClick={() => onSelect(model.id)}
                    >
                        <div className="flex items-center gap-2">
                            {isActive ? <CheckCircle className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                            {isActive ? 'Modèle actif' : 'Utiliser ce modèle'}
                        </div>
                    </Button>
                ) : (
                    <Button
                        className="w-full bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white"
                        disabled={loading}
                        onClick={() => onAdd(model)}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Ajouter au catalogue
                    </Button>
                )}
            </div>
        </div>
    </motion.div>
);

const ModelPreview = ({ model, onClose }) => (
    <Sheet open={Boolean(model)} onOpenChange={() => onClose(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl bg-white">
            <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    <span className="bg-gradient-to-r from-amber-500 to-purple-500 text-transparent bg-clip-text">
                        {model?.name}
                    </span>
                </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-10rem)] mt-6">
                <img
                    src={`/storage/${model?.previewImagePath}`}
                    alt={model?.name}
                    className="w-full h-auto rounded-xl shadow-lg"
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
    const [activeModels, setActiveModels] = useState(userCvModels);
    const [availableModels, setAvailableModels] = useState(availableCvModels);

    const handleAddModel = async (model) => {
        if (activeModels.length >= maxAllowedModels) {
            toast({
                title: 'Limite atteinte',
                description: `Vous ne pouvez pas ajouter plus de ${maxAllowedModels} modèles.`,
                variant: 'destructive'
            });
            return;
        }

        try {
            setLoading(true);
            await axios.post('/user-cv-models', {
                user_id: auth.user.id,
                cv_model_id: model.id,
            });

            setActiveModels(prev => [...prev, model]);
            setAvailableModels(prev => prev.filter(m => m.id !== model.id));

            toast({
                title: 'Succès',
                description: 'Modèle ajouté à votre collection'
            });
        } catch (error) {
            toast({
                title: 'Erreur',
                description: error.response?.data?.message || 'Une erreur est survenue',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSelectModel = useCallback(async (modelId) => {
        setLoading(true);
        try {
            await axios.post('/user-cv-models/select-active', {
                user_id: auth.user.id,
                cv_model_id: modelId,
            });
            setSelectedModelId(modelId);
            toast({
                title: 'Succès',
                description: 'Votre modèle a été activé avec succès.'
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

    // @ts-ignore
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Modèles de CV" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <nav className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link href={route('cv-infos.index')}>
                            <Button variant="ghost" className="flex items-center gap-2 hover:bg-amber-50">
                                <ChevronLeft className="w-4 h-4" />
                                Retour
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-purple-500 text-transparent bg-clip-text">
                            Collection de CV
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full sm:w-64 border-amber-200 focus:border-amber-500"
                            />
                        </div>
                        <Link href="/cv-infos/show">
                            <Button className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white">
                                <FileText className="w-4 h-4 mr-2" />
                                Exporter CV
                            </Button>
                        </Link>
                    </div>
                </nav>

                <section className="space-y-6 mb-12">
                    <header className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="text-amber-500 w-5 h-5" />
                            <h2 className="text-xl font-semibold bg-gradient-to-r from-amber-500 to-purple-500 text-transparent bg-clip-text">
                                Mes modèles actifs
                            </h2>
                        </div>
                        <div className="text-sm px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                            {activeModels.length}/{maxAllowedModels} modèles
                        </div>
                    </header>

                    {activeModels.length === 0 ? (
                        <Alert className="bg-amber-50 border-amber-200">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            <AlertDescription className="text-amber-700">
                                Vous n'avez pas encore de modèles actifs.
                                Sélectionnez-en un parmi les modèles disponibles ci-dessous.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {filteredModels(activeModels).map((model) => (
                                    <ModelCard
                                        key={model.id}
                                        model={model}
                                        isActive={selectedModelId === model.id}
                                        onSelect={handleSelectModel}
                                        onAdd={handleAddModel}
                                        onPreview={setPreviewModel}
                                        loading={loading}
                                        inCatalog={true}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </section>

                {availableModels.length > 0 && (
                    <section className="space-y-6">
                        <h2 className="text-xl font-semibold bg-gradient-to-r from-amber-500 to-purple-500 text-transparent bg-clip-text flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            Découvrez nos modèles
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {filteredModels(availableModels).map((model) => (
                                    //@ts-ignore
                                    <ModelCard
                                        key={model.id}
                                        model={model}
                                        onSelect={handleSelectModel}
                                        onAdd={handleAddModel}
                                        onPreview={setPreviewModel}
                                        loading={loading}
                                        inCatalog={false}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    </section>
                )}

                <ModelPreview model={previewModel} onClose={setPreviewModel} />
            </div>
        </AuthenticatedLayout>
    );
}
