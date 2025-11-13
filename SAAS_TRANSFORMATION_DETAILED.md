# 🚀 Simple Chat Bot - SaaS Transformation Plan (DETAILED)

**Last Updated:** January 2025
**Status:** Phase 1 Completed (Auth & Registration)
**Timeline:** 12 weeks (3 months)

---

## 📊 Executive Summary

Transform the current single-tenant Simple Chat Bot system into a multi-tenant SaaS platform where customers can:
- Sign up and get their own dashboard subdomain (`company.simplechat.bot`)
- **Create unlimited chatbots** (both BASIC and PREMIUM types)
- Pay per bot (BASIC or PREMIUM) on-demand
- Each bot gets its own N8N workflow automatically
- Configure widget appearance, Telegram integration, and AI settings
- Embed chat widgets on their websites with simple code snippets

**Key Architecture Decisions:**
- ✅ **Multi-tenant shared infrastructure** (cost-effective)
- ✅ **Multi-bot per tenant** (1 tenant = multiple chatbots)
- ✅ **Single N8N instance** with per-chatbot workflow cloning
- ✅ **Wildcard subdomain routing** (`*.simplechat.bot` → single Railway service)
- ✅ **Pay-as-you-go bot creation** (no upfront commitment)
- ✅ **Hybrid Telegram bot approach** (managed bot OR custom bot)
- ✅ **Automatic provisioning** (N8N workflow created on bot purchase)

**Expected Metrics:**
- **100 customers:** $1,999/month revenue, $110/month costs = **94% profit margin**
- **1,000 customers:** $19,990/month revenue, $500/month costs = **97.5% profit margin**

---

## 💰 Business Model

### Pricing Tiers

| Feature | Basic Plan | Premium Plan |
|---------|-----------|--------------|
| **Price** | $9.99/month | $19.99/month |
| **Free Trial** | 14 days | 14 days |
| **Widget Type** | Normal (AI only) | Premium (AI + Live Support tabs) |
| **Messages/month** | 1,000 | Unlimited |
| **AI Responses** | ✅ Yes (N8N + RAG) | ✅ Yes |
| **Telegram Integration** | ❌ No | ✅ Yes (with topic management) |
| **Custom Branding** | ❌ No | ✅ Logo, colors, custom name |
| **Business Hours** | ❌ No | ✅ Auto-response outside hours |
| **Document Upload** | ❌ No | ✅ Knowledge base (PDF, DOCX) |
| **Analytics** | Basic stats | Advanced analytics |
| **Support** | Email | Priority email + chat |
| **Subdomain** | ✅ Yes | ✅ Yes |

### User Journey

```
1. Visitor lands on marketing site
   ↓
2. Clicks "Start Free Trial" → Selects plan (Basic/Premium)
   ↓
3. Registration options:
   Option A: Email/Password
   - Company name (e.g., "Photier")
   - Email
   - Password

   Option B: Google Login (One-Click)
   - "Continue with Google" button
   - OAuth popup → Google authentication
   - Auto-fill company name from Google account
   ↓
4. Auto-provisioning (2-3 seconds):
   - Generate subdomain: photier.simplechat.bot
   - Clone N8N workflow from template
   - Create database tenant record
   - Generate chatId: tenant_abc123
   ↓
5. Redirected to dashboard (photier.simplechat.bot)
   ↓
6. Onboarding wizard:
   - Set website URL
   - Configure widget appearance (colors, text)
   - [Premium] Setup Telegram integration
   - [Premium] Upload knowledge base documents
   ↓
7. Copy embed code
   ↓
8. Paste on website → Widget goes live! ✅
   ↓
9. 14-day trial starts → Stripe subscription created
   ↓
10. Day 14: Trial ends → First charge ($9.99 or $19.99)
```

---

## 🏗️ Architecture Overview

### Current System (Single-Tenant)
```
┌─────────────────────────────────────────┐
│   Production (chat.simplechat.bot)      │
├─────────────────────────────────────────┤
│  • Widget Server (Express + Socket.io)  │
│  • Stats Backend (Express + Socket.io)  │
│  • Dashboard (React SPA)                │
│  • N8N (single workflow)                │
│  • PostgreSQL                           │
└─────────────────────────────────────────┘
```

### Target System (Multi-Tenant SaaS)
```
┌─────────────────────────────────────────────────────────────┐
│   Shared Infrastructure (Railway)                           │
├─────────────────────────────────────────────────────────────┤
│  Widget Server (*.simplechat.bot, *.w.simplechat.bot, *.p.simplechat.bot) │
│  ├─ Tenant detection (subdomain → tenantId)                │
│  ├─ Dynamic N8N webhook routing (per tenant)               │
│  └─ Dynamic CORS (per tenant's allowed domains)            │
│                                                             │
│  Stats Backend (stats-production.railway.app)              │
│  ├─ Multi-tenant data filtering                            │
│  ├─ Socket.io with tenant rooms                            │
│  └─ Per-tenant analytics                                    │
│                                                             │
│  Dashboard (*.simplechat.bot)                               │
│  ├─ Next.js 14 multi-tenant customer portal                │
│  ├─ Tenant context from subdomain                          │
│  └─ Settings, billing, analytics                           │
│                                                             │
│  Backend API (NestJS)                                       │
│  ├─ Auth (JWT)                                              │
│  ├─ Tenant management                                       │
│  ├─ N8N workflow cloning service                           │
│  ├─ Stripe integration                                      │
│  └─ Telegram topic management                              │
│                                                             │
│  N8N (n8n.simplechat.bot)                                   │
│  ├─ Master templates (basic, premium)                      │
│  ├─ Per-tenant cloned workflows                            │
│  └─ Webhook routing: /webhook/tenant_{id}                  │
│                                                             │
│  PostgreSQL (Railway managed)                               │
│  ├─ tenants, widget_configs, integrations                  │
│  ├─ messages, users, sessions (tenant-scoped)              │
│  ├─ tenant_workflows (N8N mapping)                         │
│  └─ telegram_topics (per-tenant topic management)          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Core Multi-Tenant Tables

```sql
-- =====================================================
-- TENANTS (Core SaaS table)
-- =====================================================
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Account Info
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- Nullable for OAuth users
  full_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  country VARCHAR(2), -- ISO country code

  -- OAuth Integration
  auth_provider VARCHAR(20) DEFAULT 'email', -- 'email', 'google'
  google_id VARCHAR(255) UNIQUE, -- Google user ID
  google_refresh_token VARCHAR(500), -- For token refresh
  avatar_url VARCHAR(500), -- Profile picture from OAuth

  -- Subdomain (auto-generated from company_name)
  subdomain VARCHAR(100) UNIQUE NOT NULL, -- 'photier'

  -- Unique identifier for widgets/webhooks
  chat_id VARCHAR(100) UNIQUE NOT NULL, -- 'tenant_abc123'

  -- Subscription
  plan VARCHAR(20) NOT NULL, -- 'basic', 'premium'
  subscription_status VARCHAR(20) NOT NULL DEFAULT 'trialing',
    -- 'trialing', 'active', 'past_due', 'canceled', 'paused'
  trial_ends_at TIMESTAMP,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,

  -- Stripe Integration
  stripe_customer_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255) UNIQUE,

  -- Account Status
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenants_chat_id ON tenants(chat_id);
CREATE INDEX idx_tenants_stripe_customer ON tenants(stripe_customer_id);

-- =====================================================
-- TENANT WORKFLOWS (N8N Integration)
-- =====================================================
CREATE TABLE tenant_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- N8N Workflow Info
  n8n_workflow_id VARCHAR(255) UNIQUE NOT NULL,
  n8n_workflow_name VARCHAR(255) NOT NULL,
  webhook_url VARCHAR(500) NOT NULL, -- https://n8n.../webhook/tenant_{id}

  -- Configuration
  plan VARCHAR(20) NOT NULL, -- 'basic' or 'premium'
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  cloned_from_template_id VARCHAR(255), -- Original template ID
  last_executed_at TIMESTAMP,
  execution_count INT DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workflows_tenant ON tenant_workflows(tenant_id);
CREATE INDEX idx_workflows_n8n_id ON tenant_workflows(n8n_workflow_id);

-- =====================================================
-- WIDGET CONFIGURATIONS
-- =====================================================
CREATE TABLE widget_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Website Configuration
  website_url VARCHAR(500) NOT NULL,
  allowed_origins TEXT[] DEFAULT '{}', -- Array of allowed domains

  -- Widget Appearance
  widget_title VARCHAR(255) DEFAULT 'Chat with us',
  intro_message TEXT DEFAULT 'Hello! How can I help you today?',
  placeholder VARCHAR(255) DEFAULT 'Type your message...',
  primary_color VARCHAR(7) DEFAULT '#4c86f0', -- Hex color
  position VARCHAR(20) DEFAULT 'bottom-right',
    -- 'bottom-right', 'bottom-left', 'top-right', 'top-left'

  -- Dimensions
  desktop_height INT DEFAULT 600,
  desktop_width INT DEFAULT 380,
  mobile_height INT DEFAULT NULL, -- NULL = fullscreen

  -- Branding (Premium only)
  logo_url VARCHAR(500),
  company_display_name VARCHAR(255),
  show_powered_by BOOLEAN DEFAULT true,

  -- Behavior
  auto_open_after_seconds INT DEFAULT NULL, -- NULL = never auto-open
  show_launcher BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(tenant_id) -- One config per tenant
);

-- =====================================================
-- INTEGRATIONS (Telegram, etc.)
-- =====================================================
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Telegram Configuration (Premium only)
  telegram_mode VARCHAR(20) DEFAULT 'managed',
    -- 'managed' (our bot) or 'custom' (their bot)
  telegram_group_id VARCHAR(255),
  telegram_bot_token VARCHAR(255), -- Only for 'custom' mode
  uses_shared_bot BOOLEAN DEFAULT false, -- true if using our @SimpleChatSupportBot

  -- Business Hours (Premium only)
  business_hours_enabled BOOLEAN DEFAULT false,
  timezone VARCHAR(50) DEFAULT 'UTC', -- IANA timezone (Europe/Istanbul)
  business_days TEXT[] DEFAULT '{}', -- ['monday', 'tuesday', ...]
  start_time TIME, -- 09:00:00
  end_time TIME,   -- 18:00:00
  out_of_hours_message TEXT DEFAULT 'We are currently offline. We will respond as soon as possible.',

  -- Other Integrations (future)
  slack_webhook_url VARCHAR(500),
  discord_webhook_url VARCHAR(500),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(tenant_id)
);

-- =====================================================
-- TELEGRAM TOPICS (Per-user topic management)
-- =====================================================
CREATE TABLE telegram_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- User Identification
  user_id VARCHAR(255) NOT NULL, -- W-Guest-xxx or P-Guest-xxx

  -- Telegram Topic Info
  topic_id INT NOT NULL, -- Telegram message_thread_id
  topic_name VARCHAR(255) NOT NULL, -- "Customer W-Guest-abc123"

  -- Metadata
  is_archived BOOLEAN DEFAULT false,
  last_message_at TIMESTAMP DEFAULT NOW(),
  message_count INT DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(tenant_id, user_id)
);

CREATE INDEX idx_telegram_topics_lookup ON telegram_topics(tenant_id, user_id);
CREATE INDEX idx_telegram_topics_active ON telegram_topics(tenant_id, is_archived, last_message_at DESC);

-- =====================================================
-- AI CONFIGURATIONS (Premium)
-- =====================================================
CREATE TABLE ai_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- AI Behavior
  ai_instructions TEXT DEFAULT 'You are a helpful customer support assistant.',
  ai_model VARCHAR(50) DEFAULT 'gpt-4o', -- Model name
  ai_temperature DECIMAL(2,1) DEFAULT 0.7, -- 0.0 - 1.0
  ai_max_tokens INT DEFAULT 500,

  -- Knowledge Base (RAG)
  documents JSONB DEFAULT '[]',
    -- [{ name: "FAQ.pdf", url: "...", uploadedAt: "...", vectorized: true }]
  qdrant_collection_name VARCHAR(255), -- tenant_{chat_id}

  -- Website Crawling (future)
  website_crawl_enabled BOOLEAN DEFAULT false,
  last_crawl_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(tenant_id)
);

-- =====================================================
-- MESSAGES (Tenant-scoped)
-- =====================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- User Info
  user_id VARCHAR(255) NOT NULL,

  -- Message Content
  text TEXT NOT NULL,
  from_user VARCHAR(50) NOT NULL, -- 'visitor', 'bot', 'agent'
  human_mode BOOLEAN DEFAULT false, -- false = AI, true = Live Support

  -- Metadata
  country VARCHAR(100),
  city VARCHAR(100),
  ip_address INET, -- For analytics

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_tenant_user ON messages(tenant_id, user_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_tenant_created ON messages(tenant_id, created_at DESC);

-- =====================================================
-- USERS (Tenant-scoped visitors)
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- User Identification
  user_id VARCHAR(255) NOT NULL, -- W-Guest-xxx or P-Guest-xxx

  -- User Info (collected over time)
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),

  -- Location
  country VARCHAR(100),
  city VARCHAR(100),

  -- Activity
  last_active TIMESTAMP DEFAULT NOW(),
  total_messages INT DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(tenant_id, user_id)
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_last_active ON users(tenant_id, last_active DESC);

-- =====================================================
-- WIDGET OPENS (Analytics)
-- =====================================================
CREATE TABLE widget_opens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  user_id VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  city VARCHAR(100),
  host VARCHAR(500), -- Website domain where widget opened
  referrer VARCHAR(500),

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_widget_opens_tenant ON widget_opens(tenant_id, created_at DESC);

-- =====================================================
-- USAGE STATS (Billing & Limits)
-- =====================================================
CREATE TABLE usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  month DATE NOT NULL, -- '2025-01-01'

  -- Metrics
  message_count INT DEFAULT 0,
  ai_message_count INT DEFAULT 0,
  human_message_count INT DEFAULT 0,
  user_count INT DEFAULT 0,
  widget_opens INT DEFAULT 0,

  -- Cost Tracking (future)
  ai_tokens_used INT DEFAULT 0,
  estimated_cost_usd DECIMAL(10,2) DEFAULT 0.00,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(tenant_id, month)
);

-- =====================================================
-- AUDIT LOGS (Security & Compliance)
-- =====================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,

  -- Event Info
  event_type VARCHAR(100) NOT NULL,
    -- 'login', 'logout', 'config_updated', 'subscription_changed', etc.
  user_email VARCHAR(255), -- Who performed the action
  ip_address INET,
  user_agent TEXT,

  -- Details
  description TEXT,
  metadata JSONB DEFAULT '{}', -- Additional context

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_tenant ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_event ON audit_logs(event_type, created_at DESC);
```

---

## ✅ Implementation Status

### **Phase 1: Tenant Dashboard & Authentication (COMPLETED)**

**Implemented:** January 2025

#### What Was Built:

1. **Tenant Dashboard Application**
   - Location: `/apps/tenant-dashboard`
   - Tech Stack: React 19 + Vite 7 + TypeScript + Tailwind CSS
   - Deployed: `login.simplechat.bot` (Railway)
   - Features:
     - Tab-based login/registration UI
     - Subdomain setup wizard
     - JWT authentication with localStorage
     - Auto-login after registration
     - Wildcard subdomain redirects

2. **Simplified Registration Flow**
   - **Step 1:** User visits `login.simplechat.bot`
   - **Step 2:** Enters email + password (no extra fields)
   - **Step 3:** Auto-login with JWT token
   - **Step 4:** Redirected to subdomain setup page
   - **Step 5:** Enters company name → subdomain generated
   - **Step 6:** Redirected to `{subdomain}.simplechat.bot`

3. **Backend Authentication API**
   - `POST /auth/register` - Email/password registration
   - `POST /auth/login` - Login with credentials
   - `POST /auth/set-subdomain` - Set tenant subdomain
   - `GET /auth/me` - Get current user
   - Auto-verification (bypasses email verification for now)
   - Temporary subdomain pattern (`temp_xxx`)
   - JWT token generation for auto-login

4. **Database Changes**
   - `fullName`, `phone`, `country` made optional in `tenants` table
   - `emailVerified` set to `true` on registration
   - Temporary subdomain stored as `temp_{nanoid(10)}`
   - Real subdomain set during subdomain setup

5. **Frontend Features**
   - LoginPage: Tab system (Sign In / Sign Up)
   - SetupSubdomainPage: Company name → subdomain generator
   - AuthContext: Global auth state with refetchUser()
   - Protected routes: Requires authentication
   - Auto-redirect logic for temp subdomains

6. **Railway Deployment**
   - Service: `tenant-dashboard`
   - Domain: `login.simplechat.bot`
   - Wildcard Support: `*.simplechat.bot` (in progress)
   - Build: Vite + serve static files
   - Port: Dynamic (Railway's PORT env var)
   - Environment Variables:
     - `VITE_API_URL`: Backend API URL
     - `PORT`: Server port

7. **Cloudflare DNS**
   - `login.simplechat.bot` → CNAME → Railway service
   - `*.simplechat.bot` → Wildcard CNAME (configured)

#### Current Issue:

After login, the redirect to tenant subdomain (`window.location.href = https://${subdomain}.simplechat.bot`) doesn't work because Railway needs the wildcard domain (`*.simplechat.bot`) added to the tenant-dashboard service in Railway settings.

#### Git Commits (Phase 1):

```
feat: Simplify registration - email+password only
feat: Add tab-based login/register UI
fix: Update auth service to return token on registration
fix: Add refetchUser call after subdomain setup
fix: Make /setup-subdomain protected route
fix: Set emailVerified true on registration
feat: Implement wildcard subdomain redirects
fix: Remove unused imports for TypeScript build
```

---

## 📋 Implementation Phases

### **Phase 1: Foundation - Auth & Multi-Tenant Database** (Week 1-2)
**Status:** ✅ Completed (Simplified Version)

**Goal:** Core authentication and tenant management system.

#### Tasks:

1. **Database Setup**
   - ✅ Create Prisma schema from SQL above
   - ✅ Run migrations on Railway PostgreSQL
   - ✅ Seed with test tenants

2. **Backend API (NestJS)**
   ```typescript
   // Auth Module
   - POST /auth/register              // Email/password registration
   - POST /auth/login                 // Email/password login
   - GET  /auth/google                // Google OAuth redirect
   - GET  /auth/google/callback       // Google OAuth callback
   - POST /auth/logout
   - GET  /auth/me
   - POST /auth/verify-email
   - POST /auth/forgot-password
   - POST /auth/reset-password

   // Tenant Management
   - GET    /tenants/:id
   - PUT    /tenants/:id
   - DELETE /tenants/:id (soft delete)
   ```

3. **Tenant Middleware**
   ```typescript
   // backend/src/middleware/tenant.middleware.ts
   export class TenantMiddleware implements NestMiddleware {
     use(req: Request, res: Response, next: NextFunction) {
       // Extract tenant from:
       // 1. Subdomain (req.headers.host)
       // 2. chatId query param
       // 3. JWT token (for dashboard)

       const host = req.headers.host; // photier.simplechat.bot
       const subdomain = host.split('.')[0]; // photier

       const tenant = await this.tenantService.findBySubdomain(subdomain);
       if (!tenant) {
         throw new UnauthorizedException('Invalid tenant');
       }

       req.tenant = tenant; // Attach to request
       next();
     }
   }
   ```

4. **Subdomain Generation**
   ```typescript
   // backend/src/services/tenant.service.ts
   async generateSubdomain(companyName: string): Promise<string> {
     // "Photier Inc." → "photier-inc"
     let subdomain = slugify(companyName, {
       lower: true,
       strict: true,
       remove: /[*+~.()'"!:@]/g
     });

     // Ensure uniqueness
     let counter = 1;
     let originalSubdomain = subdomain;

     while (await this.tenantExists(subdomain)) {
       subdomain = `${originalSubdomain}${counter}`;
       counter++;
     }

     // Validate (alphanumeric + hyphens only, 3-63 chars)
     if (!/^[a-z0-9-]{3,63}$/.test(subdomain)) {
       throw new BadRequestException('Invalid subdomain format');
     }

     return subdomain;
   }
   ```

5. **Google OAuth Setup**
   ```typescript
   // backend/src/auth/strategies/google.strategy.ts
   import { PassportStrategy } from '@nestjs/passport';
   import { Strategy, VerifyCallback } from 'passport-google-oauth20';

   @Injectable()
   export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
     constructor(private authService: AuthService) {
       super({
         clientID: process.env.GOOGLE_CLIENT_ID,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
         callbackURL: process.env.GOOGLE_CALLBACK_URL,
         scope: ['email', 'profile'],
       });
     }

     async validate(
       accessToken: string,
       refreshToken: string,
       profile: any,
       done: VerifyCallback
     ): Promise<any> {
       const { id, name, emails, photos } = profile;

       // Check if user exists
       let tenant = await this.authService.findByGoogleId(id);

       if (!tenant) {
         // Create new tenant with Google account
         tenant = await this.authService.createFromGoogle({
           googleId: id,
           email: emails[0].value,
           fullName: `${name.givenName} ${name.familyName}`,
           avatarUrl: photos[0]?.value,
           googleRefreshToken: refreshToken,
         });
       }

       done(null, tenant);
     }
   }
   ```

6. **Registration Flow (Email/Password)**
   ```typescript
   // POST /auth/register
   async register(dto: RegisterDto) {
     // 1. Validate email uniqueness
     if (await this.tenantExists(dto.email)) {
       throw new ConflictException('Email already exists');
     }

     // 2. Generate subdomain
     const subdomain = await this.generateSubdomain(dto.companyName);

     // 3. Generate chatId
     const chatId = `tenant_${nanoid(10)}`;

     // 4. Hash password
     const passwordHash = await bcrypt.hash(dto.password, 12);

     // 5. Create tenant
     const tenant = await this.prisma.tenant.create({
       data: {
         email: dto.email,
         password_hash: passwordHash,
         full_name: dto.fullName,
         company_name: dto.companyName,
         subdomain: subdomain,
         chat_id: chatId,
         plan: dto.plan,
         auth_provider: 'email',
         subscription_status: 'trialing',
         trial_ends_at: add(new Date(), { days: 14 })
       }
     });

     // 6. Create default configs
     await Promise.all([
       this.createDefaultWidgetConfig(tenant.id),
       this.createDefaultAIConfig(tenant.id),
       dto.plan === 'premium' && this.createDefaultIntegration(tenant.id)
     ]);

     // 7. Send verification email
     await this.emailService.sendVerificationEmail(tenant.email);

     // 8. Generate JWT
     const token = this.jwtService.sign({
       sub: tenant.id,
       email: tenant.email
     });

     return {
       token,
       tenant: {
         id: tenant.id,
         subdomain: tenant.subdomain,
         urls: {
           dashboard: `https://${subdomain}.simplechat.bot`,
           widget: `https://${subdomain}.w.simplechat.bot`,
           widgetPremium: dto.plan === 'premium'
             ? `https://${subdomain}.p.simplechat.bot`
             : null
         }
       }
     };
   }
   ```

7. **Google OAuth Registration Flow**
   ```typescript
   // backend/src/auth/auth.service.ts
   async createFromGoogle(googleData: {
     googleId: string;
     email: string;
     fullName: string;
     avatarUrl?: string;
     googleRefreshToken?: string;
   }) {
     // 1. Check if email already exists with different provider
     const existingTenant = await this.prisma.tenant.findUnique({
       where: { email: googleData.email }
     });

     if (existingTenant && existingTenant.authProvider !== 'google') {
       throw new ConflictException(
         'Email already registered with email/password. Please login with password.'
       );
     }

     // 2. Generate subdomain from name
     const companyName = googleData.fullName.split(' ')[0]; // Use first name as default
     const subdomain = await this.generateSubdomain(companyName);

     // 3. Generate chatId
     const chatId = `tenant_${nanoid(10)}`;

     // 4. Create tenant (no password required)
     const tenant = await this.prisma.tenant.create({
       data: {
         email: googleData.email,
         full_name: googleData.fullName,
         company_name: companyName, // User can update later
         subdomain,
         chat_id: chatId,
         plan: 'basic', // Default to basic, can upgrade
         auth_provider: 'google',
         google_id: googleData.googleId,
         google_refresh_token: googleData.googleRefreshToken,
         avatar_url: googleData.avatarUrl,
         email_verified: true, // Google emails are pre-verified
         subscription_status: 'trialing',
         trial_ends_at: add(new Date(), { days: 14 })
       }
     });

     // 5. Create default configs
     await Promise.all([
       this.createDefaultWidgetConfig(tenant.id),
       this.createDefaultAIConfig(tenant.id)
     ]);

     // 6. Generate JWT
     const token = this.jwtService.sign({
       sub: tenant.id,
       email: tenant.email
     });

     return {
       token,
       tenant,
       isNewUser: true
     };
   }

   // GET /auth/google (redirect to Google)
   @Get('google')
   @UseGuards(AuthGuard('google'))
   googleAuth() {
     // Guard redirects to Google OAuth
   }

   // GET /auth/google/callback (Google redirects here)
   @Get('google/callback')
   @UseGuards(AuthGuard('google'))
   async googleAuthCallback(@Req() req, @Res() res) {
     const { token, tenant, isNewUser } = req.user;

     // Redirect to dashboard with token
     const redirectUrl = isNewUser
       ? `https://${tenant.subdomain}.simplechat.bot/onboarding?token=${token}`
       : `https://${tenant.subdomain}.simplechat.bot?token=${token}`;

     res.redirect(redirectUrl);
   }
   ```

8. **Environment Variables (Google OAuth)**
   ```env
   # Add to Railway backend service
   GOOGLE_CLIENT_ID=123456789-abc123xyz.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxx
   GOOGLE_CALLBACK_URL=https://backend.simplechat.bot/auth/google/callback
   ```

**Google Cloud Console Setup:**
- Go to: https://console.cloud.google.com
- Create project: "Simple Chat Bot SaaS"
- Enable Google+ API
- Create OAuth 2.0 credentials
- Authorized redirect URIs: `https://backend.simplechat.bot/auth/google/callback`
- Copy Client ID and Client Secret

---

### **Phase 2: N8N Template Cloning System** (Week 3-4)

**Goal:** Automatic N8N workflow provisioning per tenant.

#### Prerequisites:
- N8N instance running at `n8n.simplechat.bot`
- N8N API access token
- Master templates created (basic & premium)

#### Tasks:

1. **Setup N8N API Credentials**
   ```bash
   # Railway environment variables
   N8N_API_TOKEN=your_n8n_api_token
   N8N_BASE_URL=https://n8n.simplechat.bot
   N8N_BASIC_TEMPLATE_ID=1
   N8N_PREMIUM_TEMPLATE_ID=2
   ```

2. **Create N8N Service**
   ```typescript
   // backend/src/services/n8n.service.ts
   import axios from 'axios';

   @Injectable()
   export class N8NService {
     private api = axios.create({
       baseURL: process.env.N8N_BASE_URL,
       headers: {
         'X-N8N-API-KEY': process.env.N8N_API_TOKEN
       }
     });

     async cloneWorkflow(tenantId: string, plan: 'basic' | 'premium') {
       // 1. Select template
       const templateId = plan === 'premium'
         ? process.env.N8N_PREMIUM_TEMPLATE_ID
         : process.env.N8N_BASIC_TEMPLATE_ID;

       // 2. Clone workflow via N8N API
       const { data: workflow } = await this.api.post(
         `/workflows/${templateId}/duplicate`,
         {
           name: `Tenant ${tenantId} - ${plan}`
         }
       );

       // 3. Update webhook URL in cloned workflow
       const updatedNodes = workflow.nodes.map(node => {
         if (node.type === 'n8n-nodes-base.webhook') {
           return {
             ...node,
             parameters: {
               ...node.parameters,
               path: `tenant_${tenantId}`
             }
           };
         }
         return node;
       });

       await this.api.patch(`/workflows/${workflow.id}`, {
         nodes: updatedNodes
       });

       // 4. Activate workflow
       await this.api.patch(`/workflows/${workflow.id}`, {
         active: true
       });

       // 5. Generate webhook URL
       const webhookUrl = `${process.env.N8N_BASE_URL}/webhook/tenant_${tenantId}`;

       // 6. Store in database
       const tenantWorkflow = await this.prisma.tenantWorkflow.create({
         data: {
           tenant_id: tenantId,
           n8n_workflow_id: workflow.id,
           n8n_workflow_name: workflow.name,
           webhook_url: webhookUrl,
           plan: plan,
           cloned_from_template_id: templateId,
           is_active: true
         }
       });

       return tenantWorkflow;
     }

     async deleteWorkflow(tenantId: string) {
       const workflow = await this.prisma.tenantWorkflow.findUnique({
         where: { tenant_id: tenantId }
       });

       if (workflow) {
         // Delete from N8N
         await this.api.delete(`/workflows/${workflow.n8n_workflow_id}`);

         // Delete from database
         await this.prisma.tenantWorkflow.delete({
           where: { tenant_id: tenantId }
         });
       }
     }

     async updateWorkflowConfig(tenantId: string, config: any) {
       const workflow = await this.prisma.tenantWorkflow.findUnique({
         where: { tenant_id: tenantId }
       });

       // Update workflow variables via N8N API
       await this.api.patch(`/workflows/${workflow.n8n_workflow_id}`, {
         settings: config
       });
     }
   }
   ```

3. **Auto-Provision on Signup**
   ```typescript
   // Modify registration flow
   async register(dto: RegisterDto) {
     // ... existing tenant creation code ...

     // 7. Clone N8N workflow
     const workflow = await this.n8nService.cloneWorkflow(
       tenant.id,
       dto.plan
     );

     // ... rest of registration ...
   }
   ```

4. **Update Widget Servers for Dynamic Webhooks**
   ```javascript
   // apps/widget/server.cjs

   // REMOVE hardcoded webhook URL
   // const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

   // ADD dynamic webhook lookup
   async function getN8NWebhookUrl(chatId) {
     // Extract tenant_id from chatId
     const tenantId = chatId.split('_')[1];

     // Query database for webhook URL
     const result = await pool.query(
       'SELECT webhook_url FROM tenant_workflows WHERE tenant_id = $1',
       [tenantId]
     );

     if (!result.rows.length) {
       throw new Error('Tenant workflow not found');
     }

     return result.rows[0].webhook_url;
   }

   // Update message handler
   socket.on('message', async function (msg) {
     const chatId = msg.chatId;
     const n8nWebhookUrl = await getN8NWebhookUrl(chatId);

     // Send to tenant-specific N8N webhook
     request.post(n8nWebhookUrl, {
       json: {
         userId: msg.userId,
         chatId: chatId,
         message: msg.text,
         // ... rest
       }
     });
   });
   ```

5. **N8N Workflow Structure**
   ```
   Master Template (Basic):
   ┌─────────────────────────────────────┐
   │ 1. Webhook Trigger                  │
   │    Path: /webhook/tenant_{id}       │
   ├─────────────────────────────────────┤
   │ 2. Extract Tenant Config            │
   │    HTTP Request:                    │
   │    GET /api/tenants/{chatId}/config │
   ├─────────────────────────────────────┤
   │ 3. Qdrant RAG Search                │
   │    Collection: tenant_{chatId}      │
   ├─────────────────────────────────────┤
   │ 4. OpenAI Chat                      │
   │    System: {{config.aiInstructions}}│
   ├─────────────────────────────────────┤
   │ 5. Save to Database                 │
   │    INSERT INTO messages             │
   ├─────────────────────────────────────┤
   │ 6. Send Response                    │
   │    HTTP POST /send-to-user          │
   └─────────────────────────────────────┘
   ```

---

### **Phase 3: Automatic Subdomain System** (Week 5-6)

**Goal:** Dynamic subdomain routing and tenant detection.

#### DNS Configuration (Cloudflare):

```
Type    Name                       Value                           TTL
────────────────────────────────────────────────────────────────────
CNAME   *.simplechat.bot          widget-production.railway.app   Auto
CNAME   *.w.simplechat.bot     widget-production.railway.app   Auto
CNAME   *.p.simplechat.bot  widget-premium-production.railway.app Auto
```

**Result:**
- `photier.simplechat.bot` → Dashboard (widget-production service)
- `photier.w.simplechat.bot` → Normal Widget
- `photier.p.simplechat.bot` → Premium Widget

#### Tasks:

1. **Railway Service Configuration**
   - Single widget service handles ALL subdomains
   - Use Railway's wildcard domain feature
   - Extract subdomain from `req.headers.host`

2. **Tenant Detection Middleware (Widget Server)**
   ```javascript
   // apps/widget/server.cjs

   async function getTenantFromHost(host) {
     // host = "photier.w.simplechat.bot"
     const parts = host.split('.');

     // Extract subdomain
     let subdomain;
     if (host.includes('.w.simplechat.bot')) {
       subdomain = parts[0].replace('-chat', ''); // photier
     } else if (host.includes('.p.simplechat.bot')) {
       subdomain = parts[0].replace('-premium', '');
     } else {
       subdomain = parts[0]; // Dashboard
     }

     // Query database
     const result = await pool.query(
       'SELECT * FROM tenants WHERE subdomain = $1',
       [subdomain]
     );

     if (!result.rows.length) {
       throw new Error('Tenant not found');
     }

     return result.rows[0];
   }

   // Use in routes
   app.get('/config', async (req, res) => {
     try {
       const tenant = await getTenantFromHost(req.headers.host);

       // Fetch widget config
       const config = await getWidgetConfig(tenant.id);

       res.json({
         chatId: tenant.chat_id,
         title: config.widget_title,
         introMessage: config.intro_message,
         primaryColor: config.primary_color,
         // ... rest
       });
     } catch (err) {
       res.status(404).json({ error: 'Tenant not found' });
     }
   });
   ```

3. **Dynamic CORS Configuration**
   ```javascript
   // stats/server.js

   // REPLACE hardcoded CORS
   const io = new Server(server, {
     cors: {
       origin: async function (origin, callback) {
         if (!origin) return callback(null, true);

         // Extract subdomain
         const url = new URL(origin);
         const parts = url.hostname.split('.');
         const subdomain = parts[0].replace('-chat', '').replace('-premium', '');

         // Check if tenant exists
         const result = await pool.query(
           'SELECT id FROM tenants WHERE subdomain = $1',
           [subdomain]
         );

         if (result.rows.length > 0) {
           callback(null, true); // Allow
         } else {
           callback(new Error('Not allowed by CORS'));
         }
       },
       methods: ['GET', 'POST'],
       credentials: true
     }
   });
   ```

4. **Embed Code Generator API**
   ```typescript
   // backend/src/controllers/embed.controller.ts

   @Get('/embed-code')
   @UseGuards(JwtAuthGuard)
   async getEmbedCode(@CurrentUser() user: Tenant) {
     const tenant = user;
     const config = await this.widgetService.getConfig(tenant.id);

     const embedCode = `
   <script>
   (function() {
     window.simpleChatConfig = {
       chatId: "${tenant.chat_id}",
       host: "https://${tenant.subdomain}.w.simplechat.bot",
       titleOpen: "${config.widget_title}",
       introMessage: "${config.intro_message}",
       mainColor: "${config.primary_color}",
       desktopHeight: ${config.desktop_height},
       desktopWidth: ${config.desktop_width}
     };

     var css = document.createElement('link');
     css.rel = 'stylesheet';
     css.href = window.simpleChatConfig.host + '/css/simple-chat.css?v=' + Date.now();
     document.head.appendChild(css);

     var js = document.createElement('script');
     js.src = window.simpleChatConfig.host + '/js/simple-chat.min.js?v=' + Date.now();
     js.async = true;
     document.body.appendChild(js);
   })();
   </script>`;

     return {
       embedCode: embedCode.trim(),
       testUrl: `https://${tenant.subdomain}.w.simplechat.bot`
     };
   }
   ```

5. **Tenant Config API**
   ```typescript
   // GET /api/tenants/:chatId/config (used by N8N)
   async getTenantConfig(chatId: string) {
     const tenant = await this.prisma.tenant.findUnique({
       where: { chat_id: chatId },
       include: {
         widget_config: true,
         ai_config: true,
         integration: true
       }
     });

     if (!tenant) {
       throw new NotFoundException('Tenant not found');
     }

     return {
       chatId: tenant.chat_id,
       plan: tenant.plan,
       aiInstructions: tenant.ai_config?.ai_instructions,
       aiTemperature: tenant.ai_config?.ai_temperature,
       telegramBotToken: tenant.integration?.telegram_bot_token,
       telegramGroupId: tenant.integration?.telegram_group_id,
       telegramMode: tenant.integration?.telegram_mode,
       qdrantCollection: `tenant_${tenant.chat_id}`
     };
   }
   ```

---

### **Phase 4: Telegram Topic Management** (Week 7)

**Goal:** Automatic topic creation with hybrid bot approach.

#### Architecture:

```
Customer Chooses:
┌────────────────────────────────────────┐
│ Quick Setup (Managed)                  │
│ → Uses @SimpleChatSupportBot           │
│ → Just needs group ID                  │
│ → We manage everything                 │
└────────────────────────────────────────┘

OR

┌────────────────────────────────────────┐
│ Advanced Setup (Custom)                │
│ → Customer creates bot via BotFather   │
│ → Provides bot token                   │
│ → Full control & branding              │
└────────────────────────────────────────┘
```

#### Tasks:

1. **Setup Managed Bot**
   - Create @SimpleChatSupportBot via BotFather
   - Store token in Railway env: `SIMPLECHAT_BOT_TOKEN`
   - Documentation for customers

2. **Telegram Service**
   ```typescript
   // backend/src/services/telegram.service.ts

   @Injectable()
   export class TelegramService {
     async createTopic(tenantId: string, userId: string) {
       const integration = await this.prisma.integration.findUnique({
         where: { tenant_id: tenantId }
       });

       if (!integration) {
         throw new Error('Telegram not configured');
       }

       // Select bot token
       const botToken = integration.telegram_mode === 'managed'
         ? process.env.SIMPLECHAT_BOT_TOKEN
         : integration.telegram_bot_token;

       // Create forum topic via Telegram API
       const response = await axios.post(
         `https://api.telegram.org/bot${botToken}/createForumTopic`,
         {
           chat_id: integration.telegram_group_id,
           name: `Customer ${userId}`,
           icon_color: 0x6FB9F0 // Blue
         }
       );

       const topicId = response.data.result.message_thread_id;

       // Store in database
       const topic = await this.prisma.telegramTopic.create({
         data: {
           tenant_id: tenantId,
           user_id: userId,
           topic_id: topicId,
           topic_name: `Customer ${userId}`
         }
       });

       return topic;
     }

     async sendMessage(tenantId: string, userId: string, text: string) {
       const integration = await this.prisma.integration.findUnique({
         where: { tenant_id: tenantId }
       });

       const topic = await this.prisma.telegramTopic.findUnique({
         where: {
           tenant_id_user_id: {
             tenant_id: tenantId,
             user_id: userId
           }
         }
       });

       if (!topic) {
         // Topic doesn't exist, create it
         await this.createTopic(tenantId, userId);
       }

       const botToken = integration.telegram_mode === 'managed'
         ? process.env.SIMPLECHAT_BOT_TOKEN
         : integration.telegram_bot_token;

       await axios.post(
         `https://api.telegram.org/bot${botToken}/sendMessage`,
         {
           chat_id: integration.telegram_group_id,
           message_thread_id: topic.topic_id,
           text: text,
           parse_mode: 'HTML'
         }
       );

       // Update topic stats
       await this.prisma.telegramTopic.update({
         where: { id: topic.id },
         data: {
           last_message_at: new Date(),
           message_count: { increment: 1 }
         }
       });
     }

     async validateBotSetup(groupId: string, mode: 'managed' | 'custom', botToken?: string) {
       const token = mode === 'managed'
         ? process.env.SIMPLECHAT_BOT_TOKEN
         : botToken;

       try {
         // 1. Get bot info
         const botInfo = await axios.get(
           `https://api.telegram.org/bot${token}/getMe`
         );

         // 2. Check if bot is member of group
         const member = await axios.get(
           `https://api.telegram.org/bot${token}/getChatMember`,
           {
             params: {
               chat_id: groupId,
               user_id: botInfo.data.result.id
             }
           }
         );

         // 3. Verify admin status
         if (member.data.result.status !== 'administrator') {
           throw new Error('Bot must be admin');
         }

         // 4. Verify topic permissions
         if (!member.data.result.can_manage_topics) {
           throw new Error('Bot needs "Manage Topics" permission');
         }

         // 5. Test topic creation
         const testTopic = await axios.post(
           `https://api.telegram.org/bot${token}/createForumTopic`,
           {
             chat_id: groupId,
             name: 'Test Topic (will be deleted)'
           }
         );

         // Delete test topic
         await axios.post(
           `https://api.telegram.org/bot${token}/deleteForumTopic`,
           {
             chat_id: groupId,
             message_thread_id: testTopic.data.result.message_thread_id
           }
         );

         return { valid: true, botUsername: botInfo.data.result.username };
       } catch (err) {
         throw new BadRequestException(
           `Telegram setup validation failed: ${err.message}`
         );
       }
     }
   }
   ```

3. **Integration Setup API**
   ```typescript
   // POST /integrations/telegram
   @Post('/telegram')
   @UseGuards(JwtAuthGuard)
   async setupTelegram(@CurrentUser() user: Tenant, @Body() dto: TelegramSetupDto) {
     // Validate setup
     await this.telegramService.validateBotSetup(
       dto.groupId,
       dto.mode,
       dto.botToken
     );

     // Create or update integration
     const integration = await this.prisma.integration.upsert({
       where: { tenant_id: user.id },
       create: {
         tenant_id: user.id,
         telegram_mode: dto.mode,
         telegram_group_id: dto.groupId,
         telegram_bot_token: dto.mode === 'custom' ? dto.botToken : null,
         uses_shared_bot: dto.mode === 'managed'
       },
       update: {
         telegram_mode: dto.mode,
         telegram_group_id: dto.groupId,
         telegram_bot_token: dto.mode === 'custom' ? dto.botToken : null,
         uses_shared_bot: dto.mode === 'managed'
       }
     });

     return {
       success: true,
       integration
     };
   }
   ```

4. **N8N Workflow Update**
   ```
   Premium Workflow Node:
   ┌────────────────────────────────────┐
   │ 4. Check if Topic Exists           │
   │    HTTP Request:                   │
   │    POST /api/telegram/ensure-topic │
   │    Body: {tenantId, userId}        │
   │    Returns: {topicId}              │
   ├────────────────────────────────────┤
   │ 5. Send to Telegram                │
   │    HTTP Request:                   │
   │    POST /api/telegram/send         │
   │    Body: {tenantId, userId, text}  │
   └────────────────────────────────────┘
   ```

5. **Dashboard Setup Wizard UI**
   ```typescript
   // Customer Dashboard Component
   <Card>
     <CardHeader>
       <h2>Telegram Integration</h2>
       <Badge variant={integration?.telegram_mode === 'managed' ? 'success' : 'default'}>
         {integration?.telegram_mode === 'managed' ? 'Quick Setup' : 'Custom Bot'}
       </Badge>
     </CardHeader>

     <CardContent>
       {/* Mode Selection */}
       <RadioGroup value={mode} onValueChange={setMode}>
         <div className="space-y-4">
           <RadioGroupItem value="managed">
             <div className="flex items-center gap-2">
               <Badge variant="outline">Recommended</Badge>
               <Label>Quick Setup - Use our managed bot</Label>
             </div>
             <p className="text-sm text-gray-500 mt-1">
               2-minute setup. Add @SimpleChatSupportBot to your group.
             </p>
           </RadioGroupItem>

           <RadioGroupItem value="custom">
             <Label>Advanced Setup - Use your own bot</Label>
             <p className="text-sm text-gray-500 mt-1">
               Custom bot name, full control. Requires BotFather.
             </p>
           </RadioGroupItem>
         </div>
       </RadioGroup>

       {/* Setup Form */}
       {mode === 'managed' ? (
         <ManagedSetupForm />
       ) : (
         <CustomSetupForm />
       )}
     </CardContent>
   </Card>
   ```

---

### **Phase 5: Payment Integration (Stripe)** (Week 8)

**Goal:** Subscription billing with auto-provisioning.

#### Tasks:

1. **Stripe Setup**
   - Create Stripe account
   - Create products: Basic ($9.99), Premium ($19.99)
   - Get API keys (test & live)
   - Setup webhook endpoint

2. **Stripe Service**
   ```typescript
   @Injectable()
   export class StripeService {
     private stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

     async createSubscription(tenantId: string, plan: 'basic' | 'premium') {
       const tenant = await this.prisma.tenant.findUnique({
         where: { id: tenantId }
       });

       // 1. Create Stripe customer
       const customer = await this.stripe.customers.create({
         email: tenant.email,
         name: tenant.full_name,
         metadata: { tenant_id: tenantId }
       });

       // 2. Create subscription with trial
       const priceId = plan === 'premium'
         ? process.env.STRIPE_PREMIUM_PRICE_ID
         : process.env.STRIPE_BASIC_PRICE_ID;

       const subscription = await this.stripe.subscriptions.create({
         customer: customer.id,
         items: [{ price: priceId }],
         trial_period_days: 14,
         payment_behavior: 'default_incomplete',
         expand: ['latest_invoice.payment_intent']
       });

       // 3. Update tenant
       await this.prisma.tenant.update({
         where: { id: tenantId },
         data: {
           stripe_customer_id: customer.id,
           stripe_subscription_id: subscription.id,
           subscription_status: 'trialing',
           trial_ends_at: new Date(subscription.trial_end * 1000),
           current_period_start: new Date(subscription.current_period_start * 1000),
           current_period_end: new Date(subscription.current_period_end * 1000)
         }
       });

       return subscription;
     }
   }
   ```

3. **Webhook Handler**
   ```typescript
   @Post('/webhooks/stripe')
   @RawBody()
   async handleStripeWebhook(@Req() req: Request) {
     const sig = req.headers['stripe-signature'];

     let event;
     try {
       event = this.stripe.webhooks.constructEvent(
         req.body,
         sig,
         process.env.STRIPE_WEBHOOK_SECRET
       );
     } catch (err) {
       throw new BadRequestException('Invalid signature');
     }

     switch (event.type) {
       case 'customer.subscription.created':
         await this.handleSubscriptionCreated(event.data.object);
         break;

       case 'customer.subscription.updated':
         await this.handleSubscriptionUpdated(event.data.object);
         break;

       case 'customer.subscription.deleted':
         await this.handleSubscriptionCanceled(event.data.object);
         break;

       case 'invoice.payment_succeeded':
         await this.handlePaymentSucceeded(event.data.object);
         break;

       case 'invoice.payment_failed':
         await this.handlePaymentFailed(event.data.object);
         break;
     }

     return { received: true };
   }
   ```

---

### **Phase 6: Customer Dashboard** (Week 9-10)

**Tech Stack:** Next.js 14, Tailwind CSS, Shadcn UI

**Pages:**
1. `/` - Marketing landing page
2. `/auth/login` - Login
3. `/auth/register` - Signup with plan selection
4. `/dashboard` - Overview (stats, metrics)
5. `/dashboard/widget` - Widget settings
6. `/dashboard/integrations` - Telegram setup
7. `/dashboard/ai` - AI configuration
8. `/dashboard/embed` - Embed code
9. `/dashboard/billing` - Subscription management

---

### **Phase 7: Polish & Launch** (Week 11-12)

- Testing (unit, integration, E2E)
- Documentation (API docs, help center)
- Marketing site design
- SEO optimization
- Beta testing (10-20 users)
- Public launch (Product Hunt, social media)

---

## 🔐 Security Checklist

- [x] HTTPS everywhere (Railway SSL)
- [x] JWT authentication with httpOnly cookies
- [x] bcrypt password hashing (12 rounds)
- [x] Rate limiting (express-rate-limit)
- [x] CORS whitelisting per tenant (dynamic)
- [x] SQL injection prevention (Prisma ORM)
- [x] XSS protection (helmet.js)
- [x] CSRF tokens for state-changing operations
- [x] Environment variables in Railway (never in code)
- [x] Stripe webhook signature verification
- [x] Daily database backups (Railway automatic)
- [x] Audit logging for tenant actions
- [x] Email verification on signup
- [x] Password reset flow
- [x] API rate limiting per tenant
- [x] Subdomain validation (alphanumeric + hyphens only)
- [x] N8N workflow isolation (per-tenant webhooks)

---

## 💰 Cost Analysis (Updated)

### Infrastructure Costs (100 customers):

| Service | Monthly Cost |
|---------|--------------|
| Railway (5 services) | ~$30 |
| PostgreSQL (Railway) | ~$10 |
| N8N (single instance) | $0 (existing) |
| Stripe fees (3% + 30¢) | ~$70 |
| Domain | ~$1 |
| **Total** | **~$111** |

### Revenue (100 customers @ $19.99):
- Monthly Revenue: **$1,999**
- Monthly Profit: **$1,888**
- Profit Margin: **94.4%**

### Scaling (1,000 customers):
- Revenue: $19,990/month
- Costs: ~$500/month (Railway scales, Stripe fees increase)
- Profit: **$19,490/month**
- Margin: **97.5%**

---

## 📅 Timeline Summary

| Week | Phase | Deliverable |
|------|-------|-------------|
| 1-2 | Foundation | Auth API, database, subdomain generation |
| 3-4 | N8N Cloning | Automatic workflow provisioning |
| 5-6 | Subdomains | Dynamic routing, CORS, embed codes |
| 7 | Telegram | Topic management, hybrid bot approach |
| 8 | Payments | Stripe integration, webhooks |
| 9-10 | Dashboard | Customer portal (Next.js) |
| 11-12 | Launch | Testing, docs, beta, public launch |

**Total:** 12 weeks (3 months to MVP)

---

## 🚀 Next Steps

1. **Immediate:**
   - [ ] Create Cloudflare wildcard DNS records
   - [ ] Get N8N API token
   - [ ] Create master N8N templates (basic & premium)
   - [ ] Setup @SimpleChatSupportBot on Telegram

2. **Week 1:**
   - [ ] Prisma schema migration
   - [ ] Auth API implementation
   - [ ] Subdomain generation logic

3. **Week 2:**
   - [ ] Registration flow with auto-provisioning
   - [ ] JWT authentication
   - [ ] Email verification

---

**Questions? Clarifications needed?** Let's review this plan and adjust before starting implementation! 🎯
