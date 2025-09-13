import React, { useState, useEffect } from 'react';
import { Badge } from '@/Components/ui/badge';
import { X, GraduationCap, Check } from 'lucide-react';
import { useToast } from '@/Components/ui/use-toast';
import axios from 'axios';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/Components/ui/card';
import { useTranslation } from 'react-i18next';

export default function ProfessionInput({ auth, availableProfessions, initialUserProfession, onUpdate }) {
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const { toast } = useToast();

    // Garder des références locales mais utilisables pour l'affichage
    const [currentProfession, setCurrentProfession] = useState({
        type: initialUserProfession ? 'standard' : (auth.user.full_profession ? 'manual' : null),
        data: initialUserProfession || null,
        manualText: auth.user.full_profession || ''
    });

    // Logging pour débogage
    useEffect(() => {
        console.log('State initialized:', {
            currentProfession,
            initialUserProfession,
            authFullProfession: auth.user.full_profession
        });
    }, []);

    // Filtrer les suggestions
    useEffect(() => {
        if (!inputValue.trim()) {
            setSuggestions([]);
            return;
        }

        const filtered = availableProfessions
            .filter(profession => {
                const name = i18n.language === 'en' && profession.name_en ? profession.name_en : profession.name;
                return name.toLowerCase().includes(inputValue.toLowerCase());
            })
            .slice(0, 5);

        setSuggestions(filtered);
    }, [inputValue, availableProfessions, i18n.language]);

    const getLocalizedName = (profession) => {
        if (!profession) return '';
        return (i18n.language === 'en' && profession.name_en) ? profession.name_en : profession.name;
    };

    const updateProfession = async (professionsData) => {
        try {
            setLoading(true);

            const response = await axios.post('/user-professions', {
                user_id: auth.user.id,
                ...professionsData
            });

            if (response.data.success) {
                if (professionsData.profession_id) {
                    const selectedProfession = availableProfessions.find(p => p.id === professionsData.profession_id);

                    // Mettre à jour l'état local
                    setCurrentProfession({
                        type: 'standard',
                        data: selectedProfession,
                        manualText: ''
                    });

                    // Notifier le parent
                    onUpdate(selectedProfession, null);

                    toast({
                        title: t('professions.success.updated.title'),
                        description: t('professions.success.updated.description', {
                            profession: getLocalizedName(selectedProfession)
                        })
                    });
                } else {
                    // Mettre à jour l'état local
                    setCurrentProfession({
                        type: 'manual',
                        data: null,
                        manualText: professionsData.full_profession
                    });

                    // Notifier le parent
                    onUpdate(null, professionsData.full_profession);

                    toast({
                        title: t('professions.success.updated.title'),
                        description: t('professions.success.manual.description')
                    });
                }
            }
        } catch (error) {
            console.error('Error updating profession:', error);
            toast({
                title: t('professions.errors.adding.title'),
                description: error.response?.data?.message || t('professions.errors.generic'),
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSuggestion = (profession) => {
        setInputValue('');
        setSuggestions([]);
        updateProfession({
            profession_id: profession.id,
            full_profession: null
        });
    };

    const handleAddProfession = () => {
        if (!inputValue.trim()) return;

        const existingProfession = suggestions.length > 0 ? suggestions[0] : null;

        if (existingProfession) {
            handleSelectSuggestion(existingProfession);
        } else {
            const manualText = inputValue.trim();
            setInputValue('');
            updateProfession({
                profession_id: null,
                full_profession: manualText
            });
        }
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            handleAddProfession();
        }
    };

    const handleClearProfession = async () => {
        try {
            setLoading(true);
            const response = await axios.delete(`/user-professions/${auth.user.id}`);

            if (response.data.success) {
                setCurrentProfession({
                    type: null,
                    data: null,
                    manualText: ''
                });

                onUpdate(null, '');

                toast({
                    title: t('professions.success.removed.title'),
                    description: t('professions.success.removed.description')
                });
            }
        } catch (error) {
            console.error('Error clearing profession:', error);
            toast({
                title: t('professions.errors.removing.title'),
                description: error.response?.data?.message || t('professions.errors.generic'),
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    // Déterminer si nous avons une profession actuelle
    const hasProfession = currentProfession.type !== null;

    return (
        <div className="space-y-6">


            <Card className="border-amber-100 dark:border-amber-900/50 shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-amber-500 dark:text-amber-400" />
{t('cv.title.section', 'Titre du CV')}
                        </div>
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
{t('cv.title.description', 'Choisissez le titre professionnel qui apparaîtra sur votre CV')}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="flex items-stretch gap-2">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                className="w-full p-3 border border-amber-200 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-900 dark:border-amber-800 dark:text-white"
                                placeholder={t('cv.title.placeholder', 'Ex: Développeur Web, Ingénieur, Chef de projet...')}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleInputKeyDown}
                                disabled={loading}
                            />

                            {suggestions.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg dark:bg-gray-800 border border-amber-200 dark:border-amber-800">
                                    {suggestions.map((profession) => (
                                        <div
                                            key={profession.id}
                                            className="px-4 py-3 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/30 text-base touch-manipulation"
                                            onClick={() => handleSelectSuggestion(profession)}
                                        >
                                            {getLocalizedName(profession)}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleAddProfession}
                            disabled={loading || !inputValue.trim()}
                            className="min-w-16 px-4 py-3 bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white dark:from-amber-400 dark:to-purple-400 dark:hover:from-amber-500 dark:hover:to-purple-500 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={t('professions.actions.add', 'Ajouter')}
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
{t('cv.title.help', 'Ce titre apparaîtra en haut de votre CV. Choisissez un titre qui correspond à votre domaine ou au poste visé.')}
                    </div>

                    {/* Section profession actuelle */}
                    {hasProfession && (
                        <div className="rounded-lg bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/20 dark:to-purple-900/20 p-4 border border-amber-100 dark:border-amber-800">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                                    <h3 className="text-lg font-semibold dark:text-white">
{t('cv.title.current', 'Titre actuel')}
                                    </h3>
                                </div>
                                <button
                                    onClick={handleClearProfession}
                                    disabled={loading}
                                    className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                                    aria-label={t('professions.actions.remove', 'Supprimer')}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                <Badge
                                    variant="secondary"
                                    className={`
                    ${currentProfession.type === 'standard'
                                        ? 'bg-gradient-to-r from-amber-100 to-purple-100 hover:from-amber-200 hover:to-purple-200 dark:from-amber-900/40 dark:to-purple-900/40'
                                        : 'bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200 dark:from-purple-900/40 dark:to-blue-900/40'
                                    }
                    text-gray-800 dark:text-gray-200 py-2 px-3 text-base`}
                                >
                                    {currentProfession.type === 'standard'
                                        ? getLocalizedName(currentProfession.data)
                                        : currentProfession.manualText}

                                    {currentProfession.type === 'manual' && (
                                        <span className="ml-2 px-1 py-0.5 text-[10px] rounded bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200">
                      {t('professions.manual.tag', 'Manuel')}
                    </span>
                                    )}
                                </Badge>

                                {currentProfession.type === 'standard' && currentProfession.data?.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                        {currentProfession.data.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
