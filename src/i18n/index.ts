import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en';
import de from './locales/de';

// Initialisiere i18next
i18n
  // Erkennt die Browsersprache automatisch
  .use(LanguageDetector)
  // Bindet das React-Framework an
  .use(initReactI18next)
  .init({
    // Verfügbare Übersetzungsressourcen
    resources: {
      en,
      de,
    },
    // Sprache, die verwendet wird, wenn keine gefunden oder festgelegt wurde
    fallbackLng: 'en',
    // Debug-Modus für Entwicklungszwecke
    debug: process.env.NODE_ENV === 'development',
    // Erkennt und speichert die Sprache im Browser-Speicher
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    // React spezifische Optionen
    react: {
      useSuspense: true,
    },
    // Verhindert das Escaping von Werten (für HTML in Übersetzungen)
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