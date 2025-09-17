import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Textarea } from "@/Components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/Components/ui/select";
import { useToast } from '@/Components/ui/use-toast';
import {
    Briefcase,
    GraduationCap,
    Building2,
    Search,
    Plus,
    Edit,
    Trash2,
    Calendar,
    X,
    Check
} from 'lucide-react';
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

    // States ultra-compacts
    const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { toast } = useToast();

    // Données pour auto-complétion
    const jobTitles = [
        'Développeur Full Stack', 'Développeur Frontend', 'Développeur Backend',
        'Chef de Projet', 'Product Manager', 'UX/UI Designer', 'Data Analyst',
        'DevOps Engineer', 'Scrum Master', 'Business Analyst'
    ];

    const companies = [
        'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Spotify',
        'Airbnb', 'Uber', 'Tesla', 'OpenAI', 'GitHub', 'Stripe', 'Shopify'
    ];

    // Filtrer les expériences selon le terme de recherche
    const filteredExperiences = experiences.filter(exp => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return exp.name?.toLowerCase().includes(searchLower) ||
            exp.description?.toLowerCase().includes(searchLower) ||
            exp.InstitutionName?.toLowerCase().includes(searchLower);
    });

    // Séparer les expériences par type pour l'affichage
    const academicExperiences = filteredExperiences.filter(exp => exp.experience_categories_id === '2');
    const professionalExperiences = filteredExperiences.filter(exp => exp.experience_categories_id !== '2');

    // Effects
    useEffect(() => {
        setExperiences(initialExperiences);
    }, [initialExperiences]);

    // Handlers ultra-compacts
    const handleSave = async (experienceData: Partial<Experience>) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            Object.entries(experienceData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formData.append(key, String(value));
                }
            });

            const response = experienceData.id
                ? await axios.post(`/experiences/${experienceData.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    params: { _method: 'PUT' }
                })
                : await axios.post('/experiences', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

            const updatedExperience = response.data.experience;
            const updatedExperiences = experienceData.id
                ? experiences.map(exp => exp.id === updatedExperience.id ? updatedExperience : exp)
                : [...experiences, updatedExperience];

            setExperiences(updatedExperiences);
            onUpdate(updatedExperiences);

            toast({
                title: experienceData.id ? t('experiences.success.updated') : t('experiences.success.created'),
                description: t('experiences.success.formDescription'),
            });

            setIsAdding(false);
            setEditingId(null);
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

    const handleDelete = async (experienceId: number) => {
        try {
            await axios.delete(`/experiences/${experienceId}`);
            const updatedExperiences = experiences.filter(exp => exp.id !== experienceId);
            setExperiences(updatedExperiences);
            onUpdate(updatedExperiences);

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

    // Composant SmartInput avec auto-complétion
    const SmartInput: React.FC<{
        value: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        placeholder: string;
        suggestions: string[];
    }> = ({ value, onChange, placeholder, suggestions }) => {
        const [showSuggestions, setShowSuggestions] = useState(false);
        const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

        useEffect(() => {
            if (value.length > 1) {
                const filtered = suggestions.filter(s =>
                    s.toLowerCase().includes(value.toLowerCase())
                );
                setFilteredSuggestions(filtered.slice(0, 5));
                setShowSuggestions(filtered.length > 0);
            } else {
                setShowSuggestions(false);
            }
        }, [value, suggestions]);

        return (
            <div className="relative">
                <Input
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />

                {showSuggestions && filteredSuggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10"
                    >
                        {filteredSuggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    onChange({ target: { value: suggestion } } as React.ChangeEvent<HTMLInputElement>);
                                    setShowSuggestions(false);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </motion.div>
                )}
            </div>
        );
    };

    // Composant de carte d'expérience ultra-compacte avec champs avancés
    const ExperienceCard: React.FC<{
        experience: Experience;
        isEditing: boolean;
        onEdit: () => void;
        onSave: (data: Partial<Experience>) => void;
        onCancel: () => void;
        onDelete: (id: number) => void;
    }> = ({ experience: exp, isEditing, onEdit, onSave, onCancel, onDelete }) => {
        const [formData, setFormData] = useState(exp);
        const [showAdvanced, setShowAdvanced] = useState(false);
        const [attachment, setAttachment] = useState<File | null>(null);
        const isAcademic = exp.experience_categories_id === '2';

        if (isEditing) {
            return (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                    <div className="space-y-3">
                        {/* Ligne 1: Titre et Type */}
                        <div className="flex gap-2">
                            <SmartInput
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Titre du poste"
                                suggestions={jobTitles}
                            />
                            <Select
                                value={formData.experience_categories_id}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, experience_categories_id: value }))}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Pro</SelectItem>
                                    <SelectItem value="2">Formation</SelectItem>
                                    <SelectItem value="3">Stage</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Ligne 2: Institution et Dates */}
                        <div className="flex gap-2">
                            <SmartInput
                                value={formData.InstitutionName}
                                onChange={(e) => setFormData(prev => ({ ...prev, InstitutionName: e.target.value }))}
                                placeholder="Entreprise/Institution"
                                suggestions={companies}
                            />
                            <Input
                                type="date"
                                value={formData.date_start}
                                onChange={(e) => setFormData(prev => ({ ...prev, date_start: e.target.value }))}
                                className="w-32"
                            />
                            <Input
                                type="date"
                                value={formData.date_end || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, date_end: e.target.value }))}
                                placeholder="En cours"
                                className="w-32"
                            />
                        </div>

                        {/* Ligne 3: Description */}
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Description de l'expérience..."
                            rows={2}
                        />

                        {/* Bouton pour afficher les champs avancés */}
                        <div className="flex justify-center">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="text-xs text-gray-500 hover:text-gray-700"
                            >
                                {showAdvanced ? 'Masquer les détails' : 'Ajouter des détails'}
                                <span className="ml-1">{showAdvanced ? '▲' : '▼'}</span>
                            </Button>
                        </div>

                        {/* Champs avancés avec animation */}
                        <AnimatePresence>
                            {showAdvanced && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-600"
                                >
                                    {/* Résultats/Réalisations */}
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                                            {isAcademic ? 'Mention/Résultats' : 'Réalisations clés'}
                                        </label>
                                        <Input
                                            value={formData.output || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, output: e.target.value }))}
                                            placeholder={isAcademic ? 'Ex: Mention Bien' : 'Ex: +30% de performance'}
                                        />
                                    </div>

                                    {/* Pièce jointe */}
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                                            Document (optionnel)
                                        </label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="file"
                                                onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                                                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                                className="flex-1"
                                            />
                                            {formData.attachment_path && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.open(formData.attachment_path, '_blank')}
                                                >
                                                    Voir
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Références compactes */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                Références ({formData.references?.length || 0})
                                            </label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const newRef = { name: '', function: '', email: '', telephone: '' };
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        references: [...(prev.references || []), newRef]
                                                    }));
                                                }}
                                                className="text-xs"
                                            >
                                                <Plus className="w-3 h-3 mr-1" />
                                                Ajouter
                                            </Button>
                                        </div>

                                        {/* Liste des références */}
                                        <div className="space-y-2">
                                            {(formData.references || []).map((ref, index) => (
                                                <div key={index} className="p-2 bg-white dark:bg-gray-700 rounded border">
                                                    <div className="flex gap-2 mb-2">
                                                        <Input
                                                            placeholder="Nom complet"
                                                            value={ref.name}
                                                            onChange={(e) => {
                                                                const updatedRefs = [...(formData.references || [])];
                                                                updatedRefs[index].name = e.target.value;
                                                                setFormData(prev => ({ ...prev, references: updatedRefs }));
                                                            }}
                                                            className="flex-1"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                const updatedRefs = (formData.references || []).filter((_, i) => i !== index);
                                                                setFormData(prev => ({ ...prev, references: updatedRefs }));
                                                            }}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Input
                                                            placeholder="Poste"
                                                            value={ref.function}
                                                            onChange={(e) => {
                                                                const updatedRefs = [...(formData.references || [])];
                                                                updatedRefs[index].function = e.target.value;
                                                                setFormData(prev => ({ ...prev, references: updatedRefs }));
                                                            }}
                                                        />
                                                        <Input
                                                            placeholder="Email"
                                                            type="email"
                                                            value={ref.email}
                                                            onChange={(e) => {
                                                                const updatedRefs = [...(formData.references || [])];
                                                                updatedRefs[index].email = e.target.value;
                                                                setFormData(prev => ({ ...prev, references: updatedRefs }));
                                                            }}
                                                        />
                                                    </div>
                                                    <Input
                                                        placeholder="Téléphone"
                                                        value={ref.telephone}
                                                        onChange={(e) => {
                                                            const updatedRefs = [...(formData.references || [])];
                                                            updatedRefs[index].telephone = e.target.value;
                                                            setFormData(prev => ({ ...prev, references: updatedRefs }));
                                                        }}
                                                        className="mt-2"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Actions */}
                        <div className="flex gap-2 justify-end pt-3 border-t border-gray-200 dark:border-gray-600">
                            <Button size="sm" variant="outline" onClick={onCancel}>
                                <X className="w-3 h-3 mr-1" />
                                Annuler
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => {
                                    const dataToSave = { ...formData };
                                    if (attachment) {
                                        // Ici vous pouvez gérer l'upload du fichier
                                        // dataToSave.attachment = attachment;
                                    }
                                    onSave(dataToSave);
                                }}
                                disabled={isLoading}
                            >
                                <Check className="w-3 h-3 mr-1" />
                                {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            );
        }

        return (
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all"
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        {/* Header compact */}
                        <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${isAcademic ? 'bg-amber-400' : 'bg-purple-400'}`} />
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                {exp.name}
                            </h3>
                        </div>

                        {/* Institution et dates sur une ligne */}
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 mb-2">
                            <span className="truncate">{exp.InstitutionName}</span>
                            <span className="text-gray-400">•</span>
                            <span className="whitespace-nowrap">
                                {new Date(exp.date_start).toLocaleDateString('fr-FR', { month: '2-digit', year: '2-digit' })}
                                {' - '}
                                {exp.date_end
                                    ? new Date(exp.date_end).toLocaleDateString('fr-FR', { month: '2-digit', year: '2-digit' })
                                    : t('cvInterface.experience.ongoing')
                                }
                            </span>
                        </div>

                        {/* Description tronquée */}
                        {exp.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                {exp.description}
                            </p>
                        )}

                        {/* Indicateurs d'éléments supplémentaires */}
                        <div className="flex items-center gap-2 mt-2">
                            {exp.output && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 rounded-full">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    <span className="text-xs text-green-700 dark:text-green-300">Résultats</span>
                                </div>
                            )}
                            {exp.attachment_path && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    <span className="text-xs text-blue-700 dark:text-blue-300">Document</span>
                                </div>
                            )}
                            {exp.references && exp.references.length > 0 && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                    <span className="text-xs text-purple-700 dark:text-purple-300">
                                        {exp.references.length} référence{exp.references.length > 1 ? 's' : ''}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions au hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-2">
                        <Button size="sm" variant="ghost" onClick={onEdit} className="h-8 w-8 p-0">
                            <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onDelete(exp.id)} className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        );
    };

    // Formulaire d'ajout inline ultra-compact avec champs avancés
    const InlineExperienceForm: React.FC<{
        onSave: (data: Partial<Experience>) => void;
        onCancel: () => void;
    }> = ({ onSave, onCancel }) => {
        const [formData, setFormData] = useState<Partial<Experience>>({
            name: '',
            InstitutionName: '',
            date_start: '',
            date_end: '',
            description: '',
            experience_categories_id: '1',
            output: '',
            references: []
        });
        const [showAdvanced, setShowAdvanced] = useState(false);
        const [attachment, setAttachment] = useState<File | null>(null);
        const isAcademic = formData.experience_categories_id === '2';

        return (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4"
            >
                <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                        <Plus className="w-4 h-4 text-amber-600" />
                        <h3 className="font-semibold text-amber-800 dark:text-amber-200">Ajouter une expérience</h3>
                    </div>

                    {/* Ligne 1: Titre et Type */}
                    <div className="flex gap-2">
                        <SmartInput
                            value={formData.name || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Ex: Développeur Full Stack"
                            suggestions={jobTitles}
                        />
                        <Select
                            value={formData.experience_categories_id || '1'}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, experience_categories_id: value }))}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Pro</SelectItem>
                                <SelectItem value="2">Formation</SelectItem>
                                <SelectItem value="3">Stage</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Ligne 2: Institution et Dates */}
                    <div className="flex gap-2">
                        <SmartInput
                            value={formData.InstitutionName || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, InstitutionName: e.target.value }))}
                            placeholder="Ex: Google Inc."
                            suggestions={companies}
                        />
                        <Input
                            type="date"
                            value={formData.date_start || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, date_start: e.target.value }))}
                            className="w-32"
                        />
                        <Input
                            type="date"
                            value={formData.date_end || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, date_end: e.target.value }))}
                            placeholder="En cours"
                            className="w-32"
                        />
                    </div>

                    {/* Ligne 3: Description */}
                    <Textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description de l'expérience..."
                        rows={2}
                    />

                    {/* Bouton pour afficher les champs avancés */}
                    <div className="flex justify-center">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="text-xs text-amber-600 hover:text-amber-700"
                        >
                            {showAdvanced ? 'Masquer les détails' : 'Ajouter des détails'}
                            <span className="ml-1">{showAdvanced ? '▲' : '▼'}</span>
                        </Button>
                    </div>

                    {/* Champs avancés avec animation */}
                    <AnimatePresence>
                        {showAdvanced && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3 pt-3 border-t border-amber-200 dark:border-amber-600"
                            >
                                {/* Résultats/Réalisations */}
                                <div>
                                    <label className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1 block">
                                        {isAcademic ? 'Mention/Résultats' : 'Réalisations clés'}
                                    </label>
                                    <Input
                                        value={formData.output || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, output: e.target.value }))}
                                        placeholder={isAcademic ? 'Ex: Mention Bien' : 'Ex: +30% de performance'}
                                    />
                                </div>

                                {/* Pièce jointe */}
                                <div>
                                    <label className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1 block">
                                        Document (optionnel)
                                    </label>
                                    <Input
                                        type="file"
                                        onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                    />
                                </div>

                                {/* Références compactes */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-medium text-amber-700 dark:text-amber-300">
                                            Références ({formData.references?.length || 0})
                                        </label>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                const newRef = { name: '', function: '', email: '', telephone: '' };
                                                setFormData(prev => ({
                                                    ...prev,
                                                    references: [...(prev.references || []), newRef]
                                                }));
                                            }}
                                            className="text-xs text-amber-600 hover:text-amber-700"
                                        >
                                            <Plus className="w-3 h-3 mr-1" />
                                            Ajouter
                                        </Button>
                                    </div>

                                    {/* Liste des références */}
                                    <div className="space-y-2">
                                        {(formData.references || []).map((ref, index) => (
                                            <div key={index} className="p-2 bg-white dark:bg-gray-700 rounded border">
                                                <div className="flex gap-2 mb-2">
                                                    <Input
                                                        placeholder="Nom complet"
                                                        value={ref.name}
                                                        onChange={(e) => {
                                                            const updatedRefs = [...(formData.references || [])];
                                                            updatedRefs[index].name = e.target.value;
                                                            setFormData(prev => ({ ...prev, references: updatedRefs }));
                                                        }}
                                                        className="flex-1"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            const updatedRefs = (formData.references || []).filter((_, i) => i !== index);
                                                            setFormData(prev => ({ ...prev, references: updatedRefs }));
                                                        }}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Input
                                                        placeholder="Poste"
                                                        value={ref.function}
                                                        onChange={(e) => {
                                                            const updatedRefs = [...(formData.references || [])];
                                                            updatedRefs[index].function = e.target.value;
                                                            setFormData(prev => ({ ...prev, references: updatedRefs }));
                                                        }}
                                                    />
                                                    <Input
                                                        placeholder="Email"
                                                        type="email"
                                                        value={ref.email}
                                                        onChange={(e) => {
                                                            const updatedRefs = [...(formData.references || [])];
                                                            updatedRefs[index].email = e.target.value;
                                                            setFormData(prev => ({ ...prev, references: updatedRefs }));
                                                        }}
                                                    />
                                                </div>
                                                <Input
                                                    placeholder="Téléphone"
                                                    value={ref.telephone}
                                                    onChange={(e) => {
                                                        const updatedRefs = [...(formData.references || [])];
                                                        updatedRefs[index].telephone = e.target.value;
                                                        setFormData(prev => ({ ...prev, references: updatedRefs }));
                                                    }}
                                                    className="mt-2"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Actions */}
                    <div className="flex gap-2 justify-end pt-3 border-t border-amber-200 dark:border-amber-600">
                        <Button variant="outline" onClick={onCancel} className="flex-1">
                            <X className="w-3 h-3 mr-1" />
                            Annuler
                        </Button>
                        <Button
                            onClick={() => {
                                const dataToSave = { ...formData };
                                if (attachment) {
                                    // Ici vous pouvez gérer l'upload du fichier
                                    // dataToSave.attachment = attachment;
                                }
                                onSave(dataToSave);
                            }}
                            disabled={isLoading || !formData.name || !formData.InstitutionName || !formData.date_start}
                            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                        >
                            <Check className="w-3 h-3 mr-1" />
                            {isLoading ? 'Ajout...' : 'Ajouter'}
                        </Button>
                    </div>
                </div>
            </motion.div>
        );
    };

    // Bouton d'ajout minimaliste
    const AddExperienceButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all group"
        >
            <div className="flex items-center justify-center gap-2 text-gray-500 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                <Plus className="w-4 h-4" />
                <span className="font-medium">Ajouter une expérience</span>
            </div>
        </motion.button>
    );

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            {/* Header ultra-compact */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {t('cvInterface.experience.title')}
                    </h1>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900 rounded-full">
                            <GraduationCap className="w-3 h-3 text-amber-600" />
                            <span className="text-xs font-medium text-amber-800 dark:text-amber-200">
                                Formation ({academicExperiences.length})
                            </span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded-full">
                            <Briefcase className="w-3 h-3 text-purple-600" />
                            <span className="text-xs font-medium text-purple-800 dark:text-purple-200">
                                Pro ({professionalExperiences.length})
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barre de recherche améliorée */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                    type="text"
                    placeholder="Rechercher par nom, institution ou description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 border-0 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 rounded-xl shadow-sm focus:shadow-md transition-all"
                />
                {searchTerm && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    >
                        <X className="h-3 w-3" />
                    </Button>
                )}
            </div>

            {/* Liste des expériences avec sections */}
            <div className="space-y-6">
                {/* Section Formation */}
                {academicExperiences.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-amber-500" />
                            <h2 className="font-semibold text-gray-900 dark:text-white">Formation</h2>
                        </div>
                        <div className="space-y-3">
                            <AnimatePresence>
                                {academicExperiences.map((exp) => (
                                    <ExperienceCard
                                        key={exp.id}
                                        experience={exp}
                                        isEditing={editingId === exp.id}
                                        onEdit={() => setEditingId(exp.id)}
                                        onSave={(data) => handleSave({ ...data, id: exp.id })}
                                        onCancel={() => setEditingId(null)}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* Section Professionnel */}
                {professionalExperiences.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-purple-500" />
                            <h2 className="font-semibold text-gray-900 dark:text-white">Expérience Professionnelle</h2>
                        </div>
                        <div className="space-y-3">
                            <AnimatePresence>
                                {professionalExperiences.map((exp) => (
                                    <ExperienceCard
                                        key={exp.id}
                                        experience={exp}
                                        isEditing={editingId === exp.id}
                                        onEdit={() => setEditingId(exp.id)}
                                        onSave={(data) => handleSave({ ...data, id: exp.id })}
                                        onCancel={() => setEditingId(null)}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* Formulaire d'ajout inline */}
                {isAdding ? (
                    <InlineExperienceForm
                        onSave={(data) => handleSave(data)}
                        onCancel={() => setIsAdding(false)}
                    />
                ) : (
                    <AddExperienceButton onClick={() => setIsAdding(true)} />
                )}

                {/* État vide */}
                {filteredExperiences.length === 0 && !isAdding && (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
                            <Briefcase className="w-full h-full" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            {searchTerm ? 'Aucune expérience trouvée' : 'Aucune expérience ajoutée'}
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {searchTerm
                                ? 'Essayez avec d\'autres mots-clés'
                                : 'Commencez par ajouter votre première expérience'
                            }
                        </p>
                        {!searchTerm && (
                            <Button onClick={() => setIsAdding(true)} className="bg-gradient-to-r from-amber-500 to-orange-500">
                                <Plus className="w-4 h-4 mr-2" />
                                Ajouter une expérience
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExperienceManager;