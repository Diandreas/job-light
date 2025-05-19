import { useState, PropsWithChildren, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { User as UserType } from '@/types';
import { Toaster } from "@/Components/ui/toaster";
import { ThemeToggle } from '@/Components/ThemeToggle';
import { MobileTabBar } from '@/Components/MobileTabBar';
import {
    Folder, Star, Eye, Menu, X, Brain, Layout,
    ChevronRight, ChevronLeft, Sparkles, LucideIcon, Coins,
    Globe, Mail, Phone, MapPin, Linkedin, Github, MessageSquare,
    MenuIcon, ChevronDown, ChevronUp, Home, BookCopy, Award,
    Calendar, Sun, Moon, Languages, RefreshCw, CheckCircle
} from 'lucide-react';
import Dropdown from '@/Components/Dropdown';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/Components/ui/sheet";
import { Button } from '@/Components/ui/button';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/Components/ui/use-toast';
import axios from 'axios';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/Components/ui/dialog';
import { Progress } from '@/Components/ui/progress';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';

interface MenuItem {
    name: string;
    href: string;
    icon: LucideIcon;
    active: boolean;
    adminOnly?: boolean;
}

const LanguageSelector = () => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: "fr", label: "Français" },
        { code: "en", label: "English" }
    ];

    const handleLanguageChange = (langCode) => {
        i18n.changeLanguage(langCode);
        setIsOpen(false);
    };

    const currentLanguage = i18n.language;

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 sm:gap-2 hover:bg-amber-50 dark:hover:bg-amber-500/20 h-7 sm:h-8 px-2 sm:px-3"
                aria-label={t('common.changeLanguage')}
            >
                <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 dark:text-amber-400" />
                <span className="font-medium text-xs sm:text-sm">
                    {currentLanguage.toUpperCase()}
                </span>
                <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", isOpen && "rotate-180")} />
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg py-1 z-50"
                        role="menu"
                    >
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={cn(
                                    "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                                    currentLanguage === lang.code
                                        ? "bg-gradient-to-r from-amber-500 to-purple-500 text-white"
                                        : "text-gray-700 dark:text-gray-100 hover:bg-amber-50 dark:hover:bg-amber-500/20"
                                )}
                                role="menuitem"
                                aria-selected={currentLanguage === lang.code}
                            >
                                <Globe className="h-3.5 w-3.5" />
                                <span className="font-medium">{lang.label}</span>
                                {currentLanguage === lang.code && (
                                    <motion.div
                                        layoutId="activeLang"
                                        className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                                        aria-hidden="true"
                                    />
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
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

export default function Authenticated({ user, header, children }: PropsWithChildren<{ user: UserType, header?: React.ReactNode }>) {
    const { t, i18n } = useTranslation();
    const { url } = usePage();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isReferralDialogOpen, setIsReferralDialogOpen] = useState(false);
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
        //@ts-ignore
        const tokenBalance = Math.floor(user.wallet_balance);
        return (
            <Link
                href={route('payment.index')}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-full bg-gradient-to-r from-amber-500 to-purple-500 text-white hover:from-amber-600 hover:to-purple-600 transition-all shadow-sm sm:shadow-md group"
            >
                <Coins className="h-3 w-3 sm:h-4 sm:w-4 group-hover:animate-bounce" />
                <span className="font-medium text-xs sm:text-sm">{tokenBalance}</span>
            </Link>
        );
    };

    const NavButton = ({ item, compact = false }: { item: MenuItem, compact?: boolean }) => (
        <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="relative"
        >
            <Link
                href={item.href}
                className={cn(
                    "flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200",
                    compact ? "text-xs sm:text-sm" : "text-xs sm:text-base",
                    item.active
                        ? "bg-gradient-to-r from-amber-500 to-purple-500 dark:from-amber-400 dark:to-purple-400 text-white shadow-sm sm:shadow-md"
                        : "text-gray-700 dark:text-gray-100 hover:bg-amber-50 dark:hover:bg-amber-500/20"
                )}
            >
                <item.icon className={cn(
                    compact ? "h-3.5 w-3.5 sm:h-4 sm:w-4" : "h-4 w-4 sm:h-5 sm:w-5",
                    item.active ? "text-white" : "text-amber-500 dark:text-amber-400"
                )} />
                <span className="font-medium truncate">{item.name}</span>
                {item.active && (
                    <motion.div
                        layoutId="activeIndicator"
                        className={cn(
                            "absolute right-2 rounded-full bg-white",
                            compact ? "w-1.5 h-1.5 sm:w-2 sm:h-2" : "w-1.5 h-1.5 sm:w-2 sm:h-2"
                        )}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}
            </Link>
        </motion.div>
    );

    const MobileNav = () => {
        const { t } = useTranslation();
        const cvSideMenuItems = getCvSideMenuItems(t);

        return (
            <div className="sticky top-12 sm:top-16 z-30 md:hidden bg-white/80 dark:bg-gray-900/90 backdrop-blur-md border-b border-amber-100 dark:border-gray-700">
                <div className="flex h-9">
                    {cvSideMenuItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1 px-1 relative",
                                item.active
                                    ? "bg-gradient-to-r from-amber-500 to-purple-500 text-white"
                                    : "text-gray-700 dark:text-gray-100 hover:bg-amber-50 dark:hover:bg-amber-500/20"
                            )}
                            aria-current={item.active ? "page" : undefined}
                        >
                            <item.icon
                                className={cn(
                                    "h-3.5 w-3.5 flex-shrink-0",
                                    item.active ? "text-white" : "text-amber-500 dark:text-amber-400"
                                )}
                            />
                            <span className="text-[10px] font-medium truncate">
                                {item.name}
                            </span>
                            {item.active && (
                                <motion.div
                                    layoutId="activeMobileNavItem"
                                    className="absolute bottom-0 w-full h-0.5 bg-white opacity-80"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </Link>
                    ))}
                </div>
            </div>
        );
    };

    // Componant pour le renouvellement du code de parrainage
    const ReferralCodeRenewal = () => {
        const [isLoading, setIsLoading] = useState(false);
        const [sponsorInfo, setSponsorInfo] = useState<any>(null);
        const [ownReferralCode, setOwnReferralCode] = useState<any>(null);
        const [newSponsorCode, setNewSponsorCode] = useState('');
        const [error, setError] = useState('');
        const [successMsg, setSuccessMsg] = useState('');
        const [activeTab, setActiveTab] = useState('current');
        const { toast } = useToast();

        // Charger les informations du code de parrainage
        const loadReferralInfo = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get('/sponsorship/code-info');
                if (response.data.success) {
                    setSponsorInfo(response.data.sponsorInfo);
                    setOwnReferralCode(response.data.ownReferralCode);
                }
            } catch (err) {
                console.error('Erreur lors du chargement des informations de parrainage', err);
            } finally {
                setIsLoading(false);
            }
        };

        // Renouveler le code de parrainage actuel
        const renewCurrentSponsorCode = async () => {
            setIsLoading(true);
            setError('');
            setSuccessMsg('');

            try {
                const response = await axios.post('/sponsorship/renew-code');

                if (response.data.success) {
                    setSuccessMsg(response.data.message);
                    setSponsorInfo({
                        ...sponsorInfo,
                        expires_at: response.data.expires_at,
                        is_expired: false,
                        days_left: 30
                    });

                    toast({
                        title: t('sponsorship.code.renewal.success'),
                        description: t('sponsorship.code.renewal.successDescription'),
                        variant: "default",
                    });
                } else {
                    setError(response.data.message || t('common.error.generic'));
                }
            } catch (err) {
                setError(err.response?.data?.message || t('sponsorship.code.renewal.error'));
            } finally {
                setIsLoading(false);
            }
        };

        // Appliquer un nouveau code de parrainage
        const applyNewSponsorCode = async () => {
            if (!newSponsorCode.trim()) {
                setError(t('sponsorship.code.renewal.enterCode'));
                return;
            }

            setIsLoading(true);
            setError('');
            setSuccessMsg('');

            try {
                const response = await axios.post('/sponsorship/renew-code', {
                    new_sponsor_code: newSponsorCode.trim()
                });

                if (response.data.success) {
                    setSuccessMsg(response.data.message);
                    setSponsorInfo({
                        sponsor_code: response.data.sponsor_code,
                        expires_at: response.data.expires_at,
                        is_expired: false,
                        days_left: 30
                    });
                    setNewSponsorCode('');
                    setActiveTab('current');

                    toast({
                        title: t('sponsorship.code.renewal.newCodeApplied'),
                        description: t('sponsorship.code.renewal.newCodeAppliedDescription'),
                        variant: "default",
                    });
                } else {
                    setError(response.data.message || t('common.error.generic'));
                }
            } catch (err) {
                setError(err.response?.data?.message || t('sponsorship.code.renewal.applyError'));
            } finally {
                setIsLoading(false);
            }
        };

        // Calculer le pourcentage de temps restant
        const getExpirationProgress = () => {
            if (!sponsorInfo) return 100;
            if (sponsorInfo.is_expired) return 0;
            const daysLeft = Math.max(0, sponsorInfo.days_left);
            return Math.min(100, (daysLeft / 30) * 100);
        };

        // Afficher le statut d'expiration
        const getExpirationStatus = () => {
            if (!sponsorInfo) return null;

            if (sponsorInfo.is_expired) {
                return (
                    <Badge variant="destructive" className="ml-2">
                        {t('sponsorship.code.expired')}
                    </Badge>
                );
            }

            if (sponsorInfo.days_left <= 7) {
                return (
                    <Badge variant="outline" className="ml-2 bg-amber-500 hover:bg-amber-600 text-white">
                        {t('sponsorship.code.almostExpired')}
                    </Badge>
                );
            }

            return (
                <Badge variant="outline" className="ml-2 bg-green-600 hover:bg-green-700 text-white">
                    {t('sponsorship.code.valid')}
                </Badge>
            );
        };

        // Charger les informations au chargement du composant
        useEffect(() => {
            if (isReferralDialogOpen) {
                loadReferralInfo();
            }
        }, [isReferralDialogOpen]);

        return (
            <Dialog open={isReferralDialogOpen} onOpenChange={setIsReferralDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            {t('sponsorship.code.renewal.title')} {sponsorInfo && getExpirationStatus()}
                        </DialogTitle>
                        <DialogDescription>
                            {t('sponsorship.code.renewal.description')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="flex border-b border-gray-200">
                            <button
                                className={`py-2 px-4 text-sm font-medium transition-colors ${activeTab === 'current'
                                    ? 'border-b-2 border-amber-500 text-amber-600'
                                    : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('current')}
                            >
                                {t('sponsorship.code.renewal.tabs.current')}
                            </button>
                            <button
                                className={`py-2 px-4 text-sm font-medium transition-colors ${activeTab === 'new'
                                    ? 'border-b-2 border-amber-500 text-amber-600'
                                    : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('new')}
                            >
                                {t('sponsorship.code.renewal.tabs.new')}
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            {activeTab === 'current' ? (
                                <motion.div
                                    key="current"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {isLoading ? (
                                        <div className="flex justify-center py-6">
                                            <RefreshCw className="h-6 w-6 animate-spin text-amber-500" />
                                        </div>
                                    ) : sponsorInfo ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="font-medium">{t('sponsorship.code.renewal.sponsorCode')}:</div>
                                                <div className="font-bold text-lg">{sponsorInfo.sponsor_code}</div>
                                            </div>

                                            <div className="flex items-center justify-between text-sm">
                                                <div className="text-gray-600">{t('sponsorship.code.renewal.sponsor')}:</div>
                                                <div>{sponsorInfo.sponsor_name}</div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                                    <span>{t('sponsorship.code.renewal.validity')}</span>
                                                    <span>
                                                        {sponsorInfo.is_expired
                                                            ? t('sponsorship.code.renewal.expired')
                                                            : `${t('sponsorship.code.renewal.expires')} ${sponsorInfo.expires_at}`}
                                                    </span>
                                                </div>
                                                <Progress value={getExpirationProgress()} className="h-2" />
                                            </div>

                                            {successMsg && (
                                                <Alert className="bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-300">
                                                    <AlertDescription>{successMsg}</AlertDescription>
                                                </Alert>
                                            )}

                                            {error && (
                                                <Alert variant="destructive">
                                                    <AlertDescription>{error}</AlertDescription>
                                                </Alert>
                                            )}

                                            <div className="pt-4">
                                                <Button
                                                    onClick={renewCurrentSponsorCode}
                                                    disabled={isLoading || (!sponsorInfo.is_expired && sponsorInfo.days_left > 7)}
                                                    className="w-full"
                                                >
                                                    {isLoading ? (
                                                        <span className="flex items-center justify-center">
                                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                            {t('common.loading')}
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center justify-center">
                                                            <RefreshCw className="h-4 w-4 mr-2" />
                                                            {t('sponsorship.code.renewal.renewFor30Days')}
                                                        </span>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : ownReferralCode ? (
                                        <div className="text-center py-4">
                                            <p>{t('sponsorship.code.renewal.noSponsorYet')}</p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                {t('sponsorship.code.renewal.canApplyCodeInNewTab')}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p>{t('sponsorship.code.renewal.noReferralCodeYet')}</p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                {t('sponsorship.code.renewal.visitSponsorshipPage')}
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="new"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label htmlFor="new-sponsor-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            {t('sponsorship.code.renewal.newSponsorCode')}
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                type="text"
                                                id="new-sponsor-code"
                                                value={newSponsorCode}
                                                onChange={(e) => setNewSponsorCode(e.target.value)}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white sm:text-sm"
                                                placeholder={t('sponsorship.code.renewal.enterCodePlaceholder')}
                                            />
                                        </div>
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            {t('sponsorship.code.renewal.validityInfo')}
                                        </p>
                                    </div>

                                    {error && (
                                        <Alert variant="destructive">
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}

                                    <Button
                                        onClick={applyNewSponsorCode}
                                        disabled={isLoading || !newSponsorCode.trim()}
                                        className="w-full"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center justify-center">
                                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                {t('common.loading')}
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center">
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                {t('sponsorship.code.renewal.applyCode')}
                                            </span>
                                        )}
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {ownReferralCode && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                            >
                                <h3 className="font-medium mb-2">{t('sponsorship.code.renewal.yourCodeToShare')}</h3>
                                <div className="flex items-center justify-between">
                                    <div className="font-medium">{t('sponsorship.code.renewal.code')}:</div>
                                    <div className="font-bold">{ownReferralCode.code}</div>
                                </div>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    {t('sponsorship.code.renewal.shareCodeWithFriends')}
                                </p>
                            </motion.div>
                        )}
                    </div>

                    <DialogFooter className="sm:justify-between">
                        {ownReferralCode && (
                            <Button
                                variant="outline"
                                onClick={() => router.visit(route('sponsorship.index'))}
                            >
                                {t('sponsorship.code.renewal.viewAllDetails')}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    return (
        <>
            <Head>
                <link rel="icon" type="image/png" href="/ai.png" />
            </Head>
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-amber-50 dark:from-gray-950 dark:to-gray-900 transition-colors">
                <Toaster />
                <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/90 backdrop-blur-md shadow-sm border-b border-amber-100 dark:border-gray-700">
                    <div className="mx-auto px-3 sm:px-6">
                        <div className="flex h-12 sm:h-16 items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-4">
                                <Link href="/" className="flex items-center gap-1.5 sm:gap-2">
                                    <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-amber-500 dark:text-amber-400" />
                                    <span className="font-bold text-base sm:text-2xl bg-gradient-to-r from-amber-500 to-purple-500 dark:from-amber-400 dark:to-purple-400 text-transparent bg-clip-text">
                                        { route().current('career-advisor.index') ? 'Guidy AI' : t('brand')}
                                    </span>
                                    {route().current('career-advisor.index') && (
                                        <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4 bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
                                            <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                                            {t('components.sidebar.pro_badge')}
                                        </Badge>
                                    )}

                                </Link>
                            </div>

                            <div className="hidden md:flex md:items-center md:gap-3 lg:gap-6">
                                <TokenDisplay />
                                {mainMenuItems.map((item, index) => (
                                    //@ts-ignore
                                    (!item.adminOnly || user.UserType === 1) && (
                                        <NavButton key={index} item={item} />
                                    )
                                ))}
                                <LanguageSelector />
                            </div>

                            <div className="flex items-center gap-2 sm:gap-4">
                                <div className="md:hidden">
                                    <TokenDisplay />
                                </div>
                                <ThemeToggle />
                                <div className="md:hidden">
                                    <LanguageSelector />
                                </div>

                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <Button variant="ghost" className="p-0 h-7 w-7 sm:h-8 sm:w-auto sm:p-2">
                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gradient-to-r from-amber-500 to-purple-500 dark:from-amber-400 dark:to-purple-400 flex items-center justify-center">
                                                    <span className="text-white font-medium text-xs sm:text-sm">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="hidden sm:block text-gray-700 dark:text-gray-100 text-xs sm:text-sm">{user.name}</span>
                                            </div>
                                        </Button>
                                    </Dropdown.Trigger>
                                    {/*@ts-ignore*/}
                                    <Dropdown.Content className="bg-white dark:bg-gray-900 dark:border-gray-700">
                                        <Dropdown.Link href={route('profile.edit')} className="text-gray-700 dark:text-gray-900 hover:bg-amber-50 dark:hover:bg-amber-500/20 text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3">
                                            {t('profile.edit')}
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button" className="text-gray-700 dark:text-gray-900 hover:bg-amber-50 dark:hover:bg-amber-500/20 text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3">
                                            {t('auth.logout')}
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="md:hidden h-7 w-7 sm:h-8 sm:w-8 p-0"
                                    onClick={() => setIsMobileMenuOpen(true)}
                                >
                                    <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 dark:text-gray-100" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </nav>

                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetContent side="right" className="bg-white dark:bg-gray-900 w-[250px] sm:w-[300px] border-amber-100 dark:border-gray-700 p-3 sm:p-4">
                        <SheetHeader className="text-left">
                            <SheetTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
                                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 dark:text-amber-400" />
                                <span className="bg-gradient-to-r from-amber-500 to-purple-500 dark:from-amber-400 dark:to-purple-400 text-transparent bg-clip-text">
                                    {route().current('career-advisor.index') ? 'Guidy AI ' : t('menu.title')}


                                </span>

                            </SheetTitle>
                        </SheetHeader>
                        <div className="mt-4 sm:mt-6 flex flex-col gap-2 sm:gap-3">
                            {mainMenuItems.map((item, index) => (
                                //@ts-ignore
                                (!item.adminOnly || user.UserType === 1) && (
                                    <NavButton key={index} item={item} compact={true} />
                                )
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>

                {showNav && <MobileNav />}

                {header && (
                    <header className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-md border-b border-amber-100 dark:border-gray-700">
                        <div className="mx-auto py-2 sm:py-6 px-3 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                <div className="flex">
                    {showNav && (
                        <aside className="hidden md:block w-48 sm:w-64 bg-white/80 dark:bg-gray-900/90 backdrop-blur-md border-r border-amber-100 dark:border-gray-700 min-h-screen">
                            <div className="sticky top-16 p-3 sm:p-4">
                                <div className="mb-3 sm:mb-6">
                                    <h2 className="text-sm sm:text-lg font-semibold bg-gradient-to-r from-amber-500 to-purple-500 dark:from-amber-400 dark:to-purple-400 text-transparent bg-clip-text">
                                        Navigation CV
                                    </h2>
                                </div>
                                <div className="space-y-1.5 sm:space-y-2">
                                    {cvSideMenuItems.map((item, index) => (
                                        <NavButton key={index} item={item} compact={true} />
                                    ))}
                                </div>
                            </div>
                        </aside>
                    )}

                    <main className="flex-1 min-w-0">
                        {children}
                    </main>
                </div>

                <footer className="mt-auto py-3 sm:py-4 border-t border-amber-100 dark:border-gray-700">
                    <div className="mx-auto px-3 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 dark:text-amber-400" />
                            <span>© {new Date().getFullYear()} {t('brand')}</span>
                        </div>

                        <div className="flex items-center gap-4 text-xs sm:text-sm">
                            <div className="flex items-center gap-4">
                                <Link
                                    href={route('support')}
                                    className="flex items-center gap-1 text-gray-500 hover:text-amber-500 transition-colors"
                                >
                                    <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span>Support</span>
                                </Link>

                                <button
                                    onClick={() => setIsReferralDialogOpen(true)}
                                    className="flex items-center gap-1 text-gray-500 hover:text-amber-500 transition-colors"
                                >
                                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span>{t('sponsorship.code.renewal.renewCode')}</span>
                                </button>

                                <a
                                    href="mailto:guidy.makeitreall@gmail.com"
                                    className="flex items-center gap-1 text-gray-500 hover:text-amber-500 transition-colors"
                                >
                                    <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline">Contact</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>

                <ReferralCodeRenewal />

                {/* Mobile Tab Bar */}
                <MobileTabBar onRenewCodeClick={() => setIsReferralDialogOpen(true)} />
            </div>
        </>
    );
}
