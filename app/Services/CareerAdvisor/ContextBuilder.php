<?php

namespace App\Services\CareerAdvisor;

use App\Models\User;

class ContextBuilder
{
    /**
     * Build a compact JSON context string from user profile data.
     */
    public function buildCompactContext(User $user): string
    {
        $experiences = $user->experiences()
            ->orderBy('date_start', 'desc')
            ->take(10)
            ->get()
            ->map(fn($exp) => [
                'poste' => $exp->name,
                'entreprise' => $exp->InstitutionName,
                'période' => $exp->date_start . ' - ' . ($exp->date_end ?? 'actuel'),
                'description' => mb_substr($exp->description ?? '', 0, 200),
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
            'langues' => $languages,
        ], JSON_UNESCAPED_UNICODE);
    }

    /**
     * Build user relevant info array for frontend (Inertia props).
     */
    public function getUserRelevantInfo(User $user): array
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
                    'description_preview' => mb_substr($exp->description ?? '', 0, 200),
                ])->toArray(),
            'competences' => $user->competences()
                ->take(4)
                ->pluck('name')
                ->toArray(),
            'languages' => $user->languages()
                ->get()
                ->map(fn($lang) => [
                    'name' => $lang->name,
                    'level' => $lang->pivot->level ?? 'Intermédiaire',
                ])->toArray(),
        ];
    }

    /**
     * Build an enriched prompt with user context and service-specific instructions.
     */
    public function buildEnrichedPrompt(string $message, string $language, string $serviceId, string $userContext): string
    {
        $context = json_decode($userContext, true) ?? [];
        $profession = $context['profession'] ?? 'Non spécifié';
        $experiences = $context['expériences_clés'] ?? $context['experiences'] ?? [];
        $competences = $context['compétences'] ?? $context['competences'] ?? [];

        $userName = $context['nom'] ?? $context['name'] ?? 'Utilisateur';

        $enrichedPrompt = "CONTEXTE UTILISATEUR DÉTAILLÉ :
=== PROFIL PROFESSIONNEL ===
• Nom : {$userName}
• Profession : {$profession}
• Compétences clés : " . (is_array($competences) ? implode(', ', array_slice($competences, 0, 5)) : $competences) . "

=== EXPÉRIENCE PROFESSIONNELLE ===";

        if (!empty($experiences) && is_array($experiences)) {
            foreach (array_slice($experiences, 0, 3) as $exp) {
                $title = $exp['poste'] ?? $exp['title'] ?? 'Poste non spécifié';
                $company = $exp['entreprise'] ?? $exp['company'] ?? 'Entreprise non spécifiée';
                $duration = $exp['période'] ?? $exp['duration'] ?? 'Durée non spécifiée';
                $enrichedPrompt .= "\n• {$title} chez {$company} ({$duration})";
            }
        } else {
            $enrichedPrompt .= "\nAucune expérience détaillée fournie";
        }

        $enrichedPrompt .= "\n\n=== INSTRUCTIONS SPÉCIALISÉES ===";
        $enrichedPrompt .= $this->getServiceInstructions($serviceId);

        $enrichedPrompt .= "\n\n=== QUESTION DE L'UTILISATEUR ===
{$message}

RÉPONDS de manière personnalisée, actionnable et basée sur les données contextuelles fournies.";

        return $enrichedPrompt;
    }

    private function getServiceInstructions(string $serviceId): string
    {
        return match ($serviceId) {
            'career-advice' => "
Tu es un conseiller carrière expert avec 15 ans d'expérience. Analyse le profil ci-dessus et :
1. **Identifie les opportunités** basées sur l'expérience actuelle
2. **Suggère 3 actions concrètes** avec timeline précise
3. **Propose des compétences** à développer en priorité
4. **Recommande des ressources** spécifiques (formations, certifications)",
            'resume-review' => "
Analyse le CV en tant qu'expert recruteur et génère :
- Score global /100 avec justification
- Scores par section (En-tête, Expérience, Compétences, Formation)
- Liste de recommandations prioritaires
- Compatibilité ATS estimée en %
- Suggestions d'optimisation par mots-clés sectoriels",
            'interview-prep' => "
Prépare un plan d'entretien personnalisé avec :
- 5 questions probables pour ce profil
- Exemples de réponses STAR recommandées
- Points forts à mettre en avant
- Faiblesses potentielles et comment les adresser",
            'cover-letter' => "
Analyse ou génère la lettre de motivation avec :
- Score de qualité global
- Analyse de la structure (salutation, introduction, corps, conclusion)
- Pertinence par rapport au poste visé
- Suggestions d'amélioration concrètes",
            default => '',
        };
    }
}
