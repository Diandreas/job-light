import React from'react';
import { Link } from '@inertiajs/react';
import { Search, FileText, Building, Users } from 'lucide-react';

export default function Welcome() {
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navigation */}
            <nav className="bg-white shadow-md py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <h1 className="font-bold text-indigo-600 text-3xl">JOB PORTAL</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('login')}
                                className="text-gray-600 hover:text-indigo-600 transition duration-200"
                            >
                                Se connecter
                            </Link>
                            <Link
                                href={route('register')}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
                            >
                                S'inscrire
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Contenu principal */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">Trouvez votre emploi idéal</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Notre plateforme connecte les entreprises et les candidats, simplifiant le processus de recrutement grâce à des outils de création de CV et de ciblage d'offres personnalisées.
                    </p>
                </div>

                {/* Cartes de fonctionnalités */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                    <FeatureCard
                        icon={<Building className="h-12 w-12 text-indigo-500" />}
                        title="Publication d'offres"
                        description="Les entreprises peuvent publier leurs offres d'emploi et atteindre un large éventail de candidats."
                    />
                    <FeatureCard
                        icon={<FileText className="h-12 w-12 text-indigo-500" />}
                        title="Création de CV"
                        description="Les candidats peuvent créer et personnaliser leur CV professionnel en quelques clics."
                    />
                    <FeatureCard
                        icon={<Search className="h-12 w-12 text-indigo-500" />}
                        title="Ciblage intelligent"
                        description="Notre système cible les offres d'emploi pertinentes pour chaque utilisateur."
                    />
                    <FeatureCard
                        icon={<Users className="h-12 w-12 text-indigo-500" />}
                        title="Mise en relation"
                        description="Les entreprises peuvent consulter les CV et contacter directement les candidats."
                    />
                </div>

                {/* Appel à l'action */}
                <div className="text-center mt-16">
                    <Link
                        href={route('register')}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-indigo-700 transition duration-200"
                    >
                        Commencer maintenant
                    </Link>
                </div>
            </main>
        </div>
    );
}

function FeatureCard({ icon, title, description }) {
    return (
        <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition duration-200">
            <div className="flex justify-center mb-4">{icon}</div>
            <h3 className="text-2xl font-semibold mb-2 text-gray-800">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    );
}
