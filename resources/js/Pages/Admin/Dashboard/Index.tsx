import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { motion } from 'framer-motion';
import { 
    Users, 
    FileText, 
    TrendingUp, 
    DollarSign, 
    Activity, 
    Eye,
    Award,
    Heart,
    Briefcase,
    ArrowUp,
    ArrowDown,
    MoreHorizontal,
    Bell,
    Calendar,
    Clock,
    Zap,
    Target,
    Globe,
    Shield
} from 'lucide-react';

interface DashboardStats {
    totalUsers: number;
    totalCvs: number;
    totalRevenue: number;
    activeUsers: number;
    userGrowth: number;
    cvGrowth: number;
    revenueGrowth: number;
    activityGrowth: number;
}

interface RecentActivity {
    id: number;
    type: string;
    user: string;
    action: string;
    time: string;
    status: 'success' | 'warning' | 'info';
}

interface Props {
    stats?: DashboardStats;
    recentActivities?: RecentActivity[];
}

export default function Index({ stats, recentActivities }: Props) {
    // Mock data for demo purposes
    const mockStats: DashboardStats = {
        totalUsers: 12543,
        totalCvs: 8921,
        totalRevenue: 45230,
        activeUsers: 1234,
        userGrowth: 12.5,
        cvGrowth: 8.3,
        revenueGrowth: 23.1,
        activityGrowth: 15.7
    };

    const mockActivities: RecentActivity[] = [
        {
            id: 1,
            type: 'user_registration',
            user: 'John Doe',
            action: 'Created new account',
            time: '2 minutes ago',
            status: 'success'
        },
        {
            id: 2,
            type: 'cv_creation',
            user: 'Jane Smith',
            action: 'Generated CV with AI',
            time: '5 minutes ago',
            status: 'info'
        },
        {
            id: 3,
            type: 'payment',
            user: 'Mike Johnson',
            action: 'Upgraded to Premium',
            time: '12 minutes ago',
            status: 'success'
        },
        {
            id: 4,
            type: 'system',
            user: 'System',
            action: 'Database backup completed',
            time: '1 hour ago',
            status: 'info'
        }
    ];

    const currentStats = stats || mockStats;
    const activities = recentActivities || mockActivities;

    const statCards = [
        {
            title: 'Total Users',
            value: currentStats.totalUsers.toLocaleString(),
            change: currentStats.userGrowth,
            icon: Users,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50'
        },
        {
            title: 'CVs Created',
            value: currentStats.totalCvs.toLocaleString(),
            change: currentStats.cvGrowth,
            icon: FileText,
            color: 'from-green-500 to-emerald-500',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50'
        },
        {
            title: 'Revenue',
            value: `$${currentStats.totalRevenue.toLocaleString()}`,
            change: currentStats.revenueGrowth,
            icon: DollarSign,
            color: 'from-purple-500 to-pink-500',
            bgColor: 'from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50'
        },
        {
            title: 'Active Users',
            value: currentStats.activeUsers.toLocaleString(),
            change: currentStats.activityGrowth,
            icon: Activity,
            color: 'from-orange-500 to-red-500',
            bgColor: 'from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50'
        }
    ];

    const quickActions = [
        {
            title: 'Manage Users',
            description: 'View and manage user accounts',
            icon: Users,
            href: '/admin/users',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            title: 'CV Templates',
            description: 'Manage CV templates and designs',
            icon: FileText,
            href: '/cv-models',
            color: 'from-green-500 to-emerald-500'
        },
        {
            title: 'Analytics',
            description: 'View detailed analytics',
            icon: TrendingUp,
            href: '/admin/analytics',
            color: 'from-purple-500 to-pink-500'
        },
        {
            title: 'System Logs',
            description: 'Monitor system activity',
            icon: Shield,
            href: '/admin/audit-logs',
            color: 'from-orange-500 to-red-500'
        }
    ];

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'user_registration': return Users;
            case 'cv_creation': return FileText;
            case 'payment': return DollarSign;
            case 'system': return Shield;
            default: return Bell;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
            case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-purple-500 to-amber-600 flex items-center justify-center shadow-lg">
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, Admin</p>
                    </div>
                </div>
            }
        >
            <Head title="Admin Dashboard" />
            
            <div className="space-y-8">
                {/* Welcome Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-gradient-to-r from-amber-500 via-purple-500 to-amber-600 rounded-2xl p-6 md:p-8 text-white overflow-hidden"
                >
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold mb-2">Welcome to Guidy Admin</h2>
                                <p className="text-amber-100 text-lg">
                                    {new Date().toLocaleDateString('en-US', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </p>
                            </div>
                            <div className="hidden md:flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-sm text-amber-100">System Status</p>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                        <span className="font-semibold">All Systems Operational</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                    <div className="absolute -left-10 -top-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className={`relative overflow-hidden hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${stat.bgColor} border-0`}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg`}>
                                            <stat.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            {stat.change > 0 ? (
                                                <ArrowUp className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <ArrowDown className="w-4 h-4 text-red-500" />
                                            )}
                                            <span className={`text-sm font-semibold ${stat.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {Math.abs(stat.change)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                            {stat.value}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {stat.title}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-2"
                    >
                        <Card className="h-full">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center space-x-2">
                                    <Activity className="w-5 h-5 text-amber-500" />
                                    <span>Recent Activity</span>
                                </CardTitle>
                                <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {activities.map((activity, index) => {
                                        const IconComponent = getActivityIcon(activity.type);
                                        return (
                                            <motion.div
                                                key={activity.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.5 + index * 0.1 }}
                                                className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-amber-500 to-purple-500 flex items-center justify-center shadow-sm">
                                                    <IconComponent className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {activity.user}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                        {activity.action}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Badge className={getStatusColor(activity.status)}>
                                                        {activity.status}
                                                    </Badge>
                                                    <span className="text-xs text-gray-400">
                                                        {activity.time}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Zap className="w-5 h-5 text-amber-500" />
                                    <span>Quick Actions</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {quickActions.map((action, index) => (
                                        <motion.a
                                            key={action.title}
                                            href={action.href}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.7 + index * 0.1 }}
                                            className="block p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-amber-300 dark:hover:border-amber-600 transition-all duration-200 group"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                                                    <action.icon className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                                        {action.title}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {action.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.a>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </AdminLayout>
    );
}