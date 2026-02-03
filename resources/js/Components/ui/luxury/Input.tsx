import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

export type InputVariant = 'default' | 'minimal';
export type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
  inputSize?: InputSize;
  error?: string;
  label?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Luxury Monochrome Input Component
 * Design épuré avec focus sur la lisibilité
 */
export const LuxuryInput = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      inputSize = 'md',
      error,
      label,
      helperText,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      w-full
      font-normal
      text-neutral-900 dark:text-neutral-50
      placeholder:text-neutral-400 dark:placeholder:text-neutral-600
      transition-all duration-400
      focus:outline-none
      disabled:opacity-38 disabled:cursor-not-allowed
      disabled:bg-neutral-50 dark:disabled:bg-neutral-950
    `;

    const variantStyles = {
      default: `
        bg-white dark:bg-neutral-900
        border border-neutral-200 dark:border-neutral-800
        focus:border-neutral-400 dark:focus:border-neutral-600
        focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600
        rounded-xl
        shadow-sm
        ${error ? 'border-red-300 dark:border-red-800 focus:border-red-400 focus:ring-red-400' : ''}
      `,
      minimal: `
        bg-transparent
        border-b border-neutral-200 dark:border-neutral-800
        focus:border-neutral-900 dark:focus:border-neutral-100
        rounded-none
        ${error ? 'border-red-300 dark:border-red-800 focus:border-red-400' : ''}
      `,
    };

    const sizeStyles = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg',
    };

    const iconPadding = {
      left: leftIcon ? (inputSize === 'sm' ? 'pl-10' : inputSize === 'md' ? 'pl-12' : 'pl-14') : '',
      right: rightIcon ? (inputSize === 'sm' ? 'pr-10' : inputSize === 'md' ? 'pr-12' : 'pr-14') : '',
    };

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label className="block mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div
              className={`
                absolute left-0 top-1/2 -translate-y-1/2
                text-neutral-400 dark:text-neutral-600
                ${inputSize === 'sm' ? 'left-3' : inputSize === 'md' ? 'left-4' : 'left-5'}
              `}
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            className={`
              ${baseStyles}
              ${variantStyles[variant]}
              ${sizeStyles[inputSize]}
              ${iconPadding.left}
              ${iconPadding.right}
            `}
            disabled={disabled}
            {...props}
          />

          {rightIcon && (
            <div
              className={`
                absolute right-0 top-1/2 -translate-y-1/2
                text-neutral-400 dark:text-neutral-600
                ${inputSize === 'sm' ? 'right-3' : inputSize === 'md' ? 'right-4' : 'right-5'}
              `}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </motion.p>
        )}

        {helperText && !error && (
          <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

LuxuryInput.displayName = 'LuxuryInput';

/**
 * Textarea variant
 */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: InputVariant;
  inputSize?: InputSize;
  error?: string;
  label?: string;
  helperText?: string;
  characterCount?: number;
  maxLength?: number;
}

export const LuxuryTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      variant = 'default',
      inputSize = 'md',
      error,
      label,
      helperText,
      characterCount,
      maxLength,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      w-full
      font-normal
      text-neutral-900 dark:text-neutral-50
      placeholder:text-neutral-400 dark:placeholder:text-neutral-600
      transition-all duration-400
      focus:outline-none
      disabled:opacity-38 disabled:cursor-not-allowed
      disabled:bg-neutral-50 dark:disabled:bg-neutral-950
      resize-none
    `;

    const variantStyles = {
      default: `
        bg-white dark:bg-neutral-900
        border border-neutral-200 dark:border-neutral-800
        focus:border-neutral-400 dark:focus:border-neutral-600
        focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600
        rounded-xl
        shadow-sm
        ${error ? 'border-red-300 dark:border-red-800 focus:border-red-400 focus:ring-red-400' : ''}
      `,
      minimal: `
        bg-transparent
        border border-neutral-200 dark:border-neutral-800
        focus:border-neutral-900 dark:focus:border-neutral-100
        rounded-lg
        ${error ? 'border-red-300 dark:border-red-800 focus:border-red-400' : ''}
      `,
    };

    const sizeStyles = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg',
    };

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label className="block mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          className={`
            ${baseStyles}
            ${variantStyles[variant]}
            ${sizeStyles[inputSize]}
          `}
          disabled={disabled}
          maxLength={maxLength}
          {...props}
        />

        <div className="mt-1.5 flex items-center justify-between">
          <div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 dark:text-red-400"
              >
                {error}
              </motion.p>
            )}

            {helperText && !error && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {helperText}
              </p>
            )}
          </div>

          {typeof characterCount === 'number' && maxLength && (
            <p
              className={`
                text-xs font-medium
                ${
                  characterCount > maxLength * 0.9
                    ? 'text-red-600 dark:text-red-400'
                    : characterCount > maxLength * 0.75
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-neutral-400 dark:text-neutral-600'
                }
              `}
            >
              {characterCount} / {maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

LuxuryTextarea.displayName = 'LuxuryTextarea';
