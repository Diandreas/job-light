<?php

namespace App\Http\Controllers;
use HelgeSverre\Mistral\Resource\Chat;
use App\Models\{PersonalInformation, Experience, Reference, Summary, ExperienceCategory};
use Illuminate\Support\Facades\DB;
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
use Smalot\PdfParser\Parser;

class CareerAdvisorController extends Controller
{
    protected $mistral;
    protected $maxHistory = 10;
    protected $currentServiceId;

    public function __construct()
    {
        $this->mistral = new Mistral(apiKey: config('mistral.api_key'));
    }
    public function show($contextId)
    {
        try {
            // Utiliser ChatHistory au lieu de Chat
            $chat = ChatHistory::where('context_id', $contextId)
                ->where('user_id', auth()->id())
                ->firstOrFail();

            // Décoder les messages JSON stockés
            $messages = json_decode($chat->messages, true) ?? [];

            return response()->json([
                'context_id' => $chat->context_id,
                'service_id' => $chat->service_id,
                'preview' => $this->getChatPreview($chat->messages),
                'created_at' => $chat->created_at,
                'messages' => $messages
            ]);

        } catch (\Exception $e) {
            // Log l'erreur pour le debugging
            \Log::error('Erreur lors de la récupération du chat: ' . $e->getMessage());

            return response()->json([
                'error' => 'Impossible de récupérer la conversation'
            ], 500);
        }
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
                'temperature' => 0.3,
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
                'temperature' => 0.2,
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










    public function analyzeCV(Request $request)
    {
        $request->validate([
            'cv' => 'required|file|mimes:pdf,doc,docx|max:10240'
        ]);

        try {
            $user = auth()->user();
            $analyseCost = 5;

            if ($user->wallet_balance < $analyseCost) {
                return response()->json([
                    'success' => false,
                    'message' => 'Solde insuffisant'
                ], 400);
            }

            // Extraire le texte du fichier
            $text = $this->extractTextFromFile($request->file('cv'));

            // Analyser avec Mistral - utiliser try/catch comme dans la méthode chat
            try {
                $cvData = $this->analyzeCVWithMistral($text);

                // Sauvegarder les données
                $savedData = $this->saveCVData($user->id, $cvData);

                // Déduire le coût seulement après succès
                $user->wallet_balance -= $analyseCost;
                $user->save();

                return response()->json([
                    'success' => true,
                    'cvData' => $cvData,
                    'savedData' => $savedData
                ]);

            } catch (\Exception $e) {
                Log::error('CV analysis error: ' . $e->getMessage(), [
                    'user_id' => auth()->id(),
                    'trace' => $e->getTraceAsString()
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur lors de l\'analyse du CV: ' . $e->getMessage()
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('File processing error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du traitement du fichier: ' . $e->getMessage()
            ], 500);
        }
    }



    private function extractTextFromFile($file)
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
                    if (method_exists($element, 'getText')) {
                        $text .= $element->getText() . "\n";
                    }
                }
            }
            return $text;
        }

        throw new \Exception('Format de fichier non supporté');
    }

    private function analyzeCVWithMistral($text)
    {
        try {
            Log::info('Début de l\'analyse CV avec Mistral', [
                'text_length' => strlen($text),
                'text_preview' => substr($text, 0, 200) . '...'
            ]);

            // Récupérer et logger le prompt système
            $systemPrompt = $this->getSystemPromptcv();
            Log::info('Prompt système:', ['prompt' => $systemPrompt]);

            // Préparer la requête Mistral
            $messages = [
                [
                    'role' => Role::system->value,
                    'content' => $systemPrompt
                ],
                [
                    'role' => Role::user->value,
                    'content' => $text
                ]
            ];

            Log::info('Envoi de la requête à Mistral', [
                'model' => 'mistral-large-latest',
                'messages_count' => count($messages),
                'temperature' => 0.2
            ]);

            // Faire l'appel à Mistral
            $response = $this->mistral->chat()->create(
                messages: $messages,
                model: 'mistral-large-latest',
                temperature: 0.2,
                maxTokens: 2000,
                safeMode: true
            );

            Log::info('Réponse reçue de Mistral', [
                'response_class' => get_class($response),
                'has_dto' => method_exists($response, 'dto')
            ]);

            // Obtenir le DTO
            $dto = $response->dto();
            Log::info('DTO obtenu', [
                'dto_class' => get_class($dto),
                'has_choices' => isset($dto->choices),
                'choices_count' => isset($dto->choices) ? count($dto->choices) : 0
            ]);

            // Récupérer le contenu
            $content = $dto->choices[0]->message->content;
            Log::info('Contenu brut de la réponse:', [
                'content' => $content
            ]);

            // Nettoyer le contenu si nécessaire
            $content = trim($content);
            if (substr($content, 0, 1) !== '{') {
                $start = strpos($content, '{');
                if ($start !== false) {
                    $content = substr($content, $start);
                    Log::info('Contenu nettoyé (début):', [
                        'content' => substr($content, 0, 200) . '...'
                    ]);
                }
            }

            $end = strrpos($content, '}');
            if ($end !== false) {
                $content = substr($content, 0, $end + 1);
                Log::info('Contenu nettoyé (fin):', [
                    'content' => substr($content, -200)
                ]);
            }

            // Tenter le décodage JSON
            $cvData = json_decode($content, true);
            $jsonError = json_last_error();
            Log::info('Tentative de décodage JSON', [
                'success' => $jsonError === JSON_ERROR_NONE,
                'error_code' => $jsonError,
                'error_message' => json_last_error_msg()
            ]);

            if ($jsonError !== JSON_ERROR_NONE) {
                throw new \Exception('Erreur dans le parsing JSON de la réponse Mistral: ' . json_last_error_msg());
            }

            // Valider la structure
            Log::info('Structure des données:', [
                'keys' => array_keys($cvData),
                'has_contact' => isset($cvData['contact']),
                'has_experiences' => isset($cvData['experiences']),
                'experiences_count' => isset($cvData['experiences']) ? count($cvData['experiences']) : 0
            ]);

            return $cvData;

        } catch (\Exception $e) {
            Log::error('Erreur dans analyzeCVWithMistral:', [
                'message' => $e->getMessage(),
                'class' => get_class($e),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    private function getSystemPromptcv()
    {
        return <<<EOT
Tu es un expert en analyse de CV.tu fera en fontion de la langue que tu vas identifier , IMPORTANT: Tu dois analyser le texte fourni et retourner UNIQUEMENT un objet JSON valide suivant EXACTEMENT cette structure, sans texte avant ou après:
{
    "nom_complet": "string (nom et prénom du candidat)",
    "poste_actuel": "string (poste actuel ou dernier poste occupé)",
    "contact": {
        "email": "string (email professionnel)",
        "telephone": "string (format international)",
        "adresse": "string (adresse complète)",
        "github": "string (URL du profil Github ou chaine vide)",
        "linkedin": "string (URL du profil LinkedIn ou chaine vide)"
    },
    "resume": "string (résumé professionnel de 200 mots maximum)",
    "experiences": [
        {
            "titre": "string (intitulé du poste)",
            "entreprise": "string (nom de l'entreprise)",
            "date_debut": "string (format YYYY-MM uniquement)",
            "date_fin": "string (format YYYY-MM ou 'present')",
            "categorie": "string (uniquement: academique, professionnel, ou recherche)",
            "description": "string (description des responsabilités)",
            "output": "string (résultats/réalisations)",
            "comment": "string (informations additionnelles)",
            "references": [
                {
                    "name": "string (nom complet)",
                    "function": "string (poste/fonction)",
                    "email": "string (email professionnel)",
                    "telephone": "string (format international)"
                }
            ]
        }
    ]
}

RÈGLES IMPORTANTES:
1. Retourne UNIQUEMENT l'objet JSON, sans aucun texte avant ou après
2. Utilise EXACTEMENT les noms de champs spécifiés
3. Pour les dates, utilise UNIQUEMENT le format YYYY-MM (exemple: 2023-01)
4. Pour les catégories, utilise UNIQUEMENT: academique, professionnel, ou recherche
5. Si une information est manquante, utilise une chaîne vide ""
6. Les tableaux peuvent être vides mais doivent toujours être présents
7. Tous les champs sont obligatoires, même vides
EOT;
    }
    private function saveCVData($userId, $cvData)
    {
        DB::beginTransaction();
        try {
            // Mettre à jour les informations de l'utilisateur
            $user = User::find($userId);
            $user->update([
                'name' => $cvData['nom_complet'],
                'email' => $cvData['contact']['email'],
                'phone_number' => $cvData['contact']['telephone'],
                'address' => $cvData['contact']['adresse'],
                'github' => $cvData['contact']['github'],
                'linkedin' => $cvData['contact']['linkedin'],
//                'full_profession' => $cvData['poste_actuel']
            ]);

            // Créer et sélectionner le nouveau résumé
            $summary = Summary::create([
                'name' => 'Résumé CV',
                'description' => $cvData['resume']
            ]);

            // Associer le résumé à l'utilisateur et le définir comme sélectionné
            $user->summaries()->attach($summary->id);
            $user->selected_summary_id = $summary->id;
            $user->save();

            // Sauvegarder les expériences
            $savedExperiences = [];
            foreach ($cvData['experiences'] as $exp) {
                // Formater correctement les dates
                $dateStart = $this->formatDate($exp['date_debut']);
                $dateEnd = $exp['date_fin'] === 'present' ? null : $this->formatDate($exp['date_fin']);

                $experience = Experience::create([
                    'name' => $exp['titre'],
                    'InstitutionName' => $exp['entreprise'],
                    'date_start' => $dateStart,
                    'date_end' => $dateEnd,
                    'description' => $exp['description'],
                    'output' => $exp['output'],
                    'comment' => $exp['comment'],
                    'experience_categories_id' => $this->getExperienceCategoryId($exp['categorie'])
                ]);

                // Associer l'expérience à l'utilisateur
                $user->experiences()->attach($experience->id);

                // Sauvegarder les références si présentes
                if (!empty($exp['references'])) {
                    foreach ($exp['references'] as $ref) {
                        $reference = Reference::create([
                            'name' => $ref['name'],
                            'function' => $ref['function'],
                            'email' => $ref['email'],
                            'telephone' => $ref['telephone']
                        ]);

                        // Associer la référence à l'expérience
                        $experience->references()->attach($reference->id);
                    }
                }

                $savedExperiences[] = $experience;
            }

            DB::commit();

            return [
                'user' => $user->fresh(['experiences.references', 'summaries']),
                'experiences' => $savedExperiences
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception('Erreur lors de l\'enregistrement des données: ' . $e->getMessage());
        }
    }

    /**
     * Formater la date du format YYYY-MM au format YYYY-MM-DD
     */
    private function formatDate($date)
    {
        if (empty($date)) {
            return null;
        }

        // Si la date est déjà au format YYYY-MM-DD, la retourner telle quelle
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            return $date;
        }

        // Pour le format YYYY-MM, ajouter le premier jour du mois
        if (preg_match('/^\d{4}-\d{2}$/', $date)) {
            return $date . '-01';
        }

        throw new \Exception("Format de date invalide: $date");
    }

    private function getExperienceCategoryId($categoryName)
    {
        $mapping = [
            'academique' => 2,
            'professionnel' => 1,
            'recherche' => 3
        ];

        return $mapping[$categoryName] ?? 2; // Default à professionnel
    }

    private function validateCVDataStructure($data)
    {
        $errors = [];

        // Validation des champs requis
        $requiredFields = ['nom_complet', 'poste_actuel', 'contact', 'resume', 'experiences'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                $errors[] = "Champ requis manquant: {$field}";
            }
        }

        // Validation du contact
        if (isset($data['contact'])) {
            $contactFields = ['email', 'telephone', 'adresse', 'github', 'linkedin'];
            foreach ($contactFields as $field) {
                if (!isset($data['contact'][$field])) {
                    $errors[] = "Champ contact requis manquant: {$field}";
                }
            }
        }

        // Validation des expériences
        if (isset($data['experiences']) && is_array($data['experiences'])) {
            foreach ($data['experiences'] as $index => $exp) {
                $expFields = ['titre', 'entreprise', 'date_debut', 'date_fin', 'categorie', 'description', 'output', 'comment'];
                foreach ($expFields as $field) {
                    if (!isset($exp[$field])) {
                        $errors[] = "Champ expérience requis manquant: {$field} à l'index {$index}";
                    }
                }

                // Validation du format de date
                if (isset($exp['date_debut']) && !preg_match('/^\d{4}-\d{2}$/', $exp['date_debut'])) {
                    $errors[] = "Format de date_debut invalide à l'index {$index}";
                }

                if (isset($exp['date_fin']) &&
                    $exp['date_fin'] !== 'present' &&
                    !preg_match('/^\d{4}-\d{2}$/', $exp['date_fin'])) {
                    $errors[] = "Format de date_fin invalide à l'index {$index}";
                }

                if (isset($exp['categorie']) &&
                    !in_array($exp['categorie'], ['academique', 'professionnel', 'recherche'])) {
                    $errors[] = "Catégorie invalide à l'index {$index}";
                }
            }
        }

        return $errors;
    }

    private function getMockCVAnalysis()
    {
        return [
            "nom_complet" => "John Doe",
            "poste_actuel" => "Développeur Full Stack",
            "contact" => [
                "email" => "john.doe@example.com",
                "telephone" => "+237600000000",
                "adresse" => "Yaoundé, Cameroun",
                "github" => "github.com/johndoe",
                "linkedin" => "linkedin.com/in/johndoe"
            ],
            "resume" => "Développeur Full Stack expérimenté avec 5 ans d'expérience",
            "experiences" => [
                [
                    "titre" => "Développeur Full Stack Senior",
                    "entreprise" => "Tech Company SA",
                    "date_debut" => "2022-01",
                    "date_fin" => "present",
                    "categorie" => "professionnel",
                    "description" => "Développement d'applications web avec Laravel et React",
                    "output" => "Augmentation de 40% des performances des applications",
                    "comment" => "Lead d'une équipe de 5 développeurs",
                    "references" => [
                        [
                            "name" => "Marie Smith",
                            "function" => "CTO",
                            "email" => "marie.smith@example.com",
                            "telephone" => "+237600000001"
                        ]
                    ]
                ]
            ]
        ];
    }

}
