/**
 * Luxury Minimalist Design System
 * Monochrome élégant avec accent doré
 */

export const luxuryTheme = {
  // Palette Monochrome Premium
  colors: {
    // Neutrals - Échelle de gris chauds
    neutral: {
      50: '#FAFAF9',   // Off-white premium
      100: '#F5F5F4',  // Subtle background
      200: '#E7E5E4',  // Soft border
      300: '#D6D3D1',  // Muted border
      400: '#A8A29E',  // Placeholder text
      500: '#78716C',  // Secondary text
      600: '#57534E',  // Body text
      700: '#44403C',  // Heading text
      800: '#292524',  // Strong text
      900: '#1C1917',  // Primary black
      950: '#0C0A09',  // Deep black
    },

    // Accent doré - Usage minimal et stratégique
    gold: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',   // Primary gold
      500: '#F59E0B',   // Vibrant gold (rare usage)
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
    },

    // Semantic colors
    success: '#059669',  // Subtle green
    error: '#DC2626',    // Refined red
    warning: '#D97706',  // Muted amber
    info: '#0891B2',     // Calm cyan
  },

  // Spacing Premium - 1.5x plus généreux
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

    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '3.75rem', // 60px
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

  // Shadows Subtiles
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    md: '0 2px 8px -2px rgba(0, 0, 0, 0.05)',
    lg: '0 4px 16px -4px rgba(0, 0, 0, 0.08)',
    xl: '0 8px 32px -8px rgba(0, 0, 0, 0.12)',
    '2xl': '0 16px 48px -12px rgba(0, 0, 0, 0.15)',

    // Ombres dorées pour accents
    goldGlow: '0 0 20px rgba(251, 191, 36, 0.15)',
    goldGlowStrong: '0 0 32px rgba(251, 191, 36, 0.25)',
  },

  // Borders Premium
  borders: {
    width: {
      none: '0',
      thin: '0.5px',    // Ultra-fin
      default: '1px',
      medium: '2px',
    },
    radius: {
      none: '0',
      sm: '0.375rem',   // 6px
      md: '0.5rem',     // 8px
      lg: '0.75rem',    // 12px
      xl: '1rem',       // 16px
      '2xl': '1.5rem',  // 24px
      full: '9999px',
    },
  },

  // Animations Raffinées
  animations: {
    durations: {
      instant: '100ms',
      fast: '200ms',
      normal: '400ms',  // Plus lent que standard
      slow: '600ms',
      slower: '800ms',
    },

    easings: {
      default: [0.4, 0, 0.2, 1],
      in: [0.4, 0, 1, 1],
      out: [0, 0, 0.2, 1],
      inOut: [0.4, 0, 0.2, 1],
      // Easing premium pour interactions délicates
      luxury: [0.25, 0.46, 0.45, 0.94],
      elegant: [0.23, 1, 0.32, 1],
    },
  },

  // Effects Premium
  effects: {
    blur: {
      none: '0',
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
    },

    opacity: {
      disabled: 0.38,
      placeholder: 0.54,
      secondary: 0.74,
      primary: 0.87,
      full: 1,
    },

    // Glassmorphism subtil
    glass: {
      light: 'rgba(255, 255, 255, 0.7)',
      medium: 'rgba(255, 255, 255, 0.5)',
      dark: 'rgba(0, 0, 0, 0.3)',
    },
  },

  // Layout Premium
  layout: {
    maxWidths: {
      xs: '20rem',    // 320px
      sm: '24rem',    // 384px
      md: '28rem',    // 448px
      lg: '32rem',    // 512px
      xl: '36rem',    // 576px
      '2xl': '42rem', // 672px
      '3xl': '48rem', // 768px
      '4xl': '56rem', // 896px
      '5xl': '64rem', // 1024px
      '6xl': '72rem', // 1152px
      '7xl': '80rem', // 1280px
    },

    // Espacements de grille premium
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

// Types pour TypeScript
export type LuxuryTheme = typeof luxuryTheme;
export type ColorKey = keyof typeof luxuryTheme.colors.neutral | keyof typeof luxuryTheme.colors.gold;

// Utilitaires d'accès
export const getColor = (shade: keyof typeof luxuryTheme.colors.neutral, type: 'neutral' | 'gold' = 'neutral') => {
  return luxuryTheme.colors[type][shade];
};

export const getSpacing = (size: keyof typeof luxuryTheme.spacing) => {
  return luxuryTheme.spacing[size];
};

export const getShadow = (size: keyof typeof luxuryTheme.shadows) => {
  return luxuryTheme.shadows[size];
};
