export interface MenuItem {
  title: string;
  path?: string;
  icon?: any;
  badge?: string | number;
  children?: MenuItem[];
}

export type MenuConfig = MenuItem[];

export interface LayoutConfig {
  title: string;
  description?: string;
}
