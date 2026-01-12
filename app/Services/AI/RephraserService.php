<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RephraserService
{
    protected $mistral;

    public function __construct()
    {
        $this->mistral = new \HelgeSverre\Mistral\Mistral(apiKey: config('mistral.api_key'));
    }

    public function rephrase($text, $tone = 'professional')
    {
        if (empty($text)) {
            return '';
        }

        try {
            $prompt = $this->buildPrompt($text, $tone);

            $response = $this->mistral->chat()->create(
                messages: [
                    [
                        'role' => 'user', // Using string directly or Enum if imported
                        'content' => $prompt
                    ]
                ],
                model: 'mistral-large-latest',
                temperature: 0.7,
                maxTokens: 1000,
                safeMode: true
            );

            $dto = $response->dto();
            return $dto->choices[0]->message->content ?? $text;

        } catch (\Exception $e) {
            Log::error('Rephraser Exception: ' . $e->getMessage());
            return $text;
        }
    }

    private function buildPrompt($text, $tone)
    {
        $instructions = match($tone) {
            'professional' => "Reformule ce texte pour un CV professionnel. Sois précis, utilise des verbes d'action et un langage soutenu. Garde le même sens mais améliore l'impact.",
            'creative' => "Reformule ce texte pour un CV créatif. Sois original, engageant et dynamique. Mets en valeur la personnalité tout en restant professionnel.",
            'concise' => "Reformule ce texte pour le rendre plus concis et direct. Élimine le superflu, va droit au but, utilise des phrases courtes et percutantes.",
            default => "Améliore ce texte pour un CV professionnel."
        };

        return "{$instructions}\n\nTexte à reformuler : \"{$text}\"\n\nRéponds UNIQUEMENT par le texte reformulé, sans guillemets ni introduction.";
    }
}
