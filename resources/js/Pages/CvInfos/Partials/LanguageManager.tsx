import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Plus, X, Globe2, Search, Sparkles } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { useToast } from '@/Components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { ScrollArea } from "@/Components/ui/scroll-area";
import { motion, AnimatePresence } from 'framer-motion';

interface Language {
    id: number;
    name: string;
    name_en: string;
    pivot?: {
        user_id: number;
        language_id: number;
        language_level: string;
    };
}

interface Props {
    auth: any;
    initialLanguages: Language[];
    availableLanguages: Language[];
    onUpdate: (languages: Language[]) => void;
}

const LANGUAGE_LEVELS = [
    { id: 'Débutant', name: 'beginner' },
    { id: 'Élémentaire', name: 'elementary' },
    { id: 'Intermédiaire', name: 'intermediate' },
    { id: 'Intermédiaire avancé', name: 'upperIntermediate' },
    { id: 'Avancé', name: 'advanced' },
    { id: 'Maîtrise', name: 'proficient' },
    { id: 'Langue maternelle', name: 'native' }
];

const getLocalizedName = (language: Language, currentLanguage: string): string => {
    if (currentLanguage === 'en' && language.name_en) {
        return language.name_en;
    }
    return language.name;
};

const LanguageManager: React.FC<Props> = ({ auth, initialLanguages = [], availableLanguages = [], onUpdate }) => {
    const [languages, setLanguages] = useState<Language[]>(initialLanguages || []);
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const [selectedLevel, setSelectedLevel] = useState('Débutant');
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    const { t, i18n } = useTranslation();

    useEffect(() => {
        setLanguages(initialLanguages || []);
    }, [initialLanguages]);

    const sortedLanguages = useMemo(() => {
        if (!languages || !Array.isArray(languages)) return [];
        return [...languages].sort((a, b) =>
            getLocalizedName(a, i18n.language)
                .localeCompare(getLocalizedName(b, i18n.language))
        );
    }, [languages, i18n.language]);

    const filteredAvailableLanguages = useMemo(() => {
        if (!availableLanguages || !Array.isArray(availableLanguages)) return [];
        if (!languages || !Array.isArray(languages)) return availableLanguages;

        return availableLanguages
            .filter(lang =>
                !languages.some(userLang => userLang.id === lang.id) &&
                getLocalizedName(lang, i18n.language)
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
            )
            .sort((a, b) =>
                getLocalizedName(a, i18n.language)
                    .localeCompare(getLocalizedName(b, i18n.language))
            );
    }, [availableLanguages, languages, searchTerm, i18n.language]);

    const handleAddLanguage = async () => {
        if (!selectedLanguage) {
            toast({
                title: t('cv.languages.error.title'),
                description: t('cv.languages.error.select'),
                variant: 'destructive',
            });
            return;
        }

        try {
            await axios.post(route('user-languages.store'), {
                language_id: selectedLanguage,
                language_level: selectedLevel,
            });

            const newLanguage = availableLanguages.find(lang => lang.id.toString() === selectedLanguage);
            if (newLanguage) {
                const updatedLanguages = [...languages, { ...newLanguage, pivot: { user_id: auth.user.id, language_id: newLanguage.id, language_level: selectedLevel } }];
                setLanguages(updatedLanguages);
                onUpdate(updatedLanguages);
            }

            setSelectedLanguage('');
            setSelectedLevel('Débutant');

            toast({
                title: t('common.success'),
                description: t('cv.languages.success.added'),
            });
        } catch (error) {
            console.error('Error adding language:', error);
            toast({
                title: t('cv.languages.error.title'),
                description: t('cv.languages.error.add'),
                variant: 'destructive',
            });
        }
    };

    const handleDeleteLanguage = async (userId: number, languageId: number) => {
        try {
            await axios.delete(route('user-languages.destroy', [userId, languageId]));
            const updatedLanguages = languages.filter(lang => lang.id !== languageId);
            setLanguages(updatedLanguages);
            onUpdate(updatedLanguages);

            toast({
                title: t('common.success'),
                description: t('cv.languages.success.removed'),
            });
        } catch (error) {
            console.error('Error removing language:', error);
            toast({
                title: t('cv.languages.error.title'),
                description: t('cv.languages.error.delete'),
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">{t('cv.languages.title')}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{t('cv.languages.description')}</p>
                </div>
            </div>

            <Card className="border-amber-100 dark:border-amber-900/50 shadow-md dark:shadow-amber-900/10">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                        <div className="flex items-center gap-2">
                            <Globe2 className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                            {t('cv.languages.title')}
                        </div>
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        {t('cv.languages.description')}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-2">
                        <div className="flex-1">
                            <Select
                                value={selectedLanguage}
                                onValueChange={setSelectedLanguage}
                            >
                                <SelectTrigger className="border-amber-200 dark:border-amber-800 focus:ring-amber-500 dark:focus:ring-amber-400 dark:bg-gray-900">
                                    <SelectValue placeholder={t('cv.languages.selectPlaceholder')} />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-900">
                                    {filteredAvailableLanguages.map((language) => (
                                        <SelectItem key={language.id} value={language.id.toString()}>
                                            {getLocalizedName(language, i18n.language)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1">
                            <Select
                                value={selectedLevel}
                                onValueChange={setSelectedLevel}
                            >
                                <SelectTrigger className="border-amber-200 dark:border-amber-800 focus:ring-amber-500 dark:focus:ring-amber-400 dark:bg-gray-900">
                                    <SelectValue placeholder={t('cv.languages.levelPlaceholder')} />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-900">
                                    {LANGUAGE_LEVELS.map((level) => (
                                        <SelectItem key={level.id} value={level.id}>
                                            {t(`cv.languages.levels.${level.name}`)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={handleAddLanguage}
                            className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white dark:from-amber-400 dark:to-purple-400 dark:hover:from-amber-500 dark:hover:to-purple-500"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {t('cv.languages.add')}
                        </Button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-amber-500 dark:text-amber-400" />
                        <Input
                            type="text"
                            placeholder={t('common.search')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 border-amber-200 dark:border-amber-800 focus:ring-amber-500 dark:focus:ring-amber-400 dark:bg-gray-900"
                        />
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                            <h3 className="text-lg font-semibold dark:text-white">
                                {t('cv.languages.title')} ({sortedLanguages.length})
                            </h3>
                        </div>

                        <ScrollArea className="h-[200px] pr-4">
                            <div className="flex flex-wrap gap-2">
                                <AnimatePresence>
                                    {sortedLanguages.length === 0 ? (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm italic w-full text-center py-4">
                                            {t('cv.languages.empty')}
                                        </p>
                                    ) : (
                                        sortedLanguages.map((language) => (
                                            <motion.div
                                                key={language.id}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-gradient-to-r from-amber-100 to-purple-100 hover:from-amber-200 hover:to-purple-200
                                                         dark:from-amber-900/40 dark:to-purple-900/40 dark:hover:from-amber-900/60 dark:hover:to-purple-900/60
                                                         text-gray-800 dark:text-gray-200 flex items-center gap-2 py-2 pl-3 pr-2"
                                                >
                                                    <span>
                                                        {getLocalizedName(language, i18n.language)}
                                                        <span className="text-xs ml-1 text-amber-600 dark:text-amber-400">
                                                            ({t(`cv.languages.levels.${LANGUAGE_LEVELS.find(level => level.id === language.pivot?.language_level)?.name}`)})
                                                        </span>
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteLanguage(language.pivot?.user_id || auth.user.id, language.id)}
                                                        className="h-5 w-5 p-0 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </Badge>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                        </ScrollArea>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LanguageManager;