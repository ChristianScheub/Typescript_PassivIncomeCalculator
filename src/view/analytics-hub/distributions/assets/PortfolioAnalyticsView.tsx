import React from 'react';
import { useTranslation } from 'react-i18next';
import PortfolioDistributionView from './PortfolioDistributionView';
import IncomeDistributionView from './IncomeDistributionView';
import CustomAnalyticsContainer from '@/container/analyticsHub/CustomAnalyticsContainer';
import { TabSelector, ViewHeader, AssetTypeFilterCard } from '@ui/shared';
import { AllocationData } from '@/types/domains/analytics/calculations';
import { PortfolioPosition } from '@/types/domains/portfolio/position';
import { AssetType } from '@/types/shared';
import { getAssetTypeOptions } from '@/constants';

type AnalyticsTab = 'asset_distribution' | 'income_distribution' | 'custom';

interface PortfolioAnalyticsViewProps {
  selectedTab: AnalyticsTab;
  selectedAssetType: AssetType | 'all';
  assetAllocation: Array<{ name: string; type: string; value: number; percentage: number }>;
  sectorAllocation: AllocationData[];
  countryAllocation: AllocationData[];
  assetTypeIncome: AllocationData[];
  sectorIncome: AllocationData[];
  countryIncome: AllocationData[];
  portfolioPositions: PortfolioPosition[];
  onTabChange: (tab: AnalyticsTab) => void;
  onAssetTypeFilterChange: (assetType: AssetType | 'all') => void;
  onBack: () => void;
}

const safeArray = <T,>(arr: T[] | undefined | null): T[] => Array.isArray(arr) ? arr : [];

const PortfolioAnalyticsView: React.FC<PortfolioAnalyticsViewProps> = ({
  selectedTab,
  selectedAssetType,
  assetAllocation,
  sectorAllocation,
  countryAllocation,
  assetTypeIncome,
  sectorIncome,
  countryIncome,
  portfolioPositions,
  onTabChange,
  onAssetTypeFilterChange,
  onBack
}) => {
  const { t } = useTranslation();
  
  const tabs = [
    { id: 'asset_distribution', label: t('analytics.assetDistribution') },
    { id: 'income_distribution', label: t('analytics.incomeDistribution') },
    { id: 'custom', label: t('analytics.custom') }
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case 'asset_distribution':
        return (
          <PortfolioDistributionView
            assetAllocation={safeArray(assetAllocation)}
            sectorAllocation={safeArray(sectorAllocation)}
            countryAllocation={safeArray(countryAllocation)}
          />
        );
      case 'income_distribution':
        return (
          <IncomeDistributionView
            assetTypeIncome={safeArray(assetTypeIncome)}
            sectorIncome={safeArray(sectorIncome)}
            countryIncome={safeArray(countryIncome)}
          />
        );
      case 'custom':
        return <CustomAnalyticsContainer filteredPositions={safeArray(portfolioPositions)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <ViewHeader
          title={t('analytics.portfolioAnalytics')}
          onBack={onBack}
        />

        {/* Asset Type Filter */}
        <AssetTypeFilterCard
          selectedAssetType={selectedAssetType}
          assetTypeOptions={[
            { value: 'all', label: t('assets.types.all') },
            ...getAssetTypeOptions(t)
          ]}
          onAssetTypeChange={onAssetTypeFilterChange}
          className="mb-6"
        />

        {/* Tab Navigation */}
        <div className="mb-8">
          <TabSelector
            tabs={tabs}
            selectedTab={selectedTab}
            onTabChange={(id) => onTabChange(id as AnalyticsTab)}
          />
        </div>

        {/* Content */}
        <div className="space-y-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default PortfolioAnalyticsView;
