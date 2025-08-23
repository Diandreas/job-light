import React, { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { useToast } from '@/Components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface CinetPayButtonProps {
    pack: {
        tokens: number;
        bonusTokens: number;
        price: number;
    };
    onSuccess: (newBalance: number) => void;
}

const CinetPayButton: React.FC<CinetPayButtonProps> = ({ pack, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handlePayment = async () => {
        try {
            setLoading(true);

            // Générer un ID de transaction unique
            const transactionId = `tokens_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const response = await fetch('/api/cinetpay/initialize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(document.cookie
                        .split('; ')
                        .find(row => row.startsWith('XSRF-TOKEN='))
                        ?.split('=')[1] || ''),
                    'Accept': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    transaction_id: transactionId,
                    amount: pack.price,
                    currency: 'XOF', // FCFA
                    description: `Achat de ${pack.tokens + pack.bonusTokens} tokens`,
                    customer_name: window?.auth?.user?.name || 'Utilisateur',
                    customer_surname: window?.auth?.user?.surname || '',
                    customer_email: window?.auth?.user?.email || '',
                    customer_phone_number: window?.auth?.user?.phone || '',
                    notify_url: `${window.location.origin}/api/cinetpay/notify`,
                    return_url: `${window.location.origin}/api/cinetpay/return`,
                    channels: 'ALL',
                    lang: 'fr'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('CinetPay initialization error:', errorData);
                throw new Error(
                    errorData.message ||
                    (typeof errorData === 'string' ? errorData : 'Payment initialization failed')
                );
            }

            const result = await response.json();

            if (result.success && result.payment_url) {
                // Rediriger vers la page de paiement CinetPay
                window.location.href = result.payment_url;
            } else {
                throw new Error('Invalid response from payment initialization');
            }

        } catch (error) {
            console.error('Payment error:', error);
            toast({
                variant: "destructive",
                title: "Erreur de paiement",
                description: error.message || 'Une erreur est survenue lors du traitement du paiement'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                </>
            ) : (
                'Payer avec CinetPay'
            )}
        </Button>
    );
};

export default CinetPayButton;
