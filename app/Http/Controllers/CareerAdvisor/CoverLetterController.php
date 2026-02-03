<?php

namespace App\Http\Controllers\CareerAdvisor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use HelgeSverre\Mistral\Mistral;
use HelgeSverre\Mistral\Enums\Model;
use HelgeSverre\Mistral\Enums\Role;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CoverLetterController extends Controller
{
    protected $mistral;

    public function __construct()
    {
        $this->mistral = new Mistral(apiKey: config('mistral.api_key'));
    }

    /**
     * Generate content for a cover letter section via SSE
     */
    public function generate(Request $request)
    {
        $request->validate([
            'section' => 'required|string', // intro, body, conclusion, etc.
            'context' => 'required|array',  // user profile, job description, etc.
            'tone' => 'nullable|string',
        ]);

        $section = $request->input('section');
        $context = $request->input('context');
        $tone = $request->input('tone', 'professional');

        return response()->stream(function () use ($section, $context, $tone) {
            $prompt = $this->buildPrompt($section, $context, $tone);

            $messages = [
                ['role' => 'system', 'content' => 'You are an expert career coach helping a user write a cover letter. Output ONLY the content for the requested section. Do not include markdown formatting like **bold** unless necessary for emphasis. Keep it concise and impactful.'],
                ['role' => 'user', 'content' => $prompt]
            ];

            try {
                // Determine if we can use streaming with the library, otherwise simulate or normal request
                // Assuming the library supports streaming via a generator or callback
                $stream = $this->mistral->chat()->createStream(
                    messages: $messages,
                    model: 'mistral-large-latest',
                    temperature: 0.7
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
                Log::error("CoverLetter Generation Error: " . $e->getMessage());
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

    /**
     * Score the cover letter for ATS compatibility
     */
    public function score(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
            'jobDescription' => 'nullable|string'
        ]);

        $content = $request->input('content');
        $jobDescription = $request->input('jobDescription', '');

        // Prompt for scoring
        $systemPrompt = "You are an ATS (Applicant Tracking System) expert. Analyze the cover letter provided.";
        if ($jobDescription) {
            $systemPrompt .= " Compare it against the job description: " . substr($jobDescription, 0, 500) . "...";
        }
        
        $userPrompt = "Analyze this cover letter text: \n\n{$content}\n\n" .
            "Provide a JSON response with: \n" .
            "1. score (0-100)\n" .
            "2. strengths (array of strings)\n" .
            "3. improvements (array of strings)\n" .
            "4. keywords_found (array of strings)\n" .
            "5. missing_keywords (if job description provided)\n" .
            "Output ONLY JSON.";

        $response = $this->mistral->chat()->create(
            messages: [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $userPrompt]
            ],
            model: 'mistral-large-latest',
            responseFormat: ['type' => 'json_object']
        );

        return response()->json(json_decode($response->dto()->choices[0]->message->content));
    }

    private function buildPrompt($section, $context, $tone)
    {
        $userName = $context['name'] ?? 'Candidate';
        $company = $context['company'] ?? 'the company';
        $jobTitle = $context['jobTitle'] ?? 'the position';
        
        switch ($section) {
            case 'greeting':
                return "Write a professional greeting for a cover letter to {$company}.";
            case 'intro':
                return "Write an engaging opening paragraph for a {$jobTitle} position at {$company}. Tone: {$tone}.";
            case 'body':
                return "Write the main body paragraph highlighting these skills: " . implode(', ', $context['skills'] ?? []) . ". Connect them to the {$jobTitle} role.";
            case 'conclusion':
                return "Write a strong closing paragraph reiterating interest in {$company} and requesting an interview.";
            default:
                return "Write a cover letter section for {$section}.";
        }
    }
}
