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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/Components/ui/sheet";
import {
    Sparkles, Brain, Wallet, Clock, Loader, Download, Star, Trash2,
    MessageSquare, Calendar, History, Menu
} from 'lucide-react';
import axios from 'axios';
import { MessageBubble } from '@/Components/ai/MessageBubble';
import { ServiceCard } from '@/Components/ai/ServiceCard';
import { SERVICES, DEFAULT_PROMPTS } from '@/Components/ai/constants';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";

const TOKEN_LIMIT = 2000;

const getMaxHistoryForService = (serviceId: string): number => {
    return serviceId === 'interview-prep' ? 10 : 3;
};

// Fonction utilitaire pour compter les questions uniquement (pas les réponses)
const countUserQuestions = (messages) => {
    return messages?.filter(msg => msg.role === 'user').length || 0;
};

export default function Index({ auth, userInfo, chatHistories }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [walletBalance, setWalletBalance] = useState(auth.user.wallet_balance);
    const [selectedService, setSelectedService] = useState(SERVICES[0]);
    const [language, setLanguage] = useState('fr');
    const [activeChat, setActiveChat] = useState(null);
    const [userChats, setUserChats] = useState(chatHistories || []);
    const [tokensUsed, setTokensUsed] = useState(0);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [chatToDelete, setChatToDelete] = useState(null);
    const [historyOpen, setHistoryOpen] = useState(false);
    const scrollRef = useRef(null);

    const maxHistory = getMaxHistoryForService(selectedService.id);
    const currentQuestions = countUserQuestions(activeChat?.messages);

    const { data, setData, processing } = useForm({
        question: DEFAULT_PROMPTS[SERVICES[0].id][language],
        contextId: activeChat?.context_id || crypto.randomUUID(),
        language: language
    });

    useEffect(() => {
        loadUserChats();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [activeChat?.messages]);

    const loadUserChats = async () => {
        try {
            const response = await axios.get('/career-advisor/chats');
            setUserChats(response.data);
        } catch (error) {
            console.error('Error loading chats:', error);
            toast({
                title: language === 'fr' ? "Erreur" : "Error",
                description: "Impossible de charger les conversations",
                variant: "destructive"
            });
        }
    };

    const handleServiceSelection = (service) => {
        setSelectedService(service);
        if (!activeChat || activeChat.service_id !== service.id) {
            setActiveChat(null);
            setData('question', DEFAULT_PROMPTS[service.id][language] || '');
            // Créer un nouveau contextId pour une nouvelle conversation
            setData('contextId', crypto.randomUUID());
        }
    };

    const handleChatSelection = async (chat) => {
        try {
            setIsLoading(true);
            const service = SERVICES.find(s => s.id === chat.service_id);
            if (service) {
                setSelectedService(service);
            }
            setActiveChat(chat);
            setData('contextId', chat.context_id);
        } catch (error) {
            console.error('Error loading chat:', error);
            toast({
                title: "Erreur",
                description: "Impossible de charger la conversation",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDeleteChat = (chat) => {
        setChatToDelete(chat);
        setDeleteDialogOpen(true);
    };

    const handleDeleteChat = async () => {
        if (!chatToDelete) return;

        try {
            await axios.delete(`/career-advisor/chats/${chatToDelete.context_id}`);
            setUserChats(prev => prev.filter(chat => chat.context_id !== chatToDelete.context_id));

            if (activeChat?.context_id === chatToDelete.context_id) {
                setActiveChat(null);
                setData('contextId', crypto.randomUUID());
            }

            toast({
                title: "Succès",
                description: "Conversation supprimée avec succès"
            });
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de supprimer la conversation",
                variant: "destructive"
            });
        } finally {
            setDeleteDialogOpen(false);
            setChatToDelete(null);
        }
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
            // Procéder au paiement
            await axios.post('/api/process-question-cost', {
                user_id: auth.user.id,
                cost: selectedService.cost,
                service: selectedService.id
            });

            setWalletBalance(prev => prev - selectedService.cost);

            // Envoyer la question
            const response = await axios.post('/career-advisor/chat', {
                message: data.question,
                contextId: data.contextId,
                language: language,
                serviceId: selectedService.id,
                history: activeChat?.messages || []
            });

            // Mettre à jour le chat actif
            const updatedMessages = [
                ...(activeChat?.messages || []),
                {
                    role: 'user',
                    content: data.question,
                    timestamp: new Date()
                },
                {
                    role: 'assistant',
                    content: response.data.message,
                    timestamp: new Date()
                }
            ];

            const updatedChat = {
                ...activeChat,
                context_id: data.contextId,
                service_id: selectedService.id,
                messages: updatedMessages
            };

            setActiveChat(updatedChat);
            setTokensUsed(response.data.tokens);
            setData('question', '');

            // Actualiser la liste des chats
            await loadUserChats();

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
                title: "Erreur",
                description: "Une erreur est survenue lors du traitement",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async (format: string) => {
        if (!activeChat) return;

        try {
            const response = await axios.post('/career-advisor/export', {
                contextId: activeChat.context_id,
                format
            }, { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `conversation-${activeChat.context_id}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast({
                title: "Succès",
                description: "Document exporté avec succès"
            });
        } catch (error) {
            toast({
                title: "Erreur export",
                description: "L'exportation a échoué",
                variant: "destructive",
            });
        }
    };

    // Composant pour la carte de service mobile
    const MobileServiceCard = ({ service, isSelected, onClick }) => (
        <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                isSelected ? 'bg-amber-100' : 'hover:bg-amber-50'
            }`}
        >
            <service.icon className="h-5 w-5 text-amber-500" />
            <div className="flex-1">
                <p className="font-medium">{service.title}</p>
                <div className="flex items-center gap-1 text-sm text-amber-600">
                    <Star className="h-3 w-3" />
                    <span>{service.cost} FCFA</span>
                </div>
            </div>
        </motion.div>
    );

    // Composant pour la carte de conversation dans l'historique
    const ChatHistoryCard = ({ chat, isActive, onSelect, onDelete }) => (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                isActive ? 'border-amber-500 bg-amber-50' : 'border-transparent hover:border-amber-200'
            }`}
            onClick={() => onSelect(chat)}
        >
            <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{chat.preview}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <p className="text-xs text-gray-500">
                            {new Date(chat.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(chat);
                    }}
                    className="text-gray-400 hover:text-red-500"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </motion.div>
    );

    return (
        <AuthenticatedLayout user={auth.user}>
            <div className="container mx-auto p-4 space-y-6">
                {/* Header Mobile */}
                <div className="lg:hidden flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Brain className="h-6 w-6 text-amber-500" />
                        <h2 className="text-lg font-bold">Guidy</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <History className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left">
                                <SheetHeader>
                                    <SheetTitle>Historique</SheetTitle>
                                </SheetHeader>
                                <ScrollArea className="h-[calc(100vh-5rem)] mt-4">
                                    <div className="space-y-2 pr-4">
                                        {userChats
                                            .filter(chat => chat.service_id === selectedService.id)
                                            .map(chat => (
                                                <ChatHistoryCard
                                                    key={chat.context_id}
                                                    chat={chat}
                                                    isActive={activeChat?.context_id === chat.context_id}
                                                    onSelect={handleChatSelection}
                                                    onDelete={confirmDeleteChat}
                                                />
                                            ))}
                                    </div>
                                </ScrollArea>
                            </SheetContent>
                        </Sheet>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg">
                            <Wallet className="h-4 w-4 text-amber-500" />
                            <span className="text-sm font-medium">{walletBalance}</span>
                        </div>
                    </div>
                </div>

                {/* Services Grid - Desktop */}
                <div className="hidden lg:grid grid-cols-4 gap-4">
                    {SERVICES.map(service => (
                        <ServiceCard
                            key={service.id}
                            {...service}
                            isSelected={selectedService.id === service.id}
                            onClick={() => handleServiceSelection(service)}
                        />
                    ))}
                </div>

                {/* Services List - Mobile */}
                <div className="lg:hidden grid grid-cols-2 gap-3">
                    {SERVICES.map(service => (
                        <MobileServiceCard
                            key={service.id}
                            service={service}
                            isSelected={selectedService.id === service.id}
                            onClick={() => handleServiceSelection(service)}
                        />
                    ))}
                </div>

                {/* Main Chat Area */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Chat History Sidebar - Desktop */}
                    <Card className="hidden lg:block border-amber-100">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-amber-500" />
                                Historique
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[600px]">
                                <div className="space-y-2 pr-4">
                                    {userChats
                                        .filter(chat => chat.service_id === selectedService.id)
                                        .map(chat => (
                                            <ChatHistoryCard
                                                key={chat.context_id}
                                                chat={chat}
                                                isActive={activeChat?.context_id === chat.context_id}
                                                onSelect={handleChatSelection}
                                                onDelete={confirmDeleteChat}
                                            />
                                        ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Chat Interface */}
                    <Card className="lg:col-span-3 border-amber-100">
                        <div className="p-4 border-b border-amber-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <selectedService.icon className="h-5 w-5 text-amber-500" />
                                    <h3 className="font-semibold">{selectedService.title}</h3>
                                    <div className="hidden sm:flex items-center gap-1 text-sm font-medium text-amber-600">
                                        <Star className="h-4 w-4" />
                                        {selectedService.cost} FCFA
                                    </div>
                                </div>
                                {activeChat && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleExport('pdf')}
                                            className="border-amber-200"
                                        >
                                            <Download className="h-4 w-4 sm:mr-2" />
                                            <span className="hidden sm:inline">PDF</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleExport('docx')}
                                            className="border-amber-200"
                                        >
                                            <Download className="h-4 w-4 sm:mr-2" />
                                            <span className="hidden sm:inline">DOCX</span>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4">
                            <ScrollArea className="h-[450px] lg:h-[500px] mb-4" ref={scrollRef}>
                                <div className="space-y-4 pr-4">
                                    <AnimatePresence mode="popLayout">
                                        {(activeChat?.messages || []).map((message, index) => (
                                            <MessageBubble key={index} message={message} />
                                        ))}
                                    </AnimatePresence>
                                </div>
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
                                        {maxHistory - currentQuestions} questions
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={processing || isLoading || !data.question.trim()}
                                        className="bg-gradient-to-r from-amber-500 to-purple-500"
                                    >
                                        {isLoading ? (
                                            <Loader className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Envoyer'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Card>
                </div>

                {/* Delete Dialog */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer la conversation ?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Cette action est irréversible. La conversation sera définitivement supprimée.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteChat}
                                className="bg-red-500 hover:bg-red-600"
                            >
                                Supprimer
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AuthenticatedLayout>
    );
}
