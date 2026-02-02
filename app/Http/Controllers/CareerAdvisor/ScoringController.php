<?php

namespace App\Http\Controllers\CareerAdvisor;

use App\Http\Controllers\Controller;
use App\Services\CareerAdvisor\ATSScoringService;
use App\Services\CareerAdvisor\CoverLetterAnalyzer;
use App\Services\CareerAdvisor\InterviewScoringService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScoringController extends Controller
{
    protected ATSScoringService $atsScoring;
    protected InterviewScoringService $interviewScoring;
    protected CoverLetterAnalyzer $coverLetterAnalyzer;

    public function __construct(
        ATSScoringService $atsScoring,
        InterviewScoringService $interviewScoring,
        CoverLetterAnalyzer $coverLetterAnalyzer
    ) {
        $this->atsScoring = $atsScoring;
        $this->interviewScoring = $interviewScoring;
        $this->coverLetterAnalyzer = $coverLetterAnalyzer;
    }

    /**
     * Score a CV for ATS compatibility (deterministic, free, instant).
     */
    public function ats(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cvText' => 'required|string',
            'jobDescription' => 'nullable|string',
        ]);

        $result = $this->atsScoring->score(
            $validated['cvText'],
            $validated['jobDescription'] ?? ''
        );

        return response()->json($result);
    }

    /**
     * Score an interview answer (deterministic, free, instant).
     */
    public function interview(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'answer' => 'required|string',
            'question' => 'nullable|string',
            'language' => 'nullable|string|max:5',
        ]);

        $result = $this->interviewScoring->score(
            $validated['answer'],
            $validated['question'] ?? '',
            $validated['language'] ?? 'fr'
        );

        return response()->json($result);
    }

    /**
     * Analyze a cover letter locally (deterministic, free, instant).
     */
    public function coverLetter(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'letterText' => 'required|string',
            'jobDescription' => 'nullable|string',
        ]);

        $result = $this->coverLetterAnalyzer->analyze(
            $validated['letterText'],
            $validated['jobDescription'] ?? ''
        );

        return response()->json($result);
    }
}
