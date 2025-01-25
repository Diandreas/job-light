<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ChatHistory;
use App\Models\DocumentExport;
use App\Services\AIService;
use App\Services\DocumentGenerator;
use Illuminate\Http\Request;
use Inertia\Inertia;
use HelgeSverre\Mistral\Mistral;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CareerAdvisorController extends Controller
{
    protected $mistral;
    protected $aiService;
    protected $documentGenerator;
    protected $maxHistory = 3;

    public function __construct(
        Mistral $mistral,
        AIService $aiService,
        DocumentGenerator $documentGenerator
    ) {
        $this->mistral = $mistral;
        $this->aiService = $aiService;
        $this->documentGenerator = $documentGenerator;
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

    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'contextId' => 'required|string',
            'language' => 'required|string|in:fr,en',
            'serviceId' => 'required|string',
            'history' => 'array'
        ]);

        $user = auth()->user();
        $userInfo = $this->getUserRelevantInfo($user);

        try {
            // Construire le contexte
            $context = [
                'user_info' => $userInfo,
                'language' => $request->language,
                'service_id' => $request->serviceId,
                'history' => array_slice($request->history ?? [], -$this->maxHistory)
            ];

            // Obtenir la réponse de l'IA
            $response = $this->aiService->getResponse($request->message, $context);

            // Sauvegarder l'historique
            $this->saveHistory($user->id, $request->contextId, $request->message, $response);

            return response()->json([
                'message' => $response['content'],
                'tokens' => $response['tokens']
            ]);

        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'error' => 'Une erreur est survenue lors du traitement de votre demande'
            ], 500);
        }
    }

    public function export(Request $request)
    {
        $request->validate([
            'contextId' => 'required|string',
            'format' => 'required|string|in:pdf,docx',
            'serviceId' => 'required|string'
        ]);

        try {
            $chatHistory = ChatHistory::where('context_id', $request->contextId)
                ->firstOrFail();

            $content = json_decode($chatHistory->messages, true);
            $format = $request->format;

            // Générer le document
            $document = $this->documentGenerator->generate(
                $content,
                $format,
                $request->serviceId
            );

            // Sauvegarder l'export
            $fileName = Str::random(40) . '.' . $format;
            Storage::put("exports/{$fileName}", $document);

            DocumentExport::create([
                'user_id' => auth()->id(),
                'chat_history_id' => $chatHistory->id,
                'file_path' => $fileName,
                'format' => $format
            ]);

            // Retourner le fichier
            return response()->streamDownload(function() use ($document) {
                echo $document;
            }, "career_document.{$format}");

        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'error' => 'Erreur lors de l\'export du document'
            ], 500);
        }
    }

    private function saveHistory($userId, $contextId, $userMessage, $aiResponse)
    {
        $chatHistory = ChatHistory::firstOrNew([
            'user_id' => $userId,
            'context_id' => $contextId
        ]);

        $messages = json_decode($chatHistory->messages ?? '[]', true);
        $messages[] = [
            'role' => 'user',
            'content' => $userMessage,
            'timestamp' => now()
        ];
        $messages[] = [
            'role' => 'assistant',
            'content' => $aiResponse['content'],
            'timestamp' => now()
        ];

        // Garder seulement les 3 derniers échanges
        $messages = array_slice($messages, -($this->maxHistory * 2));

        $chatHistory->messages = json_encode($messages);
        $chatHistory->save();
    }

    private function getUserRelevantInfo(User $user)
    {
        return [
            'name' => $user->name,
            'profession' => $user->profession?->name,
            'experiences' => $user->experiences->map(function ($experience) {
                return [
                    'title' => $experience->name,
                    'company' => $experience->InstitutionName,
                    'duration' => $experience->date_start . ' - ' . ($experience->date_end ?? 'Present'),
                    'description' => $experience->description
                ];
            }),
            'competences' => $user->competences->pluck('name'),
            'education' => $user->experiences
                ->where('experience_categories_id', 2)
                ->map(function ($education) {
                    return [
                        'degree' => $education->name,
                        'institution' => $education->InstitutionName,
                        'year' => $education->date_end,
                        'field' => $education->field
                    ];
                }),
            'languages' => $user->languages ? $user->languages->map(function ($language) {
                return [
                    'name' => $language->name,
                    'level' => $language->pivot->level
                ];
            }) : [],
        ];
    }
}
