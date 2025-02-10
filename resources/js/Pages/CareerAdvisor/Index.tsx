import React, { useState, useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { Progress } from "@/Components/ui/progress";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { useToast } from "@/Components/ui/use-toast";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Brain, Wallet, Clock, Loader, Download, Star } from 'lucide-react';
import axios from 'axios';
import { MessageBubble } from '@/Components/ai/MessageBubble';
import { ServiceCard } from '@/Components/ai/ServiceCard';
import { SERVICES, DEFAULT_PROMPTS } from '@/Components/ai/constants';

const TOKEN_LIMIT = 2000;

const getMaxHistoryForService = (serviceId: string): number => {
    return serviceId === 'interview-prep' ? 10 : 3;
};

export default function Index({ auth, userInfo }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [walletBalance, setWalletBalance] = useState(auth.user.wallet_balance);
    const [selectedService, setSelectedService] = useState(SERVICES[0]);
    const [language, setLanguage] = useState('fr');
    const [conversationHistory, setConversationHistory] = useState({
        messages: [],
        contextId: crypto.randomUUID()
    });
    const [tokensUsed, setTokensUsed] = useState(0);
    const scrollRef = useRef(null);

    const maxHistory = getMaxHistoryForService(selectedService.id);

    const { data, setData, processing } = useForm({
        question: DEFAULT_PROMPTS[SERVICES[0].id][language],
        contextId: conversationHistory.contextId,
        language: language
    });

    useEffect(() => {
        setData('question', DEFAULT_PROMPTS[selectedService.id][language] || '');
    }, [language, selectedService]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [conversationHistory.messages]);

    const handleServiceSelection = (service) => {
        setSelectedService(service);
        setData('question', DEFAULT_PROMPTS[service.id][language] || '');
        setConversationHistory({
            messages: [],
            contextId: crypto.randomUUID()
        });
        setTokensUsed(0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.question.trim()) {
            toast({
                title: language === 'fr' ? "Message vide" : "Empty message",
                description: language === 'fr' ?
                    "Veuillez entrer votre message" :
                    "Please enter your message",
                variant: "destructive",
            });
            return;
        }

        if (walletBalance < selectedService.cost) {
            toast({
                title: language === 'fr' ? "Solde insuffisant" : "Insufficient balance",
                description: language === 'fr' ?
                    "Veuillez recharger votre compte" :
                    "Please top up your account",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            await axios.post('/api/process-question-cost', {
                user_id: auth.user.id,
                cost: selectedService.cost,
                service: selectedService.id
            });

            setWalletBalance(prev => prev - selectedService.cost);

            const newMessage = {
                role: 'user',
                content: data.question,
                timestamp: new Date()
            };

            setConversationHistory(prev => ({
                ...prev,
                messages: [...prev.messages, newMessage].slice(-maxHistory)
            }));

            const response = await axios.post('/career-advisor/chat', {
                message: data.question,
                history: conversationHistory.messages.slice(-maxHistory),
                contextId: conversationHistory.contextId,
                language: language,
                serviceId: selectedService.id
            });

            setConversationHistory(prev => ({
                ...prev,
                messages: [...prev.messages, {
                    role: 'assistant',
                    content: response.data.message,
                    timestamp: new Date()
                }].slice(-maxHistory)
            }));

            setTokensUsed(response.data.tokens);
            setData('question', '');

        } catch (error) {
            console.error('Error:', error);
            try {
                await axios.post('/api/update-wallet', {
                    user_id: auth.user.id,
                    amount: selectedService.cost
                });
                setWalletBalance(prev => prev + selectedService.cost);
            } catch (refundError) {
                console.error('Refund failed:', refundError);
            }

            toast({
                title: language === 'fr' ? "Erreur" : "Error",
                description: error.response?.data?.message ||
                    (language === 'fr' ?
                        "Une erreur est survenue lors du traitement" :
                        "An error occurred during processing"),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async (format: string) => {
        try {
            const response = await axios.post('/career-advisor/export', {
                contextId: conversationHistory.contextId,
                format,
                serviceId: selectedService.id
            }, { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `document.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast({
                title: language === 'fr' ? "Succès" : "Success",
                description: language === 'fr' ?
                    "Document exporté avec succès" :
                    "Document exported successfully",
            });
        } catch (error) {
            toast({
                title: language === 'fr' ? "Erreur export" : "Export error",
                description: language === 'fr' ?
                    "Échec de l'export du document" :
                    "Failed to export document",
                variant: "destructive",
            });
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <div className="container mx-auto p-4 space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Brain className="h-6 w-6 text-amber-500" />
                        <h2 className="text-xl font-bold bg-gradient-to-r from-amber-500 to-purple-500 bg-clip-text text-transparent">
                            {language === 'fr' ? 'Assistant Guidy' : 'Guidy Assistant'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger className="w-32 border-amber-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fr">Français</SelectItem>
                                <SelectItem value="en">English</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-4">
                            <Progress
                                value={(tokensUsed/TOKEN_LIMIT) * 100}
                                className="w-32 bg-amber-100"
                            />
                            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-purple-500/10 rounded-lg">
                                <Wallet className="text-amber-500" />
                                <span className="font-medium">{walletBalance} FCFA</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {SERVICES.map(service => (
                        <ServiceCard
                            key={service.id}
                            {...service}
                            isSelected={selectedService.id === service.id}
                            onClick={() => handleServiceSelection(service)}
                        />
                    ))}
                </div>

                <Card className="border-amber-100">
                    <div className="p-6 border-b border-amber-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <selectedService.icon className="h-5 w-5 text-amber-500" />
                                <h3 className="font-semibold">{selectedService.title}</h3>
                                <div className="flex items-center gap-1 text-sm font-medium text-amber-600">
                                    <Star className="h-4 w-4" />
                                    {selectedService.cost} FCFA
                                </div>
                            </div>
                            {selectedService.category === 'document' && (
                                <div className="flex gap-2">
                                    {selectedService.formats.map(format => (
                                        <Button
                                            key={format}
                                            variant="outline"
                                            onClick={() => handleExport(format)}
                                            className="flex items-center gap-2 border-amber-200 hover:bg-amber-50"
                                        >
                                            <Download className="w-4 h-4" />
                                            {format.toUpperCase()}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6">
                        <ScrollArea className="h-[500px] pr-4 mb-6" ref={scrollRef}>
                            <AnimatePresence>
                                {conversationHistory.messages.map((message, index) => (
                                    <MessageBubble key={index} message={message} />
                                ))}
                            </AnimatePresence>
                        </ScrollArea>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Textarea
                                value={data.question}
                                onChange={e => setData('question', e.target.value)}
                                placeholder={DEFAULT_PROMPTS[selectedService.id][language]}
                                className="min-h-[100px] border-amber-200 focus:ring-amber-500"
                            />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Clock className="h-4 w-4" />
                                    {maxHistory - conversationHistory.messages.length}
                                    {language === 'fr' ? ' questions restantes' : ' questions remaining'}
                                </div>
                                <Button
                                    type="submit"
                                    disabled={processing || isLoading || !data.question.trim()}
                                    className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader className="h-4 w-4 animate-spin" />
                                            {language === 'fr' ? 'Traitement...' : 'Processing...'}
                                        </div>
                                    ) : (
                                        language === 'fr' ? 'Envoyer' : 'Send'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Card>

                <AnimatePresence>
                    {conversationHistory.messages.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            <Card className="border-amber-100">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-amber-500">
                                        <Sparkles className="mr-2 h-5 w-5" />
                                        {language === 'fr' ?
                                            'Historique de la conversation' :
                                            'Conversation History'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {conversationHistory.messages.map((message, index) => (
                                            <div
                                                key={index}
                                                className={`p-4 rounded-lg ${
                                                    message.role === 'user'
                                                        ? 'bg-gradient-to-r from-amber-500/10 to-purple-500/10'
                                                        : 'bg-gray-50'
                                                }`}
                                            >
                                                <p className="font-semibold mb-2">
                                                    {message.role === 'user' ?
                                                        (language === 'fr' ? 'Vous' : 'You') :
                                                        'Assistant'}
                                                </p>
                                                <p className="text-gray-700">{message.content}</p>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {new Date(message.timestamp).toLocaleString(
                                                        language === 'fr' ? 'fr-FR' : 'en-US'
                                                    )}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AuthenticatedLayout>
    );
}
