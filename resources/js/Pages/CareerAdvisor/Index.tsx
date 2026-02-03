import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { Progress } from "@/Components/ui/progress";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { useToast } from "@/Components/ui/use-toast";
import { useMedian } from '@/hooks/useMedian';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ScrollArea } from "@/Components/ui/scroll-area";
import { AnimatePresence, motion } from 'framer-motion';
import {
    Brain, Wallet, Clock, Loader, Download, Coins, Trash2,
    MessageSquare, Calendar, Menu, Send, Plus,
    FileText, Presentation, ChevronDown, FileSpreadsheet,
    FileInput, MessageCircleQuestion, PenTool, Sparkles, ChevronRight, ChevronLeft,
    Smartphone, Monitor, Zap, MoreHorizontal, Star,
    TrendingUp, Target, Users, BookOpen, Award, Briefcase, PanelsTopLeft
} from 'lucide-react';
import EnhancedMessageBubble from '@/Components/ai/enhanced/EnhancedMessageBubble';
import { LuxuryMessageBubble } from '@/Components/ai/luxury/LuxuryMessageBubble';
import { LuxurySidebar } from '@/Components/ai/luxury/LuxurySidebar';
import { LuxuryChatInput } from '@/Components/ai/luxury/LuxuryChatInput';
import { LuxuryServiceCard } from '@/Components/ai/luxury/LuxuryServiceCard';
import { SERVICES, DEFAULT_PROMPTS } from '@/Components/ai/constants';
import { PowerPointService } from '@/Components/ai/PresentationService';
import ServiceSelector from '@/Components/ai/specialized/ServiceSelector';
import ArtifactSidebar from '@/Components/ai/artifacts/ArtifactSidebar';
import { ArtifactData } from '@/Components/ai/artifacts/ArtifactDetector';
import { cn } from '@/lib/utils';
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

// Hook pour l'input optimisé
const useSmartInput = () => {
    const [inputHeight, setInputHeight] = useState(36);
    const inputRef = useRef(null);

    const adjustHeight = useCallback((element) => {
        if (!element) return;
        element.style.height = 'auto';
        const newHeight = Math.min(Math.max(element.scrollHeight, 36), 72);
        element.style.height = `${newHeight}px`;
        setInputHeight(newHeight);
    }, []);

    const handleInputChange = useCallback((event, setData) => {
        const textarea = event.target;
        setData('question', textarea.value);
        adjustHeight(textarea);
    }, [adjustHeight]);

    return { inputRef, inputHeight, handleInputChange, adjustHeight };
};



// Header compact
const CompactHeader = ({
    selectedService,
    walletBalance,
    onNewChat,
    onExport,
    isExporting,
    isAndroidApp,
    isReady,
    artifactCount,
    onToggleArtifacts,
    artifactSidebarOpen
}) => {
    const { t } = useTranslation();

    return (
        <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/10">
                            <selectedService.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 text-base truncate tracking-tight">
                                {t(`services.${selectedService.id}.title`)}
                            </h3>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-600 rounded-full" />
                                    <span className="text-xs text-neutral-500 dark:text-neutral-500">{t('components.sidebar.active')}</span>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Nouveau chat */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={onNewChat}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">{t('components.career_advisor.interface.new_chat')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Artefacts */}
                    {artifactCount > 0 && (
                        <Button
                            onClick={onToggleArtifacts}
                            variant="outline"
                            size="sm"
                            className={cn(
                                "h-9 px-3 relative",
                                artifactSidebarOpen ? "bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-50" : ""
                            )}
                        >
                            <Sparkles className="h-4 w-4 mr-1.5" />
                            <span className="text-sm">Artefacts</span>
                            <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs bg-amber-500 text-white border-amber-400">
                                {artifactCount}
                            </Badge>
                        </Button>
                    )}

                    {/* Export */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2"
                                disabled={isExporting}
                            >
                                {isExporting ? (
                                    <Loader className="h-3.5 w-3.5 mr-1 animate-spin" />
                                ) : (
                                    <Download className="h-3.5 w-3.5 mr-1" />
                                )}
                                <span className="text-xs hidden sm:inline">{t('components.career_advisor.interface.export')}</span>
                                <ChevronDown className="h-3 w-3 ml-1" />
                                {isAndroidApp && isReady && (
                                    <Smartphone className="ml-1 h-3 w-3 text-green-500" />
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onExport('pdf')} className="text-xs">
                                <FileText className="h-3.5 w-3.5 mr-2" />
                                PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onExport('docx')} className="text-xs">
                                <FileText className="h-3.5 w-3.5 mr-2" />
                                DOCX
                            </DropdownMenuItem>
                            {selectedService.id === 'presentation-ppt' && (
                                <DropdownMenuItem onClick={() => onExport('pptx')} className="text-xs">
                                    <Presentation className="h-3.5 w-3.5 mr-2" />
                                    PPTX
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
};



// Messages temporaires de réflexion
const thinkingMessages = [
    "career_advisor.chat.thinking.analyzing",
    "career_advisor.chat.thinking.reflecting",
    "career_advisor.chat.thinking.generating",
    "career_advisor.chat.thinking.finalizing"
];

const getMaxHistoryForService = (serviceId) => {
    return serviceId === 'interview-prep' ? 10 : 3;
};

const countUserQuestions = (messages) => {
    return messages?.filter(msg => msg.role === 'user').length || 0;
};

export default function EnhancedCareerAdvisor({ auth, userInfo, chatHistories }) {
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const { isReady, isAndroidApp, downloadFile, createDirectDownloadUrl, isUrlCompatible } = useMedian();

    // États principaux
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
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem('career_advisor_sidebar_collapsed');
        return saved ? JSON.parse(saved) : false; // Ouvert par défaut pour la nouvelle interface
    });
    const [isExporting, setIsExporting] = useState(false);
    const [artifactSidebarOpen, setArtifactSidebarOpen] = useState(false);
    const [currentArtifacts, setCurrentArtifacts] = useState([]);
    const [currentArtifactContent, setCurrentArtifactContent] = useState('');
    const [showTopMascot, setShowTopMascot] = useState(true);

    // Refs
    const scrollRef = useRef(null);
    const inputRef = useRef(null);
    const thinkingIntervalRef = useRef(null);

    // Valeurs calculées
    const maxHistory = getMaxHistoryForService(selectedService.id);
    const currentQuestions = countUserQuestions(activeChat?.messages);

    const { data, setData, processing } = useForm({
        question: '',
        contextId: activeChat?.context_id || crypto.randomUUID(),
        language: language
    });

    useEffect(() => {
        loadUserChats();

        // Écouter l'événement personnalisé du bouton menu flottant
        const handleToggleSidebar = () => {
            setIsMobileSidebarOpen(prev => !prev);
            // Effet de vibration tactile si disponible
            if ('vibrate' in navigator) {
                navigator.vibrate(50);
            }
        };

        window.addEventListener('toggleCareerAdvisorSidebar', handleToggleSidebar);

        return () => {
            if (thinkingIntervalRef.current) {
                clearInterval(thinkingIntervalRef.current);
            }
            window.removeEventListener('toggleCareerAdvisorSidebar', handleToggleSidebar);
        };
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            const scrollElement = scrollRef.current;
            setTimeout(() => {
                scrollElement.scrollTo({
                    top: scrollElement.scrollHeight,
                    behavior: 'smooth'
                });
            }, 100);
        }
    }, [activeChat?.messages, tempMessage]);

    useEffect(() => {
        setLanguage(i18n.language);
        setData('question', '');
    }, [i18n.language]);

    useEffect(() => {
        setData('question', '');
    }, [selectedService]);

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
        if (service.comingSoon) {
            toast({
                title: t('career_advisor.coming_soon.badge'),
                description: t('career_advisor.coming_soon.available_from', { date: service.releaseDate }),
                variant: "default"
            });
            return;
        }

        // Redirection for Immersive Modules
        if (service.id === 'cover-letter') {
            window.location.href = route('career-advisor.cover-letter.index');
            return;
        }
        if (service.id === 'cv-heatmap') {
            window.location.href = route('career-advisor.cv-heatmap.index');
            return;
        }
        if (service.id === 'interview-prep') {
            window.location.href = route('career-advisor.interview.setup');
            return;
        }
        if (service.id === 'career-roadmap') {
            window.location.href = route('career-advisor.roadmap.index');
            return;
        }

        setSelectedService(service);
        if (!activeChat || activeChat.service_id !== service.id) {
            setActiveChat(null);
            setData('question', '');
            setData('contextId', crypto.randomUUID());
        }
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

        setData('question', '');

        // Messages de réflexion
        setThinkingIndex(0);
        setTempMessage({
            role: 'assistant',
            content: t(thinkingMessages[0]),
            timestamp: new Date(),
            isThinking: true
        });

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
            // Logique d'export simplifiée
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
                title: t('components.career_advisor.interface.export_success'),
                description: t('components.career_advisor.interface.export_file_downloaded', { format: format.toUpperCase() })
            });
        } catch (error) {
            toast({
                title: t('components.career_advisor.interface.export_error'),
                description: t('components.career_advisor.interface.export_failed'),
                variant: "destructive"
            });
        } finally {
            setIsExporting(false);
        }
    };

    const createNewChat = () => {
        setActiveChat(null);
        setData('contextId', crypto.randomUUID());
        setData('question', '');
        // Effet de vibration pour confirmer l'action
        if ('vibrate' in navigator) {
            navigator.vibrate([50, 100, 50]);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (data.question.trim() && !isLoading) {
                handleSubmit(e);
            }
        }
    };

    const handleEnhancedServiceSubmit = async (serviceId, data) => {
        const service = SERVICES.find(s => s.id === serviceId);

        if (data.isTest && data.mockResponse) {
            const contextId = crypto.randomUUID();

            const newChat = {
                context_id: contextId,
                service_id: serviceId,
                created_at: new Date().toISOString(),
                messages: [
                    {
                        role: 'user',
                        content: data.prompt,
                        timestamp: new Date().toISOString()
                    },
                    {
                        role: 'assistant',
                        content: data.mockResponse,
                        timestamp: new Date().toISOString(),
                        isLatest: true
                    }
                ]
            };

            setUserChats(prev => [newChat, ...prev]);
            setActiveChat(newChat);

            toast({
                title: t('components.career_advisor.interface.demonstration'),
                description: t('components.career_advisor.interface.artifact_test', { service: service?.title }),
            });
            return;
        }

        if (walletBalance < service?.cost || 0) {
            toast({
                title: t('components.career_advisor.interface.insufficient_balance'),
                description: t('components.career_advisor.interface.insufficient_tokens'),
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);

        try {
            const contextId = crypto.randomUUID();

            const response = await axios.post('/career-advisor/chat', {
                message: data.prompt || data.finalPrompt || JSON.stringify(data),
                contextId: contextId,
                language: language,
                serviceId: serviceId,
                history: []
            });

            if (response.data.message) {
                const newChat = {
                    context_id: contextId,
                    service_id: serviceId,
                    created_at: new Date().toISOString(),
                    messages: [
                        {
                            role: 'user',
                            content: data.prompt || data.finalPrompt || t('components.career_advisor.interface.custom_request'),
                            timestamp: new Date().toISOString()
                        },
                        {
                            role: 'assistant',
                            content: response.data.message,
                            timestamp: new Date().toISOString(),
                            isLatest: true
                        }
                    ]
                };

                setUserChats(prev => [newChat, ...prev]);
                setActiveChat(newChat);

                setWalletBalance(prev => prev - service.cost);
                setTokensUsed(prev => prev + (response.data.tokens || 0));

                toast({
                    title: t('components.career_advisor.interface.analysis_complete'),
                    description: t('components.career_advisor.interface.analysis_ready', { service: service.title.toLowerCase() }),
                });
            }

        } catch (error) {
            console.error('Enhanced service error:', error);
            toast({
                title: t('components.career_advisor.interface.error'),
                description: t('components.career_advisor.interface.error_occurred'),
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleArtifactsDetected = (artifacts, content) => {
        setCurrentArtifacts(artifacts);
        setCurrentArtifactContent(content);
        setArtifactSidebarOpen(true);
    };

    const handleArtifactAction = async (action, data) => {
        console.log('Artifact action:', action, data);
        toast({
            title: t('components.career_advisor.interface.artifact_action'),
            description: t('components.career_advisor.interface.artifact_action_executed', { action }),
        });
    };

    // Sidebar mobile simple avec Tailwind CSS
    const MobileSidebarComplete = () => {
        return (
            <>
                {/* Overlay */}
                {isMobileSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <div className={`
                    fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-900 transform transition-transform duration-300 ease-in-out z-[100] md:hidden
                    ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <LuxurySidebar
                        isCollapsed={false}
                        onToggleCollapse={() => { }}
                        walletBalance={walletBalance}
                        onNewChat={createNewChat}
                        userChats={userChats}
                        selectedService={selectedService}
                        activeChat={activeChat}
                        onChatSelect={(chat) => {
                            handleChatSelection(chat);
                            // Fermeture avec délai pour une meilleure UX
                            setTimeout(() => {
                                setIsMobileSidebarOpen(false);
                            }, 200);
                        }}
                        onChatDelete={confirmDeleteChat}
                        onServiceSelect={(service) => {
                            handleServiceSelection(service);
                            // Ne pas fermer automatiquement le sidebar mobile
                        }}
                        onCloseMobile={() => setIsMobileSidebarOpen(false)}
                        isMobile={true}
                    />
                </div>
            </>
        );
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <div className="opacity-5">
                <FluidCursorEffect zIndex={100} />
            </div>

            <div className={cn(
                "h-[calc(100vh-50px)] flex bg-neutral-50 dark:bg-neutral-950 transition-all duration-400",
                artifactSidebarOpen ? "mr-80" : ""
            )}>
                {/* Sidebar Desktop Ultra-Compacte */}
                <div className="hidden lg:flex">
                    <LuxurySidebar
                        isCollapsed={isSidebarCollapsed}
                        onToggleCollapse={() => {
                            const newState = !isSidebarCollapsed;
                            setSidebarCollapsed(newState);
                            localStorage.setItem('career_advisor_sidebar_collapsed', JSON.stringify(newState));
                        }}
                        walletBalance={walletBalance}
                        onNewChat={createNewChat}
                        userChats={userChats}
                        selectedService={selectedService}
                        activeChat={activeChat}
                        onChatSelect={handleChatSelection}
                        onChatDelete={confirmDeleteChat}
                        onServiceSelect={handleServiceSelection}
                        isMobile={false}
                    />
                </div>

                {/* Zone principale */}
                <div className="flex-1 flex flex-col min-w-0 bg-neutral-50 dark:bg-neutral-950 h-full">

                    {/* Contenu principal */}
                    {!activeChat ? (
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex-1 overflow-y-auto">
                                <div className="px-4 py-6">
                                    {/* Mascotte du haut - disparaît quand on clique sur commencer */}
                                    <AnimatePresence>
                                        {showTopMascot && (
                                            <motion.div
                                                className="text-center mb-8"
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{
                                                    scale: 0.5,
                                                    opacity: 0,
                                                    y: -50,
                                                    transition: { duration: 0.5, ease: "easeInOut" }
                                                }}
                                                transition={{ duration: 0.5, type: "spring" }}
                                            >
                                                <div className="w-20 h-20 rounded-2xl mx-auto mb-4 overflow-hidden shadow-lg">
                                                    <img src="/mascot/mas.png" alt="AI Assistant" className="w-full h-full object-cover" />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Interface Enhanced uniquement */}
                                    <div className="px-2">
                                        <ServiceSelector
                                            userInfo={userInfo}
                                            onServiceSubmit={handleEnhancedServiceSubmit}
                                            isLoading={isLoading}
                                            walletBalance={walletBalance}
                                            onServiceSelect={() => setShowTopMascot(false)}
                                            onBackToServices={() => setShowTopMascot(true)}
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col min-h-0">
                            {/* Header de chat */}
                            <CompactHeader
                                selectedService={selectedService}
                                walletBalance={walletBalance}
                                onNewChat={createNewChat}
                                onExport={handleExport}
                                isExporting={isExporting}
                                isAndroidApp={isAndroidApp}
                                isReady={isReady}
                                artifactCount={currentArtifacts.length}
                                onToggleArtifacts={() => setArtifactSidebarOpen(!artifactSidebarOpen)}
                                artifactSidebarOpen={artifactSidebarOpen}
                            />

                            {/* Zone de messages optimisée */}
                            <div className="flex-1 min-h-0">
                                <ScrollArea className="h-full" ref={scrollRef}>
                                    <div className="max-w-5xl mx-auto space-y-0 p-8">
                                        <AnimatePresence mode="popLayout">
                                            {(activeChat?.messages || []).map((message, index) => (
                                                <motion.div
                                                    key={`message-${index}`}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -8 }}
                                                    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                                                >
                                                    <LuxuryMessageBubble
                                                        message={{
                                                            ...message,
                                                            serviceId: selectedService.id,
                                                            isLatest: index === (activeChat?.messages || []).length - 1
                                                        }}
                                                        onArtifactsDetected={handleArtifactsDetected}
                                                    />
                                                </motion.div>
                                            ))}

                                            {tempMessage && (
                                                <motion.div
                                                    key="thinking"
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -8 }}
                                                    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                                                >
                                                    <LuxuryMessageBubble
                                                        message={{
                                                            ...tempMessage,
                                                            serviceId: selectedService.id,
                                                            isLatest: true
                                                        }}
                                                        onArtifactsDetected={handleArtifactsDetected}
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </ScrollArea>
                            </div>

                            {/* Zone de saisie compacte */}
                            <div className="bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 p-6">
                                <div className="max-w-4xl mx-auto">
                                    <LuxuryChatInput
                                        initialValue={data.question}
                                        onSend={(val) => {
                                            setData('question', val);
                                            handleSubmit({ preventDefault: () => { } });
                                        }}
                                        placeholder={t(`services.${selectedService.id}.placeholder`)}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Dialogue de suppression */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </div>
                            {t('components.career_advisor.interface.delete_conversation')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('components.career_advisor.interface.irreversible_action')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteChat}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('common.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Sidebar d'artefacts */}
            <ArtifactSidebar
                artifacts={currentArtifacts}
                isOpen={artifactSidebarOpen}
                onClose={() => setArtifactSidebarOpen(false)}
                serviceId={selectedService.id}
                messageContent={currentArtifactContent}
            />

            {/* Nouveau sidebar mobile complet */}
            <MobileSidebarComplete />

            {/* Styles supplémentaires - Luxury Monochrome */}
            <style>{`
                .hide-scrollbar {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }

                /* Animations fluides et élégantes */
                .smooth-transition {
                    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }

                /* Focus monochrome */
                .focus-ring:focus-visible {
                    outline: 1px solid #1c1917;
                    outline-offset: 2px;
                }

                /* Hover subtil */
                .hover-lift:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
                }

                /* Mobile optimisé */
                @media (max-width: 768px) {
                    .mobile-optimized {
                        font-size: 16px; /* Évite le zoom iOS */
                    }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}