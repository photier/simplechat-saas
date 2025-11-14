import api from '@/lib/api';

export interface Chatbot {
  id: string;
  name: string;
  type: 'BASIC' | 'PREMIUM';
  chatId: string;
  status: 'PENDING_PAYMENT' | 'ACTIVE' | 'PAUSED' | 'DELETED';
  webhookUrl?: string;
  subscriptionStatus?: string;
  trialEndsAt?: string;
  config?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChatbotData {
  name: string;
  type: 'BASIC' | 'PREMIUM';
  config?: {
    mainColor?: string;
    titleOpen?: string;
    titleClosed?: string;
    introMessage?: string;
    placeholder?: string;
    desktopHeight?: number;
    desktopWidth?: number;
  };
}

export interface UpdateChatbotData {
  name?: string;
  config?: {
    mainColor?: string;
    titleOpen?: string;
    titleClosed?: string;
    introMessage?: string;
    placeholder?: string;
    desktopHeight?: number;
    desktopWidth?: number;
  };
}

export const chatbotService = {
  /**
   * Create a new chatbot
   */
  async create(data: CreateChatbotData) {
    const response = await api.post('/chatbots', data);
    return response.data;
  },

  /**
   * Get all chatbots for authenticated tenant
   */
  async getAll(): Promise<Chatbot[]> {
    const response = await api.get('/chatbots');
    return response.data;
  },

  /**
   * Get single chatbot by ID
   */
  async getOne(chatbotId: string): Promise<Chatbot> {
    const response = await api.get(`/chatbots/${chatbotId}`);
    return response.data;
  },

  /**
   * Update chatbot configuration
   */
  async update(chatbotId: string, data: UpdateChatbotData) {
    const response = await api.patch(`/chatbots/${chatbotId}`, data);
    return response.data;
  },

  /**
   * Delete chatbot (soft delete)
   */
  async delete(chatbotId: string) {
    const response = await api.delete(`/chatbots/${chatbotId}`);
    return response.data;
  },

  /**
   * Purchase bot (dummy payment)
   */
  async purchase(chatbotId: string) {
    const response = await api.post(`/chatbots/${chatbotId}/purchase`);
    return response.data;
  },

  /**
   * Get embed code for active chatbot
   */
  async getEmbedCode(chatbotId: string) {
    const response = await api.get(`/chatbots/${chatbotId}/embed`);
    return response.data;
  },
};
