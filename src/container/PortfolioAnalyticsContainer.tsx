import React, { useState, useMemo } from 'react';
import { useAppSelector } from '../hooks/redux';
import PortfolioAnalyticsView from '../view/analytics/assets/PortfolioAnalyticsView';
import calculatorService from '../service/calculatorService';
import { AssetType } from '../types';

type AnalyticsTab = 'asset_distribution' | 'income_distribution' | 'custom';

interface PortfolioAnalyticsContainerProps {
  onBack: () => void;
}

const PortfolioAnalyticsContainer: React.FC<PortfolioAnalyticsContainerProps> = ({ onBack }) => {
  const [selectedTab, setSelectedTab] = useState<AnalyticsTab>('asset_distribution');
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType | 'all'>('all');
  
  // Get portfolio data from Redux store
  const portfolioCache = useAppSelector(state => state.assets.portfolioCache);
  
  // Calculate analytics data from portfolio positions with asset type filtering
  const { portfolioAnalytics, incomeAnalytics, filteredPositions } = useMemo(() => {
    if (!portfolioCache?.positions.length) {
      return {
        portfolioAnalytics: {
          assetAllocation: [],
          sectorAllocation: [],
          countryAllocation: [],
          categoryAllocation: [],
          categoryBreakdown: []
        },
        incomeAnalytics: {
          assetTypeIncome: [],
          sectorIncome: [],
          countryIncome: [],
          categoryIncome: [],
          categoryIncomeBreakdown: []
        },
        filteredPositions: []
      };
    }
    
    // Filter positions by asset type if a specific type is selected
    const filtered = selectedAssetType === 'all' 
      ? portfolioCache.positions 
      : portfolioCache.positions.filter(position => position.type === selectedAssetType);
    
    return {
      portfolioAnalytics: calculatorService.calculatePortfolioAnalytics(filtered),
      incomeAnalytics: calculatorService.calculateIncomeAnalytics(filtered),
      filteredPositions: filtered
    };
  }, [portfolioCache?.positions, selectedAssetType]);

  const handleTabChange = (tab: AnalyticsTab) => {
    setSelectedTab(tab);
  };

  const handleAssetTypeFilterChange = (assetType: AssetType | 'all') => {
    setSelectedAssetType(assetType);
  };

  return (
    <PortfolioAnalyticsView
      selectedTab={selectedTab}
      selectedAssetType={selectedAssetType}
      assetAllocation={portfolioAnalytics.assetAllocation.map(item => ({ ...item, type: item.name }))}
      sectorAllocation={portfolioAnalytics.sectorAllocation}
      countryAllocation={portfolioAnalytics.countryAllocation}
      assetTypeIncome={incomeAnalytics.assetTypeIncome}
      sectorIncome={incomeAnalytics.sectorIncome}
      countryIncome={incomeAnalytics.countryIncome}
      portfolioPositions={filteredPositions}
      onTabChange={handleTabChange}
      onAssetTypeFilterChange={handleAssetTypeFilterChange}
      onBack={onBack}
    />
  );
};

export default PortfolioAnalyticsContainer;
