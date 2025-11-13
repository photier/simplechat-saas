import { LayoutConfig, MenuConfig } from './types';
import { LayoutDashboard, Users, Star, Settings } from 'lucide-react';

export const layout8Config: LayoutConfig = {
  title: 'Dashboard',
  description: 'SimpleChat Analytics Dashboard',
};

export const MENU_SIDEBAR: MenuConfig = [
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
  {
    title: 'Settings',
    icon: Settings,
    path: '/settings',
  },
];
