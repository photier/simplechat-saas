import React, { useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useSocket } from '../../hooks/useSocket';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { storageUtils } from '../../lib/utils';

interface ChatWindowProps {
  chatId: string;
  userId: string;
  host: string;
  CustomData?: Record<string, unknown>;
  tabs?: React.ReactNode;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, userId, host, CustomData, tabs }) => {
  const { aiMessages, liveMessages, activeTab, config, addMessage, isChatOpen } = useChatStore();
  const messages = activeTab === 'ai' ? aiMessages : liveMessages;
  const { sendMessage } = useSocket({ chatId, userId, host, CustomData, isChatOpen });

  // Storage keys for persisting messages (separate for each tab)
  const aiMessagesKey = `messages.ai.${chatId}.${host}`;
  const liveMessagesKey = `messages.live.${chatId}.${host}`;

  // Handle tab switching - show appropriate intro message if tab is empty
  useEffect(() => {
    if (activeTab === 'ai' && aiMessages.length === 0 && config.autoResponse) {
      addMessage({
        text: config.autoResponse,
        from: 'bot',
        time: new Date(),
      });
    } else if (activeTab === 'live' && liveMessages.length === 0 && config.introMessage) {
      addMessage({
        text: config.introMessage,
        from: 'admin',
        time: new Date(),
      });
    }
  }, [activeTab]);

  // Persist messages to localStorage when they change
  useEffect(() => {
    storageUtils.set(aiMessagesKey, aiMessages);
  }, [aiMessages]);

  useEffect(() => {
    storageUtils.set(liveMessagesKey, liveMessages);
  }, [liveMessages]);

  const handleSend = (text: string) => {
    const humanMode = activeTab === 'live';

    // Send via socket (useSocket already adds optimistic message)
    sendMessage(text, humanMode);
  };

  return (
    <div className="chat-window">
      <MessageList messages={messages} displayTime={config.displayMessageTime} />
      {tabs}
      <MessageInput
        onSend={handleSend}
        placeholder={config.placeholderText || 'Send a message...'}
        disabled={false}
      />
    </div>
  );
};
