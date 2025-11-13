import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';

/**
 * Date formatting utilities with i18n support
 */

// Get date-fns locale based on current language
export const getDateLocale = (language: string) => {
  switch (language) {
    case 'tr':
      return tr;
    default:
      return enUS;
  }
};

/**
 * Format date to "DD.MM.YYYY HH:MM:SS" (Turkish format)
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd.MM.yyyy HH:mm:ss');
};

/**
 * Format date to "DD.MM.YYYY"
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd.MM.yyyy');
};

/**
 * Format time to "HH:MM:SS"
 * @param date - Date string or Date object
 * @returns Formatted time string
 */
export const formatTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'HH:mm:ss');
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param date - Date string or Date object
 * @param language - Current language code
 * @returns Relative time string
 */
export const formatRelativeTime = (date: string | Date, language = 'en'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const locale = getDateLocale(language);

  return formatDistanceToNow(dateObj, {
    addSuffix: true,
    locale,
  });
};

/**
 * Format date for charts (e.g., "Jan 15")
 * @param date - Date string or Date object
 * @returns Short formatted date
 */
export const formatChartDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd');
};

/**
 * Check if date is today
 * @param date - Date string or Date object
 * @returns True if date is today
 */
export const isToday = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

/**
 * Get hour from date (0-23)
 * @param date - Date string or Date object
 * @returns Hour number
 */
export const getHour = (date: string | Date): number => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj.getHours();
};

/**
 * Get day of week (0-6, Sunday-Saturday)
 * @param date - Date string or Date object
 * @returns Day of week number
 */
export const getDayOfWeek = (date: string | Date): number => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj.getDay();
};
