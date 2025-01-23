import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from "@/Components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Input } from "@/Components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Search, Plus, X } from 'lucide-react';
import { useToast } from "@/Components/ui/use-toast"
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

interface Competence {
    id: number;
    name: string;
    description: string;
}

interface Props {
    auth: { user: { id: number } };
    availableCompetences: Competence[];
    initialUserCompetences: Competence[];
}

const CompetenceManager: React.FC<Props> = ({ auth, availableCompetences, initialUserCompetences }) => {
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
        return availableCompetences.filter(competence =>
            competence.name.toLowerCase().includes(lowercaseSearchTerm) &&
            !userCompetenceIds.has(competence.id)
        );
    }, [availableCompetences, userCompetences, searchTerm]);

    const handleAddCompetence = useCallback(async () => {
        if (!selectedCompetenceId) {
            toast({
                title: "Please select a competence",
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
                setUserCompetences(prev => [...prev, newCompetence]);
                setSelectedCompetenceId(null);
                toast({
                    title: "Competence assigned successfully",
                    description: `${newCompetence.name} has been added to your competences.`,
                });
            }
        } catch (error) {
            toast({
                title: "Error assigning competence",
                description: error.response?.data?.message || 'An error occurred.',
                variant: "destructive",
            });
        }
    }, [selectedCompetenceId, auth.user.id, availableCompetences, toast]);

    const handleRemoveCompetence = useCallback(async (competenceId: number) => {
        Swal.fire({
            title: 'Remove Competence?',
            text: "Are you sure you want to remove this competence?",
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
                axios.delete(`/user-competences/${auth.user.id}/${competenceId}`)
                    .then(() => {
                        setUserCompetences(prev => prev.filter(c => c.id !== competenceId));
                        Swal.fire({
                            title: 'Competence removed',
                            text: 'The competence has been removed from your profile.',
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
                            title: 'Error removing competence',
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
    }, [auth.user.id]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-3xl mx-auto"
        >
            <Card>
                <CardHeader>
                    <motion.h2
                        initial={{ y: -50 }}
                        animate={{ y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="text-2xl font-bold flex items-center"
                    >
                        Manage Your Competences
                    </motion.h2>
                </CardHeader>
                <CardContent className="space-y-4">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center space-x-2"
                    >
                        <Select
                            value={selectedCompetenceId?.toString() || ''}
                            onValueChange={(value) => setSelectedCompetenceId(parseInt(value))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a competence" />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredAvailableCompetences.map((competence) => (
                                    <SelectItem key={competence.id} value={competence.id.toString()}>
                                        {competence.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleAddCompetence}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add
                        </Button>
                    </motion.div>
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                    >
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search competences..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </motion.div>
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h3 className="text-lg font-semibold mb-2">Your Competences</h3>
                        <div className="flex flex-wrap gap-2">
                            <AnimatePresence>
                                {userCompetences.map((competence) => (
                                    <motion.div
                                        key={competence.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Badge
                                            variant="secondary"
                                            className="flex items-center space-x-1"
                                        >
                                            <span>{competence.name}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-4 w-4 p-0"
                                                onClick={() => handleRemoveCompetence(competence.id)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </Badge>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </CardContent>
                <CardFooter>
                    <p className="text-sm text-gray-500">
                        Total competences: {userCompetences.length}
                    </p>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default CompetenceManager;
