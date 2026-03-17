<?php

namespace App\Http\Controllers\CareerAdvisor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use HelgeSverre\Mistral\Mistral;
use HelgeSverre\Mistral\Enums\Role;
use Inertia\Inertia;

class CVAdvisorController extends Controller
{
    protected $mistral;

    public function __construct()
    {
        $this->mistral = new Mistral(apiKey: config('mistral.api_key'));
    }

    /**
     * Affiche la page du Heatmap avec les données du CV pré-chargées
     */
    public function index()
    {
        $user = auth()->user();

        // Récupération des données structurées du CV
        $experiences = $user->experiences()->with('category')->orderBy('date_start', 'desc')->get();
        $competences = $user->competences;
        $summaries = $user->summaries;
        $languages = $user->languages;

        $cvData = [
            'experiences' => $experiences->map(function ($exp) {
                return [
                    'title' => $exp->job_title ?? $exp->name,
                    'company' => $exp->InstitutionName ?? $exp->company_name,
                    'start_date' => $exp->date_start,
                    'end_date' => $exp->date_end,
                    'description' => $exp->description,
                    'category' => $exp->category ? $exp->category->name : 'Expérience'
                ];
            })->toArray(),
            'competences' => $competences->map(function ($comp) {
                return [
                    'name' => $comp->name,
                    'level' => $comp->pivot->level ?? null
                ];
            })->toArray(),
            'summaries' => $summaries->map(function ($sum) {
                return [
                    'name' => $sum->name,
                    'description' => $sum->description
                ];
            })->toArray(),
            'languages' => $languages->map(function ($lang) {
                return [
                    'name' => $lang->name,
                    'level' => $lang->pivot->language_level ?? null
                ];
            })->toArray(),
        ];

        $personalInfo = [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone_number,
            'linkedin' => $user->linkedin,
            'github' => $user->github,
        ];

        return Inertia::render('CareerAdvisor/CV/Heatmap', [
            'cvData' => $cvData,
            'personalInfo' => $personalInfo,
        ]);
    }

    /**
     * Analyze CV globally and deeply via Mistral AI
     */
    public function analyze(Request $request)
    {
        $request->validate([
            'cvData' => 'required|array',
            'personalInfo' => 'required|array',
            'targetRole' => 'nullable|string'
        ]);

        $cvData = $request->input('cvData');
        $personalInfo = $request->input('personalInfo');
        $targetRole = $request->input('targetRole', 'Général');

        $prompt = "Analyse attentivement ces données de CV pour un poste de **{$targetRole}**. 
Tu es un recruteur expert très exigeant. Fais une critique constructive.

Pour CHAQUE section (summary, experience, skills, layout), retourne :
1. un 'score_ia' sur 100 basé sur la qualité de la rédaction, l'impact et la clarté.
2. 'feedback': Une critique (ce qui va, ce qui ne va pas).
3. 'improvements': Une liste de 2 ou 3 actions concrètes pour améliorer (ex: 'Ajoute des KPIs', 'Utilise plus de verbes d'action').

Retourne le résultat UNIQUEMENT sous forme de JSON valide avec cette structure stricte :
{
  \"summary\": { \"score_ia\": 80, \"feedback\": \"...\", \"improvements\": [\"...\"] },
  \"experience\": { \"score_ia\": 60, \"feedback\": \"...\", \"improvements\": [\"...\"] },
  \"skills\": { \"score_ia\": 90, \"feedback\": \"...\", \"improvements\": [\"...\"] },
  \"layout\": { \"score_ia\": 75, \"feedback\": \"...\", \"improvements\": [\"...\"] }
}

Données du candidat : " . json_encode($personalInfo) . "
Données du CV : " . json_encode($cvData);

        try {
            $response = $this->mistral->chat()->create(
                messages: [
                    ['role' => Role::system->value, 'content' => 'Tu es un auditeur de CV top-tier. Réponds uniquement en JSON.'],
                    ['role' => Role::user->value, 'content' => $prompt]
                ],
                model: 'mistral-large-latest',
                temperature: 0.2,
                responseFormat: ['type' => 'json_object']
            );

            $rawContent = $response->dto()->choices[0]->message->content;
            
            // Clean markdown logic if mistake by model
            $rawContent = str_replace(['```json', '```'], '', $rawContent);
            $parsed = json_decode(trim($rawContent), true);

            if (!$parsed) {
                return response()->json(['error' => 'Erreur de parsing JSON depuis Mistral'], 500);
            }

            return response()->json($parsed);

        } catch (\Exception $e) {
            Log::error("CV Analysis Error: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Improve a specific text block (Streaming AI)
     */
    public function improveSection(Request $request)
    {
        $request->validate([
            'text' => 'required|string',
            'type' => 'required|string', // experience, summary, etc.
        ]);

        $text = $request->input('text');
        $type = $request->input('type');

        $systemPrompt = match($type) {
            'summary' => "Tu es un expert en rédaction de CV. Améliore ce résumé professionnel. Il doit être percutant, accrocheur, et valoriser le candidat en 3 ou 4 phrases maximum. Retourne uniquement le texte amélioré.",
            'experience' => "Tu es un expert en rédaction de CV. Réécris cette description d'expérience. Utilise des puces (bullet points), des verbes d'action forts, et mets en valeur les résultats et compétences. Retourne uniquement la description réécrite.",
            'skills' => "Tu es un expert en employabilité. Optimise cette liste de compétences en les regroupant logiquement si besoin, ou reformule pour être plus professionnel. Retourne uniquement le texte.",
            default => "Tu es un expert RH. Améliore ce texte de CV pour le rendre plus professionnel et orienté résultats. Retourne uniquement le texte amélioré."
        };

        return response()->stream(function () use ($systemPrompt, $text) {
            $messages = [
                ['role' => Role::system->value, 'content' => $systemPrompt],
                ['role' => Role::user->value, 'content' => "Réécris ce texte :\n\n{$text}"]
            ];

            try {
                $stream = $this->mistral->chat()->createStreamed(
                    messages: $messages,
                    model: 'mistral-large-latest',
                    temperature: 0.6,
                    maxTokens: 1000
                );

                foreach ($stream as $chunk) {
                    $content = $chunk->choices[0]->delta->content ?? '';
                    if ($content) {
                        echo "data: " . json_encode(['content' => $content]) . "\n\n";
                        if (ob_get_level()) ob_flush();
                        flush();
                    }
                }
                echo "data: [DONE]\n\n";
                if (ob_get_level()) ob_flush();
                flush();

            } catch (\Exception $e) {
                Log::error("CV Improve Error: " . $e->getMessage());
                echo "data: " . json_encode(['error' => $e->getMessage()]) . "\n\n";
                if (ob_get_level()) ob_flush();
                flush();
            }
        }, 200, [
            'Cache-Control' => 'no-cache',
            'Content-Type' => 'text/event-stream',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
