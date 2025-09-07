import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
// Import PayPal supprimé - Fapshi uniquement
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent } from "@/Components/ui/card";
// Import Tabs supprimé - plus d'onglets nécessaires
import { useToast } from "@/Components/ui/use-toast";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { useTranslation } from 'react-i18next';
import {
    Coins,
    Gift,
    Sparkles,
    AlertCircle,
    Smartphone,
    CreditCard,
    Loader2
} from 'lucide-react';

const TOKEN_PACKS = [
    {
        id: 'starter',
        tokens: 10,
        bonusTokens: 0,
        priceEuros: 1,
        priceFCFA: 600,
        color: 'from-amber-400 to-amber-600',
        popularityText: 'starter'
    },
    {
        id: 'plus',
        tokens: 20,
        bonusTokens: 5,
        priceEuros: 2,
        priceFCFA: 1200,
        mostPopular: true,
        color: 'from-rose-400 to-rose-600',
        popularityText: 'plus'
    },
    {
        id: 'pro',
        tokens: 50,
        bonusTokens: 10,
        priceEuros: 5,
        priceFCFA: 3000,
        color: 'from-purple-400 to-purple-600',
        popularityText: 'plus'
    },
    {
        id: 'ultimate',
        tokens: 100,
        bonusTokens: 30,
        priceEuros: 10,
        priceFCFA: 6000,

        color: 'from-blue-400 to-blue-600',
        popularityText: 'ultimate'
    },

];

const PaymentMethodsInfo = {
    mobileMoneyLogos: [
        { name: 'MTN Mobile Money', logo: '/mtn-momo.png' },
        { name: 'Orange Money', logo: '/orange-money.png' },
        { name: 'Fapshi', logo: '/fapshi-logo.svg' }
    ],
    cardLogos: [
        // { name: 'Visa', logo: '/visa.png' },
        // { name: 'Mastercard', logo: '/mastercard.png' }
    ]
};

// Composant NotchPay supprimé - Fapshi uniquement

// Fapshi Button Component (Mobile Payments)
const FapshiButton = ({ pack, onSuccess, user }) => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const { t } = useTranslation();

    const handlePayment = async () => {
        try {
            setLoading(true);

            // Utiliser toujours Fapshi
            const provider = 'fapshi';
            
            // Vérifier si le téléphone est valide pour le paiement mobile direct
            const phoneRegex = /^6[0-9]{8}$/;
            const hasValidPhone = user?.phone && phoneRegex.test(user.phone);
            
            const paymentData = {
                provider: provider,
                amount: pack.priceFCFA,
                currency: 'XAF',
                description: `Achat de ${pack.tokens + pack.bonusTokens} tokens`,
                customer_name: user?.name || 'Utilisateur',
                customer_email: user?.email || '',
                payment_type: 'web'
            };

            // Ajouter le téléphone seulement si valide
            if (hasValidPhone) {
                paymentData.customer_phone = user.phone;
            }

            const response = await fetch('/api/payments/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify(paymentData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || t('payment.errors.default'));
            }

            const result = await response.json();

            if (result.success) {
                if (result.payment_url) {
                    // Rediriger vers la page de paiement
                    window.location.href = result.payment_url;
                } else {
                    // Paiement mobile direct initié
                    toast({
                        title: t('payment.success.title'),
                        description: `Paiement initié avec Fapshi`,
                    });
                    // Vérifier le statut après quelques secondes
                    setTimeout(() => checkPaymentStatus(result.transaction_id), 3000);
                }
            } else {
                throw new Error(t('payment.errors.initialization'));
            }

        } catch (error) {
            console.error('Erreur de paiement Fapshi:', error);
            toast({
                variant: "destructive",
                title: t('payment.errors.paymentFailed'),
                description: error.message || t('payment.errors.processingError')
            });
        } finally {
            setLoading(false);
        }
    };

    const checkPaymentStatus = async (transactionId) => {
        try {
            const response = await fetch(`/api/payments/status/${transactionId}`);
            const result = await response.json();
            
            if (result.success && result.status === 'completed') {
                onSuccess(result.new_balance);
            } else if (result.status === 'pending') {
                // Réessayer après quelques secondes
                setTimeout(() => checkPaymentStatus(transactionId), 5000);
            }
        } catch (error) {
            console.error('Erreur lors de la vérification du statut:', error);
        }
    };

    return (
        <button
            onClick={handlePayment}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
        >
            {loading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t('payment.processing')}</span>
                </>
            ) : (
                <>
                    <Smartphone className="w-5 h-5" />
                    <span>Payer Mobile Money</span>
                </>
            )}
        </button>
    );
};

// Composant PayPal supprimé - Fapshi uniquement

function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

const FapshiPayment = ({ pack, onSuccess, user }) => {
    return (
        <div className="w-full space-y-4">
            <div className="text-2xl font-bold text-center">
                {pack.priceFCFA.toLocaleString()} FCFA
            </div>
            
            <FapshiButton pack={pack} onSuccess={onSuccess} user={user} />

            <div className="flex items-center justify-center gap-4 mt-2">
                {PaymentMethodsInfo.mobileMoneyLogos.map((logo, index) => (
                    <img
                        key={index}
                        src={logo.logo}
                        alt={logo.name}
                        className="h-8 object-contain"
                    />
                ))}
            </div>
        </div>
    );
};

export default function Index({ auth }) {
    const { toast } = useToast();
    const [error, setError] = useState(null);
    const { t } = useTranslation();

    if (!auth?.user) {
        window.location.href = '/login';
        return null;
    }

    const handlePaymentSuccess = (newBalance) => {
        auth.user.wallet_balance = newBalance;
        toast({
            title: t('payment.success.title'),
            description: t('payment.success.description'),
        });
        window.location.reload();
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={t('payment.pageTitle')} />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8"
                            >
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-amber-500 to-purple-500 mb-6">
                                    <Coins className="h-10 w-10 text-white" />
                                </div>
                                <h1 className="text-4xl font-bold mb-4">
                                    <span className="bg-gradient-to-r from-amber-500 to-purple-500 text-transparent bg-clip-text">
                                        {t('payment.title')}
                                    </span>
                                </h1>
                                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                                    {t('payment.subtitle')}
                                </p>
                            </motion.div>

                            <div className="flex flex-wrap justify-center gap-4 mb-8">
                                <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/50 rounded-full">
                                    <Gift className="w-5 h-5 text-amber-500" />
                                    <span className="text-amber-700 dark:text-amber-300">
                                        {t('payment.features.bonus')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/50 rounded-full">
                                    <Smartphone className="w-5 h-5 text-orange-500" />
                                    <span className="text-orange-700 dark:text-orange-300">
                                        Fapshi Mobile Money
                                    </span>
                                </div>
                            </div>

                            {error && (
                                <Alert variant="destructive" className="max-w-2xl mx-auto mb-8">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {TOKEN_PACKS.map((pack, index) => (
                                <motion.div
                                    key={pack.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className={cn(
                                        "relative overflow-hidden",
                                        "transition-all duration-300 hover:scale-105 hover:shadow-lg",
                                        pack.mostPopular && "ring-2 ring-amber-500 dark:ring-amber-400"
                                    )}>
                                        {pack.mostPopular && (
                                            <div className="absolute top-0 right-0">
                                                <div className="bg-gradient-to-r from-amber-500 to-purple-500 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                                                    {t(`payment.popularityText.${pack.popularityText}`)}
                                                </div>
                                            </div>
                                        )}
                                        <CardContent className="p-6">
                                            <div className="mb-6">
                                                <div className={cn(
                                                    "w-16 h-16 rounded-xl bg-gradient-to-r flex items-center justify-center mb-4",
                                                    pack.color
                                                )}>
                                                    <Coins className="w-8 h-8 text-white" />
                                                </div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xl font-semibold">
                                                        {pack.tokens} {t('payment.tokens')}
                                                    </span>
                                                    {pack.bonusTokens > 0 && (
                                                        <span className="text-green-500 dark:text-green-400 font-medium animate-pulse">
                                                            +{pack.bonusTokens} {t('payment.bonus')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {t('payment.total')}: {pack.tokens + pack.bonusTokens} {t('payment.tokens')}
                                                </div>
                                                {/* <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {t('payment.unitPrice')}: {(pack.priceEuros / (pack.tokens + pack.bonusTokens) * 10).toFixed(2)}€ / 10 {t('payment.tokens')}
                                                </div> */}

                                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                    <FapshiPayment
                                                        pack={pack}
                                                        onSuccess={handlePaymentSuccess}
                                                        user={auth.user}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-12 space-y-4">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl mx-auto">
                                <h2 className="text-lg font-semibold mb-4">Paiement avec Fapshi</h2>
                                <div className="space-y-2">
                                    <h3 className="font-medium">Mobile Money Cameroun</h3>
                                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                        <li>• Paiement instantané</li>
                                        <li>• MTN Mobile Money et Orange Money acceptés</li>
                                        <li>• Tarifs en FCFA (XAF)</li>
                                        <li>• Sécurisé par Fapshi</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                                <p>Les tokens sont crédités immédiatement après paiement</p>
                                <p className="mt-2">Paiement sécurisé par Fapshi - Leader du Mobile Money au Cameroun</p>
                            </div>
                        </div>
                    </div>
                </div>
        </AuthenticatedLayout>
    );
}
