import React from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AssetSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
}

export const AssetSearchBar: React.FC<AssetSearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  placeholder,
}) => {
  const { t } = useTranslation();

  return (
    <div className="relative mb-2">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <input
        type="text"
        placeholder={placeholder || t('assets.searchAssets')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />
    </div>
  );
};
