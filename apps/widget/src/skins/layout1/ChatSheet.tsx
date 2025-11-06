import React, { useRef, useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useSocket } from '../../hooks/useSocket';
import { Send } from 'lucide-react';
import './styles.css';

interface ChatSheetProps {
  chatId: string;
  userId: string;
  host: string;
  CustomData?: Record<string, unknown>;
}

export const ChatSheet: React.FC<ChatSheetProps> = ({ chatId, userId, host, CustomData }) => {
  const { messages, config } = useChatStore();
  const { sendMessage } = useSocket({ chatId, userId, host, CustomData });
  const [inputValue, setInputValue] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    sendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-sheet">
      {/* Header */}
      <div className="chat-sheet-header">
        <div className="chat-sheet-header-content">
          <div className="chat-sheet-title-wrapper">
            <div className="chat-sheet-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22H20C21.1 22 22 21.1 22 20V12C22 6.48 17.52 2 12 2Z"
                  fill="currentColor"
                  opacity="0.3"
                />
                <path
                  d="M12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div>
              <div className="chat-sheet-title">{config.titleOpen || 'Chat'}</div>
              <div className="chat-sheet-subtitle">We're here to help</div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Body */}
      <div className="chat-sheet-body">
        <div className="chat-sheet-messages">
          {messages.map((message, index) => {
            const isVisitor = message.from === 'visitor';

            return (
              <div
                key={index}
                className={`chat-sheet-message ${isVisitor ? 'visitor' : 'admin'}`}
              >
                {!isVisitor && (
                  <div className="chat-sheet-avatar">
                    <div className="chat-sheet-avatar-icon">🤖</div>
                  </div>
                )}

                <div className="chat-sheet-message-content">
                  <div
                    className="chat-sheet-bubble"
                    dangerouslySetInnerHTML={{
                      __html: message.text.replace(/\n/g, '<br>'),
                    }}
                  />
                  <div className="chat-sheet-message-time">
                    {new Date(message.time).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {isVisitor && (
                  <div className="chat-sheet-avatar">
                    <div className="chat-sheet-avatar-icon visitor">👤</div>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Footer Input */}
      <div className="chat-sheet-footer">
        <div className="chat-sheet-input-wrapper">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={config.placeholderText || 'Write a message...'}
            className="chat-sheet-input"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="chat-sheet-send-button"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
