import React, { useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import { ChatWindow } from '../../skins/default';
import { ChatSheet } from '../../skins/layout1';
import { FloatingButton } from './FloatingButton';
import { WidgetHeader } from './WidgetHeader';
import { isMobileDevice, cookieUtils } from '../../lib/utils';

interface WidgetProps {
  chatId: string;
  userId: string;
  host: string;
  CustomData?: Record<string, unknown>;
}

export const Widget: React.FC<WidgetProps> = ({ chatId, userId, host, CustomData }) => {
  const {
    isChatOpen,
    pristine,
    wasChatOpened,
    config,
    activeSkin,
    toggleChat,
    setWasChatOpened,
  } = useChatStore();

  const isMobile = isMobileDevice();

  // Check if chat was opened before (cookie)
  useEffect(() => {
    const wasOpened = cookieUtils.get('chatwasopened') === '1';
    setWasChatOpened(wasOpened);
  }, []);

  // Set cookie when chat is opened for the first time
  const handleToggle = () => {
    if (!isChatOpen && !wasChatOpened) {
      cookieUtils.set('chatwasopened', '1', config.cookieExpiration || 1);
      setWasChatOpened(true);
    }
    toggleChat();
  };

  // Handle refresh button click
  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Clear messages from store
    const { clearMessages, addMessage, config } = useChatStore.getState();
    clearMessages();

    // Re-add intro message
    if (config.introMessage) {
      setTimeout(() => {
        addMessage({
          text: config.introMessage!,
          from: 'admin',
          time: new Date(),
        });
      }, 100);
    }
  };

  // Desktop dimensions
  const desktopHeight = Math.min(
    window.innerHeight - 100,
    config.desktopHeight || 500
  );

  const desktopWidth = config.desktopWidth || 370;

  return (
    <>
      {/* Closed State */}
      {!isChatOpen && (
        <div
          style={{
            display: config.useExternalButton ? 'none' : 'block',
          }}
        >
          <FloatingButton onClick={handleToggle} color={config.mainColor} />
        </div>
      )}

      {/* Opened State */}
      {isChatOpen && (
        <div
          className={`widget-container ${isMobile ? 'mobile' : 'desktop'}`}
          style={
            // Only apply size for default skin (layout1 uses fixed positioning)
            activeSkin === 'default' && !isMobile
              ? {
                  width: desktopWidth,
                  height: desktopHeight,
                }
              : {}
          }
        >
          {/* Default skin with header */}
          {!pristine && activeSkin === 'default' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white' }}>
              <WidgetHeader
                title={config.titleOpen || "Let's chat!"}
                color={config.mainColor || '#9F7AEA'}
                onClose={() => toggleChat()}
                onRefresh={() => handleRefresh({} as React.MouseEvent)}
              />
              <ChatWindow
                chatId={chatId}
                userId={userId}
                host={host}
                CustomData={CustomData}
              />
            </div>
          )}

          {/* Layout1 skin (ChatSheet) - slide-in panel from right */}
          {!pristine && activeSkin === 'layout1' && (
            <>
              {/* Backdrop overlay */}
              <div
                className="sheet-backdrop"
                onClick={() => toggleChat()}
              />

              {/* Side panel */}
              <div className="sheet-panel">
                <button
                  onClick={() => toggleChat()}
                  className="sheet-close-button"
                >
                  ×
                </button>
                <ChatSheet
                  chatId={chatId}
                  userId={userId}
                  host={host}
                  CustomData={CustomData}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Message sound */}
      <audio id="messageSound" src="/ping.mp3" preload="auto" />
    </>
  );
};
