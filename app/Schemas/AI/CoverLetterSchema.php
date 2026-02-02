<?php

namespace App\Schemas\AI;

class CoverLetterSchema
{
    public static function getPromptInstruction(): string
    {
        return <<<'SCHEMA'
You MUST respond in valid JSON format with this exact structure:
{
  "structureScore": 0-100,
  "contentScore": 0-100,
  "atsScore": 0-100,
  "suggestions": [
    {"category": "structure|content|keywords|tone", "text": "suggestion text", "priority": "high|medium|low"},
    ...
  ],
  "keywordAnalysis": {
    "found": ["keyword 1", "keyword 2"],
    "missing": ["keyword 1", "keyword 2"]
  },
  "improvedVersion": "optional full improved version of the cover letter",
  "overallScore": 0-100
}
SCHEMA;
    }

    public static function validate(array $data): bool
    {
        return isset($data['overallScore'])
            && is_numeric($data['overallScore']);
    }
}
