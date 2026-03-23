import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ChevronLeft, ChevronRight, Sparkles, MessageSquare, FileText, Route, Mic, PenTool, ChevronDown, ExternalLink } from 'lucide-react';
import { luxuryTheme } from '@/design-system/luxury-theme';
import { LuxuryIconButton } from '@/Components/ui/luxury/Button';
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";
import axios from 'axios';
import { router } from '@inertiajs/react';

interface Chat {
    id: string;
    preview: string;
    timestamp: Date;
    messagesCount?: number;
}

interface ToolHistoryItem {
    id: number;
    context_id: string;
    structured_data: any;
    created_at: string;
    created_at_human: string;
}

interface ToolHistoryCategory {
    context: string;
    label: string;
    icon: React.ElementType;
    color: string;
    route: string;
    items: ToolHistoryItem[];
}

interface LuxurySidebarProps {
    chats?: any[];
    userChats?: any[];
    activeChatId?: string;
    activeChat?: any;
    onSelectChat?: (chat: any) => void;
    onNewChat?: () => void;
    onDeleteChat?: (chat: any) => void;
    className?: string;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
    walletBalance?: number;
    selectedService?: any;
    isMobile?: boolean;
    onCloseMobile?: () => void;
    onChatSelect?: (chat: any) => void;
    onChatDelete?: (chat: any) => void;
    onServiceSelect?: (service: any) => void;
}

const TOOL_CATEGORIES: Omit<ToolHistoryCategory, 'items'>[] = [
    { context: 'cv_analysis', label: 'Analyse CV', icon: FileText, color: 'text-blue-500', route: '/career-advisor/cv-heatmap' },
    { context: 'roadmap', label: 'Roadmap', icon: Route, color: 'text-emerald-500', route: '/career-advisor/roadmap' },
    { context: 'interview_session', label: 'Entretiens', icon: Mic, color: 'text-purple-500', route: '/career-advisor/interview/setup' },
    { context: 'cover_letter', label: 'Lettres', icon: PenTool, color: 'text-amber-500', route: '/career-advisor/cover-letter/studio' },
];

/**
 * Luxury Sidebar - Design minimaliste ultra-épuré
 * Navigation discrète et élégante
 */
export const LuxurySidebar: React.FC<LuxurySidebarProps> = ({
    chats,
    userChats,
    activeChatId,
    activeChat,
    onSelectChat,
    onNewChat,
    onDeleteChat,
    className = '',
    isCollapsed: externalIsCollapsed,
    onToggleCollapse,
    walletBalance,
    selectedService,
    isMobile = false,
    onCloseMobile,
    onChatSelect,
    onChatDelete,
    onServiceSelect,
}) => {
    const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
    const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed;
    const toggleCollapse = onToggleCollapse || (() => setInternalIsCollapsed(!internalIsCollapsed));

    // Tool history state
    const [toolHistories, setToolHistories] = useState<Record<string, ToolHistoryItem[]>>({});
    const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});
    const [loadingTools, setLoadingTools] = useState(false);

    // Support for multiple prop names used in Index.tsx
    const handleSelectChat = onChatSelect || onSelectChat;
    const handleDeleteChat = onChatDelete || onDeleteChat;

    // Adapt chats if they come from userChats in Index.tsx
    const sourceChats = userChats || chats || [];
    const displayChats = sourceChats.map(c => ({
        id: c.id || c.context_id || c.id,
        context_id: c.context_id || c.id,
        preview: c.preview,
        timestamp: c.timestamp || c.created_at,
        messagesCount: c.messagesCount || c.messages_count
    }));

    const currentActiveChatId = activeChatId || activeChat?.context_id || activeChat?.id;

    // Fetch tool histories on mount
    useEffect(() => {
        fetchToolHistories();
    }, []);

    const fetchToolHistories = async () => {
        setLoadingTools(true);
        try {
            const results: Record<string, ToolHistoryItem[]> = {};
            await Promise.all(
                TOOL_CATEGORIES.map(async (cat) => {
                    try {
                        const res = await axios.get('/career-advisor/history', { params: { context: cat.context } });
                        results[cat.context] = (res.data.data || []).slice(0, 5); // Max 5 per category
                    } catch {
                        results[cat.context] = [];
                    }
                })
            );
            setToolHistories(results);
        } catch (e) {
            console.error('Failed to load tool histories', e);
        } finally {
            setLoadingTools(false);
        }
    };

    const toggleToolExpand = (context: string) => {
        setExpandedTools(prev => ({ ...prev, [context]: !prev[context] }));
    };

    const totalToolItems = Object.values(toolHistories).reduce((sum, items) => sum + items.length, 0);

    const handleDeleteToolHistory = async (id: number, context: string) => {
        try {
            await axios.delete(`/career-advisor/history/${id}`);
            setToolHistories(prev => ({
                ...prev,
                [context]: (prev[context] || []).filter(item => item.id !== id)
            }));
        } catch {
            console.error('Delete failed');
        }
    };

    const handleToolClick = (item: ToolHistoryItem, categoryContext: string, categoryRoute: string) => {
        let storageKey = '';
        if (categoryContext === 'cv_analysis') storageKey = 'load_history_cv';
        else if (categoryContext === 'roadmap') storageKey = 'load_history_roadmap';
        else if (categoryContext === 'cover_letter') storageKey = 'load_history_cover_letter';
        else if (categoryContext === 'interview_session') {
            sessionStorage.setItem('interviewReport', JSON.stringify(item.structured_data));
            router.visit('/career-advisor/interview/report');
            return;
        }

        if (storageKey) {
            sessionStorage.setItem(storageKey, JSON.stringify(item.structured_data));
            router.visit(categoryRoute);
        }
    };

    return (
        <motion.aside
            animate={{ width: isCollapsed ? '80px' : '280px' }}
            transition={{ duration: 0.4, ease: luxuryTheme.animations.easings.elegant }}
            className={`
                h-full flex flex-col
                bg-white dark:bg-neutral-900
                border-r border-neutral-200 dark:border-neutral-800
                ${className}
            `}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3"
                    >
                        <Avatar className="w-8 h-8 border border-neutral-200 dark:border-neutral-800">
                            <AvatarFallback className="bg-neutral-100 dark:bg-neutral-800">
                                <Sparkles className="w-4 h-4 text-neutral-900 dark:text-neutral-50" />
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
                                Career Advisor
                            </h2>
                            <p className="text-xs text-neutral-500 dark:text-neutral-500">
                                {displayChats.length + totalToolItems} élément{(displayChats.length + totalToolItems) > 1 ? 's' : ''}
                            </p>
                        </div>
                    </motion.div>
                )}

                <LuxuryIconButton
                    icon={isMobile ? <ChevronLeft className="w-5 h-5" /> : (isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />)}
                    onClick={isMobile && onCloseMobile ? onCloseMobile : toggleCollapse}
                    variant="ghost"
                    size="sm"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                />
            </div>

            {/* Main scrollable content (Outils IA) */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
                
                {/* Free Chat Subtle Button */}
                <div className="pt-2 pb-1 border-b border-neutral-100 dark:border-neutral-800/50">
                    <button
                        onClick={onNewChat}
                        className={`
                            w-full flex items-center gap-2.5 px-3 py-2 rounded-lg 
                            text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50
                            hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all group
                            ${isCollapsed ? 'justify-center' : ''}
                        `}
                        title="Discussion libre"
                    >
                        <MessageSquare className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                        {!isCollapsed && <span className="text-xs font-medium">Discussion libre</span>}
                    </button>
                </div>

                {/* Tool Histories Section */}
                {!isCollapsed && (
                    <div className="space-y-1">
                        {totalToolItems > 0 && (
                            <div className="text-[9px] font-bold text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.2em] px-1 pb-1 pt-2">
                                Outils IA
                            </div>
                        )}
                        {TOOL_CATEGORIES.map(cat => {
                            const items = toolHistories[cat.context] || [];
                            if (items.length === 0) return null;
                            const Icon = cat.icon;
                            const isExpanded = expandedTools[cat.context] || false;

                            return (
                                <div key={cat.context}>
                                    <button
                                        onClick={() => toggleToolExpand(cat.context)}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all text-left group"
                                    >
                                        <Icon className={`w-3.5 h-3.5 ${cat.color} flex-shrink-0`} />
                                        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 flex-1 truncate">
                                            {cat.label}
                                        </span>
                                        <span className="text-[10px] text-neutral-400 dark:text-neutral-600 tabular-nums">
                                            {items.length}
                                        </span>
                                        <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pl-4 space-y-0.5 py-1">
                                                    {items.map(item =>
                                                            <ToolHistoryItemRow
                                                                key={item.id}
                                                                item={item}
                                                                categoryRoute={cat.route}
                                                                onClick={() => handleToolClick(item, cat.context, cat.route)}
                                                                onDelete={() => handleDeleteToolHistory(item.id, cat.context)}
                                                            />
                                                    )}
                                                    <a
                                                        href={cat.route}
                                                        className="flex items-center gap-2 px-3 py-1.5 text-[10px] text-amber-600 dark:text-amber-500 hover:text-amber-700 font-medium"
                                                    >
                                                        <ExternalLink className="w-2.5 h-2.5" />
                                                        Voir tout
                                                    </a>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Collapsed tool indicators */}
                {isCollapsed && totalToolItems > 0 && (
                    <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                        {TOOL_CATEGORIES.map(cat => {
                            const items = toolHistories[cat.context] || [];
                            if (items.length === 0) return null;
                            const Icon = cat.icon;
                            return (
                                <a
                                    key={cat.context}
                                    href={cat.route}
                                    className="w-full flex items-center justify-center py-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all relative group"
                                    title={`${cat.label} (${items.length})`}
                                >
                                    <Icon className={`w-4 h-4 ${cat.color}`} />
                                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                                        {items.length}
                                    </span>
                                </a>
                            );
                        })}
                    </div>
                )}
            </div>
        </motion.aside>
    );
};

/**
 * Tool History Item Row
 */
const ToolHistoryItemRow: React.FC<{
    item: ToolHistoryItem;
    categoryRoute: string;
    onClick: () => void;
    onDelete: () => void;
}> = ({ item, categoryRoute, onClick, onDelete }) => {
    const [showDelete, setShowDelete] = useState(false);

    const timestamp = new Date(item.created_at);
    const formattedDate = new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
    }).format(isNaN(timestamp.getTime()) ? new Date() : timestamp);

    const label = item.context_id || formattedDate;
    const truncatedLabel = label.length > 24 ? label.substring(0, 24) + '…' : label;

    return (
        <div
            className="relative group"
            onMouseEnter={() => setShowDelete(true)}
            onMouseLeave={() => setShowDelete(false)}
        >
            <button
                onClick={onClick}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all text-left"
            >
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 truncate">
                        {truncatedLabel}
                    </p>
                    <p className="text-[9px] text-neutral-400 dark:text-neutral-600">
                        {item.created_at_human || formattedDate}
                    </p>
                </div>
            </button>

            <AnimatePresence>
                {showDelete && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="absolute top-1 right-1 p-1 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-200 text-neutral-400 hover:text-red-500 transition-all"
                    >
                        <Trash2 className="w-2.5 h-2.5" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

/**
 * Chat Item Component
 */
const LuxuryChatItem: React.FC<{
    chat: Chat;
    isActive: boolean;
    isCollapsed: boolean;
    onSelect: () => void;
    onDelete: () => void;
}> = ({ chat, isActive, isCollapsed, onSelect, onDelete }) => {
    const [showDelete, setShowDelete] = useState(false);

    const timestamp = chat.timestamp ? new Date(chat.timestamp) : new Date();
    const formattedDate = new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    }).format(isNaN(timestamp.getTime()) ? new Date() : timestamp);

    const preview = chat.preview || '';
    const truncatedPreview = preview.length > 32
        ? preview.substring(0, 32) + '...'
        : preview;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -8 }}
            whileHover={{ scale: isCollapsed ? 1 : 1.01 }}
            onHoverStart={() => setShowDelete(true)}
            onHoverEnd={() => setShowDelete(false)}
            className="relative"
        >
            <button
                onClick={onSelect}
                className={`
                    w-full text-left px-4 py-3 rounded-xl
                    border transition-all duration-400
                    ${isActive
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-500/5 shadow-sm'
                        : 'border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-950'
                    }
                    ${isCollapsed ? 'flex items-center justify-center' : ''}
                `}
            >
                {isCollapsed ? (
                    <MessageSquare className={`w-4 h-4 ${isActive ? 'text-neutral-900 dark:text-neutral-50' : 'text-neutral-500'}`} />
                ) : (
                    <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                            <p className={`
                                text-sm font-medium leading-snug line-clamp-2
                                ${isActive
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-neutral-700 dark:text-neutral-300'
                                }
                            `}>
                                {truncatedPreview || 'Nouvelle conversation'}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-500">
                            <span>{formattedDate}</span>
                            {chat.messagesCount && (
                                <>
                                    <span>·</span>
                                    <span>{chat.messagesCount} msg</span>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </button>

            {/* Delete button */}
            {!isCollapsed && (
                <AnimatePresence>
                    {showDelete && !isActive && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="
                                absolute top-2 right-2
                                p-1.5 rounded-lg
                                bg-white dark:bg-neutral-900
                                border border-neutral-200 dark:border-neutral-800
                                hover:bg-red-50 dark:hover:bg-red-950
                                hover:border-red-200 dark:hover:border-red-800
                                text-neutral-400 hover:text-red-600
                                transition-all duration-200
                            "
                        >
                            <Trash2 className="w-3 h-3" />
                        </motion.button>
                    )}
                </AnimatePresence>
            )}

            {/* Active indicator */}
            {isActive && (
                <motion.div
                    layoutId="activeChatIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-r-full"
                    transition={{ duration: 0.3, ease: luxuryTheme.animations.easings.elegant }}
                />
            )}
        </motion.div>
    );
};

export default LuxurySidebar;
