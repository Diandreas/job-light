import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Folder, Brain, User, MessageSquare, RefreshCw, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useMediaQuery } from '@/lib/hooks';

interface MobileTabBarProps {
    onRenewCodeClick?: () => void;
    isGuest?: boolean;
}

interface TabItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    active: boolean;
    onClick?: () => void;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({ onRenewCodeClick, isGuest = false }) => {
    const { t } = useTranslation();
    const { url } = usePage();
    const isMobile = useMediaQuery('(max-width: 768px)');

    if (!isMobile) return null;

    // Onglets pour les utilisateurs authentifiés - Assistant au milieu
    const authTabs: TabItem[] = [
        {
            name: t('menu.createCV'),
            href: route('cv-infos.index'),
            icon: Folder,
            active: url.includes('/cv-infos')
        },
        {
            name: t('menu.assistant'),
            href: route('career-advisor.index'),
            icon: Brain,
            active: url.includes('/career-advisor')
        },
        {
            name: 'Portfolio',
            href: route('portfolio.index'),
            icon: User,
            active: url.includes('/portfolio')
        }
    ];

    // Onglets pour les invités
    const guestTabs: TabItem[] = [
        {
            name: 'Support',
            href: route('support'),
            icon: MessageSquare,
            active: url.includes('/support')
        },
        {
            name: t('auth.login.value', 'Login'),
            href: route('login'),
            icon: User,
            active: url.includes('/login')
        }
    ];

    // Sélectionner les onglets en fonction du statut de l'utilisateur
    const tabs = isGuest ? guestTabs : authTabs;

    return (
        <div className="mobile-tab-bar">
            {tabs.map((tab, index) => {
                const isMiddle = index === Math.floor(tabs.length / 2);

                return tab.onClick ? (
                    <button
                        key={tab.name}
                        onClick={tab.onClick}
                        className={cn(
                            "mobile-tab-item",
                            tab.active && "active",
                            isMiddle && "mobile-tab-item-middle"
                        )}
                    >
                        <div className={cn(
                            "mobile-tab-item-content",
                            isMiddle && "mobile-tab-item-content-middle"
                        )}>
                            <tab.icon className={cn(
                                "mobile-tab-item-icon",
                                isMiddle ? "h-6 w-6" : "h-5 w-5"
                            )} />
                            {tab.active && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="mobile-tab-active-indicator"
                                    transition={{
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 30
                                    }}
                                />
                            )}
                        </div>
                        <span className={cn(
                            "mobile-tab-item-label",
                            isMiddle && "mobile-tab-item-label-middle"
                        )}>{tab.name}</span>
                    </button>
                ) : (
                    <Link
                        key={tab.name}
                        href={tab.href}
                        className={cn(
                            "mobile-tab-item",
                            tab.active && "active",
                            isMiddle && "mobile-tab-item-middle"
                        )}
                    >
                        <div className={cn(
                            "mobile-tab-item-content",
                            isMiddle && "mobile-tab-item-content-middle"
                        )}>
                            <tab.icon className={cn(
                                "mobile-tab-item-icon",
                                isMiddle ? "h-6 w-6" : "h-5 w-5"
                            )} />
                            {tab.active && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="mobile-tab-active-indicator"
                                    transition={{
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 30
                                    }}
                                />
                            )}
                        </div>
                        <span className={cn(
                            "mobile-tab-item-label",
                            isMiddle && "mobile-tab-item-label-middle"
                        )}>{tab.name}</span>
                    </Link>
                );
            })}
        </div>
    );
};

