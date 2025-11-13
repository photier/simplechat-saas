import { useTranslation as useI18nTranslation } from 'react-i18next';

/**
 * Custom hook for translations with typed namespaces
 * Usage:
 *   const { t } = useTranslation('dashboard');
 *   const { t: tCommon } = useTranslation('common');
 */
export const useTranslation = (ns?: 'dashboard' | 'common') => {
  return useI18nTranslation(ns);
};

export default useTranslation;
