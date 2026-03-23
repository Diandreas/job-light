import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import InterviewSimulator from '@/Components/ai/specialized/InterviewSimulator';
import { useTranslation } from 'react-i18next';
import { History as HistoryIcon } from 'lucide-react';
import HistoryDrawer from '@/Components/ai/HistoryDrawer';

export default function Setup({ auth }) {
    const { t } = useTranslation();
    const { url } = usePage();
    const queryParams = new URLSearchParams(url.split('?')[1] || '');
    const [loading, setLoading] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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
                <HistoryDrawer 
                    isOpen={isHistoryOpen} 
                    onClose={() => setIsHistoryOpen(false)}
                    context="interview_session"
                    title="Historique des Entretiens"
                    onSelect={(item) => {
                        if (item.structured_data) {
                            sessionStorage.setItem('interviewReport', JSON.stringify(item.structured_data));
                            router.visit(route('career-advisor.interview.report'));
                        }
                    }}
                />
                
                <div className="absolute right-10 top-10 z-20">
                    <button 
                        onClick={() => setIsHistoryOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full hover:shadow-xl transition-all text-xs font-bold text-neutral-600 dark:text-neutral-300"
                    >
                        <HistoryIcon className="w-4 h-4" />
                        Historique
                    </button>
                </div>

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
