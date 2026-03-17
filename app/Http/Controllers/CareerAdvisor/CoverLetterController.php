<?php

namespace App\Http\Controllers\CareerAdvisor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use HelgeSverre\Mistral\Mistral;
use HelgeSverre\Mistral\Enums\Model;
use HelgeSverre\Mistral\Enums\Role;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use Barryvdh\DomPDF\Facade\Pdf;

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
            'section' => 'required|string',
            'context' => 'required|array',
            'tone' => 'nullable|string',
        ]);

        $section = $request->input('section');
        $context = $request->input('context');
        $tone = $request->input('tone', 'professional');

        return response()->stream(function () use ($section, $context, $tone) {
            $prompt = $this->buildPrompt($section, $context, $tone);

            $systemPrompt = $section === 'full_letter'
                ? $this->getFullLetterSystemPrompt($tone)
                : "Tu es un expert en rédaction de lettres de motivation. Rédige UNIQUEMENT le contenu demandé. Pas de markdown, pas d'explication. Texte direct.";

            $messages = [
                ['role' => Role::system->value, 'content' => $systemPrompt],
                ['role' => Role::user->value, 'content' => $prompt]
            ];

            try {
                $stream = $this->mistral->chat()->createStreamed(
                    messages: $messages,
                    model: 'mistral-large-latest',
                    temperature: 0.7,
                    maxTokens: 2000
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
                Log::error("CoverLetter Generation Error: " . $e->getMessage());
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

    /**
     * Improve/rewrite text via SSE
     */
    public function improveText(Request $request)
    {
        $request->validate([
            'text' => 'required|string',
            'action' => 'required|in:improve,shorten,expand,formal,creative',
        ]);

        $text = $request->input('text');
        $action = $request->input('action');

        $actionPrompts = [
            'improve' => "Améliore et rends plus percutant ce texte de lettre de motivation :\n\n{$text}",
            'shorten' => "Raccourcis ce texte en gardant les points essentiels :\n\n{$text}",
            'expand' => "Développe et enrichis ce texte avec plus de détails et d'arguments :\n\n{$text}",
            'formal' => "Reformule ce texte dans un ton plus formel et professionnel :\n\n{$text}",
            'creative' => "Reformule ce texte de manière plus créative et originale :\n\n{$text}",
        ];

        return response()->stream(function () use ($actionPrompts, $action) {
            $messages = [
                ['role' => Role::system->value, 'content' => "Tu es un expert en rédaction de lettres de motivation. Tu reformules le texte fourni selon l'instruction. Retourne UNIQUEMENT le texte reformulé, sans explication ni markdown."],
                ['role' => Role::user->value, 'content' => $actionPrompts[$action]]
            ];

            try {
                $stream = $this->mistral->chat()->createStreamed(
                    messages: $messages,
                    model: 'mistral-large-latest',
                    temperature: 0.6,
                    maxTokens: 2000
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
                Log::error("CoverLetter Improve Error: " . $e->getMessage());
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

    /**
     * Correct grammar via SSE
     */
    public function correctGrammar(Request $request)
    {
        $request->validate([
            'text' => 'required|string',
        ]);

        $text = $request->input('text');

        return response()->stream(function () use ($text) {
            $messages = [
                ['role' => Role::system->value, 'content' => "Tu es un correcteur orthographique et grammatical expert. Corrige TOUTES les erreurs dans le texte fourni. Retourne UNIQUEMENT le texte corrigé, sans explication."],
                ['role' => Role::user->value, 'content' => "Corrige ce texte :\n\n{$text}"]
            ];

            try {
                $stream = $this->mistral->chat()->createStreamed(
                    messages: $messages,
                    model: 'mistral-large-latest',
                    temperature: 0.1,
                    maxTokens: 2000
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
                Log::error("CoverLetter Grammar Error: " . $e->getMessage());
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

    /**
     * Score the cover letter quality (real Mistral call)
     */
    public function score(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
            'jobDescription' => 'nullable|string'
        ]);

        $content = $request->input('content');
        $jobDescription = $request->input('jobDescription', '');

        $systemPrompt = "Tu es un expert en recrutement. Analyse cette lettre de motivation.";
        if ($jobDescription) {
            $systemPrompt .= " Description du poste : " . substr($jobDescription, 0, 1000);
        }

        $userPrompt = "Analyse cette lettre :\n\n{$content}\n\n" .
            "Réponds en JSON : {\"score\": 0-100, \"strengths\": [...], \"improvements\": [...], \"keywords_found\": [...], \"missing_keywords\": [...], \"tone_analysis\": \"...\", \"readability\": 0-100}\nJSON uniquement.";

        try {
            $response = $this->mistral->chat()->create(
                messages: [
                    ['role' => Role::system->value, 'content' => $systemPrompt],
                    ['role' => Role::user->value, 'content' => $userPrompt]
                ],
                model: 'mistral-large-latest',
                temperature: 0.2,
                maxTokens: 1000
            );

            $rawContent = $response->dto()->choices[0]->message->content;
            $result = json_decode($rawContent, true);

            return response()->json(array_merge([
                'score' => 0, 'strengths' => [], 'improvements' => [],
                'keywords_found' => [], 'missing_keywords' => [],
                'tone_analysis' => '', 'readability' => 0,
            ], $result ?? []));

        } catch (\Exception $e) {
            Log::error("CoverLetter Score Error: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Export cover letter as PDF
     */
    public function exportPdf(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
            'title' => 'nullable|string',
            'context' => 'nullable|array',
        ]);

        $content = $request->input('content');
        $title = $request->input('title', 'Lettre de motivation');
        $context = $request->input('context', []);

        try {
            $html = view('exports.cover-letter-export', [
                'content' => $content,
                'title' => $title,
                'company' => $context['company'] ?? '',
                'jobTitle' => $context['jobTitle'] ?? '',
                'recipient' => $context['recipient'] ?? '',
                'userName' => auth()->user()->name ?? 'Candidat',
                'date' => now()->format('d/m/Y'),
            ])->render();

            // Try WeasyPrint first, fallback to DomPDF
            try {
                $pdfContent = \App\Services\WeasyPrintService::html($html)->render();
            } catch (\Exception $e) {
                $pdf = Pdf::loadHTML($html)->setPaper('a4');
                $pdfContent = $pdf->output();
            }

            $slug = $context['company'] ? \Str::slug($context['company']) : 'export';
            $filename = "lettre-motivation-{$slug}.pdf";

            return response($pdfContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");

        } catch (\Exception $e) {
            Log::error("CoverLetter PDF Export: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Export cover letter as DOCX
     */
    public function exportDocx(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
            'title' => 'nullable|string',
            'context' => 'nullable|array',
        ]);

        $content = $request->input('content');
        $context = $request->input('context', []);

        try {
            $phpWord = new PhpWord();
            $phpWord->setDefaultFontName('Calibri');
            $phpWord->setDefaultFontSize(11);

            $section = $phpWord->addSection([
                'pageSizeW' => \PhpOffice\PhpWord\Shared\Converter::cmToTwip(21),
                'pageSizeH' => \PhpOffice\PhpWord\Shared\Converter::cmToTwip(29.7),
                'marginTop' => \PhpOffice\PhpWord\Shared\Converter::cmToTwip(2.5),
                'marginBottom' => \PhpOffice\PhpWord\Shared\Converter::cmToTwip(2.5),
                'marginLeft' => \PhpOffice\PhpWord\Shared\Converter::cmToTwip(2.5),
                'marginRight' => \PhpOffice\PhpWord\Shared\Converter::cmToTwip(2.5),
            ]);

            // Sender
            $userName = auth()->user()->name ?? 'Candidat';
            $section->addText($userName, ['bold' => true, 'size' => 12, 'name' => 'Calibri']);
            $section->addTextBreak();

            // Recipient & Company
            if (!empty($context['recipient'])) {
                $section->addText($context['recipient'], ['size' => 11]);
            }
            if (!empty($context['company'])) {
                $section->addText($context['company'], ['size' => 11, 'bold' => true]);
            }
            $section->addTextBreak();
            $section->addText(now()->format('d/m/Y'), ['size' => 10, 'italic' => true, 'color' => '666666']);
            $section->addTextBreak();

            // Subject line
            if (!empty($context['jobTitle'])) {
                $section->addText(
                    'Objet : Candidature au poste de ' . $context['jobTitle'],
                    ['bold' => true, 'size' => 11]
                );
                $section->addTextBreak();
            }

            // Parse HTML content to plain text paragraphs
            $this->addHtmlContent($section, $content);

            $temp = tempnam(sys_get_temp_dir(), 'cl_');
            $phpWord->save($temp, 'Word2007');

            $slug = $context['company'] ? \Str::slug($context['company']) : 'export';
            return response()->download($temp, "lettre-motivation-{$slug}.docx")->deleteFileAfterSend();

        } catch (\Exception $e) {
            Log::error("CoverLetter DOCX Export: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Parse HTML content and add to PhpWord section
     */
    private function addHtmlContent($section, $html)
    {
        $html = str_replace(['<br/>', '<br>', '<br />', '</p><p>', '</p>'], "\n", $html);
        $html = str_replace(['<p>', '<div>', '</div>'], '', $html);
        $paragraphs = explode("\n", strip_tags($html));

        foreach ($paragraphs as $paragraph) {
            $paragraph = trim($paragraph);
            if (empty($paragraph)) {
                $section->addTextBreak();
                continue;
            }
            $section->addText(
                htmlspecialchars_decode($paragraph, ENT_QUOTES),
                ['size' => 11, 'name' => 'Calibri'],
                ['lineSpacing' => 1.5, 'spaceAfter' => 120]
            );
        }
    }

    /**
     * System prompt for full letter generation
     */
    private function getFullLetterSystemPrompt($tone = 'professional')
    {
        $toneMap = [
            'professional' => 'professionnel, structuré et formel',
            'creative' => 'créatif, original et dynamique tout en restant professionnel',
            'confident' => 'confiant, assertif, démontrant une forte valeur ajoutée',
            'humble' => 'humble et respectueux tout en mettant en avant les compétences',
        ];

        $toneDesc = $toneMap[$tone] ?? $toneMap['professional'];

        return "Tu es un expert en rédaction de lettres de motivation avec 15 ans d'expérience.

RÈGLES :
1. Rédige une lettre COMPLÈTE et prête à envoyer
2. Ton : {$toneDesc}
3. Entre 250 et 400 mots
4. Structure : Accroche → Pourquoi cette entreprise → Compétences et réalisations → Conclusion avec call to action
5. Personnalise pour l'entreprise et le poste
6. PAS de markdown (pas de ** ni #)
7. Commence par la formule d'appel
8. Termine par une formule de politesse et la signature
9. Écris directement la lettre, sans commentaire";
    }

    /**
     * Build prompt for generation
     */
    private function buildPrompt($section, $context, $tone)
    {
        $userName = $context['name'] ?? auth()->user()->name ?? 'Candidat';
        $company = $context['company'] ?? "l'entreprise";
        $jobTitle = $context['jobTitle'] ?? 'le poste';
        $recipient = $context['recipient'] ?? '';
        $jobDescription = $context['jobDescription'] ?? '';
        $skills = is_array($context['skills'] ?? null) ? implode(', ', $context['skills']) : ($context['skills'] ?? '');
        $keyPoints = $context['key_points'] ?? '';

        if ($section === 'full_letter') {
            $prompt = "Rédige une lettre de motivation pour le poste de {$jobTitle} chez {$company}.\n";
            if ($recipient) $prompt .= "Destinataire : {$recipient}\n";
            $prompt .= "Candidat : {$userName}\n";
            if ($jobDescription) $prompt .= "\nDescription du poste :\n{$jobDescription}\n";
            if ($skills) $prompt .= "\nCompétences clés : {$skills}\n";
            if ($keyPoints) $prompt .= "\nPoints spécifiques : {$keyPoints}\n";
            $prompt .= "\nTon : {$tone}";
            return $prompt;
        }

        return match($section) {
            'greeting' => "Formule d'appel pour {$company}." . ($recipient ? " Destinataire : {$recipient}." : ''),
            'intro' => "Paragraphe d'introduction pour {$jobTitle} chez {$company}. Ton : {$tone}.",
            'body' => "Corps principal, compétences : {$skills}. Poste : {$jobTitle}.",
            'conclusion' => "Conclusion forte pour {$company} avec demande d'entretien.",
            default => "Section '{$section}' de lettre de motivation.",
        };
    }
}
