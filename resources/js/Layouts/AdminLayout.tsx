import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { 
    LayoutDashboard,
    Users,
    Building2,
    FileText,
    BarChart3,
    Settings,
    Shield,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    Eye,
    Award,
    Heart,
    Briefcase,
    ChevronDown,
    ChevronRight
} from 'lucide-react';

interface AdminLayoutProps {
    user: any;
    header?: React.ReactNode;
    children: React.ReactNode;
}

interface MenuItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    children?: MenuItem[];
}

export default function AdminLayout({ user, header, children }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState<string[]>(['content']);
    const { url } = usePage();

    const navigation: MenuItem[] = [
        { 
            name: 'Dashboard', 
            href: '/admin/dashboard', 
            icon: LayoutDashboard 
        },
        { 
            name: 'Utilisateurs', 
            href: '/admin/users', 
            icon: Users 
        },
        { 
            name: 'Entreprises', 
            href: '/admin/companies', 
            icon: Building2,
            badge: '3' // Exemple de badge pour les entreprises en attente
        },
        {
            name: 'Gestion Contenu',
            href: '/admin/content',
            icon: FileText,
            children: [
                { name: 'Modèles CV', href: '/admin/cv-models', icon: FileText },
                { name: 'Compétences', href: '/admin/competences', icon: Award },
                { name: 'Hobbies', href: '/admin/hobbies', icon: Heart },
                { name: 'Professions', href: '/admin/professions', icon: Briefcase },
                { name: 'Catégories Exp.', href: '/admin/experience-categories', icon: Briefcase },
            ]
        },
        { 
            name: 'Analytics', 
            href: '/admin/analytics', 
            icon: BarChart3 
        },
        { 
            name: 'Logs d\'Audit', 
            href: '/admin/audit-logs', 
            icon: Shield 
        },
        { 
            name: 'Paramètres', 
            href: '/admin/settings', 
            icon: Settings 
        },
    ];

    const toggleMenu = (menuName: string) => {
        setExpandedMenus(prev => 
            prev.includes(menuName) 
                ? prev.filter(name => name !== menuName)
                : [...prev, menuName]
        );
    };

    const isCurrentPage = (href: string) => {
        return url.startsWith(href);
    };

    const isMenuExpanded = (menuName: string) => {
        return expandedMenus.includes(menuName);
    };

    const hasActiveChild = (children?: MenuItem[]) => {
        if (!children) return false;
        return children.some(child => isCurrentPage(child.href));
    };

    const renderMenuItem = (item: MenuItem) => {
        const isActive = isCurrentPage(item.href);
        const hasChildren = item.children && item.children.length > 0;
        const expanded = hasChildren && isMenuExpanded(item.name);
        const hasActiveChildItem = hasActiveChild(item.children);

        if (hasChildren) {
            return (
                <div key={item.name}>
                    <button
                        onClick={() => toggleMenu(item.name)}
                        className={`group flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                            hasActiveChildItem
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                        <div className="flex items-center">
                            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                            {item.name}
                        </div>
                        {expanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </button>
                    {expanded && (
                        <div className="ml-6 mt-1 space-y-1">
                            {item.children?.map((child) => (
                                <Link
                                    key={child.name}
                                    href={child.href}
                                    className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                                        isCurrentPage(child.href)
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                >
                                    <child.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                                    {child.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center justify-between rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                    isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
                <div className="flex items-center">
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                </div>
                {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                    </Badge>
                )}
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                
                <div className="relative flex flex-col w-full max-w-xs bg-white">
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                        <button
                            type="button"
                            className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-6 w-6 text-white" />
                        </button>
                    </div>
                    
                    <div className="h-0 flex-1 overflow-y-auto pb-4 pt-5">
                        <div className="flex flex-shrink-0 items-center px-4">
                            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                        </div>
                        <nav className="mt-5 space-y-1 px-2">
                            {navigation.map(renderMenuItem)}
                        </nav>
                    </div>
                </div>
            </div>

            {/* Static sidebar for desktop */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
                    <div className="flex flex-1 flex-col overflow-y-auto pb-4 pt-5">
                        <div className="flex flex-shrink-0 items-center px-4">
                            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                        </div>
                        <nav className="mt-5 flex-1 space-y-1 px-2">
                            {navigation.map(renderMenuItem)}
                        </nav>
                    </div>
                    
                    {/* User info */}
                    <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
                        <div className="group block w-full">
                            <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-500">Administrateur</p>
                                </div>
                                <div className="ml-auto">
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <LogOut className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white shadow-sm">
                    <button
                        type="button"
                        className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    
                    <div className="flex flex-1 justify-between px-4">
                        <div className="flex flex-1">
                            <div className="flex w-full md:ml-0">
                                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                                        <Search className="h-5 w-5" />
                                    </div>
                                    <input
                                        className="block h-full w-full border-transparent py-2 pl-8 pr-3 text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-0 sm:text-sm"
                                        placeholder="Rechercher..."
                                        type="search"
                                        name="search"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="ml-4 flex items-center md:ml-6">
                            <button
                                type="button"
                                className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                <Bell className="h-6 w-6" />
                            </button>

                            {/* Profile dropdown would go here */}
                            <div className="relative ml-3">
                                <div className="flex items-center text-sm">
                                    <span className="text-gray-700">{user.name}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page header */}
                {header && (
                    <header className="bg-white shadow-sm">
                        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                {/* Main content area */}
                <main className="flex-1">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}