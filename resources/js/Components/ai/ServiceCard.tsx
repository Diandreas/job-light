// resources/js/Components/CareerAdvisor/ServiceCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

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
                                                        }) => (
    <motion.div
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`cursor-pointer p-6 rounded-xl border transition-all ${
            isSelected
                ? 'border-amber-500 bg-gradient-to-r from-amber-500/10 to-purple-500/10 shadow-lg'
                : 'border-gray-200 hover:border-amber-200'
        }`}
    >
        <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-amber-500 to-purple-500">
                <Icon className="text-white h-6 w-6" />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                <Star className="h-4 w-4" />
                {cost} FCFA
            </div>
        </div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
    </motion.div>
);
