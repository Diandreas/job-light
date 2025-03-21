import React from 'react';
import { useTranslation } from 'react-i18next';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/ui/button';
import { motion } from 'framer-motion';

interface Props {
    status: number;
}

export default function Error({ status }: Props) {
    const { t } = useTranslation();

    const title = status === 404 ? t('errors.404.title') : t('errors.500.title');
    const description = status === 404 ? t('errors.404.description') : t('errors.500.description');

    return (
        <GuestLayout>
            <Head title={title} />
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <h1 className="text-6xl font-bold text-gray-900">{status}</h1>
                            <h2 className="text-3xl font-semibold text-gray-800">{title}</h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{description}</p>
                        </div>

                        <div className="flex justify-center space-x-4">
                            <Button
                                onClick={() => window.history.back()}
                                variant="outline"
                                className="text-gray-700 hover:text-gray-900"
                            >
                                {t('errors.actions.back')}
                            </Button>
                            <Button
                                onClick={() => window.location.href = '/'}
                                className="bg-gradient-to-r from-amber-500 to-purple-500 text-white hover:from-amber-600 hover:to-purple-600"
                            >
                                {t('errors.actions.home')}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </GuestLayout>
    );
}