import { Button } from '@/components/ui/button';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/components/layouts/layout-8/components/toolbar';
import { SearchDialog } from '@/components/layouts/layout-1/shared/dialogs/search/search-dialog';
import { ChatSheet } from '@/components/layouts/layout-1/shared/topbar/chat-sheet';
import { MessageCircleMore, Search, Lock, Globe, Palette, Database, User, LogOut, CreditCard } from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { PageTransition } from '@/components/PageTransition';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';

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
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, setUser } = useAuth();

  // Account Info (from AuthContext)
  const [userName, setUserName] = useState(user?.fullName || '');

  // Security Settings
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Language & Region Settings
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('Europe/Istanbul');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

  // Appearance Settings
  const [sidebarPosition, setSidebarPosition] = useState('left');

  // Data & Privacy Settings
  const [dataRetention, setDataRetention] = useState('30');

  // Sync user name from context
  useEffect(() => {
    if (user?.fullName) {
      setUserName(user.fullName);
    }
  }, [user]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('profileLanguage');
    const savedTimezone = localStorage.getItem('profileTimezone');
    const savedDateFormat = localStorage.getItem('profileDateFormat');
    const savedSidebarPosition = localStorage.getItem('profileSidebarPosition');
    const savedDataRetention = localStorage.getItem('profileDataRetention');

    if (savedLanguage) setLanguage(savedLanguage);
    if (savedTimezone) setTimezone(savedTimezone);
    if (savedDateFormat) setDateFormat(savedDateFormat);
    if (savedSidebarPosition) setSidebarPosition(savedSidebarPosition);
    if (savedDataRetention) setDataRetention(savedDataRetention);
  }, []);


  const handleChangePassword = () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }

    // Check new password match
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    // Check password length
    if (newPassword.length < 3) {
      toast.error('New password must be at least 3 characters');
      return;
    }

    // Save new password to localStorage
    localStorage.setItem('adminPassword', newPassword);
    toast.success('Password changed successfully!');

    // Clear form
    setNewPassword('');
    setConfirmPassword('');
  };

  const saveAllSettings = async () => {
    try {
      // Save name if changed
      if (userName && userName.trim() !== user?.fullName && userName.trim().length >= 2) {
        const updatedUser = await authService.updateProfile(userName.trim());
        setUser(updatedUser);
      }

      // Save all settings to localStorage (theme is managed by next-themes)
      localStorage.setItem('profileLanguage', language);
      localStorage.setItem('profileTimezone', timezone);
      localStorage.setItem('profileDateFormat', dateFormat);
      localStorage.setItem('profileSidebarPosition', sidebarPosition);
      localStorage.setItem('profileDataRetention', dataRetention);

      toast.success('✓ ' + t('common:profile.actions.saveAll') + '!');
    } catch (error: any) {
      console.error('Profile settings save error:', error);
      toast.error(error.response?.data?.message || t('common:common.error'));
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      // authService.logout() handles navigation to /login
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
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
                <h1 className="text-2xl font-bold text-gray-900">{t('common:profile.title')}</h1>
                <p className="text-sm text-gray-500">{t('common:profile.subtitle')}</p>
              </div>
            </div>
          </div>

          {/* Account Settings & Billing - Side by Side at Top */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Account Settings */}
            <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: '0 0 30px rgba(0,0,0,0.08)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <User className="size-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{t('common:profile.accountSettings.title')}</h3>
                  <p className="text-xs text-gray-500">{t('common:profile.accountSettings.subtitle')}</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Name - Editable */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">{t('common:profile.accountSettings.name')}</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder={t('common:profile.accountSettings.namePlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Email - Read Only */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">{t('common:profile.accountSettings.email')}</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">{t('common:profile.accountSettings.emailReadOnly')}</p>
                </div>

                {/* Subdomain - Read Only */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">{t('common:profile.accountSettings.subdomain')}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={user?.subdomain || ''}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <span className="text-sm text-gray-500">.simplechat.bot</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{t('common:profile.accountSettings.subdomainReadOnly')}</p>
                </div>
              </div>
            </div>

            {/* Billing */}
            <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: '0 0 30px rgba(0,0,0,0.08)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <CreditCard className="size-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{t('common:profile.billing.title')}</h3>
                  <p className="text-xs text-gray-500">{t('common:profile.billing.subtitle')}</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong className="text-green-700">{t('common:profile.billing.currentPlan')}:</strong> {t('common:profile.billing.freeTrial')}
                </p>
                <p className="text-xs text-gray-600 mb-3">
                  {t('common:profile.billing.comingSoon')}
                </p>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-md">
                  {t('common:profile.billing.upgradePlan')}
                </button>
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
                  <h3 className="text-base font-bold text-gray-900">{t('common:profile.security.title')}</h3>
                  <p className="text-xs text-gray-500">{t('common:profile.security.subtitle')}</p>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-900 mb-3">{t('common:profile.security.changePassword')}</p>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">{t('common:profile.security.newPassword')}</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t('common:profile.security.newPasswordPlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">{t('common:profile.security.confirmPassword')}</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t('common:profile.security.confirmPasswordPlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Change Password Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleChangePassword}
                      className="w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-md"
                    >
                      {t('common:profile.security.changePassword')}
                    </button>
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
                  <h3 className="text-base font-bold text-gray-900">{t('common:profile.languageRegion.title')}</h3>
                  <p className="text-xs text-gray-500">{t('common:profile.languageRegion.subtitle')}</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* Language */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">{t('common:profile.languageRegion.language')}</label>
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
                  <label className="block text-sm font-semibold text-gray-900 mb-2">{t('common:profile.languageRegion.timezone')}</label>
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
                  <label className="block text-sm font-semibold text-gray-900 mb-2">{t('common:profile.languageRegion.dateFormat')}</label>
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
                  <h3 className="text-base font-bold text-gray-900">{t('common:profile.appearance.title')}</h3>
                  <p className="text-xs text-gray-500">{t('common:profile.appearance.subtitle')}</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* Theme */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">{t('common:profile.appearance.theme')}</label>
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
                      <p className="text-xs font-semibold text-gray-900">{t('common:profile.appearance.light')}</p>
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
                      <p className="text-xs font-semibold text-gray-900">{t('common:profile.appearance.dark')}</p>
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
                      <p className="text-xs font-semibold text-gray-900">{t('common:profile.appearance.auto')}</p>
                    </button>
                  </div>
                </div>

                {/* Sidebar Position */}
                <div className="pt-3 border-t border-gray-100">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">{t('common:profile.appearance.sidebarPosition')}</label>
                  <select
                    value={sidebarPosition}
                    onChange={(e) => setSidebarPosition(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="left">{t('common:profile.appearance.left')}</option>
                    <option value="right">{t('common:profile.appearance.right')}</option>
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
                  <h3 className="text-base font-bold text-gray-900">{t('common:profile.dataPrivacy.title')}</h3>
                  <p className="text-xs text-gray-500">{t('common:profile.dataPrivacy.subtitle')}</p>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {/* Data Retention */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">{t('common:profile.dataPrivacy.dataRetention')}</label>
                    <select
                      value={dataRetention}
                      onChange={(e) => setDataRetention(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="30">30 {t('common:profile.dataPrivacy.days', { defaultValue: 'days' })}</option>
                      <option value="60">60 {t('common:profile.dataPrivacy.days', { defaultValue: 'days' })}</option>
                      <option value="90">90 {t('common:profile.dataPrivacy.days', { defaultValue: 'days' })}</option>
                      <option value="180">180 {t('common:profile.dataPrivacy.days', { defaultValue: 'days' })}</option>
                      <option value="365">1 {t('common:profile.dataPrivacy.year', { defaultValue: 'year' })}</option>
                    </select>
                  </div>

                  {/* Export Data */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">{t('common:profile.dataPrivacy.exportData')}</label>
                    <button className="w-full px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-sm font-semibold transition-colors">
                      {t('common:profile.dataPrivacy.downloadData')}
                    </button>
                  </div>

                  {/* Delete Account */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">{t('common:profile.dataPrivacy.dangerZone')}</label>
                    <button className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-semibold transition-colors">
                      {t('common:profile.dataPrivacy.deleteAccount')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center gap-3 pt-2">
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <LogOut className="size-4" />
              {t('common:profile.actions.logout')}
            </button>
            <div className="flex gap-3">
              <button className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                {t('common:actions.cancel')}
              </button>
              <button
                onClick={saveAllSettings}
                className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-500/30"
              >
                {t('common:profile.actions.saveAll')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
