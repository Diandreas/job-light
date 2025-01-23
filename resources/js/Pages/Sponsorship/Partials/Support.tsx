import React, { useState } from 'react';
import axios from 'axios';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/Components/ui/alert';

const Support = () => {
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

    const submitTicket = async (e) => {
        e.preventDefault();
        if (!message.trim()) {
            setSubmitStatus({
                type: 'error',
                message: 'Veuillez décrire votre problème avant de soumettre.'
            });
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus({ type: '', message: '' });

        try {
            await axios.post('/sponsorship/support', { message });
            setSubmitStatus({
                type: 'success',
                message: 'Votre ticket de support a été soumis avec succès ! Notre équipe vous répondra bientôt.'
            });
            setMessage('');
        } catch (error) {
            console.error('Error submitting support ticket', error);
            setSubmitStatus({
                type: 'error',
                message: 'Une erreur est survenue lors de la soumission de votre ticket. Veuillez réessayer.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center text-2xl font-bold text-indigo-700">
                    <MessageSquare className="mr-2 h-6 w-6" />
                    Support
                </CardTitle>
                <CardDescription>
                    Besoin d'aide ? Nous sommes là pour vous aider. Décrivez votre problème ci-dessous.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submitTicket} className="space-y-4">
                    <div className="space-y-2">
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Décrivez votre problème en détail..."
                            className="h-32 resize-none"
                        />
                        {submitStatus.message && (
                            <Alert variant={submitStatus.type === 'error' ? 'destructive' : 'default'}>
                                <AlertTitle>
                                    {submitStatus.type === 'error' ? 'Erreur' : 'Succès'}
                                </AlertTitle>
                                <AlertDescription>
                                    {submitStatus.message}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Envoi en cours...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Soumettre le ticket
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default Support;
