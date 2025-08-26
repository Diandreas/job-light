import { useState, PropsWithChildren, ReactNode } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { User as UserType, PageProps } from '@/types';
import {
    Menu,
    X,
    Users,
    Settings,
    BarChart3,
    FileText,
    Briefcase,
    Award,
    Heart,
    FolderOpen,
    Gift,
    ChevronDown,
    LogOut,
    User,
    Sparkles,
    Crown,
    Shield,
    Zap,
    TrendingUp,
    Activity,
    Bell,
    Search,
    Home,
    Database,
    Eye
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { cn } from "@/lib/utils";
import Dropdown from '@/Components/Dropdown';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    header?: ReactNode;
    children: ReactNode;
}

interface MenuItem {
    name: string;
    href: string;
    icon: any;
    active: boolean;
    badge?: string;
    description?: string;
}

export default function AdminLayout({ header, children }: PropsWithChildren<Props>) {
    const { t } = useTranslation();
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { url } = usePage();

    const menuItems: MenuItem[] = [
        {
            name: 'Dashboard',
            href: '/admin/dashboard',
            icon: Home,
            active: url.startsWith('/admin/dashboard'),
            description: 'Overview & metrics'
        },
        {
            name: 'Analytics',
            href: '/admin/analytics',
            icon: TrendingUp,
            active: url.startsWith('/admin/analytics'),
            description: 'Performance insights'
        },
        {
            name: 'Users',
            href: '/admin/users',
            icon: Users,
            active: url.startsWith('/admin/users'),
            badge: 'New',
            description: 'User management'
        },
        {
            name: 'Companies',
            href: '/admin/companies',
            icon: Briefcase,
            active: url.startsWith('/admin/companies'),
            description: 'Corporate accounts'
        },
        {
            name: 'CV Models',
            href: '/cv-models',
            icon: FileText,
            active: url.startsWith('/cv-models'),
            description: 'Resume templates'
        },
        {
            name: 'Competences',
            href: '/competences',
            icon: Award,
            active: url.startsWith('/competences'),
            description: 'Skills database'
        },
        {
            name: 'Hobbies',
            href: '/hobbies',
            icon: Heart,
            active: url.startsWith('/hobbies'),
            description: 'Interest categories'
        },
        {
            name: 'Experience Categories',
            href: '/experience-categories',
            icon: FolderOpen,
            active: url.startsWith('/experience-categories'),
            description: 'Work classifications'
        },
        {
            name: 'Professions',
            href: '/professions',
            icon: Briefcase,
            active: url.startsWith('/professions'),
            description: 'Job titles'
        },
        {
            name: 'Profession Categories',
            href: '/profession-categories',
            icon: Database,
            active: url.startsWith('/profession-categories'),
            description: 'Career fields'
        },
        {
            name: 'Profession Missions',
            href: '/profession-missions',
            icon: Zap,
            active: url.startsWith('/profession-missions'),
            description: 'Job descriptions'
        },
        {
            name: 'Referral Levels',
            href: '/admin/referral-levels',
            icon: Gift,
            active: url.startsWith('/admin/referral-levels'),
            description: 'Reward tiers'
        },
        {
            name: 'Audit Logs',
            href: '/admin/audit-logs',
            icon: Shield,
            active: url.startsWith('/admin/audit-logs'),
            description: 'System activity'
        }
    ];

    const sidebarVariants = {
        open: { x: 0, opacity: 1 },
        closed: { x: -280, opacity: 0 }
    };

    const overlayVariants = {
        open: { opacity: 1, backdropFilter: "blur(4px)" },
        closed: { opacity: 0, backdropFilter: "blur(0px)" }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-purple-50/20 dark:from-gray-950 dark:via-amber-950/20 dark:to-purple-950/10">
            <Head title="Admin Panel - Guidy" />

            {/* Mobile Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        className="fixed inset-0 z-40 lg:hidden"
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={overlayVariants}
                        transition={{ duration: 0.2 }}
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        className="fixed inset-y-0 left-0 z-50 w-80 lg:hidden"
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={sidebarVariants}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    >
                        <div className="flex h-full flex-col bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-amber-200/50 dark:border-amber-800/30 shadow-2xl">
                            {/* Mobile Header */}
                            <div className="flex items-center justify-between p-6 border-b border-amber-200/50 dark:border-amber-800/30">
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-purple-500 to-amber-600 flex items-center justify-center shadow-lg">
                                            <Crown className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 via-purple-600 to-amber-600 bg-clip-text text-transparent">
                                            Guidy Admin
                                        </h1>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Control Center</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSidebarOpen(false)}
                                    className="rounded-xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Mobile Navigation */}
                            <nav className="flex-1 overflow-y-auto py-4 px-3">
                                <div className="space-y-1">
                                    {menuItems.map((item, index) => (
                                        <motion.div
                                            key={item.name}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    'group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                                                    item.active
                                                        ? 'bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 text-amber-700 dark:text-amber-300 shadow-md border border-amber-200/50 dark:border-amber-800/50'
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800/50 dark:hover:text-white'
                                                )}
                                                onClick={() => setSidebarOpen(false)}
                                            >
                                                <item.icon className={cn(
                                                    "mr-3 h-5 w-5 transition-transform group-hover:scale-110",
                                                    item.active && "text-amber-600 dark:text-amber-400"
                                                )} />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span>{item.name}</span>
                                                        {item.badge && (
                                                            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.description && (
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>
                                                {item.active && (
                                                    <motion.div
                                                        className="absolute right-2 w-2 h-8 bg-gradient-to-b from-amber-500 to-purple-500 rounded-full"
                                                        layoutId="activeIndicatorMobile"
                                                        transition={{ type: "spring", duration: 0.5 }}
                                                    />
                                                )}
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            </nav>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col">
                <div className="flex min-h-0 flex-1 flex-col bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-amber-200/50 dark:border-amber-800/30 shadow-xl">
                    {/* Desktop Header */}
                    <div className="flex flex-col p-6 border-b border-amber-200/50 dark:border-amber-800/30">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-purple-500 to-amber-600 flex items-center justify-center shadow-lg">
                                    <Crown className="w-7 h-7 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 via-purple-600 to-amber-600 bg-clip-text text-transparent">
                                    Guidy Admin
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Control Center</p>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 p-3 rounded-xl border border-green-200/50 dark:border-green-800/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-green-600 dark:text-green-400">System</p>
                                        <p className="text-lg font-bold text-green-700 dark:text-green-300">Online</p>
                                    </div>
                                    <Activity className="w-5 h-5 text-green-500" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 p-3 rounded-xl border border-blue-200/50 dark:border-blue-800/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Users</p>
                                        <p className="text-lg font-bold text-blue-700 dark:text-blue-300">1.2K</p>
                                    </div>
                                    <Users className="w-5 h-5 text-blue-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4 px-4">
                        <div className="space-y-2">
                            {menuItems.map((item, index) => (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            'group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
                                            item.active
                                                ? 'bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 text-amber-700 dark:text-amber-300 shadow-lg border border-amber-200/50 dark:border-amber-800/50'
                                                : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-amber-50/50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-gray-800/50 dark:hover:to-amber-950/50 dark:hover:text-white'
                                        )}
                                    >
                                        <item.icon className={cn(
                                            "mr-4 h-5 w-5 transition-all duration-200 group-hover:scale-110",
                                            item.active ? "text-amber-600 dark:text-amber-400" : "text-gray-400 group-hover:text-amber-500"
                                        )} />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="truncate">{item.name}</span>
                                                {item.badge && (
                                                    <motion.span
                                                        className="ml-2 px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-sm"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        {item.badge}
                                                    </motion.span>
                                                )}
                                            </div>
                                            {item.description && (
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                        {item.active && (
                                            <motion.div
                                                className="absolute right-2 w-2 h-8 bg-gradient-to-b from-amber-500 to-purple-500 rounded-full shadow-sm"
                                                layoutId="activeIndicatorDesktop"
                                                transition={{ type: "spring", duration: 0.5 }}
                                            />
                                        )}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </nav>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:pl-80 flex flex-col flex-1">
                {/* Top Navigation Bar */}
                <motion.div
                    className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-amber-200/50 dark:border-amber-800/30 shadow-sm"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center space-x-4">
                            {/* Mobile Menu Button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="lg:hidden rounded-xl hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/50"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Menu className="h-5 w-5" />
                            </Button>

                            {/* Page Header */}
                            {header && (
                                <motion.div
                                    className="flex items-center space-x-3"
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <div className="h-8 w-1 bg-gradient-to-b from-amber-500 to-purple-500 rounded-full"></div>
                                    {header}
                                </motion.div>
                            )}
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center space-x-3">
                            {/* Search Button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="hidden sm:flex rounded-xl hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/50"
                            >
                                <Search className="h-4 w-4 mr-2" />
                                <span className="text-sm">Search</span>
                            </Button>

                            {/* Notifications */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="relative rounded-xl hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/50"
                            >
                                <Bell className="h-4 w-4" />
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white dark:border-gray-900"></span>
                            </Button>

                            {/* User Menu */}
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <Button
                                        variant="ghost"
                                        className="flex items-center space-x-3 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/50 px-3 py-2 h-auto"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center shadow-sm">
                                            <User className="h-4 w-4 text-white" />
                                        </div>
                                        <div className="hidden sm:block text-left">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                {user?.name || 'Admin'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Administrator
                                            </p>
                                        </div>
                                        <ChevronDown className="h-4 w-4 text-gray-500" />
                                    </Button>
                                </Dropdown.Trigger>

                                <Dropdown.Content contentClasses="py-1 bg-white w-48">
                                    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                            {user?.name || 'Admin'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {user?.email || 'admin@guidy.com'}
                                        </p>
                                    </div>
                                    <Dropdown.Link href="/profile" className="flex items-center px-3 py-2">
                                        <User className="h-4 w-4 mr-3" />
                                        Profile Settings
                                    </Dropdown.Link>
                                    <Dropdown.Link href="/admin/settings" className="flex items-center px-3 py-2">
                                        <Settings className="h-4 w-4 mr-3" />
                                        Admin Settings
                                    </Dropdown.Link>
                                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                                    <Dropdown.Link href="/logout" method="post" as="button" className="flex items-center px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50">
                                        <LogOut className="h-4 w-4 mr-3" />
                                        Sign Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content */}
                <main className="flex-1 relative">
                    <motion.div
                        className="p-4 sm:p-6 lg:p-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        {children}
                    </motion.div>

                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-100/20 via-purple-100/20 to-transparent rounded-full blur-3xl -z-10"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-100/20 via-amber-100/20 to-transparent rounded-full blur-3xl -z-10"></div>
                </main>
            </div>
        </div>
    );
}