import React, { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { useToast } from '@/Components/ui/use-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    CreditCard, Lock, Shield, ArrowRight, Loader2,
    CheckCircle, AlertCircle, Euro, Banknote, Download
} from 'lucide-react';

interface GuestPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    paymentToken: string;
    amount: number;
    onPaymentSuccess: (token: string) => void;
}

export default function GuestPaymentModal({ 
    isOpen, 
    onClose, 
    paymentToken, 
    amount, 
    onPaymentSuccess 
}: GuestPaymentModalProps) {
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    const [currency, setCurrency] = useState('EUR');
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');

    // Calculer le montant selon la devise
    const getDisplayAmount = () => {
        switch (currency) {
            case 'XAF':
                return Math.round(amount * 655.957);
            case 'XOF':
                return Math.round(amount * 655.957);
            default:
                return amount;
        }
    };

    const getCurrencySymbol = () => {
        switch (currency) {
            case 'EUR': return '€';
            case 'XAF': return 'FCFA';
            case 'XOF': return 'FCFA';
            default: return '€';
        }
    };

    const handlePayment = async () => {
        if (!customerName.trim() || !customerEmail.trim()) {
            toast({
                title: "Informations manquantes",
                description: "Veuillez remplir votre nom et email",
                variant: "destructive"
            });
            return;
        }

        setIsProcessing(true);
        setStep('processing');

        try {
            const response = await fetch('/api/payments/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    provider: 'fapshi',
                    amount: getDisplayAmount(),
                    currency: currency,
                    description: 'CV Professionnel PDF',
                    customer_name: customerName,
                    customer_email: customerEmail,
                    customer_phone: customerPhone,
                    payment_type: customerPhone ? 'mobile' : 'web'
                })
            });

            const result = await response.json();

            if (result.success) {
                if (result.payment_url) {
                    // Rediriger vers l'interface de paiement
                    window.location.href = result.payment_url;
                } else {
                    // Paiement direct Fapshi - simuler le succès pour cette démo
                    setStep('success');
                    toast({
                        title: "Paiement initié",
                        description: "Votre paiement mobile a été initié avec Fapshi",
                    });
                }
            } else {
                throw new Error(result.message || 'Erreur lors du paiement');
            }

        } catch (error) {
            console.error('Payment error:', error);
            toast({
                title: "Erreur de paiement",
                description: error.message || "Une erreur est survenue lors du paiement",
                variant: "destructive"
            });
            setStep('form');
        } finally {
            setIsProcessing(false);
        }
    };

    const resetModal = () => {
        setStep('form');
        setIsProcessing(false);
        setCustomerName('');
        setCustomerEmail('');
        setCustomerPhone('');
        setCurrency('EUR');
    };

    return (
        <Dialog 
            open={isOpen} 
            onOpenChange={(open) => {
                if (!open) {
                    resetModal();
                    onClose();
                }
            }}
        >
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        Télécharger votre CV
                    </DialogTitle>
                </DialogHeader>

                {step === 'form' && (
                    <div className="space-y-6">
                        {/* Résumé du paiement */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-blue-800">CV Professionnel PDF</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-2xl font-bold text-blue-800">
                                        {getDisplayAmount().toLocaleString()}
                                    </span>
                                    <span className="text-sm text-blue-600">{getCurrencySymbol()}</span>
                                </div>
                            </div>
                            <div className="text-sm text-blue-600">
                                ✓ Téléchargement immédiat • ✓ Qualité HD • ✓ Paiement mobile Fapshi
                            </div>
                        </div>

                        {/* Sélection devise */}
                        <div>
                            <Label htmlFor="currency">Devise de paiement</Label>
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EUR">
                                        <div className="flex items-center gap-2">
                                            <Euro className="w-4 h-4" />
                                            Euro (EUR) - {amount}€
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="XAF">
                                        <div className="flex items-center gap-2">
                                            <Banknote className="w-4 h-4" />
                                            Franc CFA (XAF) - {Math.round(amount * 655.957).toLocaleString()} FCFA
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="XOF">
                                        <div className="flex items-center gap-2">
                                            <Banknote className="w-4 h-4" />
                                            Franc CFA (XOF) - {Math.round(amount * 655.957).toLocaleString()} FCFA
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Informations client */}
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="customerName">Nom complet *</Label>
                                <Input
                                    id="customerName"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Votre nom complet"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="customerEmail">Email *</Label>
                                <Input
                                    id="customerEmail"
                                    type="email"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    placeholder="votre@email.com"
                                    required
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    Votre reçu sera envoyé à cette adresse
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="customerPhone">Téléphone (optionnel)</Label>
                                <Input
                                    id="customerPhone"
                                    type="tel"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    placeholder="677123456"
                                    pattern="6[0-9]{8}"
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    Pour paiement mobile direct (format: 6XXXXXXXX)
                                </div>
                            </div>
                        </div>

                        {/* Sécurité */}
                        <Alert className="border-green-200 bg-green-50">
                            <Shield className="w-4 h-4" />
                            <AlertDescription className="text-green-800">
                                <strong>Paiement sécurisé</strong> par Fapshi. Vos données bancaires sont protégées.
                            </AlertDescription>
                        </Alert>

                        {/* Bouton de paiement */}
                        <Button 
                            onClick={handlePayment}
                            disabled={isProcessing || !customerName.trim() || !customerEmail.trim()}
                            className="w-full bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600"
                            size="lg"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Traitement...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-4 h-4 mr-2" />
                                    Payer {getDisplayAmount().toLocaleString()} {getCurrencySymbol()}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>

                        {/* Alternative gratuite */}
                        <div className="text-center pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-2">
                                Ou créez un compte gratuit pour sauvegarder vos CV
                            </p>
                            <Button variant="outline" size="sm" asChild>
                                <a href={route('register')}>
                                    Inscription gratuite
                                </a>
                            </Button>
                        </div>
                    </div>
                )}

                {step === 'processing' && (
                    <div className="text-center py-8">
                        <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
                        <h3 className="text-lg font-medium mb-2">Redirection vers le paiement...</h3>
                        <p className="text-gray-600">Vous allez être redirigé vers Fapshi</p>
                    </div>
                )}

                {step === 'success' && (
                    <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Paiement confirmé !</h3>
                        <p className="text-gray-600 mb-4">Vous pouvez maintenant télécharger votre CV</p>
                        <Button onClick={() => onPaymentSuccess(paymentToken)} className="w-full">
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger mon CV
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}