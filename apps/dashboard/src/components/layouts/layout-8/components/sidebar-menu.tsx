import {
  LayoutDashboard,
  Users,
  Star,
  Settings,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { MenuConfig } from '@/config/types';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function SidebarMenu() {
  const { pathname } = useLocation();
  const { t } = useTranslation('common');

  // Exact match for active state
  const isActiveExact = (path: string) => {
    return pathname === path;
  };

  const menuConfig: MenuConfig = [
    {
      title: 'Home',
      icon: LayoutDashboard,
      path: '/',
    },
    {
      title: 'Web',
      icon: Users,
      path: '/web',
    },
    {
      title: 'Premium',
      icon: Star,
      path: '/premium',
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
      {/* Main menu items */}
      <div className="flex flex-col gap-2.5">
        {buildMenu(menuConfig)}
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
