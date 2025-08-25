import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Folder, Brain, User, MessageSquare, RefreshCw } from 'lucide-react';
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

    // Onglets pour les utilisateurs authentifiés
    const authTabs: TabItem[] = [
        {
            name: t('menu.createCV'),
            href: route('cv-infos.index'),
            icon: Folder,
            active: url.includes('/cv-infos')
        },
        {
            name: 'Portfolio',
            href: route('portfolio.index'),
            icon: User,
            active: url.includes('/portfolio')
        },
        {
            name: t('menu.assistant'),
            href: route('career-advisor.index'),
            icon: Brain,
            active: url.includes('/career-advisor')
        },
        {
            name: 'Support',
            href: route('support'),
            icon: MessageSquare,
            active: url.includes('/support')
        },
        // {
        //     name: t('sponsorship.code.renewal.renewCode', 'New Code'),
        //     href: '#',
        //     icon: RefreshCw,
        //     active: false,
        //     onClick: onRenewCodeClick
        // }
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
            {tabs.map((tab) => (
                tab.onClick ? (
                    <button
                        key={tab.name}
                        onClick={tab.onClick}
                        className={cn(
                            "mobile-tab-item",
                            tab.active && "active"
                        )}
                    >
                        <tab.icon className="mobile-tab-item-icon h-5 w-5" />
                        <span className="mobile-tab-item-label">{tab.name}</span>
                        {tab.active && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute -top-1 w-1 h-1 rounded-full bg-amber-500"
                                transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 30
                                }}
                            />
                        )}
                    </button>
                ) : (
                    <Link
                        key={tab.name}
                        href={tab.href}
                        className={cn(
                            "mobile-tab-item",
                            tab.active && "active"
                        )}
                    >
                        <tab.icon className="mobile-tab-item-icon h-5 w-5" />
                        <span className="mobile-tab-item-label">{tab.name}</span>
                        {tab.active && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute -top-1 w-1 h-1 rounded-full bg-amber-500"
                                transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 30
                                }}
                            />
                        )}
                    </Link>
                )
            ))}
        </div>
    );
};

