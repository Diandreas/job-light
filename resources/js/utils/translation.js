// Translation helper function for Laravel-like translation keys
// This creates a __ function similar to Laravel's translation helper

import en from '../locales/en.json';
import fr from '../locales/fr.json';

let translations = {};
let currentLocale = 'en';

// Load translations from the same source as i18n
export const loadTranslations = async (locale = 'en') => {
    try {
        currentLocale = locale;
        if (locale === 'fr') {
            translations = fr;
        } else {
            translations = en;
        }
    } catch (error) {
        console.error('Failed to load translations:', error);
        // Fallback to English
        translations = en;
    }
};

// Helper function to get nested object values using dot notation
const getNestedValue = (obj, path) => {
    return path.split('.').reduce((curr, prop) => curr?.[prop], obj);
};

// Translation function similar to Laravel's __() helper
export const __ = (key, replacements = {}) => {
    let translation = getNestedValue(translations, key);

    // Fallback to key if translation not found
    if (translation === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
    }

    // Handle replacements like Laravel's trans() function
    if (typeof translation === 'string' && Object.keys(replacements).length > 0) {
        Object.keys(replacements).forEach(placeholder => {
            const regex = new RegExp(`:${placeholder}|\\{\\{${placeholder}\\}\\}`, 'g');
            translation = translation.replace(regex, replacements[placeholder]);
        });
    }

    return translation;
};

// Function to change locale
export const setLocale = (locale) => {
    loadTranslations(locale);
};

// Initialize translations with default locale
loadTranslations();

// Make __ function globally available
if (typeof window !== 'undefined') {
    window.__ = __;
    window.setLocale = setLocale;
}

export default __;