import React, { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/Components/ui/badge';
import { X, Plus, Check } from 'lucide-react';
import { useToast } from '@/Components/ui/use-toast';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const HobbyInput = ({ auth, availableHobbies, initialUserHobbies, onUpdate }) => {
    const { t, i18n } = useTranslation();
    const [userHobbies, setUserHobbies] = useState(initialUserHobbies);
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const { toast } = useToast();

    useEffect(() => {
        setUserHobbies(initialUserHobbies);
    }, [initialUserHobbies]);

    // Filtrer les suggestions en fonction de l'entrée utilisateur
    useEffect(() => {
        if (inputValue.trim().length > 0) {
            const filteredSuggestions = availableHobbies
                .filter(hobby =>
                    getLocalizedName(hobby, i18n.language)
                        .toLowerCase()
                        .includes(inputValue.toLowerCase()) &&
                    !userHobbies.some(userHobby => userHobby.id === hobby.id)
                )
                .slice(0, 5); // Limiter à 5 suggestions
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    }, [inputValue, availableHobbies, userHobbies, i18n.language]);

    const getLocalizedName = (hobby, currentLanguage) => {
        if (currentLanguage === 'en' && hobby.name_en) {
            return hobby.name_en;
        }
        return hobby.name;
    };

    const addHobby = async () => {
        if (!inputValue.trim()) return;

        // Vérifier si le hobby existe dans les suggestions
        const existingHobby = suggestions.length > 0 ? suggestions[0] : null;

        if (existingHobby) {
            // Ajouter un hobby existant
            try {
                const response = await axios.post('/user-hobbies', {
                    user_id: auth.user.id,
                    hobby_id: existingHobby.id,
                });

                if (response.data.success) {
                    const updatedHobbies = [...userHobbies, existingHobby];
                    setUserHobbies(updatedHobbies);
                    onUpdate(updatedHobbies);
                    setInputValue('');
                    setSuggestions([]);
                }
            } catch (error) {
                toast({
                    title: t('hobbies.errors.adding.title'),
                    description: error.response?.data?.message || t('hobbies.errors.generic'),
                    variant: 'destructive'
                });
            }
        } else {
            // Créer un hobby manuel
            try {
                const newId = `manual-${Date.now()}`;
                const manualHobby = {
                    id: newId,
                    name: inputValue.trim(),
                    name_en: inputValue.trim(),
                    is_manual: true
                };

                await axios.post('/user-manual-hobbies', {
                    user_id: auth.user.id,
                    hobby: manualHobby
                });

                const updatedHobbies = [...userHobbies, manualHobby];
                setUserHobbies(updatedHobbies);
                onUpdate(updatedHobbies);
                setInputValue('');
            } catch (error) {
                toast({
                    title: t('hobbies.errors.adding.title'),
                    description: error.response?.data?.message || t('hobbies.errors.generic'),
                    variant: 'destructive'
                });
            }
        }
    };

    const handleInputKeyDown = async (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            await addHobby();
        }
    };

    const handleSuggestionClick = async (hobby) => {
        try {
            const response = await axios.post('/user-hobbies', {
                user_id: auth.user.id,
                hobby_id: hobby.id,
            });

            if (response.data.success) {
                const updatedHobbies = [...userHobbies, hobby];
                setUserHobbies(updatedHobbies);
                onUpdate(updatedHobbies);
                setInputValue('');
                setSuggestions([]);
            }
        } catch (error) {
            toast({
                title: t('hobbies.errors.adding.title'),
                description: error.response?.data?.message || t('hobbies.errors.generic'),
                variant: 'destructive'
            });
        }
    };

    const handleRemoveHobby = async (hobbyId) => {
        try {
            if (typeof hobbyId === 'string' && hobbyId.startsWith('manual-')) {
                await axios.delete(`/user-manual-hobbies/${auth.user.id}/${hobbyId}`);
            } else {
                await axios.delete(`/user-hobbies/${auth.user.id}/${hobbyId}`);
            }

            const updatedHobbies = userHobbies.filter(h => h.id !== hobbyId);
            setUserHobbies(updatedHobbies);
            onUpdate(updatedHobbies);
        } catch (error) {
            toast({
                title: t('hobbies.errors.removing.title'),
                description: error.response?.data?.message || t('hobbies.errors.generic'),
                variant: 'destructive'
            });
        }
    };

    const sortedUserHobbies = useMemo(() => {
        return [...userHobbies].sort((a, b) =>
            getLocalizedName(a, i18n.language)
                .localeCompare(getLocalizedName(b, i18n.language))
        );
    }, [userHobbies, i18n.language]);

    return (
        <div className="space-y-4">
            <div className="flex items-stretch gap-2">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        className="w-full p-3 border border-amber-200 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-900 dark:border-amber-800 dark:text-white"
                        placeholder={t('hobbies.input.placeholder', 'Ajoutez vos passions, hobbies, intérêts...')}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                    />

                    {suggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg dark:bg-gray-800 border border-amber-200 dark:border-amber-800">
                            {suggestions.map((hobby) => (
                                <div
                                    key={hobby.id}
                                    className="px-4 py-3 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/30 text-base touch-manipulation"
                                    onClick={() => handleSuggestionClick(hobby)}
                                >
                                    {getLocalizedName(hobby, i18n.language)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={addHobby}
                    className="min-w-16 px-4 py-3 bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white dark:from-amber-400 dark:to-purple-400 dark:hover:from-amber-500 dark:hover:to-purple-500 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    aria-label={t('hobbies.actions.add', 'Ajouter')}
                >
                    <Check className="w-5 h-5 mx-auto" />
                </button>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
                {t('hobbies.input.help', 'Saisissez un hobby et appuyez sur le bouton ou Entrée pour ajouter.')}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
                <AnimatePresence>
                    {sortedUserHobbies.map((hobby) => (
                        <motion.div
                            key={hobby.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Badge
                                variant="secondary"
                                className={`
                  ${hobby.is_manual
                                    ? 'bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200 dark:from-purple-900/40 dark:to-blue-900/40'
                                    : 'bg-gradient-to-r from-amber-100 to-purple-100 hover:from-amber-200 hover:to-purple-200 dark:from-amber-900/40 dark:to-purple-900/40'
                                }
                  text-gray-800 dark:text-gray-200 flex items-center gap-2 py-2 pl-3 pr-2 text-base`}
                            >
                                <span>{getLocalizedName(hobby, i18n.language)}</span>
                                <button
                                    onClick={() => handleRemoveHobby(hobby.id)}
                                    className="ml-1 p-1 rounded-full hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400 touch-manipulation"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Bouton pour ajouter si la liste est vide (encore plus intuitif) */}
                {sortedUserHobbies.length === 0 && (
                    <div className="w-full flex justify-center py-4">
                        <div className="text-gray-400 dark:text-gray-500 flex flex-col items-center gap-2">
                            <Plus className="h-8 w-8" />
                            <span>{t('hobbies.list.empty', 'Ajoutez vos premiers hobbies')}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HobbyInput;
