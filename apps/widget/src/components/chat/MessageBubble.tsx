import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Message } from '../../types';
import { parseMarkdown, formatTime } from '../../lib/utils';

interface MessageBubbleProps {
  message: Message;
  displayTime?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, displayTime = true }) => {
  const isVisitor = message.from === 'visitor';
  const bubbleClass = isVisitor ? 'visitor' : message.from === 'admin' ? 'admin' : 'bot';
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Link'lere click event ekle
  useEffect(() => {
    if (!bubbleRef.current) return;

    const links = bubbleRef.current.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.stopPropagation(); // Bubble'a propagate etmesin
      });
    });

    // Cleanup
    return () => {
      links.forEach(link => {
        link.removeEventListener('click', (e) => {
          e.stopPropagation();
        });
      });
    };
  }, [message.text]);

  return (
    <motion.div
      style={{
        marginBottom: 12,
        display: 'flex',
        justifyContent: isVisitor ? 'flex-end' : 'flex-start'
      }}
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.6
      }}
    >
      <motion.div
        ref={bubbleRef}
        className={`message-bubble ${bubbleClass}`}
        style={{ cursor: 'default' }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.15 }}
      >
        <div
          dangerouslySetInnerHTML={{ __html: parseMarkdown(message.text) }}
        />
        {displayTime && (
          <div className="message-time">
            {formatTime(message.time)}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
