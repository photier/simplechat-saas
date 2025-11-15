import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_CONFIG } from '../../../config';
import { useAuth } from '../../../context/AuthContext';

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

// Mock data generator
const generateMockUsers = (channelType: 'web' | 'premium', count: number): User[] => {
  const countries = ['TR', 'US', 'DE', 'GB', 'FR', 'IT', 'ES', 'NL'];
  const cities: Record<string, string[]> = {
    TR: ['Istanbul', 'Ankara', 'Izmir', 'Bursa'],
    US: ['New York', 'Los Angeles', 'Chicago', 'Houston'],
    DE: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt'],
    GB: ['London', 'Manchester', 'Birmingham', 'Leeds'],
    FR: ['Paris', 'Lyon', 'Marseille', 'Toulouse'],
    IT: ['Rome', 'Milan', 'Naples', 'Turin'],
    ES: ['Madrid', 'Barcelona', 'Valencia', 'Seville'],
    NL: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht'],
  };

  const names: Record<string, string[]> = {
    TR: ['Ahmet Yılmaz', 'Mehmet Demir', 'Ayşe Kaya', 'Fatma Çelik', 'Mustafa Aydın', 'Zeynep Şahin', 'Ali Özkan', 'Elif Yıldız'],
    US: ['John Smith', 'Emma Johnson', 'Michael Brown', 'Sarah Davis', 'David Wilson', 'Lisa Anderson', 'James Taylor', 'Jennifer White'],
    DE: ['Hans Mueller', 'Anna Schmidt', 'Peter Fischer', 'Maria Weber', 'Klaus Becker', 'Sophia Wagner', 'Wolfgang Schulz', 'Laura Koch'],
    GB: ['James Wilson', 'Emily Taylor', 'William Brown', 'Olivia Jones', 'Thomas Davies', 'Sophie Evans', 'George Roberts', 'Charlotte Smith'],
    FR: ['Pierre Martin', 'Marie Bernard', 'Jean Dubois', 'Sophie Laurent', 'Paul Simon', 'Julie Moreau', 'Antoine Petit', 'Camille Roux'],
    IT: ['Marco Rossi', 'Giulia Bianchi', 'Luca Romano', 'Francesca Russo', 'Andrea Ferrari', 'Valentina Colombo', 'Matteo Ricci', 'Chiara Marino'],
    ES: ['Carlos Garcia', 'Maria Rodriguez', 'Antonio Martinez', 'Carmen Lopez', 'Jose Gonzalez', 'Isabel Sanchez', 'Francisco Perez', 'Ana Fernandez'],
    NL: ['Jan de Vries', 'Emma van Dijk', 'Peter Jansen', 'Sophie Bakker', 'Pieter Visser', 'Laura Smit', 'Thomas Meijer', 'Anna de Boer'],
  };

  const prefix = channelType === 'web' ? 'W-' : 'P-';

  return Array.from({ length: count }, (_, i) => {
    const country = countries[Math.floor(Math.random() * countries.length)];
    const cityList = cities[country] || ['Unknown'];
    const city = cityList[Math.floor(Math.random() * cityList.length)];
    const nameList = names[country] || ['Guest User'];
    const name = nameList[Math.floor(Math.random() * nameList.length)];
    const isOnline = Math.random() > 0.7;

    // Generate realistic timestamps
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const lastActive = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000);

    return {
      userId: `${prefix}Guest-${(i + 1).toString().padStart(6, '0')}`,
      name,
      messages: Math.floor(Math.random() * 150) + 5,
      lastActive: lastActive.toISOString(),
      country,
      city,
      isOnline,
      avgSessionDuration: Math.random() * 15 + 2, // 2-17 minutes
    };
  });
};

export const useUsers = (channelType: 'web' | 'premium'): UseUsersResult => {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const fetchUsers = async (showLoading = false) => {
      try {
        // Only show loading spinner on initial mount
        if (showLoading) {
          setLoading(true);
        }

        // Fetch real data from API
        const premium = channelType === 'premium';
        // Add tenantId for SaaS isolation (if authUser is available)
        const tenantId = authUser?.id || '';

        // DEBUG: Log tenant info
        console.log('[useUsers] fetchUsers called:', {
          channelType,
          authUser: authUser ? { id: authUser.id, email: authUser.email } : null,
          tenantId: tenantId || 'MISSING',
          willUseSaasSchema: !!tenantId
        });

        const apiUrl = tenantId
          ? `${API_CONFIG.STATS_API_URL}/api/stats?premium=${premium}&tenantId=${tenantId}`
          : `${API_CONFIG.STATS_API_URL}/api/stats?premium=${premium}`;

        const response = await fetch(apiUrl);

        if (!response.ok) throw new Error('Failed to fetch users');

        const data = await response.json();

        // Transform API data to User format
        // Web uses 'recentUsers', Premium uses 'users'
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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
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
    }

    // Connect to stats server (not widget servers!)
    // Stats server already listens to both widget servers and broadcasts events
    const socket = io(API_CONFIG.STATS_API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socket.on('connect', () => {
      console.log(`✅ [useUsers ${channelType}] Connected to stats server`);
    });

    socket.on('connect_error', (error) => {
      console.error(`❌ [useUsers ${channelType}] Connection error:`, error.message);
    });

    socket.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 [useUsers ${channelType}] Reconnection attempt #${attempt}`);
    });

    socket.on('reconnect', (attempt) => {
      console.log(`✅ [useUsers ${channelType}] Reconnected after ${attempt} attempts`);
      fetchUsers(false); // Silent refresh after reconnection
    });

    socket.on('reconnect_failed', () => {
      console.error(`❌ [useUsers ${channelType}] Reconnection failed after all attempts`);
    });

    socket.on('stats_update', (data) => {
      console.log(`📊 [useUsers ${channelType}] Stats update received:`, data.type || data.event);

      // Only refetch for events that affect user list/status
      const eventType = data.type || data.event;
      const shouldRefetch = eventType === 'user_online' ||
                           eventType === 'user_offline' ||
                           eventType === 'widget_opened' ||
                           eventType === 'new_message';

      if (shouldRefetch) {
        console.log(`🔄 [useUsers ${channelType}] Refetching users for event: ${eventType}`);

        // Wait 800ms for N8N to write to database
        setTimeout(() => {
          fetchUsers(false); // Silent fetch - no loading spinner
        }, 800);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`⚠️ [useUsers ${channelType}] Disconnected: ${reason}`);
      if (reason === 'io server disconnect') {
        // Server forced disconnect, manually reconnect
        socket.connect();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [channelType]);

  return { users, loading, error };
};
