import { Button } from '@/components/ui/button';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/components/layouts/layout-8/components/toolbar';
import { SearchDialog } from '@/components/layouts/layout-1/shared/dialogs/search/search-dialog';
import { ChatSheet } from '@/components/layouts/layout-1/shared/topbar/chat-sheet';
import { MessageCircleMore, Search, Lock, Globe, Palette, Database, User } from 'lucide-react';
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

export function Layout8ProfilePage() {
  const { t } = useTranslation(['common', 'dashboard']);

  // Security Settings
  const [twoFactor, setTwoFactor] = useState(false);

  // Language & Region Settings
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('Europe/Istanbul');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

  // Appearance Settings
  const [theme, setTheme] = useState('light');
  const [sidebarPosition, setSidebarPosition] = useState('left');

  // Data & Privacy Settings
  const [dataRetention, setDataRetention] = useState('30');

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedTwoFactor = localStorage.getItem('profileTwoFactor');
    const savedLanguage = localStorage.getItem('profileLanguage');
    const savedTimezone = localStorage.getItem('profileTimezone');
    const savedDateFormat = localStorage.getItem('profileDateFormat');
    const savedTheme = localStorage.getItem('profileTheme');
    const savedSidebarPosition = localStorage.getItem('profileSidebarPosition');
    const savedDataRetention = localStorage.getItem('profileDataRetention');

    if (savedTwoFactor) setTwoFactor(savedTwoFactor === 'true');
    if (savedLanguage) setLanguage(savedLanguage);
    if (savedTimezone) setTimezone(savedTimezone);
    if (savedDateFormat) setDateFormat(savedDateFormat);
    if (savedTheme) setTheme(savedTheme);
    if (savedSidebarPosition) setSidebarPosition(savedSidebarPosition);
    if (savedDataRetention) setDataRetention(savedDataRetention);
  }, []);

  const saveAllSettings = () => {
    try {
      // Save all settings to localStorage
      localStorage.setItem('profileTwoFactor', String(twoFactor));
      localStorage.setItem('profileLanguage', language);
      localStorage.setItem('profileTimezone', timezone);
      localStorage.setItem('profileDateFormat', dateFormat);
      localStorage.setItem('profileTheme', theme);
      localStorage.setItem('profileSidebarPosition', sidebarPosition);
      localStorage.setItem('profileDataRetention', dataRetention);

      toast.success('✓ All profile settings saved successfully!');
    } catch (error) {
      console.error('Profile settings save error:', error);
      toast.error('Failed to save profile settings');
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

      <div className="container px-8 lg:px-12 pb-12">
        <div className="grid gap-5 lg:gap-7.5">
          {/* Profile Header */}
          <div className="bg-white rounded-xl p-6 border border-gray-100" style={{ boxShadow: '0 0 30px rgba(0,0,0,0.08)' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <User className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                <p className="text-sm text-gray-500">Manage your personal settings and preferences</p>
              </div>
            </div>
          </div>

          {/* Settings Grid - 2 columns */}
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
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="en">English</option>
                    <option value="tr">Türkçe</option>
                  </select>
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
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
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
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
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-3 border-2 rounded-lg transition-colors ${
                        theme === 'light'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="w-full h-12 bg-white rounded mb-2"></div>
                      <p className="text-xs font-semibold text-gray-900">Light</p>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-3 border-2 rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="w-full h-12 bg-gray-900 rounded mb-2"></div>
                      <p className="text-xs font-semibold text-gray-900">Dark</p>
                    </button>
                    <button
                      onClick={() => setTheme('auto')}
                      className={`p-3 border-2 rounded-lg transition-colors ${
                        theme === 'auto'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="w-full h-12 bg-gradient-to-r from-white to-gray-900 rounded mb-2"></div>
                      <p className="text-xs font-semibold text-gray-900">Auto</p>
                    </button>
                  </div>
                </div>

                {/* Sidebar Position */}
                <div className="pt-3 border-t border-gray-100">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Sidebar Position</label>
                  <select
                    value={sidebarPosition}
                    onChange={(e) => setSidebarPosition(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="left">Left</option>
                    <option value="right">Right</option>
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
