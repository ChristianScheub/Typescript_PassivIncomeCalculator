import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Direkte Übersetzungsimporte
import deTranslation from './locales/de.json';
import enTranslation from './locales/en.json';

// Konsole zur Überprüfung der Übersetzungen
console.log('DE translations loaded:', deTranslation ? 'yes' : 'no');
console.log('Assets translations sample:', deTranslation?.assets?.addTransaction, deTranslation?.assets?.monthlyIncome);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Ressourcen mit Übersetzungen
    resources: {
      en: { translation: enTranslation },
      de: { translation: deTranslation },
      // Auch für de-DE die gleichen Übersetzungen verwenden
      'de-DE': { translation: deTranslation }
    },
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    load: 'currentOnly', // Nur die spezifische Sprache laden (kein Fallback auf Sprachfamilie)
    // Direktes Laden statt HTTP-Backend
    initImmediate: false
  });

// Stelle sicher, dass die Übersetzungen wirklich verfügbar sind
console.log('Translation test:', i18n.t('assets.addTransaction'), i18n.t('assets.monthlyIncome'));

export default i18n;
