<?php

namespace App\Services;

use HelgeSverre\Mistral\Mistral;
use App\Services\PromptBuilder;
use Illuminate\Support\Facades\Cache;

class AIService
{
    protected $mistral;
    protected $promptBuilder;
    protected $systemPrompts = [
        'career-advice' => "Vous êtes un conseiller carrière professionnel utilisant les informations du profil pour donner des conseils personnalisés.",
        'cover-letter' => "Vous êtes un expert en rédaction professionnelle spécialisé dans les lettres de motivation.",
        'interview-prep' => "Vous êtes un recruteur expérimenté conduisant des simulations d'entretien.",
        'resume-review' => "Vous êtes un expert en CV analysant et optimisant les profils professionnels.",
        'linkedin-opt' => "Vous êtes un expert LinkedIn optimisant les profils professionnels.",
        'salary-nego' => "Vous êtes un expert en négociation salariale."
    ];

    public function __construct(Mistral $mistral, PromptBuilder $promptBuilder)
    {
        $this->mistral = $mistral;
        $this->promptBuilder = $promptBuilder;
    }

    public function getResponse(string $message, array $context)
    {
        $serviceId = $context['service_id'];
        $systemPrompt = $this->getSystemPrompt($serviceId, $context['language']);
        $userContext = $this->promptBuilder->buildUserContext($context['user_info']);

        $response = $this->mistral->chat()->create([
            'messages' => [
                [
                    "role" => "system",
                    "content" => $systemPrompt
                ],
                [
                    "role" => "user",
                    "content" => "Contexte utilisateur:\n" . $userContext
                ],
                ...$this->formatHistory($context['history'] ?? []),
                [
                    "role" => "user",
                    "content" => $message
                ]
            ],
            'model' => config('services.mistral.models.default'),
            'temperature' => 0.7,
            'max_tokens' => 2000
        ]);

        return [
            'content' => $response->choices[0]->message->content,
            'tokens' => $response->usage->totalTokens
        ];
    }

    protected function getSystemPrompt(string $serviceId, string $language): string
    {
        $basePrompt = $this->systemPrompts[$serviceId] ?? $this->systemPrompts['career-advice'];

        return $language === 'en'
            ? $this->translatePrompt($basePrompt)
            : $basePrompt;
    }

    protected function formatHistory(array $history): array
    {
        return array_map(function($message) {
            return [
                "role" => $message['role'],
                "content" => $message['content']
            ];
        }, $history);
    }

    protected function translatePrompt(string $prompt): string
    {
        $cacheKey = 'prompt_translation_' . md5($prompt);

        return Cache::remember($cacheKey, 86400, function() use ($prompt) {
            return $this->mistral->chat()->create([
                'messages' => [
                    [
                        "role" => "system",
                        "content" => "You are a professional translator. Translate the following text from French to English:"
                    ],
                    [
                        "role" => "user",
                        "content" => $prompt
                    ]
                ],
                'model' => config('services.mistral.models.small')
            ])->choices[0]->message->content;
        });
    }
}
