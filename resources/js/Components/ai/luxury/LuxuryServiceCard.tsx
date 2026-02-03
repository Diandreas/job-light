import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { luxuryTheme } from '@/design-system/luxury-theme';

interface LuxuryServiceCardProps {
    id: string;
    icon: LucideIcon;
    title: string;
    description: string;
    cost?: number;
    isSelected?: boolean;
    onClick?: () => void;
    className?: string;
}

/**
 * Luxury Service Card - Design minimaliste et épuré
 * Bordures fines, ombres subtiles, micro-interactions délicates
 */
export const LuxuryServiceCard: React.FC<LuxuryServiceCardProps> = ({
    id,
    icon: Icon,
    title,
    description,
    cost,
    isSelected = false,
    onClick,
    className = '',
}) => {
    return (
        <motion.button
            onClick={onClick}
            className={`
                w-full text-left p-6 rounded-2xl
                border transition-all duration-400
                ${isSelected
                    ? 'border-neutral-900 dark:border-neutral-50 bg-neutral-50 dark:bg-neutral-950 shadow-md'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
                }
                ${className}
            `}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3, ease: luxuryTheme.animations.easings.elegant }}
        >
            {/* En-tête avec icône */}
            <div className="flex items-start justify-between mb-4">
                <div className={`
                    p-3 rounded-xl transition-colors duration-400
                    ${isSelected
                        ? 'bg-neutral-900 dark:bg-neutral-50'
                        : 'bg-neutral-100 dark:bg-neutral-800'
                    }
                `}>
                    <Icon className={`
                        w-5 h-5 transition-colors duration-400
                        ${isSelected
                            ? 'text-white dark:text-neutral-900'
                            : 'text-neutral-700 dark:text-neutral-300'
                        }
                    `} />
                </div>

                {cost !== undefined && (
                    <div className={`
                        px-3 py-1 rounded-full text-xs font-medium tracking-wide
                        ${isSelected
                            ? 'bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                        }
                    `}>
                        {cost} {cost === 1 ? 'crédit' : 'crédits'}
                    </div>
                )}
            </div>

            {/* Contenu */}
            <div className="space-y-2">
                <h3 className={`
                    text-base font-semibold tracking-tight
                    ${isSelected
                        ? 'text-neutral-900 dark:text-neutral-50'
                        : 'text-neutral-800 dark:text-neutral-100'
                    }
                `}>
                    {title}
                </h3>

                <p className={`
                    text-sm leading-relaxed
                    ${isSelected
                        ? 'text-neutral-600 dark:text-neutral-400'
                        : 'text-neutral-500 dark:text-neutral-500'
                    }
                `}>
                    {description}
                </p>
            </div>

            {/* Indicateur de sélection subtil */}
            {isSelected && (
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3, ease: luxuryTheme.animations.easings.elegant }}
                    className="mt-4 h-0.5 bg-neutral-900 dark:bg-neutral-50 rounded-full origin-left"
                />
            )}
        </motion.button>
    );
};

/**
 * Grid de service cards avec espacement premium
 */
export const LuxuryServiceGrid: React.FC<{
    children: React.ReactNode;
    columns?: 1 | 2 | 3;
    className?: string;
}> = ({ children, columns = 3, className = '' }) => {
    const columnStyles = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    };

    return (
        <div className={`grid ${columnStyles[columns]} gap-6 ${className}`}>
            {children}
        </div>
    );
};

export default LuxuryServiceCard;
