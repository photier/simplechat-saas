import api from '@/lib/api';

export interface PaymentStatusResponse {
  status: 'active' | 'processing' | 'failed';
  message?: string;
  error?: string;
}

export const paymentService = {
  /**
   * Check payment status for a bot
   * Used for polling after payment callback
   */
  async checkPaymentStatus(botId: string): Promise<PaymentStatusResponse> {
    const response = await api.get(`/payment/check-status/${botId}`);
    return response.data;
  },
};
