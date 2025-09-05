import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import {
    ArrowLeft, Building, Calendar, Clock, CheckCircle,
    AlertCircle, XCircle, Eye, Mail, FileText, MapPin,
    Briefcase, TrendingUp, Users
} from 'lucide-react';

interface MyApplicationsProps {
    auth: { user: any };
    applications: {
        data: Array<{
            id: number;
            cover_letter: string;
            status: string;
            applied_at: string;
            jobPosting: {
                id: number;
                title: string;
                description: string;
                location: string;
                employment_type: string;
                salary_min: number;
                salary_max: number;
                salary_currency: string;
                company: {
                    id: number;
                    name: string;
                    logo_path: string;
                    industry: string;
                };
            };
        }>;
        links: any;
        meta: any;
    };
}

const STATUS_CONFIG = {
    pending: {
        label: 'En attente',
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        description: 'Votre candidature est en cours d\'examen'
    },
    reviewed: {
        label: 'Examinée',
        icon: Eye,
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        description: 'Votre candidature a été examinée par l\'entreprise'
    },
    shortlisted: {
        label: 'Présélectionné',
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800 border-green-200',
        description: 'Félicitations ! Vous êtes dans la liste restreinte'
    },
    rejected: {
        label: 'Non retenue',
        icon: XCircle,
        color: 'bg-red-100 text-red-800 border-red-200',
        description: 'Votre candidature n\'a pas été retenue cette fois'
    },
    hired: {
        label: 'Embauché',
        icon: CheckCircle,
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        description: 'Félicitations ! Vous avez obtenu le poste'
    }
};

export default function MyApplications({ auth, applications = { data: [], links: [], meta: { total: 0, last_page: 1 } } }: MyApplicationsProps) {
    const { t } = useTranslation();

    const formatSalary = (min: number, max: number, currency: string) => {
        if (!min && !max) return 'Salaire non spécifié';
        if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
        if (min) return `À partir de ${min.toLocaleString()} ${currency}`;
        return `Jusqu'à ${max.toLocaleString()} ${currency}`;
    };

    const getStatusStats = () => {
        const stats = {
            total: applications?.data?.length || 0,
            pending: 0,
            reviewed: 0,
            shortlisted: 0,
            rejected: 0,
            hired: 0
        };

        applications?.data?.forEach(app => {
            stats[app.status]++;
        });

        return stats;
    };

    const stats = getStatusStats();

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head>
                <title>Mes Candidatures | JobLight</title>
                <meta name="description" content="Suivez l'état de toutes vos candidatures d'emploi en un seul endroit." />
            </Head>

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <Link href={route('job-portal.index')} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
                                    <ArrowLeft className="w-4 h-4" />
                                    Retour aux offres
                                </Link>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                                Mes Candidatures
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Suivez l'état de vos {applications?.meta?.total || 0} candidature{(applications?.meta?.total || 0) > 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    {/* Statistiques */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        <Card>
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.total}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">En attente</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-green-600">{stats.shortlisted}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Présélectionné</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Rejetées</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-emerald-600">{stats.hired}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Embauché</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Liste des candidatures */}
                    {applications?.data && applications.data.length > 0 ? (
                        <div className="space-y-4">
                            {applications.data.map((application, index) => {
                                const statusConfig = STATUS_CONFIG[application.status];
                                const StatusIcon = statusConfig.icon;
                                
                                return (
                                    <motion.div
                                        key={application.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-start gap-4 flex-1">
                                                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                                            {application.jobPosting.company.logo_path ? (
                                                                <img 
                                                                    src={application.jobPosting.company.logo_path} 
                                                                    alt={application.jobPosting.company.name} 
                                                                    className="w-8 h-8 object-contain" 
                                                                />
                                                            ) : (
                                                                <Building className="w-6 h-6 text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
                                                                <Link 
                                                                    href={route('job-portal.show', application.jobPosting.id)}
                                                                    className="hover:text-blue-600 transition-colors"
                                                                >
                                                                    {application.jobPosting.title}
                                                                </Link>
                                                            </h3>
                                                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                                <div className="flex items-center gap-1">
                                                                    <Building className="w-4 h-4" />
                                                                    {application.jobPosting.company.name}
                                                                </div>
                                                                {application.jobPosting.location && (
                                                                    <div className="flex items-center gap-1">
                                                                        <MapPin className="w-4 h-4" />
                                                                        {application.jobPosting.location}
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="w-4 h-4" />
                                                                    Candidature : {new Date(application.applied_at).toLocaleDateString('fr-FR')}
                                                                </div>
                                                            </div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                {formatSalary(
                                                                    application.jobPosting.salary_min,
                                                                    application.jobPosting.salary_max,
                                                                    application.jobPosting.salary_currency
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="text-right">
                                                        <Badge className={`${statusConfig.color} mb-2`}>
                                                            <StatusIcon className="w-3 h-3 mr-1" />
                                                            {statusConfig.label}
                                                        </Badge>
                                                        <div className="text-xs text-gray-500">
                                                            {statusConfig.description}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Lettre de motivation (aperçu) */}
                                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FileText className="w-4 h-4 text-blue-600" />
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Votre lettre de motivation
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                        {application.cover_letter}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                                Aucune candidature
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Vous n'avez pas encore postulé à des offres d'emploi
                            </p>
                            <Link href={route('job-portal.index')}>
                                <Button className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600">
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    Découvrir les offres
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Pagination */}
                    {applications?.meta?.last_page > 1 && (
                        <div className="flex justify-center mt-8">
                            <div className="flex items-center gap-2">
                                {applications?.links?.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                            link.active 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-white text-gray-600 hover:bg-gray-50 border'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Conseils */}
                    <Card className="mt-8 bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-950/50 dark:to-purple-950/50 border-amber-200">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-purple-500 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-2">
                                        💡 Conseils pour améliorer vos candidatures
                                    </h3>
                                    <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                                        <li>• Personnalisez votre lettre de motivation pour chaque offre</li>
                                        <li>• Utilisez les mots-clés de l'offre d'emploi</li>
                                        <li>• Optimisez votre CV avec notre IA</li>
                                        <li>• Suivez l'entreprise sur LinkedIn avant de postuler</li>
                                    </ul>
                                    <div className="mt-4">
                                        <Link href={route('career-advisor.index')}>
                                            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                                                Améliorer mon profil avec l'IA
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}