<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RephraserService
{
    protected $geminiKey;
    protected $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

    public function __construct()
    {
        $this->geminiKey = config('services.gemini.key');
    }

    public function rephrase($text, $tone = 'professional')
    {
        if (empty($text)) {
            return '';
        }

        try {
            $response = Http::post("{$this->baseUrl}?key={$this->geminiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => "Rephrase the following CV content to be more {$tone} and impactful:\n\n{$text}"]
                        ]
                    ]
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['candidates'][0]['content']['parts'][0]['text'] ?? $text;
            }

            Log::error('Gemini API Error: ' . $response->body());
            return $text; // Fallback to original text

        } catch (\Exception $e) {
            Log::error('Rephraser Exception: ' . $e->getMessage());
            return $text;
        }
    }
}
