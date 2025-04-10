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

interface Profession {
    id: number;
    name: string;
    description: string;
}

interface Props extends PageProps {
    professions: Profession[];
}

export default function ProfessionIndex({ auth, professions }: Props) {
    const [categories, setCategories] = useState<Profession[]>(professions);

    useEffect(() => {
        setCategories(professions);
    }, [professions]);

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this profession?')) {
            axios.delete(`/professions/${id}`)
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
            <Head title="Professions" />
            <div className="w-full md:w-1/2 p-4">
                <Link href="/professions/create" >
                    <Button>Create New Profession</Button>
                </Link>
            </div>
            <div className="flex flex-wrap">
                {categories.map((category) => (
                    <div key={category.id} className="w-full md:w-1/2 p-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{category.name}</CardTitle>
                                <CardDescription>{category.description}</CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <Link href={`/professions/${category.id}/edit`}>
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
