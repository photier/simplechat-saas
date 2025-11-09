import React, { useRef, useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useSocket } from '../../hooks/useSocket';
import { ChatTabs } from '../default';
import { CheckCheck, Paperclip } from 'lucide-react';
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
    <div className="sheet-content">
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
                <div className="sheet-avatar-circle admin">🤖</div>
              </div>
              <div className="sheet-message-content-wrapper">
                <div
                  className="sheet-bubble-in"
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
