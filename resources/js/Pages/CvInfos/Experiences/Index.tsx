import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/Components/ui/card';
import { Briefcase, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Experience {
    id: number;
    name: string;
    date_start: string;
    date_end: string | null;
    description: string;
}

interface ExperienceIndexProps {
    auth: any;
    experiences: Experience[];
}

const ExperienceIndex: React.FC<ExperienceIndexProps> = ({ auth, experiences }) => {
    const handleDelete = (experienceId: number) => {
        // Implement delete logic here
        console.log(`Delete experience with id: ${experienceId}`);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Mes expériences</h2>}
        >
            <Head title="Mes expériences" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-3xl font-bold flex items-center">
                                    <Briefcase className="mr-2" /> Mes expériences
                                </h1>
                                <Link href={route('experiences.create')}>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" /> Ajouter une expérience
                                    </Button>
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {experiences.map((experience) => (
                                    <Card key={experience.id} className="flex flex-col">
                                        <CardHeader>
                                            <h2 className="text-xl font-semibold">{experience.name}</h2>
                                            <p className="text-sm text-gray-500">
                                                {experience.date_start} - {experience.date_end || 'Présent'}
                                            </p>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-700">{experience.description}</p>
                                        </CardContent>
                                        <CardFooter className="flex justify-end space-x-2 mt-auto">
                                            <Link href={route('experiences.show', experience.id)}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="w-4 h-4 mr-2" /> Voir
                                                </Button>
                                            </Link>
                                            <Link href={route('experiences.edit', experience.id)}>
                                                <Button variant="outline" size="sm">
                                                    <Edit className="w-4 h-4 mr-2" /> Modifier
                                                </Button>
                                            </Link>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(experience.id)}>
                                                <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default ExperienceIndex;
