import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { JobListing, User } from '@/types';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/Components/ui/card';
import {
    AlertCircle,
    Briefcase,
    Calendar,
    Clock,
    DollarSign,
    Edit,
    ExternalLink,
    Eye,
    FileText,
    MoreHorizontal,
    PenSquare,
    Plus,
    Trash2,
    User as UserIcon
} from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/Components/ui/tooltip';
import JobPortalNav from '@/Components/JobPortalNav';

interface Props {
    jobListings: {
        data: JobListing[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    auth: {
        user: User;
    };
}

export default function MyListings({ auth, jobListings }: Props) {
    const { t, i18n } = useTranslation();

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return (
                    <Badge variant="outline" className="flex items-center space-x-1 bg-gray-100 text-gray-800 hover:bg-gray-100">
                        <PenSquare className="h-3 w-3" />
                        <span>{t('jobListing.status.draft')}</span>
                    </Badge>
                );
            case 'open':
                return (
                    <Badge variant="outline" className="flex items-center space-x-1 bg-green-100 text-green-800 hover:bg-green-100">
                        <AlertCircle className="h-3 w-3" />
                        <span>{t('jobListing.status.open')}</span>
                    </Badge>
                );
            case 'closed':
                return (
                    <Badge variant="outline" className="flex items-center space-x-1 bg-red-100 text-red-800 hover:bg-red-100">
                        <AlertCircle className="h-3 w-3" />
                        <span>{t('jobListing.status.closed')}</span>
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline">{status}</Badge>
                );
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd MMM yyyy', {
                locale: i18n.language === 'fr' ? fr : enUS
            });
        } catch (e) {
            return dateString;
        }
    };

    const formatBudget = (jobListing: JobListing) => {
        if (!jobListing.budget_min && !jobListing.budget_max) return t('jobListing.budgetNegotiable');

        const currencySymbol = getCurrencySymbol(jobListing.currency);
        const minDisplay = jobListing.budget_min ? `${jobListing.budget_min} ${currencySymbol}` : '';
        const maxDisplay = jobListing.budget_max ? `${jobListing.budget_max} ${currencySymbol}` : '';

        if (jobListing.budget_min && jobListing.budget_max) {
            return `${minDisplay} - ${maxDisplay} ${jobListing.budget_type === 'hourly' ? `/ ${t('jobListing.hour')}` : ''}`;
        } else if (jobListing.budget_min) {
            return `${t('jobListing.from')} ${minDisplay} ${jobListing.budget_type === 'hourly' ? `/ ${t('jobListing.hour')}` : ''}`;
        } else if (jobListing.budget_max) {
            return `${t('jobListing.upTo')} ${maxDisplay} ${jobListing.budget_type === 'hourly' ? `/ ${t('jobListing.hour')}` : ''}`;
        }

        return '';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col gap-4">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        {t('jobListing.myListings')}
                    </h2>
                    <JobPortalNav currentRoute="job-listings.my-listings" />
                </div>
            }
        >
            <Head title={t('jobListing.myListings')} />

            <div className="py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 leading-tight">
                            {t('jobListing.myListings')}
                        </h2>

                        <div className="mt-4 md:mt-0">
                            <Link href={route('job-listings.create')}>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    {t('jobListing.createNew')}
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {jobListings.data.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-1">
                                    {t('jobListing.noListings')}
                                </h3>
                                <p className="text-gray-500 mb-4 text-center max-w-md">
                                    {t('jobListing.noListingsDescription')}
                                </p>
                                <Link href={route('job-listings.create')}>
                                    <Button>
                                        {t('jobListing.createFirst')}
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="grid gap-4 mb-6">
                                {jobListings.data.map((jobListing) => (
                                    <Card key={jobListing.id} className="overflow-hidden">
                                        <CardHeader className="p-4 pb-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-lg mb-1">
                                                        <Link
                                                            href={route('job-listings.show', jobListing.id)}
                                                            className="text-gray-900 hover:text-amber-600 transition-colors"
                                                        >
                                                            {jobListing.title}
                                                        </Link>
                                                    </CardTitle>
                                                    <div className="text-sm text-gray-500 mb-2">
                                                        {t('jobListing.postedOn')}: {formatDate(jobListing.created_at)}
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    {getStatusBadge(jobListing.status)}

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>
                                                                <Link
                                                                    href={route('job-listings.show', jobListing.id)}
                                                                    className="flex items-center w-full"
                                                                >
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    {t('jobListing.view')}
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Link
                                                                    href={route('job-listings.edit', jobListing.id)}
                                                                    className="flex items-center w-full"
                                                                >
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    {t('jobListing.edit')}
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            {jobListing.status === 'open' && (
                                                                <DropdownMenuItem>
                                                                    <Link
                                                                        href={route('job-listings.close', jobListing.id)}
                                                                        method="patch"
                                                                        as="button"
                                                                        className="flex items-center w-full text-amber-600"
                                                                    >
                                                                        <Clock className="h-4 w-4 mr-2" />
                                                                        {t('jobListing.close')}
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem>
                                                                <Link
                                                                    href={route('job-listings.destroy', jobListing.id)}
                                                                    method="delete"
                                                                    as="button"
                                                                    className="flex items-center w-full text-red-600"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    {t('jobListing.delete')}
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="p-4 pt-0">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 md:gap-y-0 gap-x-4 text-sm mt-2">
                                                <div className="flex items-center">
                                                    <DollarSign className="h-4 w-4 mr-1.5 text-gray-500" />
                                                    <span>{formatBudget(jobListing)}</span>
                                                </div>
                                                {jobListing.applications_count !== undefined && (
                                                    <div className="flex items-center">
                                                        <FileText className="h-4 w-4 mr-1.5 text-gray-500" />
                                                        <span>
                                                            {t('jobListing.applicationsCount', { count: jobListing.applications_count })}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-1.5 text-gray-500" />
                                                    <span>
                                                        {jobListing.deadline
                                                            ? t('jobListing.deadline') + ': ' + formatDate(jobListing.deadline)
                                                            : t('jobListing.noDeadline')}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {jobListings.links.length > 3 && (
                                <div className="flex flex-wrap justify-center mt-4 gap-1">
                                    {jobListings.links.map((link, i) => {
                                        if (link.url === null) {
                                            return (
                                                <span
                                                    key={i}
                                                    className="px-4 py-2 text-sm text-gray-500 bg-white rounded border border-gray-300"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        }

                                        return (
                                            <Link
                                                key={i}
                                                href={link.url}
                                                className={`px-4 py-2 text-sm rounded border ${link.active
                                                    ? 'bg-amber-600 text-white border-amber-600'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Fonction utilitaire pour obtenir le symbole de la devise
const getCurrencySymbol = (currency?: string) => {
    if (!currency) return '€';

    switch (currency) {
        case 'EUR':
            return '€';
        case 'XAF':
            return 'FCFA';
        default:
            return '€';
    }
}; 