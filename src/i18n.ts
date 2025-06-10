import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import deTranslation from './locales/de.json';
import enTranslation from './locales/en.json';

console.log('DE translations loaded:', deTranslation ? 'yes' : 'no');

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      de: { translation: deTranslation },
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
    initImmediate: false
  });

export default i18n;
