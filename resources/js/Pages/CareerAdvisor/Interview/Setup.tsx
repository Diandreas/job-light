import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import InterviewSimulator from '@/Components/ai/specialized/InterviewSimulator';
import { useTranslation } from 'react-i18next';

export default function Setup({ auth }) {
    const { t } = useTranslation();
    const { url } = usePage();
    const queryParams = new URLSearchParams(url.split('?')[1] || '');
    const [loading, setLoading] = useState(false);

    const initialData = {
        jobTitle: queryParams.get('jobTitle') || '',
        companyName: queryParams.get('company') || ''
    };

    const handleSimulationStart = (data: any) => {
        setLoading(true);
        // Simulating API call/Setup time
        setTimeout(() => {
            const url = route('career-advisor.interview.session', {
                _query: data
            });
            router.visit(url);
        }, 800);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={t('career_advisor.services.interview_prep.enhanced_title')} />

            <div className="min-h-[calc(100vh-65px)] bg-neutral-50 dark:bg-neutral-950 py-20 px-10 flex items-center justify-center relative overflow-hidden">
                <div className="relative z-10 w-full">
                    <InterviewSimulator
                        userInfo={auth.user}
                        onSubmit={handleSimulationStart}
                        isLoading={loading}
                        initialData={initialData}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
