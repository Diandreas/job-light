import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/Components/ui/use-toast';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Stepper } from '@/Components/ui/stepper';
import {
    User, FileText, Briefcase, Code, Star, Download,
    Eye, AlertCircle, CheckCircle, ArrowRight, ArrowLeft,
    Loader2, RefreshCw, Coins, Lock, LogIn, UserPlus, Globe, Award
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/Components/ui/dialog';
import axios from 'axios';

// Import authenticated components
import PersonalInformationEdit from '@/Pages/CvInfos/Partials/PersonnalInfosEdit';
import ProfessionSummaryManager from '@/Pages/CvInfos/Partials/ProfessionSummaryManager';
import ExperienceManager from '@/Pages/CvInfos/Partials/ExperienceManager';
import CompetenceManager from '@/Pages/CvInfos/Partials/CompetenceManager';
import LanguageManager from '@/Pages/CvInfos/Partials/LanguageManager';
import HobbyManager from '@/Pages/CvInfos/Partials/HobbyManager';

interface GuestCvIndexProps {
    availableCompetences: Array<{ id: number; name: string; name_en: string; description: string }>;
    availableHobbies: Array<{ id: number; name: string; name_en: string }>;
    availableProfessions: Array<{ id: number; name: string; name_en: string; description: string }>;
    availableLanguages: Array<{ id: number; name: string; name_en: string }>;
    experienceCategories: Array<{ id: number; name: string; name_en: string; ranking: number }>;
    availableCvModels: Array<{
        id: number;
        name: string;
        description: string;
        previewImagePath: string;
        price: number
    }>;
}

const STEPS = [
    { id: 'personal', label: 'guest_cv.steps.personal', icon: User },
    { id: 'summary', label: 'guest_cv.steps.summary', icon: FileText },
    { id: 'experience', label: 'guest_cv.steps.experience', icon: Briefcase },
    { id: 'skills', label: 'guest_cv.steps.skills', icon: Code },
    { id: 'models', label: 'guest_cv.steps.models', icon: Star },
    { id: 'preview', label: 'guest_cv.steps.preview', icon: Eye }
];

export default function GuestCvIndex({
    availableCompetences,
    availableHobbies,
    availableProfessions,
    availableLanguages,
    experienceCategories,
    availableCvModels
}: GuestCvIndexProps) {
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const { auth } = usePage<PageProps>().props;

    // State management
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
    const [showAuthDialog, setShowAuthDialog] = useState(false);
    const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [previewHtml, setPreviewHtml] = useState<string>('');

    // Guest CV data stored in localStorage
    const [guestData, setGuestData] = useState(() => {
        const saved = localStorage.getItem('guest_cv_data');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            personalInformation: {
                firstName: '',
                email: '',
                phone: '',
                address: '',
                linkedin: '',
                github: '',
                profession: ''
            },
            summaries: [],
            experiences: [],
            competences: [],
            languages: [],
            hobbies: [],
            primary_color: '#3498db'
        };
    });

    // Completed steps tracking
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

    // Auto-save to localStorage
    useEffect(() => {
        localStorage.setItem('guest_cv_data', JSON.stringify(guestData));
    }, [guestData]);

    // Calculate completion percentage
    const getCompletionPercentage = () => {
        let completed = 0;
        const total = 5; // Excluding preview step

        if (guestData.personalInformation.firstName && guestData.personalInformation.email) completed++;
        if (guestData.summaries && guestData.summaries.length > 0) completed++;
        if (guestData.experiences && guestData.experiences.length > 0) completed++;
        if ((guestData.competences && guestData.competences.length > 0) || (guestData.languages && guestData.languages.length > 0)) completed++;
        if (selectedModelId) completed++;

        return Math.round((completed / total) * 100);
    };

    // Handle step navigation
    const goToNextStep = () => {
        if (currentStep < STEPS.length - 1) {
            setCompletedSteps(prev => new Set([...prev, currentStep]));
            setCurrentStep(currentStep + 1);
        }
    };

    const goToPreviousStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const goToStep = (stepIndex: number) => {
        setCurrentStep(stepIndex);
    };

    // Generate preview
    const generatePreview = async () => {
        if (!selectedModelId) {
            toast({
                title: 'Modèle requis',
                description: 'Veuillez sélectionner un modèle de CV',
                variant: 'destructive'
            });
            setCurrentStep(5); // Go to model selection step
            return;
        }

        setIsGeneratingPreview(true);
        try {
            const response = await axios.post(route('guest-cv.preview'), {
                cvData: guestData,
                modelId: selectedModelId,
                locale: i18n.language
            });

            if (response.data.success) {
                setPreviewHtml(response.data.html);
                setCurrentStep(6); // Go to preview step

                toast({
                    title: 'Aperçu généré',
                    description: 'Votre CV est prêt à être prévisualisé',
                });
            } else {
                throw new Error(response.data.message || 'Erreur de génération');
            }
        } catch (error) {
            console.error('Preview generation error:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de générer l\'aperçu',
                variant: 'destructive'
            });
        } finally {
            setIsGeneratingPreview(false);
        }
    };

    // Regenerate preview when language changes
    useEffect(() => {
        if (currentStep === 6 && selectedModelId && previewHtml) {
            generatePreview();
        }
    }, [i18n.language]);

    // Handle download - show auth gate
    const handleDownload = () => {
        setShowAuthDialog(true);
    };

    // Render current step content
    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Personal Information
                return (
                    <div className="space-y-4">
                        <div className="text-center mb-6">
                            <User className="w-12 h-12 mx-auto mb-3 text-amber-500" />
                            <h3 className="text-xl font-bold mb-2">{t('guest_cv.personal.title')}</h3>
                            <p className="text-gray-600">{t('guest_cv.personal.subtitle')}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('guest_cv.personal.labels.name')}</label>
                                <input
                                    type="text"
                                    value={guestData.personalInformation.firstName || ''}
                                    onChange={(e) => setGuestData(prev => ({
                                        ...prev,
                                        personalInformation: { ...prev.personalInformation, firstName: e.target.value }
                                    }))}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder={t('guest_cv.personal.placeholders.name')}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('guest_cv.personal.labels.email')}</label>
                                <input
                                    type="email"
                                    value={guestData.personalInformation.email || ''}
                                    onChange={(e) => setGuestData(prev => ({
                                        ...prev,
                                        personalInformation: { ...prev.personalInformation, email: e.target.value }
                                    }))}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder={t('guest_cv.personal.placeholders.email')}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('guest_cv.personal.labels.phone')}</label>
                                <input
                                    type="tel"
                                    value={guestData.personalInformation.phone || ''}
                                    onChange={(e) => setGuestData(prev => ({
                                        ...prev,
                                        personalInformation: { ...prev.personalInformation, phone: e.target.value }
                                    }))}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder={t('guest_cv.personal.placeholders.phone')}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('guest_cv.personal.labels.address')}</label>
                                <input
                                    type="text"
                                    value={guestData.personalInformation.address || ''}
                                    onChange={(e) => setGuestData(prev => ({
                                        ...prev,
                                        personalInformation: { ...prev.personalInformation, address: e.target.value }
                                    }))}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder={t('guest_cv.personal.placeholders.address')}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('guest_cv.personal.labels.linkedin')}</label>
                                <input
                                    type="url"
                                    value={guestData.personalInformation.linkedin || ''}
                                    onChange={(e) => setGuestData(prev => ({
                                        ...prev,
                                        personalInformation: { ...prev.personalInformation, linkedin: e.target.value }
                                    }))}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder={t('guest_cv.personal.placeholders.linkedin')}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('guest_cv.personal.labels.github')}</label>
                                <input
                                    type="url"
                                    value={guestData.personalInformation.github || ''}
                                    onChange={(e) => setGuestData(prev => ({
                                        ...prev,
                                        personalInformation: { ...prev.personalInformation, github: e.target.value }
                                    }))}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder={t('guest_cv.personal.placeholders.github')}
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium">{t('guest_cv.personal.labels.profession')}</label>
                                <select
                                    value={guestData.personalInformation.profession || ''}
                                    onChange={(e) => setGuestData(prev => ({
                                        ...prev,
                                        personalInformation: { ...prev.personalInformation, profession: e.target.value }
                                    }))}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="">{t('guest_cv.personal.placeholders.profession')}</option>
                                    {availableProfessions.map(prof => (
                                        <option key={prof.id} value={prof.name}>
                                            {i18n.language === 'en' ? prof.name_en : prof.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                );

            case 1: // Professional Summary
                return (
                    <div className="space-y-4">
                        <div className="text-center mb-6">
                            <FileText className="w-12 h-12 mx-auto mb-3 text-amber-500" />
                            <h3 className="text-xl font-bold mb-2">{t('guest_cv.summary.title')}</h3>
                            <p className="text-gray-600">{t('guest_cv.summary.subtitle')}</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('guest_cv.summary.label')}</label>
                            <textarea
                                value={guestData.summaries?.[0]?.content || ''}
                                onChange={(e) => setGuestData(prev => ({
                                    ...prev,
                                    summaries: [{ content: e.target.value, content_en: e.target.value }]
                                }))}
                                className="w-full px-3 py-2 border rounded-lg min-h-[150px]"
                                placeholder={t('guest_cv.summary.placeholder')}
                            />
                            <p className="text-xs text-gray-500">{t('guest_cv.summary.hint')}</p>
                        </div>
                    </div>
                );

            case 2: // Experiences
                return (
                    <div className="space-y-4">
                        <div className="text-center mb-6">
                            <Briefcase className="w-12 h-12 mx-auto mb-3 text-amber-500" />
                            <h3 className="text-xl font-bold mb-2">{t('guest_cv.experience.title')}</h3>
                            <p className="text-gray-600">{t('guest_cv.experience.subtitle')}</p>
                        </div>

                        {guestData.experiences?.map((exp: any, index: number) => (
                            <Card key={index} className="p-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-semibold">{t('guest_cv.experience.item_title', { index: index + 1 })}</h4>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const newExperiences = guestData.experiences.filter((_: any, i: number) => i !== index);
                                                setGuestData(prev => ({ ...prev, experiences: newExperiences }));
                                            }}
                                        >
                                            {t('guest_cv.experience.delete')}
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-sm font-medium">{t('guest_cv.experience.labels.job_title')}</label>
                                            <input
                                                type="text"
                                                value={exp.title || ''}
                                                onChange={(e) => {
                                                    const newExperiences = [...guestData.experiences];
                                                    newExperiences[index] = { ...exp, title: e.target.value };
                                                    setGuestData(prev => ({ ...prev, experiences: newExperiences }));
                                                }}
                                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                                placeholder={t('guest_cv.experience.placeholders.job_title')}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium">{t('guest_cv.experience.labels.company')}</label>
                                            <input
                                                type="text"
                                                value={exp.company || ''}
                                                onChange={(e) => {
                                                    const newExperiences = [...guestData.experiences];
                                                    newExperiences[index] = { ...exp, company: e.target.value };
                                                    setGuestData(prev => ({ ...prev, experiences: newExperiences }));
                                                }}
                                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                                placeholder={t('guest_cv.experience.placeholders.company')}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium">{t('guest_cv.experience.labels.start_date')}</label>
                                            <input
                                                type="text"
                                                value={exp.start_date || ''}
                                                onChange={(e) => {
                                                    const newExperiences = [...guestData.experiences];
                                                    newExperiences[index] = { ...exp, start_date: e.target.value };
                                                    setGuestData(prev => ({ ...prev, experiences: newExperiences }));
                                                }}
                                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                                placeholder={t('guest_cv.experience.placeholders.start_date')}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium">{t('guest_cv.experience.labels.end_date')}</label>
                                            <input
                                                type="text"
                                                value={exp.end_date || ''}
                                                onChange={(e) => {
                                                    const newExperiences = [...guestData.experiences];
                                                    newExperiences[index] = { ...exp, end_date: e.target.value };
                                                    setGuestData(prev => ({ ...prev, experiences: newExperiences }));
                                                }}
                                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                                placeholder={t('guest_cv.experience.placeholders.end_date')}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">{t('guest_cv.experience.labels.description')}</label>
                                        <textarea
                                            value={exp.description || ''}
                                            onChange={(e) => {
                                                const newExperiences = [...guestData.experiences];
                                                newExperiences[index] = { ...exp, description: e.target.value };
                                                setGuestData(prev => ({ ...prev, experiences: newExperiences }));
                                            }}
                                            className="w-full px-3 py-2 border rounded-lg text-sm min-h-[80px]"
                                            placeholder={t('guest_cv.experience.placeholders.description')}
                                        />
                                    </div>
                                </div>
                            </Card>
                        ))}

                        <Button
                            onClick={() => {
                                setGuestData(prev => ({
                                    ...prev,
                                    experiences: [
                                        ...(prev.experiences || []),
                                        { title: '', company: '', start_date: '', end_date: '', description: '' }
                                    ]
                                }));
                            }}
                            variant="outline"
                            className="w-full"
                        >
                            {t('guest_cv.experience.add')}
                        </Button>
                    </div>
                );

            case 3: // Skills & Languages (combined)
                return (
                    <div className="space-y-6">
                        <CompetenceManager
                            initialUserCompetences={guestData.competences || []}
                            auth={auth}
                            availableCompetences={availableCompetences}
                            onUpdate={(competences) => {
                                setGuestData(prev => ({ ...prev, competences }));
                            }}
                        />
                        <LanguageManager
                            initialLanguages={guestData.languages || []}
                            auth={auth}
                            availableLanguages={availableLanguages}
                            onUpdate={(languages) => {
                                setGuestData(prev => ({ ...prev, languages }));
                            }}
                        />
                        <HobbyManager
                            initialUserHobbies={guestData.hobbies || []}
                            auth={auth}
                            availableHobbies={availableHobbies}
                            onUpdate={(hobbies) => {
                                setGuestData(prev => ({ ...prev, hobbies }));
                            }}
                        />
                    </div>
                );

            case 4: // Model Selection
                return (
                    <div className="space-y-4">
                        <div className="text-center mb-6">
                            <Star className="w-12 h-12 mx-auto mb-3 text-amber-500" />
                            <h3 className="text-xl font-bold mb-2">{t('guest_cv.models.title')}</h3>
                            <p className="text-gray-600">{t('guest_cv.models.subtitle')}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {availableCvModels.map((model) => (
                                <motion.div
                                    key={model.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`border rounded-xl overflow-hidden cursor-pointer transition-all ${selectedModelId === model.id
                                        ? 'border-amber-500 bg-amber-50 shadow-lg'
                                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                        }`}
                                    onClick={() => setSelectedModelId(model.id)}
                                >
                                    <div className="aspect-[3/4] relative overflow-hidden bg-gray-50">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent z-10" />

                                        <img
                                            src={`/storage/${model.previewImagePath}`}
                                            alt={model.name}
                                            className="w-full h-full object-cover"
                                        />

                                        {selectedModelId === model.id && (
                                            <div className="absolute top-3 right-3 z-20">
                                                <Badge className="bg-gradient-to-r from-amber-500 to-purple-500 text-white">
                                                    {t('guest_cv.models.selected')}
                                                </Badge>
                                            </div>
                                        )}

                                        <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
                                            <h3 className="font-bold text-white">{model.name}</h3>
                                            {model.price > 0 ? (
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Coins className="w-3.5 h-3.5 text-amber-300" />
                                                    <p className="text-sm text-amber-200">{model.price}</p>
                                                </div>
                                            ) : (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mt-1">
                                                    {t('guest_cv.models.free')}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-3">
                                        <p className="text-sm text-gray-600 line-clamp-2">{model.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {!selectedModelId && (
                            <Alert className="mt-4">
                                <AlertCircle className="w-4 h-4" />
                                <AlertDescription>
                                    {t('guest_cv.models.alert')}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                );

            case 5: // Preview & Download
                return (
                    <div className="space-y-4">
                        <div className="text-center">
                            <Eye className="w-16 h-16 mx-auto mb-4 text-amber-500" />
                            <h3 className="text-xl font-bold mb-2">{t('guest_cv.preview.title')}</h3>
                            <p className="text-gray-600 mb-6">
                                {t('guest_cv.preview.subtitle')}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mb-6">
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                                    <div className="font-medium text-green-800">{t('guest_cv.preview.progress')}</div>
                                    <div className="text-green-600">{getCompletionPercentage()}%</div>
                                </div>

                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <Star className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                                    <div className="font-medium text-blue-800">{t('guest_cv.preview.model')}</div>
                                    <div className="text-blue-600 text-sm">
                                        {selectedModelId
                                            ? availableCvModels.find(m => m.id === selectedModelId)?.name
                                            : t('guest_cv.preview.none')}
                                    </div>
                                </div>
                            </div>

                            {!previewHtml && selectedModelId && (
                                <Button
                                    onClick={generatePreview}
                                    disabled={isGeneratingPreview}
                                    className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white"
                                >
                                    {isGeneratingPreview ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            {t('guest_cv.preview.generating')}
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="w-4 h-4 mr-2" />
                                            {t('guest_cv.preview.generate_button')}
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>

                        {selectedModelId && previewHtml ? (
                            <Card className="overflow-hidden">
                                <CardContent className="p-0">
                                    <div
                                        className="h-[600px] overflow-auto bg-white"
                                        style={{ zoom: 0.5 }}
                                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                                    />
                                </CardContent>
                            </Card>
                        ) : !selectedModelId ? (
                            <Alert>
                                <AlertCircle className="w-4 h-4" />
                                <AlertDescription>
                                    {t('guest_cv.models.alert')}
                                </AlertDescription>
                            </Alert>
                        ) : null}
                    </div>
                );

            default:
                return null;
        }
    };

    const completionPercentage = getCompletionPercentage();
    const StepIcon = STEPS[currentStep].icon;

    return (
        <GuestLayout>
            <Head>
                <title>Créer mon CV gratuitement - Job Light</title>
                <meta name="description" content="Créez votre CV professionnel gratuitement. Prévisualisez et téléchargez-le en PDF." />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-purple-50/20">
                {/* Header with progress */}
                <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-purple-600 rounded-lg flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-purple-600 bg-clip-text text-transparent">
                                            {t('guest_cv.header.title')}
                                        </h1>
                                        <p className="text-xs text-gray-500">{t('guest_cv.header.subtitle')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="flex items-center gap-2">
                                    <div className="text-sm font-medium text-gray-700">Progression</div>
                                    <div className="text-sm font-bold text-amber-600">{completionPercentage}%</div>
                                </div>
                                <Progress value={completionPercentage} className="flex-1 sm:w-40 h-2" />
                            </div>
                        </div>

                        {/* Stepper */}
                        <Stepper
                            steps={STEPS.map(step => ({ ...step, label: t(step.label) }))}
                            currentStep={currentStep}
                            completedSteps={completedSteps}
                            onStepClick={goToStep}
                        />
                    </div>
                </div>

                {/* Main content */}
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main form area */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <StepIcon className="w-5 h-5 text-amber-600" />
                                        {t(STEPS[currentStep].label)}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentStep}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {renderStepContent()}
                                        </motion.div>
                                    </AnimatePresence>

                                    {/* Navigation buttons */}
                                    <div className="flex justify-between mt-6 pt-4 border-t gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={goToPreviousStep}
                                            disabled={currentStep === 0}
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            {t('common.previous')}
                                        </Button>

                                        {currentStep === STEPS.length - 1 ? (
                                            <Button
                                                onClick={handleDownload}
                                                disabled={!selectedModelId}
                                                className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white"
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                {t('cv_preview.export.download')}
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={goToNextStep}
                                                className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white"
                                            >
                                                {t('common.next')}
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar info */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-4">
                                {/* Info card */}
                                <Alert className="border-green-200 bg-green-50">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <AlertDescription>
                                        <strong>{t('guest_cv.sidebar.free_guarantee')}</strong>
                                    </AlertDescription>
                                </Alert>

                                {/* Benefits */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">{t('guest_cv.sidebar.why_choose')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-start gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm">{t('guest_cv.sidebar.free_models')}</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm">{t('guest_cv.sidebar.no_registration')}</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm">{t('guest_cv.sidebar.real_time')}</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm">{t('guest_cv.sidebar.pdf_download')}</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Register prompt */}
                                <Alert className="border-amber-200 bg-amber-50">
                                    <AlertCircle className="w-4 h-4 text-amber-600" />
                                    <AlertDescription>
                                        <strong>{t('guest_cv.sidebar.create_account')}</strong> {t('guest_cv.sidebar.save_data')}
                                        <Link href={route('register')} className="block mt-2">
                                            <Button size="sm" variant="outline" className="w-full">
                                                <UserPlus className="w-4 h-4 mr-2" />
                                                {t('guest_cv.sidebar.register_button')}
                                            </Button>
                                        </Link>
                                    </AlertDescription>
                                </Alert>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Authentication Dialog */}
            <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Lock className="w-5 h-5 text-amber-500" />
                            Télécharger votre CV
                        </DialogTitle>
                        <DialogDescription>
                            Pour télécharger votre CV, veuillez vous connecter ou créer un compte gratuit.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-4 h-4 text-amber-600" />
                                <span className="font-medium text-amber-800">Vos données sont sauvegardées</span>
                            </div>
                            <p className="text-sm text-amber-700">
                                Vos informations sont stockées localement et seront automatiquement transférées après connexion.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Link href={route('login')}>
                                <Button variant="outline" className="w-full">
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Se connecter
                                </Button>
                            </Link>

                            <Link href={route('register')}>
                                <Button className="w-full bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white">
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    S'inscrire
                                </Button>
                            </Link>
                        </div>

                        <div className="text-center text-sm text-gray-500">
                            <p>ou</p>
                        </div>

                        <Button variant="outline" className="w-full" onClick={() => {
                            // TODO: Implement Google login
                            toast({
                                title: 'Bientôt disponible',
                                description: 'La connexion Google sera disponible prochainement'
                            });
                        }}>
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continuer avec Google
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </GuestLayout>
    );
}
