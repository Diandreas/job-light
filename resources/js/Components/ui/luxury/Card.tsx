import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { luxuryTheme } from '@/design-system/luxury-theme';

export type CardVariant = 'elevated' | 'outlined' | 'flat';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  variant?: CardVariant;
  padding?: CardPadding;
  hover?: boolean;
  children: React.ReactNode;
}

/**
 * Luxury Monochrome Card Component
 * Design épuré avec bordures fines et ombres subtiles
 */
export const LuxuryCard: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 'md',
  hover = false,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = `
    rounded-2xl
    transition-all duration-400
    bg-white dark:bg-neutral-900
  `;

  const variantStyles = {
    elevated: `
      shadow-md
      hover:shadow-lg
    `,
    outlined: `
      border border-neutral-200
      dark:border-neutral-800
      hover:border-neutral-300
      dark:hover:border-neutral-700
    `,
    flat: `
      bg-neutral-50
      dark:bg-neutral-950
    `,
  };

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12',
  };

  const hoverAnimation = hover
    ? {
      whileHover: { y: -4, scale: 1.01 },
      transition: { duration: 0.3, ease: luxuryTheme.animations.easings.elegant },
    }
    : {};

  return (
    <motion.div
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...hoverAnimation}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Card avec bordure dorée subtile (usage exceptionnel)
 */
export const LuxuryGoldCard: React.FC<CardProps> = ({
  padding = 'md',
  className = '',
  children,
  ...props
}) => {
  return (
    <LuxuryCard
      variant="outlined"
      padding={padding}
      className={`
        border-gold-200
        dark:border-gold-900
        hover:border-gold-300
        dark:hover:border-gold-800
        hover:shadow-md hover:shadow-gold-400/10
        ${className}
      `}
      {...props}
    >
      {children}
    </LuxuryCard>
  );
};

/**
 * Section Header pour cards
 */
export const CardHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={`flex items-start justify-between mb-6 ${className}`}>
      <div>
        <h3 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight group-hover:text-amber-500 transition-colors">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  );
};

/**
 * Card Content avec espacement optimal
 */
export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`text-neutral-700 dark:text-neutral-300 leading-relaxed ${className}`}>
      {children}
    </div>
  );
};

/**
 * Card Footer avec actions
 */
export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-3 transition-colors group-hover:border-amber-500/20 ${className}`}>
      {children}
    </div>
  );
};

/**
 * Grid de cards avec espacement premium
 */
export const CardGrid: React.FC<{
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ children, columns = 3, gap = 'md', className = '' }) => {
  const columnStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const gapStyles = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  return (
    <div className={`grid ${columnStyles[columns]} ${gapStyles[gap]} ${className}`}>
      {children}
    </div>
  );
};
