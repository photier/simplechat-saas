export type MessageFrom = 'visitor' | 'admin' | 'agent' | 'bot';

export interface Message {
  text: string;
  from: MessageFrom;
  time: Date;
  name?: string;
  human_mode?: boolean; // Track if message is from Live Support (true) or AI Bot (false)
}

export interface ChatConfiguration {
  useExternalButton?: boolean;
  titleClosed?: string;
  titleOpen?: string;
  closedStyle?: 'chat' | 'button';
  closedChatAvatarUrl?: string;
  cookieExpiration?: number;
  introMessage?: string;
  helpMessage?: string;
  autoResponse?: string;
  autoNoResponse?: string;
  placeholderText?: string;
  displayMessageTime?: boolean;
  displayBanner?: boolean;
  mainColor?: string;
  alwaysUseFloatingButton?: boolean;
  desktopHeight?: number;
  desktopWidth?: number;
  humanReadableIds?: boolean;
  visitorName?: string;
  skin?: string; // 'default', 'layout1', 'layout2', etc.
}
