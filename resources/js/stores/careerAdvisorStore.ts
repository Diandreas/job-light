import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CareerAdvisorState {
    // Session state
    activeSessionId: string | null;
    setActiveSession: (id: string | null) => void;

    // User credits/limits
    credits: number;
    useCredit: (amount: number) => void;

    // Shared user context
    userContext: {
        targetRole: string;
        yearsExperience: number;
        topSkills: string[];
    };
    updateUserContext: (data: Partial<CareerAdvisorState['userContext']>) => void;

    // UI preferences
    darkMode: boolean;
    toggleDarkMode: () => void;
}

export const useCareerAdvisorStore = create<CareerAdvisorState>()(
    persist(
        (set) => ({
            activeSessionId: null,
            setActiveSession: (id) => set({ activeSessionId: id }),

            credits: 10, // Mock init
            useCredit: (amount) => set((state) => ({ credits: Math.max(0, state.credits - amount) })),

            userContext: {
                targetRole: '',
                yearsExperience: 0,
                topSkills: []
            },
            updateUserContext: (data) => set((state) => ({
                userContext: { ...state.userContext, ...data }
            })),

            darkMode: false,
            toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode }))
        }),
        {
            name: 'career-advisor-storage',
        }
    )
);
