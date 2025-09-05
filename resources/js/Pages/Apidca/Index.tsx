import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/Components/ui/use-toast';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
    Archive, Users, Briefcase, Award, Star, Download,
    MapPin, Clock, Building, ArrowRight, CheckCircle,
    FileText, Mail, Phone, Globe, Calendar, Coins
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';

interface ApidcaIndexProps {
    templates: Array<{
        id: number;
        name: string;
        description: string;
        price: number;
        previewImagePath: string;
    }>;
    recentJobs: Array<{
        id: number;
        title: string;
        description: string;
        location: string;
        employment_type: string;
        created_at: string;
        company: {
            name: string;
        };
    }>;
    stats: {
        total_members: number;
        active_members: number;
        jobs_posted_this_month: number;
        cv_templates_used: number;
    } | null;
    isApidcaMember: boolean;
}

export default function ApidcaIndex({ templates, recentJobs, stats, isApidcaMember }: ApidcaIndexProps) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        membership_number: '',
        professional_status: ''
    });

    const handleJoinApidca = (e: React.FormEvent) => {
        e.preventDefault();
        
        post(route('apidca.join'), {
            onSuccess: (response) => {
                toast({
                    title: "Inscription réussie !",
                    description: "Vous êtes maintenant membre APIDCA sur Guidy.",
                });
                setIsJoinDialogOpen(false);
                window.location.reload();
            },
            onError: (errors) => {
                toast({
                    title: "Erreur",
                    description: "Impossible de vous inscrire comme membre APIDCA.",
                    variant: "destructive"
                });
            }
        });
    };

    return (
        <GuestLayout>
            <Head>
                <title>APIDCA - Partenariat Guidy | Templates CV Gratuits pour Archivistes</title>
                <meta name="description" content="Partenariat APIDCA-Guidy : Templates CV gratuits pour les professionnels des archives, offres d'emploi spécialisées et notifications automatiques." />
                <meta name="keywords" content="APIDCA, archiviste, CV archives, emploi archives, documentation, patrimoine" />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-purple-500 text-white">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-center mb-6"
                            >
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                    <Archive className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                                    <div className="text-2xl font-bold">APIDCA</div>
                                    <div className="text-sm opacity-90">Association Professionnelle</div>
                                    <div className="text-sm opacity-90">des Archivistes</div>
                                </div>
                            </motion.div>
                            
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl md:text-6xl font-bold mb-6"
                            >
                                Partenariat <span className="text-amber-400">Guidy × APIDCA</span>
                            </motion.h1>
                            
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90"
                            >
                                Templates CV gratuits, offres d'emploi spécialisées et notifications automatiques 
                                pour les professionnels des archives
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-col sm:flex-row gap-4 justify-center"
                            >
                                {!isApidcaMember ? (
                                    <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3">
                                                <Users className="mr-2 w-5 h-5" />
                                                Devenir Membre APIDCA
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Inscription Membre APIDCA</DialogTitle>
                                            </DialogHeader>
                                            <form onSubmit={handleJoinApidca} className="space-y-4">
                                                <div>
                                                    <Label htmlFor="membership_number">Numéro de membre APIDCA (optionnel)</Label>
                                                    <Input
                                                        id="membership_number"
                                                        value={data.membership_number}
                                                        onChange={(e) => setData('membership_number', e.target.value)}
                                                        placeholder="Ex: APIDCA-2024-001"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="professional_status">Statut professionnel</Label>
                                                    <Input
                                                        id="professional_status"
                                                        value={data.professional_status}
                                                        onChange={(e) => setData('professional_status', e.target.value)}
                                                        placeholder="Ex: Archiviste, Documentaliste, Conservateur..."
                                                        required
                                                    />
                                                </div>
                                                <Button type="submit" disabled={processing} className="w-full">
                                                    {processing ? 'Inscription...' : 'Confirmer l\'inscription'}
                                                </Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                ) : (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800 px-4 py-2">
                                        <CheckCircle className="mr-2 w-4 h-4" />
                                        Membre APIDCA Actif
                                    </Badge>
                                )}
                                
                                <Link href={route('register')}>
                                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                                        <FileText className="mr-2 w-5 h-5" />
                                        Créer mon CV
                                    </Button>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Statistiques */}
                {stats && (
                    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                                    <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                                    <div className="text-3xl font-bold text-gray-800">{stats.total_members}</div>
                                    <div className="text-gray-600">Membres APIDCA</div>
                                </div>
                            </motion.div>
                            
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-center"
                            >
                                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                                    <Briefcase className="w-8 h-8 text-amber-600 mx-auto mb-3" />
                                    <div className="text-3xl font-bold text-gray-800">{stats.jobs_posted_this_month}</div>
                                    <div className="text-gray-600">Offres ce mois</div>
                                </div>
                            </motion.div>
                            
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="text-center"
                            >
                                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                                    <FileText className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                                    <div className="text-3xl font-bold text-gray-800">{stats.cv_templates_used}</div>
                                    <div className="text-gray-600">CV créés</div>
                                </div>
                            </motion.div>
                            
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="text-center"
                            >
                                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                                    <Mail className="w-8 h-8 text-green-600 mx-auto mb-3" />
                                    <div className="text-3xl font-bold text-gray-800">{stats.active_members}</div>
                                    <div className="text-gray-600">Notifications actives</div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}

                {/* Templates CV Gratuits */}
                <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-transparent">
                            Templates CV Gratuits APIDCA
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Designs professionnels spécialement créés pour les métiers des archives et de la documentation
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {templates.map((template, index) => (
                            <motion.div
                                key={template.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="h-full hover:shadow-xl transition-all duration-300 group">
                                    <CardHeader>
                                        <div className="flex justify-between items-start mb-3">
                                            <Badge className="bg-blue-100 text-blue-800">
                                                <Star className="w-3 h-3 mr-1" />
                                                GRATUIT
                                            </Badge>
                                            <div className="text-right">
                                                <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold">
                                                    APIDCA
                                                </div>
                                            </div>
                                        </div>
                                        <CardTitle className="group-hover:text-blue-600 transition-colors">
                                            {template.name}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600 mb-4 text-sm">
                                            {template.description}
                                        </p>
                                        
                                        <div className="space-y-3">
                                            <Link href={route('register')}>
                                                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                                    <Download className="mr-2 w-4 h-4" />
                                                    Utiliser ce template
                                                </Button>
                                            </Link>
                                            
                                            {template.previewImagePath && (
                                                <Button variant="outline" className="w-full">
                                                    <FileText className="mr-2 w-4 h-4" />
                                                    Aperçu
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Offres d'emploi récentes */}
                {recentJobs.length > 0 && (
                    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-blue-600 bg-clip-text text-transparent">
                                Opportunités Archives Récentes
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Offres d'emploi spécialement sélectionnées pour les professionnels des archives
                            </p>
                        </motion.div>

                        <div className="space-y-6">
                            {recentJobs.map((job, index) => (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="hover:shadow-lg transition-all duration-300 group">
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-2">
                                                        {job.title}
                                                    </h3>
                                                    <div className="flex items-center gap-4 text-gray-600 text-sm mb-3">
                                                        <div className="flex items-center">
                                                            <Building className="w-4 h-4 mr-1" />
                                                            {job.company.name}
                                                        </div>
                                                        {job.location && (
                                                            <div className="flex items-center">
                                                                <MapPin className="w-4 h-4 mr-1" />
                                                                {job.location}
                                                            </div>
                                                        )}
                                                        <div className="flex items-center">
                                                            <Clock className="w-4 h-4 mr-1" />
                                                            {new Date(job.created_at).toLocaleDateString('fr-FR')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="border-blue-200 text-blue-700">
                                                    {job.employment_type}
                                                </Badge>
                                            </div>
                                            
                                            <p className="text-gray-600 mb-4 line-clamp-3">
                                                {job.description.substring(0, 200)}...
                                            </p>
                                            
                                            <div className="flex justify-between items-center">
                                                <div className="text-sm text-gray-500">
                                                    Notification automatique APIDCA
                                                </div>
                                                <Button variant="outline" className="group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    Voir l'offre
                                                    <ArrowRight className="ml-2 w-4 h-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Avantages du partenariat */}
                <div className="bg-gray-50 dark:bg-gray-800">
                    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
                                Avantages du Partenariat
                            </h2>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">Templates Spécialisés</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    CV conçus spécifiquement pour les métiers des archives avec sections optimisées
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-center"
                            >
                                <div className="bg-amber-100 dark:bg-amber-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-8 h-8 text-amber-600" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">Notifications Automatiques</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Recevez par email toutes les nouvelles opportunités dans votre secteur
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="text-center"
                            >
                                <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Award className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">Accès Privilégié</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Fonctionnalités premium gratuites et support prioritaire
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-r from-blue-600 to-amber-600 rounded-2xl p-8 text-white"
                    >
                        <h2 className="text-3xl font-bold mb-4">
                            Prêt à booster votre carrière dans les archives ?
                        </h2>
                        <p className="text-xl mb-6 opacity-90">
                            Rejoignez les professionnels APIDCA qui utilisent Guidy pour créer des CV d'exception
                        </p>
                        <Link href={route('register')}>
                            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
                                <Star className="mr-2 w-5 h-5" />
                                Commencer maintenant - Gratuit
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </GuestLayout>
    );
}