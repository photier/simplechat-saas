const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const { io: ioClient } = require('socket.io-client');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3002;

// Socket.io server with CORS enabled
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'https://staging-stats.simplechat.bot',
        'https://stats.simplechat.bot',
        'https://login.simplechat.bot',
        'https://zucchini-manifestation-production-f29f.up.railway.app',
        'https://dashboard-production-a3a5.up.railway.app',
        'https://stats-production-e4d8.up.railway.app'
      ];

      // Allow *.simplechat.bot subdomains (tenant dashboards)
      const subdomainPattern = /^https:\/\/[a-zA-Z0-9-]+\.simplechat\.bot$/;

      if (!origin || allowedOrigins.includes(origin) || subdomainPattern.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  },
  path: '/socket.io',
  transports: ['websocket', 'polling']
});

// PostgreSQL connection
const pool = new Pool({
  host: process.env.PGHOST || process.env.POSTGRES_HOST,
  port: process.env.PGPORT || process.env.POSTGRES_PORT || 5432,
  database: process.env.PGDATABASE || process.env.POSTGRES_DB,
  user: process.env.PGUSER || process.env.POSTGRES_USER,
  password: process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD,
  ssl: (process.env.PGHOST || process.env.POSTGRES_HOST)?.includes('railway') ? {
    rejectUnauthorized: false
  } : false
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ [PostgreSQL] Connected to database');
});

pool.on('error', (err) => {
  console.error('❌ [PostgreSQL] Connection error:', err);
});

// Express CORS middleware for HTTP endpoints
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'https://staging-stats.simplechat.bot',
    'https://stats.simplechat.bot',
    'https://login.simplechat.bot',
    'https://zucchini-manifestation-production-f29f.up.railway.app',
    'https://dashboard-production-a3a5.up.railway.app',
    'https://stats-production-e4d8.up.railway.app'
  ];

  const origin = req.headers.origin;

  // Allow *.simplechat.bot subdomains (tenant dashboards)
  const subdomainPattern = /^https:\/\/[a-zA-Z0-9-]+\.simplechat\.bot$/;

  // DEBUG: Log ALL requests with origin and regex test result
  if (origin) {
    const isAllowed = allowedOrigins.includes(origin);
    const isSubdomain = subdomainPattern.test(origin);
    console.log('[CORS DEBUG]', {
      method: req.method,
      path: req.path,
      origin,
      isAllowed,
      isSubdomain,
      regexMatches: isSubdomain
    });
  }

  if (origin && (allowedOrigins.includes(origin) || subdomainPattern.test(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log('[CORS] ✅ Allowed origin:', origin);
  } else if (origin) {
    console.log('[CORS] ❌ Blocked origin:', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Socket.io connection handler for dashboard clients
io.on('connection', (socket) => {
  console.log('✅ [Socket.io] Dashboard client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ [Socket.io] Dashboard client disconnected:', socket.id);
  });
});

// Broadcast function to send events to all connected dashboards
function broadcastToClients(event, data) {
  io.emit(event, data);
  console.log(`📡 [Socket.io] Broadcast ${event}:`, data);
}

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Session ayırma fonksiyonu - 1 saatlik batch'ler
function splitIntoSessions(messages, oneHour = 1 * 60 * 60 * 1000) {
  if (messages.length === 0) return [];

  const sorted = messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const sessions = [];
  let currentSession = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prevTime = new Date(sorted[i-1].createdAt);
    const currTime = new Date(sorted[i].createdAt);
    const timeDiff = currTime - prevTime;

    if (timeDiff > oneHour) {
      sessions.push(currentSession);
      currentSession = [sorted[i]];
    } else {
      currentSession.push(sorted[i]);
    }
  }

  if (currentSession.length > 0) {
    sessions.push(currentSession);
  }

  return sessions;
}

// Simple in-memory cache for database results (5 seconds)
let cachedData = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5000; // 5 seconds

// Real-time online users tracking (Map to store userId -> lastSeen timestamp)
const onlineUsers = new Map();
const USER_TIMEOUT_MS = 60000; // 60 seconds - if no activity, consider offline

// Cleanup stale connections every 30 seconds
setInterval(() => {
  const now = Date.now();
  let removedCount = 0;

  for (const [userId, lastSeen] of onlineUsers.entries()) {
    if (now - lastSeen > USER_TIMEOUT_MS) {
      onlineUsers.delete(userId);
      removedCount++;
      console.log(`🧹 [Cleanup] Removed stale user: ${userId} (last seen ${Math.round((now - lastSeen) / 1000)}s ago)`);

      // Broadcast offline event
      broadcastToClients('stats_update', {
        type: 'user_offline',
        data: { userId },
        source: 'cleanup'
      });
    }
  }

  if (removedCount > 0) {
    console.log(`🧹 [Cleanup] Removed ${removedCount} stale users. Online now: ${onlineUsers.size}`);
    // Invalidate cache
    cachedData = null;
    cacheTimestamp = 0;
  }
}, 30000); // Run every 30 seconds

// Admin endpoint to clear online users (for cleaning up stale connections)
app.post('/api/admin/clear-online', (req, res) => {
  const previousCount = onlineUsers.size;
  onlineUsers.clear();
  console.log(`🧹 [Admin] Cleared ${previousCount} online users`);

  // Invalidate cache
  cachedData = null;
  cacheTimestamp = 0;

  res.json({
    success: true,
    message: `Cleared ${previousCount} online users`,
    onlineUsers: onlineUsers.size
  });
});

// Debug endpoint to see all countries (both premium and normal)
app.get('/api/debug/countries', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT country, user_id, premium FROM chat_history WHERE country IS NOT NULL AND country != \'\' ORDER BY country'
    );

    const allCountries = {};
    const normalCountries = {};
    const premiumCountries = {};

    result.rows.forEach(row => {
      const country = row.country ? row.country.trim().toUpperCase() : null;
      const userId = row.user_id;
      const isPremium = row.premium;

      if (country && userId) {
        // All users
        if (!allCountries[country]) allCountries[country] = new Set();
        allCountries[country].add(userId);

        // Split by premium
        if (isPremium) {
          if (!premiumCountries[country]) premiumCountries[country] = new Set();
          premiumCountries[country].add(userId);
        } else {
          if (!normalCountries[country]) normalCountries[country] = new Set();
          normalCountries[country].add(userId);
        }
      }
    });

    res.json({
      all: Object.entries(allCountries).map(([c, s]) => ({ country: c, users: s.size, userIds: Array.from(s) })),
      normal: Object.entries(normalCountries).map(([c, s]) => ({ country: c, users: s.size, userIds: Array.from(s) })),
      premium: Object.entries(premiumCountries).map(([c, s]) => ({ country: c, users: s.size, userIds: Array.from(s) }))
    });
  } catch (err) {
    console.error('Debug countries error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Stats API endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const { premium, userId, tenantId } = req.query;
    const isPremiumFilter = premium === 'true';

    console.log('[API] /api/stats request:', { premium: isPremiumFilter, userId, tenantId: tenantId ? 'provided' : 'none' });

    // Determine schema based on tenantId parameter
    // tenantId provided → SaaS tenant (saas schema)
    // tenantId NOT provided → Photier production (public schema)
    const isTenantRequest = !!tenantId;
    const schema = isTenantRequest ? 'saas' : 'public';
    console.log(`[API] Using schema: ${schema} (tenantId: ${isTenantRequest ? 'provided' : 'none'})`);

    // Check cache validity - but skip cache for user-specific queries (need real-time data)
    const now = Date.now();
    let items;

    if (userId) {
      // User-specific query - always fetch fresh data for real-time updates
      let query;
      let params = [];

      if (isTenantRequest) {
        // Tenant query: get messages for specific tenant
        query = `SELECT * FROM saas.chat_history WHERE tenant_id = $1 ORDER BY created_at DESC`;
        params = [tenantId];
      } else {
        // Photier query: public schema (backward compatibility)
        query = 'SELECT * FROM public.chat_history ORDER BY created_at DESC';
      }

      const result = await pool.query(query, params);
      items = result.rows.map(row => ({
        user_id: row.user_id,
        message: row.message,
        from: row.from,
        topic_id: row.topic_id,
        human_mode: row.human_mode,
        human_mode_expires_at: row.human_mode_expires_at,
        user_name: row.user_name,
        country: row.country,
        premium: row.user_id.startsWith('P-'),
        city: row.city,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
      console.log('[API] Fetched', items.length, 'messages from database (user-specific query, bypassing cache)');
    } else if (!isTenantRequest && cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      // Only use cache for Photier (public schema) - tenants always get fresh data
      items = cachedData;
      console.log('[API] Using cached data (' + items.length + ' messages, age: ' + Math.round((now - cacheTimestamp) / 1000) + 's)');
    } else {
      // Fetch all messages from appropriate schema
      let query;
      let params = [];

      if (isTenantRequest) {
        // Tenant query: get messages for specific tenant
        query = `SELECT * FROM saas.chat_history WHERE tenant_id = $1 ORDER BY created_at DESC`;
        params = [tenantId];
      } else {
        // Photier query: public schema (backward compatibility)
        query = 'SELECT * FROM public.chat_history ORDER BY created_at DESC';
      }

      const result = await pool.query(query, params);

      // Transform PostgreSQL rows to n8n format
      items = result.rows.map(row => ({
        user_id: row.user_id,
        message: row.message,
        from: row.from,
        topic_id: row.topic_id,
        human_mode: row.human_mode,
        human_mode_expires_at: row.human_mode_expires_at,
        user_name: row.user_name,
        country: row.country,
        premium: row.user_id.startsWith('P-'),
        city: row.city,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      // Only cache Photier data (public schema)
      if (!isTenantRequest) {
        cachedData = items;
        cacheTimestamp = now;
      }
      console.log('[API] Fetched', items.length, 'messages from database (cache', isTenantRequest ? 'disabled for tenant' : 'refreshed', ')');
    }

    // Premium filter logic
    if (isPremiumFilter) {
      const premiumItems = items.filter(i => i.premium === true);
      const uniqueUsers = [...new Set(premiumItems.map(i => i.user_id))];

      const userMessages = {};
      premiumItems.forEach(item => {
        const userId = item.user_id;
        if (!userMessages[userId]) {
          userMessages[userId] = [];
        }
        userMessages[userId].push(item);
      });

      const userStats = [];
      Object.entries(userMessages).forEach(([userId, messages]) => {
        const sorted = messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const lastMessage = sorted[0];
        const firstMessage = sorted[sorted.length - 1];

        const messageWithName = sorted.find(m => m.user_name);
        const userName = messageWithName ? messageWithName.user_name : 'Anonim';

        const messagesWithCountry = sorted.filter(m => m.country);
        const messagesWithCity = sorted.filter(m => m.city);
        const country = messagesWithCountry.length > 0 ? messagesWithCountry[0].country : '';
        const city = messagesWithCity.length > 0 ? messagesWithCity[0].city : '';

        // Determine if user used live support (any message with human_mode=true)
        const hasLiveSupport = sorted.some(m => m.human_mode === true);
        const messageSource = hasLiveSupport ? 'live_support' : 'ai_bot';

        userStats.push({
          userId: userId,
          messageCount: sorted.filter(m => m.from === "user").length,
          messageSource: messageSource,
          lastActivity: lastMessage?.createdAt,
          firstActivity: firstMessage?.createdAt,
          userName: userName,
          country: country,
          city: city,
          messageTimestamps: sorted.map(m => m.createdAt).sort(),
          channel: 'premium',
          isOnline: onlineUsers.has(userId) || onlineUsers.has(userId.replace(/^[WP]-/, ''))
        });
      });

      // Heatmap: Premium mesajlar için 7 days x 24 hours
      const heatmapData = Array(7).fill(0).map(() => Array(24).fill(0));
      premiumItems.forEach(item => {
        if (item.from === 'user') {
          // Convert UTC to Turkey time (UTC+3)
          const msgDate = new Date(item.createdAt);
          const turkeyTime = new Date(msgDate.getTime() + (3 * 60 * 60 * 1000));
          const dayOfWeek = turkeyTime.getUTCDay();
          const hour = turkeyTime.getUTCHours();
          heatmapData[dayOfWeek][hour]++;
        }
      });

      // Calculate daily message distribution for last 30 days
      const premiumCurrentDate = new Date();
      const dailyStats = {};
      for (let i = 29; i >= 0; i--) {
        const date = new Date(premiumCurrentDate);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const dateStr = date.toISOString().split('T')[0];
        dailyStats[dateStr] = { users: new Set(), messages: 0 };
      }

      premiumItems.forEach(item => {
        const msgDate = new Date(item.createdAt);
        msgDate.setHours(0, 0, 0, 0);
        const dateStr = msgDate.toISOString().split('T')[0];

        if (dailyStats[dateStr]) {
          dailyStats[dateStr].users.add(item.user_id);
          if (item.from === 'user') {
            dailyStats[dateStr].messages++;
          }
        }
      });

      const weeklyMessages = {
        labels: Object.keys(dailyStats).map(d => {
          const date = new Date(d);
          return date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
        }),
        values: Object.values(dailyStats).map(d => d.messages)
      };

      console.log('[API] Returning premium stats:', { users: userStats.length, totalUsers: uniqueUsers.length });

      return res.json({
        users: userStats.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity)),
        totalUsers: uniqueUsers.length,
        heatmapData: heatmapData,
        weeklyMessages: weeklyMessages
      });
    }

    // User-specific query
    if (userId) {
      // Flexible userId matching: support both prefixed (W-Guest-xxx, P-Guest-xxx) and unprefixed (Guest-xxx) formats
      const userMessages = items
        .filter(i => {
          // Exact match
          if (i.user_id === userId) return true;
          // Match with W- prefix
          if (i.user_id === 'W-' + userId) return true;
          // Match with P- prefix
          if (i.user_id === 'P-' + userId) return true;
          // Match without prefix (if userId has W- or P- prefix, try matching without it)
          const unprefixedUserId = userId.replace(/^[WP]-/, '');
          if (i.user_id === unprefixedUserId) return true;
          return false;
        })
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Oldest first, newest last

      console.log('[API] Returning user messages:', { userId, count: userMessages.length, matchedWith: userMessages.length > 0 ? userMessages[0].user_id : 'none' });
      return res.json(userMessages);
    }

    // Normal stats
    // Show ALL users (both normal and premium) to match country distribution
    const uniqueUsers = [...new Set(items.map(i => i.user_id))];

    const userMessages = {};
    items.forEach(item => {
      const userId = item.user_id;
      if (!userMessages[userId]) {
        userMessages[userId] = [];
      }
      userMessages[userId].push(item);
    });

    const allUserStats = [];
    Object.entries(userMessages).forEach(([userId, messages]) => {
      const sessions = splitIntoSessions(messages);

      sessions.forEach((sessionMsgs, sessionIndex) => {
        if (sessionMsgs.length < 1) return;

        const userMsgs = sessionMsgs.filter(m => m.from === 'user');
        const botMsgs = sessionMsgs.filter(m => m.from === 'bot');
        const isHumanMode = sessionMsgs.some(m => m.human_mode === true);

        const sortedMsgs = sessionMsgs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const lastMessage = sortedMsgs[0];
        const firstMessage = sortedMsgs[sortedMsgs.length - 1];

        const messageWithName = sortedMsgs.find(m => m.user_name);
        const userName = messageWithName ? messageWithName.user_name : 'Anonim';

        const messagesWithCountry = sortedMsgs.filter(m => m.country);
        const messagesWithCity = sortedMsgs.filter(m => m.city);
        const country = messagesWithCountry.length > 0 ? messagesWithCountry[0].country : '';
        const city = messagesWithCity.length > 0 ? messagesWithCity[0].city : '';

        const isPremium = sessionMsgs.some(m => m.premium === true);

        // Add W- or P- prefix if not already present
        let prefixedUserId = userId;
        if (!userId.startsWith('W-') && !userId.startsWith('P-')) {
          prefixedUserId = (isPremium ? 'P-' : 'W-') + userId;
        }

        allUserStats.push({
          userId: prefixedUserId + (sessions.length > 1 ? `-s${sessionIndex+1}` : ''),
          originalUserId: userId,
          sessionNumber: sessionIndex + 1,
          totalSessions: sessions.length,
          userMessageCount: userMsgs.length,
          botMessageCount: botMsgs.length,
          isHumanMode,
          lastActivity: lastMessage ? lastMessage.createdAt : null,
          firstActivity: firstMessage ? firstMessage.createdAt : null,
          userName: userName,
          country: country,
          city: city,
          messages: sortedMsgs,
          premium: isPremium
        });
      });
    });

    const aiHandledSessions = allUserStats.filter(u => !u.isHumanMode).length;
    const humanHandledSessions = allUserStats.filter(u => u.isHumanMode).length;

    const recentUsers = allUserStats
      .filter(u => !u.premium)
      .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
      .slice(0, 10)
      .map(u => ({
        userId: u.userId,
        userName: u.userName || 'Anonim',
        lastActivity: u.lastActivity,
        messageCount: u.userMessageCount,
        isHumanMode: u.isHumanMode
      }));

    // All sessions for stats calculations
    const allSessionsForStats = allUserStats;

        // Only non-premium sessions for web user list
    const allUsers = allUserStats
      .filter(u => !u.premium)
      .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
      .map(u => ({
        userId: u.userId,
        originalUserId: u.originalUserId,
        sessionNumber: u.sessionNumber,
        totalSessions: u.totalSessions,
        userName: u.userName || 'Anonim',
        lastActivity: u.lastActivity,
        firstActivity: u.firstActivity,
        messageCount: u.userMessageCount + u.botMessageCount,
        messageTimestamps: u.messages.map(m => m.createdAt).sort(),
        isHumanMode: u.isHumanMode,
        country: u.country,
        city: u.city,
        channel: 'web',
        isOnline: onlineUsers.has(u.originalUserId) || onlineUsers.has(u.userId)
      }));

    const currentDate = new Date();
    const dailyStats = {};
    for (let i = 29; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split('T')[0];
      dailyStats[dateStr] = { users: new Set(), messages: 0 };
    }

    items.forEach(item => {
      const msgDate = new Date(item.createdAt);
      msgDate.setHours(0, 0, 0, 0);
      const dateStr = msgDate.toISOString().split('T')[0];

      if (dailyStats[dateStr]) {
        dailyStats[dateStr].users.add(item.user_id);
        if (item.from === 'user') {
          dailyStats[dateStr].messages++;
        }
      }
    });

    const dailyUsers = {
      labels: Object.keys(dailyStats).map(d => {
        const date = new Date(d);
        return date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
      }),
      values: Object.values(dailyStats).map(d => d.users.size)
    };

    const weeklyMessages = {
      labels: Object.keys(dailyStats).map(d => {
        const date = new Date(d);
        return date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
      }),
      values: Object.values(dailyStats).map(d => d.messages)
    };

    // Calculate total messages (user + bot + admin)
    const totalUserMessages = items.length; // All messages, not just user messages

    // Country name to ISO code mapping
    const countryNameToCode = {
      'TURKEY': 'TR',
      'UNITED STATES': 'US',
      'NETHERLANDS': 'NL',
      'GERMANY': 'DE',
      'FRANCE': 'FR',
      'UNITED KINGDOM': 'GB',
      'CANADA': 'CA',
      'AUSTRALIA': 'AU',
      'SPAIN': 'ES',
      'ITALY': 'IT',
      'BRAZIL': 'BR',
      'INDIA': 'IN',
      'JAPAN': 'JP',
      'CHINA': 'CN',
      'RUSSIA': 'RU'
    };

    // Count unique users per country (not messages)
    // Show ALL countries (both normal and premium widgets)
    const countryUsersMap = {}; // { countryCode: Set<userId> }
    items.forEach(item => {
      const country = item.country;
      const userId = item.user_id;
      if (country && country !== '' && userId) {
        // Normalize country code: trim whitespace and uppercase
        let normalizedCountry = country.trim().toUpperCase();

        // Convert full country names to ISO codes
        if (countryNameToCode[normalizedCountry]) {
          normalizedCountry = countryNameToCode[normalizedCountry];
        }

        if (normalizedCountry) {
          if (!countryUsersMap[normalizedCountry]) {
            countryUsersMap[normalizedCountry] = new Set();
          }
          countryUsersMap[normalizedCountry].add(userId);
        }
      }
    });

    // Convert Set to count and calculate totals
    const countryMap = {};
    Object.entries(countryUsersMap).forEach(([code, userSet]) => {
      countryMap[code] = userSet.size;
    });

    // Calculate total unique users with country data
    const totalCountryUsers = Object.values(countryMap).reduce((sum, count) => sum + count, 0);

    const countries = Object.entries(countryMap)
      .map(([code, count]) => ({
        code: code,
        count: count,
        percentage: totalCountryUsers > 0 ? Math.round((count / totalCountryUsers) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Heatmap: 7 days x 24 hours (only web messages, not premium)
    const heatmapData = Array(7).fill(0).map(() => Array(24).fill(0));
    items.forEach(item => {
      // Only count web messages (not premium) to avoid double counting when combined with premium heatmap
      if (item.from === 'user' && !item.premium) {
        // Convert UTC to Turkey time (UTC+3)
        const msgDate = new Date(item.createdAt);
        const turkeyTime = new Date(msgDate.getTime() + (3 * 60 * 60 * 1000));
        const dayOfWeek = turkeyTime.getUTCDay();
        const hour = turkeyTime.getUTCHours();
        heatmapData[dayOfWeek][hour]++;
      }
    });

    // Calculate session duration metrics
    const sessionDurations = [];
    const sessionMessageCounts = [];

    allSessionsForStats.forEach(session => {
      const timestamps = session.messages.map(m => m.createdAt).sort();
      if (timestamps.length >= 2) {
        const first = new Date(timestamps[0]);
        const last = new Date(timestamps[timestamps.length - 1]);
        const durationMinutes = (last - first) / 1000 / 60;
        sessionDurations.push(durationMinutes);
      }
      sessionMessageCounts.push(session.userMessageCount + session.botMessageCount);
    });

    const avgSessionDuration = sessionDurations.length > 0
      ? (sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length).toFixed(1)
      : '0.0';
    const minSessionDuration = sessionDurations.length > 0
      ? Math.min(...sessionDurations).toFixed(1)
      : '0.0';
    const maxSessionDuration = sessionDurations.length > 0
      ? Math.max(...sessionDurations).toFixed(1)
      : '0.0';
    const avgMessagesPerSession = sessionMessageCounts.length > 0
      ? (sessionMessageCounts.reduce((a, b) => a + b, 0) / sessionMessageCounts.length).toFixed(1)
      : '0.0';

    const response = {
      totalUsers: uniqueUsers.length,
      totalMessages: totalUserMessages,
      aiHandled: aiHandledSessions,
      humanHandled: humanHandledSessions,
      recentUsers: recentUsers,
      allUsers: allUsers,
      // Session metrics
      avgSessionDuration: avgSessionDuration,
      minSessionDuration: minSessionDuration,
      maxSessionDuration: maxSessionDuration,
      avgMessagesPerSession: avgMessagesPerSession,
      // Add users field (filtered by premium parameter for web/premium pages)
      users: allUserStats
        .filter(u => !u.premium) // Only web users for web page (premium=false)
        .map(u => ({
          userId: u.userId,
          originalUserId: u.originalUserId,
          sessionNumber: u.sessionNumber,
          totalSessions: u.totalSessions,
          userName: u.userName || 'Anonim',
          lastActivity: u.lastActivity,
          firstActivity: u.firstActivity,
          messageCount: u.userMessageCount + u.botMessageCount,
          messageTimestamps: u.messages.map(m => m.createdAt).sort(),
          isHumanMode: u.isHumanMode,
          country: u.country,
          city: u.city,
          channel: 'web',
          isOnline: onlineUsers.has(u.originalUserId) || onlineUsers.has(u.userId)
        })),
      dailyUsers: dailyUsers,
      allSessionsForStats: allSessionsForStats.map(u => ({
        userId: u.userId,
        messageCount: u.userMessageCount + u.botMessageCount,
        userMessageCount: u.userMessageCount,  // User messages only
        lastActivity: u.lastActivity,
        firstActivity: u.firstActivity,
        messageTimestamps: u.messages.map(m => m.createdAt).sort(),
        isHumanMode: u.isHumanMode,
        channel: u.premium ? 'premium' : 'web'
      })),
      weeklyMessages: weeklyMessages,
      countries: countries,
      heatmapData: heatmapData
    };

    // Calculate online users split (web vs premium)
    let webOnline = 0;
    let premiumOnline = 0;
    for (const userId of onlineUsers.keys()) {
      if (userId.startsWith('P-')) {
        premiumOnline++;
      } else if (userId.startsWith('W-')) {
        webOnline++;
      } else {
        // Unprefixed userId - check in messages to determine type
        const userSession = allUserStats.find(u => u.originalUserId === userId);
        if (userSession && userSession.premium) {
          premiumOnline++;
        } else {
          webOnline++;
        }
      }
    }

    response.onlineUsers = {
      total: onlineUsers.size,
      web: webOnline,
      premium: premiumOnline
    };

    // Fetch widget opens data from appropriate schema
    let widgetOpensQuery;
    let widgetOpensParams = [];

    if (isTenantRequest) {
      // Tenant query: saas.widget_opens WHERE tenant_id = $1
      widgetOpensQuery = 'SELECT premium, COUNT(*) as count FROM saas.widget_opens WHERE tenant_id = $1 GROUP BY premium';
      widgetOpensParams = [tenantId];
    } else {
      // Photier query: public.widget_opens (backward compatibility)
      widgetOpensQuery = 'SELECT premium, COUNT(*) as count FROM public.widget_opens GROUP BY premium';
    }

    const widgetOpensResult = await pool.query(widgetOpensQuery, widgetOpensParams);
    const normalOpens = widgetOpensResult.rows.find(r => r.premium === false)?.count || 0;
    const premiumOpens = widgetOpensResult.rows.find(r => r.premium === true)?.count || 0;
    const totalOpens = parseInt(normalOpens) + parseInt(premiumOpens);

    response.widgetOpens = {
      total: totalOpens,
      normal: parseInt(normalOpens),
      premium: parseInt(premiumOpens)
    };

    console.log('[API] Returning normal stats:', { 
      totalUsers: response.totalUsers, 
      totalMessages: response.totalMessages,
      aiHandled: response.aiHandled,
      humanHandled: response.humanHandled,
      allSessionsForStats: response.allSessionsForStats ? response.allSessionsForStats.length : 0
    });

    res.json(response);

  } catch (error) {
    console.error('❌ [API] Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Widget open tracking endpoint
app.use(express.json());

app.post('/api/widget-open', async (req, res) => {
  try {
    const { userId, chatId, country, city, premium, host } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    console.log('[API] Widget opened:', { userId, chatId, country, city, premium, host });

    // Determine schema based on chatId
    // Photier bots (chatId: numeric) → public.widget_opens
    // Tenant bots (chatId: bot_xxx) → saas.widget_opens
    const isPhotierBot = chatId && (typeof chatId === 'number' || !chatId.toString().startsWith('bot_'));
    const isTenantBot = chatId && typeof chatId === 'string' && chatId.startsWith('bot_');

    if (isPhotierBot) {
      // Photier production bots → public schema
      console.log(`[API] 📊 Photier bot detected (chatId: ${chatId}) → public.widget_opens`);
      await pool.query(
        'INSERT INTO public.widget_opens (user_id, country, city, premium, host) VALUES ($1, $2, $3, $4, $5)',
        [userId, country || null, city || null, premium || false, host || null]
      );
    } else if (isTenantBot) {
      // Tenant SaaS bots → saas schema
      console.log(`[API] 🏢 Tenant bot detected (chatId: ${chatId}) → saas.widget_opens`);

      // Get tenant_id from chatbot table (Prisma default: Chatbot → chatbot, not chatbots)
      const chatbotResult = await pool.query(
        'SELECT "tenantId" FROM saas."Chatbot" WHERE "chatId" = $1',
        [chatId]
      );

      if (chatbotResult.rows.length === 0) {
        console.error(`❌ [API] Chatbot not found: ${chatId}`);
        return res.status(404).json({ error: 'Chatbot not found', chatId });
      }

      const tenantId = chatbotResult.rows[0].tenantId;

      await pool.query(
        'INSERT INTO saas.widget_opens (user_id, chatbot_id, tenant_id, country, city, premium, host) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [userId, chatId, tenantId, country || null, city || null, premium || false, host || null]
      );
    } else {
      // No chatId provided - fallback to public schema (backward compatibility)
      console.log('[API] ⚠️ No chatId provided → public.widget_opens (backward compatibility)');
      await pool.query(
        'INSERT INTO public.widget_opens (user_id, country, city, premium, host) VALUES ($1, $2, $3, $4, $5)',
        [userId, country || null, city || null, premium || false, host || null]
      );
    }

    res.json({ success: true, message: 'Widget open tracked' });
  } catch (error) {
    console.error('❌ [API] Error tracking widget open:', error);
    res.status(500).json({ error: 'Failed to track widget open', message: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

server.listen(PORT, () => {
  console.log(`✅ [Server] Stats API running on port ${PORT}`);
  console.log(`📊 [Server] API endpoint: http://localhost:${PORT}/api/stats`);
  console.log(`🔌 [Socket.io] Server listening on ws://localhost:${PORT}`);

  // Connect to widget servers as client to receive stats events
  connectToWidgetServers();
});

// Connect to both widget servers (web and premium) to listen for stats events
function connectToWidgetServers() {
  // Connect to web widget server
  // IMPORTANT: Railway internal networking doesn't support WebSocket connections!
  // Must use PUBLIC URLs for Socket.io client connections
  const webWidgetUrl = process.env.WIDGET_URL || 'https://chat.simplechat.bot';
  console.log(`🔌 [Stats] Connecting to web widget: ${webWidgetUrl}/stats`);
  const webClient = ioClient(`${webWidgetUrl}/stats`, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: Infinity
  });

  webClient.on('connect', () => {
    console.log('✅ [intergram] Connected to web widget server');
  });

  webClient.on('disconnect', () => {
    console.log('❌ [intergram] Disconnected from web widget server');
  });

  webClient.on('connect_error', (err) => {
    console.error('❌ [intergram] Connection error:', err.message);
  });

  webClient.on('stats_update', (data) => {
    console.log('📊 [intergram] Received stats_update:', JSON.stringify(data).substring(0, 100));

    // Track online/offline users in real-time
    if (data.type === 'user_online' && data.data?.userId) {
      onlineUsers.set(data.data.userId, Date.now());
      console.log('✅ User online:', data.data.userId, '(Total online:', onlineUsers.size, ')');

      // Invalidate cache so next API call gets fresh online count
      cachedData = null;
      cacheTimestamp = 0;
    } else if (data.type === 'user_offline' && data.data?.userId) {
      onlineUsers.delete(data.data.userId);
      console.log('❌ User offline:', data.data.userId, '(Total online:', onlineUsers.size, ')');

      // Invalidate cache so next API call gets fresh online count
      cachedData = null;
      cacheTimestamp = 0;
    }

    broadcastToClients('stats_update', { source: 'intergram', ...data });
  });

  webClient.on('widget_opened', (data) => {
    console.log('📱 [intergram] Widget opened:', data);

    // Invalidate cache so next API call gets fresh data
    cachedData = null;
    cacheTimestamp = 0;

    broadcastToClients('stats_update', { source: 'intergram', event: 'widget_opened', ...data });
  });

  // Connect to premium widget server
  // IMPORTANT: Railway internal networking doesn't support WebSocket connections!
  // Must use PUBLIC URLs for Socket.io client connections
  const premiumWidgetUrl = process.env.WIDGET_PREMIUM_URL || 'https://p-chat.simplechat.bot';
  console.log(`🔌 [Stats] Connecting to premium widget: ${premiumWidgetUrl}/stats`);
  const premiumClient = ioClient(`${premiumWidgetUrl}/stats`, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: Infinity
  });

  premiumClient.on('connect', () => {
    console.log('✅ [intergram-premium] Connected to premium widget server');
  });

  premiumClient.on('disconnect', () => {
    console.log('❌ [intergram-premium] Disconnected from premium widget server');
  });

  premiumClient.on('connect_error', (err) => {
    console.error('❌ [intergram-premium] Connection error:', err.message);
  });

  premiumClient.on('stats_update', (data) => {
    console.log('📊 [intergram-premium] Received stats_update:', JSON.stringify(data).substring(0, 100));

    // Track online/offline users in real-time
    if (data.type === 'user_online' && data.data?.userId) {
      onlineUsers.set(data.data.userId, Date.now());
      console.log('✅ User online:', data.data.userId, '(Total online:', onlineUsers.size, ')');

      // Invalidate cache so next API call gets fresh online count
      cachedData = null;
      cacheTimestamp = 0;
    } else if (data.type === 'user_offline' && data.data?.userId) {
      onlineUsers.delete(data.data.userId);
      console.log('❌ User offline:', data.data.userId, '(Total online:', onlineUsers.size, ')');

      // Invalidate cache so next API call gets fresh online count
      cachedData = null;
      cacheTimestamp = 0;
    }

    broadcastToClients('stats_update', { source: 'intergram-premium', ...data });
  });

  premiumClient.on('widget_opened', (data) => {
    console.log('📱 [intergram-premium] Widget opened:', data);

    // Invalidate cache so next API call gets fresh data
    cachedData = null;
    cacheTimestamp = 0;

    broadcastToClients('stats_update', { source: 'intergram-premium', event: 'widget_opened', ...data });
  });
}
