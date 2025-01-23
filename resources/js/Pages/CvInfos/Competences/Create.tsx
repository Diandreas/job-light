// resources/js/Pages/CvInfos/Competences/Create.tsx

import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import InputLabel from "@/Components/InputLabel";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select"; // Assuming you have a Select component
import InputError from "@/Components/InputError";
import axios from 'axios';
import { useToast } from '@/Components/ui/use-toast';

interface Competence {
    id: number;
    name: string;
    description: string;
}

interface Props {
    auth: any;
    availableCompetences: Competence[];
}

const UserCompetencesCreate = ({ auth, availableCompetences }: Props) => {
    const [selectedCompetenceId, setSelectedCompetenceId] = useState<number | null>(null);
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!selectedCompetenceId) {
            toast({
                title: 'Please select a competence',
                variant: 'destructive' // Or an appropriate variant
            });
            return;
        }

        axios.post('/user-competences', {
            user_id: auth.user.id,
            competence_id: selectedCompetenceId, // Send the ID of the selected competence
        })
            .then((response) => {
                window.location.href = '/user-competences';
                toast({
                    title: 'Competence assigned successfully',
                    description: 'The new competence has been assigned to the user.'
                });
            })
            .catch((error) => {
                // Better error handling, display error message from the server if available
                toast({
                    title: 'Error assigning competence',
                    description: error.response?.data?.message || 'An error occurred.'
                });
                console.error(error);
            });
    };

    useEffect(() => {
        // Log the available competences to the console for debugging
        // console.log('Available competences:', availableCompetences);
    }, [availableCompetences]); // Run only when availableCompetences changes

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Create User Competence" />
            <div className="p-4">
                <h1 className="text-2xl font-semibold mb-4">Create User Competence</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <InputLabel htmlFor="competence_id" value="Competence" />
                        <Select onValueChange={(value: string) => setSelectedCompetenceId(parseInt(value))}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a competence" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableCompetences.map((competence) => (
                                    <SelectItem key={competence.id} value={competence.id.toString()}>
                                        {competence.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit">Create</Button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
};

export default UserCompetencesCreate;
