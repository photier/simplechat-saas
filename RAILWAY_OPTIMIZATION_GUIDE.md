# 🚀 Railway Build Optimization Guide

## Problem
Build süreleri çok uzun (~8 dakika) çünkü her commit'te TÜM servisler rebuild oluyor.

## Çözüm: Turborepo + npm workspaces

Bu değişikliklerle Railway build süreleri **8 dakikadan ~2 dakikaya** düşecek.

---

## ✅ Yapılan Değişiklikler (Git'te)

1. **Turborepo eklendi** (`turbo.json`)
   - Incremental builds
   - Build caching
   - Sadece değişen paketler build olur

2. **npm workspaces aktif edildi** (`package.json`)
   - Shared dependencies (node_modules tekrarı yok)
   - Root'tan tek `npm install`
   - 1.2GB → ~400MB dependencies

3. **Railway config'leri güncellendi**
   - Her servis monorepo ROOT'tan build oluyor
   - Turbo build command'ları eklendi
   - `railway.json` dosyaları optimize edildi

---

## 🔧 Railway UI'da Yapılması Gerekenler

**ÖNEMLİ:** Her servis için aşağıdaki ayarları Railway Dashboard'tan yapmalısın:

### 1. Dashboard Service
Railway Dashboard → `dashboard` service → Settings

- **Root Directory:** `.` (boş bırak veya nokta koy)
  - Eskisi: `apps/dashboard` ❌
  - Yenisi: `.` ✅

- **Build Command:** (Otomatik algılanır - railway.json'dan)
  ```bash
  npm install && npm run build:dashboard
  ```

- **Start Command:** (Otomatik algılanır)
  ```bash
  cd apps/dashboard && npm start
  ```

### 2. Widget Service
Railway Dashboard → `widget` service → Settings

- **Root Directory:** `.`
- **Build Command:** `npm install && npm run build:widget`
- **Start Command:** `cd apps/widget && npm start`

### 3. Widget Premium Service
Railway Dashboard → `widget-premium` service → Settings

- **Root Directory:** `.`
- **Build Command:** `npm install && npm run build:widget-premium`
- **Start Command:** `cd apps/widget-premium && npm start`

### 4. Stats Service
Railway Dashboard → `stats` service → Settings

- **Root Directory:** `.`
- **Build Command:** `npm install && npm run build:stats`
- **Start Command:** `cd stats && npm start`

### 5. Backend Service
Railway Dashboard → `backend` service → Settings

- **Root Directory:** `.`
- **Build Command:** Uses Dockerfile (no change needed)
- **Start Command:** `npm run start:prod`

---

## 📊 Beklenen Sonuçlar

### Öncesi (8 dakika build):
```
✗ Dashboard build: 2 min (dependencies 1 min, build 1 min)
✗ Widget build: 2 min
✗ Widget-Premium build: 2 min
✗ Stats build: 1 min
✗ Backend build: 1 min
─────────────────────
TOPLAM: ~8 dakika
```

### Sonrası (2 dakika build):
```
✓ npm install (root, tek seferde): 30 sn
✓ turbo build (sadece değişen servis): 1-2 dk
─────────────────────
TOPLAM: ~2 dakika
```

**Ek bonuslar:**
- ✅ Değişmeyen servisler build olmuyor (turbo cache)
- ✅ Shared dependencies (1.2GB → 400MB)
- ✅ Turbo remote cache (opsiyonel, daha da hızlandırabilir)

---

## 🧪 Test Etme

1. **Railway UI'daki ayarları yap** (yukarıda anlattığım gibi)
2. **Yeni bir commit push et:**
   ```bash
   git add .
   git commit -m "test: Verify turborepo optimization"
   git push origin main
   ```
3. **Railway build logs'unu izle:**
   - Dashboard build sadece dashboard değişmişse çalışır
   - npm install tek seferde tüm dependencies yükler
   - Build süresi ~2 dakikaya düşmeli

---

## 📝 Notlar

- **watchPaths artık çalışmıyor** - Railway monorepo'da desteklemiyor
- **Turbo bu sorunu çözüyor** - Incremental builds sayesinde sadece değişen paketler build olur
- **Remote cache eklenebilir** - Vercel remote cache ile daha da hızlandırılabilir (opsiyonel)

---

## 🔍 Sorun Giderme

### Build hala 8 dakika sürüyor?
- Railway UI'da Root Directory ayarını kontrol et (`.` olmalı)
- railway.json'ların push edildiğini doğrula
- Railway'de "Redeploy" yerine yeni commit push et

### Build failed hatası?
- npm install loglarını kontrol et
- turbo komutunun çalıştığını doğrula: `npx turbo run build`
- package.json workspaces'i doğru mu kontrol et

### Sadece bir servis değişti ama tüm servisler build oluyor?
- Turbo cache temizlenmiş olabilir
- Railway'de aynı anda birden fazla deploy tetiklenmişse hepsi build olur
- İlk deploy'dan sonra ikincisinde optimize edilmiş olmalı

---

**Son Güncelleme:** 6 Kasım 2025
**Hazırlayan:** Claude Code
