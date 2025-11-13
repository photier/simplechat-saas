import { ReactNode, useEffect } from 'react';

// Declare simpleChatWidget global
declare global {
  interface Window {
    simpleChatConfig?: any;
    simpleChatWidget?: any;
  }
}

export function ChatSheet({ trigger }: { trigger: ReactNode }) {
  useEffect(() => {
    // Only load widget once
    if (window.simpleChatWidget || document.getElementById('simple-chat-premium-script')) {
      return;
    }

    // Configure premium widget
    window.simpleChatConfig = {
      chatId: "1665241968",
      userId: "P-Guest-" + Math.random().toString(36).substr(2, 9),
      host: "https://p-chat.simplechat.bot",
      titleOpen: "⭐ Premium Support",
      introMessage: "Welcome to Premium Support! How can I assist you? ✨",
      aiIntroMessage: "Hi there! 👋 I am Photier AI, your 24/7 virtual assistant. How can I help you today?",
      mainColor: "#9F7AEA",
      desktopHeight: 600,
      desktopWidth: 380,
      customData: { currentPath: window.location.pathname },
      skin: "layout1",
      useExternalButton: true // Don't show floating button
    };

    // Load CSS
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://p-chat.simplechat.bot/css/simple-chat-premium.css?v=' + Date.now();
    document.head.appendChild(css);

    // Load JavaScript
    const js = document.createElement('script');
    js.id = 'simple-chat-premium-script';
    js.src = 'https://p-chat.simplechat.bot/js/simple-chat-premium.min.js?v=' + Date.now();
    js.async = true;
    document.body.appendChild(js);

    // Cleanup on unmount
    return () => {
      const script = document.getElementById('simple-chat-premium-script');
      if (script) {
        script.remove();
      }
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Open the widget by simulating a click on the useExternalButton element
    // Widget listens for this event
    if (window.simpleChatWidget && window.simpleChatWidget.open) {
      window.simpleChatWidget.open();
    } else {
      // Fallback: trigger widget open by dispatching event
      const event = new CustomEvent('openSimpleChat');
      window.dispatchEvent(event);
    }
  };

  // Return just the trigger with onClick handler
  return (
    <div onClick={handleClick}>
      {trigger}
    </div>
  );
}
