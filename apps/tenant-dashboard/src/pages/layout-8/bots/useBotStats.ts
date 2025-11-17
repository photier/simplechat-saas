import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '../../../config';

export interface StatsData {
  // Bot info
  bot?: {
    id: string;
    name: string;
    chatId: string;
    type: 'BASIC' | 'PREMIUM';
  };

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

export const useBotStats = (botId: string) => {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null); // Track bot's chatId for filtering

  useEffect(() => {
    const fetchData = async (isInitialLoad = false) => {
      try {
        // Only show loading on initial load, not on real-time updates
        if (isInitialLoad) {
          setLoading(true);
        }

        // Fetch bot info and stats
        const [botResponse, normalResponse, premiumResponse] = await Promise.all([
          fetch(`${API_CONFIG.API_URL}/chatbots/${botId}`, {
            credentials: 'include', // Send HttpOnly cookie with JWT token
          }),
          fetch(`${API_CONFIG.STATS_API_URL}/api/stats?premium=false&chatbotId=${botId}`, {
            credentials: 'include',
          }),
          fetch(`${API_CONFIG.STATS_API_URL}/api/stats?premium=true&chatbotId=${botId}`, {
            credentials: 'include',
          }),
        ]);

        if (!botResponse.ok || !normalResponse.ok || !premiumResponse.ok) {
          throw new Error('Failed to fetch stats');
        }

        const botData = await botResponse.json();
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
          bot: {
            id: botData.id,
            name: botData.name,
            chatId: botData.chatId,
            type: botData.type,
          },
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
        setChatId(botData.chatId); // Store chatId for Socket.io filtering
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

    // Socket.io real-time updates
    console.log('[useBotStats] Connecting to stats server:', API_CONFIG.STATS_SOCKET_URL);
    const socket: Socket = io(API_CONFIG.STATS_SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    });

    socket.on('connect', () => {
      console.log('[useBotStats] ✅ Socket.io connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('[useBotStats] ❌ Socket.io disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('[useBotStats] ❌ Socket.io connection error:', error);
    });

    // Listen for real-time stats updates
    socket.on('stats_update', (event: any) => {
      console.log('[useBotStats] 📊 Stats update received:', event);
      console.log('[useBotStats] 🔍 Filtering - Event chatId:', event.chatId, 'My chatId:', chatId);

      // Filter events for this specific bot (use chatId not botId!)
      if (event.chatId && chatId && event.chatId !== chatId) {
        console.log('[useBotStats] ⏭️ Skipping event for different bot');
        return;
      }

      // If no chatId in event or not loaded yet, skip
      if (!chatId) {
        console.log('[useBotStats] ⏭️ ChatId not loaded yet, skipping event');
        return;
      }

      // Invalidate cache and refetch data (800ms delay for N8N database writes)
      console.log('[useBotStats] 🔄 Refreshing stats after event:', event.type);
      setTimeout(() => {
        fetchData(false); // false = no loading indicator
      }, 800);
    });

    return () => {
      console.log('[useBotStats] 🔌 Disconnecting socket');
      socket.disconnect();
    };
  }, [botId]);

  return { data, loading, error };
};
