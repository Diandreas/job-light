import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { ScrollText, Eye, User, Calendar } from 'lucide-react';

interface AuditLog {
    id: number;
    action: string;
    description: string;
    admin: {
        name: string;
    } | null;
    user: {
        name: string;
    } | null;
    model_type: string;
    created_at: string;
    created_at_full: string;
}

interface Props {
    logs: {
        data: AuditLog[];
        current_page: number;
        last_page: number;
        total: number;
    };
    actions: string[];
    filters: {
        search?: string;
        action?: string;
        dateFrom?: string;
        dateTo?: string;
    };
}

export default function AuditLogsIndex({ logs, actions, filters }: Props) {
    const getActionBadgeColor = (action: string) => {
        switch (action.toLowerCase()) {
            case 'created':
                return 'bg-green-100 text-green-800';
            case 'updated':
                return 'bg-blue-100 text-blue-800';
            case 'deleted':
                return 'bg-red-100 text-red-800';
            case 'approved':
                return 'bg-emerald-100 text-emerald-800';
            case 'rejected':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AdminLayout>
            <Head title="Journaux d'Audit" />
            
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Journaux d'Audit</h1>
                    <p className="text-gray-600">Historique des actions administratives</p>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total des Logs</CardTitle>
                            <ScrollText className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{logs?.total || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Actions Uniques</CardTitle>
                            <Eye className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{actions?.length || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Liste des logs */}
                <Card>
                    <CardHeader>
                        <CardTitle>Historique des Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4">Action</th>
                                        <th className="text-left py-3 px-4">Description</th>
                                        <th className="text-left py-3 px-4">Administrateur</th>
                                        <th className="text-left py-3 px-4">Utilisateur Cible</th>
                                        <th className="text-left py-3 px-4">Modèle</th>
                                        <th className="text-left py-3 px-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs?.data?.map((log) => (
                                        <tr key={log.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <Badge className={getActionBadgeColor(log.action)}>
                                                    {log.action}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 max-w-xs truncate">
                                                {log.description}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-gray-400" />
                                                    {log.admin?.name || 'Système'}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                {log.user?.name || '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant="outline">
                                                    {log.model_type}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <div>
                                                        <div className="text-sm font-medium">
                                                            {new Date(log.created_at).toLocaleDateString('fr-FR')}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {new Date(log.created_at).toLocaleTimeString('fr-FR')}
                                                        </div>
                                                    </div>
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