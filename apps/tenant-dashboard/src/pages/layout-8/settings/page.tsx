import { Button } from '@/components/ui/button';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/components/layouts/layout-8/components/toolbar';
import { SearchDialog } from '@/components/layouts/layout-1/shared/dialogs/search/search-dialog';
import { ChatSheet } from '@/components/layouts/layout-1/shared/topbar/chat-sheet';
import { MessageCircleMore, Search, Plus, Bot, Settings as SettingsIcon, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { PageTransition } from '@/components/PageTransition';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { chatbotService, Chatbot } from '@/services/chatbot.service';
import { toast } from 'sonner';
import { CreateBotModal } from '../bots/CreateBotModal';

// Single Bot Card Component
function BotCard({ bot }: { bot: Chatbot }) {
  const [expanded, setExpanded] = useState(false);
  const [embedTab, setEmbedTab] = useState<'cdn' | 'full' | 'npm'>('cdn');
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const config = bot.config as any || {};

  const isPremium = bot.type === 'PREMIUM';
  const botUrl = isPremium
    ? `https://${bot.chatId}.p.simplechat.bot`
    : `https://${bot.chatId}.w.simplechat.bot`;

  const prefix = isPremium ? 'P-Guest-' : 'W-Guest-';
  const botType = isPremium ? 'premium' : 'basic';

  // CDN Embed (Recommended - Short)
  const cdnEmbed = `<script src="${botUrl}/embed.js"
        data-chat-id="${bot.chatId}"
        data-type="${botType}"
        data-lang="auto">
</script>`;

  // Full Embed Code (Original)
  const fullEmbed = `<script>
(function() {
  window.simpleChatConfig = {
    chatId: "${bot.chatId}",
    userId: "${prefix}" + Math.random().toString(36).substr(2, 9),
    apiKey: "${bot.apiKey || 'your-api-key'}",
    host: "${botUrl}",
    mainColor: "${config.mainColor || (isPremium ? '#9F7AEA' : '#4c86f0')}",
    titleOpen: "${config.titleOpen || (isPremium ? '🤖 AI Bot (Premium)' : '🤖 AI Bot')}",
    titleClosed: "${config.titleClosed || 'Chat with us'}",
    introMessage: "${config.introMessage || 'Hello! How can I help you today? ✨'}",
    placeholder: "${config.placeholder || 'Type your message...'}",
    desktopHeight: ${config.desktopHeight || 600},
    desktopWidth: ${config.desktopWidth || 380}
  };

  var css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = '${botUrl}/css/simple-chat${isPremium ? '-premium' : ''}.css?v=' + Date.now();
  document.head.appendChild(css);

  var js = document.createElement('script');
  js.src = '${botUrl}/js/simple-chat${isPremium ? '-premium' : ''}.min.js?v=' + Date.now();
  js.async = true;
  document.body.appendChild(js);
})();
</script>`;

  // NPM Package Code (React Component)
  const npmCode = `# Install package
npm install @simplechat/widget

# React/Next.js usage
import { SimpleChatWidget } from '@simplechat/widget';

function App() {
  return (
    <SimpleChatWidget
      chatId="${bot.chatId}"
      type="${botType}"
      locale="auto"
      ${config.mainColor ? `mainColor="${config.mainColor}"\n      ` : ''}${config.titleOpen ? `titleOpen="${config.titleOpen}"\n      ` : ''}${config.introMessage ? `introMessage="${config.introMessage}"\n      ` : ''}/>
  );
}`;

  const getActiveCode = () => {
    switch (embedTab) {
      case 'cdn': return cdnEmbed;
      case 'full': return fullEmbed;
      case 'npm': return npmCode;
    }
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopiedEmbed(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

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
              <h3 className="text-lg font-bold text-gray-900">{bot.name}</h3>
              <p className="text-sm text-gray-500">{botUrl}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isPremium ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
              {isPremium ? '💎 Premium' : '⚡ Basic'}
            </span>
            {expanded ? <ChevronUp className="size-5 text-gray-400" /> : <ChevronDown className="size-5 text-gray-400" />}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-6">
          {/* Widget Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Widget Ana Rengi */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Widget Ana Rengi</label>
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-gray-300"
                  style={{ backgroundColor: config.mainColor || (isPremium ? '#9F7AEA' : '#4c86f0') }}
                />
                <input
                  type="text"
                  value={config.mainColor || (isPremium ? '#9F7AEA' : '#4c86f0')}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-600 font-mono"
                />
              </div>
            </div>

            {/* Widget Teması */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Widget Teması</label>
              <select
                value="default"
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-600"
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
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-600"
              />
            </div>
          </div>

          {/* Chat Titles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Chat Başlığı (Kapalı)</label>
              <input
                type="text"
                value={config.titleClosed || 'e.g: Support'}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Chat Başlığı (Açık)</label>
              <input
                type="text"
                value={config.titleOpen || (isPremium ? '🤖 AI Bot (Premium)' : '🤖 Photier AI Bot')}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-600"
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

          {/* Embed Code Section with Tabs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-900">Embed Code</label>
              <button
                onClick={copyEmbedCode}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                {copiedEmbed ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copiedEmbed ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setEmbedTab('cdn')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  embedTab === 'cdn'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                CDN <span className="ml-1 text-xs opacity-75">(Recommended)</span>
              </button>
              <button
                onClick={() => setEmbedTab('full')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  embedTab === 'full'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Full Code
              </button>
              <button
                onClick={() => setEmbedTab('npm')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  embedTab === 'npm'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                NPM <span className="ml-1 text-xs opacity-75">(React)</span>
              </button>
            </div>

            {/* Code Block */}
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto max-h-64 overflow-y-auto font-mono">
                {getActiveCode()}
              </pre>
            </div>

            {/* Usage Instructions */}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              {embedTab === 'cdn' && (
                <p className="text-xs text-blue-900">
                  <strong>Usage:</strong> Add this code right before the closing <code className="bg-blue-100 px-1 rounded">&lt;/body&gt;</code> tag.
                  Works on any website (HTML, WordPress, Shopify, etc.)
                </p>
              )}
              {embedTab === 'full' && (
                <p className="text-xs text-blue-900">
                  <strong>Full control:</strong> Complete embed code with all configuration options.
                  Customize colors, messages, and widget behavior.
                </p>
              )}
              {embedTab === 'npm' && (
                <p className="text-xs text-blue-900">
                  <strong>For developers:</strong> NPM package for React, Next.js, and other frameworks.
                  Install via npm and use as a component. Full TypeScript support included.
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <Link to={`/bots/${bot.id}/settings`} className="flex-1">
              <button className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-md">
                <SettingsIcon className="inline-block size-4 mr-2" />
                Edit Settings
              </button>
            </Link>
            <Link to={`/bots/${bot.id}/stats`} className="flex-1">
              <button className="w-full px-4 py-2.5 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-lg text-sm font-semibold transition-colors">
                View Stats
              </button>
            </Link>
          </div>
        </div>
      )}
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
            <BotCard key={bot.id} bot={bot} />
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

      <div className="container px-8 lg:px-12 pb-12">
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
