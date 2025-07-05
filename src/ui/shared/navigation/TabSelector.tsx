import React from 'react';
import { cn } from '@/utils/cn';

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
  const selectedIndex = tabs.findIndex(tab => tab.id === selectedTab);
  const tabCount = tabs.length;

  return (
    <div className="w-full border-b border-gray-200 dark:border-gray-700 relative">
      <div className="flex w-full relative">
        {/* Animated indicator */}
        <div
          className="absolute bottom-0 h-0.5 bg-blue-500 dark:bg-blue-400 transition-all duration-300 ease-in-out"
          style={{
            width: `${100 / tabCount}%`,
            transform: `translateX(${selectedIndex * 100}%)`
          }}
        />
        
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={cn(
              'flex-1 px-3 py-2 text-sm font-medium transition-all duration-300 ease-in-out text-center relative',
              'border-b-2 border-transparent -mb-px',
              selectedTab === tab.id
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            )}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabSelector;
