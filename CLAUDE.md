# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Simple Chat Bot SaaS is a production-ready **dual chat widget system** featuring:
- **Normal Chat Widget**: Single chat with AI responses (React 19)
- **Premium Chat Widget**: Dual-tab system - AI Bot + Live Support (React 19)
- **Stats Dashboard**: Real-time monitoring and analytics (React 19 + Vite)
- **Backend API**: NestJS multi-tenant backend
- **N8N Workflow Engine**: AI processing + database storage
- **Telegram Integration**: Admin notifications and manual replies

**Technology Stack:**
- **Frontend:** React 19 + Vite 7.x
- **Backend:** NestJS + Express + Node.js 22+
- **Real-time:** Socket.io 2.2.0+
- **Build Tool:** Vite 7.x with TypeScript + Turborepo 2.3.3
- **State Management:** Zustand (widgets), React Context (dashboard)
- **Styling:** CSS Modules + Tailwind CSS
- **Monorepo:** Turborepo with npm workspaces
- **Deployment:** Railway (auto-deploy from Git)

**Live URLs:**
- Normal Widget: https://chat.simplechat.bot
- Premium Widget: https://p-chat.simplechat.bot
- Stats Dashboard: https://stats.simplechat.bot
- N8N: https://n8n.photier.co

## Monorepo Structure

```
simplechat-saas/
├── apps/
│   ├── dashboard/         # Stats dashboard (React 19 + Vite 7)
│   ├── widget/            # Normal chat widget (React 19 + Vite 7)
│   └── widget-premium/    # Premium chat widget (React 19 + Vite 7)
├── backend/               # NestJS API backend
├── stats/                 # Stats Express server + Socket.io
├── packages/
│   └── database/          # Prisma database schemas
├── turbo.json            # Turborepo configuration
└── package.json          # Workspace root
```

## Development Workflow

### Local Development

```bash
# 1. Install dependencies (from root)
npm install

# 2. Start all dev servers in parallel
npm run dev

# 3. Or start specific apps
npm run dev --filter=@simple-chat/dashboard
npm run dev --filter=@simple-chat/widget
npm run dev --filter=@simple-chat/widget-premium
```

**Dev Server Ports:**
- Dashboard: http://localhost:5173
- Widget: http://localhost:5174
- Widget Premium: http://localhost:5175
- Stats Backend: http://localhost:3002
- Backend API: http://localhost:3000

### Build Commands

```bash
# Build all apps (Turborepo handles dependencies)
npm run build

# Build specific apps
npm run build:dashboard
npm run build:widget
npm run build:widget-premium
npm run build:backend
npm run build:stats

# Lint all apps
npm run lint
```

### Deployment Workflow (Railway)

**This is the ONLY deployment method:**

```bash
# 1. Make changes locally
# 2. Test locally with `npm run dev`
# 3. Commit changes
git add .
git commit -m "feat: your changes"

# 4. Push to GitHub
git push origin main

# 5. Railway automatically deploys
# - Watch Paths detect which services changed
# - Only changed services rebuild (2-3 min per service)
# - Railway runs `npm run build` then `npm start`
```

**Important:**
- ✅ Always test locally before pushing
- ✅ Railway auto-deploys from `main` branch
- ✅ Only changed services rebuild (Watch Paths)
- ✅ Build logs available in Railway dashboard
- ❌ NO manual deployment needed
- ❌ NO Docker commands needed
- ❌ NO SSH to production servers

## Railway Configuration

### Service Architecture (Dockerfile-based)

Railway deploys 5 services using **production-grade Dockerfiles**:

1. **Dashboard** - React 19 + Vite 7 SPA
   - Dockerfile: `apps/dashboard/Dockerfile`
   - Pattern: Monorepo copy → npm install --ignore-scripts → Vite build
   - Watch: `apps/dashboard/**`

2. **Widget** - React 19 chat widget
   - Dockerfile: `apps/widget/Dockerfile`
   - Pattern: Monorepo copy → npm install --ignore-scripts → Vite build → server.cjs
   - Watch: `apps/widget/**`

3. **Widget Premium** - Dual-tab chat widget
   - Dockerfile: `apps/widget-premium/Dockerfile`
   - Pattern: Same as widget
   - Watch: `apps/widget-premium/**`

4. **Stats Backend** - Express + Socket.io
   - Dockerfile: `stats/Dockerfile`
   - Pattern: Monorepo copy → cd stats/ → npm install → node server.js
   - Watch: `stats/**`

5. **Backend API** - NestJS + Prisma
   - Dockerfile: `backend/Dockerfile`
   - Pattern: Multi-stage (deps → builder → runner)
   - Watch: `backend/**`

**Railway Settings (ALL services):**
- Root Directory: **EMPTY** (not set)
- Builder: **DOCKERFILE**
- Dockerfile Path: `<service>/Dockerfile` (e.g., `apps/dashboard/Dockerfile`)
- Watch Paths: Configured per service (see above)

### React 19 Dependency Management

**Problem:** React 19 has peer dependency conflicts with older packages.

**Solution:** Each service has `.npmrc` file with `legacy-peer-deps=true`

```bash
# Already configured in these locations:
apps/dashboard/.npmrc
apps/widget/.npmrc
apps/widget-premium/.npmrc
stats/.npmrc
backend/.npmrc
```

**Railway automatically uses these .npmrc files during build.**

### Watch Paths (Critical)

Watch Paths tell Railway which services to rebuild when files change:

| Service | Watch Path Pattern |
|---------|-------------------|
| Dashboard | `apps/dashboard/**` |
| Widget | `apps/widget/**` |
| Widget Premium | `apps/widget-premium/**` |
| Stats Backend | `stats/**` |
| Backend | `backend/**` |

**Benefit:** Only changed services rebuild, saving ~5-8 minutes per deploy.

### Dockerfile Pattern (2025)

**All services use Dockerfiles** (migrated Nov 2025):

**Key Pattern (Dashboard/Widget/Widget-Premium):**
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY . .  # Copy entire monorepo
RUN npm install --legacy-peer-deps --ignore-scripts  # Avoid rollup patch-package error
WORKDIR /app/apps/dashboard  # or /app/apps/widget
RUN npm run build  # Vite build
CMD ["node", "server.js"]  # or server.cjs
```

**Stats Pattern:**
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY . .
WORKDIR /app/stats
RUN npm install --omit=dev
CMD ["node", "server.js"]
```

**Critical Flags:**
- `--ignore-scripts`: Prevents rollup postinstall from requiring patch-package
- `--legacy-peer-deps`: Handles React 19 peer dependency conflicts

**Important:**
- ❌ NO `railway.json` or `railway.toml` files (causes conflicts)
- ✅ All config via Railway UI Settings
- ✅ Root Directory must be EMPTY for all services

## Architecture

### Data Flow Pattern

**Normal Chat:**
1. User message → Widget (chat.simplechat.bot)
2. Widget → N8N webhook (`/webhook/intergram-message`) with `premium: false`
3. N8N → AI processing (RAG) + database storage
4. N8N → Stats Backend `/send-to-user` endpoint
5. Stats Backend → Socket.io → User

**Premium Chat:**
1. User selects tab (AI Bot or Live Support) → sets `human_mode` flag
2. User message → Premium Widget (p-chat.simplechat.bot)
3. Widget → N8N webhook (`/webhook/admin-chat`) with `premium: true, human_mode: true/false`
4. N8N logic:
   - `human_mode: false` → AI processing
   - `human_mode: true` → Telegram only (no AI)
5. N8N → Stats Backend `/send-to-user` endpoint
6. Stats Backend → Socket.io → User (correct tab)

**Critical:** Premium has TWO separate conversation histories (one per tab).

### Real-time Updates (Stats Dashboard)

**Architecture:**

Stats Backend acts as **middleware** between widget servers and dashboard:
1. **Widget servers** emit events to `/stats` namespace
2. **Stats Backend** connects TO widget servers as Socket.io client
3. **Stats Backend** listens to events and broadcasts to dashboards
4. **Dashboard** connects to Stats Backend and receives real-time updates

**Connection Flow:**
```
Widget Servers  →  Stats Backend  →  Dashboard Clients
[emit to /stats]   [client: listen]   [client: listen]
                   [server: broadcast]
```

**Events:**
- `user_online`, `user_offline`, `new_message`, `human_mode_change`, `widget_opened`
- Dashboard updates UI without page refresh
- 800ms delay before fetch (allows N8N database writes)
- Cache invalidated on every event for fresh data

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
  - Stats dashboard: Determines message color (blue AI vs purple Live Support)
  - N8N workflow: Routes to AI or Telegram
  - Normal chat: Always `false`
  - Premium chat: Depends on active tab

**Message Styling Logic:**
```typescript
// Dashboard ConversationModal
if (msg.from === 'admin' && msg.human_mode === true) {
    messageClass = 'live-support';  // Purple #B794F6
} else if (msg.from === 'bot' || msg.from === 'admin') {
    messageClass = 'admin';  // Blue rgba(0, 122, 255, 0.75)
}
```

### Country/City Tracking
- **Library:** geoip-lite (offline IP geolocation)
- **Extraction:** Cloudflare headers (`cf-connecting-ip`) → `x-forwarded-for` → fallback
- **Storage:** Per message in N8N database
- **N8N Logic:** Searches ALL messages, uses most recent location
- **Dashboard:** Shows flags + location (Turkish format)

### Session Batching
- **Timeout:** 1 hour (messages >1h apart = new session)
- **Minimum:** 2 messages per session
- **Format:** `Guest-abc123-s1`, `Guest-abc123-s2`
- **Frontend Filter:** Excludes sessions <5 seconds

### Dashboard Metrics

**Hero Cards (Top Row):**
1. **Online Now** (Çevrimiçi) - Real-time Socket.io connections
2. **Total Impressions** (Toplam Tıklama) - Widget opens from `widget_opens` table
3. **Conversion Rate** (Konversiyon Oranı) - `(Total Users / Total Impressions) * 100`

**Middle Row:**
1. **Total Users** (Toplam Kullanıcı) - Unique users (W- and P- prefixes)
2. **Active Today** (Bugün Aktif) - Users active today

**Channel Distribution (KANAL DAĞILIMI):**
- **AI Service** (AI ile Hizmet) - Sessions with `isHumanMode = false`
- **Support Team** (Destek Ekibi) - Sessions with `isHumanMode = true`

### Widget Embed Code

**Production embed format (used on client websites):**

```html
<script>
(function() {
    var p = window.location.pathname;
    var isPrem = false; // Set true for premium widget

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

## Widget Development

### File Locations

**Widget Source:**
- `apps/widget/src/` - Normal widget React source
- `apps/widget-premium/src/` - Premium widget React source

**Key Files:**
- `src/store/chatStore.ts` - Zustand state (messages, UI state)
- `src/hooks/useSocket.ts` - Socket.io connection logic
- `src/components/` - React components
- `vite.config.ts` - Vite build configuration (IIFE format)

**Build Output:**
- `apps/widget/dist/simple-chat.min.js` (~350KB IIFE)
- `apps/widget/dist/simple-chat.css` (~3KB)

### Making Widget Changes

```bash
# 1. Edit widget source
cd apps/widget  # or apps/widget-premium
# Make changes to src/ files

# 2. Test locally
npm run dev
# Visit http://localhost:5174

# 3. Build locally (optional - Railway will build)
npm run build

# 4. Commit and push
git add .
git commit -m "feat: update widget"
git push origin main

# 5. Railway auto-deploys
# Widget service rebuilds and deploys automatically
```

## Dashboard Development

### File Locations

**Dashboard Source:**
- `apps/dashboard/src/` - React 19 source code
- `apps/dashboard/src/components/` - React components
- `apps/dashboard/src/pages/` - Page components
- `apps/dashboard/src/context/` - React Context (stats data)

**Key Features:**
- React Router (4 routes: `/`, `/web`, `/premium`, `/settings`)
- Recharts for interactive charts
- Socket.io for real-time updates
- Turkish date format (DD.MM.YYYY HH:MM:SS)
- Apple Messages style chat bubbles

### Making Dashboard Changes

```bash
# 1. Edit dashboard source
cd apps/dashboard
# Make changes to src/ files

# 2. Test locally
npm run dev
# Visit http://localhost:5173

# 3. Commit and push
git add .
git commit -m "feat: update dashboard"
git push origin main

# 4. Railway auto-deploys
# Dashboard service rebuilds and deploys automatically
```

## Stats Backend Development

### File Locations

**Stats Backend:**
- `stats/server.js` - Express + Socket.io server
- `stats/package.json` - Dependencies

**Key Responsibilities:**
- Express API (`/api/stats`, `/api/messages/:userId`)
- Socket.io relay (widget servers → dashboard clients)
- PostgreSQL queries (user stats, messages, sessions)
- Real-time event broadcasting

### Making Stats Backend Changes

```bash
# 1. Edit stats backend
cd stats
# Edit server.js

# 2. Test locally (requires PostgreSQL)
POSTGRES_HOST=localhost POSTGRES_PORT=5432 \
POSTGRES_DB=simplechat POSTGRES_USER=$USER \
POSTGRES_PASSWORD='' PORT=3002 node server.js

# 3. Commit and push
git add .
git commit -m "feat: update stats backend"
git push origin main

# 4. Railway auto-deploys
# Stats service restarts automatically
```

## Common Pitfalls

1. **Railway build fails with ERESOLVE errors:**
   - Missing `.npmrc` file in service directory
   - Add `legacy-peer-deps=true` to `.npmrc`
   - Ensure `.npmrc` is committed to git

2. **Railway builds all services on every push:**
   - Missing Watch Paths configuration
   - Set Watch Paths in Railway UI for each service
   - Pattern: `apps/{service-name}/**` or `stats/**`

3. **Build succeeds but deployment fails:**
   - Check Railway deployment logs (not just build logs)
   - Verify `npm start` command exists in package.json
   - Check environment variables are set in Railway UI

4. **Widget changes not reflected:**
   - Clear browser cache (widgets are cached)
   - Check Railway deployment status
   - Verify build completed successfully

5. **Real-time stats not updating:**
   - Check Socket.io connection in browser console
   - Verify Stats Backend is running (Railway logs)
   - Check widget servers are emitting events

6. **ConversationModal flickers on new messages:**
   - Use instant scroll (`behavior: 'auto'`) not smooth scroll
   - Only use smooth scroll on initial modal open

7. **Wrong message styling in dashboard:**
   - Check `human_mode` field in database
   - Verify N8N is setting `human_mode` correctly
   - Use correct CSS classes (`.live-support` vs `.admin`)

8. **Missing country/city data:**
   - N8N must search ALL messages, not just lastMessage
   - Verify geoip-lite is installed in widget servers

9. **Widget tabs not working (Premium):**
   - Check `human_mode` state in chatStore
   - Verify tab switching logic in TabSelector component
   - Check N8N webhook receives correct `human_mode` value

10. **Turborepo cache issues:**
    - Clear cache: `rm -rf node_modules/.cache/turbo`
    - Force rebuild: `npm run build -- --force`

## Environment Variables

### Required Environment Variables (Set in Railway UI)

**Dashboard:**
- None (static build)

**Widget / Widget Premium:**
- `VITE_API_URL` - Backend API URL
- `VITE_SOCKET_URL` - Socket.io server URL

**Stats Backend:**
- `POSTGRES_HOST` - PostgreSQL host
- `POSTGRES_PORT` - PostgreSQL port
- `POSTGRES_DB` - Database name
- `POSTGRES_USER` - Database user
- `POSTGRES_PASSWORD` - Database password
- `PORT` - Server port (default: 3002)

**Backend API:**
- `DATABASE_URL` - Prisma connection string
- `JWT_SECRET` - JWT signing secret
- Other backend-specific vars

## Testing

**Unit Tests:**
- Not currently implemented
- Frontend: Would use Vitest
- Backend: Would use Jest

**Manual Testing:**
```bash
# Test widget locally
cd apps/widget
npm run dev
# Visit http://localhost:5174

# Test dashboard locally
cd apps/dashboard
npm run dev
# Visit http://localhost:5173

# Test stats backend locally
cd stats
POSTGRES_HOST=localhost POSTGRES_PORT=5432 \
POSTGRES_DB=simplechat POSTGRES_USER=$USER \
POSTGRES_PASSWORD='' PORT=3002 node server.js
```

**API Testing:**
```bash
# Test stats API
curl http://localhost:3002/api/stats | jq

# Test messages endpoint
curl http://localhost:3002/api/messages/W-Guest-abc123 | jq

# Test N8N webhooks
curl https://n8n.photier.co/webhook/photier-stats
```

## Documentation

- `ARCHITECTURE.md` - System architecture and technical patterns
- `README.md` - Project overview and quick start
- `INTERGRAM_SYSTEM_DOCS.md` - Legacy system documentation
- `SAAS_MIGRATION_PLAN.md` - React migration plan
- `turbo.json` - Turborepo configuration
- `railway.json` - Railway deployment config (each service)

## Additional Resources

- **React 19 Docs:** https://react.dev/
- **Vite 7 Docs:** https://vitejs.dev/
- **Turborepo Docs:** https://turbo.build/repo/docs
- **Railway Docs:** https://docs.railway.app/
- **Socket.io Docs:** https://socket.io/docs/v4/
- **Zustand Docs:** https://zustand-demo.pmnd.rs/

---

**Last Updated:** January 2025
**Current Stack:** React 19 + Vite 7.x + Turborepo + Railway
**Deployment:** Git Push → Railway Auto-Deploy (main branch)

**CRITICAL REMINDER:**
- ✅ Always work locally, test thoroughly, then push to Git
- ✅ Railway auto-deploys from `main` branch
- ✅ Only changed services rebuild (Watch Paths)
- ❌ NO Docker commands
- ❌ NO manual deployment
- ❌ NO SSH to production
