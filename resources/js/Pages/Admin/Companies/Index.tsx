import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Building2, Plus, Eye, CheckCircle, XCircle } from 'lucide-react';

interface Company {
    id: number;
    name: string;
    email: string;
    company_type: string;
    is_approved: boolean;
    created_at: string;
}

interface Props {
    companies: {
        data: Company[];
        current_page: number;
        last_page: number;
        total: number;
    };
    stats: {
        total: number;
        approved: number;
        pending: number;
    };
}

export default function CompaniesIndex({ companies, stats }: Props) {
    return (
        <AdminLayout>
            <Head title="Gestion des Entreprises" />
            
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestion des Entreprises</h1>
                        <p className="text-gray-600">Gérez les entreprises inscrites sur la plateforme</p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/companies/create">
                            <Plus className="w-4 h-4 mr-2" />
                            Nouvelle Entreprise
                        </Link>
                    </Button>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Entreprises</CardTitle>
                            <Building2 className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approuvées</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats?.approved || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
                            <XCircle className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats?.pending || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Liste des entreprises */}
                <Card>
                    <CardHeader>
                        <CardTitle>Liste des Entreprises</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4">Nom</th>
                                        <th className="text-left py-3 px-4">Email</th>
                                        <th className="text-left py-3 px-4">Type</th>
                                        <th className="text-left py-3 px-4">Statut</th>
                                        <th className="text-left py-3 px-4">Date d'inscription</th>
                                        <th className="text-left py-3 px-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companies?.data?.map((company) => (
                                        <tr key={company.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4 font-medium">{company.name}</td>
                                            <td className="py-3 px-4">{company.email}</td>
                                            <td className="py-3 px-4">{company.company_type}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant={company.is_approved ? "default" : "secondary"}>
                                                    {company.is_approved ? 'Approuvée' : 'En attente'}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                {new Date(company.created_at).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex space-x-2">
                                                    <Button size="sm" variant="outline" asChild>
                                                        <Link href={`/admin/companies/${company.id}`}>
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}