import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Briefcase, MapPin, DollarSign, Clock, Phone, Mail, 
    Globe, MessageSquare, Info, CheckCircle, AlertCircle,
    Users, Building, Zap
} from 'lucide-react';

interface CreateSimpleAdProps {
    auth?: { user: any };
    errors: any;
    flash?: {
        success?: string;
        error?: string;
    };
}

const EMPLOYMENT_TYPES = [
    { value: 'full-time', label: 'Temps plein', icon: Briefcase },
    { value: 'part-time', label: 'Temps partiel', icon: Clock },
    { value: 'contract', label: 'Contrat', icon: Users },
    { value: 'internship', label: 'Stage', icon: Building },
    { value: 'freelance', label: 'Freelance', icon: Zap }
];

const EXPERIENCE_LEVELS = [
    { value: 'entry', label: 'Débutant (0-2 ans)' },
    { value: 'mid', label: 'Intermédiaire (2-5 ans)' },
    { value: 'senior', label: 'Senior (5+ ans)' },
    { value: 'executive', label: 'Direction/Cadre' }
];

export default function CreateSimpleAd({ auth, errors, flash }: CreateSimpleAdProps) {
    const [step, setStep] = useState(1);
    const [previewMode, setPreviewMode] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        title: '',
        description: '',
        requirements: '',
        location: '',
        employment_type: '',
        experience_level: '',
        salary_min: '',
        salary_max: '',
        salary_currency: 'EUR',
        remote_work: false,
        industry: '',
        application_deadline: '',
        
        // Informations de contact
        contact_method: 'email', // 'email', 'phone', 'website', 'message'
        contact_email: auth?.user?.email || '',
        contact_phone: '',
        contact_website: '',
        contact_instructions: '',
        contact_via_platform: false,
        
        // Entreprise (optionnel)
        company_name: '',
        company_description: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = {
            ...data,
            posting_type: 'simple_ad',
            contact_info: {
                method: data.contact_method,
                email: data.contact_email,
                phone: data.contact_phone,
                website: data.contact_website,
                instructions: data.contact_instructions
            }
        };

        post(route('job-portal.create-simple-ad'), {
            data: formData,
            onSuccess: () => {
                reset();
                setStep(1);
            }
        });
    };

    const nextStep = () => {
        if (step < 3) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;

    const ContactMethodSelector = () => (
        <div className="space-y-4">
            <Label className="text-base font-semibold">Comment souhaitez-vous être contacté ?</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { value: 'email', label: 'Par email', icon: Mail, description: 'Les candidats vous contacteront par email' },
                    { value: 'phone', label: 'Par téléphone', icon: Phone, description: 'Affichage de votre numéro de téléphone' },
                    { value: 'website', label: 'Site web/Formulaire', icon: Globe, description: 'Redirection vers votre site ou formulaire' },
                    { value: 'message', label: 'Via la plateforme', icon: MessageSquare, description: 'Messages internes à la plateforme' }
                ].map((method) => (
                    <div
                        key={method.value}
                        onClick={() => setData('contact_method', method.value)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            data.contact_method === method.value
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <method.icon className="w-5 h-5 text-blue-600" />
                            <span className="font-medium">{method.label}</span>
                        </div>
                        <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <Layout {...(auth?.user ? { user: auth.user } : {})}>
            <Head>
                <title>Publier une annonce simple - JobLight</title>
                <meta name="description" content="Publiez rapidement une annonce d'emploi avec vos informations de contact" />
            </Head>

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4"
                        >
                            📢 Publier une annonce simple
                        </motion.h1>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Créez rapidement une annonce d'emploi avec vos informations de contact. 
                            Les candidats vous contacteront directement selon la méthode que vous choisissez.
                        </p>
                    </div>

                    {/* Progress indicator */}
                    <div className="flex items-center justify-center mb-8">
                        <div className="flex items-center space-x-4">
                            {[1, 2, 3].map((stepNumber) => (
                                <React.Fragment key={stepNumber}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                        stepNumber <= step 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-200 text-gray-600'
                                    }`}>
                                        {stepNumber}
                                    </div>
                                    {stepNumber < 3 && (
                                        <div className={`w-12 h-1 ${
                                            stepNumber < step ? 'bg-blue-600' : 'bg-gray-200'
                                        }`} />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Flash messages */}
                    {flash?.success && (
                        <Alert className="mb-6 border-green-200 bg-green-50">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                {flash.success}
                            </AlertDescription>
                        </Alert>
                    )}

                    {flash?.error && (
                        <Alert className="mb-6 border-red-200 bg-red-50">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                                {flash.error}
                            </AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Étape 1: Informations de base */}
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle>1. Informations sur le poste</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <Label htmlFor="title">Titre du poste *</Label>
                                            <Input
                                                id="title"
                                                type="text"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                placeholder="Ex: Développeur Web, Assistant(e) administratif, Chef de projet..."
                                                className="mt-2"
                                                required
                                            />
                                            {errors.title && (
                                                <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="description">Description du poste *</Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                placeholder="Décrivez le poste, les missions principales, l'environnement de travail..."
                                                rows={6}
                                                className="mt-2"
                                                required
                                            />
                                            {errors.description && (
                                                <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="requirements">Profil recherché</Label>
                                            <Textarea
                                                id="requirements"
                                                value={data.requirements}
                                                onChange={(e) => setData('requirements', e.target.value)}
                                                placeholder="Compétences requises, formation, expérience..."
                                                rows={4}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="employment_type">Type de contrat</Label>
                                                <Select value={data.employment_type} onValueChange={(value) => setData('employment_type', value)}>
                                                    <SelectTrigger className="mt-2">
                                                        <SelectValue placeholder="Choisir un type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {EMPLOYMENT_TYPES.map(type => (
                                                            <SelectItem key={type.value} value={type.value}>
                                                                <div className="flex items-center gap-2">
                                                                    <type.icon className="w-4 h-4" />
                                                                    {type.label}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor="experience_level">Niveau d'expérience</Label>
                                                <Select value={data.experience_level} onValueChange={(value) => setData('experience_level', value)}>
                                                    <SelectTrigger className="mt-2">
                                                        <SelectValue placeholder="Choisir un niveau" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {EXPERIENCE_LEVELS.map(level => (
                                                            <SelectItem key={level.value} value={level.value}>
                                                                {level.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="location">Localisation</Label>
                                                <div className="relative mt-2">
                                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                    <Input
                                                        id="location"
                                                        type="text"
                                                        value={data.location}
                                                        onChange={(e) => setData('location', e.target.value)}
                                                        placeholder="Ville, région..."
                                                        className="pl-10"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="industry">Secteur d'activité</Label>
                                                <Input
                                                    id="industry"
                                                    type="text"
                                                    value={data.industry}
                                                    onChange={(e) => setData('industry', e.target.value)}
                                                    placeholder="Ex: Informatique, Commerce, Santé..."
                                                    className="mt-2"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="remote_work"
                                                checked={data.remote_work}
                                                onCheckedChange={(checked) => setData('remote_work', checked)}
                                            />
                                            <Label htmlFor="remote_work">Télétravail possible</Label>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Étape 2: Informations de contact */}
                        {step === 2 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle>2. Informations de contact</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <ContactMethodSelector />

                                        {/* Champs conditionnels selon la méthode de contact */}
                                        {data.contact_method === 'email' && (
                                            <div>
                                                <Label htmlFor="contact_email">Adresse email de contact *</Label>
                                                <Input
                                                    id="contact_email"
                                                    type="email"
                                                    value={data.contact_email}
                                                    onChange={(e) => setData('contact_email', e.target.value)}
                                                    placeholder="contact@entreprise.com"
                                                    className="mt-2"
                                                    required
                                                />
                                            </div>
                                        )}

                                        {data.contact_method === 'phone' && (
                                            <div>
                                                <Label htmlFor="contact_phone">Numéro de téléphone *</Label>
                                                <Input
                                                    id="contact_phone"
                                                    type="tel"
                                                    value={data.contact_phone}
                                                    onChange={(e) => setData('contact_phone', e.target.value)}
                                                    placeholder="+33 1 23 45 67 89"
                                                    className="mt-2"
                                                    required
                                                />
                                            </div>
                                        )}

                                        {data.contact_method === 'website' && (
                                            <div>
                                                <Label htmlFor="contact_website">Site web ou formulaire *</Label>
                                                <Input
                                                    id="contact_website"
                                                    type="url"
                                                    value={data.contact_website}
                                                    onChange={(e) => setData('contact_website', e.target.value)}
                                                    placeholder="https://www.entreprise.com/candidature"
                                                    className="mt-2"
                                                    required
                                                />
                                            </div>
                                        )}

                                        {data.contact_method === 'message' && (
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="contact_via_platform"
                                                    checked={data.contact_via_platform}
                                                    onCheckedChange={(checked) => setData('contact_via_platform', checked)}
                                                />
                                                <Label htmlFor="contact_via_platform">
                                                    Recevoir les candidatures via la messagerie de la plateforme
                                                </Label>
                                            </div>
                                        )}

                                        <div>
                                            <Label htmlFor="contact_instructions">Instructions supplémentaires</Label>
                                            <Textarea
                                                id="contact_instructions"
                                                value={data.contact_instructions}
                                                onChange={(e) => setData('contact_instructions', e.target.value)}
                                                placeholder="Précisions sur la candidature, documents à fournir, horaires de contact..."
                                                rows={3}
                                                className="mt-2"
                                            />
                                        </div>

                                        {/* Informations entreprise optionnelles */}
                                        <div className="pt-6 border-t">
                                            <h4 className="font-medium mb-4">Informations sur l'entreprise (optionnel)</h4>
                                            
                                            <div className="space-y-4">
                                                <div>
                                                    <Label htmlFor="company_name">Nom de l'entreprise</Label>
                                                    <Input
                                                        id="company_name"
                                                        type="text"
                                                        value={data.company_name}
                                                        onChange={(e) => setData('company_name', e.target.value)}
                                                        placeholder="Nom de votre entreprise"
                                                        className="mt-2"
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="company_description">Description de l'entreprise</Label>
                                                    <Textarea
                                                        id="company_description"
                                                        value={data.company_description}
                                                        onChange={(e) => setData('company_description', e.target.value)}
                                                        placeholder="Présentation de votre entreprise, secteur d'activité, taille..."
                                                        rows={3}
                                                        className="mt-2"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Étape 3: Finalisation */}
                        {step === 3 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle>3. Finalisation et publication</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="salary_min">Salaire minimum (optionnel)</Label>
                                                <div className="relative mt-2">
                                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                    <Input
                                                        id="salary_min"
                                                        type="number"
                                                        value={data.salary_min}
                                                        onChange={(e) => setData('salary_min', e.target.value)}
                                                        placeholder="30000"
                                                        className="pl-10"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="salary_max">Salaire maximum (optionnel)</Label>
                                                <div className="relative mt-2">
                                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                    <Input
                                                        id="salary_max"
                                                        type="number"
                                                        value={data.salary_max}
                                                        onChange={(e) => setData('salary_max', e.target.value)}
                                                        placeholder="45000"
                                                        className="pl-10"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="application_deadline">Date limite de candidature (optionnel)</Label>
                                            <Input
                                                id="application_deadline"
                                                type="date"
                                                value={data.application_deadline}
                                                onChange={(e) => setData('application_deadline', e.target.value)}
                                                className="mt-2"
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>

                                        <Alert>
                                            <Info className="w-4 h-4" />
                                            <AlertDescription>
                                                <strong>Annonce simple :</strong> Les candidats vous contacteront directement selon la méthode choisie. 
                                                Votre annonce sera publiée immédiatement et restera active pendant 30 jours.
                                            </AlertDescription>
                                        </Alert>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Navigation buttons */}
                        <div className="flex items-center justify-between mt-8">
                            <div>
                                {step > 1 && (
                                    <Button type="button" variant="outline" onClick={prevStep}>
                                        ← Précédent
                                    </Button>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                {step < 3 ? (
                                    <Button type="button" onClick={nextStep}>
                                        Suivant →
                                    </Button>
                                ) : (
                                    <Button type="submit" disabled={processing} className="bg-gradient-to-r from-green-500 to-blue-500">
                                        {processing ? 'Publication...' : '📢 Publier l\'annonce'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}