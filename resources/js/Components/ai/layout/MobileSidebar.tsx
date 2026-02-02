import React from 'react';
import Sidebar from './Sidebar';
import { Service } from '@/types/career-advisor';
import { ChatHistoryItem } from '@/Components/ai/hooks/useChatHistory';

interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onNewChat: () => void;
    userChats: ChatHistoryItem[];
    selectedService: Service;
    activeContextId?: string;
    onChatSelect: (chat: ChatHistoryItem) => void;
    onChatDelete: (chat: ChatHistoryItem) => void;
    onServiceSelect: (service: Service) => void;
}

export default function MobileSidebar({
    isOpen,
    onClose,
    onNewChat,
    userChats,
    selectedService,
    activeContextId,
    onChatSelect,
    onChatDelete,
    onServiceSelect,
}: MobileSidebarProps) {
    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-900 transform transition-transform duration-300 ease-in-out z-50 md:hidden
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <Sidebar
                    isCollapsed={false}
                    onToggleCollapse={() => {}}
                    onNewChat={onNewChat}
                    userChats={userChats}
                    selectedService={selectedService}
                    activeContextId={activeContextId}
                    onChatSelect={(chat) => {
                        onChatSelect(chat);
                        setTimeout(() => onClose(), 200);
                    }}
                    onChatDelete={onChatDelete}
                    onServiceSelect={onServiceSelect}
                    onCloseMobile={onClose}
                    isMobile={true}
                />
            </div>
        </>
    );
}
