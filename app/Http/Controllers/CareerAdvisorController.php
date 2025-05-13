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
            ->map(function ($chat) {
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
            ->map(function ($chat) {
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
            'career-advice' => 'Conseil carrière',
            'presentation-ppt' => 'Présentation PowerPoint'
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
            ],
            'presentation-ppt' => [
                'model' => 'mistral-large-latest',
                'maxTokens' => 3500,
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

            // Définir 'fr' comme langue par défaut si nécessaire
            $language = $validated['language'] ?? 'fr';

            $user = auth()->user();
            $config = $this->getModelConfigForService($validated['serviceId']);

            // Définir le service_id pour saveHistory
            $this->currentServiceId = $validated['serviceId'];

            $messages = [
                [
                    'role' => Role::system->value,
                    'content' => $this->getSystemPrompt($language, $validated['serviceId'])
                ]
            ];

            // Récupérer le contexte compact s'il existe
            $chatHistory = ChatHistory::where('context_id', $validated['contextId'])
                ->where('user_id', $user->id)
                ->first();

            $userContext = '';
            if ($chatHistory && !empty($chatHistory->context)) {
                $userContext = $chatHistory->context;
            } else {
                $userInfo = $this->getUserRelevantInfo($user);
                $userContext = json_encode($userInfo, JSON_PRETTY_PRINT);
            }

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
                    $language,
                    $validated['serviceId'],
                    $userContext
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
        $languageInstruction = [
            'fr' => "IMPORTANT: Vous DEVEZ répondre UNIQUEMENT en français, quoi qu'il arrive.",
            'en' => "IMPORTANT: You MUST respond ONLY in English, no matter what."
        ][$language] ?? "IMPORTANT: Vous DEVEZ répondre UNIQUEMENT en français, quoi qu'il arrive.";

        $prompts = [
            'interview-prep' => [
                'fr' => "{$languageInstruction}
                        Vous êtes un recruteur expérimenté conduisant un entretien d'embauche.
                        Posez des questions pertinentes et donnez des retours constructifs.
                        Gardez un ton professionnel mais conversationnel.
                        Adaptez vos questions en fonction des réponses précédentes.
                        Maximum 10 échanges pour simuler un véritable entretien.",
                'en' => "{$languageInstruction}
                        You are an experienced recruiter conducting a job interview.
                        Ask relevant questions and provide constructive feedback.
                        Keep a professional but conversational tone.
                        Adapt your questions based on previous answers.
                        Maximum 10 exchanges to simulate a real interview."
            ],
            'cover-letter' => [
                'fr' => "{$languageInstruction}
                        Vous êtes un expert en rédaction de lettres de motivation.
                        Créez des contenus personnalisés, persuasifs et professionnels.
                        Mettez en valeur les compétences pertinentes et l'adéquation avec le poste.
                        Adaptez le style et le ton au secteur d'activité.",
                'en' => "{$languageInstruction}
                        You are an expert in writing cover letters.
                        Create personalized, persuasive, and professional content.
                        Highlight relevant skills and job fit.
                        Adapt style and tone to the industry."
            ],
            'resume-review' => [
                'fr' => "{$languageInstruction}
                        Vous êtes un expert en optimisation de CV.
                        Analysez le CV et suggérez des améliorations concrètes.
                        Concentrez-vous sur la mise en valeur des compétences clés.
                        Donnez des exemples spécifiques.",
                'en' => "{$languageInstruction}
                        You are an expert in resume optimization.
                        Analyze the resume and suggest concrete improvements.
                        Focus on highlighting key skills.
                        Provide specific examples."
            ],
            'career-advice' => [
                'fr' => "{$languageInstruction}
                        Vous êtes un conseiller professionnel expert.
                        Donnez des conseils pratiques et applicables.
                        Adaptez vos recommandations au profil et au secteur.",
                'en' => "{$languageInstruction}
                        You are an expert career advisor.
                        Provide practical and actionable advice.
                        Adapt recommendations to profile and industry."
            ],
            'presentation-ppt' => [
                'fr' => "{$languageInstruction}
        Vous êtes un expert consultant en présentations PowerPoint avec 15 ans d'expérience.

        IMPORTANT: Répondez UNIQUEMENT en JSON valide, sans texte avant ou après.

        RÈGLES DE CRÉATION:
        1. Analysez le sujet pour déterminer le type de présentation le plus adapté
        2. Créez une structure logique avec une progression narrative claire
        3. Utilisez des graphiques quand les données le justifient
        4. Intégrez des tableaux pour les comparaisons complexes
        5. Équilibrez texte et éléments visuels (règle 6x6 max)
        6. Adaptez le style visuel au contexte (corporate, créatif, académique, etc.)

        Structure JSON requise:
        {
          \"title\": \"Titre percutant de max 60 caractères\",
          \"subtitle\": \"Sous-titre explicatif\",
          \"author\": \"Nom de l'auteur\",
          \"presentationType\": \"business|academic|creative|technical\",
          \"slides\": [
            {
              \"type\": \"title|content|two-column|chart|table|comparison|process|timeline|conclusion|quote|image\",
              \"title\": \"Titre concis\",
              \"subtitle\": \"Sous-titre optionnel\",
              \"content\": [\"Point concis\", \"Point avec impact\"],
              \"design\": {
                \"background\": \"solid|gradient|image\",
                \"emphasis\": \"primary|secondary|accent\"
              },

              // Pour les graphiques:
              \"chartType\": \"bar|line|pie|donut|scatter|area|column\",
              \"data\": {
                \"title\": \"Titre du graphique\",
                \"labels\": [\"Libellé 1\", \"Libellé 2\"],
                \"datasets\": [{
                  \"name\": \"Série de données\",
                  \"values\": [valeur1, valeur2],
                  \"color\": \"#couleur\"
                }],
                \"insight\": \"Conclusion clé du graphique\"
              },

              // Pour les tableaux:
              \"table\": {
                \"headers\": [\"Colonne 1\", \"Colonne 2\"],
                \"rows\": [[\"Valeur1\", \"Valeur2\"]],
                \"emphasis\": [0, 1], // Indices des lignes à surligner
                \"style\": \"corporate|modern|minimal\"
              },

              // Pour les comparaisons:
              \"comparison\": {
                \"leftTitle\": \"Option A\",
                \"leftPoints\": [\"Avantage 1\", \"Avantage 2\"],
                \"rightTitle\": \"Option B\",
                \"rightPoints\": [\"Avantage 1\", \"Avantage 2\"],
                \"verdict\": \"Recommandation finale\"
              },

              // Pour les processus:
              \"process\": {
                \"steps\": [{
                  \"number\": 1,
                  \"title\": \"Étape 1\",
                  \"description\": \"Description détaillée\",
                  \"icon\": \"optional-icon-name\"
                }]
              }
            }
          ],
          \"theme\": {
            \"name\": \"modern-corporate|creative-vibrant|academic-clean|tech-minimal\",
            \"colors\": {
              \"primary\": \"#3366CC\",
              \"secondary\": \"#FF6900\",
              \"accent\": \"#00C851\",
              \"background\": \"#FFFFFF\",
              \"text\": \"#333333\",
              \"textLight\": \"#666666\",
              \"success\": \"#00C851\",
              \"warning\": \"#FF8800\",
              \"error\": \"#CC0000\"
            },
            \"fonts\": {
              \"heading\": \"Segoe UI\",
              \"body\": \"Segoe UI\",
              \"accent\": \"Arial\"
            },
            \"spacing\": {
              \"tight\": true,
              \"margins\": \"standard\"
            }
          },
          \"animations\": {
            \"enabled\": false,
            \"style\": \"subtle|dynamic\"
          }
        }

        TYPES DE SLIDES DISPONIBLES:
        - title: Page de titre avec sous-titre optionnel
        - content: Liste de points avec puces élégantes
        - two-column: Contenu en deux colonnes équilibrées
        - chart: Graphique avec données et insight
        - table: Tableau formaté avec données
        - comparison: Comparaison côte à côte avec verdict
        - process: Étapes numérotées avec descriptions
        - timeline: Chronologie avec événements
        - conclusion: Résumé avec points clés et call-to-action
        - quote: Citation mise en valeur
        - image: Support visuel avec légende

        CONSEILS:
        - Limitez le texte (max 6 puces de 6 mots)
        - Utilisez des données chiffrées quand possible
        - Créez une progression logique
        - Alternez types de slides pour éviter la monotonie
        - Incluez des insights et conclusions
        - Adaptez les couleurs au contexte
        - Priorisez la lisibilité",

                'en' => "{$languageInstruction}
        You are an expert PowerPoint consultant with 15 years of experience.

        IMPORTANT: Respond ONLY in valid JSON format, without any text before or after.

        CREATION RULES:
        1. Analyze the topic to determine the most suitable presentation type
        2. Create a logical structure with clear narrative progression
        3. Use charts when data justifies them
        4. Include tables for complex comparisons
        5. Balance text and visual elements (6x6 rule max)
        6. Adapt visual style to context (corporate, creative, academic, etc.)

        Required JSON structure:
        {
          \"title\": \"Compelling title max 60 characters\",
          \"subtitle\": \"Explanatory subtitle\",
          \"author\": \"Author name\",
          \"presentationType\": \"business|academic|creative|technical\",
          \"slides\": [
            {
              \"type\": \"title|content|two-column|chart|table|comparison|process|timeline|conclusion|quote|image\",
              \"title\": \"Concise title\",
              \"subtitle\": \"Optional subtitle\",
              \"content\": [\"Concise point\", \"Impactful point\"],
              \"design\": {
                \"background\": \"solid|gradient|image\",
                \"emphasis\": \"primary|secondary|accent\"
              },

              // For charts:
              \"chartType\": \"bar|line|pie|donut|scatter|area|column\",
              \"data\": {
                \"title\": \"Chart title\",
                \"labels\": [\"Label 1\", \"Label 2\"],
                \"datasets\": [{
                  \"name\": \"Data series\",
                  \"values\": [value1, value2],
                  \"color\": \"#color\"
                }],
                \"insight\": \"Key chart conclusion\"
              },

              // For tables:
              \"table\": {
                \"headers\": [\"Column 1\", \"Column 2\"],
                \"rows\": [[\"Value1\", \"Value2\"]],
                \"emphasis\": [0, 1], // Row indices to highlight
                \"style\": \"corporate|modern|minimal\"
              },

              // For comparisons:
              \"comparison\": {
                \"leftTitle\": \"Option A\",
                \"leftPoints\": [\"Advantage 1\", \"Advantage 2\"],
                \"rightTitle\": \"Option B\",
                \"rightPoints\": [\"Advantage 1\", \"Advantage 2\"],
                \"verdict\": \"Final recommendation\"
              },

              // For processes:
              \"process\": {
                \"steps\": [{
                  \"number\": 1,
                  \"title\": \"Step 1\",
                  \"description\": \"Detailed description\",
                  \"icon\": \"optional-icon-name\"
                }]
              }
            }
          ],
          \"theme\": {
            \"name\": \"modern-corporate|creative-vibrant|academic-clean|tech-minimal\",
            \"colors\": {
              \"primary\": \"#3366CC\",
              \"secondary\": \"#FF6900\",
              \"accent\": \"#00C851\",
              \"background\": \"#FFFFFF\",
              \"text\": \"#333333\",
              \"textLight\": \"#666666\",
              \"success\": \"#00C851\",
              \"warning\": \"#FF8800\",
              \"error\": \"#CC0000\"
            },
            \"fonts\": {
              \"heading\": \"Segoe UI\",
              \"body\": \"Segoe UI\",
              \"accent\": \"Arial\"
            },
            \"spacing\": {
              \"tight\": true,
              \"margins\": \"standard\"
            }
          },
          \"animations\": {
            \"enabled\": false,
            \"style\": \"subtle|dynamic\"
          }
        }

        AVAILABLE SLIDE TYPES:
        - title: Title slide with optional subtitle
        - content: Bulleted list with elegant bullets
        - two-column: Balanced two-column content
        - chart: Chart with data and insights
        - table: Formatted table with data
        - comparison: Side-by-side comparison with verdict
        - process: Numbered steps with descriptions
        - timeline: Timeline with events
        - conclusion: Summary with key points and call-to-action
        - quote: Highlighted quotation
        - image: Visual support with caption

        TIPS:
        - Limit text (max 6 bullets of 6 words)
        - Use numerical data when possible
        - Create logical progression
        - Alternate slide types to avoid monotony
        - Include insights and conclusions
        - Adapt colors to context
        - Prioritize readability"
            ]
        ];

        return $prompts[$serviceId][$language] ?? $prompts['default'][$language];
    }

    private function buildPrompt($message, $language, $serviceId, $userContext)
    {
        return "Profil :\n{$userContext}\n\nMessage : {$message}";
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

            // Si c'est une nouvelle conversation ou si le contexte est vide, générer un nouveau contexte
            if (!$chatHistory->exists || empty($chatHistory->context)) {
                $user = User::find($userId);
                $chatHistory->context = $this->generateCompactContext($user);
            }

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

    /**
     * Génère un résumé compact du profil de l'utilisateur pour le contexte
     */
    private function generateCompactContext($user)
    {
        $experiences = $user->experiences()
            ->orderBy('date_start', 'desc')
            ->take(10)
            ->get()
            ->map(fn($exp) => [
                'poste' => $exp->name,
                'entreprise' => $exp->InstitutionName,
                'période' => $exp->date_start . ' - ' . ($exp->date_end ?? 'actuel'),
                'description' => mb_substr($exp->description, 0, 200) . (strlen($exp->description) > 200 ? '...' : '')
            ]);

        $competences = $user->competences()
            ->take(5)
            ->pluck('name')
            ->implode(', ');

        $languages = $user->languages()
            ->get()
            ->map(fn($lang) => $lang->name . ' (' . ($lang->pivot->level ?? 'Intermédiaire') . ')')
            ->implode(', ');

        return json_encode([
            'nom' => $user->name,
            'profession' => $user->profession?->name ?? $user->full_profession ?? 'Non spécifié',
            'expériences_clés' => $experiences,
            'compétences' => $competences,
            'langues' => $languages
        ]);
    }

    private function getUserRelevantInfo($user)
    {
        return [
            'name' => $user->name,
            'profession' => $user->profession?->name ?? $user->full_profession ?? 'Non spécifié',
            'experiences' => $user->experiences()
                ->orderBy('date_start', 'desc')
                ->take(10)
                ->get()
                ->map(fn($exp) => [
                    'title' => $exp->name,
                    'company' => $exp->InstitutionName,
                    'duration' => $exp->date_start . ' - ' . ($exp->date_end ?? 'Present'),
                    'description_preview' => mb_substr($exp->description, 0, 200) . (strlen($exp->description) > 200 ? '...' : '')
                ])->toArray(),
            'competences' => $user->competences()
                ->take(4)
                ->pluck('name')
                ->toArray(),
            'languages' => $user->languages()
                ->get()
                ->map(fn($lang) => [
                    'name' => $lang->name,
                    'level' => $lang->pivot->level ?? 'Intermédiaire'
                ])->toArray()
        ];
    }

    private function getExportTitle($serviceId)
    {
        return [
            'interview-prep' => 'Simulation d\'entretien',
            'cover-letter' => 'Lettre de motivation',
            'resume-review' => 'Analyse de CV',
            'presentation-ppt' => 'Présentation PowerPoint',
            'default' => 'Conseil carrière'
        ][$serviceId] ?? 'Document Guidy';
    }

    private function formatContent($messages, $serviceId)
    {
        return array_map(function ($message) {
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

    /**
     * Exportation au format PowerPoint
     */
    public function exportPptx(Request $request)
    {
        try {
            $validated = $request->validate([
                'contextId' => 'required|string',
                'pptxData' => 'required|string' // Le contenu PowerPoint encodé en base64
            ]);

            // Récupérer la conversation
            $chatHistory = ChatHistory::where('context_id', $validated['contextId'])
                ->where('user_id', auth()->id())
                ->firstOrFail();

            // Décoder le contenu base64
            $pptxContent = base64_decode($validated['pptxData']);

            if ($pptxContent === false) {
                Log::error('Export PPTX error: Invalid base64 content');
                return response()->json(['error' => 'Contenu base64 invalide'], 400);
            }

            // Vérifier que le contenu décodé a une taille correcte
            if (strlen($pptxContent) < 100) {
                Log::error('Export PPTX error: Content too small, likely corrupted', ['size' => strlen($pptxContent)]);
                return response()->json(['error' => 'Contenu du fichier trop petit, probablement corrompu'], 400);
            }

            // Vérifier que l'en-tête du fichier PPTX est correct
            $pptxHeader = substr($pptxContent, 0, 4);
            $validHeader = pack("C*", 0x50, 0x4B, 0x03, 0x04); // Signature ZIP PK\003\004

            if ($pptxHeader !== $validHeader) {
                Log::error('Export PPTX error: Invalid file header', ['header' => bin2hex($pptxHeader)]);
                return response()->json(['error' => 'En-tête de fichier invalide, données non conformes au format PPTX'], 400);
            }

            // Créer un fichier temporaire
            $tempFile = tempnam(sys_get_temp_dir(), 'pptx');
            file_put_contents($tempFile, $pptxContent);

            // Enregistrer dans la table DocumentExport
            DocumentExport::create([
                'user_id' => auth()->id(),
                'filename' => "presentation-{$chatHistory->context_id}.pptx",
                'path' => $tempFile,
                'format' => 'pptx',
                'size' => strlen($pptxContent),
                'context_id' => $chatHistory->context_id
            ]);

            // Retourner le fichier pour téléchargement
            return response()->download(
                $tempFile,
                "presentation-{$chatHistory->context_id}.pptx",
                [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    'Content-Disposition' => 'attachment; filename="presentation-' . $chatHistory->context_id . '.pptx"',
                    'Content-Length' => strlen($pptxContent)
                ]
            )->deleteFileAfterSend();

        } catch (\Exception $e) {
            Log::error('Export PPTX error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
