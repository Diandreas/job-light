import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';
import {
    Briefcase, Plus, Search, Filter, Eye, Users, Calendar,
    MoreVertical, Edit, Trash2, Pause, Play, Copy,
    TrendingUp, MapPin, DollarSign, Clock, Wifi, Star
} from 'lucide-react';

// Breakpoint personnalisé pour ultra small screens
const customStyles = `
    @media (max-width: 380px) {
        .xs\\:hidden { display: none !important; }
        .xs\\:text-xs { font-size: 0.75rem !important; }
        .xs\\:p-2 { padding: 0.5rem !important; }
        .xs\\:gap-1 { gap: 0.25rem !important; }
    }
    @media (min-width: 381px) {
        .xs\\:inline { display: inline !important; }
    }
`;

interface MyJobsProps {
    auth: { user: any };
    jobs: {
        data: Array<{
            id: number;
            title: string;
            description: string;
            location: string;
            employment_type: string;
            experience_level: string;
            salary_min: number;
            salary_max: number;
            salary_currency: string;
            remote_work: boolean;
            status: string;
            posting_type: string;
            views_count: number;
            applications_count: number;
            created_at: string;
            application_deadline: string;
            company: {
                id: number;
                name: string;
                logo_path: string;
            };
        }>;
        links: any;
        meta: any;
    };
}

const STATUS_COLORS = {
    'draft': 'bg-gray-100 text-gray-800',
    'published': 'bg-green-100 text-green-800',
    'closed': 'bg-red-100 text-red-800',
    'expired': 'bg-orange-100 text-orange-800'
};

export default function MyJobs({ auth, jobs }: MyJobsProps) {
    const { t } = useTranslation();

    const STATUS_LABELS = {
        'draft': t('jobPortal.myJobs.status.draft'),
        'published': t('jobPortal.myJobs.status.published'),
        'closed': t('jobPortal.myJobs.status.closed'),
        'expired': t('jobPortal.myJobs.status.expired')
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

    const { delete: deleteJob } = useForm();

    const formatSalary = (min: number, max: number, currency: string) => {
        if (!min && !max) return t('jobPortal.myJobs.notSpecified');
        if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
        if (min) return `${t('jobPortal.myJobs.from')} ${min.toLocaleString()} ${currency}`;
        return `${t('jobPortal.myJobs.upTo')} ${max.toLocaleString()} ${currency}`;
    };

    const getStatusColor = (status: string) => STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
    const getStatusLabel = (status: string) => STATUS_LABELS[status] || status;

    const handleDeleteJob = (jobId: number) => {
        if (confirm(t('jobPortal.myJobs.confirmDelete'))) {
            deleteJob(route('job-portal.delete-job', jobId));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head
                title={`${t('jobPortal.myJobs.pageTitle') || 'Mes offres d\'emploi'} - JobLight`}
            >
                <meta name="description" content={t('jobPortal.myJobs.pageDescription') || 'Gérez vos offres d\'emploi publiées'} />
            </Head>

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
                    {/* Header - Ultra compact mobile */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-8 gap-3 sm:gap-4">
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                                💼 {t('jobPortal.myJobs.title')}
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 line-clamp-1 sm:line-clamp-none">
                                {t('jobPortal.myJobs.description')}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                            <Link href={route('job-portal.create-simple-ad-form')}>
                                <Button size="sm" className="bg-gradient-to-r from-green-500 to-blue-500 h-8 sm:h-9 text-xs sm:text-sm">
                                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                    <span className="hidden xs:inline">{t('jobPortal.myJobs.newSimpleAd')}</span>
                                    <span className="xs:hidden">Nouveau</span>
                                </Button>
                            </Link>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">
                                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                        <span className="hidden sm:inline">{t('jobPortal.myJobs.fullOffer')}</span>
                                        <span className="sm:hidden">+</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="mx-4 w-[calc(100%-2rem)] sm:mx-auto sm:w-full">
                                    <DialogHeader>
                                        <DialogTitle className="text-lg">{t('jobPortal.myJobs.createFullOffer')}</DialogTitle>
                                    </DialogHeader>
                                    <div className="p-4 text-center">
                                        <Briefcase className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold mb-2">{t('jobPortal.myJobs.createNewJobOffer')}</h3>
                                        <p className="text-gray-600 mb-6 text-sm">
                                            {t('jobPortal.myJobs.publishJobDescription')}
                                        </p>
                                        <div className="space-y-3">
                                            <Button
                                                className="w-full"
                                                onClick={() => {
                                                    window.location.href = route('job-portal.create-simple-ad-form');
                                                }}
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                {t('jobPortal.myJobs.createAd')}
                                            </Button>
                                            <p className="text-xs text-gray-500">
                                                {t('jobPortal.myJobs.immediatePublication')}
                                            </p>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Statistiques rapides - Compact mobile */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                        <Card>
                            <CardContent className="p-3 sm:p-4 lg:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div className="mb-2 sm:mb-0">
                                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 line-clamp-1">
                                            {t('jobPortal.myJobs.totalOffers')}
                                        </p>
                                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            {jobs?.meta?.total || 0}
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center self-end sm:self-auto">
                                        <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-3 sm:p-4 lg:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div className="mb-2 sm:mb-0">
                                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 line-clamp-1">
                                            {t('jobPortal.myJobs.totalViews')}
                                        </p>
                                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            {jobs?.data?.reduce((sum, job) => sum + job.views_count, 0) || 0}
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center self-end sm:self-auto">
                                        <Eye className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-3 sm:p-4 lg:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div className="mb-2 sm:mb-0">
                                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 line-clamp-1">
                                            {t('jobPortal.myJobs.applications')}
                                        </p>
                                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            {jobs?.data?.reduce((sum, job) => sum + job.applications_count, 0) || 0}
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center self-end sm:self-auto">
                                        <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-3 sm:p-4 lg:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div className="mb-2 sm:mb-0">
                                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 line-clamp-1">
                                            {t('jobPortal.myJobs.activeOffers')}
                                        </p>
                                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            {jobs?.data?.filter(job => job.status === 'published').length || 0}
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center self-end sm:self-auto">
                                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600 dark:text-orange-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filtres et recherche - Compact mobile */}
                    <Card className="mb-4 sm:mb-6">
                        <CardContent className="p-3 sm:p-4 lg:p-6">
                            <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-col md:flex-row gap-3 sm:gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            type="text"
                                            placeholder={t('jobPortal.myJobs.searchPlaceholder')}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 h-9 sm:h-10 text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:flex sm:flex-row">
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                        <SelectTrigger className="w-full sm:w-40 md:w-48 h-9 sm:h-10 text-sm">
                                            <SelectValue placeholder={t('jobPortal.myJobs.allStatuses')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{t('jobPortal.myJobs.allStatuses')}</SelectItem>
                                            <SelectItem value="published">{t('jobPortal.myJobs.status.published')}</SelectItem>
                                            <SelectItem value="draft">{t('jobPortal.myJobs.status.draft')}</SelectItem>
                                            <SelectItem value="closed">{t('jobPortal.myJobs.status.closed')}</SelectItem>
                                            <SelectItem value="expired">{t('jobPortal.myJobs.status.expired')}</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-full sm:w-40 md:w-48 h-9 sm:h-10 text-sm">
                                            <SelectValue placeholder={t('jobPortal.myJobs.sortBy')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="newest">{t('jobPortal.myJobs.newest')}</SelectItem>
                                            <SelectItem value="oldest">{t('jobPortal.myJobs.oldest')}</SelectItem>
                                            <SelectItem value="views">{t('jobPortal.myJobs.mostViews')}</SelectItem>
                                            <SelectItem value="applications">{t('jobPortal.myJobs.mostApplications')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Liste des offres - Ultra compact mobile */}
                    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                        {jobs?.data?.map((job, index) => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="hover:shadow-lg transition-all duration-300">
                                    <CardContent className="p-3 sm:p-4 lg:p-6">
                                        {/* Header mobile compact */}
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                                {job.company.logo_path ? (
                                                    <img src={job.company.logo_path} alt={job.company.name} className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                                                ) : (
                                                    <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                {/* Titre et badges */}
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 dark:text-gray-200 line-clamp-2 sm:line-clamp-1">
                                                            <Link href={route('job-portal.show', job.id)} className="hover:text-blue-600 transition-colors">
                                                                {job.title}
                                                            </Link>
                                                        </h3>
                                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                                            {job.company.name}
                                                        </p>
                                                    </div>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                                                                <MoreVertical className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={route('job-portal.show', job.id)}>
                                                                    <Eye className="w-4 h-4 mr-2" />
                                                                    {t('jobPortal.myJobs.viewOffer')}
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            {job.posting_type === 'standard' && (
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={route('job-portal.applications', job.id)}>
                                                                        <Users className="w-4 h-4 mr-2" />
                                                                        {t('jobPortal.myJobs.applicationsCount', { count: job.applications_count })}
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem>
                                                                <Edit className="w-4 h-4 mr-2" />
                                                                {t('jobPortal.myJobs.edit')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Copy className="w-4 h-4 mr-2" />
                                                                {t('jobPortal.myJobs.duplicate')}
                                                            </DropdownMenuItem>
                                                            {job.status === 'published' ? (
                                                                <DropdownMenuItem>
                                                                    <Pause className="w-4 h-4 mr-2" />
                                                                    {t('jobPortal.myJobs.pause')}
                                                                </DropdownMenuItem>
                                                            ) : job.status === 'draft' && (
                                                                <DropdownMenuItem>
                                                                    <Play className="w-4 h-4 mr-2" />
                                                                    {t('jobPortal.myJobs.publish')}
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteJob(job.id)}
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                {t('jobPortal.myJobs.delete')}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>

                                                {/* Badges - Ligne optimisée mobile */}
                                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                                                    <Badge className={`${getStatusColor(job.status)} text-xs`}>
                                                        {getStatusLabel(job.status)}
                                                    </Badge>
                                                    {job.posting_type === 'simple_ad' && (
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                                                            {t('jobPortal.myJobs.simpleAd')}
                                                        </Badge>
                                                    )}
                                                    <Badge variant="outline" className="text-xs">
                                                        {EMPLOYMENT_TYPE_LABELS[job.employment_type]}
                                                    </Badge>
                                                </div>

                                                {/* Infos compactes */}
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                    {job.location && (
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            <span className="truncate max-w-24 sm:max-w-none">{job.location}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        <span className="hidden sm:inline">{new Date(job.created_at).toLocaleDateString('fr-FR')}</span>
                                                        <span className="sm:hidden">{new Date(job.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</span>
                                                    </div>
                                                    {job.remote_work && (
                                                        <div className="flex items-center gap-1">
                                                            <Wifi className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            <span className="hidden sm:inline">{t('jobPortal.myJobs.remote')}</span>
                                                            <span className="sm:hidden">Remote</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Description - masquée sur très petit écran */}
                                                <p className="hidden sm:block text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                                                    {job.description.substring(0, 150)}...
                                                </p>

                                                {/* Salaire */}
                                                {(job.salary_min || job.salary_max) && (
                                                    <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                                        💰 {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Footer - Statistiques et actions */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t gap-3 sm:gap-0">
                                            {/* Statistiques compactes */}
                                            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
                                                <div className="flex items-center gap-1">
                                                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    <span>{job.views_count}</span>
                                                    <span className="hidden sm:inline">{t('jobPortal.myJobs.views')}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    <span>{job.applications_count}</span>
                                                    <span className="hidden sm:inline">{t('jobPortal.myJobs.applications')}</span>
                                                </div>
                                                {job.application_deadline && (
                                                    <div className="hidden lg:flex items-center gap-1">
                                                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        <span className="text-xs">
                                                            {t('jobPortal.myJobs.expiresOn')} {new Date(job.application_deadline).toLocaleDateString('fr-FR')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions compactes */}
                                            <div className="flex items-center gap-2 order-1 sm:order-2">
                                                <Link href={route('job-portal.show', job.id)}>
                                                    <Button variant="outline" size="sm" className="h-8 text-xs">
                                                        <Eye className="w-3 h-3 mr-1 sm:mr-2" />
                                                        <span className="hidden sm:inline">{t('jobPortal.myJobs.view')}</span>
                                                        <span className="sm:hidden">Voir</span>
                                                    </Button>
                                                </Link>
                                                {job.posting_type === 'standard' && job.applications_count > 0 && (
                                                    <Link href={route('job-portal.applications', job.id)}>
                                                        <Button size="sm" className="h-8 text-xs">
                                                            <Users className="w-3 h-3 mr-1 sm:mr-2" />
                                                            <span className="hidden sm:inline">{t('jobPortal.myJobs.applications')}</span>
                                                            <span className="sm:hidden">Candidats</span>
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pagination - Compact mobile */}
                    {jobs?.meta?.last_page > 1 && (
                        <div className="flex justify-center mt-6 sm:mt-8">
                            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-full px-4">
                                {jobs?.links?.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
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

                    {/* Message si aucune offre - Compact mobile */}
                    {(!jobs?.data || jobs.data.length === 0) && (
                        <div className="text-center py-8 sm:py-12 px-4">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                            </div>
                            <h3 className="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                                {t('jobPortal.myJobs.noJobsPublished')}
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 max-w-sm mx-auto">
                                {t('jobPortal.myJobs.publishFirstJob')}
                            </p>
                            <Link href={route('job-portal.create-simple-ad-form')}>
                                <Button className="bg-gradient-to-r from-green-500 to-blue-500 h-9 sm:h-10 text-sm">
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t('jobPortal.myJobs.createFirstAd')}
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Ajout des styles personnalisés pour ultra-small screens
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = customStyles;
    document.head.appendChild(styleSheet);
}
