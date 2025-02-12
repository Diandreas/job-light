<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ChatHistory;
use App\Models\DocumentExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use HelgeSverre\Mistral\Mistral;
use HelgeSverre\Mistral\Enums\Model;
use HelgeSverre\Mistral\Enums\Role;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use Barryvdh\DomPDF\Facade\Pdf;

class CareerAdvisorController extends Controller
{
    protected $mistral;
    protected $maxHistory = 10;
    protected $currentServiceId;

    public function __construct()
    {
        $this->mistral = new Mistral(apiKey: config('mistral.api_key'));
    }

    public function index()
    {
        $user = auth()->user();
        $userInfo = $this->getUserRelevantInfo($user);

        // Récupérer toutes les conversations de l'utilisateur
        $chatHistories = ChatHistory::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($chat) {
                return [
                    'id' => $chat->id,
                    'context_id' => $chat->context_id,
                    'service_id' => $chat->service_id,
                    'created_at' => $chat->created_at,
                    'messages' => json_decode($chat->messages),
                ];
            });

        return Inertia::render('CareerAdvisor/Index', [
            'userInfo' => $userInfo,
            'chatHistories' => $chatHistories,
            'chatHistory' => $chatHistories->first() // Pour la compatibilité avec le code existant
        ]);
    }

    public function export(Request $request)
    {
        try {
            $validated = $request->validate([
                'contextId' => 'required|string',
                'format' => 'required|in:pdf,docx'
            ]);

            // Récupérer la conversation depuis la BD
            $chatHistory = ChatHistory::where('context_id', $validated['contextId'])
                ->where('user_id', auth()->id())
                ->firstOrFail();

            $messages = json_decode($chatHistory->messages, true);
            $title = $this->getExportTitle($chatHistory->service_id);

            if ($validated['format'] === 'pdf') {
                $pdf = Pdf::loadView('exports.chat', [
                    'title' => $title,
                    'content' => $messages,
                    'date' => $chatHistory->created_at->format('d/m/Y H:i'),
                    'service' => $this->getServiceName($chatHistory->service_id)
                ]);

                return $pdf->download("conversation-{$chatHistory->context_id}.pdf");
            }

            $phpWord = new PhpWord();
            $section = $phpWord->addSection();

            // Ajouter les métadonnées
            $section->addText($title, ['bold' => true, 'size' => 16]);
            $section->addText('Date: ' . $chatHistory->created_at->format('d/m/Y H:i'));
            $section->addText('Service: ' . $this->getServiceName($chatHistory->service_id));
            $section->addTextBreak();

            foreach ($messages as $message) {
                $section->addText(
                    $message['role'] === 'user' ? 'Vous:' : 'Assistant:',
                    ['bold' => true]
                );
                $section->addText($message['content']);
                $section->addTextBreak();
            }

            $temp = tempnam(sys_get_temp_dir(), 'doc');
            $phpWord->save($temp, 'Word2007');

            return response()->download(
                $temp,
                "conversation-{$chatHistory->context_id}.docx"
            )->deleteFileAfterSend();

        } catch (\Exception $e) {
            Log::error('Export error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Supprimer une conversation
     */
    public function destroyChat($contextId)
    {
        try {
            $chat = ChatHistory::where('context_id', $contextId)
                ->where('user_id', auth()->id())
                ->firstOrFail();

            $chat->delete();

            return response()->json([
                'message' => 'Conversation supprimée avec succès'
            ]);
        } catch (\Exception $e) {
            Log::error('Delete chat error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la suppression de la conversation'
            ], 500);
        }
    }

    /**
     * Obtenir la liste des conversations de l'utilisateur
     */
    public function getUserChats()
    {
        $chats = ChatHistory::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($chat) {
                return [
                    'id' => $chat->id,
                    'context_id' => $chat->context_id,
                    'service_id' => $chat->service_id,
                    'created_at' => $chat->created_at,
                    'preview' => $this->getChatPreview($chat->messages)
                ];
            });

        return response()->json($chats);
    }

    private function getChatPreview($messages)
    {
        $messages = json_decode($messages, true);
        if (empty($messages)) {
            return 'Conversation vide';
        }

        // Retourner le premier message de l'utilisateur
        foreach ($messages as $message) {
            if ($message['role'] === 'user') {
                return mb_substr($message['content'], 0, 100) . '...';
            }
        }

        return 'Aperçu non disponible';
    }

    private function getServiceName($serviceId)
    {
        return [
            'interview-prep' => 'Simulation d\'entretien',
            'cover-letter' => 'Lettre de motivation',
            'resume-review' => 'Analyse de CV',
            'career-advice' => 'Conseil carrière'
        ][$serviceId] ?? 'Service inconnu';
    }
    private function getModelConfigForService($serviceId)
    {
        $configs = [
            'interview-prep' => [
                'model' => 'mistral-small-latest',
                'maxTokens' => 500,
                'temperature' => 0.8,
                'maxHistory' => 10
            ],
            'cover-letter' => [
                'model' => 'mistral-large-latest',
                'maxTokens' => 2000,
                'temperature' => 0.7,
                'maxHistory' => 3
            ],
            'career-advice' => [
                'model' => 'mistral-medium-latest',
                'maxTokens' => 1000,
                'temperature' => 0.7,
                'maxHistory' => 3
            ],
            'resume-review' => [
                'model' => 'mistral-medium-latest',
                'maxTokens' => 1000,
                'temperature' => 0.7,
                'maxHistory' => 3
            ]
        ];

        return $configs[$serviceId] ?? $configs['career-advice'];
    }

    public function chat(Request $request)
    {
        try {
            $validated = $request->validate([
                'message' => 'required|string',
                'contextId' => 'required|string',
                'language' => 'required|string|in:fr,en',
                'serviceId' => 'required|string',
                'history' => 'array'
            ]);

            $user = auth()->user();
            $userInfo = $this->getUserRelevantInfo($user);
            $config = $this->getModelConfigForService($validated['serviceId']);

            // Définir le service_id pour saveHistory
            $this->currentServiceId = $validated['serviceId'];

            $messages = [
                [
                    'role' => Role::system->value,
                    'content' => $this->getSystemPrompt($validated['language'], $validated['serviceId'])
                ]
            ];

            if (!empty($validated['history'])) {
                foreach ($validated['history'] as $msg) {
                    $messages[] = [
                        'role' => $msg['role'],
                        'content' => $msg['content']
                    ];
                }
            }

            $messages[] = [
                'role' => Role::user->value,
                'content' => $this->buildPrompt(
                    $validated['message'],
                    $validated['language'],
                    $validated['serviceId'],
                    $userInfo
                )
            ];

            $response = $this->mistral->chat()->create(
                messages: $messages,
                model: $config['model'],
                temperature: $config['temperature'],
                maxTokens: $config['maxTokens'],
                safeMode: true
            );

            $dto = $response->dto();
            $aiResponse = $dto->choices[0]->message->content;
            $tokensUsed = $dto->usage->totalTokens ?? 0;

            // Sauvegarder l'historique avec tous les champs nécessaires
            $this->saveHistory(
                $user->id,
                $validated['contextId'],
                $validated['message'],
                $aiResponse,
                $config['maxHistory'],
                $tokensUsed
            );

            return response()->json([
                'message' => $aiResponse,
                'tokens' => $tokensUsed
            ]);

        } catch (\Exception $e) {
            Log::error('Career advisor error: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Une erreur est survenue lors du traitement de votre demande'
            ], 500);
        }
    }

    private function getSystemPrompt($language, $serviceId)
    {
        $prompts = [
            'interview-prep' => [
                'fr' => "Vous êtes un recruteur expérimenté conduisant un entretien d'embauche.
                        Posez des questions pertinentes et donnez des retours constructifs.
                        Gardez un ton professionnel mais conversationnel.
                        Adaptez vos questions en fonction des réponses précédentes.
                        Maximum 10 échanges pour simuler un véritable entretien.",
                'en' => "You are an experienced recruiter conducting a job interview.
                        Ask relevant questions and provide constructive feedback.
                        Keep a professional but conversational tone.
                        Adapt your questions based on previous answers.
                        Maximum 10 exchanges to simulate a real interview."
            ],
            'cover-letter' => [
                'fr' => "Vous êtes un expert en rédaction de lettres de motivation.
                        Créez des contenus personnalisés, persuasifs et professionnels.
                        Mettez en valeur les compétences pertinentes et l'adéquation avec le poste.
                        Adaptez le style et le ton au secteur d'activité.",
                'en' => "You are an expert in writing cover letters.
                        Create personalized, persuasive, and professional content.
                        Highlight relevant skills and job fit.
                        Adapt style and tone to the industry."
            ],
            'resume-review' => [
                'fr' => "Vous êtes un expert en optimisation de CV.
                        Analysez le CV et suggérez des améliorations concrètes.
                        Concentrez-vous sur la mise en valeur des compétences clés.
                        Donnez des exemples spécifiques.",
                'en' => "You are an expert in resume optimization.
                        Analyze the resume and suggest concrete improvements.
                        Focus on highlighting key skills.
                        Provide specific examples."
            ],
            'default' => [
                'fr' => "Vous êtes un conseiller professionnel expert.
                        Donnez des conseils pratiques et applicables.
                        Adaptez vos recommandations au profil et au secteur.",
                'en' => "You are an expert career advisor.
                        Provide practical and actionable advice.
                        Adapt recommendations to profile and industry."
            ]
        ];

        return $prompts[$serviceId][$language] ?? $prompts['default'][$language];
    }

    private function buildPrompt($message, $language, $serviceId, $userInfo)
    {
        $context = json_encode($userInfo, JSON_PRETTY_PRINT);
        return "Profil :\n{$context}\n\nMessage : {$message}";
    }

    private function saveHistory($userId, $contextId, $userMessage, $aiResponse, $maxHistory = 3, $tokensUsed = 0)
    {
        try {
            $chatHistory = ChatHistory::firstOrNew([
                'user_id' => $userId,
                'context_id' => $contextId
            ]);

            // Décodage des messages existants
            $messages = is_string($chatHistory->messages)
                ? json_decode($chatHistory->messages, true) ?? []
                : [];

            // Ajout des nouveaux messages
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

            // Limiter l'historique
            $messages = array_slice($messages, -($maxHistory * 2));

            // Remplir tous les champs requis
            $chatHistory->fill([
                'user_id' => $userId,
                'context_id' => $contextId,
                'messages' => json_encode($messages, JSON_THROW_ON_ERROR),
                'service_id' => $this->currentServiceId,
                'tokens_used' => $tokensUsed,
            ]);

            $chatHistory->save();

            Log::info('Chat history saved successfully', [
                'user_id' => $userId,
                'context_id' => $contextId,
                'messages_count' => count($messages)
            ]);

        } catch (\Exception $e) {
            Log::error('Error saving chat history', [
                'error' => $e->getMessage(),
                'user_id' => $userId,
                'context_id' => $contextId
            ]);
            throw $e;
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

    private function getExportTitle($serviceId)
    {
        return [
            'interview-prep' => 'Simulation d\'entretien',
            'cover-letter' => 'Lettre de motivation',
            'resume-review' => 'Analyse de CV',
            'default' => 'Conseil carrière'
        ][$serviceId] ?? 'Document Guidy';
    }

    private function formatContent($messages, $serviceId)
    {
        return array_map(function($message) {
            return [
                'role' => $message['role'],
                'content' => $message['content'],
                'timestamp' => $message['timestamp'] ?? now()->toDateTimeString()
            ];
        }, $messages);
    }
}
