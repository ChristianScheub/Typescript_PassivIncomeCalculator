import React from 'react';
import { useTranslation } from 'react-i18next';
import LiabilityMonthlyAnalyticsView from './LiabilityMonthlyAnalyticsView';
import LiabilityAnnualAnalyticsView from './LiabilityAnnualAnalyticsView';
import LiabilityMoreAnalyticsView from './LiabilityMoreAnalyticsView';
import { TabSelector, ViewHeader } from '@ui/shared';

type LiabilityAnalyticsTab = 'monthly' | 'annual' | 'more';

interface LiabilityAnalyticsData {
  monthlyBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  annualBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  monthlyIndividualLiabilities: Array<{ name: string; amount: number; category: string; percentage: number }>;
  annualIndividualLiabilities: Array<{ name: string; amount: number; category: string; percentage: number }>;
  debtBalanceBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  annualInterestBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  interestRateComparison: Array<{ name: string; rate: number; type: string }>;
  paymentScheduleData: Array<{ month: string; amount: number; breakdown: Array<{ name: string; amount: number }> }>;
  debtProjectionData5Years: Array<{ month: string; total: number; [key: string]: unknown }>;
  debtProjectionData10Years: Array<{ month: string; total: number; [key: string]: unknown }>;
  debtProjectionData30Years: Array<{ month: string; total: number; [key: string]: unknown }>;
  totalMonthlyPayments: number;
  totalAnnualPayments: number;
  totalDebt: number;
  totalAnnualInterest: number;
}

interface LiabilityAnalyticsViewProps {
  selectedTab: LiabilityAnalyticsTab;
  liabilityAnalytics: LiabilityAnalyticsData;
  onTabChange: (tab: LiabilityAnalyticsTab) => void;
  onBack: () => void;
}

const LiabilityAnalyticsView: React.FC<LiabilityAnalyticsViewProps> = ({
  selectedTab,
  liabilityAnalytics,
  onTabChange,
  onBack
}) => {
  const { t } = useTranslation();
  
  const tabs = [
    { id: 'monthly', label: t('analytics.liabilities.monthly') },
    { id: 'annual', label: t('analytics.liabilities.annual') },
    { id: 'more', label: t('analytics.liabilities.more') }
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case 'monthly':
        return (
          <LiabilityMonthlyAnalyticsView
            categoryBreakdown={liabilityAnalytics.monthlyBreakdown}
            individualLiabilities={liabilityAnalytics.monthlyIndividualLiabilities}
          />
        );
      case 'annual':
        return (
          <LiabilityAnnualAnalyticsView
            categoryBreakdown={liabilityAnalytics.annualBreakdown}
            individualLiabilities={liabilityAnalytics.annualIndividualLiabilities}
            paymentScheduleData={liabilityAnalytics.paymentScheduleData}
          />
        );
      case 'more':
        return (
          <LiabilityMoreAnalyticsView
            debtBalanceBreakdown={liabilityAnalytics.debtBalanceBreakdown}
            annualInterestBreakdown={liabilityAnalytics.annualInterestBreakdown}
            debtProjectionData5Years={liabilityAnalytics.debtProjectionData5Years}
            debtProjectionData10Years={liabilityAnalytics.debtProjectionData10Years}
            debtProjectionData30Years={liabilityAnalytics.debtProjectionData30Years}
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
          title={t('analytics.liabilities.title')}
          onBack={onBack}
        />

        {/* Tab Navigation */}
        <div className="mb-8">
          <TabSelector
            tabs={tabs}
            selectedTab={selectedTab}
            onTabChange={(id) => onTabChange(id as LiabilityAnalyticsTab)}
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

export default LiabilityAnalyticsView;
