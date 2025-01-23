import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardFooter } from "@/Components/ui/card";
import { Trash2 } from "lucide-react";
import {PageProps} from "@/types";
import {toast} from "@/Components/ui/use-toast";

interface Competence {
    id: number;
    name: string;
    description: string;
}

interface UserCompetencesProps extends PageProps {
    user_competences: Competence[];
}

const UserCompetences = ({ auth, user_competences }: UserCompetencesProps) => {
    const [competences, setCompetences] = useState<Competence[]>(user_competences);

    const handleDeassignCompetence = (competenceId: number) => {
        if (confirm('Are you sure you want to de-assign this competence?')) {
            axios.delete(`/user-competences/${auth.user.id}/${competenceId}`)
                .then(() => {
                    // Filter out the de-assigned competence from the current list of competences
                    const updatedCompetences = competences.filter(competence => competence.id !== competenceId);
                    // Set the competences state to the updated list of competences
                    setCompetences(updatedCompetences);
                    // Show a success toast message
                    toast({
                        title: 'Success',
                        description: 'Competence de-assigned successfully!',
                    });
                })
                .catch(error => {
                    if (error.response && error.response.status === 403) {
                        toast({
                            title: 'Unauthorized',
                            description: 'You are not allowed to de-assign this competence.',
                            variant: 'destructive',
                        });
                    } else {
                        console.error('Error de-assigning competence:', error);
                        toast({
                            title: 'An error occurred',
                            description: 'Failed to de-assign competence. Please try again later.',
                            variant: 'destructive',
                        });
                    }
                });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">User Competences</h2>}
        >
            <Head title="User Competences" />
            <div className="w-full md:w-1/2 p-4">
                <Link href="/user-competences/create">
                    <Button>Assign a new competence</Button>
                </Link>
            </div>
            <div className="flex flex-wrap">
                {competences.map((competence) => (
                    <div key={competence.id} className="w-full md:w-1/2 p-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{competence.name}</CardTitle>
                            </CardHeader>
                            <CardFooter>
                                <Button onClick={() => handleDeassignCompetence(competence.id)}>
                                    <Trash2 size={18} />
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                ))}
            </div>
        </AuthenticatedLayout>
    );
};

export default UserCompetences;
