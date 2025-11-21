import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { RTL_LANGUAGES } from './i18n/constants';

// Import translation files
import enDashboard from './locales/en/dashboard.json';
import trDashboard from './locales/tr/dashboard.json';
import deDashboard from './locales/de/dashboard.json';
import frDashboard from './locales/fr/dashboard.json';
import esDashboard from './locales/es/dashboard.json';
import arDashboard from './locales/ar/dashboard.json';
import ruDashboard from './locales/ru/dashboard.json';

import enCommon from './locales/en/common.json';
import trCommon from './locales/tr/common.json';
import deCommon from './locales/de/common.json';
import frCommon from './locales/fr/common.json';
import esCommon from './locales/es/common.json';
import arCommon from './locales/ar/common.json';
import ruCommon from './locales/ru/common.json';

import enSettings from './locales/en/settings.json';
import trSettings from './locales/tr/settings.json';
import deSettings from './locales/de/settings.json';
import frSettings from './locales/fr/settings.json';
import esSettings from './locales/es/settings.json';
import arSettings from './locales/ar/settings.json';
import ruSettings from './locales/ru/settings.json';

import enAuth from './locales/en/auth.json';
import trAuth from './locales/tr/auth.json';
import deAuth from './locales/de/auth.json';
import frAuth from './locales/fr/auth.json';
import esAuth from './locales/es/auth.json';
import arAuth from './locales/ar/auth.json';
import ruAuth from './locales/ru/auth.json';

import enPayment from './locales/en/payment.json';
import trPayment from './locales/tr/payment.json';
import dePayment from './locales/de/payment.json';
import frPayment from './locales/fr/payment.json';
import esPayment from './locales/es/payment.json';
import arPayment from './locales/ar/payment.json';
import ruPayment from './locales/ru/payment.json';

import enErrors from './locales/en/errors.json';
import trErrors from './locales/tr/errors.json';
import deErrors from './locales/de/errors.json';
import frErrors from './locales/fr/errors.json';
import esErrors from './locales/es/errors.json';
import arErrors from './locales/ar/errors.json';
import ruErrors from './locales/ru/errors.json';

import enValidation from './locales/en/validation.json';
import trValidation from './locales/tr/validation.json';
import deValidation from './locales/de/validation.json';
import frValidation from './locales/fr/validation.json';
import esValidation from './locales/es/validation.json';
import arValidation from './locales/ar/validation.json';
import ruValidation from './locales/ru/validation.json';

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
        settings: enSettings,
        auth: enAuth,
        payment: enPayment,
        errors: enErrors,
        validation: enValidation,
      },
      tr: {
        dashboard: trDashboard,
        common: trCommon,
        settings: trSettings,
        auth: trAuth,
        payment: trPayment,
        errors: trErrors,
        validation: trValidation,
      },
      de: {
        dashboard: deDashboard,
        common: deCommon,
        settings: deSettings,
        auth: deAuth,
        payment: dePayment,
        errors: deErrors,
        validation: deValidation,
      },
      fr: {
        dashboard: frDashboard,
        common: frCommon,
        settings: frSettings,
        auth: frAuth,
        payment: frPayment,
        errors: frErrors,
        validation: frValidation,
      },
      es: {
        dashboard: esDashboard,
        common: esCommon,
        settings: esSettings,
        auth: esAuth,
        payment: esPayment,
        errors: esErrors,
        validation: esValidation,
      },
      ar: {
        dashboard: arDashboard,
        common: arCommon,
        settings: arSettings,
        auth: arAuth,
        payment: arPayment,
        errors: arErrors,
        validation: arValidation,
      },
      ru: {
        dashboard: ruDashboard,
        common: ruCommon,
        settings: ruSettings,
        auth: ruAuth,
        payment: ruPayment,
        errors: ruErrors,
        validation: ruValidation,
      },
    },
    fallbackLng: 'en',
    defaultNS: 'dashboard',
    ns: ['dashboard', 'common', 'settings', 'auth', 'payment', 'errors', 'validation'],

    detection: detectionOptions,

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    react: {
      useSuspense: true,
    },

    debug: import.meta.env.DEV, // Enable debug in development mode

    // Custom missing key handler
    saveMissing: true,
    missingKeyHandler: (lngs, ns, key, fallbackValue) => {
      if (import.meta.env.DEV) {
        console.warn(`Missing translation: ${ns}:${key} for ${lngs.join(', ')}`);
      }
    },
  });

// Handle RTL language switching
i18n.on('languageChanged', (lng) => {
  const dir = RTL_LANGUAGES.includes(lng as any) ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lng);
});

export default i18n;
