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
  const [overlayDismissed, setOverlayDismissed] = useState(false);

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
      {isOutsideWorkingHours && !overlayDismissed && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              marginBottom: '20px',
            }}
          >
            🕒
          </div>
          <div
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1d1d1f',
              marginBottom: '12px',
              lineHeight: '1.4',
            }}
          >
            Outside Working Hours
          </div>
          <div
            style={{
              fontSize: '14px',
              color: '#6e6e73',
              marginBottom: '24px',
              lineHeight: '1.5',
              maxWidth: '280px',
            }}
          >
            But would you like to try your luck? Maybe an assistant is online.
          </div>
          <button
            type="button"
            onClick={() => setOverlayDismissed(true)}
            style={{
              padding: '12px 32px',
              border: '2px solid #d1d1d6',
              borderRadius: '14px',
              backgroundColor: 'transparent',
              color: '#1d1d1f',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f7';
              e.currentTarget.style.borderColor = '#86868b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#d1d1d6';
            }}
          >
            Try Anyway
          </button>
        </div>
      )}

      <MessageList messages={messages} displayTime={config.displayMessageTime} />
      <MessageInput
        onSend={sendMessage}
        placeholder={config.placeholderText || 'Send a message...'}
        disabled={false}
      />
    </div>
  );
};
