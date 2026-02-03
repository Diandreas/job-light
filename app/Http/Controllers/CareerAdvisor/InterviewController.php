<?php

namespace App\Http\Controllers\CareerAdvisor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use HelgeSverre\Mistral\Mistral;

class InterviewController extends Controller
{
    protected $mistral;

    public function __construct()
    {
        $this->mistral = new Mistral(apiKey: config('mistral.api_key'));
    }

    public function startSession(Request $request)
    {
        // Initialize a new interview session in DB (simplified for now)
        // returns session_id + first question
        $type = $request->input('type', 'behavioral');
        
        $initialPrompt = "You are conducting a {$type} interview. Start by welcoming the candidate and asking the first question. Keep it professional.";
        
        $response = $this->mistral->chat()->create(
            messages: [['role' => 'system', 'content' => $initialPrompt]],
            model: 'mistral-large-latest'
        );

        return response()->json([
            'sessionId' => uniqid('int_'),
            'message' => $response->dto()->choices[0]->message->content
        ]);
    }

    public function verboseFeedback(Request $request)
    {
        // Analyze a specific answer
        return response()->stream(function () use ($request) {
            $question = $request->input('question');
            $answer = $request->input('answer');

            $messages = [
                ['role' => 'system', 'content' => 'You are an interview coach. Provide real-time feedback on this answer. analyze: 1. Clarity, 2. STAR method usage, 3. Impact.'],
                ['role' => 'user', 'content' => "Question: {$question}\nAnswer: {$answer}"]
            ];

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
        }, 200, [
            'Cache-Control' => 'no-cache',
            'Content-Type' => 'text/event-stream',
            'X-Accel-Buffering' => 'no',
        ]);
    }
    
    public function generateReport(Request $request) {
        // Generate final report
        // Logic to aggregate session data would go here
        return response()->json(['status' => 'mock_report_generated']);
    }
}
