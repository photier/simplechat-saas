import { Button } from '@/components/ui/button';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/components/layouts/layout-8/components/toolbar';
import { SearchDialog } from '@/components/layouts/layout-1/shared/dialogs/search/search-dialog';
import { ChatSheet } from '@/components/layouts/layout-1/shared/topbar/chat-sheet';
import { MessageCircleMore, Search, Plus, Bot, Settings as SettingsIcon, ChevronDown, ChevronUp, Copy, Check, Code } from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { PageTransition } from '@/components/PageTransition';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { chatbotService, Chatbot } from '@/services/chatbot.service';
import { toast } from 'sonner';
import { CreateBotModal } from '../bots/CreateBotModal';
import { EmbedCodeModal } from '@/components/EmbedCodeModal';

// Single Bot Card Component (Test: Watch Paths)
function BotCard({ bot, onUpdate }: { bot: Chatbot; onUpdate: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable config state
  const [config, setConfig] = useState<any>(bot.config || {});
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Update config when bot prop changes (after refresh)
  // Use JSON.stringify for deep comparison since bot.config is an object
  useEffect(() => {
    setConfig(bot.config || {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(bot.config)]);

  const isPremium = bot.type === 'PREMIUM';
  const botUrl = isPremium
    ? `https://${bot.chatId}.p.simplechat.bot`
    : `https://${bot.chatId}.w.simplechat.bot`;

  const prefix = isPremium ? 'P-Guest-' : 'W-Guest-';
  const botType = isPremium ? 'premium' : 'basic';

  // Auto-save function (debounced 800ms)
  const autoSave = async (newConfig: any) => {
    setSaving(true);
    try {
      await chatbotService.update(bot.id, { config: newConfig });
      onUpdate(); // Refresh bot list to get latest data
      toast.success('✓ Settings saved');
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Handle config change with debounce
  const handleConfigChange = (field: string, value: any) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);

    // Clear previous timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Set new timeout for auto-save
    const timeout = setTimeout(() => {
      autoSave(newConfig);
    }, 800);
    setSaveTimeout(timeout);
  };

  // Handle nested messages config
  const handleMessageChange = (field: string, value: any) => {
    const newMessages = { ...(config.messages || {}), [field]: value };
    const newConfig = { ...config, messages: newMessages };
    setConfig(newConfig);

    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    const timeout = setTimeout(() => {
      autoSave(newConfig);
    }, 800);
    setSaveTimeout(timeout);
  };

  // No inline embed code - use modal instead

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      {/* Bot Header */}
      <div
        className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${isPremium ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-blue-500 to-cyan-500'} flex items-center justify-center shadow-md`}>
              <Bot className="size-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900">{bot.name}</h3>
                {saving && (
                  <span className="flex items-center gap-1 text-xs text-blue-600">
                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{botUrl}</p>

              {/* Trial Countdown (show only for Free Trial bots) */}
              {bot.trialEndsAt && (bot.status === 'PENDING_PAYMENT' || !bot.subscriptionStatus) && (() => {
                const now = new Date();
                const endDate = new Date(bot.trialEndsAt);
                const diffTime = endDate.getTime() - now.getTime();
                const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const isExpiringSoon = daysLeft <= 2;
                const isExpired = daysLeft <= 0;

                return (
                  <div className={`flex items-center gap-1.5 mt-2 text-xs ${isExpiringSoon ? 'text-yellow-600' : 'text-gray-600'}`}>
                    <svg className={`w-3.5 h-3.5 ${isExpired ? 'animate-pulse' : ''}`} fill="currentColor" viewBox="0 0 20 20">
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
          </div>
          <div className="flex items-center gap-3">
            {(() => {
              const isTrialOrPending = bot.status === 'PENDING_PAYMENT' || (bot.status === 'ACTIVE' && !bot.subscriptionStatus);
              const isPaymentFailed = bot.subscriptionStatus === 'failed' || bot.subscriptionStatus === 'canceled';

              // Payment Failed
              if (isPaymentFailed && bot.status !== 'PENDING_PAYMENT') {
                return (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                    ⚠️ Payment Failed
                  </span>
                );
              }

              // Free Trial
              if (isTrialOrPending) {
                return (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                    🎁 Free Trial
                  </span>
                );
              }

              // Premium or Basic (paid)
              return (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isPremium ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                  {isPremium ? '💎 Premium' : '⚡ Basic'}
                </span>
              );
            })()}
            {expanded ? <ChevronUp className="size-5 text-gray-400" /> : <ChevronDown className="size-5 text-gray-400" />}
          </div>
        </div>
      </div>

      {/* Payment Failed Warning (always visible) */}
      {(bot.subscriptionStatus === 'failed' || bot.subscriptionStatus === 'canceled') && bot.status !== 'PENDING_PAYMENT' && (
        <div className="px-5 py-4 bg-red-50 border-t border-b border-red-200">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-900 mb-1">
                {bot.subscriptionStatus === 'canceled' ? 'Subscription Canceled' : 'Payment Failed'}
              </p>
              <p className="text-xs text-red-700">
                Please update your payment method to reactivate this bot. Contact support if you need assistance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-6">
          {/* Widget Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Widget Ana Rengi */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Widget Ana Rengi</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.mainColor || (isPremium ? '#9F7AEA' : '#4c86f0')}
                  onChange={(e) => handleConfigChange('mainColor', e.target.value)}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={config.mainColor || (isPremium ? '#9F7AEA' : '#4c86f0')}
                  onChange={(e) => handleConfigChange('mainColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#4c86f0"
                />
              </div>
            </div>

            {/* Widget Teması */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Widget Teması</label>
              <select
                value="default"
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
              >
                <option value="default">Default (Bubble Chat)</option>
              </select>
            </div>

            {/* Karşılama Mesajı */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Karşılama Mesajı</label>
              <input
                type="text"
                value={config.introMessage || 'Hello, How can I help you today? ✨'}
                onChange={(e) => handleConfigChange('introMessage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Hello, How can I help you today? ✨"
              />
            </div>
          </div>

          {/* Chat Titles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Chat Başlığı (Kapalı)</label>
              <input
                type="text"
                value={config.titleClosed || 'Chat with us'}
                onChange={(e) => handleConfigChange('titleClosed', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Chat with us"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Chat Başlığı (Açık)</label>
              <input
                type="text"
                value={config.titleOpen || (isPremium ? '🤖 AI Bot (Premium)' : '🤖 AI Bot')}
                onChange={(e) => handleConfigChange('titleOpen', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={isPremium ? '🤖 AI Bot (Premium)' : '🤖 AI Bot'}
              />
            </div>
          </div>

          {/* Placeholder & Desktop Size */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Placeholder Text</label>
              <input
                type="text"
                value={config.placeholder || 'Type your message...'}
                onChange={(e) => handleConfigChange('placeholder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your message..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Desktop Height (px)</label>
              <input
                type="number"
                value={config.desktopHeight || 600}
                onChange={(e) => handleConfigChange('desktopHeight', parseInt(e.target.value) || 600)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="600"
                min="400"
                max="800"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Desktop Width (px)</label>
              <input
                type="number"
                value={config.desktopWidth || 380}
                onChange={(e) => handleConfigChange('desktopWidth', parseInt(e.target.value) || 380)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="380"
                min="320"
                max="500"
              />
            </div>
          </div>

          {/* Çalışma Saatleri & Servis Mesajları Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
              <div>
                <p className="text-sm font-semibold text-gray-900">Çalışma Saatleri</p>
                <p className="text-xs text-gray-500">Widget'i belirli saatlerde gizle</p>
              </div>
              <div className="relative inline-block w-12 h-7 rounded-full bg-gray-300 cursor-not-allowed">
                <span className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
              <div>
                <p className="text-sm font-semibold text-gray-900">Servis Mesajları</p>
                <p className="text-xs text-gray-500">Telegram bildirimleri</p>
              </div>
              <div className="relative inline-block w-12 h-7 rounded-full bg-gray-300 cursor-not-allowed">
                <span className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform" />
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Açık:</strong> Tüm kullanıcı mesajları Telegram'a bildirilir
              <strong className="ml-4">Kapalı:</strong> Sadece AI yanıtları çalışır
            </p>
          </div>

          {/* N8N Customizable Messages Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">N8N Workflow Messages</h3>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold">Advanced</span>
            </div>

            {/* Routing Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Routing Message (Human Mode Transfer)
              </label>
              <input
                type="text"
                value={config.messages?.routingMessage || 'Routing you to our team... Please hold on.'}
                onChange={(e) => handleMessageChange('routingMessage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Routing you to our team... Please hold on."
              />
              <p className="text-xs text-gray-500 mt-1">
                Shown when transferring user to live support (Premium only)
              </p>
            </div>

            {/* AI System Prompt (Premium only) */}
            {isPremium && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  AI System Prompt (Premium)
                </label>
                <textarea
                  value={config.messages?.aiSystemPrompt || 'You are a helpful AI assistant. Answer questions professionally and accurately.'}
                  onChange={(e) => handleMessageChange('aiSystemPrompt', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]"
                  placeholder="You are a helpful AI assistant..."
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Custom AI instructions for your bot's personality and behavior
                </p>
              </div>
            )}
          </div>

          {/* Widget Installation Section */}
          <div>
            <label className="text-sm font-semibold text-gray-900 block mb-3">Widget Installation</label>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 mb-3">
                Add this widget to your website using CDN, NPM, or WordPress integration.
              </p>
              <button
                onClick={() => setShowEmbedModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                <Code className="size-4" />
                Get Embed Code
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Embed Code Modal */}
      <EmbedCodeModal
        isOpen={showEmbedModal}
        onClose={() => setShowEmbedModal(false)}
        chatId={bot.chatId}
        botType={bot.type}
      />
    </div>
  );
}

// Bots List Component
function BotsListSection() {
  const [bots, setBots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    loadBots();
  }, []);

  const loadBots = async () => {
    try {
      const data = await chatbotService.getAll();
      setBots(data.filter(bot => bot.status !== 'DELETED'));
    } catch (error) {
      console.error('Failed to load bots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBotCreated = async () => {
    await loadBots();
    setCreateModalOpen(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (bots.length === 0) {
    return (
      <>
        <div
          onClick={() => setCreateModalOpen(true)}
          className="group relative overflow-hidden rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 p-8 transition-all duration-300 hover:shadow-xl cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-lg group-hover:blur-xl transition-all"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
                  <Plus className="w-8 h-8 text-white" strokeWidth={3} />
                </div>
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                  No bots yet - Create your first one!
                </h3>
                <p className="text-gray-600 text-sm">
                  Add a chatbot to start serving your customers. Each bot can have different settings.
                </p>
              </div>
            </div>
            <div className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-2 transition-all duration-300">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        <CreateBotModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onSuccess={handleBotCreated}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header with Add Bot Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">My Bots</h2>
            <p className="text-sm text-gray-500">Configure your chatbots and get embed codes</p>
          </div>
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md"
          >
            <Plus className="size-4" />
            Add Bot
          </Button>
        </div>

        {/* Bot Cards */}
        <div className="space-y-4">
          {bots.map((bot) => (
            <BotCard key={bot.id} bot={bot} onUpdate={loadBots} />
          ))}
        </div>
      </div>

      <CreateBotModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={handleBotCreated}
      />
    </>
  );
}

export function Layout8SettingsPage() {
  const { t } = useTranslation(['common', 'dashboard']);

  return (
    <PageTransition>
      <Toolbar>
        <ToolbarHeading />
        <ToolbarActions>
          <SearchDialog
            trigger={
              <Button
                variant="ghost"
                mode="icon"
                className="hover:[&_svg]:text-primary"
              >
                <Search className="size-4.5!" />
              </Button>
            }
          />
          <ChatSheet
            trigger={
              <Button
                variant="ghost"
                mode="icon"
                className="hover:[&_svg]:text-primary"
              >
                <MessageCircleMore className="size-4.5!" />
              </Button>
            }
          />
          <div className="ms-2.5">
            <LanguageSwitcher />
          </div>
        </ToolbarActions>
      </Toolbar>

      <div className="container px-8 lg:px-12 pb-12 min-h-[calc(100vh-80px)]">
        <div className="grid gap-5 lg:gap-7.5">
          {/* Settings Header */}
          <div className="bg-white rounded-xl p-6 border border-gray-100" style={{ boxShadow: '0 0 30px rgba(0,0,0,0.08)' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <SettingsIcon className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bot Settings</h1>
                <p className="text-sm text-gray-500">Manage your chatbots and configurations</p>
              </div>
            </div>
          </div>

          {/* Bots List */}
          <BotsListSection />
        </div>
      </div>
    </PageTransition>
  );
}
