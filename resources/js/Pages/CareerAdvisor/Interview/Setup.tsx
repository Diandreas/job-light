import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import InterviewSimulator from '@/Components/ai/specialized/InterviewSimulator';

export default function Setup({ auth }) {
    const [loading, setLoading] = useState(false);

    const handleSimulationStart = (data) => {
        setLoading(true);
        // In a real scenario, we might save this config to the backend first
        // then redirect to the active session.
        // For now, we'll pass the data as state to the session page or simular.

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
            <Head title="Interview Simulation" />

            <div className="min-h-[calc(100vh-65px)] bg-neutral-50 dark:bg-neutral-950 py-20 px-10 flex items-center justify-center relative overflow-hidden">
                <div className="relative z-10 w-full">
                    <InterviewSimulator
                        userInfo={auth.user}
                        onSubmit={handleSimulationStart}
                        isLoading={loading}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
