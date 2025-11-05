// Add this to your theme's functions.php file
// STAGING - Premium Chat Widget

function add_staging_premium_chat_widget() {
    ?>
    <link rel="stylesheet" href="https://staging-pchat.simplechat.bot/css/simple-chat-premium.css">
    <script>
    (function() {
        window.simpleChatConfig = {
            chatId: "1665241968",
            userId: "Guest-" + Math.random().toString(36).substr(2, 9),
            host: "https://staging-pchat.simplechat.bot",
            titleOpen: "⭐ Premium Support (STAGING)",
            introMessage: "Welcome to Premium Support STAGING! How can I assist you? ✨",
            mainColor: "#9F7AEA",
            desktopHeight: 600,
            desktopWidth: 380
        };

        var script = document.createElement('script');
        script.src = 'https://staging-pchat.simplechat.bot/js/simple-chat-premium.min.js?v=' + Date.now();
        script.async = true;
        document.body.appendChild(script);
    })();
    </script>
    <?php
}
add_action('wp_footer', 'add_staging_premium_chat_widget', 999);
