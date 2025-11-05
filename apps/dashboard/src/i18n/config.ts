import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import commonTr from '@/locales/tr/common.json';
import dashboardTr from '@/locales/tr/dashboard.json';
import commonEn from '@/locales/en/common.json';
import dashboardEn from '@/locales/en/dashboard.json';

// Translation resources
const resources = {
  tr: {
    common: commonTr,
    dashboard: dashboardTr,
  },
  en: {
    common: commonEn,
    dashboard: dashboardEn,
  },
} as const;

i18n
  // Language detector - checks localStorage, browser language
  .use(LanguageDetector)
  // Pass i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    defaultNS: 'common',
    fallbackLng: 'tr',
    lng: 'tr', // Default language

    detection: {
      // Order of language detection
      order: ['localStorage', 'navigator'],
      // Keys to use for localStorage
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Namespace separation
    ns: ['common', 'dashboard'],

    // React specific options
    react: {
      useSuspense: false,
    },
  });

export default i18n;
