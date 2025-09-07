import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    Smartphone, Monitor, Zap, MoreHorizontal, Settings, Star,
    TrendingUp, Target, Users, BookOpen, Award, Briefcase
} from 'lucide-react';
import EnhancedMessageBubble from '@/Components/ai/enhanced/EnhancedMessageBubble';
import { ServiceCard, MobileServiceCard } from '@/Components/ai/ServiceCard';
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

// Composant d'input ultra-compact
const CompactChatInput = ({
    value,
    onChange,
    onSubmit,
    placeholder,
    disabled,
    isLoading,
    cost,
    onKeyDown
}) => {
    const { inputRef, handleInputChange } = useSmartInput();
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="relative">
            <form onSubmit={onSubmit}>
                <div className="relative flex items-end gap-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm transition-all hover:shadow-md focus-within:shadow-md focus-within:border-amber-400 dark:focus-within:border-amber-500">
                    <Textarea
                        ref={inputRef}
                        value={value}
                        onChange={(e) => handleInputChange(e, onChange)}
                        onKeyDown={onKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={placeholder}
                        className="flex-1 min-h-[36px] max-h-[72px] border-0 p-0 resize-none bg-transparent text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                        disabled={disabled}
                        maxLength={2000}
                    />

                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Indicateur de coût */}
                        <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-md">
                            <Coins className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                            <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                                {cost}
                            </span>
                        </div>

                        {/* Bouton d'envoi */}
                        <Button
                            type="submit"
                            size="sm"
                            disabled={disabled || !value.trim()}
                            className={cn(
                                "h-8 w-8 p-0 rounded-lg transition-all duration-200",
                                disabled || !value.trim()
                                    ? "opacity-40 cursor-not-allowed bg-gray-400"
                                    : "bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                            )}
                        >
                            {isLoading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                    <Loader className="h-4 w-4 text-white" />
                                </motion.div>
                            ) : (
                                <Send className="h-4 w-4 text-white" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Barre de progression */}
                {value.length > 0 && (
                    <div className="mt-1 px-1">
                        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {/* @ts-ignore */}
                            <span>{value.length}/2000 {t('components.career_advisor.interface.progress_characters')}</span>
                            <div className="flex items-center gap-2">
                                <kbd className="px-1 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 rounded border">
                                    Enter
                                </kbd>
                                {/* @ts-ignore */}
                                <span>{t('components.career_advisor.interface.send')}</span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-0.5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(value.length / 2000) * 100}%` }}
                                className={cn(
                                    "h-0.5 rounded-full transition-colors",
                                    value.length > 1800 ? "bg-red-500" :
                                        value.length > 1500 ? "bg-yellow-500" : "bg-amber-500"
                                )}
                            />
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

// Card de chat optimisée
const CompactChatCard = ({ chat, isActive, onSelect, onDelete }) => {
    const { t } = useTranslation();

    const truncatedPreview = chat.preview ?
        (chat.preview.length > 28 ? chat.preview.substring(0, 28) + '...' : chat.preview) :
        t('components.career_advisor.interface.new_conversation');

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -8 }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "group relative p-2 rounded-lg cursor-pointer transition-all border",
                isActive
                    ? "bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/20 dark:to-purple-900/20 border-amber-300 dark:border-amber-600 shadow-sm"
                    : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border-gray-200 dark:border-gray-700 hover:border-amber-200 dark:hover:border-amber-800"
            )}
            onClick={() => onSelect(chat)}
        >
            <div className="flex items-start gap-2 pr-6">
                <div className={cn(
                    "w-1 h-1 rounded-full mt-2 flex-shrink-0",
                    isActive ? "bg-amber-500" : "bg-gray-300 dark:bg-gray-600"
                )} />
                <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-medium text-gray-900 dark:text-gray-100 line-clamp-1 mb-1" title={chat.preview}>
                        {truncatedPreview}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-2.5 w-2.5" />
                            <span>
                                {new Date(chat.created_at).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short'
                                })}
                            </span>
                        </div>
                        {chat.messages_count && (
                            <div className="flex items-center gap-1">
                                <MessageSquare className="h-2.5 w-2.5" />
                                <span>{chat.messages_count}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(chat);
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 transition-all"
            >
                <Trash2 className="h-3 w-3" />
            </Button>
        </motion.div>
    );
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
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-3 py-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-r from-amber-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <selectedService.icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                                {t(`services.${selectedService.id}.title`)}
                            </h3>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{t('components.sidebar.active')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Wallet className="h-3 w-3 text-amber-500" />
                                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                                        {walletBalance.toLocaleString()}
                                    </span>
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
                                "h-8 px-2 relative",
                                artifactSidebarOpen ? "bg-amber-100 border-amber-300 text-amber-700" : ""
                            )}
                        >
                            <Sparkles className="h-3.5 w-3.5 mr-1" />
                            <span className="text-xs">Artefacts</span>
                            <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs bg-amber-500 text-white">
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

// Sidebar ultra-compacte
const UltraCompactSidebar = ({
    isCollapsed,
    onToggleCollapse,
    walletBalance,
    onNewChat,
    userChats,
    selectedService,
    activeChat,
    onChatSelect,
    onChatDelete
}) => {
    const { t } = useTranslation();
    const filteredChats = userChats.filter(chat => chat.service_id === selectedService.id);

    return (
        <div className={cn(
            "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300",
            isCollapsed ? "w-12" : "w-64"
        )}>
            {/* Header */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-800">
                {isCollapsed ? (
                    <div className="flex flex-col items-center gap-2">
                        <Avatar className="w-8 h-8">
                            <AvatarImage src="/mascot/mascot.png" />
                            <AvatarFallback className="bg-gradient-to-r from-amber-500 to-purple-500 text-white text-xs">
                                AI
                            </AvatarFallback>
                        </Avatar>
                        <Button
                            onClick={onNewChat}
                            size="sm"
                            className="w-8 h-8 p-0 bg-gradient-to-r from-amber-500 to-purple-500"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src="/mascot/mascot.png" />
                                <AvatarFallback className="bg-gradient-to-r from-amber-500 to-purple-500 text-white text-xs">
                                    AI
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <h1 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                                        {t('components.career_advisor.interface.ai_advisor')}
                                    </h1>
                                    <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4 bg-amber-50 text-amber-600">
                                        <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                                        {t('components.sidebar.pro_badge')}
                                    </Badge>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                    {t(`services.${selectedService.id}.title`)}
                                </p>
                            </div>
                        </div>

                        {/* Wallet compact */}
                        <div className="bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/20 dark:to-purple-900/20 border border-amber-200 dark:border-amber-700 px-2 py-1 rounded-lg flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            <Wallet className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                                {walletBalance.toLocaleString()}
                            </span>
                        </div>

                        <Button
                            onClick={onNewChat}
                            className="w-full h-7 bg-gradient-to-r from-amber-500 to-purple-500 text-white text-xs"
                        >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            {t('components.career_advisor.interface.new_chat')}
                        </Button>
                    </div>
                )}

                {/* Toggle button */}
                <Button
                    onClick={onToggleCollapse}
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "mt-2 transition-all",
                        isCollapsed ? "w-8 h-8 p-0 mx-auto" : "w-full h-6"
                    )}
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-3.5 w-3.5" />
                    ) : (
                        <div className="flex items-center justify-between w-full">
                            <span className="text-xs">{t('components.career_advisor.interface.collapse')}</span>
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </div>
                    )}
                </Button>
            </div>

            {/* Chat history */}
            <div className="flex-1 p-2 min-h-0">
                {!isCollapsed && (
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {t('components.career_advisor.interface.history')}
                        </h3>
                        <Badge variant="outline" className="text-xs h-4 px-1.5 border-amber-200 text-amber-600">
                            {filteredChats.length}
                        </Badge>
                    </div>
                )}

                <ScrollArea className="h-full">
                    <div className={cn(
                        "space-y-1",
                        isCollapsed && "flex flex-col items-center"
                    )}>
                        <AnimatePresence>
                            {filteredChats.map(chat => (
                                isCollapsed ? (
                                    <TooltipProvider key={chat.context_id}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <motion.button
                                                    layout
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    whileHover={{ scale: 1.05 }}
                                                    onClick={() => onChatSelect(chat)}
                                                    className={cn(
                                                        "w-8 h-8 flex items-center justify-center rounded-lg border transition-all",
                                                        activeChat?.context_id === chat.context_id
                                                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 border-amber-300"
                                                            : "bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
                                                    )}
                                                >
                                                    <MessageSquare className="h-3.5 w-3.5" />
                                                </motion.button>
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                <p className="text-xs">{chat.preview?.substring(0, 30)}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ) : (
                                    <CompactChatCard
                                        key={chat.context_id}
                                        chat={chat}
                                        isActive={activeChat?.context_id === chat.context_id}
                                        onSelect={onChatSelect}
                                        onDelete={onChatDelete}
                                    />
                                )
                            ))}
                        </AnimatePresence>

                        {filteredChats.length === 0 && !isCollapsed && (
                            <div className="text-center py-6">
                                <MessageSquare className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {t('components.career_advisor.interface.no_conversations')}
                                </p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
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
        return () => {
            if (thinkingIntervalRef.current) {
                clearInterval(thinkingIntervalRef.current);
            }
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
        setIsMobileSidebarOpen(false);
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

    return (
        <AuthenticatedLayout user={auth.user} hideHeaderOnMobile={true}>
            <div className="opacity-10">
                <FluidCursorEffect zIndex={100} />
            </div>

            <div className={cn(
                "h-[calc(100vh-50px)] flex bg-gray-50 dark:bg-gray-900 transition-all duration-300",
                artifactSidebarOpen ? "mr-80" : ""
            )}>
                {/* Sidebar Desktop Ultra-Compacte */}
                <div className="hidden lg:flex">
                    <UltraCompactSidebar
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
                    />
                </div>

                {/* Zone principale */}
                <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900 h-full">
                    {/* Header Mobile */}
                    <div className="lg:hidden px-3 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-8 px-2">
                                            <Menu className="h-4 w-4 mr-1" />
                                            <span className="text-xs">{t('components.career_advisor.interface.menu')}</span>
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="w-[280px] p-0">
                                        <div className="h-full">
                                            <UltraCompactSidebar
                                                isCollapsed={false}
                                                onToggleCollapse={() => { }}
                                                walletBalance={walletBalance}
                                                onNewChat={createNewChat}
                                                userChats={userChats}
                                                selectedService={selectedService}
                                                activeChat={activeChat}
                                                onChatSelect={handleChatSelection}
                                                onChatDelete={confirmDeleteChat}
                                            />
                                        </div>
                                    </SheetContent>
                                </Sheet>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-8 px-2">
                                            <selectedService.icon className="h-3.5 w-3.5 mr-1" />
                                            <span className="text-xs max-w-[80px] truncate">
                                                {t(`services.${selectedService.id}.title`)}
                                            </span>
                                            <ChevronDown className="h-3 w-3 ml-1" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        {SERVICES.map((service) => (
                                            <DropdownMenuItem
                                                key={service.id}
                                                onSelect={() => handleServiceSelection(service)}
                                                className="text-xs"
                                            >
                                                <service.icon className="h-3.5 w-3.5 mr-2" />
                                                {t(`services.${service.id}.title`)}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/20 dark:to-purple-900/20 border border-amber-200 dark:border-amber-700 px-2 py-1 rounded-lg flex items-center gap-1">
                                    <Wallet className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                                        {walletBalance.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contenu principal */}
                    {!activeChat ? (
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex-1 overflow-y-auto">
                                <div className="px-4 py-6">
                                    <div className="text-center mb-8">
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.5, type: "spring" }}
                                        >
                                            <div className="w-20 h-20 rounded-2xl mx-auto mb-4 overflow-hidden shadow-lg">
                                                <img src="/mascot/mas.png" alt="AI Assistant" className="w-full h-full object-cover" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                                                {t('components.career_advisor.interface.professional_ai_advisor')}
                                            </h2>
                                            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                                {t('components.career_advisor.interface.start_intelligent_conversation')}
                                            </p>
                                        </motion.div>
                                    </div>

                                    {/* Interface Enhanced uniquement */}
                                    <div className="px-2">
                                        <ServiceSelector
                                            userInfo={userInfo}
                                            onServiceSubmit={handleEnhancedServiceSubmit}
                                            isLoading={isLoading}
                                            walletBalance={walletBalance}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer informatif */}
                            <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-4">
                                <div className="max-w-2xl mx-auto text-center">
                                    <div className="flex items-center justify-center gap-2 mb-3">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/20 dark:to-purple-900/20 border border-amber-200 dark:border-amber-700 rounded-full">
                                            <selectedService.icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {t(`services.${selectedService.id}.title`)}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                        {t('components.career_advisor.interface.selected_service')}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        {t('components.career_advisor.interface.service_description')}
                                    </p>

                                    <div className="flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Coins className="h-3.5 w-3.5 text-amber-500" />
                                            <span>{t('components.career_advisor.interface.cost')}: {selectedService.cost} {t('components.career_advisor.interface.credits')}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Wallet className="h-3.5 w-3.5 text-green-500" />
                                            <span>{t('components.career_advisor.interface.balance')}: {walletBalance.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-3.5 w-3.5 text-purple-500" />
                                            <span>{t('components.career_advisor.interface.advanced_ai')}</span>
                                        </div>
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
                                    <div className="max-w-4xl mx-auto space-y-4 p-4">
                                        <AnimatePresence mode="popLayout">
                                            {(activeChat?.messages || []).map((message, index) => (
                                                <motion.div
                                                    key={`message-${index}`}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <EnhancedMessageBubble
                                                        message={{
                                                            ...message,
                                                            serviceId: selectedService.id,
                                                            isLatest: index === (activeChat?.messages || []).length - 1
                                                        }}
                                                        onArtifactAction={handleArtifactAction}
                                                    />
                                                </motion.div>
                                            ))}

                                            {tempMessage && (
                                                <motion.div
                                                    key="thinking"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <EnhancedMessageBubble
                                                        message={{
                                                            ...tempMessage,
                                                            serviceId: selectedService.id,
                                                            isLatest: true
                                                        }}
                                                        onArtifactAction={handleArtifactAction}
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </ScrollArea>
                            </div>

                            {/* Zone de saisie compacte */}
                            <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-3">
                                <div className="max-w-4xl mx-auto">
                                    <CompactChatInput
                                        value={data.question}
                                        onChange={setData}
                                        onSubmit={handleSubmit}
                                        placeholder={t(`services.${selectedService.id}.placeholder`)}
                                        disabled={isLoading}
                                        isLoading={isLoading}
                                        cost={selectedService.cost}
                                        onKeyDown={handleKeyDown}
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

            {/* Styles supplémentaires */}
            <style>{`
                .hide-scrollbar {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                
                /* Animations fluides */
                .smooth-transition {
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                /* Focus amélioré */
                .focus-ring:focus-visible {
                    outline: 2px solid #f59e0b;
                    outline-offset: 2px;
                }
                
                /* Hover subtil */
                .hover-lift:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                
                /* Mobile optimisé */
                @media (max-width: 768px) {
                    .mobile-optimized {
                        font-size: 16px; /* Évite le zoom iOS */
                    }
                }
                
                /* Gradients améliorés */
                .gradient-amber-purple {
                    background: linear-gradient(135deg, #f59e0b 0%, #8b5cf6 100%);
                }
                
                .gradient-amber-purple-soft {
                    background: linear-gradient(135deg, #fef3c7 0%, #ede9fe 100%);
                }
            `}</style>
        </AuthenticatedLayout>
    );
}