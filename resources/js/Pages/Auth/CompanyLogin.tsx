import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Checkbox } from "@/Components/ui/checkbox";
import InputError from "@/Components/InputError";
import { Building2, Mail, Lock } from 'lucide-react';

export default function CompanyLogin({ message }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('company.login'));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Connexion Entreprise" />
            
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <Building2 className="mx-auto h-12 w-12 text-blue-600" />
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Portail Entreprise
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Connectez-vous pour accéder aux profils talents
                    </p>
                </div>

                {message && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <p className="text-sm text-blue-800">{message}</p>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Connexion</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <Label htmlFor="email">Email de l'entreprise</Label>
                                <div className="mt-1 relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="pl-10"
                                        placeholder="entreprise@example.com"
                                        required
                                        autoComplete="username"
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div>
                                <Label htmlFor="password">Mot de passe</Label>
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
                                        autoComplete="current-password"
                                    />
                                </div>
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remember"
                                    checked={data.remember}
                                    onCheckedChange={(checked) => setData('remember', checked)}
                                />
                                <Label htmlFor="remember" className="text-sm">
                                    Se souvenir de moi
                                </Label>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full" 
                                disabled={processing}
                            >
                                {processing ? 'Connexion...' : 'Se connecter'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Pas encore inscrit ?{' '}
                        <Link
                            href={route('company.register')}
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            Créer un compte entreprise
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