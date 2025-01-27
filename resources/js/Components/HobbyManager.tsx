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

interface Hobby {
    id: number;
    name: string;
}

interface Props {
    auth: any;
    availableHobbies: Hobby[];
    initialUserHobbies: Hobby[];
    onUpdate: (hobbies: Hobby[]) => void;
}

const HobbyManager: React.FC<Props> = ({ auth, availableHobbies, initialUserHobbies, onUpdate }) => {
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
                hobby.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !userHobbies.some(userHobby => userHobby.id === hobby.id)
            )
            .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
    }, [availableHobbies, userHobbies, searchTerm]);

    const sortedUserHobbies = useMemo(() => {
        return [...userHobbies].sort((a, b) =>
            a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })
        );
    }, [userHobbies]);

    const handleAddHobby = async () => {
        if (!selectedHobbyId) {
            toast({
                title: "Erreur",
                description: "Veuillez sélectionner un centre d'intérêt",
                variant: 'destructive'
            });
            return;
        }

        try {
            await axios.post('/user-hobbies', {
                user_id: auth.user.id,
                hobby_id: selectedHobbyId,
            });

            const newHobby = availableHobbies.find(h => h.id === selectedHobbyId);
            if (newHobby) {
                const updatedHobbies = [...userHobbies, newHobby];
                setUserHobbies(updatedHobbies);
                onUpdate(updatedHobbies);
                setSelectedHobbyId(null);
                toast({
                    title: "Centre d'intérêt ajouté",
                    description: `${newHobby.name} a été ajouté à votre profil.`
                });
            }
        } catch (error) {
            toast({
                title: "Erreur",
                description: error.response?.data?.message || "Une erreur est survenue.",
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
                title: "Centre d'intérêt retiré",
                description: "L'élément a été retiré de votre profil."
            });
        } catch (error) {
            toast({
                title: "Erreur",
                description: error.response?.data?.message || "Une erreur est survenue.",
                variant: 'destructive'
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Centres d'intérêt</h2>
                    <p className="text-gray-500">Personnalisez votre profil avec vos passions</p>
                </div>
            </div>

            <Card className="border-amber-100 shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                        <div className="flex items-center gap-2">
                            <Heart className="w-5 h-5 text-amber-500" />
                            Gérer mes centres d'intérêt
                        </div>
                    </CardTitle>
                    <CardDescription>
                        Ajoutez les activités qui vous passionnent
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-2">
                        <div className="flex-1">
                            <Select
                                value={selectedHobbyId?.toString() || ''}
                                onValueChange={(value) => setSelectedHobbyId(parseInt(value))}
                            >
                                <SelectTrigger className="border-amber-200 focus:ring-amber-500">
                                    <SelectValue placeholder="Sélectionner un centre d'intérêt" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredHobbies.map((hobby) => (
                                        <SelectItem key={hobby.id} value={hobby.id.toString()}>
                                            {hobby.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={handleAddHobby}
                            className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Ajouter
                        </Button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-amber-500" />
                        <Input
                            type="text"
                            placeholder="Rechercher des centres d'intérêt..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 border-amber-200 focus:ring-amber-500"
                        />
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            <h3 className="text-lg font-semibold text-gray-800">
                                Vos centres d'intérêt ({sortedUserHobbies.length})
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
                                                className="bg-gradient-to-r from-amber-100 to-purple-100 hover:from-amber-200 hover:to-purple-200 text-gray-800 flex items-center gap-2 py-2 pl-3 pr-2"
                                            >
                                                <span>{hobby.name}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveHobby(hobby.id)}
                                                    className="h-5 w-5 p-0 hover:bg-red-100 hover:text-red-500"
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </Badge>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {sortedUserHobbies.length === 0 && (
                                    <p className="text-gray-500 text-sm italic w-full text-center py-4">
                                        Ajoutez vos premiers centres d'intérêt pour personnaliser votre profil !
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
