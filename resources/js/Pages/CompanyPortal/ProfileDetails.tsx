import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Separator } from "@/Components/ui/separator";
import { 
    ArrowLeft,
    MapPin, 
    Mail, 
    Phone,
    Github,
    Linkedin,
    Building2,
    Briefcase,
    Award,
    Heart,
    FileText,
    Download,
    ExternalLink
} from 'lucide-react';

export default function ProfileDetails({ portfolio, user }) {
    const getVisibilityInfo = (visibility) => {
        const variants = {
            'company_portal': { 
                color: 'bg-blue-100 text-blue-800 border-blue-200', 
                icon: '🏢', 
                label: 'Visible aux entreprises',
                description: 'Ce profil est accessible uniquement aux entreprises enregistrées'
            },
            'public': { 
                color: 'bg-green-100 text-green-800 border-green-200', 
                icon: '🌐', 
                label: 'Profil public',
                description: 'Ce profil est visible par tous'
            },
            'community': { 
                color: 'bg-purple-100 text-purple-800 border-purple-200', 
                icon: '👥', 
                label: 'Visible à la communauté',
                description: 'Ce profil est visible aux membres de la plateforme'
            },
        };
        
        return variants[visibility] || variants['public'];
    };

    const visibilityInfo = getVisibilityInfo(portfolio.visibility);

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={`Profil de ${portfolio.personalInfo.name} - Portail Entreprise`} />
            
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={route('company-portal.profiles')}>
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Retour aux profils
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Profil de {portfolio.personalInfo.name}
                                </h1>
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${visibilityInfo.color}`}>
                                    <span className="mr-2">{visibilityInfo.icon}</span>
                                    {visibilityInfo.label}
                                </div>
                            </div>
                        </div>
                        <Building2 className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Colonne principale */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Informations personnelles */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-start space-x-4">
                                    <Avatar className="w-20 h-20">
                                        <AvatarImage 
                                            src={portfolio.personalInfo.profile_picture} 
                                            alt={portfolio.personalInfo.name} 
                                        />
                                        <AvatarFallback className="text-xl">
                                            {portfolio.personalInfo.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {portfolio.personalInfo.name}
                                        </h2>
                                        {portfolio.professions && portfolio.professions.length > 0 && (
                                            <p className="text-lg text-gray-600 mt-1">
                                                {portfolio.professions[0].name}
                                            </p>
                                        )}
                                        {portfolio.personalInfo.address && (
                                            <div className="flex items-center text-gray-600 mt-2">
                                                <MapPin className="w-4 h-4 mr-2" />
                                                {portfolio.personalInfo.address}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Résumé */}
                        {portfolio.show_summary && portfolio.summary && portfolio.summary.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <FileText className="w-5 h-5" />
                                        <span>Résumé professionnel</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose prose-gray max-w-none">
                                        <p>{portfolio.summary[0].content}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Expériences */}
                        {portfolio.show_experiences && portfolio.experiences && portfolio.experiences.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Briefcase className="w-5 h-5" />
                                        <span>Expériences</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {portfolio.experiences.map((experience, index) => (
                                            <div key={index}>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">
                                                            {experience.title || experience.category_name}
                                                        </h4>
                                                        <p className="text-gray-600">{experience.company}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {experience.start_date} - {experience.end_date || 'Présent'}
                                                        </p>
                                                    </div>
                                                    {experience.attachment_path && (
                                                        <Button size="sm" variant="outline" asChild>
                                                            <a href={experience.attachment_path} target="_blank" rel="noopener noreferrer">
                                                                <Download className="w-4 h-4 mr-1" />
                                                                Document
                                                            </a>
                                                        </Button>
                                                    )}
                                                </div>
                                                {experience.description && (
                                                    <p className="text-gray-700 mt-2">{experience.description}</p>
                                                )}
                                                {index < portfolio.experiences.length - 1 && (
                                                    <Separator className="mt-6" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Contact */}
                        {portfolio.show_contact_info && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Contact</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {portfolio.personalInfo.email && (
                                        <div className="flex items-center space-x-3">
                                            <Mail className="w-4 h-4 text-gray-500" />
                                            <a 
                                                href={`mailto:${portfolio.personalInfo.email}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {portfolio.personalInfo.email}
                                            </a>
                                        </div>
                                    )}
                                    {portfolio.personalInfo.phone && (
                                        <div className="flex items-center space-x-3">
                                            <Phone className="w-4 h-4 text-gray-500" />
                                            <a 
                                                href={`tel:${portfolio.personalInfo.phone}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {portfolio.personalInfo.phone}
                                            </a>
                                        </div>
                                    )}
                                    {portfolio.personalInfo.linkedin && (
                                        <div className="flex items-center space-x-3">
                                            <Linkedin className="w-4 h-4 text-gray-500" />
                                            <a 
                                                href={portfolio.personalInfo.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline flex items-center"
                                            >
                                                LinkedIn
                                                <ExternalLink className="w-3 h-3 ml-1" />
                                            </a>
                                        </div>
                                    )}
                                    {portfolio.personalInfo.github && (
                                        <div className="flex items-center space-x-3">
                                            <Github className="w-4 h-4 text-gray-500" />
                                            <a 
                                                href={portfolio.personalInfo.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline flex items-center"
                                            >
                                                GitHub
                                                <ExternalLink className="w-3 h-3 ml-1" />
                                            </a>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Compétences */}
                        {portfolio.show_competences && portfolio.competences && portfolio.competences.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Award className="w-5 h-5" />
                                        <span>Compétences</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {portfolio.competences.map((competence) => (
                                            <Badge key={competence.id} variant="secondary">
                                                {competence.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Centres d'intérêt */}
                        {portfolio.show_hobbies && portfolio.hobbies && portfolio.hobbies.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Heart className="w-5 h-5" />
                                        <span>Centres d'intérêt</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {portfolio.hobbies.map((hobby) => (
                                            <Badge key={hobby.id} variant="outline">
                                                {hobby.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full" asChild>
                                    <Link href={route('portfolio.show', user.username || user.email)} target="_blank">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Voir le portfolio complet
                                    </Link>
                                </Button>
                                {portfolio.personalInfo.email && (
                                    <Button variant="outline" className="w-full" asChild>
                                        <a href={`mailto:${portfolio.personalInfo.email}?subject=Opportunité d'emploi`}>
                                            <Mail className="w-4 h-4 mr-2" />
                                            Contacter par email
                                        </a>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}