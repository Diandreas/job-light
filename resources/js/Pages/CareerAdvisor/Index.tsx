import React, { useState, useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { Progress } from "@/Components/ui/progress";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { useToast } from "@/Components/ui/use-toast";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ScrollArea } from "@/Components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { AnimatePresence, motion } from 'framer-motion';
import {
    Sparkles, Brain, Wallet, Clock,
    Loader, Download, FileText, MessageSquare,
    PenTool, Star
} from 'lucide-react';
import axios from 'axios';

// Import des composants personnalisés
import { MessageBubble } from '@/Components/ai/MessageBubble';
import { ServiceCard } from '@/Components/ai/ServiceCard';
import { SERVICES, DEFAULT_PROMPTS } from '@/Components/ai/constants';

// Types
interface User {
    id: number;
    wallet_balance: number;
}

interface Auth {
    user: User;
}

interface PageProps {
    auth: Auth;
    userInfo: any;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ConversationHistory {
    messages: Message[];
    contextId: string;
}

const MAX_HISTORY = 3;
const TOKEN_LIMIT = 2000;

export default function Index({ auth, userInfo }: PageProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [walletBalance, setWalletBalance] = useState(auth.user.wallet_balance);
    const [selectedService, setSelectedService] = useState(SERVICES[0]);
    const [language, setLanguage] = useState('fr');
    const [conversationHistory, setConversationHistory] = useState<ConversationHistory>({
        messages: [],
        contextId: crypto.randomUUID()
    });
    const [tokensUsed, setTokensUsed] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const { data, setData, processing } = useForm({
        question: DEFAULT_PROMPTS[SERVICES[0].id][language],
        contextId: conversationHistory.contextId,
        language: language
    });

    useEffect(() => {
        setData('question', DEFAULT_PROMPTS[selectedService.id][language]);
    }, [language]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [conversationHistory.messages]);

    const handleServiceSelection = (service) => {
        setSelectedService(service);
        setData('question', DEFAULT_PROMPTS[service.id][language]);
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
                title: "Message vide",
                description: "Veuillez entrer votre message",
                variant: "destructive",
            });
            return;
        }

        if (walletBalance < selectedService.cost) {
            toast({
                title: "Solde insuffisant",
                description: "Veuillez recharger votre compte",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            // Process payment
            await axios.post('/api/process-question-cost', {
                user_id: auth.user.id,
                cost: selectedService.cost,
                service: selectedService.id
            });

            // Update wallet balance immediately
            setWalletBalance(prev => prev - selectedService.cost);

            // Update conversation history
            const newMessage: Message = {
                role: 'user',
                content: data.question,
                timestamp: new Date()
            };

            setConversationHistory(prev => ({
                ...prev,
                messages: [...prev.messages, newMessage].slice(-MAX_HISTORY)
            }));

            // Send request with context
            const response = await axios.post(route('career-advisor.chat'), {
                message: data.question,
                history: conversationHistory.messages.slice(-MAX_HISTORY),
                contextId: conversationHistory.contextId,
                language: language,
                serviceId: selectedService.id
            });

            // Update conversation with AI response
            setConversationHistory(prev => ({
                ...prev,
                messages: [...prev.messages, {
                    role: 'assistant',
                    content: response.data.message,
                    timestamp: new Date()
                }].slice(-MAX_HISTORY)
            }));

            setTokensUsed(response.data.tokens);
            setData('question', '');

        } catch (error) {
            console.error('Error:', error);

            // Attempt to refund if payment was processed but request failed
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
                title: "Erreur",
                description: error.response?.data?.message || "Une erreur est survenue lors du traitement",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async (format: string) => {
        try {
            const response = await axios.post(route('career-advisor.export'), {
                contextId: conversationHistory.contextId,
                format,
                serviceId: selectedService.id
            }, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `document.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast({
                title: "Succès",
                description: "Document exporté avec succès",
            });
        } catch (error) {
            toast({
                title: "Erreur export",
                description: "Échec de l'export du document",
                variant: "destructive",
            });
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <div className="container mx-auto p-4 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Brain className="h-6 w-6 text-amber-500" />
                        <h2 className="text-xl font-bold bg-gradient-to-r from-amber-500 to-purple-500 bg-clip-text text-transparent">
                            Assistant Guidy
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
                                indicatorClassName="bg-gradient-to-r from-amber-500 to-purple-500"
                            />
                            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-purple-500/10 rounded-lg">
                                <Wallet className="text-amber-500" />
                                <span className="font-medium">{walletBalance} FCFA</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Services Grid */}
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

                {/* Chat Card */}
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

                    {/* Chat Area */}
                    <div className="p-6">
                        <ScrollArea className="h-[500px] pr-4 mb-6" ref={scrollRef}>
                            <AnimatePresence>
                                {conversationHistory.messages.map((message, index) => (
                                    <MessageBubble key={index} message={message} />
                                ))}
                            </AnimatePresence>
                        </ScrollArea>

                        {/* Message Input Form */}
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
                                    {MAX_HISTORY - conversationHistory.messages.length} questions restantes
                                </div>
                                <Button
                                    type="submit"
                                    disabled={processing || isLoading || !data.question.trim()}
                                    className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader className="h-4 w-4 animate-spin" />
                                            Traitement...
                                        </div>
                                    ) : (
                                        'Envoyer'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Card>

                {/* Conversation History */}
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
                                        Historique de la conversation
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
                                                    {message.role === 'user' ? 'Vous' : 'Assistant'}
                                                </p>
                                                <p className="text-gray-700">{message.content}</p>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {new Date(message.timestamp).toLocaleString()}
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
