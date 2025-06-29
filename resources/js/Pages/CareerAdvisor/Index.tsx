import React, { useState, useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { Progress } from "@/Components/ui/progress";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { useToast } from "@/Components/ui/use-toast";
import { useMedian } from '@/Hooks/useMedian';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ScrollArea } from "@/Components/ui/scroll-area";
import { AnimatePresence, motion } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/Components/ui/sheet";
import {
    Brain, Wallet, Clock, Loader, Download, Coins, Trash2,
    MessageSquare, Calendar, History, Menu, Send, Plus,
    FileText, Presentation, ChevronDown, FileSpreadsheet,
    FileInput, MessageCircleQuestion, PenTool, Sparkles, ChevronRight, ChevronLeft,
    Smartphone, Monitor
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

// Ajout du nouveau service "Rapport de stage"
const REPORT_SERVICE = {
    id: 'internship-report',
    icon: FileSpreadsheet,
    title: 'services.internship_report.title',
    description: 'services.internship_report.description',
    cost: 7,
    category: 'document',
    formats: ['docx', 'pdf'],
    comingSoon: true,
    releaseDate: '20 juin 2025'
};

// Modification des composants ServiceCard pour gérer les services "Coming Soon"
const EnhancedServiceCard = ({ service, isSelected, onClick }) => {
    const { t } = useTranslation();
    const isComingSoon = service.comingSoon === true;

    return (
        <motion.div
            whileHover={{ y: isComingSoon ? 0 : -3, transition: { duration: 0.2 } }}
            whileTap={{ scale: isComingSoon ? 0.99 : 0.98 }}
            onClick={isComingSoon ? undefined : onClick}
            className={`cursor-${isComingSoon ? 'not-allowed' : 'pointer'} p-3.5 rounded-lg border transition-all relative overflow-hidden
                ${isSelected
                    ? 'border-amber-400 dark:border-amber-500 bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-500/10 dark:to-purple-500/10 shadow-sm'
                    : isComingSoon
                        ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                        : 'border-gray-200 dark:border-gray-700 hover:border-amber-300/70 dark:hover:border-amber-500/30 bg-white dark:bg-gray-800 hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-purple-50/50 dark:hover:from-amber-500/5 dark:hover:to-purple-500/5'
                }`}
        >
            <div className="flex items-start justify-between mb-2.5">
                <div className={`p-1.5 rounded-lg bg-gradient-to-r ${isComingSoon ? 'from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700' : 'from-amber-500 to-purple-500 dark:from-amber-400 dark:to-purple-400'}`}>
                    <service.icon className="text-white h-4 w-4" />
                </div>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className={`flex items-center gap-1 text-xs font-medium ${isComingSoon
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                                } px-2 py-0.5 rounded-full`}>
                                <Coins className="h-3 w-3" />
                                <span>{service.cost}</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p className="text-xs">Coût du service</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <h3 className="font-medium text-sm mb-1 text-gray-900 dark:text-gray-100">
                {t(`${service.title}`)}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                {t(`${service.description}`)}
            </p>

            {isComingSoon && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/90 to-white/95 dark:via-gray-900/90 dark:to-gray-900/95 flex flex-col items-center justify-end py-3">
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-transparent to-transparent h-14"></div>
                    <div className="text-center max-w-[85%] z-10">
                        <h3 className="font-medium text-sm mb-1 text-gray-900 dark:text-gray-100">
                            {t(`${service.title}`)}
                        </h3>
                        <Badge className="bg-amber-500 text-white dark:bg-amber-600 dark:text-white mb-1 px-2 py-1 text-xs">
                            {t('career_advisor.coming_soon.badge')}
                        </Badge>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            {t('career_advisor.coming_soon.available_from', { date: service.releaseDate })}
                        </p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

// Modification pour la version mobile
const EnhancedMobileServiceCard = ({ service, isSelected, onClick }) => {
    const { t } = useTranslation();
    const isComingSoon = service.comingSoon === true;

    return (
        <motion.div
            whileTap={{ scale: isComingSoon ? 0.99 : 0.98 }}
            onClick={isComingSoon ? undefined : onClick}
            className={`flex items-center gap-2 p-2.5 rounded-lg cursor-${isComingSoon ? 'not-allowed' : 'pointer'} transition-all border relative overflow-hidden ${isSelected
                ? 'bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/20 dark:to-purple-900/20 border-amber-300 dark:border-amber-500/40'
                : isComingSoon
                    ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    : 'hover:bg-amber-50/50 dark:hover:bg-amber-500/5 border-transparent dark:hover:border-amber-500/20 bg-white dark:bg-gray-800'
                }`}
        >
            <div className={`p-1.5 rounded-lg bg-gradient-to-r ${isComingSoon ? 'from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700' : 'from-amber-500 to-purple-500 dark:from-amber-400 dark:to-purple-400'}`}>
                <service.icon className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-xs text-gray-900 dark:text-gray-100 truncate">
                    {t(`${service.title}`)}
                </p>
                <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                    <Coins className="h-2.5 w-2.5" />
                    <span>{service.cost}</span>
                </div>
            </div>

            {isComingSoon && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/90 to-white/95 dark:via-gray-900/90 dark:to-gray-900/95 flex flex-col items-center justify-end py-3">
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-transparent to-transparent h-14"></div>
                    <div className="text-center max-w-[85%] z-10">
                        <h3 className="font-medium text-sm mb-1 text-gray-900 dark:text-gray-100">
                            {t(`${service.title}`)}
                        </h3>
                        <Badge className="bg-amber-500 text-white dark:bg-amber-600 dark:text-white mb-1 px-2 py-1 text-xs">
                            {t('career_advisor.coming_soon.badge')}
                        </Badge>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            {t('career_advisor.coming_soon.available_from', { date: service.releaseDate })}
                        </p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

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
        (chat.preview.length > 35 ? chat.preview.substring(0, 35) + '...' : chat.preview) :
        'Nouvelle conversation';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.95 }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                layout: { duration: 0.15 }
            }}
            className={`relative group p-2.5 rounded-lg cursor-pointer transition-all border ${isActive
                ? 'bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/20 dark:to-purple-900/20 border-amber-300 dark:border-amber-600 shadow-sm'
                : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-amber-200 dark:hover:border-amber-800'
                }`}
            onClick={() => onSelect(chat)}
        >
            <div className="pr-6">
                <div className="flex items-start gap-1.5 mb-1">
                    <div className={`w-1 h-1 rounded-full mt-1.5 ${isActive ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`} />
                    <h3 className="text-xs font-medium text-gray-900 dark:text-gray-100 line-clamp-1 leading-tight" title={chat.preview}>
                        {truncatedPreview}
                    </h3>
                </div>
                <div className="flex items-center gap-2 ml-2.5 mt-1">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5 text-amber-500 dark:text-amber-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(chat.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short'
                            })}
                        </span>
                    </div>
                    {chat.messages_count && (
                        <div className="flex items-center gap-1">
                            <MessageSquare className="h-2.5 w-2.5 text-purple-500 dark:text-purple-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {chat.messages_count}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Tooltip-triggered "Delete" button */}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute right-1 top-1/2 -translate-y-1/2"
                        >
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(chat);
                                }}
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50/70 dark:hover:bg-red-900/20 transition-all duration-200"
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        <p className="text-xs">{t('career_advisor.sidebar.delete')}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </motion.div>
    );
};

// Messages temporaires pour simuler la réflexion de l'IA
const thinkingMessages = [
    "career_advisor.chat.thinking.analyzing",
    "career_advisor.chat.thinking.reflecting",
    "career_advisor.chat.thinking.generating",
    "career_advisor.chat.thinking.finalizing"
];

export default function Index({ auth, userInfo, chatHistories }) {
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const { isReady, isAndroidApp, downloadFile, printDocument } = useMedian();
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
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
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
        // Ne pas permettre la sélection des services marqués comme "coming soon"
        if (service.comingSoon) {
            toast({
                title: t('career_advisor.coming_soon.badge'),
                description: t('career_advisor.coming_soon.available_from', { date: service.releaseDate }),
                variant: "default"
            });
            return;
        }

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
            content: t(thinkingMessages[0]),
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
                    content: t(thinkingMessages[next]),
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

        setIsExporting(true);

        try {
            // Si on est dans l'app Android native avec Median
            if (isAndroidApp && isReady) {
                console.log('🚀 Utilisation du téléchargement natif Android');

                // Construire l'URL de téléchargement directe (GET)
                const downloadUrl = new URL('/career-advisor/export', window.location.origin);
                downloadUrl.searchParams.set('contextId', activeChat.context_id);
                downloadUrl.searchParams.set('format', format);
                downloadUrl.searchParams.set('direct', 'true'); // Paramètre pour forcer le téléchargement direct

                const result = await downloadFile(downloadUrl.toString(), {
                    filename: `conversation-${activeChat.context_id}.${format}`,
                    open: true
                });

                if (result.success) {
                    toast({
                        title: '📱 Téléchargement natif réussi',
                        description: `Le fichier ${format.toUpperCase()} a été téléchargé et ouvert automatiquement`,
                        variant: 'default'
                    });
                } else {
                    throw new Error('Échec du téléchargement natif');
                }
            } else {
                // Fallback vers le téléchargement web classique
                console.log('🌐 Utilisation du téléchargement web');
                await handleExportWeb(format);
            }
        } catch (error) {
            console.error('❌ Erreur lors de l\'export:', error);

            // En cas d'erreur avec Median, essayer le fallback web
            if (isAndroidApp) {
                console.log('🔄 Tentative de fallback vers téléchargement web');
                try {
                    await handleExportWeb(format);
                } catch (fallbackError) {
                    console.error('❌ Erreur fallback:', fallbackError);
                    toast({
                        title: t('career_advisor.messages.error'),
                        description: t('career_advisor.messages.export_error'),
                        variant: "destructive",
                    });
                }
            } else {
                toast({
                    title: t('career_advisor.messages.error'),
                    description: t('career_advisor.messages.export_error'),
                    variant: "destructive",
                });
            }
        } finally {
            setIsExporting(false);
        }
    };

    // Fonction d'impression améliorée avec support Median
    const handlePrint = async () => {
        if (!activeChat) return;

        setIsPrinting(true);

        try {
            // Si on est dans l'app Android native avec Median
            if (isAndroidApp && isReady) {
                console.log('🖨️ Utilisation de l\'impression native Android');

                // Construire l'URL d'impression avec paramètres PDF
                const printUrl = new URL('/career-advisor/print', window.location.origin);
                printUrl.searchParams.set('contextId', activeChat.context_id);
                printUrl.searchParams.set('print_mode', 'pdf');
                printUrl.searchParams.set('show_save_button', 'true');
                printUrl.searchParams.set('auto_print', 'false');

                const result = await printDocument(printUrl.toString());

                if (result.success) {
                    toast({
                        title: '📱 Impression native initiée',
                        description: 'La boîte de dialogue d\'impression Android va s\'ouvrir avec option de sauvegarde PDF',
                        variant: 'default'
                    });
                } else {
                    throw new Error('Échec de l\'impression native');
                }
            } else {
                // Fallback vers l'impression web classique
                console.log('🌐 Utilisation de l\'impression web');
                await handlePrintWeb();
            }
        } catch (error) {
            console.error('❌ Erreur lors de l\'impression:', error);

            // En cas d'erreur avec Median, essayer le fallback web
            if (isAndroidApp) {
                console.log('🔄 Tentative de fallback vers impression web');
                try {
                    await handlePrintWeb();
                } catch (fallbackError) {
                    console.error('❌ Erreur fallback impression:', fallbackError);
                    toast({
                        title: t('career_advisor.messages.error'),
                        description: t('career_advisor.messages.print_error'),
                        variant: "destructive",
                    });
                }
            } else {
                toast({
                    title: t('career_advisor.messages.error'),
                    description: t('career_advisor.messages.print_error'),
                    variant: "destructive",
                });
            }
        } finally {
            setIsPrinting(false);
        }
    };

    // Méthodes fallback web classiques
    const handleExportWeb = async (format: string) => {
        console.log('📄 Export web classique:', format);

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
                        title: '🌐 Téléchargement web réussi',
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
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);

        toast({
            title: '🌐 Téléchargement web réussi',
            description: t('career_advisor.messages.export_success')
        });
    };

    const handlePrintWeb = async () => {
        console.log('🖨️ Impression web classique');

        const printUrl = `/career-advisor/print?contextId=${activeChat.context_id}&print_mode=pdf&show_save_button=true&auto_print=false`;
        const printWindow = window.open(printUrl, '_blank');

        if (printWindow) {
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.print();
                }, 500);
            };

            toast({
                title: '🌐 Impression web initiée',
                description: 'Une nouvelle fenêtre va s\'ouvrir pour l\'impression avec option de sauvegarde PDF'
            });
        }
    };

    const createNewChat = () => {
        setActiveChat(null);
        setData('contextId', crypto.randomUUID());
        setData('question', '');
        setIsMobileSidebarOpen(false);
    };

    // Auto-resize textarea compact
    const handleInputChange = (event) => {
        const textarea = event.target;
        setData('question', textarea.value);
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 80)}px`; // Limit to 80px height
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
            {/* Rendre l'effet de curseur plus subtil */}
            <div className="opacity-20"><FluidCursorEffect zIndex={100} /></div>

            {/* Indicateur de statut Median */}
            <div className="fixed top-4 right-4 z-50">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700">
                    {isAndroidApp ? (
                        <>
                            <Smartphone className="h-3 w-3 text-green-500" />
                            <span>Mode natif Android</span>
                            {isReady ? (
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            ) : (
                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                            )}
                        </>
                    ) : (
                        <>
                            <Monitor className="h-3 w-3 text-blue-500" />
                            <span>Mode web</span>
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        </>
                    )}
                </div>
            </div>

            <div className="h-[calc(100vh-4rem)] flex bg-gray-50 dark:bg-gray-900"> {/* Hauteur ajustée pour header et footer */}
                {/* Sidebar Desktop - Collapsible */}
                <div className={`hidden lg:flex ${isSidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}  bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col transition-all duration-300`}>
                    {/* En-tête sidebar avec titre et wallet */}
                    <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2'} mb-3`}>
                            <Avatar className="w-7 h-7">
                                <AvatarImage src="/mascot/mascot.png" alt="AI Assistant" />
                                <AvatarFallback className="bg-gradient-to-r from-amber-500 to-purple-500 text-white text-xs">
                                    AI
                                </AvatarFallback>
                            </Avatar>
                            {!isSidebarCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <h1 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                                            {t('career_advisor.title')}
                                        </h1>
                                        <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4 bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
                                            <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                                            {t('components.sidebar.pro_badge')}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                        {t(`services.${selectedService.id}.title`)}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Wallet info compactée */}
                        {!isSidebarCollapsed && (
                            <div className="bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/20 dark:to-purple-900/20 border border-amber-200 dark:border-amber-700 px-2.5 py-1.5 rounded-lg flex items-center gap-2 mb-2.5">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                <Wallet className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                                    {walletBalance.toLocaleString()}
                                </span>
                                <span className="text-xs text-amber-600 dark:text-amber-400">
                                    {t('components.sidebar.credits')}
                                </span>
                            </div>
                        )}

                        {/* Bouton collapsible */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={() => {
                                            createNewChat();
                                            setSidebarCollapsed(!isSidebarCollapsed);
                                        }}
                                        className={`${isSidebarCollapsed ? 'w-10 p-0' : 'w-full'} h-8 bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white text-xs rounded-lg shadow-sm transition-all duration-200`}
                                    >
                                        {isSidebarCollapsed ? (
                                            <Plus className="h-3.5 w-3.5" />
                                        ) : (
                                            <>
                                                <Plus className="h-3.5 w-3.5 mr-1.5" />
                                                {t('career_advisor.chat.new')}
                                            </>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p className="text-xs">{t('career_advisor.chat.new')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {/* Historique optimisé */}
                    <div className="flex-1 p-2.5 min-h-0">
                        {!isSidebarCollapsed && (
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    {t('career_advisor.history.title')}
                                </h3>
                                <Badge variant="outline" className="text-xs h-5 px-1.5 border-amber-200 text-amber-600">
                                    {userChats.filter(chat => chat.service_id === selectedService.id).length}
                                </Badge>
                            </div>
                        )}

                        <ScrollArea className="h-[calc(100vh-190px)]">
                            <div className={`${isSidebarCollapsed ? 'space-y-2 items-center flex flex-col' : 'space-y-1.5'}`}>
                                {/* Bouton toggle sidebar */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
                                    className={`${isSidebarCollapsed ? 'w-10 h-10 p-0 rounded-full' : 'w-full h-7'} mb-1 text-gray-500`}
                                >
                                    {isSidebarCollapsed ? (
                                        <ChevronRight className="h-4 w-4" />
                                    ) : (
                                        <div className="flex items-center w-full justify-between">
                                            <span className="text-xs">{t('career_advisor.sidebar.collapse')}</span>
                                            <ChevronLeft className="h-3.5 w-3.5" />
                                        </div>
                                    )}
                                </Button>

                                <AnimatePresence>
                                    {userChats
                                        .filter(chat => chat.service_id === selectedService.id)
                                        .map(chat => (
                                            isSidebarCollapsed ? (
                                                <TooltipProvider key={chat.context_id}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <motion.div
                                                                layout
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleChatSelection(chat)}
                                                                className={`w-10 h-10 flex items-center justify-center rounded-full cursor-pointer ${activeChat?.context_id === chat.context_id
                                                                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 border border-amber-300 dark:border-amber-600'
                                                                    : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                                                                    } shadow-sm transition-all duration-200`}
                                                            >
                                                                <MessageSquare className="h-4 w-4" />
                                                            </motion.div>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="right">
                                                            <p className="text-xs">{chat.preview.substring(0, 30)}{chat.preview.length > 30 ? '...' : ''}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            ) : (
                                                <ChatHistoryCard
                                                    key={chat.context_id}
                                                    chat={chat}
                                                    isActive={activeChat?.context_id === chat.context_id}
                                                    onSelect={handleChatSelection}
                                                    onDelete={confirmDeleteChat}
                                                />
                                            )
                                        ))}
                                </AnimatePresence>
                                {userChats.filter(chat => chat.service_id === selectedService.id).length === 0 && !isSidebarCollapsed && (
                                    <div className="text-center py-4">
                                        <MessageSquare className="h-6 w-6 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {t('career_advisor.history.empty')}
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
                    <div className="lg:hidden px-2.5 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                                            <Menu className="h-3.5 w-3.5 mr-1" />
                                            {t('career_advisor.history.title')}
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="w-[85vw] max-w-[300px] bg-white dark:bg-gray-900 p-4">
                                        <SheetHeader className="text-left">
                                            <SheetTitle className="flex items-center gap-2 text-sm">
                                                <div className="w-7 h-7 bg-gradient-to-r from-amber-500 to-purple-500 rounded-lg flex items-center justify-center">
                                                    <Brain className="h-4 w-4 text-white" />
                                                </div>
                                                {t('career_advisor.title')}
                                                <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4 bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
                                                    <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                                                    {t('components.sidebar.pro_badge')}
                                                </Badge>
                                            </SheetTitle>
                                        </SheetHeader>
                                        <Separator className="my-2.5" />
                                        <div className="space-y-2.5">
                                            <div className="bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/20 dark:to-purple-900/20 border border-amber-200 dark:border-amber-700 px-2.5 py-1.5 rounded-lg flex items-center gap-2 mb-2.5">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                                <Wallet className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                                                    {walletBalance.toLocaleString()}
                                                </span>
                                                <span className="text-xs text-amber-600 dark:text-amber-400">
                                                    {t('components.sidebar.credits')}
                                                </span>
                                            </div>
                                            <Button
                                                onClick={createNewChat}
                                                className="w-full bg-gradient-to-r from-amber-500 to-purple-500 text-white h-8 text-xs"
                                            >
                                                <Plus className="h-3.5 w-3.5 mr-1.5" />
                                                {t('career_advisor.chat.new')}
                                            </Button>
                                            <div className="flex items-center justify-between mt-4 mb-2">
                                                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                    {t('career_advisor.history.title')}
                                                </h3>
                                                <Badge variant="outline" className="text-xs h-5 px-1.5 border-amber-200 text-amber-600">
                                                    {userChats.filter(chat => chat.service_id === selectedService.id).length}
                                                </Badge>
                                            </div>
                                            <ScrollArea className="h-[calc(100vh-220px)]">
                                                <div className="space-y-1.5 pr-2">
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
                                                        <div className="text-center py-4">
                                                            <MessageSquare className="h-6 w-6 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {t('career_advisor.history.empty')}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    </SheetContent>
                                </Sheet>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-7 text-xs">
                                            <selectedService.icon className="h-3.5 w-3.5 mr-1.5" />
                                            <span className="max-w-[70px] truncate">{t(`services.${selectedService.id}.title`)}</span>
                                            <ChevronDown className="h-3 w-3 ml-1" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="min-w-[150px]">
                                        {SERVICES.map((service) => (
                                            <DropdownMenuItem
                                                key={service.id}
                                                onSelect={() => handleServiceSelection(service)}
                                                className="text-xs py-1.5"
                                            >
                                                <service.icon className="h-3.5 w-3.5 mr-1.5" />
                                                {t(`services.${service.id}.title`)}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Balance mobile */}
                            <div className="bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/20 dark:to-purple-900/20 border border-amber-200 dark:border-amber-700 px-2 py-1 rounded-lg flex items-center gap-1.5">
                                <Wallet className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                                    {walletBalance.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Services ou Chat */}
                    {!activeChat ? (
                        <div className="flex-1 flex flex-col justify-between p-3 overflow-hidden">
                            {/* Services section */}
                            <div className="mb-auto">
                                <div className="text-center mb-6">
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.4, type: "spring" }}
                                        className="mb-3"
                                    >
                                        <div className="w-20 h-22 bg-gradient-to-r from-amber-500 to-purple-500 rounded-xl mx-auto flex items-center justify-center mb-2.5 shadow-md">
                                            <Brain className="h-7 w-7 text-white" />
                                            <img src="/mascot/mas.png" alt="" />
                                        </div>
                                    </motion.div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                        {t('career_advisor.services.choose')}
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                        {t('career_advisor.services.description')}
                                    </p>
                                </div>

                                {/* Grille de services plus compacte */}
                                <div className="hidden lg:grid grid-cols-2 xl:grid-cols-3 gap-3 px-2">
                                    {/* Services existants */}
                                    {SERVICES.map(service => (
                                        <EnhancedServiceCard
                                            key={service.id}
                                            service={service}
                                            isSelected={selectedService.id === service.id}
                                            onClick={() => handleServiceSelection(service)}
                                        />
                                    ))}
                                    {/* Nouveau service "coming soon" */}
                                    <EnhancedServiceCard
                                        service={REPORT_SERVICE}
                                        isSelected={false}
                                        onClick={() => handleServiceSelection(REPORT_SERVICE)}
                                    />
                                </div>

                                {/* Services Mobile - 2 par ligne */}
                                <div className="lg:hidden grid grid-cols-2 gap-2 px-2">
                                    {/* Services existants */}
                                    {SERVICES.map(service => (
                                        <EnhancedMobileServiceCard
                                            key={service.id}
                                            service={service}
                                            isSelected={selectedService.id === service.id}
                                            onClick={() => handleServiceSelection(service)}
                                        />
                                    ))}
                                    {/* Nouveau service "coming soon" */}
                                    <EnhancedMobileServiceCard
                                        service={REPORT_SERVICE}
                                        isSelected={false}
                                        onClick={() => handleServiceSelection(REPORT_SERVICE)}
                                    />
                                </div>
                            </div>

                            {/* Input pour commencer directement */}
                            <div className="max-w-4xl mx-auto w-full mt-4 px-2">
                                <form onSubmit={handleSubmit} className="relative">
                                    <Textarea
                                        ref={inputRef}
                                        value={data.question}
                                        onChange={handleInputChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder={t('career_advisor.sidebar.ask_question', { service: t(`services.${selectedService.id}.title`) })}
                                        className=" min-h-[48px] max-h-[80px] pr-20 pl-10 py-3 resize-none border border-gray-200 dark:border-gray-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-lg text-sm bg-white dark:bg-gray-800 shadow-sm"
                                        disabled={isLoading}
                                        maxLength={2000}
                                    />

                                    {/* Icône du service sélectionné */}
                                    <div className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500">
                                        <selectedService.icon className="h-4 w-4" />
                                    </div>

                                    <div className="absolute right-2 bottom-2 flex gap-1">
                                        {/* Raccourci touches */}
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="border border-gray-200 dark:border-gray-700 rounded-md px-1.5 py-0.5 bg-gray-50 dark:bg-gray-800 flex items-center">
                                                        <kbd className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">⏎</kbd>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">
                                                    <p className="text-xs">{t('career_advisor.sidebar.enter_to_send')}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        {/* Indicateur de coût compact */}
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                                            <Coins className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                            <span className="text-xs text-amber-700 dark:text-amber-300">
                                                {selectedService.cost}
                                            </span>
                                        </div>
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={processing || isLoading || !data.question.trim()}
                                            className="h-6 w-6 bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white p-0 rounded-md shadow-sm transition-all disabled:opacity-50"
                                        >
                                            {isLoading ? (
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                >
                                                    <Loader className="h-3 w-3" />
                                                </motion.div>
                                            ) : (
                                                <Send className="h-3 w-3" />
                                            )}
                                        </Button>
                                    </div>
                                </form>

                                {/* Compteur de caractères discret */}
                                {data.question.length > 0 && (
                                    <div className="text-right mt-1 pr-1">
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                            {data.question.length}/2000
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col min-h-0">
                            {/* En-tête du chat plus compact */}
                            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-2 px-3 flex-shrink-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-purple-500 rounded-lg flex items-center justify-center">
                                            <selectedService.icon className="h-3.5 w-3.5 text-white" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                                                {t(`services.${selectedService.id}.title`)}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                    <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        Active
                                                    </span>
                                                </div>
                                                <Badge variant="outline" className="text-xs h-4 px-1.5 py-0 border-amber-200 text-amber-600">
                                                    {maxHistory - currentQuestions}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bouton export compact */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 px-2"
                                            >
                                                <Download className="h-3 w-3 mr-1" />
                                                <span className="hidden sm:inline text-xs">Export</span>
                                                <ChevronDown className="h-2.5 w-2.5 ml-0.5" />
                                                {isAndroidApp && isReady && (
                                                    <Smartphone className="ml-1 h-2.5 w-2.5 text-green-500" />
                                                )}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="min-w-[120px]">
                                            <DropdownMenuItem onClick={() => handleExport('pdf')} className="text-xs py-1.5">
                                                <FileText className="h-3.5 w-3.5 mr-2" />
                                                PDF
                                                {isAndroidApp && isReady && (
                                                    <Smartphone className="ml-auto h-3 w-3 text-green-500" />
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleExport('docx')} className="text-xs py-1.5">
                                                <FileText className="h-3.5 w-3.5 mr-2" />
                                                DOCX
                                                {isAndroidApp && isReady && (
                                                    <Smartphone className="ml-auto h-3 w-3 text-green-500" />
                                                )}
                                            </DropdownMenuItem>
                                            {selectedService.id === 'presentation-ppt' && (
                                                <DropdownMenuItem onClick={() => handleExport('pptx')} className="text-xs py-1.5">
                                                    <Presentation className="h-3.5 w-3.5 mr-2" />
                                                    PPTX
                                                    {isAndroidApp && isReady && (
                                                        <Smartphone className="ml-auto h-3 w-3 text-green-500" />
                                                    )}
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Zone de messages avec hauteur fixe optimisée */}
                            <div className="flex-1 min-h-0">
                                <ScrollArea className="h-[calc(100vh-160px)]" ref={scrollRef}>
                                    <div className="max-w-4xl mx-auto space-y-3 p-3">
                                        <AnimatePresence mode="popLayout">
                                            {/* Optimisation de l'affichage avec animations */}
                                            {(activeChat?.messages || []).map((message, index) => (
                                                <motion.div
                                                    key={`message-${index}`}
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
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
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
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

                            {/* Zone de saisie compacte */}
                            <div className="relative px-3 py-2 flex-shrink-0 border-t border-gray-200 dark:border-gray-800">
                                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                                    <div className="relative">
                                        <Textarea
                                            ref={inputRef}
                                            value={data.question}
                                            onChange={handleInputChange}
                                            onKeyDown={handleKeyDown}
                                            placeholder={t(`services.${selectedService.id}.placeholder`)}
                                            className=" min-h-[40px] max-h-[80px] pr-20 pl-3 py-2 resize-none border border-gray-200 dark:border-gray-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-lg text-sm bg-white dark:bg-gray-800 transition-all"
                                            disabled={isLoading}
                                            maxLength={2000}
                                        />
                                        <div className="absolute right-2 bottom-2 flex gap-1">
                                            {/* Indicateur de coût compact */}
                                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                                                <Coins className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                                <span className="text-xs text-amber-700 dark:text-amber-300">
                                                    -{selectedService.cost}
                                                </span>
                                            </div>
                                            <Button
                                                type="submit"
                                                size="sm"
                                                disabled={processing || isLoading || !data.question.trim()}
                                                className="h-6 w-6 bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white p-0 rounded-md shadow-sm transition-all disabled:opacity-50"
                                            >
                                                {isLoading ? (
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    >
                                                        <Loader className="h-3 w-3" />
                                                    </motion.div>
                                                ) : (
                                                    <Send className="h-3 w-3" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Mini-barre d'informations */}
                                    <div className="flex justify-between items-center text-xs px-0.5 mt-1">
                                        <span className="text-gray-500 dark:text-gray-400 text-[10px]">
                                            {data.question.length}/2000
                                        </span>
                                        {data.question.length > 0 && (
                                            <span className="text-gray-400 dark:text-gray-500 text-[10px] flex items-center gap-1">
                                                <kbd className="px-1 py-0 text-[10px] font-mono bg-gray-100 dark:bg-gray-700 rounded">⏎</kbd>
                                                {t('career_advisor.sidebar.enter_to_send')}
                                            </span>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Dialogue de suppression optimisé */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="sm:max-w-sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-base">
                            <div className="w-7 h-7 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                                <Trash2 className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                            </div>
                            {t('career_advisor.chat.actions.delete.title')}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600 dark:text-gray-400 text-sm mt-1.5">
                            {t('career_advisor.chat.actions.delete.description')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 mt-3">
                        <AlertDialogCancel className="text-sm py-1.5 px-3 h-9">
                            {t('career_advisor.chat.actions.delete.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteChat}
                            className="bg-red-500 hover:bg-red-600 text-white shadow-sm text-sm py-1.5 px-3 h-9"
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            {t('career_advisor.chat.actions.delete.confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
