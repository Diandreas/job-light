import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import {
    Coins,
    Gift,
    Sparkles,
    CreditCard,
    Phone,
    AlertCircle
} from 'lucide-react';
import { useToast } from "@/Components/ui/use-toast";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import axios from 'axios';

const CONVERSION_RATE = 655.957;
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const PAYPAL_MODE =  'sandbox';

function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

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

const PaymentMethodButton = ({ icon: Icon, label, onClick, selected, disabled }) => (
    <Button
        variant="outline"
        className={cn(
            "flex items-center gap-2 w-full p-4 border-2 transition-all",
            selected ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10" : "border-gray-200 dark:border-gray-800",
            disabled ? "opacity-50 cursor-not-allowed" : "hover:border-amber-500"
        )}
        onClick={onClick}
        disabled={disabled}
    >
        <Icon className={cn("w-5 h-5", selected ? "text-amber-500" : "text-gray-500")} />
        <span className={selected ? "text-amber-700 dark:text-amber-300" : "text-gray-700 dark:text-gray-300"}>
            {label}
        </span>
    </Button>
);

export default function Index({ auth }) {
    const { props } = usePage();
    const { toast } = useToast();
    const [processingPayment, setProcessingPayment] = useState(null);
    const [countryCode, setCountryCode] = useState(null);
    const [paypalLoaded, setPaypalLoaded] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [loadingCountry, setLoadingCountry] = useState(true);
    const [error, setError] = useState(null);

    // Configure axios with CSRF token
    useEffect(() => {
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (token) {
            axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
            axios.defaults.withCredentials = true;
        }
    }, []);

    useEffect(() => {
        fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(data => {
                setCountryCode(data.country_code);
                setSelectedPaymentMethod(data.country_code === 'CM' ? 'mobile' : 'paypal');
            })
            .catch(() => {
                setError("Impossible de détecter votre pays. Les prix seront affichés en Euros.");
                setSelectedPaymentMethod('paypal');
                setCountryCode('FR');
            })
            .finally(() => setLoadingCountry(false));
    }, []);

    // Nouvelle méthode d'initialisation de PayPal
    const initializePayPal = async () => {
        if (!PAYPAL_CLIENT_ID) {
            setError("Configuration PayPal manquante. Contactez l'administrateur.");
            return;
        }

        try {
            // Charger le script PayPal manuellement
            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=EUR`;
            script.async = true;
            script.onload = () => setPaypalLoaded(true);
            script.onerror = () => {
                setError("Erreur lors du chargement de PayPal. Veuillez réessayer.");
                setPaypalLoaded(false);
            };
            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
            };
        } catch (err) {
            setError("Erreur lors de l'initialisation de PayPal.");
            console.error("PayPal initialization error:", err);
        }
    };

    useEffect(() => {
        if (selectedPaymentMethod === 'paypal' && !paypalLoaded) {
            initializePayPal();
        }
    }, [selectedPaymentMethod]);

    const getPrice = (priceEuros) => {
        if (countryCode === 'CM') {
            const priceFCFA = Math.round(priceEuros * CONVERSION_RATE);
            return `${priceFCFA.toLocaleString()} FCFA`;
        }
        return `${priceEuros}€`;
    };

    const initializePayPalButtons = (pack) => {
        if (!window.paypal) {
            console.error('PayPal SDK not loaded');
            return null;
        }

        return window.paypal.Buttons({
            style: {
                layout: 'vertical',
                color: 'gold',
                shape: 'rect',
                label: 'pay'
            },
            createOrder: (data, actions) => {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: pack.priceEuros.toString(),
                            currency_code: "EUR"
                        },
                        description: `${pack.tokens + pack.bonusTokens} tokens purchase`,
                        custom_id: `tokens_${pack.id}_${auth.user.id}`
                    }]
                });
            },
            onApprove: async (data, actions) => {
                try {
                    const order = await actions.order.capture();

                    const response = await axios.post('/api/update-wallet', {
                        user_id: auth.user.id,
                        amount: pack.tokens + pack.bonusTokens,
                        payment_data: {
                            order_id: order.id,
                            amount: order.purchase_units[0].amount.value,
                            currency: order.purchase_units[0].amount.currency_code,
                            status: order.status,
                            create_time: order.create_time,
                            update_time: order.update_time
                        }
                    });

                    if (response.data.success) {
                        toast({
                            title: "Paiement réussi !",
                            description: `Vous avez reçu ${pack.tokens + pack.bonusTokens} jetons`,
                        });
                        setTimeout(() => window.location.reload(), 2000);
                    }
                } catch (error) {
                    console.error('Payment error:', error);
                    toast({
                        title: "Erreur de paiement",
                        description: "Une erreur est survenue. Notre équipe a été notifiée.",
                        variant: "destructive",
                    });
                }
            },
            onError: (err) => {
                console.error('PayPal error:', err);
                toast({
                    title: "Erreur PayPal",
                    description: "Une erreur est survenue. Veuillez réessayer.",
                    variant: "destructive",
                });
            }
        });
    };

    const handleMobileMoneyPurchase = async (pack) => {
        try {
            setProcessingPayment(pack.id);
            const priceFCFA = Math.round(pack.priceEuros * CONVERSION_RATE);

            if (!auth.user.email) {
                throw new Error('Email utilisateur requis');
            }

            const response = await axios.post('/api/notchpay/initialize', {
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

            if (response.data.authorization_url) {
                window.location.href = response.data.authorization_url;
            } else {
                throw new Error('URL de paiement non reçue');
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
                                À partir de {countryCode === 'CM' ? '655 FCFA' : '1€'} seulement !
                                Profitez de bonus plus importants sur les plus gros packs.
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

                        {!loadingCountry && (
                            <div className="max-w-md mx-auto mb-8">
                                <div className="flex gap-4">
                                    {countryCode === 'CM' && (
                                        <PaymentMethodButton
                                            icon={Phone}
                                            label="Mobile Money"
                                            onClick={() => setSelectedPaymentMethod('mobile')}
                                            selected={selectedPaymentMethod === 'mobile'}
                                        />
                                    )}
                                    <PaymentMethodButton
                                        icon={CreditCard}
                                        label="PayPal"
                                        onClick={() => setSelectedPaymentMethod('paypal')}
                                        selected={selectedPaymentMethod === 'paypal'}
                                    />
                                </div>
                            </div>
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
                                                <span className="text-3xl font-bold">
                                                    {getPrice(pack.priceEuros)}
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

                                        {selectedPaymentMethod === 'mobile' ? (
                                            <Button
                                                onClick={() => handleMobileMoneyPurchase(pack)}
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
                                                    <>
                                                        <Phone className="w-4 h-4 mr-2" />
                                                        Payer avec Mobile Money
                                                    </>
                                                )}
                                            </Button>
                                        ) : (
                                            <div className="space-y-4">
                                                {paypalLoaded ? (
                                                    <div
                                                        id={`paypal-button-${pack.id}`}
                                                        className="w-full"
                                                        ref={el => {
                                                            if (el && !el.hasChildNodes()) {
                                                                const buttons = initializePayPalButtons(pack);
                                                                if (buttons) {
                                                                    buttons.render(el);
                                                                }
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-12">
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                            className="w-4 h-4 border-2 border-amber-500 rounded-full border-t-transparent"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
                        <p>Les jetons achetés sont immédiatement disponibles sur votre compte après le paiement.</p>
                        <p className="mt-2">
                            {countryCode === 'CM'
                                ? "Les prix sont affichés en FCFA. Le paiement mobile est disponible via Orange Money et MTN Mobile Money."
                                : "Les prix sont affichés en Euros. Le paiement est sécurisé via PayPal."}
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
