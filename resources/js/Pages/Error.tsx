import React from 'react';
import { useTranslation } from 'react-i18next';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/ui/button';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, ArrowLeft, RefreshCw, Mail, Search, Users, Briefcase } from 'lucide-react';

interface Props {
    status: number;
}

export default function Error({ status }: Props) {
    const { t } = useTranslation();

    const getErrorConfig = () => {
        switch (status) {
            case 404:
                return {
                    title: t('errors.404.title', 'Page Introuvable'),
                    description: t('errors.404.description', 'Désolé, la page que vous recherchez n\'existe pas.'),
                    suggestion: t('errors.404.suggestion', 'Ne vous inquiétez pas, remettons-vous sur la bonne voie !'),
                    icon: Search,
                    iconColor: 'text-blue-500',
                    bgGradient: 'from-blue-50 to-indigo-100',
                    illustration: '🔍'
                };
            case 500:
                return {
                    title: t('errors.500.title', 'Erreur Serveur'),
                    description: t('errors.500.description', 'Oups ! Quelque chose s\'est mal passé sur nos serveurs.'),
                    suggestion: t('errors.500.suggestion', 'Veuillez réessayer dans quelques instants.'),
                    icon: AlertTriangle,
                    iconColor: 'text-red-500',
                    bgGradient: 'from-red-50 to-orange-100',
                    illustration: '⚠️'
                };
            case 403:
                return {
                    title: t('errors.403.title', 'Accès Interdit'),
                    description: t('errors.403.description', 'Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource.'),
                    suggestion: t('errors.403.suggestion', 'Si vous pensez qu\'il s\'agit d\'une erreur, veuillez contacter le support.'),
                    icon: AlertTriangle,
                    iconColor: 'text-yellow-500',
                    bgGradient: 'from-yellow-50 to-amber-100',
                    illustration: '🚫'
                };
            case 503:
                return {
                    title: t('errors.503.title', 'Service Indisponible'),
                    description: t('errors.503.description', 'Notre service est temporairement indisponible.'),
                    suggestion: t('errors.503.suggestion', 'Veuillez réessayer dans quelques minutes.'),
                    icon: AlertTriangle,
                    iconColor: 'text-purple-500',
                    bgGradient: 'from-purple-50 to-pink-100',
                    illustration: '🔧'
                };
            default:
                return {
                    title: 'Erreur',
                    description: 'Une erreur inattendue s\'est produite.',
                    suggestion: 'Veuillez réessayer.',
                    icon: AlertTriangle,
                    iconColor: 'text-gray-500',
                    bgGradient: 'from-gray-50 to-gray-100',
                    illustration: '❌'
                };
        }
    };

    const config = getErrorConfig();
    const IconComponent = config.icon;

    const quickLinks = [
        {
            name: t('nav.dashboard', 'Tableau de bord'),
            href: '/dashboard',
            icon: Home,
            description: t('errors.quickLinks.dashboard', 'Retour à votre espace personnel')
        },
        {
            name: t('nav.cv', 'Mon CV'),
            href: '/cv-infos',
            icon: Users,
            description: t('errors.quickLinks.cv', 'Gérer vos informations CV')
        },
        {
            name: t('nav.jobs', 'Emplois'),
            href: '/jobs',
            icon: Briefcase,
            description: t('errors.quickLinks.jobs', 'Découvrir les opportunités')
        }
    ];

    return (
        <GuestLayout>
            <Head title={`${status} - ${config.title}`} />
            <div className={`min-h-screen bg-gradient-to-br ${config.bgGradient} relative overflow-hidden`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-20 h-20 bg-current rounded-full"></div>
                    <div className="absolute top-40 right-20 w-16 h-16 bg-current rounded-full"></div>
                    <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-current rounded-full"></div>
                    <div className="absolute bottom-40 right-1/3 w-8 h-8 bg-current rounded-full"></div>
                </div>

                <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center"
                        >
                            {/* Error Number and Icon */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                className="mb-8"
                            >
                                <div className="relative inline-block">
                                    <span className="text-8xl sm:text-9xl font-bold text-gray-800 dark:text-gray-200 relative z-10">
                                        {status}
                                    </span>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10"
                                    >
                                        <IconComponent className={`w-32 h-32 ${config.iconColor} opacity-20`} />
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Error Content */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="space-y-6 mb-12"
                            >
                                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                                    {config.title}
                                </h1>
                                <div className="space-y-2">
                                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                                        {config.description}
                                    </p>
                                    <p className="text-base font-medium text-gray-800 dark:text-gray-200">
                                        {config.suggestion}
                                    </p>
                                </div>
                            </motion.div>

                            {/* Action Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="flex flex-wrap justify-center gap-4 mb-12"
                            >
                                <Button
                                    onClick={() => window.history.back()}
                                    variant="outline"
                                    size="lg"
                                    className="bg-white/80 backdrop-blur-sm hover:bg-white border-gray-300 text-gray-700 hover:text-gray-900 shadow-lg"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    {t('errors.actions.back', 'Retour')}
                                </Button>

                                <Button
                                    onClick={() => window.location.href = '/'}
                                    className="bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white shadow-lg"
                                    size="lg"
                                >
                                    <Home className="w-4 h-4 mr-2" />
                                    {t('errors.actions.home', 'Retour à l\'accueil')}
                                </Button>

                                {(status === 500 || status === 503) && (
                                    <Button
                                        onClick={() => window.location.reload()}
                                        variant="outline"
                                        size="lg"
                                        className="bg-white/80 backdrop-blur-sm hover:bg-white border-gray-300 text-gray-700 hover:text-gray-900 shadow-lg"
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        {t('errors.actions.refresh', 'Actualiser')}
                                    </Button>
                                )}
                            </motion.div>

                            {/* Quick Links */}
                            {status === 404 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="border-t border-gray-200 dark:border-gray-700 pt-8"
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                                        Liens utiles
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                                        {quickLinks.map((link, index) => (
                                            <motion.a
                                                key={link.href}
                                                href={link.href}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.9 + index * 0.1 }}
                                                className="group p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-white/80 transition-all duration-300 shadow-md hover:shadow-lg"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <link.icon className="w-5 h-5 text-amber-600 group-hover:text-amber-700" />
                                                    <div className="text-left">
                                                        <div className="font-medium text-gray-900 group-hover:text-amber-700">
                                                            {link.name}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {link.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.a>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Support Contact */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="mt-12 text-center"
                            >
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    Le problème persiste ?
                                </p>
                                <Button
                                    onClick={() => window.location.href = '/support'}
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-600 hover:text-amber-600 hover:bg-amber-50"
                                >
                                    <Mail className="w-4 h-4 mr-2" />
                                    {t('errors.actions.contact', 'Contacter le support')}
                                </Button>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                {/* Floating Animation Elements */}
                <motion.div
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-20 right-10 text-6xl opacity-20"
                >
                    {config.illustration}
                </motion.div>
                <motion.div
                    animate={{ y: [10, -10, 10] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-20 left-10 text-4xl opacity-20"
                >
                    💼
                </motion.div>
            </div>
        </GuestLayout>
    );
}