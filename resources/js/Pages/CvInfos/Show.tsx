import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Head, Link } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";
import {
    ArrowLeft, Printer, Wallet, Eye, Star,
    Download, Coins, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { useToast } from "@/Components/ui/use-toast";
import { Progress } from "@/Components/ui/progress";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import axios from 'axios';

// Liste des modèles sans bouton de téléchargement
// const MODELS_WITHOUT_DOWNLOAD = [10, 14, 12, 19, 18];
const MODELS_WITHOUT_DOWNLOAD = [10, 12, 13, 17, 14, 19, 22, 4, 8, 21, 25, 26];


const InfoCard = ({ icon: Icon, title, value, type = "default" }) => {
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${styles[type]} p-4 rounded-xl border border-transparent dark:border-gray-800 backdrop-blur-sm flex items-center gap-3 transition-all`}
        >
            <div className="p-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                <Icon className={`w-5 h-5 ${iconStyles[type]}`} />
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{value}</p>
            </div>
        </motion.div>
    );
};

const NoModelSelected = ({ user }) => {
    const { t } = useTranslation();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full p-6"
        >
            <Card className="border-amber-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                            <Star className="w-8 h-8 text-amber-500 dark:text-amber-400" />
                        </div>
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            {t('cv_preview.no_model.message')}
                        </p>
                        <Link href={route('userCvModels.index')}>
                            <Button className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 dark:from-amber-400 dark:to-purple-400">
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
    const iframeRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [walletBalance, setWalletBalance] = useState(auth.user.wallet_balance);
    const [hasDownloaded, setHasDownloaded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewLoaded, setPreviewLoaded] = useState(false);

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
    }, [i18n.language, selectedCvModel?.id]);

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
            if (!hasDownloaded) {
                await axios.post('/api/process-download', {
                    user_id: auth.user.id,
                    model_id: selectedCvModel?.id,
                    price: selectedCvModel?.price
                });
                setWalletBalance(prev => prev - (selectedCvModel?.price || 0));
                setHasDownloaded(true);
            }

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
                title: t('cv_preview.export.download_success'),
                description: t('cv_preview.export.download_success_description'),
                //@ts-ignore
                variant: 'success'
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

    const handlePrint = async () => {
        if (!canAccessFeatures && !hasDownloaded) {
            return toast({
                title: t('cv_preview.wallet.insufficient_access.title'),
                description: t('cv_preview.wallet.insufficient_tokens'),
                variant: 'destructive'
            });
        }

        setIsLoading(true);

        // Débiter les jetons avant l'impression si ce n'est pas déjà fait
        if (!hasDownloaded) {
            try {
                await axios.post('/api/process-download', {
                    user_id: auth.user.id,
                    model_id: selectedCvModel?.id,
                    price: selectedCvModel?.price
                });
                setWalletBalance(prev => prev - (selectedCvModel?.price || 0));
                setHasDownloaded(true);
                
                toast({
                    //@ts-ignore
                    variant: 'success',
                    description: t('cv_preview.export.processing')
                });
            } catch (error) {
                setIsLoading(false);
                return toast({
                    title: t('common.error'),
                    description: t('cv_preview.export.payment_error'),
                    variant: 'destructive'
                });
            }
        }
        
        // Créer une iframe pour l'impression
        const printUrl = route('cv.preview', {
            id: selectedCvModel?.id,
            locale: i18n.language
        });
        
        // Créer une iframe temporaire
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = printUrl;
        
        // Fonction qui sera appelée lorsque l'iframe aura chargé
        iframe.onload = () => {
            // Petit délai pour s'assurer que le contenu est bien chargé
            setTimeout(() => {
                try {
                    // Accès au contenu de l'iframe et impression
                    iframe.contentWindow.print();
                    
                    // Attendre un peu pour nettoyer après que l'utilisateur ait géré la boîte de dialogue d'impression
                    setTimeout(() => {
                        document.body.removeChild(iframe);
                        setIsLoading(false);
                    }, 1000);
                } catch (error) {
                    console.error('Erreur d\'impression:', error);
                    document.body.removeChild(iframe);
                    setIsLoading(false);
                    
                    toast({
                        title: t('common.error'),
                        description: t('cv_preview.export.print_error'),
                        variant: 'destructive'
                    });
                }
            }, 500);
        };
        
        // Ajouter l'iframe au document
        document.body.appendChild(iframe);
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
            <div className="w-full p-4 md:p-6 space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="border-amber-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                        <CardHeader className="border-b border-amber-100 dark:border-gray-800">
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                                <div className="space-y-2">
                                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-purple-500 dark:from-amber-400 dark:to-purple-400 text-transparent bg-clip-text">
                                        {t('cv_preview.export.title')}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            {t('cv_preview.export.selected_model', { name: selectedCvModel.name })}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
                                    <InfoCard
                                        icon={Coins}
                                        title={t('cv_preview.wallet.current_balance')}
                                        value={walletBalance}
                                        type={canAccessFeatures ? "success" : "warning"}
                                    />
                                    <InfoCard
                                        icon={Star}
                                        title={t('cv_preview.wallet.model_price')}
                                        value={selectedCvModel.price}
                                    />
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-6 space-y-6">
                            {!canAccessFeatures && !hasDownloaded && (
                                <Alert variant="destructive" className="bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        {t('cv_preview.wallet.insufficient_tokens')}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="flex flex-wrap gap-4">
                                <Link href={route('userCvModels.index')}>
                                    <Button
                                        variant="outline"
                                        className="group border-amber-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-gray-100"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                                        {t('cv_preview.export.back_to_models')}
                                    </Button>
                                </Link>

                                <AnimatePresence mode="wait">
                                    {!hasDownloaded && !canAccessFeatures ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                        >
                                            <Button
                                                onClick={() => window.location.href = route('payment.index')}
                                                className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 dark:from-amber-400 dark:to-purple-400"
                                                disabled={isProcessing}
                                            >
                                                <Coins className="mr-2 h-4 w-4" />
                                                {t('cv_preview.wallet.recharge_tokens')}
                                                <ArrowUpRight className="ml-2 h-4 w-4" />
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
                                                    className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 dark:from-amber-400 dark:to-purple-400"
                                                    disabled={isLoading}
                                                >
                                                    <Printer className="mr-2 h-4 w-4" />
                                                    {isLoading ? t('cv_preview.export.printing') : t('cv_preview.export.print')}
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={handleDownload}
                                                    className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 dark:from-amber-400 dark:to-purple-400"
                                                    disabled={isDownloading}
                                                >
                                                    <Download className="mr-2 h-4 w-4" />
                                                    {isDownloading ? t('cv_preview.export.downloading') : t('cv_preview.export.download')}
                                                </Button>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: previewLoaded ? 1 : 0, y: previewLoaded ? 0 : 20 }}
                                className="relative rounded-xl overflow-hidden border border-amber-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg"
                            >
                                {!previewLoaded && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-8 h-8 border-4 border-amber-500 dark:border-amber-400 rounded-full border-t-transparent"
                                        />
                                    </div>
                                )}
                                <iframe
                                    ref={iframeRef}
                                    src={route('cv.preview', {
                                        id: selectedCvModel?.id,
                                        locale: i18n.language
                                    })}
                                    className="w-full h-[900px] md:h-[1000px] lg:h-[1200px] border-0 mx-auto"
                                    style={{ maxWidth: "100%", display: "block" }}
                                    title={t('cv_preview.preview.title')}
                                    onLoad={() => setPreviewLoaded(true)}
                                    key={i18n.language}
                                />
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </AuthenticatedLayout>
    );
}
