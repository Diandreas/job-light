<?php

namespace App\Http\Controllers\CareerAdvisor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use HelgeSverre\Mistral\Mistral;

class CVAdvisorController extends Controller
{
    protected $mistral;

    public function __construct()
    {
        $this->mistral = new Mistral(apiKey: config('mistral.api_key'));
    }

    /**
     * Analyze CV section-by-section for Heatmap
     */
    public function analyze(Request $request)
    {
        $request->validate([
            'cvData' => 'required|array', // Structure JSON du CV
            'targetRole' => 'nullable|string'
        ]);

        $cvData = $request->input('cvData');
        $targetRole = $request->input('targetRole', 'General');

        $prompt = "Analyze this CV data for a {$targetRole} position. 
        For each section (summary, experience, education, skills, layout), provide:
        1. Score (0-100)
        2. Status (critical, warning, good, excellent)
        3. Key issues found
        4. Specific recommendations
        5. Impact score (how much fixing this would improve the CV)

        Return a JSON object keyed by section name.";

        try {
            $response = $this->mistral->chat()->create(
                messages: [
                    ['role' => 'system', 'content' => 'You are a strict, top-tier resume auditor. Be critical but constructive. Output valid JSON.'],
                    ['role' => 'user', 'content' => $prompt . "\n\nCV Data: " . json_encode($cvData)]
                ],
                model: 'mistral-large-latest',
                responseFormat: ['type' => 'json_object']
            );

            return response()->json(json_decode($response->dto()->choices[0]->message->content));

        } catch (\Exception $e) {
            Log::error("CV Analysis Error: " . $e->getMessage());
            return response()->json(['error' => 'Failed to analyze CV'], 500);
        }
    }

    /**
     * Improve a specific text block (Rich Editor AI)
     */
    public function improveSection(Request $request)
    {
        $request->validate([
            'text' => 'required|string',
            'type' => 'required|string', // experience, summary, etc.
            'intents' => 'nullable|array' // [make_concise, add_metrics, fix_grammar]
        ]);

        $text = $request->input('text');
        $type = $request->input('type');

        return response()->stream(function () use ($text, $type) {
            $messages = [
                ['role' => 'system', 'content' => "You are a professional resume writer. Rewrite the following {$type} section to be more impactful, use action verbs, and quantify achievements where possible."],
                ['role' => 'user', 'content' => "Rewrite this text:\n\n{$text}"]
            ];

            try {
                $stream = $this->mistral->chat()->createStream(
                    messages: $messages,
                    model: 'mistral-large-latest',
                    temperature: 0.6
                );

                foreach ($stream as $chunk) {
                    $content = $chunk->choices[0]->delta->content ?? '';
                    if ($content) {
                        echo "data: " . json_encode(['content' => $content]) . "\n\n";
                        ob_flush();
                        flush();
                    }
                }
                echo "data: [DONE]\n\n";
                ob_flush();
                flush();

            } catch (\Exception $e) {
                Log::error("CV Improve Error: " . $e->getMessage());
                echo "data: " . json_encode(['error' => $e->getMessage()]) . "\n\n";
                ob_flush();
                flush();
            }
        }, 200, [
            'Cache-Control' => 'no-cache',
            'Content-Type' => 'text/event-stream',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
