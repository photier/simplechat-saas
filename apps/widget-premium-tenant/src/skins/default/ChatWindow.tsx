import React, { useEffect, useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useSocket } from '../../hooks/useSocket';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { storageUtils, isWithinWorkingHours } from '../../lib/utils';

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
  const [overlayDismissed, setOverlayDismissed] = useState(false);

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
      {isOutsideWorkingHours && activeTab === 'live' && !overlayDismissed && (
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
            justifyContent: 'flex-start',
            paddingTop: '120px',
            padding: '120px 24px 32px 24px',
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
              marginBottom: '16px',
              lineHeight: '1.5',
              maxWidth: '280px',
            }}
          >
            {config.workingHours?.message || 'But would you like to try your luck? Maybe an assistant is online.'}
          </div>
          <div
            style={{
              fontSize: '13px',
              color: '#86868b',
              marginBottom: '24px',
              fontStyle: 'italic',
            }}
          >
            💡 You can also use the AI Bot tab for instant assistance!
          </div>
          {config.workingHours?.showDismissButton !== false && (
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
          )}
        </div>
      )}

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
