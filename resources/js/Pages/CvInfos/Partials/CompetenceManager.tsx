import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus } from 'lucide-react';
import { useToast } from '@/Components/ui/use-toast';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const getLocalizedName = (competence, currentLanguage) => {
    if (currentLanguage === 'en' && competence.name_en) {
        return competence.name_en;
    }
    return competence.name;
};

export default function CompetenceInput({ auth, availableCompetences, initialUserCompetences, onUpdate }) {
    const { t, i18n } = useTranslation();
    const [userCompetences, setUserCompetences] = useState(initialUserCompetences || []);
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setUserCompetences(initialUserCompetences || []);
    }, [initialUserCompetences]);

    // Filtrer les suggestions en fonction de l'entrée utilisateur
    useEffect(() => {
        if (inputValue.trim().length > 0) {
            const filteredSuggestions = availableCompetences
                .filter(competence =>
                    getLocalizedName(competence, i18n.language)
                        .toLowerCase()
                        .includes(inputValue.toLowerCase()) &&
                    !userCompetences.some(userCompetence => userCompetence.id === competence.id)
                )
                .slice(0, 5); // Limiter à 5 suggestions
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    }, [inputValue, availableCompetences, userCompetences, i18n.language]);

    const addCompetence = async () => {
        if (!inputValue.trim()) return;

        setLoading(true);

        // Vérifier si la compétence existe dans les suggestions
        const existingCompetence = suggestions.length > 0 ? suggestions[0] : null;

        try {
            if (existingCompetence) {
                // Ajouter une compétence existante
                await axios.post('/user-competences', {
                    user_id: auth.user.id,
                    competence_id: existingCompetence.id,
                });

                const updatedCompetences = [...userCompetences, existingCompetence];
                setUserCompetences(updatedCompetences);
                onUpdate(updatedCompetences);

                toast({
                    title: t('competences.success.added.title'),
                    description: t('competences.success.added.description', {
                        name: getLocalizedName(existingCompetence, i18n.language)
                    })
                });
            } else {
                // Créer une compétence manuelle
                const newId = `manual-${Date.now()}`;
                const manualCompetence = {
                    id: newId,
                    name: inputValue.trim(),
                    name_en: inputValue.trim(),
                    description: '',
                    is_manual: true
                };

                await axios.post('/user-manual-competences', {
                    user_id: auth.user.id,
                    competence: manualCompetence
                });

                const updatedCompetences = [...userCompetences, manualCompetence];
                setUserCompetences(updatedCompetences);
                onUpdate(updatedCompetences);

                toast({
                    title: t('competences.success.manual.title'),
                    description: t('competences.success.manual.description', {
                        name: manualCompetence.name
                    })
                });
            }
        } catch (error) {
            console.error('Error adding competence:', error);
            toast({
                title: t('competences.errors.adding.title'),
                description: error.response?.data?.message || t('competences.errors.generic'),
                variant: 'destructive'
            });
        } finally {
            setInputValue('');
            setSuggestions([]);
            setLoading(false);
        }
    };

    const handleInputKeyDown = async (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            await addCompetence();
        }
    };

    const handleSuggestionClick = async (competence) => {
        setInputValue('');
        setSuggestions([]);
        setLoading(true);

        try {
            await axios.post('/user-competences', {
                user_id: auth.user.id,
                competence_id: competence.id,
            });

            const updatedCompetences = [...userCompetences, competence];
            setUserCompetences(updatedCompetences);
            onUpdate(updatedCompetences);

            toast({
                title: t('competences.success.added.title'),
                description: t('competences.success.added.description', {
                    name: getLocalizedName(competence, i18n.language)
                })
            });
        } catch (error) {
            console.error('Error adding competence:', error);
            toast({
                title: t('competences.errors.adding.title'),
                description: error.response?.data?.message || t('competences.errors.generic'),
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveCompetence = async (competenceId) => {
        setLoading(true);

        try {
            if (typeof competenceId === 'string' && competenceId.startsWith('manual-')) {
                await axios.delete(`/user-manual-competences/${auth.user.id}/${competenceId}`);
            } else {
                await axios.delete(`/user-competences/${auth.user.id}/${competenceId}`);
            }

            const updatedCompetences = userCompetences.filter(c => c.id !== competenceId);
            setUserCompetences(updatedCompetences);
            onUpdate(updatedCompetences);

            toast({
                title: t('competences.success.removed.title'),
                description: t('competences.success.removed.description')
            });
        } catch (error) {
            console.error('Error removing competence:', error);
            toast({
                title: t('competences.errors.removing.title'),
                description: error.response?.data?.message || t('competences.errors.generic'),
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const sortedUserCompetences = useMemo(() => {
        return [...userCompetences].sort((a, b) =>
            getLocalizedName(a, i18n.language)
                .localeCompare(getLocalizedName(b, i18n.language))
        );
    }, [userCompetences, i18n.language]);

    return (
        <div className="space-y-4">
            {/* Header compact */}
            <div>
                <h4 className="text-base font-medium text-gray-800 dark:text-white mb-2">
                    {t('cvInterface.skills.title')} <span className="text-sm text-gray-500">({sortedUserCompetences.length}/12)</span>
                </h4>
            </div>

            <div className="space-y-3">
                {/* Tags des compétences sélectionnées */}
                <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                        {sortedUserCompetences.map((competence) => (
                            <motion.div
                                key={competence.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="bg-teal-500 text-white px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5 hover:bg-teal-600 transition-colors"
                            >
                                <span>{getLocalizedName(competence, i18n.language)}</span>
                                <button
                                    onClick={() => handleRemoveCompetence(competence.id)}
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
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-800 dark:text-white"
                            placeholder={t('cvInterface.skills.addPlaceholder')}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleInputKeyDown}
                            disabled={loading}
                        />

                        {suggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
                                {suggestions.map((competence) => (
                                    <div
                                        key={competence.id}
                                        className="px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                                        onClick={() => handleSuggestionClick(competence)}
                                    >
                                        {getLocalizedName(competence, i18n.language)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={addCompetence}
                        disabled={!inputValue.trim() || loading || sortedUserCompetences.length >= 12}
                        className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-2 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                        {loading ? (
                            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <Plus className="w-3 w-3" />
                        )}
                        +
                    </button>
                </div>

            </div>
        </div>
    );
}
