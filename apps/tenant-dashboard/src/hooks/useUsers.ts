import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '@/lib/api';

export interface User {
  userId: string;
  name: string;
  messages: number;
  lastActive: string;
  country: string;
  city: string;
  isOnline: boolean;
  avgSessionDuration: number; // minutes
  serviceType: 'ai' | 'human'; // AI Bot or Live Support
}

interface UseUsersResult {
  users: User[];
  loading: boolean;
  error: string | null;
}

// Use production stats URL, fallback to localhost for dev
const STATS_API_URL = import.meta.env.VITE_STATS_API_URL ||
  (import.meta.env.PROD ? 'https://stats-production-e4d8.up.railway.app' : 'http://localhost:3002');

export const useUsers = (chatbotId: string, botType: 'BASIC' | 'PREMIUM'): UseUsersResult => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const fetchUsers = async (showLoading = false) => {
      // Don't fetch if chatbotId is empty
      if (!chatbotId) {
        console.log('[useUsers] Skipping fetch - chatbotId is empty');
        setUsers([]);
        setLoading(false);
        return;
      }

      try {
        // Only show loading spinner on initial mount
        if (showLoading) {
          setLoading(true);
        }

        // Fetch real data from backend API (which proxies to stats backend)
        const premium = botType === 'PREMIUM';
        console.log('[useUsers] Fetching users for chatbotId:', chatbotId, 'premium:', premium);
        const response = await api.get(`/api/stats?premium=${premium}&chatbotId=${chatbotId}`);

        const data = response.data;

        // Transform API data to User format
        const usersList = data.users || data.recentUsers || [];
        const transformedUsers: User[] = usersList.map((user: any) => ({
          userId: user.userId,
          name: user.userName || 'Anonim',
          messages: user.messageCount || 0,
          lastActive: user.lastActivity,
          country: user.country || '',
          city: user.city || '',
          isOnline: user.isOnline || false,
          avgSessionDuration: Math.floor((user.messageCount || 0) * 2.5), // Estimate
          serviceType: user.isHumanMode ? 'human' : 'ai', // AI Bot or Live Support
        }));

        setUsers(transformedUsers);
        setError(null);
      } catch (err: any) {
        console.error('[useUsers] Error fetching users:', err);
        setError(err.response?.data?.message || err.message || 'An error occurred');
        setUsers([]);
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    };

    // Initial fetch - show loading spinner
    if (isInitialMount.current) {
      fetchUsers(true);
      isInitialMount.current = false;
    } else if (chatbotId) {
      // Fetch when chatbotId changes (bot loaded)
      fetchUsers(false);
    }

    // Don't connect WebSocket if chatbotId is empty
    if (!chatbotId) {
      return;
    }

    // Connect to stats server for real-time updates
    const socket = io(STATS_API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socket.on('connect', () => {
      console.log(`✅ [useUsers ${chatbotId}] Connected to stats server`);
    });

    socket.on('connect_error', (error) => {
      console.error(`❌ [useUsers ${chatbotId}] Connection error:`, error.message);
    });

    socket.on('reconnect', (attempt) => {
      console.log(`✅ [useUsers ${chatbotId}] Reconnected after ${attempt} attempts`);
      fetchUsers(false); // Silent refresh after reconnection
    });

    socket.on('stats_update', (data) => {
      console.log(`📊 [useUsers ${chatbotId}] Stats update received:`, data.type || data.event);

      // Only refetch for events that affect user list/status
      const eventType = data.type || data.event;
      const shouldRefetch = eventType === 'user_online' ||
                           eventType === 'user_offline' ||
                           eventType === 'widget_opened' ||
                           eventType === 'new_message';

      if (shouldRefetch) {
        console.log(`🔄 [useUsers ${chatbotId}] Refetching users for event: ${eventType}`);

        // Wait 800ms for N8N to write to database
        setTimeout(() => {
          fetchUsers(false); // Silent fetch - no loading spinner
        }, 800);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`⚠️ [useUsers ${chatbotId}] Disconnected: ${reason}`);
      if (reason === 'io server disconnect') {
        // Server forced disconnect, manually reconnect
        socket.connect();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [chatbotId, botType]);

  return { users, loading, error };
};
