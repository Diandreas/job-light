import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { useToast } from '@/Components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import {
    Search, CheckCircle, FileText, Star,
    ArrowUpRight, AlertCircle, ChevronLeft, Sparkles, Coins
} from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/Components/ui/sheet";
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Alert, AlertDescription } from "@/Components/ui/alert";
import axios from "axios";

const ModelCard = ({ model, isActive, onSelect, onAdd, onPreview, loading, inCatalog }) => {
    const { t } = useTranslation();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="group relative overflow-hidden rounded-xl border transition-all border-gray-200/50 hover:border-amber-300"
        >
            <div className="relative aspect-[9/12] mb-4 overflow-hidden rounded-lg bg-gray-100 group-hover:shadow-xl transition-all duration-300 cursor-pointer"
                 onClick={() => onPreview(model)}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 z-10" />
                <img
                    src={`/storage/${model.previewImagePath}`}
                    alt={model.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {isActive && (
                    <motion.div
                        initial={false}
                        animate={{ opacity: 1 }}
                        className="absolute top-3 right-3 z-20"
                    >
                        <div className="bg-gradient-to-r from-amber-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm shadow-md">
                            {t('cv_models.model_card.active')}
                        </div>
                    </motion.div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-white/70">{model.category}</p>
                        <h3 className="font-semibold text-lg text-white leading-tight">{model.name}</h3>
                        {model.price > 0 && (
                            <div className="flex items-center gap-1.5 mt-2">
                                <Coins className="w-4 h-4 text-amber-400" />
                                <p className="text-sm font-medium text-amber-300">
                                    {model.price.toLocaleString()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex gap-2 p-4">
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
                            {isActive ? t('cv_models.model_card.active_model') : t('cv_models.model_card.use_model')}
                        </div>
                    </Button>
                ) : (
                    <Button
                        className="w-full bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white"
                        disabled={loading}
                        onClick={() => onAdd(model)}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {t('cv_models.model_card.add_to_catalog')}
                    </Button>
                )}
            </div>
        </motion.div>
    );
};

const ModelPreview = ({ model, onClose }) => {
    const { t } = useTranslation();

    return (
        <Sheet open={Boolean(model)} onOpenChange={() => onClose(null)}>
            <SheetContent side="right" className="w-full sm:max-w-4xl bg-white p-0">
                <SheetHeader className="px-6 py-4 border-b">
                    <SheetTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-amber-500" />
                        <span className="bg-gradient-to-r from-amber-500 to-purple-500 text-transparent bg-clip-text">
                            {model?.name}
                        </span>
                    </SheetTitle>
                </SheetHeader>
                <div className="p-6 h-[calc(100vh-5rem)] overflow-auto bg-gray-50">
                    <img
                        src={`/storage/${model?.previewImagePath}`}
                        alt={model?.name}
                        className="w-full h-auto rounded-lg shadow-xl border border-gray-200"
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default function CvModelsIndex({ auth, userCvModels, availableCvModels, maxAllowedModels }) {
    const { t } = useTranslation();
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
                title: t('cv_models.notifications.max_models_reached', { max: maxAllowedModels }),
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
                title: t('common.success'),
                description: t('cv_models.notifications.model_added')
            });
        } catch (error) {
            toast({
                title: t('common.error'),
                description: error.response?.data?.message || t('cv_models.notifications.error'),
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
                title: t('common.success'),
                description: t('cv_models.notifications.model_activated')
            });
        } catch (error) {
            toast({
                title: t('common.error'),
                description: error.response?.data?.message || t('cv_models.notifications.error'),
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    }, [auth.user.id, toast, t]);

    const filteredModels = useCallback((models) => {
        return models.filter(model =>
            model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            model.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={t('cv_models.title')} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <nav className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link href={route('cv-infos.index')}>
                            <Button variant="ghost" className="flex items-center gap-2 hover:bg-amber-50">
                                <ChevronLeft className="w-4 h-4" />
                                {t('cv_models.back')}
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-purple-500 text-transparent bg-clip-text">
                            {t('cv_models.title')}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input
                                type="text"
                                placeholder={t('cv_models.search_placeholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full sm:w-64 border-amber-200 focus:border-amber-500"
                            />
                        </div>
                        <Link href="/cv-infos/show">
                            <Button className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white">
                                <FileText className="w-4 h-4 mr-2" />
                                {t('cv_models.export_cv')}
                            </Button>
                        </Link>
                    </div>
                </nav>

                <section className="space-y-6 mb-12">
                    <header className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="text-amber-500 w-5 h-5" />
                            <h2 className="text-xl font-semibold bg-gradient-to-r from-amber-500 to-purple-500 text-transparent bg-clip-text">
                                {t('cv_models.active_models.title')}
                            </h2>
                        </div>
                        <div className="text-sm px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                            {t('cv_models.active_models.limit', { current: activeModels.length, max: maxAllowedModels })}
                        </div>
                    </header>

                    {activeModels.length === 0 ? (
                        <Alert className="bg-amber-50 border-amber-200">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            <AlertDescription className="text-amber-700">
                                {t('cv_models.empty_state.description')}
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                            {t('cv_models.discover_models')}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            <AnimatePresence>
                                {filteredModels(availableModels).map((model) => (
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
