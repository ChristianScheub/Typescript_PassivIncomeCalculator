import React from 'react';
import { useTranslation } from 'react-i18next';
import { ViewHeader } from '@ui/shared';
import { useDeviceCheck } from '@service/shared/utilities/helper/useDeviceCheck';
import { AnalyticsCategory, AnalyticsSubCategory } from '@/container/analyticsHub/AnalyticsHubContainer';
import AnalyticsOverviewSection from '../../ui/analyticsHub/hub/AnalyticsOverviewSection';
import AnalyticsCategoriesSection from '../../ui/analyticsHub/hub/AnalyticsCategoriesSection';
import type { AIAnalyticsCategory } from '@/types/domains/analytics/ai';

interface AnalyticsHubViewProps {
  selectedCategory: AnalyticsCategory;
  onCategoryChange: (category: AnalyticsCategory, subCategory?: AnalyticsSubCategory) => void;
  onAINavigation?: (category: AIAnalyticsCategory) => void;
  onBack?: () => void;
}

const AnalyticsHubView: React.FC<AnalyticsHubViewProps> = ({
  selectedCategory,
  onCategoryChange,
  onAINavigation,
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

        {/* Overview Section - Recent Analytics, Recommendations etc. */}
        <AnalyticsOverviewSection 
          onCategoryChange={onCategoryChange}
          onAINavigation={onAINavigation}
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
