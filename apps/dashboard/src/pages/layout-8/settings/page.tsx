import { Button } from '@/components/ui/button';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/components/layouts/layout-8/components/toolbar';
import { SearchDialog } from '@/components/layouts/layout-1/shared/dialogs/search/search-dialog';
import { ChatSheet } from '@/components/layouts/layout-1/shared/topbar/chat-sheet';
import { MessageCircleMore, Search, Lock, Globe, Palette, Database, Shield, Star, ChevronDown } from 'lucide-react';
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
  const [webTheme, setWebTheme] = useState('bubble-chat');

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
  const [premiumTheme, setPremiumTheme] = useState('bubble-chat');

  // General Settings
  const [twoFactor, setTwoFactor] = useState(false);
  const [dataRetention, setDataRetention] = useState('30');
  const [timezone, setTimezone] = useState('Europe/Istanbul');

  // Load settings from server on mount
  useEffect(() => {
    loadSettings();
    // Load timezone from localStorage
    const savedTimezone = localStorage.getItem('preferredTimezone');
    if (savedTimezone) {
      setTimezone(savedTimezone);
    }
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

  const handleTimezoneChange = (newTimezone: string) => {
    setTimezone(newTimezone);
    localStorage.setItem('preferredTimezone', newTimezone);
    toast.success(`Timezone updated to ${newTimezone}`);
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
                <p className="text-sm text-gray-500">Manage your chat widgets and preferences</p>
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
              {/* 2 Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
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
                    <option value="bubble-chat">Bubble Chat</option>
                    <option value="coming-soon" disabled>{t('dashboard:settings.comingSoon')}</option>
                  </select>
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

              {/* Intro Message - Full Width */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">{t('dashboard:settings.introMessage')}</label>
                <textarea
                  value={webIntroMessage}
                  onChange={(e) => setWebIntroMessage(e.target.value)}
                  placeholder="e.g: Hello, How can I help you today? ✨"
                  rows={2}
                  maxLength={200}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                />
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
              {/* 2 Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
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
                    <option value="bubble-chat">Bubble Chat</option>
                    <option value="coming-soon" disabled>{t('dashboard:settings.comingSoon')}</option>
                  </select>
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

              {/* Messages - Full Width */}
              <div className="space-y-3 mb-4">
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

          {/* Other Settings Grid - 2 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Security Settings */}
            <div className="bg-white rounded-xl border border-gray-100" style={{ boxShadow: '0 0 30px rgba(0,0,0,0.08)' }}>
              <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Lock className="size-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Security</h3>
                  <p className="text-xs text-gray-500">Manage your security settings</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* Two-Factor Authentication */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500">Add an extra layer of security</p>
                  </div>
                  <ToggleSwitch checked={twoFactor} onChange={setTwoFactor} />
                </div>

                {/* Change Password */}
                <div className="pt-3 border-t border-gray-100">
                  <button className="w-full px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold transition-colors">
                    Change Password
                  </button>
                </div>

                {/* Sessions */}
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Active Sessions</p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-900">Current Device</p>
                        <p className="text-xs text-gray-500">Last active: Now</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Language & Region */}
            <div className="bg-white rounded-xl border border-gray-100" style={{ boxShadow: '0 0 30px rgba(0,0,0,0.08)' }}>
              <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <Globe className="size-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Language & Region</h3>
                  <p className="text-xs text-gray-500">Customize your language preferences</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* Language */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Language</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option>English</option>
                    <option>Türkçe</option>
                  </select>
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => handleTimezoneChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Europe/Istanbul">UTC +3 (Istanbul)</option>
                    <option value="UTC">UTC +0 (London)</option>
                    <option value="America/New_York">UTC -5 (New York)</option>
                    <option value="America/Los_Angeles">UTC -8 (Los Angeles)</option>
                    <option value="Europe/Paris">UTC +1 (Paris)</option>
                    <option value="Europe/Berlin">UTC +1 (Berlin)</option>
                    <option value="Asia/Dubai">UTC +4 (Dubai)</option>
                    <option value="Asia/Shanghai">UTC +8 (Shanghai)</option>
                    <option value="Asia/Tokyo">UTC +9 (Tokyo)</option>
                    <option value="Australia/Sydney">UTC +10 (Sydney)</option>
                  </select>
                </div>

                {/* Date Format */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Date Format</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="bg-white rounded-xl border border-gray-100" style={{ boxShadow: '0 0 30px rgba(0,0,0,0.08)' }}>
              <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center">
                  <Palette className="size-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Appearance</h3>
                  <p className="text-xs text-gray-500">Customize the look and feel</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* Theme */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button className="p-3 border-2 border-blue-500 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                      <div className="w-full h-12 bg-white rounded mb-2"></div>
                      <p className="text-xs font-semibold text-gray-900">Light</p>
                    </button>
                    <button className="p-3 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                      <div className="w-full h-12 bg-gray-900 rounded mb-2"></div>
                      <p className="text-xs font-semibold text-gray-900">Dark</p>
                    </button>
                    <button className="p-3 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                      <div className="w-full h-12 bg-gradient-to-r from-white to-gray-900 rounded mb-2"></div>
                      <p className="text-xs font-semibold text-gray-900">Auto</p>
                    </button>
                  </div>
                </div>

                {/* Sidebar Position */}
                <div className="pt-3 border-t border-gray-100">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Sidebar Position</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
                    <option>Left</option>
                    <option>Right</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Data & Privacy */}
            <div className="bg-white rounded-xl border border-gray-100" style={{ boxShadow: '0 0 30px rgba(0,0,0,0.08)' }}>
              <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Database className="size-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Data & Privacy</h3>
                  <p className="text-xs text-gray-500">Manage your data and privacy settings</p>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {/* Data Retention */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Data Retention</label>
                    <select
                      value={dataRetention}
                      onChange={(e) => setDataRetention(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="30">30 days</option>
                      <option value="60">60 days</option>
                      <option value="90">90 days</option>
                      <option value="180">180 days</option>
                      <option value="365">1 year</option>
                    </select>
                  </div>

                  {/* Export Data */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Export Data</label>
                    <button className="w-full px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-sm font-semibold transition-colors">
                      Download Your Data
                    </button>
                  </div>

                  {/* Delete Account */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Danger Zone</label>
                    <button className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-semibold transition-colors">
                      Delete Account
                    </button>
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
