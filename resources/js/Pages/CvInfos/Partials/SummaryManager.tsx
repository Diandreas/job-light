import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { useToast } from '@/Components/ui/use-toast';
import { Textarea } from "@/Components/ui/textarea";
import {
    TrashIcon, PencilIcon, PlusIcon, XIcon,
    Wand2, BookOpen, ChevronRight, CheckCircle
} from 'lucide-react';
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { useTheme } from 'next-themes';

interface Summary {
    id: number;
    name: string;
    description: string;
}

interface Props {
    auth: any;
    summaries: Summary[];
    selectedSummary: Summary[];
    onUpdate: (summaries: Summary[]) => void;
}

const SummaryManager: React.FC<Props> = ({ auth, summaries: initialSummaries, selectedSummary: initialSelectedSummary, onUpdate }) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const [summaries, setSummaries] = useState(initialSummaries);
    const [selectedSummary, setSelectedSummary] = useState(initialSelectedSummary);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [filteredSummaries, setFilteredSummaries] = useState(initialSummaries);
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();

    const templates = {
        student: {
            name: t('templates.student.name'),
            description: t('templates.student.description')
        },
        archivist: {
            name: t('templates.archivist.name'),
            description: t('templates.archivist.description')
        },
        beginner: {
            name: t('templates.beginner.name'),
            description: t('templates.beginner.description')
        }
    };

    const { data, setData, processing, reset } = useForm({
        id: null,
        name: '',
        description: '',
    });

    useEffect(() => {
        setFilteredSummaries(
            summaries.filter((summary) =>
                summary.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [summaries, searchQuery]);

    useEffect(() => {
        setSummaries(initialSummaries);
        setSelectedSummary(initialSelectedSummary);
    }, [initialSummaries, initialSelectedSummary]);

    const showToast = (title: string, description: string, variant: "default" | "destructive" = "default") => {
        toast({
            title,
            description,
            variant,
        });
    };

    const handleTemplateSelect = (template) => {
        setData({
            ...data,
            name: template.name,
            description: template.description
        });
    };

    const handleSelectSummary = async (summaryId) => {
        try {
            const response = await axios.post(route('summaries.select', summaryId));
            const updatedSummary = response.data.summary;
            const newSelectedSummary = [updatedSummary];

            setSelectedSummary(newSelectedSummary);
            setSummaries(prev => prev.map(summary =>
                summary.id === updatedSummary.id ? updatedSummary : summary
            ));

            onUpdate(newSelectedSummary);
            showToast(t('toast.success.title'), t('toast.success.selected'));
        } catch (error) {
            showToast(t('toast.error.title'), t('toast.error.select'), "destructive");
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(route('summaries.store'), data);
            const newSummary = response.data.summary;
            const updatedSummaries = [...summaries, newSummary];

            setSummaries(updatedSummaries);
            const newSelectedSummary = [newSummary];
            setSelectedSummary(newSelectedSummary);
            onUpdate(newSelectedSummary);

            showToast(t('toast.success.title'), t('toast.success.created'));
            resetForm();
        } catch (error) {
            showToast(t('toast.error.title'), t('toast.error.create'), "destructive");
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(route('summaries.update', data.id), data);
            const updatedSummary = response.data.summary;

            const updatedSummaries = summaries.map(summary =>
                summary.id === updatedSummary.id ? updatedSummary : summary
            );
            setSummaries(updatedSummaries);

            if (selectedSummary.some(s => s.id === updatedSummary.id)) {
                const newSelectedSummary = [updatedSummary];
                setSelectedSummary(newSelectedSummary);
                onUpdate(newSelectedSummary);
            } else {
                const newSelectedSummary = [updatedSummary];
                setSelectedSummary(newSelectedSummary);
                onUpdate(newSelectedSummary);
            }

            showToast(t('toast.success.title'), t('toast.success.updated'));
            resetForm();
        } catch (error) {
            showToast(t('toast.error.title'), t('toast.error.update'), "destructive");
        }
    };

    const handleDelete = async (summaryId) => {
        try {
            await axios.delete(route('summaries.destroy', summaryId));
            const updatedSummaries = summaries.filter(summary => summary.id !== summaryId);
            setSummaries(updatedSummaries);

            if (selectedSummary.some(s => s.id === summaryId)) {
                setSelectedSummary([]);
                onUpdate([]);
            }

            showToast(t('toast.success.title'), t('toast.success.deleted'));
        } catch (error) {
            showToast(t('toast.error.title'), t('toast.error.delete'), "destructive");
        }
    };

    const handleSelect = (summary) => {
        setData({
            id: summary.id,
            name: summary.name,
            description: summary.description,
        });
        setIsFormVisible(true);
    };

    const resetForm = () => {
        reset();
        setData('id', null);
        setIsFormVisible(false);
    };

    return (
        <div className="space-y-4">
            {/* Header Jobii style compact */}
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {t('summary.title', 'Résumé professionnel')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('summary.description', 'Décrivez votre profil professionnel en quelques lignes')}
                </p>
            </div>

            {/* Interface simplifiée Jobii style */}
            <div className="space-y-4">
                {/* Si un résumé est sélectionné, l'afficher */}
                {selectedSummary.length > 0 ? (
                    <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-800 dark:text-white">
                                {selectedSummary[0].name}
                            </h4>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSelect(selectedSummary[0])}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <PencilIcon className="w-4 h-4" />
                            </Button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {selectedSummary[0].description}
                        </p>
                    </div>
                ) : (
                    <div className="text-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                            {t('summary.noneSelected', 'Aucun résumé sélectionné')}
                        </p>
                        <Button
                            onClick={() => setIsFormVisible(true)}
                            className="bg-black hover:bg-gray-800 text-white text-sm px-4 py-2"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            {t('summary.create', 'Créer un résumé')}
                        </Button>
                    </div>
                )}

                {/* Liste simple des résumés disponibles */}
                {summaries.length > 0 && (
                    <div className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('summary.available', 'Résumés disponibles')}
                        </h5>
                        <div className="flex flex-wrap gap-2">
                            {summaries.map((summary) => (
                                <button
                                    key={summary.id}
                                    onClick={() => handleSelectSummary(summary.id)}
                                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                        selectedSummary.some(s => s.id === summary.id)
                                            ? 'bg-teal-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {summary.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Formulaire compact - seulement si visible */}
                <AnimatePresence>
                    {isFormVisible && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                        >
                            <div className="flex justify-between items-center">
                                <h5 className="font-medium text-gray-800 dark:text-white">
                                    {data.id ? t('summary.editTitle', 'Modifier le résumé') : t('summary.newTitle', 'Nouveau résumé')}
                                </h5>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetForm}
                                >
                                    <XIcon className="w-4 h-4" />
                                </Button>
                            </div>

                            <form onSubmit={data.id ? handleUpdate : handleCreate} className="space-y-3">
                                <div>
                                    <Input
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder={t('summary.namePlaceholder', 'Titre du poste visé')}
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <Textarea
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        placeholder={t('summary.descriptionPlaceholder', 'Décrivez votre profil professionnel...')}
                                        rows={3}
                                        className="w-full"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-black hover:bg-gray-800 text-white flex-1"
                                    >
                                        {data.id ? t('common.edit', 'Modifier') : t('common.create', 'Créer')}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={resetForm}
                                    >
                                        {t('common.cancel', 'Annuler')}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SummaryManager;
