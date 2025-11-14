import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/components/layouts/layout-8/components/toolbar';
import { PageTransition } from '@/components/PageTransition';
import { chatbotService, Chatbot } from '@/services/chatbot.service';
import { Plus, Bot, Settings, Trash2, Code, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { CreateBotModal } from './CreateBotModal';

export function BotsPage() {
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

  const getBotTypeBadge = (type: string) => {
    const isPremium = type === 'PREMIUM';
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

      <div className="container px-8 lg:px-12 pb-12">
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
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                {/* Header */}
                <div className={`p-6 ${bot.type === 'PREMIUM' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <Bot className="w-8 h-8 text-white" />
                    {getBotTypeBadge(bot.type)}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{bot.name}</h3>
                  <p className="text-white/80 text-sm font-mono">{bot.chatId}</p>
                </div>

                {/* Body */}
                <div className="p-6">
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
                  <div className="flex gap-2">
                    {bot.status === 'ACTIVE' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1.5"
                          onClick={() => toast.info('Configure bot coming soon...')}
                        >
                          <Settings className="size-3.5" />
                          Configure
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1.5"
                          onClick={() => toast.info('Embed code coming soon...')}
                        >
                          <Code className="size-3.5" />
                          Embed
                        </Button>
                      </>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(bot.id, bot.name)}
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
