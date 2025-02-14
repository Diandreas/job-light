import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Coins, Gift, Sparkles } from 'lucide-react';
import NotchPay from 'notchpay.js';
import { useToast } from "@/Components/ui/use-toast";

function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
}

const notchpay = NotchPay(import.meta.env.VITE_NOTCHPAY_PUBLIC_KEY);

interface TokenPack {
    id: string;
    tokens: number;
    bonusTokens: number;
    priceEuros: number;
    mostPopular?: boolean;
    color: string;
}

const CONVERSION_RATE = 655.957; // 1 euro en FCFA

const TOKEN_PACKS: TokenPack[] = [
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

export default function Index({ auth }) {
    const { toast } = useToast();
    const [processingPayment, setProcessingPayment] = useState<string | null>(null);

    const handlePurchase = async (pack: TokenPack) => {
        try {
            setProcessingPayment(pack.id);
            const priceFCFA = Math.round(pack.priceEuros * CONVERSION_RATE);

            const payment = await notchpay.payments.initializePayment({
                currency: "XAF",
                amount: priceFCFA.toString(),
                email: auth.user.email,
                phone: auth.user.phone || '',
                reference: `tokens_${pack.id}_${auth.user.id}`,
                description: `Achat de ${pack.tokens + pack.bonusTokens} jetons`,
                meta: {
                    user_id: auth.user.id,
                    tokens: pack.tokens + pack.bonusTokens,
                    package_id: pack.id
                }
            });

            if (payment.authorization_url) {
                window.location.href = payment.authorization_url;
            }
        } catch (error) {
            console.error('Payment error:', error);
            toast({
                title: "Erreur de paiement",
                description: "Une erreur est survenue lors du traitement de votre paiement.",
                variant: "destructive",
            });
        } finally {
            setProcessingPayment(null);
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Acheter des Jetons" />

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
                                À partir de 1€ seulement pour 10 jetons ! Profitez de bonus plus importants sur les plus gros packs.
                            </p>
                        </motion.div>

                        <div className="flex flex-wrap justify-center gap-4 mb-8">
                            <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/50 rounded-full">
                                <Gift className="w-5 h-5 text-amber-500" />
                                <span className="text-amber-700 dark:text-amber-300">Jusqu'à 100 jetons bonus</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                                <Sparkles className="w-5 h-5 text-purple-500" />
                                <span className="text-purple-700 dark:text-purple-300">Paiement sécurisé</span>
                            </div>
                        </div>
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
                                    "relative overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800",
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
                                        <div className="mb-4">
                                            <div className={cn(
                                                "w-16 h-16 rounded-xl bg-gradient-to-r flex items-center justify-center mb-4",
                                                pack.color
                                            )}>
                                                <Coins className="w-8 h-8 text-white" />
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl font-bold">{pack.priceEuros}€</span>
                                                <span className="text-sm text-gray-500">
                                                    ({Math.round(pack.priceEuros * CONVERSION_RATE).toLocaleString()} FCFA)
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-6">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xl font-semibold">
                                                    {pack.tokens} jetons
                                                </span>
                                                {pack.bonusTokens > 0 && (
                                                    <span className="text-green-500 dark:text-green-400 font-medium">
                                                        +{pack.bonusTokens} BONUS
                                                    </span>
                                                )}
                                            </div>
                                            {pack.bonusTokens > 0 && (
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    Total : {pack.tokens + pack.bonusTokens} jetons
                                                </div>
                                            )}
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                Prix unitaire : {(pack.priceEuros / (pack.tokens + pack.bonusTokens) * 10).toFixed(2)}€ / 10 jetons
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => handlePurchase(pack)}
                                            disabled={processingPayment === pack.id}
                                            className={cn(
                                                "w-full bg-gradient-to-r shadow-lg",
                                                pack.color
                                            )}
                                        >
                                            {processingPayment === pack.id ? (
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="w-4 h-4 border-2 border-white rounded-full border-t-transparent"
                                                />
                                            ) : (
                                                "Acheter"
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
                        <p>Les jetons achetés sont immédiatement disponibles sur votre compte après le paiement.</p>
                        <p>Les prix sont affichés en Euros et convertis en FCFA au moment du paiement.</p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
