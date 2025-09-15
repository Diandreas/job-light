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
                <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                💼 {t('jobPortal.myJobs.title')}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                {t('jobPortal.myJobs.description')}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <Link href={route('job-portal.create-simple-ad-form')}>
                                <Button className="bg-gradient-to-r from-green-500 to-blue-500">
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t('jobPortal.myJobs.newSimpleAd')}
                                </Button>
                            </Link>
                            
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <Plus className="w-4 h-4 mr-2" />
                                        {t('jobPortal.myJobs.fullOffer')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{t('jobPortal.myJobs.createFullOffer')}</DialogTitle>
                                    </DialogHeader>
                                    <div className="p-4 text-center">
                                        <Briefcase className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold mb-2">{t('jobPortal.myJobs.createNewJobOffer')}</h3>
                                        <p className="text-gray-600 mb-6">
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

                    {/* Statistiques rapides */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {t('jobPortal.myJobs.totalOffers')}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            {jobs?.meta?.total || 0}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                        <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {t('jobPortal.myJobs.totalViews')}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            {jobs?.data?.reduce((sum, job) => sum + job.views_count, 0) || 0}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                        <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {t('jobPortal.myJobs.applications')}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            {jobs?.data?.reduce((sum, job) => sum + job.applications_count, 0) || 0}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                        <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {t('jobPortal.myJobs.activeOffers')}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            {jobs?.data?.filter(job => job.status === 'published').length || 0}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filtres et recherche */}
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            type="text"
                                            placeholder={t('jobPortal.myJobs.searchPlaceholder')}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger className="w-full md:w-48">
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
                                    <SelectTrigger className="w-full md:w-48">
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
                        </CardContent>
                    </Card>

                    {/* Liste des offres */}
                    <div className="space-y-6">
                        {jobs?.data?.map((job, index) => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="hover:shadow-lg transition-all duration-300">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                                    {job.company.logo_path ? (
                                                        <img src={job.company.logo_path} alt={job.company.name} className="w-8 h-8 object-contain" />
                                                    ) : (
                                                        <Briefcase className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                                            <Link href={route('job-portal.show', job.id)} className="hover:text-blue-600 transition-colors">
                                                                {job.title}
                                                            </Link>
                                                        </h3>
                                                        <Badge className={getStatusColor(job.status)}>
                                                            {getStatusLabel(job.status)}
                                                        </Badge>
                                                        {job.posting_type === 'simple_ad' && (
                                                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                                                {t('jobPortal.myJobs.simpleAd')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                        <span>{job.company.name}</span>
                                                        {job.location && (
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="w-4 h-4" />
                                                                {job.location}
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            {new Date(job.created_at).toLocaleDateString('fr-FR')}
                                                        </div>
                                                        {job.remote_work && (
                                                            <div className="flex items-center gap-1">
                                                                <Wifi className="w-4 h-4" />
                                                                {t('jobPortal.myJobs.remote')}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                                                        {job.description.substring(0, 200)}...
                                                    </p>

                                                    <div className="flex items-center gap-4">
                                                        <Badge variant="outline">
                                                            {EMPLOYMENT_TYPE_LABELS[job.employment_type]}
                                                        </Badge>
                                                        {(job.salary_min || job.salary_max) && (
                                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                💰 {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
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

                                        {/* Statistiques */}
                                        <div className="flex items-center justify-between pt-4 border-t">
                                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Eye className="w-4 h-4" />
                                                    {t('jobPortal.myJobs.viewsCount', { count: job.views_count })}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    {t('jobPortal.myJobs.applicationsCount', { count: job.applications_count })}
                                                </div>
                                                {job.application_deadline && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {t('jobPortal.myJobs.expiresOn')} {new Date(job.application_deadline).toLocaleDateString('fr-FR')}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Link href={route('job-portal.show', job.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        {t('jobPortal.myJobs.view')}
                                                    </Button>
                                                </Link>
                                                {job.posting_type === 'standard' && job.applications_count > 0 && (
                                                    <Link href={route('job-portal.applications', job.id)}>
                                                        <Button size="sm">
                                                            <Users className="w-4 h-4 mr-2" />
                                                            {t('jobPortal.myJobs.applications')}
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

                    {/* Pagination */}
                    {jobs?.meta?.last_page > 1 && (
                        <div className="flex justify-center mt-8">
                            <div className="flex items-center gap-2">
                                {jobs?.links?.map((link, index) => (
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

                    {/* Message si aucune offre */}
                    {(!jobs?.data || jobs.data.length === 0) && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                                {t('jobPortal.myJobs.noJobsPublished')}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {t('jobPortal.myJobs.publishFirstJob')}
                            </p>
                            <Link href={route('job-portal.create-simple-ad-form')}>
                                <Button className="bg-gradient-to-r from-green-500 to-blue-500">
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
