import { useState, useEffect } from 'react';
import { useDebouncedValue } from '@/hooks/useDebounce';
import { scoreCoverLetter, CoverLetterScore } from '@/utils/coverLetterScorer';

export function useATSScoring(content: string, jobKeywords: string[] = []) {
  const [score, setScore] = useState<CoverLetterScore | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Debounce content to avoid scoring on every keystroke
  const debouncedContent = useDebouncedValue(content, 1000);

  useEffect(() => {
    if (!debouncedContent.trim()) {
      setScore(null);
      return;
    }

    setIsCalculating(true);

    // Use setTimeout to simulate async behavior and allow UI to update
    const timeoutId = setTimeout(() => {
      const newScore = scoreCoverLetter(debouncedContent, jobKeywords);
      setScore(newScore);
      setIsCalculating(false);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [debouncedContent, jobKeywords]);

  return {
    score,
    isCalculating,
  };
}
