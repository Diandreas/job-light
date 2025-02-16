import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from "@/Components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/Components/ui/select";
import { useToast } from '@/Components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/Components/ui/sheet";
import {
    Briefcase,
    GraduationCap,
    FileText,
    Building2,
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    BookOpen,
    Users,
    Award,
    PencilRuler
} from 'lucide-react';
import { Badge } from "@/Components/ui/badge";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { motion, AnimatePresence } from 'framer-motion';
import axios from "axios";

// Interfaces
interface Reference {
    id?: number;
    name: string;
    function: string;
    email: string;
    telephone: string;
}

interface Experience {
    id: number;
    name: string;
    description: string;
    date_start: string;
    date_end: string | null;
    output: string;
    experience_categories_id: string;
    comment: string;
    InstitutionName: string;
    attachment_path?: string;
    attachment_size?: number;
    references?: Reference[];
}

interface Category {
    id: number;
    name: string;
}

interface AttachmentSummary {
    total_size: number;
    max_size: number;
    files_count: number;
}

interface Props {
    auth: { user: { id: number } };
    experiences: Experience[];
    categories: Category[];
    onUpdate: (experiences: Experience[]) => void;
}

// Utility Functions
const formatBytes = (bytes: number | undefined): string => {
    if (!bytes || isNaN(bytes) || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const posBytes = Math.abs(bytes);
    const i = Math.floor(Math.log(posBytes) / Math.log(k));
    const sizeIndex = Math.min(i, sizes.length - 1);
    return `${(posBytes / Math.pow(k, sizeIndex)).toFixed(2)} ${sizes[sizeIndex]}`;
};

// Experience Data Types
const experienceData = {
    academic: {
        names: [
            "Formation en Développement Web",
            "Master en Informatique",
            "Certification en Gestion de Projet",
            "Licence en Technologies Numériques",
            "Formation en Cybersécurité",
            "Programme Data Science",
            "Certification Cloud Computing",
            "Formation en Intelligence Artificielle"
        ],
        institutions: [
            "École Supérieure du Digital",
            "Institut des Technologies Avancées",
            "Centre de Formation Tech",
            "Université des Sciences Appliquées",
            "Académie du Numérique",
            "Institut de Formation Professionnelle",
            "École d'Ingénierie Digitale"
        ],
        descriptions: [
            "Programme intensif combinant théorie et pratique. Réalisation de projets concrets en utilisant les technologies les plus récentes. Développement de compétences techniques et méthodologiques avancées.",
            "Formation approfondie axée sur les technologies émergentes. Participation à des projets innovants et acquisition d'une expertise technique pointue. Travail en équipe sur des cas réels.",
            "Apprentissage des meilleures pratiques et méthodologies actuelles. Développement de compétences techniques et soft skills essentielles. Réalisation de projets pratiques avec des technologies modernes.",
            "Programme complet couvrant les aspects théoriques et pratiques du domaine. Acquisition d'une expertise technique approfondie et développement de compétences transversales."
        ]
    },
    internship: {
        names: [/* ... votre liste existante ... */],
        companies: [/* ... votre liste existante ... */],
        descriptions: [/* ... votre liste existante ... */],
        achievements: [/* ... votre liste existante ... */]
    },
    volunteer: {
        names: [/* ... votre liste existante ... */],
        institutions: [/* ... votre liste existante ... */],
        descriptions: [/* ... votre liste existante ... */],
        outputs: [/* ... votre liste existante ... */]
    }
};

// Utility Functions for Date Generation
const generateDates = (type: 'academic' | 'internship' | 'volunteer') => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    switch(type) {
        case 'academic':
            return {
                startDate: `${currentYear-1}-09-01`,
                endDate: `${currentYear}-06-30`
            };
        case 'internship':
            return {
                startDate: `${currentYear}-01-01`,
                endDate: `${currentYear}-06-30`
            };
        case 'volunteer':
            return {
                startDate: `${currentYear-1}-01-01`,
                endDate: `${currentYear}-12-31`
            };
    }
};

const getRandomItem = <T,>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)];
};
const ExperienceManager: React.FC<Props> = ({ auth, experiences: initialExperiences, categories, onUpdate }) => {
    const { t } = useTranslation();

    // States
    const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
    const [filteredExperiences, setFilteredExperiences] = useState<Experience[]>(initialExperiences);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [currentTab, setCurrentTab] = useState('experiences');
    const [attachmentSummary, setAttachmentSummary] = useState<AttachmentSummary>({
        total_size: 0,
        max_size: 104857600, // 100MB default
        files_count: 0
    });

    const { toast } = useToast();

    const { data, setData, reset, errors } = useForm({
        id: '',
        name: '',
        description: '',
        date_start: '',
        date_end: '',
        output: '',
        experience_categories_id: '',
        comment: '',
        InstitutionName: '',
        attachment: null as File | null,
        references: [] as Reference[]
    });

    // Attachment stats calculation
    const calculateAttachmentStats = useCallback(() => {
        const totalSize = experiences.reduce((acc, exp) => {
            const size = exp.attachment_size ? Number(exp.attachment_size) : 0;
            return acc + (isNaN(size) ? 0 : size);
        }, 0);

        const filesCount = experiences.filter(exp =>
            exp.attachment_path && exp.attachment_size && Number(exp.attachment_size) > 0
        ).length;

        setAttachmentSummary(prev => ({
            ...prev,
            total_size: totalSize,
            files_count: filesCount
        }));
    }, [experiences]);

    // Effects
    useEffect(() => {
        setExperiences(initialExperiences);
    }, [initialExperiences]);

    useEffect(() => {
        calculateAttachmentStats();
    }, [experiences, calculateAttachmentStats]);

    useEffect(() => {
        let filtered = experiences;
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(exp =>
                exp.name?.toLowerCase().includes(searchLower) ||
                exp.description?.toLowerCase().includes(searchLower) ||
                exp.InstitutionName?.toLowerCase().includes(searchLower) ||
                exp.references?.some(ref =>
                    ref.name.toLowerCase().includes(searchLower) ||
                    ref.function.toLowerCase().includes(searchLower)
                )
            );
        }
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(exp =>
                exp.experience_categories_id.toString() === selectedCategory
            );
        }
        setFilteredExperiences(filtered);
    }, [searchTerm, experiences, selectedCategory]);

    // Generate predefined experience template
    const generatePredefinedExperience = (type: 'academic' | 'internship' | 'volunteer') => {
        const data = experienceData[type];
        const dates = generateDates(type);

        const baseData = {
            experience_categories_id: type === 'academic' ? '2' : type === 'internship' ? '1' : '3',
            date_start: dates.startDate,
            date_end: dates.endDate,
            comment: t('experiences.form.templates.defaultComment'),
            references: [{
                name: t('experiences.form.references.default.name'),
                function: t('experiences.form.references.default.function'),
                email: t('experiences.form.references.default.email'),
                telephone: t('experiences.form.references.default.phone')
            }]
        };

        switch(type) {
            case 'academic':
                return {
                    ...baseData,
                    name: getRandomItem(data.names),
                    InstitutionName: getRandomItem(data.institutions),
                    description: getRandomItem(data.descriptions),
                    output: t('experiences.form.templates.academic.defaultOutput'),
                };
            case 'internship':
                return {
                    ...baseData,
                    name: getRandomItem(data.names),
                    InstitutionName: getRandomItem(data.companies),
                    description: getRandomItem(data.descriptions),
                    output: getRandomItem(data.achievements),
                };
            case 'volunteer':
                return {
                    ...baseData,
                    name: getRandomItem(data.names),
                    InstitutionName: getRandomItem(data.institutions),
                    description: getRandomItem(data.descriptions),
                    output: getRandomItem(data.outputs),
                };
        }
    };

    // Event Handlers
    const handleEdit = (experience: Experience) => {
        setData({
            ...experience,
            experience_categories_id: experience.experience_categories_id.toString(),
            attachment: null,
            references: experience.references || []
        });
        calculateAttachmentStats();
        setIsFormOpen(true);
    };

    const handleDelete = async (experienceId: number) => {
        try {
            await axios.delete(`/experiences/${experienceId}`);
            const updatedExperiences = experiences.filter(exp => exp.id !== experienceId);
            setExperiences(updatedExperiences);
            onUpdate(updatedExperiences);
            calculateAttachmentStats();

            toast({
                title: t('experiences.success.deleted'),
                description: t('experiences.success.deletedDescription'),
            });
        } catch (error) {
            toast({
                title: t('experiences.errors.delete'),
                description: t('experiences.errors.generic'),
                variant: "destructive",
            });
        }
    };
    const handleDeleteAttachment = async (experienceId: number) => {
        setIsLoading(true);
        try {
            const response = await axios.delete(`/experiences/${experienceId}/attachment`);

            if (response.status === 200) {
                const updatedExperiences = experiences.map(exp => {
                    if (exp.id === experienceId) {
                        return {
                            ...exp,
                            attachment_path: undefined,
                            attachment_size: 0
                        };
                    }
                    return exp;
                });

                setExperiences(updatedExperiences);
                onUpdate(updatedExperiences);
                calculateAttachmentStats();

                toast({
                    title: t('experiences.success.attachment.deleted'),
                    description: t('experiences.success.attachment.deletedDescription'),
                });

                if (data.id === experienceId) {
                    setData(prev => ({
                        ...prev,
                        attachment_path: undefined,
                        attachment_size: 0,
                        attachment: null
                    }));
                }
            }
        } catch (error: any) {
            let errorMessage = t('experiences.errors.attachment.delete');
            if (error.response?.data?.message) {
                errorMessage += `: ${error.response.data.message}`;
            }

            toast({
                title: t('experiences.errors.title'),
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData();

            // Handle form data
            Object.entries(data).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    if (key === 'attachment' && value instanceof File) {
                        formData.append('attachment', value);
                    } else if (key === 'references' && Array.isArray(value)) {
                        formData.append('references', JSON.stringify(value));
                    } else if (key !== 'attachment') {
                        formData.append(key, String(value));
                    }
                }
            });

            if (data.id && !data.attachment && !data.attachment_path) {
                formData.append('remove_attachment', '1');
            }

            const response = data.id
                ? await axios.post(`/experiences/${data.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    params: { _method: 'PUT' }
                })
                : await axios.post('/experiences', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

            const updatedExperience = {
                ...response.data.experience,
                attachment_path: response.data.experience.attachment_path,
                attachment_size: response.data.experience.attachment_size
            };

            const updatedExperiences = data.id
                ? experiences.map(exp => exp.id === updatedExperience.id ? updatedExperience : exp)
                : [...experiences, updatedExperience];

            setExperiences(updatedExperiences);
            onUpdate(updatedExperiences);
            calculateAttachmentStats();

            toast({
                title: data.id
                    ? t('experiences.success.updated')
                    : t('experiences.success.created'),
                description: t('experiences.success.formDescription'),
            });

            resetForm();
        } catch (error: any) {
            let errorMessage = t('experiences.errors.save');
            if (error.response?.data?.message) {
                errorMessage += `: ${error.response.data.message}`;
            }

            toast({
                title: t('experiences.errors.title'),
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePreviewPDF = (attachmentUrl?: string) => {
        if (!attachmentUrl) {
            toast({
                title: t('experiences.errors.attachment.noFile'),
                description: t('experiences.errors.attachment.noFileDescription'),
                variant: 'destructive',
            });
            return;
        }
        window.open(attachmentUrl, '_blank')?.focus();
    };

    const resetForm = () => {
        reset();
        setData({
            id: '',
            name: '',
            description: '',
            date_start: '',
            date_end: '',
            output: '',
            experience_categories_id: '',
            comment: '',
            InstitutionName: '',
            attachment: null,
            references: []
        });
        setIsFormOpen(false);
    };

    const handleTemplateSelection = (type: 'academic' | 'internship' | 'volunteer') => {
        const template = generatePredefinedExperience(type);
        if (template) {
            setData(prev => ({
                ...prev,
                ...template
            }));
            toast({
                title: t('experiences.success.template.applied'),
                description: t('experiences.success.template.description'),
            });
        }
    };
    // Experience Card Component
    const ExperienceCard: React.FC<{ experience: Experience }> = ({ experience: exp }) => {
        const getCategoryIcon = (categoryId: string) => {
            switch(categoryId) {
                case '1': return <Briefcase className="w-4 h-4" />;
                case '2': return <GraduationCap className="w-4 h-4" />;
                case '3': return <Users className="w-4 h-4" />;
                default: return <Award className="w-4 h-4" />;
            }
        };

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
            >
                <Card className="border-amber-100 dark:border-amber-900/50 hover:shadow-md transition-shadow dark:bg-gray-800">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                        {exp.name}
                                    </h3>
                                    <Badge
                                        variant="secondary"
                                        className="bg-gradient-to-r from-amber-100 to-purple-100
                                                 dark:from-amber-900/40 dark:to-purple-900/40
                                                 dark:text-gray-100 flex items-center gap-1"
                                    >
                                        {getCategoryIcon(exp.experience_categories_id)}
                                        {categories.find(c => c.id === parseInt(exp.experience_categories_id))?.name}
                                    </Badge>
                                </div>

                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    <Building2 className="w-4 h-4 mr-2 text-amber-500 dark:text-amber-400" />
                                    <span>{exp.InstitutionName}</span>
                                </div>

                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    <BookOpen className="w-4 h-4 mr-2 text-purple-500 dark:text-purple-400" />
                                    <span>
                                        {new Date(exp.date_start).toLocaleDateString('fr-FR')} -
                                        {exp.date_end ? new Date(exp.date_end).toLocaleDateString('fr-FR') : t('experiences.dates.present')}
                                    </span>
                                </div>

                                {exp.attachment_path && (
                                    <Badge
                                        variant="outline"
                                        className="mt-2 bg-gradient-to-r from-amber-50 to-purple-50
                                                 dark:from-amber-900/20 dark:to-purple-900/20
                                                 dark:text-gray-200"
                                    >
                                        <FileText className="w-3 h-3 mr-1" />
                                        {formatBytes(exp.attachment_size)}
                                    </Badge>
                                )}
                            </div>

                            <div className="flex gap-2 self-end sm:self-start">
                                {exp.attachment_path && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handlePreviewPDF(exp.attachment_path)}
                                        className="hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                    >
                                        <Eye className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(exp)}
                                    className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                >
                                    <Edit className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(exp.id)}
                                    className="hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                                </Button>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {exp.description}
                            </p>

                            {exp.output && (
                                <div className="bg-gradient-to-r from-amber-50 to-purple-50
                                              dark:from-amber-900/20 dark:to-purple-900/20
                                              p-3 rounded-md">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Award className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                            {t('experiences.output.title')}:
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {exp.output}
                                    </p>
                                </div>
                            )}
                        </div>

                        {exp.references && exp.references.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
                                    {t('experiences.references.title')}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {exp.references.map((ref, index) => (
                                        <div key={index} className="text-sm bg-gray-50 dark:bg-gray-900 p-2 rounded-md">
                                            <p className="font-medium text-gray-800 dark:text-white">
                                                {ref.name}
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                {ref.function}
                                            </p>
                                            {ref.email && (
                                                <p className="text-gray-500 dark:text-gray-400 text-xs">
                                                    {ref.email}
                                                </p>
                                            )}
                                            {ref.telephone && (
                                                <p className="text-gray-500 dark:text-gray-400 text-xs">
                                                    {ref.telephone}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        );
    };
// Attachment Statistics Component
    const AttachmentStatistics: React.FC<{ summary: AttachmentSummary }> = ({ summary }) => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/20 dark:to-purple-900/20 border-none">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t('experiences.attachments.stats.used')}
                                </p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {formatBytes(Number(summary.total_size))}
                                </h3>
                            </div>
                            <FileText className="w-8 h-8 text-amber-500 dark:text-amber-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/20 dark:to-purple-900/20 border-none">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t('experiences.attachments.stats.files')}
                                </p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {summary.files_count}
                                </h3>
                            </div>
                            <FileText className="w-8 h-8 text-purple-500 dark:text-purple-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/20 dark:to-purple-900/20 border-none">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t('experiences.attachments.stats.available')}
                                </p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {formatBytes(Math.max(0, summary.max_size - summary.total_size))}
                                </h3>
                            </div>
                            <FileText className="w-8 h-8 text-amber-500 dark:text-amber-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    // Main Render
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        {t('experiences.title')}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        {t('experiences.description')}
                    </p>
                </div>
            </div>

            <Tabs defaultValue="experiences" value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="experiences" className="flex items-center gap-2">
                        <PencilRuler className="w-4 h-4" />
                        {t('experiences.tabs.list')}
                    </TabsTrigger>
                    <TabsTrigger value="attachments" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {t('experiences.tabs.attachments')} {attachmentSummary.files_count > 0 &&
                        `(${attachmentSummary.files_count})`}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="experiences">
                    <Card className="border-amber-100 dark:border-amber-900/50">
                        <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 dark:text-amber-400" />
                                        <Input
                                            type="text"
                                            placeholder={t('experiences.filters.search')}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 border-amber-200 dark:border-amber-800 focus:ring-amber-500
                                                     dark:focus:ring-amber-400 dark:bg-gray-900"
                                        />
                                    </div>
                                </div>
                                <Button
                                    onClick={() => setIsFormOpen(true)}
                                    className="bg-gradient-to-r from-amber-500 to-purple-500
                                             hover:from-amber-600 hover:to-purple-600
                                             dark:from-amber-400 dark:to-purple-400
                                             dark:hover:from-amber-500 dark:hover:to-purple-500
                                             text-white"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t('experiences.actions.add')}
                                </Button>
                            </div>

                            <div className="flex gap-2 overflow-x-auto py-4">
                                <Button
                                    variant={selectedCategory === 'all' ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setSelectedCategory('all')}
                                    className={selectedCategory === 'all' ?
                                        'bg-gradient-to-r from-amber-500 to-purple-500 text-white dark:from-amber-400 dark:to-purple-400' :
                                        'dark:text-gray-300'}
                                >
                                    <PencilRuler className="w-4 h-4 mr-2" />
                                    {t('experiences.filters.all')}
                                </Button>
                                {categories.map((cat) => (
                                    <Button
                                        key={cat.id}
                                        variant={selectedCategory === cat.id.toString() ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setSelectedCategory(cat.id.toString())}
                                        className={selectedCategory === cat.id.toString() ?
                                            'bg-gradient-to-r from-amber-500 to-purple-500 text-white dark:from-amber-400 dark:to-purple-400' :
                                            'dark:text-gray-300'}
                                    >
                                        {cat.id === 1 && <Briefcase className="w-4 h-4 mr-2" />}
                                        {cat.id === 2 && <GraduationCap className="w-4 h-4 mr-2" />}
                                        {cat.id === 3 && <Users className="w-4 h-4 mr-2" />}
                                        {cat.name}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <ScrollArea className="h-[600px] pr-4 mt-4">
                        <div className="space-y-4">
                            <AnimatePresence mode="sync">
                                {filteredExperiences.length > 0 ? (
                                    filteredExperiences.map((exp) => (
                                        <ExperienceCard key={exp.id} experience={exp} />
                                    ))
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <Card className="border-amber-100 dark:border-amber-900/50">
                                            <CardContent className="p-12 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <PencilRuler className="w-12 h-12 text-amber-500 dark:text-amber-400" />
                                                    <p className="text-gray-500 dark:text-gray-400">
                                                        {searchTerm
                                                            ? t('experiences.empty.search')
                                                            : t('experiences.empty.experiences')
                                                        }
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </ScrollArea>
                </TabsContent>
                <TabsContent value="attachments">
                    <Card className="border-amber-100 dark:border-amber-900/50">
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                <AttachmentStatistics summary={attachmentSummary} />

                                <div className="space-y-4">
                                    <AnimatePresence mode="sync">
                                        {experiences
                                            .filter(exp => exp.attachment_path)
                                            .map(exp => (
                                                <motion.div
                                                    key={exp.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Card className="hover:shadow-md transition-all dark:bg-gray-800">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex-1">
                                                                    <h4 className="font-semibold text-gray-800 dark:text-white">
                                                                        {exp.name}
                                                                    </h4>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                        {exp.InstitutionName}
                                                                    </p>
                                                                    {exp.attachment_size && (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="mt-2 bg-gradient-to-r from-amber-50 to-purple-50
                                                                                     dark:from-amber-900/20 dark:to-purple-900/20
                                                                                     dark:text-gray-200"
                                                                        >
                                                                            {formatBytes(Number(exp.attachment_size))}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handlePreviewPDF(exp.attachment_path)}
                                                                        className="hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                                                    >
                                                                        <Eye className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleEdit(exp)}
                                                                        className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                                                    >
                                                                        <Edit className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleDeleteAttachment(exp.id)}
                                                                        className="hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                    >
                                                                        <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            ))}
                                    </AnimatePresence>

                                    {experiences.filter(exp => exp.attachment_path).length === 0 && (
                                        <Card className="dark:bg-gray-800">
                                            <CardContent className="p-12 text-center">
                                                <FileText className="w-12 h-12 text-amber-500 dark:text-amber-400 mx-auto mb-4" />
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    {t('experiences.empty.attachments')}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
                <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                            <PencilRuler className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                            {data.id ? t('experiences.form.title.edit') : t('experiences.form.title.new')}
                        </SheetTitle>
                        <SheetDescription className="dark:text-gray-400">
                            {data.id ? t('experiences.form.description.edit') : t('experiences.form.description.new')}
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={handleSubmit} className="space-y-6 pt-6">
                        {/* Template Selection */}
                        <Card className="border-amber-100 dark:border-amber-900/50">
                            <CardHeader>
                                <CardTitle className="text-base dark:text-white">
                                    {t('experiences.form.templates.title')}
                                </CardTitle>
                                <CardDescription className="dark:text-gray-400">
                                    {t('experiences.form.templates.description')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleTemplateSelection('academic')}
                                    className="justify-start border-amber-200 dark:border-amber-800 hover:bg-amber-50
                                             dark:hover:bg-amber-900/20 dark:text-white"
                                >
                                    <GraduationCap className="w-4 h-4 mr-2 text-amber-500 dark:text-amber-400" />
                                    {t('experiences.form.templates.academic')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleTemplateSelection('internship')}
                                    className="justify-start border-amber-200 dark:border-amber-800 hover:bg-amber-50
                                             dark:hover:bg-amber-900/20 dark:text-white"
                                >
                                    <Briefcase className="w-4 h-4 mr-2 text-purple-500 dark:text-purple-400" />
                                    {t('experiences.form.templates.internship')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleTemplateSelection('volunteer')}
                                    className="justify-start border-amber-200 dark:border-amber-800 hover:bg-amber-50
                                             dark:hover:bg-amber-900/20 dark:text-white"
                                >
                                    <Users className="w-4 h-4 mr-2 text-amber-500 dark:text-amber-400" />
                                    {t('experiences.form.templates.volunteer')}
                                </Button>
                            </CardContent>
                        </Card>
                        {/* Basic Information Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-gray-700 dark:text-gray-200">
                                    {t('experiences.form.fields.name.label')}
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder={t('experiences.form.fields.name.placeholder')}
                                    className="border-amber-200 dark:border-amber-800 focus:ring-amber-500
                                             dark:focus:ring-amber-400 dark:bg-gray-900 dark:text-white"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500 dark:text-red-400">{errors.name}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="InstitutionName" className="text-gray-700 dark:text-gray-200">
                                    {t('experiences.form.fields.institution.label')}
                                </Label>
                                <Input
                                    id="InstitutionName"
                                    value={data.InstitutionName}
                                    onChange={(e) => setData('InstitutionName', e.target.value)}
                                    placeholder={t('experiences.form.fields.institution.placeholder')}
                                    className="border-amber-200 dark:border-amber-800 focus:ring-amber-500
                                             dark:focus:ring-amber-400 dark:bg-gray-900 dark:text-white"
                                />
                                {errors.InstitutionName && (
                                    <p className="text-sm text-red-500 dark:text-red-400">{errors.InstitutionName}</p>
                                )}
                            </div>
                        </div>

                        {/* Dates Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date_start" className="text-gray-700 dark:text-gray-200">
                                    {t('experiences.form.fields.dates.start')}
                                </Label>
                                <Input
                                    id="date_start"
                                    type="date"
                                    value={data.date_start}
                                    onChange={(e) => setData('date_start', e.target.value)}
                                    className="border-amber-200 dark:border-amber-800 focus:ring-amber-500
                                             dark:focus:ring-amber-400 dark:bg-gray-900 dark:text-white"
                                />
                                {errors.date_start && (
                                    <p className="text-sm text-red-500 dark:text-red-400">{errors.date_start}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date_end" className="text-gray-700 dark:text-gray-200">
                                    {t('experiences.form.fields.dates.end')}
                                </Label>
                                <Input
                                    id="date_end"
                                    type="date"
                                    value={data.date_end || ''}
                                    onChange={(e) => setData('date_end', e.target.value)}
                                    className="border-amber-200 dark:border-amber-800 focus:ring-amber-500
                                             dark:focus:ring-amber-400 dark:bg-gray-900 dark:text-white"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {t('experiences.form.fields.dates.ongoing')}
                                </p>
                                {errors.date_end && (
                                    <p className="text-sm text-red-500 dark:text-red-400">{errors.date_end}</p>
                                )}
                            </div>
                        </div>

                        {/* Experience Type Select */}
                        <div className="space-y-2">
                            <Label htmlFor="experience_categories_id" className="text-gray-700 dark:text-gray-200">
                                {t('experiences.form.fields.type.label')}
                            </Label>
                            <Select
                                value={data.experience_categories_id}
                                onValueChange={(value) => setData('experience_categories_id', value)}
                            >
                                <SelectTrigger className="border-amber-200 dark:border-amber-800 focus:ring-amber-500
                                                       dark:focus:ring-amber-400 dark:bg-gray-900">
                                    <SelectValue placeholder={t('experiences.form.fields.type.placeholder')} />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-900">
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            <div className="flex items-center gap-2">
                                                {cat.id === 1 && <Briefcase className="w-4 h-4 text-amber-500 dark:text-amber-400" />}
                                                {cat.id === 2 && <GraduationCap className="w-4 h-4 text-purple-500 dark:text-purple-400" />}
                                                {cat.id === 3 && <Users className="w-4 h-4 text-amber-500 dark:text-amber-400" />}
                                                <span className="dark:text-white">{cat.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.experience_categories_id && (
                                <p className="text-sm text-red-500 dark:text-red-400">
                                    {errors.experience_categories_id}
                                </p>
                            )}
                        </div>

                        {/* Description and Results Fields */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-gray-700 dark:text-gray-200">
                                {t('experiences.form.fields.description.label')}
                            </Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder={t('experiences.form.fields.description.placeholder')}
                                rows={4}
                                className="border-amber-200 dark:border-amber-800 focus:ring-amber-500
                                         dark:focus:ring-amber-400 dark:bg-gray-900 dark:text-white"
                            />
                            {errors.description && (
                                <p className="text-sm text-red-500 dark:text-red-400">{errors.description}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="output" className="text-gray-700 dark:text-gray-200">
                                {t('experiences.form.fields.output.label')}
                            </Label>
                            <Input
                                id="output"
                                value={data.output}
                                onChange={(e) => setData('output', e.target.value)}
                                placeholder={t('experiences.form.fields.output.placeholder')}
                                className="border-amber-200 dark:border-amber-800 focus:ring-amber-500
                                         dark:focus:ring-amber-400 dark:bg-gray-900 dark:text-white"
                            />
                            {errors.output && (
                                <p className="text-sm text-red-500 dark:text-red-400">{errors.output}</p>
                            )}
                        </div>

                        {/* Attachment Section */}
                        <div className="space-y-2">
                            <Label className="text-gray-700 dark:text-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span>{t('experiences.form.attachment.title')}</span>
                                        <Badge
                                            variant="secondary"
                                            className="bg-gradient-to-r from-amber-100 to-purple-100
                                                     dark:from-amber-900/20 dark:to-purple-900/20"
                                        >
                                            {t('experiences.form.attachment.maxSize')}
                                        </Badge>
                                    </div>
                                    {data.attachment_path && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteAttachment(data.id)}
                                            className="hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                                            {t('experiences.form.attachment.delete')}
                                        </Button>
                                    )}
                                </div>
                            </Label>
                            <Input
                                id="attachment"
                                type="file"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    if (file && data.attachment_path) {
                                        handleDeleteAttachment(data.id);
                                    }
                                    setData('attachment', file);
                                }}
                                className="border-amber-200 dark:border-amber-800 focus:ring-amber-500
                                         dark:focus:ring-amber-400 dark:bg-gray-900 dark:text-white
                                         cursor-pointer"
                                accept=".pdf,.doc,.docx"
                            />
                            {data.attachment_path && (
                                <div className="flex items-center gap-2 mt-2">
                                    <FileText className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        {t('experiences.form.attachment.current')} {data.attachment_path.split('/').pop()}
                                    </span>
                                </div>
                            )}
                            {errors.attachment && (
                                <p className="text-sm text-red-500 dark:text-red-400">{errors.attachment}</p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {t('experiences.form.attachment.formats')}
                            </p>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-between gap-2 sticky bottom-0 bg-white dark:bg-gray-900 pt-4 border-t dark:border-gray-700">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-gradient-to-r from-amber-500 to-purple-500
                                         hover:from-amber-600 hover:to-purple-600
                                         dark:from-amber-400 dark:to-purple-400
                                         dark:hover:from-amber-500 dark:hover:to-purple-500
                                         text-white"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        {t('common.loading')}
                                    </div>
                                ) : data.id ? t('experiences.actions.update') : t('experiences.actions.save')}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetForm}
                                className="border-amber-200 dark:border-amber-800 hover:bg-amber-50
                                         dark:hover:bg-amber-900/20 dark:text-white"
                            >
                                {t('experiences.actions.cancel')}
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default ExperienceManager;
