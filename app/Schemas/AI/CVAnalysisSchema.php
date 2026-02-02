<?php

namespace App\Schemas\AI;

class CVAnalysisSchema
{
    public static function getPromptInstruction(): string
    {
        return <<<'SCHEMA'
You MUST respond in valid JSON format with this exact structure:
{
  "globalScore": 0-100,
  "breakdown": {
    "format": {"score": 0-100, "comment": "brief explanation"},
    "contact": {"score": 0-100, "comment": "brief explanation"},
    "sections": {"score": 0-100, "comment": "brief explanation"},
    "keywords": {"score": 0-100, "comment": "brief explanation"},
    "readability": {"score": 0-100, "comment": "brief explanation"},
    "actionVerbs": {"score": 0-100, "comment": "brief explanation"},
    "metrics": {"score": 0-100, "comment": "brief explanation"}
  },
  "recommendations": [
    {"priority": "high|medium|low", "text": "recommendation text", "impact": "+X points"},
    ...
  ],
  "keywordAnalysis": {
    "found": ["keyword 1", "keyword 2"],
    "missing": ["keyword 1", "keyword 2"],
    "density": "percentage"
  }
}
SCHEMA;
    }

    public static function validate(array $data): bool
    {
        return isset($data['globalScore'])
            && is_numeric($data['globalScore'])
            && isset($data['breakdown']);
    }
}
