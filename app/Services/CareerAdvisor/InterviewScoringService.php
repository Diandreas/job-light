<?php

namespace App\Services\CareerAdvisor;

class InterviewScoringService
{
    /**
     * Score an interview answer based on objective criteria.
     * Returns a breakdown with an overall score out of 100.
     */
    public function score(string $answer, string $question = '', string $language = 'fr'): array
    {
        $starScore = $this->scoreSTARMethod($answer, $language);
        $completenessScore = $this->scoreCompleteness($answer, $language);
        $specificityScore = $this->scoreSpecificity($answer, $language);
        $lengthScore = $this->scoreLengthAppropriateness($answer);
        $confidenceScore = $this->scoreConfidenceIndicators($answer, $language);

        $overall = round(
            $starScore * 0.40 +
            $completenessScore * 0.20 +
            $specificityScore * 0.20 +
            $lengthScore * 0.10 +
            $confidenceScore * 0.10
        );

        return [
            'overallScore' => $overall,
            'breakdown' => [
                'star' => ['score' => $starScore, 'weight' => 40, 'label' => 'Méthode STAR'],
                'completeness' => ['score' => $completenessScore, 'weight' => 20, 'label' => 'Complétude'],
                'specificity' => ['score' => $specificityScore, 'weight' => 20, 'label' => 'Spécificité'],
                'length' => ['score' => $lengthScore, 'weight' => 10, 'label' => 'Longueur appropriée'],
                'confidence' => ['score' => $confidenceScore, 'weight' => 10, 'label' => 'Indicateurs de confiance'],
            ],
            'tips' => $this->generateTips($starScore, $completenessScore, $specificityScore, $lengthScore, $confidenceScore, $language),
        ];
    }

    /**
     * STAR Method (40%): Situation/Task/Action/Result detection.
     */
    private function scoreSTARMethod(string $text, string $language): int
    {
        $textLower = mb_strtolower($text);
        $score = 0;

        $starKeywords = $language === 'en' ? [
            'situation' => ['situation', 'context', 'background', 'when i was', 'at the time', 'during'],
            'task' => ['task', 'challenge', 'objective', 'goal', 'responsible for', 'assigned', 'needed to'],
            'action' => ['action', 'i decided', 'i implemented', 'i developed', 'i created', 'i led', 'my approach'],
            'result' => ['result', 'outcome', 'achieved', 'improved', 'increased', 'reduced', 'successfully'],
        ] : [
            'situation' => ['situation', 'contexte', 'lorsque', 'quand j\'étais', 'à l\'époque', 'dans le cadre'],
            'task' => ['tâche', 'défi', 'objectif', 'but', 'responsable de', 'chargé de', 'devais'],
            'action' => ['action', 'j\'ai décidé', 'j\'ai mis en place', 'j\'ai développé', 'j\'ai créé', 'j\'ai dirigé', 'mon approche'],
            'result' => ['résultat', 'aboutissement', 'atteint', 'amélioré', 'augmenté', 'réduit', 'réussi'],
        ];

        foreach ($starKeywords as $component => $keywords) {
            foreach ($keywords as $kw) {
                if (str_contains($textLower, $kw)) {
                    $score += 25;
                    break;
                }
            }
        }

        return min(100, $score);
    }

    /**
     * Completeness (20%): presence of expected elements.
     */
    private function scoreCompleteness(string $text, string $language): int
    {
        $textLower = mb_strtolower($text);
        $score = 0;

        // Has a concrete example
        $exampleKeywords = $language === 'en'
            ? ['for example', 'for instance', 'specifically', 'in particular', 'such as']
            : ['par exemple', 'notamment', 'en particulier', 'concrètement', 'spécifiquement'];

        foreach ($exampleKeywords as $kw) {
            if (str_contains($textLower, $kw)) {
                $score += 20;
                break;
            }
        }

        // Mentions a timeframe
        if (preg_match('/(\d+\s*(mois|ans|semaines|jours|months|years|weeks|days))/i', $text)) {
            $score += 20;
        }

        // Mentions a team or collaboration
        $teamKeywords = $language === 'en'
            ? ['team', 'colleague', 'together', 'collaboration', 'stakeholder']
            : ['équipe', 'collègue', 'ensemble', 'collaboration', 'partenaire'];

        foreach ($teamKeywords as $kw) {
            if (str_contains($textLower, $kw)) {
                $score += 20;
                break;
            }
        }

        // Has a learning or takeaway
        $learningKeywords = $language === 'en'
            ? ['learned', 'takeaway', 'lesson', 'improved', 'growth']
            : ['appris', 'enseignement', 'leçon', 'amélioré', 'progression'];

        foreach ($learningKeywords as $kw) {
            if (str_contains($textLower, $kw)) {
                $score += 20;
                break;
            }
        }

        // Has quantified impact
        if (preg_match('/\d+\s*%/', $text) || preg_match('/[\d,.]+\s*[€$kKmM]/', $text)) {
            $score += 20;
        }

        return min(100, $score);
    }

    /**
     * Specificity (20%): concrete examples vs generic responses.
     */
    private function scoreSpecificity(string $text, string $language): int
    {
        $textLower = mb_strtolower($text);
        $score = 50; // Base score

        // Penalize vague language
        $vagueWords = $language === 'en'
            ? ['generally', 'usually', 'sometimes', 'maybe', 'i think', 'i guess', 'sort of', 'kind of']
            : ['généralement', 'habituellement', 'parfois', 'peut-être', 'je pense', 'je suppose', 'en quelque sorte'];

        $vagueCount = 0;
        foreach ($vagueWords as $vw) {
            if (str_contains($textLower, $vw)) {
                $vagueCount++;
            }
        }
        $score -= $vagueCount * 10;

        // Reward specific indicators
        // Named entities (company names, tools, technologies)
        $specificCount = preg_match_all('/[A-Z][a-z]+(?:\s[A-Z][a-z]+)*/', $text);
        $score += min(30, $specificCount * 5);

        // Numbers and data points
        $numberCount = preg_match_all('/\b\d+/', $text);
        $score += min(20, $numberCount * 5);

        return max(0, min(100, $score));
    }

    /**
     * Length appropriateness (10%): not too short, not too long.
     */
    private function scoreLengthAppropriateness(string $text): int
    {
        $wordCount = str_word_count($text);

        // Ideal interview answer: 100-300 words (1-2 minutes spoken)
        if ($wordCount < 30) {
            return 20; // Way too short
        } elseif ($wordCount < 60) {
            return 50;
        } elseif ($wordCount <= 300) {
            return 100; // Perfect range
        } elseif ($wordCount <= 500) {
            return 70; // A bit long
        } else {
            return 40; // Too long
        }
    }

    /**
     * Confidence indicators (10%): absence of filler words.
     */
    private function scoreConfidenceIndicators(string $text, string $language): int
    {
        $textLower = mb_strtolower($text);
        $score = 100;

        $fillerWords = $language === 'en'
            ? ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally', 'honestly']
            : ['euh', 'hum', 'ben', 'genre', 'en fait', 'voilà', 'du coup', 'bah'];

        foreach ($fillerWords as $fw) {
            $count = substr_count($textLower, $fw);
            $score -= $count * 8;
        }

        // Hedging language
        $hedging = $language === 'en'
            ? ['i think maybe', 'i\'m not sure', 'i don\'t know if']
            : ['je pense que peut-être', 'je ne suis pas sûr', 'je ne sais pas si'];

        foreach ($hedging as $h) {
            if (str_contains($textLower, $h)) {
                $score -= 15;
            }
        }

        return max(0, min(100, $score));
    }

    private function generateTips(int $star, int $completeness, int $specificity, int $length, int $confidence, string $language): array
    {
        $tips = [];
        $isFr = $language !== 'en';

        if ($star < 60) {
            $tips[] = $isFr
                ? 'Structurez votre réponse avec la méthode STAR : Situation, Tâche, Action, Résultat'
                : 'Structure your answer using the STAR method: Situation, Task, Action, Result';
        }
        if ($completeness < 60) {
            $tips[] = $isFr
                ? 'Ajoutez des exemples concrets, des timeframes et des résultats chiffrés'
                : 'Add concrete examples, timeframes, and quantified results';
        }
        if ($specificity < 60) {
            $tips[] = $isFr
                ? 'Évitez le langage vague et donnez des détails spécifiques'
                : 'Avoid vague language and provide specific details';
        }
        if ($length < 60) {
            $tips[] = $isFr
                ? 'Visez une réponse de 100 à 300 mots (1-2 minutes à l\'oral)'
                : 'Aim for a 100-300 word answer (1-2 minutes spoken)';
        }
        if ($confidence < 60) {
            $tips[] = $isFr
                ? 'Réduisez les mots de remplissage et affirmez vos propos avec assurance'
                : 'Reduce filler words and state your points with confidence';
        }

        return $tips;
    }
}
