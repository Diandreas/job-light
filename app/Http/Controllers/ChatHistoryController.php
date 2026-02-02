<?php

namespace App\Http\Controllers;

use App\Models\ChatHistory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ChatHistoryController extends Controller
{
    /**
     * Get chat history for a specific context
     */
    public function show(string $contextId): JsonResponse
    {
        $chatHistory = ChatHistory::where('context_id', $contextId)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $messages = json_decode($chatHistory->messages, true) ?? [];

        return response()->json([
            'context_id' => $chatHistory->context_id,
            'service_id' => $chatHistory->service_id,
            'preview' => $this->getChatPreview($messages),
            'created_at' => $chatHistory->created_at,
            'messages' => $messages,
        ]);
    }

    /**
     * Delete a specific chat history
     */
    public function destroy(string $contextId): JsonResponse
    {
        $chatHistory = ChatHistory::where('context_id', $contextId)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $chatHistory->delete();

        return response()->json([
            'message' => 'Conversation supprimée avec succès',
        ]);
    }

    /**
     * Get all chat histories for the authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $chats = ChatHistory::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($chat) {
                $messages = json_decode($chat->messages, true) ?? [];
                return [
                    'id' => $chat->id,
                    'context_id' => $chat->context_id,
                    'service_id' => $chat->service_id,
                    'created_at' => $chat->created_at,
                    'preview' => $this->getChatPreview($messages),
                ];
            });

        return response()->json($chats);
    }

    private function getChatPreview(array $messages): string
    {
        if (empty($messages)) {
            return 'Conversation vide';
        }

        foreach ($messages as $message) {
            if (($message['role'] ?? '') === 'user') {
                return mb_substr($message['content'] ?? '', 0, 100) . '...';
            }
        }

        return 'Aperçu non disponible';
    }
}
