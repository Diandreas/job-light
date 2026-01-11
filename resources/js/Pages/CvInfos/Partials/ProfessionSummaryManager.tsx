import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { useToast } from '@/Components/ui/use-toast';
import { Textarea } from "@/Components/ui/textarea";
import { Input } from "@/Components/ui/input";
import { Badge } from '@/Components/ui/badge';
import {
    FileText, GraduationCap, Edit, Save, X, Check, Wand2
} from 'lucide-react';
import axios from "axios";
import { motion, AnimatePresence } from 'framer-motion';
import AIRephraseButton from '@/Components/AIRephraseButton';

interface Summary {
    id: number;
    name: string;
    description: string;
}

interface Profession {
    id: number;
    name: string;
    name_en?: string;
    description?: string;
}

interface Props {
    auth: any;
    summaries: Summary[];
    selectedSummary: Summary[];
    availableProfessions: Profession[];
    initialUserProfession: Profession | null;
    onSummaryUpdate: (summaries: Summary[]) => void;
    onProfessionUpdate: (profession: Profession | null, manualText: string | null) => void;
}

const ProfessionSummaryManager: React.FC<Props> = ({
    auth,
    summaries: initialSummaries,
    selectedSummary: initialSelectedSummary,
    availableProfessions,
    initialUserProfession,
    onSummaryUpdate,
    onProfessionUpdate
}) => {
    const { t, i18n } = useTranslation();
    const [selectedSummary, setSelectedSummary] = useState<Summary[]>(initialSelectedSummary);
    const [isEditingSummary, setIsEditingSummary] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    // États pour la profession
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<Profession[]>([]);
    const [currentProfession, setCurrentProfession] = useState({
        type: initialUserProfession ? 'standard' : (auth.user.full_profession ? 'manual' : null),
        data: initialUserProfession || null,
        manualText: auth.user.full_profession || ''
    });

    // États pour le résumé (le titre = profession)
    const [summaryText, setSummaryText] = useState(selectedSummary[0]?.description || '');

    const { data: summaryData, setData: setSummaryData, processing: summaryProcessing } = useForm({
        description: selectedSummary[0]?.description || '',
    });

    // Templates rapides pour le résumé
    const summaryTemplates = [
        "Professionnel motivé avec une solide expérience cherchant de nouveaux défis pour contribuer au succès de votre équipe.",
        "Étudiant passionné et dynamique avec une forte capacité d'apprentissage et un esprit d'équipe développé.",
        "Professionnel expérimenté capable de mener des projets complexes et d'atteindre les objectifs fixés.",
        "Candidat en reconversion professionnelle apportant une perspective unique et une motivation exceptionnelle."
    ];

    // Synchroniser le résumé avec les props
    useEffect(() => {
        setSelectedSummary(initialSelectedSummary);
        if (initialSelectedSummary[0]) {
            setSummaryText(initialSelectedSummary[0].description);
            setSummaryData('description', initialSelectedSummary[0].description);
        }
    }, [initialSelectedSummary]);

    // Synchroniser la profession avec les props (important pour le rechargement de page)
    useEffect(() => {
        if (initialUserProfession) {
            setCurrentProfession({
                type: 'standard',
                data: initialUserProfession,
                manualText: ''
            });
        } else if (auth.user.full_profession) {
            setCurrentProfession({
                type: 'manual',
                data: null,
                manualText: auth.user.full_profession
            });
        } else {
            setCurrentProfession({
                type: null,
                data: null,
                manualText: ''
            });
        }
    }, [initialUserProfession, auth.user.full_profession]);

    // Filtrer les suggestions de profession
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

    const showToast = (title: string, description: string, variant: "default" | "destructive" = "default") => {
        toast({
            title,
            description,
            variant,
        });
    };

    const getLocalizedName = (profession: Profession) => {
        if (!profession) return '';
        return (i18n.language === 'en' && profession.name_en) ? profession.name_en : profession.name;
    };

    // La profession devient automatiquement le titre du CV
    const getCurrentTitle = () => {
        if (currentProfession.type === 'standard') {
            return getLocalizedName(currentProfession.data);
        } else if (currentProfession.type === 'manual') {
            return currentProfession.manualText;
        }
        return '';
    };

    // Sauvegarde du résumé
    const handleSaveSummary = async () => {
        try {
            setIsLoading(true);
            if (selectedSummary[0]) {
                // Modifier le résumé existant
                const response = await axios.put(route('summaries.update', selectedSummary[0].id), {
                    name: selectedSummary[0].name,
                    description: summaryText
                });
                const updatedSummary = response.data.summary;
                setSelectedSummary([updatedSummary]);
                onSummaryUpdate([updatedSummary]);
            } else {
                // Créer un nouveau résumé
                const response = await axios.post(route('summaries.store'), {
                    name: 'Mon résumé',
                    description: summaryText
                });
                const newSummary = response.data.summary;
                setSelectedSummary([newSummary]);
                onSummaryUpdate([newSummary]);
            }
            setIsEditingSummary(false);
            showToast("Succès", "Résumé mis à jour");
        } catch (error: any) {
            showToast("Erreur", "Erreur lors de la sauvegarde", "destructive");
        } finally {
            setIsLoading(false);
        }
    };

    // Fonctions pour la profession (qui devient le titre CV)
    const updateProfession = async (professionsData: any) => {
        try {
            setIsLoading(true);

            const response = await axios.post('/user-professions', {
                user_id: auth.user.id,
                ...professionsData
            });

            if (response.data.success) {
                let newTitle = '';
                if (professionsData.profession_id) {
                    const selectedProfession = availableProfessions.find(p => p.id === professionsData.profession_id);
                    newTitle = getLocalizedName(selectedProfession);
                    setCurrentProfession({
                        type: 'standard',
                        data: selectedProfession,
                        manualText: ''
                    });
                    onProfessionUpdate(selectedProfession, null);
                } else {
                    newTitle = professionsData.full_profession;
                    setCurrentProfession({
                        type: 'manual',
                        data: null,
                        manualText: professionsData.full_profession
                    });
                    onProfessionUpdate(null, professionsData.full_profession);
                }

                showToast("Succès", `Titre CV mis à jour : "${newTitle}"`);
            }
        } catch (error: any) {
            showToast("Erreur", error.response?.data?.message || "Erreur lors de la mise à jour", "destructive");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectSuggestion = (profession: Profession) => {
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

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            handleAddProfession();
        }
    };

    const handleClearProfession = async () => {
        try {
            setIsLoading(true);
            const response = await axios.delete(`/user-professions/${auth.user.id}`);

            if (response.data.success) {
                setCurrentProfession({
                    type: null,
                    data: null,
                    manualText: ''
                });
                onProfessionUpdate(null, '');
                showToast("Succès", "Profession supprimée");
            }
        } catch (error: any) {
            showToast("Erreur", "Erreur lors de la suppression", "destructive");
        } finally {
            setIsLoading(false);
        }
    };

    const hasProfession = currentProfession.type !== null;

    return (
        <div className="space-y-4">
            {/* Header compact */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                    {t('cvInterface.steps.step2')}
                </h2>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${hasProfession ? 'bg-green-400' : 'bg-gray-300'}`} />
                        <span>Titre/Profession</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${summaryText ? 'bg-green-400' : 'bg-gray-300'}`} />
                        <span>Résumé</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Colonne gauche : Profession (= Titre CV) */}
                <div className="space-y-4">
                    {/* Profession qui devient le titre du CV */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3 border">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-amber-500" />
                            <h3 className="font-medium text-gray-800 dark:text-white">Titre du CV / Profession</h3>
                        </div>

                        {/* Affichage du titre actuel */}
                        {hasProfession && (
                            <div className="p-3 bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/20 dark:to-purple-900/20 rounded border border-amber-200 dark:border-amber-700 mb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-amber-600" />
                                        <span className="font-medium text-amber-800 dark:text-amber-200">
                                            {getCurrentTitle()}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearProfession}
                                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleInputKeyDown}
                                    placeholder="Saisissez votre titre/profession..."
                                    className="text-sm"
                                    disabled={isLoading}
                                />

                                {suggestions.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg dark:bg-gray-800 border max-h-32 overflow-y-auto">
                                        {suggestions.map((profession) => (
                                            <div
                                                key={profession.id}
                                                className="px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                                                onClick={() => handleSelectSuggestion(profession)}
                                            >
                                                {getLocalizedName(profession)}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={handleAddProfession}
                                disabled={isLoading || !inputValue.trim()}
                                size="sm"
                                className="h-8 w-8 p-0 bg-gradient-to-r from-amber-500 to-purple-500"
                            >
                                <Check className="w-3 h-3" />
                            </Button>
                        </div>

                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Cette profession deviendra automatiquement le titre de votre CV
                        </div>
                    </div>
                </div>

                {/* Colonne droite : Résumé */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3 border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-500" />
                            <h3 className="font-medium text-gray-800 dark:text-white">Résumé professionnel</h3>
                        </div>
                        {!isEditingSummary && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditingSummary(true)}
                                className="h-7 w-7 p-0"
                            >
                                <Edit className="w-3 h-3" />
                            </Button>
                        )}
                    </div>

                    {isEditingSummary ? (
                        <div className="space-y-3">
                            <Textarea
                                value={summaryText}
                                onChange={(e) => setSummaryText(e.target.value)}
                                placeholder="Décrivez votre profil professionnel..."
                                rows={4}
                                className="text-sm"
                            />
                            <div className="flex justify-end">
                                <AIRephraseButton
                                    text={summaryText}
                                    onRephrased={setSummaryText}
                                />
                            </div>

                            {/* Templates rapides */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    Templates rapides :
                                </label>
                                <div className="grid grid-cols-1 gap-1">
                                    {summaryTemplates.map((template, index) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSummaryText(template)}
                                            className="text-xs justify-start h-auto p-2 text-left"
                                        >
                                            <Wand2 className="w-3 h-3 mr-1 flex-shrink-0" />
                                            <span className="truncate">{template.substring(0, 50)}...</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSaveSummary}
                                    disabled={isLoading || !summaryText.trim()}
                                    size="sm"
                                    className="flex-1 h-7 bg-gradient-to-r from-emerald-500 to-teal-500"
                                >
                                    <Save className="w-3 h-3 mr-1" />
                                    Sauver
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setIsEditingSummary(false);
                                        setSummaryText(selectedSummary[0]?.description || '');
                                    }}
                                    className="h-7"
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {summaryText || "Cliquez pour ajouter votre résumé professionnel"}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfessionSummaryManager;