// Add this to your theme's functions.php file
// STAGING - Normal Chat Widget

function add_staging_normal_chat_widget() {
    ?>
    <link rel="stylesheet" href="https://staging-chat.simplechat.bot/css/simple-chat.css">
    <script>
    (function() {
        window.simpleChatConfig = {
            chatId: "1665241968",
            userId: "Guest-" + Math.random().toString(36).substr(2, 9),
            host: "https://staging-chat.simplechat.bot",
            titleOpen: "💬 Chat Support (STAGING)",
            introMessage: "Welcome! This is the staging widget. How can I help you?",
            mainColor: "#007AFF",
            desktopHeight: 600,
            desktopWidth: 380
        };

        var script = document.createElement('script');
        script.src = 'https://staging-chat.simplechat.bot/js/simple-chat.min.js?v=' + Date.now();
        script.async = true;
        document.body.appendChild(script);
    })();
    </script>
    <?php
}
add_action('wp_footer', 'add_staging_normal_chat_widget', 999);
