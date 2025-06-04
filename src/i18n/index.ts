import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import de from './locales/de.json';

// Initialisiere i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en,
      de,
    },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    react: {
      useSuspense: true,
    },
    interpolation: {
      escapeValue: false,
    },
  });

// Funktion zum Ändern der Sprache
export const changeLanguage = (lng: string) => {
  return i18n.changeLanguage(lng);
};

// Aktuelle Sprache abrufen
export const getCurrentLanguage = (): string => {
  return i18n.language;
};

export default i18n;