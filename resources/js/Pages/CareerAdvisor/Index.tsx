import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { useToast } from "@/Components/ui/use-toast";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { motion } from 'framer-motion';
import {
    Sparkles, Briefcase, GraduationCap, MessageSquare,
    Loader, Wallet, ChevronDown, FileText, PenTool,
    Building, Brain
} from 'lucide-react';
import axios from 'axios';

const LoadingSpinner = () => (
    <motion.div className="flex items-center justify-center">
        <div className="relative">
            <motion.div
                className="w-16 h-16 border-t-4 border-primary border-solid rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <Loader className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary" size={24} />
        </div>
    </motion.div>
);

const ServiceCard = ({ icon: Icon, title, description, cost, onClick, isSelected }) => (
    <div
        onClick={onClick}
        className={`cursor-pointer p-6 rounded-lg border transition-all ${
            isSelected ? 'border-primary bg-primary/5 shadow-lg' : 'border-gray-200 hover:border-primary/30 hover:shadow-md'
        }`}
    >
        <div className="flex items-start justify-between mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="text-primary" size={24} />
            </div>
            <span className="text-sm font-medium bg-primary/10 px-3 py-1 rounded-full">
                {cost} FCFA
            </span>
        </div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
    </div>
);

const ExpandableSection = ({ title, children, isExpanded, onToggle, icon: Icon }) => (
    <div className="border rounded-lg mb-4">
        <button
            onClick={onToggle}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
        >
            <div className="flex items-center gap-2">
                <Icon className="text-primary" size={20} />
                <span className="font-medium">{title}</span>
            </div>
            <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
            >
                <ChevronDown />
            </motion.div>
        </button>
        <motion.div
            initial={false}
            animate={{
                height: isExpanded ? "auto" : 0,
                opacity: isExpanded ? 1 : 0
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
        >
            <div className="p-4 border-t">
                {children}
            </div>
        </motion.div>
    </div>
);

const services = [
    {
        id: 'career-advice',
        icon: Brain,
        title: 'Conseil Carrière',
        description: 'Obtenez des conseils personnalisés pour votre développement professionnel',
        cost: 100,
        placeholder: 'Posez une question sur votre carrière...'
    },
    {
        id: 'cover-letter',
        icon: FileText,
        title: 'Lettre de Motivation',
        description: 'Générez une lettre de motivation personnalisée basée sur votre profil',
        cost: 200,
        placeholder: 'Décrivez le poste pour lequel vous postulez...'
    },
    {
        id: 'interview-prep',
        icon: MessageSquare,
        title: 'Préparation Entretien',
        description: 'Préparez-vous aux questions d\'entretien avec des réponses adaptées',
        cost: 150,
        placeholder: 'Quel type d\'entretien souhaitez-vous préparer ?'
    },
    {
        id: 'resume-review',
        icon: PenTool,
        title: 'Analyse CV',
        description: 'Recevez des suggestions d\'amélioration pour votre CV',
        cost: 180,
        placeholder: 'Quel aspect de votre CV souhaitez-vous améliorer ?'
    }
];

export default function Index({ auth, userInfo, advice }) {
    const { toast } = useToast();
    const [expandedSections, setExpandedSections] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [walletBalance, setWalletBalance] = useState(auth.user.wallet_balance);
    const [selectedService, setSelectedService] = useState(services[0]);

    const { data, setData, post, processing, errors } = useForm({
        question: '',
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (walletBalance < selectedService.cost) {
            toast({
                title: "Solde insuffisant",
                description: "Veuillez recharger votre compte pour continuer",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            await axios.post('/api/process-question-cost', {
                user_id: auth.user.id,
                cost: selectedService.cost,
                service: selectedService.id
            });

            setWalletBalance(prev => prev - selectedService.cost);
            post('/career-advisor/advice', {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => setIsLoading(false),
                onError: () => {
                    setIsLoading(false);
                    setWalletBalance(prev => prev + selectedService.cost);
                },
            });
        } catch (error) {
            setIsLoading(false);
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors du traitement",
                variant: "destructive",
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-semibold text-2xl text-gray-800 flex items-center"
                    >
                        <Brain className="mr-2 text-primary" /> AI Career Assistant
                    </motion.h2>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-lg">
                        <Wallet className="text-primary" />
                        <span>{walletBalance} FCFA</span>
                    </div>
                </div>
            }
        >
            <div className="container mx-auto p-4 space-y-8">
                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {services.map(service => (
                        <ServiceCard
                            key={service.id}
                            {...service}
                            isSelected={selectedService.id === service.id}
                            onClick={() => setSelectedService(service)}
                        />
                    ))}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Profile Section */}
                    <div className="space-y-4">
                        <Card className="bg-white/50 border-primary/10">
                            <CardHeader>
                                <CardTitle className="flex items-center text-primary">
                                    <Building className="mr-2" /> Votre Profil Professionnel
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ExpandableSection
                                    title="Informations personnelles"
                                    isExpanded={expandedSections.personal}
                                    onToggle={() => toggleSection('personal')}
                                    icon={Briefcase}
                                >
                                    <div className="space-y-2">
                                        <h3 className="font-semibold">{userInfo.name}</h3>
                                        <p className="text-primary">{userInfo.profession || 'Non spécifié'}</p>
                                    </div>
                                </ExpandableSection>

                                <ExpandableSection
                                    title="Compétences"
                                    isExpanded={expandedSections.skills}
                                    onToggle={() => toggleSection('skills')}
                                    icon={GraduationCap}
                                >
                                    <div className="flex flex-wrap gap-2">
                                        {userInfo.competences.map((skill, index) => (
                                            <span key={index} className="px-3 py-1 bg-primary/10 rounded-full text-sm">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </ExpandableSection>

                                <ExpandableSection
                                    title="Expériences"
                                    isExpanded={expandedSections.experiences}
                                    onToggle={() => toggleSection('experiences')}
                                    icon={Briefcase}
                                >
                                    <div className="space-y-4">
                                        {userInfo.experiences.map((exp, index) => (
                                            <div key={index} className="border-l-2 border-primary pl-4">
                                                <h4 className="font-medium">{exp.title}</h4>
                                                <p className="text-sm text-gray-600">{exp.company}</p>
                                            </div>
                                        ))}
                                    </div>
                                </ExpandableSection>

                                {userInfo.education?.length > 0 && (
                                    <ExpandableSection
                                        title="Formation"
                                        isExpanded={expandedSections.education}
                                        onToggle={() => toggleSection('education')}
                                        icon={GraduationCap}
                                    >
                                        <div className="space-y-2">
                                            {userInfo.education.map((edu, index) => (
                                                <div key={index}>
                                                    <p className="font-medium">{edu.degree}</p>
                                                    <p className="text-sm text-gray-600">{edu.institution}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </ExpandableSection>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* AI Service Section */}
                    <div className="space-y-6">
                        <Card className="backdrop-blur bg-white/50">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center">
                                        <selectedService.icon className="mr-2 text-primary" />
                                        {selectedService.title}
                                    </span>
                                    <span className="text-sm bg-primary/10 px-3 py-1 rounded-full">
                                        {selectedService.cost} FCFA
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <Textarea
                                        value={data.question}
                                        onChange={e => setData('question', e.target.value)}
                                        placeholder={selectedService.placeholder}
                                        className="min-h-[200px] bg-white/50"
                                    />
                                    {errors.question && (
                                        <p className="text-red-500 text-sm">{errors.question}</p>
                                    )}
                                    <Button
                                        type="submit"
                                        disabled={processing || isLoading || walletBalance < selectedService.cost}
                                        className="w-full bg-gradient-to-r from-primary to-primary/80"
                                    >
                                        {isLoading ? <LoadingSpinner /> : 'Obtenir une réponse'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {advice && !isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="backdrop-blur bg-white/50 border-primary/10">
                                    <CardHeader>
                                        <CardTitle className="flex items-center text-primary">
                                            <Sparkles className="mr-2" /> Réponse de l'IA
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="prose prose-primary max-w-none">
                                            <p className="whitespace-pre-wrap leading-relaxed">
                                                {advice}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
