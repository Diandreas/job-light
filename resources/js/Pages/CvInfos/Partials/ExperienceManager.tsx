// ExperienceManager.tsx - Luxury Update
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
import AIRephraseButton from '@/Components/AIRephraseButton';
import RichTextEditor from '@/Components/RichTextEditor';

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
        const normalizedExperiences = initialExperiences.map(exp => ({
            ...exp,
            experience_categories_id: String(exp.experience_categories_id)
        }));
        setExperiences(normalizedExperiences);
    }, [initialExperiences]);

    const filteredExperiences = experiences.filter(exp => {
        if (!searchTerm) return true;
        const s = searchTerm.toLowerCase();
        return exp.name?.toLowerCase().includes(s) ||
            exp.description?.toLowerCase().includes(s) ||
            exp.InstitutionName?.toLowerCase().includes(s);
    });

    const academicExps = filteredExperiences.filter(e => String(e.experience_categories_id) === '2');
    const professionalExps = filteredExperiences.filter(e => String(e.experience_categories_id) !== '2');

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

            const updated = {
                ...response.data.experience,
                experience_categories_id: String(response.data.experience.experience_categories_id)
            };
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
        <div className="space-y-4">
            {/* Header with Luxury Style */}
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white truncate">
                        {t('cvInterface.experience.title')}
                    </h2>
                    <div className="flex gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full border border-neutral-200 dark:border-neutral-700">
                            <GraduationCap className="w-3.5 h-3.5 text-luxury-gold-500" />
                            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                {academicExps.length}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full border border-neutral-200 dark:border-neutral-700">
                            <Briefcase className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                {professionalExps.length}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button
                        onClick={() => openDialog('2')}
                        size="sm"
                        className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 h-9"
                    >
                        <GraduationCap className="w-4 h-4 mr-2 text-luxury-gold-400" />
                        <span className="hidden sm:inline">{t('experiences.manager.buttons.addEducation')}</span>
                        <span className="sm:hidden">{t('experiences.manager.buttons.addEducationShort')}</span>
                    </Button>
                    <Button
                        onClick={() => openDialog('1')}
                        size="sm"
                        variant="outline"
                        className="border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800 h-9"
                    >
                        <Briefcase className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">{t('experiences.manager.buttons.addProfessional')}</span>
                        <span className="sm:hidden">{t('experiences.manager.buttons.addProfessionalShort')}</span>
                    </Button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t('experiences.manager.placeholders.searchExperience')}
                        className="pl-9 h-9 text-sm bg-neutral-50 dark:bg-neutral-800 border-transparent focus:bg-white dark:focus:bg-neutral-900 transition-colors"
                    />
                    {searchTerm && (
                        <X
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 cursor-pointer text-neutral-400 hover:text-neutral-600"
                        />
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {academicExps.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <GraduationCap className="w-4 h-4 text-luxury-gold-500" />
                            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
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

                {professionalExps.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <Briefcase className="w-4 h-4 text-neutral-500" />
                            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
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

                {filteredExperiences.length === 0 && (
                    <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800">
                        <Briefcase className="w-12 h-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {searchTerm ? t('experiences.manager.messages.noExperienceFound') : t('experiences.manager.messages.noExperienceAdded')}
                        </p>
                    </div>
                )}
            </div>

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

const ExperienceCard: React.FC<{
    exp: Experience;
    onEdit: () => void;
    onDelete: () => void;
}> = ({ exp, onEdit, onDelete }) => {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(false);
    const isAcademic = String(exp.experience_categories_id) === '2';

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
            className="group bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-4 hover:shadow-md hover:border-luxury-gold-200 dark:hover:border-luxury-gold-900/30 transition-all"
        >
            <div className="flex items-start gap-4">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${isAcademic ? 'bg-luxury-gold-400' : 'bg-neutral-400'}`} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                        <h3 className="font-semibold text-base text-neutral-900 dark:text-white line-clamp-1">
                            {exp.name}
                        </h3>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <Button size="sm" variant="ghost" onClick={onEdit} className="h-8 w-8 p-0 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                <Edit className="w-4 h-4 text-neutral-500" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={onDelete} className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                        <div className="flex items-center gap-1.5 truncate">
                            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate font-medium">{exp.InstitutionName}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="whitespace-nowrap">
                                {formatDate(exp.date_start)} - {exp.date_end ? formatDate(exp.date_end) : <span className="text-luxury-gold-600">{t('cvInterface.experience.ongoing')}</span>}
                            </span>
                        </div>
                    </div>

                    {exp.description && (
                        <div className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2 mb-2 prose prose-sm dark:prose-invert max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: exp.description }} />
                        </div>
                    )}

                    {hasExtras && (
                        <>
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="text-xs font-medium text-neutral-500 hover:text-luxury-gold-600 dark:text-neutral-400 transition-colors flex items-center gap-1 mt-2"
                            >
                                {expanded ? t('experiences.manager.buttons.showLess') : t('experiences.manager.buttons.moreInfo')}
                                {expanded ? <span className="transform rotate-180">▼</span> : <span>▼</span>}
                            </button>

                            <AnimatePresence>
                                {expanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-3 overflow-hidden"
                                    >
                                        {exp.output && (
                                            <div className="flex gap-2">
                                                <Trophy className="w-4 h-4 text-luxury-gold-500 mt-0.5 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium text-neutral-900 dark:text-white">
                                                        {t('experiences.manager.labels.outputs')}
                                                    </p>
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                        {exp.output}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {exp.comment && (
                                            <div className="flex gap-2">
                                                <MessageSquare className="w-4 h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium text-neutral-900 dark:text-white">
                                                        {t('experiences.manager.labels.comments')}
                                                    </p>
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                        {exp.comment}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {exp.attachment && (
                                            <div className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                                                <Paperclip className="w-4 h-4 text-neutral-500" />
                                                <a
                                                    href={exp.attachment.path}
                                                    target="_blank"
                                                    className="text-sm text-neutral-900 dark:text-white hover:underline flex items-center gap-1.5"
                                                >
                                                    <FileText className="w-3.5 h-3.5" />
                                                    {exp.attachment.name}
                                                </a>
                                            </div>
                                        )}
                                        {exp.references && exp.references.length > 0 && (
                                            <div className="flex gap-2">
                                                <Users className="w-4 h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-medium text-neutral-900 dark:text-white mb-1">
                                                        {t('experiences.manager.labels.references')}
                                                    </p>
                                                    <div className="space-y-1">
                                                        {exp.references.map((ref, i) => (
                                                            <div key={i} className="text-sm text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 p-2 rounded">
                                                                <span className="font-medium text-neutral-900 dark:text-white">{ref.name}</span>
                                                                <span className="mx-1.5">•</span>
                                                                <span>{ref.function}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

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

    const isAcademic = String(formData.experience_categories_id) === '2';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 gap-0 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                <DialogHeader className="p-6 border-b border-neutral-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10">
                    <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-neutral-900 dark:text-white">
                        {isAcademic ? <GraduationCap className="w-5 h-5 text-luxury-gold-500" /> : <Briefcase className="w-5 h-5 text-neutral-500" />}
                        {formData.id ? t('experiences.manager.editExperience') : (isAcademic ? t('experiences.manager.buttons.addEducation') : t('experiences.manager.buttons.addProfessional'))}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-5">
                    <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                            {t('experiences.manager.labels.title')}
                        </label>
                        <Input
                            value={formData.name || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder={t('experiences.manager.placeholders.jobTitle')}
                            className="bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                        />
                    </div>

                    {!isAcademic && (
                        <div>
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                                {t('experiences.manager.labels.type')}
                            </label>
                            <Select
                                value={String(formData.experience_categories_id || '1')}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, experience_categories_id: value }))}
                            >
                                <SelectTrigger className="bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                                    <SelectValue placeholder={t('experiences.manager.placeholders.selectType')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">{t('experiences.manager.types.employment')}</SelectItem>
                                    <SelectItem value="3">{t('experiences.manager.types.internship')}</SelectItem>
                                    <SelectItem value="4">{t('experiences.manager.types.freelance')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                            {t('experiences.manager.labels.institution')}
                        </label>
                        <Input
                            value={formData.InstitutionName || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, InstitutionName: e.target.value }))}
                            placeholder={t('experiences.manager.placeholders.institution')}
                            className="bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                                {t('experiences.manager.labels.startDate')}
                            </label>
                            <Input
                                type="date"
                                value={formData.date_start || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, date_start: e.target.value }))}
                                className="bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                                {t('experiences.manager.labels.endDate')}
                            </label>
                            <Input
                                type="date"
                                value={formData.date_end || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, date_end: e.target.value }))}
                                placeholder={t('experiences.manager.placeholders.ongoing')}
                                className="bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                {t('experiences.manager.labels.description')}
                            </label>
                            <AIRephraseButton
                                text={formData.description || ''}
                                onRephrased={(newText) => setFormData(prev => ({ ...prev, description: newText }))}
                            />
                        </div>
                        <RichTextEditor
                            value={formData.description || ''}
                            onChange={(newText) => setFormData(prev => ({ ...prev, description: newText }))}
                            placeholder={t('experiences.manager.placeholders.description')}
                        />
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowExtras(!showExtras)}
                        className="w-full text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                    >
                        {showExtras ? '▲' : '▼'} {t('experiences.manager.buttons.showMore')}
                    </Button>

                    {showExtras && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800"
                        >
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                    <Trophy className="w-4 h-4 text-luxury-gold-500" />
                                    {t('experiences.manager.labels.outputs')}
                                </label>
                                <Textarea
                                    value={formData.output || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, output: e.target.value }))}
                                    placeholder={t('experiences.manager.placeholders.outputs')}
                                    rows={3}
                                    className="bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                    <MessageSquare className="w-4 h-4 text-neutral-500" />
                                    {t('experiences.manager.labels.comments')}
                                </label>
                                <Textarea
                                    value={formData.comment || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                                    placeholder={t('experiences.manager.placeholders.comments')}
                                    rows={3}
                                    className="bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                    <Paperclip className="w-4 h-4 text-neutral-500" />
                                    {t('experiences.manager.labels.attachment')}
                                </label>
                                {formData.attachment ? (
                                    <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <FileText className="w-4 h-4 flex-shrink-0 text-neutral-500" />
                                            <span className="text-sm truncate font-medium text-neutral-700 dark:text-neutral-300">
                                                {formData.attachment.name}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => window.open(formData.attachment?.path)} className="h-8 w-8 p-0">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => setFormData(prev => ({ ...prev, attachment_id: undefined, attachment: undefined }))} className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-lg p-6 text-center hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                                        <input
                                            type="file"
                                            id="file-upload"
                                            className="hidden"
                                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                            disabled={uploadingFile}
                                        />
                                        <label htmlFor="file-upload" className="cursor-pointer block">
                                            {uploadingFile ? (
                                                <div className="w-6 h-6 border-2 border-neutral-900 dark:border-white border-t-transparent rounded-full animate-spin mx-auto" />
                                            ) : (
                                                <>
                                                    <Upload className="w-6 h-6 mx-auto mb-2 text-neutral-400" />
                                                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                                        {t('experiences.manager.buttons.uploadFile')}
                                                    </span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                )}
                            </div>

                            <ReferenceManager
                                references={references}
                                onChange={(refs) => {
                                    setReferences(refs);
                                    setFormData(prev => ({ ...prev, references: refs }));
                                }}
                            />
                        </motion.div>
                    )}
                </div>

                <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 flex gap-3 sticky bottom-0 z-10 w-full">
                    <Button variant="outline" onClick={onClose} className="flex-1 border-neutral-200 dark:border-neutral-700 hover:bg-white dark:hover:bg-neutral-800">
                        {t('common.cancel')}
                    </Button>
                    <Button
                        onClick={() => onSave(formData)}
                        disabled={isLoading || !formData.name || !formData.InstitutionName || !formData.date_start}
                        className="flex-1 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
                    >
                        {isLoading ? <span className="animate-pulse">{t('experiences.manager.buttons.saving')}</span> : t('common.save')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

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
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    <Users className="w-4 h-4 text-neutral-500" />
                    {t('experiences.manager.labels.references')}
                </label>
                {!adding && (
                    <Button size="sm" variant="ghost" onClick={() => setAdding(true)} className="h-7 text-xs font-medium text-luxury-gold-600 hover:bg-luxury-gold-50 dark:hover:bg-luxury-gold-900/20">
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        {t('common.add')}
                    </Button>
                )}
            </div>

            {references.map((ref, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-100 dark:border-neutral-700">
                    <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-neutral-900 dark:text-white truncate">{ref.name} - {ref.function}</p>
                        {ref.email && <p className="text-xs text-neutral-500 truncate">{ref.email}</p>}
                    </div>
                    <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => { setForm(ref); setEditIdx(idx); setAdding(true); }} className="h-7 w-7 p-0">
                            <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(idx)} className="h-7 w-7 p-0 text-red-500 hover:text-red-700">
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            ))}

            {adding && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="space-y-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700"
                >
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            value={form.name}
                            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder={t('experiences.manager.placeholders.referenceName')}
                            className="bg-white dark:bg-neutral-900 h-9"
                        />
                        <Input
                            value={form.function}
                            onChange={(e) => setForm(prev => ({ ...prev, function: e.target.value }))}
                            placeholder={t('experiences.manager.placeholders.referenceFunction')}
                            className="bg-white dark:bg-neutral-900 h-9"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                            placeholder={t('experiences.manager.placeholders.referenceEmail')}
                            className="bg-white dark:bg-neutral-900 h-9"
                        />
                        <Input
                            value={form.telephone}
                            onChange={(e) => setForm(prev => ({ ...prev, telephone: e.target.value }))}
                            placeholder={t('experiences.manager.placeholders.referencePhone')}
                            className="bg-white dark:bg-neutral-900 h-9"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setAdding(false); setEditIdx(null); setForm({ name: '', function: '', email: '', telephone: '' }); }}
                            className="h-8"
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={!form.name || !form.function}
                            className="h-8 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
                        >
                            {t('common.save')}
                        </Button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default ExperienceManager;
