# 🚀 Simple Chat Bot - SaaS Migration Roadmap

**Hedef:** Docker Compose sistemini Railway Cloud platformuna taşımak ve SaaS yapısı kurmak.

**Teknoloji Politikası:** Her zaman en güncel stable versiyonlar (React 19, Node.js 22, Vite 7.x)

---

## 📊 Proje Durumu

**Başlangıç:** 02 Kasım 2025
**Mevcut Faz:** Railway Production Deployment ✅
**Son Güncelleme:** 05 Kasım 2025 - Gece

### ✅ Tamamlanan Fazlar (100%)

**Faz 1: GitHub & Monorepo Setup**
- ✅ GitHub repository: `photier/simplechat-saas`
- ✅ Monorepo yapısı: `apps/` (widget, widget-premium, dashboard, backend)
- ✅ Root directory stratejisi belirlendi

**Faz 2: Backend API (NestJS + Prisma)**
- ✅ Multi-tenant database schema (Tenant, Widget, User, Message, Session)
- ✅ Tenant CRUD API endpoints
- ✅ Railway PostgreSQL production deployment
- ✅ URL: `simplechat-saas-production.up.railway.app`

**Faz 3: Widget Deployment**
- ✅ Normal Widget: `widget-production-b2ce.up.railway.app`
- ✅ Premium Widget: `widget-premium-production.up.railway.app`
- ✅ React 19 + Vite 7.2.0 + Socket.io 4.8.1
- ✅ Node.js 22, Nixpacks build system

**Faz 4: Dashboard Deployment**
- ✅ React Dashboard: `zucchini-manifestation-production-f29f.up.railway.app`
- ✅ Stats Backend: `stats-production-e4d8.up.railway.app`
- ✅ Express + Socket.io + PostgreSQL
- ✅ CORS configuration (Socket.io + Express middleware)

**Faz 5: Database Migration**
- ✅ Eski tablolar Railway'e migrate (schema only, no data)
- ✅ Tables: `chat_history`, `widget_opens`
- ✅ Multi-tenant schema + legacy tables coexist

---

## 🎉 Railway Deployment - TAMAMLANDI!

### Production URLs

| Servis | URL | Port | Status |
|--------|-----|------|--------|
| **Backend API** | simplechat-saas-production.up.railway.app | 3000 | ✅ |
| **PostgreSQL** | (private network) | 5432 | ✅ |
| **Widget** | widget-production-b2ce.up.railway.app | 3000 | ✅ |
| **Widget Premium** | widget-premium-production.up.railway.app | 3000 | ✅ |
| **Dashboard** | zucchini-manifestation-production-f29f.up.railway.app | 5173 | ✅ |
| **Stats Backend** | stats-production-e4d8.up.railway.app | 3002 | ✅ |

### Teknoloji Stack

**Frontend:**
- React 19.1.1
- Vite 7.1.3 (Vite 7.2.0 for widgets)
- TypeScript 5.9.3
- Tailwind CSS 4.1.12
- Socket.io-client 4.8.1

**Backend:**
- NestJS 11.0.1
- Prisma 6.18.0
- Express 4.21.2
- Socket.io 4.8.1
- PostgreSQL 17.6

**Build:**
- Nixpacks (widgets, dashboard, backend)
- Dockerfile (stats backend)
- Node.js 22.11.0

### Kritik Öğrenilenler

**1. Railway Root Directory:**
- ✅ Doğru: `apps/widget`
- ❌ Yanlış: `/apps/widget`
- Başta `/` olmamalı

**2. npm ci vs npm install:**
- `package-lock.json` gitignore'daysa → `npm install` kullan
- Railway'de `npm ci` package-lock gerektirir

**3. CORS Configuration:**
- Socket.io CORS ayarı → `new Server(server, {cors: {...}})`
- Express CORS middleware → `app.use((req, res, next) => {...})`
- **İkisi de gerekli!** Sadece biri yetmez.

**4. Multi-stage Dockerfile:**
- Stage 1: Dependencies (cache için)
- Stage 2: Build
- Stage 3: Production runner
- Node.js 20 → 22 upgrade edildi

**5. Environment Variables:**
- Vite: `VITE_` prefix gerekli (browser'da kullanılacaksa)
- Build-time variables rebuild gerektirir
- Runtime variables restart yeterli

### Deployment Workflow

**Widget değişikliği:**
```bash
cd apps/widget
npm run build
# Railway otomatik deploy (root: apps/widget)
```

**Stats backend değişikliği:**
```bash
cd stats
# server.js düzenle
git commit && git push
# Railway otomatik deploy (root: stats)
```

**Dashboard değişikliği:**
```bash
cd apps/dashboard
# React component düzenle
git commit && git push
# Railway otomatik build (root: apps/dashboard)
```

### Git Commits (Railway Deployment)

```bash
1c48e32 - feat: Initial widget deployment setup
1127154 - fix: Upgrade dashboard to Node.js 22
86a47e2 - feat: Add stats backend for Railway
6aa4939 - fix: Add Railway dashboard URL to stats CORS (Socket.io)
76697b1 - fix: Remove dockerfilePath from backend railway.json
1c47d30 - fix: Use npm install instead of npm ci
ba38ba0 - fix: Add Railway dashboard URL to Express CORS middleware ✅
```

---

## 📋 Sonraki Adımlar (TODO)

### 1. Widget Testing (Acil)
- [ ] Widget → N8N webhook bağlantısı test et
- [ ] Mesaj gönder, database'e yazılıyor mu kontrol et
- [ ] Socket.io real-time updates test et
- [ ] Premium widget dual-tab sistemi test et

### 2. Custom Domain Setup
- [ ] `chat.simplechat.bot` → Railway widget
- [ ] `p-chat.simplechat.bot` → Railway widget-premium
- [ ] `stats.simplechat.bot` → Railway dashboard
- [ ] DNS CNAME records ekle

### 3. N8N Integration
- [ ] Widget webhook URL'lerini Railway'e yönlendir
- [ ] N8N PostgreSQL bağlantısını Railway'e çevir
- [ ] AI processing test et

### 4. Railway API Integration (SaaS)
- [ ] Railway API token al
- [ ] Template'leri hazırla (widget-template-normal, widget-template-premium)
- [ ] Backend'e Railway SDK ekle
- [ ] POST /tenants → Otomatik widget deployment
- [ ] Environment variables set et (TENANT_ID, N8N_WEBHOOK_URL)

### 5. Production Migration
- [ ] Eski server'ı backup al
- [ ] Data migration stratejisi (chat_history, widget_opens)
- [ ] Zero-downtime DNS switch
- [ ] Monitoring ve alerting

---

## 🗂️ Proje Yapısı

```
simplechat-saas/
├── apps/
│   ├── widget/              # Normal widget (React 19 + Vite)
│   │   ├── src/
│   │   ├── server.cjs       # Express + Socket.io (CommonJS)
│   │   ├── vite.config.ts
│   │   ├── nixpacks.toml    # Railway build config
│   │   └── package.json
│   │
│   ├── widget-premium/      # Premium widget (AI + Live Support tabs)
│   │   ├── src/
│   │   ├── server.cjs
│   │   ├── nixpacks.toml
│   │   └── package.json
│   │
│   └── dashboard/           # React dashboard
│       ├── src/
│       ├── vite.config.ts
│       ├── nixpacks.toml
│       └── package.json
│
├── backend/                 # NestJS API
│   ├── src/
│   ├── prisma/
│   │   └── schema.prisma    # Multi-tenant schema
│   ├── Dockerfile           # Multi-stage build
│   ├── railway.json
│   └── package.json
│
├── stats/                   # Stats backend (Express + Socket.io)
│   ├── server.js            # Express + PostgreSQL + Socket.io
│   ├── public/              # Static dashboard files (from apps/dashboard build)
│   ├── Dockerfile
│   └── package.json
│
├── widget-template-normal/  # Template for tenant deployment (future)
├── widget-template-premium/ # Template for tenant deployment (future)
│
├── EMBED_CODE.html          # Production widget embed codes
├── CLAUDE.md                # AI assistant instructions
└── SAAS_MIGRATION_PLAN.md   # This file
```

---

## 🎯 Milestone Timeline

| Tarih | Milestone | Status |
|-------|-----------|--------|
| **02 Kas 2025** | Monorepo setup | ✅ |
| **03 Kas 2025** | React + Vite dashboard development | ✅ |
| **05 Kas 2025 (Öğleden Sonra)** | GitHub repo + Railway setup | ✅ |
| **05 Kas 2025 (Akşam)** | Backend API + PostgreSQL deployment | ✅ |
| **05 Kas 2025 (Gece)** | Widget + Dashboard deployment | ✅ |
| **05 Kas 2025 (Gece)** | Stats backend + CORS fixes | ✅ |
| **06 Kas 2025** | Widget testing + N8N integration | ⏳ |
| **07 Kas 2025** | Custom domains + Production migration | ⏳ |
| **08+ Kas 2025** | Railway API integration (SaaS) | ⏳ |

---

## 📝 Notlar

### Railway Limitations & Workarounds

**Watch Paths Sorunu:**
- Root directory ayarlı olsa bile her commit tüm servisleri build ediyor
- Geçici kabul ediliyor (build süreleri kısa, ~1-2 dakika)
- İleride Railway support ile konuşulacak

**Builder Selection:**
- Dockerfile varsa Railway otomatik algılıyor
- `railway.json` ile override edilebilir
- Nixpacks daha hızlı build (cache layer'ları daha iyi)

### Eski Server Durumu

**Çalışan Servisler (92.113.21.229):**
- intergram (port 3000) - photier.com için aktif
- intergram-premium (port 3001) - photier.com için aktif
- stats (port 3002) - eski dashboard
- n8n (port 5678) - n8n.photier.co (ayrı domain, kalacak)
- qdrant (port 6333) - vector DB (ayrı domain, kalacak)
- postgres (port 5432) - production data

**Migration Stratejisi:**
- Railway SaaS yeni müşteriler için hazırlanacak
- photier.com eski sistemde çalışmaya devam edecek
- Production-ready olduktan sonra photier.com migrate edilecek
- Zero-downtime: DNS switch + database migration

---

## 🔗 Önemli Linkler

- **GitHub:** https://github.com/photier/simplechat-saas
- **Railway Dashboard:** https://railway.app
- **Production N8N:** https://n8n.photier.co
- **Eski Stats:** https://stats.simplechat.bot
- **Yeni Dashboard:** https://zucchini-manifestation-production-f29f.up.railway.app

---

**Last Updated:** 05 Kasım 2025 - 23:00
**Current Phase:** Widget Testing & N8N Integration
**Next Milestone:** Custom Domain Setup
