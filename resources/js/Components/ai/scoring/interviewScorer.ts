/**
 * Client-side interview answer scorer (mirrors backend InterviewScoringService).
 * Deterministic, instant, free.
 */

interface InterviewScoreResult {
    overallScore: number;
    breakdown: Record<string, { score: number; weight: number; label: string }>;
    tips: string[];
}

export function scoreInterview(answer: string, question: string = '', language: string = 'fr'): InterviewScoreResult {
    const isFr = language !== 'en';
    const starScore = scoreSTAR(answer, isFr);
    const completenessScore = scoreCompleteness(answer, isFr);
    const specificityScore = scoreSpecificity(answer);
    const lengthScore = scoreLengthAppropriateness(answer);
    const confidenceScore = scoreConfidence(answer, isFr);

    const overall = Math.round(
        starScore * 0.40 +
        completenessScore * 0.20 +
        specificityScore * 0.20 +
        lengthScore * 0.10 +
        confidenceScore * 0.10
    );

    const tips: string[] = [];
    if (starScore < 60) tips.push(isFr ? 'Structurez avec la méthode STAR' : 'Structure using the STAR method');
    if (completenessScore < 60) tips.push(isFr ? 'Ajoutez des exemples concrets et résultats chiffrés' : 'Add concrete examples and quantified results');
    if (specificityScore < 60) tips.push(isFr ? 'Évitez le langage vague, donnez des détails spécifiques' : 'Avoid vague language, provide specific details');
    if (lengthScore < 60) tips.push(isFr ? 'Visez 100-300 mots (1-2 minutes)' : 'Aim for 100-300 words (1-2 minutes)');
    if (confidenceScore < 60) tips.push(isFr ? 'Réduisez les mots de remplissage' : 'Reduce filler words');

    return {
        overallScore: overall,
        breakdown: {
            star: { score: starScore, weight: 40, label: 'Méthode STAR' },
            completeness: { score: completenessScore, weight: 20, label: 'Complétude' },
            specificity: { score: specificityScore, weight: 20, label: 'Spécificité' },
            length: { score: lengthScore, weight: 10, label: 'Longueur' },
            confidence: { score: confidenceScore, weight: 10, label: 'Confiance' },
        },
        tips,
    };
}

function scoreSTAR(text: string, isFr: boolean): number {
    const lower = text.toLowerCase();
    let score = 0;
    const keywords = isFr ? {
        situation: ['situation', 'contexte', 'lorsque', 'dans le cadre'],
        task: ['tâche', 'défi', 'objectif', 'responsable de', 'devais'],
        action: ['j\'ai décidé', 'j\'ai mis en place', 'j\'ai développé', 'mon approche'],
        result: ['résultat', 'atteint', 'amélioré', 'augmenté', 'réduit', 'réussi'],
    } : {
        situation: ['situation', 'context', 'when i was', 'during'],
        task: ['task', 'challenge', 'objective', 'responsible for', 'needed to'],
        action: ['i decided', 'i implemented', 'i developed', 'my approach'],
        result: ['result', 'achieved', 'improved', 'increased', 'reduced', 'successfully'],
    };

    for (const kws of Object.values(keywords)) {
        if (kws.some(kw => lower.includes(kw))) score += 25;
    }
    return Math.min(100, score);
}

function scoreCompleteness(text: string, isFr: boolean): number {
    const lower = text.toLowerCase();
    let score = 0;

    const examples = isFr ? ['par exemple', 'notamment', 'concrètement'] : ['for example', 'specifically', 'for instance'];
    if (examples.some(kw => lower.includes(kw))) score += 20;
    if (/\d+\s*(mois|ans|semaines|months|years|weeks)/i.test(text)) score += 20;

    const team = isFr ? ['équipe', 'collègue', 'collaboration'] : ['team', 'colleague', 'collaboration'];
    if (team.some(kw => lower.includes(kw))) score += 20;

    const learning = isFr ? ['appris', 'enseignement', 'amélioré'] : ['learned', 'takeaway', 'improved'];
    if (learning.some(kw => lower.includes(kw))) score += 20;

    if (/\d+\s*%/.test(text) || /[\d,.]+\s*[€$kKmM]/.test(text)) score += 20;

    return Math.min(100, score);
}

function scoreSpecificity(text: string): number {
    const lower = text.toLowerCase();
    let score = 50;

    const vague = ['généralement', 'habituellement', 'parfois', 'peut-être', 'je pense',
        'generally', 'usually', 'sometimes', 'maybe', 'i think', 'sort of'];
    const vagueCount = vague.filter(v => lower.includes(v)).length;
    score -= vagueCount * 10;

    const specificCount = (text.match(/[A-Z][a-z]+(?:\s[A-Z][a-z]+)*/g) || []).length;
    score += Math.min(30, specificCount * 5);

    const numberCount = (text.match(/\b\d+/g) || []).length;
    score += Math.min(20, numberCount * 5);

    return Math.max(0, Math.min(100, score));
}

function scoreLengthAppropriateness(text: string): number {
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount < 30) return 20;
    if (wordCount < 60) return 50;
    if (wordCount <= 300) return 100;
    if (wordCount <= 500) return 70;
    return 40;
}

function scoreConfidence(text: string, isFr: boolean): number {
    const lower = text.toLowerCase();
    let score = 100;

    const fillers = isFr
        ? ['euh', 'hum', 'ben', 'genre', 'en fait', 'voilà', 'du coup', 'bah']
        : ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally'];

    for (const fw of fillers) {
        const count = lower.split(fw).length - 1;
        score -= count * 8;
    }

    const hedging = isFr
        ? ['je ne suis pas sûr', 'je ne sais pas si']
        : ['i\'m not sure', 'i don\'t know if'];

    for (const h of hedging) {
        if (lower.includes(h)) score -= 15;
    }

    return Math.max(0, Math.min(100, score));
}
