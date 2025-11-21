import {
  LayoutGrid,
  Plus,
  Settings,
  Bot,
  MessageSquare,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { MenuConfig } from '@/config/types';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { chatbotService, Chatbot } from '@/services/chatbot.service';
import { CreateBotModal } from '@/pages/layout-8/bots/CreateBotModal';

export function SidebarMenu() {
  const { pathname } = useLocation();
  const { t } = useTranslation('common');
  const [bots, setBots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    loadBots();
  }, []);

  const loadBots = async () => {
    try {
      const data = await chatbotService.getAll();
      // Only show fully active bots (paid or free trial)
      // Hide: pending, processing, failed, canceled
      setBots(data.filter(bot =>
        bot.status === 'ACTIVE' &&
        (bot.subscriptionStatus === 'active' || bot.subscriptionStatus === 'trialing')
      ));
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

  // Exact match for active state
  const isActiveExact = (path: string) => {
    return pathname === path;
  };

  // Check if path starts with pattern (for bot routes)
  const isActiveStartsWith = (path: string) => {
    return pathname.startsWith(path);
  };

  const menuConfig: MenuConfig = [
    {
      title: 'Home',
      icon: LayoutGrid,
      path: '/',
    },
  ];

  const settingsConfig: MenuConfig = [
    {
      title: 'Settings',
      icon: Settings,
      path: '/settings',
    },
  ];

  const buildMenu = (items: MenuConfig) => {
    return items.map((item, index) => (
      <div key={index} className="flex flex-col items-center">
        <Link
          data-active={isActiveExact(item.path) || undefined}
          to={item.path || '#'}
          className={cn(
            'flex flex-col items-center justify-center w-[78px] h-[85px] gap-2.5 p-2.5 rounded-lg',
            'text-[17px] font-medium text-muted-foreground bg-transparent',
            'hover:text-primary hover:bg-background hover:border-border',
            'data-[active=true]:text-primary data-[active=true]:bg-background data-[active=true]:border-border',
          )}
        >
          {item.icon && <item.icon className="size-9!" />}
          {t(`menu.${item.title.toLowerCase()}`)}
        </Link>
      </div>
    ));
  };

  return (
    <div className="flex flex-col gap-2.5 grow kt-scrollable-y-auto max-h-[calc(100vh-5rem)] lg:max-h-[calc(100vh-6rem)] pt-3">
      {/* Main Menu */}
      <div className="flex flex-col gap-2.5">
        {buildMenu(menuConfig)}
      </div>

      {/* Bots List */}
      {!loading && bots.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {bots.map((bot) => (
            <div key={bot.id} className="flex flex-col items-center relative">
              <Link
                data-active={isActiveStartsWith(`/bots/${bot.id}`) || undefined}
                to={`/bots/${bot.id}/conversations`}
                className={cn(
                  'flex flex-col items-center justify-center w-[78px] h-[85px] gap-2.5 p-2.5 rounded-lg',
                  'text-[17px] font-medium text-muted-foreground bg-transparent',
                  'hover:text-primary hover:bg-background hover:border-border',
                  'data-[active=true]:text-primary data-[active=true]:bg-background data-[active=true]:border-border',
                )}
                title={bot.name}
              >
                <MessageSquare className="size-9!" />
                <span className="text-[17px] truncate w-full text-center">{bot.name}</span>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Add Bot Button */}
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-col items-center">
          <button
            onClick={() => setCreateModalOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center w-[78px] h-[85px] gap-2.5 p-2.5 rounded-lg',
              'text-[17px] font-medium text-muted-foreground bg-transparent',
              'hover:text-primary hover:bg-background hover:border-border cursor-pointer',
            )}
          >
            <Plus className="size-10!" />
            {t('menu.add')}
          </button>
        </div>
      </div>

      {/* Spacer to push settings to bottom */}
      <div className="flex-grow"></div>

      {/* Settings at bottom */}
      <div className="flex flex-col gap-2.5 mt-auto">
        {buildMenu(settingsConfig)}
      </div>

      {/* Create Bot Modal */}
      <CreateBotModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={handleBotCreated}
      />
    </div>
  );
}
