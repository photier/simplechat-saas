import React, { useEffect, useState, useRef } from 'react';
import { useChatStore } from '../../store/chatStore';
import { ChatWindow, ChatTabs } from '../../skins/default';
import { ChatSheet } from '../../skins/layout1';
import { FloatingButton } from './FloatingButton';
import { WidgetHeader } from './WidgetHeader';
import { isMobileDevice, cookieUtils, storageUtils } from '../../lib/utils';

interface WidgetProps {
  chatId: string;
  userId: string;
  host: string;
  CustomData?: Record<string, unknown>;
}

export const Widget: React.FC<WidgetProps> = ({ chatId, userId, host, CustomData }) => {
  const {
    isChatOpen,
    wasChatOpened,
    activeTab,
    activeSkin,
    config,
    toggleChat,
    openChat,
    closeChat,
    setWasChatOpened,
    setActiveTab,
  } = useChatStore();

  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const isMobile = isMobileDevice();
  const panelRef = useRef<HTMLDivElement>(null);

  // Check if chat was opened before (cookie)
  useEffect(() => {
    const wasOpened = cookieUtils.get('chatwasopened') === '1';
    setWasChatOpened(wasOpened);
  }, [setWasChatOpened]);

  // Smooth opening animation for layout1
  useEffect(() => {
    if (isChatOpen && activeSkin === 'layout1') {
      setIsClosing(false);
      setIsOpening(false);
      // Force reflow to ensure smooth animation
      if (panelRef.current) {
        // Force browser to recognize the initial state
        void panelRef.current.offsetHeight;
      }
      // Use RAF to add open class after reflow
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
  const handleRefresh = () => {
    console.log('[Widget Premium] Refresh button clicked');
    console.log('[Widget Premium] chatId:', chatId);
    console.log('[Widget Premium] host:', host);

    // Clear messages from store (only active tab)
    const { clearMessages, addMessage, activeTab, config, aiMessages, liveMessages } = useChatStore.getState();
    console.log('[Widget Premium] Active tab:', activeTab);
    console.log('[Widget Premium] AI messages before clear:', aiMessages.length);
    console.log('[Widget Premium] Live messages before clear:', liveMessages.length);

    clearMessages();

    const state = useChatStore.getState();
    console.log('[Widget Premium] AI messages after clear:', state.aiMessages.length);
    console.log('[Widget Premium] Live messages after clear:', state.liveMessages.length);

    // Clear localStorage for active tab
    const storageKey = activeTab === 'ai'
      ? `messages.ai.${chatId}.${host}`
      : `messages.live.${chatId}.${host}`;
    console.log('[Widget Premium] Clearing localStorage key:', storageKey);
    storageUtils.remove(storageKey);

    // Re-add appropriate intro message based on active tab
    if (activeTab === 'ai' && config.autoResponse) {
      console.log('[Widget Premium] Adding AI intro message:', config.autoResponse);
      setTimeout(() => {
        addMessage({
          text: config.autoResponse!,
          from: 'bot',
          time: new Date(),
        });
      }, 100);
    } else if (activeTab === 'live' && config.introMessage) {
      console.log('[Widget Premium] Adding Live intro message:', config.introMessage);
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

      {/* Opened State - Keep in DOM for layout1, conditional for default */}
      {(activeSkin === 'layout1' || isChatOpen || isClosing) && (
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
          {/* Default skin (only skin supported for premium currently) */}
          {activeSkin === 'default' && (
            <>
              {/* Backdrop for default skin */}
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'transparent',
                  zIndex: 0,
                }}
                onClick={() => {
                  if (isChatOpen && !isClosing) {
                    handleToggle();
                  }
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', position: 'relative', zIndex: 1 }}>
                <WidgetHeader
                  title={config.titleOpen || "Let's chat!"}
                  color={config.mainColor || '#9F7AEA'}
                  onClose={() => toggleChat()}
                  onRefresh={handleRefresh}
                />

                {/* Chat Content with Tabs at bottom */}
                <ChatWindow
                  chatId={chatId}
                  userId={userId}
                  host={host}
                  CustomData={CustomData}
                  tabs={
                    <ChatTabs
                      activeTab={activeTab}
                      onTabChange={setActiveTab}
                      mainColor={config.mainColor || '#9F7AEA'}
                    />
                  }
                />
              </div>
            </>
          )}

          {/* Layout1 skin (ChatSheet) - slide-in panel from right */}
          {activeSkin === 'layout1' && (
            <>
              {/* Backdrop overlay */}
              <div
                className={`sheet-backdrop ${isClosing ? 'closing' : ''} ${isOpening ? 'open' : ''}`}
                onClick={() => {
                  if (isChatOpen && !isClosing) {
                    handleToggle();
                  }
                }}
              />

              {/* Side panel */}
              <div ref={panelRef} className={`sheet-panel ${isClosing ? 'closing' : ''} ${isOpening ? 'open' : ''}`}>
                <button
                  onClick={() => handleToggle()}
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
