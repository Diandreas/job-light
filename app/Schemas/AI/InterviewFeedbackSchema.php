<?php

namespace App\Schemas\AI;

class InterviewFeedbackSchema
{
    public static function getPromptInstruction(): string
    {
        return <<<'SCHEMA'
You MUST respond in valid JSON format with this exact structure:
{
  "questionAnalysis": {
    "question": "the interview question asked",
    "category": "behavioral|technical|situational|motivational",
    "difficulty": "easy|medium|hard"
  },
  "starScore": {
    "situation": 0-100,
    "task": 0-100,
    "action": 0-100,
    "result": 0-100
  },
  "relevanceScore": 0-100,
  "tips": ["tip 1", "tip 2", ...],
  "overallPerformance": {
    "score": 0-100,
    "strengths": ["strength 1", "strength 2"],
    "improvements": ["improvement 1", "improvement 2"],
    "sampleAnswer": "optional improved version of the answer"
  }
}
SCHEMA;
    }

    public static function validate(array $data): bool
    {
        return isset($data['overallPerformance'])
            && isset($data['overallPerformance']['score']);
    }
}
