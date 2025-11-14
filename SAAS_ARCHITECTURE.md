# 🏗️ Simple Chat SaaS - Architecture & Roadmap

**Last Updated:** 14 November 2025
**Status:** Phase 2 Complete (Multi-Bot Architecture + Database Isolation)
**Current Implementation:** ✅ Multi-bot per tenant with isolated N8N workflows and database

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
- Herşey industry standart olarak en son teknoloji ile, en son sürümlerle yapılmalı. MVP yapmıyoruz, en son teknoloji product  yaratıyoruz. 

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
  name VARCHAR(255),                        -- Company name
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  subdomain VARCHAR(100) UNIQUE NOT NULL,  -- 'acme34' (starts as 'temp_xxx')
  api_key VARCHAR(255) UNIQUE NOT NULL,     -- Authentication key

  -- Authentication & Security
  email_verified BOOLEAN DEFAULT false,     -- ✅ Email verification required
  status VARCHAR(20) DEFAULT 'PENDING',     -- PENDING → ACTIVE after verification
  auth_provider VARCHAR(20) DEFAULT 'email', -- 'email' or 'google'

  -- Google OAuth (future)
  google_id VARCHAR(255) UNIQUE,
  google_refresh_token TEXT,
  avatar_url VARCHAR(500),

  -- Activity tracking
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
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
  Response: {
    message: "Registration successful! Please check your email.",
    email: "user@example.com",
    requiresVerification: true
  }
  Flow:
    1. Validate email/password strength
    2. Hash password (bcrypt, 12 rounds)
    3. Create tenant with:
       - status: PENDING
       - emailVerified: false
       - subdomain: temp_{nanoid}
    4. Generate email_verification JWT (24h expiry)
    5. Send verification email via Brevo
    6. Return success message (NO auto-login)

GET /auth/verify-email?token={jwt}
  Response: {
    success: true,
    message: "Email verified successfully",
    tenant: { id, email, subdomain, ... }
  }
  Flow:
    1. Verify JWT token (type: email_verification)
    2. Update tenant:
       - emailVerified: true
       - status: ACTIVE
    3. Generate auth JWT token
    4. Set HttpOnly cookie (domain: .simplechat.bot)
    5. Return tenant data for immediate login

POST /auth/login
  Body: { email, password }
  Response: { tenant: { id, email, subdomain, ... } }
  Flow:
    1. Validate credentials
    2. Check emailVerified = true
    3. Generate auth JWT
    4. Set HttpOnly cookie
    5. Return tenant data

POST /auth/forgot-password
  Body: { email }
  Response: { message: "If account exists, reset link sent" }
  Flow:
    1. Find tenant by email (silent if not found - security)
    2. Generate password_reset JWT (1h expiry)
    3. Send reset email via Brevo
    4. Return generic success message

POST /auth/reset-password
  Body: { token, newPassword }
  Response: { message: "Password reset successful" }
  Flow:
    1. Verify JWT token (type: password_reset)
    2. Validate password strength
    3. Hash new password (bcrypt)
    4. Update tenant.passwordHash
    5. Return success

POST /auth/set-subdomain
  Headers: Cookie: auth_token (HttpOnly)
  Body: { companyName: "Acme Corp" }
  Response: { tenant: { subdomain: "acme34" } }
  Flow:
    1. Authenticate via HttpOnly cookie
    2. Slugify company name → "acme34"
    3. Check uniqueness (add counter if exists)
    4. Update tenant: name, subdomain
    5. Generate new JWT with updated subdomain
    6. Set new HttpOnly cookie
    7. Return updated tenant

GET /auth/me
  Headers: Cookie: auth_token (HttpOnly)
  Response: { id, email, fullName, companyName, subdomain }
  Flow:
    1. Extract JWT from HttpOnly cookie
    2. Verify and decode token
    3. Fetch tenant from database
    4. Return user data (NO token in response)

POST /auth/logout
  Response: { message: "Logged out successfully" }
  Flow:
    1. Clear HttpOnly cookie (domain: .simplechat.bot)
    2. Return success
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
3. Receives verification email from noreply@simplechat.bot
4. Clicks verification link in email
5. VerifyEmailPage:
   a. Verifies token with backend
   b. Shows "Email Verified ✅" (2 seconds)
   c. Transitions to subdomain setup form (same page)
6. Enters company name ("Acme Corp")
7. Backend:
   a. Generates subdomain ("acme34")
   b. Updates tenant record
   c. Returns new subdomain
8. Redirected to acme34.simplechat.bot
9. Tenant dashboard loads ✅

Authentication State Management:
- Backend sets HttpOnly cookie on /verify-email
- Cookie domain: .simplechat.bot (shared across subdomains)
- Frontend uses AuthContext (React Context API)
- No JWT in localStorage (security best practice)
- ProtectedRoute checks auth via /auth/me endpoint
```

---

## 🔒 Security & Email Services

### HttpOnly Cookie Authentication

**Why HttpOnly Cookies (NOT localStorage)?**

```typescript
// ❌ WRONG: localStorage (vulnerable to XSS)
localStorage.setItem('token', jwt);

// ✅ CORRECT: HttpOnly cookie (XSS-proof)
res.cookie('auth_token', jwt, {
  httpOnly: true,        // JavaScript cannot access
  secure: true,          // HTTPS only
  sameSite: 'lax',       // CSRF protection
  domain: '.simplechat.bot', // Shared across subdomains
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
});
```

**Benefits:**
1. ✅ XSS Protection: JavaScript cannot read cookie
2. ✅ CSRF Protection: SameSite=lax prevents cross-site requests
3. ✅ Cross-subdomain: Works across login.simplechat.bot and acme34.simplechat.bot
4. ✅ Automatic: Browser sends cookie on every request
5. ✅ Industry Standard: OAuth providers use this pattern

### Email Service (Brevo)

**Configuration:**
```typescript
// backend/src/common/services/email.service.ts
import * as brevo from '@getbrevo/brevo';

class EmailService {
  private apiInstance: brevo.TransactionalEmailsApi;

  constructor() {
    this.apiInstance = new brevo.TransactionalEmailsApi();
    (this.apiInstance as any).authentications.apiKey.apiKey =
      process.env.BREVO_API_KEY;
  }

  async sendVerificationEmail(email: string, verificationUrl: string) {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = 'Verify Your SimpleChat Account';
    sendSmtpEmail.sender = {
      name: 'SimpleChat.Bot',
      email: 'noreply@simplechat.bot',
    };
    sendSmtpEmail.to = [{ email, name: email.split('@')[0] }];
    sendSmtpEmail.htmlContent = this.getVerificationEmailTemplate(verificationUrl);

    await this.apiInstance.sendTransacEmail(sendSmtpEmail);
  }
}
```

**Email Templates:**
- Verification Email: Professional HTML template with button + backup link
- Password Reset Email: Security notice, 1-hour expiry warning
- Design: Gradient header, mobile-responsive, modern UI

**Brevo Setup:**
1. Create account at brevo.com
2. Verify sender email (noreply@simplechat.bot)
3. Generate API key
4. Remove IP restrictions (Railway uses dynamic IPs)
5. Set BREVO_API_KEY in Railway environment

### Password Security

```typescript
// bcrypt with 12 rounds (industry standard)
import * as bcrypt from 'bcrypt';

// Hash password on registration
const hashedPassword = await bcrypt.hash(password, 12);

// Verify password on login
const isValid = await bcrypt.compare(password, tenant.passwordHash);
```

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- Enforced on both frontend and backend

### JWT Token Types

```typescript
// Email verification token (24h expiry)
jwt.sign({
  sub: tenant.id,
  email: tenant.email,
  type: 'email_verification'
}, secret, { expiresIn: '24h' });

// Password reset token (1h expiry)
jwt.sign({
  sub: tenant.id,
  email: tenant.email,
  type: 'password_reset'
}, secret, { expiresIn: '1h' });

// Auth token (7 days expiry, stored in HttpOnly cookie)
jwt.sign({
  sub: tenant.id,
  email: tenant.email,
  subdomain: tenant.subdomain,
  type: 'auth'
}, secret, { expiresIn: '7d' });
```

**Token Validation:**
- Always check `type` field to prevent token reuse
- Verify expiry before processing
- Use different secrets for different token types (future enhancement)

### CORS Configuration (Stats Backend)

```typescript
// stats/server.js
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5176',
    'https://stats.simplechat.bot',
    'https://login.simplechat.bot',
  ];

  const origin = req.headers.origin;

  // Wildcard subdomain pattern for tenant dashboards
  const subdomainPattern = /^https:\/\/[a-zA-Z0-9-]+\.simplechat\.bot$/;

  if (origin && (allowedOrigins.includes(origin) || subdomainPattern.test(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});
```

---

## 📚 Lessons Learned

### Problem 1: React State Update Timing

**Issue:** After email verification, user redirected to login instead of subdomain setup.

**Root Cause:**
```typescript
// ❌ WRONG: navigate() called before state updates
setUser(userData);  // Async state update
navigate('/setup-subdomain');  // State not updated yet!
```

**Solution:**
```typescript
// ✅ CORRECT: Use window.location for full page reload
window.location.href = '/setup-subdomain';
// Or return userData immediately and use it before navigation
const userData = await refetchUser();
if (userData) {
  navigate('/setup-subdomain');
}
```

**Lesson:** React state updates are asynchronous. For critical flows (auth, redirects), either:
1. Use returned values immediately
2. Use window.location for full page reload
3. Add loading states and wait for state updates

### Problem 2: localStorage Auth Check

**Issue:** ProtectedRoute checked localStorage but we use HttpOnly cookies.

**Root Cause:**
```typescript
// ❌ WRONG: Checking non-existent localStorage
const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
```

**Solution:**
```typescript
// ✅ CORRECT: Check AuthContext (which reads from cookie via /auth/me)
const { user, loading } = useAuth();
if (loading) return <LoadingSpinner />;
if (!user) return <Navigate to="/login" />;
```

**Lesson:** Always use consistent auth mechanism across app. If backend uses cookies, frontend should check via API endpoint, not localStorage.

### Problem 3: Brevo API 401 Errors

**Issue:** Brevo returned 401 Unauthorized despite correct API key.

**Root Cause:** Brevo "Authorized IPs" feature was enabled, but Railway uses dynamic IPs.

**Solution:** Remove IP restrictions in Brevo account settings.

**Lesson:** For services with dynamic IPs (Railway, Heroku, Vercel), disable IP whitelisting or use API key rotation strategies.

### Problem 4: Prisma Schema Field Mismatch

**Issue:** TypeScript error: `Property 'companyName' does not exist on type Tenant`.

**Root Cause:** Schema uses `name` field, code referenced `companyName`.

**Solution:**
```typescript
// ✅ CORRECT: Use schema field names
companyName: updatedTenant.name || ''  // name is the schema field
```

**Lesson:** Always reference actual Prisma schema fields. Generate Prisma Client after schema changes: `npx prisma generate`.

### Problem 5: Page Navigation UX

**Issue:** User complained about jerky page transitions during verification.

**Root Cause:** Separate pages for verification → subdomain setup caused visible navigation.

**Solution:** Combine into single page with state transitions:
```typescript
// VerifyEmailPage.tsx
{verified && !showSubdomainForm && <EmailVerifiedMessage />}
{showSubdomainForm && <SubdomainSetupForm />}
```

**Lesson:** For critical user flows, keep everything on one page with smooth transitions instead of navigating between pages. Better UX!

### Problem 6: Two schema.prisma Files

**Issue:** Updated packages/database/prisma/schema.prisma but backend uses backend/prisma/schema.prisma.

**Root Cause:** Monorepo has multiple Prisma instances.

**Solution:** Always update the correct schema file based on service location.

**Lesson:** In monorepos, verify which Prisma schema each service uses. Backend services typically have their own schema file.

---

## ❌ Legacy Issue: Logo & Assets Not Showing

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

## ✅ Phase 2: Completed (Multi-Bot Architecture + Database Isolation)

### Database Schema Changes

**Added `saas.chat_history` table (isolated from Photier's `public.chat_history`):**
```prisma
model ChatHistory {
  id Int @id @default(autoincrement())

  // Bot & Tenant Identification (CRITICAL for isolation)
  chatbotId String @map("chatbot_id") // bot_abc123
  tenantId  String @map("tenant_id") // UUID
  userId String @map("user_id") // W-Guest-xxx or P-Guest-xxx

  message String @db.Text
  from    String // 'user', 'admin', 'bot', 'agent'

  // Proper indexes for performance
  @@index([chatbotId, userId])
  @@index([chatbotId, createdAt])
  @@schema("saas")
}
```

**Key Principle:** Prisma uses `@map` directives to keep code readable (camelCase) while database uses snake_case matching N8N template conventions.

### N8N Workflow Cloning

**Updated `backend/src/n8n/n8n.service.ts`:**
- Changed schema from `'public'` to `'saas'`
- Added `chatbot_id` and `tenant_id` to all INSERT operations
- Added `chatbot_id` to WHERE clauses for SELECT/UPDATE/DELETE
- Dynamic webhook path: `/webhook/{chatId}` (e.g., `/webhook/bot_abc123`)
- Passes `tenantId` parameter for database isolation

**Each bot gets:**
- Unique N8N workflow cloned from template (BASIC or PREMIUM)
- Isolated database records (chatbot_id + tenant_id)
- Bot-specific configuration (Telegram, AI, widget settings)

### Widget Routing

**Updated `apps/widget/server.cjs`:**
- Dynamic webhook URL based on chatId
- New bots (chatId: `bot_xxx`) → `https://n8n.simplechat.bot/webhook/bot_xxx`
- Legacy bots (numeric chatId) → Fallback to `process.env.N8N_WEBHOOK_URL`
- Preserved chatId type (string vs int) to avoid parseInt("bot_xxx") → NaN

### Chatbot Model

```prisma
model Chatbot {
  id       String @id @default(uuid())
  tenantId String
  name   String // "Sales Bot", "Support Bot"
  type   BotType // BASIC | PREMIUM
  chatId String  @unique // bot_abc123
  status BotStatus // PENDING_PAYMENT, ACTIVE, PAUSED, DELETED

  // N8N Integration
  n8nWorkflowId   String? @unique
  webhookUrl      String? // https://n8n.../webhook/bot_{chatId}

  // Configuration
  config Json // Widget settings

  // Billing
  subscriptionId     String?
  subscriptionStatus String? // active, past_due, canceled
  trialEndsAt        DateTime?

  @@schema("saas")
}
```

### Key Files Changed

1. **`backend/prisma/schema.prisma`** - Added ChatHistory model with snake_case mapping
2. **`backend/src/n8n/n8n.service.ts`** - Dynamic workflow cloning with isolation
3. **`backend/src/chatbot/chatbot.service.ts`** - Passes tenantId to N8N service
4. **`apps/widget/server.cjs`** - Dynamic webhook routing per bot

### Lessons Learned

1. **Database Column Naming:** N8N templates use snake_case. Use Prisma `@map` directives instead of runtime conversion.
2. **chatId Type Preservation:** Keep string chatIds as strings (`bot_xxx`), don't parseInt them.
3. **Schema Isolation:** Separate `public` (Photier production) from `saas` (multi-tenant) at PostgreSQL schema level.
4. **Industry Standard:** Proper database isolation, not shared tables with soft filters.

---

## 🎯 Future Roadmap

### Phase 3: Multi-Bot per Tenant UI (Week 3-4)

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
