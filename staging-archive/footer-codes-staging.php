<?php
/**
 * STAGING WIDGET FOOTER CODES
 *
 * Test ortamı için widget kodları
 * Production'a geçmeden önce bu kodlarla test yapın
 *
 * ✅ WORKING VERSION - Staging containers are now accessible via:
 * - https://staging-chat.simplechat.bot (Normal Widget)
 * - https://staging-pchat.simplechat.bot (Premium Widget)
 */
?>

<!-- ============================================ -->
<!-- NORMAL CHAT WIDGET (STAGING)                -->
<!-- Tüm sayfalarda görünür                       -->
<!-- ============================================ -->
<script>
(function() {
    // Widget konfigürasyonu (hardcoded - API endpoints yok)
    window.intergramId = "1665241968";
    window.intergramServer = "https://staging-chat.simplechat.bot";
    window.intergramCustomizations = {
        closedStyle: "button",
        titleClosed: "",
        titleOpen: "💬 Chat Support (STAGING)",
        introMessage: "Welcome! This is the staging widget for testing. How can I help you?",
        autoResponse: "",
        mainColor: "#007AFF",
        alwaysUseFloatingButton: true,
        currentPath: window.location.pathname,
        desktopHeight: 600,
        desktopWidth: 380
    };

    // Widget script'ini yükle (YENİ REACT WIDGET)
    const script = document.createElement('script');
    script.id = 'intergram-staging';
    script.type = 'text/javascript';
    script.src = 'https://staging-chat.simplechat.bot/js/simple-chat.min.js';
    document.body.appendChild(script);
})();
</script>


<!-- ============================================ -->
<!-- PREMIUM CHAT WIDGET (STAGING)               -->
<!-- Tüm sayfalarda görünür                       -->
<!-- ============================================ -->
<script>
(function() {
    // Widget konfigürasyonu (hardcoded - API endpoints yok)
    window.intergramId = "1665241968";
    window.intergramServer = "https://staging-pchat.simplechat.bot";
    window.intergramCustomizations = {
        closedStyle: "button",
        titleClosed: "",
        titleOpen: "⭐ Premium Support (STAGING)",
        introMessage: "Welcome to Premium Support STAGING! How can I assist you? ✨",
        aiIntroMessage: "Hi there! 👋 I'm Photier AI STAGING. This is a test widget. How can I help you today?",
        autoResponse: "",
        mainColor: "#9F7AEA",
        alwaysUseFloatingButton: true,
        currentPath: window.location.pathname,
        desktopHeight: 600,
        desktopWidth: 380
    };

    // Widget script'ini yükle (YENİ REACT PREMIUM WIDGET)
    const script = document.createElement('script');
    script.id = 'intergram-premium-staging';
    script.type = 'text/javascript';
    script.src = 'https://staging-pchat.simplechat.bot/js/simple-chat-premium.min.js';
    document.body.appendChild(script);
})();
</script>


<!-- ============================================ -->
<!-- LOCALHOST TEST (Yerel geliştirme için)     -->
<!-- ============================================ -->
<!--
<script>
(function() {
    window.intergramId = "1665241968";
    window.intergramServer = "http://localhost:3101";
    window.intergramCustomizations = {
        closedStyle: "button",
        titleClosed: "",
        titleOpen: "⭐ Premium Support (LOCALHOST)",
        introMessage: "Welcome to Premium Support! How can I assist you? ✨",
        aiIntroMessage: "Hi there! 👋 I'm Photier AI. How can I help you today?",
        autoResponse: "",
        mainColor: "#9F7AEA",
        alwaysUseFloatingButton: true,
        currentPath: window.location.pathname,
        desktopHeight: 600,
        desktopWidth: 380
    };

    const script = document.createElement('script');
    script.id = 'intergram-premium';
    script.type = 'text/javascript';
    script.src = 'http://localhost:3101/js/simple-chat-premium.min.js';
    document.body.appendChild(script);
})();
</script>
-->
