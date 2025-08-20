import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from "@/Components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Switch } from "@/Components/ui/switch";
import VisibilitySelector from "@/Components/ui/VisibilitySelector";
import {
    Briefcase, Award, Heart, FileText,
    Contact, Upload, Palette
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Label } from "@/Components/ui/label";

export default function Edit({ auth, portfolio, settings }) {
    const { data, setData, put, processing } = useForm({
        layout: settings.layout || 'professional',
        show_experiences: settings.show_experiences || false,
        show_competences: settings.show_competences || false,
        show_hobbies: settings.show_hobbies || false,
        show_summary: settings.show_summary || false,
        show_contact_info: settings.show_contact_info || false,
        visibility: settings.visibility || 'private',
        profile_picture: null,
    });

    const visibilityOptions = [
        {
            value: 'private',
            label: 'Privé',
            description: 'Profil visible uniquement par vous. Idéal pour générer votre CV en toute discrétion.',
            icon: '🔒'
        },
        {
            value: 'company_portal',
            label: 'Portail Entreprise',
            description: 'Visible uniquement aux entreprises enregistrées. Parfait pour les opportunités d\'emploi.',
            icon: '🏢'
        },
        {
            value: 'community',
            label: 'Communauté',
            description: 'Visible par tous les utilisateurs de la plateforme. Idéal pour les collaborations entre professionnels.',
            icon: '👥'
        },
        {
            value: 'public',
            label: 'Public',
            description: 'Visible par tous sur internet. Maximum de visibilité comme un portfolio public.',
            icon: '🌐'
        }
    ];

    const onSubmit = (e) => {
        e.preventDefault();
        put(route('portfolio.update'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const displayOptions = [
        { key: 'experiences', icon: Briefcase, label: 'Expériences' },
        { key: 'competences', icon: Award, label: 'Compétences' },
        { key: 'hobbies', icon: Heart, label: 'Centres d\'intérêt' },
        { key: 'summary', icon: FileText, label: 'Résumé' },
        { key: 'contact_info', icon: Contact, label: 'Contact' },
    ];

    // @ts-ignore
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800">Configuration</h2>}
        >
            <Head title="Configuration du Portfolio" />

            <div className="py-6">
                <div className="max-w-xl mx-auto px-4">
                    <Card className="shadow">
                        <CardHeader className="border-b py-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Palette className="w-4 h-4" />
                                Personnalisation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <form onSubmit={onSubmit} className="space-y-4">
                                <div className="grid grid-cols-[auto_1fr] gap-3 items-center">
                                    <Label htmlFor="design" className="text-sm whitespace-nowrap">
                                        Thème :
                                    </Label>
                                    <Select
                                        value={data.layout}
                                        onValueChange={(value) => setData('layout', value)}
                                    >
                                        <SelectTrigger className="h-8">
                                            <SelectValue placeholder="Choisir un style" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="professional">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-gray-500 rounded"></div>
                                                    Business & Professionnel
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="intuitive">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                                                    Intuitif & Moderne
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="user-friendly">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                                                    Convivial & Accessible
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="creative">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded"></div>
                                                    Créatif & Artistique
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="modern">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-gray-900 rounded"></div>
                                                    Sombre & Minimaliste
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-sm mb-2 block">Sections visibles</Label>
                                    <div className="grid grid-cols-1 gap-1">
                                        {displayOptions.map(({ key, icon: Icon, label }) => (
                                            <div key={key} className="flex items-center justify-between py-1.5 px-2 hover:bg-gray-50 rounded">
                                                <div className="flex items-center gap-2">
                                                    <Icon className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm text-gray-600">{label}</span>
                                                </div>
                                                <Switch
                                                    checked={data[`show_${key}`]}
                                                    // @ts-ignore
                                                    onCheckedChange={(checked) => setData(`show_${key}`, checked)}
                                                    className="scale-75"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Label className="text-sm whitespace-nowrap">Photo :</Label>
                                    <div className="flex-1">
                                        <Input
                                            type="file"
                                            onChange={(e) => setData('profile_picture', e.target.files[0])}
                                            className="hidden"
                                            id="profile-upload"
                                        />
                                        <Label
                                            htmlFor="profile-upload"
                                            className="flex items-center justify-center gap-2 py-1 px-3 border border-dashed rounded cursor-pointer hover:bg-gray-50 text-sm"
                                        >
                                            <Upload className="w-4 h-4 text-gray-500" />
                                            <span className="text-gray-600">Choisir une image</span>
                                        </Label>
                                    </div>
                                </div>

                                <VisibilitySelector
                                    value={data.visibility}
                                    onChange={(value) => setData('visibility', value)}
                                    options={visibilityOptions}
                                />

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full h-8 mt-2"
                                >
                                    Enregistrer
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
