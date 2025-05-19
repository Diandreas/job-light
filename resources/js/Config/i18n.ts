import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from '../locales/en.json';
import fr from '../locales/fr.json';

const resources = {
    en: { translation: en },
    fr: { translation: fr }
};

// List of supported languages
const supportedLanguages = ['en', 'fr'];

// Function to determine the closest language match
const findClosestLanguage = (detectedLang) => {
    // If the detected language is already one of our supported languages, return it
    if (supportedLanguages.includes(detectedLang)) {
        return detectedLang;
    }
    
    // If detected language starts with 'fr', use French
    if (detectedLang.startsWith('fr')) {
        return 'fr';
    }
    
    // For any language starting with 'en', use English
    if (detectedLang.startsWith('en')) {
        return 'en';
    }
    
    // For languages that might be variants of French (e.g., fr-CA, fr-BE)
    for (const langCode of supportedLanguages) {
        if (detectedLang.toLowerCase().startsWith(langCode.toLowerCase())) {
            return langCode;
        }
    }
    
    // Default to English for all other languages
    return 'en';
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    // @ts-ignore
    .init({
        resources,
        fallbackLng: "en",
        supportedLngs: supportedLanguages,
        detection: {
            order: ['localStorage', 'navigator'],
            lookupLocalStorage: 'i18nextLng',
            caches: ['localStorage'],
            checkWhitelist: true
        },
        load: 'languageOnly', // Strip region code, e.g., convert 'en-US' to 'en'
        interpolation: {
            escapeValue: false
        },
        react: {
            useSuspense: false
        }
    });

// Custom language detector behavior
const originalDetect = i18n.services.languageDetector.detect;
i18n.services.languageDetector.detect = () => {
    const detectedLang = originalDetect();
    return findClosestLanguage(detectedLang);
};

export default i18n;
