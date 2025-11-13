import {
  Home,
  Plus,
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

  // Handle Add Bot button click
  const handleAddBotClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // TODO: Open bot creation modal (Phase 2)
    alert('Bot creation coming soon!');
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
    return items.map((item: any, index: number) => (
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
      {/* Dashboard */}
      <div className="flex flex-col gap-2.5">
        {buildMenu(menuConfig)}
      </div>

      {/* Add Bot Button - Prominent */}
      <div className="flex flex-col items-center my-2">
        <Link
          to="#"
          onClick={handleAddBotClick}
          className={cn(
            'flex flex-col items-center justify-center w-[78px] h-[75px] gap-1.5 p-2.5 rounded-lg',
            'text-sm font-semibold text-white shadow-lg',
            'bg-gradient-to-r from-blue-500 to-purple-600',
            'hover:from-blue-600 hover:to-purple-700',
            'transition-all duration-200',
            'transform hover:scale-105',
          )}
        >
          <Plus className="size-8!" />
          Add
        </Link>
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
