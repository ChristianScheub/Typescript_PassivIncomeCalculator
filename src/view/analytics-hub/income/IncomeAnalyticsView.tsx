import React from 'react';
import { useTranslation } from 'react-i18next';
import TabSelector from '@/ui/navigation/TabSelector';
import IncomeMonthlyAnalyticsView from './IncomeMonthlyAnalyticsView';
import IncomeAnnualAnalyticsView from './IncomeAnnualAnalyticsView';
import { ViewHeader } from '@/ui/layout/ViewHeader';

type IncomeAnalyticsTab = 'monthly' | 'annual';

interface IncomeAnalyticsData {
  monthlyBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  annualBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  monthlyIndividualIncomes: Array<{ name: string; amount: number; category: string; percentage: number }>;
  annualIndividualIncomes: Array<{ name: string; amount: number; category: string; percentage: number }>;
  totalMonthlyIncome: number;
  totalAnnualIncome: number;
}

interface IncomeAnalyticsViewProps {
  selectedTab: IncomeAnalyticsTab;
  incomeAnalytics: IncomeAnalyticsData;
  onTabChange: (tab: IncomeAnalyticsTab) => void;
  onBack: () => void;
}

const IncomeAnalyticsView: React.FC<IncomeAnalyticsViewProps> = ({
  selectedTab,
  incomeAnalytics,
  onTabChange,
  onBack
}) => {
  const { t } = useTranslation();
  
  const tabs = [
    { id: 'monthly', label: t('analytics.income.monthly') },
    { id: 'annual', label: t('analytics.income.annual') }
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case 'monthly':
        return (
          <IncomeMonthlyAnalyticsView
            categoryBreakdown={incomeAnalytics.monthlyBreakdown}
            individualIncomes={incomeAnalytics.monthlyIndividualIncomes}
          />
        );
      case 'annual':
        return (
          <IncomeAnnualAnalyticsView
            categoryBreakdown={incomeAnalytics.annualBreakdown}
            individualIncomes={incomeAnalytics.annualIndividualIncomes}
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
          title={t('analytics.income.title')}
          onBack={onBack}
        />

        {/* Tab Navigation */}
        <div className="mb-8">
          <TabSelector
            tabs={tabs}
            selectedTab={selectedTab}
            onTabChange={(id) => onTabChange(id as IncomeAnalyticsTab)}
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

export default IncomeAnalyticsView;
