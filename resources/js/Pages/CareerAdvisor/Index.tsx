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
    MessageSquare, Calendar, History, Menu, PenTool, FileText
} from 'lucide-react';
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
import axios from 'axios';

const TOKEN_LIMIT = 2000;

const getMaxHistoryForService = (serviceId) => {
    return serviceId === 'interview-prep' ? 10 : 3;
};

const countUserQuestions = (messages) => {
    return messages?.filter(msg => msg.role === 'user').length || 0;
};

// Composant InfoCard
const InfoCard = ({ icon: Icon, title, value, type = "default" }) => {
    const { t } = useTranslation();

    const styles = {
        default: "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-500/10 dark:to-amber-500/5",
        warning: "bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-500/10 dark:to-red-500/5",
        success: "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-500/10 dark:to-emerald-500/5"
    };

    const iconStyles = {
        default: "text-amber-500 dark:text-amber-400",
        warning: "text-red-500 dark:text-red-400",
        success: "text-emerald-500 dark:text-emerald-400"
    };

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${styles[type]} p-4 rounded-xl border border-transparent dark:border-gray-800 backdrop-blur-sm flex items-center gap-3 transition-all`}
        >
            <div className="p-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                <Icon className={`w-5 h-5 ${iconStyles[type]}`} />
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t(title)}</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {typeof value === 'number' ? `${value} ${t('common.tokens')}` : value}
                </p>
            </div>
        </motion.div>
    );
};
// Composant MobileServiceCard
// Composant MobileServiceCard corrigé
const MobileServiceCard = ({ service, isSelected, onClick }) => {
    const { t } = useTranslation();

    return (
        <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                ${isSelected
                ? 'bg-amber-100 dark:bg-amber-500/20'
                : 'hover:bg-amber-50 dark:hover:bg-amber-500/10'
            }`}
        >
            <service.icon className="h-5 w-5 text-amber-500 dark:text-amber-400" />
            <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                    {t(`${service.title}`)}
                </p>
                <div className="flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400">
                    <Coins className="h-3 w-3" />
                    <span>{service.cost} </span>
                </div>
            </div>
        </motion.div>
    );
};
// Composant ChatHistoryCard
const ChatHistoryCard = ({ chat, isActive, onSelect, onDelete }) => {
    const { t } = useTranslation();

    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg border cursor-pointer transition-all
                ${isActive
                ? 'border-amber-500 bg-amber-50 dark:border-amber-400 dark:bg-amber-500/10'
                : 'border-transparent hover:border-amber-200 dark:hover:border-amber-500/30'
            }`}
            onClick={() => onSelect(chat)}
        >
            <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                        {chat.preview}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
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
                    className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </motion.div>
    );
};

// Début du composant principal
export default function Index({ auth, userInfo, chatHistories }) {
    const { t } = useTranslation();
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
            setData('question', DEFAULT_PROMPTS[service.id][language] || '');
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

    return (
        <AuthenticatedLayout user={auth.user}>
            <div className="container mx-auto p-4 space-y-6">
                {/* En-tête mobile */}
                <div className="lg:hidden flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Brain className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {t('career_advisor.title')}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="sm"
                                        className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <History className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left"
                                          className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
                                <SheetHeader>
                                    <SheetTitle className="text-gray-900 dark:text-gray-100">
                                        {t('career_advisor.history.title')}
                                    </SheetTitle>
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
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                            <Wallet className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                {walletBalance}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Services Desktop */}
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

                {/* Services Mobile */}
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

                {/* Zone principale */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Historique des conversations (Desktop) */}
                    <Card className="hidden lg:block border-amber-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                        <CardHeader className="border-b border-amber-100 dark:border-gray-800">
                            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                <MessageSquare className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                                {t('career_advisor.history.title')}
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

                    {/* Zone de chat */}
                    <Card className="lg:col-span-3 border-amber-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                        <div className="p-4 border-b border-amber-100 dark:border-gray-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <selectedService.icon className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                        {t(`${selectedService.title}`)}
                                    </h3>
                                    <div className="hidden sm:flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400">
                                        <Coins className="h-4 w-4" />
                                        {selectedService.cost}
                                    </div>
                                </div>
                                {activeChat && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleExport('pdf')}
                                            className="border-amber-200 dark:border-gray-700 text-gray-700 dark:text-gray-300
                                            hover:bg-amber-50 dark:hover:bg-gray-800"
                                        >
                                            <Download className="h-4 w-4 sm:mr-2" />
                                            <span className="hidden sm:inline">PDF</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleExport('docx')}
                                            className="border-amber-200 dark:border-gray-700 text-gray-700 dark:text-gray-300
                                            hover:bg-amber-50 dark:hover:bg-gray-800"
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
                                    className="min-h-[100px] border-amber-200 dark:border-gray-700
                                    focus:border-amber-500 dark:focus:border-amber-400
                                    bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <Clock className="h-4 w-4" />
                                        {t('career_advisor.chat.questions_remaining', {
                                            count: maxHistory - currentQuestions
                                        })}
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={processing || isLoading || !data.question.trim()}
                                        className="bg-gradient-to-r from-amber-500 to-purple-500
                                        hover:from-amber-600 hover:to-purple-600 text-white
                                        dark:from-amber-400 dark:to-purple-400
                                        dark:hover:from-amber-500 dark:hover:to-purple-500"
                                    >
                                        {isLoading ? (
                                            <Loader className="h-4 w-4 animate-spin" />
                                        ) : (
                                            t('career_advisor.chat.send')
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Card>
                </div>

                {/* Dialogue de confirmation de suppression */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-gray-900 dark:text-gray-100">
                                {t('career_advisor.chat.actions.delete.title')}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
                                {t('career_advisor.chat.actions.delete.description')}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="border-gray-200 dark:border-gray-700
                            hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
                                {t('career_advisor.chat.actions.delete.cancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteChat}
                                className="bg-red-500 hover:bg-red-600 text-white
                                dark:bg-red-600 dark:hover:bg-red-700"
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
