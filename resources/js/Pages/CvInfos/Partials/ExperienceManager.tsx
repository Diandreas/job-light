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
    PencilRuler,
    Menu
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
        max_size: 20971520, // 0MB default
        files_count: 0
    });
    const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);

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


    // Event Handlers
    const handleEdit = (experience: Experience) => {
        //@ts-ignore
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
                //@ts-ignore

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
            //@ts-ignore

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


    const handleAddReference = () => {
        setData('references', [...data.references, { name: '', function: '', email: '', telephone: '' }]);
    };

    const handleRemoveReference = (index: number) => {
        setData('references', data.references.filter((_, i) => i !== index));
    };

    const handleReferenceChange = (index: number, field: keyof Reference, value: string) => {
        const updatedReferences = [...data.references];
        //@ts-ignore
        updatedReferences[index][field] = value;
        setData('references', updatedReferences);
    };

    // Experience Card Component
    const ExperienceCard: React.FC<{ experience: Experience }> = ({ experience: exp }) => {
        const getCategoryIcon = (categoryId: string) => {
            switch (categoryId) {
                case '1': return <Briefcase className="w-3 h-3" />;
                case '2': return <GraduationCap className="w-3 h-3" />;
                case '3': return <Users className="w-3 h-3" />;
                default: return <Award className="w-3 h-3" />;
            }
        };

        const toggleActionMenu = () => {
            if (actionMenuOpen === exp.id) {
                setActionMenuOpen(null);
            } else {
                setActionMenuOpen(exp.id);
            }
        };

        // Format name for display with potential truncation
        const formatName = (name: string) => {
            if (!name) return '';
            if (name.length > 20) {
                return name.substring(0, 20) + '...';
            }
            return name;
        };

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
            >
                <Card className="border-amber-100 dark:border-amber-900/50 dark:bg-gray-800">
                    <CardContent className="p-2">
                        <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0 pr-1">
                                <div className="flex items-center flex-wrap gap-1">
                                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white truncate max-w-full">
                                        {formatName(exp.name)}
                                    </h3>
                                    <Badge
                                        variant="secondary"
                                        className="bg-gradient-to-r from-amber-100 to-purple-100
                                                  dark:from-amber-900/40 dark:to-purple-900/40
                                                  dark:text-gray-100 inline-flex items-center gap-1 text-[10px] px-1 h-5"
                                    >
                                        {getCategoryIcon(exp.experience_categories_id)}
                                        <span className="truncate max-w-12 inline-block">
                                            {categories.find(c => c.id === parseInt(exp.experience_categories_id))?.name}
                                        </span>
                                    </Badge>
                                </div>

                                <div className="flex items-center text-[10px] text-gray-600 dark:text-gray-300 mt-0.5">
                                    <Building2 className="w-2.5 h-2.5 mr-0.5 flex-shrink-0 text-amber-500 dark:text-amber-400" />
                                    <span className="truncate">{exp.InstitutionName}</span>
                                </div>

                                <div className="flex items-center text-[10px] text-gray-600 dark:text-gray-300 mt-0.5">
                                    <BookOpen className="w-2.5 h-2.5 mr-0.5 flex-shrink-0 text-purple-500 dark:text-purple-400" />
                                    <span className="whitespace-nowrap">
                                        {new Date(exp.date_start).toLocaleDateString('fr-FR', { year: '2-digit', month: '2-digit' })} -
                                        {exp.date_end ? new Date(exp.date_end).toLocaleDateString('fr-FR', { year: '2-digit', month: '2-digit' }) : 'actuel'}
                                    </span>
                                </div>

                                {exp.attachment_path && (
                                    <span className="inline-flex items-center mt-0.5 text-[10px] text-gray-600 dark:text-gray-300">
                                        <FileText className="w-2.5 h-2.5 mr-0.5 text-amber-500 dark:text-amber-400" />
                                        {formatBytes(exp.attachment_size)}
                                    </span>
                                )}
                            </div>

                            <div className="relative">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleActionMenu}
                                    className="h-6 w-6 p-0"
                                >
                                    <Menu className="w-3 h-3" />
                                </Button>

                                {actionMenuOpen === exp.id && (
                                    <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md py-1 w-28 z-10 border dark:border-gray-700">
                                        {exp.attachment_path && (
                                            <button
                                                onClick={() => {
                                                    handlePreviewPDF(exp.attachment_path);
                                                    setActionMenuOpen(null);
                                                }}
                                                className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                            >
                                                <Eye className="w-3 h-3 mr-1 text-amber-500 dark:text-amber-400" />
                                                Voir
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                handleEdit(exp);
                                                setActionMenuOpen(null);
                                            }}
                                            className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                        >
                                            <Edit className="w-3 h-3 mr-1 text-purple-500 dark:text-purple-400" />
                                            Éditer
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleDelete(exp.id);
                                                setActionMenuOpen(null);
                                            }}
                                            className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-red-500"
                                        >
                                            <Trash2 className="w-3 h-3 mr-1" />
                                            Supprimer
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-1.5 space-y-1">
                            <p className="text-[10px] text-gray-600 dark:text-gray-300 line-clamp-2">
                                {exp.description}
                            </p>

                            {exp.output && (
                                <div className="bg-gradient-to-r from-amber-50 to-purple-50
                                                dark:from-amber-900/20 dark:to-purple-900/20
                                                p-1.5 rounded-md">
                                    <div className="flex items-center gap-1">
                                        <Award className="w-2.5 h-2.5 text-amber-500 dark:text-amber-400" />
                                        <p className="text-[10px] font-medium text-gray-700 dark:text-gray-200">
                                            Résultat:
                                        </p>
                                    </div>
                                    <p className="text-[10px] text-gray-600 dark:text-gray-300 line-clamp-2 mt-0.5">
                                        {exp.output}
                                    </p>
                                </div>
                            )}
                        </div>

                        {exp.references && exp.references.length > 0 && (
                            <div className="mt-1.5">
                                <details className="text-[10px]">
                                    <summary className="font-semibold text-gray-800 dark:text-white cursor-pointer">
                                        Références ({exp.references.length})
                                    </summary>
                                    <div className="mt-1 grid grid-cols-1 gap-1.5">
                                        {exp.references.map((ref, index) => (
                                            <div key={index} className="text-[10px] bg-gray-50 dark:bg-gray-900 p-1.5 rounded-md">
                                                <p className="font-medium text-gray-800 dark:text-white truncate">
                                                    {ref.name}
                                                </p>
                                                <p className="text-gray-600 dark:text-gray-300 truncate">
                                                    {ref.function}
                                                </p>
                                                {ref.email && (
                                                    <p className="text-gray-500 dark:text-gray-400 truncate">
                                                        {ref.email}
                                                    </p>
                                                )}
                                                {ref.telephone && (
                                                    <p className="text-gray-500 dark:text-gray-400">
                                                        {ref.telephone}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </details>
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
            <div className="flex flex-wrap gap-2">
                <Card className="bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/20 dark:to-purple-900/20 border-none flex-1 min-w-[100px]">
                    <CardContent className="p-2">
                        <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 truncate">
                                    {t('experiences.attachments.stats.used')}
                                </p>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                    {formatBytes(Number(summary.total_size))}
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/20 dark:to-purple-900/20 border-none flex-1 min-w-[100px]">
                    <CardContent className="p-2">
                        <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 truncate">
                                    {t('experiences.attachments.stats.files')}
                                </p>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                    {summary.files_count}
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/20 dark:to-purple-900/20 border-none flex-1 min-w-[100px]">
                    <CardContent className="p-2">
                        <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 truncate">
                                    {t('experiences.attachments.stats.available')}
                                </p>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                    {formatBytes(Math.max(0, summary.max_size - summary.total_size))}
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    // Main Render
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const maxNameLength = windowSize.width < 600 ? 5 : 10;
    return (
        <div className="space-y-3">
            <div className="flex flex-col justify-between items-start gap-1">
                <div>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                        {t('experiences.title')}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('experiences.description')}
                    </p>
                </div>
                <Button
                    onClick={() => setIsFormOpen(true)}
                    className="w-full sm:w-auto mt-1 bg-gradient-to-r from-amber-500 to-purple-500
                             hover:from-amber-600 hover:to-purple-600
                             dark:from-amber-400 dark:to-purple-400
                             dark:hover:from-amber-500 dark:hover:to-purple-500
                             text-white text-xs h-8 py-0"
                >
                    <Plus className="w-3 h-3 mr-1" />
                    {t('experiences.actions.add')}
                </Button>
            </div>

            <Tabs defaultValue="experiences" value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-2">
                    <TabsTrigger value="experiences" className="flex items-center gap-1 text-[10px] py-0.5 h-7">
                        <PencilRuler className="w-2.5 h-2.5" />
                        {t('experiences.tabs.list')}
                    </TabsTrigger>
                    <TabsTrigger value="attachments" className="flex items-center gap-1 text-[10px] py-0.5 h-7">
                        <FileText className="w-2.5 h-2.5" />
                        {t('experiences.tabs.attachments')} {attachmentSummary.files_count > 0 &&
                            `(${attachmentSummary.files_count})`}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="experiences">
                    <Card className="border-amber-100 dark:border-amber-900/50">
                        <CardContent className="p-2">
                            <div className="flex flex-col gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-amber-500 dark:text-amber-400 w-3 h-3" />
                                    <Input
                                        type="text"
                                        placeholder={t('experiences.filters.search')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-7 text-xs border-amber-200 dark:border-amber-800 focus:ring-amber-500
                                                 dark:focus:ring-amber-400 dark:bg-gray-900 h-7"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-1 overflow-x-auto py-2 text-[10px]">
                                <Button
                                    variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setSelectedCategory('all')}
                                    className={`py-0 h-6 ${selectedCategory === 'all' ?
                                        'bg-gradient-to-r from-amber-500 to-purple-500 text-white dark:from-amber-400 dark:to-purple-400' :
                                        'dark:text-gray-300'}`}
                                >
                                    <PencilRuler className="w-2.5 h-2.5 mr-0.5" />
                                    Tous
                                </Button>
                                {categories.map((cat) => (
                                    <Button
                                        key={cat.id}
                                        variant={selectedCategory === cat.id.toString() ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setSelectedCategory(cat.id.toString())}
                                        className={`py-0 h-6 ${selectedCategory === cat.id.toString() ?
                                            'bg-gradient-to-r from-amber-500 to-purple-500 text-white dark:from-amber-400 dark:to-purple-400' :
                                            'dark:text-gray-300'}`}
                                    >
                                        {cat.id === 1 && <Briefcase className="w-2.5 h-2.5 mr-0.5" />}
                                        {cat.id === 2 && <GraduationCap className="w-2.5 h-2.5 mr-0.5" />}
                                        {cat.id === 3 && <Users className="w-2.5 h-2.5 mr-0.5" />}
                                        {cat.name.length > maxNameLength ? cat.name.substring(0, maxNameLength - 3) + '...' : cat.name}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <ScrollArea className="h-[calc(100vh-300px)] sm:h-[500px] pr-2 mt-3">
                        <div className="space-y-3">
                            <AnimatePresence mode="sync">
                                {filteredExperiences.length > 0 ? (
                                    filteredExperiences.map((exp) => (
                                        <ExperienceCard key={`experience-${exp.id}`} experience={exp} />
                                    ))
                                ) : (
                                    <motion.div
                                        key="no-experiences"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <Card className="border-amber-100 dark:border-amber-900/50">
                                            <CardContent className="p-6 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <PencilRuler className="w-8 h-8 text-amber-500 dark:text-amber-400" />
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
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
                        <CardContent className="p-3">
                            <div className="space-y-4">
                                <AttachmentStatistics summary={attachmentSummary} />

                                <div className="space-y-3">
                                    <AnimatePresence mode="sync">
                                        {experiences
                                            .filter(exp => exp.attachment_path)
                                            .map(exp => (
                                                <motion.div
                                                    key={`attachment-${exp.id}`}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Card className="dark:bg-gray-800">
                                                        <CardContent className="p-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center">
                                                                        <FileText className="w-3 h-3 text-amber-500 dark:text-amber-400 mr-1 flex-shrink-0" />
                                                                        <h4 className="font-semibold text-xs text-gray-800 dark:text-white truncate">
                                                                            {exp.name.length > 15 ? exp.name.substring(0, 15) + '...' : exp.name}
                                                                        </h4>
                                                                    </div>
                                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate flex items-center">
                                                                        <span className="truncate">{exp.InstitutionName}</span>
                                                                    </p>
                                                                    {exp.attachment_size && (
                                                                        <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                                                                            {formatBytes(Number(exp.attachment_size))}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        onClick={() => handlePreviewPDF(exp.attachment_path)}
                                                                        className="h-5 w-5 flex items-center justify-center text-amber-500 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded"
                                                                    >
                                                                        <Eye className="w-3 h-3" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleEdit(exp)}
                                                                        className="h-5 w-5 flex items-center justify-center text-purple-500 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded"
                                                                    >
                                                                        <Edit className="w-3 h-3" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteAttachment(exp.id)}
                                                                        className="h-5 w-5 flex items-center justify-center text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            ))}
                                    </AnimatePresence>

                                    {experiences.filter(exp => exp.attachment_path).length === 0 && (
                                        <Card className="dark:bg-gray-800">
                                            <CardContent className="p-6 text-center">
                                                <FileText className="w-8 h-8 text-amber-500 dark:text-amber-400 mx-auto mb-3" />
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
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
                <SheetContent side="right" className="w-full max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto p-3 sm:p-4">
                    <SheetHeader className="text-left pb-2">
                        <SheetTitle className="flex items-center gap-2 text-lg text-gray-800 dark:text-white">
                            <PencilRuler className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                            {data.id ? t('experiences.form.title.edit') : t('experiences.form.title.new')}
                        </SheetTitle>
                        <SheetDescription className="text-xs dark:text-gray-400">
                            {data.id ? t('experiences.form.description.edit') : t('experiences.form.description.new')}
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-3 pb-20 md:pb-4">
                        {/* Basic Information Fields */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs text-gray-700 dark:text-gray-200">
                                {t('experiences.form.fields.name.label')}
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder={t('experiences.form.fields.name.placeholder')}
                                className="border-amber-200 dark:border-amber-800 focus:ring-amber-500
                                         dark:focus:ring-amber-400 dark:bg-gray-900 dark:text-white h-8 text-sm"
                            />
                            {errors.name && (
                                <p className="text-xs text-red-500 dark:text-red-400">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="InstitutionName" className="text-xs text-gray-700 dark:text-gray-200">
                                {t('experiences.form.fields.institution.label')}
                            </Label>
                            <Input
                                id="InstitutionName"
                                value={data.InstitutionName}
                                onChange={(e) => setData('InstitutionName', e.target.value)}
                                placeholder={t('experiences.form.fields.institution.placeholder')}
                                className="border-amber-200 dark:border-amber-800 focus:ring-amber-500
                                         dark:focus:ring-amber-400 dark:bg-gray-900 dark:text-white h-8 text-sm"
                            />
                            {errors.InstitutionName && (
                                <p className="text-xs text-red-500 dark:text-red-400">{errors.InstitutionName}</p>
                            )}
                        </div>

                        {/* Dates Fields */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label htmlFor="date_start" className="text-xs text-gray-700 dark:text-gray-200">
                                    {t('experiences.form.fields.dates.start')}
                                </Label>
                                <Input
                                    id="date_start"
                                    type="date"
                                    value={data.date_start}
                                    onChange={(e) => setData('date_start', e.target.value)}
                                    className="border-amber-200 dark:border-amber-800 focus:ring-amber-500
                                             dark:focus:ring-amber-400 dark:bg-gray-900 dark:text-white h-8 text-sm"
                                />
                                {errors.date_start && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{errors.date_start}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="date_end" className="text-xs text-gray-700 dark:text-gray-200">
                                    {t('experiences.form.fields.dates.end')}
                                </Label>
                                <Input
                                    id="date_end"
                                    type="date"
                                    value={data.date_end || ''}
                                    onChange={(e) => setData('date_end', e.target.value)}
                                    className="border-amber-200 dark:border-amber-800 focus:ring-amber-500
                                             dark:focus:ring-amber-400 dark:bg-gray-900 dark:text-white h-8 text-sm"
                                />
                                {errors.date_end && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{errors.date_end}</p>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
                            {t('experiences.form.fields.dates.ongoing')}
                        </p>

                        {/* Experience Type Select */}
                        <div className="space-y-2">
                            <Label htmlFor="experience_categories_id" className="text-xs text-gray-700 dark:text-gray-200">
                                {t('experiences.form.fields.type.label')}
                            </Label>
                            <Select
                                value={data.experience_categories_id}
                                onValueChange={(value) => setData('experience_categories_id', value)}
                            >
                                <SelectTrigger className="border-amber-200 dark:border-amber-800 focus:ring-amber-500
                                                       dark:focus:ring-amber-400 dark:bg-gray-900 h-8 text-sm">
                                    <SelectValue placeholder={t('experiences.form.fields.type.placeholder')} />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-900">
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()} className="text-sm">
                                            <div className="flex items-center gap-2">
                                                {cat.id === 1 && <Briefcase className="w-3 h-3 text-amber-500 dark:text-amber-400" />}
                                                {cat.id === 2 && <GraduationCap className="w-3 h-3 text-purple-500 dark:text-purple-400" />}
                                                {cat.id === 3 && <Users className="w-3 h-3 text-amber-500 dark:text-amber-400" />}
                                                <span className="dark:text-white">{cat.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.experience_categories_id && (
                                <p className="text-xs text-red-500 dark:text-red-400">
                                    {errors.experience_categories_id}
                                </p>
                            )}
                        </div>

                        {/* Description and Results Fields */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-xs text-gray-700 dark:text-gray-200">
                                {t('experiences.form.fields.description.label')}
                            </Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder={t('experiences.form.fields.description.placeholder')}
                                rows={3}
                                className="border-amber-200 dark:border-amber-800 focus:ring-amber-500
                                         dark:focus:ring-amber-400 dark:bg-gray-900 dark:text-white text-sm min-h-[80px]"
                            />
                            {errors.description && (
                                <p className="text-xs text-red-500 dark:text-red-400">{errors.description}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="output" className="text-xs text-gray-700 dark:text-gray-200">
                                {t('experiences.form.fields.output.label')}
                            </Label>
                            <Input
                                id="output"
                                value={data.output}
                                onChange={(e) => setData('output', e.target.value)}
                                placeholder={t('experiences.form.fields.output.placeholder')}
                                className="border-amber-200 dark:border-amber-800 focus:ring-amber-500
                                         dark:focus:ring-amber-400 dark:bg-gray-900 dark:text-white h-8 text-sm"
                            />
                            {errors.output && (
                                <p className="text-xs text-red-500 dark:text-red-400">{errors.output}</p>
                            )}
                        </div>

                        {/* References Section */}
                        <div className="space-y-2">
                            <Label htmlFor="references" className="text-xs text-gray-700 dark:text-gray-200">
                                {t('experiences.form.fields.references.label')}
                            </Label>
                            {data.references.map((ref, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={ref.name}
                                            onChange={(e) => handleReferenceChange(index, 'name', e.target.value)}
                                            placeholder={t('experiences.form.fields.references.name')}
                                            className="border-amber-200 dark:border-amber-800 focus:ring-amber-500
                                                     dark:focus:ring-amber-400 dark:bg-gray-900 dark:text-white h-8 text-sm flex-1"
                                        />
                                        <Input
                                            value={ref.function}
                                            onChange={(e) => handleReferenceChange(index, 'function', e.target.value)}
                                            placeholder={t('experiences.form.fields.references.function')}
                                            className="border-amber-200 dark:border-amber-800 focus:ring-amber-500
                                                     dark:focus:ring-amber-400 dark:bg-gray-900 dark:text-white h-8 text-sm flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveReference(index)}
                                            className="h-8 px-2 text-xs"
                                        >
                                            <Trash2 className="w-3 h-3 text-red-500 dark:text-red-400" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={ref.email}
                                            onChange={(e) => handleReferenceChange(index, 'email', e.target.value)}
                                            placeholder={t('experiences.form.fields.references.email')}
                                            className="border-amber-200 dark:border-amber-800 focus:ring-amber-500
                                                     dark:focus:ring-amber-400 dark:bg-gray-900 dark:text-white h-8 text-sm flex-1"
                                        />
                                        <Input
                                            value={ref.telephone}
                                            onChange={(e) => handleReferenceChange(index, 'telephone', e.target.value)}
                                            placeholder={t('experiences.form.fields.references.phone')}
                                            className="border-amber-200 dark:border-amber-800 focus:ring-amber-500
                                                     dark:focus:ring-amber-400 dark:bg-gray-900 dark:text-white h-8 text-sm flex-1"
                                        />
                                    </div>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddReference}
                                className="border-amber-200 dark:border-amber-800 hover:bg-amber-50
                                         dark:hover:bg-amber-900/20 dark:text-white h-8 text-xs"
                            >
                                <Plus className="w-3 h-3 mr-1" />
                                {t('experiences.form.fields.references.add')}
                            </Button>
                        </div>

                        {/* Attachment Section */}
                        <div className="space-y-2">
                            <Label className="text-xs text-gray-700 dark:text-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <span>{t('experiences.form.attachment.title')}</span>
                                        <Badge
                                            variant="secondary"
                                            className="bg-gradient-to-r from-amber-100 to-purple-100
                                                     dark:from-amber-900/20 dark:to-purple-900/20 text-xs"
                                        >
                                            2 MB
                                        </Badge>
                                    </div>
                                    {/*@ts-ignore*/}

                                    {data.attachment_path && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            //@ts-ignore

                                            onClick={() => handleDeleteAttachment(data.id as number)}
                                            className="h-7 px-2 text-xs"
                                        >
                                            <Trash2 className="w-3 h-3 text-red-500 dark:text-red-400 mr-1" />
                                            {t('experiences.form.attachment.delete')}
                                        </Button>
                                    )}
                                </div>
                            </Label>
                            <Input
                                id="attachment"
                                type="file"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        let MAX_FILE_SIZE = 5 * 1024 * 1024
                                        if (file.size > MAX_FILE_SIZE) {
                                            toast({
                                                title: t('experiences.errors.attachment.tooLarge'),
                                                description: t('experiences.errors.attachment.tooLargeDescription'),
                                                variant: "destructive",
                                            });
                                        } else {
                                            //@ts-ignore
                                            if (data.attachment_path) {
                                                //@ts-ignore

                                                handleDeleteAttachment(data.id as number);
                                            }
                                            setData('attachment', file);
                                        }
                                    }
                                }}
                                className="border-amber-200 dark:border-amber-800 focus:ring-amber-500
             dark:focus:ring-amber-400 dark:bg-gray-900 dark:text-white
             cursor-pointer text-xs py-1"
                                accept=".pdf,.doc,.docx,.png,.jpg"
                            />
                            {/*@ts-ignore*/}

                            {data.attachment_path && (
                                <div className="flex items-center gap-2 mt-1">
                                    <FileText className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                                    <span className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                        {/*@ts-ignore*/}
                                        {t('experiences.form.attachment.current')} {data.attachment_path.split('/').pop()}
                                    </span>
                                </div>
                            )}
                            {errors.attachment && (
                                <p className="text-xs text-red-500 dark:text-red-400">{errors.attachment}</p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {t('experiences.form.attachment.formats')}
                            </p>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-between gap-2 sticky bottom-0 bg-white dark:bg-gray-900 pt-4 pb-6 md:pb-2 border-t dark:border-gray-700">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-gradient-to-r from-amber-500 to-purple-500
                                         hover:from-amber-600 hover:to-purple-600
                                         dark:from-amber-400 dark:to-purple-400
                                         dark:hover:from-amber-500 dark:hover:to-purple-500
                                         text-white h-9 text-sm"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        {t('common.loading')}
                                    </div>
                                ) : data.id ? t('experiences.actions.update') : t('experiences.actions.save')}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetForm}
                                className="border-amber-200 dark:border-amber-800 hover:bg-amber-50
                                         dark:hover:bg-amber-900/20 dark:text-white h-9 text-sm"
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
