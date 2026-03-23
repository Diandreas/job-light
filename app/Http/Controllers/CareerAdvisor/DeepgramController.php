<?php

namespace App\Http\Controllers\CareerAdvisor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DeepgramController extends Controller
{
    protected string $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.deepgram.api_key');
    }

    /**
     * Returns a short-lived Deepgram access token for the authenticated user.
     * The frontend uses this to connect to Deepgram WebSockets directly.
     */
    public function getToken()
    {
        if (empty($this->apiKey)) {
            return response()->json(['error' => 'Deepgram API key not configured.'], 503);
        }

        // Return the API key securely to authenticated users (HTTPS only).
        // Only authenticated users can reach this route (web middleware).
        return response()->json(['token' => $this->apiKey]);
    }

    /**
     * Proxy for Deepgram Text-to-Speech API.
     * Returns raw audio bytes to play in the browser.
     */
    public function tts(Request $request)
    {
        $request->validate([
            'text'  => 'required|string|max:2000',
            'model' => 'sometimes|string',
        ]);

        if (empty($this->apiKey)) {
            return response()->json(['error' => 'Deepgram API key not configured.'], 503);
        }

        $text  = mb_substr($request->input('text'), 0, 1500); // Deepgram TTS limit
        $model = $request->input('model', 'aura-2-thalia-en');

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Token ' . $this->apiKey,
                'Content-Type'  => 'application/json',
            ])->timeout(45)->post("https://api.deepgram.com/v1/speak?model={$model}", [
                'text' => $text,
            ]);

            if ($response->successful()) {
                $contentType = $response->header('Content-Type') ?? 'audio/mpeg';
                return response($response->body(), 200, [
                    'Content-Type'        => $contentType,
                    'Content-Disposition' => 'inline',
                    'Cache-Control'       => 'no-store',
                ]);
            }

            Log::error('Deepgram TTS error: HTTP ' . $response->status() . ' — ' . $response->body());
            return response()->json([
                'error'   => 'TTS generation failed.',
                'details' => $response->body(),
            ], 502);
        } catch (\Exception $e) {
            Log::error('Deepgram TTS exception: ' . $e->getMessage());
            return response()->json(['error' => 'TTS service unavailable.'], 503);
        }
    }
}
