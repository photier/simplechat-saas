# Simple Chat Bot - Sistem Analizi ve Dokümantasyon
**Oluşturulma Tarihi**: 2025-10-27
**Son Güncelleme**: 2025-10-28 - Widget theme sistemi ve stats dashboard i18n detayları eklendi
**Analyst**: Claude AI Assistant
**Domain**: Aktif: simplechat.bot | Hedef: simplechat.bot

---

## 🎯 PROJE HEDEFİ
Simple Chat Bot - Premium SaaS chat widget çözümü olarak paketlenip satılacak chatbot sistemi.

---

## 🏗️ SİSTEM MİMARİSİ

### Docker Container'lar ve Servisler

| Servis | Container | Port | URL | Durum |
|--------|-----------|------|-----|--------|
| Normal Chat Widget | root-intergram-1 | 3000 | chat.simplechat.bot | ✅ Çalışıyor |
| Premium Chat Widget | root-intergram-premium-1 | 3001 | p-chat.simplechat.bot | ✅ Çalışıyor |
| Stats Dashboard | root-stats-1 | 80 | stats.simplechat.bot | ✅ Çalışıyor |
| n8n Workflow | root-n8n-1 | 5678 | n8n.photier.co | ✅ Çalışıyor |
| Qdrant Vector DB | root-qdrant-1 | 6333 | localhost:6333 | ✅ Çalışıyor |
| Traefik Proxy | root-traefik-1 | 80,443 | - | ✅ Çalışıyor |

### Dizin Yapısı

```
/root/
├── intergram/                    # Normal chat widget
│   ├── data/                    # Widget ayarları (volume mount)│   │   └── settings.json       # Theme color ve widget config
│   ├── server.js                # Ana server dosyası
│   ├── Dockerfile               
│   └── telegram-chat-widget/    # Frontend widget kodu
│       ├── node_modules/
│       ├── package.json
│       ├── static/              # CSS ve JS dosyaları
│       └── src/
│
├── intergram-premium/            # Premium chat widget (AI/Human modları)
│   ├── server.js
│   ├── Dockerfile
│   └── telegram-chat-widget/
│
├── stats/                        # İstatistik dashboard'u
│   ├── index.html
│   ├── api.js
│   └── nginx.conf
│
├── docker-compose.yml            # Ana orchestration dosyası
├── .env                          # Çevre değişkenleri
└── INTERGRAM_SYSTEM_DOCS.md      # Detaylı sistem dokümantasyonu
```

---

## 🔄 VERİ AKIŞLARI

### Normal Chat Akışı
1. Kullanıcı mesaj gönderir → Intergram server (port 3000)
2. GeoIP ile lokasyon tespiti
3. n8n webhook'a POST (userId, message, country, city)
4. n8n AI işleme (Qdrant RAG)
5. Database kayıt (photier.rag tablosu)
6. Socket.io ile kullanıcıya yanıt

### Premium Chat Akışı (Dual Mode)
- **AI Bot Tab**: Normal akış gibi, AI yanıtları
- **Live Support Tab**: Telegram üzerinden manuel yanıtlar
- Her iki tab ayrı konuşma geçmişine sahip
- human_mode flag ile ayrım yapılır

---

## 🔧 TEKNOLOJİ STACK

### Backend
- **Node.js**: Server.js dosyaları (Express framework)
- **Socket.io**: Real-time iletişim (v2.2.0)
- **Telegram Bot API**: Admin bildirimleri ve manuel yanıtlar
- **Docker & Docker Compose**: Container orchestration
- **Traefik**: Reverse proxy ve SSL yönetimi

### Frontend
- **Vanilla JS**: Widget implementasyonu
- **Socket.io Client**: Real-time chat
- **Bootstrap**: UI framework (Stats dashboard)
- **Custom CSS**: Chat widget stilleri

### Veritabanı ve AI
- **Qdrant**: Vector database (FAQ ve müşteri desteği için)
- **n8n**: Workflow automation & AI orchestration
- **n8n DataTables**: Widget ayarları ve konfigürasyonlar
- **GeoIP-Lite**: Kullanıcı lokasyon tespiti

---

## 📊 ÖNEMLİ ENDPOINT'LER

### Intergram Endpoints (Port 3000 & 3001)
- `/api/theme` - Widget tema rengi yönetimi (GET/POST)- `/api/widget-config` - Widget konfigürasyonu (GET/POST)- `/api/settings` - Servis mesajları kontrolü (GET/POST)
- `/send-to-user` - AI/Admin yanıtlarını al
- `/api/settings` - Servis mesajları kontrolü (GET/POST)
- `/usage-start` - Widget kullanım takibi
- `/widget/{chatId}` - Widget HTML

### n8n Webhook'lar
- Normal Chat: `https://n8n.photier.co/webhook/intergram-message`
- Premium Chat: `https://n8n.photier.co/webhook/admin-chat`
- Stats API: `https://n8n.photier.co/webhook/photier-stats`

---


## 🎨 WIDGET KONFİGÜRASYONU VE CUSTOMIZATION

### Theme ve Ayar Yönetimi

Widget ayarları dinamik olarak API'lerden çekiliyor ve persistent storage'da saklanıyor:

**Persistent Storage:**
- Ayarlar dosyası: `/app/data/settings.json` (container içinde)
- Volume mount: `intergram_data:/app/data`
- Format:
```json
{
  "serviceMessagesEnabled": false,
  "themeColor": "#5783EF",
  "widgetConfig": {
    "titleClosed": "",
    "titleOpen": "🤖 Photier AI Bot",
    "introMessage": "Hello, How can I help you today? ✨",
    "workingHoursEnabled": false,
    "workingHoursStart": "09:00",
    "workingHoursEnd": "18:00"
  }
}
```

**API Endpoints:**
- `GET /api/theme` - Mevcut tema rengini döndürür
- `POST /api/theme` - Tema rengini günceller (hex format: #RRGGBB)
- `GET /api/widget-config` - Widget konfigürasyonunu döndürür  
- `POST /api/widget-config` - Widget konfigürasyonunu günceller

**Widget Yüklenme Süreci:**

1. Footer'da Promise.all() ile iki API'den data çekiliyor:
```javascript
Promise.all([
    fetch('/api/widget-config').then(r => r.json()),
    fetch('/api/theme').then(r => r.json())
]).then(([config, theme]) => {
    window.intergramCustomizations = {
        mainColor: theme.themeColor || "#4c86f0",
        titleOpen: config.config.titleOpen,
        introMessage: config.config.introMessage,
        ...
    };
    // Widget script yüklenir
});
```

2. Widget source code'da config merge edilir:
```javascript
const conf = { ...defaultConfiguration, ...window.intergramCustomizations };
```

3. `/usage-start` endpoint'ine POST yapılır:
   - Response: `{ online: true, themeColor: "#5783EF" }`
   - Online ise widget render edilir

### Widget Source Code Yapısı

```
/root/intergram/telegram-chat-widget/src/
├── widget/
│   ├── default-configuration.js  # Default config değerleri
│   ├── widget-index.js          # Ana yükleme mantığı
│   ├── widget.js                # Widget component
│   ├── chat-frame.js            # iframe yönetimi
│   └── style.js                 # Stil tanımları
└── chat/                        # Chat UI components
```

**Default Configuration (`default-configuration.js`):**
- `mainColor: '#9F7AEA'` (fallback)
- `desktopHeight: 500`, `desktopWidth: 370`
- `titleClosed`, `titleOpen`, `introMessage` gibi özelleştirilebilir değerler

### Stats Dashboard Dil Desteği

Stats dashboard'una Türkçe/İngilizce dil switcher eklendi:

**Özellikler:**
- localStorage'da dil tercihi saklanıyor
- `data-i18n` attribute'ları ile 50+ element çevriliyor
- `window.translations` objesi ile çeviri yönetimi
- Dil değişikliği sayfayı yenilemeden uygulanıyor

**Implementasyon:**
- Lokasyon: `/root/stats/index.html`
- Translation fonksiyonları: `window.changeLang()`, `window.translatePage()`
- Dropdown component: Satır 1037-1051


---

## 🚨 TESPİT EDİLEN SORUNLAR VE İYİLEŞTİRME ALANLARI
## 🚨 TESPİT EDİLEN SORUNLAR VE İYİLEŞTİRME ALANLARI

### 1. Domain Geçişi Hazırlıkları
- ❌ simplechat.bot domaini için konfigürasyonlar yapılmamış
- ❌ SSL sertifikaları henüz ayarlanmamış
- ❌ DNS kayıtları oluşturulmamış

### 2. Güvenlik
- ⚠️ Telegram token'lar .env'de plain text (güvenli değil production için)
- ⚠️ n8n admin paneli public erişime açık
- ⚠️ Stats dashboard'u basit auth koruması var ama geliştirilmeli

### 3. Performans ve Ölçeklenebilirlik
- ⚠️ Socket.io connection limitleri belirlenmemiş
- ⚠️ Rate limiting implementasyonu yok
- ⚠️ Backup stratejisi manuel (otomatik backup sistemi kurulmalı)

### 4. Kod Kalitesi
- ✅ Footer duplicate kod sorunu çözüldü (membership-agreement için 2 kod bloğu vardı)  - Hardcoded mainColor değeri ile hemen yüklenen eski kod silindi  - Sadece API'den dinamik olarak renk çeken kod bırakıldı
- ⚠️ Birçok backup dosyası root dizinde dağınık
- ⚠️ Error handling bazı yerlerde eksik
- ⚠️ Loglama sistemi yetersiz

### 5. SaaS Özellikleri Eksik
- ❌ Multi-tenant mimari yok
- ❌ Billing/subscription sistemi yok
- ❌ User management sistemi yok
- ❌ API key yönetimi yok
- ❌ Usage quota/limits yok
- ❌ Admin panel eksik

---

## 📋 ÖNCELİKLİ YAPILMASI GEREKENLER

### Kısa Vadeli (1-2 Hafta)
1. [ ] Backup stratejisi otomatikleştir
2. [ ] Error logging sistemi kur (Winston/Pino)
3. [ ] Rate limiting ekle
4. [ ] Stats dashboard güvenliğini artır
5. [ ] Kod temizliği yap (gereksiz backup dosyaları)

### Orta Vadeli (1 Ay)
1. [ ] Multi-tenant mimari tasarla ve implementle
2. [ ] User authentication/authorization sistemi
3. [ ] Admin panel geliştir
4. [ ] API key management sistemi
5. [ ] Usage tracking ve quota sistemi

### Uzun Vadeli (2-3 Ay)
1. [ ] simplechat.bot domain geçişi
2. [ ] Billing/subscription entegrasyonu (Stripe/Paddle)
3. [ ] Onboarding flow
4. [ ] Customer dashboard
5. [ ] Analytics ve reporting özellikleri
6. [ ] White-label özellikleri

---

## 💡 ÖNERİLER

### Acil Güvenlik Önlemleri
1. Environment variable'ları HashiCorp Vault veya AWS Secrets Manager ile yönet
2. n8n admin paneline IP whitelist veya VPN erişimi
3. SQL injection ve XSS korumaları kontrol et

### Kod Organizasyonu
1. Monorepo yapısına geç (Lerna/Nx)
2. TypeScript'e migrate et
3. Unit ve integration testler ekle
4. CI/CD pipeline kur

### SaaS Dönüşümü
1. Database schema'yı multi-tenant için yeniden tasarla
2. Tenant isolation stratejisi belirle
3. API versioning stratejisi
4. SDK'lar geliştir (JS, React, Vue)

### Monitoring ve Observability
1. Prometheus + Grafana kur
2. Sentry error tracking entegre et
3. Uptime monitoring (UptimeRobot/Pingdom)
4. Application Performance Monitoring (APM)

---

## 📚 KAYNAKLAR VE NOTLAR

### Önemli Dosyalar
- Ana dokümantasyon: `/root/INTERGRAM_SYSTEM_DOCS.md`
- Docker config: `/root/docker-compose.yml`
- Environment: `/root/.env`

### Erişim Bilgileri
- SSH: root@92.113.21.229
- Current domain: simplechat.bot
- Production domain: simplechat.bot

### Teknoloji Versiyonları
- Node.js: (kontrol edilecek)
- Socket.io: 2.2.0
- Docker: (kontrol edilecek)
- Ubuntu: 24.04.3 LTS

---

## 🎯 SONUÇ

Simple Chat Bot projesi temel olarak çalışır durumda ancak SaaS ürün olarak satılabilmesi için ciddi geliştirmeler gerekiyor. Özellikle multi-tenant mimari, billing sistemi ve güvenlik iyileştirmeleri kritik. Mevcut sistemin iyi çalışan kısımları korunarak, adım adım SaaS dönüşümü yapılmalı.

**Tahmini SaaS-Ready Süresi**: 2-3 ay yoğun geliştirme ile MVP hazır olabilir.

---

*Bu doküman canlı bir doküman olup, sistem geliştikçe güncellenmelidir.*

---

## 📦 STATS CONTAINER DEPLOYMENT - KRITIK!

**⚠️ HER SESSION BAŞINDA OKU: /root/STATS_CONTAINER_DEPLOYMENT_GUIDE.md**

### Hızlı Hatırlatma

Stats container **Dockerfile ile build edilir** - Volume mount YOK!

**DOĞRU Deployment:**
```bash
# 1. Host'a kopyala
cat /tmp/api.js | ssh root@92.113.21.229 "cat > /root/stats/public/api.js"

# 2. Rebuild (--no-cache zorunlu!)
ssh root@92.113.21.229 "cd /root && docker compose build --no-cache stats && docker compose up -d stats"

# 3. Doğrula
ssh root@92.113.21.229 "docker logs root-stats-1 --tail 10"
```

**YANLIŞ Deployment (GEÇİCİ!):**
```bash
# ❌ YAPMA - Rebuild'de kaybolur!
docker exec root-stats-1 cp /tmp/api.js /app/public/api.js
```

**Dosya Yolları:**
- Host: /root/stats/public/api.js (Buraya düzenle)
- Container: /app/public/api.js (Buradan oku - doğrulama için)

**Detaylı Bilgi:** /root/STATS_CONTAINER_DEPLOYMENT_GUIDE.md

