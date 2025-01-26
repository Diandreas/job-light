import React from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    FileText, Brain, PenTool, MessageSquare,
    Sparkles, ArrowRight, Star
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, action, link }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="relative bg-white rounded-xl p-6 shadow-lg border border-gray-100 overflow-hidden group"
    >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-amber-500 to-purple-500">
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            <Link href={link} className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium">
                {action} <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
        </div>
    </motion.div>
);

export default function Welcome() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <nav className="bg-white/80 backdrop-blur-md fixed w-full z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <Sparkles className="w-8 h-8 text-amber-500" />
                            <span className="font-bold text-2xl bg-gradient-to-r from-amber-500 to-purple-500 text-transparent bg-clip-text">
                                Guidy
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link href={route('login')} className="text-gray-600 hover:text-amber-600">
                                Connexion
                            </Link>
                            <Link
                                href={route('register')}
                                className="bg-gradient-to-r from-amber-500 to-purple-500 text-white px-4 py-2 rounded-full hover:from-amber-600 hover:to-purple-600"
                            >
                                Démarrer Gratuitement
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="pt-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl font-bold mb-6 bg-gradient-to-r from-amber-500 to-purple-500 text-transparent bg-clip-text"
                        >
                            Votre guide professionnel intelligent
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
                        >
                            Créez des CVs percutants, obtenez des conseils carrière personnalisés et préparez vos entretiens avec notre assistant IA
                        </motion.p>
                        <motion.div className="flex justify-center space-x-4">
                            <Link
                                href={route('register')}
                                className="inline-flex items-center px-6 py-3 rounded-full text-lg font-medium bg-gradient-to-r from-amber-500 to-purple-500 text-white hover:from-amber-600 hover:to-purple-600"
                            >
                                <FileText className="w-5 h-5 mr-2" />
                                Commencer maintenant
                            </Link>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                        <FeatureCard
                            icon={FileText}
                            title="CV Designer Pro"
                            description="Créez des CV professionnels avec nos modèles premium et exportez en PDF."
                            action="Créer mon CV"
                            link={route('register')}
                        />
                        <FeatureCard
                            icon={Brain}
                            title="Conseiller Carrière IA"
                            description="Obtenez des conseils personnalisés pour votre développement professionnel."
                            action="Consulter l'assistant"
                            link={route('register')}
                        />
                        <FeatureCard
                            icon={PenTool}
                            title="Lettre de Motivation"
                            description="Générez des lettres de motivation adaptées à vos candidatures."
                            action="Rédiger ma lettre"
                            link={route('register')}
                        />
                        <FeatureCard
                            icon={MessageSquare}
                            title="Coach Entretien"
                            description="Préparez vos entretiens avec notre simulation interactive."
                            action="Préparer mon entretien"
                            link={route('register')}
                        />
                    </div>

                    <div className="text-center pb-16">
                        <div className="mb-8">
                            <span className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium">
                                L'assistant qui vous guide vers le succès
                            </span>
                        </div>
                        <Link
                            href={route('register')}
                            className="inline-flex items-center bg-gradient-to-r from-amber-500 to-purple-500 text-white px-8 py-4 rounded-full text-lg font-medium hover:from-amber-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all"
                        >
                            <Star className="w-5 h-5 mr-2" />
                            Débloquez votre potentiel
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
