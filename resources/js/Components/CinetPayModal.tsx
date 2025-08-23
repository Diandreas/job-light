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
import { useToast } from '@/Components/ui/use-toast';

const CinetPayModal = ({ isOpen, onClose, model, user, onSuccess }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();

    const handlePayment = async () => {
        try {
            setIsProcessing(true);

            // Générer un ID de transaction unique
            const transactionId = `cv_${model.id}_${user.id}_${Date.now()}`;

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
                    amount: model.price,
                    currency: 'XOF', // FCFA
                    description: `Paiement pour le modèle CV ${model.name}`,
                    customer_name: user.name || 'Utilisateur',
                    customer_surname: user.surname || '',
                    customer_email: user.email || '',
                    customer_phone_number: user.phone || '',
                    notify_url: `${window.location.origin}/api/cinetpay/notify`,
                    return_url: `${window.location.origin}/api/cinetpay/return`,
                    channels: 'ALL',
                    lang: 'fr',
                    metadata: `cv_model_${model.id}`,
                    invoice_data: {
                        reference: `CV_${model.id}`,
                        description: `Modèle CV ${model.name}`,
                        amount: model.price
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de l\'initialisation du paiement');
            }

            const result = await response.json();

            if (result.success && result.payment_url) {
                // Rediriger vers la page de paiement CinetPay
                window.location.href = result.payment_url;
            } else {
                throw new Error('Réponse invalide de l\'initialisation du paiement');
            }

        } catch (error) {
            console.error('Payment error:', error);
            toast({
                variant: "destructive",
                title: "Erreur de paiement",
                description: error.message || 'Une erreur est survenue lors du traitement du paiement'
            });
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
                        className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                        onClick={handlePayment}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Traitement...' : 'Procéder au paiement avec CinetPay'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CinetPayModal;
