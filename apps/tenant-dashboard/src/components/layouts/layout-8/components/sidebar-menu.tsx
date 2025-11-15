import {
  Home,
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

export function SidebarMenu() {
  const { pathname } = useLocation();
  const { t } = useTranslation('common');
  const [bots, setBots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBots();
  }, []);

  const loadBots = async () => {
    try {
      const data = await chatbotService.getAll();
      // Only show active bots in sidebar
      setBots(data.filter(bot => bot.status === 'ACTIVE'));
    } catch (error) {
      console.error('Failed to load bots:', error);
    } finally {
      setLoading(false);
    }
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
      title: 'Dashboard',
      icon: Home,
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
            'flex flex-col items-center justify-center w-[78px] h-[75px] gap-1.5 p-2.5 rounded-lg',
            'text-sm font-medium text-muted-foreground bg-transparent',
            'hover:text-primary hover:bg-background hover:border-border',
            'data-[active=true]:text-primary data-[active=true]:bg-background data-[active=true]:border-border',
          )}
        >
          {item.icon && <item.icon className="size-7!" />}
          {t(`menu.${item.title.toLowerCase()}`)}
        </Link>
      </div>
    ));
  };

  return (
    <div className="flex flex-col gap-2.5 grow kt-scrollable-y-auto max-h-[calc(100vh-5rem)] lg:max-h-[calc(100vh-6rem)]">
      {/* Main Menu */}
      <div className="flex flex-col gap-2.5">
        {buildMenu(menuConfig)}
      </div>

      {/* Bots List */}
      {!loading && bots.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {bots.map((bot) => (
            <div key={bot.id} className="flex flex-col items-center">
              <Link
                data-active={isActiveStartsWith(`/bots/${bot.id}`) || undefined}
                to={`/bots/${bot.id}/conversations`}
                className={cn(
                  'flex flex-col items-center justify-center w-[78px] h-[75px] gap-1.5 p-2.5 rounded-lg',
                  'text-sm font-medium text-muted-foreground bg-transparent',
                  'hover:text-primary hover:bg-background hover:border-border',
                  'data-[active=true]:text-primary data-[active=true]:bg-background data-[active=true]:border-border',
                )}
                title={bot.name}
              >
                <MessageSquare className="size-7!" />
                <span className="text-xs truncate w-full text-center">{bot.name}</span>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Add Bot Button */}
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-col items-center">
          <Link
            data-active={pathname === '/bots' || undefined}
            to="/bots"
            className={cn(
              'flex flex-col items-center justify-center w-[78px] h-[75px] gap-1.5 p-2.5 rounded-lg',
              'text-sm font-medium text-muted-foreground bg-transparent',
              'hover:text-primary hover:bg-background hover:border-border',
              'data-[active=true]:text-primary data-[active=true]:bg-background data-[active=true]:border-border',
            )}
          >
            <Plus className="size-7!" />
            {t('menu.add')}
          </Link>
        </div>
      </div>

      {/* Spacer to push settings to bottom */}
      <div className="flex-grow"></div>

      {/* Settings at bottom */}
      <div className="flex flex-col gap-2.5 mt-auto">
        {buildMenu(settingsConfig)}
      </div>
    </div>
  );
}
