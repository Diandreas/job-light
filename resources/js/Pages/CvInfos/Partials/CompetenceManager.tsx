// CompetenceManager.tsx - Luxury Update
import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Sparkles, Star } from 'lucide-react';
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
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { cn } from "@/lib/utils";

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

    // Filter suggestions
    useEffect(() => {
        if (inputValue.trim().length > 0) {
            const filteredSuggestions = availableCompetences
                .filter(competence =>
                    getLocalizedName(competence, i18n.language)
                        .toLowerCase()
                        .includes(inputValue.toLowerCase()) &&
                    !userCompetences.some(userCompetence => userCompetence.id === competence.id)
                )
                .slice(0, 5);
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

            toast({ title: t('competences.success.added.title') });
        } catch (error) {
            toast({ variant: 'destructive', title: t('competences.errors.generic') });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateLevel = async (competence, newLevel) => {
        setLoading(true);
        try {
            if (competence.is_manual) {
                const updatedManual = userCompetences.map(c =>
                    c.id === competence.id ? { ...c, level: newLevel } : c
                ).filter(c => c.is_manual);

                await axios.post('/user-manual-competences/update-all', {
                    user_id: auth.user.id,
                    manual_competences: updatedManual
                });
            } else {
                await axios.put(`/user-competences/${competence.id}`, { level: newLevel });
            }

            const updated = userCompetences.map(c =>
                c.id === competence.id ? { ...c, level: newLevel } : c
            );
            setUserCompetences(updated);
            onUpdate(updated);
            toast({ title: t('competences.success.updated.title') });
        } catch (error) {
            toast({ variant: 'destructive', title: t('competences.errors.generic') });
        } finally {
            setLoading(false);
        }
    };

    const sortedUserCompetences = useMemo(() => {
        return [...userCompetences].sort((a, b) =>
            getLocalizedName(a, i18n.language).localeCompare(getLocalizedName(b, i18n.language))
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
            toast({ title: t('competences.success.removed.title') });
        } catch (error) {
            toast({ variant: 'destructive', title: t('competences.errors.generic') });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-luxury-gold-500" />
                <h4 className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
                    {t('cvInterface.skills.title')} <span className="text-sm font-normal text-neutral-500">({sortedUserCompetences.length}/12)</span>
                </h4>
            </div>

            {/* List of skills */}
            <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                    {sortedUserCompetences.map((competence) => (
                        <motion.div
                            key={competence.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 pl-3 pr-1 py-1 rounded-lg text-sm flex items-center gap-2 shadow-sm group hover:ring-2 hover:ring-luxury-gold-500/20 transition-all"
                        >
                            <span className="font-medium">{getLocalizedName(competence, i18n.language)}</span>
                            <div className="flex items-center bg-neutral-800 dark:bg-neutral-200 rounded-md">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="text-[10px] px-2 py-0.5 hover:text-luxury-gold-400 transition-colors">
                                            {competence.level || 'Intermédiaire'}
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {LEVELS.map((level) => (
                                            <DropdownMenuItem
                                                key={level}
                                                onClick={() => handleUpdateLevel(competence, level)}
                                                className={competence.level === level ? "text-luxury-gold-600 bg-luxury-gold-50" : ""}
                                            >
                                                {level}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <div className="w-[1px] h-3 bg-neutral-700 dark:bg-neutral-300 mx-0.5" />
                                <button
                                    onClick={() => handleRemoveCompetence(competence.id)}
                                    className="p-1 hover:text-red-400 transition-colors rounded-r-md"
                                    disabled={loading}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Add new skill */}
            <div className="flex flex-col sm:flex-row gap-2">
                {/* Level Select */}
                <div className="w-full sm:w-40 relative">
                    <select
                        className="w-full h-10 sm:h-11 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:ring-2 focus:ring-luxury-gold-500/20 focus:border-luxury-gold-500 transition-all outline-none appearance-none"
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                    >
                        {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>

                {/* Input with suggestions */}
                <div className="relative flex-1">
                    <Input
                        type="text"
                        className="pl-4"
                        placeholder={t('cvInterface.skills.addPlaceholder')}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                        disabled={loading}
                    />

                    {suggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-neutral-100 dark:border-gray-700 overflow-hidden">
                            {suggestions.map((competence) => (
                                <div
                                    key={competence.id}
                                    className="px-4 py-2.5 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm border-b last:border-0 border-neutral-50 dark:border-gray-700 transition-colors flex items-center gap-2"
                                    onClick={() => handleSuggestionClick(competence)}
                                >
                                    <Sparkles className="w-3 h-3 text-luxury-gold-500" />
                                    {getLocalizedName(competence, i18n.language)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Button
                    onClick={addCompetence}
                    disabled={!inputValue.trim() || loading || sortedUserCompetences.length >= 12}
                    className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 h-10 sm:h-11 px-4 sm:px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Plus className="w-5 h-5" />
                    )}
                </Button>
            </div>
        </div>
    );
}

