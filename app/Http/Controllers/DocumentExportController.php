<?php

namespace App\Http\Controllers;

use App\Models\DocumentExport;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class DocumentExportController extends Controller
{
    /**
     * Get all exports for the authenticated user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $exports = DocumentExport::where('user_id', auth()->id())
            ->with('chatHistory')
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 10));

        return response()->json($exports);
    }

    /**
     * Download a specific export
     *
     * @param DocumentExport $export
     * @return \Symfony\Component\HttpFoundation\StreamedResponse|JsonResponse
     */
    public function download(DocumentExport $export)
    {
        if ($export->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if (!Storage::exists("exports/{$export->file_path}")) {
            return response()->json(['error' => 'File not found'], 404);
        }

        return Storage::download(
            "exports/{$export->file_path}",
            "career_document.{$export->format}"
        );
    }

    /**
     * Delete an export
     *
     * @param DocumentExport $export
     * @return JsonResponse
     */
    public function destroy(DocumentExport $export): JsonResponse
    {
        if ($export->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Delete the file from storage
        if (Storage::exists("exports/{$export->file_path}")) {
            Storage::delete("exports/{$export->file_path}");
        }

        $export->delete();

        return response()->json([
            'message' => 'Export deleted successfully'
        ]);
    }

    /**
     * Get details of a specific export
     *
     * @param DocumentExport $export
     * @return JsonResponse
     */
    public function show(DocumentExport $export): JsonResponse
    {
        if ($export->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($export->load('chatHistory'));
    }
}
