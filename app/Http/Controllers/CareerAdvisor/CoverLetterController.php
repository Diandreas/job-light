<?php

namespace App\Http\Controllers\CareerAdvisor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use HelgeSverre\Mistral\Mistral;
use HelgeSverre\Mistral\Enums\Model;
use HelgeSverre\Mistral\Enums\Role;
use Inertia\Inertia;

class CoverLetterController extends Controller
{
    protected $mistral;

    public function __construct()
    {
        $this->mistral = new Mistral(apiKey: config('mistral.api_key'));
    }

    /**
     * Show the cover letter editor
     */
    public function index(Request $request)
    {
        $jobKeywords = $request->input('keywords', []);

        return Inertia::render('CareerAdvisor/CoverLetter/Editor', [
            'jobKeywords' => $jobKeywords,
        ]);
    }

    /**
     * Analyze cover letter content
     */
    public function analyze(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
            'jobKeywords' => 'array',
        ]);

        try {
            // Backend validation of scoring (optional - frontend does local scoring)
            // Here we could add additional AI-powered analysis

            $content = $request->input('content');
            $jobKeywords = $request->input('jobKeywords', []);

            // Use AI to provide additional insights
            $response = $this->mistral->chat()->create(
                model: Model::SMALL,
                messages: [
                    ['role' => Role::SYSTEM, 'content' => $this->getAnalysisSystemPrompt()],
                    ['role' => Role::USER, 'content' => "Analysez cette lettre de motivation:\n\n{$content}"],
                ]
            );

            $analysis = $response->message()->content;

            return response()->json([
                'success' => true,
                'analysis' => $analysis,
            ]);
        } catch (\Exception $e) {
            Log::error('Cover letter analysis error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Erreur lors de l\'analyse de la lettre',
            ], 500);
        }
    }

    /**
     * Generate AI suggestions for a specific section
     */
    public function suggest(Request $request)
    {
        $request->validate([
            'section' => 'required|string',
            'currentContent' => 'string',
            'context' => 'array',
        ]);

        try {
            $section = $request->input('section');
            $currentContent = $request->input('currentContent', '');
            $context = $request->input('context', []);

            $response = $this->mistral->chat()->create(
                model: Model::SMALL,
                messages: [
                    ['role' => Role::SYSTEM, 'content' => $this->getSuggestionSystemPrompt()],
                    ['role' => Role::USER, 'content' => $this->buildSuggestionPrompt($section, $currentContent, $context)],
                ]
            );

            $suggestions = $response->message()->content;

            return response()->json([
                'success' => true,
                'suggestions' => $suggestions,
            ]);
        } catch (\Exception $e) {
            Log::error('Cover letter suggestion error', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Erreur lors de la génération des suggestions',
            ], 500);
        }
    }

    /**
     * Generate complete cover letter with streaming
     */
    public function generate(Request $request)
    {
        $request->validate([
            'yourName' => 'required|string',
            'companyName' => 'required|string',
            'subject' => 'required|string',
            'jobKeywords' => 'array',
            'currentContent' => 'string',
        ]);

        return response()->stream(function () use ($request) {
            try {
                $context = [
                    'yourName' => $request->input('yourName'),
                    'companyName' => $request->input('companyName'),
                    'recipientName' => $request->input('recipientName', ''),
                    'subject' => $request->input('subject'),
                    'jobKeywords' => $request->input('jobKeywords', []),
                    'currentContent' => $request->input('currentContent', ''),
                ];

                $prompt = $this->buildGenerationPrompt($context);

                // Use Mistral streaming
                $stream = $this->mistral->chat()->createStreamed(
                    model: Model::MEDIUM,
                    messages: [
                        ['role' => Role::SYSTEM, 'content' => $this->getGenerationSystemPrompt()],
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
                Log::error('Cover letter generation error', [
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
     * System prompt for analysis
     */
    private function getAnalysisSystemPrompt(): string
    {
        return <<<PROMPT
Vous êtes un expert en recrutement et en rédaction de lettres de motivation.
Analysez la lettre de motivation fournie et donnez des retours constructifs en français.

Concentrez-vous sur:
1. La structure et l'organisation
2. Le professionnalisme et le ton
3. Les points forts
4. Les axes d'amélioration
5. Des suggestions concrètes

Soyez précis et donnez des exemples.
PROMPT;
    }

    /**
     * System prompt for suggestions
     */
    private function getSuggestionSystemPrompt(): string
    {
        return <<<PROMPT
Vous êtes un expert en rédaction de lettres de motivation.
Fournissez des suggestions concrètes et actionnables pour améliorer la section demandée.

Vos suggestions doivent être:
- Spécifiques et détaillées
- Professionnelles
- Adaptées au contexte
- En français

Ne donnez que 2-3 suggestions maximum, les plus impactantes.
PROMPT;
    }

    /**
     * System prompt for generation
     */
    private function getGenerationSystemPrompt(): string
    {
        return <<<PROMPT
Vous êtes un expert en rédaction de lettres de motivation professionnelles.
Générez une lettre de motivation complète, structurée et personnalisée en français.

La lettre doit:
- Suivre la structure classique: introduction, corps (2-3 paragraphes), conclusion
- Être professionnelle mais authentique
- Intégrer naturellement les mots-clés fournis
- Faire entre 250 et 400 mots
- Inclure des exemples concrets si possible
- Commencer par "Madame, Monsieur,"
- Se terminer par "Cordialement,"

NE PAS inclure de formules de politesse complète au début et à la fin, seulement le corps de la lettre.
PROMPT;
    }

    /**
     * Build suggestion prompt
     */
    private function buildSuggestionPrompt(string $section, string $currentContent, array $context): string
    {
        $contextStr = json_encode($context, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        return <<<PROMPT
Section à améliorer: {$section}

Contenu actuel:
{$currentContent}

Contexte:
{$contextStr}

Donnez 2-3 suggestions concrètes pour améliorer cette section.
PROMPT;
    }

    /**
     * Build generation prompt
     */
    private function buildGenerationPrompt(array $context): string
    {
        $keywords = !empty($context['jobKeywords'])
            ? implode(', ', $context['jobKeywords'])
            : 'N/A';

        $currentContent = !empty($context['currentContent'])
            ? "\n\nContenu existant à améliorer:\n{$context['currentContent']}"
            : '';

        return <<<PROMPT
Générez une lettre de motivation pour:

Candidat: {$context['yourName']}
Entreprise: {$context['companyName']}
Destinataire: {$context['recipientName']}
Objet: {$context['subject']}
Mots-clés à intégrer: {$keywords}
{$currentContent}

Générez maintenant une lettre de motivation professionnelle et personnalisée.
PROMPT;
    }
}
