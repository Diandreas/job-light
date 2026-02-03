/**
 * Luxury Minimalist Design System
 * Monochrome élégant avec accent doré
 * SOURCE OF TRUTH: resources/css/luxury-tokens.css
 */

export const luxuryTheme = {
  // Palette Monochrome Premium (Mapped to CSS Variables)
  colors: {
    // Neutrals
    neutral: {
      50: 'var(--luxury-neutral-50)',
      100: 'var(--luxury-neutral-100)',
      200: 'var(--luxury-neutral-200)',
      300: 'var(--luxury-neutral-300)',
      400: 'var(--luxury-neutral-400)',
      500: 'var(--luxury-neutral-500)',
      600: 'var(--luxury-neutral-600)',
      700: 'var(--luxury-neutral-700)',
      800: 'var(--luxury-neutral-800)',
      900: 'var(--luxury-neutral-900)',
      950: 'var(--luxury-neutral-950)',
    },

    // Gold Accents
    gold: {
      50: 'var(--luxury-gold-50)',
      100: 'var(--luxury-gold-100)',
      200: 'var(--luxury-gold-200)',
      300: 'var(--luxury-gold-300)',
      400: 'var(--luxury-gold-400)',
      500: 'var(--luxury-gold-500)',
      600: 'var(--luxury-gold-600)',
      700: 'var(--luxury-gold-700)',
      800: 'var(--luxury-gold-800)',
      900: 'var(--luxury-gold-900)',
    },

    // Semantic colors
    success: 'var(--luxury-success)',
    error: 'var(--luxury-error)',
    warning: 'var(--luxury-warning)',
    info: 'var(--luxury-info)',
  },

  // Spacing Premium
  spacing: {
    xs: '0.75rem',    // 12px
    sm: '1rem',       // 16px
    md: '1.5rem',     // 24px
    lg: '2.5rem',     // 40px
    xl: '4rem',       // 64px
    '2xl': '6rem',    // 96px
    '3xl': '8rem',    // 128px
  },

  // Typography Premium
  typography: {
    fonts: {
      sans: 'Inter, system-ui, -apple-system, sans-serif',
      display: 'Inter Display, Inter, sans-serif',
      mono: 'JetBrains Mono, Menlo, monospace',
    },
    // Sizes kept as rem for direct TS usage if needed
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  // Shadows
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    md: '0 2px 8px -2px rgba(0, 0, 0, 0.05)',
    lg: '0 4px 16px -4px rgba(0, 0, 0, 0.08)',
    xl: '0 8px 32px -8px rgba(0, 0, 0, 0.12)',
    '2xl': '0 16px 48px -12px rgba(0, 0, 0, 0.15)',
    goldGlow: '0 0 20px rgba(251, 191, 36, 0.15)',
    goldGlowStrong: '0 0 32px rgba(251, 191, 36, 0.25)',
  },

  // Borders
  borders: {
    width: {
      none: '0',
      thin: '0.5px',
      default: '1px',
      medium: '2px',
    },
    radius: {
      none: '0',
      sm: 'var(--luxury-radius-sm)',
      md: 'var(--luxury-radius-md)',
      lg: 'var(--luxury-radius-lg)',
      xl: 'var(--luxury-radius-xl)',
      '2xl': 'var(--luxury-radius-2xl)',
      full: 'var(--luxury-radius-full)',
    },
  },

  // Animations (Mapped to CSS Variables for JS-driven animations)
  animations: {
    durations: {
      instant: '100ms',
      fast: '200ms',
      normal: '400ms',
      slow: '600ms',
      slower: '800ms',
    },
    easings: {
      default: [0.4, 0, 0.2, 1],
      in: [0.4, 0, 1, 1],
      out: [0, 0, 0.2, 1],
      inOut: [0.4, 0, 0.2, 1],
      luxury: [0.25, 0.46, 0.45, 0.94],
      elegant: [0.23, 1, 0.32, 1], // Cubic-bezier approximation
    },
  },

  // Effects
  effects: {
    blur: {
      none: '0',
      sm: '4px',
      md: '8px',
      lg: '12px',
    },
    opacity: {
      disabled: 0.38,
      placeholder: 0.54,
      secondary: 0.74,
      primary: 0.87,
      full: 1,
    },
    glass: {
      light: 'rgba(255, 255, 255, 0.7)',
      medium: 'rgba(255, 255, 255, 0.5)',
      dark: 'rgba(0, 0, 0, 0.3)',
    },
  },

  // Layout
  layout: {
    maxWidths: {
      xs: '20rem',
      sm: '24rem',
      md: '28rem',
      lg: '32rem',
      xl: '36rem',
      '2xl': '42rem',
      '3xl': '48rem',
      '4xl': '56rem',
      '5xl': '64rem',
      '6xl': '72rem',
      '7xl': '80rem',
    },
    gaps: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem',
      '2xl': '4rem',
    },
  },
} as const;

export type LuxuryTheme = typeof luxuryTheme;
export type ColorKey = keyof typeof luxuryTheme.colors.neutral | keyof typeof luxuryTheme.colors.gold;

// Utilities
export const getColor = (shade: keyof typeof luxuryTheme.colors.neutral, type: 'neutral' | 'gold' = 'neutral') => {
  return luxuryTheme.colors[type][shade];
};

export const getSpacing = (size: keyof typeof luxuryTheme.spacing) => {
  return luxuryTheme.spacing[size];
};

export const getShadow = (size: keyof typeof luxuryTheme.shadows) => {
  return luxuryTheme.shadows[size];
};
