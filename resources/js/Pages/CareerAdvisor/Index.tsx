import React, { useState, useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { Progress } from "@/Components/ui/progress";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { useToast } from "@/Components/ui/use-toast";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ScrollArea } from "@/Components/ui/scroll-area";
import { AnimatePresence, motion } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/Components/ui/sheet";
import {
    Brain, Wallet, Clock, Loader, Download, Coins, Trash2,
    MessageSquare, Calendar, History, Menu, Send, Plus,
    FileText, Presentation, ChevronDown, ChartLine, ChartArea,
    FileInput, MessageCircleQuestion, PenTool
} from 'lucide-react';
import { MessageBubble } from '@/Components/ai/MessageBubble';
import { ServiceCard, MobileServiceCard } from '@/Components/ai/ServiceCard';
import { SERVICES, DEFAULT_PROMPTS } from '@/Components/ai/constants';
import { PowerPointService } from '@/Components/ai/PresentationService';
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";

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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import axios from 'axios';

const TOKEN_LIMIT = 2000;

const getMaxHistoryForService = (serviceId) => {
    return serviceId === 'interview-prep' ? 10 : 3;
};

const countUserQuestions = (messages) => {
    return messages?.filter(msg => msg.role === 'user').length || 0;
};

// Fonction pour extraire un JSON valide de présentation du contenu
const extractValidJsonFromMessage = (content) => {
    try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;

        const jsonStr = jsonMatch[0];
        const data = JSON.parse(jsonStr);

        if (data && data.slides && data.title) {
            return jsonStr;
        }
        return null;
    } catch (e) {
        return null;
    }
};

const ChatHistoryCard = ({ chat, isActive, onSelect, onDelete }) => {
    const { t } = useTranslation();

    // Limiter la longueur du titre affiché - plus strict pour mobile
    const truncatedPreview = chat.preview ?
        (chat.preview.length > 25 ? chat.preview.substring(0, 25) + '...' : chat.preview) :
        'Nouvelle conversation';

    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative p-2 rounded-lg cursor-pointer transition-all group ${
                isActive
                    ? 'bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
            }`}
            onClick={() => onSelect(chat)}
        >
            {/* Contenu principal */}
            <div className="pr-8">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={chat.preview}>
                    {truncatedPreview}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(chat.created_at).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* Bouton supprimer - toujours visible */}
            <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(chat);
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 opacity-60 hover:opacity-100 hover:text-red-500 dark:hover:text-red-400"
            >
                <Trash2 className="h-3 w-3" />
            </Button>
        </motion.div>
    );
};

// Messages temporaires pour simuler la réflexion de l'IA
const thinkingMessages = [
    "Analyse en cours...",
    "Réflexion sur votre demande...",
    "Génération de la réponse...",
    "Finalisation des conseils..."
];

export default function Index({ auth, userInfo, chatHistories }) {
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [walletBalance, setWalletBalance] = useState(auth.user.wallet_balance);
    const [selectedService, setSelectedService] = useState(SERVICES[0]);
    const [language, setLanguage] = useState(i18n.language || 'fr');
    const [activeChat, setActiveChat] = useState(null);
    const [userChats, setUserChats] = useState(chatHistories || []);
    const [tokensUsed, setTokensUsed] = useState(0);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [chatToDelete, setChatToDelete] = useState(null);
    const [tempMessage, setTempMessage] = useState(null);
    const [thinkingIndex, setThinkingIndex] = useState(0);
    const scrollRef = useRef(null);
    const inputRef = useRef(null);
    const maxHistory = getMaxHistoryForService(selectedService.id);
    const currentQuestions = countUserQuestions(activeChat?.messages);

    const { data, setData, processing } = useForm({
        question: '',
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
    }, [activeChat?.messages, tempMessage]);

    useEffect(() => {
        setLanguage(i18n.language);
        setData('question', '');
    }, [i18n.language]);

    useEffect(() => {
        setData('question', '');
    }, [selectedService]);

    // Auto-focus sur le champ de saisie
    useEffect(() => {
        if (!isLoading && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isLoading, activeChat]);

    const loadUserChats = async () => {
        try {
            const response = await axios.get('/career-advisor/chats');
            setUserChats(response.data);
        } catch (error) {
            console.error('Error loading chats:', error);
            toast({
                title: t('career_advisor.messages.error'),
                description: t('career_advisor.messages.loading_error'),
                variant: "destructive"
            });
        }
    };

    const handleServiceSelection = (service) => {
        setSelectedService(service);
        if (!activeChat || activeChat.service_id !== service.id) {
            setActiveChat(null);
            setData('question', '');
            setData('contextId', crypto.randomUUID());
        }
    };

    const handleChatSelection = async (chat) => {
        try {
            setIsLoading(true);
            const response = await axios.get(`/career-advisor/chats/${chat.context_id}`);
            const chatData = response.data;

            const service = SERVICES.find(s => s.id === chatData.service_id);
            if (service) {
                setSelectedService(service);
            }

            setActiveChat({
                ...chatData,
                messages: chatData.messages || []
            });
            setData('contextId', chatData.context_id);
        } catch (error) {
            console.error('Error loading chat:', error);
            toast({
                title: t('career_advisor.messages.error'),
                description: t('career_advisor.messages.chat_loading_error'),
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
                title: t('common.success'),
                description: t('career_advisor.messages.delete_success')
            });
        } catch (error) {
            toast({
                title: t('career_advisor.messages.error'),
                description: t('career_advisor.messages.delete_error'),
                variant: "destructive"
            });
        } finally {
            setDeleteDialogOpen(false);
            setChatToDelete(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!data.question.trim()) {
            toast({
                title: t('career_advisor.messages.error'),
                description: t('career_advisor.messages.empty'),
                variant: "destructive",
            });
            return;
        }

        if (walletBalance < selectedService.cost) {
            toast({
                title: t('career_advisor.messages.insufficient_balance'),
                description: t('career_advisor.messages.recharge_needed'),
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        // Ajouter le message utilisateur immédiatement
        const userMessage = {
            role: 'user',
            content: data.question,
            timestamp: new Date()
        };

        const updatedMessages = [...(activeChat?.messages || []), userMessage];
        setActiveChat(prev => ({
            ...prev,
            messages: updatedMessages
        }));

        // Vider le champ immédiatement pour une meilleure UX
        setData('question', '');

        // Messages temporaires de réflexion
        setThinkingIndex(0);
        setTempMessage({
            role: 'assistant',
            content: thinkingMessages[0],
            timestamp: new Date(),
            isThinking: true
        });

        const thinkingInterval = setInterval(() => {
            setThinkingIndex(prev => {
                const next = (prev + 1) % thinkingMessages.length;
                setTempMessage({
                    role: 'assistant',
                    content: thinkingMessages[next],
                    timestamp: new Date(),
                    isThinking: true
                });
                return next;
            });
        }, 1500);

        try {
            await axios.post('/api/process-question-cost', {
                user_id: auth.user.id,
                cost: selectedService.cost,
                service: selectedService.id
            });

            setWalletBalance(prev => prev - selectedService.cost);

            const response = await axios.post('/career-advisor/chat', {
                message: data.question,
                contextId: data.contextId,
                language: language,
                serviceId: selectedService.id,
                history: activeChat?.messages || []
            });

            clearInterval(thinkingInterval);
            setTempMessage(null);

            const assistantMessage = {
                role: 'assistant',
                content: response.data.message,
                timestamp: new Date(),
                isLatest: true
            };

            const finalMessages = [...updatedMessages, assistantMessage];

            const updatedChat = {
                ...activeChat,
                context_id: data.contextId,
                service_id: selectedService.id,
                messages: finalMessages
            };

            setActiveChat(updatedChat);
            setTokensUsed(response.data.tokens);

            await loadUserChats();

        } catch (error) {
            console.error('Error:', error);
            clearInterval(thinkingInterval);
            setTempMessage(null);

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
                title: t('career_advisor.messages.error'),
                description: t('career_advisor.messages.processing_error'),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async (format) => {
        if (!activeChat) return;

        try {
            if (format === 'pptx') {
                const lastAiMessage = activeChat.messages
                    .filter(msg => msg.role === 'assistant')
                    .pop();

                if (lastAiMessage) {
                    const jsonData = extractValidJsonFromMessage(lastAiMessage.content);
                    if (jsonData) {
                        const pptxBlob = await PowerPointService.generateFromJSON(jsonData);

                        const url = window.URL.createObjectURL(pptxBlob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `presentation-${activeChat.context_id}.pptx`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);

                        toast({
                            title: t('common.success'),
                            description: t('career_advisor.messages.export_success')
                        });

                        return;
                    }
                }

                toast({
                    title: t('career_advisor.messages.error'),
                    description: "Aucun contenu de présentation valide trouvé",
                    variant: "destructive",
                });
                return;
            }

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
                title: t('common.success'),
                description: t('career_advisor.messages.export_success')
            });
        } catch (error) {
            toast({
                title: t('career_advisor.messages.error'),
                description: t('career_advisor.messages.export_error'),
                variant: "destructive",
            });
        }
    };

    const createNewChat = () => {
        setActiveChat(null);
        setData('contextId', crypto.randomUUID());
        setData('question', '');
    };

    // Auto-resize textarea
    const handleInputChange = (event) => {
        const textarea = event.target;
        setData('question', textarea.value);
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    };

    // Handle keyboard shortcuts
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (data.question.trim() && !isLoading) {
                handleSubmit(e);
            }
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
                {/* En-tête */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="lg:hidden">
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <Menu className="h-5 w-5" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="w-80">
                                        <SheetHeader>
                                            <SheetTitle className="flex items-center gap-2">
                                                <MessageSquare className="h-5 w-5 text-amber-500" />
                                                {t('career_advisor.history.title')}
                                            </SheetTitle>
                                        </SheetHeader>
                                        <div className="mt-6 space-y-3">
                                            <Button
                                                onClick={createNewChat}
                                                className="w-full bg-gradient-to-r from-amber-500 to-purple-500 text-white h-10"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                {t('career_advisor.chat.new')}
                                            </Button>
                                            <ScrollArea className="h-[calc(100vh-200px)]">
                                                <div className="space-y-2">
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
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </div>

                            <Avatar className="w-8 h-8">
                                <AvatarImage src="/ai-avatar.png" alt="AI" />
                                <AvatarFallback className="bg-gradient-to-br from-amber-500 to-purple-500 text-white">AI</AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    {t('career_advisor.title')}
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 hidden lg:block">
                                    {t(`services.${selectedService.id}.title`)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Sélecteur de service mobile */}
                            <div className="lg:hidden">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <selectedService.icon className="h-4 w-4 mr-2" />
                                            <span className="text-xs">{t(`services.${selectedService.id}.title`).substring(0, 10)}...</span>
                                            <ChevronDown className="h-3 w-3 ml-1" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {SERVICES.map((service) => (
                                            <DropdownMenuItem
                                                key={service.id}
                                                onSelect={() => handleServiceSelection(service)}
                                            >
                                                <service.icon className="h-4 w-4 mr-2" />
                                                {t(`services.${service.id}.title`)}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Balance */}
                            <div className="bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                <Wallet className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                    {walletBalance}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contenu principal */}
                <div className="flex-1 flex min-h-0">
                    {/* Sidebar Desktop */}
                    <div className="hidden lg:flex lg:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col">
                        {/* Nouveau chat */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <Button
                                onClick={createNewChat}
                                className="w-full bg-gradient-to-r from-amber-500 to-purple-500 text-white h-10"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                {t('career_advisor.chat.new')}
                            </Button>
                        </div>

                        {/* Historique */}
                        <div className="flex-1 p-4 min-h-0">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                                {t('career_advisor.history.title')}
                            </h3>
                            <ScrollArea className="h-full">
                                <div className="space-y-2">
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
                        </div>
                    </div>

                    {/* Zone de chat */}
                    <div className="flex-1 flex flex-col min-w-0">
                        {/* Services - affichage si pas de conversation */}
                        {!activeChat && (
                            <div className="flex-1 flex items-center justify-center p-4">
                                <div className="max-w-4xl mx-auto w-full">
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                                            {t('career_advisor.services.choose')}
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {t('career_advisor.services.description')}
                                        </p>
                                    </div>

                                    {/* Services Desktop */}
                                    <div className="hidden lg:grid grid-cols-2 xl:grid-cols-3 gap-4">
                                        {SERVICES.map(service => (
                                            <ServiceCard
                                                key={service.id}
                                                {...service}
                                                isSelected={selectedService.id === service.id}
                                                onClick={() => handleServiceSelection(service)}
                                            />
                                        ))}
                                    </div>

                                    {/* Services Mobile - maximum 2 par ligne */}
                                    <div className="lg:hidden grid grid-cols-2 gap-3">
                                        {SERVICES.map(service => (
                                            <div key={service.id} className="aspect-square">
                                                <MobileServiceCard
                                                    service={service}
                                                    isSelected={selectedService.id === service.id}
                                                    onClick={() => handleServiceSelection(service)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Zone de chat active */}
                        {activeChat && (
                            <>
                                {/* En-tête du chat */}
                                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 flex-shrink-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <selectedService.icon className="h-5 w-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                                                    {t(`services.${selectedService.id}.title`)}
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {t('career_advisor.chat.questions_remaining', {
                                                        count: maxHistory - currentQuestions
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleExport('pdf')}
                                                className="h-8 px-2 text-xs"
                                            >
                                                <Download className="h-3 w-3 mr-1" />
                                                <span className="hidden sm:inline">PDF</span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleExport('docx')}
                                                className="h-8 px-2 text-xs"
                                            >
                                                <FileText className="h-3 w-3 mr-1" />
                                                <span className="hidden sm:inline">DOCX</span>
                                            </Button>
                                            {selectedService.id === 'presentation-ppt' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleExport('pptx')}
                                                    className="h-8 px-2 text-xs"
                                                >
                                                    <Presentation className="h-3 w-3 mr-1" />
                                                    <span className="hidden sm:inline">PPTX</span>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 p-4 min-h-0">
                                    <ScrollArea className="h-full" ref={scrollRef}>
                                        <div className="space-y-3">
                                            <AnimatePresence mode="popLayout">
                                                {(activeChat?.messages || []).map((message, index) => (
                                                    <MessageBubble
                                                        key={index}
                                                        message={{
                                                            ...message,
                                                            isLatest: index === (activeChat?.messages || []).length - 1
                                                        }}
                                                    />
                                                ))}
                                                {tempMessage && (
                                                    <MessageBubble
                                                        key="thinking"
                                                        message={{
                                                            ...tempMessage,
                                                            isLatest: true
                                                        }}
                                                    />
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </ScrollArea>
                                </div>
                            </>
                        )}

                        {/* Zone de saisie fixée */}
                        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
                            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1 relative">
                                        <Textarea
                                            ref={inputRef}
                                            value={data.question}
                                            onChange={handleInputChange}
                                            onKeyDown={handleKeyDown}
                                            placeholder={t(`services.${selectedService.id}.placeholder`)}
                                            className="min-h-[44px] max-h-[120px] pr-12 resize-none border-gray-300 dark:border-gray-600 focus:border-amber-500 dark:focus:border-amber-400 text-sm"
                                            disabled={isLoading}
                                        />
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={processing || isLoading || !data.question.trim()}
                                            className="absolute right-2 bottom-2 h-8 w-8 bg-gradient-to-r from-amber-500 to-purple-500 text-white p-0"
                                        >
                                            {isLoading ? (
                                                <Loader className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Send className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Dialogue de confirmation de suppression */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {t('career_advisor.chat.actions.delete.title')}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {t('career_advisor.chat.actions.delete.description')}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>
                                {t('career_advisor.chat.actions.delete.cancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteChat}
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                {t('career_advisor.chat.actions.delete.confirm')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AuthenticatedLayout>
    );
}
