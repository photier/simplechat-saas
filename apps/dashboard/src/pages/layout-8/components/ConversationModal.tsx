import { useEffect, useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog';
import { X, MessageSquare } from 'lucide-react';
import { API_CONFIG } from '../../../config';
import { io } from 'socket.io-client';

interface Message {
  id: string;
  text: string;
  from: 'visitor' | 'admin' | 'bot' | 'live-support';
  createdAt: string;
  human_mode?: boolean;
}

interface ConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  channelType: 'web' | 'premium';
}

export const ConversationModal = ({
  isOpen,
  onClose,
  userId,
  userName,
  channelType,
}: ConversationModalProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Fetch messages when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      setIsInitialLoad(true); // Mark as initial load
      fetchMessages(true); // true = initial load
      // Enable animation on first open, disable on subsequent re-renders
      setShouldAnimate(true);
      const timer = setTimeout(() => setShouldAnimate(false), 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, userId]);

  // Real-time updates - listen for new messages
  useEffect(() => {
    if (!isOpen || !userId) return;

    const socket = io(API_CONFIG.STATS_API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    socket.on('connect', () => {
      console.log('✅ [ConversationModal] Connected to stats server');
    });

    socket.on('stats_update', (data) => {
      // Only refetch if this is a message event
      if (data.type === 'new_message' || data.event === 'new_message') {
        console.log('📨 [ConversationModal] New message received, refetching...');
        fetchMessages(false); // false = silent update, no loading spinner
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
        setIsInitialLoad(false); // Mark as no longer initial
      } else {
        // Real-time updates: instant scroll (no flicker)
        scrollToBottom(false);
      }
    }
  }, [messages, isInitialLoad]);

  const fetchMessages = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      // Get tenantId from subdomain (e.g., "company.simplechat.bot" -> get tenant by subdomain)
      const subdomain = window.location.hostname.split('.')[0];
      const isTenantMode = subdomain && subdomain !== 'stats' && subdomain !== 'localhost';

      // Build URL based on mode
      let url = `${API_CONFIG.STATS_API_URL}/api/messages/${userId}`;
      if (isTenantMode) {
        // For tenant dashboards, we need to get tenantId from backend first
        // For now, use original userId query (will be enhanced later)
        url = `${API_CONFIG.STATS_API_URL}/api/messages/${userId}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      // API returns { messages: [...] }
      const data = await response.json();
      const messagesArray = Array.isArray(data.messages) ? data.messages : [];

      // Transform messages
      const transformedMessages: Message[] = messagesArray.map((msg: any) => {
        let from: Message['from'] = 'visitor';

        // API returns 'agent' for live support, 'bot' for AI, 'user' for visitor
        if (msg.from === 'agent' || (msg.from === 'admin' && msg.humanMode === true)) {
          from = 'live-support';
        } else if (msg.from === 'admin' || msg.from === 'bot') {
          from = 'bot';
        } else {
          from = 'visitor';
        }

        return {
          id: msg.id?.toString() || Math.random().toString(),
          text: msg.message || '',  // API uses 'message' field
          from,
          createdAt: msg.createdAt,
          human_mode: msg.humanMode,  // API uses camelCase
        };
      });

      setMessages(transformedMessages);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load conversation');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

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

  const getMessageStyle = (from: Message['from']) => {
    switch (from) {
      case 'visitor':
        return {
          backgroundColor: '#f5f0f6',
          color: '#000',
          borderRadius: '18px 18px 18px 4px',
          alignSelf: 'flex-start',
          emoji: '👤',
          label: 'Visitor',
        };
      case 'live-support':
        return {
          backgroundColor: '#B794F6',
          color: '#fff',
          borderRadius: '18px 18px 4px 18px',
          alignSelf: 'flex-end',
          emoji: '🎧',
          label: 'Live Support',
        };
      case 'bot':
      case 'admin':
      default:
        return {
          backgroundColor: 'rgba(0, 122, 255, 0.75)',
          color: '#fff',
          borderRadius: '18px 18px 4px 18px',
          alignSelf: 'flex-end',
          emoji: '🤖',
          label: 'AI Bot',
        };
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`max-w-3xl max-h-[85vh] flex flex-col rounded-2xl shadow-2xl ${
          shouldAnimate ? 'animate-in fade-in-0 zoom-in-95 duration-300' : ''
        }`}
        showCloseButton={false}
        overlay={true}
        aria-describedby="user-id-description"
      >
        {/* Custom Header with Gradient */}
        <DialogHeader className="bg-gradient-to-r from-purple-50 to-pink-50 -m-6 mb-0 p-6 rounded-t-2xl border-b border-purple-100">
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
                aria-hidden="true"
              >
                <MessageSquare className="size-7" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Conversation with {userName}
                </DialogTitle>
                <p className="text-sm text-gray-600 font-medium" id="user-id-description">{userId}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl hover:bg-white/60 active:scale-95 transition-all duration-200 backdrop-blur-sm"
            >
              <X className="size-6 text-gray-700" />
            </button>
          </div>
        </DialogHeader>

        {/* Messages Body */}
        <DialogBody className="overflow-y-auto py-6 px-6 bg-gray-50">
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
                {messages.map((message, index) => {
                const style = getMessageStyle(message.from);
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
                          __html: escapeHtml(message.text),
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
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
