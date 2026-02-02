import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface CoverLetterDraft {
  id?: string;
  yourName: string;
  yourAddress: string;
  yourEmail: string;
  yourPhone: string;
  companyName: string;
  recipientName: string;
  subject: string;
  content: string;
  template: 'standard' | 'modern' | 'creative';
  updatedAt: string;
}

export interface CVSection {
  id: string;
  type: 'header' | 'summary' | 'experience' | 'education' | 'skills' | 'certifications';
  data: any;
  score?: number;
  issues?: string[];
  recommendations?: string[];
}

export interface InterviewQuestion {
  id: string;
  question: string;
  type: 'behavioral' | 'technical' | 'situational';
  answer?: string;
  transcript?: string;
  recording?: Blob;
  score?: number;
  starComponents?: {
    situation: boolean;
    task: boolean;
    action: boolean;
    result: boolean;
  };
}

export interface InterviewSession {
  id: string;
  type: 'technical' | 'behavioral' | 'general';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  duration: number;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  startedAt?: string;
  completedAt?: string;
  overallScore?: number;
}

export interface Milestone {
  id: string;
  phaseId: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  dueDate?: string;
  startedAt?: string;
  completedAt?: string;
  resources?: Array<{ title: string; url: string }>;
  impact?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedHours?: number;
}

export interface Phase {
  id: string;
  title: string;
  description: string;
  duration: string;
  order: number;
  progress: number;
  milestones: Milestone[];
}

export interface Roadmap {
  id: string;
  title: string;
  currentRole: string;
  targetRole: string;
  timeline: string;
  difficulty: number;
  phases: Phase[];
  currentPhaseId: string;
  overallProgress: number;
  marketValueCurrent?: number;
  marketValueTarget?: number;
  createdAt: string;
  updatedAt: string;
}

interface CareerAdvisorStore {
  // Cover Letter
  coverLetterDraft: CoverLetterDraft | null;
  saveCoverLetterDraft: (draft: CoverLetterDraft) => void;
  clearCoverLetterDraft: () => void;

  // CV
  cvSections: CVSection[];
  setCVSections: (sections: CVSection[]) => void;
  updateCVSection: (sectionId: string, data: Partial<CVSection>) => void;
  clearCV: () => void;

  // Interview
  interviewSessions: InterviewSession[];
  currentSession: InterviewSession | null;
  createInterviewSession: (session: Omit<InterviewSession, 'id' | 'questions' | 'currentQuestionIndex'>) => void;
  setCurrentSession: (session: InterviewSession | null) => void;
  updateCurrentQuestion: (questionId: string, data: Partial<InterviewQuestion>) => void;
  nextQuestion: () => void;
  completeInterview: () => void;
  clearInterviewSessions: () => void;

  // Roadmap
  roadmap: Roadmap | null;
  setRoadmap: (roadmap: Roadmap) => void;
  updateMilestone: (milestoneId: string, data: Partial<Milestone>) => void;
  addMilestone: (phaseId: string, milestone: Omit<Milestone, 'id'>) => void;
  updatePhaseProgress: (phaseId: string) => void;
  clearRoadmap: () => void;
}

export const useCareerAdvisorStore = create<CareerAdvisorStore>()(
  persist(
    (set, get) => ({
      // Cover Letter
      coverLetterDraft: null,
      saveCoverLetterDraft: (draft) => {
        set({
          coverLetterDraft: {
            ...draft,
            updatedAt: new Date().toISOString(),
          },
        });
      },
      clearCoverLetterDraft: () => set({ coverLetterDraft: null }),

      // CV
      cvSections: [],
      setCVSections: (sections) => set({ cvSections: sections }),
      updateCVSection: (sectionId, data) => {
        set((state) => ({
          cvSections: state.cvSections.map((section) =>
            section.id === sectionId ? { ...section, ...data } : section
          ),
        }));
      },
      clearCV: () => set({ cvSections: [] }),

      // Interview
      interviewSessions: [],
      currentSession: null,
      createInterviewSession: (sessionData) => {
        const newSession: InterviewSession = {
          ...sessionData,
          id: `session-${Date.now()}`,
          questions: [],
          currentQuestionIndex: 0,
          startedAt: new Date().toISOString(),
        };
        set((state) => ({
          interviewSessions: [...state.interviewSessions, newSession],
          currentSession: newSession,
        }));
      },
      setCurrentSession: (session) => set({ currentSession: session }),
      updateCurrentQuestion: (questionId, data) => {
        set((state) => {
          if (!state.currentSession) return state;

          const updatedQuestions = state.currentSession.questions.map((q) =>
            q.id === questionId ? { ...q, ...data } : q
          );

          const updatedSession = {
            ...state.currentSession,
            questions: updatedQuestions,
          };

          return {
            currentSession: updatedSession,
            interviewSessions: state.interviewSessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            ),
          };
        });
      },
      nextQuestion: () => {
        set((state) => {
          if (!state.currentSession) return state;

          return {
            currentSession: {
              ...state.currentSession,
              currentQuestionIndex: state.currentSession.currentQuestionIndex + 1,
            },
          };
        });
      },
      completeInterview: () => {
        set((state) => {
          if (!state.currentSession) return state;

          const completedSession = {
            ...state.currentSession,
            completedAt: new Date().toISOString(),
          };

          return {
            currentSession: completedSession,
            interviewSessions: state.interviewSessions.map((s) =>
              s.id === completedSession.id ? completedSession : s
            ),
          };
        });
      },
      clearInterviewSessions: () =>
        set({ interviewSessions: [], currentSession: null }),

      // Roadmap
      roadmap: null,
      setRoadmap: (roadmap) => set({ roadmap }),
      updateMilestone: (milestoneId, data) => {
        set((state) => {
          if (!state.roadmap) return state;

          const updatedPhases = state.roadmap.phases.map((phase) => ({
            ...phase,
            milestones: phase.milestones.map((m) =>
              m.id === milestoneId ? { ...m, ...data } : m
            ),
          }));

          return {
            roadmap: {
              ...state.roadmap,
              phases: updatedPhases,
            },
          };
        });

        // Recalculate phase progress
        const milestone = get()
          .roadmap?.phases.flatMap((p) => p.milestones)
          .find((m) => m.id === milestoneId);
        if (milestone) {
          get().updatePhaseProgress(milestone.phaseId);
        }
      },
      addMilestone: (phaseId, milestone) => {
        set((state) => {
          if (!state.roadmap) return state;

          const newMilestone: Milestone = {
            ...milestone,
            id: `milestone-${Date.now()}`,
            phaseId,
          };

          const updatedPhases = state.roadmap.phases.map((phase) =>
            phase.id === phaseId
              ? { ...phase, milestones: [...phase.milestones, newMilestone] }
              : phase
          );

          return {
            roadmap: {
              ...state.roadmap,
              phases: updatedPhases,
            },
          };
        });

        get().updatePhaseProgress(phaseId);
      },
      updatePhaseProgress: (phaseId) => {
        set((state) => {
          if (!state.roadmap) return state;

          const updatedPhases = state.roadmap.phases.map((phase) => {
            if (phase.id !== phaseId) return phase;

            const completedMilestones = phase.milestones.filter(
              (m) => m.status === 'completed'
            ).length;
            const totalMilestones = phase.milestones.length;
            const progress =
              totalMilestones > 0
                ? Math.round((completedMilestones / totalMilestones) * 100)
                : 0;

            return { ...phase, progress };
          });

          // Calculate overall progress
          const totalProgress = updatedPhases.reduce(
            (sum, phase) => sum + phase.progress,
            0
          );
          const overallProgress = Math.round(
            totalProgress / updatedPhases.length
          );

          return {
            roadmap: {
              ...state.roadmap,
              phases: updatedPhases,
              overallProgress,
            },
          };
        });
      },
      clearRoadmap: () => set({ roadmap: null }),
    }),
    {
      name: 'career-advisor-storage',
      partialize: (state) => ({
        coverLetterDraft: state.coverLetterDraft,
        cvSections: state.cvSections,
        interviewSessions: state.interviewSessions.slice(-5), // Keep only last 5 sessions
        roadmap: state.roadmap,
      }),
    }
  )
);
