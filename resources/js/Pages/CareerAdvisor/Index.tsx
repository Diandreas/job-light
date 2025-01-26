import React, { useState, useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { Progress } from "@/Components/ui/progress";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { useToast } from "@/Components/ui/use-toast";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { motion } from 'framer-motion';
import {
    Sparkles, Briefcase, GraduationCap, MessageSquare,
    Loader, Wallet, ChevronDown, FileText, PenTool,
    Building, Brain, Languages, Download, Clock, LucideIcon
} from 'lucide-react';
import axios from 'axios';
import ServiceCard from "@/Components/ServiceCard";

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
    initialAdvice: any;
}

interface Service {
    id: string;
    icon: LucideIcon;
    title: string;
    description: string;
    cost: number;
    category: 'advice' | 'document' | 'interactive';
    formats: string[];
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

const services = [
    {
        id: 'career-advice',
        icon: Brain,
        title: 'Conseil Carrière',
        description: 'Conseils personnalisés pour votre développement',
        cost: 100,
        category: 'advice',
        formats: ['conversation']
    },
    {
        id: 'cover-letter',
        icon: FileText,
        title: 'Lettre de Motivation',
        description: 'Lettre de motivation personnalisée',
        cost: 200,
        category: 'document',
        formats: ['docx', 'pdf']
    },
    {
        id: 'interview-prep',
        icon: MessageSquare,
        title: 'Préparation Entretien',
        description: 'Simulation d\'entretien interactive',
        cost: 150,
        category: 'interactive',
        formats: ['conversation']
    },
    // ... autres services
];

export default function Index({ auth, userInfo, initialAdvice }) {
    const { toast } = useToast();
    const [expandedSections, setExpandedSections] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [walletBalance, setWalletBalance] = useState(auth.user.wallet_balance);
    const [selectedService, setSelectedService] = useState(services[0]);
    const [language, setLanguage] = useState('fr');
    const [conversationHistory, setConversationHistory] = useState<ConversationHistory>({
        messages: [],
        contextId: crypto.randomUUID()
    });
    const [tokensUsed, setTokensUsed] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        question: '',
        contextId: conversationHistory.contextId,
        language: language
    });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [conversationHistory.messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
            const response = await axios.post('/api/career-advisor/chat', {
                message: data.question,
                history: conversationHistory.messages.slice(-MAX_HISTORY),
                contextId: conversationHistory.contextId,
                language: language,
                serviceId: selectedService.id
            });

            // Handle response
            //@ts-ignore
            setConversationHistory(prev => ({
                ...prev,
                messages: [...prev.messages, {
                    role: 'assistant',
                    content: response.data.message,
                    timestamp: new Date()
                }].slice(-MAX_HISTORY)
            }));

            setTokensUsed(response.data.tokens);
            setWalletBalance(prev => prev - selectedService.cost);
            setData('question', '');

        } catch (error) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async (format: string) => {
        try {
            const response = await axios.post('/api/career-advisor/export', {
                contextId: conversationHistory.contextId,
                format,
                serviceId: selectedService.id
            }, { responseType: 'blob' });

            // Create download link
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = `document.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            toast({
                title: "Erreur export",
                description: "Échec de l'export du document",
                variant: "destructive",
            });
        }
    };

    // @ts-ignore
    return (
        <AuthenticatedLayout user={auth.user}>
            <div className="container mx-auto p-4 space-y-8">
                {/* Header avec sélecteur de langue et solde */}
                <div className="flex justify-between items-center">
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex items-center gap-4">
                        <Progress value={(tokensUsed/TOKEN_LIMIT) * 100} className="w-32" />
                        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                            <Wallet className="text-primary" />
                            <span>{walletBalance} FCFA</span>
                        </div>
                    </div>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {services.map(service => (
                        //@ts-ignore
                        <ServiceCard
                            key={service.id}
                            {...service}
                            isSelected={selectedService.id === service.id}
                            onClick={() => setSelectedService(service)}
                        />
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Chat/Document Area */}
                    <Card className="col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <selectedService.icon className="text-primary" />
                                    {selectedService.title}
                             </div>
                                {selectedService.category === 'document' && (
                                    <div className="flex gap-2">
                                        {selectedService.formats.map(format => (
                                            <Button
                                                key={format}
                                                variant="outline"
                                                onClick={() => handleExport(format)}
                                                className="flex items-center gap-2"
                                            >
                                                <Download className="w-4 h-4" />
                                                {format.toUpperCase()}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[500px] pr-4" ref={scrollRef}>
                                {conversationHistory.messages.map((message, index) => (
                                    <MessageBubble key={index} message={message} />
                                ))}
                            </ScrollArea>

                            <form onSubmit={handleSubmit} className="mt-4">
                                <Textarea
                                    value={data.question}
                                    onChange={e => setData('question', e.target.value)}
                                    placeholder="Posez votre question..."
                                    className="min-h-[100px]"
                                />
                                <div className="flex justify-between items-center mt-4">
                                    <div className="text-sm text-gray-500">
                                        <Clock className="inline-block mr-1" />
                                        {MAX_HISTORY - conversationHistory.messages.length} questions restantes
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={processing || isLoading}
                                        className="bg-primary"
                                    >
                                        {isLoading ? <LoadingSpinner /> : 'Envoyer'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

const MessageBubble = ({ message }: { message: Message }) => {
    const isUser = message.role === 'user';
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[80%] p-4 rounded-lg ${
                isUser ? 'bg-primary text-white' : 'bg-gray-100'
            }`}>
                <p className="whitespace-pre-wrap">{message.content}</p>
                <div className={`text-xs mt-2 ${isUser ? 'text-white/70' : 'text-gray-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
};

const LoadingSpinner = () => (
    <div className="flex items-center gap-2">
        <Loader className="animate-spin" />
        Traitement...
    </div>
);
