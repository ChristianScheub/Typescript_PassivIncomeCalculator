import React from 'react';
import { useTranslation } from 'react-i18next';
import ExpenseMonthlyAnalyticsView from './ExpenseMonthlyAnalyticsView';
import ExpenseAnnualAnalyticsView from './ExpenseAnnualAnalyticsView';
import { TabSelector, ViewHeader } from '@ui/shared';

type ExpenseAnalyticsTab = 'monthly' | 'annual';

interface ExpenseAnalyticsData {
  monthlyBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  annualBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  monthlyIndividualExpenses: Array<{ name: string; amount: number; category: string; percentage: number }>;
  annualIndividualExpenses: Array<{ name: string; amount: number; category: string; percentage: number }>;
  totalMonthlyExpenses: number;
  totalAnnualExpenses: number;
}

interface ExpenseAnalyticsViewProps {
  selectedTab: ExpenseAnalyticsTab;
  expenseAnalytics: ExpenseAnalyticsData;
  onTabChange: (tab: ExpenseAnalyticsTab) => void;
  onBack: () => void;
}

const ExpenseAnalyticsView: React.FC<ExpenseAnalyticsViewProps> = ({
  selectedTab,
  expenseAnalytics,
  onTabChange,
  onBack
}) => {
  const { t } = useTranslation();
  
  const tabs = [
    { id: 'monthly', label: t('analytics.expenses.monthly') },
    { id: 'annual', label: t('analytics.expenses.annual') }
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case 'monthly':
        return (
          <ExpenseMonthlyAnalyticsView
            categoryBreakdown={expenseAnalytics.monthlyBreakdown}
            individualExpenses={expenseAnalytics.monthlyIndividualExpenses}
          />
        );
      case 'annual':
        return (
          <ExpenseAnnualAnalyticsView
            categoryBreakdown={expenseAnalytics.annualBreakdown}
            individualExpenses={expenseAnalytics.annualIndividualExpenses}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <ViewHeader
          title={t('analytics.expenses.title')}
          onBack={onBack}
        />

        {/* Tab Navigation */}
        <div className="mb-8">
          <TabSelector
            tabs={tabs}
            selectedTab={selectedTab}
            onTabChange={(id) => onTabChange(id as ExpenseAnalyticsTab)}
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

export default ExpenseAnalyticsView;
