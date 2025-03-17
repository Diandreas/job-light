import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import JobPortalNav from '@/Components/JobPortalNav';
import { JobApplication, JobListing, User } from '@/types';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/Components/ui/card';
import {
    AlertCircle,
    Briefcase,
    Calendar,
    ChevronLeft,
    Clock,
    Download,
    ExternalLink,
    FileText,
    Mail,
    Phone,
    User as UserIcon,
    Github,
    Linkedin,
    GraduationCap,
    Award,
    Code,
    Eye
} from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/Components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/Components/ui/tooltip';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/Components/ui/dialog';

interface Props {
    application: JobApplication & {
        applicant: User & {
            competences?: { id: number; name: string; pivot?: { level?: string } }[];
            experiences?: { id: number; title: string; company: string; start_date: string; end_date?: string; description: string }[];
            educations?: { id: number; degree: string; institution: string; start_date: string; end_date?: string; description: string }[];
            summary?: { id: number; content: string };
            hobbies?: { id: number; name: string }[];
        };
    };
    jobListing: JobListing;
    auth: {
        user: User;
    };
}

export default function Show({ auth, application, jobListing }: Props) {
    const { t, i18n } = useTranslation();
    const [status, setStatus] = useState<'pending' | 'shortlisted' | 'rejected' | 'hired'>(application.status);

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

    const handleStatusChange = (newStatus: 'pending' | 'shortlisted' | 'rejected' | 'hired') => {
        setStatus(newStatus);
        router.patch(route('job-applications.update-status', application.id), {
            status: newStatus
        }, {
            preserveState: true
        });
    };

    const getStatusBadge = (status: string) => {
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
                        {t('jobApplication.show.title')}
                    </h2>
                    <JobPortalNav />
                </div>
            }
        >
            <Head title={t('jobApplication.show.title')} />

            <div className="py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link
                            href={route('job-listings.show', jobListing.id)}
                            className="flex items-center text-sm text-gray-600 hover:text-amber-600 transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            {t('jobApplication.backToJob')}
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Colonne de gauche - Informations sur la candidature */}
                        <div className="lg:col-span-2">
                            <Card className="mb-6">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl">
                                                {t('jobApplication.show.applicationDetails')}
                                            </CardTitle>
                                            <CardDescription>
                                                {t('jobApplication.appliedOn')}: {formatDate(application.created_at)}
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center">
                                            {getStatusBadge(status)}
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium mb-2">{t('jobApplication.coverLetter')}</h3>
                                            <div className="bg-gray-50 p-4 rounded-md whitespace-pre-line">
                                                {application.cover_letter}
                                            </div>
                                        </div>

                                        {application.proposed_rate && (
                                            <div>
                                                <h3 className="text-lg font-medium mb-2">{t('jobApplication.proposedRate')}</h3>
                                                <div className="bg-gray-50 p-4 rounded-md">
                                                    <span className="text-xl font-semibold">
                                                        {application.proposed_rate} {getCurrencySymbol(jobListing.currency)}
                                                    </span>
                                                    {jobListing.budget_type === 'hourly' && (
                                                        <span className="text-gray-500 ml-1">/ {t('jobListing.hour')}</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Pièces jointes */}
                                        {application.attachments && application.attachments.length > 0 && (
                                            <div className="p-4 bg-white">
                                                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                                    <FileText className="h-4 w-4 mr-2 text-amber-600" />
                                                    {t('jobApplication.candidateInfo.attachments')}
                                                </h4>
                                                <div className="grid gap-3 pl-6">
                                                    {application.attachments.map(attachment => (
                                                        <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors">
                                                            <div className="flex items-center">
                                                                <div className="h-10 w-10 flex items-center justify-center bg-amber-100 text-amber-700 rounded-md mr-3">
                                                                    {attachment.file_type.includes('pdf') ? (
                                                                        <FileText className="h-5 w-5" />
                                                                    ) : attachment.file_type.includes('image') ? (
                                                                        <img
                                                                            src={`/storage/${attachment.file_path}`}
                                                                            alt=""
                                                                            className="h-10 w-10 object-cover rounded-md"
                                                                        />
                                                                    ) : (
                                                                        <FileText className="h-5 w-5" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-gray-900">{attachment.file_name}</div>
                                                                    {attachment.description && (
                                                                        <div className="text-sm text-gray-500">{attachment.description}</div>
                                                                    )}
                                                                    <div className="text-xs text-gray-500 mt-1">
                                                                        {Math.round(attachment.file_size / 1024)} KB • {attachment.file_type.split('/')[1].toUpperCase()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex space-x-2">
                                                                {attachment.file_type.includes('pdf') ? (
                                                                    <Dialog>
                                                                        <DialogTrigger asChild>
                                                                            <Button variant="outline" size="sm" className="bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700">
                                                                                <Eye className="h-4 w-4 mr-1" />
                                                                                {t('jobApplication.preview')}
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
                                                                ) : attachment.file_type.includes('image') ? (
                                                                    <Dialog>
                                                                        <DialogTrigger asChild>
                                                                            <Button variant="outline" size="sm" className="bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700">
                                                                                <Eye className="h-4 w-4 mr-1" />
                                                                                {t('jobApplication.view')}
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
                                                                ) : null}
                                                                <Button variant="outline" size="sm">
                                                                    <a
                                                                        href={`/storage/${attachment.file_path}`}
                                                                        download={attachment.file_name}
                                                                        className="flex items-center"
                                                                    >
                                                                        <Download className="h-4 w-4 mr-1" />
                                                                        {t('jobApplication.download')}
                                                                    </a>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>

                                <CardFooter className="border-t pt-6">
                                    <div className="w-full flex justify-between items-center">
                                        <div className="text-sm text-gray-500">
                                            {application.viewed_at && (
                                                <div className="flex items-center">
                                                    <AlertCircle className="h-4 w-4 mr-1" />
                                                    {t('jobApplication.viewedOn', { date: formatDate(application.viewed_at) })}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2">
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
                                                <SelectTrigger className="w-[180px]">
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
                                </CardFooter>
                            </Card>
                        </div>

                        {/* Colonne de droite - Informations sur le candidat */}
                        <div>
                            <Card className="mb-6">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-xl">{t('jobApplication.candidateInfo.title')}</CardTitle>
                                </CardHeader>

                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center">
                                            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3">
                                                {application.applicant.photo ? (
                                                    <img
                                                        src={`/storage/${application.applicant.photo}`}
                                                        alt={application.applicant.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <UserIcon className="h-8 w-8 text-gray-500" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-lg">{application.applicant.name}</div>
                                                <div className="text-gray-500">{application.applicant.full_profession || t('jobApplication.candidateInfo.noProfession')}</div>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-3">
                                            <div className="flex items-center">
                                                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                                                <a href={`mailto:${application.applicant.email}`} className="text-amber-600 hover:text-amber-800">
                                                    {application.applicant.email}
                                                </a>
                                            </div>

                                            {application.applicant.phone_number && (
                                                <div className="flex items-center">
                                                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                                                    <a href={`tel:${application.applicant.phone_number}`} className="text-amber-600 hover:text-amber-800">
                                                        {application.applicant.phone_number}
                                                    </a>
                                                </div>
                                            )}

                                            {application.applicant.github && (
                                                <div className="flex items-center">
                                                    <Github className="h-4 w-4 mr-2 text-gray-500" />
                                                    <a href={application.applicant.github} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-800 flex items-center">
                                                        GitHub <ExternalLink className="h-3 w-3 ml-1" />
                                                    </a>
                                                </div>
                                            )}

                                            {application.applicant.linkedin && (
                                                <div className="flex items-center">
                                                    <Linkedin className="h-4 w-4 mr-2 text-gray-500" />
                                                    <a href={application.applicant.linkedin} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-800 flex items-center">
                                                        LinkedIn <ExternalLink className="h-3 w-3 ml-1" />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-0">
                                    <CardTitle className="text-xl">{t('jobApplication.candidateInfo.cvDetails')}</CardTitle>
                                </CardHeader>

                                <CardContent className="pt-4">
                                    <Tabs defaultValue="experience" className="w-full">
                                        <TabsList className="grid w-full grid-cols-3">
                                            <TabsTrigger value="experience">{t('jobApplication.candidateInfo.experience')}</TabsTrigger>
                                            <TabsTrigger value="skills">{t('jobApplication.candidateInfo.skills')}</TabsTrigger>
                                            <TabsTrigger value="hobbies">{t('jobApplication.candidateInfo.hobbies')}</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="experience" className="pt-4">
                                            {application.applicant.experiences && application.applicant.experiences.length > 0 ? (
                                                <div className="space-y-6">
                                                    {application.applicant.experiences.map(exp => (
                                                        <div key={exp.id} className="bg-white rounded-lg overflow-hidden border border-amber-200 shadow-sm">
                                                            <div className="p-4 bg-amber-50 border-b border-amber-200">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <h3 className="text-lg font-semibold text-gray-900">{exp.title}</h3>
                                                                        <div className="flex items-center mt-1 text-gray-600">
                                                                            <Briefcase className="h-4 w-4 mr-2" />
                                                                            <span className="font-medium">{exp.company}</span>
                                                                        </div>
                                                                        <div className="flex items-center mt-1 text-gray-500 text-sm">
                                                                            <Calendar className="h-4 w-4 mr-2" />
                                                                            <span>
                                                                                {formatDate(exp.start_date)} - {exp.end_date ? formatDate(exp.end_date) : t('jobApplication.candidateInfo.present')}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <Badge variant="outline" className={exp.end_date ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}>
                                                                        {exp.end_date ? t('jobApplication.candidateInfo.completed') : t('jobApplication.candidateInfo.current')}
                                                                    </Badge>
                                                                </div>
                                                            </div>

                                                            {exp.description && (
                                                                <div className="p-4 bg-white border-b border-gray-100">
                                                                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                                                        <FileText className="h-4 w-4 mr-2 text-amber-600" />
                                                                        {t('jobApplication.candidateInfo.description')}
                                                                    </h4>
                                                                    <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line pl-6">
                                                                        {exp.description}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Compétences du candidat mises en avant pour cette expérience */}
                                                            {application.applicant.competences && application.applicant.competences.length > 0 && (
                                                                <div className="p-4 bg-white border-b border-gray-100">
                                                                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                                                        <Code className="h-4 w-4 mr-2 text-amber-600" />
                                                                        {t('jobApplication.candidateInfo.relevantSkills')}
                                                                    </h4>
                                                                    <div className="flex flex-wrap gap-2 pl-6">
                                                                        {application.applicant.competences.map(skill => (
                                                                            <Badge key={skill.id} variant="secondary">
                                                                                {skill.name}
                                                                                {skill.pivot?.level && (
                                                                                    <span className="ml-1 text-xs text-gray-500">({skill.pivot.level})</span>
                                                                                )}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Pièces jointes */}
                                                            {application.attachments && application.attachments.length > 0 && (
                                                                <div className="p-4 bg-white">
                                                                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                                                        <FileText className="h-4 w-4 mr-2 text-amber-600" />
                                                                        {t('jobApplication.candidateInfo.attachments')}
                                                                    </h4>
                                                                    <div className="grid gap-3 pl-6">
                                                                        {application.attachments.map(attachment => (
                                                                            <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors">
                                                                                <div className="flex items-center">
                                                                                    <div className="h-10 w-10 flex items-center justify-center bg-amber-100 text-amber-700 rounded-md mr-3">
                                                                                        {attachment.file_type.includes('pdf') ? (
                                                                                            <FileText className="h-5 w-5" />
                                                                                        ) : attachment.file_type.includes('image') ? (
                                                                                            <img
                                                                                                src={`/storage/${attachment.file_path}`}
                                                                                                alt=""
                                                                                                className="h-10 w-10 object-cover rounded-md"
                                                                                            />
                                                                                        ) : (
                                                                                            <FileText className="h-5 w-5" />
                                                                                        )}
                                                                                    </div>
                                                                                    <div>
                                                                                        <div className="font-medium text-gray-900">{attachment.file_name}</div>
                                                                                        {attachment.description && (
                                                                                            <div className="text-sm text-gray-500">{attachment.description}</div>
                                                                                        )}
                                                                                        <div className="text-xs text-gray-500 mt-1">
                                                                                            {Math.round(attachment.file_size / 1024)} KB • {attachment.file_type.split('/')[1].toUpperCase()}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex space-x-2">
                                                                                    {attachment.file_type.includes('pdf') ? (
                                                                                        <Dialog>
                                                                                            <DialogTrigger asChild>
                                                                                                <Button variant="outline" size="sm" className="bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700">
                                                                                                    <Eye className="h-4 w-4 mr-1" />
                                                                                                    {t('jobApplication.preview')}
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
                                                                                    ) : attachment.file_type.includes('image') ? (
                                                                                        <Dialog>
                                                                                            <DialogTrigger asChild>
                                                                                                <Button variant="outline" size="sm" className="bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700">
                                                                                                    <Eye className="h-4 w-4 mr-1" />
                                                                                                    {t('jobApplication.view')}
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
                                                                                    ) : null}
                                                                                    <Button variant="outline" size="sm">
                                                                                        <a
                                                                                            href={`/storage/${attachment.file_path}`}
                                                                                            download={attachment.file_name}
                                                                                            className="flex items-center"
                                                                                        >
                                                                                            <Download className="h-4 w-4 mr-1" />
                                                                                        </a>
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                                                    <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                                    <div className="text-gray-500 font-medium">{t('jobApplication.candidateInfo.noExperience')}</div>
                                                </div>
                                            )}
                                        </TabsContent>

                                        <TabsContent value="skills" className="pt-4">
                                            {application.applicant.competences && application.applicant.competences.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {application.applicant.competences.map(competence => (
                                                        <TooltipProvider key={competence.id}>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Badge variant="secondary" className="px-3 py-1">
                                                                        <Code className="h-3.5 w-3.5 mr-1.5" />
                                                                        {competence.name}
                                                                    </Badge>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    {competence.pivot?.level || t('jobApplication.candidateInfo.noLevel')}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-gray-500 italic">
                                                    {t('jobApplication.candidateInfo.noSkills')}
                                                </div>
                                            )}
                                        </TabsContent>

                                        <TabsContent value="hobbies" className="pt-4">
                                            {application.applicant.hobbies && application.applicant.hobbies.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {application.applicant.hobbies.map(hobby => (
                                                        <Badge key={hobby.id} variant="outline" className="px-3 py-1 bg-gray-50">
                                                            {hobby.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-gray-500 italic p-4 bg-gray-50 rounded-md">
                                                    {t('jobApplication.candidateInfo.noHobbies')}
                                                </div>
                                            )}
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
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