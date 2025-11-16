import api from '@/lib/api';

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  country?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SetSubdomainData {
  companyName: string;
}

export const authService = {
  async register(data: RegisterData) {
    const response = await api.post('/auth/register', data);
    // Backend sets HttpOnly cookie automatically
    // No need to manually store token in localStorage anymore
    return response.data;
  },

  async verifyEmail(token: string) {
    const response = await api.get(`/auth/verify-email?token=${token}`);
    return response.data;
  },

  async setSubdomain(data: SetSubdomainData) {
    const response = await api.post('/auth/set-subdomain', data);
    // Backend sets HttpOnly cookie automatically
    return response.data;
  },

  async login(data: LoginData) {
    const response = await api.post('/auth/login', data);
    // Backend sets HttpOnly cookie automatically
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async logout() {
    // Call backend to clear HttpOnly cookie
    await api.post('/auth/logout');

    // Clear any localStorage tokens (fallback for legacy auth)
    localStorage.removeItem('auth_token');
    localStorage.clear(); // Clear all localStorage to ensure clean logout

    // Force redirect to login page
    window.location.href = '/login';
  },

  async forgotPassword(email: string) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token: string, password: string) {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  async resendVerification(email: string) {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },

  async updateProfile(fullName: string) {
    const response = await api.patch('/auth/profile', { fullName });
    return response.data;
  },

  async updatePreferences(preferences: {
    language?: string;
    timezone?: string;
    dateFormat?: string;
    sidebarPosition?: string;
    dataRetention?: number;
  }) {
    const response = await api.patch('/auth/preferences', preferences);
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};
