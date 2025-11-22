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
import { useNavigate } from 'react-router-dom';
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
  const { t } = useTranslation(['settings', 'common']);
  const navigate = useNavigate();
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
      toast.success(t('common:notifications.settingsSaved'));
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast.error(t('common:errors.settingsSaveFailed'));
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
      toast.success(t('common:notifications.conversationFlowSaved'));
    } catch (error: any) {
      console.error('Failed to save conversation flow:', error);
      toast.error(t('common:errors.conversationFlowSaveFailed'));
      throw error;
    }
  };

  // Appearance Tab Content
  const AppearanceTab = () => (
    <div className="space-y-6">
      <SettingSection
        title={t('settings:appearance.themeLayout')}
        description={t('settings:appearance.themeLayoutDescription')}
        icon={<Palette className="w-4 h-4 text-white" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label={t('settings:appearance.widgetTheme')}
            description={t('settings:appearance.widgetThemeDescription')}
            value={config.skin || 'default'}
            onChange={(value) => handleConfigChange('skin', value)}
            options={[
              { value: 'default', label: t('settings:appearance.defaultBubbleChat') },
              { value: 'layout1', label: t('settings:appearance.layout1ModernCard') },
            ]}
          />
          <ColorPickerField
            label={t('settings:appearance.primaryColor')}
            description={t('settings:appearance.primaryColorDescription')}
            value={config.mainColor || (isPremium ? '#9F7AEA' : '#4c86f0')}
            onChange={(value) => handleConfigChange('mainColor', value)}
          />
        </div>
      </SettingSection>

      <SettingSection
        title={t('settings:appearance.widgetTextLabels')}
        description={t('settings:appearance.widgetTextLabelsDescription')}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label={t('settings:appearance.titleClosed')}
            description={t('settings:appearance.titleClosedDescription')}
            value={config.titleClosed || t('settings:appearance.titleClosedPlaceholder')}
            onChange={(value) => handleConfigChange('titleClosed', value)}
            placeholder={t('settings:appearance.titleClosedPlaceholder')}
          />
          <InputField
            label={t('settings:appearance.titleOpen')}
            description={t('settings:appearance.titleOpenDescription')}
            value={config.titleOpen || (isPremium ? '🤖 AI Bot (Premium)' : '🤖 AI Bot')}
            onChange={(value) => handleConfigChange('titleOpen', value)}
            placeholder={isPremium ? '🤖 AI Bot (Premium)' : '🤖 AI Bot'}
          />
          <InputField
            label={t('settings:appearance.inputPlaceholder')}
            description={t('settings:appearance.inputPlaceholderDescription')}
            value={config.placeholder || t('settings:appearance.inputPlaceholderValue')}
            onChange={(value) => handleConfigChange('placeholder', value)}
            placeholder={t('settings:appearance.inputPlaceholderValue')}
          />
        </div>
      </SettingSection>

      <SettingSection
        title={t('settings:appearance.widgetDimensions')}
        description={t('settings:appearance.widgetDimensionsDescription')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label={t('settings:appearance.heightPx')}
            description={t('settings:appearance.heightDescription')}
            type="number"
            value={config.desktopHeight || 600}
            onChange={(value) => handleConfigChange('desktopHeight', parseInt(value) || 600)}
            placeholder="600"
            min={400}
            max={800}
          />
          <InputField
            label={t('settings:appearance.widthPx')}
            description={t('settings:appearance.widthDescription')}
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
        title={t('settings:messages.conversationFlowBuilder')}
        description={t('settings:messages.conversationFlowDescription')}
        icon={<MessageSquare className="w-4 h-4 text-white" />}
      >
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900 mb-3">
            {t('settings:messages.flowBuilderInfo')}
          </p>
          <button
            onClick={() => setShowFlowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <MessageSquare className="size-4" />
            {t('settings:messages.openFlowBuilder')}
          </button>
        </div>
      </SettingSection>

      {isPremium && (
        <SettingSection
          title={t('settings:messages.aiConfiguration')}
          description={t('settings:messages.aiConfigurationDescription')}
          badge={t('settings:messages.premiumBadge')}
          icon={<Bot className="w-4 h-4 text-white" />}
        >
          <TextAreaField
            label={t('settings:messages.aiSystemPrompt')}
            description={t('settings:messages.aiSystemPromptDescription')}
            value={config.messages?.aiSystemPrompt || t('settings:messages.aiSystemPromptPlaceholder')}
            onChange={(value) => handleMessageChange('aiSystemPrompt', value)}
            placeholder={t('settings:messages.aiSystemPromptPlaceholder')}
            rows={4}
          />
        </SettingSection>
      )}

      <SettingSection
        title={t('settings:messages.botInformation')}
        description={t('settings:messages.botInformationDescription')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">{t('settings:messages.botUrl')}</label>
            <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 font-mono break-all">
              {botUrl}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">{t('settings:messages.chatId')}</label>
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
        title={t('settings:advanced.widgetIntegration')}
        description={t('settings:advanced.widgetIntegrationDescription')}
        icon={<Code className="w-4 h-4 text-white" />}
      >
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900 mb-3">
            {t('settings:advanced.embedInfo')}
          </p>
          <button
            onClick={() => setShowEmbedModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <Code className="size-4" />
            {t('settings:advanced.getEmbedCode')}
          </button>
        </div>
      </SettingSection>

      <SettingSection
        title={t('settings:advanced.workingHoursTitle')}
        description={t('settings:advanced.workingHoursDescription')}
      >
        <ToggleField
          label={t('settings:advanced.enableWorkingHours')}
          description={t('settings:advanced.enableWorkingHoursDescription')}
          value={config.workingHours?.enabled || false}
          onChange={(value) => handleConfigChange('workingHours', {
            ...(config.workingHours || {}),
            enabled: value
          })}
        />
        {config.workingHours?.enabled && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-700 mb-3">
              {t('settings:advanced.workingHoursConfig')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label={t('settings:advanced.timezone')}
                description={t('settings:advanced.timezoneDescription')}
                value={config.workingHours?.timezone || 'Europe/Istanbul'}
                onChange={(value) => handleConfigChange('workingHours', {
                  ...(config.workingHours || {}),
                  timezone: value
                })}
                options={[
                  { value: 'Europe/Istanbul', label: t('settings:timezones.istanbul') },
                  { value: 'Europe/London', label: t('settings:timezones.london') },
                  { value: 'America/New_York', label: t('settings:timezones.newYork') },
                  { value: 'America/Los_Angeles', label: t('settings:timezones.losAngeles') },
                  { value: 'Asia/Dubai', label: t('settings:timezones.dubai') },
                  { value: 'Asia/Tokyo', label: t('settings:timezones.tokyo') },
                ]}
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label={t('settings:advanced.startTime')}
                  description={t('settings:advanced.startTimeDescription')}
                  type="time"
                  value={config.workingHours?.startTime || '09:00'}
                  onChange={(value) => handleConfigChange('workingHours', {
                    ...(config.workingHours || {}),
                    startTime: value
                  })}
                />
                <InputField
                  label={t('settings:advanced.endTime')}
                  description={t('settings:advanced.endTimeDescription')}
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
        onClick={() => {
          // If bot is in PENDING_PAYMENT status, redirect to payment page
          if (bot.status === 'PENDING_PAYMENT' && bot.subscriptionStatus === 'pending') {
            navigate(`/bots/${bot.id}/payment`);
          } else {
            setExpanded(!expanded);
          }
        }}
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
                  : bot.status === 'PENDING_PAYMENT' && bot.subscriptionStatus === 'pending'
                    ? 'bg-gradient-to-br from-gray-400 to-gray-500'
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
                    {t('settings:botCard.saving')}
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
                        {daysLeft} {daysLeft !== 1 ? t('settings:botCard.daysLeft') : t('settings:botCard.dayLeft')}
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200 shadow-sm">
                      🎁 {t('settings:botCard.freeTrial')}
                    </span>
                  </>
                );
              }

              if (bot.subscriptionStatus === 'active') {
                return (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isPremium ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                    {isPremium ? `💎 ${t('settings:botCard.premium')}` : `⚡ ${t('settings:botCard.basic')}`}
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
                        {daysUntilEnd} {daysUntilEnd !== 1 ? t('settings:botCard.daysRemaining') : t('settings:botCard.dayRemaining')}
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200 shadow-sm">
                      🔕 {t('settings:botCard.cancelled')}
                    </span>
                  </>
                );
              }

              // Check if it's a draft bot
              if (bot.status === 'PENDING_PAYMENT' && bot.subscriptionStatus === 'pending') {
                return (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
                    📝 DRAFT
                  </span>
                );
              }

              return (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                  ⚠️ {t('settings:botCard.paymentFailed')}
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
                {t('settings:botCard.subscriptionCancelled')}
              </p>
              <p className="text-xs text-orange-700">
                {bot.subscriptionEndsAt
                  ? t('settings:botCard.subscriptionCancelledMessage', { date: new Date(bot.subscriptionEndsAt).toLocaleDateString() })
                  : t('settings:botCard.subscriptionCancelledMessageNoDate')}
              </p>
            </div>
          </div>
        </div>
      )}
      {bot.status === 'PENDING_PAYMENT' && bot.subscriptionStatus === 'pending' && (
        <div className="px-5 py-4 bg-gray-50 border-t border-b border-gray-200">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-700 mb-1">
                DRAFT - Payment Required
              </p>
              <p className="text-xs text-gray-600">
                Complete your payment to activate this bot
              </p>
            </div>
          </div>
        </div>
      )}
      {bot.subscriptionStatus !== 'trialing' && bot.subscriptionStatus !== 'active' && bot.subscriptionStatus !== 'canceled' && bot.subscriptionStatus !== 'pending' && (
        <div className="px-5 py-4 bg-red-50 border-t border-b border-red-200">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-900 mb-1">
                {t('settings:botCard.paymentNotCompleted')}
              </p>
              <p className="text-xs text-red-700">
                {t('settings:botCard.paymentNotCompletedMessage')}
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
                label: t('settings:tabs.appearance'),
                icon: <Palette className="size-4" />,
                content: <AppearanceTab />,
              },
              {
                id: 'messages',
                label: t('settings:messages.title'),
                icon: <MessageSquare className="size-4" />,
                content: <MessagesTab />,
              },
              {
                id: 'advanced',
                label: t('settings:tabs.advanced'),
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
                  if (!confirm(t('settings:advanced.deleteBotConfirm').replace('this bot', `"${bot.name}"`))) return;
                  try {
                    await chatbotService.delete(bot.id);
                    toast.success(t('common:notifications.botDeleted'));
                    onUpdate();
                  } catch (error: any) {
                    toast.error(t('common:errors.genericError'));
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                <Trash2 className="size-4" />
                {t('settings:advanced.deleteBot')}
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

// Bots List Component
function BotsListSection() {
  const { t } = useTranslation(['settings', 'common']);
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
                  {t('settings:botsList.noBots')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('settings:botsList.noBotsDescription')}
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
            <h2 className="text-xl font-bold text-gray-900">{t('settings:botsList.myBots')}</h2>
            <p className="text-sm text-gray-500">{t('settings:botsList.myBotsDescription')}</p>
          </div>
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md"
          >
            <Plus className="size-4" />
            {t('settings:botsList.addBot')}
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
                <h1 className="text-2xl font-bold text-gray-900">{t('settings:pageHeader.title')}</h1>
                <p className="text-sm text-gray-500">{t('settings:pageHeader.description')}</p>
              </div>
            </div>
          </div>

          <BotsListSection />
        </div>
      </div>
    </PageTransition>
  );
}
