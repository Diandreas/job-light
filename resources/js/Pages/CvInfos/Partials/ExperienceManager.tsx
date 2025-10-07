import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from "@/Components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { useToast } from '@/Components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import {
    Briefcase, GraduationCap, Building2, Search, Plus, Edit, Trash2, X, Check,
    Upload, FileText, Users, Trophy, MessageSquare, Paperclip, Download, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from "axios";

interface Reference {
    id?: number;
    name: string;
    function: string;
    email: string;
    telephone: string;
}

interface Attachment {
    id?: number;
    name: string;
    path: string;
    format: string;
    size: number;
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
    attachment_id?: number;
    attachment?: Attachment;
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
    const { toast } = useToast();

    const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingExp, setEditingExp] = useState<Experience | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setExperiences(initialExperiences);
    }, [initialExperiences]);

    const filteredExperiences = experiences.filter(exp => {
        if (!searchTerm) return true;
        const s = searchTerm.toLowerCase();
        return exp.name?.toLowerCase().includes(s) ||
            exp.description?.toLowerCase().includes(s) ||
            exp.InstitutionName?.toLowerCase().includes(s);
    });

    const academicExps = filteredExperiences.filter(e => e.experience_categories_id === '2');
    const professionalExps = filteredExperiences.filter(e => e.experience_categories_id !== '2');

    const handleSave = async (expData: Partial<Experience>) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            Object.entries(expData).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    if (key === 'references') {
                        formData.append('references', JSON.stringify(value));
                    } else if (key !== 'attachment') {
                        formData.append(key, String(value));
                    }
                }
            });
            formData.append('user_id', String(auth.user.id));

            const response = expData.id
                ? await axios.post(`/experiences/${expData.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    params: { _method: 'PUT' }
                })
                : await axios.post('/experiences', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

            const updated = response.data.experience;
            const newExps = expData.id
                ? experiences.map(e => e.id === updated.id ? updated : e)
                : [...experiences, updated];

            setExperiences(newExps);
            onUpdate(newExps);
            toast({
                title: expData.id ? t('experiences.success.updated') : t('experiences.success.created'),
            });
            setIsDialogOpen(false);
            setEditingExp(null);
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

    const handleDelete = async (id: number) => {
        if (!confirm(t('experiences.manager.confirmDelete'))) return;
        try {
            await axios.delete(`/experiences/${id}`);
            const newExps = experiences.filter(e => e.id !== id);
            setExperiences(newExps);
            onUpdate(newExps);
            toast({ title: t('experiences.success.deleted') });
        } catch (error) {
            toast({
                title: t('experiences.errors.delete'),
                variant: "destructive",
            });
        }
    };

    const openDialog = (type: '1' | '2', exp?: Experience) => {
        setEditingExp(exp || {
            id: 0,
            name: '',
            InstitutionName: '',
            date_start: '',
            date_end: '',
            description: '',
            output: '',
            comment: '',
            experience_categories_id: type,
            references: []
        } as Experience);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-3 sm:space-y-4">
            {/* Header compact */}
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {t('cvInterface.experience.title')}
                    </h2>
                    <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1 px-2 py-0.5 sm:py-1 bg-amber-100 dark:bg-amber-900 rounded-full">
                            <GraduationCap className="w-3 h-3 text-amber-600" />
                            <span className="text-[10px] sm:text-xs font-medium text-amber-800 dark:text-amber-200">
                                {academicExps.length}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-0.5 sm:py-1 bg-purple-100 dark:bg-purple-900 rounded-full">
                            <Briefcase className="w-3 h-3 text-purple-600" />
                            <span className="text-[10px] sm:text-xs font-medium text-purple-800 dark:text-purple-200">
                                {professionalExps.length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Boutons d'ajout compacts */}
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        onClick={() => openDialog('2')}
                        size="sm"
                        className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 h-8 sm:h-9 text-xs sm:text-sm"
                    >
                        <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">{t('experiences.manager.buttons.addEducation')}</span>
                        <span className="sm:hidden">{t('experiences.manager.buttons.addEducationShort')}</span>
                    </Button>
                    <Button
                        onClick={() => openDialog('1')}
                        size="sm"
                        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 h-8 sm:h-9 text-xs sm:text-sm"
                    >
                        <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">{t('experiences.manager.buttons.addProfessional')}</span>
                        <span className="sm:hidden">{t('experiences.manager.buttons.addProfessionalShort')}</span>
                    </Button>
                </div>

                {/* Recherche */}
                <div className="relative">
                    <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t('experiences.manager.placeholders.searchExperience')}
                        className="pl-7 sm:pl-10 h-8 sm:h-9 text-xs sm:text-sm"
                    />
                    {searchTerm && (
                        <X
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 cursor-pointer text-gray-400 hover:text-gray-600"
                        />
                    )}
                </div>
            </div>

            {/* Liste des expériences */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {/* Formations */}
                {academicExps.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 px-2">
                            <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
                            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('experiences.manager.types.academic')}
                            </span>
                        </div>
                        <AnimatePresence>
                            {academicExps.map(exp => (
                                <ExperienceCard
                                    key={exp.id}
                                    exp={exp}
                                    onEdit={() => openDialog('2', exp)}
                                    onDelete={() => handleDelete(exp.id)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Expériences professionnelles */}
                {professionalExps.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 px-2">
                            <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('cvInterface.experience.professional')}
                            </span>
                        </div>
                        <AnimatePresence>
                            {professionalExps.map(exp => (
                                <ExperienceCard
                                    key={exp.id}
                                    exp={exp}
                                    onEdit={() => openDialog('1', exp)}
                                    onDelete={() => handleDelete(exp.id)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* État vide */}
                {filteredExperiences.length === 0 && (
                    <div className="text-center py-8 sm:py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Briefcase className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 text-gray-300" />
                        <p className="text-xs sm:text-sm text-gray-500">
                            {searchTerm ? t('experiences.manager.messages.noExperienceFound') : t('experiences.manager.messages.noExperienceAdded')}
                        </p>
                    </div>
                )}
            </div>

            {/* Dialog d'édition */}
            <ExperienceDialog
                isOpen={isDialogOpen}
                onClose={() => { setIsDialogOpen(false); setEditingExp(null); }}
                experience={editingExp}
                onSave={handleSave}
                isLoading={isLoading}
            />
        </div>
    );
};

// Carte d'expérience compacte
const ExperienceCard: React.FC<{
    exp: Experience;
    onEdit: () => void;
    onDelete: () => void;
}> = ({ exp, onEdit, onDelete }) => {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(false);
    const isAcademic = exp.experience_categories_id === '2';

    const formatDate = (date: string) => {
        const d = new Date(date);
        return d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    };

    const hasExtras = exp.output || exp.comment || exp.attachment || (exp.references && exp.references.length > 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="group bg-white dark:bg-gray-800 border rounded-lg p-2 sm:p-3 hover:shadow-md transition-all"
        >
            <div className="flex items-start gap-2">
                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-1.5 sm:mt-2 flex-shrink-0 ${isAcademic ? 'bg-amber-400' : 'bg-purple-400'}`} />
                <div className="flex-1 min-w-0">
                    {/* Titre */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white line-clamp-1">
                            {exp.name}
                        </h3>
                        <div className="flex gap-0.5 sm:gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <Button size="sm" variant="ghost" onClick={onEdit} className="h-6 w-6 sm:h-7 sm:w-7 p-0">
                                <Edit className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={onDelete} className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-red-500">
                                <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </Button>
                        </div>
                    </div>

                    {/* Institution et dates */}
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <div className="flex items-center gap-1 truncate">
                            <Building2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                            <span className="truncate">{exp.InstitutionName}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span className="whitespace-nowrap">
                                {formatDate(exp.date_start)} - {exp.date_end ? formatDate(exp.date_end) : t('cvInterface.experience.ongoing')}
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    {exp.description && (
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-1">
                            {exp.description}
                        </p>
                    )}

                    {/* Extras toggleables */}
                    {hasExtras && (
                        <>
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                            >
                                {expanded ? `▲ ${t('experiences.manager.buttons.showLess')}` : `▼ ${t('experiences.manager.buttons.moreInfo')}`}
                            </button>

                            {expanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="mt-2 pt-2 border-t space-y-1.5"
                                >
                                    {exp.output && (
                                        <div className="flex gap-1.5">
                                            <Trophy className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    {t('experiences.manager.labels.outputs')}
                                                </p>
                                                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                                    {exp.output}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {exp.comment && (
                                        <div className="flex gap-1.5">
                                            <MessageSquare className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    {t('experiences.manager.labels.comments')}
                                                </p>
                                                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                                    {exp.comment}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {exp.attachment && (
                                        <div className="flex items-center gap-1.5">
                                            <Paperclip className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-500" />
                                            <a
                                                href={exp.attachment.path}
                                                target="_blank"
                                                className="text-[10px] sm:text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                                            >
                                                <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                {exp.attachment.name}
                                            </a>
                                        </div>
                                    )}
                                    {exp.references && exp.references.length > 0 && (
                                        <div className="flex gap-1.5">
                                            <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    {t('experiences.manager.labels.references')} ({exp.references.length})
                                                </p>
                                                {exp.references.slice(0, 2).map((ref, i) => (
                                                    <p key={i} className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                                        {ref.name} - {ref.function}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// Dialog d'édition compact
const ExperienceDialog: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    experience: Experience | null;
    onSave: (data: Partial<Experience>) => void;
    isLoading: boolean;
}> = ({ isOpen, onClose, experience, onSave, isLoading }) => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [formData, setFormData] = useState<Partial<Experience>>(experience || {});
    const [showExtras, setShowExtras] = useState(false);
    const [references, setReferences] = useState<Reference[]>(experience?.references || []);
    const [uploadingFile, setUploadingFile] = useState(false);

    useEffect(() => {
        if (experience) {
            setFormData(experience);
            setReferences(experience.references || []);
        }
    }, [experience]);

    const handleFileUpload = async (file: File) => {
        setUploadingFile(true);
        try {
            const fd = new FormData();
            fd.append('attachment', file);
            const response = await axios.post('/api/attachments', fd);
            setFormData(prev => ({
                ...prev,
                attachment_id: response.data.attachment.id,
                attachment: response.data.attachment
            }));
            toast({ title: t('experiences.success.attachmentUploaded') });
        } catch (error) {
            toast({
                title: t('experiences.errors.attachmentUpload'),
                variant: "destructive",
            });
        } finally {
            setUploadingFile(false);
        }
    };

    const isAcademic = formData.experience_categories_id === '2';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-3 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
                        {isAcademic ? <GraduationCap className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                        {formData.id ? t('experiences.manager.editExperience') : (isAcademic ? t('experiences.manager.buttons.addEducation') : t('experiences.manager.buttons.addProfessional'))}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    {/* Titre */}
                    <div>
                        <label className="text-xs sm:text-sm font-medium mb-1 block">{t('experiences.manager.labels.title')}</label>
                        <Input
                            value={formData.name || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder={t('experiences.manager.placeholders.jobTitle')}
                            className="text-xs sm:text-sm h-8 sm:h-9"
                        />
                    </div>

                    {/* Type (si pro) */}
                    {!isAcademic && (
                        <div>
                            <label className="text-xs sm:text-sm font-medium mb-1 block">{t('experiences.manager.labels.type')}</label>
                            <Select
                                value={formData.experience_categories_id || '1'}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, experience_categories_id: value }))}
                            >
                                <SelectTrigger className="text-xs sm:text-sm h-8 sm:h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">{t('experiences.manager.types.employment')}</SelectItem>
                                    <SelectItem value="3">{t('experiences.manager.types.internship')}</SelectItem>
                                    <SelectItem value="4">{t('experiences.manager.types.freelance')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Institution */}
                    <div>
                        <label className="text-xs sm:text-sm font-medium mb-1 block">{t('experiences.manager.labels.institution')}</label>
                        <Input
                            value={formData.InstitutionName || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, InstitutionName: e.target.value }))}
                            placeholder={t('experiences.manager.placeholders.institution')}
                            className="text-xs sm:text-sm h-8 sm:h-9"
                        />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs sm:text-sm font-medium mb-1 block">{t('experiences.manager.labels.startDate')}</label>
                            <Input
                                type="date"
                                value={formData.date_start || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, date_start: e.target.value }))}
                                className="text-xs sm:text-sm h-8 sm:h-9"
                            />
                        </div>
                        <div>
                            <label className="text-xs sm:text-sm font-medium mb-1 block">{t('experiences.manager.labels.endDate')}</label>
                            <Input
                                type="date"
                                value={formData.date_end || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, date_end: e.target.value }))}
                                placeholder={t('experiences.manager.placeholders.ongoing')}
                                className="text-xs sm:text-sm h-8 sm:h-9"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-xs sm:text-sm font-medium mb-1 block">{t('experiences.manager.labels.description')}</label>
                        <Textarea
                            value={formData.description || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder={t('experiences.manager.placeholders.description')}
                            rows={2}
                            className="text-xs sm:text-sm"
                        />
                    </div>

                    {/* Toggle extras */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowExtras(!showExtras)}
                        className="text-xs w-full"
                    >
                        {showExtras ? '▲' : '▼'} {t('experiences.manager.buttons.showMore')}
                    </Button>

                    {/* Extras */}
                    {showExtras && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="space-y-3 pt-3 border-t"
                        >
                            {/* Résultats */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium mb-1">
                                    <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
                                    {t('experiences.manager.labels.outputs')}
                                </label>
                                <Textarea
                                    value={formData.output || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, output: e.target.value }))}
                                    placeholder={t('experiences.manager.placeholders.outputs')}
                                    rows={2}
                                    className="text-xs sm:text-sm"
                                />
                            </div>

                            {/* Commentaires */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium mb-1">
                                    <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                                    {t('experiences.manager.labels.comments')}
                                </label>
                                <Textarea
                                    value={formData.comment || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                                    placeholder={t('experiences.manager.placeholders.comments')}
                                    rows={2}
                                    className="text-xs sm:text-sm"
                                />
                            </div>

                            {/* Pièce jointe */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium mb-1">
                                    <Paperclip className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                                    {t('experiences.manager.labels.attachment')}
                                </label>
                                {formData.attachment ? (
                                    <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <FileText className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                            <span className="text-xs truncate">{formData.attachment.name}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button size="sm" variant="ghost" onClick={() => window.open(formData.attachment?.path)} className="h-6 w-6 p-0">
                                                <Download className="w-3 h-3" />
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => setFormData(prev => ({ ...prev, attachment_id: undefined, attachment: undefined }))} className="h-6 w-6 p-0 text-red-500">
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed rounded p-3 text-center">
                                        <input
                                            type="file"
                                            id="file-upload"
                                            className="hidden"
                                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                            disabled={uploadingFile}
                                        />
                                        <label htmlFor="file-upload" className="cursor-pointer">
                                            {uploadingFile ? (
                                                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                            ) : (
                                                <>
                                                    <Upload className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                                                    <span className="text-xs text-gray-500">{t('experiences.manager.buttons.uploadFile')}</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                )}
                            </div>

                            {/* Références */}
                            <ReferenceManager
                                references={references}
                                onChange={(refs) => {
                                    setReferences(refs);
                                    setFormData(prev => ({ ...prev, references: refs }));
                                }}
                            />
                        </motion.div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t">
                        <Button variant="outline" onClick={onClose} className="flex-1 h-8 sm:h-9 text-xs sm:text-sm">
                            <X className="w-3 h-3 mr-1" />
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={() => onSave(formData)}
                            disabled={isLoading || !formData.name || !formData.InstitutionName || !formData.date_start}
                            className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
                        >
                            <Check className="w-3 h-3 mr-1" />
                            {isLoading ? t('experiences.manager.buttons.saving') : t('common.save')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Gestionnaire de références
const ReferenceManager: React.FC<{
    references: Reference[];
    onChange: (refs: Reference[]) => void;
}> = ({ references, onChange }) => {
    const { t } = useTranslation();
    const [adding, setAdding] = useState(false);
    const [editIdx, setEditIdx] = useState<number | null>(null);
    const [form, setForm] = useState<Reference>({ name: '', function: '', email: '', telephone: '' });

    const handleSave = () => {
        if (editIdx !== null) {
            const updated = [...references];
            updated[editIdx] = form;
            onChange(updated);
            setEditIdx(null);
        } else {
            onChange([...references, form]);
        }
        setForm({ name: '', function: '', email: '', telephone: '' });
        setAdding(false);
    };

    const handleDelete = (idx: number) => {
        onChange(references.filter((_, i) => i !== idx));
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    {t('experiences.manager.labels.references')}
                </label>
                {!adding && (
                    <Button size="sm" variant="ghost" onClick={() => setAdding(true)} className="h-6 text-xs">
                        <Plus className="w-3 h-3 mr-1" />
                        {t('common.add')}
                    </Button>
                )}
            </div>

            {references.map((ref, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                    <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{ref.name} - {ref.function}</p>
                        {ref.email && <p className="text-gray-500 truncate">{ref.email}</p>}
                    </div>
                    <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => { setForm(ref); setEditIdx(idx); setAdding(true); }} className="h-5 w-5 p-0">
                            <Edit className="w-2.5 h-2.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(idx)} className="h-5 w-5 p-0 text-red-500">
                            <Trash2 className="w-2.5 h-2.5" />
                        </Button>
                    </div>
                </div>
            ))}

            {adding && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="space-y-2 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                >
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            value={form.name}
                            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder={t('experiences.manager.placeholders.referenceName')}
                            className="text-xs h-7"
                        />
                        <Input
                            value={form.function}
                            onChange={(e) => setForm(prev => ({ ...prev, function: e.target.value }))}
                            placeholder={t('experiences.manager.placeholders.referenceFunction')}
                            className="text-xs h-7"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                            placeholder={t('experiences.manager.placeholders.referenceEmail')}
                            className="text-xs h-7"
                        />
                        <Input
                            value={form.telephone}
                            onChange={(e) => setForm(prev => ({ ...prev, telephone: e.target.value }))}
                            placeholder={t('experiences.manager.placeholders.referencePhone')}
                            className="text-xs h-7"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setAdding(false); setEditIdx(null); setForm({ name: '', function: '', email: '', telephone: '' }); }} className="flex-1 h-7 text-xs">
                            <X className="w-3 h-3 mr-1" />
                            {t('common.cancel')}
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={!form.name || !form.function} className="flex-1 h-7 text-xs">
                            <Check className="w-3 h-3 mr-1" />
                            {t('common.save')}
                        </Button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default ExperienceManager;
