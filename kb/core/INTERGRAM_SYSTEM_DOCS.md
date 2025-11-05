# Intergram Chat System - Knowledge Bank

**Last Updated**: 2025-10-27 (Live Support message styling, human_mode field handling, stats file persistence)
**Purpose**: Quick reference guide for dual intergram chat architecture and operations

---

## System Overview

**What it is**: Dual chat system with normal web chat and premium AI/human mode switching, integrated with N8N AI workflows and Telegram.

**Why it exists**:
- Normal chat: Simple bot for public website visitors
- Premium chat: Advanced support with AI/live agent tabs for premium users
- Centralized stats dashboard for monitoring both systems

**Key Components**:
- Two independent intergram chat servers (ports 3000/3001)
- N8N workflow engine (AI responses + database storage)
- Stats dashboard (monitoring + settings control)
- Telegram bot (admin notifications + manual replies)

---

## Architecture Map

### Containers & URLs

| Service | Container | Port | Public URL | Purpose |
|---------|-----------|------|------------|---------|
| Normal Web Chat | root-intergram-1 | 3000 | chat.photier.co | Simple chat widget |
| Premium Chat | root-intergram-premium-1 | 3001 | p-chat.photier.co | AI/Human mode tabs |
| Stats Dashboard | root-stats-1 | 80 | stats.photier.co | Monitoring + Settings |
| N8N | - | - | n8n.photier.co | AI workflows + DB |

### Key URLs & Endpoints

**Normal Web Chat** (port 3000):
- `/send-to-user` - Receive AI responses from N8N
- `/api/settings` - Control service messages (GET/POST)
- `/usage-start` - Track widget usage
- N8N Webhook: `https://n8n.photier.co/webhook/intergram-message`

**Premium Chat** (port 3001):
- `/send-to-user` - Receive AI/human responses
- `/api/settings` - Control service messages (GET/POST)
- N8N Webhook: `https://n8n.photier.co/webhook/admin-chat`

**Stats Dashboard**:
- N8N All Stats: `https://n8n.photier.co/webhook/photier-stats`
- N8N Premium Stats: `https://n8n.photier.co/webhook/photier-stats?premium=true`
- N8N User Messages: `https://n8n.photier.co/webhook/photier-stats?userId=XXX`

**WebSocket (Real-time Updates)**:
- Socket.io v2.2.0 (client-side)
- Namespace: `/stats` (dashboard connections only, isolated from chat)
- Server-side broadcasting from both chat servers (ports 3000/3001)

---

## Data Flow

### Normal Web Chat Flow
1. User sends message → Intergram server
2. Server extracts IP → geoip-lite → country/city
3. Server → N8N webhook (POST with userId, message, country, city, premium: false, human_mode: false)
4. N8N → AI processing (RAG from Photier data)
5. N8N → Database storage (photier.rag table with country/city, human_mode)
6. N8N → Intergram `/send-to-user` endpoint
7. Intergram → User via Socket.io

**Optional**: If service messages enabled → Also send to Telegram

### Premium Chat Flow
1. User selects tab (AI Bot or Live Support)
2. User sends message → Server (with `human_mode` flag, `premium: true`, country/city)
3. Server → N8N webhook
4. N8N logic:
   - If `human_mode: false` → AI processing
   - If `human_mode: true` → Telegram only (no AI)
5. N8N → Database (with premium flag, country/city, human_mode)
6. N8N → Intergram `/send-to-user`
7. Intergram → User (correct tab only)

**Key Difference**: Premium has TWO separate conversation histories (one per tab).

### Admin Reply Flow (Live Support)
1. Admin sends reply via Telegram
2. Telegram → N8N webhook
3. N8N → Save to database with `from: 'admin'`, `human_mode: true`
4. N8N → Intergram `/send-to-user` endpoint
5. Intergram → User via Socket.io
6. Stats Dashboard → Displays as "👤 Live Support" (purple background)

**CRITICAL**: Only messages with **both** `from === 'admin'` **AND** `human_mode === true` show as Live Support in stats.

---

## Important Features

### Live Support Message Styling (Stats Dashboard)

**Purpose**: Visually differentiate AI bot responses from human admin responses in conversation history.

**Implementation Date**: 2025-10-27

**Color Coding**:
- **AI Bot**: Green background (#E8FFF3), label "🤖 AI Bot"
- **Live Support**: Purple background (#e7dcf6, matching widget), label "👤 Live Support"
- **User**: Blue background (#F1FAFF), label "👤 Kullanıcı"

**Logic** (CRITICAL - Must be exact):
```javascript
// CORRECT WAY - Only admin messages with human_mode=true
if (msg.from === 'admin' && msg.human_mode === true) {
    messageClass = 'live-support';
    messageLabel = '👤 Live Support';
} else if (msg.from === 'bot' || msg.from === 'admin') {
    messageClass = 'admin';
    messageLabel = '🤖 AI Bot';
}
```

**WRONG WAY** (causes all messages to be purple):
```javascript
// DON'T DO THIS - Makes all bot messages Live Support
if ((msg.from === 'bot' || msg.from === 'admin') && msg.human_mode) {
    messageClass = 'live-support';
}
```

**Why this matters**:
- AI responses have `from: 'bot'` and should NEVER be Live Support
- Only Telegram admin replies have `from: 'admin'` AND `human_mode: true`
- Incorrect logic causes all bot responses to show as Live Support

**Files Updated**:
1. `/root/stats/html/index.html` - 3 functions:
   - `loadUserMessages()` (line ~1891)
   - `showConversationModal()` (line ~1972)
   - `appendMessageToModal()` (line ~2698)

2. `/root/stats/html/api.js` - 1 function:
   - `showConversationModal()` (line ~1498)

**CSS Styling**:
```css
.conversation-message.live-support {
    background: #e7dcf6;
    border-left: 3px solid #6b5b95;
}
```

**Database Fields Required**:
- `from`: Must be 'admin', 'bot', 'user', or 'visitor'
- `human_mode`: Boolean (true/false or null)
- Missing `human_mode` defaults to AI Bot (safe fallback)

**Common Mistakes**:
1. Checking `human_mode` for both 'bot' and 'admin' messages
2. Using `!msg.human_mode` instead of `msg.human_mode === true`
3. Not handling null/undefined `human_mode` values
4. Forgetting to update all 4 functions (3 in index.html, 1 in api.js)

**Testing**:
```bash
# Check if human_mode exists in API response
curl "https://n8n.photier.co/webhook/photier-stats?userId=P-Guest-XXX" | \
  python3 -m json.tool | grep -A 3 "human_mode"

# Verify in browser console
document.querySelectorAll('.conversation-message.live-support').length
# Should only count actual Live Support messages, not AI bot messages
```

### human_mode Field (Database)

**Purpose**: Track whether user is in AI mode or Live Support mode for accurate analytics and message styling.

**Storage**: N8N database table `photier.rag`

**Data Type**: Boolean (true/false)

**Set by**:
- Widget tab selection (Premium chat only)
- Default: `false` (AI Bot mode)
- Switches to `true` when user clicks "Live Support" tab

**Used by**:
1. **N8N Workflow**: Determines AI processing vs Telegram forwarding
2. **Stats Dashboard**: Determines message color and label
3. **Analytics**: Tracks AI vs human handling rates

**Field Values**:
- `false` or `null` → AI Bot message (green)
- `true` → Live Support message (purple)

**Important Notes**:
- Normal web chat: Always `false` (no Live Support option)
- Premium chat: Can be `true` or `false` depending on active tab
- Admin replies from Telegram: Always stored with `human_mode: true`
- Must be preserved when saving messages to database

**N8N Webhook Payload**:
```javascript
{
  userId: 'P-Guest-abc123',
  message: 'User message text',
  from: 'user',  // or 'admin', 'bot'
  premium: true,
  human_mode: false,  // or true
  country: 'TR',
  city: 'Istanbul'
}
```

**Database Schema** (key fields):
```sql
CREATE TABLE photier.rag (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(255),
  message TEXT,
  from VARCHAR(50),
  human_mode BOOLEAN,
  premium BOOLEAN,
  country VARCHAR(2),
  city VARCHAR(100),
  createdAt TIMESTAMP
);
```

### Country/City Tracking

**Purpose**: Track user location for analytics and support routing.

**Technology**: `geoip-lite` npm package (offline IP geolocation database)

**Implementation** (server.js):
```javascript
const geoip = require('geoip-lite');

// Extract real IP from Cloudflare headers
const realIp = client.handshake.headers['cf-connecting-ip'] ||
               client.handshake.headers['x-forwarded-for']?.split(',')[0] ||
               client.handshake.address;

const geo = geoip.lookup(realIp);
const country = geo?.country || '';
const city = geo?.city || '';
```

**Database Storage**:
- Field: `country` (ISO code: TR, US, DE, etc.)
- Field: `city` (City name: Istanbul, New York, etc.)
- Stored per message in N8N database

**N8N Processing**:
- **Search ALL messages** for country/city (not just last message)
- **Use most recent** if location changes across messages
- Logic:
```javascript
const sortedMsgs = messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
const messagesWithCountry = sortedMsgs.filter(m => m.country);
const country = messagesWithCountry.length > 0 ? messagesWithCountry[0].country : '';
```

**Dashboard Display**:
- Country flags emoji (using ISO codes)
- Format: `🇹🇷 TR, Istanbul` or `🇹🇷 TR` (if no city)
- Shows in both Web and Premium user tables

**Common Issue**: If only checking `lastMessage.country`, data missing when last message doesn't have location. FIX: Search ALL messages.

### Session Batching (1-Hour Timeout)

**Purpose**: Split long conversations into separate sessions for accurate duration tracking.

**Logic**: Messages >1 hour apart = new session starts

**Implementation** (N8N workflow):
```javascript
function splitIntoSessions(messages, oneHour = 1 * 60 * 60 * 1000) {
  const sorted = messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const sessions = [];
  let currentSession = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const timeDiff = new Date(sorted[i].createdAt) - new Date(sorted[i-1].createdAt);

    if (timeDiff > oneHour) {
      sessions.push(currentSession);
      currentSession = [sorted[i]];
    } else {
      currentSession.push(sorted[i]);
    }
  }

  sessions.push(currentSession);
  return sessions;
}
```

**Session Filtering**:
- **Minimum 2 messages** per session (at least 1 user + 1 bot)
- Filters out abandoned chats where bot never responded
- Frontend filters sessions < 5 seconds (instant bot responses)

**User ID Format**:
- Single session: `Guest-abc123`
- Multiple sessions: `Guest-abc123-s1`, `Guest-abc123-s2`
- `sessionNumber` and `totalSessions` fields in response

**Duration Calculation**:
- `firstActivity`: Oldest message timestamp in session
- `lastActivity`: Newest message timestamp in session
- Duration: `(lastActivity - firstActivity) / 60000` minutes

**Stats Dashboard Handling**:
- Frontend strips session suffix (`-s\d+$`) before querying conversations
- Groups sessions by base userId for display
- Shows combined message count across all sessions

### Busiest Hours Heatmap

**Purpose**: Visualize user activity patterns across week and day.

**Data Structure**: 7 days × 24 hours array (0-indexed)
- Day 0 = Sunday, Day 6 = Saturday
- Hour 0 = 00:00-01:00, Hour 23 = 23:00-00:00

**Calculation** (N8N workflow):
```javascript
const heatmapData = Array(7).fill(0).map(() => Array(24).fill(0));

items.forEach(item => {
  if (item.json.from === 'user') {  // Only count user messages
    const msgDate = new Date(item.json.createdAt);
    const dayOfWeek = msgDate.getDay();  // 0=Sunday, 6=Saturday
    const hour = msgDate.getHours();     // 0-23
    heatmapData[dayOfWeek][hour]++;
  }
});

return { heatmapData };
```

**Frontend Display**:
- Color gradient: 7 levels from light blue (#E8F4FD) to dark blue (#0D3E63)
- Intensity based on percentage of max value
- Shows both web + premium combined data

**Return Format**:
```json
{
  "heatmapData": [
    [0, 0, 1, 5, ...],  // Sunday (24 hours)
    [2, 1, 0, 3, ...],  // Monday
    ...
    [1, 0, 2, 4, ...]   // Saturday
  ]
}
```

### Premium Chat Tabs System

**CRITICAL**: Each tab maintains SEPARATE conversation history. Not just a mode switch!

**Implementation**:
- Two message arrays: `aiMessages` and `humanMessages`
- Two localStorage keys: `messages.ai.{chatId}` and `messages.human.{chatId}`
- Switching tabs loads different conversation
- Each tab has own intro message

**User Experience**:
- Default tab: AI Bot (instant AI responses)
- Switch to Live Support → New conversation starts
- Switch back → AI conversation reappears
- Both persist independently

### Service Messages Control

**Purpose**: Control Telegram notifications without code changes or restarts.

**Default State**: DISABLED (messages OFF by default)

**What it controls**:
- Connection/reconnection notifications
- "has come back" / "has left" messages
- User messages forwarded to Telegram

**What it doesn't affect**:
- Messages to N8N (always sent for AI processing)
- Admin replies from Telegram (always work)

**Settings API**:
```bash
# Get current state
curl https://chat.photier.co/api/settings

# Enable
curl -X POST https://chat.photier.co/api/settings \
  -H "Content-Type: application/json" \
  -d '{"serviceMessagesEnabled":true}'
```

**Important**: Settings are in-memory only (reset on container restart).

### N8N Premium Filtering

**How it works**:
- All messages stored with `premium` field (true/false)
- N8N endpoint filters by query parameter
- **Duplicate Prevention**: User with ANY premium message → premium list only

**Endpoints**:
- `?premium=true` → Returns only premium users
- No parameter → Returns only normal users (via `.filter(u => !u.premium)`)

**Duplicate Prevention Logic**:
```javascript
// Check if user has ANY premium message
const hasPremiumMessage = messages.some(m => m.premium === true);

// Filter from normal users if has premium
allUsers.filter(u => !u.premium)
```

**Recent Fix** (2025-10-27): Changed from `lastMessage.premium` to `messages.some()` to prevent users with mixed premium/normal messages from appearing in both lists.

### Username (İsim) Feature

**Database Field**: `user_name` (stored in N8N database)

**Important**: NOT all messages have `user_name` field. Only messages where user provided name.

**Recent Bugs Fixed** (2025-10-26):

**Bug 1 - Stats Dashboard**: `loadAllUsers()` wasn't mapping userName from N8N response
- **Symptom**: Stats showed 12 users with names instead of 50
- **Cause**: Code didn't extract `userName` field from N8N data
- **Fix**: Added `userName: user.userName || 'Anonim'` mapping

**Bug 2 - N8N Code**: Only looked at `lastMessage.user_name` instead of searching ALL messages
- **Symptom**: Users who provided name in earlier messages showed as "Anonim"
- **Cause**: Code logic: `userName: lastMessage?.user_name || 'Anonim'`
- **Fix**: Search through ALL user messages to find first one with `user_name` field

**Impact**: 12 → 50 users now showing correct names in Stats Dashboard.

### Real-time WebSocket Updates

**Technology**: Socket.io v2.2.0 (client connects to chat servers for live updates)

**Architecture**:
- Dashboard connects to `/stats` namespace on both chat servers
- Chat servers broadcast events when user activity occurs
- Client receives events and updates UI in real-time (no page refresh)

**WebSocket Events**:

| Event | Payload | Trigger | Action |
|-------|---------|---------|--------|
| `user_online` | `{userId, channel, visitorName}` | User connects to chat | Debounced stats update |
| `user_offline` | `{userId, channel}` | User disconnects | Debounced stats update |
| `new_message` | `{userId, chatId, from, message, human_mode, visitorName}` | Message sent/received | Stats update + modal append |
| `human_mode_change` | `{userId, channel, isHumanMode}` | Premium tab switch | Debounced stats update |

**Broadcast Implementation** (server.js):
```javascript
// Function to broadcast stats updates to dashboard
function broadcastStatsUpdate(eventName, data) {
    if (io && io.of) {
        const statsNamespace = io.of('/stats');
        if (statsNamespace) {
            statsNamespace.emit(eventName, {
                ...data,
                channel: 'web'  // or 'premium'
            });
        }
    }
}
```

**Client Connection** (index.html):
```javascript
// Connect to both chat servers for real-time updates
const webSocket = io('https://chat.photier.co/stats');
const premiumSocket = io('https://p-chat.photier.co/stats');

// Listen for events
webSocket.on('new_message', (data) => handleNewMessage('web', data));
premiumSocket.on('new_message', (data) => handleNewMessage('premium', data));
```

**Real-time Conversation Modal**:
- Uses `window.currentOpenUserId` and `window.currentOpenChannel` (MUST be global scope)
- When modal is open, new messages auto-append to conversation view
- Message styling based on `from` field AND `human_mode`:
  - `from === 'admin' && human_mode === true` → live-support style (purple)
  - Other admin/bot → admin style (green)
  - user/visitor → visitor style (blue)

**Debouncing Pattern** (prevents UI flickering):
- 500ms delay after last event before updating stats
- Batches multiple rapid events into single update
- Implementation:
```javascript
let statsUpdateTimer = null;

function debouncedStatsUpdate() {
    if (statsUpdateTimer) clearTimeout(statsUpdateTimer);

    statsUpdateTimer = setTimeout(() => {
        loadAllStatsSequentially();
    }, 500);
}
```

**CRITICAL Scope Issue**:
- `currentOpenUserId` and `currentOpenChannel` MUST use `window.` prefix
- Problem: Using `let` makes them local to index.html, api.js can't access them
- Fix: `window.currentOpenUserId = userId;` (shared between files)

**User List Updates**:
- User lists do NOT reload automatically on events (prevents jarring refresh)
- Only stats widgets and heatmap update in real-time
- User manually refreshes page to see new users in list

### Session Duration Tracking

**Purpose**: Calculate how long users spend in conversations for analytics.

**Database Fields** (N8N):
- `firstActivity`: Timestamp of user's first message in session
- `lastActivity`: Timestamp of user's last message in session
- Both calculated from `createdAt` field in messages

**Calculation**:
```javascript
// Duration in minutes
const first = new Date(user.firstActivity);
const last = new Date(user.lastActivity);
const durationMs = last - first;
const durationMinutes = durationMs / (1000 * 60);
```

**N8N Workflow Logic**:
```javascript
// Sort messages by date
const sortedMsgs = messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
const lastMessage = sortedMsgs[0];  // Newest
const firstMessage = sortedMsgs[sortedMsgs.length - 1];  // Oldest

return {
    userId,
    lastActivity: lastMessage?.createdAt,
    firstActivity: firstMessage?.createdAt,  // CRITICAL: Must be in response
    messageCount: messages.length
};
```

**Frontend Filtering**:
- Filters sessions < 5 seconds (0.08 minutes) - instant bot responses
- No longer filters > 2 hours (handled by session batching in N8N)

**Widgets Using Session Duration**:
- **Average Session Duration**: Shows mean conversation length
- **Min/Max Session Duration**: Range of session lengths
- **Total Sessions**: Count of valid sessions (web + premium)
- **Session breakdown by channel**: Web vs Premium percentages

**CRITICAL**: N8N workflow must be **saved AND active** for `firstActivity` to appear in API response. Code can be correct but if workflow not saved, old version runs.

### Stats Dashboard Features

**Architecture**: 2-file system (CRITICAL - cannot be combined)
- `index.html` (130K) - UI, CSS, basic JS, authentication
- `api.js` (64K) - N8N API calls, business logic, sequential loading

**Version Tracking** (api.js):
```javascript
const API_VERSION = 'v1.1.2-render-debug';
console.log('[API] Loading version:', API_VERSION);
```

**Pages**:
1. **Dashboard** - Summary cards, charts, recent users, heatmap
2. **Web Kullanıcılar** - Normal users (premium excluded), pagination
3. **Premium Chat** - Premium users only, pagination
4. **Settings** - Service message controls (Apple-style toggles)

**Loading State** (prevents stale numbers):
```javascript
function setLoadingState() {
    const statElements = [
        'totalUsers', 'totalMessages', 'aiHandledSessions',
        'humanHandledSessions', 'onlineUsers', 'avgSessionDuration',
        'minSessionDuration', 'maxSessionDuration', 'avgMessagesPerSession',
        'totalSessions', 'webSessionCount', 'premiumSessionCount'
    ];

    statElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '...';
    });
}
```

**Sequential Loading Pattern** (prevents race conditions):
```javascript
async function loadAllStatsSequentially() {
    try {
        setLoadingState();  // Show "..." immediately

        // Load web stats first
        await loadStats();

        // Then load premium stats
        await loadPremiumStats();

        // Finally update all widgets with combined data ONCE
        if (webStats) {
            updateCombinedStats();
            updateLastUpdate();
        }
    } catch (error) {
        console.error('Stats loading error:', error);
    }
}
```

**Cache Headers** (nginx.conf in stats container):
```nginx
location / {
    try_files $uri $uri/ =404;
    # Aggressive no-cache headers
    add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
    add_header Pragma "no-cache";
    add_header Expires "0";
}
```

**Mobile Responsive**:
- Desktop (>1024px): Sidebar collapses to 70px (emoji-only mode)
- Mobile (≤1024px): Sidebar hidden, hamburger menu opens with overlay
- Touch-friendly, horizontal scroll tables

**Pagination**:
- 20 users per page
- "Daha Fazla Yükle" (Load More) button
- Client-side only (all data fetched once)
- Auto-hides when all users displayed

**Authentication**:
- Login required (username: admin, password: 123123)
- localStorage-based (client-side only)
- Incognito mode = login required every time

---

## File Structure & Persistence

### Stats Dashboard File Locations (CRITICAL)

**Purpose**: Stats dashboard files exist in TWO locations for different purposes.

**1. Runtime Mount Location** (active files served to users):
```
/root/stats/html/
├── index.html (130K)
├── api.js (64K)
└── login.html (6K)
```
- **Purpose**: Docker volume mount - changes here take effect immediately
- **Mounted to**: `/usr/share/nginx/html/` inside container
- **Edit here for**: Quick updates that need no rebuild
- **Persistence**: Files survive container restart (volume mount)

**2. Build Source Location** (used during docker build):
```
/root/stats/
├── Dockerfile
├── nginx.conf
├── index.html
├── api.js
└── login.html
```
- **Purpose**: Source files for `docker build`
- **Used when**: Container is rebuilt from scratch
- **Must update**: After editing html files, copy here too
- **Command**: `cp /root/stats/html/*.html /root/stats/` and `cp /root/stats/html/api.js /root/stats/`

**Why Both?**:
1. **Volume mount** (`/root/stats/html/`) = instant updates, no restart
2. **Build source** (`/root/stats/`) = persistence across rebuilds

**Dockerfile** (`/root/stats/Dockerfile`):
```dockerfile
FROM nginx:alpine

# Copy stats files from /root/stats/ (not /root/stats/html/)
COPY index.html /usr/share/nginx/html/
COPY login.html /usr/share/nginx/html/
COPY api.js /usr/share/nginx/html/

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

**Docker Compose Volume**:
```yaml
stats:
  volumes:
    # Mounts from html/ directory (NOT build source)
    - /root/stats/html/index.html:/usr/share/nginx/html/index.html
    - /root/stats/html/api.js:/usr/share/nginx/html/api.js
```

**Deployment Workflow**:
```bash
# 1. Edit files locally
vim /tmp/stats_api.js

# 2. Deploy to BOTH locations
scp /tmp/stats_api.js root@SERVER:/root/stats/html/api.js  # Runtime (active)
ssh root@SERVER "cp /root/stats/html/api.js /root/stats/"  # Build source

# 3. No restart needed - volume mount auto-updates
# Just refresh browser (cache disabled)

# 4. Verify deployed
curl -I https://stats.photier.co/api.js | grep Cache-Control
# Should show: no-store, no-cache
```

**Container Recreation Test**:
```bash
# Files persist after rebuild
docker compose stop stats
docker compose up -d --build stats

# Verify files still correct
docker exec root-stats-1 grep -c 'Live Support' /usr/share/nginx/html/index.html
# Should return > 0
```

**Common Mistake**: Only updating `/root/stats/html/` means files work now but get lost on rebuild. ALWAYS copy to `/root/stats/` too.

### Volume Mounts (CRITICAL)

**Stats Dashboard** (instant updates, no restart):
```yaml
volumes:
  - /root/stats/html/index.html:/usr/share/nginx/html/index.html
  - /root/stats/html/api.js:/usr/share/nginx/html/api.js
```
Changes to host files = immediate effect (just refresh browser).

**Normal Web Chat**:
```yaml
volumes:
  - intergram_data:/app/data
  - /root/intergram/server.js:/app/server.js
  - /root/intergram/telegram-chat-widget/static/css/chat.css:/app/static/css/chat.css
  - /root/intergram/telegram-chat-widget/static/js/widget.js:/app/static/js/widget.js
  - /root/intergram/telegram-chat-widget/static/js/chat.js:/app/static/js/chat.js
```
Must point to `/root/intergram` (NOT intergram-premium).

**Premium Chat**:
```yaml
volumes:
  - intergram_premium_data:/app/data
  - /root/intergram-premium/server.js:/app/server.js
  - /root/intergram-premium/telegram-chat-widget/static/css/chat.css:/app/static/css/chat.css
  - /root/intergram-premium/telegram-chat-widget/static/js/widget.js:/app/static/js/widget.js
  - /root/intergram-premium/telegram-chat-widget/static/js/chat.js:/app/static/js/chat.js
```
Must point to `/root/intergram-premium`.

**Common Mistake**: Web container mounting premium's chat.js causes tabs to appear in normal chat.

### Container Files (NOT mounted)

**Inside containers only**:
- `/app/src/chat/chat.js` - Source code (requires webpack build)

**Changes require**:
1. Edit file in container
2. Rebuild: `docker exec <container> sh -c 'cd /app && npm run build'`
3. Copy to host: `docker cp <container>:/app/static/js/chat.js /root/.../chat.js`
4. Restart container

**Why copy to host?**: Persist changes across container recreates.

### Data Persistence

**N8N Database**: External volume `n8n_data`
- All conversations stored permanently
- Survives container recreates
- Used by Stats Dashboard

**Stats Dashboard**: Volume mounts + nginx config
- Files persist on host
- Nginx config built into image from `/root/stats/nginx.conf`
- Container recreate = no data loss

**Intergram Settings**: In-memory only
- Reset to default (false) on restart
- By design (safety)

### Backup Strategy

**Backup Location**: `/root/backups/<timestamp>/`

**Recent Backup Format** (2025-10-27):
```
/root/stats_backup_live_support_20251027_212343.tar.gz
/root/backups/stats_20251027_212243/
```

**What to Backup**:
```bash
# Create timestamped backup
BACKUP_DIR=/root/backups/$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Server files
cp /root/intergram/server.js $BACKUP_DIR/server_web.js
cp /root/intergram-premium/server.js $BACKUP_DIR/server_premium.js

# Stats files (BOTH locations)
cp /root/stats/html/api.js $BACKUP_DIR/stats_api.js
cp /root/stats/html/index.html $BACKUP_DIR/stats_index.html
cp /root/stats/api.js $BACKUP_DIR/stats_api_build.js
cp /root/stats/index.html $BACKUP_DIR/stats_index_build.html
cp /root/stats/nginx.conf $BACKUP_DIR/nginx.conf

# Docker config
cp /root/docker-compose.yml $BACKUP_DIR/docker-compose.yml

# Create tarball
cd /root && tar -czf stats_backup_live_support_$(date +%Y%m%d_%H%M%S).tar.gz stats/
```

**Verify After Restart**:
```bash
# Check file hashes match
md5sum /root/stats/html/api.js
md5sum /root/intergram/server.js

# Restart containers
docker compose restart intergram stats

# Verify files still intact
md5sum /root/stats/html/api.js
md5sum /root/intergram/server.js

# Check container serves updated files
docker exec root-stats-1 grep -c 'Live Support' /usr/share/nginx/html/index.html
docker exec root-stats-1 grep -c 'Live Support' /usr/share/nginx/html/api.js
```

**Download to Local**:
```bash
# Download backup for safety
scp root@SERVER:/root/stats_backup_live_support_*.tar.gz /tmp/
```

---

## Build & Deploy Workflow

### When to Rebuild

**Chat.js source changes** (tabs, autoResponse, etc.):
```bash
# 1. Edit source
docker exec root-intergram-1 vi /app/src/chat/chat.js

# 2. Build
docker exec root-intergram-1 sh -c 'cd /app && npm run build'

# 3. Copy to host (CRITICAL - persist changes)
docker cp root-intergram-1:/app/static/js/chat.js \
  /root/intergram/telegram-chat-widget/static/js/chat.js

# 4. Restart
docker restart root-intergram-1
```

**Server.js changes** (no build needed):
```bash
# 1. Update file in container or on host
scp /tmp/new_server.js root@92.113.21.229:/root/intergram/server.js

# 2. Restart (picks up bind mount)
ssh root@92.113.21.229 'docker restart root-intergram-1'
```

**Stats Dashboard** (instant, updated workflow):
```bash
# 1. Deploy to runtime location (instant effect)
scp /tmp/stats_api.js root@SERVER:/root/stats/html/api.js
scp /tmp/stats_index.html root@SERVER:/root/stats/html/index.html

# 2. Copy to build source (persist across rebuilds)
ssh root@SERVER "cp /root/stats/html/api.js /root/stats/"
ssh root@SERVER "cp /root/stats/html/index.html /root/stats/"

# 3. No restart needed - cache disabled
# Just refresh browser (Ctrl+Shift+R if needed)

# 4. Verify deployment
curl -s https://stats.photier.co/api.js | head -5 | grep API_VERSION
```

**Container Recreation** (full rebuild):
```bash
# Stats container rebuild preserves files (volume mount)
docker compose stop stats
docker compose up -d --build stats

# Verify files intact
docker exec root-stats-1 ls -lh /usr/share/nginx/html/
```

---

## Troubleshooting

### Tabs showing in normal web chat (should only be in premium)

**Diagnosis**:
```bash
# Check volume mapping
grep -A 10 'root-intergram-1' /root/docker-compose.yml
```

**Fix**: Ensure web container mounts `/root/intergram/...`, not `/root/intergram-premium/...`

### Service messages still going to Telegram when settings say OFF

**Check**:
```bash
curl https://chat.photier.co/api/settings
# Should return: {"success":true,"serviceMessagesEnabled":false}

# Verify settings code exists
docker exec root-intergram-1 grep -n "settings.serviceMessagesEnabled" /app/server.js
```

**Fix**: Restart container to reload server.js

### Premium users showing in normal Users page

**Cause**: N8N not filtering premium users from `allUsers`

**Fix**: Update N8N code to add `.filter(u => !u.premium)` to allUsers array.

### Username showing "Anonim" for users who provided names

**Cause 1**: Stats Dashboard not mapping userName from N8N response
**Cause 2**: N8N only checking lastMessage.user_name instead of all messages

**Fix**:
- Stats: Add `userName: user.userName || 'Anonim'` mapping
- N8N: Search ALL messages for user_name field, not just last message

### Stats Dashboard not loading data (blank page after login)

**Cause**: Missing api.js file

**Check**:
```bash
# Verify api.js exists
docker exec root-stats-1 ls -lh /usr/share/nginx/html/api.js

# Check if index.html loads it
docker exec root-stats-1 grep 'api.js' /usr/share/nginx/html/index.html
```

**CRITICAL**: Stats requires BOTH files (index.html + api.js). Cannot work with just one.

### Changes to server.js not taking effect

**Fix**:
```bash
# Verify file content
docker exec root-intergram-1 grep 'your-change' /app/server.js

# Restart
docker restart root-intergram-1

# Check logs
docker logs root-intergram-1 --tail 10
```

### Unwanted automatic messages from AI

**Root Cause 1 - Client autoResponse**: Enabled in chat.js
**Root Cause 2 - Server notifications**: Settings not disabled

**Fix**:
- Client: Comment out autoResponse blocks in chat.js (lines ~148-171, ~180-188)
- Server: Use Settings page to disable (or verify default is false)

### Mobile sidebar not working

**Check**:
```javascript
// Browser console
const hamburger = document.getElementById('hamburgerMenu');
console.log('Display:', window.getComputedStyle(hamburger).display);
console.log('Window width:', window.innerWidth);
```

**Fix**: Ensure viewport meta tag exists and media queries load correctly.

### Load More button not hiding when all users shown

**Check**:
```javascript
// Browser console
console.log('All users:', allUsersData.length);
console.log('Displayed:', displayedUsersCount);
```

**Fix**: Reload page to reset pagination state.

### Real-time messages not appearing in conversation modal

**Symptoms**:
- Modal opens fine but new messages don't auto-append
- Only visible after closing and reopening modal

**Root Cause**: Scope issue - tracking variables not shared between files

**Diagnosis**:
```javascript
// Check if variables are global
console.log('currentOpenUserId:', window.currentOpenUserId);
console.log('currentOpenChannel:', window.currentOpenChannel);
```

**Fix**: Change from `let` to `window.` prefix in BOTH files:
```javascript
// WRONG (index.html and api.js can't share)
let currentOpenUserId = null;

// CORRECT (shared globally)
window.currentOpenUserId = null;
```

**Files to update**:
- `index.html`: Modal open/close functions
- `api.js`: Modal management functions

### Bot messages showing with wrong color in modal

**Symptoms**:
- Bot/admin messages appear with user/visitor styling (wrong color)
- All messages look like they're from the user

**Root Cause**: Server broadcast missing `from` field

**Fix**:
1. **Server-side** (`/send-to-user` endpoint):
```javascript
broadcastStatsUpdate('new_message', {
    userId: userId,
    chatId: chatId,
    from: from || 'bot',  // ADD THIS
    message: message,     // ADD THIS
    human_mode: msg.human_mode,  // ADD THIS
    visitorName: userId
});
```

2. **Client-side** (index.html):
```javascript
function handleNewMessage(channel, data) {
    // Determine message source based on from + human_mode
    const fromType = (data.from === 'user' || data.from === 'visitor')
        ? 'visitor'
        : (data.from === 'admin' && data.human_mode === true)
        ? 'live-support'
        : 'admin';

    appendMessageToModal(data, fromType);
}
```

**Files to update**:
- `/app/server.js` in both containers (web + premium)
- `/root/stats/html/index.html`

### Stats dashboard numbers flickering/changing rapidly

**Symptoms**:
- Stats numbers jump around when multiple events occur
- Dashboard feels unstable, "refresh" effect

**Root Cause**: Each WebSocket event triggers immediate stats reload

**Fix**: Implement debouncing (wait 500ms after last event):
```javascript
let statsUpdateTimer = null;

function debouncedStatsUpdate() {
    if (statsUpdateTimer) clearTimeout(statsUpdateTimer);

    statsUpdateTimer = setTimeout(() => {
        loadAllStatsSequentially();
    }, 500);
}

// Use in all event handlers
webSocket.on('new_message', () => debouncedStatsUpdate());
webSocket.on('user_online', () => debouncedStatsUpdate());
```

**Result**: Multiple rapid events batched into single UI update after activity stops.

### User list showing jarring refresh when new users join

**Symptoms**:
- Screen flashes/jumps when new chat starts
- Feels like page is reloading

**Root Cause**: `loadAllUsers()` and `loadPremiumUsers()` called on every WebSocket event

**Fix**: Remove user list reloads from event handlers:
```javascript
function handleUserOnline(channel, data) {
    // Only update stats, NOT user lists
    debouncedStatsUpdate();
    // REMOVED: loadAllUsers();
}
```

**Trade-off**: Users must manually refresh page to see new users in list, but no jarring refresh effect.

### Session duration widgets showing zero

**Symptoms**:
- "Ortalama Süre" (Average Session Duration) shows 0
- "Busiest Hours" shows no data
- Other stats work fine

**Root Cause**: `firstActivity` field missing from N8N API response

**Diagnosis**:
```bash
# Check if firstActivity exists in response
curl "https://n8n.photier.co/webhook/photier-stats" | grep -c "firstActivity"
# Should return > 0, returns 0 if missing
```

**Common Causes**:
1. **N8N workflow not saved**: Code edited but "Save" button not clicked
2. **Workflow not active**: Toggle switch is OFF
3. **Different workflow running**: Webhook URL pointing to different/old workflow

**Fix**:
1. Open n8n.photier.co
2. Find "Photier Stats" workflow
3. Click "Save" button (top right)
4. Ensure "Active" toggle is ON
5. Test: `curl "https://n8n.photier.co/webhook/photier-stats" | grep firstActivity`

**CRITICAL**: Even if code is 100% correct, changes don't take effect until workflow is saved AND active.

### Stats dashboard changes not visible after deployment

**Symptoms**:
- File deployed successfully to server
- Browser still shows old code
- Hard refresh (Ctrl+Shift+R) doesn't help

**Root Causes**:
1. **Browser cache**: JavaScript cached locally
2. **Nginx cache**: Container caching files (FIXED in 2025-10-27 with no-cache headers)

**Fix (2025-10-27 onwards)**:
```bash
# Just refresh browser - cache disabled
# nginx.conf has: add_header Cache-Control "no-store, no-cache, ..."

# Verify nginx config
docker exec root-stats-1 grep "no-store" /etc/nginx/conf.d/default.conf
```

**Old Fix (before 2025-10-27)**:
```bash
# Container restart required
docker restart root-stats-1
```

### Country/city data not showing for users

**Symptoms**:
- Country column shows empty or "-"
- Users definitely have location (checked in N8N database)

**Root Cause 1**: N8N only checking `lastMessage.country`
**Root Cause 2**: Frontend not mapping country/city fields
**Root Cause 3**: geoip-lite not installed in server

**Fix**:
1. **N8N**: Search ALL messages, use most recent with location:
```javascript
const messagesWithCountry = sortedMsgs.filter(m => m.country);
const country = messagesWithCountry.length > 0 ? messagesWithCountry[0].country : '';
```

2. **Frontend**: Map country/city from N8N response:
```javascript
country: user.country || '',
city: user.city || '',
countryFlag: user.country ? getCountryFlag(user.country) : '🌐'
```

3. **Server**: Verify geoip-lite installed:
```bash
docker exec root-intergram-1 npm list geoip-lite
```

### Dashboard showing stale numbers on refresh

**Symptoms**:
- Refresh page → shows old/wrong numbers for split second
- Then "jumps" to correct values
- Looks unprofessional

**Root Cause**: HTML has static placeholder values, JavaScript loads asynchronously

**Fix** (2025-10-27):
```javascript
// Set loading state immediately on page load
document.addEventListener('DOMContentLoaded', async function() {
    setLoadingState();  // Shows "..." in all widgets
    initializeCharts();
    await loadAllStatsSequentially();  // Loads data, updates widgets
});

function setLoadingState() {
    ['totalUsers', 'totalMessages', ...].forEach(id => {
        document.getElementById(id).textContent = '...';
    });
}
```

**Result**: Users see "..." → correct numbers (no intermediate wrong values)

### Heatmap not showing any data

**Symptoms**:
- Heatmap grid visible but all cells empty/white
- No error in console

**Root Cause**: N8N not returning `heatmapData` in response

**Fix**:
1. **N8N Workflow**: Add heatmap calculation before return:
```javascript
// Heatmap: 7 days × 24 hours
const heatmapData = Array(7).fill(0).map(() => Array(24).fill(0));

items.forEach(item => {
  if (item.json.from === 'user') {
    const msgDate = new Date(item.json.createdAt);
    heatmapData[msgDate.getDay()][msgDate.getHours()]++;
  }
});

return {
  ...otherData,
  heatmapData: heatmapData  // ADD THIS
};
```

2. **Verify**:
```bash
curl "https://n8n.photier.co/webhook/photier-stats" | grep -A 5 "heatmapData"
```

### Dashboard refresh shows different numbers each time

**Symptoms**:
- Refresh 3 times → see 3 different values for same stat
- Eventually stabilizes but inconsistent

**Root Cause**: Race condition - web and premium stats loading in parallel, whichever finishes first updates widgets

**Fix** (2025-10-27 - Sequential Loading):
```javascript
async function loadAllStatsSequentially() {
    // Load web stats FIRST
    await loadStats();

    // Then load premium stats
    await loadPremiumStats();

    // Finally update widgets ONCE with combined data
    updateCombinedStats();
}
```

**Before Fix**: Sometimes web finished first (missing premium), sometimes premium finished first (missing web)

**After Fix**: Always loads web → premium → update (consistent results)

### Live Support messages showing wrong color in stats

**Symptoms** (2025-10-27):
- ALL admin/bot messages showing purple (Live Support)
- Should only be purple for actual human admin replies
- AI bot messages should be green

**Root Cause**: Incorrect logic checking `human_mode` for both 'bot' and 'admin'

**Wrong Code**:
```javascript
// This makes ALL bot messages Live Support (WRONG)
if ((msg.from === 'bot' || msg.from === 'admin') && msg.human_mode) {
    messageClass = 'live-support';
}
```

**Correct Code**:
```javascript
// ONLY admin messages with human_mode=true are Live Support
if (msg.from === 'admin' && msg.human_mode === true) {
    messageClass = 'live-support';
    messageLabel = '👤 Live Support';
} else if (msg.from === 'bot' || msg.from === 'admin') {
    messageClass = 'admin';
    messageLabel = '🤖 AI Bot';
}
```

**Why This Matters**:
- `from: 'bot'` = AI responses (NEVER Live Support)
- `from: 'admin'` with `human_mode: false` = AI in admin context (green)
- `from: 'admin'` with `human_mode: true` = Human admin reply (purple)

**Files to Check** (all 4 must be correct):
1. `/root/stats/html/index.html` - `loadUserMessages()` (~line 1891)
2. `/root/stats/html/index.html` - `showConversationModal()` (~line 1972)
3. `/root/stats/html/index.html` - `appendMessageToModal()` (~line 2698)
4. `/root/stats/html/api.js` - `showConversationModal()` (~line 1498)

**Diagnosis**:
```bash
# Test in browser console after opening conversation modal
document.querySelectorAll('.conversation-message.live-support').length
# Should only count actual Live Support messages (human_mode: true)

document.querySelectorAll('.conversation-message.admin').length
# Should count AI bot messages (human_mode: false or null)
```

**Fix Applied** (2025-10-27):
- Updated all 4 functions with correct logic
- Deployed to `/root/stats/html/` (runtime)
- Copied to `/root/stats/` (build source)
- Created backup: `stats_backup_live_support_20251027_212343.tar.gz`

---

## Recent Changes (2025-10-27)

### Country/City Location Tracking

**What Changed**:
- Implemented geoip-lite for IP-based geolocation
- Server extracts country/city from user IP on connection
- Data stored per message in N8N database
- Stats dashboard displays flags + location

**Technical Details**:
- IP extraction: Cloudflare headers (`cf-connecting-ip`) → `x-forwarded-for` → fallback
- Fields: `country` (ISO code), `city` (city name)
- N8N searches ALL messages for location (not just last)
- Uses most recent location if user moves

**Impact**:
- Location analytics for support routing
- Country breakdown in stats
- City-level granularity for detailed insights

### Session Batching (1-Hour Timeout)

**What Changed**:
- Messages >1 hour apart now split into separate sessions
- Each session gets own `firstActivity`/`lastActivity`
- Minimum 2 messages per session (filters abandoned chats)
- Frontend filters sessions <5 seconds (instant bot responses)

**Technical Details**:
- `splitIntoSessions()` function in N8N workflow
- Session ID format: `Guest-abc123-s1`, `Guest-abc123-s2`
- Fields: `sessionNumber`, `totalSessions`
- Replaced frontend 120-minute filter (now handled in N8N)

**Impact**:
- More accurate session duration tracking
- Eliminates multi-day sessions skewing averages
- Better understanding of user engagement patterns

### Busiest Hours Heatmap Implementation

**What Changed**:
- N8N now calculates 7×24 heatmap data
- Counts user messages per day/hour
- Dashboard displays color-coded grid
- Combines web + premium activity

**Technical Details**:
- Data structure: `Array(7).fill(0).map(() => Array(24).fill(0))`
- Day 0=Sunday, Hour 0=00:00-01:00
- Only counts user messages (not bot)
- Color gradient: 7 levels based on % of max

**Impact**:
- Visualize peak activity times
- Optimize support staffing
- Understand user behavior patterns

### Dashboard Loading State

**What Changed**:
- All widgets show "..." while data loads
- No more "flash" of old/wrong numbers on refresh
- Professional loading experience

**Technical Details**:
```javascript
function setLoadingState() {
    statElements.forEach(id => {
        document.getElementById(id).textContent = '...';
    });
}

// Called immediately on page load
document.addEventListener('DOMContentLoaded', async function() {
    setLoadingState();
    await loadAllStatsSequentially();
});
```

**Impact**:
- Eliminates jarring number changes
- Clear loading indicator
- Better perceived performance

### Sequential Loading Pattern

**What Changed**:
- Stats now load: web → premium → update widgets (in order)
- No more race conditions
- Consistent results every refresh

**Technical Details**:
```javascript
async function loadAllStatsSequentially() {
    await loadStats();           // 1. Web first
    await loadPremiumStats();    // 2. Premium second
    updateCombinedStats();       // 3. Update once with both
}
```

**Before**: Parallel loading → inconsistent (sometimes missing web, sometimes missing premium)
**After**: Sequential loading → always complete data

**Impact**:
- Reliable stats on every page load
- No more "refresh until it looks right"
- Predictable behavior

### Cache Headers Optimization

**What Changed**:
- Nginx configured with aggressive no-cache headers
- Browser always fetches fresh files
- No container restart needed for updates

**Technical Details**:
```nginx
add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
add_header Pragma "no-cache";
add_header Expires "0";
```

**Impact**:
- Deploy updates → users see them immediately
- No more "why isn't my change showing?"
- Faster development iteration

### API Version Tracking

**What Changed**:
- api.js now logs version on load
- Helps debug cache issues
- Tracks which version user is running

**Technical Details**:
```javascript
const API_VERSION = 'v1.1.2-render-debug';
console.log('[API] Loading version:', API_VERSION);
```

**Check in browser console**:
```
[API] Loading version: v1.1.2-render-debug
```

**Impact**:
- Easy troubleshooting of cache issues
- Confirms updates deployed successfully
- Tracks feature progression

### Persistence and Backup Strategy

**What Changed**:
- All critical files in bind mounts
- Automated backup script
- Restart test verification
- Nginx config persisted

**Backup Location**: `/root/backups/<timestamp>/` and `/root/stats_backup_*.tar.gz`

**Files Backed Up**:
- server_web.js (intergram)
- server_premium.js (intergram-premium)
- stats_api.js (both /root/stats/html/ and /root/stats/)
- stats_index.html (both locations)
- nginx.conf
- docker-compose.yml

**Verification**:
```bash
# Check MD5 before/after restart
md5sum /root/stats/html/api.js
docker compose restart stats
md5sum /root/stats/html/api.js
# Should match
```

**Impact**:
- Changes survive container recreation
- Easy rollback to previous versions
- Disaster recovery capability

### Live Support Message Styling (Stats Dashboard)

**What Changed** (2025-10-27):
- Stats dashboard now differentiates AI bot vs human admin messages
- Purple background for Live Support (matching widget)
- Green background for AI Bot
- Uses `human_mode` database field

**Implementation**:
- Updated 4 functions across index.html and api.js
- Logic: `from === 'admin' && human_mode === true` → Live Support
- All other bot/admin messages → AI Bot (green)

**Technical Details**:
```javascript
// Correct logic in all 4 functions
if (msg.from === 'admin' && msg.human_mode === true) {
    messageClass = 'live-support';
    messageLabel = '👤 Live Support';
    // Purple background: #e7dcf6
} else if (msg.from === 'bot' || msg.from === 'admin') {
    messageClass = 'admin';
    messageLabel = '🤖 AI Bot';
    // Green background: #E8FFF3
}
```

**Files Updated**:
1. `/root/stats/html/index.html` (3 functions)
2. `/root/stats/html/api.js` (1 function)
3. Both copied to `/root/stats/` (build source)

**CSS Added**:
```css
.conversation-message.live-support {
    background: #e7dcf6;
    border-left: 3px solid #6b5b95;
}
```

**Impact**:
- Clear visual distinction in conversation history
- Admins can see AI vs human handling at a glance
- Matches widget styling for consistency
- Accurate analytics on live support usage

**Backup Created**:
- `/root/stats_backup_live_support_20251027_212343.tar.gz`
- `/root/backups/stats_20251027_212243/`
- Local copy: `/tmp/stats_backup_live_support_20251027_212343.tar.gz`

**Tested**:
- Container restart preserves changes
- Full container recreation preserves changes
- Stats accessible (HTTP 200)
- Files verified in container: `grep -c 'Live Support'` returns correct counts

---

## Quick Reference Commands

### Container Operations
```bash
# Status
docker ps | grep intergram

# Logs
docker logs root-intergram-1 --tail 50
docker logs -f root-intergram-1  # Follow

# Restart
docker restart root-intergram-1
docker compose restart intergram stats
```

### Test Endpoints
```bash
# N8N stats
curl https://n8n.photier.co/webhook/photier-stats
curl "https://n8n.photier.co/webhook/photier-stats?premium=true"
curl "https://n8n.photier.co/webhook/photier-stats?userId=Guest-abc123"

# Check human_mode field
curl "https://n8n.photier.co/webhook/photier-stats?userId=P-Guest-XXX" | \
  python3 -m json.tool | grep -A 3 "human_mode"

# Settings
curl https://chat.photier.co/api/settings
curl -X POST https://chat.photier.co/api/settings \
  -H "Content-Type: application/json" \
  -d '{"serviceMessagesEnabled":true}'
```

### Verification Checks
```bash
# Check for tabs in premium
docker exec root-intergram-premium-1 grep -c 'humanMode' /app/static/js/chat.js
# Should return > 0

# Check for tabs in normal (should be 0)
docker exec root-intergram-1 grep -c 'humanMode' /app/static/js/chat.js
# Should return 0

# Check settings API exists
docker exec root-intergram-1 grep -n "app.get('/api/settings'" /app/server.js

# Check geoip-lite installed
docker exec root-intergram-1 npm list geoip-lite

# Check nginx cache headers
docker exec root-stats-1 grep "no-store" /etc/nginx/conf.d/default.conf

# Check API version
curl -s https://stats.photier.co/api.js | head -5 | grep API_VERSION

# Check Live Support code deployed
docker exec root-stats-1 grep -c 'Live Support' /usr/share/nginx/html/index.html
docker exec root-stats-1 grep -c 'Live Support' /usr/share/nginx/html/api.js

# Verify both file locations match
md5sum /root/stats/html/api.js
md5sum /root/stats/api.js
# Should match
```

### Backup Creation
```bash
# Full system backup
BACKUP_DIR=/root/backups/$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
cp /root/intergram/server.js $BACKUP_DIR/server_web.js
cp /root/intergram-premium/server.js $BACKUP_DIR/server_premium.js
cp /root/stats/html/api.js $BACKUP_DIR/stats_api.js
cp /root/stats/html/index.html $BACKUP_DIR/stats_index.html
cp /root/stats/api.js $BACKUP_DIR/stats_api_build.js
cp /root/stats/index.html $BACKUP_DIR/stats_index_build.html
cp /root/stats/nginx.conf $BACKUP_DIR/nginx.conf
cp /root/docker-compose.yml $BACKUP_DIR/docker-compose.yml

# Create tarball
cd /root && tar -czf stats_backup_live_support_$(date +%Y%m%d_%H%M%S).tar.gz stats/

# Verify backup
ls -lh $BACKUP_DIR

# Download to local
scp root@SERVER:/root/stats_backup_*.tar.gz /tmp/
```

### Real-time Updates Testing
```bash
# Check WebSocket connections (browser console)
console.log('Web socket:', webSocket.connected);
console.log('Premium socket:', premiumSocket.connected);

# Test N8N workflow has firstActivity
curl "https://n8n.photier.co/webhook/photier-stats" | python3 -m json.tool | grep -A 3 "firstActivity"

# Test heatmap data
curl "https://n8n.photier.co/webhook/photier-stats" | python3 -m json.tool | grep -A 5 "heatmapData"

# Monitor real-time events (browser console)
webSocket.on('new_message', (data) => console.log('📨 Message:', data));
premiumSocket.on('user_online', (data) => console.log('🟢 User online:', data));

# Check global scope variables (browser console)
console.log('Open user:', window.currentOpenUserId);
console.log('Open channel:', window.currentOpenChannel);
```

### Cache Troubleshooting
```bash
# Verify no-cache headers (should work without restart now)
curl -I https://stats.photier.co/api.js | grep Cache-Control

# Verify file hash after deployment
ssh root@92.113.21.229 "md5sum /root/stats/html/api.js"

# Compare with local file
md5sum /tmp/stats_api.js

# Check if file updated
curl -s https://stats.photier.co/api.js | head -5
```

### N8N Workflow Testing
```bash
# Test country/city data
curl "https://n8n.photier.co/webhook/photier-stats" | \
  python3 -m json.tool | grep -A 3 '"country"'

# Test session batching (check for -s1, -s2 suffixes)
curl "https://n8n.photier.co/webhook/photier-stats" | \
  python3 -m json.tool | grep '"userId"' | head -20

# Test firstActivity field
curl "https://n8n.photier.co/webhook/photier-stats" | \
  python3 -m json.tool | jq '.[] | .allUsers[0] | {userId, firstActivity, lastActivity}'

# Test human_mode field in responses
curl "https://n8n.photier.co/webhook/photier-stats?userId=P-Guest-abc" | \
  python3 -m json.tool | jq '[.[] | {from, human_mode, message: .message[0:50]}]'
```

### Stats Dashboard Deployment
```bash
# Deploy to runtime (instant effect)
scp /tmp/stats_api.js root@SERVER:/root/stats/html/api.js
scp /tmp/stats_index.html root@SERVER:/root/stats/html/index.html

# Copy to build source (persist)
ssh root@SERVER "cp /root/stats/html/*.html /root/stats/"
ssh root@SERVER "cp /root/stats/html/api.js /root/stats/"

# Verify deployment (no restart needed)
curl -s https://stats.photier.co/api.js | head -5 | grep API_VERSION

# Test container recreation persistence
docker compose stop stats
docker compose up -d --build stats
docker exec root-stats-1 grep -c 'Live Support' /usr/share/nginx/html/index.html
```

---

## Critical Reminders

1. **Two systems, two directories**:
   - Normal: `/root/intergram/` (no tabs, simple)
   - Premium: `/root/intergram-premium/` (tabs, AI/human modes)

2. **Volume mappings must be correct**:
   - Wrong mapping = tabs appear in wrong system
   - Always verify in docker-compose.yml

3. **Source changes require rebuild**:
   - Edit `/app/src/chat/chat.js`
   - Run `npm run build`
   - Copy to host (persist)
   - Restart container

4. **Stats requires 2 files**:
   - Cannot combine index.html + api.js
   - Both must exist for dashboard to work
   - Volume mounted = instant updates (cache disabled)

5. **AutoResponse is disabled**:
   - Client: Commented out in chat.js
   - Server: Controlled by Settings (default OFF)
   - Reason: N8N AI handles all responses

6. **Settings are in-memory**:
   - Default: false (disabled)
   - Reset on container restart
   - By design (safety)

7. **Premium tabs = separate conversations**:
   - Two message arrays required
   - Two localStorage keys
   - Switch function updates display

8. **N8N premium filtering**:
   - Messages must have `premium: true` field
   - Normal users exclude premium (`.filter(u => !u.premium)`)
   - Uses `messages.some()` to check ANY premium message
   - No duplicates between lists

9. **Username field is optional**:
   - NOT in all messages
   - Must search ALL messages, not just last
   - Stats maps as: `userName || 'Anonim'`

10. **Always backup before changes**:
    - Container backups: `docker commit`
    - File backups: Copy to local machine
    - Stats backups: `/root/backups/`

11. **Real-time updates architecture**:
    - Socket.io v2.2.0 connects dashboard to chat servers
    - `/stats` namespace isolates dashboard from chat connections
    - Events broadcast from server, client listens and updates UI
    - Debouncing prevents flickering (500ms delay)

12. **Global scope for modal tracking**:
    - Use `window.currentOpenUserId` (NOT `let currentOpenUserId`)
    - Required for sharing state between index.html and api.js
    - Local variables cause "real-time not working" bug

13. **N8N workflow activation**:
    - Editing code is not enough - must click "Save" button
    - Must ensure "Active" toggle is ON
    - Test API endpoint after saving to verify changes
    - Old workflow keeps running until saved/activated

14. **Cache completely disabled** (2025-10-27):
    - Stats container nginx configured with no-cache headers
    - Updates visible immediately after deployment
    - No container restart needed
    - Just refresh browser

15. **Server broadcast data structure**:
    - MUST include `from` field (user/visitor/bot/admin)
    - MUST include `message` field (actual message text)
    - MUST include `human_mode` field (true/false/null)
    - Missing fields cause wrong styling or placeholder text
    - Required in both web and premium server.js

16. **Country/city tracking**:
    - geoip-lite extracts from IP (Cloudflare headers first)
    - Stored per message, not per user
    - N8N searches ALL messages, uses most recent
    - Dashboard shows flags + location

17. **Session batching**:
    - 1 hour timeout (messages >1h apart = new session)
    - Minimum 2 messages per session
    - Frontend filters <5 second sessions
    - Replaces old frontend 120-minute filter

18. **Sequential loading**:
    - Always load: web → premium → update widgets
    - Prevents race conditions
    - Consistent results every time
    - Use `await` pattern

19. **Loading state**:
    - Show "..." immediately on page load
    - Prevents flash of old/wrong numbers
    - Called before any data fetching
    - Professional user experience

20. **Heatmap calculation**:
    - 7 days × 24 hours array
    - Day 0=Sunday, Hour 0=00:00
    - Only counts user messages
    - Calculated in N8N, not frontend

21. **Stats file persistence** (2025-10-27):
    - TWO locations: `/root/stats/html/` (runtime) and `/root/stats/` (build)
    - Runtime = volume mount (instant updates)
    - Build = Dockerfile source (persist across rebuilds)
    - MUST update BOTH after changes
    - Command: `cp /root/stats/html/* /root/stats/`

22. **Live Support styling logic** (2025-10-27):
    - ONLY `from === 'admin' && human_mode === true` → Live Support (purple)
    - ALL other bot/admin messages → AI Bot (green)
    - NEVER check human_mode for 'bot' messages
    - Must update all 4 functions (3 in index.html, 1 in api.js)
    - Colors: Live Support #e7dcf6, AI Bot #E8FFF3

23. **human_mode field handling**:
    - Boolean: true (Live Support), false/null (AI Bot)
    - Set by widget tab selection (Premium only)
    - Stored in N8N database per message
    - Used by N8N workflow AND stats dashboard
    - Admin Telegram replies always have `human_mode: true`

---

## Environment Variables

### Normal Web Intergram
```bash
TELEGRAM_TOKEN=<bot-token>
SERVER_URL=https://chat.photier.co
PORT=3000
N8N_WEBHOOK_URL=https://n8n.photier.co/webhook/intergram-message
```

### Premium Intergram
```bash
TELEGRAM_TOKEN=<bot-token>
SERVER_URL=https://p-chat.photier.co
PORT=3001
N8N_WEBHOOK_URL=https://n8n.photier.co/webhook/admin-chat
```

---

## Contact & Resources

- **GitHub**: [Kintoyyy/Telegram-Chat-Widget](https://github.com/Kintoyyy/Telegram-Chat-Widget)
- **Original**: [idoco/intergram](https://github.com/idoco/intergram)
- **Fork**: [yamaha252/intergram](https://github.com/yamaha252/intergram)
- **geoip-lite**: [npm package](https://www.npmjs.com/package/geoip-lite)

---

**End of Knowledge Bank** - Last updated: 2025-10-27 (Live Support styling, human_mode field, stats file persistence)
