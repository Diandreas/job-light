import React from 'react';
import { ErrorBoundary } from '@/Components/ai/errors/ErrorBoundary';
import ArtifactErrorFallback from '@/Components/ai/errors/ArtifactErrorFallback';
import ScoreCard from './ScoreCard';
import ActionPlanCard from './ActionPlanCard';
import KeywordAnalysis from './KeywordAnalysis';
import InterviewScoreCard from './InterviewScoreCard';
import type {
    CareerAdviceResponse,
    CVAnalysisResponse,
    InterviewFeedbackResponse,
    CoverLetterResponse,
} from '@/schemas/career-advisor';

type ArtifactData =
    | { type: 'career-advice'; data: CareerAdviceResponse }
    | { type: 'cv-analysis'; data: CVAnalysisResponse }
    | { type: 'interview-feedback'; data: InterviewFeedbackResponse }
    | { type: 'cover-letter'; data: CoverLetterResponse }
    | { type: 'score'; data: { label: string; score: number; breakdown?: Record<string, { score: number; label?: string }> } };

interface ArtifactRendererProps {
    artifact: ArtifactData;
}

export default function ArtifactRenderer({ artifact }: ArtifactRendererProps) {
    return (
        <ErrorBoundary fallback={<ArtifactErrorFallback />}>
            {renderArtifact(artifact)}
        </ErrorBoundary>
    );
}

function renderArtifact(artifact: ArtifactData) {
    switch (artifact.type) {
        case 'career-advice':
            return (
                <div className="space-y-3">
                    <ScoreCard
                        label="Score global"
                        score={artifact.data.overallScore}
                        breakdown={artifact.data.actionPlan ? undefined : undefined}
                    />
                    {artifact.data.actionPlan && artifact.data.actionPlan.length > 0 && (
                        <ActionPlanCard items={artifact.data.actionPlan} />
                    )}
                </div>
            );

        case 'cv-analysis':
            return (
                <div className="space-y-3">
                    <ScoreCard
                        label="Score ATS"
                        score={artifact.data.globalScore}
                        breakdown={artifact.data.breakdown as Record<string, { score: number; label?: string; weight?: number; comment?: string }>}
                    />
                    {artifact.data.keywordAnalysis && (
                        <KeywordAnalysis
                            found={artifact.data.keywordAnalysis.found || []}
                            missing={artifact.data.keywordAnalysis.missing || []}
                        />
                    )}
                </div>
            );

        case 'interview-feedback':
            return (
                <InterviewScoreCard
                    overallScore={artifact.data.overallScore}
                    breakdown={artifact.data.breakdown as Record<string, { score: number; weight?: number; label?: string }>}
                    tips={artifact.data.tips || []}
                />
            );

        case 'cover-letter':
            return (
                <ScoreCard
                    label="Score lettre"
                    score={artifact.data.overallScore}
                    breakdown={{
                        structure: { score: artifact.data.structureScore || 0, label: 'Structure' },
                        readability: { score: artifact.data.readabilityScore || 0, label: 'Lisibilité' },
                        keywords: { score: artifact.data.keywordScore || 0, label: 'Mots-clés' },
                        formality: { score: artifact.data.formalityScore || 0, label: 'Formalité' },
                    }}
                />
            );

        case 'score':
            return (
                <ScoreCard
                    label={artifact.data.label}
                    score={artifact.data.score}
                    breakdown={artifact.data.breakdown}
                />
            );

        default:
            return <ArtifactErrorFallback />;
    }
}
