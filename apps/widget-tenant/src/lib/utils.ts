import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parse markdown-like syntax in messages
 */
export function parseMarkdown(text: string): string {
  if (!text || text.trim().length === 0) return '';

  const lines = text.split('\n');
  let html = '';
  let inList = false;

  lines.forEach((line) => {
    if (line.trim().match(/^[-*]\s/)) {
      if (!inList) {
        html += '<ul class="list-disc pl-4 my-2">';
        inList = true;
      }
      let listItem = line.trim().replace(/^[-*]\s/, '');
      listItem = listItem
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code style="background: rgba(0,0,0,0.1); padding: 2px 6px; border-radius: 4px; font-size: 0.9em;">$1</code>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="text-decoration: underline; font-weight: 500;">$1</a>');
      html += '<li>' + listItem + '</li>';
    } else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      if (line.trim()) {
        let parsed = line
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`(.*?)`/g, '<code style="background: rgba(0,0,0,0.1); padding: 2px 6px; border-radius: 4px; font-size: 0.9em;">$1</code>')
          .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="text-decoration: underline; font-weight: 500;">$1</a>');
        html += parsed + '<br />';
      } else {
        html += '<br />';
      }
    }
  });

  if (inList) {
    html += '</ul>';
  }

  return html;
}

/**
 * Format date/time
 */
export function formatTime(date: Date | string): string {
  // Convert to Date if string
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if valid date
  if (!dateObj || isNaN(dateObj.getTime())) {
    return '';
  }

  const now = new Date();
  const dayInMillis = 60 * 60 * 24 * 1000;

  if (now.getTime() - dateObj.getTime() < dayInMillis) {
    // Today: Show HH:MM
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } else {
    // Older: Show M/D/YY HH:MM
    const month = (dateObj.getMonth() + 1).toString();
    const day = dateObj.getDate().toString();
    const year = dateObj.getFullYear().toString().slice(-2);
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${month}/${day}/${year} ${hours}:${minutes}`;
  }
}

/**
 * Cookie utilities
 */
export const cookieUtils = {
  set: (name: string, value: string, days: number) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = '; expires=' + date.toUTCString();
    document.cookie = name + '=' + value + expires + '; path=/';
  },

  get: (name: string): string | null => {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  delete: (name: string) => {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  },
};

/**
 * LocalStorage utilities with type safety
 */
export const storageUtils = {
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to set localStorage:', e);
    }
  },

  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Failed to get localStorage:', e);
      return null;
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Failed to remove localStorage:', e);
    }
  },
};

/**
 * Detect mobile device
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Check if current time is within working hours
 * @param workingHours - Working hours configuration from bot settings
 * @returns true if within working hours or disabled, false otherwise
 */
export function isWithinWorkingHours(workingHours?: {
  enabled: boolean;
  timezone: string;
  startTime: string;
  endTime: string;
}): boolean {
  // If working hours not enabled, always return true
  if (!workingHours || !workingHours.enabled) {
    return true;
  }

  try {
    // Get current time in bot's timezone
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: workingHours.timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const timeStr = formatter.format(now); // Returns "HH:MM"
    const [currentHour, currentMinute] = timeStr.split(':').map(Number);
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    // Parse start and end times
    const [startHour, startMinute] = workingHours.startTime.split(':').map(Number);
    const startTimeMinutes = startHour * 60 + startMinute;

    const [endHour, endMinute] = workingHours.endTime.split(':').map(Number);
    const endTimeMinutes = endHour * 60 + endMinute;

    // Check if current time is within range
    if (startTimeMinutes <= endTimeMinutes) {
      // Normal case: start time before end time (e.g., 09:00 - 18:00)
      return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes;
    } else {
      // Edge case: crosses midnight (e.g., 22:00 - 02:00)
      return currentTimeMinutes >= startTimeMinutes || currentTimeMinutes <= endTimeMinutes;
    }
  } catch (error) {
    console.error('[Working Hours] Error checking working hours:', error);
    // On error, allow access (fail open)
    return true;
  }
}

/**
 * Get outside working hours message
 * @param workingHours - Working hours configuration
 * @returns Formatted message for display
 */
export function getOutsideWorkingHoursMessage(workingHours?: {
  enabled: boolean;
  timezone: string;
  startTime: string;
  endTime: string;
}): string {
  if (!workingHours || !workingHours.enabled) {
    return '';
  }

  return `We're currently offline. Our working hours are ${workingHours.startTime} - ${workingHours.endTime} (${workingHours.timezone}). Please leave a message and we'll get back to you!`;
}
