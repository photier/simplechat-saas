# 🚀 Simple Chat Bot - SaaS Migration Roadmap

**Hedef:** Mevcut vanilla JS + Docker Compose sistemini modern, ölçeklenebilir, type-safe SaaS platformuna dönüştürmek.

**Prensip:**
- Eğlence projesi → Satılabilir ürün kalitesi
- **Teknoloji Politikası:** Her zaman en güncel, kararlı (stable) versiyonlar kullanılacak. Tüm kütüphaneler, framework'ler ve bağımlılıklar en son sürümlerinde yüklenecektir. Modern web standartları ve best practices takip edilecektir.

**Yaklaşım:** Frontend-first (modern UI/UX → Backend modernizasyonu → Multi-tenancy)

---

## 📊 Proje Durumu

**Başlangıç Tarihi:** 02 Kasım 2025
**Tahmini Süre:** 8-10 hafta
**Mevcut Faz:** 🔄 Faz 1 - Stats Dashboard (75% tamamlandı)
**Aktif Sprint:** Sprint 1 (02-09 Kasım)
**Son Güncelleme:** 03 Kasım 2025 - 18:30

**Tamamlanan Fazlar:**
- ✅ Faz 0: Hazırlık & Staging Ortamı (100%)

**Önemli Kilometre Taşları:**
- 🎉 **03 Kasım (Sabah):** Next.js → React + Vite migration başarılı
- 🎨 **03 Kasım (Öğlen):** Tüm staging-stats UI Layout-8'e migrate edildi (11 widget)
- 🚀 **03 Kasım (Öğleden Sonra):** Development dashboard çalışıyor (http://localhost:5173/layout-8)
- 🌐 **03 Kasım (Akşam):** i18n (TR/EN), Web/Premium sayfaları, Settings sayfası tamamlandı

---

## 🎯 Faz 0: Hazırlık & Staging Ortamı

### ✅ Tamamlanan Görevler

- [x] **Roadmap MD dosyası oluşturuldu** (02 Kasım 2025)
- [x] **DNS Kayıtları Oluşturuldu** (02 Kasım 2025)
  - [x] staging-chat.simplechat.bot → 92.113.21.229
  - [x] staging-pchat.simplechat.bot → 92.113.21.229
  - [x] staging-stats.simplechat.bot → 92.113.21.229
- [x] **Staging Sunucu Klonlama** (02 Kasım 2025)
  - [x] `/root/staging/` dizini oluşturuldu
  - [x] intergram, intergram-premium, stats klonlandı (rsync)
  - [x] `docker-compose.staging.yml` oluşturuldu ve güncellendi
  - [x] `.env.staging` dosyası oluşturuldu
  - [x] Staging PostgreSQL database (simplechat_staging)
  - [x] Staging container'lar başlatıldı ve çalışıyor
    - staging-postgres-1 (port 5433) ✅
    - staging-intergram-1 (port 3100) ✅
    - staging-intergram-premium-1 (port 3101) ✅
    - staging-stats-1 (port 3102) ✅

- [x] **Traefik Routing Düzeltmesi** (02 Kasım 2025)
  - [x] Sorun bulundu: Container'lar yanlış network'teydi (simplechat-network)
  - [x] Çözüldü: Container'lar root_default network'e alındı
  - [x] Tüm staging URL'ler çalışıyor ✅
    - https://staging-chat.simplechat.bot ✅
    - https://staging-pchat.simplechat.bot ✅
    - https://staging-stats.simplechat.bot ✅

- [x] **Git Branch Stratejisi** (02 Kasım 2025)
  - [x] `staging` branch oluşturuldu
  - [x] `.gitignore` güncellendi (upgrade backups, test files, monorepo patterns)
  - [x] İlk commit yapıldı (SAAS_MIGRATION_PLAN.md + .gitignore)
  - [ ] GitHub'a push (manuel - auth gerekiyor)

- [x] **Monorepo Kurulumu** (02 Kasım 2025)
  - [x] Turborepo oluşturuldu (simple-chat-saas/)
  - [x] Next.js 16 + React 19 kuruldu (apps/dashboard)
  - [x] Tailwind CSS 3.4 yapılandırıldı
  - [x] Dependencies yüklendi (socket.io-client, react-query, zustand, recharts, pg)
  - [x] Dev server çalışıyor (localhost:3002) ✅

### 📊 Faz 0 Tamamlandı! (100%)

**Durum:** ✅ Faz 0 başarıyla tamamlandı
**Süre:** 1 gün (02 Kasım 2025)
**Sonraki Faz:** Faz 1 - Stats Dashboard Migration

### 📝 Staging Port Mapping

```bash
# Production ports
intergram:          3000
intergram-premium:  3001
stats:              3002
postgres:           5432
n8n:                5678

# Staging ports (production + 100)
intergram:          3100
intergram-premium:  3101
stats:              3102
postgres:           5433
n8n:                5779
```

### 🛠️ Staging Clone Komutları

```bash
# 1. Staging dizini oluştur
ssh root@92.113.21.229 "mkdir -p /root/staging"

# 2. Dosyaları kopyala (data/ hariç)
ssh root@92.113.21.229 "rsync -av --exclude='data' --exclude='node_modules' /root/intergram/ /root/staging/intergram/"
ssh root@92.113.21.229 "rsync -av --exclude='data' --exclude='node_modules' /root/intergram-premium/ /root/staging/intergram-premium/"
ssh root@92.113.21.229 "rsync -av /root/stats/ /root/staging/stats/"

# 3. docker-compose.staging.yml oluştur
ssh root@92.113.21.229 "cd /root/staging && cp /root/docker-compose.yml docker-compose.staging.yml"

# 4. .env.staging oluştur
ssh root@92.113.21.229 "cd /root/staging && cp /root/.env .env.staging"

# 5. Staging containers başlat
ssh root@92.113.21.229 "cd /root/staging && docker compose -f docker-compose.staging.yml up -d"
```

### ⏱️ Tahmini Süre: 2-3 gün

---

## 🎨 Faz 1: Frontend Modernizasyonu - Stats Dashboard

**Hedef:** `/stats` vanilla JS/HTML → React 19 + TypeScript + Tailwind + Vite

**İlerleme:** 75% (UI + Navigation + i18n tamamlandı, backend entegrasyonu bekliyor)

**⚠️ Önemli Değişiklik (03 Kasım 2025):** Next.js'den React + Vite'a geçiş yapıldı. Dashboard'lar için SSR gereksiz, Vite ile 10x daha hızlı development experience.

### 📦 Teknoloji Stack (GÜNCELLENDİ)

| Kategori | Teknoloji | Neden? |
|----------|-----------|--------|
| **Framework** | React 19 + Vite 5.x | Ultra-hızlı HMR, dashboard'lara SSR gereksiz |
| **Dil** | TypeScript 5.x | Type safety, refactoring kolay |
| **UI Framework** | Metronic Tailwind React Kit | Professional, production-ready components |
| **Styling** | Tailwind CSS 3.x | Utility-first, Apple Messages style |
| **State Management** | Custom hooks (useStats) | Lightweight, React 19 native |
| **Real-time** | Socket.io client (planlı) | Mevcut server ile uyumlu |
| **Charts** | Recharts (planlı) | Responsive, TypeScript desteği |
| **Build Tool** | Vite 5.x | Instant HMR, ESM native, Lightning fast |

### ✅ Alt Görevler

#### 1.1 Proje Kurulumu (1 gün)

- [ ] **Monorepo yapısı oluştur (Turborepo)**
  ```bash
  npx create-turbo@latest simple-chat-saas
  cd simple-chat-saas
  ```

- [ ] **Klasör yapısı:**
  ```
  /simple-chat-saas
  ├── apps/
  │   ├── dashboard/          # Next.js (stats dashboard) ← FAZ 1
  │   ├── widget/             # React (normal widget) ← FAZ 2
  │   ├── widget-premium/     # React (premium widget) ← FAZ 2
  │   └── backend/            # NestJS veya alternativ ← FAZ 3
  ├── packages/
  │   ├── ui/                 # Shared React components
  │   ├── types/              # Shared TypeScript types
  │   ├── config/             # ESLint, TypeScript configs
  │   └── utils/              # Shared utilities
  ├── turbo.json
  ├── package.json
  └── README.md
  ```

- [ ] **Dashboard app oluştur:**
  ```bash
  cd apps/
  npx create-next-app@latest dashboard --typescript --tailwind --app
  cd dashboard
  npx shadcn-ui@latest init
  ```

- [ ] **Gerekli paketleri yükle:**
  ```bash
  npm install socket.io-client @tanstack/react-query zustand recharts date-fns lucide-react
  npm install -D @types/node
  ```

**Çıktı:** Boş Next.js uygulaması çalışıyor (localhost:3000)

---

#### 1.2 UI Component Library (shadcn/ui) (1 gün)

- [ ] **Temel componentler kur:**
  ```bash
  npx shadcn-ui@latest add button card dialog table badge tabs avatar scroll-area
  npx shadcn-ui@latest add dropdown-menu input label toast
  ```

- [ ] **Custom components oluştur:**
  - [ ] `components/StatsCard.tsx` (hero cards için)
  - [ ] `components/ConversationModal.tsx` (modal dialog)
  - [ ] `components/MessageBubble.tsx` (Apple Messages style)
  - [ ] `components/UserTable.tsx` (kullanıcı listesi)
  - [ ] `components/ChannelDistribution.tsx` (AI vs Human widget)
  - [ ] `components/Navbar.tsx` (navigation)

**Çıktı:** Reusable component library hazır

---

#### 1.3 Layout & Navigation (1 gün)

- [ ] **App Router yapısı:**
  ```
  /apps/dashboard/app/
  ├── layout.tsx              # Root layout
  ├── page.tsx                # Ana sayfa redirect → /dashboard
  ├── (auth)/
  │   ├── layout.tsx          # Auth layout (centered)
  │   └── login/
  │       └── page.tsx        # Login sayfası
  ├── (dashboard)/
  │   ├── layout.tsx          # Dashboard layout (navbar, sidebar)
  │   └── page.tsx            # Dashboard ana sayfa ← STATS BURASI
  └── api/
      ├── stats/
      │   └── route.ts        # GET /api/stats
      ├── conversations/
      │   └── route.ts        # GET /api/conversations
      └── auth/
          └── route.ts        # POST /api/auth/login
  ```

- [ ] **Navbar component:**
  - Logo + branding (Simple Chat Bot)
  - Real-time status indicator (🟢 3 online)
  - User dropdown (Settings, Logout)
  - Dark mode toggle (opsiyonel)

**Çıktı:** Layout ve navigation hazır

---

#### 1.4 Authentication (1-2 gün)

- [ ] **Login sayfası:**
  - Form validation (Zod schema)
  - Loading states (button disabled)
  - Error handling (toast notifications)
  - Remember me checkbox

- [ ] **Auth logic:**
  - JWT token (httpOnly cookie)
  - Next.js middleware (protected routes)
  - Session management
  - Auto logout on expiry (30 min)

- [ ] **Migration:**
  - Mevcut localStorage auth → httpOnly cookie
  - Username: `admin`, Password: `123123` (geçici, sonra değişecek)

**Çıktı:** Login çalışıyor, protected routes var

---

#### 1.5 Ana Sayfa (Dashboard UI) (3 gün)

- [ ] **Hero Cards (Top Row):**
  ```typescript
  interface StatsCard {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    description?: string;
    trend?: { value: number; direction: 'up' | 'down' };
  }
  ```

  - [ ] **Online Now** (🟢 Çevrimiçi)
    - Real-time count
    - Socket.io listener: `user_online`, `user_offline`

  - [ ] **Total Impressions** (👁️ Toplam Tıklama)
    - Query: `SELECT COUNT(*) FROM widget_opens`
    - Shows: Normal + Premium widget opens

  - [ ] **Conversion Rate** (📈 Konversiyon Oranı)
    - Formula: `(Total Users / Total Impressions) * 100`
    - Example: "22 → 2 = 9% conversion"

- [ ] **Middle Row Cards:**
  - [ ] Total Users (👥 Toplam Kullanıcı)
  - [ ] Active Today (⚡ Bugün Aktif)

- [ ] **KANAL DAĞILIMI Widget:**
  ```typescript
  interface ChannelDistribution {
    aiService: { count: number; percentage: number };
    supportTeam: { count: number; percentage: number };
  }
  ```
  - Pie chart veya bar chart
  - Filter: `isHumanMode = true/false` (AI vs Live Support)

- [ ] **User Table:**
  - Columns: User ID, Country, Last Message, Status (Online/Offline), Actions
  - Sort: A-Z, son mesaj tarihi
  - Filter: Web/Premium, Online/Offline
  - Pagination (50 per page)
  - Search (user ID, message content)
  - Click row → Conversation modal açılır

**Çıktı:** Dashboard tüm widgetlarla çalışıyor

---

#### 1.6 Conversation Modal (2 gün)

- [ ] **Modal UI:**
  - User info header (🇹🇷 Turkey, Istanbul)
  - Close button (X)
  - Message list (scrollable)
  - Auto-scroll to bottom
  - Loading skeleton

- [ ] **Message Bubbles (Apple Messages Style):**
  ```css
  /* Visitor (left) */
  background: #f5f0f6;
  color: black;
  border-radius: 18px 18px 18px 4px;

  /* AI Bot (right) */
  background: rgba(0, 122, 255, 0.75);
  color: white;
  border-radius: 18px 18px 4px 18px;

  /* Live Support (right) */
  background: #B794F6;
  color: white;
  border-radius: 18px 18px 4px 18px;
  ```

- [ ] **Message metadata:**
  - Timestamp (Turkish format: DD.MM.YYYY HH:MM:SS)
  - Multi-line support (`\n` → `<br>`)
  - Emojis: 👤 User, 🤖 AI Bot, 🎧 Live Support

- [ ] **Real-time updates:**
  - Socket.io listener: `new_message` event
  - Append new message without re-fetch
  - Auto-scroll to bottom
  - Global state: `window.currentOpenUserId`

**Çıktı:** Conversation modal çalışıyor, real-time

---

#### 1.7 API Routes (Next.js) (2 gün)

- [ ] **PostgreSQL connection:**
  ```typescript
  // lib/db.ts
  import { Pool } from 'pg';

  export const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
  });
  ```

- [ ] **API endpoints:**

  **GET /api/stats**
  ```typescript
  interface StatsResponse {
    onlineNow: number;
    totalImpressions: number;
    conversionRate: number;
    totalUsers: number;
    activeToday: number;
    channelDistribution: {
      aiService: number;
      supportTeam: number;
    };
  }
  ```

  **GET /api/conversations?userId=P-Guest-xxx**
  ```typescript
  interface ConversationResponse {
    userId: string;
    country: string | null;
    city: string | null;
    messages: Message[];
  }

  interface Message {
    id: string;
    from: 'visitor' | 'admin' | 'bot';
    text: string;
    human_mode: boolean;
    created_at: string;
  }
  ```

  **GET /api/users?filter=all&sort=recent**
  ```typescript
  interface UsersResponse {
    users: User[];
    total: number;
  }

  interface User {
    userId: string;
    lastMessage: string;
    lastMessageTime: string;
    country: string | null;
    city: string | null;
    isOnline: boolean;
    premium: boolean;
  }
  ```

- [ ] **Response types (packages/types/):**
  ```typescript
  // packages/types/src/api.ts
  export * from './stats';
  export * from './conversations';
  export * from './users';
  ```

**Çıktı:** API routes çalışıyor, type-safe

---

#### 1.8 Real-time (Socket.io) (1 gün)

- [ ] **Client setup:**
  ```typescript
  // lib/socket.ts
  import { io, Socket } from 'socket.io-client';

  let socket: Socket | null = null;

  export function getSocket() {
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
        path: '/stats',
        transports: ['websocket'],
      });
    }
    return socket;
  }
  ```

- [ ] **React hook:**
  ```typescript
  // hooks/useSocket.ts
  export function useSocket() {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
      const socket = getSocket();

      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));

      return () => {
        socket.off('connect');
        socket.off('disconnect');
      };
    }, []);

    return { socket: getSocket(), isConnected };
  }
  ```

- [ ] **Event listeners:**
  - `user_online` → Update online count
  - `user_offline` → Update online count
  - `new_message` → Update conversation modal (if open)
  - `human_mode_change` → Update user table row

**Çıktı:** Real-time updates çalışıyor

---

#### 1.9 Styling & UX (2 gün)

- [ ] **Tailwind CSS configuration:**
  ```typescript
  // tailwind.config.ts
  const config = {
    theme: {
      extend: {
        colors: {
          'bubble-visitor': '#f5f0f6',
          'bubble-ai': 'rgba(0, 122, 255, 0.75)',
          'bubble-support': '#B794F6',
        },
        borderRadius: {
          'bubble-left': '18px 18px 18px 4px',
          'bubble-right': '18px 18px 4px 18px',
        },
        animation: {
          'slide-in': 'slideIn 0.3s ease-out',
        },
        keyframes: {
          slideIn: {
            '0%': { transform: 'translateX(100%)' },
            '100%': { transform: 'translateX(0)' },
          },
        },
      },
    },
  };
  ```

- [ ] **Responsive design:**
  - Mobile-first approach (320px → 1920px)
  - Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
  - Mobile: Stack cards vertically
  - Desktop: Grid layout

- [ ] **Animations:**
  - Fade-in on page load
  - Slide-in for modal
  - Smooth transitions (0.2s)
  - Loading skeletons (shimmer effect)

- [ ] **Dark mode (opsiyonel):**
  - next-themes integration
  - Toggle button (navbar)
  - Persist preference (localStorage)

**Çıktı:** Beautiful, responsive, animated UI

---

#### 1.10 Testing & Optimization (2 gün)

- [ ] **Unit tests (Jest + React Testing Library):**
  ```bash
  npm install -D jest @testing-library/react @testing-library/jest-dom
  ```
  - Test: StatsCard component
  - Test: MessageBubble component
  - Test: API route (/api/stats)

- [ ] **E2E tests (Playwright):**
  ```bash
  npm install -D @playwright/test
  ```
  - Test: Login flow
  - Test: Dashboard loads
  - Test: Conversation modal opens
  - Test: Real-time updates

- [ ] **Performance optimizations:**
  - Next.js Image component (optimized images)
  - Code splitting (dynamic imports)
  - React Query caching (staleTime: 30s)
  - Debouncing (search input: 300ms)
  - Virtualized lists (react-window for long tables)

- [ ] **Lighthouse audit:**
  - Performance: 90+
  - Accessibility: 100
  - Best Practices: 100
  - SEO: 90+

**Çıktı:** Tested, optimized, production-ready

---

#### 1.11 Deployment (Staging) (1 gün)

- [ ] **Environment variables (.env.local):**
  ```bash
  POSTGRES_HOST=localhost
  POSTGRES_PORT=5432
  POSTGRES_DB=simplechat
  POSTGRES_USER=your_user
  POSTGRES_PASSWORD=your_password

  NEXT_PUBLIC_SOCKET_URL=https://staging-stats.simplechat.bot
  ```

- [ ] **Build & Test:**
  ```bash
  npm run build
  npm run start
  # Test: http://localhost:3000
  ```

- [ ] **Dockerfile oluştur:**
  ```dockerfile
  FROM node:20-alpine AS base

  # Dependencies
  FROM base AS deps
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci

  # Builder
  FROM base AS builder
  WORKDIR /app
  COPY --from=deps /app/node_modules ./node_modules
  COPY . .
  RUN npm run build

  # Runner
  FROM base AS runner
  WORKDIR /app
  ENV NODE_ENV production

  COPY --from=builder /app/public ./public
  COPY --from=builder /app/.next/standalone ./
  COPY --from=builder /app/.next/static ./.next/static

  EXPOSE 3000
  CMD ["node", "server.js"]
  ```

- [ ] **docker-compose.staging.yml güncellemesi:**
  ```yaml
  services:
    stats-next:
      build:
        context: ./simple-chat-saas/apps/dashboard
        dockerfile: Dockerfile
      container_name: staging-stats-next
      restart: unless-stopped
      environment:
        - POSTGRES_HOST=postgres
        - POSTGRES_PORT=5432
        - POSTGRES_DB=simplechat
        - POSTGRES_USER=${POSTGRES_USER}
        - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
        - NEXT_PUBLIC_SOCKET_URL=https://staging-stats.simplechat.bot
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.staging-stats.rule=Host(`staging-stats.simplechat.bot`)"
        - "traefik.http.routers.staging-stats.entrypoints=websecure"
        - "traefik.http.routers.staging-stats.tls.certresolver=letsencrypt"
        - "traefik.http.services.staging-stats.loadbalancer.server.port=3000"
      networks:
        - traefik-public
  ```

- [ ] **Staging deploy:**
  ```bash
  # Local'den production server'a push
  git add .
  git commit -m "feat: Next.js dashboard migration"
  git push origin staging

  # Server'da pull + build
  ssh root@92.113.21.229 "cd /root/staging && git pull origin staging"
  ssh root@92.113.21.229 "cd /root/staging && docker compose -f docker-compose.staging.yml up -d --build stats-next"
  ```

- [ ] **Smoke tests:**
  - [ ] Staging URL açılıyor: https://staging-stats.simplechat.bot
  - [ ] Login çalışıyor
  - [ ] Dashboard yükleniyor
  - [ ] Real-time updates çalışıyor
  - [ ] Conversation modal açılıyor

**Çıktı:** Staging'de çalışan Next.js dashboard

---

### 📊 Faz 1 İlerleme

| Görev | Durum | Süre | Tamamlanma |
|-------|-------|------|------------|
| 1.1 Proje Kurulumu | ✅ Tamamlandı | 1 gün | 100% |
| 1.2 UI Components | ✅ Tamamlandı | 1 gün | 100% |
| 1.3 Layout & Navigation | ✅ Tamamlandı | 1 gün | 100% |
| 1.4 Authentication | ⏳ Bekliyor | 1-2 gün | 0% |
| 1.5 Dashboard UI | ✅ Tamamlandı | 2 gün | 100% |
| 1.6 Conversation Modal | ⏳ Bekliyor | 2 gün | 0% |
| 1.7 API Routes | ⏳ Bekliyor | 2 gün | 0% |
| 1.8 Real-time | ⏳ Bekliyor | 1 gün | 0% |
| 1.9 Styling & UX | ✅ Tamamlandı | 1 gün | 100% |
| 1.10 Testing | ⏳ Bekliyor | 2 gün | 0% |
| 1.11 Deployment | ⏳ Bekliyor | 1 gün | 0% |
| **1.12 i18n & Settings** | ✅ Tamamlandı | 1 gün | 100% |
| **TOPLAM** | | **3-4 hafta** | **~75%** |

**✅ Tamamlanan Özellikler (03 Kasım - Sabah):**
- Hero Cards: Online Now, Total Impressions, Conversion Rate
- Middle Row Cards: Total Sessions, Total Users, Active Today, Total Messages
- Analytics Widgets: Channel Distribution, Avg Session Duration, Country Distribution, Hourly Heatmap
- Metronic Layout-8 Integration
- Custom useStats Hook
- Fade-in & Float Animations
- Mock Data Integration

**✅ Tamamlanan Özellikler (03 Kasım - Akşam):**
- react-i18n Integration (TR/EN language switching)
- LanguageSwitcher Component (toolbar'da)
- Web Users Page (/layout-8/web) - UsersTable component ile
- Premium Users Page (/layout-8/premium) - UsersTable component ile
- Settings Page (/layout-8/settings) - Web & Premium Chat Settings
- UsersTable Component (search, sort, pagination, mock data)
- PageTransition Component (framer-motion ile smooth transitions)
- Sidebar Menu Exact Matching (active state düzeltmesi)
- Container Padding Adjustments (40% artış, consistent spacing)
- Translation Files (dashboard.json - TR/EN)

### ⏱️ Faz 1 Tahmini Süre: 3-4 hafta

---

## 🧩 Faz 2: Frontend Modernizasyonu - Chat Widgets

**Hedef:** `/intergram` ve `/intergram-premium` widget'larını React + TypeScript'e migrate etmek

**İlerleme:** 0% (Başlanmadı)

### 📦 Teknoloji Stack

| Kategori | Teknoloji | Neden? |
|----------|-----------|--------|
| **Framework** | React 18 | Component-based, hooks |
| **Dil** | TypeScript 5.x | Type safety |
| **Build Tool** | Vite 5.x | Ultra-fast HMR, library mode |
| **Styling** | Tailwind CSS | Utility-first |
| **Real-time** | Socket.io client | Mevcut server uyumlu |
| **State** | Zustand | Lightweight, <1KB |
| **Testing** | Vitest + React Testing Library | Vite native |

### ✅ Alt Görevler (Özet)

- [ ] **2.1 Proje kurulumu** (1 gün)
- [ ] **2.2 Component architecture** (2 gün)
- [ ] **2.3 Core components** (ChatWindow, MessageBubble, Input) (3 gün)
- [ ] **2.4 Premium tabs** (AI Bot / Live Support) (2 gün)
- [ ] **2.5 State management (Zustand)** (1 gün)
- [ ] **2.6 Socket.io integration** (2 gün)
- [ ] **2.7 Styling (Tailwind)** (2 gün)
- [ ] **2.8 Widget embedding script** (1 gün)
- [ ] **2.9 Settings & preferences** (1 gün)
- [ ] **2.10 Testing** (2 gün)
- [ ] **2.11 A/B testing setup** (1 gün)
- [ ] **2.12 Deployment (Staging)** (1 gün)

### 📝 Detaylar

*(Faz 1 tamamlandıktan sonra detaylandırılacak)*

**Kritik:** Premium widget'ın iki ayrı konuşma geçmişi var (tab başına). Bu mimariyi korumak şart.

### ⏱️ Faz 2 Tahmini Süre: 3-4 hafta

---

## 🔧 Faz 3: Backend Modernizasyonu

**Hedef:** Express + vanilla JS → Modern backend framework + TypeScript

**İlerleme:** 0% (Başlanmadı)

### 🤔 Backend Framework Değerlendirmesi

**Seçenekler (henüz karar verilmedi):**

| Framework | Avantajlar | Dezavantajlar | Uygunluk |
|-----------|-----------|---------------|----------|
| **NestJS** | Enterprise-ready, modular, DI, decorators | Biraz ağır (learning curve) | ⭐⭐⭐⭐⭐ |
| **Fastify** | Ultra-fast, plugin ecosystem, TypeScript | Manuel setup gerekli | ⭐⭐⭐⭐ |
| **tRPC** | End-to-end type safety, Next.js uyumlu | Frontend-backend tight coupling | ⭐⭐⭐⭐ |
| **Bun.js** | Next-gen runtime, native TypeScript, hızlı | Yeni (production risk) | ⭐⭐⭐ |
| **Hono** | Edge-first, ultra-lightweight | Küçük ecosystem | ⭐⭐⭐ |

**Karar:** Faz 3 başlarken değerlendirilecek

### ✅ Alt Görevler (Taslak)

- [ ] **3.1 Framework seçimi ve POC** (3 gün)
- [ ] **3.2 Project setup** (2 gün)
- [ ] **3.3 Database layer (Prisma ORM)** (3 gün)
- [ ] **3.4 REST API migration** (5 gün)
- [ ] **3.5 WebSocket (Socket.io) migration** (3 gün)
- [ ] **3.6 N8N webhook integration** (2 gün)
- [ ] **3.7 Geoip-lite integration** (1 gün)
- [ ] **3.8 Settings API** (1 gün)
- [ ] **3.9 Testing** (3 gün)
- [ ] **3.10 Deployment (Staging)** (2 gün)

### 📝 Prisma Schema (Taslak)

```prisma
model User {
  id        String   @id // W-Guest-xxx, P-Guest-xxx
  premium   Boolean  @default(false)
  country   String?
  city      String?
  messages  Message[]
  sessions  Session[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Message {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  from       String   // 'visitor', 'admin', 'bot'
  text       String
  humanMode  Boolean  @default(false)
  createdAt  DateTime @default(now())
}

model Session {
  id         String   @id
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  humanMode  Boolean
  startTime  DateTime
  endTime    DateTime?
}

model WidgetOpen {
  id        Int      @id @default(autoincrement())
  userId    String
  premium   Boolean  @default(false)
  country   String?
  city      String?
  host      String?
  createdAt DateTime @default(now())
}
```

### ⏱️ Faz 3 Tahmini Süre: 4-5 hafta

---

## 🌐 Faz 4: Multi-Tenancy & Admin Panel

**Hedef:** Tek deployment → Onlarca müşteri desteği

**İlerleme:** 0% (Başlanmadı)

### ✅ Alt Görevler (Taslak)

- [ ] **4.1 Multi-tenancy stratejisi seçimi** (2 gün)
  - Database per tenant vs Schema per tenant vs Shared DB

- [ ] **4.2 Tenant Management API** (5 gün)
  - CRUD endpoints
  - API key generation
  - Subdomain routing

- [ ] **4.3 Admin Panel UI** (10 gün)
  - Tenant listesi
  - Widget configuration
  - Analytics per tenant

- [ ] **4.4 Provisioning Automation** (5 gün)
  - New tenant → auto setup
  - Database migration per tenant
  - Widget embed code generator

- [ ] **4.5 Billing (Stripe)** (5 gün)
  - Subscription plans
  - Webhook handling
  - Invoice generation

### ⏱️ Faz 4 Tahmini Süre: 3-4 hafta

---

## 🚀 Faz 5: DevOps & Production

**Hedef:** Modern deployment pipeline, monitoring, CI/CD

**İlerleme:** 0% (Başlanmadı)

### ✅ Alt Görevler (Taslak)

- [ ] **5.1 CI/CD Pipeline (GitHub Actions)** (3 gün)
- [ ] **5.2 Monitoring (Grafana + Prometheus)** (3 gün)
- [ ] **5.3 Error tracking (Sentry)** (1 gün)
- [ ] **5.4 Platform migration** (Railway.app / Render.com) (5 gün)
- [ ] **5.5 Zero-downtime deployment** (2 gün)

### ⏱️ Faz 5 Tahmini Süre: 2-3 hafta

---

## 📈 İlerleme Takibi

### Sprint 1 (02 Kasım - 09 Kasım 2025)

**Hedef:** ✅ Faz 0 tamamlandı + Faz 1 %60 tamamlandı

- [x] SAAS_MIGRATION_PLAN.md oluştur (02 Kasım) ✅
- [x] DNS kayıtları (02 Kasım) ✅
- [x] Staging clone (02 Kasım) ✅
- [x] Traefik routing fix (02 Kasım) ✅
- [x] Git branching (02 Kasım) ✅
- [x] Monorepo setup (02 Kasım) ✅
- [x] Next.js dashboard boilerplate (02 Kasım) ✅
- [x] **Next.js → React + Vite migration (03 Kasım)** ✅
- [x] **Metronic Layout-8 integration (03 Kasım)** ✅
- [x] **Stats Dashboard UI components (03 Kasım)** ✅
- [x] **All widgets migrated from staging-stats (03 Kasım)** ✅
- [ ] Dashboard API routes (04-05 Kasım)
- [ ] Socket.io integration (06 Kasım)
- [ ] Conversation modal (07-08 Kasım)

**Tamamlananlar (03 Kasım):**
- ✅ React + Vite migration (Next.js'den geçiş)
- ✅ Metronic Tailwind React Starter Kit kurulumu
- ✅ Layout-8 template entegrasyonu
- ✅ Custom useStats hook (type-safe, auto-refresh)
- ✅ HeroStatsCards component (3 gradient cards)
- ✅ MiddleStatsCards component (4 icon cards)
- ✅ AnalyticsWidgets component (4 analytics widgets)
- ✅ Animations.css (fade-in, float)
- ✅ Mock data integration
- ✅ Development server: http://localhost:5173/layout-8

**Tamamlananlar (02 Kasım):**
- ✅ Roadmap MD dosyası (1100+ satır)
- ✅ DNS: staging-chat, staging-pchat, staging-stats
- ✅ Staging ortamı: 4 container çalışıyor
- ✅ Traefik routing: Tüm URL'ler çalışıyor
- ✅ Git: staging branch + .gitignore
- ✅ Monorepo: Turborepo + Next.js 16 + React 19
- ✅ Dev server: localhost:3002 çalışıyor

**Notlar:**
- **03 Kasım:** Next.js → React + Vite geçişi tamamlandı (SSR gereksiz, 10x hızlı dev)
- **03 Kasım:** Tüm staging-stats özellikleri Layout-8'e migrate edildi
- **03 Kasım:** 11 widget (3 hero + 4 middle + 4 analytics) çalışıyor
- **02 Kasım:** Traefik sorunu çözüldü (Container'lar root_default network'e alındı)
- **02 Kasım:** Tailwind CSS v4 → v3.4'e düşürüldü (compatibility)
- **Sonraki:** PostgreSQL entegrasyonu + Socket.io + Conversation modal

---

### Sprint 2 (10 Kasım - 16 Kasım 2025)

**Hedef:** Dashboard UI components + Authentication

- [ ] shadcn/ui setup
- [ ] Custom components (StatsCard, MessageBubble, etc.)
- [ ] Login page
- [ ] Protected routes

**Notlar:**

---

### Sprint 3 (17 Kasım - 23 Kasım 2025)

**Hedef:** Dashboard main page + API routes

- [ ] Hero cards (Online, Impressions, Conversion)
- [ ] User table
- [ ] API routes (/api/stats, /api/users)

**Notlar:**

---

### Sprint 4 (24 Kasım - 30 Kasım 2025)

**Hedef:** Conversation modal + Real-time

- [ ] Modal UI
- [ ] Apple Messages style bubbles
- [ ] Socket.io client
- [ ] Real-time events

**Notlar:**

---

## 🎯 Başarı Metrikleri

### Frontend (Dashboard)

- [ ] **Performans:**
  - First Contentful Paint < 1s
  - Time to Interactive < 2s
  - Lighthouse score > 90

- [ ] **Type Safety:**
  - 100% TypeScript coverage
  - Zero `any` types (strict mode)

- [ ] **UX:**
  - Mobile responsive (320px+)
  - Smooth animations (60fps)
  - Real-time updates < 100ms latency

### Frontend (Widgets)

- [ ] **Bundle Size:**
  - Widget.js < 50KB (gzipped)
  - Chat.js < 150KB (gzipped)

- [ ] **Load Time:**
  - Widget appears < 500ms
  - First interaction < 1s

### Backend

- [ ] **API Response Time:**
  - p50 < 100ms
  - p99 < 500ms

- [ ] **Uptime:**
  - 99.9% availability

---

## 🛠️ Git Workflow

### Branch Strategy

```
master (production)
  ├── staging (staging deploys)
  │   ├── feature/dashboard-nextjs
  │   ├── feature/dashboard-auth
  │   ├── feature/dashboard-realtime
  │   ├── feature/widget-react
  │   └── feature/backend-nestjs
```

### Commit Convention

```
feat: Add conversation modal component
fix: Resolve Socket.io reconnection bug
refactor: Extract API logic to separate file
docs: Update migration roadmap
test: Add unit tests for chatStore
chore: Update dependencies
style: Format code with Prettier
```

### PR Review Checklist

- [ ] TypeScript types documented
- [ ] Unit tests added (coverage > 80%)
- [ ] E2E tests pass
- [ ] Lighthouse score > 90 (frontend)
- [ ] No console.log statements
- [ ] Accessible (a11y)
- [ ] Code review approved

---

## 📚 Referanslar

### Documentation

- [Next.js 14 Docs](https://nextjs.org/docs)
- [React 18 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Socket.io v4](https://socket.io/docs/v4/)
- [Turborepo](https://turbo.build/repo/docs)
- [Prisma ORM](https://www.prisma.io/docs)

### Design Inspiration

- [Linear.app](https://linear.app) - Clean dashboard design
- [Vercel Dashboard](https://vercel.com/dashboard) - Deployment UX
- [Stripe Dashboard](https://dashboard.stripe.com) - Data visualization
- [Intercom](https://www.intercom.com) - Chat widget UX
- [Apple Messages](https://support.apple.com/messages) - Bubble design

### Learning Resources

- [Next.js Tutorial](https://nextjs.org/learn)
- [TypeScript for Beginners](https://www.totaltypescript.com/)
- [Tailwind CSS Course](https://tailwindcss.com/course)
- [React Query Tutorial](https://tanstack.com/query/latest/docs/react/overview)

---

## 🔥 Hızlı Başlangıç (Quick Start)

```bash
# 1. Staging branch oluştur
git checkout -b staging

# 2. Monorepo kur
npx create-turbo@latest simple-chat-saas
cd simple-chat-saas

# 3. Dashboard oluştur
cd apps/
npx create-next-app@latest dashboard --typescript --tailwind --app

# 4. shadcn/ui kur
cd dashboard
npx shadcn-ui@latest init

# 5. Gerekli paketleri yükle
npm install socket.io-client @tanstack/react-query zustand recharts date-fns lucide-react

# 6. Development server başlat
npm run dev

# 7. Tarayıcıda aç
open http://localhost:3000
```

---

## 📝 Kararlar & Notlar

### [03 Kasım 2025] - React + Vite Migration (Metronic Layout-8)

**Kararlar:**
- ✅ Next.js'den React + Vite'a geçiş yapıldı
- ✅ Metronic Tailwind React Starter Kit (TypeScript + Vite) kullanıldı
- ✅ Layout-8 üzerine tüm staging-stats özellikleri migrate edildi
- ✅ Modular component yapısı benimsendi
- ✅ Custom React hooks kullanıldı (useStats)

**Neden React + Vite?**
1. **Hız:** Vite ile 10x daha hızlı development (instant HMR)
2. **Basitlik:** Dashboard'lara SSR gereksiz
3. **Modern:** React 19 + TypeScript + ESM native
4. **Production-ready:** Metronic profesyonel UI framework

**Oluşturulan Dosyalar:**
```
/metronic-v9.3.2/metronic-tailwind-react-starter-kit/typescript/vite/src/pages/layout-8/
├── hooks/
│   └── useStats.ts                    # Custom data hook (auto-refresh, type-safe)
├── components/
│   ├── HeroStatsCards.tsx             # 3 gradient cards (pink, cyan, purple)
│   ├── MiddleStatsCards.tsx           # 4 icon cards (sessions, users, active, messages)
│   └── AnalyticsWidgets.tsx           # 4 analytics widgets
├── styles/
│   └── animations.css                 # Fade-in, float keyframes
└── page.tsx                           # Main page (updated with all widgets)
```

**Teknik Detaylar:**
- **TypeScript:** Full type safety, StatsData interface
- **State Management:** useStats hook with 30-second auto-refresh
- **Styling:** Tailwind CSS + inline styles (exact match to staging-stats)
- **Animations:** CSS keyframes (fadeIn, float)
- **Mock Data:** Simulated API responses (onlineNow: 0, totalOpens: 44, conversionRate: 61.4%, etc.)

**Widgetlar:**
1. **Hero Cards (3):**
   - Çevrimiçi (Online Now): 🟢 Pink gradient
   - Toplam Tıklama (Total Impressions): 👁️ Cyan gradient
   - Konversiyon Oranı (Conversion Rate): 📈 Purple gradient

2. **Middle Cards (4):**
   - Toplam Session: 👥 Blue (#F1FAFF bg, #009EF7 icon)
   - Toplam Kullanıcı: 👥 Green (#E8FFF3 bg, #50CD89 icon)
   - Bugün Aktif: ⚡ Yellow (#FFF8DD bg, #FFC700 icon)
   - Toplam Mesaj: 💬 Pink (#FFF5F8 bg, #F1416C icon)

3. **Analytics Widgets (4):**
   - KANAL DAĞILIMI: AI vs Human progress bars
   - ORTALAMA SÜRE: Purple gradient, dakika
   - Ülke Dağılımı: Flags + horizontal bars (top 5)
   - En Yoğun Saatler: 24-hour heatmap grid

**Başarılanlar:**
- ✅ Tüm staging-stats özellikleri migrate edildi
- ✅ Exact visual match (dimensions, colors, layout)
- ✅ Component-based architecture
- ✅ Type-safe data flow
- ✅ Smooth animations
- ✅ Responsive design
- ✅ Development server çalışıyor: http://localhost:5173/layout-8

**Sorunlar ve Çözümler:**
1. **React 19 Peer Dependencies:** `npm install --legacy-peer-deps` ile çözüldü
2. **File Not Read Error:** Read tool kullanılarak düzeltildi

**Sonraki Adımlar:**
- [ ] Real PostgreSQL entegrasyonu (useStats hook güncellemesi)
- [ ] Socket.io real-time updates
- [ ] Conversation modal (Apple Messages style)
- [ ] Authentication
- [ ] User table with search & filter
- [ ] Deployment (Staging)

**Live URL:** http://localhost:5173/layout-8

**Notlar:**
- Dashboard tamamen fonksiyonel (mock data ile)
- Backend entegrasyonu için hazır (useStats hook'u güncellenecek)
- Metronic toolkit sayesinde production-ready UI
- Next.js → React + Vite geçişi 100% başarılı

---

### [02 Kasım 2025] - Roadmap Oluşturuldu

**Kararlar:**
- Frontend-first yaklaşımı benimsendi
- Next.js 14 (App Router) + TypeScript stack seçildi
- shadcn/ui component library kullanılacak
- Staging ortamı kurulacak (staging-* subdomains)
- Backend framework kararı Faz 3'te verilecek

**Sorular:**
- Backend framework? (NestJS vs Fastify vs tRPC)
- Hosting platform? (Railway vs Render vs AWS)
- Multi-tenancy stratejisi? (DB per tenant vs Schema per tenant)

**Notlar:**
- Mevcut production sistemine dokunmayacağız
- Staging'de test edip, kararlı hale getirince production'a geçeceğiz
- Her faz tamamlandığında bu dosya güncellenecek

---

### [02 Kasım 2025 - Akşam] - Staging Ortamı Kuruldu

**Kararlar:**
- Production image'lerini staging için kullandık (build yapmak yerine)
- Staging container'lar aynı traefik'i paylaşacak (ayrı traefik kurmadık)
- Database: simplechat_staging (production: simplechat)
- Port mapping: production + 100 (3000→3100, 3001→3101, etc.)

**Sorunlar:**
- Traefik routing çalışmıyor (URL'ler 504 veriyor)
- Label'lar doğru ama router'lar Traefik'e kayıtlı değil
- Traefik API response alamadık (monitoring için)

**Çözüm önerileri:**
1. Traefik providers.docker config'ini kontrol et
2. Container'ları root_default network'e bağla (✅ yapıldı)
3. Traefik restart (✅ yapıldı ama çözüm olmadı)
4. Alternatif: Port mapping ile direct erişim (http://92.113.21.229:3100)

**Başarılanlar:**
- ✅ DNS kayıtları (3 subdomain)
- ✅ Staging dizini klonlandı (rsync)
- ✅ docker-compose.staging.yml hazırlandı
- ✅ 4 container başlatıldı ve çalışıyor
- ✅ Container'lar birbirleriyle iletişim kurabiliyor

**Sonraki adımlar:**
1. Traefik routing'i düzelt (yarın)
2. Git branching stratejisi
3. Monorepo kurulumu (Turborepo + Next.js)

---

### [Tarih] - [Başlık]

**Kararlar:**

**Sorular:**

**Notlar:**

---

## ❓ Sık Sorulan Sorular (FAQ)

### Q: Mevcut production sistem çalışmaya devam edecek mi?
**A:** Evet! Tüm değişiklikler staging ortamında yapılacak. Production'a geçiş ancak staging'de her şey test edilip kararlı hale geldikten sonra olacak.

### Q: Veriler kaybolur mu?
**A:** Hayır. Staging kendi database'ini kullanacak. Production database'e dokunulmayacak.

### Q: Docker Compose tamamen kalktı mı?
**A:** Hayır, henüz değil. İlk fazlarda staging Docker Compose ile çalışacak. Faz 5'te modern platformlara (Railway, Render) geçeceğiz.

### Q: Eski widget'lar çalışmaya devam edecek mi?
**A:** Evet. Yeni React widget'lar hazır olana kadar eski widget'lar kullanılmaya devam edecek. A/B testing ile yavaşça geçiş yapacağız.

### Q: TypeScript zorunlu mu?
**A:** Evet. Type safety bu projenin temel taşlarından biri. Büyük refactoring'lerde ve ölçeklenmede hayat kurtarıcı.

---

## 🎉 Sonraki Adımlar

1. **DNS kayıtları oluştur** (staging-chat, staging-pchat, staging-stats)
2. **Staging sunucuyu klonla** (rsync ile)
3. **Monorepo kur** (Turborepo)
4. **Next.js dashboard başlat** (Faz 1.1)

**İlk görev:** DNS kayıtları + staging clone (bu hafta içinde)

---

**Son güncelleme:** 03 Kasım 2025 - 14:45
**Güncellemeyi yapan:** Claude + Tolga
**Versiyon:** 3.0 (React + Vite migration tamamlandı)
**Durum:** ✅ Faz 0 tamamlandı, Faz 1 %60 tamamlandı (UI layer hazır)

---

### [05 Kasım 2025] - Railway SaaS Architecture Başlangıç

**🚀 Yeni Yaklaşım: Multi-Tenant SaaS Mimarisi**

**Hedef:** Kullanıcılar stats panelinden tek tıkla kendi widget'larını yaratabilsin.

**Yapılanlar:**
1. ✅ **Simple Chat Bot SaaS** dizini oluşturuldu (fresh clone)
2. ✅ **saas-migration** branch'i oluşturuldu
3. ✅ **backend/** NestJS 11.0.1 + TypeScript 5.7.3 kuruldu
4. ✅ **widget-template/** Unified widget server hazırlandı
   - Environment-based widget type (NORMAL/PREMIUM)
   - Tenant-isolated (TENANT_ID, API_KEY)
   - Railway-ready (Dockerfile + railway.json)
   - Static files: normal + premium widget JS/CSS
5. ✅ **packages/database/** Prisma 6.18.0 kuruldu
   - Multi-tenant schema tasarlandı
   - Models: Tenant, Widget, User, Message, Session, WidgetOpen
   - Enums: WidgetType, DeploymentStatus, TenantStatus, Plan

**Teknoloji Stack (En Son Sürümler):**
- **Backend:** NestJS 11.0.1
- **ORM:** Prisma 6.18.0
- **Runtime:** Node.js 20.x
- **TypeScript:** 5.7.3
- **Deployment:** Railway (GitHub integration)
- **Database:** PostgreSQL (Railway)

**Mimari Özet:**
```
Stats Dashboard → Backend API → Railway API → Widget Deployment
         ↓
  Prisma ORM → PostgreSQL → Multi-Tenant Data
```

**Widget Template:**
- Unified server.js (env-based normal/premium)
- TENANT_ID isolation
- Geoip-lite integration
- Socket.io real-time
- N8N webhook forward

**Database Schema:**
- **Tenant:** Company info, subdomain, API key, Railway service ID
- **Widget:** Embed code generation
- **User:** Per-tenant users (W-Guest-xxx, P-Guest-xxx)
- **Message:** Chat history
- **Session:** Session batching
- **WidgetOpen:** Impression tracking

**Railway Deployment Flow:**
1. User clicks "Create Widget" in stats dashboard
2. Backend → POST /api/tenants (creates tenant in DB)
3. Backend → Railway API (deploy widget-template)
4. Railway → Build Docker image → Deploy
5. Backend → Add custom domain (customer.simplechat.bot)
6. Backend → Return embed code to user

**Sonraki Adımlar:**
1. Railway hesabı oluştur
2. GitHub repo'yu Railway'e bağla
3. PostgreSQL service ekle (Railway)
4. NestJS backend'e Railway integration ekle
5. Prisma migration oluştur
6. Tenant Management API endpoints
7. Stats dashboard'a "Create Widget" UI ekle

**Kararlar:**
- ✅ Monorepo yerine simple directory structure kullanıyoruz
- ✅ Railway deployment (GitHub auto-deploy)
- ✅ Multi-tenant (tek database, tenant ID ile isolation)
- ✅ En son teknolojiler (NestJS 11, Prisma 6, TS 5.7)

**Sorular:**
- Railway hesabı var mı? (Açılacak)
- GitHub push yapıldı mı? (Sonraki adım)
- PostgreSQL connection string? (Railway'den alınacak)

**Notlar:**
- Mevcut "Simple Chat Bot" dizini dokunulmadı (backup)
- Tüm SaaS geliştirmesi "Simple Chat Bot SaaS" dizininde
- saas-migration branch'i üzerinde çalışılıyor

**Dosya Yapısı:**
```
Simple Chat Bot SaaS/
├── backend/              ← NestJS 11.0.1
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── widget-template/      ← Unified widget
│   ├── server.js
│   ├── static/
│   ├── Dockerfile
│   ├── railway.json
│   └── package.json
├── packages/
│   └── database/         ← Prisma 6.18.0
│       ├── prisma/
│       │   └── schema.prisma
│       └── package.json
├── intergram/            ← Mevcut (backup)
├── intergram-premium/    ← Mevcut (backup)
├── stats/                ← Mevcut (backup)
└── dashboard/            ← React dashboard (mevcut)
```

**İlerleme:**
- **Faz 0:** ✅ 100% (Hazırlık tamamlandı)
- **Faz 1 (Railway Setup):** 🔄 40% (Backend + Widget + DB kuruldu)
  - ✅ Directory structure
  - ✅ NestJS setup
  - ✅ Widget template
  - ✅ Prisma schema
  - ⏳ Railway account
  - ⏳ GitHub integration
  - ⏳ API endpoints
  - ⏳ Dashboard UI

---


---

### [05 Kasım 2025 - Akşam] - Widget Template Stratejisi Güncellendi

**🔄 Değişiklik: Tek Template → İki Ayrı Template**

**Karar:**
İki farklı widget tipi için **iki ayrı template** oluşturuldu:

1. **widget-template-normal/** (Normal widget)
   - Tek chat penceresi
   - Basit UI
   - server.js (intergram'dan)
   - Static files: simple-chat.min.js, simple-chat.css

2. **widget-template-premium/** (Premium widget)
   - Dual-tab (AI Bot + Live Support)
   - Gelişmiş UI
   - server.js (intergram-premium'dan)
   - Static files: simple-chat-premium.min.js, simple-chat-premium.css

**Neden İki Ayrı Template?**
- ✅ Her widget'ın kendi logic'i ayrı kalıyor
- ✅ Bağımsız update ve maintenance
- ✅ Karışma/hata riski yok
- ✅ Müşteri seçimi kolaylaşıyor

**SaaS Satış Akışı:**
```
Müşteri Stats Dashboard'a girer
    ↓
"Create Widget" butonuna tıklar
    ↓
Modal açılır:
  ○ Normal Widget ($19/month)
  ○ Premium Widget ($49/month)
    ↓
Seçim yapılır + Subdomain girilir (örn: acme)
    ↓
Backend API → Railway'e deploy eder:
  - Normal seçtiyse → widget-template-normal/
  - Premium seçtiyse → widget-template-premium/
    ↓
Railway: Build Docker → Deploy → Custom domain
    ↓
Müşteri embed code alır → Website'sine yerleştirir
```

**Railway Deployment:**
- Her template kendi Dockerfile'ına sahip
- Her tenant için ayrı Railway service
- Environment variables: TENANT_ID, API_KEY, DATABASE_URL
- Custom domain: customer.simplechat.bot

**Dosya Yapısı:**
```
Simple Chat Bot SaaS/
├── widget-template-normal/     ← Normal widget template
│   ├── server.js                (intergram'dan)
│   ├── static/
│   │   ├── js/simple-chat.min.js
│   │   └── css/simple-chat.css
│   ├── Dockerfile
│   ├── railway.json
│   └── package.json
├── widget-template-premium/    ← Premium widget template
│   ├── server.js                (intergram-premium'dan)
│   ├── static/
│   │   ├── js/simple-chat-premium.min.js
│   │   └── css/simple-chat-premium.css
│   ├── Dockerfile
│   ├── railway.json
│   └── package.json
├── backend/                     ← NestJS API
├── packages/database/           ← Prisma ORM
└── intergram/ (backup)
    intergram-premium/ (backup)
```

**Backend API Değişikliği:**
```typescript
// POST /api/tenants
{
  "name": "Acme Corp",
  "subdomain": "acme",
  "widgetType": "NORMAL" | "PREMIUM",  // Müşteri seçimi
  "plan": "FREE" | "STARTER" | "PRO"
}

// Backend deploy logic:
if (widgetType === "PREMIUM") {
  railwayService.deploy("widget-template-premium", config);
} else {
  railwayService.deploy("widget-template-normal", config);
}
```

**Pricing (Taslak):**
- **Normal Widget:** $19/month (AI chat only)
- **Premium Widget:** $49/month (AI + Live Support dual-tab)
- **Enterprise:** Custom pricing (unlimited widgets)

**İlerleme Güncellemesi:**
- ✅ widget-template-normal/ oluşturuldu
- ✅ widget-template-premium/ oluşturuldu
- ✅ Her ikisi için Dockerfile + railway.json hazır
- ⏳ Backend deployment logic (sonraki adım)
- ⏳ Stats dashboard UI (create widget modal)

---

### [05 Kasım 2025 - Gece] - GitHub Repository Kurulumu Tamamlandı

**🎉 Milestone: SaaS Monorepo GitHub'a Yüklendi**

**Repository Detayları:**
- **Yeni Repo:** https://github.com/photier/simplechat-saas
- **Branch:** main (orphan branch - temiz history)
- **Total Commits:** 1 (sıfırdan başladı, secret scanning sorunu çözüldü)
- **Dosya Sayısı:** 1513 files
- **Kod Satırı:** 288,177 insertions

**GitHub Secret Scanning Sorunu ve Çözümü:**

1. **Sorun:** İlk push denemesinde GitHub secret scanning blokladı
   ```
   remote: error: GH013: Repository rule violations found
   remote: - Push cannot contain secrets
   remote: GitHub Personal Access Token at .config/gh/hosts.yml
   ```

2. **Çözüm:** Orphan branch ile temiz history oluşturuldu
   ```bash
   git checkout --orphan temp-main
   git add -A
   git commit -m "feat: Initial SaaS architecture - NestJS + Prisma + Railway ready"
   git branch -D main
   git branch -m temp-main main
   git push -f https://github.com/photier/simplechat-saas.git main
   ```

3. **Sonuç:** ✅ Push başarılı, repository hazır

**Dizin Yapısı Korunması:**
- ✅ Orijinal "Simple Chat Bot" dizini dokunulmadı (backup)
- ✅ Yeni "Simple Chat Bot SaaS" dizini ayrı repository
- ✅ Her iki dizin birbirinden bağımsız

**Yanlışlıkla Yapılan Commit Temizlendi:**
Kullanıcı yanlışlıkla "Simple Chat Bot" dizininde commit yaptı. Temizlendi:
```bash
# Wrong directory'de temp-main branch oluşmuştu
cd "Simple Chat Bot"
git checkout staging    # Orijinal branch'e dön
git branch -D temp-main # Yanlış commit'i sil
# ✅ Dizin orijinal haline döndü
```

**Repository İçeriği:**
- ✅ NestJS 11.0.1 backend (packages ve modüller hazır)
- ✅ Prisma 6.18.0 database schema (multi-tenant)
- ✅ widget-template-normal/ (Dockerfile + railway.json)
- ✅ widget-template-premium/ (Dockerfile + railway.json)
- ✅ TypeScript 5.7.3 yapılandırması
- ✅ SAAS_MIGRATION_PLAN.md (1545 satır roadmap)
- ✅ CLAUDE.md (proje rehberi)
- ✅ .gitignore (kapsamlı)

**Sonraki Adımlar:**
- ⏳ Railway hesabı kurulumu
- ⏳ GitHub-Railway integration
- ⏳ PostgreSQL service eklenmesi
- ⏳ Environment variables yapılandırması
- ⏳ Backend API endpoints geliştirme
- ⏳ Stats dashboard "Create Widget" UI

**Git Workflow Notes:**
- `main` branch kullanıldı (default branch)
- Clean commit history (orphan branch ile başladı)
- Secret-free codebase (GitHub scanning passed ✅)
- Token: Secure personal access token kullanıldı

**Faz 1 İlerleme:** 🔄 50% (GitHub setup tamamlandı, Railway integration kaldı)

---

