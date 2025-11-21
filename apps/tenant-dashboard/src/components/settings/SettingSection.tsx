import { ReactNode } from 'react';

interface SettingSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  badge?: string;
  children: ReactNode;
}

export function SettingSection({ title, description, icon, badge, children }: SettingSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            {badge && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
