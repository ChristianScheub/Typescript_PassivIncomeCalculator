import React, { useEffect } from 'react';
import { useAppSelector } from '../../hooks/redux';
import CustomAnalyticsView from '@/view/analytics-hub/custom/CustomAnalyticsView';

interface CustomAnalyticsContainerProps {
  onBack?: () => void;
}

const CustomAnalyticsContainer: React.FC<CustomAnalyticsContainerProps> = () => {
  // Get portfolio positions from cache to pass to the view
  const { portfolioCache } = useAppSelector(state => state.transactions);
  const filteredPositions = portfolioCache?.positions || [];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <CustomAnalyticsView
      filteredPositions={filteredPositions}
    />
  );
};

export default CustomAnalyticsContainer;
