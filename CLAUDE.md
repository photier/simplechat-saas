# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Simple Chat Bot is a production-ready, Docker-containerized **dual chat widget system** featuring:
- **Normal Chat Widget** (port 3000): Single chat with AI responses (React 19)
- **Premium Chat Widget** (port 3001): Dual-tab system - AI Bot + Live Support (React 19)
- **Stats Dashboard** (port 3002): Real-time monitoring and analytics (React 19 + Vite)
- **N8N Workflow Engine**: AI processing + database storage
- **Telegram Integration**: Admin notifications and manual replies

**Technology Stack:**
- **Frontend:** React 19 + Vite 5.x (migrated from Preact in November 2025)
- **Backend:** Node.js + Express + Socket.io
- **Build Tool:** Vite 5.x with TypeScript
- **Styling:** CSS (injected via link tags in embed code)

**Production URLs:**
- Normal: https://chat.simplechat.bot
- Premium: https://p-chat.simplechat.bot
- Stats: https://stats.simplechat.bot
- N8N: https://n8n.photier.co

## Architecture

### Container Structure
```
docker-compose.yml orchestrates 7 services:
├── traefik (reverse proxy + SSL)
├── intergram (port 3000, normal chat)
├── intergram-premium (port 3001, premium chat)
├── stats (port 3002, React dashboard + Express API)
├── n8n (port 5678, workflow automation)
├── postgres (port 5432, database)
└── qdrant (port 6333, vector DB)
```

### Data Flow Pattern

**Normal Chat:**
1. User message → intergram server (port 3000)
2. Server extracts IP → geoip-lite → country/city
3. Server → N8N webhook (`/webhook/intergram-message`) with `premium: false`
4. N8N → AI processing (RAG) + database storage
5. N8N → `/send-to-user` endpoint → Socket.io → User

**Premium Chat:**
1. User selects tab (AI Bot or Live Support) → sets `human_mode` flag
2. User message → intergram-premium server (port 3001)
3. Server → N8N webhook (`/webhook/admin-chat`) with `premium: true, human_mode: true/false`
4. N8N logic:
   - `human_mode: false` → AI processing
   - `human_mode: true` → Telegram only (no AI)
5. N8N → `/send-to-user` endpoint → Socket.io → User (correct tab)

**Critical:** Premium has TWO separate conversation histories (one per tab).

### Real-time Updates (Stats Dashboard)

**Architecture (Updated November 4, 2025):**

Stats server acts as a **middleware** between widget servers and dashboard:
1. **Stats server connects TO widget servers** as a Socket.io client
2. **Widget servers** emit events to `/stats` namespace
3. **Stats server** listens to these events and broadcasts to connected dashboards
4. **Dashboard** connects to stats server and receives real-time updates

**Connection Flow:**
```
Widget Servers (3000, 3001)  →  Stats Server (3002)  →  Dashboard Clients
   [Server: emits to /stats]    [Client: listens]      [Client: listens]
                                 [Server: broadcasts]
```

**Stats Server (`/root/stats/server.js`):**
- Connects to `http://intergram:3000/stats` (web widget)
- Connects to `http://intergram-premium:3001/stats` (premium widget)
- Listens for: `stats_update`, `widget_opened` events
- Broadcasts to dashboard with source identification
- Auto-reconnects with infinite attempts

**Events:**
- `user_online`, `user_offline`, `new_message`, `human_mode_change`, `widget_opened`
- Dashboard updates UI without page refresh (800ms delay for N8N database writes)
- Cache invalidated on every event for fresh data

## ⚠️ CRITICAL DEPLOYMENT RULES - READ THIS FIRST! ⚠️

**STATS DASHBOARD DEPLOYMENT (MOST COMMON MISTAKE):**

The stats dashboard at `/root/stats/public/` is **VOLUME MOUNTED** (like widgets, not like git projects).

**✅ CORRECT DEPLOYMENT METHOD:**
```bash
# 1. Build React dashboard locally
cd simple-chat-saas/apps/dashboard
npm run build

# 2. Copy files directly to production (SCP)
scp dist/index.html root@92.113.21.229:/root/stats/public/
scp dist/assets/* root@92.113.21.229:/root/stats/public/assets/
scp -r dist/media root@92.113.21.229:/root/stats/public/

# 3. Restart container (picks up volume mount)
ssh root@92.113.21.229 "docker restart root-stats-1"
```

**❌ COMMON MISTAKES TO AVOID:**
1. ❌ **NEVER use `git checkout` or `git restore`** on `/root/stats/public/index.html` - This brings back OLD Node.js dashboard!
2. ❌ **NEVER restore from backups** in `/root/backups/` - They contain OLD versions!
3. ❌ **DO NOT rebuild container** - Stats uses volume mount, just restart is enough!
4. ❌ **DO NOT use `docker compose build stats`** - Not needed for volume mounted files!

**Why this confusion happens:**
- Backups contain OLD Node.js dashboard (before React migration November 2025)
- Git history contains OLD dashboard files (before React migration)
- Only local `dist/` build has the NEW React dashboard

**Quick Recovery if you deployed old version:**
```bash
cd simple-chat-saas/apps/dashboard
npm run build
scp dist/index.html root@92.113.21.229:/root/stats/public/
scp dist/assets/* root@92.113.21.229:/root/stats/public/assets/
ssh root@92.113.21.229 "docker restart root-stats-1"
```

**Verification:**
```bash
# NEW React dashboard = small HTML (~1.5KB)
curl -s https://stats.simplechat.bot/ | head -20 | grep "react"

# OLD Node.js dashboard = large HTML (~151KB) with Chart.js
curl -s https://stats.simplechat.bot/ | head -20 | grep "Chart.js"
```

## Development Commands

### Start/Stop Services
```bash
# Start all containers
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f intergram
docker compose logs -f intergram-premium
docker compose logs -f stats

# Restart specific service
docker restart root-intergram-1
docker restart root-intergram-premium-1
docker restart root-stats-1
```

### Build & Deploy

**Server.js changes (no build needed):**
```bash
# Edit on host
vim /root/intergram/server.js

# Restart container (picks up volume mount)
docker restart root-intergram-1
```

**React Widget changes (requires rebuild in SaaS monorepo):**
```bash
# Widgets are built in the SaaS monorepo at:
# /simple-chat-saas/apps/widget/ (normal)
# /simple-chat-saas/apps/widget-premium/ (premium)

# After making changes and building in the monorepo:
# 1. Copy built files to production:
scp simple-chat-saas/apps/widget/dist/simple-chat.min.js root@92.113.21.229:/root/intergram/telegram-chat-widget/static/js/
scp simple-chat-saas/apps/widget/dist/simple-chat.css root@92.113.21.229:/root/intergram/telegram-chat-widget/static/css/

# 2. For premium:
scp simple-chat-saas/apps/widget-premium/dist/simple-chat-premium.min.js root@92.113.21.229:/root/intergram-premium/telegram-chat-widget/static/js/
scp simple-chat-saas/apps/widget-premium/dist/simple-chat-premium.css root@92.113.21.229:/root/intergram-premium/telegram-chat-widget/static/css/

# 3. Restart containers (files are volume mounted)
docker restart root-intergram-1 root-intergram-premium-1
```

**Stats Dashboard (volume mounted - React deployment):**
```bash
# IMPORTANT: Stats dashboard is VOLUME MOUNTED (like widgets)
# React dashboard migrated November 2025, deployed via SCP

# FILE STRUCTURE:
# /root/stats/public/
# ├── index.html (React shell, 1.5KB) - volume mounted
# ├── assets/ (Vite build: ~2MB JS, ~230KB CSS) - volume mounted
# └── media/ (images, icons, flags) - volume mounted

# CORRECT deployment workflow:
# 1. Build locally
cd simple-chat-saas/apps/dashboard
npm run build

# 2. Deploy via SCP
scp dist/index.html root@92.113.21.229:/root/stats/public/
scp dist/assets/* root@92.113.21.229:/root/stats/public/assets/
scp -r dist/media root@92.113.21.229:/root/stats/public/

# 3. Restart container (NOT rebuild!)
ssh root@92.113.21.229 "docker restart root-stats-1"

# 4. Verify NEW React dashboard is live
curl -s https://stats.simplechat.bot/ | head -20
curl -s https://stats.simplechat.bot/api/stats | jq '.totalUsers'
```

**CRITICAL NOTES:**
- Stats uses **VOLUME MOUNT** deployment (like widgets, NOT like git projects!)
- React dashboard deployed via SCP from local build
- NO git checkout/restore - brings back OLD Node.js dashboard!
- NO backup restore - backups contain OLD dashboard!
- Just restart container, NO rebuild needed
- Widget files (intergram) also volume mounted - same deployment pattern

### Testing & Verification

```bash
# Test N8N webhooks
curl https://n8n.photier.co/webhook/photier-stats
curl "https://n8n.photier.co/webhook/photier-stats?premium=true"
curl "https://n8n.photier.co/webhook/photier-stats?userId=P-Guest-xxx"

# Check widget files are being served
curl -I https://chat.simplechat.bot/js/simple-chat.min.js
curl -I https://p-chat.simplechat.bot/js/simple-chat-premium.min.js
curl -I https://chat.simplechat.bot/css/simple-chat.css

# Check settings
curl https://chat.simplechat.bot/api/settings
curl https://p-chat.simplechat.bot/api/settings

# Check geoip-lite installed
docker exec root-intergram-1 npm list geoip-lite
```

## Critical File Locations

### Dual System Structure
**CRITICAL:** There are TWO separate systems. NEVER mix their files.

**Normal Chat** (`/root/intergram/`):
- `server.js` - Node.js server (volume mounted)
- `telegram-chat-widget/static/js/simple-chat.min.js` - React widget bundle (volume mounted)
- `telegram-chat-widget/static/css/simple-chat.css` - Widget CSS (volume mounted)

**Premium Chat** (`/root/intergram-premium/`):
- `server.js` - Node.js server with dual-tab logic (volume mounted)
- `telegram-chat-widget/static/js/simple-chat-premium.min.js` - React widget with tabs (volume mounted)
- `telegram-chat-widget/static/css/simple-chat-premium.css` - Premium widget CSS (volume mounted)

### Widget Source Code (SaaS Monorepo)
**Location:** `/simple-chat-saas/apps/`
- `widget/` - Normal widget React source
- `widget-premium/` - Premium widget React source

**Build Output:**
- `dist/simple-chat.min.js` - Bundled widget (~350KB)
- `dist/simple-chat.css` - Widget styles (~3KB)

**Build Command:**
```bash
cd simple-chat-saas/apps/widget
npm run build  # Vite builds to dist/
```

### Stats Dashboard Files

**IMPORTANT:** Stats uses React dashboard (migrated November 2025). Files are VOLUME MOUNTED (NOT built into image).

**Production location** (`/root/stats/public/` - VOLUME MOUNTED):
- `index.html` (1.5KB) - React shell, volume mounted from host
- `assets/` - Vite build output (JS: ~2MB, CSS: ~230KB), volume mounted
- `media/` - Images, icons, flags, avatars, brand logos, volume mounted
- **Deployment:** SCP from local `dist/` → restart container (NO rebuild!)
- **Source:** Built from `simple-chat-saas/apps/dashboard/` locally

**Backend** (`/root/stats/`):
- `server.js` - Express + Socket.io server (also volume mounted)
- `package.json` - Dependencies
- `Dockerfile` - Container definition (but rarely rebuilt)

**Backups (AVOID USING!):**
- `/root/backups/` contains OLD Node.js dashboard (before React migration)
- Restoring from backups will DELETE your React dashboard
- Git history also contains OLD dashboard - never checkout/restore!

### Volume Mounts (docker-compose.yml)

```yaml
intergram:
  volumes:
    - /root/intergram/data:/app/data
    - /root/intergram/server.js:/app/server.js
    - /root/intergram/telegram-chat-widget/static/js/simple-chat.min.js:/app/static/js/simple-chat.min.js
    - /root/intergram/telegram-chat-widget/static/css/simple-chat.css:/app/static/css/simple-chat.css
    - /root/intergram/telegram-chat-widget/static/chat.html:/app/static/chat.html
    - /root/intergram/telegram-chat-widget/static/assets/ping.mp3:/app/static/assets/ping.mp3

intergram-premium:
  volumes:
    - /root/intergram-premium/data:/app/data
    - /root/intergram-premium/server.js:/app/server.js
    - /root/intergram-premium/telegram-chat-widget/static/js/simple-chat-premium.min.js:/app/static/js/simple-chat-premium.min.js
    - /root/intergram-premium/telegram-chat-widget/static/css/simple-chat-premium.css:/app/static/css/simple-chat-premium.css
    - /root/intergram-premium/telegram-chat-widget/static/chat.html:/app/static/chat.html
    - /root/intergram-premium/telegram-chat-widget/static/assets/ping.mp3:/app/static/assets/ping.mp3

stats:
  volumes:
    - /root/stats/server.js:/app/server.js
    - /root/stats/public:/app/public
    # All public/ files are volume mounted (index.html, assets/, media/)
    # Changes take effect immediately after container restart (NO rebuild!)
```

**Common Mistakes:**
- Wrong volume mapping causes tabs to appear in normal chat or vice versa
- Using `git checkout` or backup restore on stats (brings back OLD Node.js dashboard!)
- Thinking stats needs rebuild (it's volume mounted, just restart!)

## Widget Embed Code

### Production Embed Code Format

**Use this format on client websites (e.g., photier.com):**

```html
<!-- Production Widget -->
<script>
(function() {
    var p = window.location.pathname;
    // Only load on specific pages
    if (!p.includes('/your-page-path')) return;

    var isPrem = false; // Set to true for premium widget

    window.simpleChatConfig = {
        chatId: "1665241968",
        userId: (isPrem ? "P-Guest-" : "W-Guest-") + Math.random().toString(36).substr(2, 9),
        host: isPrem ? "https://p-chat.simplechat.bot" : "https://chat.simplechat.bot",
        titleOpen: isPrem ? "🤖 AI Bot (Premium)" : "🤖 AI Bot",
        introMessage: "Hello, How can I help you today? ✨",
        mainColor: isPrem ? "#9F7AEA" : "#4c86f0",
        desktopHeight: 600,
        desktopWidth: 380,
        customData: { currentPath: p }
    };

    // Load CSS
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = (isPrem ? 'https://p-chat.simplechat.bot' : 'https://chat.simplechat.bot') +
               '/css/simple-chat' + (isPrem ? '-premium' : '') + '.css?v=' + Date.now();
    document.head.appendChild(css);

    // Load JavaScript
    var js = document.createElement('script');
    js.src = (isPrem ? 'https://p-chat.simplechat.bot' : 'https://chat.simplechat.bot') +
             '/js/simple-chat' + (isPrem ? '-premium' : '') + '.min.js?v=' + Date.now();
    js.async = true;
    document.body.appendChild(js);
})();
</script>
```

**Key Configuration Options:**
- `chatId` - Unique chat instance ID
- `userId` - Generated guest ID (W- for web, P- for premium)
- `host` - Backend server URL
- `titleOpen` - Widget header title when open
- `introMessage` - Initial greeting message
- `mainColor` - Primary theme color
- `desktopHeight/desktopWidth` - Widget dimensions
- `customData` - Additional tracking data (e.g., currentPath)

## Stats Dashboard UI Design

### Chat Bubble Design (Apple Messages Style)

**Updated:** November 2025 - Modern bubble design

**Color Scheme:**
- **Visitor (left-aligned):** `#f5f0f6` (light lavender), black text, rounded `18px 18px 18px 4px`
- **AI Bot (right-aligned):** `rgba(0, 122, 255, 0.75)` (pastel blue 75%), white text, rounded `18px 18px 4px 18px`
- **Live Support (right-aligned):** `#B794F6` (light purple), white text, rounded `18px 18px 4px 18px`

**Key Features:**
- Auto-scroll to bottom when modal opens or new message arrives
- Turkish date format: `DD.MM.YYYY HH:MM:SS`
- Multi-line support: `\n` → `<br>` conversion in `escapeHtml()`
- Emojis: 👤 User, 🤖 AI Bot, 🎧 Live Support
- Smooth slide-in animation (`@keyframes slideIn`)

**Critical CSS Classes:**
```css
.conversation-message { display: flex; margin-bottom: 16px; }
.conversation-message.visitor { justify-content: flex-start; }
.conversation-message.admin, .conversation-message.live-support { justify-content: flex-end; }
.conversation-message-bubble { padding: 12px 16px; border-radius: 18px; box-shadow: 0 1px 0.5px rgba(0,0,0,0.13); }
```

**Auto-scroll Implementation:**
```javascript
// In showConversationModal() - after modal.classList.add('active')
setTimeout(() => {
    const modalBody = document.querySelector('.modal-body');
    if (modalBody) modalBody.scrollTop = modalBody.scrollHeight;
}, 100);
```

### Dashboard Widgets & Metrics

**Updated:** November 2025 - Widget tracking integration with engagement metrics

#### Hero Cards (Top Row)
Three cards showing real-time engagement metrics:

1. **Online Now** (Çevrimiçi)
   - Icon: 🟢
   - Shows: Current active users
   - Source: Socket.io real-time connections

2. **Total Impressions** (Toplam Tıklama)
   - Icon: 👁️
   - Shows: Total widget opens (including re-opens)
   - Source: `widget_opens` table
   - Query: `SELECT COUNT(*) FROM widget_opens`
   - Note: Includes both normal (W-) and premium (P-) widgets

3. **Conversion Rate** (Konversiyon Oranı)
   - Icon: 📈
   - Shows: Percentage of openers who became talkers
   - Formula: `(Total Users / Total Impressions) * 100`
   - Example: 22 openers, 2 talkers = 9% conversion rate

#### Middle Row Stat Cards
Two cards showing user metrics:

1. **Toplam Kullanıcı** (Total Users)
   - Icon: 👥
   - Shows: Total unique users (W- and P- prefixes)
   - Description: "benzersiz ziyaretçi" (unique visitors)

2. **Bugün Aktif** (Active Today)
   - Icon: ⚡
   - Shows: Users active today
   - Description: "bugünkü kullanıcı" (today's users)

#### KANAL DAĞILIMI Widget
Shows AI vs Human session distribution (NOT web vs premium):

- **AI ile Hizmet** (AI Service)
  - Icon: 🤖
  - Count: Sessions with `isHumanMode = false`
  - Filter: `validSessions.filter(s => !s.isHumanMode)`

- **Destek Ekibi** (Support Team)
  - Icon: 🎧
  - Count: Sessions with `isHumanMode = true`
  - Filter: `validSessions.filter(s => s.isHumanMode)`

**Important:** This widget counts sessions by human_mode flag, not by channel (web/premium).

#### Widget Tracking System
**Database Table:** `widget_opens`
```sql
CREATE TABLE widget_opens (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  city VARCHAR(100),
  premium BOOLEAN DEFAULT false,
  host VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Tracking Logic:**
- Every widget open triggers a `register` event
- Includes re-opens (pristine state reset on close)
- Normal widget: `premium = false`
- Premium widget: `premium = true`

**Backend API:**
File: `/stats/server.js` (lines ~429-439)
```javascript
// Fetch widget opens data
const widgetOpensResult = await pool.query(
  'SELECT premium, COUNT(*) as count FROM widget_opens GROUP BY premium'
);
const normalOpens = widgetOpensResult.rows.find(r => r.premium === false)?.count || 0;
const premiumOpens = widgetOpensResult.rows.find(r => r.premium === true)?.count || 0;

response.widgetOpens = {
  total: parseInt(normalOpens) + parseInt(premiumOpens),
  normal: parseInt(normalOpens),
  premium: parseInt(premiumOpens)
};
```

## Key Technical Details

### User ID Prefixes
- **Normal chat**: `W-Guest-xxx` (W = Web)
- **Premium chat**: `P-Guest-xxx` (P = Premium)
- **Internal socket.io**: Uses unprefixed `Guest-xxx`
- **N8N/Telegram/Stats**: Uses prefixed version

### human_mode Field
- **Type:** Boolean (true/false)
- **Purpose:** Tracks AI vs Live Support mode (Premium only)
- **Storage:** N8N database per message
- **Usage:**
  - Stats dashboard: Determines message color (green AI vs purple Live Support)
  - N8N workflow: Routes to AI or Telegram
  - Normal chat: Always `false`
  - Premium chat: Depends on active tab

**Message Styling Logic:**
```javascript
// CORRECT: Only admin messages with human_mode=true are Live Support
if (msg.from === 'admin' && msg.human_mode === true) {
    messageClass = 'live-support';  // Purple #e7dcf6
} else if (msg.from === 'bot' || msg.from === 'admin') {
    messageClass = 'admin';  // Green #E8FFF3
}
```

### Country/City Tracking
- **Library:** geoip-lite (offline IP geolocation)
- **Extraction:** Cloudflare headers (`cf-connecting-ip`) → `x-forwarded-for` → fallback
- **Storage:** Per message in N8N database
- **N8N Logic:** Searches ALL messages, uses most recent location
- **Dashboard:** Shows flags + location

### Session Batching
- **Timeout:** 1 hour (messages >1h apart = new session)
- **Minimum:** 2 messages per session
- **Format:** `Guest-abc123-s1`, `Guest-abc123-s2`
- **Frontend Filter:** Excludes sessions <5 seconds

### Stats Dashboard Architecture
- **Technology:** React 19 + Vite 5.x + Recharts + React Router (migrated November 2025)
- **Deployment:** Volume mounted SCP deployment (like widgets, NOT git!)
- **Build:** Local `npm run build` → `dist/` → SCP to production
- **Backend:** Express + Socket.io for real-time updates (also volume mounted)
- **Routing:** Simplified single-page app (removed all Metronic layouts)
  - `/` - Main dashboard (interactive charts, heatmap, stats cards)
  - `/web` - Web chat analytics
  - `/premium` - Premium chat analytics
  - `/settings` - Dashboard settings
  - All other routes redirect to `/`
- **Loading:** Sequential (web → premium → update) to prevent race conditions
- **Authentication:** Client-side localStorage (username: admin, password: 123123)
- **Features:** Interactive charts (pie hover, area gradient, bar animations)
- **Bundle Size:** ~1.1MB JS (optimized, removed 30+ unused layouts)

## Common Pitfalls

1. **Mixing normal/premium files:** Check volume mounts in docker-compose.yml
2. **Stats changes not visible after SCP:** Must restart container (`docker restart root-stats-1`), NOT rebuild
3. **Using git checkout/restore on stats:** Brings back OLD Node.js dashboard, deletes React dashboard!
4. **Restoring stats from backup:** Backups contain OLD dashboard, will delete React version!
5. **Widget changes not reflected:** Ensure files are copied to correct location and containers restarted
6. **Wrong message styling:** Check `human_mode` logic in conversation modal code
7. **Missing country data:** N8N must search ALL messages, not just lastMessage
8. **N8N changes not working:** Must click "Save" and ensure "Active" toggle is ON
9. **Real-time modal not working:** Use `window.currentOpenUserId` (NOT `let currentOpenUserId`)
10. **Race conditions in stats:** Use sequential loading (await pattern)
11. **Stats deployment confusion:** Stats is VOLUME MOUNTED (like widgets). Deploy: SCP → Restart (NO rebuild!)
12. **Old embed code format:** Ensure client websites use new `window.simpleChatConfig` format
13. **Premium widget real-time not working:** Stats server must connect TO widget servers (not wait for connections). Fixed Nov 4, 2025 - stats/server.js:571-633
14. **totalMessages not including premium:** Remove `!i.premium` filter in totalMessages calculation (stats/server.js:443)
15. **CRITICAL - Never use sed for multi-line edits:** Using sed commands to modify JavaScript code can break syntax (orphaned braces, incomplete function blocks). Always use proper editing tools or manual edits. If widget server crashes, check for syntax errors caused by automated text replacements. Fixed Nov 4, 2025 - restored intergram-premium/server.js from Git backup.

## Staging Environment

**Location:** All staging files archived in `/root/staging/`

**Contents:**
- `staging-docker-compose.yml` - Staging containers config
- `staging-intergram/` - Staging normal widget
- `staging-intergram-premium/` - Staging premium widget
- `staging-stats/` - Staging dashboard
- `STAGING_*.php`, `STAGING_*.html` - Old embed codes
- `staging-README.md` - Staging documentation

**Note:** Staging is archived. All production work happens in `/root/intergram/`, `/root/intergram-premium/`, and `/root/stats/`.

## Environment Variables

Located in `.env` file:

```bash
# Normal Chat
TELEGRAM_TOKEN=<normal-bot-token>
N8N_WEBHOOK_URL=https://n8n.photier.co/webhook/intergram-message

# Premium Chat
TELEGRAM_TOKEN_PREMIUM=<premium-bot-token>
N8N_WEBHOOK_URL_PREMIUM=https://n8n.photier.co/webhook/admin-chat

# Domain
DOMAIN_NAME=simplechat.bot

# Database
POSTGRES_DB=n8n
POSTGRES_USER=n8n
POSTGRES_PASSWORD=<password>
```

## Documentation

- `INTERGRAM_SYSTEM_DOCS.md` - Complete 1900-line knowledge base (critical reference)
- `README.md` - Project overview and quick start
- `SIMPLE_CHAT_BOT_ANALYSIS.md` - Project analysis
- `kb/` directory - Knowledge base for AI responses
- `SAAS_MIGRATION_PLAN.md` - React migration plan and roadmap

## Local Development Setup

### Prerequisites
- PostgreSQL 16 installed via Homebrew
- Node.js 18+ installed
- Production database backup

### Initial Setup (One-time)

```bash
# 1. Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"

# 2. Install PostgreSQL
brew install postgresql@16
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
brew services start postgresql@16

# 3. Create local database
/opt/homebrew/opt/postgresql@16/bin/createdb simplechat

# 4. Sync production backup to local
ssh root@92.113.21.229 "docker exec root-postgres-1 pg_dump -U simplechat simplechat > /root/backups/simplechat_latest.sql"
scp root@92.113.21.229:/root/backups/simplechat_latest.sql ~/simplechat_backup.sql

# 5. Import backup
/opt/homebrew/opt/postgresql@16/bin/psql simplechat < ~/simplechat_backup.sql
```

### Daily Development Workflow

```bash
# 1. Update local database with fresh production data (optional)
ssh root@92.113.21.229 "docker exec root-postgres-1 pg_dump -U simplechat simplechat" | psql simplechat

# 2. Start stats server locally
cd "/path/to/Simple Chat Bot/stats"
POSTGRES_HOST=localhost POSTGRES_PORT=5432 POSTGRES_DB=simplechat POSTGRES_USER=$USER POSTGRES_PASSWORD='' PORT=3002 node server.js

# 3. Access local dashboard
open http://localhost:3002

# 4. Make changes to stats/public/index.html or stats/public/api.js

# 5. Refresh browser to see changes (server auto-reloads on file changes)
```

### Widget Development Workflow

```bash
# 1. Navigate to widget source
cd simple-chat-saas/apps/widget  # or widget-premium

# 2. Install dependencies (first time)
npm install

# 3. Start development server
npm run dev

# 4. Make changes and test at http://localhost:5173

# 5. Build for production
npm run build

# 6. Deploy to production (see deployment section)
```

### Quick Database Refresh

```bash
# One-liner to sync latest production data
ssh root@92.113.21.229 "docker exec root-postgres-1 pg_dump -U simplechat simplechat" | psql simplechat
```

## Deployment Workflow

1. **Edit locally** in Claude Code
   - Widgets: Edit in `/simple-chat-saas/apps/widget/` or `/simple-chat-saas/apps/widget-premium/`
   - Stats: Edit in `/stats/public/index.html` (meta tags) or `/stats/server.js` (backend)
   - Server: Edit in `/intergram/server.js` or `/intergram-premium/server.js`

2. **Build widgets** (if changed)
   ```bash
   cd simple-chat-saas/apps/widget
   npm run build
   ```

3. **Test changes locally** with local PostgreSQL database

4. **Deploy to production**

   **For widgets:**
   ```bash
   # Copy widget files:
   scp dist/simple-chat.min.js root@92.113.21.229:/root/intergram/telegram-chat-widget/static/js/
   scp dist/simple-chat.css root@92.113.21.229:/root/intergram/telegram-chat-widget/static/css/

   # Restart (volume mounted files)
   ssh root@92.113.21.229 "docker restart root-intergram-1 root-intergram-premium-1"
   ```

   **For stats dashboard (IMPORTANT - READ CAREFULLY!):**
   ```bash
   # Stats is VOLUME MOUNTED - deploy via SCP, NOT git!
   cd simple-chat-saas/apps/dashboard
   npm run build

   scp dist/index.html root@92.113.21.229:/root/stats/public/
   scp dist/assets/* root@92.113.21.229:/root/stats/public/assets/
   scp -r dist/media root@92.113.21.229:/root/stats/public/

   # Restart (NO rebuild!)
   ssh root@92.113.21.229 "docker restart root-stats-1"
   ```

   **For server.js backend changes (rare):**
   ```bash
   # Can use git for server.js changes
   ssh root@92.113.21.229 "cd /root && git pull"
   ssh root@92.113.21.229 "docker restart root-intergram-1 root-intergram-premium-1 root-stats-1"
   ```

5. **Verify**
   - Check logs: `docker logs --tail 50 root-intergram-1`
   - Test URLs: Visit widget URLs and stats dashboard
   - Monitor: Check real-time connections in stats dashboard
   - Test API: `curl https://stats.simplechat.bot/api/stats | jq`

## Backup Strategy

```bash
# Create timestamped backup
BACKUP_DIR=/root/backups/$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup critical files
cp /root/intergram/server.js $BACKUP_DIR/server_web.js
cp /root/intergram-premium/server.js $BACKUP_DIR/server_premium.js
cp /root/stats/server.js $BACKUP_DIR/stats_server.js
cp /root/docker-compose.yml $BACKUP_DIR/docker-compose.yml

# Backup widget files
cp /root/intergram/telegram-chat-widget/static/js/simple-chat.min.js $BACKUP_DIR/
cp /root/intergram-premium/telegram-chat-widget/static/js/simple-chat-premium.min.js $BACKUP_DIR/

# Backup stats dashboard (entire public/ folder including React build)
tar -czf $BACKUP_DIR/stats-public.tar.gz -C /root/stats public/

# ⚠️ WARNING: Never restore stats from this backup!
# These backups may contain OLD Node.js dashboard (before React migration)
# React dashboard must be deployed from local build via SCP

# Create tarball
cd /root && tar -czf backup_$(date +%Y%m%d_%H%M%S).tar.gz stats/ intergram/ intergram-premium/

# Backup database
docker exec root-postgres-1 pg_dump -U simplechat simplechat > $BACKUP_DIR/simplechat.sql
```

**Backup Restoration Rules:**
- ✅ Widget files (intergram) - safe to restore from backup
- ✅ server.js files - safe to restore from backup
- ✅ Database dumps - safe to restore from backup
- ❌ Stats public/ folder - NEVER restore! Deploy from local build instead
- ❌ Git history - NEVER checkout stats files! Contains old dashboard

## Additional Resources

- **React Docs:** https://react.dev/
- **Vite Docs:** https://vitejs.dev/
- **Socket.io Docs:** https://socket.io/docs/v4/
- **geoip-lite:** https://www.npmjs.com/package/geoip-lite
- **GitHub:** [Kintoyyy/Telegram-Chat-Widget](https://github.com/Kintoyyy/Telegram-Chat-Widget)
- **Original Intergram:** [idoco/intergram](https://github.com/idoco/intergram)

---

**Last Updated:** November 4, 2025
**React Migration:** Completed November 2025
**Current Stack:** React 19 + Vite 5.x + Recharts + Node.js + Express + Socket.io

**CRITICAL UPDATES:**

**November 4, 2025 - Real-time Stats Fix:**
- ✅ **Stats server now connects TO widget servers as Socket.io client**
- ✅ Fixed totalMessages calculation (now includes premium widget messages)
- ✅ Fixed static file serving (uses public directory + root route)
- ✅ Stats server connects to both web (3000) and premium (3001) widget servers
- ✅ Auto-reconnection with infinite attempts for reliability
- ✅ Cache invalidation on every event for real-time accuracy
- ✅ 800ms delay before dashboard fetch (allows N8N database writes)
- ✅ All changes committed to git and volume mounted (permanent)

**November 4, 2025 - Dashboard & Routing:**
- Stats dashboard deployment method CLARIFIED: Volume mounted SCP (NOT git/build-time)
- Added extensive warnings about backup/git restore (contains OLD dashboard)
- Added "CRITICAL DEPLOYMENT RULES" section at top of file
- Interactive charts added: pie hover animation, area gradient, bar effects
- Routing simplified: Removed all 35 Metronic layouts, kept only 4 routes (/, /web, /premium, /settings)
- Bundle size reduced: 2MB → 1.1MB (removed unused layouts)

**November 4, 2025 - Critical Premium Widget Fix:**
- ⚠️ CRITICAL: Premium widget completely broken due to sed command syntax errors
- Fixed orphaned braces in broadcastStatsUpdate() function (lines 69-73)
- Fixed orphaned braces in widget_opened event handler (lines 469-470)
- Restored clean version from Git backup (intergram-premium/server.js)
- Volume mounts verified: /root/intergram-premium/server.js → /app/server.js (working)
- Production backup created: /root/backups/20251104_231227_working/
- Added Common Pitfall #15: NEVER use sed for multi-line JavaScript edits
- Git commit: 64441fa "fix: Restore premium widget and fix stats real-time updates"
- Status: ✅ Premium widget restored and working on photier.com
