<?php

namespace App\Http\Controllers\CareerAdvisor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use HelgeSverre\Mistral\Mistral;

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

        return response()->stream(function () use ($goal, $currentRole, $timeframe) {
            $messages = [
                ['role' => 'system', 'content' => "You are a career strategist. Create a detailed, phased roadmap from {$currentRole} to {$goal} over {$timeframe}. Structure it in phases."],
                ['role' => 'user', 'content' => "Generate the roadmap."]
            ];

            try {
                $stream = $this->mistral->chat()->createStream(
                    messages: $messages,
                    model: 'mistral-large-latest'
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
