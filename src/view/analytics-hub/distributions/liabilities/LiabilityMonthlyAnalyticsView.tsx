import React from 'react';
import { useTranslation } from 'react-i18next';
import { GenericPieChart } from '@/ui/portfolioHub';

interface LiabilityMonthlyAnalyticsViewProps {
  categoryBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  individualLiabilities: Array<{ name: string; amount: number; category: string; percentage: number }>;
}

const LiabilityMonthlyAnalyticsView: React.FC<LiabilityMonthlyAnalyticsViewProps> = ({
  categoryBreakdown,
  individualLiabilities
}) => {
  const { t } = useTranslation();

  // Transform category breakdown data for GenericPieChart
  const categoryChartData = categoryBreakdown.map(item => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage
  }));

  // Transform individual liabilities data for GenericPieChart
  const individualChartData = individualLiabilities.map(item => ({
    name: item.name,
    value: item.amount,
    percentage: item.percentage
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Payments by Liability Types */}
      <GenericPieChart
        title={t('analytics.liabilities.monthlyByCategories')}
        data={categoryChartData}
        nameKey="name"
        valueKey="value"
        translationKey="liabilities.types"
        emptyStateMessage={t('analytics.liabilities.noCategoryData')}
        showDirectLabels={false}
      />

      {/* Monthly Individual Liability Payments */}
      <GenericPieChart
        title={t('analytics.liabilities.monthlyIndividual')}
        data={individualChartData}
        nameKey="name"
        valueKey="value"
        emptyStateMessage={t('analytics.liabilities.noIndividualData')}
        showDirectLabels={true}
      />
    </div>
  );
};

export default LiabilityMonthlyAnalyticsView;
