import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '../../../config';

export interface StatsData {
  // Hero cards
  onlineNow: number;
  onlineWeb: number;
  onlinePremium: number;
  totalOpens: number;
  normalOpens: number;
  premiumOpens: number;
  conversionRate: string;

  // Middle cards
  totalSessions: number;
  totalUsers: number;
  webUniqueUsers: number;
  premiumUniqueUsers: number;
  todayActive: number;
  totalMessages: number;

  // Channel distribution
  aiHandledSessions: number;
  humanHandledSessions: number;

  // Analytics
  avgSessionDuration: string;
  minSessionDuration: string;
  maxSessionDuration: string;
  avgMessagesPerSession: string;
  countryDistribution: { country: string; count: number }[];
  hourlyActivity: number[];
  weeklyHeatmap: number[][]; // 7 days x 24 hours
  monthlyMessages: { labels: string[]; values: number[] }; // Last 30 days

  // AI Success
  aiSuccessRate: number;
  aiSuccessCount: number;
  humanEscalationCount: number;
  totalConversations: number;
}

export const useStats = () => {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async (isInitialLoad = false) => {
      try {
        // Only show loading on initial load, not on real-time updates
        if (isInitialLoad) {
          setLoading(true);
        }

        // Fetch tenant stats from backend API (combines normal + premium)
        const [normalResponse, premiumResponse] = await Promise.all([
          fetch(`${API_CONFIG.STATS_API_URL}/api/stats?premium=false`, {
            credentials: 'include', // Send HttpOnly cookie with JWT token
          }),
          fetch(`${API_CONFIG.STATS_API_URL}/api/stats?premium=true`, {
            credentials: 'include',
          }),
        ]);

        if (!normalResponse.ok || !premiumResponse.ok) {
          throw new Error('Failed to fetch stats');
        }

        const normalData = await normalResponse.json();
        const premiumData = await premiumResponse.json();

        // Combine normal and premium data
        const apiData = {
          onlineUsers: {
            total: (normalData.onlineUsers?.total || 0) + (premiumData.onlineUsers?.total || 0),
            web: normalData.onlineUsers?.total || 0,
            premium: premiumData.onlineUsers?.total || 0,
          },
          widgetOpens: {
            total: (normalData.widgetOpens?.total || 0) + (premiumData.widgetOpens?.total || 0),
            normal: normalData.widgetOpens?.total || 0,
            premium: premiumData.widgetOpens?.total || 0,
          },
          totalUsers: (normalData.totalUsers || 0) + (premiumData.totalUsers || 0),
          totalMessages: (normalData.totalMessages || 0) + (premiumData.totalMessages || 0),
          aiHandled: (normalData.aiHandled || 0) + (premiumData.aiHandled || 0),
          humanHandled: (normalData.humanHandled || 0) + (premiumData.humanHandled || 0),
          allSessionsForStats: [
            ...(normalData.allSessionsForStats || []),
            ...(premiumData.allSessionsForStats || []),
          ],
          users: [
            ...(normalData.users || []),
            ...(premiumData.users || []),
          ],
          recentUsers: [
            ...(normalData.recentUsers || []),
            ...(premiumData.recentUsers || []),
          ],
          countries: [...(normalData.countries || []), ...(premiumData.countries || [])],
          heatmapData: normalData.heatmapData || Array.from({ length: 7 }, () => Array(24).fill(0)),
          weeklyMessages: normalData.weeklyMessages || { labels: [], values: [] },
          avgSessionDuration: normalData.avgSessionDuration || '0.0',
          minSessionDuration: normalData.minSessionDuration || '0.0',
          maxSessionDuration: normalData.maxSessionDuration || '0.0',
          avgMessagesPerSession: normalData.avgMessagesPerSession || '0.0',
        };

        // Transform API data to StatsData format
        const transformedData: StatsData = {
          onlineNow: apiData.onlineUsers?.total || 0,
          onlineWeb: apiData.onlineUsers?.web || 0,
          onlinePremium: apiData.onlineUsers?.premium || 0,
          totalOpens: apiData.widgetOpens?.total || 0,
          normalOpens: apiData.widgetOpens?.normal || 0,
          premiumOpens: apiData.widgetOpens?.premium || 0,
          conversionRate: apiData.totalUsers > 0
            ? ((apiData.totalUsers / apiData.widgetOpens?.total) * 100).toFixed(1)
            : '0',
          totalSessions: apiData.allSessionsForStats?.length || 0,
          totalUsers: apiData.totalUsers || 0,
          webUniqueUsers: apiData.users?.filter((u: any) => u.userId?.startsWith('W-')).length || 0,
          premiumUniqueUsers: apiData.users?.filter((u: any) => u.userId?.startsWith('P-')).length || 0,
          todayActive: apiData.recentUsers?.length || 0,
          totalMessages: apiData.totalMessages || 0,
          aiHandledSessions: apiData.aiHandled || 0,
          humanHandledSessions: apiData.humanHandled || 0,
          avgSessionDuration: apiData.avgSessionDuration || '0.0',
          minSessionDuration: apiData.minSessionDuration || '0.0',
          maxSessionDuration: apiData.maxSessionDuration || '0.0',
          avgMessagesPerSession: apiData.avgMessagesPerSession || '0.0',
          countryDistribution: apiData.countries?.map((c: any) => ({
            country: c.code,
            count: c.count
          })) || [],
          hourlyActivity: apiData.heatmapData?.[new Date().getDay()] || Array(24).fill(0),
          weeklyHeatmap: apiData.heatmapData || Array.from({ length: 7 }, () => Array(24).fill(0)),
          monthlyMessages: apiData.weeklyMessages || { labels: [], values: [] },
          aiSuccessRate: apiData.aiHandled > 0
            ? Math.round((apiData.aiHandled / (apiData.aiHandled + apiData.humanHandled)) * 100)
            : 0,
          aiSuccessCount: apiData.aiHandled || 0,
          humanEscalationCount: apiData.humanHandled || 0,
          totalConversations: (apiData.aiHandled || 0) + (apiData.humanHandled || 0),
        };

        setData(transformedData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch stats');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch (with loading indicator)
    fetchData(true);

    // Connect to stats server for real-time updates (use STATS_API_URL like Photier)
    console.log('[useStats] Connecting to stats server:', API_CONFIG.STATS_API_URL);
    const socket = io(API_CONFIG.STATS_API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socket.on('connect', () => {
      console.log('✅ [useStats] Connected to stats server');
      // Refetch data on reconnect to ensure fresh data
      fetchData();
    });

    socket.on('connect_error', (error) => {
      console.error('❌ [useStats] Connection error:', error.message);
    });

    socket.on('stats_update', (data) => {
      console.log('📊 [useStats] Stats update received:', data.type || data.event);

      // Only refetch for events that affect stats numbers
      const eventType = data.type || data.event;
      const shouldRefetch = eventType === 'widget_opened' ||
                           eventType === 'user_online' ||
                           eventType === 'user_offline' ||
                           eventType === 'new_message';

      if (shouldRefetch) {
        // Refetch data after delay to allow database writes to complete
        setTimeout(() => fetchData(), 800);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`⚠️ [useStats] Disconnected: ${reason}`);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 [useStats] Reconnected after ${attemptNumber} attempts`);
      fetchData();
    });

    // Page Visibility API - Refetch when page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && socket.connected) {
        console.log('👁️ [useStats] Page visible again, refreshing data...');
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Also listen to focus event as backup
    const handleFocus = () => {
      if (socket.connected) {
        console.log('🎯 [useStats] Window focused, refreshing data...');
        fetchData();
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      socket.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return { data, loading, error };
};
