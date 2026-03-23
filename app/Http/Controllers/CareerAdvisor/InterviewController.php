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
        $jobTitle        = $request->input('jobTitle', 'candidat');
        $companyName     = $request->input('companyName', 'notre entreprise');
        $jobDescription  = $request->input('jobDescription', '');
        $interviewType   = $request->input('interviewType', 'RH');
        $difficulty      = $request->input('difficulty', 'medium');
        $focusAreas      = implode(', ', $request->input('focusAreas', []));
        $duration        = $request->input('duration', '30-45 min');
        $language        = $request->input('language', 'fr');

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

        // ── Inject candidate CV from authenticated user profile ───────────
        $user = auth()->user();
        $cvLines = [];
        if ($user) {
            $name = $user->name;
            if ($name) $cvLines[] = "Candidate: {$name}";

            $profession = $user->full_profession ?? $user->profession?->name ?? null;
            if ($profession) $cvLines[] = "Current role: {$profession}";

            $exps = $user->experiences()
                ->orderBy('date_start', 'desc')
                ->take(8)
                ->get();
            if ($exps->count()) {
                $cvLines[] = "Experience:";
                foreach ($exps as $exp) {
                    $end = $exp->date_end ?? 'Present';
                    $desc = $exp->description ? ' — ' . \Illuminate\Support\Str::limit($exp->description, 150) : '';
                    $cvLines[] = "  • {$exp->name} @ {$exp->InstitutionName} ({$exp->date_start}–{$end}){$desc}";
                }
            }

            $skills = $user->competences()->take(10)->pluck('name')->toArray();
            if ($skills) $cvLines[] = "Skills: " . implode(', ', $skills);

            $langs = $user->languages()->get()->map(fn($l) => $l->name . ' (' . ($l->pivot->level ?? 'B2') . ')')->toArray();
            if ($langs) $cvLines[] = "Languages: " . implode(', ', $langs);
        }
        $cvSection    = $cvLines ? "\n\nCANDIDATE PROFILE (use this to ask targeted, personalised questions):\n" . implode("\n", $cvLines) : '';
        $jobDescLine  = $jobDescription ? "\n\nJOB POSTING:\n{$jobDescription}" : '';

        $systemPrompt = "You are an expert senior recruiter conducting a rigorous interview.
Generate exactly {$count} interview questions for the role '{$jobTitle}' at '{$companyName}'.{$cvSection}{$jobDescLine}

Interview type: {$interviewType}. Difficulty: {$difficulty}. Focus areas: {$focusAreas}.

Rules:
- Start with a brief personalised welcome using the candidate's name (if known) + \"Tell me about yourself\" as Q1.
- Make questions highly specific: reference the candidate's actual companies, job titles, or skills from their CV.
- Progress from simple/biographical to complex/challenging.
- If a job posting is provided, align questions tightly with its requirements." . ($cvLines ? "\n- Challenge the candidate on gaps or transitions visible in their CV." : '') . "
- Write ALL questions in {$lang}.
RESPOND ONLY IN JSON: {\"questions\": [\"Q1\", \"Q2\", ...]}";

        try {
            // mistral-large — best quality for personalised question generation
            $response = $this->mistral->chat()->create(
                messages: [['role' => 'system', 'content' => $systemPrompt]],
                model: 'mistral-large-latest',
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

Evaluate the answer and respond ONLY IN JSON — no markdown, no explanation:
{
    \"score_delta\": <integer -15 to +10, negative if weak answer>,
    \"comment\": \"<1-2 short sentences spoken aloud as the interviewer — stay in character>\",
    \"feedback\": \"<Private coaching tip for the learner, NOT spoken>\",
    \"pass\": <true = move to next planned question, false = answer needs follow-up>,
    \"adaptive_follow_up\": <if pass=false: a short targeted follow-up question to help the candidate dig deeper OR clarify their answer. If pass=true: null>,
    \"dimensions\": {
        \"relevance\": <0-100 — does the answer address the question?>,
        \"structure\": <0-100 — logical flow, STAR method, clarity?>,
        \"depth\": <0-100 — specific examples, concrete details?>,
        \"delivery\": <0-100 — confidence, conciseness, no filler?>
    }
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
                'score_delta'          => 0,
                'comment'              => '',
                'feedback'             => '',
                'pass'                 => true,
                'adaptive_follow_up'   => null,
                'dimensions'           => ['relevance' => 50, 'structure' => 50, 'depth' => 50, 'delivery' => 50],
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
