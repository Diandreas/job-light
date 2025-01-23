import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/Components/ui/card";

interface Props {
    auth: any;
    experienceCategory: {
        id: number;
        name: string;
        description: string;
        ranking: number;
    };
}

export default function ExperienceCategoriesShow({ auth, experienceCategory }: Props) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Experience Category Details" />
            <div className="p-4">
                <h1 className="text-2xl font-semibold mb-4">Experience Category Details</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>{experienceCategory.name}</CardTitle>
                        <CardDescription>{experienceCategory.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Ranking: {experienceCategory.ranking}</p>
                    </CardContent>
                    <CardFooter>
                        {/* Ajouter des boutons pour modifier et supprimer la catégorie d'expérience si nécessaire */}
                    </CardFooter>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
