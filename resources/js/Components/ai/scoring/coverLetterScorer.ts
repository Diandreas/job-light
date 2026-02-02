/**
 * Client-side cover letter scorer (mirrors backend CoverLetterAnalyzer).
 * Deterministic, instant, free.
 */

interface CoverLetterScoreResult {
    overallScore: number;
    structureScore: number;
    lengthScore: number;
    readabilityScore: number;
    keywordScore: number;
    formalityScore: number;
    wordCount: number;
    paragraphCount: number;
    suggestions: string[];
}

export function scoreCoverLetter(letterText: string, jobDescription: string = ''): CoverLetterScoreResult {
    const structureScore = scoreStructure(letterText);
    const lengthScore = scoreLength(letterText);
    const readabilityScore = scoreReadability(letterText);
    const keywordScore = scoreKeywords(letterText, jobDescription);
    const formalityScore = scoreFormality(letterText);

    const overall = Math.round(
        structureScore * 0.30 +
        lengthScore * 0.15 +
        readabilityScore * 0.15 +
        keywordScore * 0.25 +
        formalityScore * 0.15
    );

    const wordCount = letterText.split(/\s+/).filter(w => w.length > 0).length;
    const paragraphCount = letterText.trim().split(/\n\s*\n/).filter(p => p.trim().length > 0).length;

    const suggestions: string[] = [];
    if (structureScore < 60) suggestions.push('Ajoutez : salutation, introduction, corps, conclusion, formule de politesse');
    if (lengthScore < 60) suggestions.push('Visez 200-400 mots');
    if (readabilityScore < 60) suggestions.push('Phrases plus courtes, 3-5 paragraphes');
    if (keywordScore < 60) suggestions.push("Intégrez les mots-clés de l'offre d'emploi");
    if (formalityScore < 60) suggestions.push('Adoptez un ton plus professionnel');

    return {
        overallScore: overall,
        structureScore,
        lengthScore,
        readabilityScore,
        keywordScore,
        formalityScore,
        wordCount,
        paragraphCount,
        suggestions,
    };
}

function scoreStructure(text: string): number {
    const lower = text.toLowerCase();
    let score = 0;

    const checks: string[][] = [
        ['madame', 'monsieur', 'dear', 'bonjour', 'cher', 'chère'],
        ['je me permets', 'je souhaite', 'candidature', 'postuler', 'i am writing'],
        ['expérience', 'compétences', 'skills', 'experience', 'qualifications'],
        ['entretien', 'interview', 'discuter', 'disponible', 'available'],
        ['cordialement', 'sincères salutations', 'sincerely', 'regards', 'veuillez agréer'],
    ];

    for (const keywords of checks) {
        if (keywords.some(kw => lower.includes(kw))) score += 20;
    }

    return Math.min(100, score);
}

function scoreLength(text: string): number {
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount < 100) return 30;
    if (wordCount < 200) return 60;
    if (wordCount <= 400) return 100;
    if (wordCount <= 600) return 70;
    return 40;
}

function scoreReadability(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 20;
    const words = text.split(/\s+/).length;
    const avg = words / sentences.length;
    let score = 100;
    if (avg > 35) score -= 30;
    else if (avg > 25) score -= 15;
    else if (avg < 8) score -= 10;

    const paragraphs = text.trim().split(/\n\s*\n/).filter(p => p.trim().length > 0);
    if (paragraphs.length < 2) score -= 20;
    else if (paragraphs.length > 7) score -= 10;

    return Math.max(0, Math.min(100, score));
}

function scoreKeywords(letterText: string, jobDescription: string): number {
    if (!jobDescription) {
        const lower = letterText.toLowerCase();
        const keywords = ['motivation', 'compétences', 'expérience', 'contribuer', 'équipe',
            'valeurs', 'objectif', 'projet', 'développement', 'résultats'];
        const found = keywords.filter(kw => lower.includes(kw)).length;
        return Math.min(100, Math.round((found / 6) * 100));
    }

    const stopWords = new Set(['le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'en', 'à',
        'pour', 'par', 'avec', 'dans', 'sur', 'ou', 'the', 'a', 'an', 'and', 'or', 'in']);
    const jobWords = [...new Set(
        jobDescription.toLowerCase().split(/[\s,;:.!?()]+/)
            .filter(w => w.length > 2 && !stopWords.has(w))
    )];
    const letterLower = letterText.toLowerCase();
    const found = jobWords.filter(w => letterLower.includes(w)).length;
    if (jobWords.length === 0) return 50;
    return Math.min(100, Math.round((found / jobWords.length) * 130));
}

function scoreFormality(text: string): number {
    const lower = text.toLowerCase();
    let score = 80;

    const informal = ['salut', 'coucou', 'hey', 'yo', 'lol', 'mdr', 'super cool', 'genre', 'truc'];
    for (const word of informal) {
        if (lower.includes(word)) score -= 15;
    }

    const formal = ['je me permets', 'veuillez', 'je vous prie', 'cordialement', 'sincères salutations'];
    for (const word of formal) {
        if (lower.includes(word)) score += 5;
    }

    return Math.max(0, Math.min(100, score));
}
