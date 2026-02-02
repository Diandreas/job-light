<?php

namespace App\Http\Controllers\CareerAdvisor;

use App\Http\Controllers\Controller;
use App\Http\Requests\CareerAdvisor\AnalyzeCVRequest;
use App\Models\Experience;
use App\Models\ExperienceCategory;
use App\Models\Reference;
use App\Models\Summary;
use App\Models\User;
use App\Services\AI\MistralClient;
use App\Services\Billing\WalletService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpWord\IOFactory;
use Smalot\PdfParser\Parser;

class CVAnalysisController extends Controller
{
    protected MistralClient $mistralClient;
    protected WalletService $walletService;

    private const ANALYSIS_COST = 5;

    public function __construct(MistralClient $mistralClient, WalletService $walletService)
    {
        $this->mistralClient = $mistralClient;
        $this->walletService = $walletService;
    }

    public function analyze(AnalyzeCVRequest $request)
    {
        try {
            $user = auth()->user();

            if (!$this->walletService->canAfford($user, self::ANALYSIS_COST)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Solde insuffisant',
                ], 400);
            }

            $text = $this->extractTextFromFile($request->file('cv'));

            // Use JSON mode for structured response
            $messages = [
                MistralClient::system($this->getSystemPrompt()),
                MistralClient::user($text),
            ];

            $result = $this->mistralClient->chatJSON(
                messages: $messages,
                model: 'mistral-large-latest',
                temperature: 0.2,
                maxTokens: 2000,
            );

            $cvData = $result['data'];
            $savedData = $this->saveCVData($user->id, $cvData);

            // Debit AFTER success
            $this->walletService->debit($user, 'cv-analysis', self::ANALYSIS_COST);

            return response()->json([
                'success' => true,
                'cvData' => $cvData,
                'savedData' => $savedData,
                'balance' => $this->walletService->getBalance($user),
            ]);
        } catch (\Exception $e) {
            Log::error('CV analysis error: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'analyse du CV: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function extractTextFromFile($file): string
    {
        $extension = strtolower($file->getClientOriginalExtension());

        if ($extension === 'pdf') {
            $parser = new Parser();
            $pdf = $parser->parseFile($file->path());
            return $pdf->getText();
        }

        if (in_array($extension, ['doc', 'docx'])) {
            $phpWord = IOFactory::load($file->path());
            $text = '';
            foreach ($phpWord->getSections() as $section) {
                foreach ($section->getElements() as $element) {
                    if ($element instanceof \PhpOffice\PhpWord\Element\Text) {
                        $text .= $element->getText() . "\n";
                    } elseif (method_exists($element, 'getText')) {
                        $text .= $element->getText() . "\n";
                    }
                }
            }
            return $text;
        }

        throw new \Exception('Format de fichier non supporté');
    }

    private function getSystemPrompt(): string
    {
        return <<<'EOT'
Tu es un expert en analyse de CV. Tu feras en fonction de la langue que tu vas identifier. IMPORTANT: Tu dois analyser le texte fourni et retourner UNIQUEMENT un objet JSON valide suivant EXACTEMENT cette structure:
{
    "nom_complet": "string",
    "contact": {
        "telephone": "string",
        "adresse": "string",
        "github": "string",
        "linkedin": "string"
    },
    "resume": "string (200 mots max)",
    "experiences": [
        {
            "titre": "string",
            "entreprise": "string",
            "date_debut": "string (YYYY-MM)",
            "date_fin": "string (YYYY-MM ou 'present')",
            "categorie": "string (academique, professionnel, ou recherche)",
            "description": "string",
            "output": "string",
            "comment": "string",
            "references": [
                {
                    "name": "string",
                    "function": "string",
                    "email": "string",
                    "telephone": "string"
                }
            ]
        }
    ],
    "competences": ["string"],
    "hobbies": ["string"],
    "formation": "string"
}

RÈGLES: Retourne UNIQUEMENT le JSON. Format dates: YYYY-MM. Catégories: academique, professionnel, recherche. Max 5 compétences et 5 hobbies.
EOT;
    }

    private function saveCVData(int $userId, array $cvData): array
    {
        DB::beginTransaction();
        try {
            $user = User::find($userId);
            $user->update([
                'name' => $cvData['nom_complet'] ?? $user->name,
                'phone_number' => $cvData['contact']['telephone'] ?? $user->phone_number,
                'address' => $cvData['contact']['adresse'] ?? $user->address,
                'github' => $cvData['contact']['github'] ?? $user->github,
                'linkedin' => $cvData['contact']['linkedin'] ?? $user->linkedin,
            ]);

            if (!empty($cvData['formation'])) {
                $user->update(['full_profession' => $cvData['formation']]);
            }

            if (!empty($cvData['resume'])) {
                $summary = Summary::create([
                    'name' => 'Profil',
                    'description' => $cvData['resume'],
                ]);
                $user->summaries()->attach($summary->id);
                $user->selected_summary_id = $summary->id;
                $user->save();
            }

            if (!empty($cvData['competences'])) {
                $manualCompetences = $user->manual_competences ?? [];
                foreach ($cvData['competences'] as $competenceName) {
                    if (empty($competenceName)) continue;
                    $manualCompetences[] = [
                        'id' => 'manual-' . uniqid(),
                        'name' => $competenceName,
                        'name_en' => $competenceName,
                        'description' => '',
                        'is_manual' => true,
                    ];
                }
                $user->manual_competences = $manualCompetences;
                $user->save();
            }

            if (!empty($cvData['hobbies'])) {
                $manualHobbies = $user->manual_hobbies ?? [];
                foreach ($cvData['hobbies'] as $hobbyName) {
                    if (empty($hobbyName)) continue;
                    $manualHobbies[] = [
                        'id' => 'manual-' . uniqid(),
                        'name' => $hobbyName,
                        'name_en' => $hobbyName,
                        'is_manual' => true,
                    ];
                }
                $user->manual_hobbies = $manualHobbies;
                $user->save();
            }

            $savedExperiences = [];
            foreach ($cvData['experiences'] ?? [] as $exp) {
                $dateStart = $this->formatDate($exp['date_debut'] ?? '');
                $dateEnd = ($exp['date_fin'] ?? '') === 'present' ? null : $this->formatDate($exp['date_fin'] ?? '');

                $experience = Experience::create([
                    'name' => $exp['titre'],
                    'InstitutionName' => $exp['entreprise'],
                    'date_start' => $dateStart,
                    'date_end' => $dateEnd,
                    'description' => $exp['description'] ?? '',
                    'output' => $exp['output'] ?? '',
                    'comment' => $exp['comment'] ?? '',
                    'experience_categories_id' => $this->getExperienceCategoryId($exp['categorie'] ?? 'professionnel'),
                ]);

                $user->experiences()->attach($experience->id);

                if (!empty($exp['references'])) {
                    foreach ($exp['references'] as $ref) {
                        $reference = Reference::create([
                            'name' => $ref['name'],
                            'function' => $ref['function'],
                            'email' => $ref['email'] ?? '',
                            'telephone' => $ref['telephone'] ?? '',
                        ]);
                        $experience->references()->attach($reference->id);
                    }
                }

                $savedExperiences[] = $experience;
            }

            DB::commit();

            return [
                'user' => $user->fresh(['experiences.references', 'summaries']),
                'experiences' => $savedExperiences,
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception('Erreur lors de l\'enregistrement des données: ' . $e->getMessage());
        }
    }

    private function formatDate(string $date): ?string
    {
        if (empty($date)) return null;
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) return $date;
        if (preg_match('/^\d{4}-\d{2}$/', $date)) return $date . '-01';
        return null;
    }

    private function getExperienceCategoryId(string $categoryName): int
    {
        return match ($categoryName) {
            'professionnel' => 1,
            'academique' => 2,
            'recherche' => 3,
            default => 1,
        };
    }
}
