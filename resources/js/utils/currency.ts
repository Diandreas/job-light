/**
 * Utilitaires pour la gestion des devises et formatage des prix
 * Par défaut: FCFA (Franc CFA) comme devise principale
 */

/**
 * Formate un prix en FCFA avec gestion intelligente du format compact/desktop
 * @param price - Prix à formater (number, null ou undefined)
 * @param isCompact - Mode compact pour mobile (true) ou format complet (false)
 * @returns Prix formaté en FCFA ou "Gratuit"
 *
 * @example
 * formatPrice(0) => "Gratuit"
 * formatPrice(1500, true) => "1,5K FCFA" (mobile)
 * formatPrice(1500, false) => "1 500 FCFA" (desktop)
 * formatPrice(2500000) => "2 500 000 FCFA"
 */
export const formatPrice = (price: number | null | undefined, isCompact: boolean = false): string => {
    // Gestion des cas null, undefined, 0 ou valeurs négatives
    if (!price || price <= 0) {
        return 'Gratuit';
    }

    // Version compacte pour mobile (écrans < md)
    if (isCompact && price >= 1000) {
        if (price >= 1000000) {
            const millions = price / 1000000;
            const formatted = millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1);
            return `${formatted}M FCFA`;
        } else if (price >= 1000) {
            const thousands = price / 1000;
            const formatted = thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1);
            return `${formatted}K FCFA`;
        }
    }

    // Format complet pour desktop avec séparateurs de milliers français
    const formattedNumber = new Intl.NumberFormat('fr-FR').format(price);
    return `${formattedNumber} FCFA`;
};

/**
 * Formate uniquement le montant sans la devise (pour des cas spéciaux)
 * @param price - Prix à formater
 * @param isCompact - Mode compact pour mobile
 * @returns Montant formaté sans devise
 */
export const formatAmount = (price: number | null | undefined, isCompact: boolean = false): string => {
    if (!price || price <= 0) {
        return '0';
    }

    if (isCompact && price >= 1000) {
        if (price >= 1000000) {
            const millions = price / 1000000;
            return millions % 1 === 0 ? millions.toFixed(0) + 'M' : millions.toFixed(1) + 'M';
        } else if (price >= 1000) {
            const thousands = price / 1000;
            return thousands % 1 === 0 ? thousands.toFixed(0) + 'K' : thousands.toFixed(1) + 'K';
        }
    }

    return new Intl.NumberFormat('fr-FR').format(price);
};

/**
 * Valide si un prix est valide
 * @param price - Prix à valider
 * @returns true si le prix est valide
 */
export const isValidPrice = (price: any): price is number => {
    return typeof price === 'number' && !isNaN(price) && price >= 0;
};

/**
 * Constantes pour les devises supportées
 */
export const CURRENCIES = {
    FCFA: 'FCFA',
    EUR: '€',
    USD: '$'
} as const;

/**
 * Devise par défaut de l'application
 */
export const DEFAULT_CURRENCY = CURRENCIES.FCFA;