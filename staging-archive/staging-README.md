# Staging Environment

**Bu klasör DENEME ortamıdır.**

## Amaç
Production'a geçmeden önce yeni özellikleri test etmek için kullanılır.

## İçerik

### Widget'lar
- **Normal Widget**: `/staging/intergram/`
  - React 19 + Vite 7 + TypeScript ile yazılmış
  - Tek chat penceresi (AI yanıtlı)
  - Port: 3100 (localhost)

- **Premium Widget**: `/staging/intergram-premium/`
  - React 19 + Vite 7 + TypeScript ile yazılmış
  - Dual-tab sistem (AI Bot + Live Support)
  - Separate conversation histories per tab
  - human_mode flag ile Socket.io iletişimi
  - Port: 3101 (localhost)

### Dosya Yapısı
```
/root/staging/
├── README.md (bu dosya)
├── intergram/
│   ├── server.js
│   ├── data/
│   └── telegram-chat-widget/static/
│       ├── js/
│       │   ├── simple-chat.min.js (YENİ React widget)
│       │   ├── chat.js (ESKİ Preact widget)
│       │   └── widget.js (ESKİ)
│       └── css/
│           ├── simple-chat.css (YENİ)
│           └── chat.css (ESKİ)
└── intergram-premium/
    ├── server.js
    ├── data/
    └── telegram-chat-widget/static/
        ├── js/
        │   ├── simple-chat-premium.min.js (YENİ React widget)
        │   ├── chat.js (ESKİ Preact widget)
        │   └── widget.js (ESKİ)
        └── css/
            ├── simple-chat-premium.css (YENİ)
            └── chat.css (ESKİ)
```

## Docker Container'lar
- `staging-intergram-1` - Normal widget (şu anda kapalı, network sorunu)
- `staging-intergram-premium-1` - Premium widget (ÇALIŞIYOR ✅)
- `staging-stats-1` - Stats dashboard
- `staging-postgres-1` - PostgreSQL database

## Deployment Workflow

### 1. Yerel Geliştirme
```bash
# Widget'ları build et
cd simple-chat-saas/apps/widget
npm run build

cd simple-chat-saas/apps/widget-premium
npm run build
```

### 2. Staging'e Upload
```bash
# Normal widget
rsync -avz simple-chat-saas/apps/widget/dist/simple-chat.min.js \
  root@92.113.21.229:/root/staging/intergram/telegram-chat-widget/static/js/

rsync -avz simple-chat-saas/apps/widget/dist/simple-chat.css \
  root@92.113.21.229:/root/staging/intergram/telegram-chat-widget/static/css/

# Premium widget
rsync -avz simple-chat-saas/apps/widget-premium/dist/simple-chat-premium.min.js \
  root@92.113.21.229:/root/staging/intergram-premium/telegram-chat-widget/static/js/

rsync -avz simple-chat-saas/apps/widget-premium/dist/simple-chat-premium.css \
  root@92.113.21.229:/root/staging/intergram-premium/telegram-chat-widget/static/css/
```

### 3. Container'ları Restart Et
```bash
ssh root@92.113.21.229 "docker restart staging-intergram-premium-1"
```

## Test Etme

### Localhost'ta Test

Staging container'lar localhost üzerinden erişilebilir:

**Normal Widget:**
- URL: http://localhost:3100
- Test dosyası: `test-staging-normal.html`

**Premium Widget:**
- URL: http://localhost:3101
- Test dosyası: `test-staging-premium.html`

Test dosyalarını tarayıcıda aç:
```bash
open test-staging-normal.html
open test-staging-premium.html
```

### Footer Kodları

Kendi web sitende test etmek için `footer-codes-staging.php` dosyasındaki kodları kullan.

**Önemli Değişiklikler:**
- Eski: `/js/widget.js` → Yeni: `/static/js/simple-chat.min.js`
- Eski: `/js/widget.js` → Yeni: `/static/js/simple-chat-premium.min.js`

### Staging Sunucu URL'leri (DNS Ayarlandıysa)

- Normal: https://staging-chat.simplechat.bot
- Premium: https://staging-pchat.simplechat.bot

## Production'a Geçiş

Staging'de test edildikten sonra:
1. Production dizinlerine kopyala (`/root/intergram/` ve `/root/intergram-premium/`)
2. Production container'larını restart et
3. Production URL'lerde test et

## Önemli Notlar

⚠️ **Bu ortam production DEĞİLDİR!**
- Gerçek kullanıcı verileri yok
- Test verileri kullanılır
- İstediğin kadar hata yapabilirsin
- Breaking changes yapabilirsin

✅ **Staging ortamında yapılabilenler:**
- Yeni özellikler test edilir
- Bug fix'ler denenir
- Breaking changes test edilir
- Performance testleri yapılır

❌ **Yapılmaması gerekenler:**
- Production verilerini staging'e kopyalama
- Staging'i production olarak kullanma
- Sensitive data saklama

## Son Güncelleme
Tarih: 3 Kasım 2025
Güncelleme: React 19 widget'ları staging'e yüklendi
