import React from 'react';
import DistributionsAnalyticsView from '../../view/analytics/distributions/DistributionsAnalyticsView';
import PortfolioAnalyticsContainer from './PortfolioAnalyticsContainer';
import IncomeAnalyticsContainer from './IncomeAnalyticsContainer';
import ExpenseAnalyticsContainer from './ExpenseAnalyticsContainer';
import LiabilityAnalyticsContainer from './LiabilityAnalyticsContainer';

type DistributionCategory = 'overview' | 'assets' | 'income' | 'expenses' | 'liabilities';

interface DistributionsAnalyticsContainerProps {
  onBack: () => void;
}

const DistributionsAnalyticsContainer: React.FC<DistributionsAnalyticsContainerProps> = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = React.useState<DistributionCategory>('overview');

  const handleCategoryChange = (category: DistributionCategory) => {
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
