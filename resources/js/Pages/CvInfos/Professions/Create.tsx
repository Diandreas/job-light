import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import InputLabel from "@/Components/InputLabel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import InputError from "@/Components/InputError";
import axios from 'axios';
import { useToast } from '@/Components/ui/use-toast';

interface Profession {
    id: number;
    name: string;
    description: string;
}

interface Props {
    auth: any;
    availableProfessions: Profession[];
}

const UserProfessionsCreate = ({ auth, availableProfessions }: Props) => {
    const [selectedProfessionId, setSelectedProfessionId] = useState<number | null>(null);
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!selectedProfessionId) {
            toast({
                title: 'Veuillez sélectionner une profession',
                variant: 'destructive'
            });
            return;
        }

        axios.post('/user-professions', {
            user_id: auth.user.id,
            profession_id: selectedProfessionId,
        })
            .then((response) => {
                window.location.href = '/user-professions';
                toast({
                    title: 'Profession attribuée avec succès',
                    description: 'La nouvelle profession a été attribuée à l\'utilisateur.'
                });
            })
            .catch((error) => {
                toast({
                    title: 'Erreur lors de l\'attribution de la profession',
                    description: error.response?.data?.message || 'Une erreur est survenue.'
                });
                console.error(error);
            });
    };

    // ... (Logique pour gérer les professions disponibles)

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Attribuer une profession" />
            <div className="p-4">
                <h1 className="text-2xl font-semibold mb-4">Attribuer une profession</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <InputLabel htmlFor="profession_id" value="Profession" />
                        <Select onValueChange={(value: string) => setSelectedProfessionId(parseInt(value))}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Sélectionnez une profession" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableProfessions.map((profession) => (
                                    <SelectItem key={profession.id} value={profession.id.toString()}>
                                        {profession.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit">Attribuer</Button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
};

export default UserProfessionsCreate;
