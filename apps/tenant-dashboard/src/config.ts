// API Configuration
export const API_CONFIG = {
  // Railway Backend API (all tenant API calls go through here)
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'https://simplechat-saas-production.up.railway.app',

  // Stats API URL - NOW PROXIED through backend API (no direct stats backend access)
  // Backend handles server-to-server communication with stats backend
  STATS_API_URL: import.meta.env.VITE_STATS_API_URL || 'https://simplechat-saas-production.up.railway.app',

  // Stats Backend (only for Socket.io connection - real-time updates)
  STATS_SOCKET_URL: import.meta.env.VITE_STATS_SOCKET_URL || 'https://stats.simplechat.bot',
} as const;

export default API_CONFIG;
