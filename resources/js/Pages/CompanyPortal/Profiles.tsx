import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { 
    Search, 
    Filter, 
    MapPin, 
    Briefcase, 
    Mail,
    Building2,
    Eye
} from 'lucide-react';

export default function Profiles({ profiles, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [profession, setProfession] = useState(filters.profession || '');

    const handleSearch = () => {
        router.get(route('company-portal.profiles'), {
            search: search,
            profession: profession,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getVisibilityBadge = (visibility) => {
        const variants = {
            'company_portal': { color: 'bg-blue-100 text-blue-800', icon: '🏢', label: 'Entreprises' },
            'public': { color: 'bg-green-100 text-green-800', icon: '🌐', label: 'Public' },
            'community': { color: 'bg-purple-100 text-purple-800', icon: '👥', label: 'Communauté' },
        };
        
        const variant = variants[visibility] || variants['public'];
        
        return (
            <Badge className={`${variant.color} text-xs`}>
                <span className="mr-1">{variant.icon}</span>
                {variant.label}
            </Badge>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Profils - Portail Entreprise" />
            
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Building2 className="w-8 h-8 text-blue-600" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Profils Talents</h1>
                                <p className="text-gray-600">
                                    {profiles.total} profil{profiles.total > 1 ? 's' : ''} disponible{profiles.total > 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href={route('company-portal.index')}>
                                Retour au portail
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filtres de recherche */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Filter className="w-5 h-5" />
                            <span>Filtres de recherche</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Rechercher par nom, profession..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <Input
                                placeholder="Filtrer par profession"
                                value={profession}
                                onChange={(e) => setProfession(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button onClick={handleSearch} className="w-full">
                                Rechercher
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Liste des profils */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profiles.data.map((profile) => (
                        <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Avatar className="w-12 h-12">
                                            <AvatarImage 
                                                src={profile.portfolio_settings?.profile_picture} 
                                                alt={profile.name} 
                                            />
                                            <AvatarFallback>
                                                {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{profile.name}</h3>
                                            <p className="text-sm text-gray-600">
                                                {profile.full_profession || profile.profession?.name || 'Profession non spécifiée'}
                                            </p>
                                        </div>
                                    </div>
                                    {getVisibilityBadge(profile.portfolio_settings?.visibility)}
                                </div>
                            </CardHeader>
                            
                            <CardContent className="pt-0">
                                <div className="space-y-3">
                                    {profile.address && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            {profile.address}
                                        </div>
                                    )}
                                    
                                    {profile.competences && profile.competences.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">Compétences</p>
                                            <div className="flex flex-wrap gap-1">
                                                {profile.competences.slice(0, 3).map((competence) => (
                                                    <Badge key={competence.id} variant="secondary" className="text-xs">
                                                        {competence.name}
                                                    </Badge>
                                                ))}
                                                {profile.competences.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{profile.competences.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-4">
                                        {profile.email && profile.portfolio_settings?.show_contact_info && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Mail className="w-4 h-4 mr-1" />
                                                <span className="truncate max-w-[120px]">{profile.email}</span>
                                            </div>
                                        )}
                                        
                                        <Button size="sm" asChild>
                                            <Link href={route('company-portal.profile.show', profile.username || profile.email)}>
                                                <Eye className="w-4 h-4 mr-1" />
                                                Voir le profil
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Pagination */}
                {profiles.last_page > 1 && (
                    <div className="mt-8 flex justify-center">
                        <div className="flex space-x-2">
                            {profiles.links.map((link, index) => (
                                <Button
                                    key={index}
                                    variant={link.active ? "default" : "outline"}
                                    size="sm"
                                    disabled={!link.url}
                                    asChild={!!link.url}
                                >
                                    {link.url ? (
                                        <Link href={link.url} preserveState preserveScroll>
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </Link>
                                    ) : (
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {profiles.data.length === 0 && (
                    <div className="text-center py-12">
                        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun profil trouvé</h3>
                        <p className="text-gray-600">
                            Essayez de modifier vos critères de recherche ou supprimez les filtres.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}