<?php

namespace App\Http\Controllers\CareerAdvisor;

use App\Http\Controllers\Controller;
use App\Http\Requests\CareerAdvisor\SendMessageRequest;
use App\Models\ChatHistory;
use App\Services\AI\MistralClient;
use App\Services\Billing\WalletService;
use App\Services\CareerAdvisor\ChatService;
use App\Services\CareerAdvisor\ContextBuilder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ChatController extends Controller
{
    protected ChatService $chatService;
    protected MistralClient $mistralClient;
    protected WalletService $walletService;
    protected ContextBuilder $contextBuilder;

    public function __construct(
        ChatService $chatService,
        MistralClient $mistralClient,
        WalletService $walletService,
        ContextBuilder $contextBuilder
    ) {
        $this->chatService = $chatService;
        $this->mistralClient = $mistralClient;
        $this->walletService = $walletService;
        $this->contextBuilder = $contextBuilder;
    }

    /**
     * Display the Career Advisor page.
     */
    public function index()
    {
        $user = auth()->user();
        $userInfo = $this->contextBuilder->getUserRelevantInfo($user);

        $chatHistories = ChatHistory::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($chat) => [
                'id' => $chat->id,
                'context_id' => $chat->context_id,
                'service_id' => $chat->service_id,
                'created_at' => $chat->created_at,
                'messages' => json_decode($chat->messages),
            ]);

        return Inertia::render('CareerAdvisor/Index', [
            'userInfo' => $userInfo,
            'chatHistories' => $chatHistories,
            'chatHistory' => $chatHistories->first(),
        ]);
    }

    /**
     * Process a chat message (non-streaming).
     * Calls AI first, then debits wallet on success.
     */
    public function send(SendMessageRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $user = auth()->user();

            // Check balance before calling AI
            $serviceCost = $this->getServiceCost($validated['serviceId']);
            if (!$this->walletService->canAfford($user, $serviceCost)) {
                return response()->json([
                    'error' => 'Solde insuffisant',
                ], 402);
            }

            // Call AI first
            $result = $this->chatService->processMessage($user, $validated);

            // Debit wallet AFTER successful AI call (atomic)
            $this->walletService->debit($user, $validated['serviceId'], $serviceCost, $validated['contextId']);

            return response()->json([
                'message' => $result['content'],
                'tokens' => $result['tokens'],
                'balance' => $this->walletService->getBalance($user),
            ]);
        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'Insufficient wallet balance') {
                return response()->json(['error' => 'Solde insuffisant'], 402);
            }
            throw $e;
        } catch (\Exception $e) {
            Log::error('Career advisor chat error', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Une erreur est survenue lors du traitement de votre demande',
            ], 500);
        }
    }

    /**
     * Stream a chat response via SSE.
     * Debits wallet after streaming is complete.
     */
    public function stream(SendMessageRequest $request): StreamedResponse
    {
        $validated = $request->validated();
        $user = auth()->user();
        $serviceCost = $this->getServiceCost($validated['serviceId']);

        if (!$this->walletService->canAfford($user, $serviceCost)) {
            return response()->stream(function () {
                echo "data: " . json_encode(['error' => 'Solde insuffisant']) . "\n\n";
                ob_flush();
                flush();
            }, 402, $this->sseHeaders());
        }

        $config = $this->chatService->getConfig($validated['serviceId']);
        $messages = $this->chatService->buildStreamMessages($user, $validated);

        return response()->stream(function () use ($messages, $config, $user, $validated, $serviceCost) {
            $fullContent = '';

            try {
                foreach ($this->mistralClient->chatStream($messages, $config['model'], $config['temperature'], $config['maxTokens']) as $delta) {
                    $fullContent .= $delta;
                    echo "data: " . json_encode(['content' => $delta]) . "\n\n";

                    if (ob_get_level()) {
                        ob_flush();
                    }
                    flush();
                }

                // Signal completion
                echo "data: [DONE]\n\n";
                if (ob_get_level()) {
                    ob_flush();
                }
                flush();

                // Save history and debit wallet AFTER successful stream
                $this->chatService->saveHistory(
                    $user->id,
                    $validated['contextId'],
                    $validated['message'],
                    $fullContent,
                    $validated['serviceId'],
                    $config['maxHistory'],
                    0
                );

                $this->walletService->debit($user, $validated['serviceId'], $serviceCost, $validated['contextId']);
            } catch (\Exception $e) {
                Log::error('Stream error', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);

                echo "data: " . json_encode(['error' => 'Erreur lors du streaming']) . "\n\n";
                if (ob_get_level()) {
                    ob_flush();
                }
                flush();
            }
        }, 200, $this->sseHeaders());
    }

    private function sseHeaders(): array
    {
        return [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ];
    }

    private function getServiceCost(string $serviceId): int
    {
        return match ($serviceId) {
            'career-advice' => 3,
            'resume-review' => 4,
            'interview-prep' => 5,
            'cover-letter' => 5,
            'presentation-ppt' => 8,
            default => 5,
        };
    }
}
