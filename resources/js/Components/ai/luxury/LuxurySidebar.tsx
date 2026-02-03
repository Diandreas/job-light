import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ChevronLeft, ChevronRight, Sparkles, MessageSquare } from 'lucide-react';
import { luxuryTheme } from '@/design-system/luxury-theme';
import { LuxuryIconButton } from '@/Components/ui/luxury/Button';
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";

interface Chat {
    id: string;
    preview: string;
    timestamp: Date;
    messagesCount?: number;
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
                                {displayChats.length} conversation{displayChats.length > 1 ? 's' : ''}
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

            {/* New Chat Button */}
            <div className="p-4">
                <motion.button
                    onClick={onNewChat}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl
                        bg-amber-500 text-white
                        hover:bg-amber-600
                        shadow-md shadow-amber-500/10 hover:shadow-lg hover:shadow-amber-500/20
                        transition-all duration-400
                        ${isCollapsed ? 'justify-center' : ''}
                    `}
                >
                    <Plus className="w-4 h-4 flex-shrink-0" />
                    {!isCollapsed && (
                        <span className="text-sm font-medium tracking-wide">
                            Nouvelle conversation
                        </span>
                    )}
                </motion.button>
            </div>

            {/* Chats List */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
                <AnimatePresence mode="popLayout">
                    {displayChats.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <MessageSquare className="w-8 h-8 mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
                            {!isCollapsed && (
                                <p className="text-xs text-neutral-500 dark:text-neutral-500">
                                    Aucune conversation
                                </p>
                            )}
                        </motion.div>
                    ) : (
                        <div className="space-y-2">
                            {displayChats.map((chat) => (
                                <LuxuryChatItem
                                    key={chat.id}
                                    chat={chat}
                                    isActive={chat.id === currentActiveChatId}
                                    isCollapsed={isCollapsed}
                                    onSelect={() => handleSelectChat(chat)}
                                    onDelete={() => handleDeleteChat(chat)}
                                />
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.aside>
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
