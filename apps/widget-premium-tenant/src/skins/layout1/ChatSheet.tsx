import React, { useRef, useEffect, useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useSocket } from '../../hooks/useSocket';
import { ChatTabs } from '../default';
import { CheckCheck, Paperclip } from 'lucide-react';
import { isWithinWorkingHours } from '../../lib/utils';
import type { Message } from '../../types';
import './styles.css';

interface ChatSheetProps {
  chatId: string;
  userId: string;
  host: string;
  CustomData?: Record<string, unknown>;
}

export const ChatSheet: React.FC<ChatSheetProps> = ({ chatId, userId, host, CustomData }) => {
  const { aiMessages, liveMessages, activeTab, config, isChatOpen, setActiveTab } = useChatStore();
  const { sendMessage } = useSocket({ chatId, userId, host, CustomData, isChatOpen });
  const [inputValue, setInputValue] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get messages based on active tab
  const messages = activeTab === 'ai' ? aiMessages : liveMessages;
  const humanMode = activeTab === 'live';

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

  // Auto-scroll to bottom
  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue, humanMode);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="sheet-content" style={{ position: 'relative' }}>
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

      {/* Header */}
      <div className="sheet-header">
        <div className="sheet-header-top">
          <div className="sheet-title">Chat</div>
        </div>
        <div className="sheet-header-info">
          <div className="sheet-header-left">
            <div className="sheet-icon">
              💬
            </div>
            <div>
              <div className="sheet-team-name">{config.titleOpen || 'Support Team'}</div>
              <div className="sheet-typing">We're here to help</div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Body */}
      <div className="sheet-body">
        {messages.map((message: Message, index: number) => {
          const isVisitor = message.from === 'visitor';
          const isOut = isVisitor;

          return isOut ? (
            <div key={index} className="sheet-message-out">
              <div className="sheet-message-content-wrapper">
                <div
                  className="sheet-bubble-out"
                  dangerouslySetInnerHTML={{
                    __html: message.text.replace(/\n/g, '<br>'),
                  }}
                />
                <div className="sheet-message-meta-out">
                  <span className="sheet-time">
                    {new Date(message.time).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <CheckCheck className="sheet-check-icon" />
                </div>
              </div>
              <div className="sheet-avatar">
                <div className="sheet-avatar-circle">👤</div>
              </div>
            </div>
          ) : (
            <div key={index} className="sheet-message-in">
              <div className="sheet-avatar">
                <div className={`sheet-avatar-circle ${message.from === 'agent' ? 'agent' : 'admin'}`}>
                  {message.from === 'agent' ? '👧🏼' : '🤖'}
                </div>
              </div>
              <div className="sheet-message-content-wrapper">
                <div
                  className={`sheet-bubble-in ${message.from === 'agent' ? 'agent' : ''}`}
                  dangerouslySetInnerHTML={{
                    __html: message.text.replace(/\n/g, '<br>'),
                  }}
                />
                <span className="sheet-time">
                  {new Date(message.time).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Tabs - Above Input */}
      <ChatTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        mainColor={config.mainColor || '#9F7AEA'}
      />

      {/* Footer Input */}
      <div className="sheet-footer">
        <div className="sheet-input-wrapper">
          <div className="sheet-avatar-small">👤</div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={config.placeholderText || 'Write a message...'}
            className="sheet-input"
          />
          <div className="sheet-input-actions">
            <button
              className="sheet-attachment-button"
              title="Attach file"
            >
              <Paperclip size={16} />
            </button>
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="sheet-send-button"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
