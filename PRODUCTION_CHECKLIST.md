# 🚀 Production Checklist - Live'a Çıkmadan Önce

## ❗ KRİTİK: Railway Environment Variables

### 1. **Telegram Group Conflict Logic - STRICT MODE Aç**

**Şu Anki Durum (Test Mode):**
- Aynı Telegram Group ID kullanıldığında → Eski bot PAUSED yapılıyor
- Yeni bot **payment yapılmadan önce** yaratılıyor ve eski botu deaktive ediyor
- ⚠️ Warning mesajı gösteriliyor (frontend toast)

**Sorun:**
- ❌ Bot payment **successful** olmadan önce eski bot deaktive ediliyor
- ❌ Kullanıcı ödeme yapmadan çıkarsa → Eski bot PAUSED kalmış, yeni bot PENDING_PAYMENT

**Beklenen Davranış (Production Mode):**
- ✅ Her bot için **unique Telegram Group** zorunlu
- ✅ Aynı Telegram Group ID ile yeni bot yaratılmaya çalışılırsa → BadRequestException
- ✅ Kullanıcı yeni Telegram Group yaratmak zorunda kalır

**Yapılacak:**
```bash
# Railway backend servisinde şu environment variables'ları ekle:
railway variables --set NODE_ENV=production --service simplechat-saas
railway variables --set STRICT_TELEGRAM_VALIDATION=true --service simplechat-saas
```

**Kod Referansı:**
- Dosya: `backend/src/chatbot/chatbot.service.ts`
- Satır: 49-91
- Logic: `isProduction = NODE_ENV === 'production' && STRICT_TELEGRAM_VALIDATION === 'true'`

---

## 🔧 BONUS: Test Mode İyileştirme (İsteğe Bağlı)

**Test mode'da daha iyi davranış:**

Şu anki kod (satır 81-84):
```typescript
// Pause the conflicting bot
await this.prisma.chatbot.update({
  where: { id: existing.id },
  data: { status: BotStatus.PAUSED },
});
```

**Önerilen değişiklik:**
Eski botu **hemen PAUSED** yapma, bunun yerine:
1. Yeni bot yaratılsın (PENDING_PAYMENT)
2. Payment **successful** olunca → Eski bot PAUSED yap
3. Payment yapılmazsa → Eski bot aktif kalsın ✅

**Uygulama:**
- `chatbotService.purchase()` metodunda (satır 270-350)
- N8N workflow yaratılmadan ÖNCE, eski botu PAUSED yap
- Böylece payment successful olmadan eski bot deaktive edilmez

---

## 📝 Notlar

### Railway Services:
- **Backend:** simplechat-saas
- **Widget:** widget
- **Widget Premium:** widget-premium
- **Stats:** stats
- **Dashboard:** dashboard

### Test Telegram Group ID:
- `-1003440801039` (Photier test grubu)
- Production'da her müşteri **kendi Telegram grubunu** yaratacak

### Current Status:
- ✅ Backend PENDING_PAYMENT logic doğru çalışıyor
- ✅ Payment successful olunca `purchase()` çağrılıyor
- ✅ N8N workflow sadece payment'tan sonra yaratılıyor
- ⚠️ Test mode'da eski bot hemen PAUSED oluyor (payment olmadan)

### Priority:
1. **HIGH:** Production env variables ekle (live'a çıkmadan önce)
2. **MEDIUM:** Test mode logic'i iyileştir (isteğe bağlı)
3. **LOW:** Frontend warning mesajını daha açıklayıcı yap

---

**Son Güncelleme:** 2025-11-22
**Durum:** Test Mode Aktif (Production variables bekleniyor)
