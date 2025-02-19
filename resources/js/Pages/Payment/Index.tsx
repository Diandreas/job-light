import { useState, useEffect } from 'react';
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
    AlertCircle,
    ArrowUpRight
} from 'lucide-react';
import { useToast } from "@/Components/ui/use-toast";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { loadScript } from "@paypal/paypal-js";

const CONVERSION_RATE = 655.957; // 1 euro en FCFA
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const PAYPAL_MODE = import.meta.env.VITE_PAYPAL_MODE || 'sandbox';

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
    const { toast } = useToast();
    const { csrf_token } = usePage().props;
    const [processingPayment, setProcessingPayment] = useState(null);
    const [countryCode, setCountryCode] = useState(null);
    const [paypalLoaded, setPaypalLoaded] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [loadingCountry, setLoadingCountry] = useState(true);
    const [error, setError] = useState(null);

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

    useEffect(() => {
        if (selectedPaymentMethod === 'paypal' && PAYPAL_CLIENT_ID) {
            loadScript({
                "client-id": PAYPAL_CLIENT_ID,
                currency: "EUR",
                intent: "capture",
                "enable-funding": "paylater,venmo",
                "disable-funding": "card",
                "data-react-paypal-script-id": "paypal-script",
                environment: PAYPAL_MODE
            })
                .then(() => {
                    setPaypalLoaded(true);
                    setError(null);
                })
                .catch(err => {
                    console.error("PayPal SDK failed to load", err);
                    setError("Impossible de charger PayPal. Veuillez réessayer plus tard.");
                    setPaypalLoaded(false);
                });
        }
    }, [selectedPaymentMethod]);

    const handleMobileMoneyPurchase = async (pack) => {
        try {
            setProcessingPayment(pack.id);
            const priceFCFA = Math.round(pack.priceEuros * CONVERSION_RATE);

            const response = await fetch('/api/notchpay/initialize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf_token
                },
                body: JSON.stringify({
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
                })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l'initialisation du paiement');
            }

            const paymentData = await response.json();

            if (paymentData.authorization_url) {
                window.location.href = paymentData.authorization_url;
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

    const initializePayPalButtons = (pack) => {
        if (!paypalLoaded || !window.paypal) return null;

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

                    const response = await fetch('/api/update-wallet', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrf_token
                        },
                        body: JSON.stringify({
                            user_id: auth.user.id,
                            amount: pack.tokens + pack.bonusTokens,
                            payment_reference: order.id,
                            payment_method: 'paypal',
                            order_data: order
                        })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Erreur lors de la mise à jour du solde');
                    }

                    toast({
                        title: "Paiement réussi !",
                        description: `Vous avez reçu ${pack.tokens + pack.bonusTokens} jetons`,
                        variant: "success",
                    });

                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } catch (error) {
                    console.error('Payment processing error:', error);

                    // Log l'erreur
                    try {
                        await fetch('/api/log-payment-error', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': csrf_token
                            },
                            body: JSON.stringify({
                                error: error.message,
                                userId: auth.user.id,
                                packId: pack.id,
                                timestamp: new Date().toISOString()
                            })
                        });
                    } catch (logError) {
                        console.error('Error logging failed:', logError);
                    }

                    toast({
                        title: "Erreur de paiement",
                        description: "Une erreur est survenue lors de votre paiement. Notre équipe a été notifiée et vous contactera rapidement.",
                        variant: "destructive",
                    });
                }
            },
            onError: (err) => {
                console.error('PayPal error:', err);
                toast({
                    title: "Erreur PayPal",
                    description: "Une erreur est survenue avec PayPal. Veuillez réessayer plus tard.",
                    variant: "destructive",
                });
            }
        });
    };

    const getPrice = (priceEuros) => {
        if (countryCode === 'CM') {
            const priceFCFA = Math.round(priceEuros * CONVERSION_RATE);
            return `${priceFCFA.toLocaleString()} FCFA`;
        }
        return `${priceEuros}€`;
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
