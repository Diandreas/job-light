import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from "@/Components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Input } from "@/Components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Search, Plus, X, BookOpen, Edit, Check } from 'lucide-react';
import { useToast } from "@/Components/ui/use-toast"
import { ScrollArea } from "@/Components/ui/scroll-area";
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/Components/ui/dialog";
import { Textarea } from "@/Components/ui/textarea";
import { Label } from "@/Components/ui/label";

interface Competence {
    id: number | string;
    name: string;
    name_en: string;
    description: string;
    is_manual?: boolean;
}

interface Props {
    auth: { user: { id: number } };
    availableCompetences: Competence[];
    initialUserCompetences: Competence[];
    onUpdate: (competences: Competence[]) => void;
}

const getLocalizedName = (competence: Competence, currentLanguage: string): string => {
    if (currentLanguage === 'en' && competence.name_en) {
        return competence.name_en;
    }
    return competence.name;
};

const CompetenceManager: React.FC<Props> = ({ auth, availableCompetences, initialUserCompetences, onUpdate }) => {
    const { t, i18n } = useTranslation();
    const [selectedCompetenceId, setSelectedCompetenceId] = useState<number | string | null>(null);
    const [userCompetences, setUserCompetences] = useState<Competence[]>(initialUserCompetences);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    const [showAddManualDialog, setShowAddManualDialog] = useState(false);
    const [newManualCompetence, setNewManualCompetence] = useState<{ name: string; name_en: string; description: string }>({
        name: '',
        name_en: '',
        description: ''
    });

    useEffect(() => {
        setUserCompetences(initialUserCompetences);
    }, [initialUserCompetences]);

    const filteredAvailableCompetences = useMemo(() => {
        const lowercaseSearchTerm = searchTerm.toLowerCase();
        const userCompetenceIds = new Set(userCompetences.map(c => c.id));

        return availableCompetences
            .filter(competence =>
                getLocalizedName(competence, i18n.language)
                    .toLowerCase()
                    .includes(lowercaseSearchTerm) &&
                !userCompetenceIds.has(competence.id)
            )
            .sort((a, b) =>
                getLocalizedName(a, i18n.language)
                    .localeCompare(getLocalizedName(b, i18n.language))
            );
    }, [availableCompetences, userCompetences, searchTerm, i18n.language]);

    const sortedUserCompetences = useMemo(() => {
        return [...userCompetences].sort((a, b) =>
            getLocalizedName(a, i18n.language)
                .localeCompare(getLocalizedName(b, i18n.language))
        );
    }, [userCompetences, i18n.language]);

    const handleAddCompetence = useCallback(async () => {
        if (!selectedCompetenceId) {
            toast({
                title: t('competences.errors.select.title'),
                description: t('competences.errors.select.description'),
                variant: "destructive",
            });
            return;
        }

        try {
            await axios.post('/user-competences', {
                user_id: auth.user.id,
                competence_id: selectedCompetenceId,
            });

            const newCompetence = availableCompetences.find(c => c.id === selectedCompetenceId);
            if (newCompetence) {
                const updatedCompetences = [...userCompetences, newCompetence];
                setUserCompetences(updatedCompetences);
                onUpdate(updatedCompetences);
                setSelectedCompetenceId(null);
                toast({
                    title: t('competences.success.added.title'),
                    description: t('competences.success.added.description', {
                        name: getLocalizedName(newCompetence, i18n.language)
                    }),
                });
            }
        } catch (error) {
            toast({
                title: t('competences.errors.adding.title'),
                description: error.response?.data?.message || t('competences.errors.generic'),
                variant: "destructive",
            });
        }
    }, [selectedCompetenceId, auth.user.id, availableCompetences, userCompetences, onUpdate, toast, t, i18n.language]);

    const handleAddManualCompetence = useCallback(async () => {
        if (!newManualCompetence.name.trim()) {
            toast({
                title: t('competences.errors.manual.title'),
                description: t('competences.errors.manual.description'),
                variant: "destructive",
            });
            return;
        }

        try {
            // Créer un nouvel ID unique pour la compétence manuelle
            const newId = `manual-${Date.now()}`;
            const manualCompetence: Competence = {
                id: newId,
                name: newManualCompetence.name.trim(),
                name_en: newManualCompetence.name_en.trim() || newManualCompetence.name.trim(),
                description: newManualCompetence.description.trim(),
                is_manual: true
            };

            // Enregistrer la compétence manuelle dans le profil de l'utilisateur
            await axios.post('/user-manual-competences', {
                user_id: auth.user.id,
                competence: manualCompetence
            });

            // Ajouter la compétence à la liste locale
            const updatedCompetences = [...userCompetences, manualCompetence];
            setUserCompetences(updatedCompetences);
            onUpdate(updatedCompetences);

            // Réinitialiser le formulaire
            setNewManualCompetence({ name: '', name_en: '',description:'' });
            setShowAddManualDialog(false);

            toast({
                title: t('competences.success.manual.title'),
                description: t('competences.success.manual.description', {
                    name: manualCompetence.name
                }),
            });
        } catch (error) {
            toast({
                title: t('competences.errors.adding.title'),
                description: error.response?.data?.message || t('competences.errors.generic'),
                variant: "destructive",
            });
        }
    }, [newManualCompetence, auth.user.id, userCompetences, onUpdate, toast, t]);

    const handleRemoveCompetence = useCallback(async (competenceId: number | string) => {
        try {
            if (typeof competenceId === 'string' && competenceId.startsWith('manual-')) {
                // Supprimer une compétence manuelle
                await axios.delete(`/user-manual-competences/${auth.user.id}/${competenceId}`);
            } else {
                // Supprimer une compétence standard
                await axios.delete(`/user-competences/${auth.user.id}/${competenceId}`);
            }

            const updatedCompetences = userCompetences.filter(c => c.id !== competenceId);
            setUserCompetences(updatedCompetences);
            onUpdate(updatedCompetences);
            toast({
                title: t('competences.success.removed.title'),
                description: t('competences.success.removed.description'),
            });
        } catch (error) {
            toast({
                title: t('competences.errors.removing.title'),
                description: error.response?.data?.message || t('competences.errors.generic'),
                variant: "destructive",
            });
        }
    }, [auth.user.id, userCompetences, onUpdate, toast, t]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        {t('competences.title')}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        {t('competences.description')}
                    </p>
                </div>
            </div>

            <Card className="border-amber-100 dark:border-amber-900/50 shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                            {t('competences.card.title')}
                        </div>
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        {t('competences.card.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-2">
                        <div className="flex-1">
                            <Select
                                value={selectedCompetenceId?.toString() || ''}
                                onValueChange={(value) => {
                                    // Vérifier si la valeur est numérique ou non
                                    const numericValue = parseInt(value);
                                    setSelectedCompetenceId(!isNaN(numericValue) ? numericValue : value);
                                }}
                            >
                                <SelectTrigger className="border-amber-200 dark:border-amber-800 focus:ring-amber-500 dark:focus:ring-amber-400 dark:bg-gray-900">
                                    <SelectValue placeholder={t('competences.select.placeholder')} />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-900">
                                    {filteredAvailableCompetences.map((competence) => (
                                        <SelectItem key={competence.id} value={competence.id.toString()}>
                                            {getLocalizedName(competence, i18n.language)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleAddCompetence}
                                className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600
                                         dark:from-amber-400 dark:to-purple-400 dark:hover:from-amber-500 dark:hover:to-purple-500
                                         text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                {t('competences.actions.add')}
                            </Button>

                            <Dialog open={showAddManualDialog} onOpenChange={setShowAddManualDialog}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/30
                                                text-amber-700 dark:text-amber-300"
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        {t('competences.actions.addManual')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="dark:bg-gray-900 border-amber-200 dark:border-amber-800">
                                    <DialogHeader>
                                        <DialogTitle className="text-amber-700 dark:text-amber-300">
                                            {t('competences.manual.title')}
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="competence-name">{t('competences.manual.name')}</Label>
                                            <Input
                                                id="competence-name"
                                                value={newManualCompetence.name}
                                                onChange={(e) => setNewManualCompetence({ ...newManualCompetence, name: e.target.value })}
                                                className="border-amber-200 dark:border-amber-800 focus:ring-amber-500 dark:focus:ring-amber-400 dark:bg-gray-900"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="competence-name-en">{t('competences.manual.nameEn')}</Label>
                                            <Input
                                                id="competence-name-en"
                                                value={newManualCompetence.name_en}
                                                onChange={(e) => setNewManualCompetence({ ...newManualCompetence, name_en: e.target.value })}
                                                className="border-amber-200 dark:border-amber-800 focus:ring-amber-500 dark:focus:ring-amber-400 dark:bg-gray-900"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline" className="border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300">
                                                {t('common.cancel')}
                                            </Button>
                                        </DialogClose>
                                        <Button
                                            onClick={handleAddManualCompetence}
                                            className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600
                                                    dark:from-amber-400 dark:to-purple-400 dark:hover:from-amber-500 dark:hover:to-purple-500
                                                    text-white"
                                        >
                                            <Check className="w-4 h-4 mr-2" />
                                            {t('competences.actions.save')}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-amber-500 dark:text-amber-400" />
                        <Input
                            type="text"
                            placeholder={t('competences.search.placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 border-amber-200 dark:border-amber-800 focus:ring-amber-500
                                     dark:focus:ring-amber-400 dark:bg-gray-900"
                        />
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                            {t('competences.list.title', { count: userCompetences.length })}
                        </h3>
                        <ScrollArea className="h-[200px] pr-4">
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
                                                        ? 'bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200 dark:from-purple-900/40 dark:to-blue-900/40 dark:hover:from-purple-900/60 dark:hover:to-blue-900/60'
                                                        : 'bg-gradient-to-r from-amber-100 to-purple-100 hover:from-amber-200 hover:to-purple-200 dark:from-amber-900/40 dark:to-purple-900/40 dark:hover:from-amber-900/60 dark:hover:to-purple-900/60'
                                                    }
                                                    text-gray-800 dark:text-gray-200
                                                    flex items-center gap-2 py-2 pl-3 pr-2`}
                                            >
                                                <span>{getLocalizedName(competence, i18n.language)}</span>
                                                {competence.is_manual && (
                                                    <span className="px-1 py-0.5 text-[10px] rounded bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200">
                                                        {t('competences.manual.tag')}
                                                    </span>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveCompetence(competence.id)}
                                                    className="h-5 w-5 p-0 hover:bg-red-100 hover:text-red-500
                                                             dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </Badge>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {userCompetences.length === 0 && (
                                    <p className="text-gray-500 dark:text-gray-400 text-sm italic w-full text-center py-4">
                                        {t('competences.list.empty')}
                                    </p>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CompetenceManager;
