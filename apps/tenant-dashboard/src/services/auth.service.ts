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
    return response.data;
  },

  async verifyEmail(token: string) {
    const response = await api.get(`/auth/verify-email?token=${token}`);
    return response.data;
  },

  async setSubdomain(data: SetSubdomainData) {
    const response = await api.post('/auth/set-subdomain', data);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },

  async login(data: LoginData) {
    const response = await api.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  },
};
