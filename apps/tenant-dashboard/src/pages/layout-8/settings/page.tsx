import { Button } from '@/components/ui/button';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/components/layouts/layout-8/components/toolbar';
import { SearchDialog } from '@/components/layouts/layout-1/shared/dialogs/search/search-dialog';
import { ChatSheet } from '@/components/layouts/layout-1/shared/topbar/chat-sheet';
import { MessageCircleMore, Search, Plus, Bot, Settings as SettingsIcon, ChevronDown, ChevronUp, Code, Trash2, Palette, MessageSquare, Sliders } from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { PageTransition } from '@/components/PageTransition';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { chatbotService, Chatbot } from '@/services/chatbot.service';
import { toast } from 'sonner';
import { CreateBotModal } from '../bots/CreateBotModal';
import { EmbedCodeModal } from '@/components/EmbedCodeModal';
import { ConversationFlowModal } from '@/components/ConversationFlowModal';
import { SettingSection } from '@/components/settings/SettingSection';
import { InputField } from '@/components/settings/InputField';
import { ColorPickerField } from '@/components/settings/ColorPickerField';
import { TextAreaField } from '@/components/settings/TextAreaField';
import { SelectField } from '@/components/settings/SelectField';
import { ToggleField } from '@/components/settings/ToggleField';
import { SettingsTabs } from '@/components/settings/SettingsTabs';

// Single Bot Card Component - Refactored & Organized
function BotCard({ bot, onUpdate }: { bot: Chatbot; onUpdate: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [showFlowModal, setShowFlowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('appearance');

  // Editable config state
  const [config, setConfig] = useState<any>(bot.config || {});
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Update config when bot prop changes
  useEffect(() => {
    setConfig(bot.config || {});
  }, [JSON.stringify(bot.config)]);

  const isPremium = bot.type === 'PREMIUM';
  const botUrl = isPremium
    ? `https://${bot.chatId}.p.simplechat.bot`
    : `https://${bot.chatId}.w.simplechat.bot`;

  // Auto-save function (debounced 800ms)
  const autoSave = async (newConfig: any) => {
    setSaving(true);
    try {
      await chatbotService.update(bot.id, { config: newConfig });
      onUpdate();
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

    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

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

  // Generate initial flow from legacy fields
  const getInitialFlow = () => {
    if (config.conversationFlow?.steps) {
      return config.conversationFlow.steps;
    }

    const introMsg = config.introMessage || 'Hello, How can I help you today? ✨';
    const routingMsg = config.messages?.routingMessage || 'Routing you to our team... Please hold on.';

    return [
      {
        id: '1',
        type: 'message',
        order: 1,
        content: introMsg,
        emoji: '👋',
      },
      {
        id: '2',
        type: 'message',
        order: 2,
        content: 'May I have your name?',
        emoji: '🙂',
      },
      {
        id: '3',
        type: 'redirect',
        order: 3,
        content: routingMsg,
        emoji: '👤',
      },
    ];
  };

  // Save conversation flow
  const handleSaveConversationFlow = async (steps: any[]) => {
    try {
      const introMessage = steps[0]?.content || 'Hello, How can I help you today! ✨';
      const routingMessage = steps[steps.length - 1]?.content || 'Routing you to our team... Please hold on.';

      const newConfig = {
        ...config,
        introMessage,
        messages: {
          ...(config.messages || {}),
          routingMessage,
        },
        conversationFlow: {
          enabled: true,
          steps,
          version: 1,
        },
      };
      await chatbotService.update(bot.id, { config: newConfig });
      setConfig(newConfig);
      onUpdate();
      toast.success('✓ Conversation flow saved');
    } catch (error: any) {
      console.error('Failed to save conversation flow:', error);
      toast.error('Failed to save conversation flow');
      throw error;
    }
  };

  // Appearance Tab Content
  const AppearanceTab = () => (
    <div className="space-y-6">
      <SettingSection
        title="Theme & Layout"
        description="Choose your widget's visual style"
        icon={<Palette className="w-4 h-4 text-white" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Widget Theme"
            description="Select visual layout style"
            value={config.skin || 'default'}
            onChange={(value) => handleConfigChange('skin', value)}
            options={[
              { value: 'default', label: 'Default - Bubble Chat' },
              { value: 'layout1', label: 'Layout 1 - Modern Card' },
            ]}
          />
          <ColorPickerField
            label="Primary Color"
            description="Main widget color"
            value={config.mainColor || (isPremium ? '#9F7AEA' : '#4c86f0')}
            onChange={(value) => handleConfigChange('mainColor', value)}
          />
        </div>
      </SettingSection>

      <SettingSection
        title="Widget Text & Labels"
        description="Customize titles and placeholder text"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="Title (Closed)"
            description="When minimized"
            value={config.titleClosed || 'Chat with us'}
            onChange={(value) => handleConfigChange('titleClosed', value)}
            placeholder="Chat with us"
          />
          <InputField
            label="Title (Open)"
            description="When expanded"
            value={config.titleOpen || (isPremium ? '🤖 AI Bot (Premium)' : '🤖 AI Bot')}
            onChange={(value) => handleConfigChange('titleOpen', value)}
            placeholder={isPremium ? '🤖 AI Bot (Premium)' : '🤖 AI Bot'}
          />
          <InputField
            label="Input Placeholder"
            description="Message input hint"
            value={config.placeholder || 'Type your message...'}
            onChange={(value) => handleConfigChange('placeholder', value)}
            placeholder="Type your message..."
          />
        </div>
      </SettingSection>

      <SettingSection
        title="Widget Dimensions"
        description="Set desktop widget size (mobile is auto-responsive)"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Height (px)"
            description="Min: 400, Max: 800"
            type="number"
            value={config.desktopHeight || 600}
            onChange={(value) => handleConfigChange('desktopHeight', parseInt(value) || 600)}
            placeholder="600"
            min={400}
            max={800}
          />
          <InputField
            label="Width (px)"
            description="Min: 320, Max: 500"
            type="number"
            value={config.desktopWidth || 380}
            onChange={(value) => handleConfigChange('desktopWidth', parseInt(value) || 380)}
            placeholder="380"
            min={320}
            max={500}
          />
        </div>
      </SettingSection>

    </div>
  );

  // Messages Tab Content
  const MessagesTab = () => (
    <div className="space-y-6">
      <SettingSection
        title="Conversation Flow Builder"
        description="Create multi-step conversation flows with custom messages"
        icon={<MessageSquare className="w-4 h-4 text-white" />}
      >
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900 mb-3">
            Design your bot's conversation flow with welcome messages, questions, and routing logic.
          </p>
          <button
            onClick={() => setShowFlowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <MessageSquare className="size-4" />
            Open Flow Builder
          </button>
        </div>
      </SettingSection>

      {isPremium && (
        <SettingSection
          title="AI Configuration"
          description="Customize your AI bot's behavior and personality"
          badge="Premium"
          icon={<Bot className="w-4 h-4 text-white" />}
        >
          <TextAreaField
            label="AI System Prompt"
            description="Custom instructions that define your bot's personality and behavior"
            value={config.messages?.aiSystemPrompt || 'You are a helpful AI assistant. Answer questions professionally and accurately.'}
            onChange={(value) => handleMessageChange('aiSystemPrompt', value)}
            placeholder="You are a helpful AI assistant..."
            rows={4}
          />
        </SettingSection>
      )}

      <SettingSection
        title="Bot Information"
        description="Technical details and identifiers"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Bot URL</label>
            <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 font-mono break-all">
              {botUrl}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Chat ID</label>
            <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 font-mono">
              {bot.chatId}
            </div>
          </div>
        </div>
      </SettingSection>
    </div>
  );

  // Advanced Tab Content
  const AdvancedTab = () => (
    <div className="space-y-6">
      <SettingSection
        title="Widget Integration"
        description="Get embed code to add this chatbot to your website"
        icon={<Code className="w-4 h-4 text-white" />}
      >
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
      </SettingSection>

      <SettingSection
        title="Working Hours"
        description="Control when the widget is visible to visitors"
      >
        <ToggleField
          label="Enable Working Hours"
          description="Hide widget outside of business hours"
          value={config.workingHours?.enabled || false}
          onChange={(value) => handleConfigChange('workingHours', {
            ...(config.workingHours || {}),
            enabled: value
          })}
        />
        {config.workingHours?.enabled && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-700 mb-3">
              Configure working hours in your timezone. Widget will be hidden outside these hours.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Timezone"
                description="Your business timezone"
                value={config.workingHours?.timezone || 'Europe/Istanbul'}
                onChange={(value) => handleConfigChange('workingHours', {
                  ...(config.workingHours || {}),
                  timezone: value
                })}
                options={[
                  { value: 'Europe/Istanbul', label: 'Istanbul (GMT+3)' },
                  { value: 'Europe/London', label: 'London (GMT+0)' },
                  { value: 'America/New_York', label: 'New York (GMT-5)' },
                  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)' },
                  { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' },
                  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
                ]}
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Start Time"
                  description="e.g., 09:00"
                  type="time"
                  value={config.workingHours?.startTime || '09:00'}
                  onChange={(value) => handleConfigChange('workingHours', {
                    ...(config.workingHours || {}),
                    startTime: value
                  })}
                />
                <InputField
                  label="End Time"
                  description="e.g., 18:00"
                  type="time"
                  value={config.workingHours?.endTime || '18:00'}
                  onChange={(value) => handleConfigChange('workingHours', {
                    ...(config.workingHours || {}),
                    endTime: value
                  })}
                />
              </div>
            </div>
          </div>
        )}
      </SettingSection>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden relative" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      {/* Bot Header */}
      <div
        className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${
              bot.subscriptionStatus === 'trialing'
                ? 'bg-gradient-to-br from-emerald-500 to-green-500'
                : bot.subscriptionStatus === 'active'
                  ? (isPremium
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                      : 'bg-gradient-to-br from-blue-500 to-cyan-500')
                  : 'bg-gradient-to-br from-red-500 to-red-600'
            } flex items-center justify-center shadow-md`}>
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
            </div>
          </div>
          <div className="flex items-center gap-3">
            {(() => {
              if (bot.subscriptionStatus === 'trialing') {
                const daysLeft = bot.trialEndsAt ? (() => {
                  const now = new Date();
                  const endDate = new Date(bot.trialEndsAt);
                  const diffTime = endDate.getTime() - now.getTime();
                  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                })() : null;

                return (
                  <>
                    {daysLeft !== null && daysLeft > 0 && (
                      <span className="text-xs text-gray-500">
                        {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200 shadow-sm">
                      🎁 Free Trial
                    </span>
                  </>
                );
              }

              if (bot.subscriptionStatus === 'active') {
                return (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isPremium ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                    {isPremium ? '💎 Premium' : '⚡ Basic'}
                  </span>
                );
              }

              if (bot.subscriptionStatus === 'canceled') {
                const daysUntilEnd = bot.subscriptionEndsAt
                  ? Math.ceil((new Date(bot.subscriptionEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  : null;

                return (
                  <>
                    {daysUntilEnd !== null && daysUntilEnd > 0 && (
                      <span className="text-xs text-gray-500">
                        {daysUntilEnd} day{daysUntilEnd !== 1 ? 's' : ''} remaining
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200 shadow-sm">
                      🔕 Cancelled
                    </span>
                  </>
                );
              }

              return (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                  ⚠️ Payment Failed
                </span>
              );
            })()}
            {expanded ? <ChevronUp className="size-5 text-gray-400" /> : <ChevronDown className="size-5 text-gray-400" />}
          </div>
        </div>
      </div>

      {/* Status Warnings */}
      {bot.subscriptionStatus === 'canceled' && (
        <div className="px-5 py-4 bg-orange-50 border-t border-b border-orange-200">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-bold text-orange-900 mb-1">
                Subscription Cancelled
              </p>
              <p className="text-xs text-orange-700">
                {bot.subscriptionEndsAt
                  ? `This bot will remain active until ${new Date(bot.subscriptionEndsAt).toLocaleDateString()}. No further charges will be made.`
                  : 'This bot subscription has been cancelled. No further charges will be made.'}
              </p>
            </div>
          </div>
        </div>
      )}
      {bot.subscriptionStatus !== 'trialing' && bot.subscriptionStatus !== 'active' && bot.subscriptionStatus !== 'canceled' && (
        <div className="px-5 py-4 bg-red-50 border-t border-b border-red-200">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-900 mb-1">
                Payment Not Completed
              </p>
              <p className="text-xs text-red-700">
                This bot requires payment to activate. Click "Get Embed Code" button below to complete payment, or contact support for assistance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Content with Tabs */}
      {expanded && (
        <div className="border-t border-gray-200 p-6 bg-gray-50 relative" style={{ paddingBottom: activeTab === 'advanced' ? '80px' : '24px' }}>
          <SettingsTabs
            tabs={[
              {
                id: 'appearance',
                label: 'Appearance',
                icon: <Palette className="size-4" />,
                content: <AppearanceTab />,
              },
              {
                id: 'messages',
                label: 'Messages',
                icon: <MessageSquare className="size-4" />,
                content: <MessagesTab />,
              },
              {
                id: 'advanced',
                label: 'Advanced',
                icon: <Sliders className="size-4" />,
                content: <AdvancedTab />,
              },
            ]}
            defaultTab="appearance"
            onTabChange={setActiveTab}
          />

          {/* Fixed Delete Button - Bottom Right (Only on Advanced Tab) */}
          {activeTab === 'advanced' && (
            <div className="absolute bottom-4 right-4">
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!confirm(`Are you sure you want to delete "${bot.name}"? This action cannot be undone.`)) return;
                  try {
                    await chatbotService.delete(bot.id);
                    toast.success('Bot deleted successfully');
                    onUpdate();
                  } catch (error: any) {
                    toast.error('Failed to delete bot: ' + (error.response?.data?.message || error.message));
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                <Trash2 className="size-4" />
                Delete Bot
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <EmbedCodeModal
        isOpen={showEmbedModal}
        onClose={() => setShowEmbedModal(false)}
        chatId={bot.chatId}
        botType={bot.type}
      />

      <ConversationFlowModal
        isOpen={showFlowModal}
        onClose={() => setShowFlowModal(false)}
        botId={bot.id}
        initialFlow={getInitialFlow()}
        onSave={handleSaveConversationFlow}
      />
    </div>
  );
}

// Bots List Component (Unchanged)
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

          <BotsListSection />
        </div>
      </div>
    </PageTransition>
  );
}
