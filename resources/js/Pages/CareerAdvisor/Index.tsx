import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/Components/ui/use-toast';
import { useMedian } from '@/hooks/useMedian';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { AnimatePresence, motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { SERVICES } from '@/Components/ai/constants';
import { Service } from '@/types/career-advisor';
import { cn } from '@/lib/utils';
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
} from '@/Components/ui/alert-dialog';

// New decomposed components
import { CareerAdvisorProvider, useCareerAdvisor } from '@/Components/ai/providers/CareerAdvisorProvider';
import { ErrorBoundary } from '@/Components/ai/errors/ErrorBoundary';
import ChatErrorFallback from '@/Components/ai/errors/ChatErrorFallback';
import ChatLayout from '@/Components/ai/layout/ChatLayout';
import ChatHeader from '@/Components/ai/layout/ChatHeader';
import ChatView from '@/Components/ai/chat/ChatView';
import ChatInput from '@/Components/ai/chat/ChatInput';

// Hooks
import { useChat } from '@/Components/ai/hooks/useChat';
import { useStreamingResponse } from '@/Components/ai/hooks/useStreamingResponse';
import { useWallet } from '@/Components/ai/hooks/useWallet';
import { useExport } from '@/Components/ai/hooks/useExport';
import { useChatHistory, ChatHistoryItem } from '@/Components/ai/hooks/useChatHistory';

// Existing components that remain
import ServiceSelector from '@/Components/ai/specialized/ServiceSelector';
import ArtifactSidebar from '@/Components/ai/artifacts/ArtifactSidebar';
import { ArtifactData } from '@/Components/ai/artifacts/ArtifactDetector';

import axios from 'axios';

const thinkingMessages = [
    'career_advisor.chat.thinking.analyzing',
    'career_advisor.chat.thinking.reflecting',
    'career_advisor.chat.thinking.generating',
    'career_advisor.chat.thinking.finalizing',
];

interface PageProps {
    auth: { user: { id: number; name: string; email: string; email_verified_at: string; wallet_balance: number } };
    userInfo: any;
    chatHistories: ChatHistoryItem[];
}

function CareerAdvisorInner({ auth, userInfo }: Omit<PageProps, 'chatHistories'>) {
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const { isReady, isAndroidApp } = useMedian();
    const { state, dispatch } = useCareerAdvisor();

    // Hooks
    const wallet = useWallet(state.walletBalance);
    const chatHistory = useChatHistory(state.userChats, {
        onError: (msg) => toast({ title: t('career_advisor.messages.error'), description: msg, variant: 'destructive' }),
    });
    const { sendMessage } = useChat({
        onError: (msg) => toast({ title: t('career_advisor.messages.error'), description: msg, variant: 'destructive' }),
    });
    const { isStreaming, content: streamingContent, startStream, abort: abortStream } = useStreamingResponse({
        onDone: (fullContent) => {
            // Streaming finished - add message to chat
            const assistantMessage = {
                role: 'assistant' as const,
                content: fullContent,
                timestamp: new Date(),
                isLatest: true,
            };
            const updatedMessages = [...(state.activeChat?.messages || []), assistantMessage];
            dispatch({ type: 'SET_ACTIVE_CHAT', payload: { ...state.activeChat!, messages: updatedMessages } });
            dispatch({ type: 'SET_LOADING', payload: false });
            dispatch({ type: 'SET_STREAMING_CONTENT', payload: '' });
            chatHistory.loadChats();
        },
        onError: () => {
            dispatch({ type: 'SET_LOADING', payload: false });
        },
    });
    const exportHook = useExport({
        onSuccess: (format) => toast({
            title: t('components.career_advisor.interface.export_success'),
            description: t('components.career_advisor.interface.export_file_downloaded', { format: format.toUpperCase() }),
        }),
        onError: (msg) => toast({
            title: t('components.career_advisor.interface.export_error'),
            description: msg,
            variant: 'destructive',
        }),
    });

    // Local state for input
    const [inputValue, setInputValue] = useState('');
    const [contextId, setContextId] = useState<string>(crypto.randomUUID());
    const [currentArtifacts, setCurrentArtifacts] = useState<ArtifactData[]>([]);
    const [currentArtifactContent, setCurrentArtifactContent] = useState('');
    const [showTopMascot, setShowTopMascot] = useState(true);
    const thinkingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Sync wallet balance
    useEffect(() => {
        dispatch({ type: 'SET_WALLET_BALANCE', payload: wallet.balance });
    }, [wallet.balance]);

    // Sync chat list
    useEffect(() => {
        dispatch({ type: 'SET_USER_CHATS', payload: chatHistory.chats });
    }, [chatHistory.chats]);

    // Load chats on mount
    useEffect(() => {
        chatHistory.loadChats();

        const handleToggleSidebar = () => {
            dispatch({ type: 'SET_MOBILE_SIDEBAR', payload: !state.isMobileSidebarOpen });
            if ('vibrate' in navigator) navigator.vibrate(50);
        };
        window.addEventListener('toggleCareerAdvisorSidebar', handleToggleSidebar);

        return () => {
            if (thinkingIntervalRef.current) clearInterval(thinkingIntervalRef.current);
            window.removeEventListener('toggleCareerAdvisorSidebar', handleToggleSidebar);
        };
    }, []);

    // Reset input on language or service change
    useEffect(() => {
        setInputValue('');
    }, [i18n.language, state.selectedService]);

    // === Handlers ===

    const handleServiceSelection = useCallback((service: Service) => {
        if ((service as any).comingSoon) {
            toast({ title: t('career_advisor.coming_soon.badge'), description: t('career_advisor.coming_soon.available_from', { date: (service as any).releaseDate }), variant: 'default' });
            return;
        }
        dispatch({ type: 'SET_SERVICE', payload: service });
        if (!state.activeChat || (state.activeChat as any).service_id !== service.id) {
            dispatch({ type: 'SET_ACTIVE_CHAT', payload: null });
            setInputValue('');
            setContextId(crypto.randomUUID());
        }
        dispatch({ type: 'SET_MOBILE_SIDEBAR', payload: false });
    }, [state.activeChat, dispatch, toast, t]);

    const handleChatSelection = useCallback(async (chat: ChatHistoryItem) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        const data = await chatHistory.loadChat(chat.context_id);
        if (data) {
            const service = SERVICES.find(s => s.id === data.service_id);
            if (service) dispatch({ type: 'SET_SERVICE', payload: service });
            const messages = (data.messages || []).map(m => ({
                ...m,
                timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
            }));
            dispatch({
                type: 'SET_ACTIVE_CHAT',
                payload: { ...data, messages },
            });
            setContextId(data.context_id);
        }
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_MOBILE_SIDEBAR', payload: false });
    }, [chatHistory, dispatch]);

    const handleDeleteChat = useCallback(async () => {
        const chat = state.chatToDelete;
        if (!chat) return;

        const success = await chatHistory.deleteChat(chat.context_id);
        if (success) {
            if (state.activeChat?.context_id === chat.context_id) {
                dispatch({ type: 'SET_ACTIVE_CHAT', payload: null });
                setContextId(crypto.randomUUID());
            }
            toast({ title: t('common.success'), description: t('career_advisor.messages.delete_success') });
        }
        dispatch({ type: 'SET_DELETE_DIALOG', payload: { open: false, chat: null } });
    }, [state.chatToDelete, state.activeChat, chatHistory, dispatch, toast, t]);

    const createNewChat = useCallback(() => {
        dispatch({ type: 'NEW_CHAT' });
        setContextId(crypto.randomUUID());
        setInputValue('');
        if ('vibrate' in navigator) navigator.vibrate([50, 100, 50]);
    }, [dispatch]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        if (!wallet.canAfford(state.selectedService.cost)) {
            toast({ title: t('career_advisor.messages.insufficient_balance'), description: t('career_advisor.messages.recharge_needed'), variant: 'destructive' });
            return;
        }

        dispatch({ type: 'SET_LOADING', payload: true });

        const userMessage = { role: 'user' as const, content: inputValue, timestamp: new Date() };
        const updatedMessages = [...(state.activeChat?.messages || []), userMessage];
        dispatch({
            type: 'SET_ACTIVE_CHAT',
            payload: {
                context_id: contextId,
                service_id: state.selectedService.id,
                messages: updatedMessages,
            },
        });

        const savedInput = inputValue;
        setInputValue('');

        // Thinking messages
        let thinkingIdx = 0;
        dispatch({
            type: 'SET_TEMP_MESSAGE',
            payload: { role: 'assistant', content: t(thinkingMessages[0]), timestamp: new Date(), isThinking: true },
        });

        if (thinkingIntervalRef.current) clearInterval(thinkingIntervalRef.current);
        thinkingIntervalRef.current = setInterval(() => {
            thinkingIdx = (thinkingIdx + 1) % thinkingMessages.length;
            dispatch({
                type: 'SET_TEMP_MESSAGE',
                payload: { role: 'assistant', content: t(thinkingMessages[thinkingIdx]), timestamp: new Date(), isThinking: true },
            });
        }, 1500);

        try {
            // Use non-streaming endpoint (streaming can be enabled later)
            const result = await sendMessage({
                message: savedInput,
                contextId,
                language: i18n.language || 'fr',
                serviceId: state.selectedService.id,
                history: state.activeChat?.messages || [],
            });

            if (thinkingIntervalRef.current) clearInterval(thinkingIntervalRef.current);
            dispatch({ type: 'SET_TEMP_MESSAGE', payload: null });

            const assistantMessage = { role: 'assistant' as const, content: result.message, timestamp: new Date(), isLatest: true };
            const finalMessages = [...updatedMessages, assistantMessage];

            dispatch({
                type: 'SET_ACTIVE_CHAT',
                payload: {
                    context_id: contextId,
                    service_id: state.selectedService.id,
                    messages: finalMessages,
                },
            });

            // Update wallet from server response
            if (result.balance !== undefined) {
                wallet.updateBalance(result.balance);
            } else {
                wallet.optimisticDebit(state.selectedService.cost);
            }

            dispatch({ type: 'SET_TOKENS_USED', payload: result.tokens });
            await chatHistory.loadChats();
        } catch (error) {
            if (thinkingIntervalRef.current) clearInterval(thinkingIntervalRef.current);
            dispatch({ type: 'SET_TEMP_MESSAGE', payload: null });
            // No refund needed - wallet is debited server-side only on success
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [inputValue, state.activeChat, state.selectedService, contextId, wallet, dispatch, sendMessage, chatHistory, i18n.language, t, toast]);

    const handleExport = useCallback((format: 'pdf' | 'docx' | 'pptx') => {
        if (!state.activeChat?.context_id) return;
        exportHook.exportChat(state.activeChat.context_id, format);
    }, [state.activeChat, exportHook]);

    const handleEnhancedServiceSubmit = useCallback(async (serviceId: string, data: any) => {
        const service = SERVICES.find(s => s.id === serviceId);

        if (data.isTest && data.mockResponse) {
            const cId = crypto.randomUUID();
            const newChat = {
                context_id: cId,
                service_id: serviceId,
                created_at: new Date().toISOString(),
                messages: [
                    { role: 'user' as const, content: data.prompt, timestamp: new Date() },
                    { role: 'assistant' as const, content: data.mockResponse, timestamp: new Date(), isLatest: true },
                ],
            };
            dispatch({ type: 'SET_ACTIVE_CHAT', payload: newChat });
            return;
        }

        if (!wallet.canAfford(service?.cost || 0)) {
            toast({ title: t('components.career_advisor.interface.insufficient_balance'), description: t('components.career_advisor.interface.insufficient_tokens'), variant: 'destructive' });
            return;
        }

        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const cId = crypto.randomUUID();
            const response = await axios.post('/career-advisor/chat', {
                message: data.prompt || data.finalPrompt || JSON.stringify(data),
                contextId: cId,
                language: i18n.language || 'fr',
                serviceId,
                history: [],
            });

            if (response.data.message) {
                const newChat = {
                    context_id: cId,
                    service_id: serviceId,
                    created_at: new Date().toISOString(),
                    messages: [
                        { role: 'user' as const, content: data.prompt || data.finalPrompt || t('components.career_advisor.interface.custom_request'), timestamp: new Date() },
                        { role: 'assistant' as const, content: response.data.message, timestamp: new Date(), isLatest: true },
                    ],
                };
                dispatch({ type: 'SET_ACTIVE_CHAT', payload: newChat });

                if (response.data.balance !== undefined) {
                    wallet.updateBalance(response.data.balance);
                } else {
                    wallet.optimisticDebit(service?.cost || 0);
                }
            }
            await chatHistory.loadChats();
        } catch (error) {
            toast({ title: t('components.career_advisor.interface.error'), description: t('components.career_advisor.interface.error_occurred'), variant: 'destructive' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [wallet, dispatch, chatHistory, i18n.language, t, toast]);

    const handleArtifactAction = useCallback(async (action: string, data: any) => {
        toast({ title: t('components.career_advisor.interface.artifact_action'), description: t('components.career_advisor.interface.artifact_action_executed', { action }) });
    }, [toast, t]);

    return (
        <AuthenticatedLayout user={auth.user}>
            <div className="opacity-10">
                <FluidCursorEffect zIndex={100} />
            </div>

            <ErrorBoundary fallback={<ChatErrorFallback onRetry={() => window.location.reload()} />}>
                <ChatLayout
                    isSidebarCollapsed={state.isSidebarCollapsed}
                    onToggleSidebar={() => {
                        dispatch({ type: 'TOGGLE_SIDEBAR' });
                        localStorage.setItem('career_advisor_sidebar_collapsed', JSON.stringify(!state.isSidebarCollapsed));
                    }}
                    isMobileSidebarOpen={state.isMobileSidebarOpen}
                    onCloseMobileSidebar={() => dispatch({ type: 'SET_MOBILE_SIDEBAR', payload: false })}
                    onNewChat={createNewChat}
                    userChats={state.userChats}
                    selectedService={state.selectedService}
                    activeContextId={state.activeChat?.context_id}
                    onChatSelect={handleChatSelection}
                    onChatDelete={(chat) => dispatch({ type: 'SET_DELETE_DIALOG', payload: { open: true, chat } })}
                    onServiceSelect={handleServiceSelection}
                    artifactSidebarOpen={state.artifactSidebarOpen}
                >
                    {!state.activeChat ? (
                        /* Service selection / landing */
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex-1 overflow-y-auto">
                                <div className="px-4 py-6">
                                    <AnimatePresence>
                                        {showTopMascot && (
                                            <motion.div
                                                className="text-center mb-8"
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.5, opacity: 0, y: -50, transition: { duration: 0.5, ease: 'easeInOut' } }}
                                                transition={{ duration: 0.5, type: 'spring' }}
                                            >
                                                <div className="w-20 h-20 rounded-2xl mx-auto mb-4 overflow-hidden shadow-lg">
                                                    <img src="/mascot/mas.png" alt="AI Assistant" className="w-full h-full object-cover" />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="px-2">
                                        <ServiceSelector
                                            userInfo={userInfo}
                                            onServiceSubmit={handleEnhancedServiceSubmit}
                                            isLoading={state.isLoading}
                                            walletBalance={wallet.balance}
                                            onServiceSelect={() => setShowTopMascot(false)}
                                            onBackToServices={() => setShowTopMascot(true)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Active chat */
                        <div className="flex-1 flex flex-col min-h-0">
                            <ChatHeader
                                selectedService={state.selectedService}
                                onNewChat={createNewChat}
                                onExport={handleExport}
                                isExporting={exportHook.isExporting}
                                isAndroidApp={isAndroidApp}
                                isReady={isReady}
                                artifactCount={currentArtifacts.length}
                                onToggleArtifacts={() => dispatch({ type: 'SET_ARTIFACT_SIDEBAR', payload: !state.artifactSidebarOpen })}
                                artifactSidebarOpen={state.artifactSidebarOpen}
                            />

                            <ChatView
                                messages={state.activeChat.messages}
                                tempMessage={state.tempMessage}
                                streamingContent={streamingContent}
                                isStreaming={isStreaming}
                                serviceId={state.selectedService.id}
                                onArtifactAction={handleArtifactAction}
                            />

                            <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-3">
                                <div className="max-w-4xl mx-auto">
                                    <ChatInput
                                        value={inputValue}
                                        onChange={setInputValue}
                                        onSubmit={handleSubmit}
                                        placeholder={t(`services.${state.selectedService.id}.placeholder`)}
                                        disabled={state.isLoading}
                                        isLoading={state.isLoading}
                                        cost={state.selectedService.cost}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </ChatLayout>
            </ErrorBoundary>

            {/* Delete dialog */}
            <AlertDialog open={state.deleteDialogOpen} onOpenChange={(open) => dispatch({ type: 'SET_DELETE_DIALOG', payload: { open, chat: open ? state.chatToDelete : null } })}>
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
                        <AlertDialogAction onClick={handleDeleteChat} className="bg-red-500 hover:bg-red-600 text-white">
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('common.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Artifact sidebar */}
            <ArtifactSidebar
                artifacts={currentArtifacts}
                isOpen={state.artifactSidebarOpen}
                onClose={() => dispatch({ type: 'SET_ARTIFACT_SIDEBAR', payload: false })}
                serviceId={state.selectedService.id}
                messageContent={currentArtifactContent}
            />

            <style>{`
                .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                @media (max-width: 768px) { .mobile-optimized { font-size: 16px; } }
            `}</style>
        </AuthenticatedLayout>
    );
}

export default function EnhancedCareerAdvisor({ auth, userInfo, chatHistories }: PageProps) {
    const { i18n } = useTranslation();

    return (
        <CareerAdvisorProvider
            initialBalance={auth.user.wallet_balance}
            initialChats={chatHistories || []}
            initialLanguage={i18n.language || 'fr'}
        >
            <CareerAdvisorInner auth={auth} userInfo={userInfo} />
        </CareerAdvisorProvider>
    );
}
