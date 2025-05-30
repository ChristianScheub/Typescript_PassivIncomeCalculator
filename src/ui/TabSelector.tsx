import React from 'react';
import { cn } from '../utils/cn';

interface Tab {
  id: string;
  label: string;
}

interface TabSelectorProps {
  tabs: Tab[];
  selectedTab: string;
  onTabChange: (id: string) => void;
}

const TabSelector: React.FC<TabSelectorProps> = ({
  tabs,
  selectedTab,
  onTabChange
}) => {
  return (
    <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={cn(
            'px-3 py-2 text-sm font-medium transition-colors duration-150',
            'border-b-2 -mb-px',
            selectedTab === tab.id
              ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          )}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabSelector;
