import React, { useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useSocket } from '../../hooks/useSocket';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { storageUtils } from '../../lib/utils';
import type { Message } from '../../types';

interface ChatWindowProps {
  chatId: string;
  userId: string;
  host: string;
  CustomData?: Record<string, unknown>;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, userId, host, CustomData }) => {
  const { messages, config, clearMessages, addMessage, setMessages } = useChatStore();
  const { sendMessage } = useSocket({ chatId, userId, host, CustomData });

  // Storage key for persisting messages
  const messagesKey = `messages.${chatId}.${host}`;

  // Load messages from localStorage on mount
  useEffect(() => {
    const storedMessages = storageUtils.get<Message[]>(messagesKey);
    if (storedMessages && Array.isArray(storedMessages)) {
      setMessages(storedMessages);
    }

    // Show intro message if no messages
    if (!storedMessages || storedMessages.length === 0) {
      if (config.introMessage) {
        addMessage({
          text: config.introMessage,
          from: 'admin',
          time: new Date(),
        });
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      storageUtils.set(messagesKey, messages);
    }
  }, [messages, messagesKey]);

  // Listen for CLEAR_CHAT message from parent (refresh button)
  useEffect(() => {
    const handleClearChat = (event: MessageEvent) => {
      if (event.data && event.data.type === 'CLEAR_CHAT') {
        console.log('Clearing chat...');
        clearMessages();
        storageUtils.remove(messagesKey);

        // Show intro message again
        if (config.introMessage) {
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
  }, [config.introMessage, messagesKey]);

  return (
    <div className="chat-window">
      <MessageList messages={messages} displayTime={config.displayMessageTime} />
      <MessageInput
        onSend={sendMessage}
        placeholder={config.placeholderText || 'Send a message...'}
        disabled={false}
      />
    </div>
  );
};
