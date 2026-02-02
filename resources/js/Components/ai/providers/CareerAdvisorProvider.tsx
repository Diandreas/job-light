import React, { createContext, useContext, useReducer, useCallback, ReactNode, useRef, useEffect } from 'react';
import { Service, Message } from '@/types/career-advisor';
import { SERVICES } from '@/Components/ai/constants';
import { ChatHistoryItem } from '@/Components/ai/hooks/useChatHistory';

// ==========================================
// State
// ==========================================
export interface ActiveChat {
    context_id: string;
    service_id: string;
    messages: Array<Message & { isLatest?: boolean; isThinking?: boolean }>;
    created_at?: string;
}

interface CareerAdvisorState {
    isLoading: boolean;
    selectedService: Service;
    language: string;
    activeChat: ActiveChat | null;
    userChats: ChatHistoryItem[];
    walletBalance: number;
    tokensUsed: number;
    isSidebarCollapsed: boolean;
    isMobileSidebarOpen: boolean;
    isExporting: boolean;
    artifactSidebarOpen: boolean;
    deleteDialogOpen: boolean;
    chatToDelete: ChatHistoryItem | null;
    tempMessage: (Message & { isThinking: boolean }) | null;
    showTopMascot: boolean;
    streamingContent: string;
}

// ==========================================
// Actions
// ==========================================
type Action =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_SERVICE'; payload: Service }
    | { type: 'SET_LANGUAGE'; payload: string }
    | { type: 'SET_ACTIVE_CHAT'; payload: ActiveChat | null }
    | { type: 'UPDATE_ACTIVE_CHAT_MESSAGES'; payload: Array<Message & { isLatest?: boolean }> }
    | { type: 'SET_USER_CHATS'; payload: ChatHistoryItem[] }
    | { type: 'ADD_CHAT'; payload: ChatHistoryItem }
    | { type: 'REMOVE_CHAT'; payload: string }
    | { type: 'SET_WALLET_BALANCE'; payload: number }
    | { type: 'SET_TOKENS_USED'; payload: number }
    | { type: 'TOGGLE_SIDEBAR' }
    | { type: 'SET_MOBILE_SIDEBAR'; payload: boolean }
    | { type: 'SET_EXPORTING'; payload: boolean }
    | { type: 'SET_ARTIFACT_SIDEBAR'; payload: boolean }
    | { type: 'SET_DELETE_DIALOG'; payload: { open: boolean; chat: ChatHistoryItem | null } }
    | { type: 'SET_TEMP_MESSAGE'; payload: (Message & { isThinking: boolean }) | null }
    | { type: 'SET_SHOW_MASCOT'; payload: boolean }
    | { type: 'SET_STREAMING_CONTENT'; payload: string }
    | { type: 'NEW_CHAT' };

function reducer(state: CareerAdvisorState, action: Action): CareerAdvisorState {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_SERVICE':
            return { ...state, selectedService: action.payload };
        case 'SET_LANGUAGE':
            return { ...state, language: action.payload };
        case 'SET_ACTIVE_CHAT':
            return { ...state, activeChat: action.payload, streamingContent: '' };
        case 'UPDATE_ACTIVE_CHAT_MESSAGES':
            if (!state.activeChat) return state;
            return { ...state, activeChat: { ...state.activeChat, messages: action.payload } };
        case 'SET_USER_CHATS':
            return { ...state, userChats: action.payload };
        case 'ADD_CHAT':
            return {
                ...state,
                userChats: [action.payload, ...state.userChats.filter(c => c.context_id !== action.payload.context_id)],
            };
        case 'REMOVE_CHAT':
            return {
                ...state,
                userChats: state.userChats.filter(c => c.context_id !== action.payload),
                activeChat: state.activeChat?.context_id === action.payload ? null : state.activeChat,
            };
        case 'SET_WALLET_BALANCE':
            return { ...state, walletBalance: action.payload };
        case 'SET_TOKENS_USED':
            return { ...state, tokensUsed: action.payload };
        case 'TOGGLE_SIDEBAR':
            return { ...state, isSidebarCollapsed: !state.isSidebarCollapsed };
        case 'SET_MOBILE_SIDEBAR':
            return { ...state, isMobileSidebarOpen: action.payload };
        case 'SET_EXPORTING':
            return { ...state, isExporting: action.payload };
        case 'SET_ARTIFACT_SIDEBAR':
            return { ...state, artifactSidebarOpen: action.payload };
        case 'SET_DELETE_DIALOG':
            return { ...state, deleteDialogOpen: action.payload.open, chatToDelete: action.payload.chat };
        case 'SET_TEMP_MESSAGE':
            return { ...state, tempMessage: action.payload };
        case 'SET_SHOW_MASCOT':
            return { ...state, showTopMascot: action.payload };
        case 'SET_STREAMING_CONTENT':
            return { ...state, streamingContent: action.payload };
        case 'NEW_CHAT':
            return {
                ...state,
                activeChat: null,
                tempMessage: null,
                streamingContent: '',
            };
        default:
            return state;
    }
}

// ==========================================
// Context
// ==========================================
interface CareerAdvisorContextType {
    state: CareerAdvisorState;
    dispatch: React.Dispatch<Action>;
}

const CareerAdvisorContext = createContext<CareerAdvisorContextType | null>(null);

export function useCareerAdvisor() {
    const ctx = useContext(CareerAdvisorContext);
    if (!ctx) throw new Error('useCareerAdvisor must be used within CareerAdvisorProvider');
    return ctx;
}

// ==========================================
// Provider
// ==========================================
interface ProviderProps {
    children: ReactNode;
    initialBalance: number;
    initialChats: ChatHistoryItem[];
    initialLanguage?: string;
}

export function CareerAdvisorProvider({ children, initialBalance, initialChats, initialLanguage = 'fr' }: ProviderProps) {
    const savedCollapsed = typeof window !== 'undefined'
        ? localStorage.getItem('career_advisor_sidebar_collapsed')
        : null;

    const [state, dispatch] = useReducer(reducer, {
        isLoading: false,
        selectedService: SERVICES[0],
        language: initialLanguage,
        activeChat: null,
        userChats: initialChats,
        walletBalance: initialBalance,
        tokensUsed: 0,
        isSidebarCollapsed: savedCollapsed ? JSON.parse(savedCollapsed) : false,
        isMobileSidebarOpen: false,
        isExporting: false,
        artifactSidebarOpen: false,
        deleteDialogOpen: false,
        chatToDelete: null,
        tempMessage: null,
        showTopMascot: true,
        streamingContent: '',
    });

    return (
        <CareerAdvisorContext.Provider value={{ state, dispatch }}>
            {children}
        </CareerAdvisorContext.Provider>
    );
}

export default CareerAdvisorProvider;
