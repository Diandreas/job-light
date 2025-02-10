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

            $this->saveHistory(
                $user->id,
                $validated['contextId'],
                $validated['message'],
                $aiResponse,
                $config['maxHistory']
            );

            return response()->json([
                'message' => $aiResponse,
                'tokens' => $dto->usage->totalTokens ?? 0
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

    public function export(Request $request)
    {
        // Log de départ
        Log::channel('daily')->info('Export started', ['request' => $request->all()]);

        try {
            $validated = $request->validate([
                'contextId' => 'required|string',
                'format' => 'required|string|in:pdf,docx',
                'serviceId' => 'required|string'
            ]);

            Log::channel('daily')->info('Validation passed', $validated);

            // Vérifier le répertoire storage
            $exportPath = storage_path('app/public/exports');
            if (!file_exists($exportPath)) {
                mkdir($exportPath, 0755, true);
            }

            // Test écriture fichier simple
            $testFile = $exportPath . '/test.txt';
            file_put_contents($testFile, 'Test export');

            if (!file_exists($testFile)) {
                throw new \Exception('Cannot write to export directory');
            }

            // Reste du code...

        } catch (\Exception $e) {
            Log::channel('daily')->error('Export failed', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
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

    private function saveHistory($userId, $contextId, $userMessage, $aiResponse, $maxHistory = 3)
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

            $messages = array_slice($messages, -($maxHistory * 2));
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
