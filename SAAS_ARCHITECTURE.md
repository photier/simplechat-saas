# 🏗️ Simple Chat SaaS - Architecture & Roadmap

**Last Updated:** 13 November 2025
**Status:** Phase 1 Complete (Auth + Tenant Dashboard)
**Current Issue:** Logo/assets not showing in tenant dashboards

---

## 🎯 Business Model

**Production System (Photier) - DO NOT TOUCH:**
- Owner: Tolga (Photier company)
- Bots: Running LIVE, serving customers
- Dashboard: stats.simplechat.bot
- Status: **PRODUCTION - WORKING ✅**

**New SaaS System:**
- **Multi-tenant platform:** Each customer gets subdomain (acme34.simplechat.bot)
- **Multi-bot per tenant:** 1 tenant = unlimited chatbots
- **Pay per bot:** $9.99/month (BASIC) or $19.99/month (PREMIUM)
- **Automatic provisioning:** N8N workflow cloned per bot
- **Signup flow:** Email/password → subdomain → create bots → pay per bot

---

## 📐 Railway Services Architecture

### Current Services (DO NOT TOUCH):

```
┌─────────────────────────────────────────────────────┐
│ PHOTIER PRODUCTION (LIVE - WORKING)                 │
├─────────────────────────────────────────────────────┤
│ 1. backend                                          │
│    - simplechat-saas-production.up.railway.app     │
│    - NestJS API                                     │
│    - /api/stats (Photier)                          │
│    - /auth (Multi-tenant - NEW)                    │
│    - /api/tenants (Multi-tenant - NEW)             │
│                                                     │
│ 2. stats                                            │
│    - Express + Socket.io                           │
│    - Real-time stats for Photier                   │
│                                                     │
│ 3. dashboard (Photier Dashboard)                    │
│    - stats.simplechat.bot                          │
│    - React 19 + Vite 7                             │
│    - Photier's own bots dashboard                  │
│    - Status: WORKING ✅                            │
│    - Future: Will become ADMIN PANEL               │
│                                                     │
│ 4. widget                                           │
│    - chat.simplechat.bot                           │
│    - Photier normal widget                         │
│                                                     │
│ 5. widget-premium                                   │
│    - p-chat.simplechat.bot                         │
│    - Photier premium widget                        │
└─────────────────────────────────────────────────────┘
```

### New SaaS Services:

```
┌─────────────────────────────────────────────────────┐
│ MULTI-TENANT SAAS (NEW)                             │
├─────────────────────────────────────────────────────┤
│ 6. dashboard tenant                                 │
│    - *.simplechat.bot (wildcard)                   │
│    - login.simplechat.bot                          │
│    - React 19 + Vite 7 + Express                   │
│    - Each tenant gets subdomain                     │
│    - Examples:                                      │
│      • acme34.simplechat.bot                       │
│      • photier-test.simplechat.bot                 │
│                                                     │
│ Railway Config:                                     │
│   Domains: *.simplechat.bot, login.simplechat.bot │
│   Watch Paths: apps/tenant-dashboard/**            │
│   Dockerfile: apps/tenant-dashboard/Dockerfile     │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Routing & DNS

### Cloudflare DNS:

```
Type    Name                    Target                           Status
────────────────────────────────────────────────────────────────────────
CNAME   *.simplechat.bot       [Railway dashboard tenant]       ✅ ACTIVE
CNAME   login.simplechat.bot   [Railway dashboard tenant]       ✅ ACTIVE
CNAME   stats.simplechat.bot   [Railway dashboard Photier]      ✅ ACTIVE
CNAME   chat.simplechat.bot    [Railway widget]                 ✅ ACTIVE
CNAME   p-chat.simplechat.bot  [Railway widget-premium]         ✅ ACTIVE
```

### URL Flow:

```
User Types              →  Goes To                  →  Railway Service
─────────────────────────────────────────────────────────────────────────
acme34.simplechat.bot   →  Wildcard *.simplechat.bot  →  dashboard tenant
login.simplechat.bot    →  Exact match                →  dashboard tenant
stats.simplechat.bot    →  Exact match                →  dashboard (Photier)
chat.simplechat.bot     →  Exact match                →  widget (Photier)
```

---

## ✅ Phase 1: Completed (Authentication & Multi-Tenant)

### Database Schema (PostgreSQL):

**SaaS Schema (Multi-Tenant):**
```sql
-- Core tenant table
CREATE TABLE saas.tenants (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  company_name VARCHAR(255),
  subdomain VARCHAR(100) UNIQUE NOT NULL,  -- 'acme34'
  chat_id VARCHAR(100) UNIQUE NOT NULL,    -- 'tenant_abc123'
  plan VARCHAR(20) NOT NULL,                -- 'basic' or 'premium'
  subscription_status VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT true,      -- Auto-verified for now
  created_at TIMESTAMP DEFAULT NOW()
);

-- N8N workflow mapping
CREATE TABLE saas.tenant_workflows (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES saas.tenants(id),
  n8n_workflow_id VARCHAR(255) UNIQUE NOT NULL,
  webhook_url VARCHAR(500) NOT NULL,
  plan VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT true
);
```

**Photier Schema (Existing - UNTOUCHED):**
```sql
-- Existing Photier tables in public schema
public.messages
public.users
public.sessions
public.widget_opens
-- All working, no changes ✅
```

### Backend API (NestJS):

**Authentication Endpoints:**
```typescript
POST /auth/register
  Body: { email, password }
  Response: { token, tenant: { id, subdomain } }
  Flow:
    1. Create tenant with temp subdomain (temp_xxx)
    2. Auto-verify email (emailVerified = true)
    3. Generate JWT token
    4. Return for auto-login

POST /auth/login
  Body: { email, password }
  Response: { token, tenant }

POST /auth/set-subdomain
  Headers: Authorization: Bearer {token}
  Body: { companyName: "Acme Corp" }
  Response: { tenant: { subdomain: "acme34" } }
  Flow:
    1. Slugify company name → "acme34"
    2. Check uniqueness (add counter if exists)
    3. Update tenant subdomain
    4. Return new subdomain

GET /auth/me
  Headers: Authorization: Bearer {token}
  Response: { id, email, subdomain, ... }
```

**N8N Workflow Cloning Service:**
```typescript
// Automatic on registration
async cloneWorkflow(tenantId: string, plan: 'basic' | 'premium') {
  // 1. Select template (ID 1 or 2)
  // 2. Clone via N8N API
  // 3. Update webhook URL: /webhook/tenant_{id}
  // 4. Activate workflow
  // 5. Store in tenant_workflows table
}
```

### Tenant Dashboard Frontend:

**Tech Stack:**
- React 19
- Vite 7
- TypeScript
- Tailwind CSS
- React Router 7

**Pages:**
```
/login              - Login/Register tabs
/setup-subdomain    - Company name → subdomain
/                   - Main dashboard (COPIED from stats.simplechat.bot)
/settings           - Settings page
/profile            - Profile page
```

**Authentication Flow:**
```
1. User visits login.simplechat.bot
2. Registers with email + password
3. Auto-login (JWT token in localStorage)
4. Redirected to /setup-subdomain
5. Enters company name ("Acme Corp")
6. Backend generates subdomain ("acme34")
7. Redirected to acme34.simplechat.bot
8. Tenant dashboard loads ✅
```

---

## ❌ Current Issue: Logo & Assets Not Showing

### Problem:

When visiting tenant subdomain (e.g., acme34.simplechat.bot):
- ❌ Logo missing (should be in header)
- ❌ Footer icon missing (blue "P" icon)
- ✅ Dashboard loads correctly
- ✅ All widgets/components render
- ✅ Stats show (empty/zero for new tenant)

### Root Cause:

**WRONG Architecture (Current State):**
```
Backend Service (Dockerfile):
├─ Stage 1: Backend build
├─ Stage 2: Tenant-dashboard build ❌ WRONG
└─ Stage 3: Backend serves both API + tenant-dashboard static files ❌ MONOLITHIC

backend/src/main.ts:
  app.use(express.static('tenant-dashboard')); ❌ Backend serving frontend
  app.use(SPA fallback);                        ❌ Anti-pattern
```

**Why This is Wrong:**
1. 🚫 Monolithic architecture (API + Frontend mixed)
2. 🚫 Backend Dockerfile too complex (builds both)
3. 🚫 Backend deployment slower (builds frontend too)
4. 🚫 Not industry standard (separation of concerns)
5. 🚫 Logo/assets likely not copied correctly in multi-stage build

### Correct Architecture (Industry Standard):

```
Backend Service:
├─ ONLY NestJS API
├─ /api/* endpoints
├─ /auth/* endpoints
└─ NO static serving

Tenant-Dashboard Service:
├─ React 19 + Vite build
├─ Express server (server.js)
├─ Serves static files (dist/)
├─ SPA fallback
└─ Logo, assets, all public files
```

**Separation of Concerns:**
- Backend = API only
- Frontend = Static serving only
- Railway routes wildcard to frontend service

---

## 🛠️ Solution: Fix Tenant Dashboard (Industry Standard)

### Step 1: Remove Tenant-Dashboard from Backend

**backend/Dockerfile:**
```dockerfile
# REMOVE these stages:
# ❌ Stage 2: Build tenant-dashboard
# ❌ COPY --from=tenant-builder

# KEEP only:
✅ Stage 1: Backend dependencies
✅ Stage 2: Backend build
✅ Stage 3: Backend runtime (no frontend)
```

**backend/src/main.ts:**
```typescript
// REMOVE these lines:
❌ const tenantDashboardPath = join(__dirname, '..', 'tenant-dashboard');
❌ app.use(express.static(tenantDashboardPath));
❌ app.use(SPA fallback for non-API routes);

// KEEP only:
✅ API routes (/api, /auth, /health)
✅ CORS configuration
✅ JWT authentication
```

### Step 2: Tenant-Dashboard Standalone

**apps/tenant-dashboard/Dockerfile:**
```dockerfile
# Single-stage build (works with npm workspaces)
FROM node:22-alpine

WORKDIR /app

# Copy entire monorepo
COPY . .

# Install dependencies
RUN npm install --legacy-peer-deps --ignore-scripts

# Build tenant-dashboard
WORKDIR /app/apps/tenant-dashboard
RUN npm run build

# Start Express server
CMD ["node", "server.js"]
```

**apps/tenant-dashboard/server.js:**
```javascript
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve static files from dist/
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Tenant Dashboard running on port ${PORT}`);
});
```

**apps/tenant-dashboard/vite.config.ts:**
```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: 'public', // ✅ Explicitly set (ensures Vite copies public/* to dist/)
  build: {
    outDir: 'dist',
    // Vite automatically copies public/* to dist/
  }
});
```

### Step 3: Verify Build Locally

```bash
cd apps/tenant-dashboard
npm run build
ls dist/  # Should see: index.html, assets/, logo.png, media/, ...
ls dist/logo.png  # ✅ Should exist
ls dist/media/app/footer-logo.png  # ✅ Should exist
```

### Step 4: Deploy to Railway

```bash
git add -A
git commit -m "fix: Separate tenant-dashboard from backend (industry standard)"
git push origin main

# Railway auto-deploys:
# - backend service: Only API (faster build)
# - dashboard tenant service: Standalone (with logo/assets)
```

---

## 🎯 Future Roadmap

### Phase 2: Multi-Bot per Tenant (Week 3-4)

**User Journey:**
```
1. Signup → acme34.simplechat.bot (NO bots created)
2. Dashboard → Empty state: "You have no chatbots yet"
3. Click [+ Create Bot] → Enter name, select BASIC/PREMIUM
4. Dummy payment page → [Purchase Bot]
5. Auto-provision:
   - Generate chatId: bot_abc123
   - Clone N8N workflow (template based on type)
   - Bot status: ACTIVE
6. Configure bot: Widget, Telegram, AI settings
7. Get embed code → Paste on website
8. Repeat for more bots (each bot = separate payment)
```

**Database Changes:**
```prisma
model Chatbot {
  id          String   @id @default(uuid())
  tenantId    String
  name        String   // "Sales Bot"
  type        BotType  // BASIC | PREMIUM
  chatId      String   @unique // bot_abc123
  status      BotStatus // PENDING_PAYMENT, ACTIVE, PAUSED
  n8nWorkflowId    String?
  webhookUrl       String?
  config           Json   // Widget settings
  subscriptionId   String? // Iyzico
  createdAt   DateTime @default(now())
  @@schema("saas")
}

// Remove plan from Tenant model:
model Tenant {
  // plan Plan // ❌ REMOVE THIS
  chatbots Chatbot[] // ✅ ADD THIS (one-to-many)
}
```

**Key Change:** Tenant signup NO LONGER creates a bot. Bots created on-demand with payment.

### Phase 3: Telegram Topics (Week 5)

- Automatic topic creation per user
- Hybrid bot (managed @SimpleChatSupportBot OR custom)
- Reply routing from Telegram → widget

### Phase 4: Iyzico Payments (Week 6)

- Subscription billing
- Trial → paid conversion
- Per-bot billing
- Webhook handling

### Phase 5: Admin Panel (Week 7-8)

**Convert stats.simplechat.bot to ADMIN PANEL:**

```
stats.simplechat.bot (NEW FEATURES):
├─ Photier's own bots (existing ✅)
├─ SaaS Management (NEW):
│  ├─ All tenants list
│  ├─ Subscription status
│  ├─ Revenue dashboard
│  ├─ Billing history
│  └─ System health
└─ Super admin access only
```

---

## 📝 Important Notes

### DO NOT TOUCH:

1. ✅ **stats.simplechat.bot** - Photier dashboard (working)
2. ✅ **chat.simplechat.bot** - Photier widget (working)
3. ✅ **p-chat.simplechat.bot** - Photier premium widget (working)
4. ✅ **Backend /api/stats** - Photier API (working)
5. ✅ **Public schema tables** - Photier data (working)

### ONLY MODIFY:

1. ✅ **Backend /auth, /api/tenants** - Multi-tenant API (new)
2. ✅ **SaaS schema tables** - Multi-tenant data (new)
3. ✅ **dashboard tenant service** - Tenant dashboards (new)

### Key Principles:

- **Separation of concerns:** Backend = API, Frontend = Static
- **No monolithic patterns:** Each service does ONE thing
- **Preserve production:** Photier system stays working
- **Industry standard:** Clean architecture, maintainable

---

## 🐛 Debugging Checklist

**If logo still doesn't show after fix:**

1. Check Railway build logs:
   ```bash
   railway logs --service "dashboard tenant" --build --lines 200
   ```

2. Verify dist/ contents in Railway:
   - Logo exists? `dist/logo.png`
   - Media exists? `dist/media/app/footer-logo.png`

3. Check browser Network tab:
   - Request to `/logo.png` - Status 200 or 404?
   - Request to `/media/app/footer-logo.png` - Status?

4. Verify Vite config:
   - `publicDir: 'public'` set?
   - Build command: `vite build`?

5. Check Railway deployment:
   - Watch Paths: `apps/tenant-dashboard/**`?
   - Dockerfile path: `apps/tenant-dashboard/Dockerfile`?
   - Custom domain: `*.simplechat.bot` added?

---

**End of Document**
