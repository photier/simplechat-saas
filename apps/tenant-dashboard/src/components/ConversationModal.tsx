import { useEffect, useState, useRef } from 'react';
import { X, MessageSquare } from 'lucide-react';
import { useConversation, Message } from '../hooks/useConversation';
import { io } from 'socket.io-client';

interface ConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  channelType: 'web' | 'premium';
  chatbotId: string;
}

const STATS_API_URL = import.meta.env.VITE_STATS_API_URL || 'http://localhost:3002';

export const ConversationModal = ({
  isOpen,
  onClose,
  userId,
  userName,
  channelType,
  chatbotId,
}: ConversationModalProps) => {
  const { messages: initialMessages, loading, error } = useConversation(chatbotId, userId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update messages when hook data changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Auto-scroll to bottom
  const scrollToBottom = (smooth = false) => {
    if (!messagesEndRef.current) return;

    if (smooth) {
      // Smooth scroll for initial modal open (pretty animation)
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      // Instant scroll for real-time updates (no flicker)
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  };

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setIsInitialLoad(true);
    }
  }, [isOpen]);

  // Real-time updates - listen for new messages
  useEffect(() => {
    if (!isOpen || !userId) return;

    const socket = io(STATS_API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    socket.on('connect', () => {
      console.log('✅ [ConversationModal] Connected to stats server');
    });

    socket.on('stats_update', (data) => {
      // Only refetch if this is a message event
      if (data.type === 'new_message' || data.event === 'new_message') {
        console.log('📨 [ConversationModal] New message received');
        // Messages will update via useConversation hook
      }
    });

    socket.on('disconnect', () => {
      console.log('⚠️ [ConversationModal] Disconnected from stats server');
    });

    return () => {
      socket.disconnect();
    };
  }, [isOpen, userId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      if (isInitialLoad) {
        // First load: smooth scroll (pretty animation)
        scrollToBottom(true);
        setIsInitialLoad(false);
      } else {
        // Real-time updates: instant scroll (no flicker)
        scrollToBottom(false);
      }
    }
  }, [messages, isInitialLoad]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
  };

  const escapeHtml = (text: string) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
  };

  const getMessageStyle = (msg: Message) => {
    // Determine message type based on from and humanMode
    if (msg.from === 'user') {
      return {
        backgroundColor: '#f5f0f6',
        color: '#000',
        borderRadius: '18px 18px 18px 4px',
        alignSelf: 'flex-start' as const,
        emoji: '👤',
        label: 'Visitor',
      };
    } else if (msg.from === 'agent' || (msg.from === 'admin' && msg.humanMode === true)) {
      return {
        backgroundColor: '#B794F6',
        color: '#fff',
        borderRadius: '18px 18px 4px 18px',
        alignSelf: 'flex-end' as const,
        emoji: '🎧',
        label: 'Live Support',
      };
    } else {
      // bot or admin (AI)
      return {
        backgroundColor: 'rgba(0, 122, 255, 0.75)',
        color: '#fff',
        borderRadius: '18px 18px 4px 18px',
        alignSelf: 'flex-end' as const,
        emoji: '🤖',
        label: 'AI Bot',
      };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-t-2xl border-b border-purple-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg transform hover:scale-105 transition-transform"
                style={{
                  background:
                    channelType === 'web'
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                }}
              >
                <MessageSquare className="size-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Conversation with {userName}
                </h2>
                <p className="text-sm text-gray-600 font-medium">{userId}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl hover:bg-white/60 active:scale-95 transition-all duration-200 backdrop-blur-sm"
            >
              <X className="size-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="overflow-y-auto py-6 px-6 bg-gray-50 flex-1">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600 absolute top-0 left-0"></div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-12 animate-in fade-in duration-300">
              <div className="text-6xl mb-4">⚠️</div>
              <p className="text-red-500 text-lg font-semibold">{error}</p>
            </div>
          )}

          {!loading && !error && messages.length === 0 && (
            <div className="text-center py-16 animate-in fade-in duration-300">
              <div className="text-7xl mb-4">💬</div>
              <p className="text-gray-500 text-xl font-medium">No messages yet</p>
              <p className="text-gray-400 text-sm mt-2">Start a conversation to see messages here</p>
            </div>
          )}

          {!loading && !error && messages.length > 0 && (
            <div className="space-y-6">
              {messages.map((message) => {
                const style = getMessageStyle(message);
                return (
                  <div
                    key={message.id}
                    className="flex flex-col"
                    style={{
                      alignItems: style.alignSelf,
                    }}
                  >
                    {/* Message sender label */}
                    <div
                      className="text-sm font-bold text-gray-700 mb-2 px-3 flex items-center gap-2"
                      style={{
                        alignSelf: style.alignSelf,
                      }}
                    >
                      <span className="text-lg">{style.emoji}</span>
                      <span>{style.label}</span>
                    </div>

                    {/* Message bubble */}
                    <div
                      className="px-5 py-3.5 max-w-[75%] shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                      style={{
                        backgroundColor: style.backgroundColor,
                        color: style.color,
                        borderRadius: style.borderRadius,
                      }}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: escapeHtml(message.message),
                        }}
                        className="text-base leading-relaxed whitespace-pre-wrap"
                      />
                      <div
                        className="text-xs mt-2.5 font-medium"
                        style={{ opacity: 0.75, color: style.color }}
                      >
                        {formatDate(message.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
