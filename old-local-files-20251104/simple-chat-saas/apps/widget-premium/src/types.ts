export type MessageFrom = 'visitor' | 'admin' | 'bot';

export interface Message {
  text: string;
  from: MessageFrom;
  time: Date;
  name?: string;
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
}
