import React from 'react';
import { motion } from 'framer-motion';
import { luxuryTheme } from '@/design-system/luxury-theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'minimal';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Luxury Monochrome Button Component
 * Design minimaliste avec focus sur la typographie et les interactions subtiles
 */
export const LuxuryButton: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-medium tracking-wide
    transition-all duration-400
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-38 disabled:cursor-not-allowed
  `;

  const variantStyles = {
    primary: `
      bg-neutral-900 text-white
      hover:bg-neutral-800
      focus:ring-neutral-900
      shadow-md hover:shadow-lg
      dark:bg-neutral-50 dark:text-neutral-900
      dark:hover:bg-neutral-100
    `,
    secondary: `
      bg-white text-neutral-900
      border border-neutral-200
      hover:border-neutral-300 hover:bg-neutral-50
      focus:ring-neutral-300
      shadow-sm hover:shadow-md
      dark:bg-neutral-900 dark:text-neutral-50
      dark:border-neutral-700
      dark:hover:bg-neutral-800
    `,
    ghost: `
      bg-transparent text-neutral-700
      hover:bg-neutral-100
      focus:ring-neutral-300
      dark:text-neutral-300
      dark:hover:bg-neutral-800
    `,
    minimal: `
      bg-transparent text-neutral-600
      hover:text-neutral-900
      focus:ring-transparent
      dark:text-neutral-400
      dark:hover:text-neutral-100
    `,
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2.5 text-base rounded-xl',
    lg: 'px-6 py-3.5 text-lg rounded-2xl',
  };

  return (
    <motion.button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: luxuryTheme.animations.easings.luxury }}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <motion.div
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </motion.button>
  );
};

/**
 * Icon-only button variant
 */
export const LuxuryIconButton: React.FC<Omit<ButtonProps, 'children'> & { icon: React.ReactNode; 'aria-label': string }> = ({
  variant = 'ghost',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center
    transition-all duration-400
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-38 disabled:cursor-not-allowed
  `;

  const variantStyles = {
    primary: `
      bg-neutral-900 text-white
      hover:bg-neutral-800
      focus:ring-neutral-900
      dark:bg-neutral-50 dark:text-neutral-900
    `,
    secondary: `
      bg-white text-neutral-900
      border border-neutral-200
      hover:border-neutral-300
      focus:ring-neutral-300
      dark:bg-neutral-900 dark:text-neutral-50
      dark:border-neutral-700
    `,
    ghost: `
      text-neutral-600
      hover:bg-neutral-100
      focus:ring-neutral-300
      dark:text-neutral-400
      dark:hover:bg-neutral-800
    `,
    minimal: `
      text-neutral-500
      hover:text-neutral-900
      focus:ring-transparent
      dark:text-neutral-500
      dark:hover:text-neutral-100
    `,
  };

  const sizeStyles = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
  };

  return (
    <motion.button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2, ease: luxuryTheme.animations.easings.luxury }}
      {...props}
    >
      {icon}
    </motion.button>
  );
};

/**
 * Button with subtle gold accent (rare usage)
 */
export const LuxuryGoldButton: React.FC<ButtonProps> = ({
  size = 'md',
  className = '',
  ...props
}) => {
  return (
    <LuxuryButton
      variant="primary"
      size={size}
      className={`
        bg-gold-400 text-neutral-900
        hover:bg-gold-500
        shadow-md shadow-gold-400/20
        hover:shadow-lg hover:shadow-gold-400/30
        focus:ring-gold-400
        ${className}
      `}
      {...props}
    />
  );
};
