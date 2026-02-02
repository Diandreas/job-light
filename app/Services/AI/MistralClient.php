<?php

namespace App\Services\AI;

use Generator;
use HelgeSverre\Mistral\Mistral;
use HelgeSverre\Mistral\Enums\Role;
use Illuminate\Support\Facades\Log;

class MistralClient
{
    protected Mistral $mistral;

    public function __construct()
    {
        $this->mistral = new Mistral(apiKey: config('mistral.api_key'));
    }

    /**
     * Send a chat request and force JSON response format.
     * Returns parsed JSON array directly.
     */
    public function chatJSON(
        array $messages,
        string $model = 'mistral-large-latest',
        float $temperature = 0.7,
        int $maxTokens = 2000
    ): array {
        $response = $this->mistral->chat()->create(
            messages: $messages,
            model: $model,
            temperature: $temperature,
            maxTokens: $maxTokens,
            safeMode: true,
            responseFormat: ['type' => 'json_object'],
        );

        $dto = $response->dto();
        $content = $dto->choices[0]->message->content;
        $tokensUsed = $dto->usage->totalTokens ?? 0;

        $parsed = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error('MistralClient::chatJSON - Invalid JSON response', [
                'error' => json_last_error_msg(),
                'content_preview' => mb_substr($content, 0, 500),
            ]);
            throw new \RuntimeException('Mistral returned invalid JSON: ' . json_last_error_msg());
        }

        return [
            'data' => $parsed,
            'tokens' => $tokensUsed,
        ];
    }

    /**
     * Send a chat request and return a Generator for SSE streaming.
     *
     * @return Generator<string> Yields content deltas as strings
     */
    public function chatStream(
        array $messages,
        string $model = 'mistral-large-latest',
        float $temperature = 0.7,
        int $maxTokens = 2000
    ): Generator {
        $stream = $this->mistral->chat()->createStreamed(
            messages: $messages,
            model: $model,
            temperature: $temperature,
            maxTokens: $maxTokens,
            safeMode: true,
        );

        foreach ($stream as $chunk) {
            $delta = $chunk->choices[0]->delta->content ?? '';
            if ($delta !== '') {
                yield $delta;
            }
        }
    }

    /**
     * Send a regular (non-structured) chat request.
     * Returns the text content and token count.
     */
    public function chatText(
        array $messages,
        string $model = 'mistral-large-latest',
        float $temperature = 0.7,
        int $maxTokens = 2000
    ): array {
        $response = $this->mistral->chat()->create(
            messages: $messages,
            model: $model,
            temperature: $temperature,
            maxTokens: $maxTokens,
            safeMode: true,
        );

        $dto = $response->dto();

        return [
            'content' => $dto->choices[0]->message->content,
            'tokens' => $dto->usage->totalTokens ?? 0,
        ];
    }

    /**
     * Build a message array entry.
     */
    public static function message(string $role, string $content): array
    {
        return [
            'role' => $role,
            'content' => $content,
        ];
    }

    public static function system(string $content): array
    {
        return self::message(Role::system->value, $content);
    }

    public static function user(string $content): array
    {
        return self::message(Role::user->value, $content);
    }

    public static function assistant(string $content): array
    {
        return self::message(Role::assistant->value, $content);
    }
}
