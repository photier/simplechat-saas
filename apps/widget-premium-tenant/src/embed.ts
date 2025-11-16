/**
 * SimpleChat Widget Embedding Script
 *
 * Usage:
 * <script>
 *   window.simpleChatConfig = {
 *     chatId: 'your-chat-id',
 *     userId: 'guest-123',
 *     host: 'https://api.example.com',
 *     CustomData: { page: 'home' },
 *     // Optional configuration
 *     mainColor: '#9F7AEA',
 *     titleOpen: "Let's chat!",
 *     titleClosed: 'Click to chat!',
 *     introMessage: 'Hello! How can we help you?',
 *     desktopHeight: 600,
 *     desktopWidth: 370
 *   };
 * </script>
 * <script src="https://your-cdn.com/simple-chat.min.js"></script>
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Widget } from './components/widget/Widget';
import { useChatStore } from './store/chatStore';
import type { ChatConfiguration } from './types';
// Force bundler to include layout1 icons (prevent tree-shaking)
import { Paperclip, CheckCheck } from 'lucide-react';
// Reference icons to prevent removal
const _icons = [Paperclip, CheckCheck];
void _icons; // Prevent unused variable warning

// Extend Window interface
declare global {
  interface Window {
    simpleChatConfig?: {
      chatId: string;
      userId: string;
      host: string;
      CustomData?: Record<string, unknown>;
    } & Partial<ChatConfiguration>;
    simpleChatWidget?: {
      open: () => void;
      close: () => void;
      toggle: () => void;
      isOpen: () => boolean;
    };
  }
}

// Default configuration
const DEFAULT_CONFIG: ChatConfiguration = {
  useExternalButton: false,
  titleClosed: 'Click to chat!',
  titleOpen: "Let's chat!",
  closedStyle: 'chat',
  closedChatAvatarUrl: '',
  cookieExpiration: 1,
  introMessage: 'Hello! How can we help you?',
  helpMessage: '',
  autoResponse: '',
  autoNoResponse: '',
  placeholderText: 'Send a message...',
  displayMessageTime: true,
  displayBanner: true,
  mainColor: '#9F7AEA',
  alwaysUseFloatingButton: false,
  desktopHeight: 600,
  desktopWidth: 370,
  humanReadableIds: false,
};

/**
 * Fetch settings from server API
 */
async function fetchServerSettings(host: string): Promise<Partial<ChatConfiguration>> {
  try {
    console.log('[SimpleChat Premium] Fetching settings from server...');

    // Fetch theme and widget config in parallel
    const [themeResponse, widgetConfigResponse] = await Promise.all([
      fetch(`${host}/api/theme`).then((r) => (r.ok ? r.json() : null)),
      fetch(`${host}/api/widget-config`).then((r) => (r.ok ? r.json() : null)),
    ]);

    const serverSettings: Partial<ChatConfiguration> = {};

    // Map theme color
    if (themeResponse?.success && themeResponse.themeColor) {
      serverSettings.mainColor = themeResponse.themeColor;
      console.log('[SimpleChat Premium] ✓ Theme color loaded:', themeResponse.themeColor);
    }

    // Map widget config (ALL fields from database)
    if (widgetConfigResponse?.success && widgetConfigResponse.config) {
      const config = widgetConfigResponse.config;

      // Text fields
      if (config.titleClosed !== undefined) serverSettings.titleClosed = config.titleClosed;
      if (config.titleOpen !== undefined) serverSettings.titleOpen = config.titleOpen;
      if (config.introMessage !== undefined) serverSettings.introMessage = config.introMessage;
      if (config.placeholder !== undefined) serverSettings.placeholderText = config.placeholder;

      // Visual settings
      if (config.mainColor !== undefined) serverSettings.mainColor = config.mainColor;
      if (config.skin !== undefined) serverSettings.skin = config.skin;

      // Desktop dimensions
      if (config.desktopHeight !== undefined) serverSettings.desktopHeight = config.desktopHeight;
      if (config.desktopWidth !== undefined) serverSettings.desktopWidth = config.desktopWidth;

      // Premium-specific
      if (config.aiIntroMessage !== undefined) {
        serverSettings.autoResponse = config.aiIntroMessage;
        console.log('[SimpleChat Premium] ✓ AI intro message loaded');
      }

      // Working hours (future feature)
      if (config.workingHoursEnabled !== undefined) {
        // Working hours can be implemented later
        console.log('[SimpleChat Premium] Working hours:', {
          enabled: config.workingHoursEnabled,
          start: config.workingHoursStart,
          end: config.workingHoursEnd,
        });
      }

      console.log('[SimpleChat Premium] ✓ Widget config loaded');
    }

    return serverSettings;
  } catch (error) {
    console.warn('[SimpleChat Premium] Failed to fetch server settings, using defaults:', error);
    return {};
  }
}

/**
 * Initialize the chat widget
 */
async function initSimpleChat() {
  const config = window.simpleChatConfig;

  if (!config) {
    console.error('[SimpleChat Premium] Missing configuration. Please set window.simpleChatConfig');
    return;
  }

  if (!config.chatId) {
    console.error('[SimpleChat Premium] Missing required field: chatId');
    return;
  }

  if (!config.userId) {
    console.error('[SimpleChat Premium] Missing required field: userId');
    return;
  }

  if (!config.host) {
    console.error('[SimpleChat Premium] Missing required field: host');
    return;
  }

  console.log('[SimpleChat Premium] Initializing widget...');

  // Extract config parts
  const { chatId, userId, host, CustomData, ...customizations } = config;

  // Fetch server settings
  const serverSettings = await fetchServerSettings(host);

  // Merge configurations (priority: server > embed > defaults)
  const finalConfig: ChatConfiguration = {
    ...DEFAULT_CONFIG,
    ...customizations,
    ...serverSettings, // Server settings override everything
  };

  console.log('[SimpleChat Premium] Final configuration:', finalConfig);

  // Create root container
  const rootId = 'simple-chat-root';
  let rootElement = document.getElementById(rootId);

  if (!rootElement) {
    rootElement = document.createElement('div');
    rootElement.id = rootId;
    document.body.appendChild(rootElement);
  }

  // Initialize store with configuration
  useChatStore.getState().setConfig(finalConfig);

  // Set active skin from config
  if (finalConfig.skin) {
    useChatStore.getState().setActiveSkin(finalConfig.skin);
    console.log('[SimpleChat Premium] ✓ Active skin set to:', finalConfig.skin);
  }

  // Create React root and render
  const root = createRoot(rootElement);

  root.render(
    React.createElement(Widget, {
      chatId,
      userId,
      host,
      CustomData: CustomData || {},
    })
  );

  console.log('[SimpleChat Premium] ✓ Widget initialized successfully');

  // Expose widget API to window for external access
  window.simpleChatWidget = {
    open: () => useChatStore.getState().openChat(),
    close: () => useChatStore.getState().closeChat(),
    toggle: () => useChatStore.getState().toggleChat(),
    isOpen: () => useChatStore.getState().isChatOpen,
  };

  console.log('[SimpleChat Premium] ✓ Widget API exposed to window.simpleChatWidget');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSimpleChat);
} else {
  // DOM is already loaded
  initSimpleChat();
}

// Export for manual initialization
export { initSimpleChat };
