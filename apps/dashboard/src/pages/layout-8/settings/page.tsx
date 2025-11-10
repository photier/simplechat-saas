import { Button } from '@/components/ui/button';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/components/layouts/layout-8/components/toolbar';
import { SearchDialog } from '@/components/layouts/layout-1/shared/dialogs/search/search-dialog';
import { ChatSheet } from '@/components/layouts/layout-1/shared/topbar/chat-sheet';
import { MessageCircleMore, Search, Shield, Star, ChevronDown } from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { PageTransition } from '@/components/PageTransition';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Toggle Switch Component
const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
        checked ? 'bg-blue-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

export function Layout8SettingsPage() {
  const { t } = useTranslation(['common', 'dashboard']);

  // Collapse States
  const [webChatCollapsed, setWebChatCollapsed] = useState(false);
  const [premiumChatCollapsed, setPremiumChatCollapsed] = useState(false);

  // Web Chat Settings
  const [webThemeColor, setWebThemeColor] = useState('#009EF7');
  const [webTitleClosed, setWebTitleClosed] = useState('');
  const [webTitleOpen, setWebTitleOpen] = useState('');
  const [webIntroMessage, setWebIntroMessage] = useState('');
  const [webWorkingHoursEnabled, setWebWorkingHoursEnabled] = useState(false);
  const [webWorkingHoursStart, setWebWorkingHoursStart] = useState('09:00');
  const [webWorkingHoursEnd, setWebWorkingHoursEnd] = useState('18:00');
  const [webServiceMessages, setWebServiceMessages] = useState(false);
  const [webTheme, setWebTheme] = useState('default');

  // Premium Chat Settings
  const [premiumThemeColor, setPremiumThemeColor] = useState('#9F7AEA');
  const [premiumTitleClosed, setPremiumTitleClosed] = useState('');
  const [premiumTitleOpen, setPremiumTitleOpen] = useState('');
  const [premiumIntroMessage, setPremiumIntroMessage] = useState('');
  const [premiumAiIntroMessage, setPremiumAiIntroMessage] = useState('');
  const [premiumWorkingHoursEnabled, setPremiumWorkingHoursEnabled] = useState(false);
  const [premiumWorkingHoursStart, setPremiumWorkingHoursStart] = useState('09:00');
  const [premiumWorkingHoursEnd, setPremiumWorkingHoursEnd] = useState('18:00');
  const [premiumServiceMessages, setPremiumServiceMessages] = useState(false);
  const [premiumTheme, setPremiumTheme] = useState('default');


  // Load settings from server on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load web settings
      const [webThemeRes, webConfigRes] = await Promise.all([
        fetch('https://chat.simplechat.bot/api/theme'),
        fetch('https://chat.simplechat.bot/api/widget-config'),
      ]);

      if (webThemeRes.ok) {
        const themeData = await webThemeRes.json();
        if (themeData.success) setWebThemeColor(themeData.themeColor);
      }

      if (webConfigRes.ok) {
        const configData = await webConfigRes.json();
        if (configData.success && configData.config) {
          const config = configData.config;
          setWebTitleClosed(config.titleClosed || '');
          setWebTitleOpen(config.titleOpen || '');
          setWebIntroMessage(config.introMessage || '');
          setWebWorkingHoursEnabled(config.workingHoursEnabled || false);
          setWebWorkingHoursStart(config.workingHoursStart || '09:00');
          setWebWorkingHoursEnd(config.workingHoursEnd || '18:00');
          setWebTheme(config.skin || 'default');
        }
      }

      // Load premium settings
      const [premiumThemeRes, premiumConfigRes] = await Promise.all([
        fetch('https://p-chat.simplechat.bot/api/theme'),
        fetch('https://p-chat.simplechat.bot/api/widget-config'),
      ]);

      if (premiumThemeRes.ok) {
        const themeData = await premiumThemeRes.json();
        if (themeData.success) setPremiumThemeColor(themeData.themeColor);
      }

      if (premiumConfigRes.ok) {
        const configData = await premiumConfigRes.json();
        if (configData.success && configData.config) {
          const config = configData.config;
          setPremiumTitleClosed(config.titleClosed || '');
          setPremiumTitleOpen(config.titleOpen || '');
          setPremiumIntroMessage(config.introMessage || '');
          setPremiumAiIntroMessage(config.aiIntroMessage || '');
          setPremiumWorkingHoursEnabled(config.workingHoursEnabled || false);
          setPremiumWorkingHoursStart(config.workingHoursStart || '09:00');
          setPremiumWorkingHoursEnd(config.workingHoursEnd || '18:00');
          setPremiumTheme(config.skin || 'default');
        }
      }

      console.log('✓ Settings loaded from server');
    } catch (error) {
      console.error('Settings load error:', error);
      toast.error('Failed to load settings');
    }
  };

  const saveAllSettings = async () => {
    try {
      toast.info('Saving settings...');

      // Save web settings
      const webResults = await Promise.all([
        fetch('https://chat.simplechat.bot/api/theme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ themeColor: webThemeColor.toUpperCase() }),
        }).then((r) => r.json()),

        fetch('https://chat.simplechat.bot/api/widget-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titleClosed: webTitleClosed,
            titleOpen: webTitleOpen,
            introMessage: webIntroMessage,
            workingHoursEnabled: webWorkingHoursEnabled,
            workingHoursStart: webWorkingHoursStart,
            workingHoursEnd: webWorkingHoursEnd,
            skin: webTheme,
          }),
        }).then((r) => r.json()),

        fetch('https://chat.simplechat.bot/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serviceMessagesEnabled: webServiceMessages }),
        }).then((r) => r.json()),
      ]);

      // Save premium settings
      const premiumResults = await Promise.all([
        fetch('https://p-chat.simplechat.bot/api/theme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ themeColor: premiumThemeColor.toUpperCase() }),
        }).then((r) => r.json()),

        fetch('https://p-chat.simplechat.bot/api/widget-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titleClosed: premiumTitleClosed,
            titleOpen: premiumTitleOpen,
            introMessage: premiumIntroMessage,
            aiIntroMessage: premiumAiIntroMessage,
            workingHoursEnabled: premiumWorkingHoursEnabled,
            workingHoursStart: premiumWorkingHoursStart,
            workingHoursEnd: premiumWorkingHoursEnd,
            skin: premiumTheme,
          }),
        }).then((r) => r.json()),

        fetch('https://p-chat.simplechat.bot/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serviceMessagesEnabled: premiumServiceMessages }),
        }).then((r) => r.json()),
      ]);

      // Check if all succeeded
      const allSuccess =
        [...webResults, ...premiumResults].every((r) => r.success);

      if (allSuccess) {
        toast.success('✓ All settings saved successfully!');
      } else {
        toast.error('Some settings could not be saved');
      }
    } catch (error) {
      console.error('Settings save error:', error);
      toast.error('Failed to save settings');
    }
  };


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

      <div className="container px-8 lg:px-12">
        <div className="grid gap-5 lg:gap-7.5">
          {/* Settings Header */}
          <div className="bg-white rounded-xl p-6 border border-gray-100" style={{ boxShadow: '0 0 30px rgba(0,0,0,0.08)' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Shield className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('common:menu.settings')}</h1>
                <p className="text-sm text-gray-500">Configure your chat widgets</p>
              </div>
            </div>
          </div>

          {/* Web Chat Settings */}
          <div className="bg-white rounded-xl border border-gray-100" style={{ boxShadow: '0 0 30px rgba(0,0,0,0.08)' }}>
            <button
              onClick={() => setWebChatCollapsed(!webChatCollapsed)}
              className="w-full p-5 border-b border-gray-100 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <MessageCircleMore className="size-5 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-base font-bold text-gray-900">💬 Web Chat Settings</h3>
                <p className="text-xs text-gray-500">chat.simplechat.bot</p>
              </div>
              <ChevronDown
                className={`size-5 text-gray-500 transition-transform duration-300 ${
                  webChatCollapsed ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                webChatCollapsed ? 'max-h-0' : 'max-h-[2000px]'
              }`}
            >
              <div className="p-5">
              {/* 3 Column Grid with Intro Message on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                {/* Widget Color */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">{t('dashboard:settings.widgetColor')}</label>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-2">
                    <input
                      type="color"
                      value={webThemeColor}
                      onChange={(e) => setWebThemeColor(e.target.value)}
                      className="w-7 h-7 border-none rounded cursor-pointer"
                    />
                    <div className="w-px h-5 bg-gray-300"></div>
                    <input
                      type="text"
                      value={webThemeColor}
                      onChange={(e) => setWebThemeColor(e.target.value)}
                      className="flex-1 border-none bg-transparent font-mono text-xs font-medium outline-none"
                      maxLength={7}
                      placeholder="#000000"
                    />
                  </div>
                </div>

                {/* Widget Theme */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">{t('dashboard:settings.widgetTheme')}</label>
                  <select
                    value={webTheme}
                    onChange={(e) => setWebTheme(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                  >
                    <option value="default">Default (Bubble Chat)</option>
                    <option value="layout1">Layout 1 (ChatSheet)</option>
                    <option value="coming-soon" disabled>{t('dashboard:settings.comingSoon')}</option>
                  </select>
                </div>

                {/* Intro Message - Tall on Right */}
                <div className="row-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">{t('dashboard:settings.introMessage')}</label>
                  <textarea
                    value={webIntroMessage}
                    onChange={(e) => setWebIntroMessage(e.target.value)}
                    placeholder="e.g: Hello, How can I help you today? ✨"
                    rows={5}
                    maxLength={200}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical h-full"
                  />
                </div>

                {/* Title Closed */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">{t('dashboard:settings.titleClosed')}</label>
                  <input
                    type="text"
                    value={webTitleClosed}
                    onChange={(e) => setWebTitleClosed(e.target.value)}
                    placeholder="e.g: Support"
                    maxLength={50}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Title Open */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">{t('dashboard:settings.titleOpen')}</label>
                  <input
                    type="text"
                    value={webTitleOpen}
                    onChange={(e) => setWebTitleOpen(e.target.value)}
                    placeholder="e.g: 🤖 Photier AI Bot"
                    maxLength={50}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Toggles - Compact */}
              <div className="space-y-3 pt-3 border-t border-gray-100">
                {/* Working Hours */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{t('dashboard:settings.workingHours')}</p>
                      <p className="text-xs text-gray-500">{t('dashboard:settings.workingHoursDesc')}</p>
                    </div>
                    <ToggleSwitch checked={webWorkingHoursEnabled} onChange={setWebWorkingHoursEnabled} />
                  </div>
                  {webWorkingHoursEnabled && (
                    <div className="flex items-center gap-2 ml-0">
                      <input
                        type="time"
                        value={webWorkingHoursStart}
                        onChange={(e) => setWebWorkingHoursStart(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-400">—</span>
                      <input
                        type="time"
                        value={webWorkingHoursEnd}
                        onChange={(e) => setWebWorkingHoursEnd(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* Service Messages */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{t('dashboard:settings.serviceMessages')}</p>
                    <p className="text-xs text-gray-500">{t('dashboard:settings.serviceMessagesDesc')}</p>
                  </div>
                  <ToggleSwitch checked={webServiceMessages} onChange={setWebServiceMessages} />
                </div>

                {/* Info Note */}
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <strong>{t('dashboard:settings.serviceOn')}:</strong> {t('dashboard:settings.serviceOnDesc')}
                    <strong className="ml-2">{t('dashboard:settings.serviceOff')}:</strong> {t('dashboard:settings.serviceOffDesc')}
                  </p>
                </div>
              </div>
              </div>
            </div>
          </div>

          {/* Premium Chat Settings */}
          <div className="bg-white rounded-xl border border-gray-100" style={{ boxShadow: '0 0 30px rgba(0,0,0,0.08)' }}>
            <button
              onClick={() => setPremiumChatCollapsed(!premiumChatCollapsed)}
              className="w-full p-5 border-b border-gray-100 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Star className="size-5 text-purple-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-base font-bold text-gray-900">⭐ Premium Chat Settings</h3>
                <p className="text-xs text-gray-500">p-chat.simplechat.bot</p>
              </div>
              <ChevronDown
                className={`size-5 text-gray-500 transition-transform duration-300 ${
                  premiumChatCollapsed ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                premiumChatCollapsed ? 'max-h-0' : 'max-h-[2000px]'
              }`}
            >
              <div className="p-5">
              {/* 3 Column Grid with Messages on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                {/* Widget Color */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">{t('dashboard:settings.widgetColor')}</label>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-2">
                    <input
                      type="color"
                      value={premiumThemeColor}
                      onChange={(e) => setPremiumThemeColor(e.target.value)}
                      className="w-7 h-7 border-none rounded cursor-pointer"
                    />
                    <div className="w-px h-5 bg-gray-300"></div>
                    <input
                      type="text"
                      value={premiumThemeColor}
                      onChange={(e) => setPremiumThemeColor(e.target.value)}
                      className="flex-1 border-none bg-transparent font-mono text-xs font-medium outline-none"
                      maxLength={7}
                      placeholder="#000000"
                    />
                  </div>
                </div>

                {/* Widget Theme */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">{t('dashboard:settings.widgetTheme')}</label>
                  <select
                    value={premiumTheme}
                    onChange={(e) => setPremiumTheme(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white cursor-pointer"
                  >
                    <option value="default">Default (Bubble Chat)</option>
                    <option value="layout1">Layout 1 (ChatSheet)</option>
                    <option value="coming-soon" disabled>{t('dashboard:settings.comingSoon')}</option>
                  </select>
                </div>

                {/* Messages - Tall on Right */}
                <div className="row-span-2 space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">{t('dashboard:settings.introMessage')}</label>
                    <textarea
                      value={premiumIntroMessage}
                      onChange={(e) => setPremiumIntroMessage(e.target.value)}
                      placeholder="e.g: Welcome to Premium Support! ✨"
                      rows={2}
                      maxLength={200}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">{t('dashboard:settings.aiIntroMessage')}</label>
                    <textarea
                      value={premiumAiIntroMessage}
                      onChange={(e) => setPremiumAiIntroMessage(e.target.value)}
                      placeholder="e.g: Hi! 👋 I'm Photier AI, your 24/7 assistant."
                      rows={2}
                      maxLength={200}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical"
                    />
                  </div>
                </div>

                {/* Title Closed */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">{t('dashboard:settings.titleClosed')}</label>
                  <input
                    type="text"
                    value={premiumTitleClosed}
                    onChange={(e) => setPremiumTitleClosed(e.target.value)}
                    placeholder="e.g: Premium Support"
                    maxLength={50}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Title Open */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">{t('dashboard:settings.titleOpen')}</label>
                  <input
                    type="text"
                    value={premiumTitleOpen}
                    onChange={(e) => setPremiumTitleOpen(e.target.value)}
                    placeholder="e.g: 👤 Destek Ekibi"
                    maxLength={50}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Toggles - Compact */}
              <div className="space-y-3 pt-3 border-t border-gray-100">
                {/* Working Hours */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{t('dashboard:settings.workingHours')}</p>
                      <p className="text-xs text-gray-500">{t('dashboard:settings.workingHoursDesc')}</p>
                    </div>
                    <ToggleSwitch checked={premiumWorkingHoursEnabled} onChange={setPremiumWorkingHoursEnabled} />
                  </div>
                  {premiumWorkingHoursEnabled && (
                    <div className="flex items-center gap-2 ml-0">
                      <input
                        type="time"
                        value={premiumWorkingHoursStart}
                        onChange={(e) => setPremiumWorkingHoursStart(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-gray-400">—</span>
                      <input
                        type="time"
                        value={premiumWorkingHoursEnd}
                        onChange={(e) => setPremiumWorkingHoursEnd(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}
                </div>

                {/* Service Messages */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{t('dashboard:settings.serviceMessages')}</p>
                    <p className="text-xs text-gray-500">{t('dashboard:settings.serviceMessagesDesc')}</p>
                  </div>
                  <ToggleSwitch checked={premiumServiceMessages} onChange={setPremiumServiceMessages} />
                </div>

                {/* Info Note */}
                <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-xs text-purple-800">
                    <strong>{t('dashboard:settings.serviceOn')}:</strong> {t('dashboard:settings.serviceOnDesc')}
                    <strong className="ml-2">{t('dashboard:settings.serviceOff')}:</strong> {t('dashboard:settings.serviceOffDesc')}
                  </p>
                </div>
              </div>
              </div>
            </div>
          </div>


          {/* Save All Button */}
          <div className="flex justify-end gap-3 pt-2">
            <button className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              {t('dashboard:settings.cancel')}
            </button>
            <button
              onClick={saveAllSettings}
              className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-500/30"
            >
              {t('dashboard:settings.saveAll')}
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
