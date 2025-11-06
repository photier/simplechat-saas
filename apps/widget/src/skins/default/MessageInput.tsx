import React, { useRef, type KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSend: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  placeholder = 'Send a message...',
  disabled = false,
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const text = inputRef.current?.value.trim();
    if (text) {
      // Remove excessive newlines (max 2 consecutive)
      const cleanedText = text.replace(/\n{2,}/g, '\n');
      onSend(cleanedText);
      if (inputRef.current) {
        inputRef.current.value = '';
        // Reset textarea height
        inputRef.current.style.height = 'auto';
      }
    }
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    // Auto-resize textarea
    target.style.height = 'auto';
    target.style.height = Math.min(target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="message-input-container">
      <div className="message-input-form">
        <textarea
          ref={inputRef}
          className="message-textarea"
          rows={1}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={disabled}
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={disabled}
          className="message-send-button"
          aria-label="Send message"
        >
          <Send style={{ width: 24, height: 24, color: '#007AFF' }} />
        </button>
      </div>
    </div>
  );
};
