import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/components/layouts/layout-8/components/toolbar';
import { PageTransition } from '@/components/PageTransition';
import { chatbotService, Chatbot } from '@/services/chatbot.service';
import { Plus, Bot, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CreateBotModal } from './CreateBotModal';

export function BotsPage() {
  const navigate = useNavigate();
  const [bots, setBots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    loadBots();
  }, []);

  const loadBots = async () => {
    try {
      setLoading(true);
      const data = await chatbotService.getAll();
      setBots(data);
    } catch (error: any) {
      toast.error('Failed to load bots: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleBotCreated = async () => {
    // Refresh bots list after bot creation
    await loadBots();
  };

  const handleDelete = async (botId: string, botName: string) => {
    if (!confirm(`Are you sure you want to delete "${botName}"?`)) return;

    try {
      await chatbotService.delete(botId);
      toast.success('Bot deleted successfully');
      loadBots();
    } catch (error: any) {
      toast.error('Failed to delete bot: ' + (error.response?.data?.message || error.message));
    }
  };

  const getBotStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800 border-green-200',
      PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      PAUSED: 'bg-gray-100 text-gray-800 border-gray-200',
      DELETED: 'bg-red-100 text-red-800 border-red-200',
    };

    const labels = {
      ACTIVE: 'Active',
      PENDING_PAYMENT: 'Pending Payment',
      PAUSED: 'Paused',
      DELETED: 'Deleted',
    };

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles] || styles.PAUSED}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getBotTypeBadge = (bot: Chatbot) => {
    const isPremium = bot.type === 'PREMIUM';
    const isTrialOrPending = bot.status === 'PENDING_PAYMENT' || (bot.status === 'ACTIVE' && !bot.subscriptionStatus);
    const isPaymentFailed = bot.subscriptionStatus === 'failed' || bot.subscriptionStatus === 'canceled';

    // Payment Failed
    if (isPaymentFailed && bot.status !== 'PENDING_PAYMENT') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-red-100 text-red-800 border-red-300">
          ⚠️ Payment Failed
        </span>
      );
    }

    // Free Trial
    if (isTrialOrPending) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-emerald-100 text-emerald-800 border-emerald-200">
          🎁 Free Trial
        </span>
      );
    }

    // Premium or Basic (paid)
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
        isPremium
          ? 'bg-purple-100 text-purple-800 border-purple-200'
          : 'bg-blue-100 text-blue-800 border-blue-200'
      }`}>
        {isPremium ? '💎 Premium' : '⚡ Basic'}
      </span>
    );
  };

  const calculateDaysRemaining = (trialEndsAt: string) => {
    const now = new Date();
    const endDate = new Date(trialEndsAt);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="container px-8 lg:px-12 pb-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading bots...</p>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Toolbar>
        <ToolbarHeading>My Chatbots</ToolbarHeading>
        <ToolbarActions>
          <Button
            variant="default"
            className="gap-2"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="size-4" />
            Create Bot
          </Button>
        </ToolbarActions>
      </Toolbar>

      <div className="container px-8 lg:px-12 pb-12 min-h-[calc(100vh-80px)]">
        {/* Empty State */}
        {bots.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No chatbots yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first chatbot to start engaging with your customers.
                Choose between Basic (AI-only) or Premium (AI + Live Support).
              </p>
              <Button
                variant="default"
                size="lg"
                className="gap-2"
                onClick={() => setCreateModalOpen(true)}
              >
                <Plus className="size-5" />
                Create Your First Bot
              </Button>
            </div>
          </div>
        )}

        {/* Bots Grid */}
        {bots.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map((bot) => (
              <div
                key={bot.id}
                onClick={() => navigate(`/bots/${bot.chatId}/stats`)}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              >
                {/* Header */}
                <div className={`p-6 ${bot.type === 'PREMIUM' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <Bot className="w-8 h-8 text-white" />
                    {getBotTypeBadge(bot)}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{bot.name}</h3>
                  <p className="text-white/80 text-sm font-mono">{bot.chatId}</p>

                  {/* Trial Countdown */}
                  {bot.trialEndsAt && (bot.status === 'PENDING_PAYMENT' || !bot.subscriptionStatus) && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      {(() => {
                        const daysLeft = calculateDaysRemaining(bot.trialEndsAt);
                        const isExpiringSoon = daysLeft <= 2;
                        const isExpired = daysLeft <= 0;

                        return (
                          <div className={`flex items-center gap-2 text-sm ${isExpiringSoon ? 'text-yellow-200' : 'text-white/90'}`}>
                            <svg className={`w-4 h-4 ${isExpired ? 'animate-pulse' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span className="font-semibold">
                              {isExpired
                                ? '⚠️ Trial Expired'
                                : `Trial: ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`
                              }
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-6">
                  {/* Payment Failed Warning */}
                  {(bot.subscriptionStatus === 'failed' || bot.subscriptionStatus === 'canceled') && bot.status !== 'PENDING_PAYMENT' && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-red-900 mb-1">
                            {bot.subscriptionStatus === 'canceled' ? 'Subscription Canceled' : 'Payment Failed'}
                          </p>
                          <p className="text-xs text-red-700">
                            Please update your payment method to reactivate this bot.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 mb-6">
                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      {getBotStatusBadge(bot.status)}
                    </div>

                    {/* Subscription */}
                    {bot.subscriptionStatus && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Subscription:</span>
                        <span className="text-sm font-semibold text-gray-900 capitalize">
                          {bot.subscriptionStatus}
                        </span>
                      </div>
                    )}

                    {/* Trial End */}
                    {bot.trialEndsAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Trial Ends:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {new Date(bot.trialEndsAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {/* Created */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Created:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(bot.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        handleDelete(bot.id, bot.name);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Bot Modal */}
      <CreateBotModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={handleBotCreated}
      />
    </PageTransition>
  );
}
