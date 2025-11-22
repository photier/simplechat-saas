import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Translations = {
  [key: string]: any;
};

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, namespace?: string) => string;
  translations: Translations;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const SUPPORTED_LANGUAGES = ['en', 'tr', 'de', 'fr', 'es', 'ar', 'ru'];
const DEFAULT_LANGUAGE = 'en';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(DEFAULT_LANGUAGE);
  const [translations, setTranslations] = useState<Translations>({});

  // Load translations for current language
  const loadTranslations = async (lang: string) => {
    try {
      const namespaces = ['common', 'home', 'pricing', 'features', 'contact', 'about'];
      const loadedTranslations: Translations = {};

      for (const ns of namespaces) {
        try {
          const response = await fetch(`/locales/${lang}/${ns}.json`);
          if (response.ok) {
            loadedTranslations[ns] = await response.json();
          }
        } catch (error) {
          console.warn(`Failed to load ${lang}/${ns}.json`);
        }
      }

      setTranslations(loadedTranslations);
    } catch (error) {
      console.error('Failed to load translations:', error);
    }
  };

  // Initialize language from localStorage or browser
  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    const browserLang = navigator.language.split('-')[0];
    const initialLang = savedLang ||
                        (SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : DEFAULT_LANGUAGE);

    setLanguageState(initialLang);
    loadTranslations(initialLang);
  }, []);

  // Change language
  const setLanguage = (lang: string) => {
    if (SUPPORTED_LANGUAGES.includes(lang)) {
      setLanguageState(lang);
      localStorage.setItem('language', lang);
      loadTranslations(lang);

      // Update HTML lang attribute
      document.documentElement.lang = lang;

      // Update dir for RTL languages
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  };

  // Translation function
  const t = (key: string, namespace: string = 'common'): string => {
    const keys = key.split('.');
    let value: any = translations[namespace];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

// Hook for translations with namespace
export const useTranslation = (namespace: string = 'common') => {
  const { t, language } = useLanguage();

  return {
    t: (key: string) => t(key, namespace),
    language,
  };
};
