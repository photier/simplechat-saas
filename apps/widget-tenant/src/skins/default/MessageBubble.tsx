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

  // Determine bubble class and emoji based on sender
  let bubbleClass: string;
  let avatarEmoji: string;

  if (isVisitor) {
    bubbleClass = 'visitor';
    avatarEmoji = '👤'; // Customer always has this emoji
  } else if (message.from === 'agent') {
    bubbleClass = 'agent'; // Purple styling for Live Support (from Telegram)
    avatarEmoji = '👩🏻‍🦰'; // Live Support agent emoji
  } else if (message.from === 'admin') {
    bubbleClass = 'admin'; // Admin messages
    avatarEmoji = message.emoji || '🤖'; // Use conversation flow emoji or default
  } else {
    bubbleClass = 'bot'; // Gray styling for AI Bot
    avatarEmoji = message.emoji || '🤖'; // Use conversation flow emoji or default
  }

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
        justifyContent: isVisitor ? 'flex-end' : 'flex-start',
        alignItems: 'flex-start',
        gap: '8px'
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
      {/* Avatar - Left for bot/agent, Right for visitor */}
      {!isVisitor && (
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: message.from === 'agent' ? 'linear-gradient(135deg, #9F7AEA, #B794F6)' : 'linear-gradient(135deg, #4c86f0, #6b9ef5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: '16px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {avatarEmoji}
        </div>
      )}

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

      {/* Avatar - Right for visitor */}
      {isVisitor && (
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6B7280, #9CA3AF)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: '16px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {avatarEmoji}
        </div>
      )}
    </motion.div>
  );
};
