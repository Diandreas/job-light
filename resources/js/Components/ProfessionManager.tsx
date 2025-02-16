import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Briefcase, X, Search, GraduationCap, CheckCircle, Edit, List } from 'lucide-react';
import { useToast } from '@/Components/ui/use-toast';
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface Profession {
    id: number;
    name: string;
    description: string;
}

interface Props {
    auth: any;
    availableProfessions: Profession[];
    initialUserProfession: Profession | null;
    onUpdate: (profession: Profession | null, fullProfession?: string) => void;
}

const ProfessionManager: React.FC<Props> = ({ auth, availableProfessions, initialUserProfession, onUpdate }) => {
    const { t } = useTranslation();
    const [selectedProfessionId, setSelectedProfessionId] = useState<number | null>(initialUserProfession?.id || null);
    const [userProfession, setUserProfession] = useState<Profession | null>(initialUserProfession);
    const [searchTerm, setSearchTerm] = useState('');
    const [manualProfession, setManualProfession] = useState(auth.user.full_profession || '');
    const [activeTab, setActiveTab] = useState(initialUserProfession ? 'select' : 'manual');
    const { toast } = useToast();

    useEffect(() => {
        setUserProfession(initialUserProfession);
        setSelectedProfessionId(initialUserProfession?.id || null);
    }, [initialUserProfession]);

    const filteredProfessions = useMemo(() => {
        return availableProfessions
            .filter(profession =>
                profession.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
    }, [availableProfessions, searchTerm]);

    const handleSelectProfession = async () => {
        if (!selectedProfessionId) {
            toast({
                title: t('professions.errors.select.title'),
                description: t('professions.errors.select.description'),
                variant: 'destructive'
            });
            return;
        }

        try {
            await axios.post('/user-professions', {
                user_id: auth.user.id,
                profession_id: selectedProfessionId,
                full_profession: null // Reset manual profession when selecting from list
            });

            const newProfession = availableProfessions.find(p => p.id === selectedProfessionId);
            if (newProfession) {
                setUserProfession(newProfession);
                setManualProfession('');
                onUpdate(newProfession);
                toast({
                    title: t('professions.success.updated.title'),
                    description: t('professions.success.updated.description', { profession: newProfession.name })
                });
            }
        } catch (error) {
            toast({
                title: t('professions.errors.adding.title'),
                description: error.response?.data?.message || t('professions.errors.generic'),
                variant: 'destructive'
            });
        }
    };

    const handleManualProfessionSubmit = async () => {
        if (!manualProfession.trim()) {
            toast({
                title: t('professions.errors.manual.title'),
                description: t('professions.errors.manual.description'),
                variant: 'destructive'
            });
            return;
        }

        try {
            await axios.post('/user-professions', {
                user_id: auth.user.id,
                profession_id: null,
                full_profession: manualProfession
            });

            setUserProfession(null);
            setSelectedProfessionId(null);
            onUpdate(null, manualProfession);
            toast({
                title: t('professions.success.manual.title'),
                description: t('professions.success.manual.description')
            });
        } catch (error) {
            toast({
                title: t('professions.errors.adding.title'),
                description: error.response?.data?.message || t('professions.errors.generic'),
                variant: 'destructive'
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">{t('professions.title')}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{t('professions.description')}</p>
                </div>
            </div>

            <Card className="border-amber-100 dark:border-amber-900/50 shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                            {t('professions.card.title')}
                        </div>
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        {t('professions.card.description')}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="select" className="flex items-center gap-2">
                                <List className="w-4 h-4" />
                                {t('professions.tabs.select')}
                            </TabsTrigger>
                            <TabsTrigger value="manual" className="flex items-center gap-2">
                                <Edit className="w-4 h-4" />
                                {t('professions.tabs.manual')}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="select" className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-amber-500 dark:text-amber-400" />
                                <Input
                                    type="text"
                                    placeholder={t('professions.search.placeholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 border-amber-200 dark:border-amber-800 focus:ring-amber-500 dark:focus:ring-amber-400 dark:bg-gray-900"
                                />
                            </div>

                            <div className="flex flex-col md:flex-row gap-2">
                                <div className="flex-1">
                                    <Select
                                        value={selectedProfessionId?.toString() || ''}
                                        onValueChange={(value) => setSelectedProfessionId(parseInt(value))}
                                    >
                                        <SelectTrigger className="border-amber-200 dark:border-amber-800 focus:ring-amber-500 dark:focus:ring-amber-400 dark:bg-gray-900">
                                            <SelectValue placeholder={t('professions.select.placeholder')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredProfessions.map((profession) => (
                                                <SelectItem key={profession.id} value={profession.id.toString()}>
                                                    {profession.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    onClick={handleSelectProfession}
                                    className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white dark:from-amber-400 dark:to-purple-400"
                                >
                                    {t('professions.actions.select')}
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="manual" className="space-y-4">
                            <div className="flex flex-col md:flex-row gap-2">
                                <Input
                                    type="text"
                                    placeholder={t('professions.manual.placeholder')}
                                    value={manualProfession}
                                    onChange={(e) => setManualProfession(e.target.value)}
                                    className="flex-1 border-amber-200 dark:border-amber-800 focus:ring-amber-500 dark:focus:ring-amber-400 dark:bg-gray-900"
                                />
                                <Button
                                    onClick={handleManualProfessionSubmit}
                                    className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white dark:from-amber-400 dark:to-purple-400"
                                >
                                    {t('professions.actions.save')}
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <AnimatePresence mode="wait">
                        {(userProfession || manualProfession) && (
                            <motion.div
                                key="profession"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="rounded-lg bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/20 dark:to-purple-900/20 p-4 border border-amber-100 dark:border-amber-800"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                                        <h3 className="text-lg font-semibold dark:text-white">
                                            {t('professions.current.title')}
                                        </h3>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Badge
                                        variant="secondary"
                                        className="bg-white dark:bg-gray-800 px-3 py-1.5 text-base dark:text-white"
                                    >
                                        {userProfession ? userProfession.name : manualProfession}
                                    </Badge>
                                    {userProfession && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {userProfession.description}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProfessionManager;
