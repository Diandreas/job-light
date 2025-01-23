import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/Components/ui/card";

const ExperienceShow = ({ auth, experience }) => {
    return (
        // <AuthenticatedLayout user={auth.user}>
        //     <Head title={`Détails de l'expérience: ${experience.name}`} />
            <div className="container mx-auto py-8">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">{experience.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <p className="text-gray-600">{experience.description}</p>
                            <p className="text-gray-600">{experience.InstitutionName}</p>
                            <p className="text-gray-600">{experience.date_start} - {experience.date_end}</p>
                            <p className="text-gray-600">{experience.output}</p>
                            <p className="text-gray-600">{experience.comment}</p>
                            {experience.attachment && (
                                <div>
                                    <a
                                        href={`/storage/${experience.attachment.path}`}
                                        download
                                        className="text-blue-500 hover:underline"
                                    >
                                        Télécharger le document
                                    </a>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Link
                            href={route('experiences.index')}
                            className="text-sm text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out"
                        >
                            Retour à la liste
                        </Link>
                        <Link
                            href={route('experiences.edit', experience.id)}
                            className="text-sm text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out"
                        >
                            Modifier
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        // </AuthenticatedLayout>
    );
};

export default ExperienceShow;
