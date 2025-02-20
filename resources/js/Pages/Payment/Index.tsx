import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent } from "@/Components/ui/card";
import { useToast } from "@/Components/ui/use-toast";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import {
    Coins,
    Gift,
    Sparkles,
    AlertCircle
} from 'lucide-react';

const TOKEN_PACKS = [
    {
        id: 'starter',
        tokens: 10,
        bonusTokens: 0,
        priceEuros: 1,
        color: 'from-amber-400 to-amber-600'
    },
    {
        id: 'plus',
        tokens: 50,
        bonusTokens: 10,
        priceEuros: 5,
        color: 'from-purple-400 to-purple-600'
    },
    {
        id: 'pro',
        tokens: 100,
        bonusTokens: 30,
        priceEuros: 10,
        mostPopular: true,
        color: 'from-blue-400 to-blue-600'
    },
    {
        id: 'ultimate',
        tokens: 300,
        bonusTokens: 100,
        priceEuros: 30,
        color: 'from-rose-400 to-rose-600'
    }
];


import { usePage } from '@inertiajs/react';

const PayPalPackButton = ({ pack, onSuccess }) => {
    const [{ isPending }] = usePayPalScriptReducer();
    const [error, setError] = useState(null);
    const { props } = usePage();

    if (isPending) {
        return (
            <div className="flex items-center justify-center h-12">
                <div className="w-4 h-4 border-2 border-amber-500 rounded-full border-t-transparent animate-spin" />
            </div>
        );
    }

    const handlePayPalCapture = async (data, actions) => {
        try {
            const details = await actions.order.capture();

            const response = await fetch('/api/paypal/capture-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(document.cookie
                        .split('; ')
                        .find(row => row.startsWith('XSRF-TOKEN='))
                        ?.split('=')[1] || ''),
                    'Accept': 'application/json',
                },
                credentials: 'include', // Important for cookies
                body: JSON.stringify({
                    orderID: data.orderID,
                    tokens: pack.tokens + pack.bonusTokens,
                    paypalDetails: details
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Payment capture failed');
            }

            const result = await response.json();

            if (result.success) {
                onSuccess(result.new_balance);
            } else {
                throw new Error('Payment processing failed');
            }

        } catch (err) {
            console.error('Payment capture error:', err);
            setError(err.message || 'An error occurred during payment processing');
        }
    };

    return (
        <div>
            {error && (
                <div className="text-red-500 text-sm mb-2 p-2 bg-red-50 rounded">
                    {error}
                </div>
            )}
            <PayPalButtons
                style={{ layout: "vertical" }}
                createOrder={(data, actions) => {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: pack.priceEuros.toString(),
                                currency_code: "EUR"
                            },
                            description: `${pack.tokens + pack.bonusTokens} tokens`
                        }]
                    });
                }}
                onApprove={handlePayPalCapture}
                onError={(err) => {
                    console.error('PayPal button error:', err);
                    setError('Payment failed. Please try again.');
                }}
            />
        </div>
    );
};



function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function Index({ auth, paypalConfig }) {
    const { toast } = useToast();
    const [error, setError] = useState(null);

    if (!auth?.user) {
        window.location.href = '/login';
        return null;
    }

    const initialOptions = {
        "client-id": paypalConfig.clientId,
        currency: "EUR",
        intent: "capture",
        components: "buttons"
    };

    const handlePaymentSuccess = (newBalance) => {
        auth.user.wallet_balance = newBalance;
        toast({
            title: "Paiement réussi !",
            description: "Vos jetons ont été ajoutés à votre compte.",
        });
        window.location.reload();
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Acheter des Jetons" />
{/*@ts-ignore*/}
            <PayPalScriptProvider options={initialOptions}>
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
                                        Obtenir des Jetons
                                    </span>
                                </h1>
                                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                                    À partir de 1€ seulement ! Profitez de bonus plus importants sur les plus gros packs.
                                </p>
                            </motion.div>

                            <div className="flex flex-wrap justify-center gap-4 mb-8">
                                <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/50 rounded-full">
                                    <Gift className="w-5 h-5 text-amber-500" />
                                    <span className="text-amber-700 dark:text-amber-300">
                                        Jusqu'à 100 jetons bonus
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                                    <Sparkles className="w-5 h-5 text-purple-500" />
                                    <span className="text-purple-700 dark:text-purple-300">
                                        Paiement sécurisé
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
                                        "relative overflow-hidden border-0",
                                        "transition-transform duration-300 hover:scale-105",
                                        pack.mostPopular && "ring-2 ring-amber-500 dark:ring-amber-400"
                                    )}>
                                        {pack.mostPopular && (
                                            <div className="absolute top-0 right-0">
                                                <div className="bg-gradient-to-r from-amber-500 to-purple-500 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                                                    Meilleure offre
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
                                                <div className="text-3xl font-bold mb-2">
                                                    {pack.priceEuros}€
                                                </div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xl font-semibold">
                                                        {pack.tokens} jetons
                                                    </span>
                                                    {pack.bonusTokens > 0 && (
                                                        <span className="text-green-500 dark:text-green-400 font-medium">
                                                            +{pack.bonusTokens} BONUS
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    Total : {pack.tokens + pack.bonusTokens} jetons
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    Prix unitaire : {(pack.priceEuros / (pack.tokens + pack.bonusTokens) * 10).toFixed(2)}€ / 10 jetons
                                                </div>
                                            </div>
                                            <PayPalPackButton pack={pack} onSuccess={handlePaymentSuccess} />
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
                            <p>Les jetons achetés sont immédiatement disponibles sur votre compte après le paiement.</p>
                            <p className="mt-2">Les prix sont affichés en Euros. Le paiement est sécurisé via PayPal.</p>
                        </div>
                    </div>
                </div>
            </PayPalScriptProvider>
        </AuthenticatedLayout>
    );
}
