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

        // TODO: Tenant-specific API integration
        // For now, return empty/zero data for new tenants
        const apiData = {
          onlineUsers: { total: 0, web: 0, premium: 0 },
          widgetOpens: { total: 0, normal: 0, premium: 0 },
          totalUsers: 0,
          totalMessages: 0,
          aiHandled: 0,
          humanHandled: 0,
          allSessionsForStats: [],
          users: [],
          recentUsers: [],
          countries: [],
          heatmapData: Array.from({ length: 7 }, () => Array(24).fill(0)),
          weeklyMessages: { labels: [], values: [] },
          avgSessionDuration: '0.0',
          minSessionDuration: '0.0',
          maxSessionDuration: '0.0',
          avgMessagesPerSession: '0.0',
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

    // TODO: Socket.io integration for tenant-specific real-time updates
    // Disabled for now until tenant API is ready

    return () => {
      // Cleanup
    };
  }, []);

  return { data, loading, error };
};
