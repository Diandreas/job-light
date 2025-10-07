import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { X, Plus } from 'lucide-react';
import { useToast } from '@/Components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const LANGUAGE_LEVELS = [
    { id: 'beginner', translationKey: 'cvInterface.languages.levels.beginner' },
    { id: 'intermediate', translationKey: 'cvInterface.languages.levels.intermediate' },
    { id: 'advanced', translationKey: 'cvInterface.languages.levels.advanced' },
    { id: 'native', translationKey: 'cvInterface.languages.levels.native' }
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
    const [selectedLevel, setSelectedLevel] = useState('beginner');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const { t, i18n } = useTranslation();

    useEffect(() => {
        setLanguages(initialLanguages || []);
    }, [initialLanguages]);

    // Filtrer les suggestions
    useEffect(() => {
        if (inputValue.trim().length > 0) {
            const filteredSuggestions = availableLanguages
                .filter(language =>
                    !languages.some(userLang => userLang.id === language.id) &&
                    getLocalizedName(language, i18n.language)
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                )
                .slice(0, 5);
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    }, [inputValue, availableLanguages, languages, i18n.language]);

    const addLanguage = async (language = null) => {
        if (!language && !inputValue.trim()) return;

        // Si aucune langue n'est sélectionnée dans les suggestions, ne rien faire
        if (!language) {
            toast({
                title: t('cvInterface.languages.error'),
                description: t('cvInterface.languages.selectFromList'),
                variant: 'destructive'
            });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('/user-languages', {
                language_id: language.id,
                language_level: selectedLevel
            });

            // Récupérer la langue ajoutée avec les données complètes
            const addedLanguage = {
                ...language,
                level: selectedLevel,
                pivot: {
                    user_id: auth.user.id,
                    language_id: language.id,
                    language_level: selectedLevel
                }
            };

            const updatedLanguages = [...languages, addedLanguage];
            setLanguages(updatedLanguages);
            onUpdate(updatedLanguages);

            setInputValue('');
            setSuggestions([]);

            toast({
                title: t('cvInterface.languages.added'),
                description: t('cvInterface.languages.addedDescription', {
                    language: getLocalizedName(language, i18n.language),
                    level: t(`cvInterface.languages.levels.${selectedLevel}`)
                }),
                variant: 'default'
            });
        } catch (error) {
            console.error('Error adding language:', error);
            const errorMessage = error.response?.data?.message || t('cvInterface.languages.addError');
            toast({
                title: t('cvInterface.languages.error'),
                description: errorMessage,
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const removeLanguage = async (languageId) => {
        setLoading(true);
        try {
            await axios.delete(`/user-languages/${auth.user.id}/${languageId}`);

            const updatedLanguages = languages.filter(l => l.id !== languageId);
            setLanguages(updatedLanguages);
            onUpdate(updatedLanguages);

            toast({
                title: t('cvInterface.languages.removed'),
                description: t('cvInterface.languages.removedDescription'),
                variant: 'default'
            });
        } catch (error) {
            console.error('Error removing language:', error);
            toast({
                title: t('cvInterface.languages.error'),
                description: t('cvInterface.languages.removeError'),
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header compact */}
            <div>
                <h4 className="text-base font-medium text-gray-800 dark:text-white mb-2">
                    {t('cvInterface.languages.title')} <span className="text-sm text-gray-500">({languages.length}/5)</span>
                </h4>
            </div>

            <div className="space-y-3">
                {/* Tags des langues sélectionnées */}
                <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                        {languages.map((language) => (
                            <motion.div
                                key={language.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="bg-amber-500 text-white px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5 hover:bg-amber-600 transition-colors"
                            >
                                <span>
                                    {getLocalizedName(language, i18n.language)} | {
                                        language.level?.startsWith('cvInterface.')
                                            ? t(language.level)
                                            : t(`cvInterface.languages.levels.${language.level || language.pivot?.language_level || 'beginner'}`)
                                    }
                                </span>
                                <button
                                    onClick={() => removeLanguage(language.id)}
                                    className="hover:bg-teal-600 rounded-full p-0.5 transition-colors"
                                    disabled={loading}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Input d'ajout compact */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-1 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-800 dark:text-white"
                            placeholder={t('cvInterface.languages.placeholder')}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && suggestions.length > 0) {
                                    addLanguage(suggestions[0]);
                                }
                            }}
                            disabled={loading}
                        />

                        {suggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
                                {suggestions.map((language) => (
                                    <div
                                        key={language.id}
                                        className="px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                                        onClick={() => addLanguage(language)}
                                    >
                                        {getLocalizedName(language, i18n.language)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-1 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-800 dark:text-white"
                    >
                        {LANGUAGE_LEVELS.map(level => (
                            <option key={level.id} value={level.id}>
                                {t(level.translationKey)}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={() => {
                            if (suggestions.length > 0) {
                                addLanguage(suggestions[0]);
                            }
                        }}
                        disabled={suggestions.length === 0 || loading || languages.length >= 5}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        title={suggestions.length === 0 ? t('cvInterface.languages.selectFromList') : ''}
                    >
                        {loading ? (
                            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <Plus className="w-3 h-3" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}