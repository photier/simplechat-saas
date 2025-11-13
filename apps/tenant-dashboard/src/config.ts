// API Configuration
export const API_CONFIG = {
  // Railway Backend API
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'https://simplechat-saas-production.up.railway.app',

  // Legacy Stats API (fallback for now)
  STATS_API_URL: import.meta.env.VITE_STATS_API_URL || 'https://stats.simplechat.bot',
} as const;

export default API_CONFIG;
