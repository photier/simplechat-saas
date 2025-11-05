// API URL - N8N webhook'tan stats alacağız
const N8N_STATS_URL = "/api/stats";
const API_VERSION = 'v1.2.0-session-splitting';

console.log('[API] Loading version:', API_VERSION);

// Removed globalValidSessions - AI/Human calculation now uses backend data directly

// Helper function to translate text
function t(key) {
    const lang = localStorage.getItem('language') || 'tr';
    return window.translations && window.translations[key] && window.translations[key][lang]
        ? window.translations[key][lang]
        : key;
}

// WebSocket connections to both servers
let webSocket = null;
let premiumSocket = null;
let onlineUsersMap = { web: new Set(), premium: new Set() };

// Charts
let dailyUsersChart, aiVsHumanChart, messagesChart;

// Pagination
let allUsersData = [];
let currentUsersPage = 1;
let usersPerPage = 25;

let allPremiumData = [];
let currentPremiumPage = 1;
let premiumPerPage = 25;

// Combined stats for AI vs Human chart (web + premium)
let combinedAiVsHuman = { ai: 0, human: 0 };

// Store stats from both sources
let webStats = null;
let premiumStatsData = null;
let updateCounter = 0; // Track how many times combined stats is updated

// Set all widgets to loading state
function setLoadingState() {
    const statElements = [
        'totalUsers', 'totalMessages', 'aiHandledSessions', 'humanHandledSessions',
        'onlineUsers', 'avgSessionDuration', 'minSessionDuration', 'maxSessionDuration',
        'avgMessagesPerSession', 'totalSessions', 'webSessionCount', 'premiumSessionCount'
    ];

    statElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '...';
    });

    console.log('[Loading] Set all widgets to loading state');
}

// Initialize WebSocket connections
function connectWebSockets() {
    console.log('[WebSocket] Connecting to stats servers...');

    // Determine WebSocket URLs based on environment
    const isLocal = window.location.hostname === 'localhost';
    const webSocketUrl = isLocal ? 'http://localhost:3000/stats' : 'https://chat.simplechat.bot/stats';
    const premiumSocketUrl = isLocal ? 'http://localhost:3001/stats' : 'https://p-chat.simplechat.bot/stats';

    console.log(`[WebSocket] Environment: ${isLocal ? 'LOCAL' : 'PRODUCTION'}`);
    console.log(`[WebSocket] Web URL: ${webSocketUrl}`);
    console.log(`[WebSocket] Premium URL: ${premiumSocketUrl}`);

    // Connect to web chat server with Phase 1 features
    try {
        webSocket = io(webSocketUrl, {
            transports: ['websocket', 'polling'],
            // Smart Reconnection Strategy
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,          // Start at 1s
            reconnectionDelayMax: 5000,       // Max 5s between attempts
            randomizationFactor: 0.5,         // Add jitter to prevent thundering herd
            timeout: 20000,                   // 20s connection timeout
            // Performance
            autoConnect: true,
            forceNew: false
        });

        webSocket.on('connect', () => {
            console.log('✅ [WebSocket] Web chat connected');
            console.log(`📡 [Recovery] Socket recovered: ${webSocket.recovered || false}`);
        });

        webSocket.on('disconnect', (reason) => {
            console.log(`⚠️ [WebSocket] Web chat disconnected: ${reason}`);
        });

        webSocket.on('connect_error', (error) => {
            console.error('❌ [WebSocket] Web connection error:', error.message);
            if (error.message === 'xhr poll error') {
                console.log('🔄 [WebSocket] Network issue, will retry...');
            }
        });

        webSocket.on('reconnect', (attemptNumber) => {
            console.log(`🔄 [WebSocket] Web reconnected after ${attemptNumber} attempts`);
        });

        webSocket.on('reconnect_attempt', (attemptNumber) => {
            console.log(`🔄 [WebSocket] Web reconnection attempt ${attemptNumber}/10`);
        });

        webSocket.on('reconnect_failed', () => {
            console.error('❌ [WebSocket] Web reconnection failed after 10 attempts');
        });

        webSocket.on('stats_update', (data) => {
            handleStatsUpdate(data, 'web');
        });

        webSocket.on('error', (error) => {
            console.error('❌ [WebSocket] Web chat error:', error);
        });
    } catch (error) {
        console.error('❌ [WebSocket] Failed to connect to web chat:', error);
    }

    // Connect to premium chat server with Phase 1 features
    try {
        premiumSocket = io(premiumSocketUrl, {
            transports: ['websocket', 'polling'],
            // Smart Reconnection Strategy
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,          // Start at 1s
            reconnectionDelayMax: 5000,       // Max 5s between attempts
            randomizationFactor: 0.5,         // Add jitter to prevent thundering herd
            timeout: 20000,                   // 20s connection timeout
            // Performance
            autoConnect: true,
            forceNew: false
        });

        premiumSocket.on('connect', () => {
            console.log('✅ [WebSocket] Premium chat connected');
            console.log(`📡 [Recovery] Socket recovered: ${premiumSocket.recovered || false}`);
        });

        premiumSocket.on('disconnect', (reason) => {
            console.log(`⚠️ [WebSocket] Premium chat disconnected: ${reason}`);
        });

        premiumSocket.on('connect_error', (error) => {
            console.error('❌ [WebSocket] Premium connection error:', error.message);
            if (error.message === 'xhr poll error') {
                console.log('🔄 [WebSocket] Network issue, will retry...');
            }
        });

        premiumSocket.on('reconnect', (attemptNumber) => {
            console.log(`🔄 [WebSocket] Premium reconnected after ${attemptNumber} attempts`);
        });

        premiumSocket.on('reconnect_attempt', (attemptNumber) => {
            console.log(`🔄 [WebSocket] Premium reconnection attempt ${attemptNumber}/10`);
        });

        premiumSocket.on('reconnect_failed', () => {
            console.error('❌ [WebSocket] Premium reconnection failed after 10 attempts');
        });

        premiumSocket.on('disconnect', () => {
            console.log('⚠️ [WebSocket] Premium chat disconnected');
        });

        premiumSocket.on('stats_update', (data) => {
            handleStatsUpdate(data, 'premium');
        });

        premiumSocket.on('error', (error) => {
            console.error('❌ [WebSocket] Premium chat error:', error);
        });
    } catch (error) {
        console.error('❌ [WebSocket] Failed to connect to premium chat:', error);
    }
}

// Handle incoming WebSocket stats updates
// Poll for user until found in API (for new users that N8N is still saving)
async function pollForUser(channel, userId, reloadFunction) {
    const maxAttempts = 5;
    const delayMs = 2000; // 2 seconds between attempts

    console.log(`🔄 [Polling] Starting poll for ${userId} (max ${maxAttempts} attempts)`);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        await new Promise(resolve => setTimeout(resolve, delayMs));

        console.log(`🔄 [Polling] Attempt ${attempt}/${maxAttempts} - checking API...`);

        try {
            const url = channel === 'premium'
                ? '/api/stats?premium=true'
                : '/api/stats';

            const response = await fetch(url);
            const rawData = await response.json();
            const data = Array.isArray(rawData) ? rawData[0] : rawData;

            const users = channel === 'premium' ? data.users : data.allUsers;
            const userFound = users && users.some(u => u.userId === userId);

            console.log(`🔄 [Polling] User ${userId} found: ${userFound}`);

            if (userFound) {
                console.log(`✅ [Polling] User found! Refreshing table...`);
                reloadFunction();
                return;
            }
        } catch (error) {
            console.error(`❌ [Polling] Error on attempt ${attempt}:`, error);
        }
    }

    console.log(`⏱️ [Polling] Timeout - user not found after ${maxAttempts} attempts`);
}

function handleStatsUpdate(message, channel) {
    console.log(`📡 [${channel.toUpperCase()}] Received:`, message.type, message.data);

    const { type, data } = message;
    const userId = data.userId;

    // Update online users tracking
    if (type === 'user_online') {
        onlineUsersMap[channel].add(userId);
        updateOnlineCount();

        // Immediately refresh the appropriate table if it's open
        console.log(`🔄 [Real-time] New user online: ${userId}, checking which page is open...`);
        console.log(`🔄 [Real-time] Current hash: ${window.location.hash}`);

        if (channel === 'web' && window.location.hash === '#users') {
            console.log('🔄 [Real-time] Refreshing Users table NOW...');
            pollForUser('web', userId, loadAllUsers);
        } else if (channel === 'premium' && window.location.hash === '#premium') {
            console.log('🔄 [Real-time] Refreshing Premium table NOW...');
            pollForUser('premium', userId, loadPremiumUsers);
        }

        // Also reload stats widgets
        debouncedStatsReload();
    } else if (type === 'user_offline') {
        onlineUsersMap[channel].delete(userId);
        updateOnlineCount();
        // No need to reload stats, just update count
    } else if (type === 'new_message') {
        // Refresh table only if on specific page
        refreshTableIfOpen(channel);
        debouncedStatsReload();

        // Debug: Check modal status
        console.log('🔍 [Modal Check] userId:', userId, 'currentOpen:', window.currentOpenUserId, 'channel:', channel, 'currentChannel:', window.currentOpenChannel);

        // Normalize userId for comparison: strip W- or P- prefix if present
        const normalizedUserId = userId.replace(/^[WP]-/, '');
        const normalizedCurrentUserId = (window.currentOpenUserId || '').replace(/^[WP]-/, '');

        // If conversation detail is open for this user, update it
        if (normalizedCurrentUserId === normalizedUserId && window.currentOpenChannel === channel) {
            console.log('🔄 [Real-time] Refreshing open conversation for:', userId);
            if (channel === 'web') {
                showUserMessages(userId);
            } else {
                viewConversation(userId);
            }
        } else {
            console.log('❌ [Modal] NOT refreshing - normalized comparison failed:', normalizedCurrentUserId, '!==', normalizedUserId);
        }
    } else if (type === 'human_mode_change') {
        // Premium: AI/Human mode switched
        refreshTableIfOpen('premium');
    }
}

// Debounced stats reload (don't reload more than once per 3 seconds)
let statsReloadTimeout = null;
function debouncedStatsReload() {
    if (statsReloadTimeout) return; // Already scheduled

    statsReloadTimeout = setTimeout(async () => {
        console.log('[Debounced Reload] Starting...');
        await loadAllStatsSequentially();

        // Also refresh specific page tables if open
        if (window.location.hash === '#users') {
            console.log('[Debounced Reload] Refreshing Users table...');
            await loadAllUsers();
        } else if (window.location.hash === '#premium') {
            console.log('[Debounced Reload] Refreshing Premium table...');
            await loadPremiumUsers();
        }

        statsReloadTimeout = null;
    }, 3000);
}

// Refresh table only if we're on that specific page
async function refreshTableIfOpen(channel) {
    if (channel === 'web') {
        const usersTable = document.getElementById('usersTableBody');
        if (usersTable && window.location.hash === '#users') {
            console.log('🔄 [Table] Refreshing web users table...');
            await loadAllUsers();
        }
    } else if (channel === 'premium') {
        const premiumTable = document.getElementById('premiumTableBody');
        if (premiumTable && window.location.hash === '#premium') {
            console.log('🔄 [Table] Refreshing premium users table...');
            await loadPremiumUsers();
        }
    }
}

// Update online user count in real-time
function updateOnlineCount() {
    const webOnline = onlineUsersMap.web.size;
    const premiumOnline = onlineUsersMap.premium.size;
    const totalOnline = webOnline + premiumOnline;

    const onlineEl = document.getElementById('onlineUsers');
    if (onlineEl) {
        onlineEl.textContent = totalOnline;
    }

    console.log(`👥 [Online] Web: ${webOnline}, Premium: ${premiumOnline}, Total: ${totalOnline}`);
}

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
    console.log('[Init] Setting loading state...');
    setLoadingState(); // Show loading indicators
    initializeCharts();
    await loadAllStatsSequentially();

    // WebSocket connections with Phase 1 features
    connectWebSockets(); // ENABLED - Using api.js connections with Phase 1 features

    // Auto refresh every 5 seconds (real-time updates)
    setInterval(async () => {
        await loadAllStatsSequentially();
    }, 5000);
});

async function loadAllStatsSequentially() {
    try {
        console.log('[Stats] Starting sequential load...');
        // Load web stats first
        await loadStats();
        console.log('[Stats] Web stats loaded:', webStats ? `${webStats.allUsers?.length} users` : 'null');
        // Then load premium stats
        await loadPremiumStats();
        console.log('[Stats] Premium stats loaded:', premiumStatsData ? `${premiumStatsData.users?.length} users` : 'null');
        // Finally update all widgets with combined data
        if (webStats) {
            console.log('[Stats] Updating combined stats...');
            updateCombinedStats();
            updateLastUpdate();
            console.log('[Stats] All done!');
        }
    } catch (error) {
        console.error('Stats loading error:', error);
    }
}

async function loadStats() {
    try {
        const response = await fetch(N8N_STATS_URL);
        const rawData = await response.json();

        // rawData is an array, take the first element
        const n8nData = Array.isArray(rawData) ? rawData[0] : rawData;

        // Store web stats (don't update dashboard yet, wait for premium)
        webStats = n8nData;

        // Transform N8N data to dashboard format for charts
        const data = transformN8NData(n8nData);

        // Update only non-combined widgets (charts, countries, etc.)
        updateDashboard(data);
    } catch (error) {
        console.error('Stats yüklenirken hata:', error);
        webStats = null;
    }
}

async function loadPremiumStats() {
    try {
        const response = await fetch('/api/stats?premium=true');
        const rawData = await response.json();
        const data = Array.isArray(rawData) ? rawData[0] : rawData;

        if (data && data.users) {
            // Store premium stats
            premiumStatsData = data;
        } else {
            // Premium stats empty
            premiumStatsData = { users: [], totalUsers: 0 };
        }
    } catch (error) {
        console.error('Premium stats yüklenirken hata:', error);
        premiumStatsData = { users: [], totalUsers: 0 };
    }
}

function updateCombinedStats() {
    updateCounter++;
    console.log('[Combined Stats] Update #' + updateCounter + ' - Updating with web + premium...');

    // Helper function to get base userId (strip session suffix like -s1, -s2)
    function getBaseUserId(userId) {
        return userId.replace(/-s\d+$/, '');
    }

    // Count UNIQUE users (not sessions)
    // allUsers contains sessions (with -s1, -s2 suffixes), we need unique base IDs
    const webUniqueUsers = webStats.allUsers ?
        new Set(webStats.allUsers.map(u => getBaseUserId(u.userId))).size : 0;
    const premiumUniqueUsers = premiumStatsData && premiumStatsData.users ?
        new Set(premiumStatsData.users.map(u => getBaseUserId(u.userId))).size : 0;

    const webTotal = webUniqueUsers;
    const premiumTotal = premiumUniqueUsers;

    console.log('[Combined Stats] Unique Users: web=' + webTotal + ' (sessions: ' + (webStats.allUsers ? webStats.allUsers.length : 0) + '), premium=' + premiumTotal + ' (sessions: ' + (premiumStatsData && premiumStatsData.users ? premiumStatsData.users.length : 0) + ')');

    // Use AI/Human counts from backend (already calculated correctly)
    // NOTE: webStats.aiHandled and webStats.humanHandled already include BOTH web and premium sessions
    // because backend's allSessionsForStats contains all sessions (web + premium) with isHumanMode flags
    const aiSessions = webStats.aiHandled || 0;
    const humanSessions = webStats.humanHandled || 0;
// Helper function to get base userId (strip session suffix)
    function getBaseUserId(userId) {
        return userId.replace(/-s\d+$/, '');
    }

    // Calculate online users from recentUsers (last 5 minutes) - UNIQUE USERS only
    const fiveMinutesAgoWeb = new Date(Date.now() - 5 * 60 * 1000);
    const webOnlineUsers = (webStats.recentUsers || []).filter(u =>
        new Date(u.lastActivity) > fiveMinutesAgoWeb
    );
    const webOnline = new Set(webOnlineUsers.map(u => getBaseUserId(u.userId))).size;
    const webMessages = webStats.totalMessages || 0;

    let premiumOnline = 0;
    let premiumMessages = 0;

    if (premiumStatsData && premiumStatsData.users) {
        // Online premium users (last activity within 5 minutes) - UNIQUE USERS only
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const premiumOnlineUsers = premiumStatsData.users.filter(u =>
            new Date(u.lastActivity) > fiveMinutesAgo
        );
        premiumOnline = new Set(premiumOnlineUsers.map(u => getBaseUserId(u.userId))).size;

        // Total premium messages
        premiumMessages = premiumStatsData.users.reduce((sum, u) => sum + (u.messageCount || 0), 0);
    }

    // Calculate combined totals
    const totalUsers = webTotal + premiumTotal;
    const totalAI = aiSessions;
    const totalHuman = humanSessions;
    const totalOnline = webOnline + premiumOnline;
    const totalMessages = webMessages + premiumMessages;

    // Update stat cards
    console.log("[Combined Stats] Online counts: web=" + webOnline + ", premium=" + premiumOnline + ", total=" + totalOnline);

    // Update Hero Cards
    document.getElementById('heroOnline').textContent = totalOnline;

    // Get widget opens data from backend
    const widgetOpens = webStats.widgetOpens || { total: 0, normal: 0, premium: 0 };
    document.getElementById('heroTotalImpressions').textContent = widgetOpens.total;

    // Calculate conversion rate (talkers / openers)
    const conversionRate = widgetOpens.total > 0 ? ((totalUsers / widgetOpens.total) * 100).toFixed(1) : '0.0';
    document.getElementById('heroConversionRate').textContent = conversionRate + '%';

    // Calculate Active Today (users with activity in last 24 hours) - UNIQUE USERS only
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const webActiveTodayUsers = (webStats.allUsers || []).filter(u =>
        new Date(u.lastActivity) > twentyFourHoursAgo
    );
    const webActiveToday = new Set(webActiveTodayUsers.map(u => getBaseUserId(u.userId))).size;

    const premiumActiveTodayUsers = premiumStatsData && premiumStatsData.users ?
        premiumStatsData.users.filter(u => new Date(u.lastActivity) > twentyFourHoursAgo) : [];
    const premiumActiveToday = new Set(premiumActiveTodayUsers.map(u => getBaseUserId(u.userId))).size;

    const totalActiveToday = webActiveToday + premiumActiveToday;

    // Store for use in middle stat cards
    window.heroTotalUsers = totalUsers;
    window.heroActiveToday = totalActiveToday;
    window.widgetOpens = widgetOpens;

    // Show total sessions (not unique users)
    const totalSessionsFromBackend = webStats.allSessionsForStats ? webStats.allSessionsForStats.length : 0;  // Backend already includes both web + premium
    document.getElementById('totalUsers').textContent = totalSessionsFromBackend;
    document.getElementById('usersOnline').textContent = `${totalOnline} online`;

    // Middle stat cards now show TOPLAM KULLANICI / BUGÜN AKTİF
    document.getElementById('aiHandled').textContent = totalUsers;
    document.getElementById('humanHandled').textContent = totalActiveToday;
    document.getElementById('totalMessages').textContent = totalMessages;

    // Update AI vs Human chart with combined data
    window.combinedAiVsHuman = {
        ai: totalAI,
        human: totalHuman
    };
    updateAiVsHumanChart(window.combinedAiVsHuman);

    // Calculate totalHandled for AI Success Rate Widget
    const totalHandled = totalAI + totalHuman;

    // Update AI Success Rate Widget
    updateAISuccessRate(totalAI, totalHuman, totalHandled);

    // Update Session Duration Widgets (Web + Premium combined)
    updateSessionDurationWidgets(webStats, premiumStatsData, totalUsers, webTotal, premiumTotal);

    // Update Heatmap (Web + Premium combined)
    // Save to global for language changes
                window.lastWebStats = webStats;
                window.lastPremiumStats = premiumStatsData;
                updateHeatmap(webStats, premiumStatsData);
}

function updateAISuccessRate(aiCount, humanCount, totalCount) {
    // Calculate AI Success Rate
    const successRate = totalCount > 0 ? Math.round((aiCount / totalCount) * 100) : 0;

    // Update text values
    document.getElementById('aiSuccessRate').textContent = successRate + '%';
    document.getElementById('aiSuccessCount').textContent = aiCount;
    document.getElementById('humanEscalationCount').textContent = humanCount;
    document.getElementById('totalConversations').textContent = totalCount;

    // Animate circular progress
    const circle = document.getElementById('aiSuccessCircle');
    const radius = 70;
    const circumference = 2 * Math.PI * radius; // ~440
    const offset = circumference - (successRate / 100) * circumference;

    circle.style.strokeDashoffset = offset;

    // Change color based on performance
    if (successRate >= 80) {
        circle.style.stroke = '#50CD89'; // Green - Excellent
    } else if (successRate >= 60) {
        circle.style.stroke = '#FFC700'; // Yellow - Good
    } else {
        circle.style.stroke = '#F1416C'; // Red - Needs improvement
    }
}

function updateSessionDurationWidgets(webStats, premiumStatsData, totalUsers, webTotal, premiumTotal) {
    // Use allSessionsForStats which already contains ALL sessions (web + premium) split by 1-hour rule
    let allUsers = [];

    // Backend already split sessions by 1-hour timeout
    // Each item in allSessionsForStats is already a separate session
    if (webStats && webStats.allSessionsForStats) {
        allUsers = webStats.allSessionsForStats;
    }

    if (allUsers.length === 0) {
        // No data, set defaults
        document.getElementById('avgSessionDuration').textContent = '0.0';
        document.getElementById('minSessionDuration').textContent = '0 dk';
        document.getElementById('maxSessionDuration').textContent = '0 dk';
        document.getElementById('avgMessagesPerSession').textContent = '0';
        document.getElementById('totalSessions').textContent = '0';
        document.getElementById('webSessionCount').textContent = '0';
        document.getElementById('webSessionPercentage').textContent = '0%';
        document.getElementById('premiumSessionCount').textContent = '0';
        document.getElementById('premiumSessionPercentage').textContent = '0%';
        return;
    }

    // Calculate session durations for each user
    // NOTE: Backend (n8n) already does session splitting (W-Guest-47vx4r-s1, W-Guest-47vx4r-s2)
    // Each "user" in allUsers is actually already a separate session!
    // We should NOT split again here - just calculate duration for each session
    const sessionDurations = [];
    const MAX_ACTIVE_GAP_MINUTES = 5; // For duration calculation, max 5 min gaps

    allUsers.forEach(user => {
        const messageCount = user.messageCount || 0;

        if (user.messageTimestamps && user.messageTimestamps.length > 0) {
            // This user (session) has message timestamps - calculate active duration
            const timestamps = user.messageTimestamps.map(t => new Date(t)).sort((a, b) => a - b);

            // Calculate active session duration (cap gaps at 5 minutes)
            let duration = 0;
            for (let j = 1; j < timestamps.length; j++) {
                const activeGapMs = timestamps[j] - timestamps[j-1];
                const activeGapMinutes = activeGapMs / (1000 * 60);
                duration += Math.min(activeGapMinutes, MAX_ACTIVE_GAP_MINUTES);
            }

            sessionDurations.push({
                duration: duration,
                messageCount: timestamps.length,
                channel: user.channel,
                isHumanMode: user.isHumanMode || user.messageSource === 'live_support'
            });
        } else if (user.firstActivity && user.lastActivity) {
            // Fallback: use firstActivity/lastActivity
            const first = new Date(user.firstActivity);
            const last = new Date(user.lastActivity);
            const durationMs = last - first;
            const duration = durationMs / (1000 * 60);

            sessionDurations.push({
                duration: duration,
                messageCount: messageCount,
                channel: user.channel,
                isHumanMode: user.isHumanMode || user.messageSource === 'live_support'
            });
        }
    });

    // Filter out very short sessions (< 5 seconds) and sessions with less than 2 messages
    const validSessions = sessionDurations.filter(s => s.duration >= 0.167 && s.messageCount >= 2);  // Min 10 seconds and 2 messages

    // Check if we have any valid sessions after filtering
    if (validSessions.length === 0) {
        document.getElementById('avgSessionDuration').textContent = '0.0';
        document.getElementById('minSessionDuration').textContent = '0 dk';
        document.getElementById('maxSessionDuration').textContent = '0 dk';
        document.getElementById('avgMessagesPerSession').textContent = '0';
        document.getElementById('totalSessions').textContent = '0';

        // Set Kanal Dağılımı to 0 when no valid sessions
        document.getElementById('webSessionCount').textContent = '0';
        document.getElementById('webSessionPercentage').textContent = '0%';
        document.getElementById('premiumSessionCount').textContent = '0';
        document.getElementById('premiumSessionPercentage').textContent = '0%';
        return;
    }

    // Calculate statistics
    const durations = validSessions.map(s => s.duration);
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    console.log('[Session Duration] Stats:', {
        totalSessions: durations.length,
        min: minDuration.toFixed(2) + ' mins',
        max: maxDuration.toFixed(2) + ' mins',
        avg: avgDuration.toFixed(2) + ' mins'
    });

    // Calculate average messages per session (user messages only)
    const totalUserMessages = validSessions.reduce((sum, s) => sum + (s.userMessageCount || s.messageCount), 0);
    const avgMessages = totalUserMessages / validSessions.length;

    // Use backend's total session count (not filtered)
    const totalSessionsCount = allUsers.length;

    // AI vs Human split - use ALL sessions (allUsers), not just validSessions
    // This ensures AI + Human = Total Sessions
    const aiSessionsAll = allUsers.filter(s => !s.isHumanMode).length;
    const humanSessionsAll = allUsers.filter(s => s.isHumanMode).length;
    const aiPercentage = totalSessionsCount > 0 ? Math.round((aiSessionsAll / totalSessionsCount) * 100) : 0;
    const humanPercentage = totalSessionsCount > 0 ? Math.round((humanSessionsAll / totalSessionsCount) * 100) : 0;

    console.log('[Kanal Dağılımı] AI:', aiSessionsAll, 'Human:', humanSessionsAll, 'Total:', totalSessionsCount, 'AI%:', aiPercentage, 'Human%:', humanPercentage);

    // Update UI
    document.getElementById('avgSessionDuration').textContent = avgDuration.toFixed(1);
    document.getElementById('minSessionDuration').textContent = minDuration.toFixed(1) + ' dk';
    document.getElementById('maxSessionDuration').textContent = maxDuration.toFixed(1) + ' dk';
    document.getElementById('avgMessagesPerSession').textContent = avgMessages.toFixed(1);
    document.getElementById('totalSessions').textContent = totalSessionsCount;

    // Update Kanal Dağılımı widget (AI vs Human) - using ALL sessions
    document.getElementById('webSessionCount').textContent = aiSessionsAll;
    document.getElementById('webSessionPercentage').textContent = aiPercentage + '%';
    document.getElementById('premiumSessionCount').textContent = humanSessionsAll;
    document.getElementById('premiumSessionPercentage').textContent = humanPercentage + '%';
}

function updateHeatmap(webStats, premiumStatsData) {
    // Combine heatmap data from both web and premium
    const combinedHeatmap = Array(7).fill(0).map(() => Array(24).fill(0));

    // Add web chat data
    if (webStats && webStats.heatmapData) {
        for (let day = 0; day < 7; day++) {
            for (let hour = 0; hour < 24; hour++) {
                combinedHeatmap[day][hour] += webStats.heatmapData[day][hour] || 0;
            }
        }
    }

    // Add premium chat data
    if (premiumStatsData && premiumStatsData.heatmapData) {
        for (let day = 0; day < 7; day++) {
            for (let hour = 0; hour < 24; hour++) {
                combinedHeatmap[day][hour] += premiumStatsData.heatmapData[day][hour] || 0;
            }
        }
    }

    // Find max value for color scaling
    let maxMessages = 0;
    combinedHeatmap.forEach(dayData => {
        dayData.forEach(count => {
            if (count > maxMessages) maxMessages = count;
        });
    });

    // Color scale (7 levels)
    const colors = [
        '#E8F4FD', // 0% - Very light blue
        '#B3D9F2', // ~15%
        '#7DB8E8', // ~30%
        '#4897DD', // ~45%
        '#2C7AB5', // ~60%
        '#1A5C8C', // ~75%
        '#0D3E63'  // 100% - Dark blue
    ];

    function getColor(count) {
        if (count === 0) return colors[0];
        if (maxMessages === 0) return colors[0];

        const percentage = count / maxMessages;
        if (percentage < 0.15) return colors[0];
        if (percentage < 0.30) return colors[1];
        if (percentage < 0.45) return colors[2];
        if (percentage < 0.60) return colors[3];
        if (percentage < 0.75) return colors[4];
        if (percentage < 0.90) return colors[5];
        return colors[6];
    }

    // Day names (starting from Monday)
    const dayNames = [t('Pazartesi'), t('Salı'), t('Çarşamba'), t('Perşembe'), t('Cuma'), t('Cumartesi'), t('Pazar')];

    // Generate heatmap HTML
    const container = document.getElementById('heatmapContainer');
    let html = '';

    for (let day = 0; day < 7; day++) {
        // Map display order to data order
        // Display: 0=Mon, 1=Tue, ..., 6=Sun
        // Data: 0=Sun, 1=Mon, ..., 6=Sat
        const dataDay = (day + 1) % 7;
        
        html += '<div style="display: grid; grid-template-columns: 80px repeat(24, 1fr); gap: 2px; margin-bottom: 2px;">';

        // Day label
        html += `<div style="font-size: 12px; font-weight: 600; color: #1e1e2d; display: flex; align-items: center; padding-right: 8px;">${dayNames[day]}</div>`;

        // Hour cells
        for (let hour = 0; hour < 24; hour++) {
            const count = combinedHeatmap[dataDay][hour];
            const color = getColor(count);
            const opacity = count === 0 ? 0.3 : 1;

            html += `<div style="background: ${color}; opacity: ${opacity}; border-radius: 3px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; color: ${count > maxMessages * 0.5 ? 'white' : '#1e1e2d'}; cursor: pointer; transition: transform 0.2s;"
                title="${dayNames[day]} ${hour.toString().padStart(2, '0')}:00 - ${count} mesaj"
                onmouseover="this.style.transform='scale(1.1)'; this.style.zIndex='10';"
                onmouseout="this.style.transform='scale(1)'; this.style.zIndex='1';">
                ${count > 0 ? count : ''}
            </div>`;
        }

        html += '</div>';
    }

    container.innerHTML = html;
}

function transformN8NData(n8nData) {
    // DO NOT reset combinedAiVsHuman here!
    // It will be calculated in updateCombinedStats()

    return {
        totalUsers: n8nData.totalUsers || 0,
        onlineUsers: n8nData.onlineUsers || 0,
        aiHandled: n8nData.aiHandled || 0,
        humanHandled: n8nData.humanHandled || 0,
        totalMessages: n8nData.totalMessages || 0,
        avgResponseTime: '2.5 dk',
        dailyUsers: n8nData.dailyUsers || { labels: [], values: [] },
        weeklyMessages: n8nData.weeklyMessages || { labels: [], values: [] },
        recentUsers: n8nData.recentUsers || [],
        activeUsers: (n8nData.recentUsers || []).slice(0, 10).map(user => ({
            userId: user.userId,
            country: '-',
            countryCode: '',
            city: '-',
            online: new Date(user.lastActivity) > new Date(Date.now() - 5 * 60 * 1000),
            duration: getTimeSince(user.lastActivity),
            messageCount: user.messageCount,
            isHumanMode: user.isHumanMode
        })),
        countries: (n8nData.countries || []).map(country => ({
            code: country.code,
            name: getCountryName(country.code),
            count: country.count,
            percentage: country.percentage
        }))
    };
}

function getTimeSince(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return t('Şimdi');
    if (diffMins < 60) return `${diffMins} ${t('dk önce')}`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ${t('saat önce')}`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ${t('gün önce')}`;
}

function updateDashboard(data) {
    // NOTE: Stat cards will be updated by updateCombinedStats() after premium loads
    // Only update charts that don't need premium data here

    if (data.avgResponseTime) {
        document.getElementById('avgResponseTime').textContent = `Ort. yanıt: ${data.avgResponseTime}`;
    }

    // Update charts that only use web data
    if (data.dailyUsers) {
        updateDailyUsersChart(data.dailyUsers);
    }

    if (data.weeklyMessages) {
        updateMessagesChart(data.weeklyMessages);
    }

    if (data.countries) {
        updateCountryList(data.countries);
    }

    if (data.activeUsers) {
        updateActiveUsersTable(data.activeUsers);
    }

    // DO NOT update stat cards or AI vs Human chart here
    // They will be updated by updateCombinedStats() after both web and premium load
}

function initializeCharts() {
    // Daily Users Chart
    const dailyUsersCtx = document.getElementById('dailyUsersChart').getContext('2d');
    dailyUsersChart = new Chart(dailyUsersCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Kullanıcı Sayısı',
                data: [],
                borderColor: '#009EF7',
                backgroundColor: 'rgba(0, 158, 247, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });

    // AI vs Human Chart - İYİLEŞTİRİLDİ
    const aiVsHumanCtx = document.getElementById('aiVsHumanChart').getContext('2d');
    aiVsHumanChart = new Chart(aiVsHumanCtx, {
        type: 'doughnut',
        data: {
            labels: ['AI Asistan', 'İnsan Desteği'],
            datasets: [{
                data: [0, 0],
                backgroundColor: [
                    '#50CD89',  // AI - Yeşil
                    '#FFC700'   // Human - Sarı
                ],
                borderWidth: 4,
                borderColor: '#ffffff',
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%', // Daha geniş center area
            layout: {
                padding: {
                    top: 10,
                    left: 10,
                    right: 10,
                    bottom: 60
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 13,
                            weight: '500'
                        },
                        boxWidth: 20,
                        boxHeight: 20,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                const dataset = data.datasets[0];
                                const total = dataset.data.reduce((a, b) => a + b, 0);

                                return data.labels.map((label, i) => {
                                    const value = dataset.data[i];
                                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

                                    return {
                                        text: `${label}: ${value} (${percentage}%)`,
                                        fillStyle: dataset.backgroundColor[i],
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} kullanıcı (${percentage}%)`;
                        }
                    }
                }
            }
        },
        plugins: [{
            // Center text plugin
            id: 'centerText',
            afterDatasetsDraw: function(chart) {
                const { ctx, chartArea: { top, bottom, left, right, width, height } } = chart;

                ctx.save();

                const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);

                // Calculate center position
                const centerX = (left + right) / 2;
                const centerY = (top + bottom) / 2;

                // Ana sayı (büyük)
                ctx.font = 'bold 48px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#181C32';

                const text = total.toString();
                ctx.fillText(text, centerX, centerY - 15);

                // Alt text (küçük)
                ctx.font = '14px sans-serif';
                ctx.fillStyle = '#A1A5B7';
                const subText = translations['Toplam Session'][currentLanguage];
                ctx.fillText(subText, centerX, centerY + 18);

                ctx.restore();
            }
        }]
    });

    // Messages Chart
    const messagesCtx = document.getElementById('messagesChart').getContext('2d');
    messagesChart = new Chart(messagesCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Mesaj Sayısı',
                data: [],
                backgroundColor: '#F1416C',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

function updateDailyUsersChart(data) {
    if (!dailyUsersChart || !data) return;

    dailyUsersChart.data.labels = data.labels || [];
    dailyUsersChart.data.datasets[0].data = data.values || [];
    dailyUsersChart.update();
}

function updateAiVsHumanChart(data) {
    if (!aiVsHumanChart || !data) return;

    aiVsHumanChart.data.datasets[0].data = [data.ai || 0, data.human || 0];
    aiVsHumanChart.update();
}

function updateMessagesChart(data) {
    if (!messagesChart || !data) return;

    messagesChart.data.labels = data.labels || [];
    messagesChart.data.datasets[0].data = data.values || [];
    messagesChart.update();
}

function updateCountryList(countries) {
    const container = document.getElementById('countryList');
    if (!container || !countries) return;

    if (countries.length === 0) {
        container.innerHTML = '<div style="padding: 40px; text-align: center; color: #A1A5B7;">Henüz veri yok</div>';
        return;
    }

    container.innerHTML = countries.map(country => `
        <div class="country-item">
            <div class="d-flex align-items-center">
                <div class="country-flag">${getCountryFlag(country.code)}</div>
                <div>
                    <div class="country-name">${country.name}</div>
                    <div class="country-count">${country.count} mesaj</div>
                </div>
            </div>
            <div class="country-percentage">${country.percentage}%</div>
        </div>
    `).join('');
}

function updateActiveUsersTable(users) {
    const tbody = document.getElementById('activeUsersTable');
    if (!tbody || !users) return;

    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center" style="padding: 40px; color: #A1A5B7;">Henüz kullanıcı yok</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td class="table-user-id">${user.userId}</td>
            <td>
                <span class="badge badge-primary">${user.messageCount || 0}</span>
            </td>
            <td>
                <span class="badge ${user.isHumanMode ? 'badge-warning' : 'badge-success'}">
                    ${user.isHumanMode ? '👤 İnsan' : '🤖 AI'}
                </span>
            </td>
            <td>
                <span class="badge ${user.online ? 'badge-success' : 'badge-light'}">
                    ${user.online ? t('Çevrimiçi') : t('Çevrimdışı')}
                </span>
            </td>
            <td>${user.duration || '-'}</td>
        </tr>
    `).join('');
}

function getCountryFlag(code) {
    if (!code) return '🌐';
    const codePoints = code
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}

function getCountryName(code) {
    const countryNames = {
        'TR': 'Türkiye', 'US': 'United States', 'GB': 'United Kingdom',
        'DE': 'Germany', 'FR': 'France', 'IT': 'Italy', 'ES': 'Spain',
        'NL': 'Netherlands', 'BE': 'Belgium', 'CH': 'Switzerland',
        'AT': 'Austria', 'SE': 'Sweden', 'NO': 'Norway', 'DK': 'Denmark',
        'FI': 'Finland', 'PL': 'Poland', 'CZ': 'Czech Republic',
        'GR': 'Greece', 'PT': 'Portugal', 'IE': 'Ireland', 'RU': 'Russia',
        'UA': 'Ukraine', 'RO': 'Romania', 'BG': 'Bulgaria', 'HR': 'Croatia',
        'RS': 'Serbia', 'HU': 'Hungary', 'SK': 'Slovakia', 'SI': 'Slovenia',
        'CA': 'Canada', 'MX': 'Mexico', 'BR': 'Brazil', 'AR': 'Argentina',
        'CL': 'Chile', 'CO': 'Colombia', 'PE': 'Peru', 'VE': 'Venezuela',
        'JP': 'Japan', 'CN': 'China', 'KR': 'South Korea', 'IN': 'India',
        'AU': 'Australia', 'NZ': 'New Zealand', 'SG': 'Singapore',
        'MY': 'Malaysia', 'TH': 'Thailand', 'ID': 'Indonesia', 'PH': 'Philippines',
        'VN': 'Vietnam', 'AE': 'UAE', 'SA': 'Saudi Arabia', 'IL': 'Israel',
        'EG': 'Egypt', 'ZA': 'South Africa', 'NG': 'Nigeria', 'KE': 'Kenya'
    };
    return countryNames[code] || code;
}

function updateLastUpdate() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('lastUpdate').textContent = timeStr;
}

// Users Page
async function loadAllUsers() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 40px; color: #A1A5B7;">Yükleniyor...</td></tr>';

    try {
        const response = await fetch(N8N_STATS_URL);
        const rawData = await response.json();
        const n8nData = Array.isArray(rawData) ? rawData[0] : rawData;

        // Group sessions by base userId (remove -s1, -s2, etc.)
        const userGroups = {};
        (n8nData.allUsers || []).forEach(user => {
            const baseUserId = user.userId.replace(/-s\d+$/, '');

            if (!userGroups[baseUserId]) {
                userGroups[baseUserId] = {
                    userId: baseUserId,
                    userName: user.userName || 'Anonim',
                    messageCount: 0,
                    lastActivity: user.lastActivity,
                    isHumanMode: user.isHumanMode,
                    country: user.country || '',
                    city: user.city || '',
                };
            }

            // Aggregate data from all sessions
            userGroups[baseUserId].messageCount += user.messageCount || 0;

            // Keep most recent lastActivity
            if (new Date(user.lastActivity) > new Date(userGroups[baseUserId].lastActivity)) {
                userGroups[baseUserId].lastActivity = user.lastActivity;
            }

            // If any session is in human mode, mark as human mode
            if (user.isHumanMode) {
                userGroups[baseUserId].isHumanMode = true;
            }
        });

        allUsersData = Object.values(userGroups).map(user => ({
            userId: user.userId,
            userName: user.userName,
            messageCount: user.messageCount,
            lastActivity: user.lastActivity,
            online: new Date(user.lastActivity) > new Date(Date.now() - 5 * 60 * 1000),
            isHumanMode: user.isHumanMode,
            country: user.country,
            city: user.city,
            countryFlag: user.country ? getCountryFlag(user.country) : '🌐'
        }));

        if (allUsersData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding: 40px; color: #A1A5B7;">Kullanıcı bulunamadı</td></tr>';
            document.getElementById('usersPagination').style.display = 'none';
            return;
        }

        // Reset to page 1
        currentUsersPage = 1;
        renderUsers();
        renderUsersPagination();
    } catch (error) {
        console.error('Kullanıcılar yüklenirken hata:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding: 40px; color: #F1416C;">Kullanıcılar yüklenirken bir hata oluştu</td></tr>';
        document.getElementById('usersPagination').style.display = 'none';
    }
}

function renderUsers() {
    const tbody = document.getElementById('usersTableBody');

    // Calculate pagination
    const startIndex = (currentUsersPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const usersToShow = allUsersData.slice(startIndex, endIndex);

    tbody.innerHTML = usersToShow.map(user => `
        <tr class="user-row" data-userid="${user.userId}" style="cursor: pointer;">
            <td class="table-user-id">${user.userId}</td>
            <td>${user.userName || 'Anonim'}</td>
            <td>
                <span class="badge badge-primary">${user.messageCount || 0}</span>
            </td>
            <td>${getTimeSince(user.lastActivity)}</td>
            <td>${user.countryFlag} ${user.country || '-'}${user.city ? ', ' + user.city : ''}</td>
            <td>
                <span class="badge ${user.isHumanMode ? 'badge-warning' : 'badge-success'}">
                    ${user.isHumanMode ? '👤 Live Support' : '🤖 AI Bot'}
                </span>
            </td>
            <td>
                <span class="badge ${user.online ? 'badge-success' : 'badge-light'}">
                    ${user.online ? t('Çevrimiçi') : t('Çevrimdışı')}
                </span>
            </td>
        </tr>
    `).join('');
}

function renderUsersPagination() {
    const totalPages = Math.ceil(allUsersData.length / usersPerPage);
    const container = document.getElementById('usersPagination');

    if (totalPages <= 1) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'flex';
    container.style.justifyContent = 'space-between';
    container.style.alignItems = 'center';
    container.style.padding = '20px';
    container.style.gap = '20px';

    // Per page selector - Apple Style
    const perPageHtml = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <span style="color: #86868b; font-size: 14px; font-weight: 500;">Göster</span>
            <select onchange="changeUsersPerPage(this.value)" style="padding: 7px 32px 7px 12px; border: none; border-radius: 10px; background: #f5f5f7; cursor: pointer; font-size: 14px; font-weight: 500; color: #1d1d1f; outline: none; box-shadow: 0 1px 3px rgba(0,0,0,0.05); appearance: none; background-image: url('data:image/svg+xml;utf8,<svg fill=\"%231d1d1f\" height=\"20\" viewBox=\"0 0 20 20\" width=\"20\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M5 7l5 5 5-5z\"/></svg>'); background-repeat: no-repeat; background-position: right 8px center;">
                <option value="10" ${usersPerPage === 10 ? 'selected' : ''}>10</option>
                <option value="25" ${usersPerPage === 25 ? 'selected' : ''}>25</option>
                <option value="50" ${usersPerPage === 50 ? 'selected' : ''}>50</option>
                <option value="100" ${usersPerPage === 100 ? 'selected' : ''}>100</option>
            </select>
            <span style="color: #86868b; font-size: 14px;">kayıt · Toplam ${allUsersData.length}</span>
        </div>
    `;

    // Page numbers - Apple Style
    let pagesHtml = '<div style="display: flex; gap: 6px;">';

    // Previous button
    pagesHtml += `<button onclick="changeUsersPage(${currentUsersPage - 1})"
        style="min-width: 36px; height: 36px; padding: 0; border: none; border-radius: 8px; background: ${currentUsersPage === 1 ? '#f5f5f7' : 'white'}; cursor: ${currentUsersPage === 1 ? 'not-allowed' : 'pointer'}; font-size: 16px; color: ${currentUsersPage === 1 ? '#d2d2d7' : '#1d1d1f'}; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: all 0.2s; display: flex; align-items: center; justify-content: center;"
        onmouseover="if(${currentUsersPage !== 1}) this.style.background='#f5f5f7'"
        onmouseout="if(${currentUsersPage !== 1}) this.style.background='white'"
        ${currentUsersPage === 1 ? 'disabled' : ''}>‹</button>`;

    // Page numbers (show max 7 pages)
    const maxVisible = 7;
    let startPage = Math.max(1, currentUsersPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
        pagesHtml += `<button onclick="changeUsersPage(1)"
            style="min-width: 36px; height: 36px; padding: 0; border: none; border-radius: 8px; background: white; cursor: pointer; font-size: 14px; font-weight: 500; color: #1d1d1f; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: all 0.2s; display: flex; align-items: center; justify-content: center;"
            onmouseover="this.style.background='#f5f5f7'"
            onmouseout="this.style.background='white'">1</button>`;
        if (startPage > 2) pagesHtml += `<span style="color: #86868b; font-size: 16px; padding: 0 4px; display: flex; align-items: center;">···</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
        const active = i === currentUsersPage;
        pagesHtml += `<button onclick="changeUsersPage(${i})"
            style="min-width: 36px; height: 36px; padding: 0; border: none; border-radius: 8px; background: ${active ? '#007AFF' : 'white'}; color: ${active ? 'white' : '#1d1d1f'}; cursor: pointer; font-size: 14px; font-weight: ${active ? '600' : '500'}; box-shadow: 0 1px 3px rgba(0,0,0,${active ? '0.15' : '0.08'}); transition: all 0.2s; display: flex; align-items: center; justify-content: center;"
            onmouseover="if(${!active}) this.style.background='#f5f5f7'"
            onmouseout="if(${!active}) this.style.background='white'">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) pagesHtml += `<span style="color: #86868b; font-size: 16px; padding: 0 4px; display: flex; align-items: center;">···</span>`;
        pagesHtml += `<button onclick="changeUsersPage(${totalPages})"
            style="min-width: 36px; height: 36px; padding: 0; border: none; border-radius: 8px; background: white; cursor: pointer; font-size: 14px; font-weight: 500; color: #1d1d1f; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: all 0.2s; display: flex; align-items: center; justify-content: center;"
            onmouseover="this.style.background='#f5f5f7'"
            onmouseout="this.style.background='white'">${totalPages}</button>`;
    }

    // Next button
    pagesHtml += `<button onclick="changeUsersPage(${currentUsersPage + 1})"
        style="min-width: 36px; height: 36px; padding: 0; border: none; border-radius: 8px; background: ${currentUsersPage === totalPages ? '#f5f5f7' : 'white'}; cursor: ${currentUsersPage === totalPages ? 'not-allowed' : 'pointer'}; font-size: 16px; color: ${currentUsersPage === totalPages ? '#d2d2d7' : '#1d1d1f'}; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: all 0.2s; display: flex; align-items: center; justify-content: center;"
        onmouseover="if(${currentUsersPage !== totalPages}) this.style.background='#f5f5f7'"
        onmouseout="if(${currentUsersPage !== totalPages}) this.style.background='white'"
        ${currentUsersPage === totalPages ? 'disabled' : ''}>›</button>`;

    pagesHtml += '</div>';

    container.innerHTML = perPageHtml + pagesHtml;
}

function changeUsersPage(page) {
    const totalPages = Math.ceil(allUsersData.length / usersPerPage);
    if (page < 1 || page > totalPages) return;

    currentUsersPage = page;
    renderUsers();
    renderUsersPagination();
}

function changeUsersPerPage(value) {
    usersPerPage = parseInt(value);
    currentUsersPage = 1; // Reset to first page
    renderUsers();
    renderUsersPagination();
}

// Show user messages in modal (same as premium)
async function showUserMessages(userId) {
    try {
        // Remove W- or P- prefix and session suffix (-s1, -s2) to get database userId
        let originalUserId = userId.replace(/^[WP]-/, ''); // Remove W- or P- prefix
        originalUserId = originalUserId.replace(/-s\d+$/, ''); // Remove session suffix
        console.log('🔍 showUserMessages - userId:', userId, '→ originalUserId:', originalUserId);
        const response = await fetch(`/api/stats?userId=${originalUserId}`);
        const messages = await response.json();
        console.log('📩 showUserMessages - messages received:', messages.length);
        showConversationModal(userId, messages, 'web');
    } catch (error) {
        console.error('Konuşma yüklenirken hata:', error);
        alert('Konuşma yüklenirken hata oluştu');
    }
}

// Premium Chat Stats
async function loadPremiumUsers() {
    const tbody = document.getElementById('premiumTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding: 40px; color: #A1A5B7;">Yükleniyor...</td></tr>';

    try {
        // N8N'den premium kullanıcıları çek
        console.log('[Premium] Fetching from N8N API...');
        const response = await fetch('/api/stats?premium=true');
        const rawData = await response.json();
        console.log('[Premium] Raw data received:', rawData);

        // N8N array içinde object döndürüyor: [{users: [...]}]
        const data = Array.isArray(rawData) ? rawData[0] : rawData;
        console.log('[Premium] Parsed data:', data);
        console.log('[Premium] Users count:', data?.users?.length || 0);

        if (!data || !data.users || data.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding: 40px; color: #A1A5B7;">Henüz premium kullanıcı yok</td></tr>';
            document.getElementById('premiumPagination').style.display = 'none';
            return;
        }

        // DON'T group sessions - display each session as separate entry
        allPremiumData = data.users.map(user => ({
            userId: user.userId,  // Keep session suffix (P-Guest-xxx-s1, P-Guest-xxx-s2)
            originalUserId: user.originalUserId || user.userId,
            userName: user.userName || 'Anonim',
            messageCount: user.messageCount || 0,
            lastActivity: user.lastActivity,
            firstActivity: user.firstActivity,
            messageSource: user.messageSource,  // 'ai_bot' or 'live_support'
            country: user.country || '',
            city: user.city || '',
            sessionNumber: user.sessionNumber || 1,
            totalSessions: user.totalSessions || 1
        }));

        // Debug: Check all sessions
        console.log('[Premium] All sessions (not grouped):', allPremiumData.map(u => ({
            userId: u.userId,
            messageSource: u.messageSource,
            messageCount: u.messageCount,
            session: (u.sessionNumber || 1) + '/' + (u.totalSessions || 1)
        })));

        // Reset to page 1
        currentPremiumPage = 1;
        renderPremiumUsers();
        renderPremiumPagination();
    } catch (error) {
        console.error('Premium stats yüklenirken hata:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding: 40px; color: #F1416C;">Veriler yüklenirken bir hata oluştu</td></tr>';
        document.getElementById('premiumPagination').style.display = 'none';
    }
}

function renderPremiumUsers() {
    const tbody = document.getElementById('premiumTableBody');

    // Calculate pagination
    const startIndex = (currentPremiumPage - 1) * premiumPerPage;
    const endIndex = startIndex + premiumPerPage;
    const usersToShow = allPremiumData.slice(startIndex, endIndex);

    tbody.innerHTML = usersToShow.map(user => {
        const timeSince = getTimeSince(user.lastActivity);
        const countryFlag = user.country ? getCountryFlag(user.country) : '🌐';
        const countryText = user.country || '-';
        const cityText = user.city ? ', ' + user.city : '';
        const online = new Date(user.lastActivity) > new Date(Date.now() - 5 * 60 * 1000);

        // Debug: Log messageSource for each user
        if (user.userId === 'P-Guest-4js2x3') {
            console.log('🔍 [Render Debug] P-Guest-4js2x3 messageSource:', user.messageSource);
        }

        return `
            <tr class="premium-row" data-userid="${user.userId}" style="background: #FFFBF8; cursor: pointer;">
                <td class="table-user-id">
                    <span style="color: #9F7AEA;">⭐</span> ${user.userId}
                </td>
                <td>${user.userName || 'Anonim'}</td>
                <td>
                    <span class="badge badge-primary">${user.messageCount || 0}</span>
                </td>
                <td>${timeSince || '-'}</td>
                <td>${countryFlag} ${countryText}${cityText}</td>
                <td>
                    <span class="badge ${user.messageSource === 'ai_bot' ? 'badge-success' : 'badge-warning'}">
                        ${user.messageSource === 'ai_bot' ? '🤖 AI Bot' : '👤 Live Support'}
                    </span>
                </td>
                <td>
                    <span class="badge ${online ? 'badge-success' : 'badge-light'}">
                        ${online ? t('Çevrimiçi') : t('Çevrimdışı')}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

function renderPremiumPagination() {
    const totalPages = Math.ceil(allPremiumData.length / premiumPerPage);
    const container = document.getElementById('premiumPagination');

    if (totalPages <= 1) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'flex';
    container.style.justifyContent = 'space-between';
    container.style.alignItems = 'center';
    container.style.padding = '20px';
    container.style.gap = '20px';

    // Per page selector - Apple Style (Premium)
    const perPageHtml = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <span style="color: #86868b; font-size: 14px; font-weight: 500;">Göster</span>
            <select onchange="changePremiumPerPage(this.value)" style="padding: 7px 32px 7px 12px; border: none; border-radius: 10px; background: #f5f5f7; cursor: pointer; font-size: 14px; font-weight: 500; color: #1d1d1f; outline: none; box-shadow: 0 1px 3px rgba(0,0,0,0.05); appearance: none; background-image: url('data:image/svg+xml;utf8,<svg fill=\"%231d1d1f\" height=\"20\" viewBox=\"0 0 20 20\" width=\"20\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M5 7l5 5 5-5z\"/></svg>'); background-repeat: no-repeat; background-position: right 8px center;">
                <option value="10" ${premiumPerPage === 10 ? 'selected' : ''}>10</option>
                <option value="25" ${premiumPerPage === 25 ? 'selected' : ''}>25</option>
                <option value="50" ${premiumPerPage === 50 ? 'selected' : ''}>50</option>
                <option value="100" ${premiumPerPage === 100 ? 'selected' : ''}>100</option>
            </select>
            <span style="color: #86868b; font-size: 14px;">kayıt · Toplam ${allPremiumData.length}</span>
        </div>
    `;

    // Page numbers - Apple Style (Premium)
    let pagesHtml = '<div style="display: flex; gap: 6px;">';

    // Previous button
    pagesHtml += `<button onclick="changePremiumPage(${currentPremiumPage - 1})"
        style="min-width: 36px; height: 36px; padding: 0; border: none; border-radius: 8px; background: ${currentPremiumPage === 1 ? '#f5f5f7' : 'white'}; cursor: ${currentPremiumPage === 1 ? 'not-allowed' : 'pointer'}; font-size: 16px; color: ${currentPremiumPage === 1 ? '#d2d2d7' : '#1d1d1f'}; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: all 0.2s; display: flex; align-items: center; justify-content: center;"
        onmouseover="if(${currentPremiumPage !== 1}) this.style.background='#f5f5f7'"
        onmouseout="if(${currentPremiumPage !== 1}) this.style.background='white'"
        ${currentPremiumPage === 1 ? 'disabled' : ''}>‹</button>`;

    // Page numbers (show max 7 pages)
    const maxVisible = 7;
    let startPage = Math.max(1, currentPremiumPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
        pagesHtml += `<button onclick="changePremiumPage(1)"
            style="min-width: 36px; height: 36px; padding: 0; border: none; border-radius: 8px; background: white; cursor: pointer; font-size: 14px; font-weight: 500; color: #1d1d1f; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: all 0.2s; display: flex; align-items: center; justify-content: center;"
            onmouseover="this.style.background='#f5f5f7'"
            onmouseout="this.style.background='white'">1</button>`;
        if (startPage > 2) pagesHtml += `<span style="color: #86868b; font-size: 16px; padding: 0 4px; display: flex; align-items: center;">···</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
        const active = i === currentPremiumPage;
        pagesHtml += `<button onclick="changePremiumPage(${i})"
            style="min-width: 36px; height: 36px; padding: 0; border: none; border-radius: 8px; background: ${active ? '#9F7AEA' : 'white'}; color: ${active ? 'white' : '#1d1d1f'}; cursor: pointer; font-size: 14px; font-weight: ${active ? '600' : '500'}; box-shadow: 0 1px 3px rgba(0,0,0,${active ? '0.15' : '0.08'}); transition: all 0.2s; display: flex; align-items: center; justify-content: center;"
            onmouseover="if(${!active}) this.style.background='#f5f5f7'"
            onmouseout="if(${!active}) this.style.background='white'">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) pagesHtml += `<span style="color: #86868b; font-size: 16px; padding: 0 4px; display: flex; align-items: center;">···</span>`;
        pagesHtml += `<button onclick="changePremiumPage(${totalPages})"
            style="min-width: 36px; height: 36px; padding: 0; border: none; border-radius: 8px; background: white; cursor: pointer; font-size: 14px; font-weight: 500; color: #1d1d1f; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: all 0.2s; display: flex; align-items: center; justify-content: center;"
            onmouseover="this.style.background='#f5f5f7'"
            onmouseout="this.style.background='white'">${totalPages}</button>`;
    }

    // Next button
    pagesHtml += `<button onclick="changePremiumPage(${currentPremiumPage + 1})"
        style="min-width: 36px; height: 36px; padding: 0; border: none; border-radius: 8px; background: ${currentPremiumPage === totalPages ? '#f5f5f7' : 'white'}; cursor: ${currentPremiumPage === totalPages ? 'not-allowed' : 'pointer'}; font-size: 16px; color: ${currentPremiumPage === totalPages ? '#d2d2d7' : '#1d1d1f'}; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: all 0.2s; display: flex; align-items: center; justify-content: center;"
        onmouseover="if(${currentPremiumPage !== totalPages}) this.style.background='#f5f5f7'"
        onmouseout="if(${currentPremiumPage !== totalPages}) this.style.background='white'"
        ${currentPremiumPage === totalPages ? 'disabled' : ''}>›</button>`;

    pagesHtml += '</div>';

    container.innerHTML = perPageHtml + pagesHtml;
}

function changePremiumPage(page) {
    const totalPages = Math.ceil(allPremiumData.length / premiumPerPage);
    if (page < 1 || page > totalPages) return;

    currentPremiumPage = page;
    renderPremiumUsers();
    renderPremiumPagination();
}

function changePremiumPerPage(value) {
    premiumPerPage = parseInt(value);
    currentPremiumPage = 1; // Reset to first page
    renderPremiumUsers();
    renderPremiumPagination();
}

async function viewConversation(userId) {
    try {
        // Remove W- or P- prefix and session suffix (-s1, -s2) to get database userId
        let originalUserId = userId.replace(/^[WP]-/, ''); // Remove W- or P- prefix
        originalUserId = originalUserId.replace(/-s\d+$/, ''); // Remove session suffix
        console.log('🔍 viewConversation - userId:', userId, '→ originalUserId:', originalUserId);

        // N8N'den kullanıcı mesajlarını çek
        const response = await fetch(`/api/stats?userId=${originalUserId}`);
        const rawMessages = await response.json();
        console.log('📩 viewConversation - messages received:', rawMessages.length || 0);

        // N8N array döndürüyor
        const messages = Array.isArray(rawMessages) ? rawMessages : [];

        if (messages.length === 0) {
            showConversationModal(userId, [], 'premium');
            return;
        }

        // N8N formatını modal formatına çevir
        const formattedMessages = messages.map(msg => ({
            text: msg.message || msg.text,
            from: msg.from,
            time: msg.createdAt || msg.time,
            human_mode: msg.human_mode
        }));

        showConversationModal(userId, formattedMessages, 'premium');
    } catch (error) {
        console.error('Konuşma yüklenirken hata:', error);
        alert('Konuşma yüklenirken hata oluştu');
    }
}

function showConversationModal(userId, messages, channel) {
    const modal = document.getElementById('conversationModal');
    const conversationContent = document.getElementById('conversationContent');
    const modalUserId = document.getElementById('modalUserId');

    // Track which conversation is open for real-time updates
    window.currentOpenUserId = userId;
    window.currentOpenChannel = channel;
    console.log('🎯 Modal opened (from api.js) - tracking userId:', window.currentOpenUserId, 'channel:', window.currentOpenChannel);

    modalUserId.textContent = userId;

    if (!messages || messages.length === 0) {
        conversationContent.innerHTML = '<div style="padding: 40px; text-align: center; color: #A1A5B7;">Henüz mesaj yok</div>';
    } else {
        conversationContent.innerHTML = messages.map(msg => {
            // Support both N8N format (from: 'user'|'bot') and Premium format (from: 'visitor'|'admin')
            const isUser = msg.from === 'user' || msg.from === 'visitor';
            const messageText = msg.message || msg.text;
            const messageTime = msg.createdAt || msg.time || new Date();

            // Determine message class and label
            let messageClass, messageLabel;
            if (isUser) {
                messageClass = 'visitor';
                messageLabel = '👤 Kullanıcı';
            } else if (msg.from === 'admin' && msg.human_mode === true) {
                // Only admin messages with human_mode=true are Live Support
                messageClass = 'live-support';
                messageLabel = '🎧 Live Support';
            } else {
                // All other non-user messages (bot, or admin without human_mode) are AI Bot
                messageClass = 'admin';
                messageLabel = '🤖 AI Bot';
            }

            // Format date in Turkish style: DD.MM.YYYY HH:MM:SS
            const date = new Date(messageTime);
            const formattedTime = date.toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }) + ' ' + date.toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            return `
                <div class="conversation-message ${messageClass}">
                    <div class="conversation-message-content">
                        <div class="conversation-message-header">
                            <span>${messageLabel}</span>
                        </div>
                        <div class="conversation-message-bubble">
                            <div class="conversation-message-text">${escapeHtml(messageText)}</div>
                            <div class="conversation-message-time">${formattedTime}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    modal.classList.add('active');

    // Auto-scroll to bottom after modal is visible
    setTimeout(() => {
        const modalBody = document.querySelector('.modal-body');
        if (modalBody) {
            modalBody.scrollTop = modalBody.scrollHeight;
        }
    }, 100);
}

function closeConversationModal() {
    // Clear tracking variables
    window.currentOpenUserId = null;
    window.currentOpenChannel = null;
    document.getElementById('conversationModal').classList.remove('active');
}

// Close modal on outside click
window.onclick = function(event) {
    const modal = document.getElementById('conversationModal');
    if (event.target === modal) {
        closeConversationModal();
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}

// Event delegation for click handlers
document.addEventListener('click', function(event) {
    // User row click - check if clicked element or parent is a user row
    let userRow = event.target.classList.contains('user-row') ? event.target : event.target.closest('.user-row');
    if (userRow) {
        const userId = userRow.getAttribute('data-userid');
        if (userId) {
            showUserMessages(userId);
        }
        return;
    }

    // Premium row click - check if clicked element or parent is a premium row
    let premiumRow = event.target.classList.contains('premium-row') ? event.target : event.target.closest('.premium-row');
    if (premiumRow) {
        const userId = premiumRow.getAttribute('data-userid');
        if (userId) {
            viewConversation(userId);
        }
    }
});

// Listen for language changes and re-render tables
window.addEventListener('languageChanged', function() {
    console.log('[API] Language changed, re-rendering tables...');

    // Re-render users tables if they have data
    if (allUsersData.length > 0) {
        renderUsers();
        renderUsersPagination();
    }

    // Re-render premium users table if visible and has data
    if (allPremiumData.length > 0) {
        renderPremiumUsers();
        renderPremiumPagination();
    }
});


// Search functionality for Web Users
function filterUsersTable(searchTerm) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    const rows = tbody.getElementsByTagName('tr');
    let visibleCount = 0;

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const userId = (row.getAttribute('data-userid') ||
                       row.querySelector('.table-user-id')?.textContent ||
                       '').toLowerCase();
        const rowText = row.textContent.toLowerCase();

        if (searchTerm === '' || userId.includes(searchTerm) || rowText.includes(searchTerm)) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    }
}

// Search functionality for Premium Users
function filterPremiumTable(searchTerm) {
    const tbody = document.getElementById('premiumTableBody');
    if (!tbody) return;

    const rows = tbody.getElementsByTagName('tr');
    let visibleCount = 0;

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const userId = (row.getAttribute('data-userid') ||
                       row.querySelector('.table-user-id')?.textContent ||
                       '').toLowerCase();
        const rowText = row.textContent.toLowerCase();

        if (searchTerm === '' || userId.includes(searchTerm) || rowText.includes(searchTerm)) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    }
}

// Add event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const usersSearch = document.getElementById('usersSearch');
    const premiumSearch = document.getElementById('premiumSearch');

    if (usersSearch) {
        usersSearch.addEventListener('input', function(e) {
            filterUsersTable(e.target.value.toLowerCase());
        });
    }

    if (premiumSearch) {
        premiumSearch.addEventListener('input', function(e) {
            filterPremiumTable(e.target.value.toLowerCase());
        });
    }
});
