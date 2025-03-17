import React from 'react';
import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Briefcase, FileText, Search, Plus, User } from 'lucide-react';

interface JobPortalNavProps {
    currentRoute?: string;
    className?: string;
}

export default function JobPortalNav({ currentRoute, className }: JobPortalNavProps) {
    const { t } = useTranslation();

    const navItems = [
        {
            name: t('jobListing.filters.filters'),
            href: route('job-listings.index'),
            icon: Search,
            active: currentRoute === 'job-listings.index'
        },
        {
            name: t('jobListing.myListings'),
            href: route('job-listings.my-listings'),
            icon: Briefcase,
            active: currentRoute === 'job-listings.my-listings'
        },
        {
            name: t('jobListing.createNew'),
            href: route('job-listings.create'),
            icon: Plus,
            active: currentRoute === 'job-listings.create'
        },
        {
            name: t('jobApplication.myApplications.title'),
            href: route('job-applications.index'),
            icon: FileText,
            active: currentRoute === 'job-applications.index'
        }
    ];

    return (
        <div className={cn("flex flex-wrap gap-2 sm:gap-3", className)}>
            {navItems.map((item, index) => (
                <Link
                    key={index}
                    href={item.href}
                    className={cn(
                        "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors",
                        item.active
                            ? "bg-gradient-to-r from-amber-500 to-purple-500 text-white shadow-sm"
                            : "text-gray-700 dark:text-gray-100 hover:bg-amber-50 dark:hover:bg-amber-500/20 border border-gray-200 dark:border-gray-700"
                    )}
                >
                    <item.icon className={cn(
                        "h-3.5 w-3.5 sm:h-4 sm:w-4",
                        item.active ? "text-white" : "text-amber-500 dark:text-amber-400"
                    )} />
                    <span>{item.name}</span>
                </Link>
            ))}
        </div>
    );
} 