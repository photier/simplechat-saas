# Stats Container Deployment Guide
**KRITIK: Her Session'da Oku!**

## Container Yapısı

Stats container **Dockerfile ile build edilir** - volume mount YOK!

### Dosya Konumları

**Host (Server):**
```
/root/stats/
├── Dockerfile              # Build tanımı
├── server.js               # Backend API
├── package.json
└── public/                 # Frontend dosyaları
    ├── api.js              # ⚠️ BURAYA DÜZENLEME YAP
    ├── index.html          # ⚠️ BURAYA DÜZENLEME YAP
    ├── login.html
    └── logo.png
```

**Container İçi:**
```
/app/
├── server.js               # Host'tan kopyalanır
├── package.json
└── public/                 # Host'tan kopyalanır
    ├── api.js
    ├── index.html
    ├── login.html
    └── logo.png
```

## ⚠️ ÇOK ÖNEMLİ: Deployment Süreci

### YANLIŞ Yöntem ❌
```bash
# Container içine doğrudan kopyalama - GEÇİCİ!
docker exec root-stats-1 cp /tmp/api.js /app/public/api.js
docker restart root-stats-1
# Bu değişiklik rebuild'de kaybolur!
```

### DOĞRU Yöntem ✅

#### 1. Host'a Kopyala
```bash
# Local'den server'a
scp /tmp/api.js root@92.113.21.229:/root/stats/public/api.js

# Veya cat ile:
cat /tmp/api.js | ssh root@92.113.21.229 'cat > /root/stats/public/api.js'
```

#### 2. Container'ı Rebuild Et
```bash
ssh root@92.113.21.229 "cd /root && docker compose build --no-cache stats && docker compose up -d stats"
```

**NEDEN --no-cache?**
- Docker cache nedeniyle eski dosyaları kullanabilir
- `--no-cache` her zaman fresh build garantisi verir

#### 3. Doğrula
```bash
# Container içindeki dosyayı kontrol et
ssh root@92.113.21.229 "docker exec root-stats-1 head -20 /app/public/api.js"

# Değişikliği ara
ssh root@92.113.21.229 "docker exec root-stats-1 grep 'aradığın değişiklik' /app/public/api.js"
```

## Hızlı Deployment (Tek Komut)

### Frontend (api.js veya index.html)
```bash
# 1. Dosyayı kopyala + rebuild
cat /tmp/api.js | ssh root@92.113.21.229 'cat > /root/stats/public/api.js' && \
ssh root@92.113.21.229 "cd /root && docker compose build --no-cache stats && docker compose up -d stats"

# 2. Doğrula
ssh root@92.113.21.229 "docker logs root-stats-1 --tail 10"
```

### Backend (server.js)
```bash
# 1. Dosyayı kopyala + rebuild
cat /tmp/server.js | ssh root@92.113.21.229 'cat > /root/stats/server.js' && \
ssh root@92.113.21.229 "cd /root && docker compose build --no-cache stats && docker compose up -d stats"

# 2. Doğrula
ssh root@92.113.21.229 "docker logs root-stats-1 --tail 10"
```

## Yaygın Hatalar ve Çözümleri

### Hata 1: Değişiklik Görünmüyor
**Sebep:** Cache veya yanlış dosya konumu

**Çözüm:**
```bash
# 1. Host'taki dosyayı kontrol et
ssh root@92.113.21.229 "head -20 /root/stats/public/api.js"

# 2. Rebuild ile --no-cache kullan
ssh root@92.113.21.229 "cd /root && docker compose build --no-cache stats && docker compose up -d stats"

# 3. Browser cache temizle
# Chrome: Ctrl+Shift+R (Win) / Cmd+Shift+R (Mac)
```

### Hata 2: Container Başlamıyor
**Sebep:** Syntax hatası veya eksik dosya

**Çözüm:**
```bash
# Log'lara bak
ssh root@92.113.21.229 "docker logs root-stats-1 --tail 50"

# Syntax kontrol et (local)
node -c /tmp/api.js
node -c /tmp/server.js
```

### Hata 3: 404 Not Found
**Sebep:** Dosya yolu yanlış veya kopyalanmamış

**Çözüm:**
```bash
# Container içindeki dosyaları listele
ssh root@92.113.21.229 "docker exec root-stats-1 ls -la /app/public/"

# Eksikse tekrar kopyala ve rebuild et
```

## API Endpoint Test

```bash
# Stats API test
ssh root@92.113.21.229 "curl -s http://localhost:3002/api/stats | jq '{aiHandled, humanHandled, totalUsers}'"

# Log kontrolü
ssh root@92.113.21.229 "docker logs root-stats-1 --tail 20"
```

## Backup Stratejisi

```bash
# Değişiklik öncesi backup
ssh root@92.113.21.229 "cp /root/stats/public/api.js /root/stats/public/api.js.backup-$(date +%Y%m%d-%H%M%S)"

# Image backup
ssh root@92.113.21.229 "docker commit root-stats-1 stats-backup:$(date +%Y%m%d-%H%M%S)"
```

## Özet: 3 Altın Kural

1. **ASLA container içine doğrudan düzenleme yapma** (restart'ta kaybolur)
2. **DAIMA host'taki dosyayı düzenle** (`/root/stats/public/`)
3. **REBUILD zorunlu** (`docker compose build --no-cache stats`)

---

**Son Güncelleme:** 2025-10-30
**Güncelleme Nedeni:** Session kaybında deployment sorunları yaşanıyor
