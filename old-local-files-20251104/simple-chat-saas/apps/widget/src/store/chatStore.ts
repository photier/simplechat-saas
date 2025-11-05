import { create } from 'zustand';
import type { Message, ChatConfiguration } from '../types';

interface ChatStore {
  // State
  messages: Message[];
  isChatOpen: boolean;
  pristine: boolean;
  wasChatOpened: boolean;
  isConnected: boolean;

  // Configuration
  config: ChatConfiguration;

  // Actions
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  setMessages: (messages: Message[]) => void;

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
  messages: [],
  isChatOpen: false,
  pristine: true,
  wasChatOpened: false,
  isConnected: false,
  config: DEFAULT_CONFIG,

  // Message actions
  addMessage: (message) => {
    const timestamp = message.time || new Date();
    set((state) => ({
      messages: [...state.messages, { ...message, time: timestamp }],
    }));
  },

  clearMessages: () => set({ messages: [] }),

  setMessages: (messages) => set({ messages }),

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
