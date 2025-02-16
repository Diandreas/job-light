import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from '../locales/en.json';
import fr from '../locales/fr.json';

const resources = {
    en: { translation: en },
    fr: { translation: fr }
};


i18n
    .use(LanguageDetector)  // Ajoute la détection de langue
    .use(initReactI18next)
    // @ts-ignore
    .init({
        resources,
        fallbackLng: "en",
        detection: {
            order: ['localStorage', 'navigator'],
            lookupLocalStorage: 'i18nextLng',
            caches: ['localStorage'],
            checkWhitelist: true
        },
        interpolation: {
            escapeValue: false
        },
        react: {
            useSuspense: false
        }
    });

export default i18n;
