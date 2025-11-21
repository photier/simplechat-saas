// useLocaleFormat Hook - Dynamic date and number formatting based on user's language

import { useTranslation } from 'react-i18next';

// Locale mapping for date/number formatting
const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  tr: 'tr-TR',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
  ar: 'ar-SA',
  ru: 'ru-RU',
};

export function useLocaleFormat() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const locale = LOCALE_MAP[currentLang] || 'en-US';

  /**
   * Format date with user's locale
   * @param date - Date to format
   * @param options - Intl.DateTimeFormatOptions
   */
  const formatDate = (
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions
  ): string => {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      ...options,
    };

    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  };

  /**
   * Format date without time (short date)
   * @param date - Date to format
   */
  const formatDateShort = (date: Date | string | number): string => {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(dateObj);
  };

  /**
   * Format time only
   * @param date - Date to format
   */
  const formatTime = (date: Date | string | number): string => {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  };

  /**
   * Format relative time (e.g., "2 hours ago", "3 days ago")
   * @param date - Date to format
   */
  const formatRelativeTime = (date: Date | string | number): string => {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (diffInSeconds < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else if (diffInSeconds < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }
  };

  /**
   * Format number with user's locale (1,000.00 or 1.000,00)
   * @param value - Number to format
   * @param options - Intl.NumberFormatOptions
   */
  const formatNumber = (
    value: number,
    options?: Intl.NumberFormatOptions
  ): string => {
    return new Intl.NumberFormat(locale, options).format(value);
  };

  /**
   * Format currency
   * @param value - Amount to format
   * @param currency - Currency code (USD, EUR, TRY, etc.)
   */
  const formatCurrency = (value: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);
  };

  /**
   * Format percentage
   * @param value - Percentage value (0.15 = 15%)
   */
  const formatPercentage = (value: number): string => {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  /**
   * Format compact number (1K, 1M, 1B)
   * @param value - Number to format
   */
  const formatCompactNumber = (value: number): string => {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value);
  };

  return {
    locale,
    formatDate,
    formatDateShort,
    formatTime,
    formatRelativeTime,
    formatNumber,
    formatCurrency,
    formatPercentage,
    formatCompactNumber,
  };
}
