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
      });
    } else if (activeTab === 'live' && liveMessages.length === 0 && config.introMessage) {
      addMessage({
        text: config.introMessage,
        from: 'admin',
        time: new Date(),
      });
    }
  }, [activeTab]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (aiMessages.length > 0) {
      storageUtils.set(aiMessagesKey, aiMessages);
    }
  }, [aiMessages, aiMessagesKey]);

  useEffect(() => {
    if (liveMessages.length > 0) {
      storageUtils.set(liveMessagesKey, liveMessages);
    }
  }, [liveMessages, liveMessagesKey]);

  // Listen for CLEAR_CHAT message from parent (refresh button)
  useEffect(() => {
    const handleClearChat = (event: MessageEvent) => {
      if (event.data && event.data.type === 'CLEAR_CHAT') {
        console.log('Clearing chat...');
        clearMessages();
        storageUtils.remove(aiMessagesKey);
        storageUtils.remove(liveMessagesKey);

        // Show appropriate intro message based on active tab
        if (activeTab === 'ai' && config.autoResponse) {
          const introMsg = config.autoResponse;
          setTimeout(() => {
            addMessage({
              text: introMsg,
              from: 'bot',
              time: new Date(),
            });
          }, 100);
        } else if (activeTab === 'live' && config.introMessage) {
          const introMsg = config.introMessage;
          setTimeout(() => {
            addMessage({
              text: introMsg,
              from: 'admin',
              time: new Date(),
            });
          }, 100);
        }
      }
    };

    window.addEventListener('message', handleClearChat);
    return () => window.removeEventListener('message', handleClearChat);
  }, [activeTab, config, clearMessages, addMessage, aiMessagesKey, liveMessagesKey]);

  const handleSend = (text: string) => {
    const humanMode = activeTab === 'live';

    console.log('🔵 [Premium] handleSend called');
    console.log('🔵 [Premium] activeTab:', activeTab);
    console.log('🔵 [Premium] humanMode:', humanMode);
    console.log('🔵 [Premium] message:', text);

    // Add message to store (it will automatically go to the right tab based on activeTab)
    addMessage({
      text,
      from: 'visitor',
      time: new Date(),
    });

    // Send via socket
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
