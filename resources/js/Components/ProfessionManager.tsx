import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card, CardHeader, CardContent, CardFooter } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Briefcase, X, Search } from 'lucide-react';
import { useToast } from '@/Components/ui/use-toast';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

interface Profession {
    id: number;
    name: string;
    description: string;
}

interface Props {
    auth: any;
    availableProfessions: Profession[];
    initialUserProfession: Profession | null;
}

const ProfessionManager: React.FC<Props> = ({ auth, availableProfessions, initialUserProfession }) => {
    const [selectedProfessionId, setSelectedProfessionId] = useState<number | null>(initialUserProfession?.id || null);
    const [userProfession, setUserProfession] = useState<Profession | null>(initialUserProfession);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        setUserProfession(initialUserProfession);
        setSelectedProfessionId(initialUserProfession?.id || null);
    }, [initialUserProfession]);

    const filteredProfessions = useMemo(() => {
        return availableProfessions.filter(profession =>
            profession.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [availableProfessions, searchTerm]);

    const handleSelectProfession = async () => {
        if (!selectedProfessionId) {
            toast({
                title: 'Please select a profession',
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
                toast({
                    title: 'Profession assigned successfully',
                    description: `You are now registered as a ${newProfession.name}.`
                });
            }
        } catch (error) {
            toast({
                title: 'Error assigning profession',
                description: error.response?.data?.message || 'An error occurred.',
                variant: 'destructive'
            });
        }
    };

    const handleRemoveProfession = async () => {
        Swal.fire({
            title: 'Remove Profession?',
            text: "Are you sure you want to remove your profession?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            toast: true,
            position: 'top-end',
            timer: 5000,
            timerProgressBar: true,
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`/user-professions/${auth.user.id}`)
                    .then(() => {
                        setUserProfession(null);
                        setSelectedProfessionId(null);
                        Swal.fire({
                            title: 'Profession removed',
                            text: 'Your profession has been removed from your profile.',
                            icon: 'success',
                            toast: true,
                            position: 'top-end',
                            timer: 3000,
                            timerProgressBar: true,
                        });
                    })
                    .catch(error => {
                        console.error(error);
                        Swal.fire({
                            title: 'Error removing profession',
                            text: error.response?.data?.message || 'An error occurred.',
                            icon: 'error',
                            toast: true,
                            position: 'top-end',
                            timer: 3000,
                            timerProgressBar: true,
                        });
                    });
            }
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto"
        >
            <Card>
                <CardHeader>
                    <motion.h2
                        initial={{ y: -50 }}
                        animate={{ y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="text-2xl font-bold flex items-center"
                    >
                        <Briefcase className="mr-2" /> Manage Your Profession
                    </motion.h2>
                </CardHeader>
                <CardContent className="space-y-4">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                    >
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search professions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </motion.div>
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center space-x-2"
                    >
                        <Select
                            value={selectedProfessionId?.toString() || ''}
                            onValueChange={(value) => setSelectedProfessionId(parseInt(value))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a profession" />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredProfessions.map((profession) => (
                                    <SelectItem key={profession.id} value={profession.id.toString()}>
                                        {profession.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleSelectProfession}>
                            Assign
                        </Button>
                    </motion.div>
                    {userProfession && (
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4"
                        >
                            <h3 className="text-lg font-semibold mb-2">Your Current Profession</h3>
                            <Badge
                                variant="secondary"
                                className="flex items-center justify-between w-full p-2"
                            >
                                <span className="text-lg">{userProfession.name}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRemoveProfession}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </Badge>
                        </motion.div>
                    )}
                </CardContent>
                <CardFooter>
                    <p className="text-sm text-gray-500">
                        {userProfession
                            ? "You can change your profession at any time."
                            : "Select a profession to get started."}
                    </p>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default ProfessionManager;
