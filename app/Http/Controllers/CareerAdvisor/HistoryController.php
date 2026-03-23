<?php

namespace App\Http\Controllers\CareerAdvisor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ChatHistory;
use Illuminate\Support\Facades\Log;

class HistoryController extends Controller
{
    /**
     * Get history items for a specific context
     */
    public function index(Request $request)
    {
        $request->validate([
            'context' => 'required|string',
        ]);

        $context = $request->input('context');
        $user = auth()->user();

        try {
            $histories = ChatHistory::where('user_id', $user->id)
                ->where('context', $context)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($history) {
                    return [
                        'id' => $history->id,
                        'context_id' => $history->context_id, // Useful for titles (e.g. Job Title, Goal)
                        'messages' => $history->messages,
                        'structured_data' => $history->structured_data,
                        'created_at' => $history->created_at->toIso8601String(),
                        'created_at_human' => $history->created_at->diffForHumans(),
                    ];
                });

            return response()->json(['data' => $histories]);
        } catch (\Exception $e) {
            Log::error("History fetch error: " . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch history'], 500);
        }
    }

    /**
     * Delete a specific history item
     */
    public function destroy(Request $request, $id)
    {
        $user = auth()->user();

        try {
            $history = ChatHistory::where('user_id', $user->id)
                ->where('id', $id)
                ->firstOrFail();

            $history->delete();

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error("History delete error: " . $e->getMessage());
            return response()->json(['error' => 'Failed to delete history item'], 500);
        }
    }
}
