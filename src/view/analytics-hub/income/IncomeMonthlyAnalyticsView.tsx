import React from 'react';
import { useTranslation } from 'react-i18next';
import GenericPieChart from '@/ui/charts/pieCharts/GenericPieChart';

interface IncomeMonthlyAnalyticsViewProps {
  categoryBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  individualIncomes: Array<{ name: string; amount: number; category: string; percentage: number }>;
}

const IncomeMonthlyAnalyticsView: React.FC<IncomeMonthlyAnalyticsViewProps> = ({
  categoryBreakdown,
  individualIncomes
}) => {
  const { t } = useTranslation();

  // Transform category breakdown data for GenericPieChart
  const categoryChartData = categoryBreakdown.map(item => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage
  }));

  // Transform individual incomes data for GenericPieChart
  const individualChartData = individualIncomes.map(item => ({
    name: item.name,
    value: item.amount,
    percentage: item.percentage
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Income by Categories */}
      <GenericPieChart
        title={t('analytics.income.monthlyByCategories')}
        data={categoryChartData}
        nameKey="name"
        valueKey="value"
        translationKey="income.types"
        emptyStateMessage={t('analytics.income.noCategoryData')}
        showDirectLabels={false}
      />

      {/* Monthly Individual Incomes */}
      <GenericPieChart
        title={t('analytics.income.monthlyIndividual')}
        data={individualChartData}
        nameKey="name"
        valueKey="value"
        emptyStateMessage={t('analytics.income.noIndividualData')}
        showDirectLabels={true}
      />
    </div>
  );
};

export default IncomeMonthlyAnalyticsView;
