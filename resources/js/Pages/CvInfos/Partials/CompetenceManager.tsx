import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus } from 'lucide-react';
import { useToast } from '@/Components/ui/use-toast';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";

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

    const LEVELS = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'];
    const [selectedLevel, setSelectedLevel] = useState('Intermédiaire');

    const addCompetence = async () => {
        if (!inputValue.trim()) return;

        setLoading(true);

        const existingCompetence = suggestions.length > 0 ? suggestions[0] : null;

        try {
            if (existingCompetence) {
                await axios.post('/user-competences', {
                    user_id: auth.user.id,
                    competence_id: existingCompetence.id,
                    level: selectedLevel
                });

                const updatedCompetences = [...userCompetences, { ...existingCompetence, level: selectedLevel }];
                setUserCompetences(updatedCompetences);
                onUpdate(updatedCompetences);

                toast({
                    title: t('competences.success.added.title'),
                    description: t('competences.success.added.description', {
                        name: getLocalizedName(existingCompetence, i18n.language)
                    })
                });
            } else {
                const newId = `manual-${Date.now()}`;
                const manualCompetence = {
                    id: newId,
                    name: inputValue.trim(),
                    name_en: inputValue.trim(),
                    description: '',
                    level: selectedLevel,
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

    const handleSuggestionClick = async (competence) => {
        setInputValue('');
        setSuggestions([]);
        setLoading(true);

        try {
            await axios.post('/user-competences', {
                user_id: auth.user.id,
                competence_id: competence.id,
                level: selectedLevel
            });

            const updatedCompetences = [...userCompetences, { ...competence, level: selectedLevel }];
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

    const handleUpdateLevel = async (competence, newLevel) => {
        setLoading(true);
        try {
            if (competence.is_manual) {
                // Update manual competence level
                const updatedManual = userCompetences.map(c =>
                    c.id === competence.id ? { ...c, level: newLevel } : c
                ).filter(c => c.is_manual);

                await axios.post('/user-manual-competences/update-all', {
                    user_id: auth.user.id,
                    manual_competences: updatedManual
                });
            } else {
                await axios.put(`/user-competences/${competence.id}`, {
                    level: newLevel
                });
            }

            const updated = userCompetences.map(c =>
                c.id === competence.id ? { ...c, level: newLevel } : c
            );
            setUserCompetences(updated);
            onUpdate(updated);

            toast({
                title: t('competences.success.updated.title'),
                description: t('competences.success.updated.description')
            });
        } catch (error) {
            console.error('Error updating level:', error);
            toast({
                title: t('competences.errors.updating.title'),
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

    const handleInputKeyDown = async (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            await addCompetence();
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

    return (
        <div className="space-y-4">
            <div>
                <h4 className="text-base font-medium text-gray-800 dark:text-white mb-2">
                    {t('cvInterface.skills.title')} <span className="text-sm text-gray-500">({sortedUserCompetences.length}/12)</span>
                </h4>
            </div>

            <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                        {sortedUserCompetences.map((competence) => (
                            <motion.div
                                key={competence.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="bg-teal-500 text-white pl-2.5 pr-1 py-1 rounded-full text-xs flex items-center gap-1.5 hover:bg-teal-600 transition-colors group"
                            >
                                <span className="font-medium">{getLocalizedName(competence, i18n.language)}</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="text-[10px] bg-teal-600 px-1.5 py-0.5 rounded-full opacity-90 hover:bg-teal-700 transition-colors">
                                            {competence.level || 'Intermédiaire'}
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {LEVELS.map((level) => (
                                            <DropdownMenuItem
                                                key={level}
                                                onClick={() => handleUpdateLevel(competence, level)}
                                                className={competence.level === level ? "bg-teal-50 dark:bg-teal-900/20" : ""}
                                            >
                                                {level}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <button
                                    onClick={() => handleRemoveCompetence(competence.id)}
                                    className="hover:bg-red-500 rounded-full p-0.5 transition-colors"
                                    disabled={loading}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <select
                            className="px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-xs dark:bg-gray-800 dark:text-white focus:ring-1 focus:ring-teal-500"
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                        >
                            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
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
                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                                    {suggestions.map((competence) => (
                                        <div
                                            key={competence.id}
                                            className="px-3 py-2 cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-900/30 text-sm border-b last:border-0 border-gray-100 dark:border-gray-700"
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
                                <Plus className="w-3 h-3" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

