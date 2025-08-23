import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { AlertTriangle, Bug, Shield, Server, FileX } from 'lucide-react';

interface ErrorCode {
    code: number;
    name: string;
    description: string;
    url: string;
}

interface Props {
    auth: any;
    errorCodes: ErrorCode[];
}

export default function Index({ auth, errorCodes }: Props) {
    const getIconForCode = (code: number) => {
        switch (code) {
            case 404:
                return FileX;
            case 500:
                return Bug;
            case 403:
                return Shield;
            case 503:
                return Server;
            default:
                return AlertTriangle;
        }
    };

    const getColorForCode = (code: number) => {
        switch (code) {
            case 404:
                return 'text-blue-500';
            case 500:
                return 'text-red-500';
            case 403:
                return 'text-yellow-500';
            case 503:
                return 'text-purple-500';
            default:
                return 'text-gray-500';
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Test des Pages d'Erreur</h2>}
        >
            <Head title="Test des Pages d'Erreur" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold mb-2">Test des Pages d'Erreur</h1>
                                <p className="text-gray-600">
                                    Cliquez sur les boutons ci-dessous pour tester les différentes pages d'erreur.
                                    Cette fonctionnalité est disponible uniquement en mode développement.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {errorCodes.map((error) => {
                                    const IconComponent = getIconForCode(error.code);
                                    const iconColor = getColorForCode(error.code);

                                    return (
                                        <Card key={error.code} className="hover:shadow-lg transition-shadow">
                                            <CardHeader className="text-center">
                                                <div className="flex justify-center mb-2">
                                                    <IconComponent className={`w-12 h-12 ${iconColor}`} />
                                                </div>
                                                <CardTitle className="text-3xl font-bold text-gray-800">
                                                    {error.code}
                                                </CardTitle>
                                                <CardDescription className="font-medium">
                                                    {error.name}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="text-center">
                                                <p className="text-sm text-gray-600 mb-4">
                                                    {error.description}
                                                </p>
                                                <Button
                                                    onClick={() => window.open(error.url, '_blank')}
                                                    className="w-full"
                                                    variant="outline"
                                                >
                                                    Tester l'erreur {error.code}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-center mb-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 mr-2" />
                                    <h3 className="font-medium text-amber-800">Note importante</h3>
                                </div>
                                <p className="text-sm text-amber-700">
                                    Ces tests ouvrent les pages d'erreur dans de nouveaux onglets.
                                    Les pages d'erreur utilisent maintenant un design moderne avec animations
                                    et sont entièrement bilingues (français/anglais).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
