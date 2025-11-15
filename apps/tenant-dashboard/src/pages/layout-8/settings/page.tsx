import { Button } from '@/components/ui/button';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/components/layouts/layout-8/components/toolbar';
import { SearchDialog } from '@/components/layouts/layout-1/shared/dialogs/search/search-dialog';
import { ChatSheet } from '@/components/layouts/layout-1/shared/topbar/chat-sheet';
import { MessageCircleMore, Search, Plus, Bot, Settings as SettingsIcon, ChevronRight } from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { PageTransition } from '@/components/PageTransition';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { chatbotService, Chatbot } from '@/services/chatbot.service';

// Bots List Component
function BotsListSection() {
  const [bots, setBots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (bots.length === 0) {
    return (
      <Link to="/bots">
        <div className="group relative overflow-hidden rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 p-8 transition-all duration-300 hover:shadow-xl">
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
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: '0 0 30px rgba(0,0,0,0.08)' }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
          <Bot className="size-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-gray-900">My Bots</h3>
          <p className="text-xs text-gray-500">Manage your chatbot settings</p>
        </div>
        <Link to="/bots">
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="size-4" />
            Add Bot
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {bots.map((bot) => (
          <Link
            key={bot.id}
            to={`/bots/${bot.id}/settings`}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${bot.type === 'PREMIUM' ? 'bg-purple-100' : 'bg-blue-100'} flex items-center justify-center`}>
                <Bot className={`size-5 ${bot.type === 'PREMIUM' ? 'text-purple-600' : 'text-blue-600'}`} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{bot.name}</h4>
                <div className="flex gap-2 text-xs text-gray-500">
                  <span>{bot.type === 'PREMIUM' ? '💎 Premium' : '⚡ Basic'}</span>
                  <span>•</span>
                  <span className="capitalize">{bot.status.toLowerCase()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-400 group-hover:text-blue-500 transition-colors">
              <SettingsIcon className="size-4" />
              <ChevronRight className="size-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
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
