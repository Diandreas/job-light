import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import {
    Briefcase, Users, Building, TrendingUp, Star,
    Mail, ArrowRight, Sparkles, Clock, Target
} from 'lucide-react';

interface ComingSoonProps {
    auth?: { user: any };
}

export default function ComingSoon({ auth }: ComingSoonProps) {
    const { t } = useTranslation();
    const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;

    return (
        <Layout {...(auth?.user ? { user: auth.user } : {})}>
            <Head>
                <title>JobLight Portal - Bientôt Disponible | Guidy</title>
                <meta name="description" content="Le portail emploi JobLight arrive bientôt ! Découvrez des milliers d'offres d'emploi et trouvez votre prochain poste." />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                    <div className="text-center">
                        {/* Hero */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-12"
                        >
                            <div className="w-24 h-24 bg-gradient-to-r from-amber-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                                <Briefcase className="w-12 h-12 text-white" />
                            </div>
                            
                            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-600 via-purple-600 to-amber-600 bg-clip-text text-transparent">
                                JobLight Portal
                            </h1>
                            
                            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                                Votre nouveau portail emploi arrive très bientôt !
                            </p>

                            <Badge className="bg-gradient-to-r from-amber-100 to-purple-100 text-amber-800 border-amber-200 px-4 py-2">
                                <Clock className="w-4 h-4 mr-2" />
                                En développement final
                            </Badge>
                        </motion.div>

                        {/* Fonctionnalités à venir */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-12"
                        >
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-8">
                                Ce qui vous attend
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6 text-center">
                                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                            <Building className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
                                            Pour les Entreprises
                                        </h3>
                                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                            <li>• Publication d'offres d'emploi</li>
                                            <li>• Accès aux profils candidats</li>
                                            <li>• Gestion des candidatures</li>
                                            <li>• Analytics de recrutement</li>
                                        </ul>
                                    </CardContent>
                                </Card>

                                <Card className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6 text-center">
                                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                            <Users className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
                                            Pour les Candidats
                                        </h3>
                                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                            <li>• Recherche d'offres d'emploi</li>
                                            <li>• Candidature avec CV Guidy</li>
                                            <li>• Suivi des candidatures</li>
                                            <li>• Notifications personnalisées</li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>

                        {/* Notification */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mb-8"
                        >
                            <Card className="bg-gradient-to-r from-amber-50 to-purple-50 border-amber-200">
                                <CardContent className="p-6 text-center">
                                    <div className="flex items-center justify-center gap-3 mb-4">
                                        <Mail className="w-6 h-6 text-amber-600" />
                                        <h3 className="text-lg font-bold text-amber-800">
                                            Soyez notifié du lancement
                                        </h3>
                                    </div>
                                    <p className="text-amber-700 mb-4">
                                        Inscrivez-vous pour être parmi les premiers à découvrir JobLight Portal
                                    </p>
                                    <div className="flex gap-3 justify-center">
                                        <Button asChild>
                                            <a href="mailto:guidy.makeitreall@gmail.com?subject=Notification JobLight Portal">
                                                <Mail className="w-4 h-4 mr-2" />
                                                Me notifier
                                            </a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* En attendant */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
                                En attendant, découvrez nos autres services
                            </h3>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href={route('cv-infos.index')}>
                                    <Button variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50">
                                        <Target className="w-4 h-4 mr-2" />
                                        Créer mon CV
                                    </Button>
                                </Link>
                                <Link href={route('career-advisor.index')}>
                                    <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Assistant IA
                                    </Button>
                                </Link>
                                <Link href={route('portfolio.index')}>
                                    <Button variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50">
                                        <Star className="w-4 h-4 mr-2" />
                                        Mon Portfolio
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}