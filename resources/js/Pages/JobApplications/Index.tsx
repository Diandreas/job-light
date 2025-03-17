import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { JobApplication, User } from '@/types';
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
    CheckCircle2,
    Clock,
    ExternalLink,
    FileText,
    MoreHorizontal,
    XCircle
} from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { format } from 'date-fns';
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
import {
    Alert,
    AlertDescription,
} from '@/Components/ui/alert';
import JobPortalNav from '@/Components/JobPortalNav';

interface Props {
    applications: {
        data: JobApplication[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    auth: {
        user: User;
    };
}

export default function Index({ auth, applications }: Props) {
    const { t } = useTranslation();

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge variant="outline" className="flex items-center space-x-1 bg-gray-100 text-gray-800 hover:bg-gray-100">
                        <Clock className="h-3 w-3" />
                        <span>{t('jobApplication.status.pending')}</span>
                    </Badge>
                );
            case 'shortlisted':
                return (
                    <Badge variant="outline" className="flex items-center space-x-1 bg-amber-100 text-amber-800 hover:bg-amber-100">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{t('jobApplication.status.shortlisted')}</span>
                    </Badge>
                );
            case 'hired':
                return (
                    <Badge variant="outline" className="flex items-center space-x-1 bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{t('jobApplication.status.hired')}</span>
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge variant="outline" className="flex items-center space-x-1 bg-red-100 text-red-800 hover:bg-red-100">
                        <XCircle className="h-3 w-3" />
                        <span>{t('jobApplication.status.rejected')}</span>
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline">{status}</Badge>
                );
        }
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'dd MMM yyyy');
    };

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

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col gap-4">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        {t('jobApplication.index.title')}
                    </h2>
                    <JobPortalNav currentRoute="job-applications.index" />
                </div>
            }
        >
            <Head title={t('jobApplication.index.title')} />

            <div className="py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 leading-tight">
                            {t('jobApplication.index.title')}
                        </h2>
                    </div>

                    {applications.data.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-1">
                                    {t('jobApplication.noCandidatures')}
                                </h3>
                                <p className="text-gray-500 mb-4 text-center max-w-md">
                                    {t('jobApplication.noCandidaturesDescription')}
                                </p>
                                <Link href={route('job-listings.index')}>
                                    <Button>
                                        {t('jobApplication.findJobs')}
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="grid gap-4 mb-6">
                                {applications.data.map((application) => (
                                    <Card key={application.id} className="overflow-hidden">
                                        <CardHeader className="p-4 pb-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-lg mb-1">
                                                        <Link
                                                            href={route('job-listings.show', application.job_listing_id)}
                                                            className="text-gray-900 hover:text-amber-600 transition-colors"
                                                        >
                                                            {application.jobListing?.title || t('jobApplication.unavailableListing')}
                                                        </Link>
                                                    </CardTitle>
                                                    <div className="text-sm text-gray-500 mb-2">
                                                        {t('jobApplication.appliedOn')}: {formatDate(application.created_at)}
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    {getStatusBadge(application.status)}

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>
                                                                <Link
                                                                    href={route('job-listings.show', application.job_listing_id)}
                                                                    className="flex items-center w-full"
                                                                >
                                                                    <Briefcase className="h-4 w-4 mr-2" />
                                                                    {t('jobApplication.viewJob')}
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            {application.status !== 'rejected' && application.status !== 'hired' && (
                                                                <DropdownMenuItem>
                                                                    <Link
                                                                        href={route('job-applications.destroy', application.id)}
                                                                        method="delete"
                                                                        as="button"
                                                                        className="flex items-center w-full text-red-600"
                                                                    >
                                                                        <XCircle className="h-4 w-4 mr-2" />
                                                                        {t('jobApplication.withdraw')}
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="p-4 pt-0">
                                            <div className="text-sm">
                                                <h4 className="font-medium mb-1">{t('jobApplication.coverLetter')}:</h4>
                                                <p className="text-gray-700 whitespace-pre-line">
                                                    {application.cover_letter.length > 250
                                                        ? `${application.cover_letter.slice(0, 250)}...`
                                                        : application.cover_letter}
                                                </p>
                                            </div>

                                            {application.proposed_rate && (
                                                <div className="mt-3 text-sm">
                                                    <span className="font-medium">{t('jobApplication.proposedRate')}:</span>{' '}
                                                    <span className="text-gray-700">
                                                        {application.proposed_rate} {getCurrencySymbol(application.jobListing?.currency)}
                                                        {application.jobListing?.budget_type === 'hourly' && `/${t('jobListing.hour')}`}
                                                    </span>
                                                </div>
                                            )}

                                            {application.attachments && application.attachments.length > 0 && (
                                                <div className="mt-3">
                                                    <h4 className="text-sm font-medium mb-2">{t('jobApplication.attachments')}:</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {application.attachments.map((attachment) => (
                                                            <TooltipProvider key={attachment.id}>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Link
                                                                            href={`/storage/${attachment.file_path}`}
                                                                            target="_blank"
                                                                            className="flex items-center p-1.5 px-2 bg-gray-100 rounded-md text-sm text-gray-800 hover:bg-gray-200 transition-colors"
                                                                        >
                                                                            <FileText className="h-4 w-4 mr-1.5" />
                                                                            <span className="truncate max-w-[120px]">
                                                                                {attachment.file_name}
                                                                            </span>
                                                                            <ExternalLink className="h-3 w-3 ml-1" />
                                                                        </Link>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{attachment.description || attachment.file_name}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {application.viewed_at && (
                                                <div className="mt-3 flex items-center text-xs text-gray-500">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {t('jobApplication.viewedOn', { date: formatDate(application.viewed_at) })}
                                                </div>
                                            )}

                                            {application.status === 'rejected' && (
                                                <Alert className="mt-3 bg-red-50 border-red-200 text-red-800">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>
                                                        {t('jobApplication.rejectionNotice')}
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            {application.status === 'hired' && (
                                                <Alert className="mt-3 bg-green-50 border-green-200 text-green-800">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    <AlertDescription>
                                                        {t('jobApplication.hiredNotice')}
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {applications.links.length > 3 && (
                                <div className="flex flex-wrap justify-center mt-4 gap-1">
                                    {applications.links.map((link, i) => {
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