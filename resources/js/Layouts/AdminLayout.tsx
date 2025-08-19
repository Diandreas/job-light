import { useState, PropsWithChildren, ReactNode } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { User as UserType } from '@/types';
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
    User
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { cn } from "@/lib/utils";
import Dropdown from '@/Components/Dropdown';

interface Props {
    user: UserType;
    header?: ReactNode;
    children: ReactNode;
}

interface MenuItem {
    name: string;
    href: string;
    icon: any;
    active: boolean;
}

export default function AdminLayout({ user, header, children }: PropsWithChildren<Props>) {
    const { t } = useTranslation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { url } = usePage();

    const menuItems: MenuItem[] = [
        {
            name: 'Dashboard',
            href: '/admin/dashboard',
            icon: BarChart3,
            active: url.startsWith('/admin/dashboard')
        },
        {
            name: 'Users',
            href: '/admin/users',
            icon: Users,
            active: url.startsWith('/admin/users')
        },
        {
            name: 'Companies',
            href: '/admin/companies',
            icon: Briefcase,
            active: url.startsWith('/admin/companies')
        },
        {
            name: 'CV Models',
            href: '/admin/cv-models',
            icon: FileText,
            active: url.startsWith('/admin/cv-models')
        },
        {
            name: 'Competences',
            href: '/admin/competences',
            icon: Award,
            active: url.startsWith('/admin/competences')
        },
        {
            name: 'Hobbies',
            href: '/admin/hobbies',
            icon: Heart,
            active: url.startsWith('/admin/hobbies')
        },
        {
            name: 'Experience Categories',
            href: '/admin/experience-categories',
            icon: FolderOpen,
            active: url.startsWith('/admin/experience-categories')
        },
        {
            name: 'Professions',
            href: '/admin/professions',
            icon: Briefcase,
            active: url.startsWith('/admin/professions')
        },
        {
            name: 'Profession Categories',
            href: '/admin/profession-categories',
            icon: FolderOpen,
            active: url.startsWith('/admin/profession-categories')
        },
        {
            name: 'Profession Missions',
            href: '/admin/profession-missions',
            icon: Settings,
            active: url.startsWith('/admin/profession-missions')
        },
        {
            name: 'Referral Levels',
            href: '/admin/referral-levels',
            icon: Gift,
            active: url.startsWith('/admin/referral-levels')
        },
        {
            name: 'Analytics',
            href: '/admin/analytics',
            icon: BarChart3,
            active: url.startsWith('/admin/analytics')
        },
        {
            name: 'Audit Logs',
            href: '/admin/audit-logs',
            icon: FileText,
            active: url.startsWith('/admin/audit-logs')
        }
    ];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Head title="Admin Panel" />
            
            {/* Mobile menu */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                    <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-gray-800">
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                type="button"
                                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <X className="h-6 w-6 text-white" />
                            </button>
                        </div>
                        <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
                            <div className="flex flex-shrink-0 items-center px-4">
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                            </div>
                            <nav className="mt-5 space-y-1 px-2">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            item.active
                                                ? 'bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white',
                                            'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                                        )}
                                    >
                                        <item.icon className="mr-3 h-5 w-5" />
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex min-h-0 flex-1 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                    <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                        <div className="flex flex-shrink-0 items-center px-4">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                        </div>
                        <nav className="mt-5 flex-1 space-y-1 px-2">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        item.active
                                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white',
                                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                                    )}
                                >
                                    <item.icon className="mr-3 h-5 w-5" />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>

            <div className="lg:pl-64 flex flex-col flex-1">
                {/* Top navigation */}
                <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 pl-1 pt-1 sm:pl-3 sm:pt-3 lg:pl-6 lg:pt-6">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <button
                                type="button"
                                className="border-r border-gray-200 dark:border-gray-700 pr-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500 lg:hidden"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            {header && (
                                <div className="ml-4 lg:ml-0">
                                    {header}
                                </div>
                            )}
                        </div>
                        
                        <div className="flex items-center pr-4 sm:pr-6 lg:pr-8">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md">
                                        <button
                                            type="button"
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition ease-in-out duration-150"
                                        >
                                            <User className="h-4 w-4 mr-2" />
                                            {user?.name || 'Admin'}
                                            <ChevronDown className="ml-2 -mr-0.5 h-4 w-4" />
                                        </button>
                                    </span>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href="/profile">
                                        Profile
                                    </Dropdown.Link>
                                    <Dropdown.Link href="/logout" method="post" as="button">
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <main className="flex-1">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}