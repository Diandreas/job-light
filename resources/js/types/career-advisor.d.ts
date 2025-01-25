// types/career-advisor.d.ts

export interface UserInfo {
    name: string;
    profession?: string;
    experiences: Experience[];
    competences: string[];
    education: Education[];
    languages: Language[];
}

export interface Experience {
    title: string;
    company: string;
    duration: string;
    description?: string;
}

export interface Education {
    degree: string;
    institution: string;
    year: string;
    field?: string;
}

export interface Language {
    name: string;
    level: string;
}

export interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface ChatHistory {
    messages: Message[];
    contextId: string;
}

export interface Service {
    id: string;
    icon: LucideIcon;
    title: string;
    description: string;
    cost: number;
    category: 'advice' | 'document' | 'interactive';
    formats: string[];
}

export interface ExportRequest {
    contextId: string;
    format: 'pdf' | 'docx';
    serviceId: string;
}

export interface AIResponse {
    message: string;
    tokens: number;
}

export interface ChatRequest {
    message: string;
    contextId: string;
    language: 'fr' | 'en';
    serviceId: string;
    history?: Message[];
}
