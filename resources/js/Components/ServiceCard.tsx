import React from 'react';
import { motion } from 'framer-motion';
import { Service } from '@/types/career-advisor';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { cn } from '@/lib/utils';

interface ServiceCardProps extends Service {
    isSelected: boolean;
    onClick: () => void;
    className?: string;
}

const ServiceCard = ({
                         icon: Icon,
                         title,
                         description,
                         cost,
                         formats,
                         isSelected,
                         onClick,
                         className
                     }: ServiceCardProps) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={cn(
            "cursor-pointer p-6 rounded-lg border transition-all",
            isSelected ? "border-primary bg-primary/5 shadow-lg" : "border-gray-200 hover:border-primary/30 hover:shadow-md",
            className
        )}
    >
        <div className="flex items-start justify-between mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="text-primary w-6 h-6" />
            </div>
            <div className="flex flex-col items-end gap-2">
                <Badge variant={isSelected ? "default" : "outline"}>
                    {cost} FCFA
                </Badge>
                <div className="flex gap-1">
                    {formats.map(format => (
                        <Badge
                            key={format}
                            variant="secondary"
                            className="text-xs"
                        >
                            {format}
                        </Badge>
                    ))}
                </div>
            </div>
        </div>

        <div>
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {isSelected && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 pt-4 border-t border-primary/20"
            >
                <span className="text-sm font-medium text-primary">
                    Service sélectionné
                </span>
            </motion.div>
        )}
    </motion.div>
);

export default ServiceCard;
