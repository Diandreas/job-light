import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";
import {
    ArrowLeft, Download, Coins, AlertCircle, Star,
    Palette, RotateCcw, Sparkles, Check, Loader2, X, Settings2, ChevronDown, ChevronUp, LayoutTemplate
} from 'lucide-react';
import AIRephraseButton from '@/Components/AIRephraseButton';
import { useToast } from "@/Components/ui/use-toast";
import ColorPicker from '@/Components/ColorPicker';
import CVPreview, { CVPreviewRef } from '@/Components/CVPreview';
import axios from 'axios';

export default function Show({ auth, cvInformation, selectedCvModel, cvModels }) {
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const cvPreviewRef = useRef<CVPreviewRef>(null);

    // States
    const [isDownloading, setIsDownloading] = useState(false);
    const [walletBalance, setWalletBalance] = useState(auth.user.wallet_balance);
    const [hasDownloaded, setHasDownloaded] = useState(false);
    const [currentColor, setCurrentColor] = useState(cvInformation?.primary_color || '#3498db');
    const [hasCustomColor, setHasCustomColor] = useState(Boolean(cvInformation?.primary_color));
    const [showControls, setShowControls] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [activeModelId, setActiveModelId] = useState(selectedCvModel?.id);

    // Update activeModelId when selectedCvModel prop changes (e.g. from backend)
    useEffect(() => {
        if (selectedCvModel?.id) {
            setActiveModelId(selectedCvModel.id);
        }
    }, [selectedCvModel?.id]);

    const activeModel = cvModels?.find(m => m.id === activeModelId) || selectedCvModel;

    const canAccessFeatures = walletBalance >= (activeModel?.price || 0);

    // Check download status
    useEffect(() => {
        const checkDownloadStatus = async () => {
            if (!activeModelId) return;
            try {
                const response = await axios.get(`/api/check-download-status/${activeModelId}`);
                setHasDownloaded(response.data.hasDownloaded);
            } catch (error) {
                console.error('Error checking download status:', error);
            }
        };
        checkDownloadStatus();
    }, [activeModelId]);

    // Handle model change
    const handleModelChange = async (modelId) => {
        if (modelId === activeModelId) return;

        // Mettre à jour l'ID localement immédiatement pour recharger l'aperçu sans délai
        setActiveModelId(modelId);

        try {
            await axios.post('/user-cv-models/select-active', {
                cv_model_id: modelId
            });

            toast({ title: "Modèle changé", description: "Le nouveau design a été appliqué." });

            // On ne recharge plus la page, tout est géré localement
        } catch (error) {
            console.error('Failed to change model', error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de changer de modèle.' });
            // Revenir à l'ancien modèle en cas d'erreur
            setActiveModelId(selectedCvModel.id);
        }
    };

    const handleColorSaved = (newColor) => {
        setCurrentColor(newColor);
        setHasCustomColor(true);
        cvPreviewRef.current?.reload(); // Reload CV with new color
        toast({ title: '🎨 Couleur appliquée', description: 'Prévisualisation mise à jour' });
    };

    const handleColorReset = async () => {
        try {
            const response = await axios.post('/api/cv-color/reset');
            if (response.data.status === 'success') {
                setCurrentColor('#3498db');
                setHasCustomColor(false);
                cvPreviewRef.current?.reload(); // Reload CV with default color
                toast({ title: '🔄 Couleur réinitialisée', description: 'La couleur par défaut a été restaurée' });
            }
        } catch (error) {
            toast({ title: 'Erreur', description: 'Impossible de réinitialiser la couleur', variant: 'destructive' });
        }
    };

    // WeasyPrint-only download
    const handleDownload = async () => {
        if (!canAccessFeatures && !hasDownloaded) {
            return toast({
                title: t('cv_preview.wallet.insufficient_access.title'),
                description: t('cv_preview.wallet.insufficient_tokens'),
                variant: 'destructive'
            });
        }

        setIsDownloading(true);
        try {
            // Debit tokens if not already done
            if (!hasDownloaded) {
                await axios.post('/api/process-download', {
                    user_id: auth.user.id,
                    model_id: activeModelId,
                    price: activeModel?.price
                });
                setWalletBalance(prev => prev - (activeModel?.price || 0));
                setHasDownloaded(true);
            }

            // Download PDF via WeasyPrint
            const response = await axios.get(route('cv.download', activeModelId), {
                responseType: 'blob',
                params: { locale: i18n.language }
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `CV-${auth.user.name}.pdf`;
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);

            toast({
                title: '✅ CV téléchargé',
                description: 'Votre CV a été généré et téléchargé avec succès.',
            });
        } catch (error) {
            console.error('Download error:', error);
            toast({
                title: t('common.error'),
                description: t('cv_preview.export.download_error'),
                variant: 'destructive'
            });
        } finally {
            setIsDownloading(false);
        }
    };



    if (!selectedCvModel) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title={t('cv_preview.title')} />
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center space-y-4">
                        <Star className="w-16 h-16 mx-auto text-amber-500" />
                        <p className="text-lg text-gray-600">{t('cv_preview.no_model.message')}</p>
                        <Link href={route('userCvModels.index')}>
                            <Button className="bg-gradient-to-r from-amber-500 to-purple-500">
                                <Star className="w-4 h-4 mr-2" />
                                {t('cv_preview.no_model.action')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout user={auth.user} hideSidebar={true}>
            <Head title={t('cv_preview.title')} />

            {/* Main Layout - Full Height */}
            <div className="h-[calc(100vh-64px)] bg-gray-100 dark:bg-gray-900 relative flex flex-col overflow-hidden">

                {/* 1. Content Area - Scrollable */}
                <div className="flex-1 overflow-hidden relative">
                    <CVPreview
                        ref={cvPreviewRef}
                        cvModelId={activeModelId}
                        locale={i18n.language}
                        editable={false}
                    />
                </div>

                {/* 2. Bottom Toolbar & Drawer Container */}
                <div className="flex-shrink-0 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] mb-14 md:mb-0">

                    {/* Toolbar Actions Row */}
                    <div className="px-4 py-3 flex items-center justify-between gap-4 max-w-4xl mx-auto">

                        {/* Left: Appearance Controls */}
                        <div className="flex items-center gap-2">
                            {/* Color Picker */}
                            <div className="relative">
                                {/* @ts-ignore */}
                                <ColorPicker defaultColor={currentColor} onColorSaved={handleColorSaved} />
                            </div>

                            {/* Reset Color */}
                            {hasCustomColor && (
                                <button
                                    onClick={handleColorReset}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                                    title="Réinitialiser la couleur"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            )}

                        </div>

                        {/* Center: Model Drawer Trigger */}
                        <div
                            className="flex flex-col items-center justify-center cursor-pointer group"
                            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                        >
                            <div className="h-1 w-12 bg-gray-300 rounded-full mb-1 group-hover:bg-gray-400 transition-colors" />
                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide group-hover:text-amber-600 transition-colors select-none">
                                <LayoutTemplate className="w-3.5 h-3.5" />
                                <span>{t('cv_preview.change_model', 'Changer de modèle')}</span>
                                {isDrawerOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2">
                            {/* Word Export (Coming Soon / Placeholder) */}
                            {/* <Button variant="ghost" size="icon" className="text-blue-700 hover:bg-blue-50" title="Export Word">
                                <div className="font-bold text-xs">DOC</div>
                            </Button> */}

                            {/* Download PDF */}
                            <Button
                                onClick={handleDownload}
                                disabled={isDownloading || (!canAccessFeatures && !hasDownloaded)}
                                size="sm"
                                className="bg-gradient-to-r from-amber-500 to-purple-500 text-white shadow-md hover:shadow-lg transition-all"
                            >
                                {isDownloading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Download className="w-4 h-4 sm:mr-2" />
                                        <span className="hidden sm:inline">{t('cv_preview.download_pdf', 'Télécharger PDF')}</span>
                                        <span className="sm:hidden">PDF</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Expandable Model Drawer */}
                    <AnimatePresence>
                        {isDrawerOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-gray-100 dark:border-gray-700 overflow-hidden bg-gray-50/50"
                            >
                                <div className="h-44 overflow-x-auto p-4 flex gap-4 items-center snap-x safe-area-bottom">
                                    {cvModels?.map((model) => (
                                        <div
                                            key={model.id}
                                            onClick={() => handleModelChange(model.id)}
                                            className={`relative group flex-shrink-0 w-28 cursor-pointer transition-all duration-200 snap-center ${model.id === activeModelId ? 'scale-105 ring-2 ring-amber-500 rounded-lg shadow-lg' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                                        >
                                            <div className="aspect-[210/297] bg-white rounded-lg overflow-hidden border border-gray-200">
                                                <img
                                                    src={model.previewImagePath ? `/storage/${model.previewImagePath}` : '/images/cv-placeholder.jpg'}
                                                    alt={model.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/210x297?text=CV'; }}
                                                />
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-[10px] py-1.5 px-2 text-center truncate font-medium">
                                                    {model.name}
                                                </div>
                                            </div>
                                            {model.id === activeModelId && (
                                                <div className="absolute top-2 right-2 bg-amber-500 text-white rounded-full p-1 shadow-sm z-10">
                                                    <Check className="w-3 h-3" />
                                                </div>
                                            )}
                                            {/* Price Tag if not free/unlocked */}
                                            {model.price > 0 && !canAccessFeatures && !hasDownloaded && (
                                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                                                    <Coins className="w-2.5 h-2.5 text-amber-400" />
                                                    {model.price}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
