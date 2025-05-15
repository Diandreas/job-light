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
    FileInput, MessageCircleQuestion, PenTool, Sparkles
} from 'lucide-react';
import { MessageBubble } from '@/Components/ai/MessageBubble';
import { ServiceCard, MobileServiceCard } from '@/Components/ai/ServiceCard';
import { SERVICES, DEFAULT_PROMPTS } from '@/Components/ai/constants';
import { PowerPointService } from '@/Components/ai/PresentationService';
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Badge } from "@/Components/ui/badge";
import { Separator } from "@/Components/ui/separator";
import FluidCursorEffect from '@/Components/ai/FluidCursorEffect';
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip";
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

    const truncatedPreview = chat.preview ?
        (chat.preview.length > 40 ? chat.preview.substring(0, 40) + '...' : chat.preview) :
        'Nouvelle conversation';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                layout: { duration: 0.2 }
            }}
            className={`relative group p-3 rounded-lg cursor-pointer transition-all duration-300 border ${
                isActive
                    ? 'bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/20 dark:to-purple-900/20 border-amber-300 dark:border-amber-600 shadow-md shadow-amber-100/50 dark:shadow-amber-900/20'
                    : 'bg-white dark:bg-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-amber-200 dark:hover:border-amber-800 shadow-sm hover:shadow-md'
            }`}
            onClick={() => onSelect(chat)}
        >
            {/* Contenu principal */}
            <div className="pr-10">
                <div className="flex items-start gap-2 mb-1.5">
                    <motion.div
                        className={`w-1.5 h-1.5 rounded-full mt-2 ${
                            isActive ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                        animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                    />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight" title={chat.preview}>
                        {truncatedPreview}
                    </h3>
                </div>
                <div className="flex items-center gap-3 ml-3.5">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {new Date(chat.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short'
                            })}
                        </span>
                    </div>
                    {chat.messages_count && (
                        <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3 text-purple-500 dark:text-purple-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {chat.messages_count}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Bouton supprimer */}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            whileHover={{ rotate: 10, scale: 1.1 }}
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                        >
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(chat);
                                }}
                                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Supprimer la conversation</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
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
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const scrollRef = useRef(null);
    const inputRef = useRef(null);
    const thinkingIntervalRef = useRef(null);
    const maxHistory = getMaxHistoryForService(selectedService.id);
    const currentQuestions = countUserQuestions(activeChat?.messages);

    const { data, setData, processing } = useForm({
        question: '',
        contextId: activeChat?.context_id || crypto.randomUUID(),
        language: language
    });

    useEffect(() => {
        loadUserChats();
        return () => {
            if (thinkingIntervalRef.current) {
                clearInterval(thinkingIntervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            const scrollElement = scrollRef.current;
            scrollElement.scrollTop = scrollElement.scrollHeight;
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
        // Fermer le sidebar mobile après sélection
        setIsMobileSidebarOpen(false);
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
            // Fermer le sidebar mobile après sélection
            setIsMobileSidebarOpen(false);
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

        // Nettoyer l'ancien interval s'il existe
        if (thinkingIntervalRef.current) {
            clearInterval(thinkingIntervalRef.current);
        }

        thinkingIntervalRef.current = setInterval(() => {
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

            if (thinkingIntervalRef.current) {
                clearInterval(thinkingIntervalRef.current);
            }
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
            if (thinkingIntervalRef.current) {
                clearInterval(thinkingIntervalRef.current);
            }
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
        setIsMobileSidebarOpen(false);
    };

    // Auto-resize textarea
    const handleInputChange = (event) => {
        const textarea = event.target;
        setData('question', textarea.value);
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
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
            <FluidCursorEffect zIndex={100} />
            <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
                {/* Sidebar Desktop - Plus compact */}
                <div className="hidden lg:flex lg:w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col">
                    {/* En-tête sidebar avec titre et wallet */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                        <div className="flex items-center gap-3 mb-4">
                            <Avatar className="w-8 h-8 ring-2 ring-amber-100 dark:ring-amber-900/30">
                                <AvatarImage src="/ai-avatar.png" alt="AI Assistant" />
                                <AvatarFallback className="bg-gradient-to-br from-amber-500 via-purple-500 to-amber-600 text-white text-sm font-semibold">
                                    AI
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-base font-bold text-gray-900 dark:text-gray-100">
                                        {t('career_advisor.title')}
                                    </h1>
                                    <Badge variant="secondary" className="text-xs bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        Pro
                                    </Badge>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {t(`services.${selectedService.id}.title`)}
                                </p>
                            </div>
                        </div>

                        {/* Wallet info */}
                        <div className="bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/20 dark:to-purple-900/20 border border-amber-200 dark:border-amber-700 px-3 py-2 rounded-lg flex items-center gap-2 mb-3">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            <Wallet className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                            <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                                {walletBalance.toLocaleString()}
                            </span>
                            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                crédits
                            </span>
                        </div>

                        <Button
                            onClick={createNewChat}
                            className="w-full bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white h-9 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {t('career_advisor.chat.new')}
                        </Button>
                    </div>

                    {/* Historique */}
                    <div className="flex-1 p-3 min-h-0">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {t('career_advisor.history.title')}
                            </h3>
                            <Badge variant="outline" className="text-xs border-amber-200 text-amber-600">
                                {userChats.filter(chat => chat.service_id === selectedService.id).length}
                            </Badge>
                        </div>
                        <ScrollArea className="h-full">
                            <div className="space-y-2">
                                <AnimatePresence>
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
                                </AnimatePresence>
                                {userChats.filter(chat => chat.service_id === selectedService.id).length === 0 && (
                                    <div className="text-center py-6">
                                        <MessageSquare className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Aucune conversation
                                        </p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                {/* Zone de chat */}
                <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900 h-full">
                    {/* Mobile header avec service selector et menu */}
                    <div className="lg:hidden px-3 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-8">
                                            <Menu className="h-4 w-4 mr-1" />
                                            {t('career_advisor.history.title')}
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="w-72 bg-white dark:bg-gray-900">
                                        <SheetHeader className="text-left">
                                            <SheetTitle className="flex items-center gap-2 text-base">
                                                <Brain className="h-4 w-4 text-amber-500" />
                                                {t('career_advisor.history.title')}
                                            </SheetTitle>
                                        </SheetHeader>
                                        <Separator className="my-3" />
                                        <div className="space-y-3">
                                            <Button
                                                onClick={createNewChat}
                                                className="w-full bg-gradient-to-r from-amber-500 to-purple-500 text-white h-9"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                {t('career_advisor.chat.new')}
                                            </Button>
                                            <ScrollArea className="h-[calc(100vh-180px)]">
                                                <div className="space-y-2">
                                                    <AnimatePresence>
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
                                                    </AnimatePresence>
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    </SheetContent>
                                </Sheet>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="text-xs h-8">
                                            <selectedService.icon className="h-3.5 w-3.5 mr-1.5" />
                                            <span className="max-w-[80px] truncate">{t(`services.${selectedService.id}.title`)}</span>
                                            <ChevronDown className="h-3 w-3 ml-1" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
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

                            {/* Balance mobile */}
                            <div className="bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/20 dark:to-purple-900/20 border border-amber-200 dark:border-amber-700 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                                <Wallet className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                                    {walletBalance.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Services ou Chat */}
                    {!activeChat ? (
                        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
                            <div className="max-w-5xl mx-auto w-full">
                                <div className="text-center mb-8">
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.5, type: "spring" }}
                                        className="mb-4"
                                    >
                                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-purple-500 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-lg">
                                            <Brain className="h-8 w-8 text-white" />
                                        </div>
                                    </motion.div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                                        {t('career_advisor.services.choose')}
                                    </h2>
                                    <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                        {t('career_advisor.services.description')}
                                    </p>
                                </div>

                                {/* Services Grid - Plus compact */}
                                <div className="hidden lg:grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                                    {SERVICES.map(service => (
                                        <ServiceCard
                                            key={service.id}
                                            {...service}
                                            isSelected={selectedService.id === service.id}
                                            onClick={() => handleServiceSelection(service)}
                                        />
                                    ))}
                                </div>

                                {/* Services Mobile */}
                                <div className="lg:hidden space-y-3">
                                    {SERVICES.map(service => (
                                        <MobileServiceCard
                                            key={service.id}
                                            service={service}
                                            isSelected={selectedService.id === service.id}
                                            onClick={() => handleServiceSelection(service)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col min-h-0">
                            {/* En-tête du chat */}
                            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-3 flex-shrink-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-purple-500 rounded-lg flex items-center justify-center">
                                            <selectedService.icon className="h-4 w-4 text-white" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                                                {t(`services.${selectedService.id}.title`)}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <div className="flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                        Active
                                                    </span>
                                                </div>
                                                <Badge variant="outline" className="text-xs border-amber-200 text-amber-600 h-5">
                                                    {maxHistory - currentQuestions} restantes
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bouton export */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 px-3"
                                            >
                                                <Download className="h-3.5 w-3.5 mr-1" />
                                                <span className="hidden sm:inline text-xs">Exporter</span>
                                                <ChevronDown className="h-3 w-3 ml-1" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleExport('pdf')}>
                                                <FileText className="h-4 w-4 mr-2" />
                                                PDF
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleExport('docx')}>
                                                <FileText className="h-4 w-4 mr-2" />
                                                DOCX
                                            </DropdownMenuItem>
                                            {selectedService.id === 'presentation-ppt' && (
                                                <DropdownMenuItem onClick={() => handleExport('pptx')}>
                                                    <Presentation className="h-4 w-4 mr-2" />
                                                    PPTX
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 min-h-0">
                                <ScrollArea className="h-full p-3" ref={scrollRef}>
                                    <div className="max-w-4xl mx-auto space-y-4">
                                        <AnimatePresence mode="popLayout">
                                            {(activeChat?.messages || []).map((message, index) => (
                                                <motion.div
                                                    key={`message-${index}`}
                                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
                                                >
                                                    <MessageBubble
                                                        message={{
                                                            ...message,
                                                            isLatest: index === (activeChat?.messages || []).length - 1
                                                        }}
                                                    />
                                                </motion.div>
                                            ))}
                                            {tempMessage && (
                                                <motion.div
                                                    key="thinking"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <MessageBubble
                                                        message={{
                                                            ...tempMessage,
                                                            isLatest: true
                                                        }}
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    )}

                    {/* Zone de saisie - Input seulement, sans fond */}
                    <div className="relative p-3 flex-shrink-0">
                        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                            <div className="relative">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="relative"
                                >
                                    <Textarea
                                        ref={inputRef}
                                        value={data.question}
                                        onChange={handleInputChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder={t(`services.${selectedService.id}.placeholder`)}
                                        className="min-h-[44px] max-h-[100px] pr-24 pl-3 py-2.5 resize-none border-2 border-gray-200 dark:border-gray-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl text-sm bg-white dark:bg-gray-800 transition-all duration-200 focus:shadow-md"
                                        disabled={isLoading}
                                        maxLength={2000}
                                    />
                                    <div className="absolute right-2.5 bottom-2.5 flex gap-1.5">
                                        {/* Indicateur de coût */}
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md"
                                        >
                                            <Coins className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                            <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                                                -{selectedService.cost}
                                            </span>
                                        </motion.div>
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Button
                                                type="submit"
                                                size="sm"
                                                disabled={processing || isLoading || !data.question.trim()}
                                                className="h-7 w-7 bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white p-0 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
                                            >
                                                {isLoading ? (
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    >
                                                        <Loader className="h-3.5 w-3.5" />
                                                    </motion.div>
                                                ) : (
                                                    <Send className="h-3.5 w-3.5" />
                                                )}
                                            </Button>
                                        </motion.div>
                                    </div>
                                </motion.div>

                                {/* Barre de progression des caractères */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-1.5 px-1"
                                >
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500 dark:text-gray-400">
                                            {data.question.length}/2000
                                        </span>
                                        <span className="text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                            <kbd className="px-1 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-700 rounded">⏎</kbd>
                                            envoyer
                                        </span>
                                    </div>
                                    {data.question.length > 1500 && (
                                        <motion.div
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            className="mt-1"
                                        >
                                            <Progress
                                                value={(data.question.length / 2000) * 100}
                                                className="h-1 bg-gray-200 dark:bg-gray-700"
                                            />
                                        </motion.div>
                                    )}
                                </motion.div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Dialogue de suppression amélioré */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <motion.div
                                initial={{ rotate: 0 }}
                                animate={{ rotate: [0, -10, 10, -10, 0] }}
                                transition={{ duration: 0.5 }}
                                className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center"
                            >
                                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </motion.div>
                            {t('career_advisor.chat.actions.delete.title')}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600 dark:text-gray-400 mt-2">
                            {t('career_advisor.chat.actions.delete.description')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 mt-4">
                        <AlertDialogCancel className="sm:mr-0">
                            {t('career_advisor.chat.actions.delete.cancel')}
                        </AlertDialogCancel>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <AlertDialogAction
                                onClick={handleDeleteChat}
                                className="bg-red-500 hover:bg-red-600 text-white shadow-sm"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('career_advisor.chat.actions.delete.confirm')}
                            </AlertDialogAction>
                        </motion.div>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
