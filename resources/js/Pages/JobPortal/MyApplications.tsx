import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Send, Search, Eye, Calendar, Building, MapPin, 
    CheckCircle, Clock, Star, XCircle, Award, TrendingUp,
    FileText, ExternalLink, MessageSquare, Filter
} from 'lucide-react';

interface MyApplicationsProps {
    auth: { user: any };
    applications: {
        data: Array<{
            id: number;
            status: string;
            cover_letter: string;
            applied_at: string;
            job_posting: {
                id: number;
                title: string;
                description: string;
                location: string;
                employment_type: string;
                salary_min: number;
                salary_max: number;
                salary_currency: string;
                remote_work: boolean;
                posting_type: string;
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

export default function MyApplications({ auth, applications }: MyApplicationsProps) {
    const { t } = useTranslation();

    const STATUS_CONFIG = {
        'pending': {
            label: t('jobPortal.myApplications.status.pending'),
            color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
            icon: Clock,
            description: t('jobPortal.myApplications.status.pendingDescription')
        },
        'reviewed': {
            label: t('jobPortal.myApplications.status.reviewed'),
            color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
            icon: Eye,
            description: t('jobPortal.myApplications.status.reviewedDescription')
        },
        'shortlisted': {
            label: t('jobPortal.myApplications.status.shortlisted'),
            color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
            icon: Star,
            description: t('jobPortal.myApplications.status.shortlistedDescription')
        },
        'rejected': {
            label: t('jobPortal.myApplications.status.rejected'),
            color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
            icon: XCircle,
            description: t('jobPortal.myApplications.status.rejectedDescription')
        },
        'hired': {
            label: t('jobPortal.myApplications.status.hired'),
            color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
            icon: Award,
            description: t('jobPortal.myApplications.status.hiredDescription')
        }
    };

    const EMPLOYMENT_TYPE_LABELS = {
        'full-time': t('jobPortal.fullTime'),
        'part-time': t('jobPortal.partTime'),
        'contract': t('jobPortal.contract'),
        'internship': t('jobPortal.internship'),
        'freelance': t('jobPortal.freelance')
    };
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    const formatSalary = (min: number, max: number, currency: string) => {
        if (!min && !max) return t('jobPortal.myApplications.notSpecified');
        if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
        if (min) return `${t('jobPortal.myApplications.from')} ${min.toLocaleString()} ${currency}`;
        return `${t('jobPortal.myApplications.upTo')} ${max.toLocaleString()} ${currency}`;
    };

    const getStatusConfig = (status: string) => STATUS_CONFIG[status] || STATUS_CONFIG['pending'];

    // Statistiques des candidatures
    const stats = {
        total: applications?.meta?.total || 0,
        pending: applications?.data?.filter(app => app.status === 'pending').length || 0,
        reviewed: applications?.data?.filter(app => app.status === 'reviewed').length || 0,
        shortlisted: applications?.data?.filter(app => app.status === 'shortlisted').length || 0,
        hired: applications?.data?.filter(app => app.status === 'hired').length || 0,
        rejected: applications?.data?.filter(app => app.status === 'rejected').length || 0
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head
                title={`${t('jobPortal.myApplications.pageTitle') || 'Mes candidatures'} - JobLight`}
            >
                <meta name="description" content={t('jobPortal.myApplications.pageDescription') || 'Suivez l\'état de vos candidatures d\'emploi'} />
            </Head>

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                📋 {t('jobPortal.myApplications.title')}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                {t('jobPortal.myApplications.description')}
                            </p>
                        </div>

                        <Link href={route('job-portal.index')}>
                            <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                                <Search className="w-4 h-4 mr-2" />
                                {t('jobPortal.myApplications.searchJobs')}
                            </Button>
                        </Link>
                    </div>

                    {/* Statistiques */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {stats.total}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {t('jobPortal.myApplications.total')}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {stats.pending}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {t('jobPortal.myApplications.status.pending')}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {stats.reviewed}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {t('jobPortal.myApplications.status.reviewed')}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {stats.shortlisted}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {t('jobPortal.myApplications.status.shortlisted')}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {stats.hired}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {t('jobPortal.myApplications.status.hired')}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">
                                        {stats.rejected}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {t('jobPortal.myApplications.status.rejected')}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filtres */}
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            type="text"
                                            placeholder={t('jobPortal.myApplications.searchPlaceholder')}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger className="w-full md:w-48">
                                        <SelectValue placeholder={t('jobPortal.myApplications.allStatuses')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('jobPortal.myApplications.allStatuses')}</SelectItem>
                                        <SelectItem value="pending">{t('jobPortal.myApplications.status.pending')}</SelectItem>
                                        <SelectItem value="reviewed">{t('jobPortal.myApplications.status.reviewed')}</SelectItem>
                                        <SelectItem value="shortlisted">{t('jobPortal.myApplications.status.shortlisted')}</SelectItem>
                                        <SelectItem value="hired">{t('jobPortal.myApplications.status.hired')}</SelectItem>
                                        <SelectItem value="rejected">{t('jobPortal.myApplications.status.rejected')}</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-full md:w-48">
                                        <SelectValue placeholder={t('jobPortal.myApplications.sortBy')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">{t('jobPortal.myApplications.newest')}</SelectItem>
                                        <SelectItem value="oldest">{t('jobPortal.myApplications.oldest')}</SelectItem>
                                        <SelectItem value="status">{t('jobPortal.myApplications.status')}</SelectItem>
                                        <SelectItem value="company">{t('jobPortal.myApplications.company')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Liste des candidatures */}
                    <div className="space-y-6">
                        {applications?.data?.map((application, index) => {
                            const statusConfig = getStatusConfig(application.status);
                            const StatusIcon = statusConfig.icon;
                            
                            return (
                                <motion.div
                                    key={application.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="hover:shadow-lg transition-all duration-300">
                                        <CardContent className="p-6">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    {application.job_posting.company.logo_path ? (
                                                        <img 
                                                            src={application.job_posting.company.logo_path} 
                                                            alt={application.job_posting.company.name} 
                                                            className="w-8 h-8 object-contain" 
                                                        />
                                                    ) : (
                                                        <Building className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
                                                                <Link 
                                                                    href={route('job-portal.show', application.job_posting.id)}
                                                                    className="hover:text-blue-600 transition-colors"
                                                                >
                                                                    {application.job_posting.title}
                                                                </Link>
                                                            </h3>
                                                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                                <span className="font-medium">{application.job_posting.company.name}</span>
                                                                {application.job_posting.location && (
                                                                    <div className="flex items-center gap-1">
                                                                        <MapPin className="w-4 h-4" />
                                                                        {application.job_posting.location}
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="w-4 h-4" />
                                                                    {t('jobPortal.myApplications.appliedOn')} {new Date(application.applied_at).toLocaleDateString('fr-FR')}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <Badge className={statusConfig.color}>
                                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                                {statusConfig.label}
                                                            </Badge>
                                                            {application.job_posting.posting_type === 'simple_ad' && (
                                                                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                                                    {t('jobPortal.myApplications.simpleAd')}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                                                        {application.job_posting.description.substring(0, 200)}...
                                                    </p>

                                                    <div className="flex items-center gap-4 mb-4">
                                                        <Badge variant="outline">
                                                            {EMPLOYMENT_TYPE_LABELS[application.job_posting.employment_type]}
                                                        </Badge>
                                                        {application.job_posting.remote_work && (
                                                            <Badge className="bg-green-100 text-green-800">
                                                                {t('jobPortal.myApplications.remote')}
                                                            </Badge>
                                                        )}
                                                        {(application.job_posting.salary_min || application.job_posting.salary_max) && (
                                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                💰 {formatSalary(
                                                                    application.job_posting.salary_min, 
                                                                    application.job_posting.salary_max, 
                                                                    application.job_posting.salary_currency
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Message de statut */}
                                                    <Alert className={`mb-4 border-l-4 ${
                                                        application.status === 'shortlisted' || application.status === 'hired' 
                                                            ? 'border-l-green-500 bg-green-50 dark:bg-green-900/20' 
                                                            : application.status === 'rejected'
                                                                ? 'border-l-red-500 bg-red-50 dark:bg-red-900/20'
                                                                : 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    }`}>
                                                        <StatusIcon className="w-4 h-4" />
                                                        <AlertDescription>
                                                            {statusConfig.description}
                                                        </AlertDescription>
                                                    </Alert>

                                                    {/* Lettre de motivation */}
                                                    {application.cover_letter && (
                                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                                                            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                                                                <FileText className="w-4 h-4" />
                                                                {t('jobPortal.myApplications.yourCoverLetter')}
                                                            </h4>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                                                {application.cover_letter}
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between pt-4 border-t">
                                                        <div className="flex items-center gap-4">
                                                            {application.status === 'shortlisted' && (
                                                                <div className="text-sm text-green-600 font-medium">
                                                                    🎉 {t('jobPortal.myApplications.shortlistedMessage')}
                                                                </div>
                                                            )}
                                                            {application.status === 'hired' && (
                                                                <div className="text-sm text-purple-600 font-medium">
                                                                    🎊 {t('jobPortal.myApplications.hiredMessage')}
                                                                </div>
                                                            )}
                                                            {application.status === 'rejected' && (
                                                                <div className="text-sm text-gray-600">
                                                                    💙 {t('jobPortal.myApplications.rejectedMessage')}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <Link href={route('job-portal.show', application.job_posting.id)}>
                                                                <Button variant="outline" size="sm">
                                                                    <Eye className="w-4 h-4 mr-2" />
                                                                    {t('jobPortal.myApplications.viewOffer')}
                                                                </Button>
                                                            </Link>
                                                            
                                                            {application.job_posting.posting_type === 'standard' && (
                                                                <Button variant="outline" size="sm" disabled>
                                                                    <MessageSquare className="w-4 h-4 mr-2" />
                                                                    {t('jobPortal.myApplications.contact')}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>

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

                    {/* Message si aucune candidature */}
                    {(!applications?.data || applications.data.length === 0) && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                                {t('jobPortal.myApplications.noApplications')}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {t('jobPortal.myApplications.exploreJobs')}
                            </p>
                            <Link href={route('job-portal.index')}>
                                <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                                    <Search className="w-4 h-4 mr-2" />
                                    {t('jobPortal.myApplications.discoverOffers')}
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}