import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { 
    Users, 
    Building2, 
    FileText, 
    Eye, 
    DollarSign,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    Clock,
    CheckCircle
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

interface Stats {
    users: {
        total: number;
        today: number;
        thisMonth: number;
        growth: number;
    };
    companies: {
        total: number;
        approved: number;
        pending: number;
        today: number;
    };
    cvs: {
        total: number;
        today: number;
        thisMonth: number;
    };
    portfolios: {
        total: number;
        public: number;
        company_portal: number;
        community: number;
        private: number;
    };
    revenue: {
        total: number;
        thisMonth: number;
        todayTransactions: number;
    };
}

interface Charts {
    userRegistrations: {
        labels: string[];
        data: number[];
    };
    companyRegistrations: {
        labels: string[];
        data: number[];
    };
    revenueChart: {
        labels: string[];
        data: number[];
    };
    portfolioVisibility: {
        labels: string[];
        data: number[];
    };
}

interface Activity {
    id: number;
    action: string;
    description: string;
    admin: string;
    user?: string;
    model: string;
    created_at: string;
    created_at_full: string;
}

interface PendingActions {
    pendingCompanies: number;
    todayRegistrations: number;
    recentPayments: number;
    systemAlerts: number;
}

export default function AdminDashboard({ 
    auth, 
    stats, 
    charts, 
    recentActivities, 
    pendingActions 
}: {
    auth: any;
    stats: Stats;
    charts: Charts;
    recentActivities: Activity[];
    pendingActions: PendingActions;
}) {
    // Configuration des graphiques
    const lineChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    const userRegistrationData = {
        labels: charts.userRegistrations.labels,
        datasets: [
            {
                label: 'Inscriptions utilisateurs',
                data: charts.userRegistrations.data,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.3,
            },
        ],
    };

    const companyRegistrationData = {
        labels: charts.companyRegistrations.labels,
        datasets: [
            {
                label: 'Inscriptions entreprises',
                data: charts.companyRegistrations.data,
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.3,
            },
        ],
    };

    const revenueData = {
        labels: charts.revenueChart.labels,
        datasets: [
            {
                label: 'Revenus (€)',
                data: charts.revenueChart.data,
                borderColor: 'rgb(245, 158, 11)',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.3,
            },
        ],
    };

    const portfolioVisibilityData = {
        labels: charts.portfolioVisibility.labels,
        datasets: [
            {
                data: charts.portfolioVisibility.data,
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',   // Private - rouge
                    'rgba(59, 130, 246, 0.8)',   // Company Portal - bleu
                    'rgba(147, 51, 234, 0.8)',   // Community - violet
                    'rgba(16, 185, 129, 0.8)',   // Public - vert
                ],
                borderWidth: 2,
            },
        ],
    };

    const getActionBadge = (action: string) => {
        const variants: Record<string, { color: string; text: string }> = {
            created: { color: 'bg-green-100 text-green-800', text: 'Créé' },
            updated: { color: 'bg-blue-100 text-blue-800', text: 'Modifié' },
            deleted: { color: 'bg-red-100 text-red-800', text: 'Supprimé' },
            approved: { color: 'bg-emerald-100 text-emerald-800', text: 'Approuvé' },
            rejected: { color: 'bg-orange-100 text-orange-800', text: 'Rejeté' },
        };

        const variant = variants[action] || { color: 'bg-gray-100 text-gray-800', text: action };
        
        return (
            <Badge className={`${variant.color} text-xs`}>
                {variant.text}
            </Badge>
        );
    };

    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800">Tableau de Bord</h2>}
        >
            <Head title="Dashboard Administrateur" />

            <div className="py-6">
                {/* Statistiques principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Utilisateurs
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.users.total.toLocaleString()}</div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                {stats.users.growth >= 0 ? (
                                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                                ) : (
                                    <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                                )}
                                <span className={stats.users.growth >= 0 ? 'text-green-500' : 'text-red-500'}>
                                    {stats.users.growth}%
                                </span>
                                <span className="ml-1">ce mois</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                +{stats.users.today} aujourd'hui
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Entreprises
                            </CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.companies.total}</div>
                            <div className="text-xs text-muted-foreground">
                                {stats.companies.approved} approuvées, {stats.companies.pending} en attente
                            </div>
                            <p className="text-xs text-muted-foreground">
                                +{stats.companies.today} aujourd'hui
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                CVs Créés
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.cvs.total.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                +{stats.cvs.today} aujourd'hui
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {stats.cvs.thisMonth} ce mois
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Revenus
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.revenue.total.toLocaleString()} €
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.revenue.thisMonth.toLocaleString()} € ce mois
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {stats.revenue.todayTransactions} transactions aujourd'hui
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Actions en attente */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                Actions Requises
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {pendingActions.pendingCompanies > 0 && (
                                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-orange-600" />
                                            <span className="text-sm font-medium">
                                                {pendingActions.pendingCompanies} entreprise(s) en attente d'approbation
                                            </span>
                                        </div>
                                        <Button size="sm" asChild>
                                            <a href="/admin/companies?status=pending">Voir</a>
                                        </Button>
                                    </div>
                                )}

                                {pendingActions.todayRegistrations > 0 && (
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium">
                                                {pendingActions.todayRegistrations} nouveaux utilisateurs aujourd'hui
                                            </span>
                                        </div>
                                        <Button size="sm" variant="outline" asChild>
                                            <a href="/admin/users">Voir</a>
                                        </Button>
                                    </div>
                                )}

                                {(pendingActions.pendingCompanies === 0 && pendingActions.todayRegistrations === 0) && (
                                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-sm text-green-800">
                                            Aucune action requise pour le moment
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Répartition des portfolios */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Visibilité des Portfolios</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <Doughnut 
                                    data={portfolioVisibilityData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'bottom' as const,
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Graphiques de tendances */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Inscriptions Utilisateurs (30 derniers jours)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <Line 
                                    data={userRegistrationData} 
                                    options={{
                                        ...lineChartOptions,
                                        maintainAspectRatio: false,
                                    }} 
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Revenus (30 derniers jours)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <Line 
                                    data={revenueData} 
                                    options={{
                                        ...lineChartOptions,
                                        maintainAspectRatio: false,
                                    }} 
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Activités récentes */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Activités Récentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivities.map((activity) => (
                                <div key={activity.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        {getActionBadge(activity.action)}
                                        <div>
                                            <p className="text-sm font-medium">
                                                {activity.description}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                Par {activity.admin}
                                                {activity.user && ` • Utilisateur: ${activity.user}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">{activity.created_at}</p>
                                        <p className="text-xs text-gray-400">{activity.created_at_full}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {recentActivities.length === 0 && (
                            <p className="text-center text-gray-500 py-8">
                                Aucune activité récente
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}