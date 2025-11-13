import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enDashboard from './locales/en/dashboard.json';
import trDashboard from './locales/tr/dashboard.json';
import enCommon from './locales/en/common.json';
import trCommon from './locales/tr/common.json';

// Language detection options
const detectionOptions = {
  order: ['localStorage', 'navigator', 'htmlTag'],
  caches: ['localStorage'],
  lookupLocalStorage: 'i18nextLng',
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        dashboard: enDashboard,
        common: enCommon,
      },
      tr: {
        dashboard: trDashboard,
        common: trCommon,
      },
    },
    fallbackLng: 'en',
    defaultNS: 'dashboard',
    ns: ['dashboard', 'common'],

    detection: detectionOptions,

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    react: {
      useSuspense: true,
    },

    debug: import.meta.env.DEV, // Enable debug in development mode
  });

export default i18n;
