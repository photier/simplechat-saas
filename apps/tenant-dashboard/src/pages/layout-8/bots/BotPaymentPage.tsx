import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, CreditCard, Bitcoin, Bot, Sparkles, Users, Check, ArrowLeft } from 'lucide-react';
import { chatbotService, Chatbot } from '@/services/chatbot.service';
import { PaymentModal } from './PaymentModal';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export function BotPaymentPage() {
  const { botId } = useParams<{ botId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const [bot, setBot] = useState<Chatbot | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto'>('card');
  const [paddleModalOpen, setPaddleModalOpen] = useState(false);
  const [cryptoModalOpen, setCryptoModalOpen] = useState(false);

  useEffect(() => {
    loadBot();
  }, [botId]);

  const loadBot = async () => {
    if (!botId) {
      navigate('/');
      return;
    }

    try {
      setLoading(true);
      const data = await chatbotService.getOne(botId);

      // If bot is already active, redirect to conversations
      if (data.status === 'ACTIVE' && (data.subscriptionStatus === 'active' || data.subscriptionStatus === 'trialing')) {
        navigate(`/bots/${botId}/conversations`);
        return;
      }

      // If bot is not pending payment, redirect to home
      if (data.status !== 'PENDING_PAYMENT') {
        navigate('/');
        return;
      }

      setBot(data);
    } catch (error) {
      console.error('Failed to load bot:', error);
      toast.error('Failed to load bot details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success('🎉 Payment successful! Your bot is now active.');
    navigate(`/bots/${botId}/conversations`);
  };

  const handleContinueToPayment = () => {
    if (paymentMethod === 'card') {
      setPaddleModalOpen(true);
    } else {
      setCryptoModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 mx-auto text-blue-600 animate-spin" />
          <p className="text-muted-foreground">{t('createBot.botPayment.loading')}</p>
        </div>
      </div>
    );
  }

  if (!bot) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-3 pb-6 border-b">
            <div className="flex justify-center">
              <div className={`p-4 rounded-2xl ${
                bot.type === 'PREMIUM'
                  ? 'bg-gradient-to-br from-violet-100 to-purple-100'
                  : 'bg-gradient-to-br from-sky-100 to-blue-100'
              }`}>
                {bot.type === 'PREMIUM' ? (
                  <Users className="w-12 h-12 text-violet-600" />
                ) : (
                  <Sparkles className="w-12 h-12 text-sky-600" />
                )}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{t('createBot.botPayment.title')}</h1>
            <p className="text-gray-600">
              {t('createBot.botPayment.description', { botName: bot.name })}
            </p>
          </div>

          {/* Bot Summary */}
          <div className={`p-5 rounded-xl border-2 ${
            bot.type === 'PREMIUM'
              ? 'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200'
              : 'bg-gradient-to-br from-sky-50 to-blue-50 border-sky-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot className={`w-6 h-6 ${bot.type === 'PREMIUM' ? 'text-violet-600' : 'text-sky-600'}`} />
                <div>
                  <h3 className="font-bold text-gray-900">{bot.name}</h3>
                  <p className="text-sm text-gray-600">
                    {bot.type === 'PREMIUM' ? 'Premium Plan' : 'Basic Plan'}
                  </p>
                </div>
              </div>
              <div className={`text-right ${bot.type === 'PREMIUM' ? 'text-violet-600' : 'text-sky-600'}`}>
                <div className="text-2xl font-bold">
                  {paymentMethod === 'crypto'
                    ? (bot.type === 'PREMIUM' ? '$239' : '$119')
                    : (bot.type === 'PREMIUM' ? '$19.99' : '$9.99')
                  }
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  {paymentMethod === 'crypto' ? 'per year' : 'per month'}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">{t('createBot.botPayment.chooseMethod')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card Payment */}
              <motion.button
                type="button"
                onClick={() => setPaymentMethod('card')}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`p-5 rounded-xl border-2 text-left transition-all ${
                  paymentMethod === 'card'
                    ? 'border-sky-400 bg-sky-50/80 shadow-lg'
                    : 'border-gray-200 bg-gray-50/50 hover:border-sky-300'
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    paymentMethod === 'card' ? 'border-sky-500 bg-sky-500' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'card' && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-5 h-5 text-sky-600" />
                      <h4 className="font-bold text-gray-900">Credit / Debit Card</h4>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">
                      Pay securely with Visa, Mastercard, American Express, or Discover
                    </p>
                  </div>
                </div>

                {/* Supported Cards */}
                <div className="flex items-center gap-2 pl-8">
                  <div className="px-2 py-1 bg-white rounded border border-gray-200 text-[10px] font-bold text-gray-700">VISA</div>
                  <div className="px-2 py-1 bg-white rounded border border-gray-200 text-[10px] font-bold text-gray-700">MC</div>
                  <div className="px-2 py-1 bg-white rounded border border-gray-200 text-[10px] font-bold text-gray-700">AMEX</div>
                  <div className="px-2 py-1 bg-white rounded border border-gray-200 text-[10px] font-bold text-gray-700">DISC</div>
                </div>
              </motion.button>

              {/* Crypto Payment */}
              <motion.button
                type="button"
                onClick={() => setPaymentMethod('crypto')}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`p-5 rounded-xl border-2 text-left transition-all ${
                  paymentMethod === 'crypto'
                    ? 'border-orange-400 bg-orange-50/80 shadow-lg'
                    : 'border-gray-200 bg-gray-50/50 hover:border-orange-300'
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    paymentMethod === 'crypto' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'crypto' && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Bitcoin className="w-5 h-5 text-orange-600" />
                      <h4 className="font-bold text-gray-900">Cryptocurrency</h4>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">
                      Pay with Bitcoin, Ethereum, USDT, and 100+ cryptocurrencies
                    </p>
                  </div>
                </div>

                {/* Supported Cryptos */}
                <div className="flex items-center gap-2 pl-8">
                  <div className="px-2 py-1 bg-white rounded border border-gray-200 text-[10px] font-bold text-orange-600">BTC</div>
                  <div className="px-2 py-1 bg-white rounded border border-gray-200 text-[10px] font-bold text-blue-600">ETH</div>
                  <div className="px-2 py-1 bg-white rounded border border-gray-200 text-[10px] font-bold text-green-600">USDT</div>
                  <div className="px-2 py-1 bg-white rounded border border-gray-200 text-[10px] font-bold text-gray-700">+100</div>
                </div>
              </motion.button>
            </div>
          </div>

          {/* Security Note */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-green-600" strokeWidth={3} />
              </div>
              <span>
                🔒 Secure checkout powered by {paymentMethod === 'card' ? 'Paddle' : 'NOWPayments'} •
                SSL encrypted • Cancel anytime
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              className="gap-2 h-12 rounded-xl border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('createBot.botPayment.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleContinueToPayment}
              className={`flex-1 gap-2 h-12 rounded-xl font-semibold ${
                paymentMethod === 'crypto'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700'
                  : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700'
              }`}
            >
              {paymentMethod === 'card' ? <CreditCard className="w-4 h-4" /> : <Bitcoin className="w-4 h-4" />}
              {t('createBot.botPayment.continue')}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Paddle Payment Modal */}
      {bot && (
        <PaymentModal
          open={paddleModalOpen}
          onOpenChange={setPaddleModalOpen}
          bot={bot}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Crypto Payment Modal */}
      {bot && (
        <Dialog open={cryptoModalOpen} onOpenChange={setCryptoModalOpen}>
          <DialogContent className="sm:max-w-[900px] p-0 gap-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-orange-50 to-amber-50">
              <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Bitcoin className="w-6 h-6 text-orange-600" />
                {t('createBot.botPayment.cryptoModal.title')}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                {t('createBot.botPayment.cryptoModal.description')}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col md:flex-row">
              {/* Left Side - Payment iframe */}
              <div className="flex-1 p-6">
                <iframe
                  src={bot.type === 'PREMIUM'
                    ? `https://nowpayments.io/embeds/payment-widget?iid=5064596074&order_id=${bot.id}&order_description=Bot: ${bot.id} - ${encodeURIComponent(bot.name)}`
                    : `https://nowpayments.io/embeds/payment-widget?iid=6422959395&order_id=${bot.id}&order_description=Bot: ${bot.id} - ${encodeURIComponent(bot.name)}`
                  }
                  width="100%"
                  height="600"
                  frameBorder="0"
                  scrolling="no"
                  style={{ overflowY: 'hidden' }}
                  title="Crypto Payment"
                  className="rounded-xl border-2 border-gray-200"
                />
              </div>

              {/* Right Side - Bot Info & Details */}
              <div className="w-full md:w-80 bg-gradient-to-br from-gray-50 to-gray-100 p-6 border-l border-gray-200">
                {/* Order Summary */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Order Summary</h3>

                  {/* Bot Icon & Name */}
                  <div className="p-4 bg-white rounded-xl border-2 border-gray-200 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${
                        bot.type === 'PREMIUM' ? 'bg-gradient-to-br from-violet-100 to-purple-100' : 'bg-gradient-to-br from-sky-100 to-blue-100'
                      }`}>
                        <Bot className={`w-5 h-5 ${bot.type === 'PREMIUM' ? 'text-violet-600' : 'text-sky-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{bot.name}</p>
                        <p className="text-xs text-gray-500">Bot ID: {bot.id}</p>
                      </div>
                    </div>

                    {/* Plan Badge */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                      bot.type === 'PREMIUM'
                        ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white'
                        : 'bg-gradient-to-r from-sky-500 to-blue-500 text-white'
                    }`}>
                      {bot.type === 'PREMIUM' ? <Users className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                      {bot.type} PLAN
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 p-4 bg-white rounded-xl border-2 border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Billing Period:</span>
                      <span className="font-semibold text-gray-900">Annual</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-semibold text-gray-900">
                        {bot.type === 'PREMIUM' ? '$239' : '$119'}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900">Total:</span>
                        <span className="text-2xl font-bold text-orange-600">
                          {bot.type === 'PREMIUM' ? '$239' : '$119'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Save 17% vs monthly</p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">What's Included</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-xs text-gray-700">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>AI-powered responses</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-gray-700">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Unlimited conversations</span>
                    </div>
                    {bot.type === 'PREMIUM' && (
                      <>
                        <div className="flex items-start gap-2 text-xs text-gray-700">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Live support integration</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-gray-700">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Telegram notifications</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Security Note */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-900 leading-relaxed">
                    <strong>🔒 Secure Payment:</strong> Your bot will be automatically activated within a few minutes after payment confirmation.
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
