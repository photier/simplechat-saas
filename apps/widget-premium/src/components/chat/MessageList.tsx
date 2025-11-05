import React, { useEffect, useRef } from 'react';
import type { Message } from '../../types';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  displayTime?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, displayTime = true }) => {
  const chatRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatRef.current) {
      const element = chatRef.current;
      element.scrollTo({
        top: element.scrollHeight - element.clientHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus on mount
  useEffect(() => {
    chatRef.current?.focus();
  }, []);

  // Filter out empty messages
  const validMessages = messages.filter((msg) => msg.text && msg.text.trim().length > 0);

  return (
    <div
      ref={chatRef}
      className="message-list"
      tabIndex={0}
    >
      {validMessages.map((message, index) => (
        <MessageBubble key={index} message={message} displayTime={displayTime} />
      ))}
    </div>
  );
};
