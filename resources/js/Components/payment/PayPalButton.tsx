import React, { useState, useEffect } from 'react';
import { useToast } from "@/Components/ui/use-toast";

const PayPalButton = ({ pack, onSuccess, onError }) => {
    const [paypalLoaded, setPaypalLoaded] = useState(false);

    useEffect(() => {
        const loadPayPalScript = async () => {
            const script = document.createElement('script');
            // @ts-ignore
            script.src = `https://www.paypal.com/sdk/js?client-id=${window.paypalConfig.clientId}&currency=EUR`;
            script.async = true;

            script.onload = () => {
                setPaypalLoaded(true);
                initializePayPalButtons();
            };

            script.onerror = () => {
                onError("Erreur lors du chargement de PayPal");
            };

            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
            };
        };

        loadPayPalScript();
    }, []);

    const initializePayPalButtons = () => {
        // @ts-ignore
        if (!window.paypal) return;
// @ts-ignore
        return window.paypal.Buttons({
            createOrder: async () => {
                try {
                    const response = await fetch('/api/paypal/create-order', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                        },
                        body: JSON.stringify({
                            amount: pack.priceEuros,
                            tokens: pack.tokens + pack.bonusTokens
                        })
                    });

                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error);

                    return data.orderId;
                } catch (error) {
                    onError("Erreur lors de la création de la commande");
                    throw error;
                }
            },

            onApprove: async (data) => {
                try {
                    const response = await fetch('/api/paypal/capture-order', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                        },
                        body: JSON.stringify({
                            orderId: data.orderID,
                            tokens: pack.tokens + pack.bonusTokens,
                            // @ts-ignore
                            userId: window.auth.user.id
                        })
                    });

                    const result = await response.json();
                    if (!response.ok) throw new Error(result.error);

                    if (result.success) {
                        onSuccess(result.new_balance);
                    } else {
                        throw new Error('Capture failed');
                    }
                } catch (error) {
                    onError("Erreur lors de la finalisation du paiement");
                    console.error('Payment error:', error);
                }
            },

            onError: (err) => {
                console.error('PayPal error:', err);
                onError("Une erreur est survenue avec PayPal");
            }
        }).render(`#paypal-button-${pack.id}`);
    };

    return (
        <div>
            {paypalLoaded ? (
                <div id={`paypal-button-${pack.id}`} className="w-full" />
            ) : (
                <div className="flex items-center justify-center h-12">
                    <div className="w-4 h-4 border-2 border-amber-500 rounded-full border-t-transparent animate-spin" />
                </div>
            )}
        </div>
    );
};

export default PayPalButton;
