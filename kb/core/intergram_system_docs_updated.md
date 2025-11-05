# Intergram Chat System Documentation

**Last Updated**: 2025-10-26 (Updated with Mobile Responsive, Pagination, Settings page, N8N premium integration)
**Purpose**: System architecture and operational guide for dual intergram chat systems

---

## System Architecture Overview

### Two Separate Chat Systems

**CRITICAL**: There are TWO completely independent intergram systems running:

#### 1. Normal Web Intergram (root-intergram-1)
- **Port**: 3000 (localhost only)
- **Public URL**: https://chat.photier.co
- **Purpose**: Simple chat widget for public website (www.photier.com)
- **Features**: Basic chat, NO tabs, NO AI/Human mode switching
- **N8N Webhook**: https://n8n.photier.co/webhook/intergram-message
- **Container**: `root-intergram-1`
- **Chat ID**: 1665241968

#### 2. Premium Intergram (root-intergram-premium-1)
- **Port**: 3001 (localhost only)
- **Public URL**: https://p-chat.photier.co
- **Purpose**: Premium chat with AI/Human mode switching
- **Features**: Advanced chat WITH tabs (AI Bot / Live Support)
- **N8N Webhook**: https://n8n.photier.co/webhook/admin-chat
- **Container**: `root-intergram-premium-1`
- **Environment Variable**: `N8N_WEBHOOK_URL=https://n8n.photier.co/webhook/admin-chat`
- **Tab System**: Each tab has its own separate conversation history
- **Data Storage**: All conversations stored in N8N database (not in-memory)

---

## Important Endpoints

### Normal Web Intergram (port 3000)
- `/hook` - Telegram webhook for admin messages
- `/usage-start` - Track chat widget usage
- `/send-to-user` - N8N sends AI responses here (POST)
- `/status` - Health check
- `/api/settings` - **NEW**: Get/Set service messages configuration (GET/POST)

### Premium Intergram (port 3001)
- `/hook` - Telegram webhook for admin messages
- `/send-to-user` - N8N sends AI responses here (POST)
- `/usage-start` - Track chat widget usage
- `/status` - Health check
- `/api/settings` - **NEW**: Get/Set service messages configuration (GET/POST)
- ~~`/api/premium-stats`~~ - **REMOVED**: Now uses N8N instead
- ~~`/api/conversation/:userId`~~ - **REMOVED**: Now uses N8N instead

### Stats Dashboard (root-stats-1)
- **URL**: https://stats.photier.co
- **Port**: 80 (internal)
- **API Endpoints Used**:
  - N8N All Stats: `https://n8n.photier.co/webhook/photier-stats`
  - N8N Premium Stats: `https://n8n.photier.co/webhook/photier-stats?premium=true` **NEW**
  - N8N User Messages: `https://n8n.photier.co/webhook/photier-stats?userId=XXX`
  - Web Settings: `https://chat.photier.co/api/settings` **NEW**
  - Premium Settings: `https://p-chat.photier.co/api/settings` **NEW**

---

## N8N Workflow Integration

### Normal Web Chat Flow
1. User sends message from web widget → Intergram server
2. Server sends to N8N: `POST https://n8n.photier.co/webhook/intergram-message`
   ```json
   {
     "userId": "Guest-abc123",
     "chatId": "1665241968",
     "message": "user message text",
     "from": "user",
     "timestamp": "2025-10-25T18:00:00.000Z",
     "visitorName": "Guest-abc123",
     "premium": false,
     "CustomData": "{...}"
   }
   ```
3. **If service messages enabled**: Server also sends to Telegram (admin notification)
4. N8N processes with AI (RAG from Photier data)
5. N8N stores in database (photier.rag table)
6. N8N sends response: `POST https://chat.photier.co/send-to-user`
   ```json
   {
     "userId": "Guest-abc123",
     "chatId": "1665241968",
     "message": "AI response text",
     "from": "bot"
   }
   ```
7. User receives AI response in widget

### Premium Chat Flow
1. User selects mode (AI Bot / Live Support) via tabs
2. User sends message with `human_mode` flag and `premium: true`
3. Server sends to N8N: `POST https://n8n.photier.co/webhook/admin-chat`
   ```json
   {
     "userId": "Guest-xyz789",
     "chatId": "...",
     "message": "user message text",
     "human_mode": false,  // false = AI, true = Live Support
     "messageSource": "ai_bot" | "live_support",
     "premium": true,  // IMPORTANT: Marks as premium chat
     "pageUrl": "...",
     "realIp": "...",
     "country": "TR",
     "city": "Istanbul",
     // ... location data
   }
   ```
4. **If service messages enabled**: Server also sends to Telegram
5. If `human_mode: false` → N8N sends to AI
6. If `human_mode: true` → N8N sends to Telegram only (no AI)
7. N8N stores in database with `premium: true` flag
8. N8N sends response: `POST https://p-chat.photier.co/send-to-user`
9. User receives response in widget

### N8N Stats Webhook - Premium Filter

**NEW**: N8N now supports premium user filtering via query parameter.

**Endpoint**: `https://n8n.photier.co/webhook/photier-stats?premium=true`

**N8N Code** (in photier-stats workflow):
```javascript
const items = $input.all();

// Webhook'tan premium query parametresini al
const isPremiumFilter = $('Webhook').first().json.query?.premium === 'true';

// Premium filtresi varsa sadece premium kullanıcıları döndür
if (isPremiumFilter) {
  const premiumItems = items.filter(i => i.json.premium === true);

  const uniqueUsers = [...new Set(premiumItems.map(i => i.json.user_id))];

  const userMessages = {};
  premiumItems.forEach(item => {
    const userId = item.json.user_id;
    if (!userMessages[userId]) {
      userMessages[userId] = [];
    }
    userMessages[userId].push(item.json);
  });

  const userStats = Object.entries(userMessages).map(([userId, messages]) => {
    const sortedMsgs = messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const lastMessage = sortedMsgs[0];
    const isHumanMode = messages.some(m => m.human_mode === true);

    return {
      userId,
      messageCount: messages.length,
      messageSource: lastMessage?.messageSource || (isHumanMode ? 'live_support' : 'ai_bot'),
      lastActivity: lastMessage?.createdAt,
      userName: lastMessage?.user_name || 'Anonim',
      country: lastMessage?.country || ''
    };
  });

  return {
    json: {
      users: userStats.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity)),
      totalUsers: uniqueUsers.length
    }
  };
}

// Normal stats için devam et...
const userStats = Object.entries(userMessages).map(([userId, messages]) => {
  // ...
  return {
    userId,
    userMessageCount: userMsgs.length,
    // ...
    premium: lastMessage ? (lastMessage.premium || false) : false  // Premium field
  };
});

// Normal users: Premium olmayanları filtrele
const allUsers = userStats
  .filter(u => !u.premium)  // Premium kullanıcıları hariç tut
  .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
  .map(u => ({
    userId: u.userId,
    userName: u.userName || 'Anonim',
    lastActivity: u.lastActivity,
    messageCount: u.userMessageCount,
    isHumanMode: u.isHumanMode,
    country: u.country
  }));
```

**Result**:
- `?premium=true` → Returns only premium users
- No parameter → Returns only non-premium users (via `.filter(u => !u.premium)`)
- No duplicate users between normal and premium lists

---

## Service Messages Control (Settings Feature)

**NEW FEATURE**: Settings page added to Stats Dashboard for runtime control of service messages.

### Overview

**Purpose**: Control whether automatic service messages are sent to Telegram without code changes or restarts.

**Default State**: **DISABLED** (service messages OFF by default)

**Features**:
- Apple-style toggle switches
- Separate controls for Web Chat and Premium Chat
- Runtime configuration (no container restart needed)
- In-memory settings (reset to default on container restart)

### Settings API

Both Web and Premium servers expose identical settings endpoints:

**GET /api/settings**
```bash
curl https://chat.photier.co/api/settings
# Returns: {"success":true,"serviceMessagesEnabled":false}
```

**POST /api/settings**
```bash
curl -X POST https://chat.photier.co/api/settings \
  -H "Content-Type: application/json" \
  -d '{"serviceMessagesEnabled":true}'
# Returns: {"success":true,"serviceMessagesEnabled":true}
```

### Implementation

**server.js** (both Web and Premium):
```javascript
// Settings - default to false (service messages disabled)
let settings = {
  serviceMessagesEnabled: false
};

// GET endpoint
app.get('/api/settings', function (req, res) {
  res.statusCode = 200;
  res.json({
    success: true,
    serviceMessagesEnabled: settings.serviceMessagesEnabled
  });
});

// POST endpoint
app.post('/api/settings', function (req, res) {
  try {
    const { serviceMessagesEnabled } = req.body;

    if (typeof serviceMessagesEnabled !== 'boolean') {
      res.statusCode = 400;
      res.json({ success: false, error: 'Invalid parameter' });
      return;
    }

    settings.serviceMessagesEnabled = serviceMessagesEnabled;
    console.log('Settings updated:', settings);

    res.statusCode = 200;
    res.json({
      success: true,
      serviceMessagesEnabled: settings.serviceMessagesEnabled
    });
  } catch (e) {
    console.error('Settings update error:', e);
    res.statusCode = 500;
    res.json({ success: false, error: e.message });
  }
});
```

### Controlled Messages

**When `serviceMessagesEnabled: false` (default)**:
- ❌ Connection notifications NOT sent to Telegram
- ❌ "has come back" NOT sent to Telegram
- ❌ "has left" NOT sent to Telegram
- ❌ User messages NOT sent to Telegram
- ✅ Messages still sent to N8N for AI processing
- ✅ Admin can still reply from Telegram

**When `serviceMessagesEnabled: true`**:
- ✅ All service messages sent to Telegram
- ✅ User messages sent to Telegram
- ✅ Connection/reconnection/disconnect notifications sent

**Code locations** (server.js):

1. **Connection Messages** (~line 395):
```javascript
// Send connection message if service messages are enabled
if (settings.serviceMessagesEnabled && CustomMsgData) {
  sendTelegramMessage(chatId, `${CustomMsgData}`, 'Markdown', true);
}
```

2. **"has come back" Message** (~line 417):
```javascript
if (users[userIndex].active && settings.serviceMessagesEnabled) {
  sendTelegramMessage(chatId, '`' + userId + '` has come back 👋', 'Markdown', true);
}
```

3. **"has left" Message** (~line 527):
```javascript
if (!users[userIndex].banned && settings.serviceMessagesEnabled) {
  sendTelegramMessage(chatId, '`' + userId + '` has left 🏃💨', 'Markdown', true);
}
```

4. **User Messages** (~line 444):
```javascript
// Send user message to Telegram if service messages are enabled
if (settings.serviceMessagesEnabled) {
  sendTelegramMessage(chatId, '`' + userId + '`:' + visitorName + ' ' + msg.text, 'Markdown');
}
```

### Settings Page (Stats Dashboard)

**Location**: https://stats.photier.co → Settings (in sidebar, above Admin section)

**Features**:
- **Web Chat Settings Card**: Toggle for chat.photier.co
- **Premium Chat Settings Card**: Toggle for p-chat.photier.co
- **Info Card**: Explains what settings do
- **Status Messages**: Success/error feedback (auto-hide after 5 seconds)

**UI Design**:
- Apple-style toggle switches (#34C759 green when ON)
- Clean card-based layout
- Separate controls for each system
- Real-time updates (no page refresh needed)

**Frontend Code** (stats index.html):
```javascript
async function loadSettings() {
  try {
    // Load web settings
    const webResponse = await fetch('https://chat.photier.co/api/settings');
    const webData = await webResponse.json();
    document.getElementById('webServiceMessages').checked = webData.serviceMessagesEnabled || false;

    // Load premium settings
    const premiumResponse = await fetch('https://p-chat.photier.co/api/settings');
    const premiumData = await premiumResponse.json();
    document.getElementById('premiumServiceMessages').checked = premiumData.serviceMessagesEnabled || false;
  } catch (error) {
    console.error('Settings yüklenirken hata:', error);
  }
}

async function updateWebSettings() {
  const enabled = document.getElementById('webServiceMessages').checked;
  const response = await fetch('https://chat.photier.co/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serviceMessagesEnabled: enabled })
  });
  // Show success/error message...
}
```

### Important Notes

1. **Runtime Changes**: Settings take effect immediately, no restart needed
2. **In-Memory Only**: Settings reset to `false` on container restart
3. **Independent Controls**: Web and Premium have separate settings
4. **N8N Not Affected**: Messages always sent to N8N regardless of settings
5. **Admin Replies Work**: Telegram → User messages always work

---

## AutoResponse and Auto-Notifications (DISABLED)

### Overview

**Status**: Both features are DISABLED in production systems as of 2025-10-26

**Reason**: N8N AI workflow handles all automated responses. Having duplicate automatic messages was confusing users and creating unwanted spam-like behavior.

**NEW**: Service messages now controlled via Settings page (see "Service Messages Control" section above)

### Client-Side AutoResponse (chat.js)

**What it was**: Original intergram feature that sends automatic messages when:
1. User sends first message → Auto-reply: "Thanks for your message, we'll get back to you soon"
2. No admin response within 60 seconds → "Sorry, no one is available right now"

**Why disabled**: Conflicts with N8N AI which already provides instant intelligent responses

**Implementation** (DISABLED in both web and premium):

```javascript
// In sendMessage() function (~lines 148-171)
this.input.value = '';

// AutoResponse disabled - was causing unwanted automated messages
/*
if (this.autoResponseState === 'pristine') {
    if (this.props.conf.autoResponse) {
        setTimeout(() => {
            this.writeToMessages({
                text: this.props.conf.autoResponse,
                from: 'admin',
            });
        }, 500);
    }

    if (this.props.conf.autoNoResponse) {
        this.autoResponseTimer = setTimeout(() => {
            this.writeToMessages({
                text: this.props.conf.autoNoResponse,
                from: 'admin',
            });
            this.autoResponseState = 'canceled';
        }, 60 * 1000);
    }
    this.autoResponseState = 'set';
}
*/
```

```javascript
// In incomingMessage() function (~lines 180-188)
if (msg.from === 'admin') {
    document.getElementById('messageSound').play();

    // AutoResponse state management disabled
    /*
    if (this.autoResponseState === 'pristine') {
        this.autoResponseState = 'canceled';
    } else if (this.autoResponseState === 'set') {
        this.autoResponseState = 'canceled';
        clearTimeout(this.autoResponseTimer);
    }
    */
}
```

**Configuration** (NOT used since feature is disabled):
```javascript
window.intergramCustomizations = {
    autoResponse: "Thanks for your message! We'll get back to you soon.",
    autoNoResponse: "Sorry, no one is available right now. We'll respond as soon as possible.",
    // ... other settings
};
```

### Server-Side Auto-Notifications (server.js)

**What it was**: Telegram notifications sent automatically when users connect or reconnect

**Messages sent**:
1. User connects → Telegram: `` `Guest-abc123`: connected to chat 😶‍🌫️ ``
2. User returns → Telegram: `` `Guest-abc123` has come back 👋 ``
3. User leaves → Telegram: `` `Guest-abc123` has left 🏃💨 ``
4. User messages → Telegram: `` `Guest-abc123`: user message text ``

**Why disabled by default**: These notifications were spamming Telegram channel. Now controlled via Settings page (default: OFF).

**Implementation** (Settings-controlled):

```javascript
// In socket connection handler
if (settings.serviceMessagesEnabled && CustomMsgData) {
    sendTelegramMessage(chatId, `${CustomMsgData}`, 'Markdown', true);
}

// In user reconnection handler
if (users[userIndex].active && settings.serviceMessagesEnabled) {
    sendTelegramMessage(chatId, '`' + userId + '` has come back 👋', 'Markdown', true);
}

// In disconnect handler
if (!users[userIndex].banned && settings.serviceMessagesEnabled) {
    sendTelegramMessage(chatId, '`' + userId + '` has left 🏃💨', 'Markdown', true);
}

// In message handler
if (settings.serviceMessagesEnabled) {
    sendTelegramMessage(chatId, '`' + userId + '`:' + visitorName + ' ' + msg.text, 'Markdown');
}
```

### What Still Works

**N8N Webhook Notifications**: Server still sends user messages to N8N webhook for AI processing and database storage

**Manual Admin Messages**: Admins can still send messages from Telegram which get forwarded to users

**Sound Notifications**: Browser sound still plays when admin sends message

**Settings Control**: Admin can enable service messages via Settings page if needed

---

## Premium Chat: AI/Human Mode Tabs

### Tab System Architecture

**CRITICAL**: Each tab has its OWN separate conversation history. This is NOT just a mode switcher - it's two independent conversations.

**How It Works**:
- **AI Bot Tab**: Shows only AI conversations, has its own intro message
- **Live Support Tab**: Shows only human support conversations, has its own intro message
- **Switching Tabs**: Messages do NOT carry over - each tab maintains separate history
- **localStorage**: Two separate keys store each conversation independently
- **Backend Storage**: All messages stored in N8N database with `premium: true` flag

### Frontend Implementation (chat.js)

#### 1. Separate Message Arrays
```javascript
constructor(props) {
    // Two separate message arrays - one for each tab
    if (store.enabled) {
        this.aiMessagesKey = 'messages.ai' + '.' + props.chatId + '.' + props.host;
        this.humanMessagesKey = 'messages.human' + '.' + props.chatId + '.' + props.host;
        this.aiMessages = store.get(this.aiMessagesKey) || [];
        this.humanMessages = store.get(this.humanMessagesKey) || [];
    } else {
        this.aiMessages = [];
        this.humanMessages = [];
    }

    // Default to AI mode
    this.state.humanMode = false;

    // Show messages from active tab
    this.state.messages = this.state.humanMode ? this.humanMessages : this.aiMessages;
}
```

#### 2. Separate Intro Messages
```javascript
componentDidMount() {
    // AI Bot intro message
    if (!this.aiMessages.length && this.props.conf.aiIntroMessage) {
        this.aiMessages.push({ text: this.props.conf.aiIntroMessage, from: 'admin' });
        if (store.enabled) {
            store.set(this.aiMessagesKey, this.aiMessages);
        }
    }

    // Live Support intro message
    if (!this.humanMessages.length && this.props.conf.introMessage) {
        this.humanMessages.push({ text: this.props.conf.introMessage, from: 'admin' });
        if (store.enabled) {
            store.set(this.humanMessagesKey, this.humanMessages);
        }
    }

    // Display active tab's messages
    this.setState({
        messages: this.state.humanMode ? this.humanMessages : this.aiMessages
    });
}
```

#### 3. Tab Switching
```javascript
switchTab = (isHumanMode) => {
    // Switch tab and load that tab's conversation history
    const newMessages = isHumanMode ? this.humanMessages : this.aiMessages;
    this.setState({
        humanMode: isHumanMode,
        messages: newMessages
    });
};
```

**Tab Buttons**:
- Button 1: "👤 Live Support" → `onClick={() => this.switchTab(true)}`
- Button 2: "🤖 Photier AI Bot" → `onClick={() => this.switchTab(false)}`

#### 4. Message Writing
```javascript
writeToMessages = (msg) => {
    msg.time = msg.time ? new Date(msg.time) : new Date();

    // Add to correct array based on active tab
    if (this.state.humanMode) {
        this.humanMessages.push(msg);
        if (store.enabled) {
            store.set(this.humanMessagesKey, this.humanMessages);
        }
    } else {
        this.aiMessages.push(msg);
        if (store.enabled) {
            store.set(this.aiMessagesKey, this.aiMessages);
        }
    }

    // Update display
    this.setState({
        messages: this.state.humanMode ? this.humanMessages : this.aiMessages,
    });
};
```

#### 5. Clear Chat Handler
```javascript
handleClearChat = (event) => {
    if (event.data && event.data.type === 'CLEAR_CHAT') {
        // Clear both arrays
        this.aiMessages = [];
        this.humanMessages = [];

        // Clear localStorage
        if (store.enabled) {
            store.remove(this.aiMessagesKey);
            store.remove(this.humanMessagesKey);
        }

        // Re-add intro messages
        if (this.props.conf.aiIntroMessage) {
            this.aiMessages.push({ text: this.props.conf.aiIntroMessage, from: 'admin' });
            if (store.enabled) {
                store.set(this.aiMessagesKey, this.aiMessages);
            }
        }

        if (this.props.conf.introMessage) {
            this.humanMessages.push({ text: this.props.conf.introMessage, from: 'admin' });
            if (store.enabled) {
                store.set(this.humanMessagesKey, this.humanMessages);
            }
        }

        // Update state
        this.setState({
            messages: this.state.humanMode ? this.humanMessages : this.aiMessages
        });
    }
};
```

### Backend (server.js)

**Message Handler**:
```javascript
const humanMode = msg.human_mode !== undefined ? msg.human_mode : true;
users[userIndex].human_mode = humanMode;  // Save preference

const messageSource = msg.messageSource || (humanMode ? 'live_support' : 'ai_bot');

// Send to N8N with human_mode flag and premium flag
request.post(n8nWebhookUrl, {
  json: {
    userId, chatId, message: msg.text,
    human_mode: humanMode,
    messageSource: messageSource,
    premium: true,  // Mark as premium
    country: country,
    // ...
  }
});
```

### Widget Configuration

```javascript
window.intergramCustomizations = {
    // Live Support (Human) intro message
    introMessage: "Welcome to Premium Support! How can I assist you? ✨",

    // AI Bot intro message
    aiIntroMessage: "Hi there! 👋 I'm Photier AI, your 24/7 virtual assistant. How can I help you today?",

    // Other settings...
    titleOpen: "⭐ Premium Support",
    mainColor: "#9F7AEA",

    // Working hours for Live Support
    workingHours: {
        enabled: true,
        start: "09:00",
        end: "18:00"
    }
};
```

### User Experience Flow

**Scenario 1: AI Bot Usage**
1. User opens widget → Sees "🤖 Photier AI Bot" tab active (default)
2. Sees AI intro: "Hi there! 👋 I'm Photier AI..."
3. Chats with AI bot
4. Closes widget → Returns later → AI conversation still there

**Scenario 2: Switching to Live Support**
1. User clicks "👤 Live Support" tab
2. **Conversation changes** → Sees human intro: "Welcome to Premium Support!..."
3. Previous AI conversation is NOT visible
4. Chats with human agent
5. Switches back to AI Bot → AI conversation reappears, human chat hidden

**Scenario 3: Both Tabs Used**
1. User chats with AI → "How do I reset password?"
2. Switches to Live Support → Fresh conversation starts
3. Asks human: "I need help with billing"
4. Switches back to AI → Sees password reset conversation
5. Both conversations persist independently

---

## File Structure

### Docker Compose Configuration
```
/root/docker-compose.yml         # Main orchestration file
```

**CRITICAL Volume Mappings**:
```yaml
# Normal Web Intergram (root-intergram-1)
volumes:
  - /root/intergram/telegram-chat-widget/static/js/chat.js:/app/static/js/chat.js
  # ^^^ MUST point to /root/intergram (NOT intergram-premium)

# Premium Intergram (root-intergram-premium-1)
volumes:
  - /root/intergram-premium/telegram-chat-widget/static/js/chat.js:/app/static/js/chat.js
  # ^^^ MUST point to /root/intergram-premium
```

**Common Mistake**: Web container accidentally mounting premium's chat.js file causes tabs to appear in web chat.

### Normal Web Intergram
```
Host Files (/root/intergram/):
└── telegram-chat-widget/
    └── static/
        └── js/
            └── chat.js          # Built bundle mounted to container

Container Files (/app/):
├── server.js                    # Main server with settings API
├── server.js.backup             # Backup of simple version
├── src/
│   └── chat/
│       ├── chat.js              # Source WITHOUT tabs, autoResponse disabled
│       └── chat.js.backup
└── static/
    └── js/
        ├── chat.js              # Built bundle (113.8K) - mounted from host
        └── widget.js            # Widget loader (36.2K)
```

### Premium Intergram
```
Host Files (/root/intergram-premium/):
└── telegram-chat-widget/
    └── static/
        └── js/
            └── chat.js          # Built bundle mounted to container

Container Files (/app/):
├── server.js                    # Main server (~760 lines) with settings API
├── server.js.backup             # Backup with full features
├── src/
│   └── chat/
│       ├── chat.js              # Source WITH tabs, autoResponse disabled
│       └── chat.js.backup
└── static/
    └── js/
        ├── chat.js              # Built bundle (121K) - mounted from host
        └── widget.js            # Widget loader (37K)
```

### Stats Dashboard
```
Container Files (/usr/share/nginx/html/):
├── index.html                   # Main dashboard page with Settings
├── api.js                       # API integration, N8N endpoints
└── ... (chart libraries, etc)
```

### Backup Files (Local Machine)
```
/tmp/
├── web_chat_real_backup.js      # Working backup of web chat.js (no tabs, no autoResponse)
├── web_chat_current.js          # Current web chat.js with latest fixes
├── premium_server_actual.js     # Clean premium server.js backup
├── premium_server_final.js      # Premium server.js with settings API
├── web_server_current.js        # Web server.js with settings API
└── stats_index_current.html     # Stats dashboard with Settings page
```

---

## Build & Deploy Process

### Container vs Host Files - CRITICAL UNDERSTANDING

**Volume Mounts**: Only `/app/static/js/chat.js` is mounted from host. Other files live inside container.

**File Locations**:
```
HOST (/root/intergram/):
└── telegram-chat-widget/static/js/chat.js   → Mounted to container

CONTAINER (/app/):
├── server.js                                 → Inside container (NOT mounted)
├── src/chat/chat.js                          → Inside container (NOT mounted)
└── static/js/chat.js                         → Mounted from host
```

**Impact**:
- Changes to host's `chat.js` → Immediately visible (after container restart)
- Changes to container's `/app/src/chat/chat.js` → Requires rebuild to affect `/app/static/js/chat.js`
- Changes to container's `/app/server.js` → Requires container restart

### When to Rebuild

**CRITICAL**: After modifying source files in `/app/src/`, you MUST rebuild webpack bundles.

#### Normal Web Intergram
```bash
# 1. Edit source files (inside container)
docker exec root-intergram-1 vi /app/src/chat/chat.js

# 2. Build webpack bundles (inside container)
docker exec root-intergram-1 sh -c 'cd /app && npm run build'

# 3. Copy built file to host (to persist across container recreates)
docker cp root-intergram-1:/app/static/js/chat.js /root/intergram/telegram-chat-widget/static/js/chat.js

# 4. Restart container
docker restart root-intergram-1

# Verify: check built file size
docker exec root-intergram-1 ls -lh /app/static/js/chat.js
```

#### Premium Intergram
```bash
# 1. Edit source files (inside container)
docker exec root-intergram-premium-1 vi /app/src/chat/chat.js

# 2. Build webpack bundles (inside container)
docker exec root-intergram-premium-1 sh -c 'cd /app && npm run build'

# 3. Copy built file to host (to persist across container recreates)
docker cp root-intergram-premium-1:/app/static/js/chat.js /root/intergram-premium/telegram-chat-widget/static/js/chat.js

# 4. Restart container
docker restart root-intergram-premium-1

# Verify: check built file size
docker exec root-intergram-premium-1 ls -lh /app/static/js/chat.js
```

### Updating Source Files (Recommended Workflow)

**Step 1: Prepare fixed file locally**
```bash
# Edit file on local machine (/tmp/web_chat_fixed.js)
# Test syntax with Node
node -c /tmp/web_chat_fixed.js
```

**Step 2: Upload to container**
```bash
# Pipe directly into container (recommended)
cat /tmp/web_chat_fixed.js | ssh root@92.113.21.229 "docker exec -i root-intergram-1 tee /app/src/chat/chat.js > /dev/null"

# Or use docker cp (if file exists on server)
scp /tmp/web_chat_fixed.js root@92.113.21.229:/tmp/
ssh root@92.113.21.229 "docker cp /tmp/web_chat_fixed.js root-intergram-1:/app/src/chat/chat.js"
```

**Step 3: Build inside container**
```bash
ssh root@92.113.21.229 "docker exec root-intergram-1 sh -c 'cd /app && npm run build'"
```

**Step 4: Copy built file to host (persist changes)**
```bash
ssh root@92.113.21.229 "docker cp root-intergram-1:/app/static/js/chat.js /root/intergram/telegram-chat-widget/static/js/chat.js"
```

**Step 5: Restart container**
```bash
ssh root@92.113.21.229 "docker restart root-intergram-1"
```

### Updating server.js

**Method 1: Direct pipe** (recommended, container must be running)
```bash
# Validate syntax first
node -c /tmp/new_server.js

# Pipe from local file
cat /tmp/new_server.js | ssh root@92.113.21.229 "docker exec -i root-intergram-1 tee /app/server.js > /dev/null"

# Restart
ssh root@92.113.21.229 "docker restart root-intergram-1"
```

**Method 2: Copy via server** (if file is locked or container busy)
```bash
# Upload to server first
scp /tmp/new_server.js root@92.113.21.229:/root/intergram/server.js

# Restart container (picks up new file on restart)
ssh root@92.113.21.229 "docker restart root-intergram-1"
```

**Method 3: Stop, copy, start** (guaranteed to work)
```bash
ssh root@92.113.21.229 "docker stop root-intergram-1"
ssh root@92.113.21.229 "docker cp /root/intergram/server.js root-intergram-1:/app/server.js"
ssh root@92.113.21.229 "docker start root-intergram-1"
```

### Updating Stats Dashboard

**Direct pipe to container**:
```bash
# Update index.html
cat /tmp/stats_index.html | ssh root@92.113.21.229 "docker exec -i root-stats-1 tee /usr/share/nginx/html/index.html > /dev/null"

# Update api.js
cat /tmp/stats_api.js | ssh root@92.113.21.229 "docker exec -i root-stats-1 tee /usr/share/nginx/html/api.js > /dev/null"

# No restart needed - nginx serves updated files immediately
```

---

## Stats Dashboard

### Architecture
- **Container**: root-stats-1
- **URL**: https://stats.photier.co
- **Technology**: Pure HTML + Vanilla JS (no framework)
- **Charts**: Chart.js

### Data Sources

**UPDATED**: All data now sourced from N8N database.

1. **N8N All Users Stats** (Normal users only - premium excluded)
   - Endpoint: `https://n8n.photier.co/webhook/photier-stats`
   - Returns: `[{totalUsers, totalMessages, allUsers: [...], countries: [...], ...}]`
   - Format: Array with single object
   - **Important**: `allUsers` filtered to exclude premium users (`.filter(u => !u.premium)`)

2. **N8N Premium Stats** (Premium users only)
   - Endpoint: `https://n8n.photier.co/webhook/photier-stats?premium=true`
   - Returns: `[{users: [...], totalUsers}]`
   - Format: Array with single object
   - **Important**: Only returns users where `premium: true`

3. **N8N User Messages** (Individual conversation)
   - Endpoint: `https://n8n.photier.co/webhook/photier-stats?userId=XXX`
   - Returns: `[{user_id, message, from: 'user'|'bot', createdAt, premium, country, ...}, ...]`
   - Format: Array of message objects

4. **Settings API** (Service messages control)
   - Web: `https://chat.photier.co/api/settings` (GET/POST)
   - Premium: `https://p-chat.photier.co/api/settings` (GET/POST)
   - Returns: `{success: true, serviceMessagesEnabled: true|false}`

### Pages

1. **Dashboard** (Home)
   - Summary cards: Total users, AI handled, Human handled, Total messages
   - Charts: Daily users, AI vs Human pie chart, Weekly messages
   - Active users table (last 10)
   - Countries list with flags

2. **Web Kullanıcılar** (Users)
   - All users list (premium excluded)
   - Columns: User ID, Message count, Last activity, Country (with flag), Mode, Status
   - Click row → View conversation modal
   - Search functionality
   - **Pagination**: 20 users per page, "Daha Fazla Yükle" (Load More) button
   - Load More button auto-hides when all users displayed

3. **Premium Chat**
   - Premium users only (from N8N)
   - Columns: User ID (with ⭐), Message count, Support type (AI/Live), Country (with flag), Last activity
   - Light salmon background (#FFFBF8)
   - Click row → View conversation modal
   - **Pagination**: 20 users per page, "Daha Fazla Yükle" (Load More) button
   - Load More button auto-hides when all users displayed

4. **Settings** (NEW)
   - Apple-style toggle switches
   - Web Chat service messages control
   - Premium Chat service messages control
   - Info card explaining settings
   - Success/error feedback messages

### File Locations
- HTML: `/usr/share/nginx/html/index.html` (~1300 lines with Settings + Mobile Responsive)
- JavaScript: `/usr/share/nginx/html/api.js` (~580 lines with Pagination + Settings)

### Modal System
- Unified modal for all conversations (normal, premium, N8N)
- Supports multiple formats:
  - N8N: `{message, from: 'user'|'bot', createdAt}`
  - Premium (old): `{text, from: 'visitor'|'admin', time}`
- Event delegation for dynamic row clicks
- Escape to close, outside click to close

### Important Implementation Details

**Array Format Handling**:
```javascript
// N8N returns arrays, need to extract first element
const rawData = await response.json();
const data = Array.isArray(rawData) ? rawData[0] : rawData;
```

**Event Delegation** (fixed for premium rows):
```javascript
document.addEventListener('click', function(event) {
    // User row click
    let userRow = event.target.classList.contains('user-row')
        ? event.target
        : event.target.closest('.user-row');
    if (userRow) {
        const userId = userRow.getAttribute('data-userid');
        showUserMessages(userId);
        return;
    }

    // Premium row click (separate variable!)
    let premiumRow = event.target.classList.contains('premium-row')
        ? event.target
        : event.target.closest('.premium-row');
    if (premiumRow) {
        const userId = premiumRow.getAttribute('data-userid');
        viewConversation(userId);
    }
});
```

**Country Flags**:
```javascript
function getCountryFlag(code) {
    if (!code) return '🌐';
    const codePoints = code
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}
```

### Mobile Responsive Design

**Overview**: Stats Dashboard is fully responsive with mobile-first design approach.

**Key Features**:

1. **Hamburger Menu**:
   - Visible on screens ≤1024px
   - 3-line animated menu icon
   - Transforms to X when sidebar open
   - Located in top-left of header

2. **Sidebar Toggle System**:
   - **Desktop Mode** (>1024px):
     - Click hamburger → Sidebar collapses to 70px (emoji-only mode)
     - Click again → Sidebar expands to 260px (full menu)
     - State saved in localStorage
   - **Mobile Mode** (≤1024px):
     - Sidebar hidden by default (off-screen)
     - Click hamburger → Sidebar slides in from left
     - Semi-transparent overlay appears
     - Click overlay or hamburger → Sidebar closes

3. **Collapsed Sidebar** (Desktop):
   - Width: 70px
   - Shows only emojis (🏠 👥 ⭐ ⚙️)
   - Logo becomes: 📊
   - User avatar shows only initial letter
   - Menu items centered

4. **Responsive Breakpoints**:
   ```css
   @media (max-width: 1024px) {
     /* Tablet/Mobile: Hamburger visible, sidebar off-screen */
   }

   @media (max-width: 768px) {
     /* Mobile: Smaller fonts, compact padding, horizontal scroll tables */
   }
   ```

5. **Mobile Optimizations**:
   - Header padding reduced (15px → 12px)
   - Font sizes scaled down
   - Tables: Horizontal scroll (min-width: 600px)
   - Cards: Single column layout
   - Badges: Smaller text (10px)
   - Load More buttons: Compact (10px/20px padding)

**JavaScript Functions**:
```javascript
// Toggle sidebar
function toggleSidebar() {
  const isMobile = window.innerWidth <= 1024;
  if (isMobile) {
    // Mobile: open/close with overlay
  } else {
    // Desktop: collapsed/expanded
  }
  localStorage.setItem('sidebarState', sidebarState);
}

// State persistence
window.addEventListener('DOMContentLoaded', function() {
  const savedState = localStorage.getItem('sidebarState');
  // Restore state for desktop, hide for mobile
});

// Handle window resize
window.addEventListener('resize', function() {
  // Adjust sidebar behavior when switching desktop/mobile
});
```

### Pagination System

**Overview**: Both Web Kullanıcılar and Premium Chat pages use client-side pagination.

**Configuration**:
```javascript
// Pagination constants
const USERS_PER_PAGE = 20;      // Web users
const PREMIUM_PER_PAGE = 20;    // Premium users

// State variables
let allUsersData = [];           // All users loaded from N8N
let displayedUsersCount = 20;    // Currently displayed count
let allPremiumData = [];         // All premium users
let displayedPremiumCount = 20;  // Currently displayed count
```

**Implementation**:

1. **Initial Load**:
   - Fetch all users from N8N
   - Store in `allUsersData` or `allPremiumData`
   - Render first 20 users
   - Show/hide Load More button

2. **Load More Button**:
   ```javascript
   function loadMoreUsers() {
     displayedUsersCount += USERS_PER_PAGE;
     renderUsers();
   }

   function loadMorePremium() {
     displayedPremiumCount += PREMIUM_PER_PAGE;
     renderPremiumUsers();
   }
   ```

3. **Render Function**:
   ```javascript
   function renderUsers() {
     const usersToShow = allUsersData.slice(0, displayedUsersCount);
     // Render users to table

     // Show/hide Load More
     if (displayedUsersCount < allUsersData.length) {
       loadMoreContainer.style.display = 'block';
     } else {
       loadMoreContainer.style.display = 'none';
     }
   }
   ```

4. **Button Styling**:
   ```css
   .btn-load-more {
     padding: 12px 30px;
     background: #009EF7;
     color: #fff;
     border-radius: 6px;
     transition: all 0.2s;
   }
   .btn-load-more:hover {
     transform: translateY(-2px);
     box-shadow: 0 4px 12px rgba(0, 158, 247, 0.3);
   }
   ```

**Benefits**:
- Faster initial page load
- Reduced browser memory usage
- Better mobile performance
- Progressive data loading

---

## Common Operations

### Check Container Status
```bash
docker ps | grep intergram
docker ps | grep stats
```

### View Logs
```bash
# Normal web
docker logs root-intergram-1 --tail 50

# Premium
docker logs root-intergram-premium-1 --tail 50

# Stats
docker logs root-stats-1 --tail 50

# Follow logs
docker logs -f root-intergram-1

# Check for settings changes
docker logs root-intergram-1 | grep "Settings updated"
```

### Test Endpoints
```bash
# Test send-to-user (normal)
curl -X POST https://chat.photier.co/send-to-user \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","chatId":"123","message":"test from claude","from":"bot"}'

# Test N8N webhook
curl -X POST https://n8n.photier.co/webhook/intergram-message \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","chatId":"1665241968","message":"test"}'

# Test N8N stats (normal users)
curl https://n8n.photier.co/webhook/photier-stats

# Test N8N stats (premium users only)
curl "https://n8n.photier.co/webhook/photier-stats?premium=true"

# Test N8N user messages
curl "https://n8n.photier.co/webhook/photier-stats?userId=Guest-abc123"

# Test settings API
curl https://chat.photier.co/api/settings
curl https://p-chat.photier.co/api/settings

# Update settings
curl -X POST https://chat.photier.co/api/settings \
  -H "Content-Type: application/json" \
  -d '{"serviceMessagesEnabled":true}'
```

### Container Port Mappings
```bash
# View port mappings
docker port root-intergram-1
docker port root-intergram-premium-1

# Expected:
# root-intergram-1: 127.0.0.1:3000->3000/tcp
# root-intergram-premium-1: 127.0.0.1:3001->3001/tcp
```

---

## Troubleshooting

### Problem: Tabs showing in NORMAL web chat (should only be in premium)
**Symptom**: Normal web chat (chat.photier.co) displays AI Bot / Live Support tabs when it should be simple bot interface

**Root Cause**: Incorrect volume mapping in docker-compose.yml - web container mounting premium's chat.js file

**Diagnosis**:
```bash
# Check volume mapping
ssh root@92.113.21.229 "grep -A 10 'root-intergram-1' /root/docker-compose.yml"

# Wrong mapping looks like:
# - /root/intergram-premium/telegram-chat-widget/static/js/chat.js:/app/static/js/chat.js
#   ^^^^^^^^^^^^^^^^^^
```

**Solution**:
```bash
# 1. Fix docker-compose.yml volume mapping
# Change FROM:
#   - /root/intergram-premium/telegram-chat-widget/static/js/chat.js:/app/static/js/chat.js
# Change TO:
#   - /root/intergram/telegram-chat-widget/static/js/chat.js:/app/static/js/chat.js

# 2. Rebuild both containers
ssh root@92.113.21.229 "cd /root && docker compose up -d --build"

# 3. Verify fix
ssh root@92.113.21.229 "docker exec root-intergram-1 grep -c 'humanMode' /app/static/js/chat.js"
# Should return 0 (no tabs in web)

ssh root@92.113.21.229 "docker exec root-intergram-premium-1 grep -c 'humanMode' /app/static/js/chat.js"
# Should return >0 (tabs exist in premium)
```

### Problem: Service messages still going to Telegram even when settings say OFF

**Root Cause**: Settings not properly checked in server.js message handlers

**Diagnosis**:
```bash
# Check current settings value
curl https://chat.photier.co/api/settings
# Should return: {"success":true,"serviceMessagesEnabled":false}

# Check container logs for settings updates
docker logs root-intergram-1 | grep "Settings updated"

# Verify settings control code exists
docker exec root-intergram-1 grep -n "settings.serviceMessagesEnabled" /app/server.js
# Should show lines where settings is checked
```

**Solution**:
```bash
# Restart container to ensure latest server.js is loaded
docker restart root-intergram-1

# Verify settings API works
curl -X POST https://chat.photier.co/api/settings \
  -H "Content-Type: application/json" \
  -d '{"serviceMessagesEnabled":false}'

# Check logs confirm update
docker logs root-intergram-1 --tail 5
```

### Problem: Premium users showing in normal Users page

**Root Cause**: N8N code not filtering premium users from `allUsers`

**Diagnosis**:
```bash
# Check N8N response
curl https://n8n.photier.co/webhook/photier-stats | grep -o '"premium"'
# Should show premium field exists

# Check if filtering is applied
curl -s https://n8n.photier.co/webhook/photier-stats | grep "Guest-xxx"
# Compare with premium list to see if duplicates exist
```

**Solution**: Update N8N code to add `.filter(u => !u.premium)` to `allUsers`:
```javascript
const allUsers = userStats
  .filter(u => !u.premium)  // Add this line
  .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
  .map(u => ({...}));
```

### Problem: Premium stats page shows "No premium users" but database has data

**Root Cause 1**: N8N not returning premium field in messages

**Diagnosis**:
```bash
# Check if premium field exists in N8N data
curl "https://n8n.photier.co/webhook/photier-stats?premium=true"
# Should return users array, check if empty

# Check database directly (if access available)
# Verify messages have premium:true field
```

**Solution**: Ensure N8N workflow saves `premium: true` when receiving messages from p-chat.photier.co

**Root Cause 2**: Stats page not parsing N8N array format correctly

**Diagnosis**:
```bash
# Check browser console for errors
# Open https://stats.photier.co → Premium Chat → F12 → Console
# Look for "Cannot read property 'users' of undefined"
```

**Solution**: Fixed in api.js:
```javascript
const rawData = await response.json();
const data = Array.isArray(rawData) ? rawData[0] : rawData;  // Extract first element
```

### Problem: Premium chat modal not opening on row click

**Root Cause**: Event delegation not properly handling premium rows

**Diagnosis**:
```bash
# Check browser console
# Click premium row and look for errors
# Should see userId in console if event is captured
```

**Solution**: Fixed in api.js - separate variables for userRow and premiumRow:
```javascript
// DON'T reuse targetRow variable
let userRow = ...;
let premiumRow = ...;  // Separate variable!
```

### Problem: Country flags not showing

**Root Cause 1**: N8N not returning country field

**Solution**: Update N8N premium filter to include country:
```javascript
return {
  userId,
  messageCount: messages.length,
  // ...
  country: lastMessage?.country || ''  // Add this
};
```

**Root Cause 2**: Frontend not using getCountryFlag()

**Solution**: Update table rendering:
```javascript
const countryFlag = user.country ? getCountryFlag(user.country) : '🌐';
const countryText = user.country || '-';
// In HTML: ${countryFlag} ${countryText}
```

### Problem: Settings changes lost after container restart

**Expected Behavior**: Settings are in-memory only, reset to `false` on restart

**This is by design**: Settings default to disabled for safety

**Solution**: If persistent settings needed, implement:
- Database storage
- Environment variables
- Config file mounting

### Problem: Unwanted automatic messages from AI bot

**Symptom**: Users receiving automatic messages like "I'll get back to you soon" or "No one is available" even when using N8N AI

**Root Cause 1 - Client-side autoResponse**: chat.js has `autoResponse` and `autoNoResponse` features enabled

**Diagnosis**:
```bash
# Check if autoResponse code exists in source
ssh root@92.113.21.229 "docker exec root-intergram-1 grep -n 'autoResponse' /app/src/chat/chat.js"

# Lines 133-171: autoResponse logic in sendMessage()
# Lines 175-189: autoResponse state management in incomingMessage()
```

**Solution**:
```bash
# Download current chat.js
scp root@92.113.21.229:/app/src/chat/chat.js /tmp/web_chat_current.js

# Comment out autoResponse blocks:
# - Lines ~148-171 in sendMessage() function
# - Lines ~180-188 in incomingMessage() function

# Upload fixed file
cat /tmp/web_chat_fixed.js | ssh root@92.113.21.229 "docker exec -i root-intergram-1 tee /app/src/chat/chat.js > /dev/null"

# Rebuild
ssh root@92.113.21.229 "docker exec root-intergram-1 sh -c 'cd /app && npm run build'"

# Copy to host
ssh root@92.113.21.229 "docker cp root-intergram-1:/app/static/js/chat.js /root/intergram/telegram-chat-widget/static/js/chat.js"

# Restart
ssh root@92.113.21.229 "docker restart root-intergram-1"
```

**Root Cause 2 - Server auto-notifications**: Now controlled by Settings

**Solution**: Use Settings page to disable service messages (default is already OFF)

**Verification**:
```bash
# Check settings
curl https://chat.photier.co/api/settings
# Should return: {"success":true,"serviceMessagesEnabled":false}

# Monitor logs - should NOT see Telegram notifications
docker logs -f root-intergram-1 | grep -E "connected to chat|has come back"
```

### Problem: Tabs not showing in premium chat
**Cause**: Webpack bundles not rebuilt after source changes
**Solution**:
```bash
docker exec root-intergram-premium-1 sh -c 'cd /app && npm run build'
docker restart root-intergram-premium-1
```

### Problem: Tabs showing same conversation (not switching)
**Cause**: Single message array instead of separate arrays for each tab
**Root Cause**: Missing separate message storage implementation
**Solution**: Chat.js must have:
```javascript
// Two separate arrays
this.aiMessages = [];
this.humanMessages = [];

// Two separate localStorage keys
this.aiMessagesKey = 'messages.ai.{chatId}.{host}';
this.humanMessagesKey = 'messages.human.{chatId}.{host}';

// switchTab function to change displayed messages
switchTab = (isHumanMode) => {
    const newMessages = isHumanMode ? this.humanMessages : this.aiMessages;
    this.setState({ humanMode: isHumanMode, messages: newMessages });
};
```
**Verify Fix**:
```bash
# Check if separate arrays exist in source
docker exec root-intergram-premium-1 grep 'aiMessages\|humanMessages' /app/src/chat/chat.js

# Rebuild and restart
docker exec root-intergram-premium-1 sh -c 'cd /app && npm run build'
docker restart root-intergram-premium-1
```

### Problem: N8N webhook returns 404
**Cause**: Wrong webhook URL or workflow not activated
**Check**:
- Normal web: `https://n8n.photier.co/webhook/intergram-message`
- Premium: `https://n8n.photier.co/webhook/admin-chat`
- Stats: `https://n8n.photier.co/webhook/photier-stats`
- Ensure workflows are activated (not in test mode)

### Problem: /send-to-user returns "Cannot POST"
**Cause**: Endpoint not defined in server.js
**Solution**: Add endpoint:
```javascript
app.post('/send-to-user', function (req, res) {
  try {
    const { userId, chatId, message, from } = req.body;
    console.log('n8n response > ' + message);

    io.emit(chatId + '-' + userId, {
      text: message,
      from: from || 'bot',
      name: 'AI Assistant'
    });

    res.statusCode = 200;
    res.json({ success: true });
  } catch (e) {
    console.error('send-to-user error', e);
    res.statusCode = 500;
    res.json({ success: false, error: e.message });
  }
});
```

### Problem: Changes to server.js not taking effect
**Cause**: Container not restarted or file not updated
**Solution**:
```bash
# Verify file content
docker exec root-intergram-1 grep 'your-change' /app/server.js

# Restart
docker restart root-intergram-1

# Check logs for startup
docker logs root-intergram-1 --tail 10
```

### Problem: Intro messages not showing for each tab
**Cause**: Missing aiIntroMessage or introMessage in configuration
**Solution**: Ensure widget configuration includes both:
```javascript
window.intergramCustomizations = {
    introMessage: "Welcome to Premium Support! How can I assist you? ✨",
    aiIntroMessage: "Hi there! 👋 I'm Photier AI, your 24/7 virtual assistant...",
    // ...
};
```

### Problem: Sidebar not collapsing on desktop

**Symptom**: Clicking hamburger menu does nothing on desktop

**Root Cause**: JavaScript not loaded or localStorage conflicts

**Diagnosis**:
```bash
# Check browser console for errors
# Open https://stats.photier.co → F12 → Console
# Look for "toggleSidebar is not defined" or similar

# Check if function exists
curl -s "https://stats.photier.co/index.html" | grep -c "function toggleSidebar"
# Should return > 0
```

**Solution**:
```bash
# Clear localStorage
localStorage.removeItem('sidebarState');

# Hard refresh browser
CTRL + F5 (Windows) or CMD + SHIFT + R (Mac)

# Verify JS file is loaded
curl -s "https://stats.photier.co/index.html" | grep "toggleSidebar"
```

### Problem: Mobile sidebar stuck open or won't open

**Symptom**: Sidebar overlay visible but sidebar not sliding in, or sidebar stuck on screen

**Root Cause**: CSS transform not applied or conflicting classes

**Diagnosis**:
```javascript
// In browser console
const sidebar = document.getElementById('sidebar');
console.log(sidebar.classList);
// Should show current classes

console.log(window.innerWidth);
// Check if mobile breakpoint (<= 1024px)
```

**Solution**:
```javascript
// Manually close sidebar
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');
sidebar.classList.remove('mobile-open');
overlay.classList.remove('active');

// Or reload page
location.reload();
```

### Problem: Load More button not showing/hiding correctly

**Symptom**: "Daha Fazla Yükle" button visible when all users displayed, or not showing when more users available

**Root Cause**: Pagination logic not updating display state

**Diagnosis**:
```javascript
// In browser console (Web Kullanıcılar page)
console.log('All users:', allUsersData.length);
console.log('Displayed:', displayedUsersCount);
console.log('Remaining:', allUsersData.length - displayedUsersCount);

// Check button visibility
const btn = document.getElementById('loadMoreUsersContainer');
console.log('Button display:', btn.style.display);
```

**Solution**:
```bash
# Reload page to reset pagination state
location.reload();

# Or manually reset
displayedUsersCount = 20;
renderUsers();
```

### Problem: Pagination showing duplicate users

**Symptom**: Same users appearing multiple times in list

**Root Cause**: N8N returning duplicates or `allUsersData` not clearing on reload

**Diagnosis**:
```javascript
// Check for duplicates
const userIds = allUsersData.map(u => u.userId);
const uniqueIds = [...new Set(userIds)];
console.log('Total:', userIds.length, 'Unique:', uniqueIds.length);
// If different, duplicates exist
```

**Solution**:
```javascript
// Filter duplicates client-side
const uniqueUsers = allUsersData.filter((user, index, self) =>
  index === self.findIndex(u => u.userId === user.userId)
);
allUsersData = uniqueUsers;
renderUsers();

// Or fix N8N query to return unique users only
```

### Problem: Mobile fonts too small or too large

**Symptom**: Text unreadable on mobile devices

**Root Cause**: Media query not applied or browser zoom

**Diagnosis**:
```bash
# Check if media queries exist
curl -s "https://stats.photier.co/index.html" | grep "@media (max-width"
# Should return multiple matches

# Check viewport meta tag
curl -s "https://stats.photier.co/index.html" | grep "viewport"
# Should have: <meta name="viewport" content="width=device-width, initial-scale=1.0">
```

**Solution**:
```html
<!-- Ensure viewport meta tag exists in <head> -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- Hard refresh to clear CSS cache -->
CTRL + F5 (Windows) or CMD + SHIFT + R (Mac)
```

### Problem: Hamburger menu not visible on mobile

**Symptom**: No menu button on mobile devices

**Root Cause**: CSS media query not triggering or button hidden

**Diagnosis**:
```javascript
// In browser console on mobile
const hamburger = document.getElementById('hamburgerMenu');
console.log('Display:', window.getComputedStyle(hamburger).display);
// Should be 'flex' on mobile (<= 1024px)

console.log('Window width:', window.innerWidth);
// Verify mobile breakpoint
```

**Solution**:
```css
/* Verify CSS rule exists */
@media (max-width: 1024px) {
  .hamburger-menu {
    display: flex; /* Should be flex, not none */
  }
}
```

---

## Critical Reminders

1. **NEVER modify the wrong intergram**:
   - Web features (simple) → root-intergram-1
   - Premium features (tabs, AI/Human) → root-intergram-premium-1

2. **ALWAYS rebuild after source changes**:
   - Edit `/app/src/chat/chat.js` → Run `npm run build` → Copy to host → Restart container
   - **CRITICAL**: `docker cp` built file to host to persist changes across container recreates

3. **ALWAYS verify docker-compose.yml volume mappings**:
   - Web container MUST mount: `/root/intergram/telegram-chat-widget/static/js/chat.js`
   - Premium container MUST mount: `/root/intergram-premium/telegram-chat-widget/static/js/chat.js`
   - Wrong mapping = tabs appear in wrong chat system

4. **Premium tabs require separate message storage**:
   - Each tab MUST have its own message array (aiMessages, humanMessages)
   - Each tab MUST have its own localStorage key
   - switchTab() function MUST update displayed messages

5. **AutoResponse is DISABLED in both systems**:
   - Client-side: autoResponse/autoNoResponse features commented out in chat.js
   - Server-side: Auto-notifications controlled by Settings (default: OFF)
   - **Reason**: N8N AI handles all responses - automatic messages were confusing and unwanted
   - **Location**: Lines 148-171 and 180-188 in chat.js

6. **Service Messages are controlled by Settings**:
   - Default: DISABLED (service messages OFF)
   - Runtime control via Settings page (no restart needed)
   - In-memory only (reset on container restart)
   - Separate controls for Web and Premium

7. **Container vs Host files understanding**:
   - Only `/app/static/js/chat.js` is mounted from host
   - Source files (`/app/src/chat/chat.js`, `/app/server.js`) live INSIDE container
   - Changes to source → Must rebuild → Must copy to host → Then restart

8. **ALWAYS check which system before making changes**:
   ```bash
   # Check container name
   docker ps | grep intergram

   # Check port
   docker exec <container> env | grep PORT

   # Check if N8N webhook exists
   docker exec <container> env | grep N8N

   # Verify volume mapping
   grep -A 10 'root-intergram-1' /root/docker-compose.yml
   ```

9. **Backup before major changes**:
   ```bash
   # Backup server.js
   docker exec root-intergram-1 cp /app/server.js /app/server.js.backup

   # Backup chat.js source
   docker exec root-intergram-premium-1 cp /app/src/chat/chat.js /app/src/chat/chat.js.backup

   # Backup to local machine
   ssh root@92.113.21.229 "docker exec root-intergram-1 cat /app/server.js" > /tmp/web_server_backup_$(date +%Y%m%d).js

   # Backup entire container
   docker commit root-intergram-1 intergram-backup:$(date +%Y%m%d-%H%M%S)
   ```

10. **Stats dashboard uses N8N for ALL data**:
    - Normal users: N8N API (premium excluded)
    - Premium users: N8N API (premium only)
    - Settings: Direct API calls to containers
    - **No more in-memory stats from containers**

11. **N8N Premium Filtering**:
    - Premium messages MUST have `premium: true` field
    - N8N workflow filters by this field
    - Normal users exclude premium (`.filter(u => !u.premium)`)
    - Premium query: `?premium=true`

12. **Common errors to avoid**:
    - Editing host file instead of container source file (source must be in container)
    - Forgetting to copy built file to host (changes lost on container recreate)
    - Not restarting container after server.js changes
    - Using wrong container name in commands
    - Forgetting to add `premium` field to N8N userStats
    - Reusing `targetRow` variable in event delegation

13. **Mobile Responsive & Sidebar Toggle**:
    - **Desktop** (>1024px): Hamburger toggles collapsed (70px) / expanded (260px)
    - **Mobile** (≤1024px): Hamburger opens/closes sidebar with overlay
    - Sidebar state saved in localStorage (desktop only)
    - Mobile always starts with sidebar hidden
    - Test on actual mobile devices, not just browser resize
    - Ensure viewport meta tag exists: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
    - Breakpoints: 1024px (tablet), 768px (mobile)

14. **Pagination System**:
    - Always load ALL data from N8N first, store in `allUsersData` or `allPremiumData`
    - Render function (`renderUsers()`, `renderPremiumUsers()`) slices data
    - Load More increments count by `USERS_PER_PAGE` or `PREMIUM_PER_PAGE` (20)
    - Button auto-hides when `displayedCount >= allData.length`
    - Page navigation resets pagination to first 20
    - Don't fetch more from N8N on "Load More" - it's client-side only
    - If data changes (new users), reload page to refresh

---

## Environment Variables

### Normal Web Intergram
```bash
TELEGRAM_TOKEN=<bot-token>
SERVER_URL=https://chat.photier.co
PORT=3000
REDIRECT_URL=https://kintoyyy.github.io/Telegram-Chat-Widget
```

### Premium Intergram
```bash
TELEGRAM_TOKEN=<bot-token>
SERVER_URL=https://p-chat.photier.co
PORT=3001
N8N_WEBHOOK_URL=https://n8n.photier.co/webhook/admin-chat
REDIRECT_URL=https://kintoyyy.github.io/Telegram-Chat-Widget
```

---

## Quick Reference Commands

### Check if tabs exist in premium
```bash
docker exec root-intergram-premium-1 grep -c 'humanMode' /app/src/chat/chat.js
# Should return > 0 if tabs are present

docker exec root-intergram-premium-1 grep -c 'humanMode' /app/static/js/chat.js
# Should return > 0 if built correctly
```

### Check if separate message arrays exist
```bash
docker exec root-intergram-premium-1 grep 'aiMessages\|humanMessages' /app/src/chat/chat.js
# Should show both aiMessages and humanMessages arrays
```

### Check if settings API exists
```bash
# Check server.js for settings endpoints
docker exec root-intergram-1 grep -n "app.get('/api/settings'" /app/server.js
docker exec root-intergram-1 grep -n "app.post('/api/settings'" /app/server.js

# Should show line numbers where endpoints are defined
```

### Get container info
```bash
# Show all intergram containers
docker ps --filter "name=intergram"

# Inspect container
docker inspect root-intergram-1 | grep -A 10 'Config'
```

### Test N8N integration
```bash
# Monitor logs while sending test message
docker logs -f root-intergram-1 | grep -i 'n8n\|webhook'

# Expected output:
# N8N webhook response: 200
# n8n response > <AI response text>
```

### Test Settings API
```bash
# Get current settings
curl https://chat.photier.co/api/settings
curl https://p-chat.photier.co/api/settings

# Enable service messages
curl -X POST https://chat.photier.co/api/settings \
  -H "Content-Type: application/json" \
  -d '{"serviceMessagesEnabled":true}'

# Disable service messages
curl -X POST https://chat.photier.co/api/settings \
  -H "Content-Type: application/json" \
  -d '{"serviceMessagesEnabled":false}'

# Check logs for settings update
docker logs root-intergram-1 --tail 5 | grep "Settings updated"
```

---

## Files Modified During Session

### 2025-10-26 Session 2 (Mobile Responsive + Pagination)

**Stats Dashboard** (`root-stats-1`):
- `/usr/share/nginx/html/index.html`: **Mobile Responsive Design + UI Updates**
  - **Renamed "Kullanıcılar" → "Web Kullanıcılar"** (line 608, 763, 793, 929)
  - Added hamburger menu button in header (line 841-845)
  - Added sidebar overlay for mobile (line 796-797)
  - Added sidebar toggle CSS (collapsed mode - emoji only, 70px width)
  - Added mobile responsive CSS with @media queries:
    - `@media (max-width: 1024px)` - Tablet/mobile hamburger menu
    - `@media (max-width: 768px)` - Mobile font/padding optimization
  - Added sidebar overlay CSS for mobile backdrop
  - Added hamburger menu animation CSS (transforms to X)
  - Added Load More button containers for both pages (line 783-787, 828-832)
  - Added `.btn-load-more` CSS styling (line 263-279)
  - Total file size: ~1300 lines (from ~1100 lines)

- `/usr/share/nginx/html/api.js`: **Pagination System Implementation**
  - Added pagination variables at top:
    - `allUsersData`, `displayedUsersCount`, `USERS_PER_PAGE = 20`
    - `allPremiumData`, `displayedPremiumCount`, `PREMIUM_PER_PAGE = 20`
  - Updated `loadAllUsers()` to store all data and call `renderUsers()`
  - Added `renderUsers()` function for client-side pagination (line 404-436)
  - Added `loadMoreUsers()` function (line 438-441)
  - Updated `loadPremiumUsers()` to store all data and call `renderPremiumUsers()`
  - Added `renderPremiumUsers()` function for pagination (line 488-522)
  - Added `loadMorePremium()` function (line 524-527)
  - Load More button shows/hides based on remaining data
  - Total file size: ~580 lines (from ~570 lines)

- `/usr/share/nginx/html/index.html`: **JavaScript - Sidebar Toggle Logic**
  - Added `toggleSidebar()` function (line 1147-1182)
    - Mobile behavior: slide in/out with overlay
    - Desktop behavior: collapsed (70px) / expanded (260px)
    - State persistence via localStorage
  - Added DOMContentLoaded listener for sidebar state restoration (line 1185-1199)
  - Added window resize listener for responsive behavior (line 1202-1228)
  - Sidebar state: 'expanded', 'collapsed', 'mobile-open'

**Volume Mounts** (Already configured from previous session):
```yaml
# Stats Dashboard - Persistent
- /root/stats/html/index.html:/usr/share/nginx/html/index.html
- /root/stats/html/api.js:/usr/share/nginx/html/api.js
```

**Impact**:
- ✅ Mobile-friendly dashboard (responsive on all devices)
- ✅ Sidebar toggle on desktop (emoji-only collapsed mode)
- ✅ Pagination reduces initial load time
- ✅ Better UX with progressive data loading
- ✅ Touch-friendly mobile interface
- ✅ Page name clarified: "Web Kullanıcılar" vs "Premium Chat"

---

### 2025-10-26 Session 1 (Settings & N8N Integration)

**Stats Dashboard** (`root-stats-1`):
- `/usr/share/nginx/html/index.html`: **Added Settings page**
  - Apple-style toggle switch CSS
  - Settings view with Web/Premium controls
  - Info card explaining settings
  - Status message display
  - Removed duplicate `loadPremiumUsers()` and `viewPremiumConversation()` functions
  - Settings button in sidebar (above Admin section)

- `/usr/share/nginx/html/api.js`: **Major N8N integration update**
  - Changed `recentUsers` to `allUsers` (line 369) - now shows all users instead of just 10
  - Added country flag support (line 375-376, 391)
  - Updated `loadPremiumUsers()` to use N8N endpoint instead of premium container (line 429-468)
  - Fixed event delegation for premium row clicks (line 547-567)
  - Added `loadSettings()`, `updateWebSettings()`, `updatePremiumSettings()` functions
  - Updated `viewConversation()` to use N8N for premium users (line 470-496)
  - Premium background color changed to lighter salmon (#FFFBF8)

**Normal Web Intergram** (`root-intergram-1`):
- `/app/server.js`: **Added Settings API**
  - Added `settings` object with `serviceMessagesEnabled: false` (line 21-24)
  - Added `GET /api/settings` endpoint (~line 597)
  - Added `POST /api/settings` endpoint (~line 604)
  - Updated connection handler to check settings (line 395-398)
  - Updated "has come back" to check settings (line 417-419)
  - Updated "has left" to check settings (line 527-529)
  - Updated user message handler to check settings (line 444-446)
  - **Impact**: Service messages now controlled at runtime, no restart needed

**Premium Intergram** (`root-intergram-premium-1`):
- `/app/server.js`: **Added Settings API & cleaned up**
  - Used clean backup (`premium_server_actual.js`) as base
  - Added `settings` object with `serviceMessagesEnabled: false`
  - Added `GET /api/settings` endpoint
  - Added `POST /api/settings` endpoint
  - Updated all service message handlers to check settings
  - **REMOVED**: `/api/premium-stats` endpoint (now uses N8N)
  - **REMOVED**: `/api/conversation/:userId` endpoint (now uses N8N)
  - **Impact**: Premium stats now persistent in N8N database, not in-memory

**N8N Workflow** (photier-stats):
- **Added premium filter** (~line 5):
  - Check for `?premium=true` query parameter
  - Filter `items` by `i.json.premium === true`
  - Return separate stats for premium users
  - Include `country` field in response

- **Updated normal stats** (~line 96):
  - Added `premium` field to `userStats`
  - Filter `allUsers` to exclude premium: `.filter(u => !u.premium)`
  - **Impact**: No duplicate users between normal and premium lists

**Backup Files Created**:
- `/tmp/stats_index_current.html`: Stats with Settings page
- `/tmp/stats_api_current.js`: API with N8N integration
- `/tmp/premium_server_final.js`: Premium server with Settings API
- `/tmp/web_server_current.js`: Web server with Settings API
- `/tmp/n8n_stats_premium_fix.js`: N8N premium filter code

### 2025-10-26 Earlier Changes (AutoResponse fixes)

**Docker Compose**:
- `/root/docker-compose.yml`: Fixed incorrect volume mapping for web container
  - **Before**: `- /root/intergram-premium/telegram-chat-widget/static/js/chat.js:/app/static/js/chat.js`
  - **After**: `- /root/intergram/telegram-chat-widget/static/js/chat.js:/app/static/js/chat.js`
  - **Impact**: Web chat no longer shows premium tabs

**Normal Web Intergram** (`root-intergram-1`):
- `/app/src/chat/chat.js`: **Disabled autoResponse feature**
  - Lines 148-171: Commented out autoResponse and autoNoResponse logic in `sendMessage()`
  - Lines 180-188: Commented out autoResponse state management in `incomingMessage()`
  - Added explanatory comments: "// AutoResponse disabled - was causing unwanted automated messages"
  - **Impact**: No more automatic "I'll get back to you" or "No one available" messages

- `/app/server.js`: **Auto-notifications now settings-controlled**
  - Originally disabled by commenting out
  - Now controlled via Settings API (default: OFF)

- **Enhanced sendMessage() data collection**:
  - Added `window.parent.location.href` for accurate pageUrl
  - Added `window.parent.document.title` for accurate pageTitle
  - Added `window.parent.document.referrer` for referrer tracking
  - Added `userAgent` and `timestamp` fields
  - Uses try-catch to fallback to host info if parent access is blocked

**Premium Intergram** (`root-intergram-premium-1`):
- `/app/src/chat/chat.js`: **Disabled autoResponse feature** (same changes as web)
  - Lines ~361-384: Commented out autoResponse logic
  - Lines ~388-403: Commented out autoResponse state management

**Built Bundles**:
- Both containers rebuilt and built files copied to host for persistence
- Web: `/root/intergram/telegram-chat-widget/static/js/chat.js`
- Premium: `/root/intergram-premium/telegram-chat-widget/static/js/chat.js`

### 2025-10-25 Changes (Tab system)

**Normal Web Intergram** (`root-intergram-1`):
- `/app/server.js`: Added N8N webhook integration + /send-to-user endpoint (469 lines)
- `/app/src/chat/chat.js`: Restored from backup (removed tabs)
- Built bundles: Rebuilt to remove tab code

**Premium Intergram** (`root-intergram-premium-1`):
- `/app/server.js`: Already has full features (756 lines)
- `/app/src/chat/chat.js`: **MAJOR UPDATE** - Implemented separate message arrays for each tab
  - Added `aiMessages` and `humanMessages` arrays
  - Added `aiMessagesKey` and `humanMessagesKey` for localStorage
  - Implemented `switchTab()` function for tab switching
  - Updated `writeToMessages()` to write to correct array
  - Updated `handleClearChat()` to clear both arrays
  - Added separate intro message handling for each tab
- Built bundles: Rebuilt to include new tab message separation logic (121K)

**Stats Dashboard** (`root-stats-1`):
- `/app/index.html`: Updated modal to support both API formats
- `/app/api.js`: Added unified modal, event delegation, N8N integration

---

## Next Steps / Future Improvements

1. **Add authentication**: Currently no auth on /send-to-user and /api/settings endpoints
2. **Rate limiting**: Prevent webhook abuse
3. **Persistent settings**: Currently in-memory, consider database or config file
4. **Error handling**: Better error messages for N8N failures
5. **Monitoring**: Add health checks and alerting
6. **Backup automation**: Automated daily backups of container state
7. **Tab persistence**: Consider saving active tab preference in localStorage
8. **Settings history**: Track when settings were changed and by whom
9. **Bulk settings**: Control multiple containers from single interface
10. **Stats caching**: Consider caching N8N responses for better performance

---

## Contact & Support

- **GitHub**: [Kintoyyy/Telegram-Chat-Widget](https://github.com/Kintoyyy/Telegram-Chat-Widget)
- **Original**: [idoco/intergram](https://github.com/idoco/intergram)
- **Fork**: [yamaha252/intergram](https://github.com/yamaha252/intergram)

---

**END OF DOCUMENTATION**
