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
  const { aiMessages, liveMessages, activeTab, config, clearMessages, addMessage, isChatOpen } = useChatStore();
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
      }, 'ai');
    } else if (activeTab === 'live' && liveMessages.length === 0 && config.aiIntroMessage) {
      addMessage({
        text: config.aiIntroMessage,
        from: 'admin',
        time: new Date(),
      }, 'live');
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

    // Add message to appropriate tab
    addMessage({
      text,
      from: 'visitor',
      time: new Date(),
    }, activeTab);

    // Send via socket
    sendMessage(text, humanMode);
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
      }}
    >
      {/* Tabs */}
      {tabs && <div>{tabs}</div>}

      {/* Messages */}
      <MessageList messages={messages} />

      {/* Input */}
      <MessageInput onSend={handleSend} />
    </div>
  );
};
