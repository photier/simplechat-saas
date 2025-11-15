import React, { useEffect } from 'react';

export interface SimpleChatWidgetProps {
  /** Bot chat ID (e.g., 'bot_xxx') */
  chatId: string;

  /** Widget type: 'basic' or 'premium' */
  type?: 'basic' | 'premium';

  /** Language code: 'auto', 'en', 'tr', etc. */
  locale?: string;

  /** Custom main color (hex code) */
  mainColor?: string;

  /** Title when widget is open */
  titleOpen?: string;

  /** Title when widget is closed */
  titleClosed?: string;

  /** Welcome message */
  introMessage?: string;

  /** Input placeholder text */
  placeholder?: string;

  /** Widget height on desktop (px) */
  desktopHeight?: number;

  /** Widget width on desktop (px) */
  desktopWidth?: number;

  /** Custom API key (optional) */
  apiKey?: string;
}

/**
 * SimpleChat Widget Component
 *
 * @example
 * ```tsx
 * import { SimpleChatWidget } from '@simplechat/widget';
 *
 * function App() {
 *   return (
 *     <SimpleChatWidget
 *       chatId="bot_abc123"
 *       type="basic"
 *       locale="en"
 *     />
 *   );
 * }
 * ```
 */
export const SimpleChatWidget: React.FC<SimpleChatWidgetProps> = ({
  chatId,
  type = 'basic',
  locale = 'auto',
  mainColor,
  titleOpen,
  titleClosed,
  introMessage,
  placeholder,
  desktopHeight,
  desktopWidth,
  apiKey,
}) => {
  useEffect(() => {
    if (!chatId) {
      console.error('SimpleChatWidget: chatId is required');
      return;
    }

    // Prevent double-loading
    if ((window as any).simpleChatLoaded) {
      console.warn('SimpleChatWidget: Widget already loaded');
      return;
    }

    const isPremium = type === 'premium';
    const host = isPremium
      ? `https://${chatId}.p.simplechat.bot`
      : `https://${chatId}.w.simplechat.bot`;

    const prefix = isPremium ? 'P-Guest-' : 'W-Guest-';
    const userId = prefix + Math.random().toString(36).substr(2, 9);

    // Widget configuration
    (window as any).simpleChatConfig = {
      chatId,
      userId,
      host,
      locale,
      ...(apiKey && { apiKey }),
      ...(mainColor && { mainColor }),
      ...(titleOpen && { titleOpen }),
      ...(titleClosed && { titleClosed }),
      ...(introMessage && { introMessage }),
      ...(placeholder && { placeholder }),
      ...(desktopHeight && { desktopHeight }),
      ...(desktopWidth && { desktopWidth }),
    };

    // Load CSS
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = `${host}/css/simple-chat${isPremium ? '-premium' : ''}.css?v=${Date.now()}`;
    document.head.appendChild(css);

    // Load JS
    const js = document.createElement('script');
    js.src = `${host}/js/simple-chat${isPremium ? '-premium' : ''}.min.js?v=${Date.now()}`;
    js.async = true;
    js.onload = () => {
      (window as any).simpleChatLoaded = true;
    };
    document.body.appendChild(js);

    // Cleanup function
    return () => {
      // Note: Widget cleanup is handled by the widget itself
      // We don't remove the script to avoid breaking other instances
    };
  }, [chatId, type, locale, mainColor, titleOpen, titleClosed, introMessage, placeholder, desktopHeight, desktopWidth, apiKey]);

  // Widget renders itself into the DOM, this component is just a loader
  return null;
};

export default SimpleChatWidget;
