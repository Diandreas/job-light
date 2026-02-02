<?php

namespace App\Services\CareerAdvisor;

class ATSScoringService
{
    /**
     * Score a CV text deterministically against a job description.
     * Returns a breakdown with an overall score out of 100.
     */
    public function score(string $cvText, string $jobDescription = ''): array
    {
        $formatScore = $this->scoreFormat($cvText);
        $contactScore = $this->scoreContactInfo($cvText);
        $sectionsScore = $this->scoreSections($cvText);
        $keywordScore = $this->scoreKeywords($cvText, $jobDescription);
        $readabilityScore = $this->scoreReadability($cvText);
        $actionVerbScore = $this->scoreActionVerbs($cvText);
        $metricsScore = $this->scoreQuantifiedResults($cvText);

        // Weighted average
        $overall = round(
            $formatScore * 0.20 +
            $contactScore * 0.10 +
            $sectionsScore * 0.15 +
            $keywordScore * 0.20 +
            $readabilityScore * 0.10 +
            $actionVerbScore * 0.10 +
            $metricsScore * 0.15
        );

        return [
            'globalScore' => $overall,
            'breakdown' => [
                'format' => ['score' => $formatScore, 'weight' => 20, 'label' => 'Format & Structure'],
                'contact' => ['score' => $contactScore, 'weight' => 10, 'label' => 'Informations de contact'],
                'sections' => ['score' => $sectionsScore, 'weight' => 15, 'label' => 'Sections détectées'],
                'keywords' => ['score' => $keywordScore, 'weight' => 20, 'label' => 'Densité mots-clés'],
                'readability' => ['score' => $readabilityScore, 'weight' => 10, 'label' => 'Lisibilité'],
                'actionVerbs' => ['score' => $actionVerbScore, 'weight' => 10, 'label' => "Verbes d'action"],
                'metrics' => ['score' => $metricsScore, 'weight' => 15, 'label' => 'Résultats quantifiés'],
            ],
            'recommendations' => $this->generateRecommendations($formatScore, $contactScore, $sectionsScore, $keywordScore, $readabilityScore, $actionVerbScore, $metricsScore),
        ];
    }

    /**
     * Format & Structure (20%): length, special chars, caps ratio.
     */
    private function scoreFormat(string $text): int
    {
        $score = 100;
        $length = mb_strlen($text);

        // Ideal CV length: 300-3000 characters
        if ($length < 200) {
            $score -= 40; // Too short
        } elseif ($length < 500) {
            $score -= 20;
        } elseif ($length > 5000) {
            $score -= 15; // Too long
        }

        // Excessive caps
        $upperCount = preg_match_all('/[A-Z]/', $text);
        $alphaCount = preg_match_all('/[a-zA-Z]/', $text);
        if ($alphaCount > 0 && ($upperCount / $alphaCount) > 0.4) {
            $score -= 15;
        }

        // Excessive special characters
        $specialCount = preg_match_all('/[!@#$%^&*()_+=\[\]{};\':"\\|,<>?~`]/', $text);
        if ($alphaCount > 0 && ($specialCount / $alphaCount) > 0.1) {
            $score -= 10;
        }

        // Check for line breaks / structure
        $lines = explode("\n", $text);
        if (count($lines) < 5) {
            $score -= 20; // No structure
        }

        return max(0, min(100, $score));
    }

    /**
     * Contact info (10%): email, phone, address, links.
     */
    private function scoreContactInfo(string $text): int
    {
        $score = 0;
        $textLower = mb_strtolower($text);

        // Email
        if (preg_match('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $text)) {
            $score += 30;
        }

        // Phone
        if (preg_match('/(\+?\d[\d\s\-().]{7,}\d)/', $text)) {
            $score += 25;
        }

        // Address or location
        if (preg_match('/(adresse|address|ville|city|pays|country|location|localisation)/i', $text)) {
            $score += 15;
        }

        // LinkedIn
        if (str_contains($textLower, 'linkedin')) {
            $score += 15;
        }

        // GitHub/Portfolio
        if (preg_match('/(github|portfolio|site web|website|gitlab)/i', $text)) {
            $score += 15;
        }

        return min(100, $score);
    }

    /**
     * Sections detected (15%): experience, education, skills.
     */
    private function scoreSections(string $text): int
    {
        $textLower = mb_strtolower($text);
        $score = 0;

        $sections = [
            'experience' => ['expérience', 'experience', 'parcours professionnel', 'work experience', 'emploi'],
            'education' => ['formation', 'education', 'études', 'diplôme', 'diploma', 'scolarité'],
            'skills' => ['compétences', 'skills', 'aptitudes', 'savoir-faire', 'technologies'],
            'languages' => ['langues', 'languages'],
            'summary' => ['résumé', 'summary', 'profil', 'profile', 'objectif', 'objective', 'à propos'],
        ];

        foreach ($sections as $key => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($textLower, $keyword)) {
                    $score += 20;
                    break;
                }
            }
        }

        return min(100, $score);
    }

    /**
     * Keyword density (20%): matching with job description.
     */
    private function scoreKeywords(string $cvText, string $jobDescription): int
    {
        if (empty($jobDescription)) {
            // Without a job description, score based on generic professional keywords
            return $this->scoreGenericKeywords($cvText);
        }

        $jobWords = $this->extractSignificantWords($jobDescription);
        $cvLower = mb_strtolower($cvText);
        $matchCount = 0;

        foreach ($jobWords as $word) {
            if (str_contains($cvLower, mb_strtolower($word))) {
                $matchCount++;
            }
        }

        $totalKeywords = count($jobWords);
        if ($totalKeywords === 0) return 50;

        $ratio = $matchCount / $totalKeywords;

        return min(100, round($ratio * 120)); // 83% match = 100
    }

    private function scoreGenericKeywords(string $text): int
    {
        $textLower = mb_strtolower($text);
        $professionalKeywords = [
            'gestion', 'management', 'projet', 'équipe', 'développement', 'analyse',
            'communication', 'leadership', 'résultat', 'stratégie', 'client', 'performance',
            'project', 'team', 'development', 'analysis', 'strategy', 'results',
        ];

        $found = 0;
        foreach ($professionalKeywords as $kw) {
            if (str_contains($textLower, $kw)) {
                $found++;
            }
        }

        return min(100, round(($found / 8) * 100));
    }

    /**
     * Readability (10%): sentence length, vocabulary.
     */
    private function scoreReadability(string $text): int
    {
        $sentences = preg_split('/[.!?]+/', $text, -1, PREG_SPLIT_NO_EMPTY);
        $sentenceCount = count($sentences);

        if ($sentenceCount === 0) return 30;

        $totalWords = str_word_count($text);
        $avgWordsPerSentence = $totalWords / $sentenceCount;

        $score = 100;

        // Ideal: 10-20 words per sentence
        if ($avgWordsPerSentence > 30) {
            $score -= 30;
        } elseif ($avgWordsPerSentence > 25) {
            $score -= 15;
        } elseif ($avgWordsPerSentence < 5) {
            $score -= 10; // Too telegraphic
        }

        // Paragraph variety
        $paragraphs = preg_split('/\n\s*\n/', $text, -1, PREG_SPLIT_NO_EMPTY);
        if (count($paragraphs) < 3) {
            $score -= 15;
        }

        return max(0, min(100, $score));
    }

    /**
     * Action verbs (10%): detection of impactful verbs.
     */
    private function scoreActionVerbs(string $text): int
    {
        $textLower = mb_strtolower($text);

        $actionVerbs = [
            // French
            'développé', 'géré', 'dirigé', 'créé', 'optimisé', 'implémenté', 'conçu',
            'supervisé', 'coordonné', 'analysé', 'négocié', 'réalisé', 'amélioré',
            'lancé', 'piloté', 'accompagné', 'mis en place', 'réduit', 'augmenté',
            // English
            'developed', 'managed', 'led', 'created', 'optimized', 'implemented', 'designed',
            'supervised', 'coordinated', 'analyzed', 'negotiated', 'achieved', 'improved',
            'launched', 'reduced', 'increased', 'delivered', 'established', 'streamlined',
        ];

        $found = 0;
        foreach ($actionVerbs as $verb) {
            if (str_contains($textLower, $verb)) {
                $found++;
            }
        }

        // 5+ action verbs = perfect
        return min(100, round(($found / 5) * 100));
    }

    /**
     * Quantified results (15%): numbers, percentages, metrics.
     */
    private function scoreQuantifiedResults(string $text): int
    {
        // Count numbers (not dates)
        $numbers = preg_match_all('/\b\d+[%€$kKmM]?\b/', $text);
        // Count percentage patterns
        $percentages = preg_match_all('/\d+\s*%/', $text);
        // Count currency amounts
        $amounts = preg_match_all('/[\d,.]+\s*[€$]|[€$]\s*[\d,.]+/', $text);
        // Count multipliers (x2, x3, etc.)
        $multipliers = preg_match_all('/x\d+|\d+x/i', $text);

        $total = $percentages + $amounts + $multipliers + min($numbers, 5);

        // 4+ quantified results = perfect
        return min(100, round(($total / 4) * 100));
    }

    private function extractSignificantWords(string $text): array
    {
        $stopWords = ['le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'en', 'à', 'pour',
            'par', 'avec', 'dans', 'sur', 'ou', 'qui', 'que', 'est', 'sont', 'the', 'a', 'an',
            'and', 'or', 'in', 'on', 'for', 'with', 'to', 'of', 'is', 'are', 'nous', 'vous',
            'il', 'elle', 'ils', 'ce', 'cette', 'ces', 'être', 'avoir', 'au', 'aux', 'se', 'son',
        ];

        $words = preg_split('/[\s,;:.!?()]+/', mb_strtolower($text), -1, PREG_SPLIT_NO_EMPTY);
        $words = array_filter($words, fn($w) => mb_strlen($w) > 2 && !in_array($w, $stopWords));

        return array_values(array_unique($words));
    }

    private function generateRecommendations(int ...$scores): array
    {
        [$format, $contact, $sections, $keywords, $readability, $actionVerbs, $metrics] = $scores;
        $recs = [];

        if ($format < 60) {
            $recs[] = ['priority' => 'high', 'text' => 'Améliorez la structure de votre CV (longueur, mise en forme)'];
        }
        if ($contact < 60) {
            $recs[] = ['priority' => 'high', 'text' => 'Ajoutez vos coordonnées complètes (email, téléphone, LinkedIn)'];
        }
        if ($sections < 60) {
            $recs[] = ['priority' => 'high', 'text' => 'Structurez votre CV avec des sections claires (Expérience, Formation, Compétences)'];
        }
        if ($keywords < 60) {
            $recs[] = ['priority' => 'medium', 'text' => "Intégrez plus de mots-clés du secteur visé"];
        }
        if ($readability < 60) {
            $recs[] = ['priority' => 'medium', 'text' => 'Raccourcissez vos phrases pour améliorer la lisibilité'];
        }
        if ($actionVerbs < 60) {
            $recs[] = ['priority' => 'medium', 'text' => "Utilisez des verbes d'action (développé, géré, optimisé, etc.)"];
        }
        if ($metrics < 60) {
            $recs[] = ['priority' => 'high', 'text' => 'Quantifiez vos résultats avec des chiffres et pourcentages'];
        }

        return $recs;
    }
}
