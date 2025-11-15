import { useState, useEffect } from 'react';
import api from '@/lib/api';

export interface Message {
  id: number;
  message: string;
  from: 'user' | 'bot' | 'admin' | 'agent';
  createdAt: string;
  humanMode?: boolean;
  country?: string;
  city?: string;
}

interface UseConversationResult {
  messages: Message[];
  loading: boolean;
  error: string | null;
}

export const useConversation = (chatbotId: string, userId: string): UseConversationResult => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        setLoading(true);

        // Fetch conversation from backend API
        const response = await api.get(`/stats/messages/${userId}?chatbotId=${chatbotId}`);

        const data = response.data;
        setMessages(data.messages || []);
        setError(null);
      } catch (err: any) {
        console.error('[useConversation] Error fetching conversation:', err);
        setError(err.response?.data?.message || err.message || 'An error occurred');
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId && chatbotId) {
      fetchConversation();
    }
  }, [chatbotId, userId]);

  return { messages, loading, error };
};
