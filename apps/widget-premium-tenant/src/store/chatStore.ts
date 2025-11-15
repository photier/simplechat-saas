import { create } from 'zustand';
import type { Message, ChatConfiguration } from '../types';

interface ChatStore {
  // State
  aiMessages: Message[];          // AI Bot tab messages
  liveMessages: Message[];        // Live Support tab messages
  activeTab: 'ai' | 'live';       // Current active tab
  humanMode: boolean;             // true if activeTab === 'live'
  isChatOpen: boolean;
  pristine: boolean;
  wasChatOpened: boolean;
  isConnected: boolean;
  activeSkin: string;             // 'default', 'layout1', 'layout2', etc.

  // Configuration
  config: ChatConfiguration;

  // Actions
  addMessage: (message: Message) => void;  // Adds to active tab
  clearMessages: () => void;               // Clears active tab
  clearAllMessages: () => void;            // Clears all tabs
  setMessages: (messages: Message[]) => void;  // Sets active tab messages

  setActiveTab: (tab: 'ai' | 'live') => void;
  setActiveSkin: (skin: string) => void;

  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;

  setPristine: (pristine: boolean) => void;
  setWasChatOpened: (opened: boolean) => void;
  setConnected: (connected: boolean) => void;

  setConfig: (config: ChatConfiguration) => void;
}

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

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  aiMessages: [],
  liveMessages: [],
  activeTab: 'ai',
  humanMode: false,  // false = AI Bot, true = Live Support
  isChatOpen: false,
  pristine: true,
  wasChatOpened: false,
  isConnected: false,
  activeSkin: 'default',
  config: DEFAULT_CONFIG,

  // Tab actions
  setActiveTab: (tab) => {
    console.log('🔄 [Premium Store] setActiveTab called with:', tab);
    console.log('🔄 [Premium Store] humanMode will be:', tab === 'live');
    set({ activeTab: tab, humanMode: tab === 'live' });
  },
  setActiveSkin: (skin) => set({ activeSkin: skin }),

  // Message actions (operate on active tab)
  addMessage: (message) => {
    const timestamp = message.time || new Date();
    const state = get();

    if (state.activeTab === 'ai') {
      set({
        aiMessages: [...state.aiMessages, { ...message, time: timestamp }],
      });
    } else {
      set({
        liveMessages: [...state.liveMessages, { ...message, time: timestamp }],
      });
    }
  },

  clearMessages: () => {
    const state = get();
    if (state.activeTab === 'ai') {
      set({ aiMessages: [] });
    } else {
      set({ liveMessages: [] });
    }
  },

  clearAllMessages: () => set({ aiMessages: [], liveMessages: [] }),

  setMessages: (messages) => {
    const state = get();
    if (state.activeTab === 'ai') {
      set({ aiMessages: messages });
    } else {
      set({ liveMessages: messages });
    }
  },

  // Chat visibility actions
  toggleChat: () => {
    const { isChatOpen } = get();

    if (!isChatOpen) {
      // Opening chat
      set({
        isChatOpen: true,
        pristine: true, // First set pristine to unmount iframe
      });

      // Then set pristine to false to remount and trigger register
      setTimeout(() => {
        set({ pristine: false });
      }, 10);
    } else {
      // Closing chat
      set({
        isChatOpen: false,
        pristine: true, // Reset for next open
      });
    }
  },

  openChat: () => {
    set({
      isChatOpen: true,
      pristine: true,
    });

    setTimeout(() => {
      set({ pristine: false });
    }, 10);
  },

  closeChat: () => {
    set({
      isChatOpen: false,
      pristine: true,
    });
  },

  // State setters
  setPristine: (pristine) => set({ pristine }),
  setWasChatOpened: (opened) => set({ wasChatOpened: opened }),
  setConnected: (connected) => set({ isConnected: connected }),

  // Config setter
  setConfig: (config) => set({ config: { ...DEFAULT_CONFIG, ...config } }),
}));
