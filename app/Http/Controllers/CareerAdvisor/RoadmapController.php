<?php

namespace App\Http\Controllers\CareerAdvisor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use HelgeSverre\Mistral\Mistral;
use App\Models\ChatHistory;

class RoadmapController extends Controller
{
    protected $mistral;

    public function __construct()
    {
        $this->mistral = new Mistral(apiKey: config('mistral.api_key'));
    }

    public function generate(Request $request)
    {
        $goal = $request->input('goal');
        $currentRole = $request->input('currentRole');
        $timeframe = $request->input('timeframe', '6 months');

        $systemPrompt = <<<EOT
You are an expert career strategist. Create a highly actionable, phased career roadmap from "$currentRole" to "$goal" over a timeframe of "$timeframe".
You MUST output ONLY valid JSON.
The JSON must strictly follow this structure:
{
    "phases": [
        {
            "title": "Phase 1: Title (e.g. Foundation & Assessment)",
            "duration": "Duration (e.g. Months 1-2)",
            "description": "A 2-3 sentence overview of the phase's objective.",
            "tasks": [
                "Actionable task 1",
                "Actionable task 2",
                "Actionable task 3"
            ]
        }
    ]
}
Generate 3 to 4 distinct phases logic to the timeline. All text must be in French.
EOT;

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => "Génère la roadmap détaillée pour passer de $currentRole à $goal en $timeframe."]
        ];

        try {
            $response = $this->mistral->chat()->create(
                messages: $messages,
                model: 'mistral-large-latest',
                temperature: 0.4,
                responseFormat: ['type' => 'json_object']
            );

            // HelgeSverre/Mistral returns a DTO or array depending on the version,
            // but for JSON format we should ensure we get the content string safely.
            $dto = $response->dto();
            $jsonContent = $dto->choices[0]->message->content ?? '';
            $data = json_decode($jsonContent, true);

            if (!$data || !isset($data['phases'])) {
                throw new \Exception("Invalid JSON response from AI.");
            }

            // Save to history — isolated so a DB failure never blocks the response
            try {
                ChatHistory::create([
                    'user_id'         => auth()->id(),
                    'context'         => 'roadmap',
                    'context_id'      => \Illuminate\Support\Str::limit($goal, 30),
                    'messages'        => $messages,
                    'structured_data' => $data,
                    'service_id'      => 'mistral',
                    'tokens_used'     => $dto->usage->totalTokens ?? 0,
                ]);
            } catch (\Exception $dbError) {
                Log::error("Roadmap history save failed: " . $dbError->getMessage());
            }

            return response()->json($data);

        } catch (\Exception $e) {
            Log::error("Roadmap Generation Error: " . $e->getMessage());
            return response()->json(['error' => 'Une erreur est survenue lors de la génération de la roadmap.'], 500);
        }
    }
}
