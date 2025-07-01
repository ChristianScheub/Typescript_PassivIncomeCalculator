import React from 'react';
import { useTranslation } from 'react-i18next';
import GenericPieChart from '@/ui/charts/pieCharts/GenericPieChart';
import type { PieChartData } from '@/types/shared/charts';

interface IncomeDistributionData {
  name: string;
  value: number;
  percentage: number;
}

interface IncomeDistributionViewProps {
  assetTypeIncome: IncomeDistributionData[];
  sectorIncome: IncomeDistributionData[];
  countryIncome: IncomeDistributionData[];
}

const mapToPieChartData = (arr: IncomeDistributionData[]): PieChartData[] =>
  Array.isArray(arr)
    ? arr.map(item => ({ ...item }))
    : [];

const IncomeDistributionView: React.FC<IncomeDistributionViewProps> = ({
  assetTypeIncome,
  sectorIncome,
  countryIncome
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Asset Type Income Distribution */}
      <GenericPieChart
        title={t('analytics.assetTypeIncomeDistribution')}
        data={mapToPieChartData(assetTypeIncome)}
        nameKey="name"
        valueKey="value"
        translationKey="assets.types"
        emptyStateMessage={t('analytics.noIncomeData')}
      />

      {/* Sector Income Distribution */}
      <GenericPieChart
        title={t('analytics.sectorIncomeDistribution')}
        data={mapToPieChartData(sectorIncome)}
        nameKey="name"
        valueKey="value"
        emptyStateMessage={t('analytics.noSectorIncomeData')}
        showDirectLabels={true}
      />

      {/* Country Income Distribution */}
      <GenericPieChart
        title={t('analytics.countryIncomeDistribution')}
        data={mapToPieChartData(countryIncome)}
        nameKey="name"
        valueKey="value"
        emptyStateMessage={t('analytics.noCountryIncomeData')}
        showDirectLabels={true}
      />
    </div>
  );
};

export default IncomeDistributionView;
