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
import {
    Sparkles,
    Brain,
    Wallet,
    Clock,
    Loader,
    Download,
    Star,
    Trash2,
    MessageSquare,
    Calendar
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
    const scrollRef = useRef(null);

    const maxHistory = getMaxHistoryForService(selectedService.id);

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
                            />
                            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-purple-500/10 rounded-lg">
                                <Wallet className="text-amber-500" />
                                <span className="font-medium">{walletBalance} FCFA</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Services */}
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

                {/* Main Chat Area */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Chat History Sidebar */}
                    <Card className="lg:col-span-1 border-amber-100">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-amber-500" />
                                Mes conversations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[600px] pr-4">
                                <div className="space-y-2">
                                    {userChats
                                        .filter(chat => chat.service_id === selectedService.id)
                                        .map(chat => (
                                            <motion.div
                                                key={chat.context_id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`p-3 rounded-lg cursor-pointer border transition-all ${
                                                    activeChat?.context_id === chat.context_id
                                                        ? 'border-amber-500 bg-amber-50'
                                                        : 'border-transparent hover:border-amber-200'
                                                }`}
                                                onClick={() => handleChatSelection(chat)}
                                            >
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">
                                                            {chat.preview}
                                                        </p>
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
                                                            confirmDeleteChat(chat);
                                                        }}
                                                        className="text-gray-400 hover:text-red-500"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Chat Interface */}
                    <Card className="lg:col-span-3 border-amber-100">
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
                                {activeChat && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => handleExport('pdf')}
                                            className="flex items-center gap-2 border-amber-200 hover:bg-amber-50"
                                        >
                                            <Download className="w-4 h-4" />
                                            PDF
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleExport('docx')}
                                            className="flex items-center gap-2 border-amber-200 hover:bg-amber-50"
                                        >
                                            <Download className="w-4 h-4" />
                                            DOCX
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6">
                            <ScrollArea className="h-[500px] pr-4 mb-6" ref={scrollRef}>
                                <AnimatePresence>
                                    {(activeChat?.messages || []).map((message, index) => (
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
                                        {maxHistory - (activeChat?.messages?.length || 0)}
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
                </div>

                {/* Delete Confirmation Dialog */}
                <AlertDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {language === 'fr' ?
                                    'Supprimer la conversation ?' :
                                    'Delete conversation?'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {language === 'fr' ?
                                    'Cette action est irréversible. La conversation sera définitivement supprimée.' :
                                    'This action cannot be undone. The conversation will be permanently deleted.'}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>
                                {language === 'fr' ? 'Annuler' : 'Cancel'}
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteChat}
                                className="bg-red-500 hover:bg-red-600"
                            >
                                {language === 'fr' ? 'Supprimer' : 'Delete'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AuthenticatedLayout>
    );
}
