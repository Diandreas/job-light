<?php

namespace App\Http\Controllers;

use App\Models\ChatHistory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ChatHistoryController extends Controller
{
    /**
     * Get chat history for a specific context
     *
     * @param string $contextId
     * @return JsonResponse
     */
    public function show(string $contextId): JsonResponse
    {
        $chatHistory = ChatHistory::where('context_id', $contextId)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        return response()->json([
            'messages' => json_decode($chatHistory->messages),
            'contextId' => $chatHistory->context_id
        ]);
    }

    /**
     * Delete a specific chat history
     *
     * @param string $contextId
     * @return JsonResponse
     */
    public function destroy(string $contextId): JsonResponse
    {
        $chatHistory = ChatHistory::where('context_id', $contextId)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $chatHistory->delete();

        return response()->json([
            'message' => 'Chat history deleted successfully'
        ]);
    }

    /**
     * Get all chat histories for the authenticated user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $histories = ChatHistory::where('user_id', auth()->id())
            ->orderBy('updated_at', 'desc')
            ->paginate($request->input('per_page', 10));

        return response()->json($histories);
    }
}
