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
    Smartphone, Monitor
} from 'lucide-react';
import { MessageBubble } from '@/Components/ai/MessageBubble';
import EnhancedMessageBubble from '@/Components/ai/enhanced/EnhancedMessageBubble';
import { ServiceCard, MobileServiceCard } from '@/Components/ai/ServiceCard';
import { SERVICES, DEFAULT_PROMPTS } from '@/Components/ai/constants';
import { PowerPointService } from '@/Components/ai/PresentationService';
import ServiceSelector from '@/Components/ai/specialized/ServiceSelector';
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

// Service "Rapport de stage" coming soon
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

// Hook personnalisé pour gérer le comportement de l'input
const useInputBehavior = () => {
    const [inputHeight, setInputHeight] = useState(40);
    const inputRef = useRef(null);

    const adjustHeight = useCallback((element) => {
        if (!element) return;

        element.style.height = 'auto';
        const newHeight = Math.min(Math.max(element.scrollHeight, 40), 60); // Réduit de 80 à 60
        element.style.height = `${newHeight}px`;
        setInputHeight(newHeight);
    }, []);

    const handleInputChange = useCallback((event, setData) => {
        const textarea = event.target;
        const newValue = textarea.value;
        setData('question', newValue);
        adjustHeight(textarea);
    }, [adjustHeight]);

    const focusInput = useCallback(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return {
        inputRef,
        inputHeight,
        handleInputChange,
        focusInput,
        adjustHeight
    };
};

// Composant d'input amélioré réutilisable
const ChatInput = ({
    value,
    onChange,
    onSubmit,
    placeholder,
    disabled,
    isLoading,
    cost,
    service,
    showSuggestions = false,
    suggestions = [],
    variant = "default", // "default" | "minimal" | "floating"
    onKeyDown
}) => {
    const { inputRef, handleInputChange } = useInputBehavior();
    const [isFocused, setIsFocused] = useState(false);
    const { t } = useTranslation();

    const inputVariants = {
        default: "min-h-[40px] max-h-[60px] border-2 border-gray-200 dark:border-gray-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl shadow-sm focus:shadow-md focus:ring-4 focus:ring-amber-500/10",
        minimal: "min-h-[36px] max-h-[60px] border border-gray-200 dark:border-gray-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-lg focus:ring-2 focus:ring-amber-500/20",
        floating: "min-h-[44px] max-h-[60px] border-2 border-gray-300 dark:border-gray-600 focus:border-amber-500 dark:focus:border-amber-400 rounded-2xl shadow-lg focus:shadow-xl backdrop-blur-sm bg-white/90 dark:bg-gray-800/90"
    };

    return (
        <div className="space-y-3">
            <form onSubmit={onSubmit}>
                <div className="relative group">
                    <Textarea
                        ref={inputRef}
                        value={value}
                        onChange={(e) => handleInputChange(e, onChange)}
                        onKeyDown={onKeyDown || ((e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                if (value.trim() && !disabled) {
                                    onSubmit(e);
                                }
                            }
                        })}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={placeholder}
                        className={`w-full pr-20 pl-4 py-3 resize-none text-sm bg-white dark:bg-gray-800 transition-all ${inputVariants[variant]} hide-scrollbar`}
                        disabled={disabled}
                        maxLength={2000}
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none'
                        }}
                    />

                    {/* Focus indicator */}
                    <div className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-200 ${isFocused ? 'opacity-100' : 'opacity-0'
                        } bg-gradient-to-r from-amber-500/5 to-purple-500/5`} />

                    {/* Boutons d'action */}
                    <div className="absolute right-3 bottom-3 flex gap-2">
                        {/* Indicateur de coût avec animation */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-700 rounded-lg shadow-sm"
                        >
                            <Coins className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                            <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                                -{cost}
                            </span>
                        </motion.div>

                        {/* Bouton d'envoi avec états visuels */}
                        <Button
                            type="submit"
                            size="sm"
                            disabled={disabled || !value.trim()}
                            className={`h-8 w-8 p-0 rounded-lg shadow-md transition-all transform ${disabled || !value.trim()
                                ? 'opacity-50 cursor-not-allowed'
                                : 'bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 hover:shadow-lg hover:scale-105 active:scale-95'
                                }`}
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

                    {/* Indicateur de progression de frappe */}
                    {value.length > 0 && (
                        <div className="absolute bottom-1 left-3 right-20">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-0.5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(value.length / 2000) * 100}%` }}
                                    className={`h-0.5 rounded-full transition-colors ${value.length > 1800
                                        ? 'bg-red-500'
                                        : value.length > 1500
                                            ? 'bg-yellow-500'
                                            : 'bg-amber-500'
                                        }`}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Informations et suggestions */}
                <AnimatePresence>
                    {(value.length > 0 || showSuggestions) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                        >
                            {/* Barre d'informations */}
                            {value.length > 0 && (
                                <div className="flex justify-between items-center text-xs px-1">
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-500 dark:text-gray-400">
                                            {value.length}/2000
                                        </span>
                                        {value.length > 1500 && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className={`flex items-center gap-1 ${value.length > 1800 ? 'text-red-500' : 'text-yellow-500'
                                                    }`}
                                            >
                                                <Clock className="h-3 w-3" />
                                                {value.length > 1800 ? 'Limite atteinte' : 'Proche de la limite'}
                                            </motion.span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                        <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-gray-100 dark:bg-gray-700 rounded border">
                                            ⏎
                                        </kbd>
                                        <span>Envoyer</span>
                                    </div>
                                </div>
                            )}

                            {/* Suggestions */}
                            {showSuggestions && suggestions.length > 0 && value.length === 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                        Suggestions pour {service} :
                                    </p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {suggestions.slice(0, 3).map((suggestion, index) => (
                                            <motion.button
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                onClick={() => onChange('question', suggestion)}
                                                className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-600 rounded-lg transition-all text-gray-700 dark:text-gray-300 hover:text-amber-700 dark:hover:text-amber-300 hover:shadow-sm"
                                            >
                                                {suggestion.substring(0, 40)}
                                                {suggestion.length > 40 ? '...' : ''}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>
        </div>
    );
};

// Services cards améliorés
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
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/90 to-white/95 dark:via-gray-900/90 dark:to-gray-900/95 flex flex-col items-center justify-end py-2">
                    <div className="text-center max-w-[85%] z-10">
                        <Badge className="bg-amber-500 text-white dark:bg-amber-600 dark:text-white mb-1 px-1.5 py-0.5 text-[10px]">
                            {t('career_advisor.coming_soon.badge')}
                        </Badge>
                        <p className="text-[10px] text-gray-600 dark:text-gray-400">
                            {service.releaseDate}
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
    const { isReady, isAndroidApp, downloadFile, printDocument, createDirectDownloadUrl, isUrlCompatible } = useMedian();
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
    const [useEnhancedInterface, setUseEnhancedInterface] = useState(true); // Nouvelle interface par défaut
    const [useEnhancedBubbles, setUseEnhancedBubbles] = useState(true); // Nouvelles bulles avec artefacts
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

    // Scroll amélioré avec gestion de l'input
    useEffect(() => {
        if (scrollRef.current) {
            const scrollElement = scrollRef.current;
            const scrollToBottom = () => {
                scrollElement.scrollTo({
                    top: scrollElement.scrollHeight,
                    behavior: 'smooth'
                });
            };
            setTimeout(scrollToBottom, 100);
        }
    }, [activeChat?.messages, tempMessage, data.question]);

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

        // Messages temporaires de réflexion
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
            if (format === 'pptx') {
                console.log('🎨 Génération PowerPoint côté client');

                const lastAiMessage = activeChat.messages
                    .filter(msg => msg.role === 'assistant')
                    .pop();

                if (lastAiMessage) {
                    const jsonData = extractValidJsonFromMessage(lastAiMessage.content);
                    if (jsonData) {
                        try {
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
                                title: '🎨 Présentation générée',
                                description: 'Le fichier PowerPoint a été créé et téléchargé',
                                variant: 'default'
                            });
                            return;
                        } catch (pptxError) {
                            console.error('❌ Erreur génération PowerPoint:', pptxError);
                            toast({
                                title: t('career_advisor.messages.error'),
                                description: 'Erreur lors de la génération du PowerPoint',
                                variant: "destructive",
                            });
                            return;
                        }
                    }
                }

                toast({
                    title: t('career_advisor.messages.error'),
                    description: "Aucun contenu de présentation valide trouvé",
                    variant: "destructive",
                });
                return;
            }

            if (isAndroidApp && isReady) {
                console.log('🚀 Utilisation du téléchargement natif Android pour', format);

                const downloadUrl = createDirectDownloadUrl('/career-advisor/export-direct', {
                    contextId: activeChat.context_id,
                    format: format,
                    direct: true
                });

                if (!isUrlCompatible(downloadUrl)) {
                    throw new Error('URL non compatible avec Median');
                }

                const result = await downloadFile(downloadUrl, {
                    filename: `conversation-${activeChat.context_id}.${format}`,
                    open: true,
                    forceDownload: true
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
                console.log('🌐 Utilisation du téléchargement web pour', format);
                await handleExportWeb(format);
            }
        } catch (error) {
            console.error('❌ Erreur lors de l\'export:', error);

            if (isAndroidApp && format !== 'pptx') {
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

    const handleExportWeb = async (format) => {
        console.log('📄 Export web classique:', format);

        if (format === 'pptx') {
            const lastAiMessage = activeChat.messages
                .filter(msg => msg.role === 'assistant')
                .pop();

            if (lastAiMessage) {
                const jsonData = extractValidJsonFromMessage(lastAiMessage.content);
                if (jsonData) {
                    try {
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
                            description: 'Le PowerPoint a été généré et téléchargé',
                            variant: 'default'
                        });
                        return;
                    } catch (error) {
                        console.error('❌ Erreur génération PowerPoint:', error);
                        throw new Error('Erreur lors de la génération du PowerPoint');
                    }
                }
            }

            throw new Error('Aucun contenu de présentation valide trouvé');
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

    // Handler pour les services avec interfaces spécialisées
    const handleEnhancedServiceSubmit = async (serviceId: string, data: any) => {
        if (walletBalance < SERVICES.find(s => s.id === serviceId)?.cost || 0) {
            toast({
                title: "Solde insuffisant",
                description: "Vous n'avez pas assez de tokens pour ce service",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        
        try {
            // Créer un nouveau chat pour ce service
            const contextId = crypto.randomUUID();
            const service = SERVICES.find(s => s.id === serviceId);
            
            // Utiliser le prompt généré par l'interface spécialisée
            const response = await axios.post('/career-advisor/chat', {
                message: data.prompt || data.finalPrompt || JSON.stringify(data),
                contextId: contextId,
                language: language,
                serviceId: serviceId,
                history: []
            });

            if (response.data.message) {
                // Créer le nouveau chat avec la réponse
                const newChat = {
                    context_id: contextId,
                    service_id: serviceId,
                    created_at: new Date().toISOString(),
                    messages: [
                        {
                            role: 'user',
                            content: data.prompt || data.finalPrompt || 'Demande personnalisée',
                            timestamp: new Date().toISOString()
                        },
                        {
                            role: 'assistant',
                            content: response.data.message,
                            timestamp: new Date().toISOString()
                        }
                    ]
                };

                // Ajouter à la liste et activer
                setUserChats(prev => [newChat, ...prev]);
                setActiveChat(newChat);
                
                // Mettre à jour le solde
                setWalletBalance(prev => prev - service.cost);
                setTokensUsed(prev => prev + (response.data.tokens || 0));

                toast({
                    title: "Analyse terminée !",
                    description: `Votre ${service.title.toLowerCase()} personnalisé est prêt`,
                });
            }

        } catch (error) {
            console.error('Enhanced service error:', error);
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors du traitement",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handler pour les actions d'artefacts
    const handleArtifactAction = async (action: string, data: any) => {
        console.log('Artifact action:', action, data);
        
        switch (action) {
            case 'optimize-cv':
                toast({
                    title: "Optimisation CV",
                    description: "Redirection vers l'éditeur de CV avec suggestions appliquées",
                });
                // Rediriger vers CV avec optimisations
                break;
                
            case 'export-roadmap':
                toast({
                    title: "Export en cours",
                    description: "Votre roadmap carrière est en cours d'export PDF",
                });
                // Logique d'export
                break;
                
            case 'add-skill':
                toast({
                    title: "Compétence ajoutée",
                    description: `${data.keyword} ajouté à votre profil`,
                });
                // Ajouter la compétence au profil utilisateur
                break;
                
            case 'schedule-practice':
                toast({
                    title: "Entraînement programmé",
                    description: "Session d'entraînement ajoutée à votre calendrier",
                });
                // Programmer une session d'entraînement
                break;
                
            default:
                toast({
                    title: "Action en développement",
                    description: "Cette fonctionnalité sera bientôt disponible",
                });
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} hideHeaderOnMobile={true}>
            {/* Rendre l'effet de curseur plus subtil */}
            <div className="opacity-20"><FluidCursorEffect zIndex={100} /></div>


            <div className="h-[calc(100vh-100px)] md:h-screen flex bg-gray-50 dark:bg-gray-900"> {/* 100px = header mobile (40px) + tab bar (60px) */}
                {/* Sidebar Desktop - Collapsible */}
                <div className={`hidden lg:flex ${isSidebarCollapsed ? 'lg:w-16' : 'lg:w-64'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col transition-all duration-300`}>
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
                        <div className="flex-1 flex flex-col min-h-0">
                            {/* Section services */}
                            <div className="flex-1 overflow-y-auto pb-6">
                                <div className="px-3 py-6">
                                    <div className="text-center mb-6">
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.4, type: "spring" }}
                                            className="mb-3"
                                        >
                                            <div className="w-20 h-20   rounded-xl mx-auto flex items-center justify-center mb-2.5 shadow-md overflow-hidden">
                                                <img src="/mascot/mas.png" alt="AI Assistant" className="w-16 h-16 object-contain" />
                                            </div>
                                        </motion.div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                            {t('career_advisor.services.choose')}
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                            {t('career_advisor.services.description')}
                                        </p>
                                    </div>

                                    {/* Interface améliorée ou classique */}
                                    {useEnhancedInterface ? (
                                        <div className="px-2">
                                            <ServiceSelector
                                                userInfo={userInfo}
                                                onServiceSubmit={handleEnhancedServiceSubmit}
                                                isLoading={isLoading}
                                                walletBalance={walletBalance}
                                            />
                                            
                                            {/* Toggle vers interface classique */}
                                            <div className="text-center mt-8">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setUseEnhancedInterface(false)}
                                                    className="text-gray-500 hover:text-gray-700"
                                                >
                                                    Utiliser l'interface classique
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Interface classique */}
                                            <div className="hidden lg:grid grid-cols-2 xl:grid-cols-3 gap-3 px-2 mb-8">
                                                {SERVICES.map(service => (
                                                    <EnhancedServiceCard
                                                        key={service.id}
                                                        service={service}
                                                        isSelected={selectedService.id === service.id}
                                                        onClick={() => handleServiceSelection(service)}
                                                    />
                                                ))}
                                                <EnhancedServiceCard
                                                    service={REPORT_SERVICE}
                                                    isSelected={false}
                                                    onClick={() => handleServiceSelection(REPORT_SERVICE)}
                                                />
                                            </div>

                                            <div className="lg:hidden grid grid-cols-2 gap-2 px-2 mb-8">
                                                {SERVICES.map(service => (
                                                    <EnhancedMobileServiceCard
                                                        key={service.id}
                                                        service={service}
                                                        isSelected={selectedService.id === service.id}
                                                        onClick={() => handleServiceSelection(service)}
                                                    />
                                                ))}
                                                <EnhancedMobileServiceCard
                                                    service={REPORT_SERVICE}
                                                    isSelected={false}
                                                    onClick={() => handleServiceSelection(REPORT_SERVICE)}
                                                />
                                            </div>
                                            
                                            {/* Toggle vers interface améliorée */}
                                            <div className="text-center">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setUseEnhancedInterface(true)}
                                                    className="bg-gradient-to-r from-amber-50 to-purple-50 border-amber-200 hover:from-amber-100 hover:to-purple-100"
                                                >
                                                    <Sparkles className="w-4 h-4 mr-2" />
                                                    Essayer la nouvelle expérience IA
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Zone d'input principale fixe en bas */}
                            <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
                                <div className="max-w-4xl mx-auto px-3 py-4">
                                    {/* Indicateur de service sélectionné */}
                                    <div className="flex items-center justify-center gap-2 mb-3">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/20 dark:to-purple-900/20 border border-amber-200 dark:border-amber-700 rounded-full">
                                            <selectedService.icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {t(`services.${selectedService.id}.title`)}
                                            </span>
                                            <div className="flex items-center gap-1 ml-2 px-2 py-0.5 bg-amber-100 dark:bg-amber-800/30 rounded-full">
                                                <Coins className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                                                    {selectedService.cost}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <ChatInput
                                        value={data.question}
                                        onChange={setData}
                                        onSubmit={handleSubmit}
                                        placeholder={t('career_advisor.sidebar.ask_question', {
                                            service: t(`services.${selectedService.id}.title`)
                                        })}
                                        disabled={isLoading}
                                        isLoading={isLoading}
                                        cost={selectedService.cost}
                                        service={t(`services.${selectedService.id}.title`)}
                                        showSuggestions={true}
                                        suggestions={DEFAULT_PROMPTS[selectedService.id] || []}
                                        variant="floating"
                                        onKeyDown={handleKeyDown}
                                    />
                                </div>
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
                                                    <span className="ml-auto text-[10px] text-amber-600">Client</span>
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {/* Toggle artefacts */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setUseEnhancedBubbles(!useEnhancedBubbles)}
                                        className={`h-7 px-2 ${useEnhancedBubbles ? 'bg-amber-50 border-amber-200 text-amber-700' : ''}`}
                                    >
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        <span className="hidden sm:inline text-xs">
                                            {useEnhancedBubbles ? 'Artefacts ON' : 'Artefacts OFF'}
                                        </span>
                                    </Button>
                                </div>
                            </div>

                            {/* Zone de messages avec hauteur optimisée */}
                            <div className="flex-1 min-h-0 pb-2">
                                <ScrollArea className="h-full" ref={scrollRef}>
                                    <div className="max-w-4xl mx-auto space-y-3 p-3 pb-4">
                                        <AnimatePresence mode="popLayout">
                                            {(activeChat?.messages || []).map((message, index) => (
                                                <motion.div
                                                    key={`message-${index}`}
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    {useEnhancedBubbles ? (
                                                        <EnhancedMessageBubble
                                                            message={{
                                                                ...message,
                                                                serviceId: selectedService.id,
                                                                isLatest: index === (activeChat?.messages || []).length - 1
                                                            }}
                                                            onArtifactAction={handleArtifactAction}
                                                        />
                                                    ) : (
                                                        <MessageBubble
                                                            message={{
                                                                ...message,
                                                                isLatest: index === (activeChat?.messages || []).length - 1
                                                            }}
                                                        />
                                                    )}
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
                                                    {useEnhancedBubbles ? (
                                                        <EnhancedMessageBubble
                                                            message={{
                                                                ...tempMessage,
                                                                serviceId: selectedService.id,
                                                                isLatest: true
                                                            }}
                                                            onArtifactAction={handleArtifactAction}
                                                        />
                                                    ) : (
                                                        <MessageBubble
                                                            message={{
                                                                ...tempMessage,
                                                                isLatest: true
                                                            }}
                                                        />
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </ScrollArea>
                            </div>

                            {/* Zone de saisie fixe */}
                            <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                                <div className="max-w-4xl mx-auto px-3 py-3">
                                    <ChatInput
                                        value={data.question}
                                        onChange={setData}
                                        onSubmit={handleSubmit}
                                        placeholder={t(`services.${selectedService.id}.placeholder`)}
                                        disabled={isLoading}
                                        isLoading={isLoading}
                                        cost={selectedService.cost}
                                        service={t(`services.${selectedService.id}.title`)}
                                        variant="minimal"
                                        onKeyDown={handleKeyDown}
                                    />
                                </div>
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

            {/* Styles CSS supplémentaires */}
            <style>{`
                .hide-scrollbar {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .smooth-focus {
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .smooth-focus:focus {
                    transform: translateY(-1px);
                }
                @media (max-width: 768px) {
                    .mobile-input {
                        font-size: 16px;
                    }
                }
                .focus-visible:focus-visible {
                    outline: 2px solid #f59e0b;
                    outline-offset: 2px;
                }
                .interactive-hover {
                    transition: all 0.15s ease-out;
                }
                .interactive-hover:hover {
                    transform: translateY(-0.5px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
