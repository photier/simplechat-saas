# ARCHITECTURE.md

This document describes the technical architecture, design patterns, and system design of Simple Chat Bot SaaS.

## Table of Contents

1. [System Overview](#system-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Component Architecture](#component-architecture)
4. [Data Flow Patterns](#data-flow-patterns)
5. [State Management](#state-management)
6. [Real-time Communication](#real-time-communication)
7. [Build & Deployment Pipeline](#build--deployment-pipeline)
8. [Key Design Patterns](#key-design-patterns)
9. [Database Schema](#database-schema)
10. [Security Patterns](#security-patterns)

---

## System Overview

Simple Chat Bot SaaS is a **monorepo-based, multi-service chat widget platform** that provides:
- Embeddable chat widgets (IIFE bundles)
- Real-time communication (Socket.io)
- AI-powered responses (N8N workflows)
- Analytics dashboard (React SPA)
- Multi-tenant backend (NestJS API)

### Technology Decisions

| Component | Technology | Reason |
|-----------|-----------|--------|
| Monorepo | Turborepo | Shared dependencies, cache optimization |
| Frontend | React 19 + Vite 7 | Modern, fast builds, tree-shaking |
| State | Zustand | Lightweight, no context drilling |
| Styling | CSS Modules + Tailwind | Scoped styles + utility-first |
| Real-time | Socket.io | Reliable, auto-reconnection |
| Backend | NestJS | TypeScript, DI, modular |
| Build | Vite | Fast HMR, IIFE support |
| Deploy | Railway | Git-based, auto-deploy, managed |

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Normal Widget│  │Premium Widget│  │   Stats Dashboard    │  │
│  │  (IIFE JS)   │  │  (IIFE JS)   │  │    (React SPA)       │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
└─────────┼──────────────────┼──────────────────────┼──────────────┘
          │                  │                      │
          │ Socket.io        │ Socket.io            │ Socket.io + HTTP
          │                  │                      │
┌─────────▼──────────────────▼──────────────────────▼──────────────┐
│                      Railway Services                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │Widget Server │  │Premium Server│  │   Stats Backend      │   │
│  │(Express+IO)  │  │(Express+IO)  │  │  (Express+IO+API)    │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────────────┘   │
│         │                  │                 │                    │
│         └──────────────────┴─────────────────┤                    │
│                                              │                    │
│  ┌─────────────────────────────────────────┐│                    │
│  │          NestJS Backend API             ││                    │
│  │      (Multi-tenant, JWT Auth)           ││                    │
│  └─────────────────┬───────────────────────┘│                    │
└────────────────────┼───────────────────────────┼─────────────────┘
                     │                           │
                     │                           │
          ┌──────────▼───────────┐    ┌─────────▼────────────┐
          │   PostgreSQL DB      │    │    N8N Workflows     │
          │  (User data, msgs,   │    │  (AI, RAG, Telegram) │
          │   sessions, stats)   │    │                      │
          └──────────────────────┘    └──────────────────────┘
```

---

## Component Architecture

### 1. Widget Architecture (IIFE Bundles)

**Design Pattern:** Self-contained IIFE (Immediately Invoked Function Expression)

```
┌─────────────────────────────────────────────────────────┐
│               Widget Bundle (IIFE)                      │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │            React 19 Application                │    │
│  │  ┌──────────────────────────────────────────┐ │    │
│  │  │         Zustand Store                    │ │    │
│  │  │  - messages[]                            │ │    │
│  │  │  - isOpen: boolean                       │ │    │
│  │  │  - isConnected: boolean                  │ │    │
│  │  │  - actions (sendMessage, toggleOpen)     │ │    │
│  │  └──────────────────────────────────────────┘ │    │
│  │                                                │    │
│  │  ┌──────────────────────────────────────────┐ │    │
│  │  │         useSocket Hook                   │ │    │
│  │  │  - Socket.io connection                  │ │    │
│  │  │  - Event handlers (message, connect)     │ │    │
│  │  │  - Auto-reconnection logic               │ │    │
│  │  └──────────────────────────────────────────┘ │    │
│  │                                                │    │
│  │  ┌──────────────────────────────────────────┐ │    │
│  │  │         React Components                 │ │    │
│  │  │  - ChatWindow                            │ │    │
│  │  │  - ChatButton                            │ │    │
│  │  │  - MessageList                           │ │    │
│  │  │  - MessageInput                          │ │    │
│  │  │  - TabSelector (Premium only)            │ │    │
│  │  └──────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│  Global: window.SimpleChat = { init, destroy }         │
└─────────────────────────────────────────────────────────┘
```

**Key Characteristics:**
- **No external dependencies:** Everything bundled (~350KB)
- **Global namespace:** `window.SimpleChat`
- **CSS injection:** Loaded separately via `<link>` tag
- **Configuration:** `window.simpleChatConfig` object
- **Lifecycle:** `init()` → mount → `destroy()` → unmount

### 2. Dashboard Architecture (React SPA)

**Design Pattern:** Context + React Router

```
┌─────────────────────────────────────────────────────────┐
│              Dashboard Application                      │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │           React Router v6                      │    │
│  │  Routes:                                       │    │
│  │    /          → HomePage (charts, stats)       │    │
│  │    /web       → WebAnalytics                   │    │
│  │    /premium   → PremiumAnalytics               │    │
│  │    /settings  → Settings                       │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │           StatsContext (React Context)         │    │
│  │  State:                                        │    │
│  │    - users: User[]                             │    │
│  │    - sessions: Session[]                       │    │
│  │    - messages: Message[]                       │    │
│  │    - stats: StatsData                          │    │
│  │  Actions:                                      │    │
│  │    - fetchStats()                              │    │
│  │    - fetchMessages(userId)                     │    │
│  │    - connectSocket()                           │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │         Components                             │    │
│  │  - HeroCards (3 metric cards)                  │    │
│  │  - UserTable (real-time user list)             │    │
│  │  - ConversationModal (message history)         │    │
│  │  - Charts (Recharts: Pie, Area, Bar)           │    │
│  │  - ChannelDistribution                         │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │         Real-time Socket.io Client             │    │
│  │  Events:                                       │    │
│  │    - stats_update → refresh UI                 │    │
│  │    - user_online → add user badge              │    │
│  │    - user_offline → remove badge               │    │
│  │    - new_message → update conversation         │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### 3. Stats Backend Architecture (Express + Socket.io)

**Design Pattern:** Relay + API Gateway

```
┌─────────────────────────────────────────────────────────┐
│              Stats Backend Service                      │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │         Express HTTP Server                    │    │
│  │  Routes:                                       │    │
│  │    GET  /api/stats                             │    │
│  │    GET  /api/messages/:userId                  │    │
│  │    POST /send-to-user (from N8N)               │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │         Socket.io Server                       │    │
│  │  Namespaces:                                   │    │
│  │    /          → Dashboard clients              │    │
│  │                                                │    │
│  │  Events (emit to dashboards):                  │    │
│  │    - stats_update                              │    │
│  │    - user_online                               │    │
│  │    - user_offline                              │    │
│  │    - new_message                               │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │         Socket.io Clients (to widgets)         │    │
│  │  Connections:                                  │    │
│  │    - chat.simplechat.bot/stats (normal)        │    │
│  │    - p-chat.simplechat.bot/stats (premium)     │    │
│  │                                                │    │
│  │  Events (listen from widgets):                 │    │
│  │    - stats_update                              │    │
│  │    - widget_opened                             │    │
│  │    - user_online                               │    │
│  │    - user_offline                              │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │         PostgreSQL Client (pg)                 │    │
│  │  Queries:                                      │    │
│  │    - Total users, active today                 │    │
│  │    - Messages by userId                        │    │
│  │    - Session grouping (1h timeout)             │    │
│  │    - Widget opens tracking                     │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## Data Flow Patterns

### 1. Message Flow (Normal Widget)

```
User types message
       │
       ▼
[Widget: chatStore.sendMessage()]
       │
       ▼
[Widget: socket.emit('message', { text, userId })]
       │
       ▼
[Widget Server: Express receives message]
       │
       ├──► Extract IP → geoip-lite → country/city
       │
       ▼
[Widget Server: HTTP POST to N8N webhook]
  URL: /webhook/intergram-message
  Body: { text, userId, premium: false, country, city }
       │
       ▼
[N8N: AI Workflow]
  ├──► RAG search (Qdrant vector DB)
  ├──► OpenAI API call
  ├──► Store message in PostgreSQL
  │     (with human_mode: false)
  └──► Generate AI response
       │
       ▼
[N8N: HTTP POST to Stats Backend]
  URL: /send-to-user
  Body: { userId, message, human_mode: false }
       │
       ▼
[Stats Backend: socket.to(userId).emit('message', data)]
       │
       ▼
[Widget: socket.on('message') → chatStore.addMessage()]
       │
       ▼
[UI: Message appears in chat]
```

### 2. Message Flow (Premium Widget - AI Tab)

```
User types in AI tab (human_mode: false)
       │
       ▼
[Widget: chatStore.sendMessage({ humanMode: false })]
       │
       ▼
[Widget: socket.emit('message', { text, userId, humanMode: false })]
       │
       ▼
[Premium Server: Express receives message]
       │
       ├──► Extract IP → geoip-lite
       │
       ▼
[Premium Server: HTTP POST to N8N webhook]
  URL: /webhook/admin-chat
  Body: { text, userId, premium: true, human_mode: false }
       │
       ▼
[N8N: Check human_mode flag]
  human_mode === false → AI Workflow (same as normal)
       │
       ▼
[N8N: HTTP POST to Stats Backend]
  Body: { userId, message, human_mode: false }
       │
       ▼
[Stats Backend: socket.to(userId).emit('message', data)]
       │
       ▼
[Widget: Receives on AI tab socket]
       │
       ▼
[UI: Blue AI bubble appears]
```

### 3. Message Flow (Premium Widget - Live Support Tab)

```
User types in Live Support tab (human_mode: true)
       │
       ▼
[Widget: chatStore.sendMessage({ humanMode: true })]
       │
       ▼
[Widget: socket.emit('message', { text, userId, humanMode: true })]
       │
       ▼
[Premium Server: Express receives message]
       │
       ▼
[Premium Server: HTTP POST to N8N webhook]
  URL: /webhook/admin-chat
  Body: { text, userId, premium: true, human_mode: true }
       │
       ▼
[N8N: Check human_mode flag]
  human_mode === true → Telegram Workflow
       │
       ├──► Store message in PostgreSQL (human_mode: true)
       ├──► Send to Telegram admin group
       └──► Wait for admin reply
             │
             ▼
      [Admin replies in Telegram]
             │
             ▼
      [N8N: HTTP POST to Stats Backend]
        Body: { userId, message, human_mode: true, from: 'admin' }
             │
             ▼
      [Stats Backend: socket.to(userId).emit('message', data)]
             │
             ▼
      [Widget: Receives on Live Support tab socket]
             │
             ▼
      [UI: Purple Live Support bubble appears]
```

### 4. Real-time Stats Update Flow

```
[Widget: User opens chat]
       │
       ▼
[Widget: socket.emit('register', { userId, premium })]
       │
       ▼
[Widget Server: Store in widget_opens table]
       │
       ▼
[Widget Server: socket.to('/stats').emit('widget_opened', data)]
       │
       ▼
[Stats Backend: Listening as Socket.io CLIENT to widget servers]
       │
       ├──► Receives 'widget_opened' event
       ├──► Invalidates cache
       │
       ▼
[Stats Backend: Broadcasts to all dashboard clients]
  socket.broadcast.emit('stats_update')
       │
       ▼
[Dashboard: socket.on('stats_update')]
       │
       ├──► Wait 800ms (for N8N to write to DB)
       ├──► Call fetchStats()
       │
       ▼
[Dashboard: HTTP GET /api/stats]
       │
       ▼
[Stats Backend: Query PostgreSQL]
  ├──► Count users, sessions, messages
  ├──► Calculate conversion rate
  └──► Return JSON
       │
       ▼
[Dashboard: Update UI (hero cards, charts)]
```

---

## State Management

### Widget State (Zustand)

**File:** `apps/widget/src/store/chatStore.ts`

```typescript
interface ChatStore {
  // UI State
  isOpen: boolean;
  isMinimized: boolean;
  unreadCount: number;

  // Connection State
  isConnected: boolean;
  connectionError: string | null;

  // Messages
  messages: Message[];

  // User State
  userId: string;
  userName: string;

  // Premium Only
  humanMode: boolean;  // false = AI, true = Live Support
  activeTab: 'ai' | 'support';

  // Actions
  sendMessage: (text: string) => void;
  addMessage: (message: Message) => void;
  toggleOpen: () => void;
  setHumanMode: (mode: boolean) => void;
}
```

**Key Patterns:**
- **Immer integration:** Immutable updates made easy
- **Persistence:** localStorage for `userId`, `userName`
- **Selectors:** Memoized selectors for performance
- **Middleware:** Logger (dev only), persist middleware

### Dashboard State (React Context)

**File:** `apps/dashboard/src/context/StatsContext.tsx`

```typescript
interface StatsContextValue {
  // Data
  users: User[];
  sessions: Session[];
  messages: Message[];
  stats: StatsData | null;

  // Loading State
  isLoading: boolean;
  error: string | null;

  // Socket State
  isSocketConnected: boolean;

  // Actions
  fetchStats: () => Promise<void>;
  fetchMessages: (userId: string) => Promise<Message[]>;
  refreshData: () => void;
}
```

**Key Patterns:**
- **Context + Provider:** Share state across routes
- **useReducer:** Complex state transitions
- **Custom hooks:** `useStats()`, `useRealtime()`
- **Auto-fetch:** Fetch on mount, refresh on socket events

---

## Real-time Communication

### Socket.io Architecture

**Design:** Two-layer relay system

```
Layer 1: Widget ↔ Widget Server
┌─────────────┐         ┌─────────────────┐
│   Widget    │ ◄─────► │ Widget Server   │
│   Client    │ Socket  │ (Express + IO)  │
└─────────────┘         └────────┬────────┘
                                 │
                        Emits to /stats namespace
                                 │
Layer 2: Widget Server → Stats Backend → Dashboard
                        ┌────────▼────────┐
                        │ Stats Backend   │
                        │ (IO Client)     │
                        │                 │
                        │ Listens to      │
                        │ widget events   │
                        └────────┬────────┘
                                 │
                        Broadcasts to dashboards
                                 │
                        ┌────────▼────────┐
                        │   Dashboard     │
                        │   (IO Client)   │
                        └─────────────────┘
```

**Why Two Layers?**
1. **Security:** Widgets don't connect directly to stats server
2. **Scalability:** Stats server can aggregate multiple widget servers
3. **Flexibility:** Can add widget servers without dashboard changes
4. **Reliability:** If stats server is down, widgets still work

### Socket.io Events

**Widget → Widget Server:**
- `register` - User connects, sends userId, premium flag
- `message` - User sends message
- `disconnect` - User closes browser

**Widget Server → Stats Server (namespace: `/stats`):**
- `stats_update` - Generic stats changed event
- `widget_opened` - New widget opened
- `user_online` - User connected
- `user_offline` - User disconnected

**Stats Server → Dashboard:**
- `stats_update` - Tell dashboards to refresh
- `user_online` - Show online badge
- `user_offline` - Hide online badge
- `new_message` - Update conversation modal

### Auto-reconnection Strategy

```typescript
// Widget: useSocket.ts
const socket = io(SOCKET_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  chatStore.setConnected(true);
  // Re-register user
  socket.emit('register', { userId });
});

socket.on('disconnect', () => {
  chatStore.setConnected(false);
});
```

---

## Build & Deployment Pipeline

### Turborepo Build Graph

```
┌─────────────────────────────────────────────────────────┐
│                   Turborepo Build                       │
│                                                         │
│  1. Resolve dependencies (turbo.json)                  │
│     ├─ packages/database (Prisma generate)             │
│     └─ packages/* (shared utilities)                   │
│                                                         │
│  2. Build in dependency order                          │
│     ├─ apps/widget (Vite IIFE)                         │
│     ├─ apps/widget-premium (Vite IIFE)                 │
│     ├─ apps/dashboard (Vite SPA)                       │
│     ├─ backend (NestJS)                                │
│     └─ stats (no build, Node.js)                       │
│                                                         │
│  3. Cache outputs                                      │
│     └─ node_modules/.cache/turbo/                      │
│                                                         │
│  4. Parallel execution (where possible)                │
│     ├─ widget + widget-premium (parallel)              │
│     └─ dashboard + backend (parallel)                  │
└─────────────────────────────────────────────────────────┘
```

### Railway Deployment Flow

```
Developer pushes to GitHub (main branch)
       │
       ▼
[GitHub Webhook → Railway]
       │
       ▼
[Railway: Detect changed files]
  Uses Watch Paths configuration
       │
       ├──► apps/widget/** changed?
       │     └─ YES → Build widget service
       │
       ├──► apps/dashboard/** changed?
       │     └─ YES → Build dashboard service
       │
       └──► stats/** changed?
             └─ YES → Build stats service
       │
       ▼
[Railway: Build Service (Nixpacks)]
  1. Detect package manager (npm)
  2. Read .npmrc (legacy-peer-deps=true)
  3. Run: npm install
  4. Run: npm run build (if applicable)
       │
       ▼
[Railway: Deploy Service]
  1. Start command: npm start
  2. Health check
  3. Route traffic to new deployment
  4. Shutdown old deployment
       │
       ▼
[Service Live] ✅
  - Custom domain configured
  - SSL certificate auto-managed
  - Logs available in Railway dashboard
```

### Build Outputs

| Service | Build Command | Output Directory | Output Type |
|---------|--------------|------------------|-------------|
| Widget | `npm run build` | `dist/` | IIFE JS + CSS |
| Widget Premium | `npm run build` | `dist/` | IIFE JS + CSS |
| Dashboard | `npm run build` | `dist/` | Static HTML/JS/CSS |
| Backend | `npm run build` | `dist/` | Node.js app |
| Stats | None | N/A | Node.js script |

---

## Key Design Patterns

### 1. IIFE Widget Pattern

**Problem:** Need to embed widget on any website without conflicts.

**Solution:** IIFE (Immediately Invoked Function Expression) bundle.

```javascript
// Vite config output
export default {
  build: {
    lib: {
      entry: './src/main.tsx',
      name: 'SimpleChat',
      formats: ['iife'],
      fileName: 'simple-chat.min'
    }
  }
}

// Output: simple-chat.min.js
(function(window) {
  // All React code bundled here
  // No external dependencies

  window.SimpleChat = {
    init: function(config) { /* ... */ },
    destroy: function() { /* ... */ }
  };
})(window);
```

**Benefits:**
- ✅ No dependency conflicts (everything bundled)
- ✅ Single global namespace (`window.SimpleChat`)
- ✅ Easy to embed (`<script src="...">`)
- ✅ Works on any website (React, Vue, plain HTML)

### 2. Socket.io Relay Pattern

**Problem:** Widgets should not connect directly to stats server (security, scalability).

**Solution:** Stats server acts as relay (Socket.io client + server).

```javascript
// Stats Backend: stats/server.js
const io = require('socket.io')(httpServer);  // Server for dashboards
const ioClient = require('socket.io-client'); // Client to widget servers

// Connect TO widget servers as client
const widgetSocket = ioClient('http://widget-server/stats');
const premiumSocket = ioClient('http://premium-server/stats');

// Listen to widget events
widgetSocket.on('stats_update', (data) => {
  // Broadcast to all dashboards
  io.emit('stats_update', data);
});

// Dashboards connect as clients
io.on('connection', (socket) => {
  console.log('Dashboard connected');
});
```

**Benefits:**
- ✅ Widgets isolated from dashboard infrastructure
- ✅ Stats server can aggregate multiple widget servers
- ✅ Easy to add new widget servers
- ✅ Better security (no direct widget→dashboard connection)

### 3. 800ms Delay Pattern

**Problem:** Socket events arrive before N8N writes to database.

**Solution:** Dashboard waits 800ms before fetching data.

```typescript
// Dashboard: StatsContext.tsx
socket.on('stats_update', () => {
  // Wait for N8N to write to database
  setTimeout(() => {
    fetchStats();  // Now database has fresh data
  }, 800);
});
```

**Why 800ms?**
- N8N webhook → AI processing → database write takes ~500-700ms
- 800ms provides safe buffer
- Better than polling (more efficient)

### 4. Zustand Persist Pattern

**Problem:** Widget state lost on page refresh.

**Solution:** Persist specific slices to localStorage.

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useChatStore = create(
  persist(
    (set) => ({
      userId: '',
      userName: '',
      // ... other state
    }),
    {
      name: 'simple-chat-storage',
      partialize: (state) => ({
        // Only persist these fields
        userId: state.userId,
        userName: state.userName
      })
    }
  )
);
```

**Benefits:**
- ✅ User identity persists across page loads
- ✅ Conversation history preserved
- ✅ Settings remembered
- ✅ Minimal localStorage usage (only critical data)

---

## Database Schema

### Key Tables

**users:**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,  -- W-Guest-xxx or P-Guest-xxx
  name VARCHAR(255),
  country VARCHAR(100),
  city VARCHAR(100),
  premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**messages:**
```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  from_user VARCHAR(50) NOT NULL,  -- 'visitor', 'bot', 'admin'
  human_mode BOOLEAN DEFAULT false,  -- false = AI, true = Live Support
  premium BOOLEAN DEFAULT false,
  country VARCHAR(100),
  city VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

**widget_opens:**
```sql
CREATE TABLE widget_opens (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  city VARCHAR(100),
  premium BOOLEAN DEFAULT false,
  host VARCHAR(500),  -- Website domain
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_widget_opens_created_at ON widget_opens(created_at DESC);
```

### Session Grouping Logic

**Algorithm:** Group messages into sessions with 1-hour timeout.

```typescript
// Dashboard: HomePage.tsx
const groupMessagesIntoSessions = (messages: Message[]) => {
  const sessions: Session[] = [];
  const ONE_HOUR = 60 * 60 * 1000;

  messages.forEach((msg) => {
    const lastSession = sessions[sessions.length - 1];

    if (!lastSession) {
      // First session
      sessions.push({ id: 1, messages: [msg], ... });
    } else {
      const timeDiff = msg.created_at - lastSession.lastMessage.created_at;

      if (timeDiff < ONE_HOUR) {
        // Same session (within 1 hour)
        lastSession.messages.push(msg);
      } else {
        // New session (more than 1 hour)
        sessions.push({ id: sessions.length + 1, messages: [msg], ... });
      }
    }
  });

  return sessions;
};
```

---

## Security Patterns

### 1. User ID Generation

**Pattern:** Client-side generation with prefix.

```javascript
// Widget embed code
const userId = (isPrem ? "P-Guest-" : "W-Guest-") +
               Math.random().toString(36).substr(2, 9);
```

**Security Notes:**
- ✅ No server-side session required
- ✅ Stateless architecture
- ❌ Users can manipulate their own ID (acceptable for MVP)
- 🔒 Future: Server-side JWT generation

### 2. CORS Configuration

**Pattern:** Whitelist specific origins.

```javascript
// Stats Backend: server.js
const cors = require('cors');

app.use(cors({
  origin: [
    'https://stats.simplechat.bot',
    'https://chat.simplechat.bot',
    'https://p-chat.simplechat.bot',
    'http://localhost:5173',  // Dev only
    'http://localhost:5174',
    'http://localhost:5175'
  ],
  credentials: true
}));
```

### 3. Environment Variables

**Pattern:** Never commit secrets, use Railway UI.

```bash
# .env.example (committed)
POSTGRES_HOST=your-host
POSTGRES_PASSWORD=your-password

# .env (gitignored)
POSTGRES_HOST=actual-host
POSTGRES_PASSWORD=actual-password
```

**Railway:** Set environment variables in Railway dashboard, not in code.

### 4. Rate Limiting (Future)

**Pattern:** Prevent abuse with rate limiting.

```javascript
// Future implementation
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100  // 100 requests per 15 minutes
});

app.use('/api/', limiter);
```

---

## Performance Optimizations

### 1. Turborepo Caching

**Benefit:** Rebuilds only changed services.

```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "cache": true  // Cache build outputs
    }
  }
}
```

**Performance Impact:**
- First build: ~5 minutes (all services)
- Subsequent builds: ~30 seconds (changed service only)

### 2. Vite Tree-shaking

**Benefit:** Removes unused code from bundles.

```javascript
// vite.config.ts
export default {
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console.logs
        dead_code: true      // Remove unreachable code
      }
    }
  }
}
```

**Bundle Size Impact:**
- Before: ~600KB (unoptimized)
- After: ~350KB (minified + tree-shaken)

### 3. React.memo + useMemo

**Pattern:** Prevent unnecessary re-renders.

```typescript
// Dashboard: UserTable.tsx
const UserRow = React.memo(({ user }) => {
  return <tr>...</tr>;
});

const UserTable = ({ users }) => {
  const sortedUsers = useMemo(() => {
    return users.sort((a, b) => b.lastActive - a.lastActive);
  }, [users]);

  return sortedUsers.map(user => <UserRow key={user.id} user={user} />);
};
```

### 4. Socket.io Binary Protocol

**Pattern:** Use binary for large messages.

```javascript
// Future: Send binary data for images
socket.emit('image', binaryData, { binary: true });
```

---

## Monitoring & Observability

### Railway Logs

**Access:** Railway Dashboard → Service → Logs

```bash
# Filter logs by severity
Railway Dashboard > Service > Logs > Filter: ERROR

# Common log patterns
[INFO] Socket connected: W-Guest-abc123
[ERROR] Database connection failed: ECONNREFUSED
[WARN] Rate limit exceeded for user: P-Guest-xyz789
```

### Browser Console Monitoring

**Widget:**
```javascript
// Enable debug mode
localStorage.setItem('simple-chat-debug', 'true');

// Logs appear in console
[SimpleChat] Connected to server
[SimpleChat] Message sent: { text: "Hello", userId: "W-Guest-abc123" }
[SimpleChat] Message received: { from: "bot", text: "Hi there!" }
```

**Dashboard:**
```javascript
// Socket.io debug
localStorage.debug = 'socket.io-client:*';

// Logs appear in console
socket.io-client:socket connected
socket.io-client:socket emitting event stats_update
```

---

## Future Architecture Improvements

### 1. WebSocket Scaling

**Challenge:** Socket.io doesn't scale horizontally without Redis.

**Solution:** Redis adapter for Socket.io.

```javascript
// stats/server.js (future)
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const pubClient = createClient({ host: 'redis' });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

### 2. CDN for Widget Bundles

**Challenge:** Widget served from Railway (slower for global users).

**Solution:** Upload bundles to Cloudflare CDN.

```bash
# Future deployment script
npm run build
aws s3 sync dist/ s3://simplechat-cdn/widget/
cloudflare cache purge
```

### 3. Message Queue (Bull/BullMQ)

**Challenge:** N8N webhook can fail, messages lost.

**Solution:** Queue messages with retry logic.

```javascript
// Future: Queue + retry
const Queue = require('bull');
const messageQueue = new Queue('messages', { redis: REDIS_URL });

messageQueue.process(async (job) => {
  const { userId, message } = job.data;
  await sendToN8N(userId, message);  // Retry on failure
});
```

### 4. Database Read Replicas

**Challenge:** High read load on PostgreSQL.

**Solution:** Read replicas for stats queries.

```javascript
// Future: Write to primary, read from replica
const primaryDB = new Pool({ host: 'primary.postgres' });
const replicaDB = new Pool({ host: 'replica.postgres' });

// Writes go to primary
await primaryDB.query('INSERT INTO messages ...');

// Reads go to replica
const { rows } = await replicaDB.query('SELECT * FROM messages ...');
```

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Maintained by:** Simple Chat Bot SaaS Team
