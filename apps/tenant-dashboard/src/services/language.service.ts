// Language Service - Backend API integration for language preference persistence

import { API_CONFIG } from '../config';

export const languageService = {
  /**
   * Save language preference to backend
   * @param language - Language code (en, tr, de, fr, es, ar, ru)
   */
  async saveLanguage(language: string): Promise<void> {
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/tenants/language`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Send HttpOnly cookie
      body: JSON.stringify({ language }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to save language' }));
      throw new Error(error.message || 'Failed to save language preference');
    }

    return response.json();
  },

  /**
   * Get current user profile (includes language preference)
   */
  async getProfile(): Promise<{ language: string | null } | null> {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/tenants/profile`, {
        credentials: 'include', // Send HttpOnly cookie
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return {
        language: data.language || null,
      };
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      return null;
    }
  },
};
