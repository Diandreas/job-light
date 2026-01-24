import { useState, PropsWithChildren } from 'react';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Toaster } from "@/Components/ui/toaster";
import { ThemeToggle } from '@/Components/ThemeToggle';
import { Sparkles, Globe, Menu, X, ChevronDown, CheckCircle, LogIn, Rocket } from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';
import { MobileTabBar } from '@/Components/MobileTabBar';

// Language Selector - Style Premium
const LanguageSelector = () => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: "fr", label: "Français", flag: "🇫🇷" },
        { code: "en", label: "English", flag: "🇬🇧" }
    ];

    const handleLanguageChange = (langCode: string) => {
        i18n.changeLanguage(langCode);
        setIsOpen(false);
    };

    const currentLanguage = i18n.language;
    const currentLang = languages.find(l => l.code === currentLanguage) || languages[0];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100/80 dark:bg-gray-800/60 hover:bg-gray-200/80 dark:hover:bg-gray-700/60 border border-gray-200/60 dark:border-gray-700/60 transition-all duration-200"
                aria-label={t('common.changeLanguage')}
            >
                <span className="text-sm">{currentLang.flag}</span>
                <span className="font-medium text-xs sm:text-sm text-gray-700 dark:text-gray-200">
                    {currentLanguage.toUpperCase()}
                </span>
                <ChevronDown className={cn("h-3 w-3 text-gray-500 transition-transform duration-200", isOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -5 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl py-1.5 z-50 min-w-[140px] overflow-hidden"
                            role="menu"
                        >
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code)}
                                    className={cn(
                                        "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-all duration-150",
                                        currentLanguage === lang.code
                                            ? "bg-amber-500 text-white"
                                            : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    )}
                                    role="menuitem"
                                    aria-selected={currentLanguage === lang.code}
                                >
                                    <span>{lang.flag}</span>
                                    <span className="font-medium">{lang.label}</span>
                                    {currentLanguage === lang.code && (
                                        <CheckCircle className="ml-auto h-4 w-4" />
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
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

            <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 transition-colors">
                {/* Navigation Premium */}
                <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-800/80">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-14 sm:h-16">
                            {/* Logo */}
                            <div className="flex items-center">
                                <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group">
                                    <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                    </div>
                                    <span className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">
                                        {t('brand')}
                                    </span>
                                </Link>
                            </div>

                            {/* Desktop Navigation */}
                            <div className="hidden sm:flex sm:items-center sm:gap-3">
                                <LanguageSelector />
                                <ThemeToggle />

                                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

                                <Link
                                    href={route('pricing')}
                                    className={cn(
                                        "flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200",
                                        route().current('pricing')
                                            ? "bg-amber-500 text-white shadow-sm"
                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                                    )}
                                >
                                    <Sparkles className="h-4 w-4" />
                                    {t('nav.pricing')}
                                </Link>

                                <Link
                                    href={route('login')}
                                    className={cn(
                                        "flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200",
                                        route().current('login')
                                            ? "bg-amber-500 text-white shadow-sm"
                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                                    )}
                                >
                                    <LogIn className="h-4 w-4" />
                                    {t('nav.login')}
                                </Link>

                                <Link
                                    href={route('register')}
                                    className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                    <Rocket className="h-4 w-4" />
                                    {t('nav.register')}
                                </Link>
                            </div>

                            {/* Mobile Controls */}
                            <div className="flex items-center gap-2 sm:hidden">
                                <ThemeToggle />
                                <button
                                    onClick={() => setShowingNavigationDropdown(prev => !prev)}
                                    className={cn(
                                        "p-2.5 rounded-xl transition-all duration-200",
                                        showingNavigationDropdown
                                            ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                    )}
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

                    {/* Mobile Navigation Menu */}
                    <AnimatePresence>
                        {showingNavigationDropdown && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="sm:hidden border-t border-gray-200/80 dark:border-gray-800/80 overflow-hidden bg-white dark:bg-gray-950"
                            >
                                <div className="px-4 py-4 space-y-3">
                                    {/* Language Selector */}
                                    <div className="flex justify-center pb-3 border-b border-gray-100 dark:border-gray-800">
                                        <LanguageSelector />
                                    </div>

                                    {/* Navigation Links */}
                                    <Link
                                        href={route('pricing')}
                                        onClick={() => setShowingNavigationDropdown(false)}
                                        className={cn(
                                            "flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-medium transition-all",
                                            route().current('pricing')
                                                ? "bg-amber-500 text-white"
                                                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                        )}
                                    >
                                        <Sparkles className="h-5 w-5" />
                                        {t('nav.pricing')}
                                    </Link>

                                    {/* Auth Links */}
                                    <Link
                                        href={route('login')}
                                        onClick={() => setShowingNavigationDropdown(false)}
                                        className={cn(
                                            "flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-medium transition-all",
                                            route().current('login')
                                                ? "bg-amber-500 text-white"
                                                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                        )}
                                    >
                                        <LogIn className="h-5 w-5" />
                                        {t('nav.login')}
                                    </Link>

                                    <Link
                                        href={route('register')}
                                        onClick={() => setShowingNavigationDropdown(false)}
                                        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-all"
                                    >
                                        <Rocket className="h-5 w-5" />
                                        {t('nav.register')}
                                    </Link>

                                    {/* Quick CTA */}
                                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                                        <a
                                            href="/guest-cv"
                                            onClick={() => setShowingNavigationDropdown(false)}
                                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                                        >
                                            <Sparkles className="h-4 w-4" />
                                            {t('cta.try_guest')}
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </nav>

                {/* Main Content */}
                <main className="flex-1">
                    {children}
                </main>

                <Toaster />

                {/* Mobile Tab Bar */}
                <MobileTabBar isGuest={true} />
            </div>
        </>
    );
}
