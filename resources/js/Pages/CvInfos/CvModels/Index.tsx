import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { useToast } from '@/Components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import {
    Search, CheckCircle, FileText, Star,
    ChevronLeft, Sparkles, Coins, Eye,
    PlusCircle, SortAsc, Filter, Grid3X3,
    List, Heart, TrendingUp
} from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Badge } from "@/Components/ui/badge";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/Components/ui/toggle-group";
import axios from "axios";

// Animation variants améliorées
const cardVariants = {
    hidden: {
        opacity: 0,
        y: 30,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 25,
            duration: 0.4
        }
    },
    hover: {
        y: -8,
        scale: 1.03,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 12,
            duration: 0.2
        }
    },
    exit: {
        opacity: 0,
        scale: 0.9,
        y: -20,
        transition: { duration: 0.2 }
    }
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
            duration: 0.3
        }
    }
};

const pulseVariants = {
    pulse: {
        scale: [1, 1.05, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

const ModelCard = ({ model, isActive, onSelect, onAdd, onPreview, loading, inCatalog, viewMode = 'grid' }) => {
    const { t } = useTranslation();
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const cardClass = viewMode === 'list'
        ? "flex flex-row h-36 sm:h-40"
        : "flex flex-col h-full";

    const imageClass = viewMode === 'list'
        ? "w-24 sm:w-32 flex-shrink-0"
        : "aspect-[3/4] sm:aspect-[3/5]";

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            whileHover="hover"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className={`overflow-hidden rounded-xl border bg-white dark:bg-gray-800 shadow-sm border-gray-100 dark:border-gray-700 ${cardClass} group`}
            layout
        >
            <div
                className={`relative ${imageClass} overflow-hidden ${viewMode === 'grid' ? 'rounded-t-xl' : 'rounded-l-xl'} bg-gray-50 dark:bg-gray-900 cursor-pointer`}
                onClick={() => onPreview(model)}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent z-10" />

                {/* Image avec effet de chargement */}
                <AnimatePresence>
                    <motion.img
                        src={`/storage/${model.previewImagePath}`}
                        alt={model.name}
                        className={`w-full h-full object-cover transition-all duration-700 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
                        onLoad={() => setImageLoaded(true)}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                    />
                </AnimatePresence>

                {/* Skeleton loader */}
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
                )}

                {isActive && (
                    <motion.div
                        className="absolute top-3 right-3 z-20"
                        variants={pulseVariants}
                        animate="pulse"
                    >
                        <Badge className="bg-gradient-to-r from-amber-500 to-purple-500 text-white text-xs px-2 py-0.5 shadow-lg">
                            {t('cv_models.active')}
                        </Badge>
                    </motion.div>
                )}

                {/* Prix en overlay pour mode liste */}
                {viewMode === 'list' && model.price > 0 && (
                    <div className="absolute top-3 left-3 z-20">
                        <Badge className="bg-black/70 text-amber-300 text-xs px-2 py-0.5 backdrop-blur-sm">
                            <Coins className="w-3 h-3 mr-1" />
                            {model.price.toLocaleString()}
                        </Badge>
                    </div>
                )}

                {/* Info en bas pour mode grille */}
                {viewMode === 'grid' && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
                        <h3 className="font-bold text-sm sm:text-base text-white line-clamp-2">{model.name}</h3>
                        {model.price > 0 && (
                            <motion.div
                                className="flex items-center gap-1.5 mt-0.5"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Coins className="w-3.5 h-3.5 text-amber-300" />
                                <p className="text-xs sm:text-sm text-amber-200">
                                    {model.price.toLocaleString()}
                                </p>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* Overlay de hover amélioré */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8 }}
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-white/20 backdrop-blur-sm text-white border-white/40 hover:bg-white/30 shadow-lg"
                                >
                                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                                    {t('cv_models.view')}
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Contenu de la carte */}
            <div className={`${viewMode === 'list' ? 'p-2 sm:p-3' : 'p-3'} ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : 'mt-auto'}`}>
                {viewMode === 'list' && (
                    <div className="mb-2">
                        <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
                            {model.name}
                        </h3>
                        {model.price > 0 && (
                            <div className="flex items-center gap-1">
                                <Coins className="w-3 h-3 text-amber-500" />
                                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                    {model.price.toLocaleString()}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {inCatalog ? (
                    <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                            variant={isActive ? "outline" : "default"}
                            className={`w-full transition-all duration-200 ${viewMode === 'list' ? 'h-8 text-xs' : ''} ${isActive
                                ? 'border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                : 'bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl'
                            }`}
                            disabled={isActive || loading}
                            onClick={() => onSelect(model.id)}
                        >
                            {loading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-3 h-3 mr-1 border-2 border-current border-t-transparent rounded-full"
                                />
                            ) : isActive ? (
                                <CheckCircle className={`${viewMode === 'list' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
                            ) : (
                                <Star className={`${viewMode === 'list' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
                            )}
                            {isActive ? t('cv_models.selected') : t('cv_models.select')}
                        </Button>
                    </motion.div>
                ) : (
                    <div className={`flex gap-2 ${viewMode === 'list' ? 'flex-row' : 'flex-col'}`}>
                        <motion.div whileTap={{ scale: 0.95 }} className={viewMode === 'list' ? 'flex-1' : ''}>
                            <Button
                                variant={isActive ? "outline" : "default"}
                                className={`w-full transition-all duration-200 ${viewMode === 'list' ? 'h-8 text-xs' : ''} ${isActive
                                    ? 'border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                    : 'bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl'
                                }`}
                                disabled={loading}
                                onClick={() => onSelect(model.id)}
                            >
                                {loading ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-3 h-3 mr-1 border-2 border-current border-t-transparent rounded-full"
                                    />
                                ) : isActive ? (
                                    <CheckCircle className={`${viewMode === 'list' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
                                ) : (
                                    <Star className={`${viewMode === 'list' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
                                )}
                                {isActive ? t('cv_models.selected') : t('cv_models.use')}
                            </Button>
                        </motion.div>
                        <motion.div whileTap={{ scale: 0.95 }} className={viewMode === 'list' ? 'flex-1' : ''}>
                            <Button
                                variant="outline"
                                className={`w-full border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-200 ${viewMode === 'list' ? 'h-8 text-xs' : ''}`}
                                disabled={loading}
                                onClick={() => onAdd(model)}
                            >
                                <PlusCircle className={`${viewMode === 'list' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
                                {viewMode === 'list' ? t('cv_models.add') : t('cv_models.add_to_catalog')}
                            </Button>
                        </motion.div>
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
        <AnimatePresence>
            <Dialog open={Boolean(model)} onOpenChange={() => onClose(null)}>
                <DialogContent className="max-w-md sm:max-w-2xl p-0 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <DialogHeader className="px-4 py-3 border-b dark:border-gray-700">
                            <DialogTitle className="flex items-center gap-2 text-base dark:text-white">
                                <Star className="h-4 w-4 text-amber-500" />
                                <span className="bg-gradient-to-r from-amber-500 to-purple-500 text-transparent bg-clip-text line-clamp-1">
                                    {model?.name}
                                </span>
                                {isActive && (
                                    <motion.div
                                        variants={pulseVariants}
                                        animate="pulse"
                                    >
                                        <Badge className="bg-gradient-to-r from-amber-500 to-purple-500 text-white text-xs">
                                            {t('cv_models.active')}
                                        </Badge>
                                    </motion.div>
                                )}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="relative w-full aspect-square sm:aspect-[4/3] bg-gray-50 dark:bg-gray-900">
                            <motion.img
                                src={`/storage/${model?.previewImagePath}`}
                                alt={model?.name}
                                className="w-full h-full object-contain"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>

                        <div className="p-4 bg-white dark:bg-gray-800">
                            {model.price > 0 ? (
                                <motion.div
                                    className="flex items-center gap-2 mb-4"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <Coins className="w-4 h-4 text-amber-500" />
                                    <span className="font-medium dark:text-white">{model.price.toLocaleString()}</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 mb-4">
                                        {t('cv_models.preview.free')}
                                    </Badge>
                                </motion.div>
                            )}

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                {inCatalog ? (
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Button
                                            variant={isActive ? "outline" : "default"}
                                            className={`flex-1 transition-all duration-200 ${isActive
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
                                                className={`transition-all duration-200 ${isActive
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
                                                className="border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-200"
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
                            </motion.div>
                        </div>
                    </motion.div>
                </DialogContent>
            </Dialog>
        </AnimatePresence>
    );
};

const LoadingSpinner = () => (
    <motion.div
        className="flex items-center justify-center p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
    >
        <motion.div
            className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
    </motion.div>
);

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
    const [sortBy, setSortBy] = useState('price_asc');
    const [viewMode, setViewMode] = useState('grid');

    // Fonction de tri des modèles
    const sortModels = (models, sortType) => {
        const sortedModels = [...models];

        switch (sortType) {
            case 'price_asc':
                return sortedModels.sort((a, b) => a.price - b.price);
            case 'price_desc':
                return sortedModels.sort((a, b) => b.price - a.price);
            case 'name_asc':
                return sortedModels.sort((a, b) => a.name.localeCompare(b.name));
            case 'name_desc':
                return sortedModels.sort((a, b) => b.name.localeCompare(a.name));
            default:
                return sortedModels;
        }
    };

    // Filtrage et tri avec useMemo pour optimiser les performances
    const filteredAndSortedModels = useMemo(() => {
        const filterModels = (models) => {
            return models.filter(model =>
                model.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        };

        const filteredActive = filterModels(activeModels);
        const filteredAvailable = filterModels(availableModels);

        return {
            active: sortModels(filteredActive, sortBy),
            available: sortModels(filteredAvailable, sortBy)
        };
    }, [activeModels, availableModels, searchTerm, sortBy]);

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

    // Switch to the tab that has models when searching
    useEffect(() => {
        if (searchTerm) {
            if (filteredAndSortedModels.active.length === 0 && filteredAndSortedModels.available.length > 0) {
                setCurrentTab('discover');
            } else if (filteredAndSortedModels.active.length > 0 && filteredAndSortedModels.available.length === 0) {
                setCurrentTab('active');
            }
        }
    }, [searchTerm, filteredAndSortedModels]);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={t('cv_models.title')} />

            <AnimatePresence>

                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 20,
                        duration: 0.5
                    }}
                    className="fixed right-0 top-1/2 -translate-y-1/2 z-50"
                >
                    <Link href="/cv-infos/show">
                        <motion.div
                            whileHover={{
                                scale: 1.05,
                                x: 10
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white h-12 px-4 text-sm shadow-lg hover:shadow-xl transition-all duration-200 rounded-l-full rounded-r-none">
                                <FileText className="w-5 h-5 mr-2" />
                                <span className="hidden sm:inline">{t('cv_models.export_cv')}</span>
                                <span className="sm:hidden">{t('cv_models.export')}</span>
                            </Button>
                        </motion.div>
                    </Link>
                </motion.div>
            </AnimatePresence>
            <div className="min-h-screen bg-gradient-to-b from-amber-50/30 dark:from-gray-900 to-white dark:to-gray-800 pb-16">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
                    {/* Header avec navigation amélioré */}
                    <motion.header
                        className="flex flex-col gap-3 mb-4 sm:mb-6"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Link href={route('cv-infos.index')}>
                                    <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:bg-amber-50 dark:hover:bg-amber-900/20 h-8 px-2 sm:h-9 sm:px-3 dark:text-gray-300 transition-all duration-200 hover:scale-105">
                                        <ChevronLeft className="w-4 h-4" />
                                        <span className="hidden sm:inline">{t('cv_models.back')}</span>
                                    </Button>
                                </Link>
                                <motion.h1
                                    className="text-lg sm:text-xl font-bold bg-gradient-to-r from-amber-500 to-purple-500 text-transparent bg-clip-text"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {t('cv_models.title')}
                                </motion.h1>
                            </div>

                        </div>

                        {/* Barre de recherche et contrôles */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                                <Input
                                    type="text"
                                    placeholder={t('cv_models.search_placeholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 w-full border-amber-100 dark:border-gray-700 focus:border-amber-500 bg-white dark:bg-gray-800 dark:text-gray-300 transition-all duration-200"
                                />
                            </div>

                            <div className="flex gap-2">
                                {/* Sélecteur de tri */}
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-36 sm:w-40 border-amber-100 dark:border-gray-700">
                                        <SortAsc className="w-4 h-4 mr-1" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="price_asc">Prix ↑</SelectItem>
                                        <SelectItem value="price_desc">Prix ↓</SelectItem>
                                        <SelectItem value="name_asc">Nom A-Z</SelectItem>
                                        <SelectItem value="name_desc">Nom Z-A</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/*Sélecteur de vue*/}
                                <ToggleGroup type="single" value={viewMode} onValueChange={setViewMode}>
                                    <ToggleGroupItem value="grid" aria-label="Vue grille" className="border-amber-100 dark:border-gray-700">
                                        <Grid3X3 className="w-4 h-4" />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="list" aria-label="Vue liste" className="border-amber-100 dark:border-gray-700">
                                        <List className="w-4 h-4" />
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                        </div>
                    </motion.header>

                    {/* Notification pour modèle sélectionné depuis discover */}
                    <AnimatePresence>
                        {selectedModelId && availableModels.some(model => model.id === selectedModelId) && (
                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Alert className="mb-3 sm:mb-5 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                                    <AlertDescription className="flex items-center text-amber-700 dark:text-amber-400 text-sm">
                                        <CheckCircle className="w-4 h-4 text-amber-500 mr-2" />
                                        {t('cv_models.model_active_from_discover')}
                                    </AlertDescription>
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Onglets avec animations */}
                    <Tabs
                        value={currentTab}
                        onValueChange={setCurrentTab}
                        className="mb-4 sm:mb-6"
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <TabsList className="mb-3 sm:mb-4 bg-white dark:bg-gray-800 border border-amber-100 dark:border-gray-700 w-full">
                                <TabsTrigger
                                    value="active"
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-purple-500 data-[state=active]:text-white flex-1 text-xs sm:text-sm dark:text-gray-300 dark:data-[state=inactive]:hover:bg-gray-700/50 transition-all duration-200"
                                >
                                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                    {t('cv_models.tabs.active')} ({filteredAndSortedModels.active.length})
                                </TabsTrigger>
                                <TabsTrigger
                                    value="discover"
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-purple-500 data-[state=active]:text-white flex-1 text-xs sm:text-sm dark:text-gray-300 dark:data-[state=inactive]:hover:bg-gray-700/50 transition-all duration-200"
                                >
                                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                    {t('cv_models.tabs.discover')} ({filteredAndSortedModels.available.length})
                                </TabsTrigger>
                            </TabsList>
                        </motion.div>

                        <TabsContent value="active" className="mt-0 focus-visible:outline-none">
                            <AnimatePresence mode="wait">
                                {filteredAndSortedModels.active.length === 0 ? (
                                    <motion.div
                                        key="empty-active"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                                            <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm">
                                                {searchTerm
                                                    ? t('cv_models.empty_state.no_search_results')
                                                    : t('cv_models.empty_state.description')
                                                }
                                            </AlertDescription>
                                        </Alert>
                                    </motion.div>
                                ) : loading ? (
                                    <LoadingSpinner />
                                ) : (
                                    <motion.div
                                        key="models-active"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className={
                                            viewMode === 'grid'
                                                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4"
                                                : "flex flex-col gap-3 sm:gap-4"
                                        }
                                    >
                                        <AnimatePresence>
                                            {filteredAndSortedModels.active.map((model) => (
                                                <ModelCard
                                                    key={model.id}
                                                    model={model}
                                                    isActive={selectedModelId === model.id}
                                                    onSelect={handleSelectModel}
                                                    onAdd={handleAddModel}
                                                    onPreview={setPreviewModel}
                                                    loading={loading}
                                                    inCatalog={true}
                                                    viewMode={viewMode}
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </TabsContent>

                        <TabsContent value="discover" className="mt-0 focus-visible:outline-none">
                            <AnimatePresence mode="wait">
                                {filteredAndSortedModels.available.length === 0 ? (
                                    <motion.div
                                        key="empty-discover"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                                            <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm">
                                                {searchTerm
                                                    ? t('cv_models.empty_state.no_search_results')
                                                    : t('cv_models.empty_state.all_models_added')
                                                }
                                            </AlertDescription>
                                        </Alert>
                                    </motion.div>
                                ) : loading ? (
                                    <LoadingSpinner />
                                ) : (
                                    <motion.div
                                        key="models-discover"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className={
                                            viewMode === 'grid'
                                                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4"
                                                : "flex flex-col gap-3 sm:gap-4"
                                        }
                                    >
                                        <AnimatePresence>
                                            {filteredAndSortedModels.available.map((model) => (
                                                <ModelCard
                                                    key={model.id}
                                                    model={model}
                                                    isActive={selectedModelId === model.id}
                                                    onSelect={handleSelectModel}
                                                    onAdd={handleAddModel}
                                                    onPreview={setPreviewModel}
                                                    loading={loading}
                                                    inCatalog={false}
                                                    viewMode={viewMode}
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </motion.div>
                                )}
                            </AnimatePresence>
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
