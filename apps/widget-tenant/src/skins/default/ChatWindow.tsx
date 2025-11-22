import React, { useEffect, useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useSocket } from '../../hooks/useSocket';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { storageUtils, isWithinWorkingHours, getOutsideWorkingHoursMessage } from '../../lib/utils';
import type { Message } from '../../types';

interface ChatWindowProps {
  chatId: string;
  userId: string;
  host: string;
  CustomData?: Record<string, unknown>;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, userId, host, CustomData }) => {
  const { messages, config, clearMessages, addMessage, setMessages, isChatOpen } = useChatStore();
  const { sendMessage } = useSocket({ chatId, userId, host, CustomData, isChatOpen });

  // Check working hours status
  const [isOutsideWorkingHours, setIsOutsideWorkingHours] = useState(false);

  useEffect(() => {
    // Check working hours on mount and every minute
    const checkWorkingHours = () => {
      const withinHours = isWithinWorkingHours(config.workingHours);
      setIsOutsideWorkingHours(!withinHours);
    };

    checkWorkingHours();
    const interval = setInterval(checkWorkingHours, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [config.workingHours]);

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
    <div className="chat-window" style={{ position: 'relative' }}>
      {/* Working Hours Overlay */}
      {isOutsideWorkingHours && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              marginBottom: '16px',
            }}
          >
            🕒
          </div>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '12px',
              margin: 0,
            }}
          >
            Outside Working Hours
          </h3>
          <p
            style={{
              fontSize: '14px',
              color: '#6b7280',
              lineHeight: '1.6',
              maxWidth: '320px',
              margin: 0,
            }}
          >
            {getOutsideWorkingHoursMessage(config.workingHours)}
          </p>
        </div>
      )}

      <MessageList messages={messages} displayTime={config.displayMessageTime} />
      <MessageInput
        onSend={sendMessage}
        placeholder={config.placeholderText || 'Send a message...'}
        disabled={isOutsideWorkingHours}
      />
    </div>
  );
};
