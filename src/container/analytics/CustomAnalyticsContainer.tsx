import React from 'react';
import { useAppSelector } from '../../hooks/redux';
import CustomAnalyticsView from '../../view/analytics/assets/CustomAnalyticsView';

interface CustomAnalyticsContainerProps {
  onBack?: () => void;
}

const CustomAnalyticsContainer: React.FC<CustomAnalyticsContainerProps> = () => {
  // Get portfolio positions from cache to pass to the view
  const { portfolioCache } = useAppSelector(state => state.assets);
  const filteredPositions = portfolioCache?.positions || [];

  return (
    <CustomAnalyticsView
      filteredPositions={filteredPositions}
    />
  );
};

export default CustomAnalyticsContainer;
