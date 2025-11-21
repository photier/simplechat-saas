import { ReactNode, useState } from 'react';
import { Palette, MessageSquare, Settings } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: ReactNode;
  content: ReactNode;
}

interface SettingsTabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export function SettingsTabs({ tabs, defaultTab }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTabContent}
      </div>
    </div>
  );
}

export { Palette, MessageSquare, Settings };
