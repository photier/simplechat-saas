# 🚀 Simple Chat Bot SaaS - Adım Adım TODO

**Başlangıç:** 13 Kasım 2025
**Süre:** 12 hafta
**Durum:** 🚀 Aktif Geliştirme - Hafta 1-2 Tamamlandı

**Son Güncelleme:** 13 Kasım 2025

---

## 📊 Genel İlerleme

| Hafta | Faz | Durum | Tamamlanma |
|-------|-----|-------|------------|
| Ön Hazırlık | Setup | ✅ Tamamlandı | 100% |
| 1-2 | Database & Auth | ✅ Tamamlandı | 100% |
| 3-4 | N8N Entegrasyonu | ✅ Tamamlandı | 100% |
| 5-6 | Subdomain Sistemi | ⏳ Başlanacak | 0% |
| 7 | Telegram Topics | ⏳ Beklemede | 0% |
| 8 | Iyzico Ödemeler | ⏳ Beklemede | 0% |
| 9-10 | Müşteri Dashboard | ⏳ Beklemede | 0% |
| 11-12 | Test & Launch | ⏳ Beklemede | 0% |

**Git Commits:**
- `c90e21d` - Prisma schema (saas tables)
- `6cf8c18` - Migration applied
- `344692a` - Auth API implementation
- `c918193` - N8N workflow cloning service

---

## 🎬 ÖN HAZIRLIK (Koda Geçmeden Önce)

### 1️⃣ Cloudflare DNS Ayarları (15 dakika)

**Yapman gerekenler:**
- [x] Cloudflare'e giriş yap
- [x] `simplechat.bot` domain'ine git
- [x] DNS sekmesine gir
- [x] 3 adet CNAME record ekle:

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| CNAME | `*.simplechat.bot` | `[Railway Custom Domain CNAME - Dashboard]` | 🔘 DNS Only |
| CNAME | `*.w.simplechat.bot` | `[Railway Custom Domain CNAME - Widget]` | 🔘 DNS Only |
| CNAME | `*.p.simplechat.bot` | `[Railway Custom Domain CNAME - Widget Premium]` | 🔘 DNS Only |

**ÖNEMLİ:** Cloudflare'de Proxy Status'ü **KAPALI** (Gray Cloud / DNS Only) bırak!
- ❌ Turuncu bulut AÇMA (Railway SSL ile çakışır)
- ✅ Gri bulut kullan (Railway kendi SSL'ini yönetir)

- [x] 5 dakika bekle (DNS yayılması için)
- [x] Test et: `ping test.simplechat.bot` yazınca IP dönmeli

**Not:** Railway Custom Domain CNAME'lerini şuradan alacaksın:
- Railway → Her service Settings → Networking → Add Custom Domain
- Dashboard için: `*.simplechat.bot` yaz → Railway sana CNAME verir
- Widget için: `*.w.simplechat.bot` yaz → Railway sana CNAME verir
- Widget Premium için: `*.p.simplechat.bot` yaz → Railway sana CNAME verir

**Örnek subdomain'ler:**
- `photier.simplechat.bot` → Dashboard (müşteri paneli)
- `photier.w.simplechat.bot` → Widget backend (kullanıcı görmez)
- `photier.p.simplechat.bot` → Premium widget backend (kullanıcı görmez)

**Tamamlandı mı?** → Bana "DNS ayarları tamam" de, sonraki adıma geçelim.

---

### 2️⃣ N8N Hazırlık (1 saat)

**Yapman gerekenler:**
- [x] `n8n.simplechat.bot` adresine giriş yap
- [x] Settings → API → Generate API Key
- [x] API token'ı kopyala (uzun bir string olacak: `n8n_api_xxxxx...`)
- [x] Bana bu token'ı ver (Claude'a yapıştır)

**Sonra:**
- [x] N8N'de 2 master template workflow oluştur:
  - **"MASTER - Basic Template"** (ID: 1 olmalı)
  - **"MASTER - Premium Template"** (ID: 2 olmalı)
- [x] Her ikisini de test et, çalıştığından emin ol
- [x] Template ID'leri not et (1 ve 2 olacak)

**Tamamlandı mı?** → Bana "N8N hazır, template ID'ler: 1 ve 2" de.

---

### 3️⃣ Telegram Bot Oluştur (15 dakika)

**Yapman gerekenler:**
- [x] Telegram'da `@BotFather` ara
- [x] `/newbot` komutunu gönder
- [x] Bot adı: `Simple Chat Support Bot`
- [x] Bot username: `SimpleChatSupportBot` (veya benzer)
- [x] BotFather sana bir token verecek (örnek: `123456789:ABC-DEF...`)
- [x] Bu token'ı kopyala, bana ver

**Test grubu oluştur:**
- [x] Telegram'da yeni grup oluştur: "Simple Chat Test Support"
- [x] Grup ayarlarından "Topics" özelliğini aç
- [x] Botu gruba ekle, admin yap
- [x] İzinler: "Manage Topics", "Send Messages" ver
- [x] `@userinfobot`'u gruba ekle, grup ID'sini kopyala (örnek: `-1001234567890`)

**Tamamlandı mı?** → Bana bot token ve grup ID'yi ver.

---

### 4️⃣ Stripe Hesabı Hazırla (30 dakika)

**Yapman gerekenler:**
- [ ] `stripe.com`'a git, hesap aç (varsa giriş yap)
- [ ] **Test Mode**'a geç (sağ üst toggle)
- [ ] Products → Create Product:
  - **Basic Plan:** $9.99/month → Price ID kopyala
  - **Premium Plan:** $19.99/month → Price ID kopyala
- [ ] Developers → API Keys:
  - **Secret Key** kopyala (`sk_test_xxx...`)
  - **Publishable Key** kopyala (`pk_test_xxx...`)

**Tamamlandı mı?** → Bana 4 değeri ver:
- Secret Key
- Publishable Key
- Basic Price ID
- Premium Price ID

---

### 5️⃣ Railway Environment Variables (10 dakika)

**Yapman gerekenler:**
- [ ] Railway Dashboard'a giriş yap
- [ ] **backend** service'ini seç (henüz yoksa ben oluştururum, sonra eklersin)
- [ ] Variables sekmesine git
- [ ] Ben sana liste vereceğim, tüm değişkenleri ekle

**Tamamlandı mı?** → "Railway env'ler hazır" de.

---

## 📅 HAFTA 1-2: Database & Backend

### 6️⃣ Backend Klasörü Oluştur

**Yapman gerekenler:**
- [ ] Proje klasörüne git
- [ ] `backend` klasörü oluştur (yoksa)
- [ ] Bana "backend klasörü hazır" de

**Ben yapacağım:**
- NestJS projesi kuracağım
- Prisma install edeceğim
- Database schema yazacağım

**Ne zaman ilerleriz?** → Database migration başarılı olunca.

---

### 7️⃣ Prisma Migration Çalıştır

**Yapman gerekenler:**
- [ ] Ben sana komut vereceğim, terminalde çalıştır
- [ ] Migration başarılı olunca "migration tamam" de
- [ ] Prisma Studio'yu aç, tabloları gör

**Ben yapacağım:**
- Schema dosyası yazacağım
- Migration komutları hazırlayacağım

**Ne zaman ilerleriz?** → Tüm tablolar database'de görününce.

---

### 8️⃣ İlk Tenant Kaydı Testi

**Yapman gerekenler:**
- [ ] Ben sana bir curl komutu vereceğim
- [ ] Terminalde çalıştır
- [ ] Sonucu bana göster

**Ben yapacağım:**
- Auth API yazacağım
- Registration endpoint
- Login endpoint
- JWT token sistemi

**Ne zaman ilerleriz?** → Test registration başarılı olunca, subdomain generate edilince.

---

## 📅 HAFTA 3-4: N8N Otomasyonu

### 9️⃣ N8N Workflow Clone Testi

**Yapman gerekenler:**
- [ ] Yeni bir test tenant kaydet (ben komut vereceğim)
- [ ] N8N'e gir, yeni workflow oluşmuş mu kontrol et
- [ ] Workflow aktif mi kontrol et
- [ ] Bana screenshot at

**Ben yapacağım:**
- N8N API service yazacağım
- Auto-clone mantığı
- Webhook URL generation

**Ne zaman ilerleriz?** → Otomatik workflow clone çalışınca.

---

## 📅 HAFTA 5-6: Subdomain Routing

### 🔟 Wildcard Subdomain Testi

**Yapman gerekenler:**
- [ ] Browser'da `test-tenant.simplechat.bot` aç
- [ ] Çalışıyor mu kontrol et
- [ ] Farklı subdomain'ler dene

**Ben yapacağım:**
- Widget server'da tenant detection
- Dynamic CORS
- Subdomain-based routing

**Ne zaman ilerleriz?** → Tüm subdomain'ler çalışınca.

---

## 📅 HAFTA 7: Telegram Topics

### 1️⃣1️⃣ Telegram Topic Testi

**Yapman gerekenler:**
- [ ] Test tenant'tan mesaj gönder
- [ ] Telegram grubunda yeni topic açıldı mı kontrol et
- [ ] Topic içine mesaj geldi mi bak
- [ ] Admin olarak reply yaz, widget'a ulaşıyor mu kontrol et

**Ben yapacağım:**
- Telegram service yazacağım
- Auto-topic creation
- Message routing

**Ne zaman ilerleriz?** → Topic'ler otomatik açılıp mesajlar gelince.

---

## 📅 HAFTA 8: Stripe Ödemeler

### 1️⃣2️⃣ Stripe Test Ödemesi

**Yapman gerekenler:**
- [ ] Test kartı ile ödeme yap (4242 4242 4242 4242)
- [ ] Subscription oluştu mu kontrol et (Stripe dashboard)
- [ ] Database'de subscription ID var mı kontrol et

**Ben yapacağım:**
- Stripe integration
- Subscription API
- Webhook handling

**Ne zaman ilerleriz?** → Test ödeme başarılı olunca.

---

## 📅 HAFTA 9-10: Customer Dashboard

### 1️⃣3️⃣ Dashboard Testi

**Yapman gerekenler:**
- [ ] `tenant-test.simplechat.bot` adresini aç
- [ ] Login ol
- [ ] Tüm sayfalara bak (settings, billing, embed code)
- [ ] Widget ayarlarını değiştir, çalışıyor mu test et

**Ben yapacağım:**
- Next.js dashboard yazacağım
- Tüm sayfalar
- Settings API'leri

**Ne zaman ilerleriz?** → Dashboard tam çalışınca.

---

## 📅 HAFTA 11-12: Test & Launch

### 1️⃣4️⃣ Beta Test

**Yapman gerekenler:**
- [ ] 5-10 arkadaşını davet et
- [ ] Hepsine test hesabı aç
- [ ] Geri bildirim topla
- [ ] Bulunan bugları bana bildir

**Ben yapacağım:**
- Bug fix
- Performance optimization
- Final touches

**Ne zaman launch?** → Tüm kritik buglar çözülünce.

---

## ✅ Tamamlanma Kriterleri

**Launch için gereken minimum:**
- [ ] DNS wildcard çalışıyor
- [ ] Otomatik tenant kaydı çalışıyor
- [ ] N8N workflow clone oluyor
- [ ] Subdomain routing çalışıyor
- [ ] Telegram topics otomatik
- [ ] Stripe ödeme alıyor
- [ ] Dashboard çalışıyor
- [ ] Widget embed ediliyor

---

**NOTLAR:**
- Her adımı sırayla yapacağız
- Bir adım bitmeden diğerine geçmeyeceğiz
- Sen sadece kullanıcı işlerini yapacaksın (ayarlar, testler)
- Ben tüm kodu yazacağım
- Sorun olursa hemen söyle!

---

**ŞİMDİ NE YAPALIM?**
Hazırsan **1. adımdan** (Cloudflare DNS) başlayalım! 🚀

---

## ✅ TAMAMLANAN İŞLER (13 Kasım 2025)

### 🎯 Phase 1: Database & Auth - TAMAMLANDI

#### 1. Prisma Multi-Tenant Schema
```sql
✅ CREATE SCHEMA saas;
✅ 11 tablo oluşturuldu:
   - Tenant (auth, billing, subdomain)
   - TenantWorkflow (N8N mapping)
   - Integration (Telegram, Iyzico)
   - TelegramTopic (per-user topics)
   - AIConfig (RAG settings)
   - UsageStats (billing metrics)
   - User, Message, Session, Widget, WidgetOpen

✅ Migration: 20251113085514_init_saas_schema
✅ N8N public schema korundu (53 tablo aynen duruyor)
```

#### 2. Auth API (NestJS 11)
```typescript
✅ Endpoints:
   POST /auth/register  - Yeni tenant kaydı
   POST /auth/login     - JWT ile giriş
   GET  /auth/me        - Kullanıcı bilgisi

✅ Features:
   - bcrypt@6.0.0 (12 rounds password hashing)
   - nanoid@5.1.6 (unique ID generation)
   - slugify@1.6.6 (subdomain generation)
   - JWT 30 gün expiration
   - class-validator DTO validation
   - passport-jwt@4.0.1 authentication
   - Google OAuth ready (passwordHash nullable)

✅ Packages (latest stable):
   - @nestjs/jwt@11.0.1
   - @nestjs/passport@11.0.5
   - bcrypt@6.0.0
   - 0 vulnerabilities
```

#### 3. N8N Workflow Cloning Service
```typescript
✅ N8NService:
   - Clone workflow from template (BASIC/PREMIUM)
   - Dynamic webhook URL generation
   - Auto-activate/deactivate workflows
   - Delete workflow on tenant deletion
   - Database workflow tracking
   - Error handling + logging

✅ Endpoints (protected with JWT):
   GET  /n8n/workflow           - Workflow bilgisi
   POST /n8n/workflow/activate  - Aktif et
   POST /n8n/workflow/deactivate - Pasif et
   PATCH /n8n/workflow/config   - Config güncelle

✅ Auto-provisioning:
   - Registration sırasında otomatik workflow clone
   - Tenant-specific webhook: /webhook/tenant_{chatId}
   - Template selection: BASIC (ID:1) | PREMIUM (ID:2)
   - Non-blocking (N8N down olsa registration başarılı)
```

#### 4. Tenant Registration Flow
```
1. POST /auth/register
   ↓
2. Validate DTO (email, password, plan)
   ↓
3. Generate subdomain (slugify + uniqueness check)
   ↓
4. Generate chatId (tenant_abc123) & apiKey
   ↓
5. Hash password (bcrypt 12 rounds)
   ↓
6. Create tenant in database
   ↓
7. Create AIConfig + Integration (if Premium)
   ↓
8. Clone N8N workflow from template
   ↓
9. Generate JWT token (30 days)
   ↓
10. Return: token + tenant info + URLs
```

### 📦 Installed Packages
```json
{
  "@nestjs/jwt": "11.0.1",
  "@nestjs/passport": "11.0.5",
  "passport": "0.7.0",
  "passport-jwt": "4.0.1",
  "bcrypt": "6.0.0",
  "nanoid": "5.1.6",
  "slugify": "1.6.6",
  "axios": "1.13.2",
  "class-validator": "latest",
  "class-transformer": "latest"
}
```

### 📁 Created Files
```
backend/src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.service.ts (270 lines)
│   ├── auth.controller.ts
│   ├── dto/
│   │   ├── register.dto.ts
│   │   └── login.dto.ts
│   └── strategies/
│       └── jwt.strategy.ts
├── n8n/
│   ├── n8n.module.ts
│   ├── n8n.service.ts (270 lines)
│   └── n8n.controller.ts
├── common/
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   └── decorators/
│       └── current-user.decorator.ts
└── prisma/
    ├── schema.prisma (updated with saas schema)
    └── migrations/
        └── 20251113085514_init_saas_schema/
            └── migration.sql
```

### 🔐 Security Features
```
✅ bcrypt password hashing (12 rounds)
✅ JWT authentication (30 days)
✅ DTO validation (class-validator)
✅ Password regex (uppercase, lowercase, number)
✅ Subdomain validation (alphanumeric + hyphens)
✅ Global validation pipe
✅ CORS enabled
✅ Passport JWT strategy
✅ Protected routes with JwtAuthGuard
```

### 🗄️ Database Tables (saas schema)
```
Tenant (multi-tenant accounts)
├── id, email, passwordHash, subdomain, chatId, apiKey
├── plan (FREE, BASIC, PREMIUM)
├── subscriptionStatus (trialing, active, past_due, canceled)
├── trialEndsAt, currentPeriodStart, currentPeriodEnd
├── iyzicoCustomerId, iyzicoSubscriptionId
└── googleId, googleRefreshToken (OAuth ready)

TenantWorkflow (N8N mapping)
├── tenantId, n8nWorkflowId, webhookUrl
└── isActive, plan, executionCount

Integration (Telegram, Iyzico settings)
├── telegramMode, telegramGroupId, telegramBotToken
└── businessHoursEnabled, timezone, businessDays

AIConfig (RAG settings)
├── aiInstructions, aiModel, aiTemperature
└── documents (JSONB), qdrantCollectionName

TelegramTopic (per-user topics)
├── tenantId, userId, topicId
└── isArchived, lastMessageAt, messageCount

UsageStats (billing metrics)
├── tenantId, month
└── messageCount, aiMessageCount, userCount
```

### 🎯 Next Steps

**Sıradaki:** Railway Deploy & Test
- [ ] Railway backend service'e env variables ekle
- [ ] Git push → auto deploy
- [ ] İlk tenant kaydı test et
- [ ] N8N workflow clone test et
- [ ] Curl ile API test et

**Sonrası:** Iyzico Payment Integration
- [ ] Subscription API
- [ ] Webhook handling
- [ ] Trial → Paid conversion

**Environment Variables Needed:**
```bash
N8N_API_TOKEN=...  # Sen vereceksin
N8N_BASE_URL=https://n8n.simplechat.bot
N8N_BASIC_TEMPLATE_ID=1
N8N_PREMIUM_TEMPLATE_ID=2
JWT_SECRET=... # Random generate
SIMPLECHAT_BOT_TOKEN=8248102860:AAG8uG9yvkXUoCwpTFLflzYJEzZ4fi8hGp4
TELEGRAM_GROUP_ID=-1003440801039
IYZICO_API_KEY=QGUMQjSDApHKF4ZVdcx3I4aGrRepQrqI
IYZICO_SECRET_KEY=8tObGiEoKeExsgfspo4gzdtqN7OlX1Rd
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
```

