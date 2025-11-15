import React from 'react';
import { MessageCircle } from 'lucide-react';

interface FloatingButtonProps {
  onClick: () => void;
  color?: string;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({ onClick, color = '#9F7AEA' }) => {
  return (
    <button
      onClick={onClick}
      className="widget-floating-button"
      style={{ backgroundColor: color }}
      aria-label="Open chat"
    >
      <MessageCircle style={{ width: 32, height: 32, color: 'white' }} />
    </button>
  );
};
