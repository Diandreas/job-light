<?php

namespace App\Http\Controllers\CareerAdvisor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use HelgeSverre\Mistral\Mistral;
use App\Models\ChatHistory;

class InterviewController extends Controller
{
    protected $mistral;

    public function __construct()
    {
        $this->mistral = new Mistral(apiKey: config('mistral.api_key'));
    }

    /**
     * Pre-generate the full question bank for the interview session.
     * One Mistral call upfront — eliminates per-question latency.
     */
    public function prepare(Request $request)
    {
        $jobTitle       = $request->input('jobTitle', 'candidat');
        $companyName    = $request->input('companyName', 'notre entreprise');
        $interviewType  = $request->input('interviewType', 'RH');
        $difficulty     = $request->input('difficulty', 'medium');
        $focusAreas     = implode(', ', $request->input('focusAreas', []));
        $duration       = $request->input('duration', '30-45 min');
        $language       = $request->input('language', 'fr');

        // Keep counts small — large batches cause timeouts on slow connections
        $count = match ($duration) {
            '15-30 min' => 5,
            '45-60 min' => 8,
            default     => 6,
        };

        $lang = match ($language) {
            'en' => 'English',
            'es' => 'Español',
            'de' => 'Deutsch',
            default => 'Français',
        };

        $systemPrompt = "You are an expert recruiter. Generate exactly {$count} interview questions for the role '{$jobTitle}' at '{$companyName}'.
Interview type: {$interviewType}. Difficulty: {$difficulty}. Focus areas: {$focusAreas}.
Rules:
- Always start with a brief welcome + \"Tell me about yourself\" as the very first question.
- Progress from simple to complex.
- Questions must be realistic and targeted for this specific role.
- Write questions in {$lang}.
RESPOND ONLY IN JSON: {\"questions\": [\"Q1\", \"Q2\", ...]}";

        try {
            // mistral-small — 3-5x faster than large, plenty capable for question lists
            $response = $this->mistral->chat()->create(
                messages: [['role' => 'system', 'content' => $systemPrompt]],
                model: 'mistral-small-latest',
                temperature: 0.5,
                responseFormat: ['type' => 'json_object']
            );

            $dto  = $response->dto();
            $json = json_decode($dto->choices[0]->message->content ?? '{}', true);

            if (empty($json['questions'])) {
                return response()->json(['error' => 'Impossible de générer les questions.'], 500);
            }

            // Normalize: some models return objects {question, type, ...} instead of plain strings
            $questions = array_values(array_map(function ($q) {
                if (is_string($q)) return $q;
                return $q['question'] ?? $q['text'] ?? $q['content'] ?? (string) json_encode($q);
            }, $json['questions']));

            return response()->json(['questions' => $questions]);

        } catch (\Exception $e) {
            Log::error("Interview Prepare Error: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Evaluate a single candidate answer.
     * Returns: score_delta, comment (spoken aloud), feedback (coaching tip), pass (move to next Q?)
     */
    public function evaluate(Request $request)
    {
        $question        = $request->input('question', '');
        $answer          = $request->input('answer', '');
        $jobTitle        = $request->input('jobTitle', 'candidat');
        $aggressionLevel = (int) $request->input('aggressionLevel', 2);
        $language        = $request->input('language', 'fr');

        $aggressionDesc = match ($aggressionLevel) {
            1 => "You are kind and encouraging. Accept partial answers. Reassure the candidate. Pass to the next question easily.",
            3 => "You are very demanding and blunt. Challenge every answer. Probe weaknesses. Only pass if the answer is truly excellent. Be direct and even harsh when the answer is weak.",
            default => "You are professional and neutral. Expect solid, structured answers. Pass only when the answer is satisfactory.",
        };

        $lang = match ($language) {
            'en' => 'English',
            'es' => 'Español',
            'de' => 'Deutsch',
            default => 'Français',
        };

        $systemPrompt = "You are a recruiter interviewing a candidate for the role of {$jobTitle}.
{$aggressionDesc}
Question asked: \"{$question}\"
Candidate's answer: \"{$answer}\"

Evaluate the answer and respond ONLY IN JSON:
{
    \"score_delta\": <integer between -15 and 10>,
    \"comment\": \"<What you say to the candidate — 1 to 2 short sentences, stay in character as the interviewer>\",
    \"feedback\": \"<Private coaching tip for the learner — what they should improve>\",
    \"pass\": <true or false — whether to move to the next question>
}
Write everything in {$lang}.";

        try {
            // mistral-small — fast enough for single-answer evaluation
            $response = $this->mistral->chat()->create(
                messages: [['role' => 'system', 'content' => $systemPrompt]],
                model: 'mistral-small-latest',
                temperature: 0.4,
                responseFormat: ['type' => 'json_object']
            );

            $dto    = $response->dto();
            $result = json_decode($dto->choices[0]->message->content ?? '{}', true);

            return response()->json(array_merge([
                'score_delta' => 0,
                'comment'     => '',
                'feedback'    => '',
                'pass'        => true,
            ], $result ?? []));

        } catch (\Exception $e) {
            Log::error("Interview Evaluate Error: " . $e->getMessage());
            // On failure: pass to next question silently
            return response()->json(['score_delta' => 0, 'comment' => '', 'feedback' => '', 'pass' => true]);
        }
    }

    /**
     * Generate final interview report.
     * Pre-saves transcript before calling Mistral so history is always recorded.
     */
    public function generateReport(Request $request)
    {
        $history  = $request->input('history', []);
        $jobTitle = $request->input('jobTitle') ?: 'Entretien';
        $score    = (int) $request->input('score', 0);

        // ── 1. Save transcript immediately ────────────────────────────────────
        $record = ChatHistory::create([
            'user_id'         => auth()->id(),
            'context'         => 'interview_session',
            'context_id'      => \Illuminate\Support\Str::limit($jobTitle, 50),
            'messages'        => $history,
            'structured_data' => null,
            'service_id'      => 'mistral',
            'tokens_used'     => 0,
        ]);

        // ── 2. Build transcript for Mistral ───────────────────────────────────
        $transcriptText = "";
        foreach ($history as $msg) {
            $role = $msg['role'] === 'user' ? 'Candidat' : 'Recruteur';
            $transcriptText .= "{$role}: {$msg['content']}\n\n";
        }

        $rejected = $score < 60;

        $systemPrompt = "Vous êtes un coach carrière d'élite (Assistant Guidy).
Analysez ce transcript d'entretien pour le poste de {$jobTitle}. Score running calculé en session : {$score}/100.
" . ($rejected ? "Le score est inférieur à 60 : le candidat n'est pas retenu. Incluez un message de rejet poli dans le rapport." : "") . "
RÉPONDEZ UNIQUEMENT EN JSON :
{
    \"score\": {$score},
    \"rejected\": " . ($rejected ? 'true' : 'false') . ",
    \"rejection_message\": \"<Message de rejet poli si rejected, sinon null>\",
    \"strengths\": [\"Point fort 1\", \"Point fort 2\", \"Point fort 3\"],
    \"weaknesses\": [\"Axe d'amélioration 1\", \"Axe 2\", \"Axe 3\"],
    \"metrics\": [
        { \"label\": \"Élocution et Clarté\", \"value\": 80 },
        { \"label\": \"Structuration (STAR)\", \"value\": 70 },
        { \"label\": \"Rassurance & Confiance\", \"value\": 90 },
        { \"label\": \"Profondeur Technique/Métier\", \"value\": 75 }
    ],
    \"transcript\": [
        { \"q\": \"Question posée\", \"a\": \"Réponse résumée\", \"feedback\": \"Critique précise\" }
    ]
}
Répondez en Français.";

        // ── 3. Generate AI report and update record ────────────────────────────
        try {
            $response = $this->mistral->chat()->create(
                messages: [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user',   'content' => "Voici le transcript :\n\n" . $transcriptText]
                ],
                model: 'mistral-large-latest',
                temperature: 0.3,
                responseFormat: ['type' => 'json_object']
            );

            $dto         = $response->dto();
            $jsonContent = $dto->choices[0]->message->content ?? '{}';
            $result      = json_decode($jsonContent, true) ?? [];

            $result = array_merge([
                'score'             => $score,
                'rejected'          => $rejected,
                'rejection_message' => null,
                'strengths'         => [],
                'weaknesses'        => [],
                'metrics'           => [],
                'transcript'        => [],
            ], $result);

            $record->update([
                'structured_data' => $result,
                'tokens_used'     => $dto->usage->totalTokens ?? 0,
            ]);

            return response()->json($result);

        } catch (\Exception $e) {
            Log::error("Interview Report AI Error (record #{$record->id}): " . $e->getMessage());
            $fallback = [
                'score'             => $score,
                'rejected'          => $rejected,
                'rejection_message' => null,
                'strengths'         => [],
                'weaknesses'        => [],
                'metrics'           => [],
                'transcript'        => [],
                'error'             => 'Rapport IA indisponible, mais votre session a été sauvegardée.',
            ];
            $record->update(['structured_data' => $fallback]);
            return response()->json($fallback);
        }
    }
}
