import api from '@/lib/api';

export interface PaymentStatusResponse {
  status: 'active' | 'processing' | 'failed';
  message?: string;
  error?: string;
}

export interface CancelSubscriptionResponse {
  success: boolean;
  message: string;
  subscriptionEndsAt: string;
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

  /**
   * Cancel subscription for a bot
   * Bot will remain active until end of billing period
   */
  async cancelSubscription(botId: string): Promise<CancelSubscriptionResponse> {
    const response = await api.post(`/payment/cancel-subscription/${botId}`);
    return response.data;
  },
};
