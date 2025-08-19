import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Users, Search, Building2 } from 'lucide-react';

export default function Index({ company }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Portail Entreprise" />
            
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Building2 className="w-8 h-8 text-blue-600" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Portail Entreprise</h1>
                                <p className="text-gray-600">Bienvenue, {company.name}</p>
                            </div>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href={route('logout')} method="post">
                                Déconnexion
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Users className="w-5 h-5 text-blue-600" />
                                <span>Parcourir les profils</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                Découvrez les talents disponibles sur la plateforme
                            </p>
                            <Button asChild className="w-full">
                                <Link href={route('company-portal.profiles')}>
                                    Voir les profils
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Search className="w-5 h-5 text-green-600" />
                                <span>Recherche avancée</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                Filtrez par compétences, expérience et localisation
                            </p>
                            <Button variant="outline" asChild className="w-full">
                                <Link href={route('company-portal.profiles')}>
                                    Rechercher
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Building2 className="w-5 h-5 text-purple-600" />
                                <span>Mon entreprise</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                Gérez les informations de votre entreprise
                            </p>
                            <Button variant="outline" className="w-full" disabled>
                                Bientôt disponible
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-12">
                    <Card>
                        <CardHeader>
                            <CardTitle>À propos du portail entreprise</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-gray max-w-none">
                                <p>
                                    Le portail entreprise vous donne accès aux profils de professionnels 
                                    qui ont choisi de rendre leur portfolio visible aux entreprises. 
                                    Vous pouvez parcourir les talents, rechercher par compétences 
                                    et découvrir votre prochain collaborateur.
                                </p>
                                <ul className="mt-4">
                                    <li>Accès aux profils "Portail Entreprise" et "Public"</li>
                                    <li>Filtres avancés par compétences et expérience</li>
                                    <li>Informations de contact pour les profils ouverts</li>
                                    <li>Interface optimisée pour le recrutement</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}