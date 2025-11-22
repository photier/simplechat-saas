/**
 * Message Types
 */
export type MessageFrom = 'visitor' | 'admin' | 'bot' | 'agent';

export interface Message {
  text: string;
  from: MessageFrom;
  time: Date;
  name?: string;
  human_mode?: boolean; // Track if message is from Live Support (true) or AI Bot (false)
  emoji?: string; // Emoji avatar from conversation flow
}

/**
 * Chat Configuration
 */
export interface ChatConfiguration {
  // External button control
  useExternalButton?: boolean;

  // Titles
  titleClosed?: string;
  titleOpen?: string;

  // Closed state style
  closedStyle?: 'chat' | 'button';
  closedChatAvatarUrl?: string;

  // Cookie expiration (days)
  cookieExpiration?: number;

  // Messages
  introMessage?: string;
  helpMessage?: string;
  autoResponse?: string;
  autoNoResponse?: string;
  placeholderText?: string;

  // UI Options
  displayMessageTime?: boolean;
  displayBanner?: boolean;
  mainColor?: string;
  alwaysUseFloatingButton?: boolean;

  // Dimensions
  desktopHeight?: number;
  desktopWidth?: number;

  // User ID format
  humanReadableIds?: boolean;

  // Visitor name (optional)
  visitorName?: string;

  // Working hours configuration
  workingHours?: {
    enabled: boolean;
    timezone: string;
    startTime: string; // 'HH:MM' format (24h)
    endTime: string;   // 'HH:MM' format (24h)
  };
}

/**
 * Socket Events
 */
export interface RegisterPayload {
  chatId: string;
  userId: string;
  CustomData?: Record<string, unknown>;
  helpMsg?: string;
}

export interface SendMessagePayload {
  text: string;
  from: 'visitor';
  visitorName?: string;
  pageUrl: string;
  pageTitle: string;
  browserLang: string;
  referrer: string;
  userAgent: string;
  timestamp: string;
}

/**
 * Widget State
 */
export interface WidgetState {
  isChatOpen: boolean;
  pristine: boolean;
  wasChatOpened: boolean;
}

/**
 * Chat Props
 */
export interface ChatProps {
  chatId: string;
  userId: string;
  host: string;
  conf: ChatConfiguration;
  CustomData?: Record<string, unknown>;
}
