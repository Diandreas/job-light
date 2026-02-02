import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import { cn } from '@/lib/utils';
import { Service } from '@/types/career-advisor';
import { ChatHistoryItem } from '@/Components/ai/hooks/useChatHistory';

interface ChatLayoutProps {
    children: ReactNode;
    isSidebarCollapsed: boolean;
    onToggleSidebar: () => void;
    isMobileSidebarOpen: boolean;
    onCloseMobileSidebar: () => void;
    onNewChat: () => void;
    userChats: ChatHistoryItem[];
    selectedService: Service;
    activeContextId?: string;
    onChatSelect: (chat: ChatHistoryItem) => void;
    onChatDelete: (chat: ChatHistoryItem) => void;
    onServiceSelect: (service: Service) => void;
    artifactSidebarOpen?: boolean;
}

export default function ChatLayout({
    children,
    isSidebarCollapsed,
    onToggleSidebar,
    isMobileSidebarOpen,
    onCloseMobileSidebar,
    onNewChat,
    userChats,
    selectedService,
    activeContextId,
    onChatSelect,
    onChatDelete,
    onServiceSelect,
    artifactSidebarOpen = false,
}: ChatLayoutProps) {
    return (
        <div className={cn(
            "h-[calc(100vh-50px)] flex bg-gray-50 dark:bg-gray-900 transition-all duration-300",
            artifactSidebarOpen ? "mr-80" : ""
        )}>
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex">
                <Sidebar
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={onToggleSidebar}
                    onNewChat={onNewChat}
                    userChats={userChats}
                    selectedService={selectedService}
                    activeContextId={activeContextId}
                    onChatSelect={onChatSelect}
                    onChatDelete={onChatDelete}
                    onServiceSelect={onServiceSelect}
                />
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900 h-full">
                {children}
            </div>

            {/* Mobile Sidebar */}
            <MobileSidebar
                isOpen={isMobileSidebarOpen}
                onClose={onCloseMobileSidebar}
                onNewChat={onNewChat}
                userChats={userChats}
                selectedService={selectedService}
                activeContextId={activeContextId}
                onChatSelect={onChatSelect}
                onChatDelete={onChatDelete}
                onServiceSelect={onServiceSelect}
            />
        </div>
    );
}
