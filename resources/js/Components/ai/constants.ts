import { Brain, FileText, MessageSquare, PenTool } from 'lucide-react';
import { Service } from '@/types/career-advisor';

export const DEFAULT_PROMPTS = {
    'career-advice': {
        fr: "Je souhaite obtenir des conseils pour ma carrière. Voici ma situation actuelle...",
        en: "I would like career advice. Here is my current situation..."
    },
    'cover-letter': {
        fr: "Je souhaite postuler pour un poste de [intitulé du poste] chez [nom de l'entreprise]. " +
            "Voici les informations clés du poste :\n\n" +
            "- Principales responsabilités :\n" +
            "- Compétences requises :\n" +
            "- Autres informations pertinentes :",
        en: "I want to apply for a [job title] position at [company name]. " +
            "Here are the key job details:\n\n" +
            "- Main responsibilities:\n" +
            "- Required skills:\n" +
            "- Other relevant information:"
    },
    'interview-prep': {
        fr: "J'ai un entretien pour le poste de [intitulé] chez [entreprise]. " +
            "Pouvez-vous m'aider à me préparer ? Voici les détails :\n\n" +
            "- Type d'entretien (technique, RH, etc.) :\n" +
            "- Durée prévue :\n" +
            "- Points spécifiques à préparer :",
        en: "I have an interview for [position] at [company]. " +
            "Can you help me prepare? Here are the details:\n\n" +
            "- Type of interview (technical, HR, etc.):\n" +
            "- Expected duration:\n" +
            "- Specific points to prepare:"
    },
    'resume-review': {
        fr: "J'aimerais améliorer mon CV. Voici mes objectifs spécifiques :\n\n" +
            "- Secteur/poste visé :\n" +
            "- Points à améliorer :\n" +
            "- Éléments à mettre en valeur :",
        en: "I would like to improve my resume. Here are my specific goals:\n\n" +
            "- Target sector/position:\n" +
            "- Areas to improve:\n" +
            "- Elements to highlight:"
    }
};

export const SERVICES: Service[] = [
    {
        id: 'career-advice',
        icon: Brain,
        title: 'services.career_advice.title',  // Clé de traduction
        description: 'services.career_advice.description',  // Clé de traduction
        cost: 3,
        category: 'advice',
        formats: ['conversation'],
        defaultPrompt: DEFAULT_PROMPTS['career-advice']
    },
    {
        id: 'cover-letter',
        icon: FileText,
        title: 'services.cover_letter.title',  // Clé de traduction
        description: 'services.cover_letter.description',  // Clé de traduction
        cost: 5,
        category: 'document',
        formats: ['docx', 'pdf'],
        defaultPrompt: DEFAULT_PROMPTS['cover-letter']
    },
    {
        id: 'interview-prep',
        icon: MessageSquare,
        title: 'services.interview_prep.title',  // Clé de traduction
        description: 'services.interview_prep.description',  // Clé de traduction
        cost: 5,
        category: 'interactive',
        formats: ['conversation'],
        defaultPrompt: DEFAULT_PROMPTS['interview-prep']
    },
    {
        id: 'resume-review',
        icon: PenTool,
        title: 'services.resume_review.title',  // Clé de traduction
        description: 'services.resume_review.description',  // Clé de traduction
        cost: 4,
        category: 'advice',
        formats: ['conversation'],
        defaultPrompt: DEFAULT_PROMPTS['resume-review']
    }
];
