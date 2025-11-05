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
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'https://staging-stats.simplechat.bot',
      'https://stats.simplechat.bot',
      'https://zucchini-manifestation-production-f29f.up.railway.app'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  path: '/socket.io',
  transports: ['websocket', 'polling']
});

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway') ? {
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

// CORS middleware - allow staging dashboard to access API
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'https://staging-stats.simplechat.bot',
    'https://stats.simplechat.bot',
    'https://zucchini-manifestation-production-f29f.up.railway.app'
  ];
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

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

// Real-time online users tracking (Set to store userId strings)
const onlineUsers = new Set();

// Stats API endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const { premium, userId } = req.query;
    const isPremiumFilter = premium === 'true';

    console.log('[API] /api/stats request:', { premium: isPremiumFilter, userId });

    // Check cache validity - but skip cache for user-specific queries (need real-time data)
    const now = Date.now();
    let items;

    if (userId) {
      // User-specific query - always fetch fresh data for real-time updates
      const result = await pool.query('SELECT * FROM chat_history ORDER BY created_at DESC');
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
    } else if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      items = cachedData;
      console.log('[API] Using cached data (' + items.length + ' messages, age: ' + Math.round((now - cacheTimestamp) / 1000) + 's)');
    } else {
      // Fetch all messages from PostgreSQL
      const result = await pool.query('SELECT * FROM chat_history ORDER BY created_at DESC');

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

      // Update cache
      cachedData = items;
      cacheTimestamp = now;
      console.log('[API] Fetched', items.length, 'messages from database (cache refreshed)');
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
    const uniqueUsers = [...new Set(items.filter(i => !i.premium).map(i => i.user_id))];

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

    const totalUserMessages = items.filter(i => i.from === 'user').length;

    const countryMap = {};
    items.forEach(item => {
      const country = item.country;
      if (country && country !== '') {
        countryMap[country] = (countryMap[country] || 0) + 1;
      }
    });

    // Calculate total messages with country data
    const totalCountryMessages = Object.values(countryMap).reduce((sum, count) => sum + count, 0);

    const countries = Object.entries(countryMap)
      .map(([code, count]) => ({
        code: code,
        count: count,
        percentage: Math.round((count / totalCountryMessages) * 100)
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

    const response = {
      totalUsers: uniqueUsers.length,
      totalMessages: totalUserMessages,
      aiHandled: aiHandledSessions,
      humanHandled: humanHandledSessions,
      recentUsers: recentUsers,
      allUsers: allUsers,
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
      onlineUsers: onlineUsers.size, // Use real-time WebSocket tracking instead of lastActivity
      countries: countries,
      heatmapData: heatmapData
    };

    // Fetch widget opens data
    const widgetOpensResult = await pool.query('SELECT premium, COUNT(*) as count FROM widget_opens GROUP BY premium');
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
    const { userId, country, city, premium, host } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    console.log('[API] Widget opened:', { userId, country, city, premium, host });

    // Insert into widget_opens table
    await pool.query(
      'INSERT INTO widget_opens (user_id, country, city, premium, host) VALUES ($1, $2, $3, $4, $5)',
      [userId, country || null, city || null, premium || false, host || null]
    );

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
  // Connect to web widget server (port 3000)
  const webClient = ioClient('http://intergram:3000/stats', {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: Infinity
  });

  webClient.on('connect', () => {
    console.log('✅ [intergram] Connected to web widget server on port 3000');
  });

  webClient.on('disconnect', () => {
    console.log('❌ [intergram] Disconnected from web widget server');
  });

  webClient.on('stats_update', (data) => {
    console.log('📊 [intergram] Received stats_update:', JSON.stringify(data).substring(0, 100));

    // Track online/offline users in real-time
    if (data.type === 'user_online' && data.data?.userId) {
      onlineUsers.add(data.data.userId);
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

  // Connect to premium widget server (port 3001)
  const premiumClient = ioClient('http://intergram-premium:3001/stats', {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: Infinity
  });

  premiumClient.on('connect', () => {
    console.log('✅ [intergram-premium] Connected to premium widget server on port 3001');
  });

  premiumClient.on('disconnect', () => {
    console.log('❌ [intergram-premium] Disconnected from premium widget server');
  });

  premiumClient.on('stats_update', (data) => {
    console.log('📊 [intergram-premium] Received stats_update:', JSON.stringify(data).substring(0, 100));

    // Track online/offline users in real-time
    if (data.type === 'user_online' && data.data?.userId) {
      onlineUsers.add(data.data.userId);
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
