<?php

namespace App\Services\CareerAdvisor;

class CoverLetterAnalyzer
{
    /**
     * Analyze a cover letter locally (structure scoring).
     * AI-based content analysis is optional and handled separately.
     */
    public function analyze(string $letterText, string $jobDescription = ''): array
    {
        $structureScore = $this->scoreStructure($letterText);
        $lengthScore = $this->scoreLength($letterText);
        $readabilityScore = $this->scoreReadability($letterText);
        $keywordScore = $this->scoreKeywordDensity($letterText, $jobDescription);
        $formalityScore = $this->scoreFormality($letterText);

        $overall = round(
            $structureScore * 0.30 +
            $lengthScore * 0.15 +
            $readabilityScore * 0.15 +
            $keywordScore * 0.25 +
            $formalityScore * 0.15
        );

        return [
            'structureScore' => $structureScore,
            'lengthScore' => $lengthScore,
            'readabilityScore' => $readabilityScore,
            'keywordScore' => $keywordScore,
            'formalityScore' => $formalityScore,
            'overallScore' => $overall,
            'wordCount' => str_word_count($letterText),
            'paragraphCount' => count(preg_split('/\n\s*\n/', trim($letterText), -1, PREG_SPLIT_NO_EMPTY)),
            'suggestions' => $this->generateSuggestions($structureScore, $lengthScore, $readabilityScore, $keywordScore, $formalityScore),
        ];
    }

    /**
     * Structure (30%): greeting, intro, body, conclusion, signature.
     */
    private function scoreStructure(string $text): int
    {
        $textLower = mb_strtolower($text);
        $score = 0;

        // Greeting / Salutation
        $greetings = ['madame', 'monsieur', 'dear', 'bonjour', 'cher', 'chère', 'à l\'attention'];
        foreach ($greetings as $g) {
            if (str_contains($textLower, $g)) {
                $score += 20;
                break;
            }
        }

        // Introduction (motivation / interest expression)
        $introKeywords = ['je me permets', 'je souhaite', 'je suis intéressé', 'i am writing',
            'candidature', 'postuler', 'poste de', 'application', 'position'];
        foreach ($introKeywords as $kw) {
            if (str_contains($textLower, $kw)) {
                $score += 20;
                break;
            }
        }

        // Body (experience / skills mention)
        $bodyKeywords = ['expérience', 'compétences', 'skills', 'experience', 'formation',
            'qualifications', 'réalisations', 'achievements'];
        foreach ($bodyKeywords as $kw) {
            if (str_contains($textLower, $kw)) {
                $score += 20;
                break;
            }
        }

        // Conclusion (call to action)
        $conclusionKeywords = ['entretien', 'interview', 'rencontre', 'discuter', 'disponible',
            'available', 'contact', 'convenir', 'rendez-vous'];
        foreach ($conclusionKeywords as $kw) {
            if (str_contains($textLower, $kw)) {
                $score += 20;
                break;
            }
        }

        // Closing formula / Signature
        $closingKeywords = ['cordialement', 'sincères salutations', 'respectueusement',
            'sincerely', 'regards', 'veuillez agréer', 'salutations distinguées'];
        foreach ($closingKeywords as $kw) {
            if (str_contains($textLower, $kw)) {
                $score += 20;
                break;
            }
        }

        return min(100, $score);
    }

    /**
     * Length (15%): ideal cover letter length.
     */
    private function scoreLength(string $text): int
    {
        $wordCount = str_word_count($text);

        // Ideal: 200-400 words
        if ($wordCount < 100) {
            return 30;
        } elseif ($wordCount < 200) {
            return 60;
        } elseif ($wordCount <= 400) {
            return 100;
        } elseif ($wordCount <= 600) {
            return 70;
        } else {
            return 40;
        }
    }

    /**
     * Readability (15%): sentence length, paragraph structure.
     */
    private function scoreReadability(string $text): int
    {
        $sentences = preg_split('/[.!?]+/', $text, -1, PREG_SPLIT_NO_EMPTY);
        $sentenceCount = count($sentences);

        if ($sentenceCount === 0) return 20;

        $totalWords = str_word_count($text);
        $avgWords = $totalWords / $sentenceCount;

        $score = 100;

        if ($avgWords > 35) {
            $score -= 30;
        } elseif ($avgWords > 25) {
            $score -= 15;
        } elseif ($avgWords < 8) {
            $score -= 10;
        }

        // Check paragraph count (ideal: 3-5)
        $paragraphs = preg_split('/\n\s*\n/', trim($text), -1, PREG_SPLIT_NO_EMPTY);
        $paraCount = count($paragraphs);

        if ($paraCount < 2) {
            $score -= 20;
        } elseif ($paraCount > 7) {
            $score -= 10;
        }

        return max(0, min(100, $score));
    }

    /**
     * Keyword density (25%): matching with job description.
     */
    private function scoreKeywordDensity(string $letterText, string $jobDescription): int
    {
        if (empty($jobDescription)) {
            return $this->scoreGenericProfessionalContent($letterText);
        }

        $jobWords = $this->extractKeywords($jobDescription);
        $letterLower = mb_strtolower($letterText);
        $found = 0;

        foreach ($jobWords as $word) {
            if (str_contains($letterLower, mb_strtolower($word))) {
                $found++;
            }
        }

        $total = count($jobWords);
        if ($total === 0) return 50;

        return min(100, round(($found / $total) * 130));
    }

    private function scoreGenericProfessionalContent(string $text): int
    {
        $textLower = mb_strtolower($text);
        $keywords = [
            'motivation', 'compétences', 'expérience', 'contribuer', 'équipe',
            'valeurs', 'objectif', 'projet', 'développement', 'résultats',
            'skills', 'experience', 'contribute', 'team', 'values', 'results',
        ];

        $found = 0;
        foreach ($keywords as $kw) {
            if (str_contains($textLower, $kw)) {
                $found++;
            }
        }

        return min(100, round(($found / 6) * 100));
    }

    /**
     * Formality (15%): appropriate tone for a cover letter.
     */
    private function scoreFormality(string $text): int
    {
        $textLower = mb_strtolower($text);
        $score = 80; // Start neutral-positive

        // Informal words that lower score
        $informal = ['salut', 'coucou', 'hey', 'yo', 'lol', 'mdr', 'super cool', 'trop bien',
            'genre', 'truc', 'machin', 'stuff', 'thing', 'gonna', 'wanna'];

        foreach ($informal as $word) {
            if (str_contains($textLower, $word)) {
                $score -= 15;
            }
        }

        // Formal expressions that raise score
        $formal = ['je me permets', 'veuillez', 'je vous prie', 'je serais',
            'cordialement', 'sincères salutations', 'i would like', 'please find'];

        foreach ($formal as $word) {
            if (str_contains($textLower, $word)) {
                $score += 5;
            }
        }

        return max(0, min(100, $score));
    }

    private function extractKeywords(string $text): array
    {
        $stopWords = ['le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'en', 'à', 'pour',
            'par', 'avec', 'dans', 'sur', 'ou', 'qui', 'que', 'est', 'the', 'a', 'an',
            'and', 'or', 'in', 'on', 'for', 'with', 'to', 'of', 'is', 'are'];

        $words = preg_split('/[\s,;:.!?()]+/', mb_strtolower($text), -1, PREG_SPLIT_NO_EMPTY);
        $words = array_filter($words, fn($w) => mb_strlen($w) > 2 && !in_array($w, $stopWords));

        return array_values(array_unique($words));
    }

    private function generateSuggestions(int ...$scores): array
    {
        [$structure, $length, $readability, $keywords, $formality] = $scores;
        $suggestions = [];

        if ($structure < 60) {
            $suggestions[] = 'Assurez-vous que votre lettre contient : salutation, introduction, corps, conclusion et formule de politesse';
        }
        if ($length < 60) {
            $suggestions[] = 'Visez une longueur de 200 à 400 mots pour un impact optimal';
        }
        if ($readability < 60) {
            $suggestions[] = 'Améliorez la lisibilité : phrases plus courtes, 3-5 paragraphes distincts';
        }
        if ($keywords < 60) {
            $suggestions[] = 'Intégrez davantage de mots-clés de l\'offre d\'emploi dans votre lettre';
        }
        if ($formality < 60) {
            $suggestions[] = 'Adoptez un ton plus professionnel et formel';
        }

        return $suggestions;
    }
}
