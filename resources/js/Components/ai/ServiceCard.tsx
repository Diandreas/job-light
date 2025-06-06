import React from 'react';
import { motion } from 'framer-motion';
import { Coins } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip";

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
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`cursor-pointer p-3.5 rounded-lg border transition-all ${
                isSelected
                    ? 'border-amber-400 dark:border-amber-500 bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-500/10 dark:to-purple-500/10 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 hover:border-amber-300/70 dark:hover:border-amber-500/30 bg-white dark:bg-gray-800 hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-purple-50/50 dark:hover:from-amber-500/5 dark:hover:to-purple-500/5'
            }`}
        >
            <div className="flex items-start justify-between mb-2.5">
                <div className="p-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-purple-500 dark:from-amber-400 dark:to-purple-400">
                    <Icon className="text-white h-4 w-4" />
                </div>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 text-xs font-medium bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                                <Coins className="h-3 w-3" />
                                <span>{cost}</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p className="text-xs">Coût du service</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <h3 className="font-medium text-sm mb-1 text-gray-900 dark:text-gray-100">
                {t(`${title.toLowerCase().replace(/\s/g, '-')}`)}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                {t(`${title.toLowerCase().replace(/\s/g, '-')}`)}
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
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all border ${
                isSelected
                    ? 'bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/20 dark:to-purple-900/20 border-amber-300 dark:border-amber-500/40'
                    : 'hover:bg-amber-50/50 dark:hover:bg-amber-500/5 border-transparent dark:hover:border-amber-500/20 bg-white dark:bg-gray-800'
            }`}
        >
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-purple-500 dark:from-amber-400 dark:to-purple-400">
                <service.icon className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-xs text-gray-900 dark:text-gray-100 truncate">
                    {t(`services.${service.id}.title`)}
                </p>
                <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                    <Coins className="h-2.5 w-2.5" />
                    <span>{service.cost}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default ServiceCard;
