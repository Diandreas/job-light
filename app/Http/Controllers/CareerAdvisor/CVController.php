<?php

namespace App\Http\Controllers\CareerAdvisor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use HelgeSverre\Mistral\Mistral;
use HelgeSverre\Mistral\Enums\Model;
use HelgeSverre\Mistral\Enums\Role;
use Inertia\Inertia;

class CVController extends Controller
{
    protected $mistral;

    public function __construct()
    {
        $this->mistral = new Mistral(apiKey: config('mistral.api_key'));
    }

    /**
     * Show CV heatmap view
     */
    public function heatmap(Request $request)
    {
        // Mock data for now - would come from DB/analysis
        $sections = [
            [
                'id' => 'header',
                'type' => 'header',
                'score' => 45,
                'issues' => ['Photo professionnelle manquante', 'LinkedIn URL invalide'],
                'recommendations' => ['Ajoutez une photo professionnelle (+5 pts)', 'Validez l\'URL LinkedIn (+3 pts)', 'Ajoutez un titre accrocheur (+7 pts)'],
                'data' => [],
            ],
            [
                'id' => 'summary',
                'type' => 'summary',
                'score' => 70,
                'issues' => [],
                'recommendations' => ['Ajoutez des métriques quantifiées (+10 pts)'],
                'data' => [],
            ],
            [
                'id' => 'experience',
                'type' => 'experience',
                'score' => 75,
                'issues' => [],
                'recommendations' => ['Ajoutez plus de verbes d\'action (+5 pts)'],
                'data' => [],
            ],
            [
                'id' => 'skills',
                'type' => 'skills',
                'score' => 85,
                'issues' => [],
                'recommendations' => [],
                'data' => [],
            ],
            [
                'id' => 'education',
                'type' => 'education',
                'score' => 90,
                'issues' => [],
                'recommendations' => [],
                'data' => [],
            ],
        ];

        $overallScore = round(array_sum(array_column($sections, 'score')) / count($sections));

        return Inertia::render('CareerAdvisor/CV/Heatmap', [
            'sections' => $sections,
            'overallScore' => $overallScore,
            'benchmarks' => [
                'average' => 68,
                'top10' => 85,
            ],
        ]);
    }

    /**
     * Analyze a specific CV section
     */
    public function analyzeSection(Request $request)
    {
        $request->validate([
            'sectionType' => 'required|string',
            'content' => 'required|array',
        ]);

        try {
            $sectionType = $request->input('sectionType');
            $content = $request->input('content');

            // Use AI to analyze the section
            $response = $this->mistral->chat()->create(
                model: Model::SMALL,
                messages: [
                    ['role' => Role::SYSTEM, 'content' => $this->getSectionAnalysisPrompt($sectionType)],
                    ['role' => Role::USER, 'content' => json_encode($content, JSON_PRETTY_PRINT)],
                ]
            );

            $analysis = $response->message()->content;

            return response()->json([
                'success' => true,
                'analysis' => $analysis,
            ]);
        } catch (\Exception $e) {
            Log::error('CV section analysis error', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Erreur lors de l\'analyse de la section',
            ], 500);
        }
    }

    /**
     * Improve a CV section with AI streaming
     */
    public function improveSection(Request $request)
    {
        $request->validate([
            'sectionType' => 'required|string',
            'content' => 'required',
        ]);

        return response()->stream(function () use ($request) {
            try {
                $sectionType = $request->input('sectionType');
                $content = $request->input('content');

                $prompt = $this->buildImprovementPrompt($sectionType, $content);

                $stream = $this->mistral->chat()->createStreamed(
                    model: Model::MEDIUM,
                    messages: [
                        ['role' => Role::SYSTEM, 'content' => $this->getImprovementSystemPrompt()],
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
                Log::error('CV improvement error', [
                    'error' => $e->getMessage(),
                ]);

                echo "data: " . json_encode(['error' => 'Erreur lors de l\'amélioration']) . "\n\n";
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
     * Get benchmarking data (anonymized)
     */
    public function benchmark(Request $request)
    {
        // This would query anonymized data from database
        // For now, returning mock data
        return response()->json([
            'success' => true,
            'benchmarks' => [
                'overall' => [
                    'average' => 68,
                    'top10' => 85,
                    'top25' => 75,
                ],
                'sections' => [
                    'experience' => ['average' => 70, 'top10' => 90],
                    'skills' => ['average' => 75, 'top10' => 92],
                    'education' => ['average' => 80, 'top10' => 95],
                ],
                'insights' => [
                    'Top performers include 5+ quantified achievements',
                    'Most successful CVs list 8-12 core skills',
                    'Top 10% have professional certifications',
                ],
            ],
        ]);
    }

    /**
     * System prompt for section analysis
     */
    private function getSectionAnalysisPrompt(string $sectionType): string
    {
        return <<<PROMPT
Vous êtes un expert en recrutement spécialisé dans l'analyse de CV.
Analysez la section '{$sectionType}' du CV fourni.

Fournissez:
1. Un score sur 100
2. Les points forts
3. Les points faibles
4. Des recommandations spécifiques et actionnables
5. L'impact potentiel en points de chaque recommandation

Soyez concis et précis. Répondez en français.
PROMPT;
    }

    /**
     * System prompt for improvement
     */
    private function getImprovementSystemPrompt(): string
    {
        return <<<PROMPT
Vous êtes un expert en rédaction de CV professionnels.
Améliorez le contenu fourni en:
- Utilisant des verbes d'action forts
- Ajoutant des métriques quantifiées quand possible
- Rendant les accomplissements plus impactants
- Gardant un ton professionnel

Répondez uniquement avec le contenu amélioré, sans explications.
Répondez en français.
PROMPT;
    }

    /**
     * Build improvement prompt
     */
    private function buildImprovementPrompt(string $sectionType, $content): string
    {
        $contentStr = is_array($content)
            ? json_encode($content, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
            : $content;

        return <<<PROMPT
Section: {$sectionType}

Contenu actuel:
{$contentStr}

Améliorez ce contenu de manière professionnelle et impactante.
PROMPT;
    }
}
