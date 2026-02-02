import { useEffect, useCallback } from 'react';
import { useCareerAdvisorStore, CoverLetterDraft } from '@/stores/careerAdvisorStore';
import { useDebounce } from '@/hooks/useDebounce';

export function useCoverLetterDraft() {
  const {
    coverLetterDraft,
    saveCoverLetterDraft,
    clearCoverLetterDraft,
  } = useCareerAdvisorStore();

  // Auto-save with debounce
  const debouncedSave = useDebounce((draft: CoverLetterDraft) => {
    saveCoverLetterDraft(draft);
  }, 1000);

  const updateDraft = useCallback(
    (updates: Partial<CoverLetterDraft>) => {
      const updated = {
        ...coverLetterDraft,
        ...updates,
      } as CoverLetterDraft;
      debouncedSave(updated);
    },
    [coverLetterDraft, debouncedSave]
  );

  const initializeDraft = useCallback(() => {
    if (!coverLetterDraft) {
      const initialDraft: CoverLetterDraft = {
        yourName: '',
        yourAddress: '',
        yourEmail: '',
        yourPhone: '',
        companyName: '',
        recipientName: '',
        subject: '',
        content: '',
        template: 'standard',
        updatedAt: new Date().toISOString(),
      };
      saveCoverLetterDraft(initialDraft);
    }
  }, [coverLetterDraft, saveCoverLetterDraft]);

  return {
    draft: coverLetterDraft,
    updateDraft,
    clearDraft: clearCoverLetterDraft,
    initializeDraft,
  };
}
