import { Button } from '@/components/ui/button';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/components/layouts/layout-8/components/toolbar';
import { SearchDialog } from '@/components/layouts/layout-1/shared/dialogs/search/search-dialog';
import { ChatSheet } from '@/components/layouts/layout-1/shared/topbar/chat-sheet';
import { MessageCircleMore, Search, Shield, Plus, User, CreditCard, LogOut, Code2, Sparkles, Users } from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { PageTransition } from '@/components/PageTransition';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { toast } from 'sonner';
import { PhotonEmbedCodeModal } from '@/components/modals/PhotonEmbedCodeModal';

export function Layout8SettingsPage() {
  const { t } = useTranslation(['common', 'dashboard']);

  // Mock user data - will be replaced with real data later
  const [userEmail] = useState('user@example.com');
  const [userName] = useState('John Doe');
  const [userSubdomain] = useState('mycompany');

  // Embed code modals
  const [normalWidgetModalOpen, setNormalWidgetModalOpen] = useState(false);
  const [premiumWidgetModalOpen, setPremiumWidgetModalOpen] = useState(false);

  const handleLogout = () => {
    toast.success('Logged out successfully');
    // Add logout logic here
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
          {/* Settings Header */}
          <div className="bg-white rounded-xl p-6 border border-gray-100" style={{ boxShadow: '0 0 30px rgba(0,0,0,0.08)' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Shield className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('common:menu.settings')}</h1>
                <p className="text-sm text-gray-500">Manage your account and chatbots</p>
              </div>
            </div>
          </div>

          {/* Widget Embed Codes */}
          <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: '0 0 30px rgba(0,0,0,0.08)' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Code2 className="size-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Widget Embed Codes</h3>
                <p className="text-xs text-gray-500">Get embed codes for your Photier widgets</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Normal Widget Card */}
              <div className="group relative overflow-hidden rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:border-blue-400 transition-all hover:shadow-lg p-5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/30 rounded-full -mr-12 -mt-12"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <Sparkles className="size-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Normal Widget</h4>
                      <p className="text-xs text-gray-600">AI-powered chat</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Single chat interface with AI assistant for customer support.
                  </p>
                  <button
                    onClick={() => setNormalWidgetModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    <Code2 className="size-4" />
                    Get Embed Code
                  </button>
                </div>
              </div>

              {/* Premium Widget Card */}
              <div className="group relative overflow-hidden rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white hover:border-purple-400 transition-all hover:shadow-lg p-5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-200/30 rounded-full -mr-12 -mt-12"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <Users className="size-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Premium Widget</h4>
                      <p className="text-xs text-gray-600">AI + Live Support</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Dual-tab system: AI Bot + Live Support with Telegram integration.
                  </p>
                  <button
                    onClick={() => setPremiumWidgetModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    <Code2 className="size-4" />
                    Get Embed Code
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: '0 0 30px rgba(0,0,0,0.08)' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <User className="size-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Account Settings</h3>
                <p className="text-xs text-gray-500">Your account information</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                <input
                  type="email"
                  value={userEmail}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Name</label>
                <input
                  type="text"
                  value={userName}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Name editing coming soon</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Subdomain</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={userSubdomain}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <span className="text-sm text-gray-500">.simplechat.bot</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Subdomain customization coming soon</p>
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
                <h3 className="text-base font-bold text-gray-900">Billing</h3>
                <p className="text-xs text-gray-500">Manage your subscription</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-2">
                <strong className="text-green-700">Current Plan:</strong> Free Trial
              </p>
              <p className="text-xs text-gray-600">
                Billing and subscription management will be available soon.
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-2.5 border border-red-300 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="size-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Embed Code Modals */}
      <PhotonEmbedCodeModal
        isOpen={normalWidgetModalOpen}
        onClose={() => setNormalWidgetModalOpen(false)}
        widgetType="normal"
      />
      <PhotonEmbedCodeModal
        isOpen={premiumWidgetModalOpen}
        onClose={() => setPremiumWidgetModalOpen(false)}
        widgetType="premium"
      />
    </PageTransition>
  );
}
