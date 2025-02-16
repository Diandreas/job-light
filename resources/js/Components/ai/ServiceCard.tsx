import React from 'react';
import { motion } from 'framer-motion';
import { Coins } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ServiceCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    cost: number;
    isSelected: boolean;
    onClick: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
                                                            icon: Icon,
                                                            title,
                                                            description,
                                                            cost,
                                                            isSelected,
                                                            onClick
                                                        }) => {
    const { t } = useTranslation();

    return (
        <motion.div
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`cursor-pointer p-6 rounded-xl border transition-all ${
                isSelected
                    ? 'border-amber-500 dark:border-amber-400 bg-gradient-to-r from-amber-500/10 to-purple-500/10 dark:from-amber-400/10 dark:to-purple-400/10 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 hover:border-amber-200 dark:hover:border-amber-500/30'
            }`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-amber-500 to-purple-500 dark:from-amber-400 dark:to-purple-400">
                    <Icon className="text-white h-6 w-6" />
                </div>
                <div className="flex items-center gap-2 text-sm font-medium bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-full">
                    <Coins className="h-4 w-4" />
                    <span>{cost} </span>
                </div>
            </div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                {t(title)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                {t(description)}
            </p>
        </motion.div>
    );
};

export const MobileServiceCard: React.FC<{
    service: {
        id: string;
        icon: LucideIcon;
        title: string;
        cost: number;
    };
    isSelected: boolean;
    onClick: () => void;
}> = ({ service, isSelected, onClick }) => {
    const { t } = useTranslation();

    return (
        <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                isSelected
                    ? 'bg-amber-100 dark:bg-amber-500/20'
                    : 'hover:bg-amber-50 dark:hover:bg-amber-500/10'
            }`}
        >
            <service.icon className="h-5 w-5 text-amber-500 dark:text-amber-400" />
            <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                    {t(service.title)}
                </p>
                <div className="flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400">
                    <Coins className="h-3 w-3" />
                    <span>{service.cost} </span>
                </div>
            </div>
        </motion.div>
    );
};

export default ServiceCard;
