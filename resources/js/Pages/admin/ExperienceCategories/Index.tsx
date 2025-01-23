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

interface ExperienceCategory {
    id: number;
    name: string;
    description: string;
    ranking: number;
}

interface Props extends PageProps {
    experience_categories: ExperienceCategory[];
}

export default function ExperienceCategoriesIndex({ auth, experience_categories }: Props) {
    // État local pour stocker les catégories d'expérience
    const [categories, setCategories] = useState<ExperienceCategory[]>(experience_categories);
    useEffect(() => {
        // Récupérer les catégories d'expérience depuis la base de données lorsque le composant est monté
        setCategories(experience_categories);
    }, [experience_categories]);

// Fonction pour supprimer une catégorie d'expérience
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this category?')) {
            axios.delete(`/experience-categories/${id}`)
                .then(() => {
                    setCategories(prevCategories => prevCategories.filter((category) => category.id !== id));
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    };


    return (
        <AuthenticatedLayout
            user={auth.user}
        >
            <Head title="Experience Categories" />
            <div className="w-full md:w-1/2 p-4">
            <Link href="/experience-categories/create" >
                <Button>Create New Experience Category</Button>
            </Link>
        </div>
            <div className="flex flex-wrap">
                {/* Bouton pour créer une nouvelle catégorie d'expérience */}


                {/* Afficher la liste des catégories d'expérience */}
                {Array.isArray(categories) && categories.map((category) => (
                    <div key={category.id} className="w-full md:w-1/2 p-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{category.name}</CardTitle>
                                <CardDescription>{category.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>Ranking: {category.ranking}</p>
                            </CardContent>
                            <CardFooter>
                                {/* Boutons pour modifier et supprimer la catégorie d'expérience */}
                                <Link href={`/experience-categories/${category.id}/edit`}>
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
