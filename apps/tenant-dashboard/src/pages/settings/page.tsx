import { Button } from '@/components/ui/button';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/components/layouts/layout-8/components/toolbar';
import { SearchDialog } from '@/components/layouts/layout-1/shared/dialogs/search/search-dialog';
import { ChatSheet } from '@/components/layouts/layout-1/shared/topbar/chat-sheet';
import { MessageCircleMore, Search, Shield, Plus } from 'lucide-react';
import { LanguageSwitcher } from '../layout-8/components/LanguageSwitcher';
import { PageTransition } from '@/components/PageTransition';
import { useTranslation } from 'react-i18next';

export function Layout8SettingsPage() {
  const { t } = useTranslation(['common', 'dashboard']);

  const handleAddBot = () => {
    alert('Bot creation coming soon! This will be the multi-bot feature.');
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
                <p className="text-sm text-gray-500">Configure your chat widgets</p>
              </div>
            </div>
          </div>

          {/* Add Bot Bar */}
          <button
            onClick={handleAddBot}
            className="w-full group bg-white hover:bg-gradient-to-br hover:from-blue-50/80 hover:to-purple-50/80 rounded-2xl p-8 border-2 border-dashed border-gray-300 hover:border-blue-500 transition-all duration-300 hover:shadow-2xl"
            style={{ boxShadow: '0 0 30px rgba(0,0,0,0.08)' }}
          >
            <div className="flex items-center gap-6">
              {/* Icon */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Plus className="size-10 text-white" strokeWidth={3} />
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1 text-left">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                  Create Your First Bot
                </h3>
                <p className="text-gray-600 text-sm">
                  Start by adding a chatbot to serve your customers. You can create multiple bots with different configurations.
                </p>
              </div>

              {/* Badges */}
              <div className="flex gap-3 flex-shrink-0">
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold whitespace-nowrap">
                  ✨ Basic Plan
                </span>
                <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold whitespace-nowrap">
                  🚀 Premium Plan
                </span>
              </div>
            </div>
          </button>

          {/* Coming Soon Placeholder */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-12 border border-gray-200 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Bot Settings Coming Soon
              </h3>
              <p className="text-sm text-gray-600">
                Once you create your first bot, you'll be able to customize its appearance, behavior, and integrations here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
