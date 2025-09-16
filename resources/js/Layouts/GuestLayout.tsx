import { useState, PropsWithChildren } from 'react';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Toaster } from "@/Components/ui/toaster";
import { ThemeToggle } from '@/Components/ThemeToggle';
import { Sparkles, Globe, Menu, X, MessageSquare, Mail, BookCopy } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';
import Dropdown from '@/Components/Dropdown';
import { MobileTabBar } from '@/Components/MobileTabBar';

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

export default function Guest({ children }: PropsWithChildren) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const { t } = useTranslation();

    return (
        <>
            <Head>
                <link rel="icon" type="image/png" href="/ai.png" />
            </Head>
            <div className="min-h-screen bg-gradient-to-br from-amber-50/50 to-purple-50/50 dark:from-gray-900 dark:to-gray-800">
                <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/90 backdrop-blur-md shadow-sm border-b border-amber-100 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center gap-4">
                                <Link href="/" className="flex items-center gap-2">
                                    <Sparkles className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                                    <span className="font-bold text-2xl bg-gradient-to-r from-amber-500 to-purple-500 dark:from-amber-400 dark:to-purple-400 text-transparent bg-clip-text">
                                        {t('brand')}
                                    </span>
                                </Link>
                            </div>

                            {/* Desktop Navigation */}
                            <div className="hidden sm:flex sm:items-center sm:gap-6">
                                <Link
                                    href={route('blog.index')}
                                    className={cn(
                                        "text-sm font-medium transition-all px-4 py-2 rounded-full flex items-center gap-2",
                                        route().current('blog.index')
                                            ? "bg-gradient-to-r from-amber-500 to-purple-500 text-white shadow-md"
                                            : "hover:bg-amber-50 dark:hover:bg-amber-500/20"
                                    )}
                                >
                                    <BookCopy className="h-4 w-4" />
                                    {t('menu.blog')}
                                </Link>
                                <LanguageSelector />
                                <ThemeToggle />
                                <Link
                                    href={route('login')}
                                    className={cn(
                                        "text-sm font-medium transition-all px-4 py-2 rounded-full",
                                        route().current('login')
                                            ? "bg-gradient-to-r from-amber-500 to-purple-500 text-white shadow-md"
                                            : "hover:bg-amber-50 dark:hover:bg-amber-500/20"
                                    )}
                                >
                                    {t('auth.login.value')}
                                </Link>
                                <Link
                                    href={route('register')}
                                    className={cn(
                                        "text-sm font-medium transition-all px-4 py-2 rounded-full",
                                        route().current('register')
                                            ? "bg-gradient-to-r from-amber-500 to-purple-500 text-white shadow-md"
                                            : "hover:bg-amber-50 dark:hover:bg-amber-500/20"
                                    )}
                                >
                                    {t('auth.register.value')}
                                </Link>
                            </div>

                            {/* Mobile menu button */}
                            <div className="flex items-center gap-4 sm:hidden">
                                <ThemeToggle />
                                <button
                                    onClick={() => setShowingNavigationDropdown(prev => !prev)}
                                    className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/20 transition-colors duration-200"
                                >
                                    {showingNavigationDropdown ? (
                                        <X className="h-5 w-5" />
                                    ) : (
                                        <Menu className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    <AnimatePresence>
                        {showingNavigationDropdown && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="sm:hidden border-t border-amber-100 dark:border-gray-700"
                            >
                                <div className="space-y-1 px-4 py-3">
                                    <div className="px-4 py-2">
                                        <LanguageSelector />
                                    </div>
                                    <Link
                                        href={route('blog.index')}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                                            route().current('blog.index')
                                                ? "bg-gradient-to-r from-amber-500 to-purple-500 text-white shadow-md"
                                                : "text-gray-700 dark:text-gray-100 hover:bg-amber-50 dark:hover:bg-amber-500/20"
                                        )}
                                    >
                                        <BookCopy className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                                        {t('menu.blog')}
                                    </Link>
                                    <Link
                                        href={route('login')}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                                            route().current('login')
                                                ? "bg-gradient-to-r from-amber-500 to-purple-500 text-white shadow-md"
                                                : "text-gray-700 dark:text-gray-100 hover:bg-amber-50 dark:hover:bg-amber-500/20"
                                        )}
                                    >
                                        {t('auth.login.value')}
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                                            route().current('register')
                                                ? "bg-gradient-to-r from-amber-500 to-purple-500 text-white shadow-md"
                                                : "text-gray-700 dark:text-gray-100 hover:bg-amber-50 dark:hover:bg-amber-500/20"
                                        )}
                                    >
                                        {t('auth.register.value')}
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </nav>

                {/* Main Content */}
                <div className="min-h-[calc(100vh-4rem)] flex flex-col sm:justify-center items-center px-4 mobile-safe-area">
                    <div className="">
                        {children}
                    </div>
                </div>

                <footer className="mt-auto py-4 border-t border-amber-100 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Sparkles className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                            <span>© {new Date().getFullYear()} {t('brand')}</span>
                        </div>

                        <div className="flex items-center gap-4 text-xs sm:text-sm">
                            <Link
                                href={route('support')}
                                className="flex items-center gap-1 text-gray-500 hover:text-amber-500 transition-colors"
                            >
                                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span>Support</span>
                            </Link>

                            <a
                                href="mailto:guidy.makeitreall@gmail.com"
                                className="flex items-center gap-1 text-gray-500 hover:text-amber-500 transition-colors"
                            >
                                <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Contact</span>
                            </a>
                        </div>
                    </div>
                </footer>

                <Toaster />

                {/* Barre de navigation mobile pour les invités */}
                <MobileTabBar isGuest={true} />
            </div>
        </>
    );
}
