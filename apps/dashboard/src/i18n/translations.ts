export const translations = {
  // Menu items
  "Home": { tr: "Ana Sayfa", en: "Home" },
  "Web": { tr: "Web", en: "Web" },
  "Premium": { tr: "Premium", en: "Premium" },
  "Settings": { tr: "Ayarlar", en: "Settings" },

  // Hero cards
  "Online Now": { tr: "Çevrimiçi", en: "Online Now" },
  "active users": { tr: "aktif kullanıcı", en: "active users" },
  "Total Impressions": { tr: "Toplam Tıklama", en: "Total Impressions" },
  "all openers": { tr: "tüm açanlar", en: "all openers" },
  "Conversion Rate": { tr: "Konversiyon Oranı", en: "Conversion Rate" },
  "openers / talkers": { tr: "açan / konuşan", en: "openers / talkers" },

  // Middle cards
  "Toplam Session": { tr: "Toplam Session", en: "Total Sessions" },
  "online": { tr: "online", en: "online" },
  "Toplam Kullanıcı": { tr: "Toplam Kullanıcı", en: "Total Users" },
  "benzersiz ziyaretçi": { tr: "benzersiz ziyaretçi", en: "unique visitors" },
  "Bugün Aktif": { tr: "Bugün Aktif", en: "Active Today" },
  "bugünkü kullanıcı": { tr: "bugünkü kullanıcı", en: "today's users" },
  "Toplam Mesaj": { tr: "Toplam Mesaj", en: "Total Messages" },
  "tüm konuşmalar": { tr: "tüm konuşmalar", en: "all conversations" },

  // Analytics widgets
  "ORTALAMA SÜRE": { tr: "ORTALAMA SÜRE", en: "AVERAGE DURATION" },
  "Oturum Süresi": { tr: "Oturum Süresi", en: "Session Duration" },
  "dakika": { tr: "dakika", en: "minutes" },
  "En Kısa": { tr: "En Kısa", en: "Shortest" },
  "En Uzun": { tr: "En Uzun", en: "Longest" },
  "ORT. MESAJ": { tr: "ORT. MESAJ", en: "AVG. MESSAGES" },
  "Mesaj / Session": { tr: "Mesaj / Session", en: "Messages / Session" },
  "mesaj": { tr: "mesaj", en: "messages" },
  "KANAL DAĞILIMI": { tr: "KANAL DAĞILIMI", en: "CHANNEL DISTRIBUTION" },
  "AI / Human": { tr: "AI / Human", en: "AI / Human" },
  "AI ile Hizmet": { tr: "AI ile Hizmet", en: "AI Service" },
  "Destek Ekibi": { tr: "Destek Ekibi", en: "Support Team" },

  // Heatmap
  "TRAFİK ANALİZİ": { tr: "TRAFİK ANALİZİ", en: "TRAFFIC ANALYSIS" },
  "En Yoğun Saatler Haritası": { tr: "En Yoğun Saatler Haritası", en: "Busiest Hours Heatmap" },
  "Hangi gün ve saatlerde en çok mesaj alınıyor?": {
    tr: "Hangi gün ve saatlerde en çok mesaj alınıyor? (Web + Premium)",
    en: "Which days and hours receive the most messages? (Web + Premium)"
  },
  "Pazartesi": { tr: "Pazartesi", en: "Monday" },
  "Salı": { tr: "Salı", en: "Tuesday" },
  "Çarşamba": { tr: "Çarşamba", en: "Wednesday" },
  "Perşembe": { tr: "Perşembe", en: "Thursday" },
  "Cuma": { tr: "Cuma", en: "Friday" },
  "Cumartesi": { tr: "Cumartesi", en: "Saturday" },
  "Pazar": { tr: "Pazar", en: "Sunday" },

  // AI Performance
  "AI PERFORMANS": { tr: "AI PERFORMANS", en: "AI PERFORMANCE" },
  "AI Başarı Oranı": { tr: "AI Başarı Oranı", en: "AI Success Rate" },
  "AI desteği olmadan çözülen konuşma yüzdesi": {
    tr: "İnsan desteğine ihtiyaç duymadan AI tarafından başarıyla çözülen konuşmaların yüzdesi. Yüksek oran, AI'ın kullanıcı sorularını etkili bir şekilde yanıtladığını gösterir.",
    en: "Percentage of conversations successfully resolved by AI without human support. A high rate indicates AI effectively answers user questions."
  },
  "AI Başarı": { tr: "AI Başarı", en: "AI Success" },
  "Human Support": { tr: "Canlı Destek", en: "Human Support" },
  "TOTAL CONVERSATIONS": { tr: "TOPLAM KONUŞMA", en: "TOTAL CONVERSATIONS" },
  "SUCCESS": { tr: "BAŞARI", en: "SUCCESS" },
  "Az": { tr: "Az", en: "Low" },
  "Çok": { tr: "Çok", en: "High" },
  "aktivite": { tr: "aktivite", en: "activity" },

  // Charts
  "Daily User Count": { tr: "Günlük Kullanıcı Sayısı", en: "Daily User Count" },
  "AI vs Human Support": { tr: "AI vs İnsan Desteği", en: "AI vs Human Support" },
  "Chart.js integration coming soon...": { tr: "Chart.js entegrasyonu yakında...", en: "Chart.js integration coming soon..." },

  // Messages & Countries
  "Message Distribution (Monthly)": { tr: "Mesaj Dağılımı (Aylık)", en: "Message Distribution (Monthly)" },
  "Country Distribution": { tr: "Ülke Dağılımı", en: "Country Distribution" },
  "users": { tr: "kullanıcı", en: "users" },

  // User table placeholder
  "Kullanıcılar": { tr: "Kullanıcılar", en: "Users" },
  "Kullanıcı tablosu yakında eklenecek...": { tr: "Kullanıcı tablosu yakında eklenecek...", en: "User table coming soon..." },
  "Arama, filtreleme ve detaylı görünüm özellikleri ile": {
    tr: "Arama, filtreleme ve detaylı görünüm özellikleri ile",
    en: "With search, filtering and detailed view features"
  },
};

export type Language = 'tr' | 'en';

export function getTranslation(key: string, lang: Language): string {
  if (translations[key] && translations[key][lang]) {
    return translations[key][lang];
  }
  return key; // Return key if translation not found
}
