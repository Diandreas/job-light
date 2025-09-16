import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { X, Plus } from 'lucide-react';
import { useToast } from '@/Components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const getLocalizedName = (hobby, currentLanguage) => {
    if (currentLanguage === 'en' && hobby.name_en) {
        return hobby.name_en;
    }
    return hobby.name;
};

export default function HobbyInput({ auth, initialUserHobbies, availableHobbies, onUpdate }) {
    const [hobbies, setHobbies] = useState(initialUserHobbies || []);
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const { t, i18n } = useTranslation();

    useEffect(() => {
        setHobbies(initialUserHobbies || []);
    }, [initialUserHobbies]);

    // Filtrer les suggestions
    useEffect(() => {
        if (inputValue.trim().length > 0) {
            const filteredSuggestions = availableHobbies
                .filter(hobby =>
                    !hobbies.some(userHobby => userHobby.id === hobby.id) &&
                    getLocalizedName(hobby, i18n.language)
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                )
                .slice(0, 5);
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    }, [inputValue, availableHobbies, hobbies, i18n.language]);

    const addHobby = async (hobby = null) => {
        const hobbyToAdd = hobby || {
            id: `manual-${Date.now()}`,
            name: inputValue.trim(),
            name_en: inputValue.trim(),
            is_manual: true
        };

        if (!hobbyToAdd.name.trim()) return;

        setLoading(true);
        try {
            if (hobby) {
                await axios.post('/user-hobbies', {
                    user_id: auth.user.id,
                    hobby_id: hobby.id,
                });
            } else {
                await axios.post('/user-manual-hobbies', {
                    user_id: auth.user.id,
                    hobby: hobbyToAdd
                });
            }

            const updatedHobbies = [...hobbies, hobbyToAdd];
            setHobbies(updatedHobbies);
            onUpdate(updatedHobbies);

            setInputValue('');
            setSuggestions([]);

            toast({
                title: t('cvInterface.hobbies.added'),
                description: t('cvInterface.hobbies.addedDescription', { hobby: hobbyToAdd.name }),
                variant: 'default'
            });
        } catch (error) {
            console.error('Error adding hobby:', error);
            toast({
                title: t('cvInterface.hobbies.error'),
                description: t('cvInterface.hobbies.addError'),
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const removeHobby = async (hobbyId) => {
        setLoading(true);
        try {
            if (typeof hobbyId === 'string' && hobbyId.startsWith('manual-')) {
                await axios.delete(`/user-manual-hobbies/${auth.user.id}/${hobbyId}`);
            } else {
                await axios.delete(`/user-hobbies/${auth.user.id}/${hobbyId}`);
            }

            const updatedHobbies = hobbies.filter(h => h.id !== hobbyId);
            setHobbies(updatedHobbies);
            onUpdate(updatedHobbies);

            toast({
                title: t('cvInterface.hobbies.removed'),
                description: t('cvInterface.hobbies.removedDescription'),
                variant: 'default'
            });
        } catch (error) {
            console.error('Error removing hobby:', error);
            toast({
                title: t('cvInterface.hobbies.error'),
                description: t('cvInterface.hobbies.removeError'),
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
                    {t('cvInterface.hobbies.title')} <span className="text-sm text-gray-500">({hobbies.length}/6)</span>
                </h4>
            </div>

            <div className="space-y-3">
                {/* Tags des centres d'intérêt sélectionnés */}
                <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                        {hobbies.map((hobby) => (
                            <motion.div
                                key={hobby.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="bg-purple-500 text-white px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5 hover:bg-purple-600 transition-colors"
                            >
                                <span>{getLocalizedName(hobby, i18n.language)}</span>
                                <button
                                    onClick={() => removeHobby(hobby.id)}
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
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white"
                            placeholder={t('cvInterface.hobbies.placeholder')}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addHobby()}
                            disabled={loading}
                        />

                        {suggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
                                {suggestions.map((hobby) => (
                                    <div
                                        key={hobby.id}
                                        className="px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                                        onClick={() => addHobby(hobby)}
                                    >
                                        {getLocalizedName(hobby, i18n.language)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => addHobby()}
                        disabled={!inputValue.trim() || loading || hobbies.length >= 6}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
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