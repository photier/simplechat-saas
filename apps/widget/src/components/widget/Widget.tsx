import React, { useEffect, useState } from 'react';
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
    openChat,
    closeChat,
    setWasChatOpened,
  } = useChatStore();

  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const isMobile = isMobileDevice();

  // Check if chat was opened before (cookie)
  useEffect(() => {
    const wasOpened = cookieUtils.get('chatwasopened') === '1';
    setWasChatOpened(wasOpened);
  }, []);

  // Smooth opening animation for layout1
  useEffect(() => {
    if (isChatOpen && activeSkin === 'layout1') {
      setIsClosing(false);
      // Wait for next frame to trigger CSS transition
      requestAnimationFrame(() => {
        setIsOpening(true);
      });
    } else {
      setIsOpening(false);
    }
  }, [isChatOpen, activeSkin]);

  // Set cookie when chat is opened for the first time
  const handleToggle = () => {
    // Set cookie on first open
    if (!isChatOpen && !wasChatOpened) {
      cookieUtils.set('chatwasopened', '1', config.cookieExpiration || 1);
      setWasChatOpened(true);
    }

    // Handle smooth closing animation for layout1
    if (isChatOpen && activeSkin === 'layout1') {
      setIsOpening(false); // Remove open state
      setIsClosing(true); // Add closing state
      // Wait for animation to complete before closing
      setTimeout(() => {
        closeChat();
        setIsClosing(false);
      }, 500); // Match animation duration
    } else if (!isChatOpen && activeSkin === 'layout1') {
      // Opening layout1 - use direct state update to avoid pristine flicker
      openChat();
    } else {
      // Default skin uses original toggle logic
      toggleChat();
    }
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
      {!isChatOpen && !isClosing && (
        <div
          style={{
            display: config.useExternalButton ? 'none' : 'block',
          }}
        >
          <FloatingButton onClick={handleToggle} color={config.mainColor} />
        </div>
      )}

      {/* Opened State - Keep in DOM during closing animation for layout1 */}
      {(isChatOpen || (isClosing && activeSkin === 'layout1')) && (
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
                onClose={() => handleToggle()}
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
          {activeSkin === 'layout1' && (
            <>
              {/* Backdrop overlay */}
              <div
                className={`sheet-backdrop ${isClosing ? 'closing' : ''} ${isOpening ? 'open' : ''}`}
                onClick={() => handleToggle()}
              />

              {/* Side panel */}
              <div className={`sheet-panel ${isClosing ? 'closing' : ''} ${isOpening ? 'open' : ''}`}>
                <button
                  onClick={() => handleToggle()}
                  className="sheet-close-button"
                >
                  ×
                </button>
                {!pristine && (
                  <ChatSheet
                    chatId={chatId}
                    userId={userId}
                    host={host}
                    CustomData={CustomData}
                  />
                )}
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
