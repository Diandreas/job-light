import React, { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { useToast } from '@/Components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface NotchPayButtonProps {
    pack: {
        tokens: number;
        bonusTokens: number;
    };
    onSuccess: (newBalance: number) => void;
}

const NotchPayButton: React.FC<NotchPayButtonProps> = ({ pack, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handlePayment = async () => {
        try {
            setLoading(true);

            const response = await fetch('/api/notchpay/initialize', {
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
                    tokens: pack.tokens + pack.bonusTokens,
                    // @ts-ignore
                    email: window?.auth?.user?.email
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('NotchPay initialization error:', errorData);
                throw new Error(
                    errorData.message ||
                    (typeof errorData === 'string' ? errorData : 'Payment initialization failed')
                );
            }

            const result = await response.json();

            if (result.success && result.authorization_url) {
                // Open NotchPay hosted page in a new window
                window.location.href = result.authorization_url;
            } else {
                throw new Error('Invalid response from payment initialization');
            }

        } catch (error) {
            console.error('Payment error:', error);
            toast({
                variant: "destructive",
                title: "Payment Error",
                description: error.message || 'An error occurred during payment processing'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600"
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                </>
            ) : (
                'Pay with NotchPay'
            )}
        </Button>
    );
};

export default NotchPayButton;
