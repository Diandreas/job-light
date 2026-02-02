export interface CoverLetterScore {
  overall: number;
  structure: {
    score: number;
    hasGreeting: boolean;
    hasIntro: boolean;
    hasBody: boolean;
    hasConclusion: boolean;
    hasClosing: boolean;
    bodyParagraphCount: number;
  };
  keywords: {
    score: number;
    detected: string[];
    missing: string[];
    total: number;
    matched: number;
  };
  tone: {
    professionalism: number;
    enthusiasm: number;
    confidence: number;
  };
  length: {
    wordCount: number;
    optimal: boolean;
    readingTime: number;
  };
  suggestions: Array<{
    type: 'critical' | 'recommended' | 'optional';
    message: string;
    impact: number;
  }>;
}

const GREETING_PATTERNS = [
  /Madame,?\s*Monsieur/i,
  /Cher\(e\)\s+Monsieur/i,
  /Bonjour/i,
  /Dear\s+(Sir|Madam|Hiring\s+Manager)/i,
];

const CLOSING_PATTERNS = [
  /Cordialement/i,
  /Bien\s+cordialement/i,
  /Respectueusement/i,
  /Sincèrement/i,
  /Sincerely/i,
  /Best\s+regards/i,
];

const PROFESSIONAL_WORDS = [
  'expérience',
  'compétences',
  'qualifications',
  'accomplissements',
  'responsabilités',
  'objectifs',
  'résultats',
  'expertise',
  'accomplishments',
  'achievements',
  'responsibilities',
  'qualifications',
];

const ENTHUSIASTIC_WORDS = [
  'enthousiaste',
  'passionné',
  'motivé',
  'ravi',
  'heureux',
  'excited',
  'passionate',
  'eager',
  'enthusiastic',
  'motivated',
];

const CONFIDENT_WORDS = [
  'capable',
  'maîtrise',
  'expertise',
  'réussi',
  'optimisé',
  'dirigé',
  'développé',
  'confident',
  'proficient',
  'skilled',
  'experienced',
  'accomplished',
];

export function scoreCoverLetter(
  content: string,
  jobKeywords: string[] = []
): CoverLetterScore {
  const lines = content.split('\n').filter((line) => line.trim());
  const words = content.split(/\s+/).filter((w) => w.trim());
  const wordCount = words.length;

  // Structure Analysis
  const hasGreeting = GREETING_PATTERNS.some((pattern) =>
    pattern.test(content)
  );
  const hasClosing = CLOSING_PATTERNS.some((pattern) => pattern.test(content));

  // Detect paragraphs (separated by double newlines or specific patterns)
  const paragraphs = content
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 50);
  const bodyParagraphCount = Math.max(0, paragraphs.length - 2); // Exclude intro and conclusion

  const hasIntro = paragraphs.length > 0;
  const hasBody = bodyParagraphCount >= 1;
  const hasConclusion = paragraphs.length >= 2;

  let structureScore = 0;
  if (hasGreeting) structureScore += 20;
  if (hasIntro) structureScore += 20;
  if (hasBody) structureScore += 25;
  if (hasConclusion) structureScore += 15;
  if (hasClosing) structureScore += 20;

  // Keyword Analysis
  const contentLower = content.toLowerCase();
  const detectedKeywords = jobKeywords.filter((keyword) =>
    contentLower.includes(keyword.toLowerCase())
  );
  const missingKeywords = jobKeywords.filter(
    (keyword) => !contentLower.includes(keyword.toLowerCase())
  );

  const keywordScore =
    jobKeywords.length > 0
      ? Math.round((detectedKeywords.length / jobKeywords.length) * 100)
      : 100;

  // Tone Analysis
  const professionalCount = PROFESSIONAL_WORDS.filter((word) =>
    contentLower.includes(word.toLowerCase())
  ).length;
  const enthusiasticCount = ENTHUSIASTIC_WORDS.filter((word) =>
    contentLower.includes(word.toLowerCase())
  ).length;
  const confidentCount = CONFIDENT_WORDS.filter((word) =>
    contentLower.includes(word.toLowerCase())
  ).length;

  const professionalism = Math.min(
    100,
    Math.round((professionalCount / 5) * 100)
  );
  const enthusiasm = Math.min(100, Math.round((enthusiasticCount / 3) * 100));
  const confidence = Math.min(100, Math.round((confidentCount / 4) * 100));

  // Length Analysis
  const optimalMinWords = 250;
  const optimalMaxWords = 400;
  const isOptimalLength =
    wordCount >= optimalMinWords && wordCount <= optimalMaxWords;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed

  // Generate Suggestions
  const suggestions: CoverLetterScore['suggestions'] = [];

  if (!hasGreeting) {
    suggestions.push({
      type: 'critical',
      message:
        'Ajoutez une formule de politesse au début (ex: "Madame, Monsieur,")',
      impact: 20,
    });
  }

  if (bodyParagraphCount < 2) {
    suggestions.push({
      type: 'recommended',
      message:
        'Ajoutez au moins 2-3 paragraphes dans le corps pour développer vos arguments',
      impact: 15,
    });
  }

  if (!hasClosing) {
    suggestions.push({
      type: 'critical',
      message:
        'Ajoutez une formule de politesse de fin (ex: "Cordialement,")',
      impact: 20,
    });
  }

  if (missingKeywords.length > 0 && missingKeywords.length <= 5) {
    suggestions.push({
      type: 'recommended',
      message: `Intégrez les mots-clés manquants: ${missingKeywords
        .slice(0, 3)
        .join(', ')}`,
      impact: 10,
    });
  }

  if (wordCount < optimalMinWords) {
    suggestions.push({
      type: 'recommended',
      message: `Développez votre lettre (actuellement ${wordCount} mots, optimal: 250-400)`,
      impact: 8,
    });
  } else if (wordCount > optimalMaxWords) {
    suggestions.push({
      type: 'optional',
      message: `Condensez votre lettre (actuellement ${wordCount} mots, optimal: 250-400)`,
      impact: 5,
    });
  }

  if (enthusiasticCount === 0) {
    suggestions.push({
      type: 'optional',
      message:
        'Ajoutez des expressions montrant votre motivation et enthousiasme',
      impact: 7,
    });
  }

  if (professionalism < 50) {
    suggestions.push({
      type: 'recommended',
      message:
        'Utilisez un vocabulaire plus professionnel et des termes techniques',
      impact: 12,
    });
  }

  // Calculate Overall Score
  const overallScore = Math.round(
    structureScore * 0.4 +
      keywordScore * 0.3 +
      professionalism * 0.15 +
      (isOptimalLength ? 100 : 70) * 0.15
  );

  return {
    overall: overallScore,
    structure: {
      score: structureScore,
      hasGreeting,
      hasIntro,
      hasBody,
      hasConclusion,
      hasClosing,
      bodyParagraphCount,
    },
    keywords: {
      score: keywordScore,
      detected: detectedKeywords,
      missing: missingKeywords,
      total: jobKeywords.length,
      matched: detectedKeywords.length,
    },
    tone: {
      professionalism,
      enthusiasm,
      confidence,
    },
    length: {
      wordCount,
      optimal: isOptimalLength,
      readingTime,
    },
    suggestions: suggestions.sort((a, b) => b.impact - a.impact),
  };
}
