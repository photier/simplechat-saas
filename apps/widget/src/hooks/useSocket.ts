import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useChatStore } from '../store/chatStore';
import type { Message } from '../types';

interface RegisterPayload {
  chatId: string;
  userId: string;
  CustomData?: Record<string, unknown>;
  helpMsg?: string;
}

interface SendMessagePayload {
  text: string;
  from: 'visitor';
  visitorName?: string;
  pageUrl: string;
  pageTitle: string;
  browserLang: string;
  referrer: string;
  userAgent: string;
  timestamp: string;
  human_mode: boolean;
}

interface UseSocketProps {
  chatId: string;
  userId: string;
  host: string;
  CustomData?: Record<string, unknown>;
  isChatOpen: boolean; // Track chat open state
}

export function useSocket({ chatId, userId, host, CustomData, isChatOpen }: UseSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const { addMessage, config, setConnected } = useChatStore();

  useEffect(() => {
    // Only connect when chat is open
    if (!isChatOpen) {
      console.log('🔌 useSocket: Chat closed, skipping connection');
      return;
    }

    console.log('🔌 useSocket: Connecting to Socket.io...');
    console.log('🔗 Host:', host);
    console.log('🚀 [BUILD-' + Date.now() + '] New widget version loaded!');

    // Connect to socket with explicit host
    const socket = io(host);

    socketRef.current = socket;

    console.log('🔍 Socket created, connected:', socket.connected);

    // Connection event
    socket.on('connect', () => {
      console.log('✅ Socket.io connected! Socket ID:', socket.id);
      setConnected(true);

      // Register with server
      const registerPayload: RegisterPayload = {
        chatId,
        userId,
        CustomData,
        helpMsg: config.helpMessage,
      };

      console.log('📤 Emitting register event:', registerPayload);
      socket.emit('register', registerPayload);
    });

    // Connection error
    socket.on('connect_error', (error) => {
      console.error('❌ Socket.io connect_error:', error);
    });

    // Disconnection event
    socket.on('disconnect', (reason) => {
      console.log('❌ Socket.io disconnected, reason:', reason);
      setConnected(false);
    });

    // Listen for incoming messages (broadcast to chatId)
    socket.on(chatId, (msg: Message) => {
      console.log('📨 Incoming message (chatId):', msg);
      handleIncomingMessage(msg);
    });

    // Listen for incoming messages (direct to userId)
    socket.on(`${chatId}-${userId}`, (msg: Message) => {
      console.log('📨 Incoming message (userId):', msg);
      handleIncomingMessage(msg);
    });

    // Cleanup: disconnect when chat closes or component unmounts
    return () => {
      console.log('🔌 useSocket: Chat closed or unmounting, disconnecting...');
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [chatId, userId, host, isChatOpen]); // Add isChatOpen to dependencies

  const handleIncomingMessage = (msg: Message) => {
    // Skip visitor messages (already added optimistically)
    if (msg.from === 'visitor') {
      console.log('⏭️ Skipping visitor message echo from server');
      return;
    }

    // Add message to store
    addMessage({
      ...msg,
      time: msg.time ? new Date(msg.time) : new Date(),
    });

    // Play sound for admin messages (including agent from Telegram)
    if (msg.from === 'admin' || msg.from === 'bot' || msg.from === 'agent') {
      playMessageSound();
    }
  };

  const sendMessage = (text: string) => {
    if (!socketRef.current) {
      console.error('Socket not connected');
      return;
    }

    // Gather page information
    let pageUrl: string;
    let pageTitle: string;
    let referrer: string;

    try {
      pageUrl = window.parent.location.href;
      pageTitle = window.parent.document.title;
      referrer = window.parent.document.referrer || '';
    } catch (e) {
      pageUrl = 'https://' + host;
      pageTitle = host;
      referrer = '';
    }

    const payload: SendMessagePayload = {
      text,
      from: 'visitor',
      visitorName: config.visitorName,
      pageUrl,
      pageTitle,
      browserLang: navigator.language,
      referrer,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      human_mode: false, // Normal widget is always AI-only
    };

    console.log('📤 [Normal Socket] Sending message with human_mode: false (AI-only)');
    console.log('📤 [Normal Socket] Full payload:', payload);
    socketRef.current.emit('message', payload);

    // Add optimistic update for immediate feedback
    addMessage({
      text,
      from: 'visitor',
      time: new Date(),
    });
  };

  const playMessageSound = () => {
    const audio = document.getElementById('messageSound') as HTMLAudioElement;
    if (audio) {
      audio.play().catch((e) => console.log('Failed to play sound:', e));
    }
  };

  return {
    sendMessage,
  };
}
