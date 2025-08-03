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

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={t('cv_preview.title')} />

            <div className="w-full max-w-7xl mx-auto p-3 md:p-6 space-y-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="border-amber-100/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-xl">
                        <CardHeader className="border-b border-amber-100/50 dark:border-gray-800/50 p-4 md:p-6">
                            {/* Header compact avec infos essentielles */}
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg md:text-xl font-bold bg-gradient-to-r from-amber-500 to-purple-500 dark:from-amber-400 dark:to-purple-400 text-transparent bg-clip-text">
                                            {t('cv_preview.export.title')}
                                        </CardTitle>
                                        <StatusBadge
                                            hasDownloaded={hasDownloaded}
                                            canAccessFeatures={canAccessFeatures}
                                            isAndroidApp={isAndroidApp}
                                            isReady={isReady}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-purple-500 rounded-full"></div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                            {t('cv_preview.export.selected_model', { name: selectedCvModel.name })}
                                        </p>
                                        {isAndroidApp && isReady && (
                                            <div className="flex items-center gap-1 text-xs bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-500/20">
                                                <Smartphone className="w-3 h-3" />
                                                <span>Natif</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Stats compactes à droite sur desktop */}
                                <div className="flex md:flex-col gap-3 md:gap-2 md:items-end">
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
                                        <div className="flex items-center gap-1">
                                            <Coins className={`w-3 h-3 ${canAccessFeatures ? "text-emerald-500" : "text-red-500"}`} />
                                            <span className={`text-sm font-semibold ${canAccessFeatures ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                                                {walletBalance}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Prix</p>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-amber-500" />
                                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {selectedCvModel.price}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-4 md:p-6 space-y-4">
                            {/* Alert pour tokens insuffisants */}
                            {!canAccessFeatures && !hasDownloaded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <Alert variant="destructive" className="bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-500/10 dark:to-red-500/5 border-red-200 dark:border-red-500/20">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="font-medium">
                                            {t('cv_preview.wallet.insufficient_tokens')}
                                        </AlertDescription>
                                    </Alert>
                                </motion.div>
                            )}

                            {/* Barre d'actions compacte */}
                            <div className="flex flex-wrap items-center gap-2">
                                <Link href={route('userCvModels.index')}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="group border-amber-200/50 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-amber-50 dark:hover:bg-gray-700 transition-all"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
                                        <span className="hidden sm:inline">{t('cv_preview.export.back_to_models')}</span>
                                        <span className="sm:hidden">Retour</span>
                                    </Button>
                                </Link>

                                {selectedCvModel && (
                                    <div className="flex items-center gap-2">
                                        <ColorPicker
                                            defaultColor={currentColor}
                                            onColorSaved={handleColorSaved}
                                        />

                                        {hasCustomColor && (
                                            <Button
                                                onClick={handleColorReset}
                                                variant="outline"
                                                size="sm"
                                                className="group border-gray-200/50 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                                                title="Réinitialiser la couleur par défaut"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
                                                <span className="sr-only">Réinitialiser couleur</span>
                                            </Button>
                                        )}
                                    </div>
                                )}

                                <div className="flex-1"></div>

                                <AnimatePresence mode="wait">
                                    {!hasDownloaded && !canAccessFeatures ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="flex gap-2"
                                        >
                                            <Button
                                                onClick={() => window.location.href = route('payment.index')}
                                                size="sm"
                                                className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 dark:from-amber-400 dark:to-purple-400 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                                                disabled={isProcessing}
                                            >
                                                <Coins className="mr-1.5 h-3.5 w-3.5" />
                                                <span className="hidden sm:inline">{t('cv_preview.wallet.recharge_tokens')}</span>
                                                <span className="sm:hidden">Recharger</span>
                                                <ArrowUpRight className="ml-1.5 h-3 w-3" />
                                            </Button>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="flex gap-2"
                                        >
                                            {!isDownloadAllowed ? (
                                                <Button
                                                    onClick={handlePrint}
                                                    size="sm"
                                                    className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 dark:from-amber-400 dark:to-purple-400 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                                                    disabled={isLoading}
                                                >
                                                    <Printer className="mr-1.5 h-3.5 w-3.5" />
                                                    <span className="hidden sm:inline">
                                                        {isLoading ? t('cv_preview.export.printing') : t('cv_preview.export.print')}
                                                    </span>
                                                    <span className="sm:hidden">
                                                        {isLoading ? 'Impression...' : 'Imprimer'}
                                                    </span>
                                                    {isAndroidApp && isReady && (
                                                        <Smartphone className="ml-1 h-2.5 w-2.5 text-green-300" />
                                                    )}
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={handleDownload}
                                                    size="sm"
                                                    className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 dark:from-amber-400 dark:to-purple-400 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                                                    disabled={isDownloading}
                                                >
                                                    <Download className="mr-1.5 h-3.5 w-3.5" />
                                                    <span className="hidden sm:inline">
                                                        {isDownloading ? t('cv_preview.export.downloading') : t('cv_preview.export.download')}
                                                    </span>
                                                    <span className="sm:hidden">
                                                        {isDownloading ? 'Télécharge...' : 'PDF'}
                                                    </span>
                                                    {isAndroidApp && isReady && (
                                                        <Smartphone className="ml-1 h-2.5 w-2.5 text-green-300" />
                                                    )}
                                                </Button>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Prévisualisation avec loader amélioré */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative rounded-xl overflow-hidden border border-amber-100/50 dark:border-gray-800/50 bg-white dark:bg-gray-900 shadow-2xl"
                            >
                                <AnimatePresence>
                                    {!previewLoaded && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-white via-amber-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 z-10 backdrop-blur-sm"
                                        >
                                            <motion.div
                                                animate={{
                                                    rotate: 360,
                                                    scale: [1, 1.1, 1]
                                                }}
                                                transition={{
                                                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                                                    scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                                                }}
                                                className="w-8 h-8 md:w-10 md:h-10 rounded-full border-3 border-gradient-to-r from-amber-500 to-purple-500 border-t-transparent mb-3"
                                                style={{
                                                    background: 'conic-gradient(from 0deg, #f59e0b, #a855f7, #f59e0b)',
                                                    WebkitMask: 'radial-gradient(circle, transparent 60%, black 60%)',
                                                    mask: 'radial-gradient(circle, transparent 60%, black 60%)'
                                                }}
                                            />
                                            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                                Chargement de la prévisualisation...
                                            </p>
                                            <div className="w-32 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-3 overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-amber-500 to-purple-500"
                                                    animate={{ x: ['-100%', '100%'] }}
                                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                                />
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
                                    className="w-full h-[500px] sm:h-[650px] md:h-[800px] lg:h-[900px] xl:h-[1000px] border-0"
                                    title={t('cv_preview.preview.title')}
                                    onLoad={() => {
                                        setTimeout(() => setPreviewLoaded(true), 300);
                                    }}
                                    key={`${i18n.language}-${previewKey}`}
                                />
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </AuthenticatedLayout>
    );
}
