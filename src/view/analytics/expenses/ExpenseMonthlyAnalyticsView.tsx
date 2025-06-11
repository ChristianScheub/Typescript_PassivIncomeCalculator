import React from 'react';
import { useTranslation } from 'react-i18next';
import GenericPieChart from '../../../ui/charts/pieCharts/GenericPieChart';

interface ExpenseMonthlyAnalyticsViewProps {
  categoryBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  individualExpenses: Array<{ name: string; amount: number; category: string; percentage: number }>;
}

const ExpenseMonthlyAnalyticsView: React.FC<ExpenseMonthlyAnalyticsViewProps> = ({
  categoryBreakdown,
  individualExpenses
}) => {
  const { t } = useTranslation();

  // Transform category breakdown data for GenericPieChart
  const categoryChartData = categoryBreakdown.map(item => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage
  }));

  // Transform individual expenses data for GenericPieChart
  const individualChartData = individualExpenses.map(item => ({
    name: item.name,
    value: item.amount,
    percentage: item.percentage
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Expenses by Categories */}
      <GenericPieChart
        title={t('analytics.expenses.monthlyByCategories')}
        data={categoryChartData}
        nameKey="name"
        valueKey="value"
        translationKey="expenses.categories"
        emptyStateMessage={t('analytics.expenses.noCategoryData')}
        showDirectLabels={false}
      />

      {/* Monthly Individual Expenses */}
      <GenericPieChart
        title={t('analytics.expenses.monthlyIndividual')}
        data={individualChartData}
        nameKey="name"
        valueKey="value"
        emptyStateMessage={t('analytics.expenses.noIndividualData')}
        showDirectLabels={true}
      />
    </div>
  );
};

export default ExpenseMonthlyAnalyticsView;
