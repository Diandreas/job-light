import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Switch } from '@/Components/ui/switch';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
    Bell, Mail, Smartphone, Briefcase, Send, MessageSquare,
    Plus, X, CheckCircle, Settings
} from 'lucide-react';

interface NotificationSettingsProps {
    auth: { user: any };
    preferences: {
        email_job_matches: boolean;
        email_application_updates: boolean;
        email_new_messages: boolean;
        push_job_matches: boolean;
        push_application_updates: boolean;
        push_new_messages: boolean;
        job_alert_keywords: string[];
        preferred_locations: string[];
        preferred_employment_types: string[];
    };
}

export default function NotificationSettings({ auth, preferences }: NotificationSettingsProps) {
    const [newKeyword, setNewKeyword] = useState('');
    const [newLocation, setNewLocation] = useState('');

    const { data, setData, put, processing } = useForm({
        email_job_matches: preferences?.email_job_matches ?? true,
        email_application_updates: preferences?.email_application_updates ?? true,
        email_new_messages: preferences?.email_new_messages ?? true,
        push_job_matches: preferences?.push_job_matches ?? true,
        push_application_updates: preferences?.push_application_updates ?? true,
        push_new_messages: preferences?.push_new_messages ?? true,
        job_alert_keywords: preferences?.job_alert_keywords ?? [],
        preferred_locations: preferences?.preferred_locations ?? [],
        preferred_employment_types: preferences?.preferred_employment_types ?? []
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('settings.notifications.update'));
    };

    const addKeyword = () => {
        if (newKeyword.trim() && !data.job_alert_keywords.includes(newKeyword.trim())) {
            setData('job_alert_keywords', [...data.job_alert_keywords, newKeyword.trim()]);
            setNewKeyword('');
        }
    };

    const removeKeyword = (keyword: string) => {
        setData('job_alert_keywords', data.job_alert_keywords.filter(k => k !== keyword));
    };

    const addLocation = () => {
        if (newLocation.trim() && !data.preferred_locations.includes(newLocation.trim())) {
            setData('preferred_locations', [...data.preferred_locations, newLocation.trim()]);
            setNewLocation('');
        }
    };

    const removeLocation = (location: string) => {
        setData('preferred_locations', data.preferred_locations.filter(l => l !== location));
    };

    const toggleEmploymentType = (type: string) => {
        if (data.preferred_employment_types.includes(type)) {
            setData('preferred_employment_types', data.preferred_employment_types.filter(t => t !== type));
        } else {
            setData('preferred_employment_types', [...data.preferred_employment_types, type]);
        }
    };

    const employmentTypes = [
        { value: 'full-time', label: 'Temps plein' },
        { value: 'part-time', label: 'Temps partiel' },
        { value: 'contract', label: 'Contrat' },
        { value: 'internship', label: 'Stage' },
        { value: 'freelance', label: 'Freelance' }
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head>
                <title>Préférences de notification - JobLight</title>
                <meta name="description" content="Configurez vos préférences de notification pour les offres d'emploi" />
            </Head>

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            🔔 Préférences de notification
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Configurez comment et quand vous souhaitez être notifié
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Notifications Email */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="w-5 h-5" />
                                    Notifications par email
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-base font-medium">Nouvelles offres correspondantes</Label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Recevez un email quand une offre correspond à vos critères
                                        </p>
                                    </div>
                                    <Switch
                                        checked={data.email_job_matches}
                                        onCheckedChange={(checked) => setData('email_job_matches', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-base font-medium">Mises à jour de candidatures</Label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Recevez un email quand le statut de vos candidatures change
                                        </p>
                                    </div>
                                    <Switch
                                        checked={data.email_application_updates}
                                        onCheckedChange={(checked) => setData('email_application_updates', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-base font-medium">Nouveaux messages</Label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Recevez un email pour les nouveaux messages sur la plateforme
                                        </p>
                                    </div>
                                    <Switch
                                        checked={data.email_new_messages}
                                        onCheckedChange={(checked) => setData('email_new_messages', checked)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notifications Push */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Smartphone className="w-5 h-5" />
                                    Notifications push
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Alert>
                                    <Bell className="w-4 h-4" />
                                    <AlertDescription>
                                        Les notifications push fonctionnent sur mobile et navigateur. 
                                        Vous devez autoriser les notifications dans votre navigateur.
                                    </AlertDescription>
                                </Alert>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-base font-medium">Nouvelles offres correspondantes</Label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Notification instantanée pour les offres qui vous intéressent
                                        </p>
                                    </div>
                                    <Switch
                                        checked={data.push_job_matches}
                                        onCheckedChange={(checked) => setData('push_job_matches', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-base font-medium">Mises à jour de candidatures</Label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Notification instantanée des changements de statut
                                        </p>
                                    </div>
                                    <Switch
                                        checked={data.push_application_updates}
                                        onCheckedChange={(checked) => setData('push_application_updates', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-base font-medium">Nouveaux messages</Label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Notification instantanée pour les nouveaux messages
                                        </p>
                                    </div>
                                    <Switch
                                        checked={data.push_new_messages}
                                        onCheckedChange={(checked) => setData('push_new_messages', checked)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Critères d'alerte */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="w-5 h-5" />
                                    Critères d'alerte emploi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Mots-clés */}
                                <div>
                                    <Label className="text-base font-medium mb-3 block">Mots-clés d'intérêt</Label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        Ajoutez des mots-clés pour recevoir des alertes sur les offres correspondantes
                                    </p>
                                    
                                    <div className="flex gap-2 mb-3">
                                        <Input
                                            type="text"
                                            value={newKeyword}
                                            onChange={(e) => setNewKeyword(e.target.value)}
                                            placeholder="Ex: React, Marketing, Comptabilité..."
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                                        />
                                        <Button type="button" onClick={addKeyword} size="sm">
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {data.job_alert_keywords.map((keyword) => (
                                            <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                                                {keyword}
                                                <button
                                                    type="button"
                                                    onClick={() => removeKeyword(keyword)}
                                                    className="ml-1 hover:text-red-600"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Localisations */}
                                <div>
                                    <Label className="text-base font-medium mb-3 block">Localisations préférées</Label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        Ajoutez les villes ou régions qui vous intéressent
                                    </p>
                                    
                                    <div className="flex gap-2 mb-3">
                                        <Input
                                            type="text"
                                            value={newLocation}
                                            onChange={(e) => setNewLocation(e.target.value)}
                                            placeholder="Ex: Paris, Lyon, Marseille, Remote..."
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                                        />
                                        <Button type="button" onClick={addLocation} size="sm">
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {data.preferred_locations.map((location) => (
                                            <Badge key={location} variant="secondary" className="flex items-center gap-1">
                                                {location}
                                                <button
                                                    type="button"
                                                    onClick={() => removeLocation(location)}
                                                    className="ml-1 hover:text-red-600"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Types d'emploi */}
                                <div>
                                    <Label className="text-base font-medium mb-3 block">Types d'emploi préférés</Label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        Sélectionnez les types de contrats qui vous intéressent
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-2">
                                        {employmentTypes.map((type) => (
                                            <Badge
                                                key={type.value}
                                                variant={data.preferred_employment_types.includes(type.value) ? "default" : "outline"}
                                                className="cursor-pointer hover:bg-blue-100 transition-colors"
                                                onClick={() => toggleEmploymentType(type.value)}
                                            >
                                                {type.label}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bouton de sauvegarde */}
                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing} className="bg-gradient-to-r from-blue-500 to-purple-500">
                                {processing ? (
                                    <>
                                        <Settings className="w-4 h-4 mr-2 animate-spin" />
                                        Sauvegarde...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Sauvegarder les préférences
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
