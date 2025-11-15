import React from 'react';
import { X, RefreshCw } from 'lucide-react';

interface WidgetHeaderProps {
  title: string;
  color?: string;
  onClose: () => void;
  onRefresh: () => void;
}

export const WidgetHeader: React.FC<WidgetHeaderProps> = ({
  title,
  color = '#9F7AEA',
  onClose,
  onRefresh,
}) => {
  return (
    <div
      className="widget-header"
      style={{ backgroundColor: color }}
    >
      <div className="widget-header-title">{title}</div>

      <div className="widget-header-buttons">
        {/* Refresh button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRefresh();
          }}
          className="widget-header-button"
          aria-label="Refresh chat"
        >
          <RefreshCw style={{ width: 20, height: 20 }} />
        </button>

        {/* Close button */}
        <button
          onClick={onClose}
          className="widget-header-button"
          aria-label="Close chat"
        >
          <X style={{ width: 24, height: 24 }} />
        </button>
      </div>
    </div>
  );
};
