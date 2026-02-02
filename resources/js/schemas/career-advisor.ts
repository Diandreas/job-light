import { z } from 'zod';

// ==========================================
// Career Advice Schema
// ==========================================
export const ActionPlanItemSchema = z.object({
    step: z.number(),
    action: z.string(),
    timeline: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
});

export const SkillToDevelopSchema = z.object({
    skill: z.string(),
    currentLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    targetLevel: z.enum(['intermediate', 'advanced', 'expert']).optional(),
    resources: z.array(z.string()).optional(),
});

export const MarketInsightsSchema = z.object({
    demand: z.enum(['high', 'medium', 'low']).optional(),
    trendingSkills: z.array(z.string()).optional(),
    salaryRange: z.string().optional(),
    outlook: z.string().optional(),
});

export const CareerAdviceResponseSchema = z.object({
    summary: z.string(),
    overallScore: z.number().min(0).max(100),
    strengths: z.array(z.string()).optional(),
    opportunities: z.array(z.string()).optional(),
    actionPlan: z.array(ActionPlanItemSchema).optional(),
    skillsToDevelop: z.array(SkillToDevelopSchema).optional(),
    marketInsights: MarketInsightsSchema.optional(),
});

// ==========================================
// CV Analysis Schema
// ==========================================
export const ScoreBreakdownItemSchema = z.object({
    score: z.number().min(0).max(100),
    weight: z.number().optional(),
    label: z.string().optional(),
    comment: z.string().optional(),
});

export const RecommendationSchema = z.object({
    priority: z.enum(['high', 'medium', 'low']),
    text: z.string(),
    impact: z.string().optional(),
});

export const CVAnalysisResponseSchema = z.object({
    globalScore: z.number().min(0).max(100),
    breakdown: z.record(z.string(), ScoreBreakdownItemSchema),
    recommendations: z.array(RecommendationSchema).optional(),
    keywordAnalysis: z.object({
        found: z.array(z.string()).optional(),
        missing: z.array(z.string()).optional(),
        density: z.string().optional(),
    }).optional(),
});

// ==========================================
// Interview Feedback Schema
// ==========================================
export const InterviewFeedbackResponseSchema = z.object({
    overallScore: z.number().min(0).max(100),
    breakdown: z.record(z.string(), ScoreBreakdownItemSchema),
    tips: z.array(z.string()).optional(),
});

// ==========================================
// Cover Letter Schema
// ==========================================
export const CoverLetterResponseSchema = z.object({
    structureScore: z.number().min(0).max(100).optional(),
    lengthScore: z.number().min(0).max(100).optional(),
    readabilityScore: z.number().min(0).max(100).optional(),
    keywordScore: z.number().min(0).max(100).optional(),
    formalityScore: z.number().min(0).max(100).optional(),
    overallScore: z.number().min(0).max(100),
    wordCount: z.number().optional(),
    paragraphCount: z.number().optional(),
    suggestions: z.array(z.string()).optional(),
});

// ==========================================
// Streaming Event Schema
// ==========================================
export const StreamEventSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('content'), content: z.string() }),
    z.object({ type: z.literal('error'), error: z.string() }),
    z.object({ type: z.literal('done') }),
]);

// ==========================================
// Type exports
// ==========================================
export type CareerAdviceResponse = z.infer<typeof CareerAdviceResponseSchema>;
export type CVAnalysisResponse = z.infer<typeof CVAnalysisResponseSchema>;
export type InterviewFeedbackResponse = z.infer<typeof InterviewFeedbackResponseSchema>;
export type CoverLetterResponse = z.infer<typeof CoverLetterResponseSchema>;
export type ScoreBreakdownItem = z.infer<typeof ScoreBreakdownItemSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
export type ActionPlanItem = z.infer<typeof ActionPlanItemSchema>;
export type SkillToDevelop = z.infer<typeof SkillToDevelopSchema>;
export type StreamEvent = z.infer<typeof StreamEventSchema>;
