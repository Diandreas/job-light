import React, { useState, useEffect } from 'react';
import NotchPay from 'notchpay.js';
import { motion, AnimatePresence } from 'framer-motion';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Head, Link } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";
import { ArrowLeft, Printer, Wallet, Eye, Star, Download } from 'lucide-react';
import { useToast } from "@/Components/ui/use-toast";
import { Progress } from "@/Components/ui/progress";
import axios from 'axios';

const notchpay = NotchPay(import.meta.env.VITE_NOTCHPAY_PUBLIC_KEY);

const InfoCard = ({ icon: Icon, title, value, bgColor = "bg-amber-50" }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        className={`${bgColor} p-4 rounded-lg flex items-center gap-3`}
    >
        <div className="p-2 bg-white rounded-lg">
            <Icon className="w-5 h-5 text-amber-500" />
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="font-semibold">{value}</p>
        </div>
    </motion.div>
);

export default function Show({ auth, cvInformation, selectedCvModel }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [walletBalance, setWalletBalance] = useState(auth.user.wallet_balance);
    const [hasDownloaded, setHasDownloaded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewLoaded, setPreviewLoaded] = useState(false);

    const canAccessFeatures = walletBalance >= (selectedCvModel?.price || 0);

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

    const handlePayment = async () => {
        try {
            setIsProcessing(true);
            const payment = await notchpay.payments.initializePayment({
                currency: "XAF",
                amount: selectedCvModel?.price.toString(),
                email: auth.user.email,
                phone: auth.user.phone || '',
                reference: `cv_${selectedCvModel?.id}_${auth.user.id}`,
                description: `Paiement pour le modèle CV ${selectedCvModel?.name}`,
                meta: {
                    user_id: auth.user.id,
                    model_id: selectedCvModel?.id
                }
            });

            if (payment.authorization_url) {
                window.location.href = payment.authorization_url;
            }
        } catch (error) {
            console.error('Payment error:', error);
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors du paiement",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePrint = async () => {
        if (!canAccessFeatures && !hasDownloaded) {
            return toast({
                title: "Accès restreint",
                description: "Veuillez effectuer le paiement pour accéder à cette fonctionnalité",
                variant: "destructive",
            });
        }

        if (!hasDownloaded) {
            try {
                await axios.post('/api/process-download', {
                    user_id: auth.user.id,
                    model_id: selectedCvModel?.id,
                    price: selectedCvModel?.price
                });
                setWalletBalance(prev => prev - (selectedCvModel?.price || 0));
                setHasDownloaded(true);
            } catch (error) {
                return toast({
                    title: "Erreur",
                    description: "Erreur lors du traitement",
                    variant: "destructive",
                });
            }
        }

        const printUrl = route('cv.preview', {
            id: selectedCvModel?.id,
            print: true
        });
        window.open(printUrl, '_blank');

        setTimeout(() => {
            window.location.reload();
        }, 2000);
    };


    if (!selectedCvModel) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title="CV Professionnel"/>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full p-6"
                >
                    <Card className="border-amber-100">
                        <CardContent className="p-6">
                            <div className="text-center space-y-4">
                                <Star className="w-12 h-12 text-amber-500 mx-auto" />
                                <p className="text-lg text-gray-600">
                                    Veuillez sélectionner un modèle de CV dans la section "Mes designs" avant de continuer.
                                </p>
                                <Link href={route('userCvModels.index')}>
                                    <Button className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600">
                                        Choisir un modèle
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="CV Professionnel" />
            <div className="w-full p-4 md:p-6 space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="border-amber-100">
                        <CardHeader className="border-b border-amber-100">
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                                <div className="space-y-2">
                                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-purple-500 text-transparent bg-clip-text">
                                        Exporter Mon CV
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-amber-500" />
                                        <p className="text-sm text-gray-600">
                                            Modèle sélectionné: {selectedCvModel.name}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
                                    <InfoCard
                                        icon={Wallet}
                                        title="Solde actuel"
                                        value={`${walletBalance} FCFA`}
                                    />
                                    <InfoCard
                                        icon={Star}
                                        title="Prix du modèle"
                                        value={`${selectedCvModel.price} FCFA`}
                                        bgColor="bg-purple-50"
                                    />
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-6 space-y-6">
                            <div className="flex flex-wrap gap-4">
                                <Link href={route('userCvModels.index')}>
                                    <Button variant="outline" className="group border-amber-200">
                                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                                        Retour aux modèles
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
                                                onClick={handlePayment}
                                                className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600"
                                                disabled={isProcessing}
                                            >
                                                <Wallet className="mr-2 h-4 w-4" />
                                                {isProcessing ? (
                                                    <span className="flex items-center gap-2">
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                            className="w-4 h-4 border-2 border-white rounded-full border-t-transparent"
                                                        />
                                                        Traitement...
                                                    </span>
                                                ) : (
                                                    `Payer ${selectedCvModel.price} FCFA`
                                                )}
                                            </Button>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="flex gap-2"
                                        >
                                            <Button
                                                onClick={handlePrint}
                                                className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600"
                                                disabled={isLoading}
                                            >
                                                <Printer className="mr-2 h-4 w-4" />
                                                {isLoading ? 'Impression...' : 'Imprimer'}
                                            </Button>

                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: previewLoaded ? 1 : 0, y: previewLoaded ? 0 : 20 }}
                                className="relative rounded-xl overflow-hidden border border-amber-100 bg-white shadow-lg"
                            >
                                {!previewLoaded && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-8 h-8 border-4 border-amber-500 rounded-full border-t-transparent"
                                        />
                                    </div>
                                )}
                                <iframe
                                    src={route('cv.preview', { id: selectedCvModel.id })}
                                    className="w-full h-[800px] md:h-[600px] border-0"
                                    title="Aperçu du CV"
                                    onLoad={() => setPreviewLoaded(true)}
                                />
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </AuthenticatedLayout>
    );
}
