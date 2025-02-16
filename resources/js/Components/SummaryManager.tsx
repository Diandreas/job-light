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
        <div className="space-y-6 dark:bg-gray-900 transition-colors duration-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors">
                        {t('summaries.title')}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 transition-colors">
                        {t('summaries.subtitle')}
                    </p>
                </div>
                <Button
                    onClick={() => setIsFormVisible(!isFormVisible)}
                    className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600
                             text-white dark:from-amber-600 dark:to-purple-600 transition-all duration-200"
                >
                    {isFormVisible ? (
                        <><XIcon className="w-4 h-4 mr-2" /> {t('actions.close')}</>
                    ) : (
                        <><PlusIcon className="w-4 h-4 mr-2" /> {t('summaries.new')}</>
                    )}
                </Button>
            </div>

            <AnimatePresence mode="wait">
                {isFormVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <Card className="border-amber-100 dark:border-amber-800 shadow-md dark:bg-gray-800 transition-colors">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold dark:text-white transition-colors">
                                    {data.id ? t('form.update') : t('summaries.new')}
                                </CardTitle>
                                <CardDescription className="dark:text-gray-400 transition-colors">
                                    {t('templates.subtitle')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={data.id ? handleUpdate : handleCreate} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        {Object.entries(templates).map(([key, template]) => (
                                            <Card
                                                key={key}
                                                className="cursor-pointer hover:shadow-md transition-all duration-200
                                                         dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                                                onClick={() => handleTemplateSelect(template)}
                                            >
                                                <CardHeader>
                                                    <CardTitle className="text-sm font-medium dark:text-white transition-colors">
                                                        <BookOpen className="w-4 h-4 inline-block mr-2 text-amber-500 dark:text-amber-400"/>
                                                        {template.name}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">
                                                        {template.description}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="name" className="dark:text-white transition-colors">
                                                {t('form.jobTitle')}
                                            </Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={e => setData('name', e.target.value)}
                                                placeholder={t('form.jobTitlePlaceholder')}
                                                className="border-amber-200 focus:ring-amber-500 dark:border-amber-800
                                                         dark:bg-gray-700 dark:text-white transition-colors"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="description" className="dark:text-white transition-colors">
                                                {t('form.description')}
                                            </Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={e => setData('description', e.target.value)}
                                                placeholder={t('form.descriptionPlaceholder')}
                                                rows={6}
                                                className="border-amber-200 focus:ring-amber-500 dark:border-amber-800
                                                         dark:bg-gray-700 dark:text-white transition-colors"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-2">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="bg-gradient-to-r from-amber-500 to-purple-500
                                                         hover:from-amber-600 hover:to-purple-600 text-white
                                                         dark:from-amber-600 dark:to-purple-600 transition-all duration-200"
                                            >
                                                {data.id ? t('form.update') : t('form.save')}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={resetForm}
                                                className="border-amber-200 hover:bg-amber-50 dark:border-amber-800
                                                         dark:hover:bg-gray-700 dark:text-white transition-colors"
                                            >
                                                {t('form.cancel')}
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-4">
                <div className="relative">
                    <Input
                        type="text"
                        placeholder={t('summaries.search')}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="max-w-md border-amber-200 focus:ring-amber-500 dark:border-amber-800
                                 dark:bg-gray-700 dark:text-white transition-colors"
                    />
                </div>

                <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-4">
                        <AnimatePresence>
                            {filteredSummaries.map((summary) => (
                                <motion.div
                                    key={summary.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="group"
                                >
                                    <Card className={`
                                        border-amber-100 dark:border-amber-800 transition-all duration-200
                                        ${selectedSummary.some(s => s.id === summary.id)
                                        ? 'shadow-md bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/50 dark:to-purple-900/50'
                                        : 'hover:shadow-md dark:bg-gray-800'
                                    }
                                    `}>
                                        <CardHeader className="flex flex-row justify-between items-start space-y-0">
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-lg dark:text-white transition-colors">
                                                    {summary.name}
                                                </CardTitle>
                                                {selectedSummary.some(s => s.id === summary.id) && (
                                                    <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                                                )}
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleSelect(summary)}
                                                    className="hover:bg-amber-50 dark:hover:bg-amber-900/30 dark:text-white"
                                                >
                                                    <PencilIcon className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(summary.id)}
                                                    className="hover:bg-red-50 dark:hover:bg-red-900/30 dark:text-white"
                                                >
                                                    <TrashIcon className="h-4 w-4 text-red-500 dark:text-red-400" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors">
                                                {summary.description}
                                            </p>
                                            <Button
                                                variant={selectedSummary.some(s => s.id === summary.id) ? "default" : "outline"}
                                                onClick={() => handleSelectSummary(summary.id)}
                                                className={`w-full group ${
                                                    selectedSummary.some(s => s.id === summary.id)
                                                        ? 'bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white dark:from-amber-600 dark:to-purple-600'
                                                        : 'border-amber-200 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-900/30 dark:text-white'
                                                } transition-all duration-200`}
                                            >
                                                <div className="flex items-center justify-center gap-2">
                                                    {selectedSummary.some(s => s.id === summary.id)
                                                        ? t('actions.selected')
                                                        : t('actions.select')}
                                                    <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                                                        selectedSummary.some(s => s.id === summary.id)
                                                            ? 'text-white'
                                                            : 'text-amber-500 dark:text-amber-400'
                                                    }`} />
                                                </div>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredSummaries.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <Alert
                                    variant="default"
                                    className="bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/30 dark:to-purple-900/30
                                             border-amber-100 dark:border-amber-800 transition-colors"
                                >
                                    <AlertDescription className="text-center py-4 dark:text-white transition-colors">
                                        {searchQuery
                                            ? t('summaries.noResults')
                                            : t('summaries.createFirst')}
                                    </AlertDescription>
                                </Alert>
                            </motion.div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};

// Configuration pour next-themes
const ThemeProvider = ({ children }) => {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}
        </ThemeProvider>
    );
};

export default SummaryManager;
