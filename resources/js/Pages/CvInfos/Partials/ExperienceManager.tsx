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
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerClose
} from "@/Components/ui/drawer";
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
    ChevronRight,
    Calendar
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

interface Props {
    auth: { user: { id: number } };
    experiences: Experience[];
    categories: Category[];
    onUpdate: (experiences: Experience[]) => void;
}

const ExperienceManager: React.FC<Props> = ({ auth, experiences: initialExperiences, categories, onUpdate }) => {
    const { t } = useTranslation();

    // States
    const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentTab, setCurrentTab] = useState('academic');
    const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [currentFormType, setCurrentFormType] = useState<'academic' | 'professional'>('academic');

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

    // Séparer les expériences par type
    const academicExperiences = experiences.filter(exp => exp.experience_categories_id === '2'); // Formation
    const professionalExperiences = experiences.filter(exp => exp.experience_categories_id !== '2'); // Autres

    // Filtrer les expériences selon l'onglet actuel et le terme de recherche
    const getFilteredExperiences = () => {
        const currentExperiences = currentTab === 'academic' ? academicExperiences : professionalExperiences;

        if (!searchTerm) return currentExperiences;

        const searchLower = searchTerm.toLowerCase();
        return currentExperiences.filter(exp =>
            exp.name?.toLowerCase().includes(searchLower) ||
            exp.description?.toLowerCase().includes(searchLower) ||
            exp.InstitutionName?.toLowerCase().includes(searchLower)
        );
    };

    const filteredExperiences = getFilteredExperiences();

    // Effects
    useEffect(() => {
        setExperiences(initialExperiences);
    }, [initialExperiences]);

    // Handlers
    const handleEdit = (experience: Experience) => {
        setData({
            ...experience,
            experience_categories_id: experience.experience_categories_id.toString(),
            attachment: null,
            references: experience.references || []
        });
        setCurrentFormType(experience.experience_categories_id === '2' ? 'academic' : 'professional');
        setIsFormOpen(true);
        setIsDetailOpen(false);
    };

    const handleDelete = async (experienceId: number) => {
        try {
            await axios.delete(`/experiences/${experienceId}`);
            const updatedExperiences = experiences.filter(exp => exp.id !== experienceId);
            setExperiences(updatedExperiences);
            onUpdate(updatedExperiences);
            setIsDetailOpen(false);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData();

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

            const response = data.id
                ? await axios.post(`/experiences/${data.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    params: { _method: 'PUT' }
                })
                : await axios.post('/experiences', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

            const updatedExperience = response.data.experience;
            const updatedExperiences = data.id
                ? experiences.map(exp => exp.id === updatedExperience.id ? updatedExperience : exp)
                : [...experiences, updatedExperience];

            setExperiences(updatedExperiences);
            onUpdate(updatedExperiences);

            toast({
                title: data.id ? t('experiences.success.updated') : t('experiences.success.created'),
                description: t('experiences.success.formDescription'),
            });

            resetForm();
        } catch (error: any) {
            toast({
                title: t('experiences.errors.title'),
                description: error.response?.data?.message || t('experiences.errors.save'),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
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
            experience_categories_id: currentFormType === 'academic' ? '2' : '1',
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
        updatedReferences[index][field] = value;
        setData('references', updatedReferences);
    };

    const handleOpenDetail = (experience: Experience) => {
        setSelectedExperience(experience);
        setIsDetailOpen(true);
    };

    const handleAddNew = () => {
        setCurrentFormType(currentTab as 'academic' | 'professional');
        setData({
            id: '',
            name: '',
            description: '',
            date_start: '',
            date_end: '',
            output: '',
            experience_categories_id: currentTab === 'academic' ? '2' : '1',
            comment: '',
            InstitutionName: '',
            attachment: null,
            references: []
        });
        setIsFormOpen(true);
    };

    // Composant de carte d'expérience compact
    const ExperienceCard: React.FC<{ experience: Experience }> = ({ experience: exp }) => {
        const isAcademic = exp.experience_categories_id === '2';

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full"
            >
                <Card
                    className="border-l-4 border-l-amber-400 dark:border-l-amber-500 hover:shadow-sm transition-all cursor-pointer bg-white dark:bg-gray-800"
                    onClick={() => handleOpenDetail(exp)}
                >
                    <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    {isAcademic ? (
                                        <GraduationCap className="w-4 h-4 text-amber-500" />
                                    ) : (
                                        <Briefcase className="w-4 h-4 text-purple-500" />
                                    )}
                                    <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                        {exp.name}
                                    </h3>
                                </div>

                                <div className="flex items-center gap-1 mb-1 text-xs text-gray-600 dark:text-gray-300">
                                    <Building2 className="w-3 h-3" />
                                    <span className="truncate">{exp.InstitutionName}</span>
                                </div>

                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                        {new Date(exp.date_start).toLocaleDateString('fr-FR', { month: '2-digit', year: '2-digit' })}
                                        {' - '}
                                        {exp.date_end
                                            ? new Date(exp.date_end).toLocaleDateString('fr-FR', { month: '2-digit', year: '2-digit' })
                                            : t('cvInterface.experience.ongoing')
                                        }
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    // Composant de détail d'expérience
    const ExperienceDetail: React.FC<{ experience: Experience }> = ({ experience: exp }) => {
        const isAcademic = exp.experience_categories_id === '2';

        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    {isAcademic ? (
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                            <GraduationCap className="w-3 h-3 mr-1" />
                            {t('cvInterface.experience.education')}
                        </Badge>
                    ) : (
                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            <Briefcase className="w-3 h-3 mr-1" />
                            {t('cvInterface.experience.professional')}
                        </Badge>
                    )}

                    <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(exp.date_start).toLocaleDateString('fr-FR')} - {exp.date_end ? new Date(exp.date_end).toLocaleDateString('fr-FR') : t('cvInterface.experience.ongoing')}
                    </div>
                </div>

                <div className="space-y-3">
                    <div>
                        <div className="flex items-center gap-1 mb-1">
                            <Building2 className="w-4 h-4 text-amber-500" />
                            <span className="font-medium text-sm">{exp.InstitutionName}</span>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t('cvInterface.experience.description')}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {exp.description}
                        </p>
                    </div>

                    {exp.output && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('cvInterface.experience.results')}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{exp.output}</p>
                        </div>
                    )}

                    {exp.attachment_path && (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <FileText className="w-4 h-4 text-amber-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">{t('cvInterface.experience.attachedDocument')}</span>
                            <Button variant="ghost" size="sm" onClick={() => window.open(exp.attachment_path, '_blank')}>
                                <Eye className="w-3 h-3" />
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 pt-4 border-t dark:border-gray-700">
                    <Button onClick={() => handleEdit(exp)} variant="outline" className="flex-1">
                        <Edit className="w-3 h-3 mr-1" />
                        {t('common.edit')}
                    </Button>
                    <Button onClick={() => handleDelete(exp.id)} variant="outline" className="text-red-600 hover:bg-red-50 flex-1">
                        <Trash2 className="w-3 h-3 mr-1" />
                        {t('common.delete')}
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-4">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                        {t('cvInterface.experience.title')}
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('cvInterface.experience.description')}
                    </p>
                </div>
                <Button onClick={handleAddNew} className="bg-amber-500 hover:bg-amber-600 text-white">
                    <Plus className="w-4 h-4 mr-1" />
                    {t('common.add')}
                </Button>
            </div>

            {/* Onglets principaux */}
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800">
                    <TabsTrigger value="academic" className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        {t('cvInterface.experience.education')} ({academicExperiences.length})
                    </TabsTrigger>
                    <TabsTrigger value="professional" className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        {t('cvInterface.experience.professional')} ({professionalExperiences.length})
                    </TabsTrigger>
                </TabsList>

                {/* Contenu des onglets */}
                <div className="mt-4">
                    {/* Barre de recherche */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder={t('cvInterface.experience.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <TabsContent value="academic" className="mt-0">
                        <div className="space-y-3">
                            <AnimatePresence>
                                {filteredExperiences.length > 0 ? (
                                    filteredExperiences.map((exp) => (
                                        <ExperienceCard key={exp.id} experience={exp} />
                                    ))
                                ) : (
                                    <Card className="text-center py-8">
                                        <CardContent>
                                            <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-500">
                                                {searchTerm ? t('cvInterface.experience.noEducationFound') : t('cvInterface.experience.noEducationAdded')}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </AnimatePresence>
                        </div>
                    </TabsContent>

                    <TabsContent value="professional" className="mt-0">
                        <div className="space-y-3">
                            <AnimatePresence>
                                {filteredExperiences.length > 0 ? (
                                    filteredExperiences.map((exp) => (
                                        <ExperienceCard key={exp.id} experience={exp} />
                                    ))
                                ) : (
                                    <Card className="text-center py-8">
                                        <CardContent>
                                            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-500">
                                                {searchTerm ? t('cvInterface.experience.noExperienceFound') : t('cvInterface.experience.noProfessionalExperienceAdded')}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </AnimatePresence>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>

            {/* Drawer pour les détails */}
            <Drawer open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DrawerContent className="max-h-[85vh]">
                    <DrawerHeader>
                        <DrawerTitle>{selectedExperience?.name}</DrawerTitle>
                        <DrawerClose />
                    </DrawerHeader>
                    <div className="px-4 pb-4">
                        {selectedExperience && <ExperienceDetail experience={selectedExperience} />}
                    </div>
                </DrawerContent>
            </Drawer>

            {/* Formulaire */}
            <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
                <SheetContent className="w-full max-w-2xl overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="flex items-center gap-2">
                            {currentFormType === 'academic' ? (
                                <GraduationCap className="w-5 h-5 text-amber-500" />
                            ) : (
                                <Briefcase className="w-5 h-5 text-purple-500" />
                            )}
                            {data.id
                                ? (currentFormType === 'academic' ? t('cvInterface.experience.editEducation') : t('cvInterface.experience.editExperience'))
                                : (currentFormType === 'academic' ? t('cvInterface.experience.newEducation') : t('cvInterface.experience.newExperience'))
                            }
                        </SheetTitle>
                        <SheetDescription>
                            {currentFormType === 'academic'
                                ? t('cvInterface.experience.academicDescription')
                                : t('cvInterface.experience.professionalDescription')
                            }
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Informations de base */}
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">
                                    {currentFormType === 'academic' ? t('cvInterface.experience.degreeName') : t('cvInterface.experience.positionTitle')}
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder={currentFormType === 'academic'
                                        ? t('cvInterface.experience.degreeExample')
                                        : t('cvInterface.experience.positionExample')
                                    }
                                />
                                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div>
                                <Label htmlFor="InstitutionName">
                                    {currentFormType === 'academic' ? t('cvInterface.experience.institution') : t('cvInterface.experience.company')}
                                </Label>
                                <Input
                                    id="InstitutionName"
                                    value={data.InstitutionName}
                                    onChange={(e) => setData('InstitutionName', e.target.value)}
                                    placeholder={currentFormType === 'academic'
                                        ? t('cvInterface.experience.institutionExample')
                                        : t('cvInterface.experience.companyExample')
                                    }
                                />
                                {errors.InstitutionName && <p className="text-sm text-red-600">{errors.InstitutionName}</p>}
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="date_start">{t('cvInterface.experience.startDate')}</Label>
                                    <Input
                                        id="date_start"
                                        type="date"
                                        value={data.date_start}
                                        onChange={(e) => setData('date_start', e.target.value)}
                                    />
                                    {errors.date_start && <p className="text-sm text-red-600">{errors.date_start}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="date_end">{t('cvInterface.experience.endDate')}</Label>
                                    <Input
                                        id="date_end"
                                        type="date"
                                        value={data.date_end || ''}
                                        onChange={(e) => setData('date_end', e.target.value)}
                                    />
                                    {errors.date_end && <p className="text-sm text-red-600">{errors.date_end}</p>}
                                </div>
                            </div>

                            {/* Type d'expérience (seulement pour professionnel) */}
                            {currentFormType === 'professional' && (
                                <div>
                                    <Label>{t('cvInterface.experience.experienceType')}</Label>
                                    <Select
                                        value={data.experience_categories_id}
                                        onValueChange={(value) => setData('experience_categories_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('cvInterface.experience.selectType')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories
                                                .filter(cat => cat.id !== 2) // Exclure "Formation"
                                                .map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Description */}
                            <div>
                                <Label htmlFor="description">{t('cvInterface.experience.description')}</Label>
                                <Textarea
                                    id="description"
                                    rows={4}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder={currentFormType === 'academic'
                                        ? t('cvInterface.experience.academicDescriptionPlaceholder')
                                        : t('cvInterface.experience.professionalDescriptionPlaceholder')
                                    }
                                />
                                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                            </div>

                            {/* Résultats */}
                            <div>
                                <Label htmlFor="output">
                                    {currentFormType === 'academic' ? t('cvInterface.experience.gradeResults') : t('cvInterface.experience.achievements')}
                                </Label>
                                <Input
                                    id="output"
                                    value={data.output}
                                    onChange={(e) => setData('output', e.target.value)}
                                    placeholder={currentFormType === 'academic'
                                        ? t('cvInterface.experience.gradeExample')
                                        : t('cvInterface.experience.achievementExample')
                                    }
                                />
                                {errors.output && <p className="text-sm text-red-600">{errors.output}</p>}
                            </div>

                            {/* Pièce jointe */}
                            <div>
                                <Label htmlFor="attachment">{t('cvInterface.experience.document')}</Label>
                                <Input
                                    id="attachment"
                                    type="file"
                                    onChange={(e) => setData('attachment', e.target.files?.[0] || null)}
                                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                />
                                {errors.attachment && <p className="text-sm text-red-600">{errors.attachment}</p>}
                            </div>

                            {/* Références */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>{t('cvInterface.experience.references')}</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddReference}
                                    >
                                        <Plus className="w-3 h-3 mr-1" />
                                        {t('common.add')}
                                    </Button>
                                </div>

                                {data.references.map((ref, index) => (
                                    <Card key={index} className="p-4">
                                        <div className="space-y-3">
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder={t('cvInterface.experience.fullName')}
                                                    value={ref.name}
                                                    onChange={(e) => handleReferenceChange(index, 'name', e.target.value)}
                                                    className="flex-1"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveReference(index)}
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                            <Input
                                                placeholder={t('cvInterface.experience.position')}
                                                value={ref.function}
                                                onChange={(e) => handleReferenceChange(index, 'function', e.target.value)}
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <Input
                                                    placeholder={t('cvInterface.experience.email')}
                                                    type="email"
                                                    value={ref.email}
                                                    onChange={(e) => handleReferenceChange(index, 'email', e.target.value)}
                                                />
                                                <Input
                                                    placeholder={t('cvInterface.experience.phone')}
                                                    value={ref.telephone}
                                                    onChange={(e) => handleReferenceChange(index, 'telephone', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-6 border-t">
                            <Button type="submit" disabled={isLoading} className="flex-1">
                                {isLoading ? t('common.saving') : (data.id ? t('common.update') : t('common.save'))}
                            </Button>
                            <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                                {t('common.cancel')}
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default ExperienceManager;