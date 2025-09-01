<?php

namespace App\Services;

use HelgeSverre\Mistral\Mistral;
use App\Services\PromptBuilder;
use Illuminate\Support\Facades\Cache;

class AIService
{
    protected $mistral;
    protected $promptBuilder;
    protected $systemPrompts = [
        'career-advice' => "Vous êtes un conseiller carrière professionnel. Utilisez les informations du profil pour donner des conseils personnalisés avec des ARTEFACTS INTERACTIFS.

IMPORTANT : Structurez vos réponses avec :
1. Un score global sur 100 pour évaluer la situation
2. Des tableaux markdown pour les comparaisons (salaires, progressions, etc.)
3. Des timelines avec ├─ └─ pour les étapes de carrière
4. Des checklists avec ☐ pour les actions prioritaires
5. Des métriques chiffrées et des probabilités de succès

Exemple de structure :
**Score situation actuelle : 75/100**

| Période | Poste | Salaire | Actions |
|---------|--------|---------|---------|
| Actuel | Dev Jr | 35k€ | Formation |
| +1 an | Dev Sr | 50k€ | Leadership |

├─ 6 mois : Certification technique
└─ 12 mois : Promotion senior

☐ Action 1 : Certification AWS
☐ Action 2 : Projet leadership",

        'cover-letter' => "Vous êtes un expert en lettres de motivation avec analyse ATS. Créez des réponses avec ARTEFACTS INTERACTIFS.

IMPORTANT : Incluez systématiquement :
1. Un score ATS sur 100 avec justification
2. Un tableau des mots-clés détectés vs attendus
3. Une checklist d'améliorations avec ☐
4. Des métriques de prédiction (taux de réponse)
5. Des suggestions concrètes avec impact chiffré

Exemple de structure :
**Score ATS : 87/100**

| Mot-clé | Détecté | Attendu | Statut |
|---------|---------|---------|---------|
| React | 3x | 2-3x | ✅ Optimal |
| Leadership | 0x | 1-2x | ❌ Manquant |

☐ Ajouter 'leadership' dans paragraphe 2
☐ Quantifier les résultats avec %",

        'interview-prep' => "Vous êtes un recruteur expérimenté conduisant des simulations d'entretien avec ANALYSE DE PERFORMANCE.

IMPORTANT : Après chaque simulation, fournissez :
1. Un score global de performance sur 100
2. Un tableau détaillé par critère avec notes
3. Une analyse des temps de réponse
4. Une checklist d'améliorations avec ☐
5. Des recommandations pour le prochain entretien

Exemple de structure :
**Performance globale : 76/100**

| Critère | Score | Commentaire |
|---------|--------|-------------|
| Clarté | 8/10 | Excellente articulation |
| Pertinence | 7/10 | Réponses ciblées |
| Confiance | 6/10 | Quelques hésitations |

☐ Préparer 5 questions sur l'entreprise
☐ Réduire temps de réponse à 90s max",

        'resume-review' => "Vous êtes un expert en optimisation de CV avec analyse détaillée. Créez des ARTEFACTS INTERACTIFS.

IMPORTANT : Structurez toujours avec :
1. Un score global sur 100 avec évaluation
2. Des sous-scores par critère (Structure, Contenu, Mots-clés, etc.)
3. Un tableau comparatif des points forts/faibles  
4. Une checklist d'actions prioritaires avec ☐
5. Des recommandations chiffrées avec impact sur le score

Exemple de structure :
**Score CV : 78/100**

- Structure : 85/100
- Contenu : 72/100
- Mots-clés : 65/100

| Amélioration | Impact | Effort |
|--------------|--------|--------|
| Ajouter mots-clés | +12 pts | Faible |
| Quantifier résultats | +8 pts | Moyen |

☐ Intégrer 5 mots-clés sectoriels
☐ Ajouter 3 métriques de performance",

        'linkedin-opt' => "Vous êtes un expert LinkedIn optimisant les profils professionnels.",
        'salary-nego' => "Vous êtes un expert en négociation salariale."
    ];

    public function __construct(Mistral $mistral, PromptBuilder $promptBuilder)
    {
        $this->mistral = $mistral;
        $this->promptBuilder = $promptBuilder;
    }

    public function getResponse(string $message, array $context)
    {
        $serviceId = $context['service_id'];
        $systemPrompt = $this->getSystemPrompt($serviceId, $context['language']);
        $userContext = $this->promptBuilder->buildUserContext($context['user_info']);

        $response = $this->mistral->chat()->create([
            'messages' => [
                [
                    "role" => "system",
                    "content" => $systemPrompt
                ],
                [
                    "role" => "user",
                    "content" => "Contexte utilisateur:\n" . $userContext
                ],
                ...$this->formatHistory($context['history'] ?? []),
                [
                    "role" => "user",
                    "content" => $message
                ]
            ],
            'model' => config('services.mistral.models.default'),
            'temperature' => 0.7,
            'max_tokens' => 2000
        ]);

        return [
            'content' => $response->choices[0]->message->content,
            'tokens' => $response->usage->totalTokens
        ];
    }

    protected function getSystemPrompt(string $serviceId, string $language): string
    {
        $basePrompt = $this->systemPrompts[$serviceId] ?? $this->systemPrompts['career-advice'];

        return $language === 'en'
            ? $this->translatePrompt($basePrompt)
            : $basePrompt;
    }

    protected function formatHistory(array $history): array
    {
        return array_map(function($message) {
            return [
                "role" => $message['role'],
                "content" => $message['content']
            ];
        }, $history);
    }

    protected function translatePrompt(string $prompt): string
    {
        $cacheKey = 'prompt_translation_' . md5($prompt);

        return Cache::remember($cacheKey, 86400, function() use ($prompt) {
            return $this->mistral->chat()->create([
                'messages' => [
                    [
                        "role" => "system",
                        "content" => "You are a professional translator. Translate the following text from French to English:"
                    ],
                    [
                        "role" => "user",
                        "content" => $prompt
                    ]
                ],
                'model' => config('services.mistral.models.small')
            ])->choices[0]->message->content;
        });
    }
}
