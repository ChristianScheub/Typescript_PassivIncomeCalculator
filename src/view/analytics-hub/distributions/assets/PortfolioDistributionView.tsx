import React from 'react';
import { useTranslation } from 'react-i18next';
import { GenericPieChart } from '@/ui/portfolioHub';

interface PortfolioDistributionViewProps {
  assetAllocation: Array<{ name: string; type: string; value: number; percentage: number }>;
  sectorAllocation: Array<{ name: string; value: number; percentage: number }>;
  countryAllocation: Array<{ name: string; value: number; percentage: number }>;
}

const safeArray = <T,>(arr: T[] | undefined | null): T[] => Array.isArray(arr) ? arr : [];

const PortfolioDistributionView: React.FC<PortfolioDistributionViewProps> = ({
  assetAllocation,
  sectorAllocation,
  countryAllocation
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Asset Type Distribution */}
      <GenericPieChart
        title={t('analytics.assetTypeDistribution')}
        data={safeArray(assetAllocation)}
        nameKey="name"
        valueKey="value"
        translationKey="assets.types"
        emptyStateMessage={t('analytics.noAssetData')}
      />

      {/* Sector Distribution */}
      <GenericPieChart
        title={t('analytics.sectorDistribution')}
        data={safeArray(sectorAllocation)}
        nameKey="name"
        valueKey="value"
        emptyStateMessage={t('analytics.noSectorData')}
        showDirectLabels={true}
      />

      {/* Country Distribution */}
      <GenericPieChart
        title={t('analytics.countryDistribution')}
        data={safeArray(countryAllocation)}
        nameKey="name"
        valueKey="value"
        emptyStateMessage={t('analytics.noCountryData')}
        showDirectLabels={true}
      />
    </div>
  );
};

export default PortfolioDistributionView;
