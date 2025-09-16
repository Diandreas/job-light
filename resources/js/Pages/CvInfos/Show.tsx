import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Head, Link } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";
import {
    ArrowLeft, Printer, Wallet, Eye, Star,
    Download, Coins, AlertCircle, ArrowUpRight,
    Smartphone, Monitor, Palette, RotateCcw
} from 'lucide-react';
import { useToast } from "@/Components/ui/use-toast";
import { Progress } from "@/Components/ui/progress";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { useMedian } from '@/Hooks/useMedian';
import ColorPicker from '@/Components/ColorPicker';
import axios from 'axios';

// Liste des modèles sans bouton de téléchargement
const MODELS_WITHOUT_DOWNLOAD = [10, 12, 13, 17, 14, 19, 22, 4, 8, 21, 25, 26];

const InfoCard = ({ icon: Icon, title, value, type = "default", compact = false }) => {
    const styles = {
        default: "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-500/10 dark:to-amber-500/5",
        warning: "bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-500/10 dark:to-red-500/5",
        success: "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-500/10 dark:to-emerald-500/5"
    };

    const iconStyles = {
        default: "text-amber-500 dark:text-amber-400",
        warning: "text-red-500 dark:text-red-400",
        success: "text-emerald-500 dark:text-emerald-400"
    };

    return (
        <motion.div
            whileHover={{ scale: compact ? 1.01 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${styles[type]} ${compact ? 'p-2.5' : 'p-3'} rounded-lg md:rounded-xl border border-transparent dark:border-gray-800/50 backdrop-blur-sm flex items-center gap-2.5 transition-all shadow-sm hover:shadow-md`}
        >
            <div className={`${compact ? 'p-1.5' : 'p-2'} bg-white/80 dark:bg-gray-900/80 rounded-lg border border-gray-100/50 dark:border-gray-800/50 shadow-sm`}>
                <Icon className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${iconStyles[type]}`} />
            </div>
            <div className="min-w-0 flex-1">
                <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-500 dark:text-gray-400 font-medium`}>
                    {title}
                </p>
                <p className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-gray-900 dark:text-gray-100`}>
                    {value}
                </p>
            </div>
        </motion.div>
    );
};

const StatusBadge = ({ hasDownloaded, canAccessFeatures, isAndroidApp, isReady }) => {
    if (hasDownloaded) {
        return (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-medium border border-emerald-200 dark:border-emerald-500/20">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                Accès débloqué
            </div>
        );
    }

    if (canAccessFeatures) {
        return (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-medium border border-amber-200 dark:border-amber-500/20">
                <Star className="w-3 h-3" />
                Prêt à exporter
            </div>
        );
    }

    return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-xs font-medium border border-red-200 dark:border-red-500/20">
            <AlertCircle className="w-3 h-3" />
            Tokens insuffisants
        </div>
    );
};

const NoModelSelected = ({ user }) => {
    const { t } = useTranslation();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full p-4 md:p-6"
        >
            <Card className="border-amber-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm shadow-xl">
                <CardContent className="p-6 md:p-8">
                    <div className="text-center space-y-4">
                        <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-50 to-purple-50 dark:from-amber-500/10 dark:to-purple-500/10 flex items-center justify-center shadow-lg"
                        >
                            <Star className="w-8 h-8 text-amber-500 dark:text-amber-400" />
                        </motion.div>
                        <div className="space-y-2">
                            <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                                {t('cv_preview.no_model.message')}
                            </p>
                        </div>
                        <Link href={route('userCvModels.index')}>
                            <Button className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 dark:from-amber-400 dark:to-purple-400 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                                <Star className="w-4 h-4 mr-2" />
                                {t('cv_preview.no_model.action')}
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default function Show({ auth, cvInformation, selectedCvModel }) {
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const { isReady, isAndroidApp, downloadFile, printDocument, createDirectDownloadUrl, isUrlCompatible } = useMedian();
    const iframeRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [walletBalance, setWalletBalance] = useState(auth.user.wallet_balance);
    const [hasDownloaded, setHasDownloaded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewLoaded, setPreviewLoaded] = useState(false);
    const [previewKey, setPreviewKey] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [currentColor, setCurrentColor] = useState(cvInformation?.primary_color || '#3498db');
    const [hasCustomColor, setHasCustomColor] = useState(Boolean(cvInformation?.primary_color));

    // Détecter si on est sur mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const canAccessFeatures = walletBalance >= (selectedCvModel?.price || 0);
    const isDownloadAllowed = selectedCvModel && !MODELS_WITHOUT_DOWNLOAD.includes(selectedCvModel.id);

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

    useEffect(() => {
        if (iframeRef.current && selectedCvModel?.id) {
            setPreviewLoaded(false);
            const previewUrl = route('cv.preview', {
                id: selectedCvModel.id,
                locale: i18n.language
            });
            iframeRef.current.src = previewUrl;
        }
    }, [i18n.language, selectedCvModel?.id, previewKey]);

    const handleColorSaved = (newColor) => {
        setCurrentColor(newColor);
        setHasCustomColor(true);
        setPreviewKey(prev => prev + 1);
        setPreviewLoaded(false);

        toast({
            title: '🎨 Couleur appliquée',
            description: isMobile
                ? 'Prévisualisation mise à jour'
                : 'La prévisualisation se met à jour avec votre nouvelle couleur',
            variant: 'default'
        });
    };

    const handleColorReset = async () => {
        try {
            const response = await axios.post('/api/cv-color/reset');

            if (response.data.status === 'success') {
                setCurrentColor('#3498db');
                setHasCustomColor(false);
                setPreviewKey(prev => prev + 1);
                setPreviewLoaded(false);

                toast({
                    title: '🔄 Couleur réinitialisée',
                    description: 'La couleur par défaut a été restaurée',
                    variant: 'default'
                });
            }
        } catch (error) {
            console.error('Error resetting color:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de réinitialiser la couleur',
                variant: 'destructive'
            });
        }
    };

    const handleDownload = async () => {
        if (!isDownloadAllowed) {
            return toast({
                title: t('common.error'),
                description: t('cv_preview.export.download_not_allowed'),
                variant: 'destructive'
            });
        }

        if (!canAccessFeatures && !hasDownloaded) {
            return toast({
                title: t('cv_preview.wallet.insufficient_access.title'),
                description: t('cv_preview.wallet.insufficient_tokens'),
                variant: 'destructive'
            });
        }

        setIsDownloading(true);

        try {
            // Débiter les jetons si ce n'est pas déjà fait
            if (!hasDownloaded) {
                await axios.post('/api/process-download', {
                    user_id: auth.user.id,
                    model_id: selectedCvModel?.id,
                    price: selectedCvModel?.price
                });
                setWalletBalance(prev => prev - (selectedCvModel?.price || 0));
                setHasDownloaded(true);
            }

            // Si on est dans l'app Android native avec Median
            if (isAndroidApp && isReady) {
                console.log('🚀 Téléchargement CV natif Android');

                const downloadUrl = createDirectDownloadUrl(
                    route('cv.download.direct', selectedCvModel.id),
                    {
                        locale: i18n.language,
                        direct: true
                    }
                );

                if (!isUrlCompatible(downloadUrl)) {
                    throw new Error('URL non compatible avec Median');
                }

                const result = await downloadFile(downloadUrl, {
                    filename: `CV-${auth.user.name}.pdf`,
                    open: true,
                    forceDownload: true
                });

                if (result.success) {
                    toast({
                        title: '📱 CV téléchargé',
                        description: 'Le CV a été téléchargé et ouvert automatiquement',
                        variant: 'default'
                    });
                } else {
                    throw new Error('Échec du téléchargement natif');
                }
            } else {
                console.log('🌐 Utilisation du téléchargement web');
                await handleDownloadWeb();
            }
        } catch (error) {
            console.error('❌ Erreur téléchargement CV:', error);

            if (isAndroidApp) {
                console.log('🔄 Tentative de fallback vers téléchargement web');
                try {
                    await handleDownloadWeb();
                } catch (fallbackError) {
                    console.error('❌ Erreur fallback:', fallbackError);
                    toast({
                        title: t('common.error'),
                        description: t('cv_preview.export.download_error'),
                        variant: 'destructive'
                    });
                }
            } else {
                toast({
                    title: t('common.error'),
                    description: t('cv_preview.export.download_error'),
                    variant: 'destructive'
                });
            }
        } finally {
            setIsDownloading(false);
        }
    };

    const handlePrint = async () => {
        if (!canAccessFeatures && !hasDownloaded) {
            return toast({
                title: t('cv_preview.wallet.insufficient_access.title'),
                description: t('cv_preview.wallet.insufficient_tokens'),
                variant: 'destructive'
            });
        }

        setIsLoading(true);

        try {
            if (!hasDownloaded) {
                await axios.post('/api/process-download', {
                    user_id: auth.user.id,
                    model_id: selectedCvModel?.id,
                    price: selectedCvModel?.price
                });
                setWalletBalance(prev => prev - (selectedCvModel?.price || 0));
                setHasDownloaded(true);

                toast({
                    variant: 'default',
                    description: t('cv_preview.export.processing')
                });
            }

            if (isAndroidApp && isReady) {
                console.log('🖨️ Impression CV native Android');

                const printUrl = createDirectDownloadUrl(
                    route('cv.preview.print', selectedCvModel.id),
                    {
                        locale: i18n.language,
                        print_mode: 'mobile',
                        show_save_button: true,
                        auto_print: false
                    }
                );

                const result = await printDocument(printUrl, {
                    useShare: true,
                    openInBrowser: false
                });

                if (result.success) {
                    toast({
                        title: '📱 Impression CV initiée',
                        description: 'Options de partage/impression Android ouvertes',
                        variant: 'default'
                    });
                } else {
                    throw new Error('Échec de l\'impression native');
                }
            } else {
                console.log('🌐 Utilisation de l\'impression web');
                await handlePrintWeb();
            }
        } catch (error) {
            console.error('❌ Erreur impression CV:', error);

            if (isAndroidApp) {
                console.log('🔄 Tentative de fallback vers impression web');
                try {
                    await handlePrintWeb();
                } catch (fallbackError) {
                    console.error('❌ Erreur fallback impression:', fallbackError);
                    toast({
                        title: t('common.error'),
                        description: t('cv_preview.export.print_error'),
                        variant: 'destructive'
                    });
                }
            } else {
                toast({
                    title: t('common.error'),
                    description: t('cv_preview.export.print_error'),
                    variant: 'destructive'
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Méthode fallback web classique pour téléchargement
    const handleDownloadWeb = async () => {
        console.log('📄 Téléchargement web classique');

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
            title: '🌐 Téléchargement web réussi',
            description: t('cv_preview.export.download_success_description'),
            variant: 'default'
        });
    };

    // Méthode fallback web classique pour impression
    const handlePrintWeb = async () => {
        console.log('🖨️ Impression web classique');

        const printUrl = route('cv.preview', {
            id: selectedCvModel?.id,
            locale: i18n.language,
            print_mode: 'pdf',
            show_save_button: 'true',
            auto_print: 'false'
        });

        const printWindow = window.open(printUrl, '_blank');
        if (printWindow) {
            printWindow.onload = () => {
                setTimeout(() => printWindow.print(), 500);
            };

            toast({
                title: '🌐 Impression web initiée',
                description: 'Une nouvelle fenêtre va s\'ouvrir pour l\'impression avec option de sauvegarde PDF',
                variant: 'default'
            });
        }
    };

    if (!selectedCvModel) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title={t('cv_preview.title')} />
                <NoModelSelected user={auth.user} />
            </AuthenticatedLayout>
        );
    }

    // @ts-ignore
    return (
        <AuthenticatedLayout user={auth.user} hideSidebar={true}>
            <Head title={t('cv_preview.title')} />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Header ultra compact */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Link href={route('cv-infos.index')} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
                                <ArrowLeft className="h-4 w-4" />
                                <span className="font-semibold text-sm">{t('cv_preview.navigation.back_to_edit')}</span>
                            </Link>
                            <div className="w-px h-4 bg-gray-300"></div>
                            <h1 className="font-semibold text-gray-800 dark:text-white text-sm">
                                {t('cv_preview.title')}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <StatusBadge
                                hasDownloaded={hasDownloaded}
                                canAccessFeatures={canAccessFeatures}
                                isAndroidApp={isAndroidApp}
                                isReady={isReady}
                            />
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Coins className={`w-3 h-3 ${canAccessFeatures ? "text-emerald-500" : "text-red-500"}`} />
                                <span className={canAccessFeatures ? "text-emerald-600" : "text-red-600"}>
                                    {walletBalance}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Layout deux colonnes ultra moderne */}
                <div className="flex h-[calc(100vh-57px)]">
                    {/* Colonne gauche - Aperçu CV plein écran */}
                    <div className="w-2/3 bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-6">
                        <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
                            <div className="relative">
                                <AnimatePresence>
                                    {!previewLoaded && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10"
                                        >
                                            <div className="text-center">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                    className="w-8 h-8 mx-auto mb-2 border-2 border-amber-500 border-t-transparent rounded-full"
                                                />
                                                <p className="text-sm text-gray-600">Chargement...</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <iframe
                                    ref={iframeRef}
                                    src={route('cv.preview', {
                                        id: selectedCvModel?.id,
                                        locale: i18n.language
                                    })}
                                    className="w-full h-[calc(100vh-120px)] border-0"
                                    title={t('cv_preview.preview.title')}
                                    onLoad={() => {
                                        setTimeout(() => setPreviewLoaded(true), 300);
                                    }}
                                    key={`${i18n.language}-${previewKey}`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Colonne droite - Panneau de contrôle compact */}
                    <div className="w-1/3 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col">
                        {/* En-tête du panneau */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="font-semibold text-gray-800 dark:text-white mb-2">
                                {selectedCvModel.name}
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Star className="w-4 h-4 text-amber-500" />
                                <span>{selectedCvModel.price === 0 ? 'Gratuit' : `${selectedCvModel.price} tokens`}</span>
                            </div>
                        </div>

                        {/* Contrôles */}
                        <div className="flex-1 p-4 space-y-4">
                            {/* Alerte tokens insuffisants */}
                            {!canAccessFeatures && !hasDownloaded && (
                                <Alert variant="destructive" className="text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Tokens insuffisants pour l'export
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Personnalisation couleur */}
                            <div className="space-y-3">
                                <h3 className="font-medium text-gray-800 dark:text-white text-sm">{t('cv_preview.customization.title')}</h3>
                                <div className="flex gap-2">
                                    <ColorPicker
                                        defaultColor={currentColor}
                                        //@ts-ignore
                                        onColorSaved={handleColorSaved}
                                    />
                                    {hasCustomColor && (
                                        <Button
                                            onClick={handleColorReset}
                                            variant="outline"
                                            size="sm"
                                            title="Réinitialiser"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Actions d'export */}
                            <div className="space-y-3">
                                <h3 className="font-medium text-gray-800 dark:text-white text-sm">{t('cv_preview.export.title')}</h3>

                                {!hasDownloaded && !canAccessFeatures ? (
                                    <Button
                                        onClick={() => window.location.href = route('payment.index')}
                                        className="w-full bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white"
                                        size="sm"
                                    >
                                        <Coins className="mr-2 h-4 w-4" />
                                        {t('cv_preview.wallet.recharge')}
                                    </Button>
                                ) : (
                                    <div className="space-y-2">
                                        {isDownloadAllowed ? (
                                            <Button
                                                onClick={handleDownload}
                                                className="w-full bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white"
                                                disabled={isDownloading}
                                                size="sm"
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                {isDownloading ? 'Téléchargement...' : 'Télécharger PDF'}
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={handlePrint}
                                                className="w-full bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white"
                                                disabled={isLoading}
                                                size="sm"
                                            >
                                                <Printer className="mr-2 h-4 w-4" />
                                                {isLoading ? 'Impression...' : 'Imprimer'}
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Navigation du processus */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex gap-2">
                                <Link href={route('userCvModels.index')} className="flex-1">
                                    <Button variant="outline" className="w-full" size="sm">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        {t('cv_preview.navigation.change_model')}
                                    </Button>
                                </Link>
                                <Link href={route('cv-infos.index')} className="flex-1">
                                    <Button variant="outline" className="w-full" size="sm">
                                        <Eye className="w-4 h-4 mr-2" />
                                        {t('cv_preview.navigation.edit_cv')}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
