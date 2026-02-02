<?php

namespace App\Http\Controllers\CareerAdvisor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use HelgeSverre\Mistral\Mistral;
use HelgeSverre\Mistral\Enums\Model;
use HelgeSverre\Mistral\Enums\Role;
use Inertia\Inertia;

class RoadmapController extends Controller
{
    protected $mistral;

    public function __construct()
    {
        $this->mistral = new Mistral(apiKey: config('mistral.api_key'));
    }

    /**
     * Show roadmap generator
     */
    public function index(Request $request)
    {
        // Mock profile data - would come from user's actual CV/profile
        $profile = [
            'currentRole' => 'Développeur Full-Stack',
            'targetRole' => 'Tech Lead',
            'experience' => 5,
            'skills' => ['React', 'Node.js', 'TypeScript', 'Docker'],
        ];

        return Inertia::render('CareerAdvisor/Roadmap/Generator', [
            'profile' => $profile,
        ]);
    }

    /**
     * Generate personalized roadmap with streaming
     */
    public function generate(Request $request)
    {
        $request->validate([
            'currentRole' => 'required|string',
            'targetRole' => 'required|string',
            'experience' => 'required|integer',
            'skills' => 'array',
        ]);

        return response()->stream(function () use ($request) {
            try {
                $currentRole = $request->input('currentRole');
                $targetRole = $request->input('targetRole');
                $experience = $request->input('experience');
                $skills = $request->input('skills', []);

                $prompt = $this->buildGenerationPrompt([
                    'currentRole' => $currentRole,
                    'targetRole' => $targetRole,
                    'experience' => $experience,
                    'skills' => $skills,
                ]);

                $stream = $this->mistral->chat()->createStreamed(
                    model: Model::MEDIUM,
                    messages: [
                        ['role' => Role::SYSTEM, 'content' => $this->getSystemPrompt()],
                        ['role' => Role::USER, 'content' => $prompt],
                    ]
                );

                foreach ($stream as $chunk) {
                    $content = $chunk->message()->content ?? '';
                    if ($content) {
                        echo "data: " . json_encode(['content' => $content]) . "\n\n";
                        if (ob_get_level() > 0) {
                            ob_flush();
                        }
                        flush();
                    }
                }

                echo "data: [DONE]\n\n";
                if (ob_get_level() > 0) {
                    ob_flush();
                }
                flush();
            } catch (\Exception $e) {
                Log::error('Roadmap generation error', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);

                echo "data: " . json_encode(['error' => 'Erreur lors de la génération']) . "\n\n";
                if (ob_get_level() > 0) {
                    ob_flush();
                }
                flush();
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    /**
     * Get analytics for roadmap progress
     */
    public function analytics(Request $request)
    {
        // This would fetch from database
        return response()->json([
            'success' => true,
            'analytics' => [
                'timeInvested' => 42,
                'estimatedTotalHours' => 200,
                'skillsToLearn' => 12,
                'completionRate' => 35,
                'onTrack' => true,
                'projectedCompletion' => '2026-12-15',
            ],
        ]);
    }

    /**
     * System prompt for roadmap generation
     */
    private function getSystemPrompt(): string
    {
        return <<<PROMPT
Vous êtes un expert en développement de carrière et en planification professionnelle.
Créez une roadmap personnalisée et détaillée pour aider la personne à atteindre ses objectifs de carrière.

La roadmap doit inclure:
1. 3-4 phases bien définies
2. Pour chaque phase:
   - Titre et description
   - Durée estimée
   - Milestones concrets et actionnables
   - Compétences à acquérir
   - Ressources d'apprentissage
   - Métriques de succès
3. Estimation de l'impact sur la valeur marché
4. Conseils pour rester motivé

Soyez:
- Réaliste sur les délais
- Spécifique sur les actions à mener
- Encourageant mais honnête
- Orienté résultats

Répondez en français avec un ton professionnel mais accessible.
PROMPT;
    }

    /**
     * Build generation prompt
     */
    private function buildGenerationPrompt(array $data): string
    {
        $skillsStr = !empty($data['skills'])
            ? implode(', ', $data['skills'])
            : 'N/A';

        return <<<PROMPT
Créez une roadmap carrière personnalisée pour:

Poste actuel: {$data['currentRole']}
Objectif: {$data['targetRole']}
Expérience: {$data['experience']} ans
Compétences actuelles: {$skillsStr}

Analysez le gap de compétences et créez un plan d'action détaillé sur 18-24 mois.
Incluez des étapes concrètes, des ressources, et des délais réalistes.
PROMPT;
    }
}
