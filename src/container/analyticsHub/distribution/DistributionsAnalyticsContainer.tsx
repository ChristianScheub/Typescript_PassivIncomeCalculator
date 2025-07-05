import React, { useEffect } from 'react';
import DistributionsAnalyticsView from '@/view/analytics-hub/distributions/DistributionsAnalyticsView';
import PortfolioAnalyticsContainer from './PortfolioAnalyticsContainer';
import IncomeAnalyticsContainer from './IncomeAnalyticsContainer';
import ExpenseAnalyticsContainer from './ExpenseAnalyticsContainer';
import LiabilityAnalyticsContainer from './LiabilityAnalyticsContainer';
import recentActivityService from '@/service/domain/analytics/reporting/recentActivityService';
import { AnalyticsSubCategory } from '@/types/domains/analytics/reporting';
import Logger from '@/service/shared/logging/Logger/logger';

type DistributionCategory = 'overview' | 'assets' | 'income' | 'expenses' | 'liabilities';

interface DistributionsAnalyticsContainerProps {
  initialSubCategory?: AnalyticsSubCategory;
  onBack: () => void;
}

// Mapping from distribution categories to analytics subcategories
const distributionCategoryToAnalyticsMapping: Record<DistributionCategory, AnalyticsSubCategory | null> = {
  overview: 'distributions', // overview doesn't need tracking
  assets: 'assets',
  income: 'income',
  expenses: 'expenses',
  liabilities: 'liabilities'
};

const DistributionsAnalyticsContainer: React.FC<DistributionsAnalyticsContainerProps> = ({ 
  initialSubCategory,
  onBack 
}) => {
  // Supported distribution categories that can be directly accessed via Recent Activities
  const supportedDistributionCategories: DistributionCategory[] = ['assets', 'income', 'expenses', 'liabilities'];

  // Determine initial category based on context
  const getInitialCategory = (): DistributionCategory => {
    if (initialSubCategory && 
        supportedDistributionCategories.includes(initialSubCategory as DistributionCategory)) {
      Logger.info(`Distributions Analytics: Starting with subcategory ${initialSubCategory} from Recent Activities`);
      return initialSubCategory as DistributionCategory;
    }
    Logger.info('Distributions Analytics: Starting with overview from main categories');
    return 'overview';
  };

  const [selectedCategory, setSelectedCategory] = React.useState<DistributionCategory>(getInitialCategory());

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCategoryChange = (category: DistributionCategory) => {
    Logger.info(`Distributions Analytics: Navigating to ${category}`);
    
    const analyticsSubCategory = distributionCategoryToAnalyticsMapping[category];
    
    if (analyticsSubCategory) {
      recentActivityService.addAnalyticsActivity('distributions', analyticsSubCategory);
    }
    
    setSelectedCategory(category);
  };

  const handleBackToOverview = () => {
    setSelectedCategory('overview');
  };

  // Render specific analytics based on selected category
  if (selectedCategory !== 'overview') {
    switch (selectedCategory) {
      case 'assets':
        return <PortfolioAnalyticsContainer onBack={handleBackToOverview} />;
      case 'income':
        return <IncomeAnalyticsContainer onBack={handleBackToOverview} />;
      case 'expenses':
        return <ExpenseAnalyticsContainer onBack={handleBackToOverview} />;
      case 'liabilities':
        return <LiabilityAnalyticsContainer onBack={handleBackToOverview} />;
      default:
        return null;
    }
  }

  // Show distributions overview
  return (
    <DistributionsAnalyticsView
      onCategoryChange={handleCategoryChange}
      onBack={onBack}
    />
  );
};

export default DistributionsAnalyticsContainer;
