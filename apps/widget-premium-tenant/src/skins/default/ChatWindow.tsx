import React, { useEffect, useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useSocket } from '../../hooks/useSocket';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { storageUtils, isWithinWorkingHours, getOutsideWorkingHoursMessage } from '../../lib/utils';

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

  // Check working hours status (only for Live Support tab)
  const [isOutsideWorkingHours, setIsOutsideWorkingHours] = useState(false);

  useEffect(() => {
    // Only check working hours for Live Support tab
    if (activeTab !== 'live') {
      setIsOutsideWorkingHours(false);
      return;
    }

    // Check working hours on mount and every minute
    const checkWorkingHours = () => {
      const withinHours = isWithinWorkingHours(config.workingHours);
      setIsOutsideWorkingHours(!withinHours);
    };

    checkWorkingHours();
    const interval = setInterval(checkWorkingHours, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [activeTab, config.workingHours]);

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
    <div className="chat-window" style={{ position: 'relative' }}>
      {/* Working Hours Overlay (only for Live Support tab) */}
      {isOutsideWorkingHours && activeTab === 'live' && (
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
          <p
            style={{
              fontSize: '13px',
              color: '#9ca3af',
              marginTop: '16px',
              fontStyle: 'italic',
            }}
          >
            💡 You can still use the AI Bot tab for instant assistance!
          </p>
        </div>
      )}

      <MessageList messages={messages} displayTime={config.displayMessageTime} />
      {tabs}
      <MessageInput
        onSend={handleSend}
        placeholder={config.placeholderText || 'Send a message...'}
        disabled={isOutsideWorkingHours && activeTab === 'live'}
      />
    </div>
  );
};
