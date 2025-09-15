import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/Components/ui/use-toast';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
    ArrowLeft, MapPin, Clock, Building, DollarSign, Users,
    Wifi, Calendar, Star, Send, CheckCircle, AlertCircle,
    Eye, Share2, Bookmark, FileText, Target, Briefcase, Globe,
    Phone, Mail, ExternalLink, MessageSquare
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';

interface JobShowProps {
    auth?: { user: any };
    selectedCvModel?: {
        id: number;
        name: string;
    };
    job: {
        id: number;
        title: string;
        description: string;
        requirements: string;
        location: string;
        employment_type: string;
        experience_level: string;
        salary_min: number;
        salary_max: number;
        salary_currency: string;
        remote_work: boolean;
        industry: string;
        skills_required: string[];
        application_deadline: string;
        application_email: string;
        application_url: string;
        created_at: string;
        views_count: number;
        applications_count: number;
        posting_type: string; // 'standard' ou 'simple_ad'
        contact_info: any; // Pour les annonces simples
        contact_via_platform: boolean;
        additional_instructions: string;
        company: {
            id: number;
            name: string;
            logo_path: string;
            industry: string;
            description: string;
            website: string;
        };
    };
    hasApplied: boolean;
    similarJobs: Array<any>;
    canApply: boolean;
}

export default function JobShow({ auth, job, hasApplied = false, similarJobs = [], canApply = false, selectedCvModel }: JobShowProps) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [showApplicationDialog, setShowApplicationDialog] = useState(false);
    const [selectedCvModelLocal, setSelectedCvModelLocal] = useState<number | null>(selectedCvModel?.id || null);

    const { data, setData, post, processing } = useForm({
        cover_letter: '',
        cv_model_id: selectedCvModel?.id || null
    });

    const handleApply = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCvModel) {
            toast({
                title: t('jobPortal.show.cvRequired'),
                description: t('jobPortal.show.mustSelectCvModel'),
                variant: "destructive"
            });
            // Rediriger vers la page de gestion des CV
            window.location.href = route('userCvModels.index');
            return;
        }

        post(route('job-portal.apply', job.id), {
            data: { ...data, cv_model_id: selectedCvModel.id },
            onSuccess: () => {
                toast({
                    title: t('jobPortal.show.applicationSentTitle'),
                    description: t('jobPortal.show.applicationSentDescription'),
                });
                setShowApplicationDialog(false);
                window.location.reload();
            },
            onError: (errors) => {
                toast({
                    title: t('jobPortal.show.error'),
                    description: Object.values(errors)[0] as string,
                    variant: "destructive"
                });
            }
        });
    };

    const formatSalary = (min: number, max: number, currency: string) => {
        if (!min && !max) return t('jobPortal.show.salaryNegotiable');
        if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
        if (min) return `${t('jobPortal.show.from')} ${min.toLocaleString()} ${currency}`;
        return `${t('jobPortal.show.upTo')} ${max.toLocaleString()} ${currency}`;
    };

    const shareJob = () => {
        if (navigator.share) {
            navigator.share({
                title: job.title,
                text: t('jobPortal.show.shareText', { title: job.title, company: job.company.name }),
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast({
                title: t('jobPortal.show.linkCopied'),
                description: t('jobPortal.show.linkCopiedDescription')
            });
        }
    };

    const Layout = AuthenticatedLayout;

    // Guard clause for missing job data
    if (!job) {
        return (
            <Layout user={auth.user}>
                <Head
                    title={`${t('jobPortal.show.jobNotFound') || 'Offre non trouvée'} | JobLight`}
                />
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            {t('jobPortal.show.jobNotFoundMessage')}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {t('jobPortal.show.jobNotAvailable')}
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout user={auth.user}>
            <Head
                title={(job?.title && job?.company?.name) ? `${job.title} ${t('jobPortal.show.at') || 'chez'} ${job.company.name} | JobLight` : `JobLight - ${t('jobPortal.show.jobOffers') || 'Offres d\'emploi'}`}
            >
                {job?.title && job?.company?.name && job?.description && (
                    <meta name="description" content={`${job.title} - ${job.company.name}. ${job.description.substring(0, 160)}...`} />
                )}
                {job?.title && (
                    <meta name="keywords" content={`emploi, ${job.title}${job.company?.name ? `, ${job.company.name}` : ''}${job.location ? `, ${job.location}` : ''}${job.industry ? `, ${job.industry}` : ''}`} />
                )}

                {/* Open Graph */}
                {job?.title && job?.company?.name && (
                    <meta property="og:title" content={`${job.title} chez ${job.company.name}`} />
                )}
                {job?.description && (
                    <meta property="og:description" content={job.description.substring(0, 200)} />
                )}
                <meta property="og:type" content="website" />
            </Head>

            {/* Hero Section with Background */}
            <div className="relative min-h-[400px] mb-8">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/images/hero/business-meeting.png')`
                    }}
                />
                <div className="relative z-10 flex items-center justify-center min-h-[400px] text-white text-center px-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            {job.title}
                        </h1>
                        <p className="text-xl md:text-2xl mb-6">
                            {t('jobPortal.show.at')} {job.company.name}
                        </p>
                        <div className="flex items-center justify-center gap-4 text-lg">
                            {job.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    {job.location}
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                {new Date(job.created_at).toLocaleDateString('fr-FR')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    {/* Navigation */}
                    <div className="mb-6">
                        <Link href={route('job-portal.index')} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            {t('jobPortal.show.backToJobs')}
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Contenu principal */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Header de l'offre */}
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                                            {job.company.logo_path ? (
                                                <img src={job.company.logo_path} alt={job.company.name} className="w-12 h-12 object-contain" />
                                            ) : (
                                                <Building className="w-8 h-8 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="outline">
                                                    {job.employment_type}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {job.experience_level}
                                                </Badge>
                                                {job.remote_work && (
                                                    <Badge className="bg-green-100 text-green-800">
                                                        <Wifi className="w-3 h-3 mr-1" />
                                                        {t('jobPortal.show.remote')}
                                                    </Badge>
                                                )}
                                                {job.industry && (
                                                    <Badge variant="secondary">
                                                        {job.industry}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3">
                                        {canApply ? (
                                            hasApplied ? (
                                                <Button disabled className="bg-green-100 text-green-800">
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    {t('jobPortal.show.applicationSent')}
                                                </Button>
                                            ) : (
                                                <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
                                                    <Button
                                                        size="lg"
                                                        className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600"
                                                        onClick={() => {
                                                            if (!selectedCvModel) {
                                                                toast({
                                                                    title: t('jobPortal.show.cvRequired'),
                                                                    description: t('jobPortal.show.mustSelectCvModel'),
                                                                    variant: "destructive"
                                                                });
                                                                // Rediriger vers la page de gestion des CV
                                                                window.location.href = route('userCvModels.index');
                                                                return;
                                                            }
                                                            setShowApplicationDialog(true);
                                                        }}
                                                    >
                                                        <Send className="w-4 h-4 mr-2" />
                                                        {t('jobPortal.show.applyNow')}
                                                    </Button>
                                                    <DialogContent className="max-w-2xl">
                                                        <DialogHeader>
                                                            <DialogTitle>{t('jobPortal.show.applyTo')} {job.title}</DialogTitle>
                                                        </DialogHeader>
                                                        <form onSubmit={handleApply} className="space-y-4">
                                                            <div>
                                                                <Label htmlFor="cover_letter">{t('jobPortal.show.coverLetter')} *</Label>
                                                                <Textarea
                                                                    id="cover_letter"
                                                                    value={data.cover_letter}
                                                                    onChange={(e) => setData('cover_letter', e.target.value)}
                                                                    placeholder={t('jobPortal.show.coverLetterPlaceholder')}
                                                                    rows={6}
                                                                    required
                                                                />
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {data.cover_letter.length}/2000 {t('jobPortal.show.characters')} ({t('jobPortal.show.minimum')} 100)
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <Label>{t('jobPortal.show.cvModelToUse')} *</Label>
                                                                <div className="mt-2 p-4 border border-green-200 rounded-lg bg-green-50">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <FileText className="w-4 h-4 text-green-600" />
                                                                        <span className="text-sm font-medium text-green-800">
                                                                            {t('jobPortal.show.selectedCv')} : {selectedCvModel?.name || t('jobPortal.show.defaultModel')}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-green-700">
                                                                        {t('jobPortal.show.cvAutoAttached')}
                                                                    </p>
                                                                    <Link href={route('userCvModels.index')} className="text-xs text-green-600 hover:text-green-700 underline">
                                                                        {t('jobPortal.show.changeCvModel')} →
                                                                    </Link>
                                                                </div>
                                                            </div>

                                                            <div className="flex justify-end gap-3">
                                                                <Button type="button" variant="outline" onClick={() => setShowApplicationDialog(false)}>
                                                                    {t('jobPortal.show.cancel')}
                                                                </Button>
                                                                <Button
                                                                    type="submit"
                                                                    disabled={processing || data.cover_letter.length < 100}
                                                                    className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600"
                                                                >
                                                                    {processing ? t('jobPortal.show.sending') : t('jobPortal.show.sendApplication')}
                                                                </Button>
                                                            </div>
                                                        </form>
                                                    </DialogContent>
                                                </Dialog>
                                            )
                                        ) : (
                                            <Alert className="mb-4">
                                                <AlertCircle className="w-4 h-4" />
                                                <AlertDescription>
                                                    <Link href={route('login')} className="text-blue-600 hover:text-blue-700 font-medium">
                                                        {t('jobPortal.show.signIn')}
                                                    </Link> {t('jobPortal.show.toApplyToJob')}
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        <Button variant="outline" onClick={shareJob}>
                                            <Share2 className="w-4 h-4 mr-2" />
                                            {t('jobPortal.show.share')}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Description du poste */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('jobPortal.show.jobDescription')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
                                        {job.description.split('\n').map((paragraph, index) => (
                                            <p key={index} className="mb-4">{paragraph}</p>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Exigences */}
                            {job.requirements && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('jobPortal.show.jobRequirements')}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
                                            {job.requirements.split('\n').map((requirement, index) => (
                                                <p key={index} className="mb-2">{requirement}</p>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Compétences requises */}
                            {job.skills_required && Array.isArray(job.skills_required) && job.skills_required.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('jobPortal.show.requiredSkills')}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {job.skills_required.map(skill => (
                                                <Badge key={skill} variant="outline" className="bg-blue-50 text-blue-700">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Informations clés */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">{t('jobPortal.show.keyInformation')}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <DollarSign className="w-5 h-5 text-green-600" />
                                        <div>
                                            <div className="font-medium text-gray-800 dark:text-gray-200">
                                                {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                                            </div>
                                            <div className="text-xs text-gray-500">{t('jobPortal.show.salary')}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Briefcase className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <div className="font-medium text-gray-800 dark:text-gray-200">
                                                {job.employment_type}
                                            </div>
                                            <div className="text-xs text-gray-500">{t('jobPortal.show.contractType')}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Target className="w-5 h-5 text-purple-600" />
                                        <div>
                                            <div className="font-medium text-gray-800 dark:text-gray-200">
                                                {job.experience_level}
                                            </div>
                                            <div className="text-xs text-gray-500">{t('jobPortal.show.requiredLevel')}</div>
                                        </div>
                                    </div>

                                    {job.location && (
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-red-600" />
                                            <div>
                                                <div className="font-medium text-gray-800 dark:text-gray-200">
                                                    {job.location}
                                                </div>
                                                <div className="text-xs text-gray-500">{t('jobPortal.show.location')}</div>
                                            </div>
                                        </div>
                                    )}

                                    {job.remote_work && (
                                        <div className="flex items-center gap-3">
                                            <Wifi className="w-5 h-5 text-green-600" />
                                            <div>
                                                <div className="font-medium text-gray-800 dark:text-gray-200">
                                                    {t('jobPortal.show.remoteWorkPossible')}
                                                </div>
                                                <div className="text-xs text-gray-500">{t('jobPortal.show.modality')}</div>
                                            </div>
                                        </div>
                                    )}

                                    {job.application_deadline && (
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-5 h-5 text-orange-600" />
                                            <div>
                                                <div className="font-medium text-gray-800 dark:text-gray-200">
                                                    {new Date(job.application_deadline).toLocaleDateString('fr-FR')}
                                                </div>
                                                <div className="text-xs text-gray-500">{t('jobPortal.show.deadline')}</div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Informations entreprise */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">{t('jobPortal.show.aboutCompany')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center mb-4">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                                            {job.company.logo_path ? (
                                                <img src={job.company.logo_path} alt={job.company.name} className="w-12 h-12 object-contain" />
                                            ) : (
                                                <Building className="w-8 h-8 text-gray-400" />
                                            )}
                                        </div>
                                        <h3 className="font-bold text-gray-800 dark:text-gray-200">
                                            {job.company.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {job.company.industry}
                                        </p>
                                    </div>

                                    {job.company.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            {job.company.description}
                                        </p>
                                    )}

                                    {job.company.website && (
                                        <a
                                            href={job.company.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                                        >
                                            <Globe className="w-4 h-4" />
                                            {t('jobPortal.show.companyWebsite')}
                                        </a>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Statistiques */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">{t('jobPortal.show.statistics')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <div className="text-2xl font-bold text-blue-600">{job.views_count}</div>
                                            <div className="text-xs text-gray-500">{t('jobPortal.show.views')}</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-purple-600">{job.applications_count}</div>
                                            <div className="text-xs text-gray-500">{t('jobPortal.show.applications')}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Offres similaires */}
                    {similarJobs.length > 0 && (
                        <div className="mt-12">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                                {t('jobPortal.show.similarJobs')}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {similarJobs.map(similarJob => (
                                    <Card key={similarJob.id} className="hover:shadow-lg transition-shadow">
                                        <CardContent className="p-4">
                                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2">
                                                <Link href={route('job-portal.show', similarJob.id)} className="hover:text-blue-600 transition-colors">
                                                    {similarJob.title}
                                                </Link>
                                            </h3>
                                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                {similarJob.company.name}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {similarJob.employment_type}
                                                </Badge>
                                                {similarJob.remote_work && (
                                                    <Badge className="bg-green-100 text-green-800 text-xs">
                                                        {t('jobPortal.show.remote')}
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}