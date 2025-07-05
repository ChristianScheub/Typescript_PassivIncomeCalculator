import React, { useState } from 'react';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AssetType } from '@/types/shared/base';

interface AssetTypeOption {
  value: AssetType | 'all';
  label: string;
}

interface AssetTypeFilterCardProps {
  /** Currently selected asset type */
  selectedAssetType: AssetType | 'all';
  /** Available asset type options */
  assetTypeOptions: AssetTypeOption[];
  /** Callback when asset type changes */
  onAssetTypeChange: (type: AssetType | 'all') => void;
  /** Number of filtered items (optional) */
  filteredCount?: number;
  /** Total number of items (optional) */
  totalCount?: number;
  /** Whether the filter is initially expanded */
  initiallyExpanded?: boolean;
  /** Optional title override */
  title?: string;
  /** Optional description override */
  description?: string;
  /** Additional CSS classes */
  className?: string;
}

export const AssetTypeFilterCard: React.FC<AssetTypeFilterCardProps> = ({
  selectedAssetType,
  assetTypeOptions,
  onAssetTypeChange,
  filteredCount,
  totalCount,
  initiallyExpanded = false,
  title,
  description,
  className = ''
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between cursor-pointer" onClick={toggleExpanded}>
        <div className="flex items-center space-x-3">
          <Filter className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <h2 className="text-lg font-semibold">
            {title || t('assets.assetFilter')}
          </h2>
        </div>
        <button 
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>
      
      {/* Collapsible Content */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 pt-2 border-t border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {description || t('assets.filterByAssetType')}
          </p>
          
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            {/* Asset Type Select */}
            <select
              value={selectedAssetType}
              onChange={(e) => onAssetTypeChange(e.target.value as AssetType | 'all')}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 w-full sm:w-auto sm:min-w-[200px]"
            >
              {assetTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            {/* Active Filter Info */}
            {selectedAssetType !== 'all' && (
              <div className="text-sm text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800 w-full sm:w-auto text-center sm:text-left">
                <strong>{t('assets.activeFiltering')}:</strong> {t('assets.showingOnly')} {assetTypeOptions.find(opt => opt.value === selectedAssetType)?.label}
                {filteredCount !== undefined && totalCount !== undefined && (
                  <>
                    <br />{filteredCount} {t('common.across', { count: totalCount })}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
