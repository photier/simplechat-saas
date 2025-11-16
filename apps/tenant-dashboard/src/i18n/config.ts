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
  // Pass i18n instance to react-i18next (NO language detector - we use backend)
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    defaultNS: 'common',
    fallbackLng: 'en', // Default to English
    lng: 'en', // Default language (will be overridden by backend user.language)

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Namespace separation
    ns: ['common', 'dashboard'],

    // React specific options
    react: {
      useSuspense: false,
    },

    // Production-grade: Language comes from backend, not localStorage
    // AuthContext syncs user.language → i18n.changeLanguage()
  });

export default i18n;
