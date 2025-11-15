import { Fragment, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MENU_SIDEBAR } from '@/config/layout-8.config';
import { MenuItem } from '@/config/types';
import { cn } from '@/lib/utils';
import { useMenu } from '@/hooks/use-menu';

export interface ToolbarHeadingProps {
  title?: string | ReactNode;
}

function Toolbar({ children }: { children?: ReactNode }) {
  return (
    <div className="pb-5">
      <div className="container px-8 lg:px-12 flex items-center justify-between flex-wrap gap-3">
        {children}
      </div>
    </div>
  );
}

function ToolbarActions({ children }: { children?: ReactNode }) {
  return <div className="flex items-center flex-wrap gap-2.5">{children}</div>;
}

function ToolbarBreadcrumbs() {
  // Breadcrumbs disabled - return null to hide
  return null;
}

function ToolbarHeading({ title = '' }: ToolbarHeadingProps) {
  // Toolbar heading disabled - return null to hide
  return null;
}

export { Toolbar, ToolbarActions, ToolbarBreadcrumbs, ToolbarHeading };
