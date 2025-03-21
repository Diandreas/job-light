import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Heart, X, Search, Plus, Sparkles } from 'lucide-react';
import { useToast } from '@/Components/ui/use-toast';
import { ScrollArea } from "@/Components/ui/scroll-area";
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface Hobby {
    id: number;
    name: string;
    name_en: string;
}

interface Props {
    auth: any;
    availableHobbies: Hobby[];
    initialUserHobbies: Hobby[];
    onUpdate: (hobbies: Hobby[]) => void;
}

const getLocalizedName = (hobby: Hobby, currentLanguage: string): string => {
    if (currentLanguage === 'en' && hobby.name_en) {
        return hobby.name_en;
    }
    return hobby.name;
};

const HobbyManager: React.FC<Props> = ({ auth, availableHobbies, initialUserHobbies, onUpdate }) => {
    const { t, i18n } = useTranslation();
    const [selectedHobbyId, setSelectedHobbyId] = useState<number | null>(null);
    const [userHobbies, setUserHobbies] = useState<Hobby[]>(initialUserHobbies);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        setUserHobbies(initialUserHobbies);
    }, [initialUserHobbies]);

    const filteredHobbies = useMemo(() => {
        return availableHobbies
            .filter(hobby =>
                getLocalizedName(hobby, i18n.language)
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) &&
                !userHobbies.some(userHobby => userHobby.id === hobby.id)
            )
            .sort((a, b) =>
                getLocalizedName(a, i18n.language)
                    .localeCompare(getLocalizedName(b, i18n.language))
            );
    }, [availableHobbies, userHobbies, searchTerm, i18n.language]);

    const sortedUserHobbies = useMemo(() => {
        return [...userHobbies].sort((a, b) =>
            getLocalizedName(a, i18n.language)
                .localeCompare(getLocalizedName(b, i18n.language))
        );
    }, [userHobbies, i18n.language]);

    const handleAddHobby = async () => {
        if (!selectedHobbyId) {
            toast({
                title: t('hobbies.errors.selectHobby.title'),
                description: t('hobbies.errors.selectHobby.description'),
                variant: 'destructive'
            });
            return;
        }

        try {
            const response = await axios.post('/user-hobbies', {
                user_id: auth.user.id,
                hobby_id: selectedHobbyId,
            });

            if (response.data.success) {
                const newHobby = availableHobbies.find(h => h.id === selectedHobbyId);
                if (newHobby) {
                    const updatedHobbies = [...userHobbies, newHobby];
                    setUserHobbies(updatedHobbies);
                    onUpdate(updatedHobbies);
                    setSelectedHobbyId(null);
                    toast({
                        title: t('hobbies.success.added.title'),
                        description: t('hobbies.success.added.description', {
                            hobby: getLocalizedName(newHobby, i18n.language)
                        })
                    });
                }
            }
        } catch (error) {
            toast({
                title: t('hobbies.errors.adding.title'),
                description: error.response?.data?.message || t('hobbies.errors.generic'),
                variant: 'destructive'
            });
        }
    };

    const handleRemoveHobby = async (hobbyId: number) => {
        try {
            await axios.delete(`/user-hobbies/${auth.user.id}/${hobbyId}`);
            const updatedHobbies = userHobbies.filter(h => h.id !== hobbyId);
            setUserHobbies(updatedHobbies);
            onUpdate(updatedHobbies);
            toast({
                title: t('hobbies.success.removed.title'),
                description: t('hobbies.success.removed.description')
            });
        } catch (error) {
            toast({
                title: t('hobbies.errors.removing.title'),
                description: error.response?.data?.message || t('hobbies.errors.generic'),
                variant: 'destructive'
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">{t('hobbies.title')}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{t('hobbies.description')}</p>
                </div>
            </div>

            <Card className="border-amber-100 dark:border-amber-900/50 shadow-md dark:shadow-amber-900/10">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                        <div className="flex items-center gap-2">
                            <Heart className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                            {t('hobbies.card.title')}
                        </div>
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        {t('hobbies.card.description')}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-2">
                        <div className="flex-1">
                            <Select
                                value={selectedHobbyId?.toString() || ''}
                                onValueChange={(value) => setSelectedHobbyId(parseInt(value))}
                            >
                                <SelectTrigger className="border-amber-200 dark:border-amber-800 focus:ring-amber-500 dark:focus:ring-amber-400 dark:bg-gray-900">
                                    <SelectValue placeholder={t('hobbies.select.placeholder')} />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-900">
                                    {filteredHobbies.map((hobby) => (
                                        <SelectItem key={hobby.id} value={hobby.id.toString()}>
                                            {getLocalizedName(hobby, i18n.language)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={handleAddHobby}
                            className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white dark:from-amber-400 dark:to-purple-400 dark:hover:from-amber-500 dark:hover:to-purple-500"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {t('hobbies.actions.add')}
                        </Button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-amber-500 dark:text-amber-400" />
                        <Input
                            type="text"
                            placeholder={t('hobbies.search.placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 border-amber-200 dark:border-amber-800 focus:ring-amber-500 dark:focus:ring-amber-400 dark:bg-gray-900"
                        />
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                            <h3 className="text-lg font-semibold dark:text-white">
                                {t('hobbies.list.title', { count: sortedUserHobbies.length })}
                            </h3>
                        </div>

                        <ScrollArea className="h-[200px] pr-4">
                            <div className="flex flex-wrap gap-2">
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
                                                className="bg-gradient-to-r from-amber-100 to-purple-100 hover:from-amber-200 hover:to-purple-200
                                                         dark:from-amber-900/40 dark:to-purple-900/40 dark:hover:from-amber-900/60 dark:hover:to-purple-900/60
                                                         text-gray-800 dark:text-gray-200 flex items-center gap-2 py-2 pl-3 pr-2"
                                            >
                                                <span>{getLocalizedName(hobby, i18n.language)}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveHobby(hobby.id)}
                                                    className="h-5 w-5 p-0 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </Badge>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {sortedUserHobbies.length === 0 && (
                                    <p className="text-gray-500 dark:text-gray-400 text-sm italic w-full text-center py-4">
                                        {t('hobbies.list.empty')}
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

export default HobbyManager;
