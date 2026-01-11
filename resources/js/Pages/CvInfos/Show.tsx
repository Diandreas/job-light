import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";
import {
    ArrowLeft, Download, Coins, AlertCircle, Star,
    Palette, RotateCcw, Sparkles, Check, Loader2, X, Settings2, ChevronDown
} from 'lucide-react';
import AIRephraseButton from '@/Components/AIRephraseButton';
import { useToast } from "@/Components/ui/use-toast";
import ColorPicker from '@/Components/ColorPicker';
import CVPreview, { CVPreviewRef } from '@/Components/CVPreview';
import axios from 'axios';

export default function Show({ auth, cvInformation, selectedCvModel }) {
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const cvPreviewRef = useRef<CVPreviewRef>(null);

    // States
    const [isDownloading, setIsDownloading] = useState(false);
    const [walletBalance, setWalletBalance] = useState(auth.user.wallet_balance);
    const [hasDownloaded, setHasDownloaded] = useState(false);
    const [currentColor, setCurrentColor] = useState(cvInformation?.primary_color || '#3498db');
    const [hasCustomColor, setHasCustomColor] = useState(Boolean(cvInformation?.primary_color));
    const [isEditable, setIsEditable] = useState(false);
    const [focusedField, setFocusedField] = useState<{ field: string, value: string, id: string, model: string } | null>(null);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
    const [showControls, setShowControls] = useState(true);

    const canAccessFeatures = walletBalance >= (selectedCvModel?.price || 0);

    // Check download status
    useEffect(() => {
        const checkDownloadStatus = async () => {
            if (!selectedCvModel?.id) return;
            try {
                const response = await axios.get(`/api/check-download-status/${selectedCvModel.id}`);
                setHasDownloaded(response.data.hasDownloaded);
            } catch (error) {
                console.error('Error checking download status:', error);
            }
        };
        checkDownloadStatus();
    }, [selectedCvModel?.id]);

    // Handle field changes from CV
    const handleFieldChange = async (field: string, value: string, id: string, model: string) => {
        setSaveStatus('saving');
        try {
            await axios.post('/api/cv/update-field', { field, value, id, model });
            setSaveStatus('saved');
            toast({ title: 'Saved', description: 'Your changes have been saved.' });
        } catch (error) {
            console.error('Save failed', error);
            setSaveStatus('error');
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save changes.' });
        }
    };

    // Handle field focus from CV
    const handleFieldFocus = (field: string, value: string, id: string, model: string) => {
        setFocusedField({ field, value, id, model });
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
                    model_id: selectedCvModel?.id,
                    price: selectedCvModel?.price
                });
                setWalletBalance(prev => prev - (selectedCvModel?.price || 0));
                setHasDownloaded(true);
            }

            // Download PDF via WeasyPrint
            const response = await axios.get(route('cv.download', selectedCvModel?.id), {
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

    const handleAiRephrase = async (newText) => {
        if (!focusedField) return;
        try {
            await axios.post('/api/cv/update-field', {
                field: focusedField.field,
                value: newText,
                id: focusedField.id,
                model: focusedField.model
            });

            // Update field directly in the preview without reloading
            cvPreviewRef.current?.updateField(
                focusedField.field,
                newText,
                focusedField.id,
                focusedField.model
            );

            setFocusedField(prev => prev ? ({ ...prev, value: newText }) : null);
            toast({ title: "✨ Updated!", description: "Content rephrased and saved." });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save rephrased content.' });
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

            {/* CV Preview Container - uses remaining height after navbar */}
            <div className="h-[calc(100vh-64px)] bg-gray-100 dark:bg-gray-900 relative flex flex-col">
                {/* Top Header Bar - minimal */}
                <div className="flex-shrink-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-4 py-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Link href={route('cv-infos.index')} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
                                <ArrowLeft className="h-4 w-4" />
                                <span className="text-sm font-medium">Retour</span>
                            </Link>
                            <span className="text-gray-300">|</span>
                            <span className="text-sm font-semibold text-gray-800 dark:text-white">{selectedCvModel.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Save Status */}
                            {saveStatus === 'saving' && (
                                <div className="flex items-center gap-1 text-xs text-blue-600">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span>Saving...</span>
                                </div>
                            )}
                            {saveStatus === 'saved' && isEditable && (
                                <div className="flex items-center gap-1 text-xs text-emerald-600">
                                    <Check className="w-3 h-3" />
                                    <span>Saved</span>
                                </div>
                            )}
                            {/* Tokens */}
                            <div className="flex items-center gap-1 text-xs">
                                <Coins className={`w-3 h-3 ${canAccessFeatures ? "text-emerald-500" : "text-red-500"}`} />
                                <span className={canAccessFeatures ? "text-emerald-600" : "text-red-600"}>{walletBalance}</span>
                            </div>
                            {/* Toggle Controls */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowControls(!showControls)}
                                className="h-8"
                            >
                                <Settings2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* CV Preview - Flex container for remaining height */}
                <div className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-hidden">
                    <div className="relative w-full h-full max-w-[210mm] bg-white rounded-lg shadow-2xl overflow-auto">
                        <CVPreview
                            ref={cvPreviewRef}
                            key={`${i18n.language}-${isEditable}`}
                            cvModelId={selectedCvModel?.id}
                            locale={i18n.language}
                            editable={isEditable}
                            onFieldChange={handleFieldChange}
                            onFieldFocus={handleFieldFocus}
                        />
                    </div>
                </div>

                {/* Floating Controls - Right Side */}
                <AnimatePresence>
                    {showControls && (
                        <motion.div
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            className="fixed right-4 top-1/2 -translate-y-1/2 z-50"
                        >
                            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 w-72 space-y-4">
                                {/* Color Picker */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Couleur</label>
                                    <div className="flex gap-2">
                                        {/* @ts-ignore - ColorPicker types */}
                                        <ColorPicker defaultColor={currentColor} onColorSaved={handleColorSaved} />
                                        {hasCustomColor && (
                                            <Button onClick={handleColorReset} variant="outline" size="sm" className="h-9">
                                                <RotateCcw className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Visual Edit Toggle */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Édition</label>
                                    <Button
                                        variant={isEditable ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setIsEditable(!isEditable)}
                                        className="w-full"
                                    >
                                        <Palette className="w-4 h-4 mr-2" />
                                        {isEditable ? "Désactiver l'édition" : "Édition visuelle"}
                                    </Button>
                                </div>

                                {/* AI Assistant (when editing) */}
                                {isEditable && focusedField && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles className="w-4 h-4 text-purple-600" />
                                            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">IA</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2 truncate">{focusedField.value.substring(0, 40)}...</p>
                                        <AIRephraseButton text={focusedField.value} onRephrased={handleAiRephrase} className="w-full" />
                                    </motion.div>
                                )}

                                {/* Tokens Warning */}
                                {!canAccessFeatures && !hasDownloaded && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                                        <div className="flex items-center gap-2 text-red-600 text-xs">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>Jetons insuffisants</span>
                                        </div>
                                        <Link href={route('payment.index')} className="block mt-2">
                                            <Button size="sm" variant="outline" className="w-full text-red-600 border-red-200">
                                                <Coins className="w-4 h-4 mr-2" />
                                                Recharger
                                            </Button>
                                        </Link>
                                    </div>
                                )}

                                {/* Download Button - WeasyPrint only */}
                                <Button
                                    onClick={handleDownload}
                                    disabled={isDownloading || (!canAccessFeatures && !hasDownloaded)}
                                    className="w-full bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white shadow-lg"
                                >
                                    {isDownloading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Génération...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4 mr-2" />
                                            Télécharger PDF
                                        </>
                                    )}
                                </Button>

                                {/* Quick Links */}
                                <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
                                    <Link href={route('userCvModels.index')} className="block">
                                        <Button variant="ghost" size="sm" className="w-full justify-start text-gray-600 hover:text-gray-900">
                                            Changer de modèle
                                        </Button>
                                    </Link>
                                    <Link href={route('cv-infos.index')} className="block">
                                        <Button variant="ghost" size="sm" className="w-full justify-start text-gray-600 hover:text-gray-900">
                                            Modifier les informations
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AuthenticatedLayout>
    );
}
