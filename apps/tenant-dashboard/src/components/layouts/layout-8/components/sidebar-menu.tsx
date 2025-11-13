import {
  LayoutDashboard,
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

  const handleAddBot = () => {
    alert('Bot creation coming soon! This will be the multi-bot feature.');
  };

  const menuConfig: MenuConfig = [
    {
      title: 'Home',
      icon: LayoutDashboard,
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
      {/* Main menu items */}
      <div className="flex flex-col gap-2.5">
        {buildMenu(menuConfig)}

        {/* Add Bot Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleAddBot}
            className={cn(
              'flex flex-col items-center justify-center w-[78px] h-[75px] gap-1.5 p-2.5 rounded-lg',
              'text-sm font-medium text-white bg-gradient-to-br from-blue-500 to-purple-600',
              'hover:from-blue-600 hover:to-purple-700 transition-all duration-200',
              'hover:shadow-lg hover:scale-105'
            )}
          >
            <Plus className="size-7!" strokeWidth={3} />
            Add
          </button>
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
