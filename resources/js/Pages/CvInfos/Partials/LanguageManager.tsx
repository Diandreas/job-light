import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { X, Globe2, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { useToast } from '@/Components/ui/use-toast';
import { Badge } from '@/Components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

const LANGUAGE_LEVELS = [
    { id: 'Débutant', name: 'beginner' },
    { id: 'Élémentaire', name: 'elementary' },
    { id: 'Intermédiaire', name: 'intermediate' },
    { id: 'Intermédiaire avancé', name: 'upperIntermediate' },
    { id: 'Avancé', name: 'advanced' },
    { id: 'Maîtrise', name: 'proficient' },
    { id: 'Langue maternelle', name: 'native' }
];

const getLocalizedName = (language, currentLanguage) => {
    if (currentLanguage === 'en' && language.name_en) {
        return language.name_en;
    }
    return language.name;
};

export default function LanguageInput({ auth, initialLanguages, availableLanguages, onUpdate }) {
    const [languages, setLanguages] = useState(initialLanguages || []);
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [showLevelSelector, setShowLevelSelector] = useState(false);
    const { toast } = useToast();
    const { t, i18n } = useTranslation();

    useEffect(() => {
        setLanguages(initialLanguages || []);
    }, [initialLanguages]);

    // Filtrer les suggestions en fonction de l'entrée utilisateur
    useEffect(() => {
        if (inputValue.trim().length > 0) {
            const filteredSuggestions = availableLanguages
                .filter(language =>
                    !languages.some(userLang => userLang.id === language.id) &&
                    getLocalizedName(language, i18n.language)
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                )
                .slice(0, 5); // Limiter à 5 suggestions
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    }, [inputValue, availableLanguages, languages, i18n.language]);

    const sortedLanguages = useMemo(() => {
        if (!languages || !Array.isArray(languages)) return [];
        return [...languages].sort((a, b) =>
            getLocalizedName(a, i18n.language)
                .localeCompare(getLocalizedName(b, i18n.language))
        );
    }, [languages, i18n.language]);

    const handleLanguageSelect = (language) => {
        setSelectedLanguage(language);
        setInputValue('');
        setSuggestions([]);
        setShowLevelSelector(true);
    };

    const handleLevelSelect = (level) => {
        setSelectedLevel(level);
    };

    const handleAddLanguage = async () => {
        if (!selectedLanguage || !selectedLevel) return;

        try {
            await axios.post(route('user-languages.store'), {
                language_id: selectedLanguage.id,
                language_level: selectedLevel.id,
            });

            const updatedLanguages = [
                ...languages,
                {
                    ...selectedLanguage,
                    pivot: {
                        user_id: auth.user.id,
                        language_id: selectedLanguage.id,
                        language_level: selectedLevel.id
                    }
                }
            ];

            setLanguages(updatedLanguages);
            onUpdate(updatedLanguages);
            setSelectedLanguage(null);
            setSelectedLevel(null);
            setShowLevelSelector(false);

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

    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter' && suggestions.length > 0) {
            e.preventDefault();
            handleLanguageSelect(suggestions[0]);
        }
    };

    const handleDeleteLanguage = async (userId, languageId) => {
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

            <Card className="border-amber-100 dark:border-amber-900/50 shadow-md">
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
                    {!showLevelSelector ? (
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full p-3 border border-amber-200 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-900 dark:border-amber-800 dark:text-white"
                                placeholder={t('cv.languages.searchPlaceholder', 'Rechercher une langue...')}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleInputKeyDown}
                            />

                            {suggestions.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg dark:bg-gray-800 border border-amber-200 dark:border-amber-800">
                                    {suggestions.map((language) => (
                                        <div
                                            key={language.id}
                                            className="px-4 py-3 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/30 text-base touch-manipulation"
                                            onClick={() => handleLanguageSelect(language)}
                                        >
                                            {getLocalizedName(language, i18n.language)}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 border border-amber-200 rounded-lg dark:border-amber-800 dark:bg-gray-900/50">
                                <div className="mb-2 text-sm font-medium text-amber-700 dark:text-amber-300">
                                    {t('cv.languages.selectLevel', 'Sélectionnez votre niveau pour')} :
                                    <span className="font-semibold ml-1">
                    {getLocalizedName(selectedLanguage, i18n.language)}
                  </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {LANGUAGE_LEVELS.map((level) => (
                                        <button
                                            key={level.id}
                                            className={`p-2 text-sm border rounded-md text-center ${
                                                selectedLevel === level
                                                    ? 'bg-gradient-to-r from-amber-500 to-purple-500 text-white border-transparent'
                                                    : 'border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/30 dark:text-white'
                                            }`}
                                            onClick={() => handleLevelSelect(level)}
                                        >
                                            {t(`cv.languages.levels.${level.name}`)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-between gap-2">
                                <button
                                    onClick={() => {
                                        setSelectedLanguage(null);
                                        setSelectedLevel(null);
                                        setShowLevelSelector(false);
                                    }}
                                    className="px-4 py-2 text-sm border border-red-200 rounded-md text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
                                >
                                    {t('common.cancel', 'Annuler')}
                                </button>
                                <button
                                    onClick={handleAddLanguage}
                                    disabled={!selectedLevel}
                                    className="px-4 py-2 text-sm bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white rounded-md disabled:opacity-50 dark:from-amber-400 dark:to-purple-400"
                                >
                                    <Check className="w-4 h-4 mr-1 inline-block" />
                                    {t('common.add', 'Ajouter')}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {!showLevelSelector
                            ? t('cv.languages.help', 'Commencez à taper pour rechercher une langue.')
                            : t('cv.languages.levelHelp', 'Choisissez votre niveau de maîtrise de cette langue.')}
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
                            <Globe2 className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                            {t('cv.languages.yourLanguages', 'Vos langues')} ({sortedLanguages.length})
                        </h3>

                        <div className="flex flex-wrap gap-2 max-h-[250px] overflow-y-auto pr-2">
                            <AnimatePresence>
                                {sortedLanguages.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400 text-sm italic w-full text-center py-4">
                                        {t('cv.languages.empty', 'Aucune langue ajoutée')}
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
                                  text-gray-800 dark:text-gray-200 flex items-center gap-2 py-2 pl-3 pr-2 text-base mb-2"
                                            >
                        <span>
                          {getLocalizedName(language, i18n.language)}
                            <span className="text-xs ml-1 text-amber-600 dark:text-amber-400">
                            ({t(`cv.languages.levels.${LANGUAGE_LEVELS.find(level => level.id === language.pivot?.language_level)?.name || 'beginner'}`)})
                          </span>
                        </span>
                                                <button
                                                    onClick={() => handleDeleteLanguage(language.pivot?.user_id || auth.user.id, language.id)}
                                                    className="ml-1 p-1 rounded-full hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400 touch-manipulation"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
