<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ChatHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use HelgeSverre\Mistral\Mistral;
use HelgeSverre\Mistral\Enums\Model;
use HelgeSverre\Mistral\Enums\Role;
use Inertia\Inertia;

class CareerAdvisorController extends Controller
{
    protected $mistral;
    protected $maxHistory = 3;

    public function __construct()
    {
        $this->mistral = new Mistral(apiKey: config('mistral.api_key'));
    }

    public function index()
    {
        $user = auth()->user();
        $userInfo = $this->getUserRelevantInfo($user);
        $chatHistory = ChatHistory::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->first();

        return Inertia::render('CareerAdvisor/Index', [
            'userInfo' => $userInfo,
            'chatHistory' => $chatHistory ? [
                'messages' => json_decode($chatHistory->messages),
                'contextId' => $chatHistory->context_id
            ] : null
        ]);
    }
    public function export(Request $request)
    {
        try {
            $validated = $request->validate([
                'contextId' => 'required|string',
                'format' => 'required|string|in:pdf,docx',
                'serviceId' => 'required|string'
            ]);

            // Récupérer l'historique de chat
            $chatHistory = ChatHistory::where('context_id', $validated['contextId'])
                ->where('user_id', auth()->id())
                ->firstOrFail();

            $messages = json_decode($chatHistory->messages, true);

            // Construire le contenu du document
            $content = "";
            foreach ($messages as $message) {
                $content .= ($message['role'] === 'user' ? "Question: " : "Réponse: ") . "\n";
                $content .= $message['content'] . "\n\n";
            }

            if ($validated['format'] === 'pdf') {
                $pdf = Pdf::loadView('exports.chat', [
                    'content' => $content,
                    'title' => 'Historique de conversation'
                ]);

                return $pdf->download('conversation.pdf');
            } else {
                // Pour le format DOCX, utilisez PhpWord
                $phpWord = new \PhpOffice\PhpWord\PhpWord();
                $section = $phpWord->addSection();

                $section->addTitle('Historique de conversation', 1);
                $section->addText($content);

                $objWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');

                $temp_file = tempnam(sys_get_temp_dir(), 'chat_');
                $objWriter->save($temp_file);

                return response()->download($temp_file, 'conversation.docx')
                    ->deleteFileAfterSend(true);
            }
        } catch (\Exception $e) {
            Log::error('Export error: ' . $e->getMessage());
            return response()->json(['error' => 'Une erreur est survenue lors de l\'export'], 500);
        }
    }
    public function chat(Request $request)
    {
        try {
            // Valider la requête
            $validated = $request->validate([
                'message' => 'required|string',
                'contextId' => 'required|string',
                'language' => 'required|string|in:fr,en',
                'serviceId' => 'required|string',
                'history' => 'array'
            ]);

            $user = auth()->user();
            $userInfo = $this->getUserRelevantInfo($user);

            // Préparer les messages
            $messages = [];
            $messages[] = [
                'role' => Role::system->value,
                'content' => $this->getSystemPrompt($validated['language'])
            ];

            // Ajouter l'historique si présent
            if (!empty($validated['history'])) {
                foreach ($validated['history'] as $msg) {
                    $messages[] = [
                        'role' => $msg['role'],
                        'content' => $msg['content']
                    ];
                }
            }

            // Ajouter le message actuel
            $messages[] = [
                'role' => Role::user->value,
                'content' => $this->buildPrompt(
                    $validated['message'],
                    $validated['language'],
                    $validated['serviceId'],
                    $userInfo
                )
            ];

            // Appeler l'API Mistral
            $response = $this->mistral->chat()->create(
                messages: $messages,
                model: Model::large->value,
                temperature: 0.7,
                maxTokens: 1000,
                safeMode: true
            );

            $dto = $response->dto();
            $aiResponse = $dto->choices[0]->message->content;

            // Sauvegarder l'historique
            $this->saveHistory(
                $user->id,
                $validated['contextId'],
                $validated['message'],
                $aiResponse
            );

            return response()->json([
                'message' => $aiResponse,
                'tokens' => $dto->usage->totalTokens ?? 0
            ]);

        } catch (\Exception $e) {
            Log::error('Career advisor error: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Une erreur est survenue lors du traitement de votre demande'
            ], 500);
        }
    }

    private function getSystemPrompt($language)
    {
        $prompts = [
            'fr' => "Vous êtes un conseiller professionnel expert. Votre rôle est d'aider les utilisateurs dans leur développement de carrière.
                    Répondez de manière claire, structurée et bienveillante en français.
                    Donnez des conseils pratiques et applicables.",
            'en' => "You are an expert career advisor. Your role is to help users in their career development.
                    Respond clearly, in a structured and supportive way in English.
                    Provide practical and actionable advice."
        ];

        return $prompts[$language];
    }

    private function buildPrompt($message, $language, $serviceId, $userInfo)
    {
        $prompts = [
            'career-advice' => [
                'fr' => "Conseils de carrière pour le profil suivant :",
                'en' => "Career advice for the following profile:"
            ],
            'interview-prep' => [
                'fr' => "Préparation d'entretien pour le profil suivant :",
                'en' => "Interview preparation for the following profile:"
            ]
        ];

        $basePrompt = $prompts[$serviceId][$language] ?? $prompts['career-advice'][$language];
        $profileInfo = json_encode($userInfo, JSON_PRETTY_PRINT);

        return "{$basePrompt}\n\nProfil:\n{$profileInfo}\n\nQuestion: {$message}";
    }

    private function saveHistory($userId, $contextId, $userMessage, $aiResponse)
    {
        try {
            $chatHistory = ChatHistory::firstOrNew([
                'user_id' => $userId,
                'context_id' => $contextId
            ]);

            $messages = json_decode($chatHistory->messages ?? '[]', true);
            $messages[] = [
                'role' => 'user',
                'content' => $userMessage,
                'timestamp' => now()->toIso8601String()
            ];
            $messages[] = [
                'role' => 'assistant',
                'content' => $aiResponse,
                'timestamp' => now()->toIso8601String()
            ];

            $messages = array_slice($messages, -($this->maxHistory * 2));

            $chatHistory->messages = json_encode($messages);
            $chatHistory->save();
        } catch (\Exception $e) {
            Log::error('Error saving chat history: ' . $e->getMessage());
        }
    }

    private function getUserRelevantInfo($user)
    {
        return [
            'name' => $user->name,
            'profession' => $user->profession?->name ?? 'Non spécifié',
            'experiences' => $user->experiences()
                ->orderBy('date_start', 'desc')
                ->take(3)
                ->get()
                ->map(fn($exp) => [
                    'title' => $exp->name,
                    'company' => $exp->InstitutionName,
                    'duration' => $exp->date_start . ' - ' . ($exp->date_end ?? 'Present')
                ])->toArray(),
            'competences' => $user->competences()
                ->take(5)
                ->pluck('name')
                ->toArray()
        ];
    }



    private function generatePdf($messages, $serviceId)
    {
        $content = $this->formatContent($messages, $serviceId);

        $pdf = PDF::loadView('exports.chat', [
            'content' => $content,
            'title' => 'Document généré par Assistant Guidy',
            'date' => now()->format('d/m/Y H:i')
        ]);

        return $pdf->download('document-guidy.pdf');
    }

    private function generateDocx($messages, $serviceId)
    {
        $phpWord = new PhpWord();
        $section = $phpWord->addSection();

        // Add title
        $section->addText(
            'Document généré par Assistant Guidy',
            ['bold' => true, 'size' => 16],
            ['alignment' => 'center', 'spaceAfter' => 400]
        );

        // Add date
        $section->addText(
            'Date: ' . now()->format('d/m/Y H:i'),
            ['size' => 10],
            ['alignment' => 'right', 'spaceAfter' => 400]
        );

        foreach ($messages as $message) {
            $section->addText(
                ($message['role'] === 'user' ? 'Question:' : 'Réponse:'),
                ['bold' => true],
                ['spaceAfter' => 0]
            );
            $section->addText(
                $message['content'],
                [],
                ['spaceAfter' => 200]
            );
        }

        $filename = storage_path('app/public/temp/' . uniqid() . '.docx');
        $objWriter = IOFactory::createWriter($phpWord, 'Word2007');
        $objWriter->save($filename);

        return response()->download($filename)->deleteFileAfterSend(true);
    }

    private function formatContent($messages, $serviceId)
    {
        $content = [];

        foreach ($messages as $message) {
            $content[] = [
                'role' => $message['role'],
                'content' => $message['content'],
                'timestamp' => $message['timestamp'] ?? now()->toDateTimeString()
            ];
        }

        return $content;
    }
}
