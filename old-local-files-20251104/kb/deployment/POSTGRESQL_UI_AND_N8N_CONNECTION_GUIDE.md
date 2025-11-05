# PostgreSQL UI ve n8n Bağlantı Rehberi
**Simple Chat Bot - Database Yönetimi**

**Tarih:** 2025-10-29
**Durum:** ✅ pgAdmin Kuruldu, Kullanıma Hazır

---

## 🎯 ÖZET

PostgreSQL veritabanın için **pgAdmin** web arayüzü kuruldu. Artık veritabanını tarayıcıdan yönetebilirsin. Ayrıca n8n'de PostgreSQL credentials nasıl eklenir adım adım anlattım.

---

## 🖥️ PGADMIN WEB ARAYÜZÜ

### Erişim Bilgileri

**URL:** `https://db.simplechat.bot` (SSL ile güvenli)
**Port:** `127.0.0.1:5050` (local access)

**Giriş Bilgileri:**
```
Email: admin@photier.co
Password: PgAdmin2025_Secure!
```

### SSL Sertifika Bilgileri

✅ **HTTPS Aktif** - Let's Encrypt sertifikası kurulu
- **Sertifika Sağlayıcı:** Let's Encrypt (R13)
- **Geçerlilik:** 90 gün (otomatik yenilenir)
- **Yenileme:** Traefik otomatik yönetir

**ÖNEMLİ: Cloudflare DNS Ayarı**
- `db.simplechat.bot` için **GRİ BULUT** (DNS only) kullanılmalı ✅
- Turuncu bulut (Cloudflare proxy) AÇILMAMALI ❌
- Aksi halde Let's Encrypt sertifika yenilenemez

### İlk Giriş Adımları

1. **Tarayıcıdan aç:** https://db.simplechat.bot
2. **Email ve şifre ile giriş yap**
3. **İlk sunucu bağlantısını kur** (aşağıda detaylar)

---

## 🔗 PGADMIN'DE POSTGRESQL SUNUCUSU EKLEME

pgAdmin'e ilk giriş yaptığında sunucu bağlantısı kurmak için:

### Adım 1: Add New Server
1. Sol menüde **"Servers"** üzerine sağ tıkla
2. **"Register" → "Server..."** seç

### Adım 2: General Tab
```
Name: Simple Chat PostgreSQL
```

### Adım 3: Connection Tab
```
Host name/address: postgres
Port: 5432
Maintenance database: simplechat
Username: simplechat
Password: SimpleChat2025_SecureDB!
```

**Önemli:** `Save password?` kutucuğunu işaretle, yoksa her seferinde şifre isteyecek.

### Adım 4: Advanced Tab (Opsiyonel)
```
DB restriction: simplechat
```
Bu ayarla sadece `simplechat` database'ini göreceksin, diğerleri gizli kalacak.

### Adım 5: Save

**"Save"** butonuna tıkla. Artık veritabanına bağlandın!

---

## 📊 PGADMIN'DE NELER YAPABİLİRSİN?

### 1️⃣ Tablo İçeriğini Görüntüleme
```
Servers → Simple Chat PostgreSQL → Databases → simplechat → Schemas → public → Tables
```
- **users** tablosuna sağ tıkla → **View/Edit Data** → **All Rows**
- Tüm kullanıcıları göreceksin

### 2️⃣ SQL Sorguları Çalıştırma
```
Tools → Query Tool
```

**Örnek Sorgular:**
```sql
-- Bugünkü toplam mesaj sayısı
SELECT COUNT(*) FROM messages WHERE DATE(timestamp) = CURRENT_DATE;

-- En aktif 10 kullanıcı
SELECT user_id, total_messages, total_sessions
FROM users
ORDER BY total_messages DESC
LIMIT 10;

-- Şu anda aktif session'lar
SELECT * FROM v_active_sessions;

-- Günlük istatistikler
SELECT * FROM v_daily_stats ORDER BY date DESC LIMIT 7;
```

### 3️⃣ Veri Dışa Aktarma (Export)
- Tablo üzerine sağ tıkla → **Import/Export**
- **Export** seç
- Format: CSV, JSON, XML, Binary

### 4️⃣ Tablolar Arası İlişkiler (ER Diagram)
```
Database → simplechat → Sağ tıkla → ERD For Database
```
Tüm tablolar ve aralarındaki ilişkileri görsel olarak gösterir.

### 5️⃣ Veritabanı Yedekleme (Backup)
```
Database → simplechat → Sağ tıkla → Backup...
```
- Format: **Custom** veya **Plain** (SQL)
- Otomatik yedek için cron job kurabilirsin

---

## 🔧 N8N'DE POSTGRESQL CREDENTIALS EKLEME

### Adım 1: n8n'e Gir
```
URL: https://n8n.photier.co
```

### Adım 2: Credentials Sayfası
1. Sağ üst köşede **kullanıcı adı**na tıkla
2. **"Settings"** seç
3. Sol menüden **"Credentials"** seç
4. **"+ Add Credential"** butonuna tıkla

### Adım 3: PostgreSQL Credential Seç
- Arama kutusuna **"postgres"** yaz
- **"Postgres"** seçeneğini seç

### Adım 4: Bağlantı Bilgilerini Gir

#### Connection Tab:
```
Host: postgres
Database: simplechat
User: simplechat
Password: SimpleChat2025_SecureDB!
Port: 5432
SSL Mode: disable (Docker network içinde SSL'e gerek yok)
```

#### Credential Name:
```
Simple Chat PostgreSQL
```

### Adım 5: Test Connection
- **"Test"** butonuna tıkla
- **"Connection successful"** mesajı görmelisin ✅

### Adım 6: Save
- **"Save"** butonuna tıkla

---

## 🎨 N8N WORKFLOW'LARINDA POSTGRESQL KULLANIMI

### Örnek 1: Yeni Kullanıcı Kaydetme

```
Webhook (Trigger)
  ↓
Set Node (Data hazırlama)
  ↓
Postgres Node (INSERT)
```

**Postgres Node Ayarları:**
```
Operation: Insert
Table: users
Columns: user_id, channel, country, city, ip_address
Values: {{$json.userId}}, {{$json.channel}}, {{$json.country}}, ...
```

---

### Örnek 2: Mesaj Kaydetme

```
Webhook (Yeni mesaj geldi)
  ↓
Postgres Node (users tablosuna INSERT/UPSERT)
  ↓
Postgres Node (messages tablosuna INSERT)
  ↓
Postgres Node (sessions tablosuna UPDATE)
```

**UPSERT için SQL Query:**
```sql
INSERT INTO users (user_id, chat_id, channel, first_activity, last_activity)
VALUES (
  '{{$json.userId}}',
  '{{$json.chatId}}',
  '{{$json.channel}}',
  NOW(),
  NOW()
)
ON CONFLICT (user_id)
DO UPDATE SET
  last_activity = NOW();
```

---

### Örnek 3: Execute Query (Raw SQL)

**Postgres Node:**
```
Operation: Execute Query
Query:
  SELECT * FROM v_daily_stats
  WHERE date >= CURRENT_DATE - INTERVAL '7 days'
  ORDER BY date DESC;
```

Bu sonuçları başka bir node'a gönderebilirsin (HTTP Request, Telegram, Email, vb.)

---

## 🔐 GÜVENLİK AYARLARI

### pgAdmin Güvenlik Önlemleri

1. **Şifreyi Güçlü Tut**
   - Minimum 12 karakter
   - Büyük/küçük harf, rakam, özel karakter

2. **HTTPS Zorunlu**
   - Traefik zaten SSL sağlıyor ✅
   - Let's Encrypt sertifikası otomatik yenileniyor

3. **Port Güvenliği**
   - pgAdmin port: `127.0.0.1:5050` (sadece localhost)
   - PostgreSQL port: `127.0.0.1:5432` (sadece localhost)
   - Dış dünyadan doğrudan erişim YOK ✅

### PostgreSQL Güvenlik

1. **Güçlü Şifre**
   ```
   POSTGRES_PASSWORD=SimpleChat2025_SecureDB!
   ```
   - 30 karakter, alfanumerik + özel karakter

2. **Port Binding**
   ```yaml
   ports:
     - "127.0.0.1:5432:5432"
   ```
   - Sadece localhost'tan erişilebilir
   - Docker network içinden: `postgres:5432`

3. **Backup Stratejisi**
   ```bash
   # Günlük otomatik yedek (cron)
   0 2 * * * docker exec root-postgres-1 pg_dump -U simplechat simplechat > /root/backups/simplechat_$(date +\%Y\%m\%d).sql
   ```

---

## 📈 PERFORMANS İZLEME

### pgAdmin Dashboard

1. **Server Activity**
   - Servers → Simple Chat PostgreSQL → Dashboard
   - Aktif bağlantılar, sorgu sayısı, disk kullanımı

2. **Query Performance**
   ```sql
   -- En yavaş sorgular
   SELECT query, mean_exec_time, calls
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```

3. **Disk Kullanımı**
   ```sql
   -- Tablo boyutları
   SELECT
       schemaname,
       tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```

---

## 🚨 SORUN GİDERME

### Problem 1: pgAdmin'e giriş yapamıyorum
**Çözüm:**
```bash
# Container'ı kontrol et
docker ps | grep pgadmin

# Log'lara bak
docker logs root-pgadmin-1 --tail 50

# Yeniden başlat
docker compose restart pgadmin
```

### Problem 2: PostgreSQL'e bağlanamıyorum
**Çözüm:**
```bash
# PostgreSQL container çalışıyor mu?
docker ps | grep postgres

# Sağlık kontrolü
docker exec root-postgres-1 pg_isready -U simplechat -d simplechat

# Network bağlantısı
docker exec root-n8n-1 ping postgres
```

### Problem 3: n8n'de credential çalışmıyor
**Çözüm:**
1. **Host adını kontrol et:** `postgres` (IP değil!)
2. **Port:** `5432`
3. **SSL Mode:** `disable`
4. **Test butonuna bas**, hata mesajını oku

### Problem 4: Tablolar görünmüyor
**Çözüm:**
```sql
-- Tabloları listele
\dt

-- Schema kontrol et
SELECT * FROM information_schema.tables WHERE table_schema = 'public';
```

---

## 📚 YARDIMCI KOMUTLAR

### Docker Komutları
```bash
# pgAdmin container'ını yeniden başlat
docker compose restart pgadmin

# pgAdmin log'larını izle
docker logs -f root-pgadmin-1

# PostgreSQL container'ına shell aç
docker exec -it root-postgres-1 sh

# PostgreSQL CLI'a bağlan
docker exec -it root-postgres-1 psql -U simplechat -d simplechat
```

### PostgreSQL CLI Komutları
```sql
\dt              -- Tabloları listele
\d users         -- users tablosu yapısı
\dv              -- View'ları listele
\df              -- Function'ları listele
\l               -- Database'leri listele
\q               -- Çıkış
```

---

## 🎓 N8N ÖRNEKLEME: TEK WORKFLOW

Şimdi sana gerçek bir örnek workflow vereyim:

### Workflow: "User Message to PostgreSQL"

#### Node 1: Webhook (Trigger)
```
Method: POST
Path: user-message
```

#### Node 2: Function (Data İşleme)
```javascript
const userId = $json.body.userId;
const message = $json.body.message;
const channel = $json.body.channel || 'normal';

return {
  userId: userId,
  chatId: userId,
  channel: channel,
  message: message,
  timestamp: new Date().toISOString(),
  messageFrom: 'user',
  country: $json.body.country || null,
  city: $json.body.city || null
};
```

#### Node 3: Postgres (UPSERT User)
```
Credential: Simple Chat PostgreSQL
Operation: Execute Query
Query:
  INSERT INTO users (user_id, chat_id, channel, country, city, first_activity, last_activity)
  VALUES (
    '{{$json.userId}}',
    '{{$json.chatId}}',
    '{{$json.channel}}',
    '{{$json.country}}',
    '{{$json.city}}',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    last_activity = NOW(),
    country = COALESCE(EXCLUDED.country, users.country),
    city = COALESCE(EXCLUDED.city, users.city);
```

#### Node 4: Postgres (Insert Message)
```
Credential: Simple Chat PostgreSQL
Operation: Execute Query
Query:
  INSERT INTO messages (user_id, channel, message_text, message_from, timestamp)
  VALUES (
    '{{$json.userId}}',
    '{{$json.channel}}',
    '{{$json.message}}',
    'user',
    NOW()
  ) RETURNING message_id;
```

#### Node 5: Respond to Webhook
```json
{
  "success": true,
  "messageId": "{{$json.message_id}}",
  "saved": true
}
```

---

## 🔄 MEVCUT SISTEM'DEN GEÇİŞ

### Şu An: n8n Data Tables
```
User Message → n8n Webhook → n8n Data Table → Stats Dashboard
```

### Yeni: PostgreSQL
```
User Message → n8n Webhook → PostgreSQL → Stats Dashboard (PostgreSQL views)
```

### Adım Adım Geçiş Planı

1. **PostgreSQL kuruldu** ✅
2. **Schema oluşturuldu** ✅
3. **pgAdmin kuruldu** ✅
4. **n8n credential ekle** (Bu rehberdeki adımları takip et)
5. **Yeni workflow oluştur** (Yukarıdaki örneği kullan)
6. **Test et** (Sandbox ortamda dene)
7. **Stats Dashboard'u güncelle** (`api.js` → PostgreSQL'den çek)
8. **Production'a al**

---

## 📞 SORULARIN İÇİN

Eğer takıldığın bir yer olursa:

1. **pgAdmin log'larına bak:** `docker logs root-pgadmin-1`
2. **PostgreSQL log'larına bak:** `docker logs root-postgres-1`
3. **n8n execution'ları kontrol et:** n8n → Executions
4. **PostgreSQL bağlantısını test et:**
   ```bash
   docker exec root-postgres-1 psql -U simplechat -d simplechat -c "SELECT version();"
   ```

---

## 🎯 SONRAKI ADIMLAR

1. ✅ **pgAdmin'e gir** → https://db.simplechat.bot
2. ✅ **PostgreSQL sunucusunu ekle** (Yukarıdaki adımlar)
3. ✅ **Tabloları görüntüle** (chat_history)
4. ✅ **n8n'de credential oluştur**
5. ✅ **İlk workflow'u test et**
6. ✅ **Stats Dashboard'u güncelle**
7. ✅ **HTTPS/SSL sertifikası kurulu**

---

**Kurulum Tamamlandı! 🎉**

Artık PostgreSQL veritabanını tarayıcıdan yönetebilir ve n8n workflow'larında kullanabilirsin.
