import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { 
    Search, 
    Filter, 
    Download, 
    Eye,
    Edit,
    UserCheck,
    UserX,
    Calendar,
    Mail,
    MapPin,
    Briefcase,
    FileText,
    Users
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    phone_number?: string;
    full_profession?: string;
    address?: string;
    UserType: number;
    wallet_balance?: number;
    created_at: string;
    email_verified_at?: string;
    cv_infos_count: number;
    referrals_count: number;
    portfolio_settings?: {
        visibility: string;
    };
}

interface Stats {
    total: number;
    active: number;
    withPortfolio: number;
    withCv: number;
}

interface Filters {
    search?: string;
    userType?: string;
    hasPortfolio?: boolean;
    dateFrom?: string;
    dateTo?: string;
}

export default function UsersIndex({ 
    auth, 
    users, 
    stats, 
    filters 
}: {
    auth: any;
    users: {
        data: User[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: Stats;
    filters: Filters;
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [userType, setUserType] = useState(filters.userType || '');
    const [hasPortfolio, setHasPortfolio] = useState<string>(
        filters.hasPortfolio !== undefined ? filters.hasPortfolio.toString() : ''
    );
    const [dateFrom, setDateFrom] = useState(filters.dateFrom || '');
    const [dateTo, setDateTo] = useState(filters.dateTo || '');

    const handleSearch = () => {
        router.get(route('admin.users.index'), {
            search,
            userType,
            hasPortfolio: hasPortfolio !== '' ? hasPortfolio === 'true' : undefined,
            dateFrom,
            dateTo,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setUserType('');
        setHasPortfolio('');
        setDateFrom('');
        setDateTo('');
        
        router.get(route('admin.users.index'));
    };

    const exportUsers = () => {
        const params = new URLSearchParams({
            ...(search && { search }),
            ...(userType && { userType }),
            ...(hasPortfolio !== '' && { hasPortfolio }),
            ...(dateFrom && { dateFrom }),
            ...(dateTo && { dateTo }),
        });

        window.open(`${route('admin.users.export')}?${params.toString()}`);
    };

    const getUserStatusBadge = (user: User) => {
        if (user.UserType === 2) {
            return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
        } else if (user.UserType === 0) {
            return <Badge className="bg-red-100 text-red-800">Suspendu</Badge>;
        } else {
            return <Badge className="bg-gray-100 text-gray-800">Inconnu</Badge>;
        }
    };

    const getVisibilityBadge = (visibility?: string) => {
        if (!visibility) return null;

        const variants: Record<string, { color: string; icon: string }> = {
            'private': { color: 'bg-red-100 text-red-800', icon: '🔒' },
            'company_portal': { color: 'bg-blue-100 text-blue-800', icon: '🏢' },
            'community': { color: 'bg-purple-100 text-purple-800', icon: '👥' },
            'public': { color: 'bg-green-100 text-green-800', icon: '🌐' },
        };

        const variant = variants[visibility] || variants['private'];
        
        return (
            <Badge className={`${variant.color} text-xs`}>
                <span className="mr-1">{variant.icon}</span>
                {visibility.replace('_', ' ')}
            </Badge>
        );
    };

    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800">Gestion des Utilisateurs</h2>}
        >
            <Head title="Gestion Utilisateurs" />

            <div className="py-6">
                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">utilisateurs</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active}</div>
                            <p className="text-xs text-muted-foreground">email vérifié</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avec Portfolio</CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.withPortfolio}</div>
                            <p className="text-xs text-muted-foreground">portfolio créé</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avec CV</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.withCv}</div>
                            <p className="text-xs text-muted-foreground">CV créé</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filtres */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filtres et Recherche
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Rechercher par nom, email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>

                            <Select value={userType} onValueChange={setUserType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Type d'utilisateur" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Tous les types</SelectItem>
                                    <SelectItem value="2">Actifs</SelectItem>
                                    <SelectItem value="0">Suspendus</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={hasPortfolio} onValueChange={setHasPortfolio}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Portfolio" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Tous</SelectItem>
                                    <SelectItem value="true">Avec portfolio</SelectItem>
                                    <SelectItem value="false">Sans portfolio</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    placeholder="Date de début"
                                />
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    placeholder="Date de fin"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleSearch}>Rechercher</Button>
                            <Button variant="outline" onClick={clearFilters}>
                                Effacer les filtres
                            </Button>
                            <Button variant="outline" onClick={exportUsers} className="ml-auto">
                                <Download className="h-4 w-4 mr-2" />
                                Exporter
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Liste des utilisateurs */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Utilisateurs ({users.total.toLocaleString()})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {users.data.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center space-x-4">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback>
                                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-medium text-gray-900">{user.name}</h3>
                                                {getUserStatusBadge(user)}
                                                {user.portfolio_settings && getVisibilityBadge(user.portfolio_settings.visibility)}
                                            </div>
                                            
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {user.email}
                                                </div>
                                                
                                                {user.full_profession && (
                                                    <div className="flex items-center gap-1">
                                                        <Briefcase className="h-3 w-3" />
                                                        {user.full_profession}
                                                    </div>
                                                )}
                                                
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                                <span>{user.cv_infos_count} CV</span>
                                                <span>{user.referrals_count} parrainages</span>
                                                {user.wallet_balance !== undefined && (
                                                    <span>{user.wallet_balance}€ wallet</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" variant="outline" asChild>
                                            <Link href={route('admin.users.show', user.id)}>
                                                <Eye className="h-4 w-4 mr-1" />
                                                Voir
                                            </Link>
                                        </Button>
                                        
                                        <Button size="sm" variant="outline" asChild>
                                            <Link href={route('admin.users.edit', user.id)}>
                                                <Edit className="h-4 w-4 mr-1" />
                                                Modifier
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {users.last_page > 1 && (
                            <div className="flex justify-center mt-6">
                                <div className="flex space-x-1">
                                    {users.links.map((link, index) => (
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

                        {users.data.length === 0 && (
                            <div className="text-center py-12">
                                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
                                <p className="text-gray-600">
                                    Essayez de modifier vos critères de recherche ou supprimez les filtres.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}