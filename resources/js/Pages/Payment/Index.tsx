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

// Configuration des packs de jetons
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

// Utilitaire pour fusionner les classes Tailwind
function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

// Composant Bouton PayPal
const PayPalPackButton = ({ pack, onSuccess }) => {
    const [{ isPending }] = usePayPalScriptReducer();

    if (isPending) {
        return (
            <div className="flex items-center justify-center h-12">
                <div className="w-4 h-4 border-2 border-amber-500 rounded-full border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <PayPalButtons
            style={{ layout: "vertical" }}
            createOrder={(data, actions) => {
                // @ts-ignore
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
            onApprove={(data, actions) => {
                return actions.order.capture().then((details) => {
                    // Mise à jour du solde via l'API
                    fetch('/api/paypal/capture-payment', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                        },
                        body: JSON.stringify({
                            orderID: data.orderID,
                            tokens: pack.tokens + pack.bonusTokens,
                            paypalDetails: details
                        })
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                onSuccess(data.new_balance);
                            }
                        });
                });
            }}
        />
    );
};

// Composant Carte de Pack
const PackCard = ({ pack, isPopular, onSuccess }) => (
    <Card className={cn(
        "relative overflow-hidden border-0",
        "transition-transform duration-300 hover:scale-105",
        isPopular && "ring-2 ring-amber-500 dark:ring-amber-400"
    )}>
        {isPopular && (
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
            <PayPalPackButton pack={pack} onSuccess={onSuccess} />
        </CardContent>
    </Card>
);

// Composant Principal
export default function Index({ auth, paypalConfig }) {
    const { toast } = useToast();
    const [error, setError] = useState(null);

    // Redirection si non authentifié
    if (!auth?.user) {
        window.location.href = '/login';
        return null;
    }

    // Options PayPal
    const initialOptions = {
        "client-id": paypalConfig.clientId,
        currency: "EUR",
        intent: "capture",
    };

    // Gestionnaire de succès de paiement
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
                        {/* En-tête */}
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

                            {/* Badges */}
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

                            {/* Message d'erreur */}
                            {error && (
                                <Alert variant="destructive" className="max-w-2xl mx-auto mb-8">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                        </div>

                        {/* Grille des packs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {TOKEN_PACKS.map((pack, index) => (
                                <motion.div
                                    key={pack.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <PackCard
                                        pack={pack}
                                        isPopular={pack.mostPopular}
                                        onSuccess={handlePaymentSuccess}
                                    />
                                </motion.div>
                            ))}
                        </div>

                        {/* Pied de page */}
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
