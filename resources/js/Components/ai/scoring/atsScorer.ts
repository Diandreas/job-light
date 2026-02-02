/**
 * Client-side ATS scorer (mirrors backend ATSScoringService).
 * Deterministic, instant, free.
 */

interface ATSScoreResult {
    globalScore: number;
    breakdown: Record<string, { score: number; weight: number; label: string }>;
    recommendations: Array<{ priority: string; text: string }>;
}

export function scoreATS(cvText: string, jobDescription: string = ''): ATSScoreResult {
    const formatScore = scoreFormat(cvText);
    const contactScore = scoreContactInfo(cvText);
    const sectionsScore = scoreSections(cvText);
    const keywordScore = scoreKeywords(cvText, jobDescription);
    const readabilityScore = scoreReadability(cvText);
    const actionVerbScore = scoreActionVerbs(cvText);
    const metricsScore = scoreQuantifiedResults(cvText);

    const overall = Math.round(
        formatScore * 0.20 +
        contactScore * 0.10 +
        sectionsScore * 0.15 +
        keywordScore * 0.20 +
        readabilityScore * 0.10 +
        actionVerbScore * 0.10 +
        metricsScore * 0.15
    );

    const recommendations: Array<{ priority: string; text: string }> = [];
    if (formatScore < 60) recommendations.push({ priority: 'high', text: 'Améliorez la structure de votre CV' });
    if (contactScore < 60) recommendations.push({ priority: 'high', text: 'Ajoutez vos coordonnées complètes' });
    if (sectionsScore < 60) recommendations.push({ priority: 'high', text: 'Structurez avec des sections claires' });
    if (keywordScore < 60) recommendations.push({ priority: 'medium', text: 'Intégrez plus de mots-clés du secteur' });
    if (actionVerbScore < 60) recommendations.push({ priority: 'medium', text: "Utilisez des verbes d'action" });
    if (metricsScore < 60) recommendations.push({ priority: 'high', text: 'Quantifiez vos résultats' });

    return {
        globalScore: overall,
        breakdown: {
            format: { score: formatScore, weight: 20, label: 'Format & Structure' },
            contact: { score: contactScore, weight: 10, label: 'Informations de contact' },
            sections: { score: sectionsScore, weight: 15, label: 'Sections détectées' },
            keywords: { score: keywordScore, weight: 20, label: 'Densité mots-clés' },
            readability: { score: readabilityScore, weight: 10, label: 'Lisibilité' },
            actionVerbs: { score: actionVerbScore, weight: 10, label: "Verbes d'action" },
            metrics: { score: metricsScore, weight: 15, label: 'Résultats quantifiés' },
        },
        recommendations,
    };
}

function scoreFormat(text: string): number {
    let score = 100;
    if (text.length < 200) score -= 40;
    else if (text.length < 500) score -= 20;
    else if (text.length > 5000) score -= 15;

    const lines = text.split('\n');
    if (lines.length < 5) score -= 20;

    return clamp(score);
}

function scoreContactInfo(text: string): number {
    let score = 0;
    const lower = text.toLowerCase();
    if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)) score += 30;
    if (/(\+?\d[\d\s\-().]{7,}\d)/.test(text)) score += 25;
    if (/adresse|address|ville|city|location/i.test(text)) score += 15;
    if (lower.includes('linkedin')) score += 15;
    if (/github|portfolio|website/i.test(text)) score += 15;
    return Math.min(100, score);
}

function scoreSections(text: string): number {
    const lower = text.toLowerCase();
    let score = 0;
    const sections: Record<string, string[]> = {
        experience: ['expérience', 'experience', 'parcours professionnel', 'work experience'],
        education: ['formation', 'education', 'études', 'diplôme'],
        skills: ['compétences', 'skills', 'aptitudes', 'technologies'],
        languages: ['langues', 'languages'],
        summary: ['résumé', 'summary', 'profil', 'profile', 'objectif'],
    };
    for (const keywords of Object.values(sections)) {
        if (keywords.some(kw => lower.includes(kw))) score += 20;
    }
    return Math.min(100, score);
}

function scoreKeywords(cvText: string, jobDescription: string): number {
    if (!jobDescription) {
        const lower = cvText.toLowerCase();
        const genericKeywords = ['gestion', 'management', 'projet', 'équipe', 'développement', 'analyse',
            'communication', 'leadership', 'résultat', 'stratégie', 'client', 'performance'];
        const found = genericKeywords.filter(kw => lower.includes(kw)).length;
        return Math.min(100, Math.round((found / 6) * 100));
    }
    const jobWords = extractSignificantWords(jobDescription);
    const cvLower = cvText.toLowerCase();
    const matchCount = jobWords.filter(w => cvLower.includes(w.toLowerCase())).length;
    if (jobWords.length === 0) return 50;
    return Math.min(100, Math.round((matchCount / jobWords.length) * 120));
}

function scoreReadability(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 30;
    const words = text.split(/\s+/).length;
    const avg = words / sentences.length;
    let score = 100;
    if (avg > 30) score -= 30;
    else if (avg > 25) score -= 15;
    else if (avg < 5) score -= 10;
    return clamp(score);
}

function scoreActionVerbs(text: string): number {
    const lower = text.toLowerCase();
    const verbs = [
        'développé', 'géré', 'dirigé', 'créé', 'optimisé', 'implémenté', 'conçu',
        'supervisé', 'coordonné', 'analysé', 'négocié', 'réalisé', 'amélioré',
        'developed', 'managed', 'led', 'created', 'optimized', 'implemented', 'designed',
    ];
    const found = verbs.filter(v => lower.includes(v)).length;
    return Math.min(100, Math.round((found / 5) * 100));
}

function scoreQuantifiedResults(text: string): number {
    const percentages = (text.match(/\d+\s*%/g) || []).length;
    const amounts = (text.match(/[\d,.]+\s*[€$]|[€$]\s*[\d,.]+/g) || []).length;
    const multipliers = (text.match(/x\d+|\d+x/gi) || []).length;
    const total = percentages + amounts + multipliers;
    return Math.min(100, Math.round((total / 4) * 100));
}

function extractSignificantWords(text: string): string[] {
    const stopWords = new Set(['le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'en', 'à',
        'pour', 'par', 'avec', 'dans', 'sur', 'ou', 'qui', 'que', 'est', 'the', 'a', 'an',
        'and', 'or', 'in', 'on', 'for', 'with', 'to', 'of', 'is', 'are']);
    const words = text.toLowerCase().split(/[\s,;:.!?()]+/).filter(w => w.length > 2 && !stopWords.has(w));
    return [...new Set(words)];
}

function clamp(score: number): number {
    return Math.max(0, Math.min(100, score));
}
