import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import {
    Search, MapPin, Briefcase, Clock, Building, Users,
    Wifi, Eye, ArrowRight, Filter, Globe, Calendar
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';

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

export default function JobPortalIndexClean({
    auth,
    jobs = { data: [], links: [], meta: { total: 0, last_page: 1 } },
    stats = { total_jobs: 0, companies_hiring: 0, remote_jobs: 0, new_this_week: 0 },
    topCompanies = [],
    filters = {}
}: JobPortalIndexProps) {
    const { t } = useTranslation();
    const [showFilters, setShowFilters] = useState(false);

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

    const formatSalary = (min: number, max: number, currency: string) => {
        if (!min && !max) return t('jobPortal.salaryNotSpecified');
        if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
        if (min) return t('jobPortal.salaryFrom', { amount: min.toLocaleString(), currency });
        return t('jobPortal.salaryUpTo', { amount: max.toLocaleString(), currency });
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

            <div className="min-h-screen bg-white dark:bg-gray-900">

                {/* Hero Section Simplifié */}
                <div className="bg-slate-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                    <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-3">
                                Trouvez votre prochain emploi
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                                Découvrez les meilleures opportunités d'emploi et donnez un nouvel élan à votre carrière
                            </p>
                        </div>

                        {/* Barre de recherche épurée */}
                        <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-2 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            type="text"
                                            placeholder="Poste, entreprise..."
                                            value={data.search}
                                            onChange={(e) => setData('search', e.target.value)}
                                            className="pl-10 h-10 border-0 bg-transparent focus:ring-0 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            type="text"
                                            placeholder="Ville, région..."
                                            value={data.location}
                                            onChange={(e) => setData('location', e.target.value)}
                                            className="pl-10 h-10 border-0 bg-transparent focus:ring-0 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        type="button"
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="h-10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <Filter className="w-4 h-4 mr-2" />
                                        Filtres
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="h-10 bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        Rechercher
                                    </Button>
                                </div>
                            </div>
                        </form>

                        {/* Filtres étendus */}
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="max-w-4xl mx-auto mt-4"
                            >
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Select
                                            value={data.employment_type}
                                            onValueChange={(value) => setData('employment_type', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Type de contrat" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Tous les types</SelectItem>
                                                {EMPLOYMENT_TYPES.map(type => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select
                                            value={data.experience_level}
                                            onValueChange={(value) => setData('experience_level', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Niveau d'expérience" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Tous les niveaux</SelectItem>
                                                {EXPERIENCE_LEVELS.map(level => (
                                                    <SelectItem key={level.value} value={level.value}>
                                                        {level.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id="remote"
                                                    checked={data.remote}
                                                    onChange={(e) => setData('remote', e.target.checked)}
                                                    className="rounded border-gray-300"
                                                />
                                                <label htmlFor="remote" className="text-sm text-gray-700 dark:text-gray-300">
                                                    Télétravail possible
                                                </label>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={clearFilters}
                                                className="text-sm text-gray-500 hover:text-gray-700"
                                            >
                                                Effacer
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Statistiques minimalistes */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                            <div className="text-center">
                                <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                                    {stats.total_jobs.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Offres d'emploi</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                                    {stats.companies_hiring}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Entreprises</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                                    {stats.remote_jobs}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Télétravail</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                                    {stats.new_this_week}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Cette semaine</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contenu principal */}
                <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {jobs?.meta?.total || 0} offres d'emploi
                            </h2>
                            {(data.search || data.location) && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {data.search && `pour "${data.search}"`}
                                    {data.search && data.location && " "}
                                    {data.location && `à ${data.location}`}
                                </p>
                            )}
                        </div>

                        {auth?.user && (
                            <div className="flex items-center gap-3">
                                <Link href={route('job-portal.my-applications')}>
                                    <Button variant="outline" size="sm">
                                        <Eye className="w-4 h-4 mr-2" />
                                        Mes candidatures
                                    </Button>
                                </Link>
                                <Link href={route('job-portal.create-simple-ad-form')}>
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                        Publier une offre
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Liste des offres épurée */}
                    <div className="space-y-4">
                        {jobs?.data?.map((job, index) => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-start gap-4 flex-1">
                                                {/* Logo entreprise */}
                                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    {job.company.logo_path ? (
                                                        <img
                                                            src={job.company.logo_path}
                                                            alt={job.company.name}
                                                            className="w-8 h-8 object-contain"
                                                        />
                                                    ) : (
                                                        <Building className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    {/* Titre et entreprise */}
                                                    <div className="mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition-colors">
                                                            <Link href={route('job-portal.show', job.id)}>
                                                                {job.title}
                                                            </Link>
                                                        </h3>
                                                        <p className="text-gray-600 dark:text-gray-400 font-medium">
                                                            {job.company.name}
                                                        </p>
                                                    </div>

                                                    {/* Métadonnées */}
                                                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
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
                                                        <div className="flex items-center gap-1">
                                                            <Eye className="w-4 h-4" />
                                                            {job.views_count} vues
                                                        </div>
                                                    </div>

                                                    {/* Description */}
                                                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                                                        {job.description.substring(0, 150)}...
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Informations droite */}
                                            <div className="text-right ml-4">
                                                {/* Salaire */}
                                                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                                    {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                                                </div>

                                                {/* Badges */}
                                                <div className="flex flex-col gap-1 items-end mb-3">
                                                    <Badge variant="outline" className="text-xs">
                                                        {EMPLOYMENT_TYPES.find(t => t.value === job.employment_type)?.label}
                                                    </Badge>
                                                    {job.remote_work && (
                                                        <Badge className="bg-green-100 text-green-800 text-xs">
                                                            <Wifi className="w-3 h-3 mr-1" />
                                                            Télétravail
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Bouton d'action */}
                                                <Link href={route('job-portal.show', job.id)}>
                                                    <Button size="sm" variant="outline" className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600">
                                                        Voir l'offre
                                                        <ArrowRight className="w-4 h-4 ml-2" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pagination simplifiée */}
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
                                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
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
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Aucune offre trouvée
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                Essayez de modifier vos critères de recherche
                            </p>
                            <Button onClick={clearFilters} variant="outline">
                                Voir toutes les offres
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}