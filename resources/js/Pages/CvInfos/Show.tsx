import React, { useState, useEffect } from 'react';
import NotchPay from 'notchpay.js';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Head, Link } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";
import { ArrowLeft, Printer, Wallet } from 'lucide-react';
import { useToast } from "@/Components/ui/use-toast";
import axios from 'axios';

const notchpay = NotchPay(import.meta.env.VITE_NOTCHPAY_PUBLIC_KEY);

interface Props {
    auth: {
        user: {
            id: number;
            wallet_balance: number;
            email: string;
            phone?: string;
        };
    };
    cvInformation: any;
    selectedCvModel: {
        id: number;
        viewPath: string;
        price: number;
        name: string;
    } | null;
}

export default function Show({ auth, cvInformation, selectedCvModel }: Props) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [walletBalance, setWalletBalance] = useState(auth.user.wallet_balance);
    const [hasDownloaded, setHasDownloaded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

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
        let authenticatedLayout = <><AuthenticatedLayout
            //@ts-ignore
            user={auth.user}>
            <Head title="CV Professionnel"/>
            <div className="w-full p-6">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-center text-gray-600">
                            Veuillez sélectionner un modèle de CV dans la section "Mes designs" avant de continuer.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout></>;

    }

    return (
        <AuthenticatedLayout
            //@ts-ignore
            user={auth.user}>
            <Head title="CV Professionnel" />
            <div className="w-full p-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold">Exporter Mon CV</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Modèle sélectionné: {selectedCvModel.name} - {selectedCvModel.price} FCFA
                            </p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                            <Wallet className="w-4 h-4 text-primary" />
                            <span className="font-medium">{walletBalance} FCFA</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <Link href={route('userCvModels.index')}>
                                    <Button variant="outline" className="flex items-center gap-2">
                                        <ArrowLeft className="w-4 h-4" />
                                        Retour aux CVs
                                    </Button>
                                </Link>

                                {!hasDownloaded && !canAccessFeatures ? (
                                    <Button
                                        onClick={handlePayment}
                                        className="bg-primary w-full md:w-auto"
                                        disabled={isProcessing}
                                    >
                                        <Wallet className="mr-2 h-4 w-4" />
                                        {isProcessing ? 'Traitement...' : `Payer ${selectedCvModel.price} FCFA`}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handlePrint}
                                        className="bg-primary w-full md:w-auto"
                                        disabled={isLoading}
                                    >
                                        <Printer className="mr-2 h-4 w-4" />
                                        {isLoading ? 'En cours...' : 'Imprimer'}
                                    </Button>
                                )}
                            </div>

                            <div className="w-full border rounded-lg bg-white shadow-sm overflow-auto">
                                <iframe
                                    src={route('cv.preview', { id: selectedCvModel.id })}
                                    className="w-full h-[800px] md:h-[600px] border-0 rounded-lg"
                                    title="CV Preview"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
