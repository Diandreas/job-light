import React from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Plus, ChevronDown, ChevronRight, ChevronLeft,
    MessageSquare, Calendar, Trash2, Sparkles
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Service } from '@/types/career-advisor';
import { SERVICES } from '@/Components/ai/constants';
import { ChatHistoryItem } from '@/Components/ai/hooks/useChatHistory';

interface SidebarProps {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    onNewChat: () => void;
    userChats: ChatHistoryItem[];
    selectedService: Service;
    activeContextId?: string;
    onChatSelect: (chat: ChatHistoryItem) => void;
    onChatDelete: (chat: ChatHistoryItem) => void;
    onServiceSelect: (service: Service) => void;
    onCloseMobile?: () => void;
    isMobile?: boolean;
}

function CompactChatCard({ chat, isActive, onSelect, onDelete }: {
    chat: ChatHistoryItem;
    isActive: boolean;
    onSelect: (chat: ChatHistoryItem) => void;
    onDelete: (chat: ChatHistoryItem) => void;
}) {
    const { t } = useTranslation();
    const preview = chat.preview
        ? (chat.preview.length > 28 ? chat.preview.substring(0, 28) + '...' : chat.preview)
        : t('components.career_advisor.interface.new_conversation');

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
                        {preview}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-2.5 w-2.5" />
                            <span>
                                {new Date(chat.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onDelete(chat); }}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 transition-all"
            >
                <Trash2 className="h-3 w-3" />
            </Button>
        </motion.div>
    );
}

export default function Sidebar({
    isCollapsed,
    onToggleCollapse,
    onNewChat,
    userChats,
    selectedService,
    activeContextId,
    onChatSelect,
    onChatDelete,
    onServiceSelect,
    onCloseMobile,
    isMobile = false,
}: SidebarProps) {
    const { t } = useTranslation();
    const filteredChats = userChats.filter(chat => chat.service_id === selectedService.id);

    return (
        <div className={cn(
            "bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 h-full",
            isMobile ? "w-full" : (isCollapsed ? "w-12" : "w-64"),
            !isMobile && "border-r border-gray-200 dark:border-gray-800"
        )}>
            {/* Header */}
            <div className={cn("border-b border-gray-200 dark:border-gray-800", isMobile ? "p-4" : "p-2")}>
                {isMobile && onCloseMobile && (
                    <div className="flex justify-end mb-2">
                        <Button onClick={(e) => { e.stopPropagation(); onCloseMobile(); }} variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {isCollapsed ? (
                    <div className="flex flex-col items-center gap-2">
                        <Avatar className="w-8 h-8">
                            <AvatarImage src="/mascot/mascot.png" />
                            <AvatarFallback className="bg-gradient-to-r from-amber-500 to-purple-500 text-white text-xs">AI</AvatarFallback>
                        </Avatar>
                        <Button onClick={(e) => { e.stopPropagation(); onNewChat(); }} size="sm" className="w-8 h-8 p-0 bg-gradient-to-r from-amber-500 to-purple-500">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src="/mascot/mascot.png" />
                                <AvatarFallback className="bg-gradient-to-r from-amber-500 to-purple-500 text-white text-xs">AI</AvatarFallback>
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

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full h-7 text-xs justify-between">
                                    <div className="flex items-center gap-1">
                                        <selectedService.icon className="h-3 w-3" />
                                        <span className="truncate">{t(`services.${selectedService.id}.title`)}</span>
                                    </div>
                                    <ChevronDown className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                                {SERVICES.map(service => (
                                    <DropdownMenuItem key={service.id} onSelect={(e) => { e.stopPropagation(); onServiceSelect(service); }} className="text-xs">
                                        <service.icon className="h-3.5 w-3.5 mr-2" />
                                        {t(`services.${service.id}.title`)}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            onClick={(e) => { e.stopPropagation(); onNewChat(); }}
                            className="w-full h-7 bg-gradient-to-r from-amber-500 to-purple-500 text-white text-xs"
                        >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            {t('components.career_advisor.interface.new_chat')}
                        </Button>
                    </div>
                )}

                {!isMobile && (
                    <Button
                        onClick={onToggleCollapse}
                        variant="ghost"
                        size="sm"
                        className={cn("mt-2 transition-all", isCollapsed ? "w-8 h-8 p-0 mx-auto" : "w-full h-6")}
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
                )}
            </div>

            {/* Chat history */}
            <div className={cn("flex-1 min-h-0", isMobile ? "p-4" : "p-2")}>
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
                    <div className={cn("space-y-1", isCollapsed && "flex flex-col items-center")}>
                        <AnimatePresence>
                            {filteredChats.map(chat =>
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
                                                        activeContextId === chat.context_id
                                                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 border-amber-300"
                                                            : "bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100 border-gray-200 dark:border-gray-700"
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
                                        isActive={activeContextId === chat.context_id}
                                        onSelect={onChatSelect}
                                        onDelete={onChatDelete}
                                    />
                                )
                            )}
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
}
