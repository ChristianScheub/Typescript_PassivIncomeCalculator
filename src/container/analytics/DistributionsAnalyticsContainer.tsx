import React, { useEffect } from 'react';
import DistributionsAnalyticsView from '@/view/analytics-hub/distributions/DistributionsAnalyticsView';
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

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
