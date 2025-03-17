export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
    photo?: string;
    phone_number?: string;
    full_profession?: string;
    github?: string;
    linkedin?: string;
    wallet_balance?: number;
    summary?: {
        id: number;
        content: string;
    };
    experiences?: {
        id: number;
        title: string;
        company: string;
        start_date: string;
        end_date?: string;
        description: string;
    }[];
    competences?: {
        id: number;
        name: string;
        pivot?: {
            level?: string;
        };
    }[];
    educations?: {
        id: number;
        degree: string;
        institution: string;
        start_date: string;
        end_date?: string;
        description: string;
    }[];
    hobbies?: {
        id: number;
        name: string;
    }[];
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
};

export interface Competence {
    id: number;
    name: string;
    description?: string;
    category_id?: number;
    icon?: string;
    pivot?: {
        importance: 'required' | 'preferred' | 'nice_to_have';
    };
}

export interface JobListing {
    id: number;
    user_id: number;
    title: string;
    description: string;
    budget_min: number | null;
    budget_max: number | null;
    budget_type: 'hourly' | 'fixed';
    currency?: 'EUR' | 'XAF';
    duration: string | null;
    status: 'draft' | 'open' | 'closed';
    tokens_required: number;
    experience_level: 'beginner' | 'intermediate' | 'expert' | null;
    deadline: string | null;
    is_featured: boolean;
    views_count: number;
    created_at: string;
    updated_at: string;
    requiredSkills?: Competence[];
    applications_count?: number;
    recruiter?: User;
}

export interface JobApplication {
    id: number;
    job_listing_id: number;
    user_id: number;
    cover_letter: string;
    proposed_rate: number | null;
    status: 'pending' | 'shortlisted' | 'rejected' | 'hired';
    tokens_spent: number;
    viewed_at: string | null;
    created_at: string;
    updated_at: string;
    jobListing?: JobListing;
    applicant?: User;
    attachments?: JobApplicationAttachment[];
}

export interface JobApplicationAttachment {
    id: number;
    job_application_id: number;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: number;
    description: string | null;
    created_at: string;
    updated_at: string;
}
