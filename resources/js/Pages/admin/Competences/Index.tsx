import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Button } from "@/Components/ui/button";
import { useState, useEffect } from 'react';
import axios from "axios";
import { Trash2, Edit2 } from "lucide-react";

interface Competence {
    id: number;
    name: string;
    description: string;
}

interface Props extends PageProps {
    competences: Competence[];
}

export default function CompetencesIndex({ auth, competences }: Props) {
    const [categories, setCategories] = useState<Competence[]>(competences);

    useEffect(() => {
        setCategories(competences);
    }, [competences]);

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this competence?')) {
            axios.delete(`/competences/${id}`)
                .then(() => {
                    setCategories(prevCategories => prevCategories.filter((category) => category.id !== id));
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Competences" />
            <div className="w-full md:w-1/2 p-4">
                <Link href="/competences/create" >
                    <Button>Create New Competence</Button>
                </Link>
            </div>
            <div className="flex flex-wrap">
                {Array.isArray(categories) && categories.map((category) => (
                    <div key={category.id} className="w-full md:w-1/2 p-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{category.name}</CardTitle>
                                <CardDescription>{category.description}</CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <Link href={`/competences/${category.id}/edit`}>
                                    <Button><Edit2 size={18} /></Button>
                                </Link>
                                <Button onClick={() => handleDelete(category.id)}><Trash2 size={18} /></Button>
                            </CardFooter>
                        </Card>
                    </div>
                ))}
            </div>
        </AuthenticatedLayout>
    );
}
