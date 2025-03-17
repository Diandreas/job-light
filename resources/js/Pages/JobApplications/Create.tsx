import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { JobListing, User } from '@/types';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/Components/ui/card';
import {
    AlertCircle,
    ArrowUp,
    Briefcase,
    ChevronLeft,
    DollarSign,
    FileText,
    Tag,
    X
} from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
    Alert,
    AlertDescription,
} from '@/Components/ui/alert';
import { cn } from '@/lib/utils';
import JobPortalNav from '@/Components/JobPortalNav';

interface Props {
    jobListing: JobListing;
    tokensRequired: number;
    userTokens: number;
    auth: {
        user: User;
    };
}

export default function Create({ auth, jobListing, tokensRequired, userTokens }: Props) {
    const { t } = useTranslation();
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [fileDescriptions, setFileDescriptions] = useState<{ [key: string]: string }>({});

    const { data, setData, post, errors, processing } = useForm({
        cover_letter: '',
        proposed_rate: '',
        attachments: [] as File[],
        attachment_descriptions: {} as { [key: string]: string },
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setUploadedFiles(prev => [...prev, ...newFiles]);

            // Update form data with the new files
            setData('attachments', [...uploadedFiles, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        const newFiles = [...uploadedFiles];
        newFiles.splice(index, 1);
        setUploadedFiles(newFiles);

        // Update form data when removing files
        setData('attachments', newFiles);

        // Also remove the description if it exists
        if (fileDescriptions[index]) {
            const newDescriptions = { ...fileDescriptions };
            delete newDescriptions[index];
            setFileDescriptions(newDescriptions);
            setData('attachment_descriptions', newDescriptions);
        }
    };

    const updateFileDescription = (index: number, description: string) => {
        const newDescriptions = { ...fileDescriptions, [index]: description };
        setFileDescriptions(newDescriptions);

        // Update form data with the new descriptions
        setData('attachment_descriptions', newDescriptions);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Create FormData object for file uploads
        const formData = new FormData();
        formData.append('cover_letter', data.cover_letter);

        if (data.proposed_rate) {
            formData.append('proposed_rate', data.proposed_rate);
        }

        // Add files
        if (uploadedFiles.length > 0) {
            uploadedFiles.forEach((file, index) => {
                formData.append(`attachments[${index}]`, file);

                if (fileDescriptions[index]) {
                    formData.append(`attachment_descriptions[${index}]`, fileDescriptions[index]);
                }
            });
        }

        // Submit the form
        post(route('job-applications.store', jobListing.id), {
            data: formData,
            forceFormData: true,
        });
    };

    // Ensure user has enough tokens
    if (userTokens < tokensRequired) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title={t('jobApplication.create.title')} />

                <div className="py-4">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mb-6">
                            <Link
                                href={route('job-listings.show', jobListing.id)}
                                className="flex items-center text-sm text-gray-600 hover:text-amber-600 transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                {t('jobApplication.backToJob')}
                            </Link>
                        </div>

                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {t('jobApplication.notEnoughTokens', { required: tokensRequired, available: userTokens })}
                                <Link
                                    href={route('payment.index')}
                                    className="ml-2 underline font-medium"
                                >
                                    {t('jobListing.buyTokens')}
                                </Link>
                            </AlertDescription>
                        </Alert>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col gap-4">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        {t('jobApplication.create.title')}
                    </h2>
                    <JobPortalNav />
                </div>
            }
        >
            <Head title={t('jobApplication.create.title')} />

            <div className="py-4">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link
                            href={route('job-listings.show', jobListing.id)}
                            className="flex items-center text-sm text-gray-600 hover:text-amber-600 transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            {t('jobApplication.backToJob')}
                        </Link>
                    </div>

                    <Card className="mb-6">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xl">
                                {t('jobApplication.create.applyingFor')}
                            </CardTitle>
                            <div className="text-lg font-medium">{jobListing.title}</div>
                            <CardDescription className="flex items-center mt-1">
                                <Tag className="h-4 w-4 mr-1" />
                                {t('jobApplication.tokenCost', { count: tokensRequired })}
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('jobApplication.create.title')}</CardTitle>
                            <CardDescription>{t('jobApplication.create.description')}</CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="cover_letter" className={errors.cover_letter ? 'text-red-500' : ''}>
                                            {t('jobApplication.coverLetter')} <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea
                                            id="cover_letter"
                                            value={data.cover_letter}
                                            onChange={e => setData('cover_letter', e.target.value)}
                                            className={cn(
                                                errors.cover_letter ? 'border-red-500' : '',
                                                "min-h-[200px]"
                                            )}
                                            placeholder={t('jobApplication.coverLetterPlaceholder')}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            {t('jobApplication.coverLetterHelp')}
                                        </p>
                                        {errors.cover_letter && <p className="text-red-500 text-sm mt-1">{errors.cover_letter}</p>}
                                    </div>

                                    {jobListing.budget_min !== null || jobListing.budget_max !== null ? (
                                        <div>
                                            <Label htmlFor="proposed_rate">
                                                {jobListing.budget_type === 'hourly'
                                                    ? t('jobApplication.proposedHourlyRate')
                                                    : t('jobApplication.proposedFixedRate')}
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="proposed_rate"
                                                    type="number"
                                                    value={data.proposed_rate}
                                                    onChange={e => setData('proposed_rate', e.target.value)}
                                                    className="pl-6"
                                                    placeholder={t('jobApplication.proposedRatePlaceholder')}
                                                    min="0"
                                                    step="0.01"
                                                />
                                                <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                                            </div>
                                            {jobListing.budget_min !== null && jobListing.budget_max !== null && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {t('jobApplication.budgetRange')}: {jobListing.budget_min}€ - {jobListing.budget_max}€
                                                    {jobListing.budget_type === 'hourly' && ` / ${t('jobListing.hour')}`}
                                                </p>
                                            )}
                                            {errors.proposed_rate && <p className="text-red-500 text-sm mt-1">{errors.proposed_rate}</p>}
                                        </div>
                                    ) : null}

                                    <div>
                                        <Label>
                                            {t('jobApplication.attachments')}
                                        </Label>
                                        <div className="mt-2">
                                            <div className="flex items-center justify-center w-full">
                                                <label
                                                    htmlFor="file-upload"
                                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700"
                                                >
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <ArrowUp className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                                            <span className="font-semibold">{t('jobApplication.clickToUpload')}</span>
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            PDF, DOC, DOCX, PNG, JPG (MAX. 10MB)
                                                        </p>
                                                    </div>
                                                    <input
                                                        id="file-upload"
                                                        type="file"
                                                        multiple
                                                        className="hidden"
                                                        onChange={handleFileUpload}
                                                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        {uploadedFiles.length > 0 && (
                                            <div className="mt-4 space-y-3">
                                                <h3 className="text-sm font-medium">{t('jobApplication.uploadedFiles')}</h3>
                                                {uploadedFiles.map((file, index) => (
                                                    <div key={index} className="flex flex-col space-y-2 p-3 bg-gray-50 rounded-md">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center">
                                                                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                                                <span className="text-sm font-medium">{file.name}</span>
                                                                <span className="ml-2 text-xs text-gray-500">
                                                                    ({Math.round(file.size / 1024)} KB)
                                                                </span>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeFile(index)}
                                                                className="h-6 w-6 text-gray-500 hover:text-red-500"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                        <div>
                                                            <Input
                                                                value={fileDescriptions[index] || ''}
                                                                onChange={e => updateFileDescription(index, e.target.value)}
                                                                placeholder={t('jobApplication.fileDescription')}
                                                                className="text-sm h-8"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {errors.attachments && <p className="text-red-500 text-sm mt-1">{errors.attachments}</p>}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            {t('jobApplication.tokenConfirmation', { count: tokensRequired })}
                                        </AlertDescription>
                                    </Alert>

                                    <div className="flex justify-end space-x-2">
                                        <Link href={route('job-listings.show', jobListing.id)}>
                                            <Button type="button" variant="outline">
                                                {t('common.cancel')}
                                            </Button>
                                        </Link>
                                        <Button
                                            type="submit"
                                            disabled={processing || !data.cover_letter}
                                        >
                                            {t('jobApplication.submitApplication')}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 