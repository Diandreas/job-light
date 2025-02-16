import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from "@/Components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Input } from "@/Components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Search, Plus, X, BookOpen } from 'lucide-react';
import { useToast } from "@/Components/ui/use-toast"
import { ScrollArea } from "@/Components/ui/scroll-area";
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

interface Competence {
    id: number;
    name: string;
    description: string;
}

interface Props {
    auth: { user: { id: number } };
    availableCompetences: Competence[];
    initialUserCompetences: Competence[];
    onUpdate: (competences: Competence[]) => void;
}

const CompetenceManager: React.FC<Props> = ({ auth, availableCompetences, initialUserCompetences, onUpdate }) => {
    const { t } = useTranslation();
    const [selectedCompetenceId, setSelectedCompetenceId] = useState<number | null>(null);
    const [userCompetences, setUserCompetences] = useState<Competence[]>(initialUserCompetences);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        setUserCompetences(initialUserCompetences);
    }, [initialUserCompetences]);

    const filteredAvailableCompetences = useMemo(() => {
        const lowercaseSearchTerm = searchTerm.toLowerCase();
        const userCompetenceIds = new Set(userCompetences.map(c => c.id));

        return availableCompetences
            .filter(competence =>
                competence.name.toLowerCase().includes(lowercaseSearchTerm) &&
                !userCompetenceIds.has(competence.id)
            )
            .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
    }, [availableCompetences, userCompetences, searchTerm]);

    const sortedUserCompetences = useMemo(() => {
        return [...userCompetences].sort((a, b) =>
            a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })
        );
    }, [userCompetences]);

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
                    description: t('competences.success.added.description', { name: newCompetence.name }),
                });
            }
        } catch (error) {
            toast({
                title: t('competences.errors.adding.title'),
                description: error.response?.data?.message || t('competences.errors.generic'),
                variant: "destructive",
            });
        }
    }, [selectedCompetenceId, auth.user.id, availableCompetences, userCompetences, onUpdate, toast, t]);

    const handleRemoveCompetence = useCallback(async (competenceId: number) => {
        try {
            await axios.delete(`/user-competences/${auth.user.id}/${competenceId}`);
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
                                onValueChange={(value) => setSelectedCompetenceId(parseInt(value))}
                            >
                                <SelectTrigger className="border-amber-200 dark:border-amber-800 focus:ring-amber-500 dark:focus:ring-amber-400 dark:bg-gray-900">
                                    <SelectValue placeholder={t('competences.select.placeholder')} />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-900">
                                    {filteredAvailableCompetences.map((competence) => (
                                        <SelectItem key={competence.id} value={competence.id.toString()}>
                                            {competence.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={handleAddCompetence}
                            className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600
                                     dark:from-amber-400 dark:to-purple-400 dark:hover:from-amber-500 dark:hover:to-purple-500
                                     text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {t('competences.actions.add')}
                        </Button>
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
                                                className="bg-gradient-to-r from-amber-100 to-purple-100
                                                         hover:from-amber-200 hover:to-purple-200
                                                         dark:from-amber-900/40 dark:to-purple-900/40
                                                         dark:hover:from-amber-900/60 dark:hover:to-purple-900/60
                                                         text-gray-800 dark:text-gray-200
                                                         flex items-center gap-2 py-2 pl-3 pr-2"
                                            >
                                                <span>{competence.name}</span>
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
