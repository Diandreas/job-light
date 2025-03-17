import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import JobPortalNav from '@/Components/JobPortalNav';
import { JobListing, Competence, User, JobApplication } from '@/types';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/Components/ui/card';
import {
    AlertCircle,
    Briefcase,
    Calendar,
    CheckCircle,
    ChevronLeft,
    Clock,
    DollarSign,
    Download,
    Edit,
    FileText,
    MessagesSquare,
    Tag,
    Trash2,
    User as UserIcon,
    X
} from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/Components/ui/alert';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/Components/ui/tooltip';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/Components/ui/alert-dialog';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/Components/ui/accordion';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';

interface Props {
    jobListing: JobListing & { hasApplied?: boolean };
    applications?: JobApplication[];
    hasApplied: boolean;
    userTokens: number;
    auth: {
        user: User;
    };
}

export default function Show({ auth, jobListing, applications, hasApplied, userTokens }: Props) {
    const { t, i18n } = useTranslation();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        try {
            return format(new Date(dateString), 'PPP', {
                locale: i18n.language === 'fr' ? fr : enUS
            });
        } catch (e) {
            return dateString;
        }
    };

    const formatBudget = (min?: number | null, max?: number | null, type?: string) => {
        if (!min && !max) return t('jobListing.budgetNegotiable');

        const currency = '€';
        const minDisplay = min ? `${min}${currency}` : '';
        const maxDisplay = max ? `${max}${currency}` : '';

        if (min && max) {
            return `${minDisplay} - ${maxDisplay} ${type === 'hourly' ? `/ ${t('jobListing.hour')}` : ''}`;
        } else if (min) {
            return `${t('jobListing.from')} ${minDisplay} ${type === 'hourly' ? `/ ${t('jobListing.hour')}` : ''}`;
        } else if (max) {
            return `${t('jobListing.upTo')} ${maxDisplay} ${type === 'hourly' ? `/ ${t('jobListing.hour')}` : ''}`;
        }

        return '';
    };

    const handleDelete = () => {
        router.delete(route('job-listings.destroy', jobListing.id), {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
            }
        });
    };

    const handleClose = () => {
        router.patch(route('job-listings.close', jobListing.id), {}, {
            onSuccess: () => {
                setIsCloseDialogOpen(false);
            }
        });
    };

    const statusBadge = (status: JobApplication['status']) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                    {t('jobApplication.status.pending')}
                </Badge>;
            case 'shortlisted':
                return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                    {t('jobApplication.status.shortlisted')}
                </Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                    {t('jobApplication.status.rejected')}
                </Badge>;
            case 'hired':
                return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    {t('jobApplication.status.hired')}
                </Badge>;
            default:
                return null;
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col gap-4">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        {jobListing.title}
                    </h2>
                    <JobPortalNav />
                </div>
            }
        >
            <Head title={jobListing.title} />

            <div className="py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link
                            href={route('job-listings.index')}
                            className="flex items-center text-sm text-gray-600 hover:text-amber-600 transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            {t('jobListing.backToListings')}
                        </Link>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1">
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                        <div>
                                            <CardTitle className="text-2xl flex items-center gap-2">
                                                {jobListing.title}
                                                {jobListing.is_featured && (
                                                    <Badge className="bg-amber-500 hover:bg-amber-600">
                                                        {t('jobListing.featured')}
                                                    </Badge>
                                                )}
                                                <Badge variant="outline" className={cn(
                                                    jobListing.status === 'draft' && "bg-gray-100 text-gray-800 border-gray-200",
                                                    jobListing.status === 'open' && "bg-green-100 text-green-800 border-green-200",
                                                    jobListing.status === 'closed' && "bg-red-100 text-red-800 border-red-200",
                                                )}>
                                                    {jobListing.status === 'draft'
                                                        ? t('jobListing.status.draft')
                                                        : jobListing.status === 'open'
                                                            ? t('jobListing.status.open')
                                                            : t('jobListing.status.closed')
                                                    }
                                                </Badge>
                                            </CardTitle>

                                            <div className="text-sm text-gray-500 flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                                                <div className="flex items-center">
                                                    <UserIcon className="h-4 w-4 mr-1" />
                                                    <span>{jobListing.recruiter?.name}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    <span>{formatDate(jobListing.created_at)}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <DollarSign className="h-4 w-4 mr-1" />
                                                    <span>
                                                        {formatBudget(jobListing.budget_min, jobListing.budget_max, jobListing.budget_type)}
                                                        ({jobListing.budget_type === 'fixed'
                                                            ? t('jobListing.fixedPrice')
                                                            : t('jobListing.hourlyRate')})
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {auth.user.id === jobListing.user_id && (
                                            <div className="flex items-center space-x-2">
                                                <Link href={route('job-listings.edit', jobListing.id)}>
                                                    <Button size="sm" variant="outline">
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        {t('jobListing.edit')}
                                                    </Button>
                                                </Link>

                                                {jobListing.status === 'open' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-orange-200 bg-orange-100 text-orange-800 hover:bg-orange-200"
                                                        onClick={() => setIsCloseDialogOpen(true)}
                                                    >
                                                        <X className="h-4 w-4 mr-1" />
                                                        {t('jobListing.close')}
                                                    </Button>
                                                )}

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-red-200 bg-red-100 text-red-800 hover:bg-red-200"
                                                    onClick={() => setIsDeleteDialogOpen(true)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    {t('jobListing.delete')}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="pb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        {jobListing.experience_level && (
                                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                                <div className="text-sm text-gray-500">{t('jobListing.experienceLevel.title')}</div>
                                                <div className="font-medium flex items-center mt-1">
                                                    <Briefcase className="h-4 w-4 mr-1.5 text-amber-500" />
                                                    {jobListing.experience_level === 'beginner'
                                                        ? t('jobListing.experienceLevel.beginner')
                                                        : jobListing.experience_level === 'intermediate'
                                                            ? t('jobListing.experienceLevel.intermediate')
                                                            : t('jobListing.experienceLevel.expert')}
                                                </div>
                                            </div>
                                        )}

                                        {jobListing.duration && (
                                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                                <div className="text-sm text-gray-500">{t('jobListing.duration')}</div>
                                                <div className="font-medium flex items-center mt-1">
                                                    <Clock className="h-4 w-4 mr-1.5 text-amber-500" />
                                                    {jobListing.duration}
                                                </div>
                                            </div>
                                        )}

                                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                            <div className="text-sm text-gray-500">{t('jobListing.tokensCost')}</div>
                                            <div className="font-medium flex items-center mt-1">
                                                <Tag className="h-4 w-4 mr-1.5 text-amber-500" />
                                                {jobListing.tokens_required} {t('jobListing.tokens')}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="prose dark:prose-invert max-w-none">
                                        <h3 className="text-lg font-medium mb-2">{t('jobListing.description')}</h3>
                                        <div className="whitespace-pre-wrap">{jobListing.description}</div>
                                    </div>

                                    {jobListing.requiredSkills && jobListing.requiredSkills.length > 0 && (
                                        <div className="mt-6">
                                            <h3 className="text-lg font-medium mb-3">{t('jobListing.requiredSkills')}</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {jobListing.requiredSkills.map((skill) => (
                                                    <TooltipProvider key={skill.id}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Badge
                                                                    variant={
                                                                        skill.pivot?.importance === 'required'
                                                                            ? 'default'
                                                                            : skill.pivot?.importance === 'preferred'
                                                                                ? 'secondary'
                                                                                : 'outline'
                                                                    }
                                                                    className="cursor-help text-sm py-1"
                                                                >
                                                                    {skill.name}
                                                                </Badge>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {skill.pivot?.importance === 'required'
                                                                    ? t('jobListing.skillRequired')
                                                                    : skill.pivot?.importance === 'preferred'
                                                                        ? t('jobListing.skillPreferred')
                                                                        : t('jobListing.skillNiceToHave')}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {jobListing.deadline && (
                                        <div className="mt-6">
                                            <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                                                <Calendar className="h-4 w-4" />
                                                <AlertTitle>{t('jobListing.applicationDeadline')}</AlertTitle>
                                                <AlertDescription>
                                                    {t('jobListing.applicationsUntil')} <strong>{formatDate(jobListing.deadline)}</strong>
                                                </AlertDescription>
                                            </Alert>
                                        </div>
                                    )}
                                </CardContent>

                                <CardFooter className="flex flex-col sm:flex-row justify-between gap-3">
                                    <div className="text-sm text-gray-500 flex items-center">
                                        <MessagesSquare className="h-4 w-4 mr-1.5" />
                                        {jobListing.applications_count || 0} {t('jobListing.applications')}
                                    </div>

                                    {auth.user.id !== jobListing.user_id && (
                                        jobListing.status === 'open' ? (
                                            hasApplied ? (
                                                <Alert className="bg-green-50 border-green-200 text-green-800 my-0 py-2">
                                                    <CheckCircle className="h-4 w-4" />
                                                    <AlertDescription className="text-sm">
                                                        {t('jobListing.alreadyApplied')}
                                                    </AlertDescription>
                                                </Alert>
                                            ) : (
                                                userTokens < jobListing.tokens_required ? (
                                                    <Alert className="bg-amber-50 border-amber-200 text-amber-800 my-0 py-2">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <AlertDescription className="text-sm">
                                                            {t('jobListing.notEnoughTokens', { required: jobListing.tokens_required, available: userTokens })}
                                                            <Link
                                                                href={route('payment.index')}
                                                                className="ml-2 underline font-medium"
                                                            >
                                                                {t('jobListing.buyTokens')}
                                                            </Link>
                                                        </AlertDescription>
                                                    </Alert>
                                                ) : (
                                                    <Link href={route('job-applications.create', jobListing.id)}>
                                                        <Button>
                                                            {t('jobListing.applyNow')}
                                                        </Button>
                                                    </Link>
                                                )
                                            )
                                        ) : (
                                            <Alert className="bg-gray-50 border-gray-200 text-gray-800 my-0 py-2">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription className="text-sm">
                                                    {t('jobListing.noLongerAcceptingApplications')}
                                                </AlertDescription>
                                            </Alert>
                                        )
                                    )}
                                </CardFooter>
                            </Card>
                        </div>

                        {applications && applications.length > 0 && (
                            <div className="w-full lg:w-80 xl:w-96">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('jobListing.applications')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Accordion type="single" collapsible className="w-full">
                                            {applications.map((application) => (
                                                <AccordionItem key={application.id} value={`application-${application.id}`}>
                                                    <AccordionTrigger className="hover:no-underline">
                                                        <div className="flex items-center justify-between w-full pr-4">
                                                            <div className="flex items-center">
                                                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-amber-500 to-purple-500 flex items-center justify-center mr-2">
                                                                    <span className="text-white font-medium text-xs">
                                                                        {application.applicant?.name.charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                                <div className="text-left">
                                                                    <div className="font-medium">{application.applicant?.name}</div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {application.viewed_at
                                                                            ? formatDate(application.viewed_at)
                                                                            : t('jobApplication.notViewed')}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                {statusBadge(application.status)}
                                                            </div>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent>
                                                        <div className="space-y-3 pt-2">
                                                            {application.proposed_rate && (
                                                                <div>
                                                                    <div className="text-sm font-medium">{t('jobApplication.proposedRate')}</div>
                                                                    <div className="text-amber-600 font-medium">
                                                                        {application.proposed_rate}€ {jobListing.budget_type === 'hourly' && `/ ${t('jobListing.hour')}`}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div>
                                                                <div className="text-sm font-medium">{t('jobApplication.coverLetter')}</div>
                                                                <div className="text-sm mt-1 text-gray-600 line-clamp-3">
                                                                    {application.cover_letter}
                                                                </div>
                                                            </div>

                                                            {application.attachments && application.attachments.length > 0 && (
                                                                <div>
                                                                    <div className="text-sm font-medium">{t('jobApplication.attachments')}</div>
                                                                    <div className="space-y-1 mt-1">
                                                                        {application.attachments.map((attachment) => (
                                                                            <a
                                                                                key={attachment.id}
                                                                                href={route('job-application-attachments.download', attachment.id)}
                                                                                className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                                                                target="_blank"
                                                                            >
                                                                                <FileText className="h-3 w-3 mr-1" />
                                                                                <span className="truncate max-w-[200px]">{attachment.file_name}</span>
                                                                                <Download className="h-3 w-3 ml-1" />
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="pt-1">
                                                                <Link
                                                                    href={route('job-applications.show', application.id)}
                                                                    className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                                                                >
                                                                    {t('jobApplication.viewFull')}
                                                                </Link>
                                                            </div>

                                                            <Separator />

                                                            <div className="flex justify-between pt-1">
                                                                <Select
                                                                    defaultValue={application.status}
                                                                    onValueChange={(value) => {
                                                                        router.patch(route('job-applications.update-status', application.id), {
                                                                            status: value
                                                                        }, {
                                                                            preserveState: true
                                                                        });
                                                                    }}
                                                                >
                                                                    <SelectTrigger className="w-[150px]">
                                                                        <SelectValue placeholder={t('jobApplication.updateStatus')} />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="pending">{t('jobApplication.status.pending')}</SelectItem>
                                                                        <SelectItem value="shortlisted">{t('jobApplication.status.shortlisted')}</SelectItem>
                                                                        <SelectItem value="rejected">{t('jobApplication.status.rejected')}</SelectItem>
                                                                        <SelectItem value="hired">{t('jobApplication.status.hired')}</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirm Delete Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('jobListing.deleteConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('jobListing.deleteConfirmDescription')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {t('jobListing.confirmDelete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Confirm Close Dialog */}
            <AlertDialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('jobListing.closeConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('jobListing.closeConfirmDescription')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleClose}
                            className="bg-amber-500 hover:bg-amber-600"
                        >
                            {t('jobListing.confirmClose')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
} 