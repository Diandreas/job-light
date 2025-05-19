import React, { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/Components/ui/badge';
import { X, BookOpen, Check, Plus } from 'lucide-react';
import { useToast } from '@/Components/ui/use-toast';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/Components/ui/card';

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
        <div className="space-y-1">

            <Card className=" items-stretch">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                            {t('competences.card.title')}
                        </div>
                    </CardTitle>

                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="flex items-stretch gap-2">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                className="w-full p-3 border border-amber-200 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-900 dark:border-amber-800 dark:text-white"
                                placeholder={t('competences.input.placeholder', 'Saisissez une compétence...')}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleInputKeyDown}
                                disabled={loading}
                            />

                            {suggestions.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg dark:bg-gray-800 border border-amber-200 dark:border-amber-800">
                                    {suggestions.map((competence) => (
                                        <div
                                            key={competence.id}
                                            className="px-4 py-3 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/30 text-base touch-manipulation"
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
                            disabled={!inputValue.trim() || loading}
                            className="min-w-16 px-4 py-3 bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white dark:from-amber-400 dark:to-purple-400 dark:hover:from-amber-500 dark:hover:to-purple-500 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={t('competences.actions.add', 'Ajouter')}
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <Check className="w-5 h-5 mx-auto" />
                            )}
                        </button>
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {t('competences.input.help', 'Saisissez une compétence et appuyez sur le bouton ou la touche Entrée pour ajouter. Les compétences non reconnues seront ajoutées manuellement.')}
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                            {t('competences.list.title', { count: sortedUserCompetences.length })}
                        </h3>

                        <div className="max-h-[250px] overflow-y-auto pr-2">
                            <div className="flex flex-wrap gap-2">
                                <AnimatePresence>
                                    {sortedUserCompetences.map((competence) => (
                                        <motion.div
                                            key={competence.id}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Badge
                                                variant="secondary"
                                                className={`
                          ${competence.is_manual
                                                    ? 'bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200 dark:from-purple-900/40 dark:to-blue-900/40'
                                                    : 'bg-gradient-to-r from-amber-100 to-purple-100 hover:from-amber-200 hover:to-purple-200 dark:from-amber-900/40 dark:to-purple-900/40'
                                                }
                                           text-gray-800 dark:text-gray-200 flex items-center gap-1 py-1 pl-3 pr-2 text-base`}

                                            >
                                                <span>{getLocalizedName(competence, i18n.language)}</span>
                                                {competence.is_manual && (
                                                    <span className="px-1 py-0.5 text-[8px] rounded bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200">
                            {t('competences.manual.tag', 'Manuel')}
                          </span>
                                                )}
                                                <button
                                                    onClick={() => handleRemoveCompetence(competence.id)}
                                                    disabled={loading}
                                                    className="ml-1 p-1 rounded-full hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400 touch-manipulation disabled:opacity-50"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* État vide */}
                                {sortedUserCompetences.length === 0 && (
                                    <div className="w-full flex justify-center py-4">
                                        <div className="text-gray-400 dark:text-gray-500 flex flex-col items-center gap-2">
                                            <Plus className="h-8 w-8" />
                                            <span>{t('competences.list.empty', 'Ajoutez vos premières compétences')}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
