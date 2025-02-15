import { useState, PropsWithChildren } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { User } from '@/types';
import { Toaster } from "@/Components/ui/toaster";
import { ThemeToggle } from '@/Components/ThemeToggle';
import {
    Folder, Star, Eye, Menu, X, Brain, Layout,
    ChevronRight, Sparkles, LucideIcon, Coins,
    Globe
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

const LanguageSelector = () => {
    const { t, i18n } = useTranslation();

    return (
        <Dropdown>
            <Dropdown.Trigger>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 hover:bg-amber-50 dark:hover:bg-amber-500/20"
                >
                    <Globe className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                    <span className="font-medium">{i18n.language === 'fr' ? 'FR' : 'EN'}</span>
                </Button>
            </Dropdown.Trigger>
            <Dropdown.Content>
                <div className="bg-white dark:bg-gray-900 rounded-lg w-32">
                    <button
                        onClick={() => i18n.changeLanguage('fr')}
                        className={cn(
                            "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                            i18n.language === 'fr'
                                ? "bg-gradient-to-r from-amber-500 to-purple-500 text-white"
                                : "text-gray-700 dark:text-gray-100 hover:bg-amber-50 dark:hover:bg-amber-500/20"
                        )}
                    >
                        <span className="font-medium">Français</span>
                        {i18n.language === 'fr' && (
                            <motion.div
                                layoutId="activeLang"
                                className="ml-auto w-2 h-2 rounded-full bg-white"
                            />
                        )}
                    </button>
                    <button
                        onClick={() => i18n.changeLanguage('en')}
                        className={cn(
                            "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                            i18n.language === 'en'
                                ? "bg-gradient-to-r from-amber-500 to-purple-500 text-white"
                                : "text-gray-700 dark:text-gray-100 hover:bg-amber-50 dark:hover:bg-amber-500/20"
                        )}
                    >
                        <span className="font-medium">English</span>
                        {i18n.language === 'en' && (
                            <motion.div
                                layoutId="activeLang"
                                className="ml-auto w-2 h-2 rounded-full bg-white"
                            />
                        )}
                    </button>
                </div>
            </Dropdown.Content>
        </Dropdown>
    );
};

const getCvSideMenuItems = (t: (key: string) => string) => [
    {
        name: t('cv.edit'),
        href: route('cv-infos.index'),
        icon: Folder,
        active: route().current('cv-infos.index')
    },
    {
        name: t('cv.premium'),
        href: route('userCvModels.index'),
        icon: Star,
        active: route().current('userCvModels.index')
    },
    {
        name: t('cv.preview'),
        href: '/cv-infos/show',
        icon: Eye,
        active: route().current('cv-infos.show')
    }
];

export default function Authenticated({ user, header, children }: PropsWithChildren<{ user: User, header?: React.ReactNode }>) {
    const { t, i18n } = useTranslation();
    const { url } = usePage();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const showNav = ['cv-infos.show', 'cv-infos.index', 'userCvModels.index'].includes(route().current());
    const cvSideMenuItems = getCvSideMenuItems(t);

    const mainMenuItems: MenuItem[] = [
        {
            name: t('menu.admin'),
            href: route('dashboard'),
            icon: Layout,
            active: route().current('dashboard'),
            adminOnly: true
        },
        {
            name: t('menu.createCV'),
            href: route('cv-infos.index'),
            icon: Folder,
            active: route().current('cv-infos.index')
        },
        {
            name: t('menu.assistant'),
            href: route('career-advisor.index'),
            icon: Brain,
            active: route().current('career-advisor.index')
        }
    ];

    const TokenDisplay = () => {
        const tokenBalance = Math.floor(user.wallet_balance);
        return (
            <Link
                href={route('payment.index')}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-purple-500 text-white hover:from-amber-600 hover:to-purple-600 transition-all shadow-md group"
            >
                <Coins className="h-4 w-4 group-hover:animate-bounce" />
                <span className="font-medium">{tokenBalance}</span>
            </Link>
        );
    };

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
                        <span className="text-gray-700 dark:text-gray-100">{t('cv.navigation')}</span>
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50/50 to-purple-50/50 dark:from-gray-900 dark:to-gray-800">
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/90 backdrop-blur-md shadow-sm border-b border-amber-100 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="flex items-center gap-2">
                                <Sparkles className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                                <span className="font-bold text-2xl bg-gradient-to-r from-amber-500 to-purple-500 dark:from-amber-400 dark:to-purple-400 text-transparent bg-clip-text">
                                    {t('brand')}
                                </span>
                            </Link>
                        </div>

                        <div className="hidden md:flex md:items-center md:gap-6">
                            <TokenDisplay />
                            {mainMenuItems.map((item, index) => (
                                (!item.adminOnly || user.UserType === 1) && (
                                    <NavButton key={index} item={item} />
                                )
                            ))}
                            <LanguageSelector />
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="md:hidden">
                                <TokenDisplay />
                            </div>
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
                                <Dropdown.Content className="bg-white dark:bg-gray-900 dark:border-gray-700">
                                    <Dropdown.Link href={route('profile.edit')} className="text-gray-700 dark:text-gray-100 hover:bg-amber-50 dark:hover:bg-amber-500/20">
                                        {t('profile.edit')}
                                    </Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button" className="text-gray-700 dark:text-gray-100 hover:bg-amber-50 dark:hover:bg-amber-500/20">
                                        {t('auth.logout')}
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
                                {t('menu.title')}
                            </span>
                        </SheetTitle>
                    </SheetHeader>
                    <div className="mt-8 flex flex-col gap-4">
                        {mainMenuItems.map((item, index) => (
                            (!item.adminOnly || user.UserType === 1) && (
                                <NavButton key={index} item={item} />
                            )
                        ))}
                        <div className="px-4">
                            <LanguageSelector />
                        </div>
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

            <footer className="mt-auto py-4 border-t border-amber-100 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Sparkles className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                        <span>© {new Date().getFullYear()} {t('brand')}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="md:hidden">
                            <LanguageSelector />
                        </div>
                    </div>
                </div>
            </footer>

            <Toaster />
        </div>
    );
}
