import { GenericPieChart } from '@/ui/portfolioHub';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ExpenseAnnualAnalyticsViewProps {
  categoryBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  individualExpenses: Array<{ name: string; amount: number; category: string; percentage: number }>;
}

const ExpenseAnnualAnalyticsView: React.FC<ExpenseAnnualAnalyticsViewProps> = ({
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
      {/* Annual Expenses by Categories */}
      <GenericPieChart
        title={t('analytics.expenses.annualByCategories')}
        data={categoryChartData}
        nameKey="name"
        valueKey="value"
        translationKey="expenses.categories"
        emptyStateMessage={t('analytics.expenses.noCategoryData')}
        showDirectLabels={false}
      />

      {/* Annual Individual Expenses */}
      <GenericPieChart
        title={t('analytics.expenses.annualIndividual')}
        data={individualChartData}
        nameKey="name"
        valueKey="value"
        emptyStateMessage={t('analytics.expenses.noIndividualData')}
        showDirectLabels={true}
      />
    </div>
  );
};

export default ExpenseAnnualAnalyticsView;
