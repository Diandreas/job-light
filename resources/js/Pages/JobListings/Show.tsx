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
    X,
    Eye
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
    jobListing: JobListing & {
        applications?: (JobApplication & {
            applicant?: User & {
                summary?: { id: number; content: string };
                experiences?: {
                    id: number;
                    title: string;
                    company: string;
                    start_date: string;
                    end_date?: string;
                    description: string;
                }[];
                competences?: {
                    id: number;
                    name: string;
                    pivot?: {
                        level?: string;
                    };
                }[];
                educations?: {
                    id: number;
                    degree: string;
                    institution: string;
                    start_date: string;
                    end_date?: string;
                    description: string;
                }[];
                hobbies?: {
                    id: number;
                    name: string;
                }[];
            }
        })[];
        hasApplied?: boolean;
    };
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

    const formatBudget = (min?: number | null, max?: number | null, type?: string) => {
        if (!min && !max) return t('jobListing.budgetNegotiable');

        const currencySymbol = getCurrencySymbol(jobListing.currency);
        const minDisplay = min ? `${min} ${currencySymbol}` : '';
        const maxDisplay = max ? `${max} ${currencySymbol}` : '';

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
                                                        <div className="space-y-4 pt-2">
                                                            {/* Résumé du candidat */}
                                                            {application.applicant?.summary ? (
                                                                <div>
                                                                    <h4 className="text-sm font-medium mb-2">{t('jobListing.candidateSummary')}</h4>
                                                                    <div className="bg-gray-50 p-3 rounded-md text-sm whitespace-pre-line">
                                                                        {application.applicant.summary.content}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <h4 className="text-sm font-medium mb-2">{t('jobListing.candidateSummary')}</h4>
                                                                    <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-500">
                                                                        {t('jobApplication.candidateInfo.noSummary')}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Experiences Section */}
                                                            {application.applicant?.experiences && application.applicant.experiences.length > 0 ? (
                                                                <div className="mb-6">
                                                                    <h4 className="text-sm font-medium mb-2">{t('jobListing.candidateExperience')}</h4>
                                                                    <div className="space-y-4">
                                                                        {application.applicant.experiences.map((experience) => (
                                                                            <div key={experience.id} className="bg-gray-50 p-3 rounded-md">
                                                                                <div className="font-medium">{experience.title}</div>
                                                                                <div className="text-sm text-gray-600">{experience.company}</div>
                                                                                <div className="text-sm text-gray-500">
                                                                                    {formatDate(experience.start_date)} - {experience.end_date ? formatDate(experience.end_date) : t('jobApplication.candidateInfo.present')}
                                                                                </div>
                                                                                {experience.description && (
                                                                                    <div className="text-sm mt-2 whitespace-pre-line">{experience.description}</div>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="mb-6">
                                                                    <h4 className="text-sm font-medium mb-2">{t('jobListing.candidateExperience')}</h4>
                                                                    <div className="text-sm text-gray-500">{t('jobApplication.candidateInfo.noExperience')}</div>
                                                                </div>
                                                            )}

                                                            {/* Éducation/Formation du candidat - avec présentation améliorée */}
                                                            {application.applicant?.educations && application.applicant.educations.length > 0 ? (
                                                                <div>
                                                                    <h4 className="text-sm font-medium mb-2">{t('jobListing.candidateEducation')}</h4>
                                                                    <div className="space-y-3">
                                                                        {application.applicant.educations.map((education) => (
                                                                            <div key={education.id} className="bg-gray-50 p-3 rounded-md">
                                                                                <div className="font-medium">{education.degree}</div>
                                                                                <div className="text-sm text-gray-600">{education.institution}</div>
                                                                                <div className="text-xs text-gray-500">
                                                                                    {formatDate(education.start_date)} - {education.end_date ? formatDate(education.end_date) : t('jobApplication.candidateInfo.present')}
                                                                                </div>
                                                                                {education.description && (
                                                                                    <div className="text-sm mt-2 whitespace-pre-line">{education.description}</div>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <h4 className="text-sm font-medium mb-2">{t('jobListing.candidateEducation')}</h4>
                                                                    <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-500">
                                                                        {t('jobApplication.candidateInfo.noEducation')}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Hobbies du candidat */}
                                                            {application.applicant?.hobbies && application.applicant.hobbies.length > 0 ? (
                                                                <div>
                                                                    <h4 className="text-sm font-medium mb-2">{t('jobApplication.candidateInfo.hobbies')}</h4>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {application.applicant.hobbies.map((hobby) => (
                                                                            <Badge key={hobby.id} variant="secondary">
                                                                                {hobby.name}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ) : null}

                                                            {/* Compétences du candidat */}
                                                            {application.applicant?.competences && application.applicant.competences.length > 0 && (
                                                                <div>
                                                                    <h4 className="text-sm font-medium mb-2">{t('jobListing.candidateSkills')}</h4>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {application.applicant.competences.map((competence) => (
                                                                            <Badge key={competence.id} variant="secondary">
                                                                                {competence.name}
                                                                                {competence.pivot?.level && (
                                                                                    <span className="ml-1 text-xs text-gray-500">({competence.pivot.level})</span>
                                                                                )}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Taux proposé */}
                                                            {application.proposed_rate && (
                                                                <div>
                                                                    <h4 className="text-sm font-medium mb-2">{t('jobApplication.proposedRate')}</h4>
                                                                    <div className="text-amber-600 font-medium">
                                                                        {application.proposed_rate} {getCurrencySymbol(jobListing.currency)}
                                                                        {jobListing.budget_type === 'hourly' && ` / ${t('jobListing.hour')}`}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Lettre de motivation */}
                                                            <div>
                                                                <h4 className="text-sm font-medium mb-2">{t('jobApplication.coverLetter')}</h4>
                                                                <div className="bg-gray-50 p-3 rounded-md text-sm whitespace-pre-line">
                                                                    {application.cover_letter}
                                                                </div>
                                                            </div>

                                                            {/* Pièces jointes avec prévisualisation et catégorisation */}
                                                            {application.attachments && application.attachments.length > 0 && (
                                                                <div>
                                                                    <h4 className="text-sm font-medium mb-2">{t('jobApplication.attachments')}</h4>

                                                                    {/* Regroupement des pièces jointes par type */}
                                                                    <div className="space-y-3">
                                                                        {/* Documents (PDF, DOC, etc.) */}
                                                                        {application.attachments.filter(a => a.file_type.includes('pdf') || a.file_type.includes('doc') || a.file_type.includes('txt') || a.file_type.includes('rtf')).length > 0 && (
                                                                            <div>
                                                                                <h5 className="text-xs font-medium text-gray-500 mb-2">Documents</h5>
                                                                                <div className="space-y-2">
                                                                                    {application.attachments
                                                                                        .filter(a => a.file_type.includes('pdf') || a.file_type.includes('doc') || a.file_type.includes('txt') || a.file_type.includes('rtf'))
                                                                                        .map((attachment) => (
                                                                                            <div key={attachment.id} className="bg-gray-50 p-3 rounded-md">
                                                                                                <div className="flex items-center justify-between">
                                                                                                    <div className="flex items-start">
                                                                                                        <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                                                                                        <div>
                                                                                                            <div className="font-medium">{attachment.file_name}</div>
                                                                                                            {attachment.description && (
                                                                                                                <div className="text-sm text-gray-500">{attachment.description}</div>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="flex items-center space-x-2">
                                                                                                        <Dialog>
                                                                                                            <DialogTrigger asChild>
                                                                                                                <Button variant="outline" size="sm">
                                                                                                                    <Eye className="h-4 w-4 mr-1" />
                                                                                                                    {t('jobListing.previewAttachment')}
                                                                                                                </Button>
                                                                                                            </DialogTrigger>
                                                                                                            <DialogContent className="max-w-4xl h-[80vh]">
                                                                                                                <DialogHeader>
                                                                                                                    <DialogTitle>{attachment.file_name}</DialogTitle>
                                                                                                                </DialogHeader>
                                                                                                                <div className="flex-1 overflow-auto">
                                                                                                                    <iframe
                                                                                                                        src={`/storage/${attachment.file_path}`}
                                                                                                                        className="w-full h-full"
                                                                                                                        title={attachment.file_name}
                                                                                                                    />
                                                                                                                </div>
                                                                                                            </DialogContent>
                                                                                                        </Dialog>
                                                                                                        <a
                                                                                                            href={`/storage/${attachment.file_path}`}
                                                                                                            download={attachment.file_name}
                                                                                                            className="inline-flex items-center text-sm font-medium text-amber-600 hover:text-amber-800"
                                                                                                        >
                                                                                                            <Download className="h-4 w-4 mr-1" />
                                                                                                            {t('jobApplication.download')}
                                                                                                        </a>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        ))}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* Images */}
                                                                        {application.attachments.filter(a => a.file_type.includes('image')).length > 0 && (
                                                                            <div>
                                                                                <h5 className="text-xs font-medium text-gray-500 mb-2">Images</h5>
                                                                                <div className="grid grid-cols-2 gap-2">
                                                                                    {application.attachments
                                                                                        .filter(a => a.file_type.includes('image'))
                                                                                        .map((attachment) => (
                                                                                            <div key={attachment.id} className="bg-gray-50 p-3 rounded-md">
                                                                                                <div className="flex flex-col">
                                                                                                    <div className="font-medium text-sm mb-1 truncate">{attachment.file_name}</div>
                                                                                                    <img
                                                                                                        src={`/storage/${attachment.file_path}`}
                                                                                                        alt={attachment.file_name}
                                                                                                        className="w-full h-32 object-cover rounded-md mb-2"
                                                                                                    />
                                                                                                    <div className="flex justify-between">
                                                                                                        <Dialog>
                                                                                                            <DialogTrigger asChild>
                                                                                                                <Button variant="outline" size="sm">
                                                                                                                    <Eye className="h-4 w-4 mr-1" />
                                                                                                                    {t('jobListing.previewAttachment')}
                                                                                                                </Button>
                                                                                                            </DialogTrigger>
                                                                                                            <DialogContent className="max-w-4xl h-[80vh]">
                                                                                                                <DialogHeader>
                                                                                                                    <DialogTitle>{attachment.file_name}</DialogTitle>
                                                                                                                </DialogHeader>
                                                                                                                <div className="flex-1 overflow-auto">
                                                                                                                    <img
                                                                                                                        src={`/storage/${attachment.file_path}`}
                                                                                                                        alt={attachment.file_name}
                                                                                                                        className="max-w-full max-h-full object-contain"
                                                                                                                    />
                                                                                                                </div>
                                                                                                            </DialogContent>
                                                                                                        </Dialog>
                                                                                                        <a
                                                                                                            href={`/storage/${attachment.file_path}`}
                                                                                                            download={attachment.file_name}
                                                                                                            className="inline-flex items-center text-sm font-medium text-amber-600 hover:text-amber-800"
                                                                                                        >
                                                                                                            <Download className="h-4 w-4 mr-1" />
                                                                                                            {t('jobApplication.download')}
                                                                                                        </a>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        ))}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* Autres types de fichiers */}
                                                                        {application.attachments.filter(a => !a.file_type.includes('pdf') && !a.file_type.includes('doc') && !a.file_type.includes('txt') && !a.file_type.includes('rtf') && !a.file_type.includes('image')).length > 0 && (
                                                                            <div>
                                                                                <h5 className="text-xs font-medium text-gray-500 mb-2">Autres fichiers</h5>
                                                                                <div className="space-y-2">
                                                                                    {application.attachments
                                                                                        .filter(a => !a.file_type.includes('pdf') && !a.file_type.includes('doc') && !a.file_type.includes('txt') && !a.file_type.includes('rtf') && !a.file_type.includes('image'))
                                                                                        .map((attachment) => (
                                                                                            <div key={attachment.id} className="bg-gray-50 p-3 rounded-md">
                                                                                                <div className="flex items-center justify-between">
                                                                                                    <div className="flex items-start">
                                                                                                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                                                                                        <div>
                                                                                                            <div className="font-medium">{attachment.file_name}</div>
                                                                                                            {attachment.description && (
                                                                                                                <div className="text-sm text-gray-500">{attachment.description}</div>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <a
                                                                                                        href={`/storage/${attachment.file_path}`}
                                                                                                        download={attachment.file_name}
                                                                                                        className="inline-flex items-center text-sm font-medium text-amber-600 hover:text-amber-800"
                                                                                                    >
                                                                                                        <Download className="h-4 w-4 mr-1" />
                                                                                                        {t('jobApplication.download')}
                                                                                                    </a>
                                                                                                </div>
                                                                                            </div>
                                                                                        ))}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <Separator className="my-4" />

                                                            {/* Actions */}
                                                            <div className="flex justify-between items-center">
                                                                <Link
                                                                    href={route('job-applications.show', application.id)}
                                                                    className="text-amber-600 hover:text-amber-800 text-sm font-medium"
                                                                >
                                                                    {t('jobApplication.viewFull')}
                                                                </Link>

                                                                <Select
                                                                    value={application.status}
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

                    {applications && applications.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-lg font-medium mb-4">{t('jobListing.show.applications')}</h3>
                            <div className="space-y-4">
                                {applications.map((application) => (
                                    <div key={application.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-medium">{application.applicant?.name}</div>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    {formatDate(application.created_at)}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {statusBadge(application.status)}

                                                <Link
                                                    href={route('job-applications.show', application.id)}
                                                    className="inline-flex items-center text-sm font-medium text-amber-600 hover:text-amber-800"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    {t('jobApplication.show.viewFullApplication')}
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-sm text-gray-700 line-clamp-2">
                                            {application.cover_letter.substring(0, 150)}
                                            {application.cover_letter.length > 150 && '...'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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