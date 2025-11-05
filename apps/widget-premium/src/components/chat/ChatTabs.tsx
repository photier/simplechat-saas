import React from 'react';

interface ChatTabsProps {
  activeTab: 'ai' | 'live';
  onTabChange: (tab: 'ai' | 'live') => void;
  mainColor: string;
}

export const ChatTabs: React.FC<ChatTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div
      style={{
        padding: '8px 12px 8px 12px',
        background: 'transparent',
        flexShrink: 0,
      }}
    >
      {/* Segmented Control Container */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          padding: '3px',
          background: '#E5E5EA',
          borderRadius: '20px',
        }}
      >
        {/* Live Support Tab */}
        <button
          onClick={() => onTabChange('live')}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: 'none',
            background: activeTab === 'live' ? '#fff' : 'transparent',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: activeTab === 'live' ? 600 : 500,
            color: activeTab === 'live' ? '#000' : '#666',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: activeTab === 'live' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          <span style={{ fontSize: '14px' }}>👤</span>
          Live Support
        </button>

        {/* AI Bot Tab */}
        <button
          onClick={() => onTabChange('ai')}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: 'none',
            background: activeTab === 'ai' ? '#fff' : 'transparent',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: activeTab === 'ai' ? 600 : 500,
            color: activeTab === 'ai' ? '#000' : '#666',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: activeTab === 'ai' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          <span style={{ fontSize: '14px' }}>🤖</span>
          Photier AI Bot
        </button>
      </div>
    </div>
  );
};
