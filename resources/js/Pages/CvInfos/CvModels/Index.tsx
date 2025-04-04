import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { useToast } from '@/Components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import {
    Search, CheckCircle, FileText, Star,
    ChevronLeft, Sparkles, Coins, Eye,
    PlusCircle
} from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Badge } from "@/Components/ui/badge";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import axios from "axios";

// Animation variants
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    hover: {
        y: -5,
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 10 }
    }
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.05
        }
    }
};

const ModelCard = ({ model, isActive, onSelect, onAdd, onPreview, loading, inCatalog }) => {
    const { t } = useTranslation();

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            className="overflow-hidden rounded-xl border bg-white dark:bg-gray-800 shadow-sm border-gray-100 dark:border-gray-700 flex flex-col h-full"
        >
            <div
                className="relative aspect-[3/4] sm:aspect-[3/5] overflow-hidden rounded-t-xl bg-gray-50 dark:bg-gray-900 cursor-pointer"
                onClick={() => onPreview(model)}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent z-10" />
                <img
                    src={`/storage/${model.previewImagePath}`}
                    alt={model.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />

                {isActive && (
                    <div className="absolute top-3 right-3 z-20">
                        <Badge className="bg-gradient-to-r from-amber-500 to-purple-500 text-white text-xs px-2 py-0.5">
                            {t('cv_models.active')}
                        </Badge>
                    </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
                    <h3 className="font-bold text-sm sm:text-base text-white line-clamp-2">{model.name}</h3>
                    {model.price > 0 && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <Coins className="w-3.5 h-3.5 text-amber-300" />
                            <p className="text-xs sm:text-sm text-amber-200">
                                {model.price.toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>

                <motion.div
                    className="absolute inset-0 bg-black/50 z-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    whileHover={{ opacity: 1 }}
                >
                    <Button variant="outline" size="sm" className="bg-white/20 backdrop-blur-sm text-white border-white/40 hover:bg-white/30">
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        {t('cv_models.view')}
                    </Button>
                </motion.div>
            </div>

            <div className="p-3 mt-auto">
                {inCatalog ? (
                    <Button
                        variant={isActive ? "outline" : "default"}
                        className={`w-full ${isActive
                            ? 'border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                            : 'bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white'
                            }`}
                        disabled={isActive || loading}
                        onClick={() => onSelect(model.id)}
                    >
                        {isActive ? (
                            <CheckCircle className="w-4 h-4 mr-1.5" />
                        ) : (
                            <Star className="w-4 h-4 mr-1.5" />
                        )}
                        {isActive ? t('cv_models.selected') : t('cv_models.select')}
                    </Button>
                ) : (
                    <div className="flex flex-col gap-2">
                        <Button
                            variant={isActive ? "outline" : "default"}
                            className={`w-full ${isActive
                                ? 'border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                : 'bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white'
                                }`}
                            disabled={loading}
                            onClick={() => onSelect(model.id)}
                        >
                            {isActive ? (
                                <CheckCircle className="w-4 h-4 mr-1.5" />
                            ) : (
                                <Star className="w-4 h-4 mr-1.5" />
                            )}
                            {isActive ? t('cv_models.selected') : t('cv_models.use')}
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                            disabled={loading}
                            onClick={() => onAdd(model)}
                        >
                            <PlusCircle className="w-4 h-4 mr-1.5" />
                            {t('cv_models.add_to_catalog')}
                        </Button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const ModelPreview = ({ model, onClose, onAdd, onSelect, isActive, inCatalog, loading }) => {
    const { t } = useTranslation();

    if (!model) return null;

    return (
        <Dialog open={Boolean(model)} onOpenChange={() => onClose(null)}>
            <DialogContent className="max-w-md sm:max-w-2xl p-0 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                <DialogHeader className="px-4 py-3 border-b dark:border-gray-700">
                    <DialogTitle className="flex items-center gap-2 text-base dark:text-white">
                        <Star className="h-4 w-4 text-amber-500" />
                        <span className="bg-gradient-to-r from-amber-500 to-purple-500 text-transparent bg-clip-text line-clamp-1">
                            {model?.name}
                        </span>
                        {isActive && (
                            <Badge className="bg-gradient-to-r from-amber-500 to-purple-500 text-white text-xs">
                                {t('cv_models.active')}
                            </Badge>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="relative w-full aspect-square sm:aspect-[4/3] bg-gray-50 dark:bg-gray-900">
                    <img
                        src={`/storage/${model?.previewImagePath}`}
                        alt={model?.name}
                        className="w-full h-full object-contain"
                    />
                </div>

                <div className="p-4 bg-white dark:bg-gray-800">
                    {model.price > 0 ? (
                        <div className="flex items-center gap-2 mb-4">
                            <Coins className="w-4 h-4 text-amber-500" />
                            <span className="font-medium dark:text-white">{model.price.toLocaleString()}</span>
                        </div>
                    ) : (
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 mb-4">
                            {t('cv_models.preview.free')}
                        </Badge>
                    )}

                    {inCatalog ? (
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                variant={isActive ? "outline" : "default"}
                                className={`flex-1 ${isActive
                                    ? 'border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                    : 'bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white'
                                    }`}
                                disabled={isActive || loading}
                                onClick={() => {
                                    onSelect(model.id);
                                    onClose(null);
                                }}
                            >
                                {isActive ? (
                                    <CheckCircle className="w-4 h-4 mr-1.5" />
                                ) : (
                                    <Star className="w-4 h-4 mr-1.5" />
                                )}
                                {isActive ? t('cv_models.selected') : t('cv_models.select')}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => onClose(null)}
                                className="flex-1 sm:flex-none dark:border-gray-700 dark:text-gray-300"
                            >
                                {t('common.close')}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Button
                                    variant={isActive ? "outline" : "default"}
                                    className={`${isActive
                                        ? 'border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                        : 'bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white'
                                        }`}
                                    disabled={loading}
                                    onClick={() => {
                                        onSelect(model.id);
                                        onClose(null);
                                    }}
                                >
                                    {isActive ? (
                                        <CheckCircle className="w-4 h-4 mr-1.5" />
                                    ) : (
                                        <Star className="w-4 h-4 mr-1.5" />
                                    )}
                                    {isActive ? t('cv_models.selected') : t('cv_models.use')}
                                </Button>

                                <Button
                                    variant="outline"
                                    className="border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                    disabled={loading}
                                    onClick={() => {
                                        onAdd(model);
                                        onClose(null);
                                    }}
                                >
                                    <PlusCircle className="w-4 h-4 mr-1.5" />
                                    {t('cv_models.add_to_catalog')}
                                </Button>
                            </div>

                            <Button
                                variant="ghost"
                                onClick={() => onClose(null)}
                                className="dark:text-gray-300 dark:hover:bg-gray-700/50"
                            >
                                {t('common.close')}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
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
    const [currentTab, setCurrentTab] = useState('discover');

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

    const handleSelectModel = async (modelId) => {
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
    };

    const filteredModels = (models) => {
        return models.filter(model =>
            model.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const filteredActiveModels = filteredModels(activeModels);
    const filteredAvailableModels = filteredModels(availableModels);

    // Switch to the tab that has models when searching
    useEffect(() => {
        if (searchTerm) {
            if (filteredActiveModels.length === 0 && filteredAvailableModels.length > 0) {
                setCurrentTab('discover');
            } else if (filteredActiveModels.length > 0 && filteredAvailableModels.length === 0) {
                setCurrentTab('active');
            }
        }
    }, [searchTerm, filteredActiveModels.length, filteredAvailableModels.length]);

    // If a model is selected from the discover tab, show the active tab automatically
    useEffect(() => {
        const selectedModelInAvailable = availableModels.some(model => model.id === selectedModelId);
        if (selectedModelInAvailable && currentTab === 'discover') {
            toast({
                description: t('cv_models.notifications.model_from_discover_selected')
            });
        }
    }, [selectedModelId, availableModels, currentTab, toast, t]);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={t('cv_models.title')} />

            <div className="min-h-screen bg-gradient-to-b from-amber-50/30 dark:from-gray-900 to-white dark:to-gray-800 pb-16">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
                    {/* Header with navigation - Compact but clear */}
                    <header className="flex flex-col gap-3 mb-4 sm:mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Link href={route('cv-infos.index')}>
                                    <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:bg-amber-50 dark:hover:bg-amber-900/20 h-8 px-2 sm:h-9 sm:px-3 dark:text-gray-300">
                                        <ChevronLeft className="w-4 h-4" />
                                        <span className="hidden sm:inline">{t('cv_models.back')}</span>
                                    </Button>
                                </Link>
                                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-amber-500 to-purple-500 text-transparent bg-clip-text">
                                    {t('cv_models.title')}
                                </h1>
                            </div>

                            <Link href="/cv-infos/show">
                                <Button className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white h-8 sm:h-9 px-2 sm:px-3 text-sm">
                                    <FileText className="w-4 h-4 mr-1 sm:mr-2" />
                                    <span className="hidden sm:inline">{t('cv_models.export_cv')}</span>
                                    <span className="sm:hidden">{t('cv_models.export')}</span>
                                </Button>
                            </Link>
                        </div>

                        {/* Search - Full width */}
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                            <Input
                                type="text"
                                placeholder={t('cv_models.search_placeholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 w-full border-amber-100 dark:border-gray-700 focus:border-amber-500 bg-white dark:bg-gray-800 dark:text-gray-300"
                            />
                        </div>
                    </header>

                    {/* Model usage stats - Simplified and responsive */}
                    <div className="flex items-center justify-between p-2 sm:p-3 mb-3 sm:mb-5 rounded-md bg-white dark:bg-gray-800 border border-amber-100 dark:border-gray-700 shadow-sm">
                        <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                            {activeModels.length}/{maxAllowedModels} {t('cv_models.models')}
                        </div>
                        <div className="w-32 sm:w-48 h-1.5 sm:h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-amber-400 to-purple-500"
                                style={{ width: `${(activeModels.length / maxAllowedModels) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Selected model from discover notification */}
                    {selectedModelId && availableModels.some(model => model.id === selectedModelId) && (
                        <Alert className="mb-3 sm:mb-5 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                            <AlertDescription className="flex items-center text-amber-700 dark:text-amber-400 text-sm">
                                <CheckCircle className="w-4 h-4 text-amber-500 mr-2" />
                                {t('cv_models.model_active_from_discover')}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Tabs for navigation */}
                    <Tabs
                        value={currentTab}
                        onValueChange={setCurrentTab}
                        className="mb-4 sm:mb-6"
                    >
                        <TabsList className="mb-3 sm:mb-4 bg-white dark:bg-gray-800 border border-amber-100 dark:border-gray-700 w-full">
                            <TabsTrigger
                                value="active"
                                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-purple-500 data-[state=active]:text-white flex-1 text-xs sm:text-sm dark:text-gray-300 dark:data-[state=inactive]:hover:bg-gray-700/50"
                            >
                                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                {t('cv_models.tabs.active')} ({filteredActiveModels.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="discover"
                                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-purple-500 data-[state=active]:text-white flex-1 text-xs sm:text-sm dark:text-gray-300 dark:data-[state=inactive]:hover:bg-gray-700/50"
                            >
                                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                {t('cv_models.tabs.discover')} ({filteredAvailableModels.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="active" className="mt-0 focus-visible:outline-none">
                            {filteredActiveModels.length === 0 ? (
                                <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                                    <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm">
                                        {searchTerm
                                            ? t('cv_models.empty_state.no_search_results')
                                            : t('cv_models.empty_state.description')
                                        }
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4"
                                >
                                    {filteredActiveModels.map((model) => (
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
                                </motion.div>
                            )}
                        </TabsContent>

                        <TabsContent value="discover" className="mt-0 focus-visible:outline-none">
                            {filteredAvailableModels.length === 0 ? (
                                <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                                    <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm">
                                        {searchTerm
                                            ? t('cv_models.empty_state.no_search_results')
                                            : t('cv_models.empty_state.all_models_added')
                                        }
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4"
                                >
                                    {filteredAvailableModels.map((model) => (
                                        <ModelCard
                                            key={model.id}
                                            model={model}
                                            isActive={selectedModelId === model.id}
                                            onSelect={handleSelectModel}
                                            onAdd={handleAddModel}
                                            onPreview={setPreviewModel}
                                            loading={loading}
                                            inCatalog={false}
                                        />
                                    ))}
                                </motion.div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <ModelPreview
                model={previewModel}
                onClose={setPreviewModel}
                onAdd={handleAddModel}
                onSelect={handleSelectModel}
                isActive={previewModel ? selectedModelId === previewModel.id : false}
                inCatalog={previewModel ? activeModels.some(m => m.id === previewModel.id) : false}
                loading={loading}
            />
        </AuthenticatedLayout>
    );
}