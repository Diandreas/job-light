import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
    Search, MapPin, Briefcase, Clock, Building, Users,
    DollarSign, Wifi, Star, TrendingUp, Eye, Send,
    Filter, SlidersHorizontal, ChevronDown, ArrowRight,
    Globe, Calendar, Target, Zap
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';
import { formatPrice } from '@/utils/currency';

interface JobPortalIndexProps {
    auth?: { user: any };
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
            created_at: string;
            views_count: number;
            applications_count: number;
            company: {
                id: number;
                name: string;
                logo_path: string;
                industry: string;
            };
        }>;
        links: any;
        meta: any;
    };
    stats: {
        total_jobs: number;
        companies_hiring: number;
        remote_jobs: number;
        new_this_week: number;
    };
    topCompanies: Array<{
        id: number;
        name: string;
        logo_path: string;
        industry: string;
        job_postings_count: number;
    }>;
    filters: {
        search?: string;
        location?: string;
        employment_type?: string;
        experience_level?: string;
        remote?: boolean;
    };
}

export default function JobPortalIndex({ auth, jobs = { data: [], links: [], meta: { total: 0, last_page: 1 } }, stats = { total_jobs: 0, companies_hiring: 0, remote_jobs: 0, new_this_week: 0 }, topCompanies = [], filters = {} }: JobPortalIndexProps) {
    const { t } = useTranslation();
    const [showFilters, setShowFilters] = useState(false);
    const [showPostJobDialog, setShowPostJobDialog] = useState(false);

    const EMPLOYMENT_TYPES = [
        { value: 'full-time', label: t('jobPortal.fullTime') },
        { value: 'part-time', label: t('jobPortal.partTime') },
        { value: 'contract', label: t('jobPortal.contract') },
        { value: 'internship', label: t('jobPortal.internship') },
        { value: 'freelance', label: t('jobPortal.freelance') }
    ];

    const EXPERIENCE_LEVELS = [
        { value: 'entry', label: t('jobPortal.createJob.entry') },
        { value: 'mid', label: t('jobPortal.createJob.mid') },
        { value: 'senior', label: t('jobPortal.createJob.senior') },
        { value: 'executive', label: t('jobPortal.createJob.executive') }
    ];

    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
        location: filters.location || '',
        employment_type: filters.employment_type || '',
        experience_level: filters.experience_level || '',
        remote: filters.remote || false
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('job-portal.index'), {
            preserveState: true,
            preserveScroll: true
        });
    };

    const clearFilters = () => {
        setData({
            search: '',
            location: '',
            employment_type: '',
            experience_level: '',
            remote: false
        });
        get(route('job-portal.index'));
    };

    const formatSalary = (min: number, max: number, currency: string = 'FCFA', isCompact: boolean = false) => {
        if (!min && !max) return t('jobPortal.salaryNotSpecified');

        // Utilise FCFA par défaut si la devise n'est pas spécifiée ou est en EUR
        const finalCurrency = (!currency || currency === 'EUR') ? 'FCFA' : currency;

        // Fonction de formatage pour chaque montant
        const formatAmount = (amount: number) => {
            if (isCompact && amount >= 1000) {
                if (amount >= 1000000) {
                    return `${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)}M`;
                } else if (amount >= 1000) {
                    return `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
                }
            }
            return new Intl.NumberFormat('fr-FR').format(amount);
        };

        if (min && max) {
            return `${formatAmount(min)} - ${formatAmount(max)} ${finalCurrency}`;
        }
        if (min) {
            return `${t('jobPortal.salaryFrom', { amount: formatAmount(min), currency: finalCurrency })}`;
        }
        return `${t('jobPortal.salaryUpTo', { amount: formatAmount(max), currency: finalCurrency })}`;
    };

    const getEmploymentTypeIcon = (type: string) => {
        switch (type) {
            case 'full-time': return <Briefcase className="w-4 h-4" />;
            case 'part-time': return <Clock className="w-4 h-4" />;
            case 'remote': return <Wifi className="w-4 h-4" />;
            default: return <Briefcase className="w-4 h-4" />;
        }
    };

    const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;

    return (
        <Layout {...(auth?.user && auth.user ? { user: auth.user } : {})}>
            <Head
                title={`${t('jobPortal.title') || 'Portail d\'Emploi'} | ${t('jobPortal.subtitle') || 'JobLight'}`}
            >
                <meta name="description" content={t('jobPortal.metaDescription') || 'Plateforme d\'emploi JobLight'} />
                <meta name="keywords" content={t('jobPortal.metaKeywords') || 'emploi, job, recrutement'} />
            </Head>

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Hero Section */}
                <div className="relative bg-gradient-to-r from-amber-500 to-purple-500 text-white">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
                        style={{
                            backgroundImage: `url('/images/hero/business-meeting.png')`
                        }}
                    />
                    <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl md:text-5xl font-bold mb-4"
                            >
                                {t('jobPortal.title')}
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-xl md:text-2xl mb-8 opacity-90"
                            >
                                {t('jobPortal.subtitle')}
                            </motion.p>

                            {/* Statistiques - Compact Mobile */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
                            >
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                                    <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.total_jobs.toLocaleString()}</div>
                                    <div className="text-xs sm:text-sm opacity-90 line-clamp-1">{t('jobPortal.stats.activeOffers')}</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                                    <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.companies_hiring}</div>
                                    <div className="text-xs sm:text-sm opacity-90 line-clamp-1">{t('jobPortal.stats.companies')}</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                                    <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.remote_jobs}</div>
                                    <div className="text-xs sm:text-sm opacity-90 line-clamp-1">{t('jobPortal.stats.remoteJobs')}</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                                    <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.new_this_week}</div>
                                    <div className="text-xs sm:text-sm opacity-90 line-clamp-1">{t('jobPortal.stats.thisWeek')}</div>
                                </div>
                            </motion.div>

                            {/* Barre de recherche principale - Compact Mobile */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="max-w-4xl mx-auto"
                            >
                                <form onSubmit={handleSearch} className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl">
                                    <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-3 sm:gap-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                            <Input
                                                type="text"
                                                placeholder={t('jobPortal.searchPlaceholder')}
                                                value={data.search}
                                                onChange={(e) => setData('search', e.target.value)}
                                                className="pl-10 h-10 sm:h-12 text-gray-800 text-sm sm:text-base"
                                            />
                                        </div>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                            <Input
                                                type="text"
                                                placeholder={t('jobPortal.locationPlaceholder')}
                                                value={data.location}
                                                onChange={(e) => setData('location', e.target.value)}
                                                className="pl-10 h-10 sm:h-12 text-gray-800 text-sm sm:text-base"
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="h-10 sm:h-12 bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-sm sm:text-base"
                                        >
                                            <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                                            <span className="hidden xs:inline">{t('jobPortal.search')}</span>
                                            <span className="xs:hidden">🔍</span>
                                        </Button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                        {/* Sidebar - Filtres et entreprises */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Filtres avancés */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <SlidersHorizontal className="w-4 h-4" />
                                        {t('jobPortal.filters')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                            {t('jobPortal.employmentType')}
                                        </label>
                                        <Select
                                            value={data.employment_type}
                                            onValueChange={(value) => setData('employment_type', value)}
                                        >
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder={t('jobPortal.allTypes')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">{t('jobPortal.allTypes')}</SelectItem>
                                                {EMPLOYMENT_TYPES.map(type => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                            {t('jobPortal.experienceLevel')}
                                        </label>
                                        <Select
                                            value={data.experience_level}
                                            onValueChange={(value) => setData('experience_level', value)}
                                        >
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder={t('jobPortal.allLevels')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">{t('jobPortal.allLevels')}</SelectItem>
                                                {EXPERIENCE_LEVELS.map(level => (
                                                    <SelectItem key={level.value} value={level.value}>
                                                        {level.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="remote"
                                            checked={data.remote}
                                            onChange={(e) => setData('remote', e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                        <label htmlFor="remote" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                            {t('jobPortal.remoteWorkPossible')}
                                        </label>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button onClick={handleSearch} size="sm" className="flex-1">
                                            {t('jobPortal.apply')}
                                        </Button>
                                        <Button onClick={clearFilters} variant="outline" size="sm">
                                            {t('jobPortal.reset')}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Entreprises qui recrutent */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <Building className="w-4 h-4" />
                                        {t('jobPortal.companiesHiring')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {topCompanies.map(company => (
                                            <div key={company.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                    {company.logo_path ? (
                                                        <img src={company.logo_path} alt={company.name} className="w-6 h-6 object-contain" />
                                                    ) : (
                                                        <Building className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-xs text-gray-800 dark:text-gray-200 truncate">
                                                        {company.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {company.job_postings_count} {t('jobPortal.offer', { count: company.job_postings_count })}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* CTA Publication d'offre */}
                            <Card className="bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-950/50 dark:to-purple-950/50 border-amber-200">
                                <CardContent className="p-4 text-center">
                                    <Target className="w-8 h-8 text-amber-600 mx-auto mb-3" />
                                    <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-2">
                                        {t('jobPortal.areYouRecruiting')}
                                    </h3>
                                    <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">
                                        {t('jobPortal.publishOffersDescription')}
                                    </p>
                                    <Dialog open={showPostJobDialog} onOpenChange={setShowPostJobDialog}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700">
                                                <Send className="w-3 h-3 mr-2" />
                                                {t('jobPortal.publishOffer')}
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle>{t('jobPortal.publishJobOffer')}</DialogTitle>
                                            </DialogHeader>
                                            <div className="p-4 text-center">
                                                <Zap className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                                                <h3 className="text-lg font-bold mb-2">{t('jobPortal.publishJobOffer')}</h3>
                                                <p className="text-gray-600 mb-4">
                                                    {t('jobPortal.createJobDescription')}
                                                </p>
                                                <div className="space-y-3">
                                                    <Button asChild className="w-full">
                                                        <Link href={route('job-portal.create-simple-ad-form')}>
                                                            <Send className="w-4 h-4 mr-2" />
                                                            {t('jobPortal.createSimpleAd')}
                                                        </Link>
                                                    </Button>
                                                    <p className="text-xs text-gray-500">
                                                        {t('jobPortal.freeImmediatePublication')}
                                                    </p>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Liste des offres */}
                        <div className="lg:col-span-3">
                            {/* Header avec actions */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                                        {t('jobPortal.jobOffers')}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {jobs?.meta?.total || 0} {t('jobPortal.offersFound', { count: jobs?.meta?.total || 0 })}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {auth?.user && (
                                        <>
                                            <Link href={route('job-portal.my-applications')}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    {t('jobPortal.myApplications.title')}
                                                </Button>
                                            </Link>
                                            <Link href={route('job-portal.my-jobs')}>
                                                <Button variant="outline" size="sm">
                                                    <Briefcase className="w-4 h-4 mr-2" />
                                                    {t('jobPortal.myJobs.title')}
                                                </Button>
                                            </Link>
                                            <Link href={route('job-portal.profiles')}>
                                                <Button variant="outline" size="sm">
                                                    <Users className="w-4 h-4 mr-2" />
                                                    {t('jobPortal.searchProfiles')}
                                                </Button>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Liste des offres - Ultra compact mobile */}
                            <div className="space-y-3 sm:space-y-4">
                                {jobs?.data?.map((job, index) => (
                                    <motion.div
                                        key={job.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card className="hover:shadow-lg transition-all duration-300 group">
                                            <CardContent className="p-4 sm:p-6">
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                                                    <div className="flex items-start gap-3 sm:gap-4 flex-1">
                                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            {job.company.logo_path ? (
                                                                <img src={job.company.logo_path} alt={job.company.name} className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                                                            ) : (
                                                                <Building className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 transition-colors mb-1 line-clamp-2 sm:line-clamp-1">
                                                                <Link href={route('job-portal.show', job.id)}>
                                                                    {job.title}
                                                                </Link>
                                                            </h3>
                                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                                <div className="flex items-center gap-1">
                                                                    <Building className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                    <span className="truncate max-w-24 sm:max-w-none">{job.company.name}</span>
                                                                </div>
                                                                {job.location && (
                                                                    <div className="flex items-center gap-1">
                                                                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                        <span className="truncate max-w-20 sm:max-w-none">{job.location}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                    <span className="hidden sm:inline">{new Date(job.created_at).toLocaleDateString()}</span>
                                                                    <span className="sm:hidden">{new Date(job.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</span>
                                                                </div>
                                                            </div>
                                                            <p className="hidden sm:block text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                                                                {job.description.substring(0, 150)}...
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="text-right sm:text-right">
                                                        <div className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                                            <span className="block md:hidden">{formatSalary(job.salary_min, job.salary_max, job.salary_currency, true)}</span>
                                                            <span className="hidden md:block">{formatSalary(job.salary_min, job.salary_max, job.salary_currency, false)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Badges et actions - Ligne séparée sur mobile */}
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t sm:border-t-0">
                                                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                                                            {EMPLOYMENT_TYPES.find(t => t.value === job.employment_type)?.label}
                                                        </Badge>
                                                        {job.remote_work && (
                                                            <Badge className="bg-green-100 text-green-800 text-xs whitespace-nowrap">
                                                                <Wifi className="w-3 h-3 mr-1" />
                                                                <span className="hidden sm:inline">{t('jobPortal.remote')}</span>
                                                                <span className="sm:hidden">Remote</span>
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {/* Stats et actions compactes */}
                                                    <div className="flex items-center justify-between order-2 sm:order-1">
                                                        <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-500">
                                                            <div className="flex items-center gap-1">
                                                                <Eye className="w-3 h-3" />
                                                                <span>{job.views_count}</span>
                                                                <span className="hidden sm:inline">{t('jobPortal.views')}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Users className="w-3 h-3" />
                                                                <span>{job.applications_count}</span>
                                                                <span className="hidden sm:inline">{t('jobPortal.applications', { count: job.applications_count })}</span>
                                                            </div>
                                                        </div>

                                                        <Link href={route('job-portal.show', job.id)}>
                                                            <Button size="sm" className="group-hover:bg-blue-600 group-hover:text-white transition-colors h-8 text-xs sm:text-sm">
                                                                <span className="hidden sm:inline">{t('jobPortal.viewOffer')}</span>
                                                                <span className="sm:hidden">Voir</span>
                                                                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                                                            </Button>
                                                        </Link>
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
                                                className={`px-3 py-2 rounded-lg text-sm transition-colors ${link.active
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
                                        <Search className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                                        {t('jobPortal.noOffersFound')}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        {t('jobPortal.modifySearchCriteria')}
                                    </p>
                                    <Button onClick={clearFilters} variant="outline">
                                        {t('jobPortal.viewAllOffers')}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}