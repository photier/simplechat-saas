// API Configuration
export const API_CONFIG = {
  // Railway Backend API (tenant authentication, bot management)
  // MUST use api.simplechat.bot for cookie domain to work (.simplechat.bot)
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'https://simplechat-saas-production.up.railway.app',

  // Stats Backend (direct access for stats data + Socket.io real-time updates)
  // Use Railway internal URL for better WebSocket reliability
  STATS_API_URL: import.meta.env.VITE_STATS_API_URL || 'https://stats-production-e4d8.up.railway.app',
} as const;

export default API_CONFIG;
// Trigger rebuild Sun Nov 17 20:49:00 +03 2025 - Socket.io real-time stats
