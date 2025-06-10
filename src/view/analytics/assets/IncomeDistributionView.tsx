import React from 'react';
import { useTranslation } from 'react-i18next';
import GenericPieChart from '../../../ui/charts/pieCharts/GenericPieChart';

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
        data={assetTypeIncome}
        nameKey="name"
        valueKey="value"
        translationKey="assets.types"
        emptyStateMessage={t('analytics.noIncomeData')}
      />

      {/* Sector Income Distribution */}
      <GenericPieChart
        title={t('analytics.sectorIncomeDistribution')}
        data={sectorIncome}
        nameKey="name"
        valueKey="value"
        emptyStateMessage={t('analytics.noSectorIncomeData')}
        showDirectLabels={true}
      />

      {/* Country Income Distribution */}
      <GenericPieChart
        title={t('analytics.countryIncomeDistribution')}
        data={countryIncome}
        nameKey="name"
        valueKey="value"
        emptyStateMessage={t('analytics.noCountryIncomeData')}
        showDirectLabels={true}
      />
    </div>
  );
};

export default IncomeDistributionView;
