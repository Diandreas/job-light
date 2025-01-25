import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Wallet } from "lucide-react";
import NotchPay from 'notchpay.js';
import axios from "axios";

const notchpay = NotchPay('pk_test.27HM7WgXYb5PzM5eNTb7yXyi7QwXdqb2ZKEd28im86wM4YRIOyKQaBD3tKKsAD3jU8HKoFavsDFQ9l6wdLsNbRT33szW9NbkdFDLSdpbFyMuFv2TUZSdsgCcMrJJ5');

const PaymentModal = ({ isOpen, onClose, model, user, onSuccess }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async () => {
        try {
            setIsProcessing(true);
            const payment = await notchpay.payments.initializePayment({
                currency: "XAF",
                amount: model.price.toString(),
                email: user.email,
                phone: user.phone || '',
                reference: `cv_${model.id}_${user.id}_${Date.now()}`,
                description: `Paiement pour le modèle CV ${model.name}`,
                callback_url: `${window.location.origin}/api/notchpay/callback`
            });

            if (payment.transaction) {
                const checkStatus = setInterval(async () => {
                    try {
                        const status = await notchpay.payments.verifyAndFetchPayment(
                            payment.transaction.reference
                        );

                        if (status.transaction.status === 'completed') {
                            clearInterval(checkStatus);
                            await axios.post('/api/update-wallet', {
                                user_id: user.id,
                                amount: model.price
                            });
                            onSuccess();
                            onClose();
                        }
                    } catch (error) {
                        console.error('Status check error:', error);
                    }
                }, 3000);
            }
        } catch (error) {
            console.error('Payment error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Paiement du modèle</DialogTitle>
                    <DialogDescription>
                        {model?.name} - {model?.price} FCFA
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-primary" />
                            <span className="font-medium">Prix total:</span>
                        </div>
                        <span className="text-lg font-bold text-primary">
                            {model?.price} FCFA
                        </span>
                    </div>

                    <Button
                        className="w-full"
                        onClick={handlePayment}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Traitement...' : 'Procéder au paiement'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentModal;
