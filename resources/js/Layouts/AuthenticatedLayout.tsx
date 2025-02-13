import { useState, PropsWithChildren } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { User } from '@/types';
import { Toaster } from "@/Components/ui/toaster";
import { ThemeToggle } from '@/Components/ThemeToggle';
import {
    Folder, Star, Eye, Menu, X, Brain, Layout,
    ChevronRight, Sparkles, LucideIcon
} from 'lucide-react';
import Dropdown from '@/Components/Dropdown';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/Components/ui/sheet";
import { Button } from '@/Components/ui/button';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';

interface MenuItem {
    name: string;
    href: string;
    icon: LucideIcon;
    active: boolean;
    adminOnly?: boolean;
}

const getCvSideMenuItems = () => [
    {
        name: "Éditer mon CV",
        href: route('cv-infos.index'),
        icon: Folder,
        active: route().current('cv-infos.index')
    },
    {
        name: "Designs Premium",
        href: route('userCvModels.index'),
        icon: Star,
        active: route().current('userCvModels.index')
    },
    {
        name: "Aperçu & Export",
        href: '/cv-infos/show',
        icon: Eye,
        active: route().current('cv-infos.show')
    }
];

export default function Authenticated({ user, header, children }: PropsWithChildren<{ user: User, header?: React.ReactNode }>) {
    const { url } = usePage();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const showNav = ['cv-infos.show', 'cv-infos.index', 'userCvModels.index'].includes(route().current());
    const cvSideMenuItems = getCvSideMenuItems();

    const mainMenuItems: MenuItem[] = [
        {
            name: "Administration",
            href: route('dashboard'),
            icon: Layout,
            active: route().current('dashboard'),
            adminOnly: true
        },
        {
            name: "Créer mon CV",
            href: route('cv-infos.index'),
            icon: Folder,
            active: route().current('cv-infos.index')
        },
        {
            name: "Assistant Guidy",
            href: route('career-advisor.index'),
            icon: Brain,
            active: route().current('career-advisor.index')
        }
    ];

    const NavButton = ({ item }: { item: MenuItem }) => (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
        >
            <Link
                href={item.href}
                className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                    item.active
                        ? "bg-gradient-to-r from-amber-500 to-purple-500 dark:from-amber-400 dark:to-purple-400 text-white shadow-md"
                        : "text-gray-700 dark:text-gray-100 hover:bg-amber-50 dark:hover:bg-amber-500/20"
                )}
            >
                <item.icon className={cn(
                    "h-5 w-5",
                    item.active ? "text-white" : "text-amber-500 dark:text-amber-400"
                )} />
                <span className="font-medium">{item.name}</span>
                {item.active && (
                    <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-2 w-2 h-2 rounded-full bg-white"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}
            </Link>
        </motion.div>
    );

    const MobileNav = () => (
        <div className="sticky top-16 z-30 md:hidden bg-white/80 dark:bg-gray-900/90 backdrop-blur-md border-b border-amber-100 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 py-2">
                <Button
                    variant="ghost"
                    onClick={() => setIsNavOpen(!isNavOpen)}
                    className="w-full flex items-center justify-between p-2 hover:bg-amber-50 dark:hover:bg-amber-500/20 rounded-lg"
                >
                    <div className="flex items-center gap-2">
                        <Folder className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                        <span className="text-gray-700 dark:text-gray-100">Navigation CV</span>
                    </div>
                    <ChevronRight className={`h-5 w-5 text-gray-700 dark:text-gray-100 transition-transform ${isNavOpen ? 'rotate-90' : ''}`} />
                </Button>
                <AnimatePresence>
                    {isNavOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="py-2 space-y-1"
                        >
                            {cvSideMenuItems.map((item, index) => (
                                <NavButton key={index} item={item} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );

    // @ts-ignore
    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50/50 to-purple-50/50 dark:from-gray-900 dark:to-gray-800">
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/90 backdrop-blur-md shadow-sm border-b border-amber-100 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="flex items-center gap-2">
                                <Sparkles className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                                <span className="font-bold text-2xl bg-gradient-to-r from-amber-500 to-purple-500 dark:from-amber-400 dark:to-purple-400 text-transparent bg-clip-text">
                                    Guidy
                                </span>
                            </Link>
                        </div>

                        <div className="hidden md:flex md:items-center md:gap-6">
                            {mainMenuItems.map((item, index) => (
                                (!item.adminOnly || user.UserType === 1) && (
                                    <Link
                                        key={index}
                                        href={item.href}
                                        className={cn(
                                            "text-sm font-medium transition-all px-4 py-2 rounded-full",
                                            item.active
                                                ? "bg-gradient-to-r from-amber-500 to-purple-500 dark:from-amber-400 dark:to-purple-400 text-white shadow-md"
                                                : "text-gray-700 dark:text-gray-100 hover:bg-amber-50 dark:hover:bg-amber-500/20"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <item.icon className="h-4 w-4" />
                                            {item.name}
                                        </div>
                                    </Link>
                                )
                            ))}
                        </div>

                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <Button variant="ghost" className="gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-amber-500 to-purple-500 dark:from-amber-400 dark:to-purple-400 flex items-center justify-center">
                                                <span className="text-white font-medium">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <span className="hidden sm:block text-gray-700 dark:text-gray-100">{user.name}</span>
                                        </div>
                                    </Button>
                                </Dropdown.Trigger>
                                {/*@ts-ignore*/}
                                <Dropdown.Content className="bg-white dark:bg-gray-900 dark:border-gray-700">
                                    <Dropdown.Link href={route('profile.edit')} className="text-gray-700 dark:text-gray-100 hover:bg-amber-50 dark:hover:bg-amber-500/20">
                                        Mon Profil
                                    </Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button" className="text-gray-700 dark:text-gray-100 hover:bg-amber-50 dark:hover:bg-amber-500/20">
                                        Déconnexion
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="md:hidden"
                                onClick={() => setIsMobileMenuOpen(true)}
                            >
                                <Menu className="h-5 w-5 text-gray-700 dark:text-gray-100" />
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetContent side="right" className="bg-white dark:bg-gray-900 w-[300px] border-amber-100 dark:border-gray-700">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                            <span className="bg-gradient-to-r from-amber-500 to-purple-500 dark:from-amber-400 dark:to-purple-400 text-transparent bg-clip-text">
                                Menu Guidy
                            </span>
                        </SheetTitle>
                    </SheetHeader>
                    <div className="mt-8 flex flex-col gap-4">
                        {mainMenuItems.map((item, index) => (
                            (!item.adminOnly || user.UserType === 1) && (
                                <NavButton key={index} item={item} />
                            )
                        ))}
                    </div>
                </SheetContent>
            </Sheet>

            {showNav && <MobileNav />}

            {header && (
                <header className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-md border-b border-amber-100 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <div className="flex">
                {showNav && (
                    <aside className="hidden md:block w-64 bg-white/80 dark:bg-gray-900/90 backdrop-blur-md border-r border-amber-100 dark:border-gray-700 min-h-screen">
                        <div className="sticky top-20 p-4">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold bg-gradient-to-r from-amber-500 to-purple-500 dark:from-amber-400 dark:to-purple-400 text-transparent bg-clip-text">
                                    Navigation CV
                                </h2>
                            </div>
                            <div className="space-y-2">
                                {cvSideMenuItems.map((item, index) => (
                                    <NavButton key={index} item={item} />
                                ))}
                            </div>
                        </div>
                    </aside>
                )}

                <main className="flex-1 p-4 sm:p-6 text-gray-700 dark:text-gray-100">
                    {children}
                </main>
            </div>

            <Toaster />
        </div>
    );
}
