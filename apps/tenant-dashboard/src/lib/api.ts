import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  // ✅ Enable cookies for cross-domain requests (industry standard)
  withCredentials: true,
});

// Add auth token to requests (fallback for URL token method)
api.interceptors.request.use(
  (config) => {
    // Fallback: Check localStorage for token (backwards compatibility)
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Primary: HttpOnly cookie is automatically sent by browser
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear localStorage token (fallback)
      localStorage.removeItem('auth_token');

      // Only redirect to login if not already on login/register/verify pages
      const currentPath = window.location.pathname;
      const authPages = ['/login', '/register', '/setup-subdomain', '/verify-email', '/forgot-password', '/reset-password'];
      if (!authPages.includes(currentPath)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
