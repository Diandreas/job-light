import React, { useState, useEffect } from 'react';
import NotchPay from 'notchpay.js';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Head, Link, router } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";
import { ArrowLeft, Download, Eye, FileText, Printer, Wallet } from 'lucide-react';
import { useToast } from "@/Components/ui/use-toast";
import axios from 'axios';

interface CvModelProps {
    id: number;
    viewPath: string;
    price: number;
    name: string;
}

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
    selectedCvModel: CvModelProps | null;
}

const notchpay = NotchPay('pk_test.27HM7WgXYb5PzM5eNTb7yXyi7QwXdqb2ZKEd28im86wM4YRIOyKQaBD3tKKsAD3jU8HKoFavsDFQ9l6wdLsNbRT33szW9NbkdFDLSdpbFyMuFv2TUZSdsgCcMrJJ5');

export default function Show({ auth, cvInformation, selectedCvModel }: Props) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [walletBalance, setWalletBalance] = useState(auth.user.wallet_balance);
    const [hasDownloaded, setHasDownloaded] = useState(false);
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

    const canDownload = walletBalance >= (selectedCvModel?.price || 0) && !hasDownloaded;

    useEffect(() => {
        const checkDownloadStatus = async () => {
            try {
                const response = await axios.get(`/api/check-download-status/${selectedCvModel?.id}`);
                setHasDownloaded(response.data.hasDownloaded);
            } catch (error) {
                console.error('Error checking download status:', error);
            }
        };

        if (selectedCvModel?.id) {
            checkDownloadStatus();
        }
    }, [selectedCvModel?.id]);

    if (!selectedCvModel) {
        return (
            <AuthenticatedLayout
                user={auth.user}
                header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">Mon CV Professionnel</h2>}
            >
                <Head title="CV Professionnel" />
                <div className="w-full p-6">
                    <Card>
                        <CardContent className="p-6">
                            <p className="text-center text-gray-600">
                                Veuillez sélectionner un modèle de CV dans la section "Mes designs" avant de continuer.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </AuthenticatedLayout>
        );
    }

    const handlePayment = async () => {
        try {
            setIsPaymentProcessing(true);
            const payment = await notchpay.payments.initializePayment({
                currency: "XAF",
                amount: selectedCvModel.price.toString(),
                email: auth.user.email,
                phone: auth.user.phone || '',
                reference: `cv_${selectedCvModel.id}_${auth.user.id}_${Date.now()}`,
                description: `Paiement pour le modèle CV ${selectedCvModel.name}`,
                callback_url: `${window.location.origin}/api/notchpay/callback` // Ajout
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
        }
    };

    const handlePreview = () => {
        const previewUrl = route('cv.preview', { id: selectedCvModel.id });
        window.open(previewUrl, '_blank');
    };

    const handlePrint = () => {
        const printUrl = route('cv.preview', { id: selectedCvModel.id });
        const printWindow = window.open(printUrl, '_blank');
        printWindow?.addEventListener('load', () => {
            printWindow.print();
        });
    };

    const handleDownload = async () => {
        try {
            setIsLoading(true);
            await axios.post('/api/process-download', {
                user_id: auth.user.id,
                model_id: selectedCvModel.id,
                price: selectedCvModel.price
            });

            const downloadUrl = route('cv.download', { id: selectedCvModel.id });
            window.location.href = downloadUrl;

            setWalletBalance(prev => prev - selectedCvModel.price);
            setHasDownloaded(true);

            toast({
                title: "Succès",
                description: "Téléchargement effectué avec succès",
            });
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.response?.data?.message || "Erreur lors du téléchargement",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">Mon CV Professionnel</h2>}
        >
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
                                <div className="flex items-center gap-4">
                                    <Link href={route('userCvModels.index')}>
                                        <Button variant="outline" className="flex items-center gap-2">
                                            <ArrowLeft className="w-4 h-4" />
                                            Retour aux CVs
                                        </Button>
                                    </Link>
                                </div>
                                {canDownload ? (
                                    <Button
                                        onClick={handleDownload}
                                        className="bg-primary w-full md:w-auto"
                                        disabled={isLoading}
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        {isLoading ? 'Téléchargement...' : 'Télécharger PDF'}
                                    </Button>
                                ) : !hasDownloaded && (
                                    <Button
                                        onClick={handlePayment}
                                        className="bg-primary w-full md:w-auto"
                                        disabled={isPaymentProcessing}
                                    >
                                        {isPaymentProcessing ? 'Traitement...' : `Payer ${selectedCvModel.price} FCFA`}
                                    </Button>
                                )}
                                <Button onClick={handlePreview} variant="outline" className="w-full md:w-auto">
                                    <Eye className="mr-2 h-4 w-4" />
                                    Prévisualiser
                                </Button>
                                <Button onClick={handlePrint} variant="outline" className="w-full md:w-auto">
                                    <Printer className="mr-2 h-4 w-4" />
                                    Imprimer
                                </Button>
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
