import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import InputError from "@/Components/InputError";
import { Building2, Mail, Lock, Globe, FileText } from 'lucide-react';

export default function CompanyRegister() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        company_type: '',
        website: '',
        description: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('company.register'));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Inscription Entreprise" />
            
            <div className="max-w-2xl w-full space-y-8">
                <div className="text-center">
                    <Building2 className="mx-auto h-12 w-12 text-blue-600" />
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Inscription Entreprise
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Créez votre compte pour accéder aux profils talents
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informations entreprise</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="name">Nom de l'entreprise *</Label>
                                    <div className="mt-1 relative">
                                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="pl-10"
                                            placeholder="Mon Entreprise"
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="email">Email professionnel *</Label>
                                    <div className="mt-1 relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="pl-10"
                                            placeholder="contact@monentreprise.com"
                                            required
                                            autoComplete="username"
                                        />
                                    </div>
                                    <InputError message={errors.email} className="mt-2" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="password">Mot de passe *</Label>
                                    <div className="mt-1 relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="pl-10"
                                            placeholder="••••••••"
                                            required
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="password_confirmation">Confirmer le mot de passe *</Label>
                                    <div className="mt-1 relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className="pl-10"
                                            placeholder="••••••••"
                                            required
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    <InputError message={errors.password_confirmation} className="mt-2" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="company_type">Type d'entreprise</Label>
                                    <Input
                                        id="company_type"
                                        type="text"
                                        value={data.company_type}
                                        onChange={(e) => setData('company_type', e.target.value)}
                                        placeholder="Startup, PME, Grande entreprise..."
                                    />
                                    <InputError message={errors.company_type} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="website">Site web</Label>
                                    <div className="mt-1 relative">
                                        <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="website"
                                            type="url"
                                            value={data.website}
                                            onChange={(e) => setData('website', e.target.value)}
                                            className="pl-10"
                                            placeholder="https://monentreprise.com"
                                        />
                                    </div>
                                    <InputError message={errors.website} className="mt-2" />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Description de l'entreprise</Label>
                                <div className="mt-1 relative">
                                    <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="pl-10"
                                        placeholder="Décrivez votre entreprise, secteur d'activité, taille..."
                                        rows={4}
                                    />
                                </div>
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-yellow-800">
                                            Processus d'approbation
                                        </h3>
                                        <div className="mt-2 text-sm text-yellow-700">
                                            <p>
                                                Votre compte sera activé après vérification par nos équipes. 
                                                Cela prend généralement 24-48h ouvrées.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full" 
                                disabled={processing}
                            >
                                {processing ? 'Création du compte...' : 'Créer mon compte entreprise'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Déjà un compte ?{' '}
                        <Link
                            href={route('company.login')}
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            Se connecter
                        </Link>
                    </p>
                </div>

                <div className="text-center">
                    <Link
                        href={route('welcome')}
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        ← Retour à l'accueil
                    </Link>
                </div>
            </div>
        </div>
    );
}