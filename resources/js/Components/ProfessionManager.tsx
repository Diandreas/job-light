import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Briefcase, X, Search, GraduationCap, CheckCircle } from 'lucide-react';
import { useToast } from '@/Components/ui/use-toast';
import { ScrollArea } from "@/Components/ui/scroll-area";
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

interface Profession {
    id: number;
    name: string;
    description: string;
}

interface Props {
    auth: any;
    availableProfessions: Profession[];
    initialUserProfession: Profession | null;
    onUpdate: (profession: Profession | null) => void;
}

const ProfessionManager: React.FC<Props> = ({ auth, availableProfessions, initialUserProfession, onUpdate }) => {
    const [selectedProfessionId, setSelectedProfessionId] = useState<number | null>(initialUserProfession?.id || null);
    const [userProfession, setUserProfession] = useState<Profession | null>(initialUserProfession);
    const [searchTerm, setSearchTerm] = useState('');
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
                title: 'Erreur',
                description: 'Veuillez sélectionner une formation',
                variant: 'destructive'
            });
            return;
        }

        try {
            await axios.post('/user-professions', {
                user_id: auth.user.id,
                profession_id: selectedProfessionId,
            });

            const newProfession = availableProfessions.find(p => p.id === selectedProfessionId);
            if (newProfession) {
                setUserProfession(newProfession);
                onUpdate(newProfession);
                toast({
                    title: 'Formation mise à jour',
                    description: `Vous êtes maintenant enregistré en tant que ${newProfession.name}.`
                });
            }
        } catch (error) {
            toast({
                title: 'Erreur',
                description: error.response?.data?.message || 'Une erreur est survenue.',
                variant: 'destructive'
            });
        }
    };

    const handleRemoveProfession = async () => {
        try {
            await axios.delete(`/user-professions/${auth.user.id}`);
            setUserProfession(null);
            setSelectedProfessionId(null);
            onUpdate(null);
            toast({
                title: 'Formation retirée',
                description: 'Votre formation a été retirée avec succès.'
            });
        } catch (error) {
            toast({
                title: 'Erreur',
                description: error.response?.data?.message || 'Une erreur est survenue.',
                variant: 'destructive'
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Ma Formation</h2>
                    <p className="text-gray-500">Indiquez votre parcours académique</p>
                </div>
            </div>

            <Card className="border-amber-100 shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-amber-500" />
                            Gérer ma formation
                        </div>
                    </CardTitle>
                    <CardDescription>
                        Sélectionnez votre formation actuelle
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-amber-500" />
                        <Input
                            type="text"
                            placeholder="Rechercher une formation..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 border-amber-200 focus:ring-amber-500"
                        />
                    </div>

                    <div className="flex flex-col md:flex-row gap-2">
                        <div className="flex-1">
                            <Select
                                value={selectedProfessionId?.toString() || ''}
                                onValueChange={(value) => setSelectedProfessionId(parseInt(value))}
                            >
                                <SelectTrigger className="border-amber-200 focus:ring-amber-500">
                                    <SelectValue placeholder="Sélectionner une formation" />
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
                            className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white"
                        >
                            Sélectionner
                        </Button>
                    </div>

                    <AnimatePresence mode="wait">
                        {userProfession ? (
                            <motion.div
                                key="profession"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="rounded-lg bg-gradient-to-r from-amber-50 to-purple-50 p-4 border border-amber-100"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5 text-amber-500" />
                                        <h3 className="text-lg font-semibold">Formation actuelle</h3>
                                    </div>
                                    {/*<Button*/}
                                    {/*    variant="ghost"*/}
                                    {/*    size="sm"*/}
                                    {/*    onClick={handleRemoveProfession}*/}
                                    {/*    className="hover:bg-red-100 hover:text-red-500"*/}
                                    {/*>*/}
                                    {/*    <X className="h-4 w-4" />*/}
                                    {/*</Button>*/}
                                </div>
                                <div className="space-y-2">
                                    <Badge
                                        variant="secondary"
                                        className="bg-white px-3 py-1.5 text-base"
                                    >
                                        {userProfession.name}
                                    </Badge>
                                    <p className="text-sm text-gray-600">{userProfession.description}</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="no-profession"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-6 text-gray-500 italic"
                            >
                                Aucune formation sélectionnée
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProfessionManager;
