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
import { Trash2, Edit2 } from "lucide-react";
import axios from "axios";

interface Hobby {
    id: number;
    name: string;
}

interface Props extends PageProps {
    hobbies: Hobby[];
}

export default function HobbiesIndex({ auth, hobbies }: Props) {
    // Fonction pour supprimer un hobby
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this hobby?')) {
            axios.delete(`/hobbies/${id}`)
                .then(() => {
                    // @ts-ignore
                    setHobbies(prevHobbies => prevHobbies.filter((hobby) => hobby.id !== id));
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Hobbies</h2>}
        >
            <Head title="Hobbies" />
            <div className="w-full md:w-1/2 p-4">
                <Link href="/hobbies/create" >
                    <Button>Create New Hobby</Button>
                </Link>
            </div>
            <div className="flex flex-wrap">
                {/* Afficher la liste des hobbies */}
                {hobbies.map((hobby) => (
                    <div key={hobby.id} className="w-full md:w-1/2 p-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{hobby.name}</CardTitle>
                            </CardHeader>
                            <CardFooter>
                                {/* Boutons pour modifier et supprimer le hobby */}
                                <Link href={`/hobbies/${hobby.id}/edit`}>
                                    <Button><Edit2 size={18} /></Button>
                                </Link>
                                <Button onClick={() => handleDelete(hobby.id)}><Trash2 size={18} /></Button>
                            </CardFooter>
                        </Card>
                    </div>
                ))}
            </div>
        </AuthenticatedLayout>
    );
}
