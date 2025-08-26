import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Users, FileText, DollarSign, Eye } from 'lucide-react';

interface Stats {
    totalUsers: number;
    totalCvs: number;
    totalPayments: number;
    totalPortfolioVisits: number;
    recentUsers: number;
    recentCvs: number;
}

interface MonthlyUser {
    month: string;
    count: number;
}

interface Props {
    auth: { user: any };
    stats: Stats;
    monthlyUsers: MonthlyUser[];
}

export default function Index({ auth, stats, monthlyUsers }: Props) {
    return (
        <AdminLayout>
            <Head title="Analytics" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalUsers}</div>
                            <p className="text-xs text-muted-foreground">
                                +{stats.recentUsers} in last 30 days
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total CVs</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalCvs}</div>
                            <p className="text-xs text-muted-foreground">
                                +{stats.recentCvs} in last 30 days
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${stats.totalPayments}</div>
                            <p className="text-xs text-muted-foreground">
                                All time revenue
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Portfolio Visits</CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalPortfolioVisits}</div>
                            <p className="text-xs text-muted-foreground">
                                Total visits
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Users Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly User Registrations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {monthlyUsers.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{item.month}</span>
                                    <div className="flex items-center space-x-2">
                                        <div
                                            className="bg-amber-500 h-2 rounded"
                                            style={{
                                                width: `${Math.max(10, (item.count / Math.max(...monthlyUsers.map(u => u.count))) * 200)}px`
                                            }}
                                        />
                                        <span className="text-sm text-muted-foreground w-8 text-right">
                                            {item.count}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}