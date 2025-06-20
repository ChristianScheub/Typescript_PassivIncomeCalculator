import React from 'react';
import { useTranslation } from 'react-i18next';
import { ViewHeader } from '../../ui/layout/ViewHeader';
import { useDeviceCheck } from '@service/shared/utilities/helper/useDeviceCheck';
import AnalyticsQuickInsightsSection from './hub/AnalyticsQuickInsightsSection';
import { AnalyticsCategory, AnalyticsSubCategory } from '../../container/analytics/AnalyticsHubContainer';
import AnalyticsOverviewSection from './hub/AnalyticsOverviewSection';
import AnalyticsCategoriesSection from './hub/AnalyticsCategoriesSection';

interface QuickInsights {
  totalAssetValue: number;
  monthlyIncome: number;
  totalExpenses: number;
  totalLiabilities: number;
  netWorth: number;
  monthlyCashFlow: number;
  assetsCount: number;
  incomeSourcesCount: number;
  expenseCategoriesCount: number;
  liabilitiesCount: number;
}

interface AnalyticsHubViewProps {
  selectedCategory: AnalyticsCategory;
  selectedSubCategory: AnalyticsSubCategory;
  quickInsights: QuickInsights;
  onCategoryChange: (category: AnalyticsCategory, subCategory?: AnalyticsSubCategory) => void;
  onBack?: () => void;
}

const AnalyticsHubView: React.FC<AnalyticsHubViewProps> = ({
  selectedCategory,
  selectedSubCategory,
  quickInsights,
  onCategoryChange,
  onBack
}) => {
  const { t } = useTranslation();
  const isDesktop = useDeviceCheck();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <ViewHeader
          title={t('analytics.hub.title')}
          subtitle={t('analytics.hub.subtitle')}
          onBack={onBack}
          isMobile={!isDesktop}
        />

        {/* Quick Insights Section */}
        <AnalyticsQuickInsightsSection 
          insights={quickInsights}
        />

        {/* Overview Section - Recent Analytics, Recommendations etc. */}
        <AnalyticsOverviewSection 
          onCategoryChange={onCategoryChange}
        />

        {/* Main Categories Grid */}
        <AnalyticsCategoriesSection 
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
        />
      </div>
    </div>
  );
};

export default AnalyticsHubView;
