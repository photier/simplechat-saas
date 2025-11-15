// API Configuration
export const API_CONFIG = {
  // Railway Backend API (all tenant API calls go through here)
  // MUST use api.simplechat.bot for cookie domain to work (.simplechat.bot)
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'https://api.simplechat.bot',

  // Stats API URL - NOW PROXIED through backend API (no direct stats backend access)
  // Backend handles server-to-server communication with stats backend
  STATS_API_URL: import.meta.env.VITE_STATS_API_URL || 'https://api.simplechat.bot',

  // Stats Backend (only for Socket.io connection - real-time updates)
  STATS_SOCKET_URL: import.meta.env.VITE_STATS_SOCKET_URL || 'https://stats.simplechat.bot',
} as const;

export default API_CONFIG;
// Trigger rebuild Sat Nov 15 13:25:21 +03 2025
