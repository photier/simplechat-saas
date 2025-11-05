# DİL DEĞİŞTİRME SORUNU - ÖZET VE ÇÖZÜM

## MEVCUT DURUM:
- Stats sayfası çalışıyor: https://stats.photier.co/
- SimpleChat.Bot logosu eklendi ✓
- Dil butonu var ama dropdown açılmıyor ✗

## SORUN:
window.toggleLangMenu fonksiyonu tanımlı ama çalışmıyor

## BASİT ÇÖZÜM:
/root/stats/index.html dosyasının EN SONUNA (</body> tag'inden hemen önce) şunu ekleyin:

<script>
// Simple Language Fix
document.addEventListener('DOMContentLoaded', function() {
    // Dil değiştirme butonu
    const btn = document.querySelector('.lang-btn');
    const dropdown = document.getElementById('langDropdown');
    
    if (btn && dropdown) {
        btn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            dropdown.classList.toggle('active');
            console.log('Dropdown toggled');
            return false;
        };
    }
    
    // Dil seçenekleri
    document.querySelectorAll('.lang-option').forEach(opt => {
        opt.onclick = function() {
            const lang = this.dataset.lang;
            console.log('Language selected:', lang);
            
            // Basit çeviri
            if (lang === 'en') {
                document.querySelectorAll('[data-i18n]').forEach(el => {
                    const translations = {
                        'Dashboard': 'Dashboard',
                        'Ayarlar': 'Settings',
                        'Toplam Kullanıcı': 'Total Users',
                        'Toplam Mesaj': 'Total Messages',
                        'Çıkış Yap': 'Log Out'
                    };
                    const key = el.getAttribute('data-i18n');
                    if (translations[key]) el.textContent = translations[key];
                });
            }
            
            dropdown.classList.remove('active');
        };
    });
});
</script>

## KOMUTLAR:
1. Backup: cp /root/stats/index.html /root/stats/index.backup.html
2. Düzenle: nano /root/stats/index.html (en sona ekle)
3. Restart: docker compose restart stats

## YENİ CONVERSATION'DA:
- Bu dosyayı gösterin: /root/LANGUAGE_FIX.md
- Basit çözümü uygulayın
- Karmaşık translations objesini kullanmayın
