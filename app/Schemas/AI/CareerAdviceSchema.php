<?php

namespace App\Schemas\AI;

class CareerAdviceSchema
{
    /**
     * Get the JSON schema instruction for system prompt.
     */
    public static function getPromptInstruction(): string
    {
        return <<<'SCHEMA'
You MUST respond in valid JSON format with this exact structure:
{
  "summary": "Brief summary of the career advice (2-3 sentences)",
  "overallScore": 0-100,
  "strengths": ["strength 1", "strength 2", ...],
  "opportunities": ["opportunity 1", "opportunity 2", ...],
  "actionPlan": [
    {"step": 1, "action": "description", "timeline": "e.g. 0-3 months", "priority": "high|medium|low"},
    ...
  ],
  "skillsToDevelop": [
    {"skill": "name", "currentLevel": "beginner|intermediate|advanced", "targetLevel": "intermediate|advanced|expert", "resources": ["resource 1"]},
    ...
  ],
  "marketInsights": {
    "demand": "high|medium|low",
    "trendingSkills": ["skill 1", "skill 2"],
    "salaryRange": "estimated range",
    "outlook": "brief market outlook"
  }
}
SCHEMA;
    }

    /**
     * Validate parsed response structure.
     */
    public static function validate(array $data): bool
    {
        return isset($data['summary'])
            && isset($data['overallScore'])
            && is_numeric($data['overallScore']);
    }
}
