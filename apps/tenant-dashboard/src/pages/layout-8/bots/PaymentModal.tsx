import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { chatbotService, Chatbot } from '@/services/chatbot.service';
import { toast } from 'sonner';
import { CreditCard, Sparkles, Gift, Check } from 'lucide-react';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bot: Chatbot | null;
  onSuccess: () => void;
}

export function PaymentModal({ open, onOpenChange, bot, onSuccess }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);

  if (!bot) return null;

  const handleFreeTrial = async () => {
    try {
      setLoading(true);
      const result = await chatbotService.purchase(bot.id);

      toast.success(
        <div>
          <p className="font-semibold">🎉 Bot Activated Successfully!</p>
          <p className="text-sm">Your 7-day free trial has started.</p>
        </div>
      );

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error('Failed to activate trial: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePaidPlan = (planType: 'BASIC' | 'PREMIUM') => {
    toast.info(`Payment integration for ${planType} plan coming soon! (Iyzico Phase 4)`);
  };

  const basicPrice = bot.type === 'BASIC' ? '9.99' : null;
  const premiumPrice = bot.type === 'PREMIUM' ? '19.99' : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <CreditCard className="w-6 h-6 text-purple-600" />
            Complete Your Purchase
          </DialogTitle>
          <DialogDescription>
            Choose a plan for <span className="font-semibold text-gray-900">"{bot.name}"</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-6">
          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* BASIC Plan */}
            <div className="relative border-2 border-blue-200 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-shadow">
              <div className="absolute top-4 right-4">
                <Sparkles className="w-6 h-6 text-blue-500" />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">BASIC Plan</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-gray-900">$9.99</span>
                <span className="text-gray-500">/month</span>
              </div>

              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>AI-powered chat widget</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Unlimited conversations</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>24/7 automated responses</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Analytics dashboard</span>
                </li>
              </ul>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => handlePaidPlan('BASIC')}
                disabled={loading || bot.type !== 'BASIC'}
              >
                {bot.type === 'BASIC' ? 'Subscribe Now' : 'Not Available'}
              </Button>
            </div>

            {/* PREMIUM Plan */}
            <div className="relative border-2 border-purple-300 rounded-xl p-6 bg-gradient-to-br from-purple-50 to-white hover:shadow-lg transition-shadow">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-xs font-semibold">
                MOST POPULAR
              </div>

              <div className="absolute top-4 right-4">
                <Sparkles className="w-6 h-6 text-purple-500" />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2 mt-2">PREMIUM Plan</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-gray-900">$19.99</span>
                <span className="text-gray-500">/month</span>
              </div>

              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="font-semibold">Everything in BASIC, plus:</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Dual-tab: AI Bot + Live Support</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Telegram integration</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Human handoff support</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
              </ul>

              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={() => handlePaidPlan('PREMIUM')}
                disabled={loading || bot.type !== 'PREMIUM'}
              >
                {bot.type === 'PREMIUM' ? 'Subscribe Now' : 'Not Available'}
              </Button>
            </div>
          </div>

          {/* Free Trial Banner */}
          <div className="relative border-2 border-green-300 rounded-xl p-6 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/30 to-transparent rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-200/30 to-transparent rounded-full -ml-12 -mb-12"></div>

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    🎁 Try for FREE - 7 Days Trial
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    Start with a <span className="font-semibold">BASIC plan</span> for 7 days - completely free!
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                      <span>No credit card required</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                      <span>Full access to BASIC features</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                      <span>Cancel anytime - no commitments</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex-shrink-0">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all px-8"
                  onClick={handleFreeTrial}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Activating...
                    </>
                  ) : (
                    <>
                      <Gift className="w-5 h-5 mr-2" />
                      Start Free Trial
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            💳 Payment integration with Iyzico will be available in Phase 4.
            For now, use the free trial to test your bot!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
