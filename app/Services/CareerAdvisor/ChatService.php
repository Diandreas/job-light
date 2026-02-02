<?php

namespace App\Services\CareerAdvisor;

use App\Models\ChatHistory;
use App\Models\User;
use App\Services\AI\MistralClient;
use Illuminate\Support\Facades\Log;

class ChatService
{
    protected MistralClient $mistralClient;
    protected ContextBuilder $contextBuilder;

    private const MODEL_CONFIGS = [
        'interview-prep' => [
            'model' => 'mistral-large-latest',
            'maxTokens' => 2000,
            'temperature' => 0.8,
            'maxHistory' => 10,
        ],
        'cover-letter' => [
            'model' => 'mistral-large-latest',
            'maxTokens' => 2000,
            'temperature' => 0.3,
            'maxHistory' => 3,
        ],
        'career-advice' => [
            'model' => 'mistral-large-latest',
            'maxTokens' => 2000,
            'temperature' => 0.7,
            'maxHistory' => 3,
        ],
        'resume-review' => [
            'model' => 'mistral-large-latest',
            'maxTokens' => 2000,
            'temperature' => 0.2,
            'maxHistory' => 3,
        ],
        'presentation-ppt' => [
            'model' => 'mistral-large-latest',
            'maxTokens' => 3500,
            'temperature' => 0.7,
            'maxHistory' => 3,
        ],
    ];

    public function __construct(MistralClient $mistralClient, ContextBuilder $contextBuilder)
    {
        $this->mistralClient = $mistralClient;
        $this->contextBuilder = $contextBuilder;
    }

    /**
     * Get the model configuration for a given service.
     */
    public function getConfig(string $serviceId): array
    {
        return self::MODEL_CONFIGS[$serviceId] ?? self::MODEL_CONFIGS['career-advice'];
    }

    /**
     * Process a chat message and return AI response.
     */
    public function processMessage(User $user, array $validated): array
    {
        $config = $this->getConfig($validated['serviceId']);
        $language = strtolower(substr($validated['language'] ?? 'fr', 0, 2));

        // Build messages array
        $messages = [
            MistralClient::system($this->getSystemPrompt($language, $validated['serviceId'])),
        ];

        // Add history
        if (!empty($validated['history'])) {
            foreach ($validated['history'] as $msg) {
                $messages[] = MistralClient::message($msg['role'], $msg['content']);
            }
        }

        // Get user context
        $chatHistory = ChatHistory::where('context_id', $validated['contextId'])
            ->where('user_id', $user->id)
            ->first();

        $userContext = '';
        if ($chatHistory && !empty($chatHistory->context)) {
            $userContext = $chatHistory->context;
        } else {
            $userContext = $this->contextBuilder->buildCompactContext($user);
        }

        // Build enriched user prompt
        $messages[] = MistralClient::user(
            $this->contextBuilder->buildEnrichedPrompt(
                $validated['message'],
                $language,
                $validated['serviceId'],
                $userContext
            )
        );

        // Call Mistral
        $result = $this->mistralClient->chatText(
            messages: $messages,
            model: $config['model'],
            temperature: $config['temperature'],
            maxTokens: $config['maxTokens'],
        );

        // Save history
        $this->saveHistory(
            $user->id,
            $validated['contextId'],
            $validated['message'],
            $result['content'],
            $validated['serviceId'],
            $config['maxHistory'],
            $result['tokens']
        );

        return $result;
    }

    /**
     * Build messages array for streaming.
     */
    public function buildStreamMessages(User $user, array $validated): array
    {
        $language = strtolower(substr($validated['language'] ?? 'fr', 0, 2));

        $messages = [
            MistralClient::system($this->getSystemPrompt($language, $validated['serviceId'])),
        ];

        if (!empty($validated['history'])) {
            foreach ($validated['history'] as $msg) {
                $messages[] = MistralClient::message($msg['role'], $msg['content']);
            }
        }

        $chatHistory = ChatHistory::where('context_id', $validated['contextId'])
            ->where('user_id', $user->id)
            ->first();

        $userContext = $chatHistory && !empty($chatHistory->context)
            ? $chatHistory->context
            : $this->contextBuilder->buildCompactContext($user);

        $messages[] = MistralClient::user(
            $this->contextBuilder->buildEnrichedPrompt(
                $validated['message'],
                $language,
                $validated['serviceId'],
                $userContext
            )
        );

        return $messages;
    }

    /**
     * Save chat history to database.
     */
    public function saveHistory(
        int $userId,
        string $contextId,
        string $userMessage,
        string $aiResponse,
        string $serviceId,
        int $maxHistory = 3,
        int $tokensUsed = 0
    ): void {
        $chatHistory = ChatHistory::firstOrNew([
            'user_id' => $userId,
            'context_id' => $contextId,
        ]);

        $messages = is_string($chatHistory->messages)
            ? json_decode($chatHistory->messages, true) ?? []
            : ($chatHistory->messages ?? []);

        $messages[] = [
            'role' => 'user',
            'content' => $userMessage,
            'timestamp' => now()->toIso8601String(),
        ];
        $messages[] = [
            'role' => 'assistant',
            'content' => $aiResponse,
            'timestamp' => now()->toIso8601String(),
        ];

        // Limit history
        $messages = array_slice($messages, -($maxHistory * 2));

        if (!$chatHistory->exists || empty($chatHistory->context)) {
            $user = User::find($userId);
            $chatHistory->context = $this->contextBuilder->buildCompactContext($user);
        }

        $chatHistory->fill([
            'user_id' => $userId,
            'context_id' => $contextId,
            'messages' => json_encode($messages, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE),
            'service_id' => $serviceId,
            'tokens_used' => $tokensUsed,
        ]);

        $chatHistory->save();
    }

    /**
     * Get system prompt for a service and language.
     */
    public function getSystemPrompt(string $language, string $serviceId): string
    {
        $languageInstruction = match ($language) {
            'en' => "IMPORTANT: You MUST respond ONLY in English, no matter what.",
            default => "IMPORTANT: Vous DEVEZ répondre UNIQUEMENT en français, quoi qu'il arrive.",
        };

        $prompts = [
            'interview-prep' => [
                'fr' => "{$languageInstruction}
Vous êtes un recruteur expérimenté conduisant un entretien d'embauche.
Posez des questions pertinentes et donnez des retours constructifs.
Gardez un ton professionnel mais conversationnel.
Adaptez vos questions en fonction des réponses précédentes.
Maximum 10 échanges pour simuler un véritable entretien.",
                'en' => "{$languageInstruction}
You are an experienced recruiter conducting a job interview.
Ask relevant questions and provide constructive feedback.
Keep a professional but conversational tone.
Adapt your questions based on previous answers.
Maximum 10 exchanges to simulate a real interview.",
            ],
            'cover-letter' => [
                'fr' => "{$languageInstruction}
Vous êtes un expert en rédaction de lettres de motivation.
Créez des contenus personnalisés, persuasifs et professionnels.
Mettez en valeur les compétences pertinentes et l'adéquation avec le poste.
Adaptez le style et le ton au secteur d'activité.",
                'en' => "{$languageInstruction}
You are an expert in writing cover letters.
Create personalized, persuasive, and professional content.
Highlight relevant skills and job fit.
Adapt style and tone to the industry.",
            ],
            'resume-review' => [
                'fr' => "{$languageInstruction}
Vous êtes un expert en optimisation de CV.
Analysez le CV et suggérez des améliorations concrètes.
Concentrez-vous sur la mise en valeur des compétences clés.
Donnez des exemples spécifiques.",
                'en' => "{$languageInstruction}
You are an expert in resume optimization.
Analyze the resume and suggest concrete improvements.
Focus on highlighting key skills.
Provide specific examples.",
            ],
            'career-advice' => [
                'fr' => "{$languageInstruction}
Vous êtes un conseiller professionnel expert.
Donnez des conseils pratiques et applicables.
Adaptez vos recommandations au profil et au secteur.",
                'en' => "{$languageInstruction}
You are an expert career advisor.
Provide practical and actionable advice.
Adapt recommendations to profile and industry.",
            ],
            'presentation-ppt' => [
                'fr' => "{$languageInstruction}
Vous êtes un expert consultant en présentations PowerPoint avec 15 ans d'expérience.
IMPORTANT: Répondez UNIQUEMENT en JSON valide, sans texte avant ou après.",
                'en' => "{$languageInstruction}
You are an expert PowerPoint consultant with 15 years of experience.
IMPORTANT: Respond ONLY in valid JSON format, without any text before or after.",
            ],
        ];

        return $prompts[$serviceId][$language] ?? $prompts['career-advice'][$language] ?? $prompts['career-advice']['fr'];
    }
}
