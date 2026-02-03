/**
 * Luxury Monochrome Design System
 * Export central pour tous les composants UI premium
 */

export { LuxuryButton, LuxuryIconButton, LuxuryGoldButton } from './Button';
export type { ButtonVariant, ButtonSize } from './Button';

export {
  LuxuryCard,
  LuxuryGoldCard,
  CardHeader,
  CardContent,
  CardFooter,
  CardGrid,
} from './Card';
export type { CardVariant, CardPadding } from './Card';

export { LuxuryInput, LuxuryTextarea } from './Input';
export type { InputVariant, InputSize } from './Input';

export { luxuryTheme, getColor, getSpacing, getShadow } from '@/design-system/luxury-theme';
export type { LuxuryTheme } from '@/design-system/luxury-theme';
