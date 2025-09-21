import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
    Users, Building, Briefcase, Send, TrendingUp, TrendingDown,
    Eye, MapPin, Star, Download, Calendar, Target, Award,
    DollarSign, Clock, Filter, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';

interface StatisticsProps {
    auth: { user: any };
    overview: any;
    industries: any[];
    locations: any[];
    employmentTypes: any[];
    topCompanies: any[];
    topJobs: any[];
    applications: any;
    salaries: any;
    performance: any;
    timeSeries: any[];
    filters: {
        period: string;
        metric: string;
    };
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function StatisticsDashboard({
    auth, overview, industries, locations, employmentTypes,
    topCompanies, topJobs, applications, salaries, performance,
    timeSeries, filters
}: StatisticsProps) {
    const [selectedPeriod, setSelectedPeriod] = useState(filters.period);
    const [selectedMetric, setSelectedMetric] = useState(filters.metric);
    const [activeTab, setActiveTab] = useState('overview');

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('fr-FR').format(num);
    };

    const formatCurrency = (amount: number, currency = 'EUR') => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    const getGrowthIcon = (current: number, previous: number) => {
        if (current > previous) {
            return <TrendingUp className="w-4 h-4 text-green-500" />;
        } else if (current < previous) {
            return <TrendingDown className="w-4 h-4 text-red-500" />;
        }
        return null;
    };

    const StatCard = ({ title, value, icon: Icon, growth, color = "blue" }: any) => (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {formatNumber(value)}
                        </p>
                        {growth && (
                            <div className="flex items-center mt-1 text-sm">
                                {getGrowthIcon(growth.current, growth.previous)}
                                <span className={`ml-1 ${growth.current > growth.previous
                                    ? 'text-green-600'
                                    : growth.current < growth.previous
                                        ? 'text-red-600'
                                        : 'text-gray-600'
                                    }`}>
                                    {growth.label}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900/20 rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head>
                <title>Statistiques de la Plateforme - JobLight</title>
                <meta name="description" content="Tableau de bord des statistiques et analyses de la plateforme JobLight" />
            </Head>

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    📊 Statistiques de la Plateforme
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                    Analyses et métriques de performance de JobLight
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7_days">7 derniers jours</SelectItem>
                                        <SelectItem value="30_days">30 derniers jours</SelectItem>
                                        <SelectItem value="12_months">12 derniers mois</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button variant="outline" size="sm">
                                    <Download className="w-4 h-4 mr-2" />
                                    Exporter
                                </Button>
                            </div>
                        </div>

                        {/* Navigation tabs */}
                        <div className="flex space-x-1 mt-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                            {[
                                { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
                                { id: 'jobs', label: 'Emplois', icon: Briefcase },
                                { id: 'users', label: 'Utilisateurs', icon: Users },
                                { id: 'companies', label: 'Entreprises', icon: Building },
                                { id: 'performance', label: 'Performance', icon: Target }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4 mr-2" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Vue d'ensemble */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Métriques principales */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard
                                    title="Total Utilisateurs"
                                    value={overview.total_users}
                                    icon={Users}
                                    growth={{
                                        current: overview.new_users_this_month,
                                        previous: 0,
                                        label: `+${overview.new_users_this_month} ce mois`
                                    }}
                                    color="blue"
                                />
                                <StatCard
                                    title="Offres Actives"
                                    value={overview.active_jobs}
                                    icon={Briefcase}
                                    growth={{
                                        current: overview.new_jobs_this_month,
                                        previous: 0,
                                        label: `+${overview.new_jobs_this_month} ce mois`
                                    }}
                                    color="green"
                                />
                                <StatCard
                                    title="Candidatures"
                                    value={overview.total_applications}
                                    icon={Send}
                                    growth={{
                                        current: overview.applications_this_month,
                                        previous: 0,
                                        label: `+${overview.applications_this_month} ce mois`
                                    }}
                                    color="purple"
                                />
                                <StatCard
                                    title="Entreprises"
                                    value={overview.total_companies}
                                    icon={Building}
                                    color="orange"
                                />
                            </div>

                            {/* Graphique temporel */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Évolution temporelle</CardTitle>
                                        <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                                            <SelectTrigger className="w-40">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="users">Utilisateurs</SelectItem>
                                                <SelectItem value="jobs">Offres</SelectItem>
                                                <SelectItem value="applications">Candidatures</SelectItem>
                                                <SelectItem value="companies">Entreprises</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={timeSeries}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis />
                                                <Tooltip />
                                                <Area
                                                    type="monotone"
                                                    dataKey="count"
                                                    stroke="#3b82f6"
                                                    fill="#3b82f6"
                                                    fillOpacity={0.3}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Statistiques par secteur et localisation */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Top Secteurs</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={industries.slice(0, 8)}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis
                                                        dataKey="industry"
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={80}
                                                    />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Bar dataKey="job_count" fill="#3b82f6" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Types d'emploi</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={employmentTypes}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ employment_type, job_count }) =>
                                                            `${employment_type}: ${job_count}`
                                                        }
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="job_count"
                                                    >
                                                        {employmentTypes.map((entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={COLORS[index % COLORS.length]}
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Onglet Emplois */}
                    {activeTab === 'jobs' && (
                        <div className="space-y-8">
                            {/* Statistiques des candidatures */}
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                <StatCard
                                    title="Total"
                                    value={applications.total}
                                    icon={Send}
                                    color="blue"
                                />
                                <StatCard
                                    title="En attente"
                                    value={applications.pending}
                                    icon={Clock}
                                    color="yellow"
                                />
                                <StatCard
                                    title="Présélectionnées"
                                    value={applications.shortlisted}
                                    icon={Star}
                                    color="green"
                                />
                                <StatCard
                                    title="Embauchées"
                                    value={applications.hired}
                                    icon={Award}
                                    color="purple"
                                />
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Taux de succès
                                            </p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {applications.success_rate}%
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Offres les plus populaires */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Offres les plus populaires</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {topJobs.map((job, index) => (
                                            <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                                        <span className="font-bold text-blue-600">#{index + 1}</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold">{job.title}</h4>
                                                        <p className="text-sm text-gray-600">{job.company.name}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <Eye className="w-4 h-4" />
                                                        {formatNumber(job.views_count)}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Send className="w-4 h-4" />
                                                        {formatNumber(job.applications_count)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Statistiques salariales */}
                            {salaries.average_min > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Statistiques Salariales</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                            <div className="text-center">
                                                <p className="text-sm text-gray-600">Salaire min moyen</p>
                                                <p className="text-xl font-bold">
                                                    {formatCurrency(salaries.average_min)}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-gray-600">Salaire max moyen</p>
                                                <p className="text-xl font-bold">
                                                    {formatCurrency(salaries.average_max)}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-gray-600">Médiane min</p>
                                                <p className="text-xl font-bold">
                                                    {formatCurrency(salaries.median_min)}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-gray-600">Médiane max</p>
                                                <p className="text-xl font-bold">
                                                    {formatCurrency(salaries.median_max)}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Onglet Entreprises */}
                    {activeTab === 'companies' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Entreprises les plus actives</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {topCompanies.map((company, index) => (
                                        <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                                    <span className="font-bold text-green-600">#{index + 1}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">{company.name}</h4>
                                                    <p className="text-sm text-gray-600">{company.industry}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6 text-sm text-gray-600">
                                                <div>
                                                    <span className="font-medium">{formatNumber(company.jobs_posted)}</span>
                                                    <span className="ml-1">offres</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium">{formatNumber(company.total_applications_received)}</span>
                                                    <span className="ml-1">candidatures</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium">{formatNumber(company.total_views)}</span>
                                                    <span className="ml-1">vues</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
